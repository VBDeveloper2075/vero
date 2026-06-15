import { useState, useEffect } from 'react'

function fechaFormateada() {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function claveDiaActual() {
  const ahora = new Date()
  const y = ahora.getFullYear()
  const m = String(ahora.getMonth() + 1).padStart(2, '0')
  const d = String(ahora.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function msHastaProximaMedianoche() {
  const ahora = new Date()
  const proxima = new Date(ahora)
  proxima.setHours(24, 0, 0, 0)
  return proxima.getTime() - ahora.getTime()
}

export default function Header() {
  const [frase, setFrase] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [diaClave, setDiaClave] = useState(() => claveDiaActual())

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDiaClave(claveDiaActual())
    }, msHastaProximaMedianoche() + 1000)

    return () => clearTimeout(timeoutId)
  }, [diaClave])

  useEffect(() => {
    const cacheKey = 'fraseDelDia'
    const cacheRaw = localStorage.getItem(cacheKey)
    if (cacheRaw) {
      try {
        const cache = JSON.parse(cacheRaw)
        if (cache?.dia === diaClave && cache?.frase?.contenido) {
          setFrase(cache.frase)
          setCargando(false)
          return
        }
      } catch {
        // Si el cache está corrupto, se ignora y se vuelve a pedir.
      }
    }

    // Frase nueva para el día actual (evita respuestas cacheadas por navegador/CDN).
    fetch(`https://api.quotable.io/quotes/random?maxLength=120&d=${diaClave}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const item = Array.isArray(data) ? data[0] : data
        const fraseDia = { contenido: item.content, autor: item.author }
        setFrase(fraseDia)
        localStorage.setItem(cacheKey, JSON.stringify({ dia: diaClave, frase: fraseDia }))
      })
      .catch(() => {
        const fallback = { contenido: 'Cada día es una nueva oportunidad para crecer.', autor: '—' }
        setFrase(fallback)
        localStorage.setItem(cacheKey, JSON.stringify({ dia: diaClave, frase: fallback }))
      })
      .finally(() => setCargando(false))
  }, [diaClave])

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
