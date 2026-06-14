import { useState, useEffect } from 'react'

function fechaFormateada() {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function Header() {
  const [frase, setFrase] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // ZenQuotes requiere un proxy o server-side por CORS.
    // Usamos quotable.io que es CORS-friendly desde el browser.
    fetch('https://api.quotable.io/quotes/random?maxLength=120')
      .then((r) => r.json())
      .then((data) => {
        const item = Array.isArray(data) ? data[0] : data
        setFrase({ contenido: item.content, autor: item.author })
      })
      .catch(() => {
        setFrase({ contenido: 'Cada día es una nueva oportunidad para crecer.', autor: '—' })
      })
      .finally(() => setCargando(false))
  }, [])

  const fecha = fechaFormateada()
  // Capitaliza la primera letra (los locales a veces la dan minúscula)
  const fechaCap = fecha.charAt(0).toUpperCase() + fecha.slice(1)

  return (
    <div className="text-center mb-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-1">
        {fechaCap}
      </p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 mt-2">
        {cargando ? (
          <p className="text-xs text-yellow-400 italic animate-pulse">Cargando frase del día…</p>
        ) : (
          <>
            <p className="text-sm text-yellow-700 italic leading-snug">"{frase.contenido}"</p>
            <p className="text-xs text-yellow-500 mt-1 font-medium">— {frase.autor}</p>
          </>
        )}
      </div>
    </div>
  )
}
