import { useState } from 'react'

const ACTIVIDADES = ['Aromaterapia', 'Tejido', 'Costura', 'Pintura', 'Lectura', 'Jardín', 'Otra']

const PLACEHOLDER_NOTAS = {
  Aromaterapia: 'Ej: Lavanda 5 gotas + Naranja 3 gotas + Eucalipto 2 gotas en difusor…',
  Tejido: 'Ej: Lana Merino N°5, punto arroz, 30 puntos base…',
  Costura: 'Ej: Tela satén azul, patron A-05, medidas ajustadas…',
  default: 'Notas, fórmulas, instrucciones…',
}

export default function HobbiesForm({ onGuardar }) {
  const [form, setForm] = useState({ actividad: '', notas: '' })

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const placeholder = PLACEHOLDER_NOTAS[form.actividad] || PLACEHOLDER_NOTAS.default

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Actividad</label>
        <select
          className="field-select"
          value={form.actividad}
          onChange={(e) => set('actividad', e.target.value)}
          required
        >
          <option value="">Seleccionar…</option>
          {ACTIVIDADES.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label">Notas / Fórmulas / Recetas</label>
        <textarea
          rows={6}
          placeholder={placeholder}
          className="field-input resize-none leading-relaxed"
          value={form.notas}
          onChange={(e) => set('notas', e.target.value)}
        />
      </div>
      <button type="submit" className="btn-save">Guardar</button>
    </form>
  )
}
