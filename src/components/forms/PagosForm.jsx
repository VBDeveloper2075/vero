import { useState, useEffect } from 'react'

const CONCEPTOS_DEFAULT = [
  'GARAGE',
  'AYSA',
  'GAS',
  'Muni3F',
  'Muni patente',
  'Celu (pers)',
  'Agip nuñez',
  'copilot',
  'GitHub',
  'Gemini One',
  'Sitas Cuota',
  'Sitas locker',
]

const STORAGE_KEY = 'pagos-conceptos'
const NUEVO = '__nuevo__'

function cargarConceptos() {
  try {
    const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const extras = Array.isArray(guardados) ? guardados : []
    return [...new Set([...CONCEPTOS_DEFAULT, ...extras])]
  } catch {
    return [...CONCEPTOS_DEFAULT]
  }
}

export default function PagosForm({ onGuardar }) {
  const [conceptos, setConceptos] = useState(cargarConceptos)
  const [nuevoConcepto, setNuevoConcepto] = useState('')
  const [form, setForm] = useState({ fecha: '', concepto: '', monto: '' })

  useEffect(() => {
    const extras = conceptos.filter((c) => !CONCEPTOS_DEFAULT.includes(c))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extras))
  }, [conceptos])

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const agregarConcepto = () => {
    const nombre = nuevoConcepto.trim()
    if (!nombre) return
    setConceptos((prev) => (prev.includes(nombre) ? prev : [...prev, nombre]))
    set('concepto', nombre)
    setNuevoConcepto('')
  }

  const eliminarConcepto = (nombre) => {
    if (CONCEPTOS_DEFAULT.includes(nombre)) return
    setConceptos((prev) => prev.filter((c) => c !== nombre))
    if (form.concepto === nombre) set('concepto', '')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    let conceptoFinal = form.concepto
    if (conceptoFinal === NUEVO) {
      conceptoFinal = nuevoConcepto.trim()
      if (!conceptoFinal) return
      setConceptos((prev) => (prev.includes(conceptoFinal) ? prev : [...prev, conceptoFinal]))
    }
    if (!conceptoFinal) return
    onGuardar({ ...form, concepto: conceptoFinal })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Fecha</label>
        <input
          type="date"
          className="field-input"
          value={form.fecha}
          onChange={(e) => set('fecha', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="field-label">Concepto</label>
        <select
          className="field-select"
          value={form.concepto}
          onChange={(e) => set('concepto', e.target.value)}
          required={form.concepto !== NUEVO}
        >
          <option value="">Seleccionar…</option>
          {conceptos.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value={NUEVO}>+</option>
        </select>

        {form.concepto === NUEVO && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Ej: estacionamiento sitas…"
              className="field-input flex-1"
              value={nuevoConcepto}
              onChange={(e) => setNuevoConcepto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarConcepto())}
              required
              autoFocus
            />
            <button
              type="button"
              onClick={agregarConcepto}
              className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-600 text-sm font-medium transition-colors shrink-0"
            >
              +
            </button>
          </div>
        )}

        {conceptos.some((c) => !CONCEPTOS_DEFAULT.includes(c)) && (
          <ul className="mt-2 space-y-1">
            {conceptos
              .filter((c) => !CONCEPTOS_DEFAULT.includes(c))
              .map((c) => (
                <li key={c} className="flex items-center justify-between text-xs text-purple-500 px-1">
                  <span>{c}</span>
                  <button
                    type="button"
                    onClick={() => eliminarConcepto(c)}
                    className="text-red-300 hover:text-red-400"
                  >
                    ×
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
      <div>
        <label className="field-label">Monto ($)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          className="field-input"
          value={form.monto}
          onChange={(e) => set('monto', e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn-save">Guardar</button>
    </form>
  )
}
