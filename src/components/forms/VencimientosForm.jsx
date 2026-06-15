import { useState, useEffect } from 'react'

const SERVICIOS_DEFAULT = [
  'Dominio', 'VPN', 'Adobe', 'Spotify', 'Netflix',
  'ChatGPT', 'iCloud', 'Antivirus', 'Hosting', 'Otro',
]

const STORAGE_KEY = 'vencimientos-servicios'

function cargarServicios() {
  try {
    const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const extras = Array.isArray(guardados) ? guardados : []
    return [...new Set([...SERVICIOS_DEFAULT, ...extras])]
  } catch {
    return [...SERVICIOS_DEFAULT]
  }
}

export default function VencimientosForm({ onGuardar }) {
  const [servicios, setServicios] = useState(cargarServicios)
  const [nuevoServicio, setNuevoServicio] = useState('')
  const [otroServicio, setOtroServicio] = useState('')
  const [form, setForm] = useState({ servicio: '', fechaVencimiento: '', notas: '' })

  useEffect(() => {
    const extras = servicios.filter((s) => !SERVICIOS_DEFAULT.includes(s))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extras))
  }, [servicios])

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const agregarServicio = () => {
    const nombre = nuevoServicio.trim()
    if (!nombre) return
    setServicios((prev) => (prev.includes(nombre) ? prev : [...prev, nombre]))
    set('servicio', nombre)
    setNuevoServicio('')
  }

  const eliminarServicio = (nombre) => {
    if (SERVICIOS_DEFAULT.includes(nombre)) return
    setServicios((prev) => prev.filter((s) => s !== nombre))
    if (form.servicio === nombre) set('servicio', '')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const servicioFinal =
      form.servicio === 'Otro' ? otroServicio.trim() : form.servicio
    if (!servicioFinal) return
    onGuardar({ ...form, servicio: servicioFinal })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Servicio / Suscripción</label>
        <select
          className="field-select"
          value={form.servicio}
          onChange={(e) => set('servicio', e.target.value)}
          required={form.servicio !== 'Otro'}
        >
          <option value="">Seleccionar…</option>
          {servicios.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {form.servicio === 'Otro' && (
          <input
            type="text"
            placeholder="Nombre del servicio"
            className="field-input mt-2"
            value={otroServicio}
            onChange={(e) => setOtroServicio(e.target.value)}
            required
          />
        )}
      </div>

      <div>
        <label className="field-label">Agregar servicio al listado</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ej: Canva, Notion, Cursor…"
            className="field-input flex-1"
            value={nuevoServicio}
            onChange={(e) => setNuevoServicio(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarServicio())}
          />
          <button
            type="button"
            onClick={agregarServicio}
            className="px-4 py-2 rounded-xl bg-purple-200 hover:bg-purple-300 text-purple-700 text-sm font-semibold transition-colors shrink-0"
          >
            +
          </button>
        </div>
        {servicios.some((s) => !SERVICIOS_DEFAULT.includes(s)) && (
          <ul className="mt-2 space-y-1">
            {servicios
              .filter((s) => !SERVICIOS_DEFAULT.includes(s))
              .map((s) => (
                <li key={s} className="flex items-center justify-between text-xs text-purple-500 px-1">
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => eliminarServicio(s)}
                    className="text-red-300 hover:text-red-500 leading-none text-base"
                    title="Quitar del listado"
                  >
                    ×
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div>
        <label className="field-label">Fecha de vencimiento</label>
        <input
          type="date"
          className="field-input"
          value={form.fechaVencimiento}
          onChange={(e) => set('fechaVencimiento', e.target.value)}
          required
        />
      </div>

      <div>
        <label className="field-label">Notas (opcional)</label>
        <input
          type="text"
          placeholder="Ej: renovar automático, precio en USD…"
          className="field-input"
          value={form.notas}
          onChange={(e) => set('notas', e.target.value)}
        />
      </div>

      <button type="submit" className="btn-save">Guardar</button>
    </form>
  )
}
