import { useState } from 'react'

const CATEGORIAS = ['Almacén', 'Carnicería', 'Verdulería', 'Farmacia', 'Bazar', 'Limpieza', 'Otro']

export default function ComprasForm({ onGuardar }) {
  const [rubro, setRubro] = useState('')
  const [items, setItems] = useState([{ articulo: '', cantidad: '' }])

  const setItem = (i, k, v) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)))

  const agregarItem = () => setItems((p) => [...p, { articulo: '', cantidad: '' }])
  const eliminarItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i))

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar({ rubro, items: items.filter((it) => it.articulo.trim()) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Categoría</label>
        <select
          className="field-select"
          value={rubro}
          onChange={(e) => setRubro(e.target.value)}
          required
        >
          <option value="">Seleccionar…</option>
          {CATEGORIAS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="field-label">Lista de artículos</label>
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder={`Artículo ${i + 1}`}
              className="field-input flex-1"
              value={it.articulo}
              onChange={(e) => setItem(i, 'articulo', e.target.value)}
              required={i === 0}
            />
            <input
              type="text"
              placeholder="Cant."
              className="field-input w-16 text-center"
              value={it.cantidad}
              onChange={(e) => setItem(i, 'cantidad', e.target.value)}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => eliminarItem(i)}
                className="text-red-300 hover:text-red-500 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={agregarItem} className="btn-add mt-1">
          + Agregar artículo
        </button>
      </div>

      <button type="submit" className="btn-save">Guardar lista</button>
    </form>
  )
}
