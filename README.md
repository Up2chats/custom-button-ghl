# 🚀 GHL Opportunities Custom Button

Este script inyecta un botón **Form** en cada tarjeta de oportunidad dentro de la vista de **HighLevel (GHL)**.  
El botón abre un modal con un formulario ligero que permite enviar datos a un **endpoint externo** vía `fetch`.  

---

## ✨ Características
- Añade un botón discreto en la esquina inferior derecha de cada card de oportunidad.
- Modal elegante con inputs personalizables.
- Envía datos adicionales automáticamente:
  - `locationId`
  - `opportunityId`
  - `contactId`
- Código optimizado con **MutationObserver** y `requestIdleCallback` para no relentizar la interfaz.
- Estilos CSS inyectados dinámicamente.

---

## 📦 Instalación
1. Copia el archivo del script o incrústalo en tu proyecto como un snippet.  
2. Reemplaza en el código:
   - `https://XXXXXXXXXXXXXXXXXX` → tu **endpoint real**.
   - `/location/xxxxxxxxxxxxxxx/` → el **ID de tu ubicación** en HighLevel.  

Ejemplo:
```js
const LOCATION_OK = /\/location\/1234567890abcdef\//.test(location.pathname);
const ENDPOINT = "https://mi-servidor.com/api/endpoint";
