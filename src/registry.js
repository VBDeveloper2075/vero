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
 *       value:     'mi-nuevo',
 *       label:     '🆕 Mi Nuevo Registro',
 *       sheetUrl:  'https://docs.google.com/spreadsheets/d/TU_ID/edit#gid=ID_HOJA',
 *       component: lazy(() => import('./components/forms/MiNuevoForm')),
 *     }
 *
 *  App.jsx no requiere ningún cambio.
 * ─────────────────────────────────────────────────────────────────
 */

// URL base — reemplazá TU_ID_AQUI con el ID real de tu Google Sheet.
// Cada sheetUrl debe apuntar al gid (pestaña) correspondiente.
const SHEET_BASE = 'https://docs.google.com/spreadsheets/d/TU_ID_AQUI/edit#gid='

const registry = [
  {
    value:     'pagos',
    label:     '💳 Pagos / Presupuesto',
    sheetUrl:  SHEET_BASE + '329477328',
    component: lazy(() => import('./components/forms/PagosForm')),
  },
  {
    value:     'visa',
    label:     '🏷️ Tarjeta VISA',
    sheetUrl:  SHEET_BASE + 'ID_HOJA_VISA',
    component: lazy(() => import('./components/forms/VisaForm')),
  },
  {
    value:     'vencimientos',
    label:     '📅 Fechas y Vencimientos',
    sheetUrl:  SHEET_BASE + '621328793',
    component: lazy(() => import('./components/forms/VencimientosForm')),
  },
  {
    value:     'limpieza',
    label:     '🧹 Limpieza',
    sheetUrl:  SHEET_BASE + '661562651',
    component: lazy(() => import('./components/forms/LimpiezaForm')),
  },
  {
    value:     'salud',
    label:     '🩺 Salud',
    sheetUrl:  SHEET_BASE + '376028897',
    component: lazy(() => import('./components/forms/SaludForm')),
  },
  {
    value:     'ideas',
    label:     '💡 Ideas y Proyectos',
    sheetUrl:  SHEET_BASE + '536586602',
    component: lazy(() => import('./components/forms/IdeasForm')),
  },
  {
    value:     'contrasenas',
    label:     '🔑 Contraseñas',
    sheetUrl:  SHEET_BASE + '2060692126',
    component: lazy(() => import('./components/forms/ContrasenaForm')),
  },
  {
    value:     'habitos',
    label:     '✨ Hábitos',
    sheetUrl:  SHEET_BASE + '1677116935',
    component: lazy(() => import('./components/forms/HabitosForm')),
  },
  {
    value:     'compras',
    label:     '🛒 Compras',
    sheetUrl:  SHEET_BASE + 'ID_HOJA_COMPRAS',
    component: lazy(() => import('./components/forms/ComprasForm')),
  },
  {
    value:     'hobbies',
    label:     '🌿 Hobbies',
    sheetUrl:  SHEET_BASE + '640934425',
    component: lazy(() => import('./components/forms/HobbiesForm')),
  },
]

export default registry
