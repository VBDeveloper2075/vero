import { useState } from 'react'

export default function IdeasForm({ onGuardar }) {
  const [form, setForm] = useState({ titulo: '', enlaces: '', notas: '' })

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Título del proyecto / idea</label>
        <input
          type="text"
          placeholder="Ej: App de recetas con IA"
          className="field-input"
          value={form.titulo}
          onChange={(e) => set('titulo', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="field-label">Enlaces útiles</label>
        <textarea
          rows={3}
          placeholder="https://… (uno por línea)"
          className="field-input resize-none font-mono text-xs leading-relaxed"
          value={form.enlaces}
          onChange={(e) => set('enlaces', e.target.value)}
        />
      </div>
      <div>
        <label className="field-label">Notas</label>
        <textarea
          rows={4}
          placeholder="Descripción, pasos a seguir, recursos necesarios…"
          className="field-input resize-none leading-relaxed"
          value={form.notas}
          onChange={(e) => set('notas', e.target.value)}
        />
      </div>
      <button type="submit" className="btn-save">Guardar</button>
    </form>
  )
}
