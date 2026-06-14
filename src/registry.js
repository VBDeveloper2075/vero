import { lazy } from 'react'

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
