import { useState, useCallback, Suspense } from 'react'
import Header from './components/Header'
import Toast from './components/Toast'
import registry from './registry'
import { enviarDatos } from './api'

export default function App() {
  const [categoria, setCategoria] = useState('')
  const [toast, setToast] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const cerrarToast = useCallback(() => setToast(null), [])

  const handleGuardar = async (datos) => {
    setEnviando(true)
    try {
      await enviarDatos(categoria, datos)
      setToast({ mensaje: '¡Guardado correctamente! ✓', tipo: 'ok' })
    } catch (err) {
      console.error(err)
      setToast({ mensaje: 'Error de conexión. No se pudo guardar el registro.', tipo: 'error' })
    } finally {
      setEnviando(false)
    }
  }

  const entrada = registry.find((r) => r.value === categoria) ?? null
  const FormularioActivo = entrada?.component ?? null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-md">

        <Header />

        <div className="card">
          {/* Selector de categoría */}
          <div className="mb-5">
            <label className="field-label">¿Qué querés registrar?</label>
            <select
              className="field-select text-base font-medium"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Elegir categoría…</option>
              {registry.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Formulario activo — cargado de forma lazy */}
          {FormularioActivo && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-purple-100" />
                <span className="text-xs text-purple-400 font-medium whitespace-nowrap">
                  {entrada.label}
                </span>
                <div className="h-px flex-1 bg-purple-100" />
              </div>

              <div className={enviando ? 'opacity-50 pointer-events-none' : ''}>
                <Suspense
                  fallback={
                    <p className="text-center text-xs text-purple-300 py-8 animate-pulse">
                      Cargando formulario…
                    </p>
                  }
                >
                  <FormularioActivo onGuardar={handleGuardar} />
                </Suspense>
              </div>

              {enviando && (
                <p className="text-center text-xs text-purple-400 mt-3 animate-pulse">
                  Guardando…
                </p>
              )}
            </>
          )}

          {/* Estado vacío */}
          {!FormularioActivo && (
            <div className="text-center py-8 text-gray-300 select-none">
              <div className="text-5xl mb-3">🌱</div>
              <p className="text-sm">Seleccioná una categoría para comenzar</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 mt-6 select-none">
          Mi espacio personal · {new Date().getFullYear()}
        </p>
      </div>

      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={cerrarToast} />
      )}
    </div>
  )
}
