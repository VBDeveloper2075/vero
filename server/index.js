/**
 * API de Vero → Neon Postgres
 *
 *   POST /                      → guardar registro
 *   GET  /                      → vencimientos (banner)
 *   GET  /registros/:categoria  → listar registros de una categoría
 *
 * Auth: sharedSecret en body (POST) o header X-Shared-Secret (GET)
 *
 * Env: DATABASE_URL, SHARED_SECRET, PORT?, CORS_ORIGINS? (csv)
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { neon } from '@neondatabase/serverless'

const app = express()
const PORT = process.env.PORT || 3001

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en .env')
  process.exit(1)
}
if (!process.env.SHARED_SECRET) {
  console.error('Falta SHARED_SECRET en .env')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

const CATEGORIAS = new Set([
  'pagos', 'visa', 'vencimientos', 'limpieza', 'salud',
  'ideas', 'contrasenas', 'habitos', 'compras', 'hobbies',
])

const DEFAULT_CORS = [
  'https://vbdeveloper2075.github.io',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]

const corsOrigins = (process.env.CORS_ORIGINS || DEFAULT_CORS.join(','))
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Shared-Secret'],
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.text({ type: 'text/plain', limit: '1mb' }))

/** Healthcheck público para Render (sin secret). */
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'vero-api' })
})

function parseBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      throw new Error('Body JSON inválido')
    }
  }
  return req.body || {}
}

function assertSecret(value) {
  if (!value || value !== process.env.SHARED_SECRET) {
    const err = new Error('Acceso denegado')
    err.status = 401
    throw err
  }
}

function secretFromRequest(req, body = {}) {
  return req.get('X-Shared-Secret') || body.sharedSecret || ''
}

function formatDate(value) {
  if (!value) return ''
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getUTCFullYear()
    const m = String(value.getUTCMonth() + 1).padStart(2, '0')
    const d = String(value.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const s = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const parsed = new Date(s)
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getUTCFullYear()
    const m = String(parsed.getUTCMonth() + 1).padStart(2, '0')
    const d = String(parsed.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return s
}

function formatRow(categoria, row) {
  const base = {
    id: String(row.id),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  }

  switch (categoria) {
    case 'pagos':
      return { ...base, fecha: formatDate(row.fecha), concepto: row.concepto, monto: row.monto }
    case 'visa':
      return {
        ...base,
        fechaCierre: formatDate(row.fecha_cierre),
        fechaVencimiento: formatDate(row.fecha_vencimiento),
        saldoPesos: row.saldo_pesos,
        saldoDolares: row.saldo_dolares,
        pagoMinimo: row.pago_minimo,
        observaciones: row.observaciones,
      }
    case 'vencimientos':
      return {
        ...base,
        servicio: row.servicio,
        fechaVencimiento: formatDate(row.fecha_vencimiento),
        notas: row.notas,
      }
    case 'limpieza':
      return { ...base, tarea: row.tarea, completada: Boolean(row.completada) }
    case 'salud':
      return {
        ...base,
        fecha: formatDate(row.fecha),
        especialidad: row.especialidad,
        profesional: row.profesional,
        notas: row.notas,
      }
    case 'ideas':
      return { ...base, titulo: row.titulo, enlaces: row.enlaces, notas: row.notas }
    case 'contrasenas':
      return {
        ...base,
        webApp: row.web_app,
        email: row.email,
        usuario: row.usuario,
        contrasena: row.contrasena,
      }
    case 'habitos':
      return {
        ...base,
        fecha: formatDate(row.fecha),
        habito: row.habito,
        completado: Boolean(row.completado),
      }
    case 'compras':
      return {
        ...base,
        categoria: row.categoria,
        articulo: row.articulo,
        cantidad: row.cantidad,
      }
    case 'hobbies':
      return { ...base, actividad: row.actividad, notas: row.notas }
    default:
      return base
  }
}

async function fetchRegistros(categoria, limit = 50) {
  let rows
  switch (categoria) {
    case 'pagos':
      rows = await sql`SELECT * FROM pagos ORDER BY id DESC LIMIT ${limit}`
      break
    case 'visa':
      rows = await sql`SELECT * FROM visa ORDER BY id DESC LIMIT ${limit}`
      break
    case 'vencimientos':
      rows = await sql`SELECT * FROM vencimientos ORDER BY id DESC LIMIT ${limit}`
      break
    case 'limpieza':
      rows = await sql`SELECT * FROM limpieza ORDER BY id DESC LIMIT ${limit}`
      break
    case 'salud':
      rows = await sql`SELECT * FROM salud ORDER BY id DESC LIMIT ${limit}`
      break
    case 'ideas':
      rows = await sql`SELECT * FROM ideas ORDER BY id DESC LIMIT ${limit}`
      break
    case 'contrasenas':
      rows = await sql`SELECT * FROM contrasenas ORDER BY id DESC LIMIT ${limit}`
      break
    case 'habitos':
      rows = await sql`SELECT * FROM habitos ORDER BY id DESC LIMIT ${limit}`
      break
    case 'compras':
      rows = await sql`SELECT * FROM compras ORDER BY id DESC LIMIT ${limit}`
      break
    case 'hobbies':
      rows = await sql`SELECT * FROM hobbies ORDER BY id DESC LIMIT ${limit}`
      break
    default:
      return null
  }
  return rows.map((r) => formatRow(categoria, r))
}

/** Convierte el payload del frontend en filas listas para INSERT. */
function toRows(categoria, d) {
  switch (categoria) {
    case 'pagos':
      return [{ fecha: d.fecha || null, concepto: d.concepto, monto: d.monto ?? null }]

    case 'visa':
      return [{
        fecha_cierre: d.fechaCierre || null,
        fecha_vencimiento: d.fechaVencimiento || null,
        saldo_pesos: d.saldoPesos ?? null,
        saldo_dolares: d.saldoDolares ?? null,
        pago_minimo: d.pagoMinimo ?? null,
        observaciones: d.observaciones || null,
      }]

    case 'vencimientos':
      return [{
        servicio: d.servicio,
        fecha_vencimiento: d.fechaVencimiento || null,
        notas: d.notas || null,
      }]

    case 'limpieza':
      if (!d.tareas?.length) return []
      return d.tareas.map((t) => ({
        tarea: t.texto,
        completada: Boolean(t.hecho),
      }))

    case 'salud':
      return [{
        fecha: d.fecha || null,
        especialidad: d.especialidad || null,
        profesional: d.profesional || null,
        notas: d.notas || null,
      }]

    case 'ideas':
      return [{
        titulo: d.titulo,
        enlaces: d.enlaces || null,
        notas: d.notas || null,
      }]

    case 'contrasenas':
      return [{
        web_app: d.webApp,
        email: d.email || null,
        usuario: d.usuario || null,
        contrasena: d.contrasena || null,
      }]

    case 'habitos':
      if (!d.habitos?.length) return []
      return d.habitos.map((h) => ({
        fecha: d.fecha || null,
        habito: h.habito,
        completado: Boolean(h.completado),
      }))

    case 'compras': {
      if (!d.items?.length) return []
      const categoriaCompra = d.rubro || d.categoriaCompra || d.categoria || null
      return d.items.map((it) => ({
        categoria: categoriaCompra,
        articulo: it.articulo,
        cantidad: it.cantidad || null,
      }))
    }

    case 'hobbies':
      return [{
        actividad: d.actividad,
        notas: d.notas || null,
      }]

    default:
      return null
  }
}

async function insertRows(categoria, rows) {
  for (const row of rows) {
    switch (categoria) {
      case 'pagos':
        await sql`INSERT INTO pagos (fecha, concepto, monto) VALUES (${row.fecha}, ${row.concepto}, ${row.monto})`
        break
      case 'visa':
        await sql`INSERT INTO visa (fecha_cierre, fecha_vencimiento, saldo_pesos, saldo_dolares, pago_minimo, observaciones)
                  VALUES (${row.fecha_cierre}, ${row.fecha_vencimiento}, ${row.saldo_pesos}, ${row.saldo_dolares}, ${row.pago_minimo}, ${row.observaciones})`
        break
      case 'vencimientos':
        await sql`INSERT INTO vencimientos (servicio, fecha_vencimiento, notas)
                  VALUES (${row.servicio}, ${row.fecha_vencimiento}, ${row.notas})`
        break
      case 'limpieza':
        await sql`INSERT INTO limpieza (tarea, completada) VALUES (${row.tarea}, ${row.completada})`
        break
      case 'salud':
        await sql`INSERT INTO salud (fecha, especialidad, profesional, notas)
                  VALUES (${row.fecha}, ${row.especialidad}, ${row.profesional}, ${row.notas})`
        break
      case 'ideas':
        await sql`INSERT INTO ideas (titulo, enlaces, notas) VALUES (${row.titulo}, ${row.enlaces}, ${row.notas})`
        break
      case 'contrasenas':
        await sql`INSERT INTO contrasenas (web_app, email, usuario, contrasena)
                  VALUES (${row.web_app}, ${row.email}, ${row.usuario}, ${row.contrasena})`
        break
      case 'habitos':
        await sql`INSERT INTO habitos (fecha, habito, completado) VALUES (${row.fecha}, ${row.habito}, ${row.completado})`
        break
      case 'compras':
        await sql`INSERT INTO compras (categoria, articulo, cantidad) VALUES (${row.categoria}, ${row.articulo}, ${row.cantidad})`
        break
      case 'hobbies':
        await sql`INSERT INTO hobbies (actividad, notas) VALUES (${row.actividad}, ${row.notas})`
        break
      default:
        throw new Error(`Categoría desconocida: ${categoria}`)
    }
  }
}

app.get('/', async (req, res) => {
  try {
    assertSecret(secretFromRequest(req))
    const rows = await sql`
      SELECT servicio, fecha_vencimiento
      FROM vencimientos
      WHERE servicio IS NOT NULL
      ORDER BY id DESC
    `
    const vencimientos = rows.map((r) => ({
      servicio: String(r.servicio || '').trim(),
      fechaVencimiento: formatDate(r.fecha_vencimiento),
    }))
    res.json({ ok: true, vencimientos })
  } catch (err) {
    console.error('GET /', err.message)
    res.status(err.status || 500).json({
      ok: false,
      error: err.message,
      vencimientos: [],
    })
  }
})

app.get('/registros/:categoria', async (req, res) => {
  try {
    assertSecret(secretFromRequest(req))
    const { categoria } = req.params
    if (!CATEGORIAS.has(categoria)) {
      return res.status(400).json({ ok: false, message: `Categoría desconocida: ${categoria}` })
    }
    const registros = await fetchRegistros(categoria)
    res.json({ ok: true, categoria, registros, total: registros.length })
  } catch (err) {
    console.error('GET /registros', err.message)
    res.status(err.status || 500).json({ ok: false, message: err.message, registros: [] })
  }
})

app.post('/', async (req, res) => {
  try {
    const data = parseBody(req)
    assertSecret(secretFromRequest(req, data))

    const { categoria } = data
    if (!categoria) throw Object.assign(new Error('Falta el campo "categoria"'), { status: 400 })

    const campos = { ...data }
    delete campos.categoria
    delete campos.timestamp
    delete campos.sharedSecret

    const rows = toRows(categoria, campos)
    if (rows === null) {
      throw Object.assign(new Error(`Categoría desconocida: "${categoria}"`), { status: 400 })
    }
    if (!rows.length) {
      throw Object.assign(new Error('No hay datos para guardar'), { status: 400 })
    }

    await insertRows(categoria, rows)
    res.json({ ok: true, message: 'Guardado correctamente', filas: rows.length })
  } catch (err) {
    console.error('POST /', err.message)
    res.status(err.status || 500).json({ ok: false, message: err.message })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Vero escuchando en puerto ${PORT}`)
})
