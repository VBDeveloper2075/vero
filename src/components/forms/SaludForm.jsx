import { useState } from 'react'

const ESPECIALIDADES = [
  'Ginecología', 'Oftalmología', 'Neurología', 'Clínica Médica', 'Dermatología',
  'Odontología', 'Traumatología', 'Cardiología', 'Nutrición', 'Psicología', 'Otra',
]

export default function SaludForm({ onGuardar }) {
  const [form, setForm] = useState({
    fecha: '',
    especialidad: '',
    profesional: '',
    notas: '',
  })

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Fecha de consulta</label>
        <input
          type="date"
          className="field-input"
          value={form.fecha}
          onChange={(e) => set('fecha', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="field-label">Especialidad</label>
        <select
          className="field-select"
          value={form.especialidad}
          onChange={(e) => set('especialidad', e.target.value)}
          required
        >
          <option value="">Seleccionar…</option>
          {ESPECIALIDADES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label">Profesional</label>
        <input
          type="text"
          placeholder="Nombre del médico/a"
          className="field-input"
          value={form.profesional}
          onChange={(e) => set('profesional', e.target.value)}
        />
      </div>
      <div>
        <label className="field-label">Notas / Síntomas / Indicaciones</label>
        <textarea
          rows={5}
          placeholder="Ej: Recetó ibuprofeno 400mg cada 8hs por 5 días. Volver en 3 meses…"
          className="field-input resize-none leading-relaxed"
          value={form.notas}
          onChange={(e) => set('notas', e.target.value)}
        />
      </div>
      <button type="submit" className="btn-save">Guardar</button>
    </form>
  )
}
