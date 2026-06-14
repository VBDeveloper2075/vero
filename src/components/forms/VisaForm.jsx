import { useState } from 'react'

const filaVacia = () => ({ fecha: '', descripcion: '', cuotaActual: '', cuotasTotal: '', monto: '' })

export default function VisaForm({ onGuardar }) {
  const [filas, setFilas] = useState([filaVacia()])

  const setFila = (i, k, v) => {
    setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, [k]: v } : f)))
  }

  const agregarFila = () => setFilas((p) => [...p, filaVacia()])
  const eliminarFila = (i) => setFilas((p) => p.filter((_, idx) => idx !== i))

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar({ consumos: filas })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs min-w-[520px]">
          <thead>
            <tr className="text-purple-400 uppercase tracking-wider text-left">
              <th className="pb-2 pr-2 font-medium">Fecha</th>
              <th className="pb-2 pr-2 font-medium">Descripción</th>
              <th className="pb-2 pr-2 font-medium text-center">Cuota</th>
              <th className="pb-2 pr-2 font-medium">Monto</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="space-y-2">
            {filas.map((f, i) => (
              <tr key={i} className="align-top">
                <td className="pr-2 pb-2">
                  <input
                    type="date"
                    className="field-input text-xs"
                    value={f.fecha}
                    onChange={(e) => setFila(i, 'fecha', e.target.value)}
                    required
                  />
                </td>
                <td className="pr-2 pb-2">
                  <input
                    type="text"
                    placeholder="Descripción"
                    className="field-input text-xs"
                    value={f.descripcion}
                    onChange={(e) => setFila(i, 'descripcion', e.target.value)}
                    required
                  />
                </td>
                <td className="pr-2 pb-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      className="field-input text-xs w-10 text-center px-1"
                      value={f.cuotaActual}
                      onChange={(e) => setFila(i, 'cuotaActual', e.target.value)}
                    />
                    <span className="text-gray-400">/</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      className="field-input text-xs w-10 text-center px-1"
                      value={f.cuotasTotal}
                      onChange={(e) => setFila(i, 'cuotasTotal', e.target.value)}
                    />
                  </div>
                </td>
                <td className="pr-2 pb-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="$0"
                    className="field-input text-xs"
                    value={f.monto}
                    onChange={(e) => setFila(i, 'monto', e.target.value)}
                    required
                  />
                </td>
                <td className="pb-2">
                  {filas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarFila(i)}
                      className="text-red-300 hover:text-red-500 text-base leading-none mt-1"
                      title="Eliminar fila"
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={agregarFila} className="btn-add">
        + Agregar consumo
      </button>
      <button type="submit" className="btn-save">Guardar todos</button>
    </form>
  )
}
