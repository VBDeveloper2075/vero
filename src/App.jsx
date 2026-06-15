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
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-100 to-purple-50 flex justify-center px-4 py-8">
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

              {/* Enlace a la hoja de Google Sheets de esta categoría */}
              {entrada?.sheetUrl && (
                <div className="mt-4 pt-4 border-t border-purple-100 text-center">
                  <a
                    href={entrada.sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-purple-500 hover:text-purple-700 transition-colors duration-150"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Ver hoja · {entrada.label.replace(/^\S+\s/, '')}
                  </a>
                </div>
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

        <p className="mt-4 text-center text-xs text-[#dec790]/80">
          Hecho por{' '}
          <a
            href="https://www.si-cb-vendes-mejor.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#dec790] hover:text-[#ff0d66] transition-colors"
          >
            cbJamstack
          </a>
        </p>
      </div>

      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={cerrarToast} />
      )}
    </div>
  )
}
