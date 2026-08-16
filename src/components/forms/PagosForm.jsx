import { useState } from 'react'

const CONCEPTOS = ['Garage', 'AYSA', 'GAS', 'Municipalidad', 'Celular', 'Sitas', 'Expensas', 'Luz', 'Internet', 'Alquiler', 'Otro']

export default function PagosForm({ onGuardar }) {
  const [form, setForm] = useState({ fecha: '', concepto: '', monto: '' })

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar(form)
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
          required
        >
          <option value="">Seleccionar…</option>
          {CONCEPTOS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
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
