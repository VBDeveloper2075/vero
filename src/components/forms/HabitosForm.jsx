import { useState, useEffect } from 'react'

const HABITOS_DEFAULT = [
  'Caminata', 'Sin dulces', 'Agua (2L)',
  'Meditación', 'Lectura', 'Ejercicio',
  'Sin redes sociales', 'Dormir temprano',
]

const STORAGE_KEY = 'habitos-lista'

function cargarHabitos() {
  try {
    const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const extras = Array.isArray(guardados) ? guardados : []
    return [...new Set([...HABITOS_DEFAULT, ...extras])]
  } catch {
    return [...HABITOS_DEFAULT]
  }
}

export default function HabitosForm({ onGuardar }) {
  const [lista, setLista] = useState(cargarHabitos)
  const [estados, setEstados] = useState(() =>
    Object.fromEntries(cargarHabitos().map((h) => [h, false]))
  )
  const [nuevoHabito, setNuevoHabito] = useState('')

  useEffect(() => {
    const extras = lista.filter((h) => !HABITOS_DEFAULT.includes(h))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extras))
  }, [lista])

  const toggle = (habito) =>
    setEstados((prev) => ({ ...prev, [habito]: !prev[habito] }))

  const agregarHabito = () => {
    const nombre = nuevoHabito.trim()
    if (!nombre || lista.includes(nombre)) return
    setLista((prev) => [...prev, nombre])
    setEstados((prev) => ({ ...prev, [nombre]: false }))
    setNuevoHabito('')
  }

  const eliminarHabito = (nombre) => {
    if (HABITOS_DEFAULT.includes(nombre)) return
    setLista((prev) => prev.filter((h) => h !== nombre))
    setEstados((prev) => {
      const { [nombre]: _, ...resto } = prev
      return resto
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const habitos = lista.map((h) => ({ habito: h, completado: estados[h] ?? false }))
    onGuardar({ fecha: new Date().toISOString().slice(0, 10), habitos })
  }

  const completados = lista.filter((h) => estados[h]).length

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Encabezado + barra de progreso */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">Hábitos de hoy</span>
        <span className="text-xs font-semibold text-purple-500">
          {completados} / {lista.length}
        </span>
      </div>
      <div className="w-full bg-purple-100 rounded-full h-1.5">
        <div
          className="bg-purple-400 h-1.5 rounded-full transition-all duration-300"
          style={{ width: lista.length ? `${(completados / lista.length) * 100}%` : '0%' }}
        />
      </div>

      {/* Lista de hábitos */}
      <ul className="space-y-2 pt-1">
        {lista.map((h) => (
          <li
            key={h}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
              estados[h] ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-600 hover:bg-purple-50'
            }`}
          >
            <span
              className="text-base cursor-pointer select-none"
              onClick={() => toggle(h)}
            >
              {estados[h] ? '✅' : '⬜'}
            </span>
            <span
              className="text-sm font-medium flex-1 cursor-pointer select-none"
              onClick={() => toggle(h)}
            >
              {h}
            </span>
            {!HABITOS_DEFAULT.includes(h) && (
              <button
                type="button"
                onClick={() => eliminarHabito(h)}
                className="text-red-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-base leading-none"
                title="Quitar hábito"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Agregar nuevo hábito */}
      <div className="flex gap-2 pt-1">
        <input
          type="text"
          placeholder="Nuevo hábito…"
          className="field-input flex-1"
          value={nuevoHabito}
          onChange={(e) => setNuevoHabito(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarHabito())}
        />
        <button
          type="button"
          onClick={agregarHabito}
          className="px-4 py-2 rounded-xl bg-purple-200 hover:bg-purple-300 text-purple-700 text-sm font-semibold transition-colors shrink-0"
        >
          +
        </button>
      </div>

      <button type="submit" className="btn-save">Guardar hábitos del día</button>
    </form>
  )
}
