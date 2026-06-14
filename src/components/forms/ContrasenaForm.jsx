import { useState } from 'react'

export default function ContrasenaForm({ onGuardar }) {
  const [form, setForm] = useState({ webApp: '', email: '', usuario: '', contrasena: '' })
  const [mostrar, setMostrar] = useState(false)

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-xs text-yellow-700">
        ⚠️ Este registro es temporal. Los datos se guardarán en tu Google Sheet privado.
        No uses esta app en dispositivos compartidos.
      </div>
      <div>
        <label className="field-label">Web / App</label>
        <input
          type="text"
          placeholder="Ej: Instagram, Gmail, Banco…"
          className="field-input"
          value={form.webApp}
          onChange={(e) => set('webApp', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="field-label">Email asociado</label>
        <input
          type="email"
          placeholder="tu@email.com"
          className="field-input"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
        />
      </div>
      <div>
        <label className="field-label">Usuario</label>
        <input
          type="text"
          placeholder="nombre de usuario"
          className="field-input"
          value={form.usuario}
          onChange={(e) => set('usuario', e.target.value)}
        />
      </div>
      <div>
        <label className="field-label">Contraseña</label>
        <div className="relative">
          <input
            type={mostrar ? 'text' : 'password'}
            placeholder="••••••••"
            className="field-input pr-10"
            value={form.contrasena}
            onChange={(e) => set('contrasena', e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setMostrar((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 text-xs font-medium"
          >
            {mostrar ? 'Ocultar' : 'Ver'}
          </button>
        </div>
      </div>
      <button type="submit" className="btn-save">Guardar</button>
    </form>
  )
}
