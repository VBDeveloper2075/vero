import { useState, useEffect } from 'react'

const HOBBIES_DEFAULT = [
  'Aromaterapia',
  'Tejido',
  'Costura',
  'Pintura',
  'Lectura',
  'Jardín',
]

const STORAGE_KEY = 'hobbies-lista'

function hoyISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function cargarHobbies() {
  try {
    const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const extras = Array.isArray(guardados) ? guardados : []
    return [...new Set([...HOBBIES_DEFAULT, ...extras])]
  } catch {
    return [...HOBBIES_DEFAULT]
  }
}

export default function HobbiesForm({ onGuardar }) {
  const [lista, setLista] = useState(cargarHobbies)
  const [seleccionados, setSeleccionados] = useState([])
  const [nuevoHobby, setNuevoHobby] = useState('')
  const [fecha, setFecha] = useState(hoyISO)
  const [notas, setNotas] = useState('')

  useEffect(() => {
    const extras = lista.filter((h) => !HOBBIES_DEFAULT.includes(h))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extras))
  }, [lista])

  const toggle = (nombre) => {
    setSeleccionados((prev) =>
      prev.includes(nombre) ? prev.filter((h) => h !== nombre) : [...prev, nombre]
    )
  }

  const agregarHobby = () => {
    const nombre = nuevoHobby.trim()
    if (!nombre) return
    setLista((prev) => (prev.includes(nombre) ? prev : [...prev, nombre]))
    setSeleccionados((prev) => (prev.includes(nombre) ? prev : [...prev, nombre]))
    setNuevoHobby('')
  }

  const eliminarHobby = (nombre) => {
    if (HOBBIES_DEFAULT.includes(nombre)) return
    setLista((prev) => prev.filter((h) => h !== nombre))
    setSeleccionados((prev) => prev.filter((h) => h !== nombre))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!seleccionados.length) return
    onGuardar({
      fecha,
      actividad: seleccionados.join(' | '),
      hobbies: seleccionados,
      notas,
    })
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
        <label className="field-label">Hobbies del día</label>
        <p className="text-xs text-gray-400 mb-2">Podés marcar uno o varios</p>
        <ul className="space-y-2">
          {lista.map((nombre) => {
            const activo = seleccionados.includes(nombre)
            return (
              <li
                key={nombre}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
                  activo ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-600 hover:bg-purple-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(nombre)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <span className="text-base">{activo ? '✅' : '⬜'}</span>
                  <span className="text-sm font-medium flex-1">{nombre}</span>
                </button>
                {!HOBBIES_DEFAULT.includes(nombre) && (
                  <button
                    type="button"
                    onClick={() => eliminarHobby(nombre)}
                    className="text-red-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-base leading-none"
                    title="Quitar hobby"
                  >
                    ×
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        <div className="flex gap-2 mt-3">
          <input
            type="text"
            placeholder="Nuevo hobby…"
            className="field-input flex-1"
            value={nuevoHobby}
            onChange={(e) => setNuevoHobby(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarHobby())}
          />
          <button
            type="button"
            onClick={agregarHobby}
            className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-600 text-sm font-medium transition-colors shrink-0"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="field-label">Notas (opcional)</label>
        <textarea
          rows={3}
          placeholder="Fórmulas, materiales, detalles…"
          className="field-input resize-none leading-relaxed"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-save" disabled={!seleccionados.length}>
        Guardar hobbies
      </button>
    </form>
  )
}
