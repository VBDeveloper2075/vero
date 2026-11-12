const URL_REGEX = /(https?:\/\/[^\s<]+[^\s<.,;:"')\]\s])/gi

function partirTexto(texto) {
  if (!texto) return []
  const partes = []
  let ultimo = 0
  const re = new RegExp(URL_REGEX.source, 'gi')
  let coincidencia = re.exec(texto)
  while (coincidencia) {
    if (coincidencia.index > ultimo) {
      partes.push({ tipo: 'texto', valor: texto.slice(ultimo, coincidencia.index) })
    }
    partes.push({ tipo: 'enlace', valor: coincidencia[0] })
    ultimo = coincidencia.index + coincidencia[0].length
    coincidencia = re.exec(texto)
  }
  if (ultimo < texto.length) {
    partes.push({ tipo: 'texto', valor: texto.slice(ultimo) })
  }
  return partes.length ? partes : [{ tipo: 'texto', valor: texto }]
}

/** Renderiza texto con URLs clicables (nueva pestaña). */
export default function TextoConEnlaces({ texto, className = '' }) {
  const partes = partirTexto(String(texto ?? ''))

  return (
    <span className={className}>
      {partes.map((p, i) =>
        p.tipo === 'enlace' ? (
          <a
            key={i}
            href={p.valor}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 underline underline-offset-2 break-all hover:text-purple-800"
            onClick={(e) => e.stopPropagation()}
          >
            {p.valor}
          </a>
        ) : (
          <span key={i} className="whitespace-pre-wrap break-words">
            {p.valor}
          </span>
        )
      )}
    </span>
  )
}

export function textoContieneUrl(texto) {
  return /(https?:\/\/\S+)/i.test(String(texto ?? ''))
}
