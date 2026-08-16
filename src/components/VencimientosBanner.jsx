export default function VencimientosBanner({ vencimientos, onCerrar }) {
  if (!vencimientos || vencimientos.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 space-y-2">
      {vencimientos.map((v, i) => (
        <div
          key={i}
          className="flex items-start gap-3 bg-yellow-50 border border-yellow-300 rounded-2xl px-4 py-3 shadow-md"
        >
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide">
              Vence mañana
            </p>
            <p className="text-sm font-semibold text-purple-700 truncate">
              {v.servicio}
            </p>
            <p className="text-xs text-yellow-600 mt-0.5">
              Fecha: {v.fechaVencimiento}
            </p>
          </div>
          <button
            onClick={() => onCerrar(i)}
            className="text-yellow-400 hover:text-yellow-600 text-lg leading-none shrink-0 mt-0.5"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
