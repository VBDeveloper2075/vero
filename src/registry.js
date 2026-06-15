import { lazy } from 'react'

// El ID del spreadsheet vive en .env (VITE_SHEET_BASE) — nunca en este archivo.
// Debe ser la URL del documento terminada en /edit, ej:
//   https://docs.google.com/spreadsheets/d/EL_ID/edit
const SHEET_BASE = (import.meta.env.VITE_SHEET_BASE ?? '').trim()

// Construye la URL a una pestaña específica. Si no hay un gid numérico válido,
// devuelve la planilla sin gid (abre la primera hoja) en vez de un enlace roto.
const sheet = (gid) =>
  SHEET_BASE && /^\d+$/.test(gid) ? `${SHEET_BASE}#gid=${gid}` : SHEET_BASE

const registry = [
  {
    value:     'pagos',
    label:     '💳 Pagos / Presupuesto',
    sheetUrl:  sheet('329477328'),
    component: lazy(() => import('./components/forms/PagosForm')),
  },
  {
    value:     'visa',
    label:     '🏷️ Tarjeta VISA',
    sheetUrl:  sheet('1222245998'),
    component: lazy(() => import('./components/forms/VisaForm')),
  },
  {
    value:     'vencimientos',
    label:     '📅 Fechas y Vencimientos',
    sheetUrl:  sheet('621328793'),
    component: lazy(() => import('./components/forms/VencimientosForm')),
  },
  {
    value:     'limpieza',
    label:     '🧹 Limpieza',
    sheetUrl:  sheet('661562651'),
    component: lazy(() => import('./components/forms/LimpiezaForm')),
  },
  {
    value:     'salud',
    label:     '🩺 Salud',
    sheetUrl:  sheet('376028897'),
    component: lazy(() => import('./components/forms/SaludForm')),
  },
  {
    value:     'ideas',
    label:     '💡 Ideas y Proyectos',
    sheetUrl:  sheet('536586602'),
    component: lazy(() => import('./components/forms/IdeasForm')),
  },
  {
    value:     'contrasenas',
    label:     '🔑 Contraseñas',
    sheetUrl:  sheet('2060692126'),
    component: lazy(() => import('./components/forms/ContrasenaForm')),
  },
  {
    value:     'habitos',
    label:     '✨ Hábitos',
    sheetUrl:  sheet('1677116935'),
    component: lazy(() => import('./components/forms/HabitosForm')),
  },
  {
    value:     'compras',
    label:     '🛒 Compras',
    sheetUrl:  sheet('343038308'),
    component: lazy(() => import('./components/forms/ComprasForm')),
  },
  {
    value:     'hobbies',
    label:     '🌿 Hobbies',
    sheetUrl:  sheet('640934425'),
    component: lazy(() => import('./components/forms/HobbiesForm')),
  },
]

export default registry
