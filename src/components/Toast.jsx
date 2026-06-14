import { useEffect } from 'react'

export default function Toast({ mensaje, tipo = 'ok', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const colores =
    tipo === 'ok'
      ? 'bg-purple-100 border-purple-300 text-purple-700'
      : 'bg-red-100 border-red-300 text-red-700'

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl border text-sm font-medium shadow-lg animate-bounce-once ${colores}`}
    >
      {mensaje}
    </div>
  )
}
