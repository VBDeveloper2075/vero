import { useState } from 'react'

const SERVICIOS = ['Dominio', 'VPN', 'Adobe', 'Spotify', 'Netflix', 'ChatGPT', 'iCloud', 'Antivirus', 'Otro']

export default function VencimientosForm({ onGuardar }) {
  const [form, setForm] = useState({ servicio: '', fechaVencimiento: '', notas: '' })

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Servicio / Suscripción</label>
        <select
          className="field-select"
          value={form.servicio}
          onChange={(e) => set('servicio', e.target.value)}
          required
        >
          <option value="">Seleccionar…</option>
          {SERVICIOS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
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
