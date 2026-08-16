import { useState, useEffect } from 'react'

const FRASE_API_URL = 'https://api.quotable.io/quotes/random?maxLength=120'
const CACHE_KEY = 'fraseDelDia'
const FETCH_TIMEOUT_MS = 7000

const FRASES_LOCALES = [
  { contenido: 'Cada día es una nueva oportunidad para crecer.', autor: '—' },
  { contenido: 'Lo pequeño que hacés hoy construye lo grande de mañana.', autor: '—' },
  { contenido: 'Avanzar lento también es avanzar.', autor: '—' },
  { contenido: 'Tu constancia vale más que la perfección.', autor: '—' },
  { contenido: 'Hoy sembrás; mañana cosechás.', autor: '—' },
  { contenido: 'Hacerlo simple también es hacerlo bien.', autor: '—' },
  { contenido: 'Cuidar tu energía también es productividad.', autor: '—' },
]

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

function indiceDia(diaClave) {
  const [y, m, d] = diaClave.split('-').map(Number)
  const msDia = Date.UTC(y, m - 1, d)
  return Math.floor(msDia / 86400000)
}

function fraseLocalDelDia(diaClave) {
  const idx = ((indiceDia(diaClave) % FRASES_LOCALES.length) + FRASES_LOCALES.length) % FRASES_LOCALES.length
  return FRASES_LOCALES[idx]
}

export default function Header() {
  const [frase, setFrase] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [diaClave, setDiaClave] = useState(() => claveDiaActual())

  // Chequea periódicamente si cambió el día (más robusto que un único timeout:
  // sobrevive a suspensiones/hibernación del dispositivo). Al detectar un día
  // nuevo, actualiza diaClave y dispara el re-fetch de la frase.
  useEffect(() => {
    const intervalId = setInterval(() => {
      const hoy = claveDiaActual()
      setDiaClave((prev) => (prev === hoy ? prev : hoy))
    }, 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    let cancelado = false

    const cargarFrase = async () => {
      const cacheRaw = localStorage.getItem(CACHE_KEY)
      if (cacheRaw) {
        try {
          const cache = JSON.parse(cacheRaw)
          if (cache?.dia === diaClave && cache?.frase?.contenido) {
            if (!cancelado) {
              setFrase(cache.frase)
              setCargando(false)
            }
            return
          }
        } catch {
          // Si el cache está corrupto, se ignora y se vuelve a pedir.
        }
      }

      if (!cancelado) setCargando(true)

      let fraseDia = null
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

      try {
        // Frase nueva para el día actual (evita respuestas cacheadas por navegador/CDN).
        const response = await fetch(`${FRASE_API_URL}&d=${diaClave}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        const item = Array.isArray(data) ? data[0] : data
        if (!item?.content) throw new Error('Respuesta sin contenido')

        fraseDia = { contenido: item.content, autor: item.author || '—' }
      } catch {
        // Fallback diario determinístico: cambia con el día incluso si la API falla.
        fraseDia = fraseLocalDelDia(diaClave)
      } finally {
        clearTimeout(timeoutId)
      }

      if (cancelado) return

      setFrase(fraseDia)
      localStorage.setItem(CACHE_KEY, JSON.stringify({ dia: diaClave, frase: fraseDia }))
      setCargando(false)
    }

    cargarFrase()

    return () => {
      cancelado = true
    }
  }, [diaClave])

  const fecha = fechaFormateada()
  // Capitaliza la primera letra (los locales a veces la dan minúscula)
  const fechaCap = fecha.charAt(0).toUpperCase() + fecha.slice(1)

  return (
    <div className="text-center mb-6">
      <p className="text-sm font-bold uppercase tracking-widest text-purple-600 mb-1">
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
