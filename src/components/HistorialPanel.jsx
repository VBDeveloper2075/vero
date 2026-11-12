import { useState, useEffect, useCallback } from 'react'
import registry from '../registry'
import { listarRegistros, actualizarRegistro, borrarRegistro } from '../api'
import TextoConEnlaces, { textoContieneUrl } from '../utils/TextoConEnlaces'
import MatrizEjercicios from './MatrizEjercicios'

const PIN = String(import.meta.env.VITE_HISTORIAL_PIN || '7519')

const CAMPOS = {
  pagos: [
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'concepto', label: 'Concepto', type: 'text' },
    { key: 'monto', label: 'Monto', type: 'text' },
  ],
  visa: [
    { key: 'fechaCierre', label: 'Cierre', type: 'date' },
    { key: 'fechaVencimiento', label: 'Vencimiento', type: 'date' },
    { key: 'saldoPesos', label: 'Saldo $', type: 'text' },
    { key: 'saldoDolares', label: 'Saldo USD', type: 'text' },
    { key: 'pagoMinimo', label: 'Pago mínimo', type: 'text' },
    { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
  ],
  vencimientos: [
    { key: 'servicio', label: 'Servicio', type: 'text' },
    { key: 'fechaVencimiento', label: 'Vencimiento', type: 'date' },
    { key: 'notas', label: 'Notas', type: 'textarea' },
  ],
  limpieza: [
    { key: 'tarea', label: 'Tarea', type: 'text' },
    { key: 'completada', label: 'Completada', type: 'checkbox' },
    { key: 'notas', label: 'Notas', type: 'textarea' },
  ],
  salud: [
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'especialidad', label: 'Especialidad', type: 'text' },
    { key: 'profesional', label: 'Profesional', type: 'text' },
    { key: 'notas', label: 'Notas', type: 'textarea' },
  ],
  ideas: [
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'enlaces', label: 'Enlaces', type: 'textarea' },
    { key: 'notas', label: 'Notas', type: 'textarea' },
  ],
  contrasenas: [
    { key: 'webApp', label: 'Web / App', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'usuario', label: 'Usuario', type: 'text' },
    { key: 'contrasena', label: 'Contraseña', type: 'text' },
  ],
  habitos: [
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'habito', label: 'Hábito', type: 'text' },
    { key: 'completado', label: 'Completado', type: 'checkbox' },
  ],
  compras: [
    { key: 'categoria', label: 'Rubro', type: 'text' },
    { key: 'articulo', label: 'Artículo', type: 'text' },
    { key: 'cantidad', label: 'Cantidad', type: 'text' },
  ],
  hobbies: [
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'actividad', label: 'Actividad', type: 'textarea' },
    { key: 'notas', label: 'Notas', type: 'textarea' },
  ],
  actividadFisica: [
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'actividades', label: 'Códigos (y, str, nat…)', type: 'text' },
  ],
}

function valorLegible(r, key, type) {
  const v = r[key]
  if (type === 'checkbox') return v ? 'Sí' : 'No'
  if (v == null || v === '') return ''
  return String(v).trim()
}

/** Una sola línea con todo el contenido (recortada si es muy larga). */
function lineaVistaPrevia(categoria, r) {
  const campos = CAMPOS[categoria] || []
  const partes = campos
    .map(({ key, type }) => valorLegible(r, key, type))
    .filter(Boolean)
  let linea = partes.join(' · ')
  if (!linea) linea = `Registro #${r.id}`
  if (linea.length > 160) linea = `${linea.slice(0, 157)}…`
  return linea
}

/** Detalle completo tipo “cuerpo de correo”. */
function detalleCompleto(categoria, r) {
  const campos = CAMPOS[categoria] || []
  return campos.map(({ key, label, type }) => ({
    key,
    label,
    value: valorLegible(r, key, type) || '—',
    multilinea: type === 'textarea' || (valorLegible(r, key, type).length > 80),
  }))
}

function formatearFechaHora(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function ordenarRegistros(lista) {
  return [...lista].sort((a, b) => {
    const tb = Date.parse(b.createdAt) || 0
    const ta = Date.parse(a.createdAt) || 0
    return tb - ta
  })
}

export default function HistorialPanel({ abierto, onCerrar, onAviso }) {
  const [desbloqueado, setDesbloqueado] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [categoria, setCategoria] = useState(registry[0]?.value || '')
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(false)
  const [editId, setEditId] = useState(null)
  const [expandidoId, setExpandidoId] = useState(null)
  const [borrador, setBorrador] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [matrizRev, setMatrizRev] = useState(0)

  const cargar = useCallback(async () => {
    if (!desbloqueado || !categoria) return
    setCargando(true)
    try {
      const data = await listarRegistros(categoria)
      setRegistros(ordenarRegistros(data))
      if (categoria === 'actividadFisica') setMatrizRev((n) => n + 1)
    } catch (err) {
      onAviso?.(err.message || 'No se pudo cargar el historial', 'error')
      setRegistros([])
    } finally {
      setCargando(false)
    }
  }, [categoria, desbloqueado, onAviso])

  useEffect(() => {
    if (abierto && desbloqueado) cargar()
  }, [abierto, desbloqueado, cargar])

  useEffect(() => {
    if (!abierto) {
      setDesbloqueado(false)
      setPin('')
      setPinError(false)
      setEditId(null)
      setExpandidoId(null)
      setRegistros([])
    }
  }, [abierto])

  const toggleExpandido = (id) => {
    setExpandidoId((prev) => (prev === id ? null : id))
    setEditId(null)
  }

  const intentarPin = (e) => {
    e.preventDefault()
    if (pin === PIN) {
      setDesbloqueado(true)
      setPinError(false)
    } else {
      setPinError(true)
    }
  }

  const empezarEdicion = (r) => {
    setExpandidoId(r.id)
    setEditId(r.id)
    const campos = CAMPOS[categoria] || []
    const draft = {}
    for (const { key, type } of campos) {
      if (type === 'checkbox') draft[key] = Boolean(r[key])
      else draft[key] = r[key] ?? ''
    }
    setBorrador(draft)
  }

  const cancelarEdicion = () => {
    setEditId(null)
    setBorrador({})
  }

  const guardarEdicion = async () => {
    setGuardando(true)
    try {
      await actualizarRegistro(categoria, editId, borrador)
      onAviso?.('Registro actualizado ✓', 'ok')
      setEditId(null)
      await cargar()
    } catch (err) {
      onAviso?.(err.message || 'No se pudo guardar', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este registro? No se puede deshacer.')) return
    try {
      await borrarRegistro(categoria, id)
      onAviso?.('Registro eliminado', 'ok')
      if (editId === id) cancelarEdicion()
      if (expandidoId === id) setExpandidoId(null)
      await cargar()
    } catch (err) {
      onAviso?.(err.message || 'No se pudo eliminar', 'error')
    }
  }

  if (!abierto) return null

  const labelCat = registry.find((r) => r.value === categoria)?.label || categoria

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-purple-900/40 backdrop-blur-sm px-3 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Historial de registros"
    >
      <div className="card w-full max-w-md max-h-[min(88vh,640px)] flex flex-col shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-sm font-bold text-purple-600">📋 Historial</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="text-purple-400 hover:text-purple-700 text-lg leading-none px-2"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {!desbloqueado ? (
          <form onSubmit={intentarPin} className="space-y-3 py-4">
            <p className="text-xs text-gray-500 text-center">Ingresá la clave para ver tus datos</p>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              className="field-input text-center tracking-widest"
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                setPinError(false)
              }}
            />
            {pinError && (
              <p className="text-xs text-red-500 text-center">Clave incorrecta</p>
            )}
            <button type="submit" className="btn-save mt-2">
              Entrar
            </button>
          </form>
        ) : (
          <>
            <div className="mb-3">
              <label className="field-label">Categoría</label>
              <select
                className="field-select"
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value)
                  setEditId(null)
                  setExpandidoId(null)
                }}
              >
                {registry.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {categoria === 'actividadFisica' && (
              <MatrizEjercicios embed refreshKey={matrizRev} />
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1 min-h-[120px]">
              {cargando && (
                <p className="text-xs text-purple-400 text-center py-6 animate-pulse">Cargando…</p>
              )}
              {!cargando && registros.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-8">No hay registros en {labelCat}</p>
              )}
              {!cargando &&
                registros.map((r) => (
                  <article
                    key={r.id}
                    className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-sm"
                  >
                    {editId === r.id ? (
                      <div className="space-y-2">
                        {(CAMPOS[categoria] || []).map(({ key, label, type }) => (
                          <div key={key}>
                            <label className="text-[10px] font-bold text-purple-400 uppercase">{label}</label>
                            {type === 'checkbox' ? (
                              <label className="flex items-center gap-2 mt-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={Boolean(borrador[key])}
                                  onChange={(e) =>
                                    setBorrador((p) => ({ ...p, [key]: e.target.checked }))
                                  }
                                  className="accent-purple-500"
                                />
                                Sí
                              </label>
                            ) : type === 'textarea' ? (
                              <textarea
                                className="field-input mt-0.5 min-h-[60px]"
                                value={borrador[key] ?? ''}
                                onChange={(e) =>
                                  setBorrador((p) => ({ ...p, [key]: e.target.value }))
                                }
                              />
                            ) : (
                              <input
                                type={type === 'date' ? 'date' : 'text'}
                                className="field-input mt-0.5"
                                value={borrador[key] ?? ''}
                                onChange={(e) =>
                                  setBorrador((p) => ({ ...p, [key]: e.target.value }))
                                }
                              />
                            )}
                          </div>
                        ))}
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            className="flex-1 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-semibold disabled:opacity-50"
                            onClick={guardarEdicion}
                            disabled={guardando}
                          >
                            {guardando ? 'Guardando…' : 'Guardar'}
                          </button>
                          <button
                            type="button"
                            className="flex-1 py-1.5 rounded-lg border border-purple-200 text-purple-600 text-xs"
                            onClick={cancelarEdicion}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="w-full text-left group"
                          onClick={() => toggleExpandido(r.id)}
                          aria-expanded={expandidoId === r.id}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className="text-purple-400 text-xs mt-0.5 shrink-0 transition-transform duration-150"
                              style={{
                                transform: expandidoId === r.id ? 'rotate(90deg)' : 'rotate(0deg)',
                              }}
                              aria-hidden
                            >
                              ▸
                            </span>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-gray-800 text-sm leading-snug ${
                                  expandidoId === r.id ? '' : 'truncate'
                                }`}
                                title={lineaVistaPrevia(categoria, r)}
                              >
                                {lineaVistaPrevia(categoria, r)}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {formatearFechaHora(r.createdAt)}
                              </p>
                            </div>
                          </div>
                        </button>

                        {expandidoId === r.id && (
                          <div className="mt-3 pt-3 border-t border-purple-100/80">
                            <div className="rounded-lg bg-white border border-purple-50 p-3 space-y-2.5 text-xs text-gray-700">
                              {detalleCompleto(categoria, r).map(({ label, value, multilinea, key }) => {
                                const conEnlaces =
                                  key === 'enlaces' || textoContieneUrl(value)
                                return (
                                  <div key={label}>
                                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">
                                      {label}
                                    </p>
                                    <div
                                      className={`mt-0.5 text-gray-800 ${
                                        multilinea ? 'leading-relaxed' : ''
                                      }`}
                                    >
                                      {conEnlaces ? (
                                        <TextoConEnlaces texto={value} />
                                      ) : (
                                        <p className={multilinea ? 'whitespace-pre-wrap break-words' : ''}>
                                          {value}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                              <p className="text-[10px] text-gray-400 pt-1 border-t border-purple-50">
                                Guardado: {formatearFechaHora(r.createdAt)}
                              </p>
                            </div>
                            <div className="flex gap-3 mt-2 px-1">
                              <button
                                type="button"
                                className="text-xs text-purple-500 hover:text-purple-700 font-medium"
                                onClick={() => empezarEdicion(r)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="text-xs text-red-400 hover:text-red-600 font-medium"
                                onClick={() => eliminar(r.id)}
                              >
                                Borrar
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </article>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
