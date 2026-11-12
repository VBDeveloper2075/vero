import { useState, useEffect, useMemo, useCallback } from 'react'
import { listarRegistros } from '../api'

const MESES_ABREV = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
const ORDEN_CODIGOS = ['C', 'g', 'nat', 'str', 'y']

const ETIQUETAS = {
  y: 'Yoga',
  str: 'Stretching',
  nat: 'Natación',
  C: 'Caminata',
  g: 'Gym',
}

function diasEnMes(anio, mesIdx) {
  return new Date(anio, mesIdx + 1, 0).getDate()
}

function parsearCodigos(raw) {
  return String(raw || '')
    .split(/[\s,|]+/)
    .map((c) => c.trim())
    .filter(Boolean)
}

function fusionarCodigos(...listas) {
  const vistos = {}
  const orden = []
  for (const lista of listas) {
    for (const c of lista) {
      if (!vistos[c]) {
        vistos[c] = true
        orden.push(c)
      }
    }
  }
  const ordenados = []
  for (const c of ORDEN_CODIGOS) {
    if (vistos[c]) ordenados.push(c)
  }
  for (const c of orden) {
    if (!ORDEN_CODIGOS.includes(c)) ordenados.push(c)
  }
  return ordenados
}

function construirMatriz(registros, anio) {
  const celdas = new Map()

  for (const r of registros) {
    const fechaStr = r.fecha
    if (!fechaStr || !/^\d{4}-\d{2}-\d{2}/.test(fechaStr)) continue
    const [y, m, d] = fechaStr.slice(0, 10).split('-').map(Number)
    if (y !== anio) continue
    const clave = `${m}-${d}`
    const prev = celdas.get(clave) || []
    celdas.set(clave, fusionarCodigos(prev, parsearCodigos(r.actividades)))
  }

  return celdas
}

function contarPorCodigo(celdas) {
  const conteo = Object.fromEntries(ORDEN_CODIGOS.map((c) => [c, 0]))
  for (const codigos of celdas.values()) {
    for (const c of codigos) {
      if (conteo[c] != null) conteo[c] += 1
      else conteo[c] = 1
    }
  }
  return conteo
}

export default function MatrizEjercicios({ refreshKey = 0, embed = false }) {
  const anioActual = new Date().getFullYear()
  const [anio, setAnio] = useState(anioActual)
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await listarRegistros('actividadFisica')
      setRegistros(data)
    } catch (err) {
      setError(err.message || 'No se pudo cargar la matriz')
      setRegistros([])
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar, refreshKey])

  const celdas = useMemo(() => construirMatriz(registros, anio), [registros, anio])
  const conteo = useMemo(() => contarPorCodigo(celdas), [celdas])

  const diasConActividad = celdas.size

  return (
    <div className={embed ? 'mb-3 shrink-0' : 'mt-6 pt-5 border-t border-purple-100'}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wide">
          Matriz {anio}
        </h3>
        <select
          className="text-xs rounded-lg border border-purple-200 bg-white px-2 py-1 text-purple-700"
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
        >
          {[anioActual - 1, anioActual, anioActual + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {cargando && (
        <p className="text-xs text-purple-400 text-center py-2 animate-pulse">Cargando matriz…</p>
      )}
      {error && <p className="text-xs text-red-500 text-center py-2">{error}</p>}

      {!cargando && !error && (
        <>
          <p className="text-[10px] text-gray-500 mb-2">
            {diasConActividad} día{diasConActividad === 1 ? '' : 's'} con actividad. Vacío = sin registro.
          </p>

          <div className="overflow-x-auto rounded-xl border border-purple-100 bg-purple-50/70 p-2">
            <table className="w-full border-collapse text-[9px] text-gray-700 min-w-[300px]">
              <thead>
                <tr className="bg-purple-100/50">
                  <th className="sticky left-0 z-10 bg-purple-100 px-1 py-1 text-left font-semibold text-purple-700 w-7 border-r border-purple-100">
                    día
                  </th>
                  {MESES_ABREV.map((m, i) => (
                    <th
                      key={`${m}-${i}`}
                      className="px-0.5 py-1 font-bold text-center text-purple-600 min-w-[2.2rem]"
                    >
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 31 }, (_, idx) => {
                  const dia = idx + 1
                  const filaPar = dia % 2 === 0
                  return (
                    <tr
                      key={dia}
                      className={filaPar ? 'bg-white/80' : 'bg-purple-50/50'}
                    >
                      <td className="sticky left-0 z-10 px-1 py-0.5 font-mono text-purple-600 bg-inherit border-r border-purple-100/80">
                        {dia}
                      </td>
                      {MESES_ABREV.map((_, mesIdx) => {
                        const maxDia = diasEnMes(anio, mesIdx)
                        if (dia > maxDia) {
                          return (
                            <td
                              key={mesIdx}
                              className="px-0.5 py-0.5 text-center text-gray-300"
                            >
                              --
                            </td>
                          )
                        }
                        const codigos = celdas.get(`${mesIdx + 1}-${dia}`) || []
                        return (
                          <td key={mesIdx} className="px-0.5 py-0.5 align-top border border-purple-50/50">
                            <div className="flex flex-wrap gap-px justify-center min-h-[1rem]">
                              {codigos.map((c) => (
                                <span
                                  key={c}
                                  title={ETIQUETAS[c] || c}
                                  className="inline-block rounded px-0.5 py-px bg-purple-500 text-white font-semibold leading-none shadow-sm"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <ul className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-gray-600">
            {ORDEN_CODIGOS.map((c) => (
              <li
                key={c}
                className="rounded-full bg-white border border-purple-100 px-2 py-0.5"
              >
                <span className="font-mono font-bold text-purple-600">{c}</span>
                <span className="text-gray-500"> {ETIQUETAS[c]}</span>
                <span className="text-purple-500 font-semibold"> · {conteo[c] ?? 0}d</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
