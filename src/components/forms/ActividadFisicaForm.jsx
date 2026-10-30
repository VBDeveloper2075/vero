import { useState } from 'react'

const ACTIVIDADES = [
  { codigo: 'y', label: 'Yoga' },
  { codigo: 'str', label: 'Stretching' },
  { codigo: 'nat', label: 'Natación' },
  { codigo: 'C', label: 'Caminata' },
  { codigo: 'g', label: 'Gym' },
]

function hoyISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function ActividadFisicaForm({ onGuardar }) {
  const [fecha, setFecha] = useState(hoyISO)
  const [seleccionadas, setSeleccionadas] = useState([])

  const toggle = (codigo) => {
    setSeleccionadas((prev) =>
      prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!seleccionadas.length) return
    onGuardar({ fecha, actividades: seleccionadas })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Fecha</label>
        <input
          type="date"
          className="field-input"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="field-label">Actividades del día</label>
        <p className="text-xs text-gray-400 mb-2">Podés marcar una o varias</p>
        <ul className="space-y-2">
          {ACTIVIDADES.map(({ codigo, label }) => {
            const activa = seleccionadas.includes(codigo)
            return (
              <li key={codigo}>
                <button
                  type="button"
                  onClick={() => toggle(codigo)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    activa
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  <span className="text-base">{activa ? '✅' : '⬜'}</span>
                  <span className="text-sm font-medium flex-1">{label}</span>
                  <span className="text-xs font-mono text-purple-400">{codigo}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <button
        type="submit"
        className="btn-save"
        disabled={!seleccionadas.length}
      >
        Guardar actividad
      </button>
    </form>
  )
}
