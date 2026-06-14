# Mi Espacio Personal — SPA

Aplicación personal para registrar pagos, salud, hábitos, hobbies y más,
con sincronización a Google Sheets vía Google Apps Script.

---

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar backend
cp .env.example .env
# Editar .env y pegar la URL de tu Web App de Apps Script

# 3. Levantar en local
npm run dev

# 4. Build de producción (Netlify / Vercel)
npm run build
```

---

## Configurar el backend (Google Apps Script)

### Paso 1 — Crear la Google Sheet

1. Abrí [sheets.google.com](https://sheets.google.com) y creá una hoja nueva.
2. Copiá el **ID** de la URL:
   `https://docs.google.com/spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`

### Paso 2 — Crear el Apps Script

1. En la hoja: menú **Extensiones → Apps Script**.
2. Borrá el contenido del editor y pegá todo el contenido de `apps-script/Code.gs`.
3. Guardá el proyecto (dale un nombre, ej: *"Mi Espacio Personal"*).

### Paso 3 — Configurar el ID de la hoja

1. En el editor de Apps Script: menú **Proyecto → Propiedades del proyecto**.
2. Ir a la pestaña **Propiedades de secuencia de comandos**.
3. Agregar propiedad:
   - Clave: `SPREADSHEET_ID`
   - Valor: el ID que copiaste en el Paso 1.
4. Guardar.

### Paso 4 — Probar localmente

1. En el editor, seleccioná la función `testManual` en el desplegable.
2. Hacé clic en **Ejecutar**.
3. Si ves `{"ok":true,...}` en los registros → todo funciona.
   La hoja debería tener una nueva pestaña *💳 Pagos* con una fila de prueba.

### Paso 5 — Deployar como Web App

1. Menú **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. Configurar:
   - **Ejecutar como:** Yo (tu cuenta de Google)
   - **Quién tiene acceso:** Cualquier persona
4. Hacer clic en **Implementar** y copiar la URL que aparece.
   Tiene la forma: `https://script.google.com/macros/s/XXXXX.../exec`

### Paso 6 — Conectar el frontend

Creá el archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Pegá la URL del paso anterior:

```env
VITE_BACKEND_URL=https://script.google.com/macros/s/XXXXX.../exec
```

> **Importante:** cada vez que modifiques el `Code.gs` debés hacer una
> **nueva implementación** (no editar la existente) para que los cambios
> tomen efecto en producción.

---

## Agregar una categoría nueva (frontend + backend)

### Frontend — 2 pasos

**1.** Creá `src/components/forms/MiNuevoForm.jsx` y agregalo a `src/registry.js`.

**2.** En `registry.js`:

```js
{
  value:     'mi-nuevo',
  label:     '🆕 Mi Nueva Categoría',
  component: lazy(() => import('./components/forms/MiNuevoForm')),
},
```

### Backend — 1 paso

En `apps-script/Code.gs`, agregá una entrada a `SHEET_CONFIG`:

```js
mi_nuevo: {
  nombre:  '🆕 Mi Nueva Categoría',
  headers: ['Timestamp', 'Campo1', 'Campo2'],
  toRows: function(ts, d) {
    return [[ ts, d.campo1, d.campo2 ]]
  }
}
```

Luego deployá una nueva versión del Apps Script.

---

## Agregar un formulario nuevo

Solo necesitás hacer **dos cosas**:

### 1 — Crear el componente

Creá `src/components/forms/MiNuevoForm.jsx`.

El componente debe aceptar exactamente una prop: `onGuardar(objeto)`.
Llamala con el objeto de datos cuando el usuario presione "Guardar".

```jsx
import { useState } from 'react'

export default function MiNuevoForm({ onGuardar }) {
  const [form, setForm] = useState({ campo: '' })

  return (
    <form onSubmit={(e) => { e.preventDefault(); onGuardar(form) }} className="space-y-4">
      <div>
        <label className="field-label">Mi campo</label>
        <input
          className="field-input"
          value={form.campo}
          onChange={(e) => setForm({ campo: e.target.value })}
        />
      </div>
      <button type="submit" className="btn-save">Guardar</button>
    </form>
  )
}
```

### 2 — Registrarlo en `src/registry.js`

Agregá **una entrada** al array:

```js
{
  value:     'mi-nuevo',
  label:     '🆕 Mi Nueva Categoría',
  component: lazy(() => import('./components/forms/MiNuevoForm')),
},
```

Eso es todo. `App.jsx` no requiere ningún cambio.

---

## Seguridad

| Variable | Tipo | ¿Se expone en el bundle? | ¿Es seguro? |
|---|---|---|---|
| `VITE_BACKEND_URL` | URL pública de Apps Script | Sí | ✅ Es un endpoint público por diseño |

**Regla:** nunca pongas tokens, contraseñas ni claves privadas en variables `VITE_`.
Si necesitás proteger el endpoint, agregá un `sharedSecret` en el body del payload
y verificalo dentro del Apps Script (no como query param).

---

## Estructura del proyecto

```
├── apps-script/
│   └── Code.gs         # ★ Backend completo (pegar en Apps Script)
└── src/
    ├── api.js          # Función genérica enviarDatos(categoria, datos)
    ├── registry.js     # ★ Único archivo a editar para agregar categorías (frontend)
    ├── App.jsx         # Shell principal (no tocar para agregar formularios)
    ├── index.css       # Clases Tailwind reutilizables (card, field-input…)
    └── components/
        ├── Header.jsx  # Fecha en español + frase del día
        ├── Toast.jsx   # Notificación de éxito / error
        └── forms/      # Un archivo .jsx por categoría
```
