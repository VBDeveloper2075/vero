import { useEffect, useState } from 'react'
import { listarRegistros } from '../api'

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 })
}

function formatFecha(value) {
  if (!value) return '—'
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [y, m, d] = value.slice(0, 10).split('-')
    return `${d}/${m}/${y}`
  }
  return value
}

function Campo({ label, children }) {
  if (children === null || children === undefined || children === '') return null
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">{label}</p>
      <p className="text-sm text-gray-700 break-words">{children}</p>
    </div>
  )
}

function PasswordField({ value }) {
  const [visible, setVisible] = useState(false)
  if (!value) return <Campo label="Contraseña">—</Campo>
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">Contraseña</p>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-sm text-gray-700 font-mono tracking-wide hover:text-purple-600 transition-colors"
        title={visible ? 'Ocultar' : 'Mostrar'}
      >
        {visible ? value : '••••••••'}
      </button>
    </div>
  )
}

function TarjetaRegistro({ categoria, registro }) {
  switch (categoria) {
    case 'pagos':
      return (
        <div className="registro-card">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-sm font-semibold text-purple-700">{registro.concepto || 'Sin concepto'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatFecha(registro.fecha)}</p>
            </div>
            <p className="text-sm font-bold text-emerald-600 whitespace-nowrap">
              {formatMoney(registro.monto)}
            </p>
          </div>
        </div>
      )

    case 'visa':
      return (
        <div className="registro-card space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Campo label="Cierre">{formatFecha(registro.fechaCierre)}</Campo>
            <Campo label="Vence">{formatFecha(registro.fechaVencimiento)}</Campo>
            <Campo label="Saldo $">{formatMoney(registro.saldoPesos)}</Campo>
            <Campo label="Saldo u$s">{registro.saldoDolares ?? '—'}</Campo>
            <Campo label="Pago mín.">{formatMoney(registro.pagoMinimo)}</Campo>
          </div>
          {registro.observaciones && (
            <p className="text-xs text-gray-500 border-t border-purple-50 pt-2">{registro.observaciones}</p>
          )}
        </div>
      )

    case 'vencimientos':
      return (
        <div className="registro-card">
          <p className="text-sm font-semibold text-purple-700">{registro.servicio}</p>
          <p className="text-xs text-amber-600 mt-1 font-medium">
            Vence {formatFecha(registro.fechaVencimiento)}
          </p>
          {registro.notas && <p className="text-xs text-gray-500 mt-2">{registro.notas}</p>}
        </div>
      )

    case 'limpieza':
      return (
        <div className="registro-card flex items-center gap-3">
          <span className="text-lg">{registro.completada ? '✅' : '⬜'}</span>
          <p className={`text-sm flex-1 ${registro.completada ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
            {registro.tarea}
          </p>
        </div>
      )

    case 'salud':
      return (
        <div className="registro-card space-y-2">
          <p className="text-sm font-semibold text-purple-700">
            {registro.especialidad || 'Consulta'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Campo label="Fecha">{formatFecha(registro.fecha)}</Campo>
            <Campo label="Profesional">{registro.profesional || '—'}</Campo>
          </div>
          {registro.notas && <p className="text-xs text-gray-500">{registro.notas}</p>}
        </div>
      )

    case 'ideas':
      return (
        <div className="registro-card space-y-1">
          <p className="text-sm font-semibold text-purple-700">{registro.titulo}</p>
          {registro.enlaces && (
            <a
              href={registro.enlaces.startsWith('http') ? registro.enlaces : `https://${registro.enlaces}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-500 hover:underline break-all"
            >
              {registro.enlaces}
            </a>
          )}
          {registro.notas && <p className="text-xs text-gray-500 mt-1">{registro.notas}</p>}
        </div>
      )

    case 'contrasenas':
      return (
        <div className="registro-card space-y-2">
          <p className="text-sm font-semibold text-purple-700">{registro.webApp}</p>
          <div className="grid grid-cols-1 gap-2">
            <Campo label="Email">{registro.email}</Campo>
            <Campo label="Usuario">{registro.usuario}</Campo>
            <PasswordField value={registro.contrasena} />
          </div>
        </div>
      )

    case 'habitos':
      return (
        <div className="registro-card flex items-center gap-3">
          <span className="text-lg">{registro.completado ? '✨' : '○'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">{registro.habito}</p>
            <p className="text-xs text-gray-400">{formatFecha(registro.fecha)}</p>
          </div>
        </div>
      )

    case 'compras':
      return (
        <div className="registro-card flex justify-between items-center gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-700">{registro.articulo}</p>
            <p className="text-xs text-purple-400">{registro.categoria || 'Sin categoría'}</p>
          </div>
          <p className="text-sm font-semibold text-purple-600 whitespace-nowrap">
            {registro.cantidad || '—'}
          </p>
        </div>
      )

    case 'hobbies':
      return (
        <div className="registro-card space-y-1">
          <p className="text-sm font-semibold text-purple-700">{registro.actividad}</p>
          {registro.notas && <p className="text-xs text-gray-500">{registro.notas}</p>}
        </div>
      )

    default:
      return (
        <div className="registro-card">
          <pre className="text-xs overflow-auto">{JSON.stringify(registro, null, 2)}</pre>
        </div>
      )
  }
}

export default function RegistrosPanel({ categoria, label, onCerrar }) {
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false
    setCargando(true)
    setError(null)

    listarRegistros(categoria)
      .then((data) => {
        if (!cancelado) setRegistros(data)
      })
      .catch((err) => {
        if (!cancelado) setError(err.message || 'No se pudieron cargar los registros')
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => { cancelado = true }
  }, [categoria])

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-purple-900/30 backdrop-blur-[2px] px-3 py-4"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label={`Registros de ${label}`}
    >
      <div
        className="w-full max-w-md max-h-[85vh] bg-white rounded-2xl shadow-xl border border-purple-100 flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">Tus registros</p>
            <h2 className="text-sm font-semibold text-purple-800 truncate">{label}</h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="shrink-0 w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600 text-lg leading-none transition-colors"
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {cargando && (
            <div className="py-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-purple-300 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-xs text-purple-400 mt-3 animate-pulse">Cargando desde Neon…</p>
            </div>
          )}

          {!cargando && error && (
            <div className="py-8 text-center px-2">
              <p className="text-3xl mb-2">😕</p>
              <p className="text-sm text-red-500 font-medium">No se pudo cargar</p>
              <p className="text-xs text-gray-400 mt-1">{error}</p>
            </div>
          )}

          {!cargando && !error && registros.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm text-gray-500">Todavía no hay registros acá</p>
              <p className="text-xs text-gray-400 mt-1">Guardá el primero y va a aparecer</p>
            </div>
          )}

          {!cargando && !error && registros.map((r) => (
            <TarjetaRegistro key={r.id} categoria={categoria} registro={r} />
          ))}
        </div>

        {!cargando && !error && registros.length > 0 && (
          <footer className="px-4 py-2.5 border-t border-purple-50 text-center">
            <p className="text-[10px] text-purple-300 font-medium">
              {registros.length} registro{registros.length === 1 ? '' : 's'} · últimos 50
            </p>
          </footer>
        )}
      </div>
    </div>
  )
}
