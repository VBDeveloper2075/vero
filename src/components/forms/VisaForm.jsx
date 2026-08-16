import { useState } from 'react'

export default function VisaForm({ onGuardar }) {
  const [form, setForm] = useState({
    fechaCierre: '',
    fechaVencimiento: '',
    saldoPesos: '',
    saldoDolares: '',
    pagoMinimo: '',
    observaciones: '',
  })

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Fecha de cierre</label>
        <input
          type="date"
          className="field-input"
          value={form.fechaCierre}
          onChange={(e) => set('fechaCierre', e.target.value)}
          required
        />
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
        <label className="field-label">Saldo ($)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          className="field-input"
          value={form.saldoPesos}
          onChange={(e) => set('saldoPesos', e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Saldo (u$s)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          className="field-input"
          value={form.saldoDolares}
          onChange={(e) => set('saldoDolares', e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Pago mínimo ($)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          className="field-input"
          value={form.pagoMinimo}
          onChange={(e) => set('pagoMinimo', e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Observaciones</label>
        <textarea
          rows={3}
          placeholder="Notas, recordatorios, detalles del resumen…"
          className="field-input resize-none leading-relaxed"
          value={form.observaciones}
          onChange={(e) => set('observaciones', e.target.value)}
        />
      </div>

      <button type="submit" className="btn-save">Guardar</button>
    </form>
  )
}
