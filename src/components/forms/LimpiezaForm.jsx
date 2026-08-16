import { useState } from 'react'

const SUGERIDAS = ['Limpiar airfryer', 'Planchar blusas', 'Lavar ventanas', 'Limpiar baño', 'Aspirar alfombras', 'Ordenar placard']

export default function LimpiezaForm({ onGuardar }) {
  const [tareas, setTareas] = useState(SUGERIDAS.map((t) => ({ texto: t, hecho: false })))
  const [nueva, setNueva] = useState('')

  const toggle = (i) =>
    setTareas((prev) => prev.map((t, idx) => (idx === i ? { ...t, hecho: !t.hecho } : t)))

  const agregarTarea = () => {
    const texto = nueva.trim()
    if (!texto) return
    setTareas((p) => [...p, { texto, hecho: false }])
    setNueva('')
  }

  const eliminarTarea = (i) => setTareas((p) => p.filter((_, idx) => idx !== i))

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar({ tareas })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <ul className="space-y-2">
        {tareas.map((t, i) => (
          <li key={i} className="flex items-center gap-3 group">
            <input
              type="checkbox"
              checked={t.hecho}
              onChange={() => toggle(i)}
              className="w-4 h-4 rounded accent-purple-400 cursor-pointer"
            />
            <span className={`flex-1 text-sm ${t.hecho ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {t.texto}
            </span>
            <button
              type="button"
              onClick={() => eliminarTarea(i)}
              className="text-red-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-base leading-none"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 mt-3">
        <input
          type="text"
          placeholder="Nueva tarea…"
          className="field-input flex-1"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarTarea())}
        />
        <button
          type="button"
          onClick={agregarTarea}
          className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-600 text-sm font-medium transition-colors"
        >
          +
        </button>
      </div>

      <button type="submit" className="btn-save">Guardar lista</button>
    </form>
  )
}
