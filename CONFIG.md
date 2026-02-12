# ⚙️ CONFIGURACIÓN DEL SERVIDOR

## 🏠 Cambiar Página Principal

Para cambiar qué `index.html` se muestra como página principal:

### Opción 1: index.html de la RAÍZ (por defecto)
Abre `server.js` y busca la línea 12:

```javascript
const MAIN_PAGE_SOURCE = 'root';  // 👈 index.html de la raíz
```

### Opción 2: index.html de PUBLIC
Cambia a:

```javascript
const MAIN_PAGE_SOURCE = 'public';  // 👈 index.html de /public
```

## 📝 Nota
- **Archivos estáticos** (CSS, JS, imágenes): Siempre se sirven desde `/public`
- **Página principal** (`/`): Configurable con `MAIN_PAGE_SOURCE`

## ✅ Verificación
Cuando inicies el servidor verás un mensaje indicando qué página está activa:

```
📄 PÁGINA PRINCIPAL CONFIGURADA:
   ✅ index.html de RAÍZ del proyecto
   💡 Para cambiar: Edita MAIN_PAGE_SOURCE en server.js (línea 12)
```
