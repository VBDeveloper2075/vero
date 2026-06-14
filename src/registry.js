import { lazy } from 'react'

/**
 * ─────────────────────────────────────────────────────────────────
 *  REGISTRO DE CATEGORÍAS Y FORMULARIOS
 * ─────────────────────────────────────────────────────────────────
 *  Para agregar un formulario nuevo, solo necesitás hacer DOS cosas:
 *
 *  1. Crear el archivo  src/components/forms/MiNuevoForm.jsx
 *     El componente debe aceptar la prop:  onGuardar(datosObjeto)
 *
 *  2. Agregar UNA entrada a este array con la forma:
 *     {
 *       value:     'mi-nuevo',              // clave única (snake-case / kebab-case)
 *       label:     '🆕 Mi Nuevo Registro',  // texto que aparece en el select
 *       component: lazy(() => import('./components/forms/MiNuevoForm')),
 *     }
 *
 *  App.jsx no requiere ningún cambio.
 * ─────────────────────────────────────────────────────────────────
 */
const registry = [
  {
    value:     'pagos',
    label:     '💳 Pagos / Presupuesto',
    component: lazy(() => import('./components/forms/PagosForm')),
  },
  {
    value:     'visa',
    label:     '🏷️ Tarjeta VISA',
    component: lazy(() => import('./components/forms/VisaForm')),
  },
  {
    value:     'vencimientos',
    label:     '📅 Fechas y Vencimientos',
    component: lazy(() => import('./components/forms/VencimientosForm')),
  },
  {
    value:     'limpieza',
    label:     '🧹 Limpieza',
    component: lazy(() => import('./components/forms/LimpiezaForm')),
  },
  {
    value:     'salud',
    label:     '🩺 Salud',
    component: lazy(() => import('./components/forms/SaludForm')),
  },
  {
    value:     'ideas',
    label:     '💡 Ideas y Proyectos',
    component: lazy(() => import('./components/forms/IdeasForm')),
  },
  {
    value:     'contrasenas',
    label:     '🔑 Contraseñas',
    component: lazy(() => import('./components/forms/ContrasenaForm')),
  },
  {
    value:     'habitos',
    label:     '✨ Hábitos',
    component: lazy(() => import('./components/forms/HabitosForm')),
  },
  {
    value:     'compras',
    label:     '🛒 Compras',
    component: lazy(() => import('./components/forms/ComprasForm')),
  },
  {
    value:     'hobbies',
    label:     '🌿 Hobbies',
    component: lazy(() => import('./components/forms/HobbiesForm')),
  },
]

export default registry
