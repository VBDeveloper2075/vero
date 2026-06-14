import { useState } from 'react'

const HABITOS = ['Caminata', 'Sin dulces', 'Agua (2L)', 'Meditación', 'Lectura', 'Ejercicio', 'Sin redes sociales', 'Dormir temprano']

export default function HabitosForm({ onGuardar }) {
  const [habitos, setHabitos] = useState(
    HABITOS.map((h) => ({ habito: h, completado: false }))
  )

  const toggle = (i) =>
    setHabitos((prev) => prev.map((h, idx) => (idx === i ? { ...h, completado: !h.completado } : h)))

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar({ fecha: new Date().toISOString().slice(0, 10), habitos })
  }

  const completados = habitos.filter((h) => h.completado).length

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">Hábitos de hoy</span>
        <span className="text-xs font-semibold text-purple-500">
          {completados} / {habitos.length}
        </span>
      </div>

      {/* barra de progreso */}
      <div className="w-full bg-purple-100 rounded-full h-1.5 mb-3">
        <div
          className="bg-purple-400 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(completados / habitos.length) * 100}%` }}
        />
      </div>

      <ul className="space-y-2">
        {habitos.map((h, i) => (
          <li
            key={i}
            onClick={() => toggle(i)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
              h.completado ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-600 hover:bg-purple-50'
            }`}
          >
            <span className="text-base">{h.completado ? '✅' : '⬜'}</span>
            <span className="text-sm font-medium">{h.habito}</span>
          </li>
        ))}
      </ul>
      <button type="submit" className="btn-save">Guardar hábitos del día</button>
    </form>
  )
}
