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
  'actividadFisica',
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
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
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
      return {
        ...base,
        tarea: row.tarea,
        completada: Boolean(row.completada),
        notas: row.notas,
      }
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
      return {
        ...base,
        fecha: formatDate(row.fecha),
        actividad: row.actividad,
        notas: row.notas,
      }
    case 'actividadFisica':
      return {
        ...base,
        fecha: formatDate(row.fecha),
        actividades: row.actividades,
      }
    default:
      return base
  }
}

async function fetchRegistros(categoria, limit = 200) {
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
    case 'actividadFisica':
      rows = await sql`SELECT * FROM actividad_fisica ORDER BY id DESC LIMIT ${limit}`
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
        notas: d.notas || null,
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
        fecha: d.fecha || null,
        actividad: d.actividad,
        notas: d.notas || null,
      }]

    case 'actividadFisica': {
      const lista = d.actividades || []
      if (!lista.length) return []
      return [{
        fecha: d.fecha || null,
        actividades: lista.join(','),
      }]
    }

    default:
      return null
  }
}

/** Convierte un PATCH del panel de historial (camelCase) a columnas DB. */
function patchToDbRow(categoria, d) {
  switch (categoria) {
    case 'pagos':
      return { fecha: d.fecha || null, concepto: d.concepto, monto: d.monto ?? null }
    case 'visa':
      return {
        fecha_cierre: d.fechaCierre || null,
        fecha_vencimiento: d.fechaVencimiento || null,
        saldo_pesos: d.saldoPesos ?? null,
        saldo_dolares: d.saldoDolares ?? null,
        pago_minimo: d.pagoMinimo ?? null,
        observaciones: d.observaciones || null,
      }
    case 'vencimientos':
      return {
        servicio: d.servicio,
        fecha_vencimiento: d.fechaVencimiento || null,
        notas: d.notas || null,
      }
    case 'limpieza':
      return {
        tarea: d.tarea,
        completada: Boolean(d.completada),
        notas: d.notas || null,
      }
    case 'salud':
      return {
        fecha: d.fecha || null,
        especialidad: d.especialidad || null,
        profesional: d.profesional || null,
        notas: d.notas || null,
      }
    case 'ideas':
      return { titulo: d.titulo, enlaces: d.enlaces || null, notas: d.notas || null }
    case 'contrasenas':
      return {
        web_app: d.webApp,
        email: d.email || null,
        usuario: d.usuario || null,
        contrasena: d.contrasena || null,
      }
    case 'habitos':
      return {
        fecha: d.fecha || null,
        habito: d.habito,
        completado: Boolean(d.completado),
      }
    case 'compras':
      return {
        categoria: d.categoria || null,
        articulo: d.articulo,
        cantidad: d.cantidad || null,
      }
    case 'hobbies':
      return {
        fecha: d.fecha || null,
        actividad: d.actividad,
        notas: d.notas || null,
      }
    case 'actividadFisica':
      return {
        fecha: d.fecha || null,
        actividades: String(d.actividades ?? '').trim(),
      }
    default:
      return null
  }
}

async function updateRow(categoria, id, row) {
  const idNum = Number(id)
  switch (categoria) {
    case 'pagos':
      await sql`UPDATE pagos SET fecha = ${row.fecha}, concepto = ${row.concepto}, monto = ${row.monto} WHERE id = ${idNum}`
      break
    case 'visa':
      await sql`UPDATE visa SET fecha_cierre = ${row.fecha_cierre}, fecha_vencimiento = ${row.fecha_vencimiento},
                saldo_pesos = ${row.saldo_pesos}, saldo_dolares = ${row.saldo_dolares},
                pago_minimo = ${row.pago_minimo}, observaciones = ${row.observaciones} WHERE id = ${idNum}`
      break
    case 'vencimientos':
      await sql`UPDATE vencimientos SET servicio = ${row.servicio}, fecha_vencimiento = ${row.fecha_vencimiento}, notas = ${row.notas} WHERE id = ${idNum}`
      break
    case 'limpieza':
      await sql`UPDATE limpieza SET tarea = ${row.tarea}, completada = ${row.completada}, notas = ${row.notas} WHERE id = ${idNum}`
      break
    case 'salud':
      await sql`UPDATE salud SET fecha = ${row.fecha}, especialidad = ${row.especialidad}, profesional = ${row.profesional}, notas = ${row.notas} WHERE id = ${idNum}`
      break
    case 'ideas':
      await sql`UPDATE ideas SET titulo = ${row.titulo}, enlaces = ${row.enlaces}, notas = ${row.notas} WHERE id = ${idNum}`
      break
    case 'contrasenas':
      await sql`UPDATE contrasenas SET web_app = ${row.web_app}, email = ${row.email}, usuario = ${row.usuario}, contrasena = ${row.contrasena} WHERE id = ${idNum}`
      break
    case 'habitos':
      await sql`UPDATE habitos SET fecha = ${row.fecha}, habito = ${row.habito}, completado = ${row.completado} WHERE id = ${idNum}`
      break
    case 'compras':
      await sql`UPDATE compras SET categoria = ${row.categoria}, articulo = ${row.articulo}, cantidad = ${row.cantidad} WHERE id = ${idNum}`
      break
    case 'hobbies':
      await sql`UPDATE hobbies SET fecha = ${row.fecha}, actividad = ${row.actividad}, notas = ${row.notas} WHERE id = ${idNum}`
      break
    case 'actividadFisica':
      await sql`UPDATE actividad_fisica SET fecha = ${row.fecha}, actividades = ${row.actividades} WHERE id = ${idNum}`
      break
    default:
      throw new Error(`Categoría desconocida: ${categoria}`)
  }
}

async function deleteRow(categoria, id) {
  const idNum = Number(id)
  switch (categoria) {
    case 'pagos':
      await sql`DELETE FROM pagos WHERE id = ${idNum}`
      break
    case 'visa':
      await sql`DELETE FROM visa WHERE id = ${idNum}`
      break
    case 'vencimientos':
      await sql`DELETE FROM vencimientos WHERE id = ${idNum}`
      break
    case 'limpieza':
      await sql`DELETE FROM limpieza WHERE id = ${idNum}`
      break
    case 'salud':
      await sql`DELETE FROM salud WHERE id = ${idNum}`
      break
    case 'ideas':
      await sql`DELETE FROM ideas WHERE id = ${idNum}`
      break
    case 'contrasenas':
      await sql`DELETE FROM contrasenas WHERE id = ${idNum}`
      break
    case 'habitos':
      await sql`DELETE FROM habitos WHERE id = ${idNum}`
      break
    case 'compras':
      await sql`DELETE FROM compras WHERE id = ${idNum}`
      break
    case 'hobbies':
      await sql`DELETE FROM hobbies WHERE id = ${idNum}`
      break
    case 'actividadFisica':
      await sql`DELETE FROM actividad_fisica WHERE id = ${idNum}`
      break
    default:
      throw new Error(`Categoría desconocida: ${categoria}`)
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
        await sql`INSERT INTO limpieza (tarea, completada, notas) VALUES (${row.tarea}, ${row.completada}, ${row.notas})`
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
        await sql`INSERT INTO hobbies (fecha, actividad, notas) VALUES (${row.fecha}, ${row.actividad}, ${row.notas})`
        break
      case 'actividadFisica':
        await sql`INSERT INTO actividad_fisica (fecha, actividades) VALUES (${row.fecha}, ${row.actividades})`
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

app.patch('/registros/:categoria/:id', async (req, res) => {
  try {
    const data = parseBody(req)
    assertSecret(secretFromRequest(req, data))

    const { categoria, id } = req.params
    if (!CATEGORIAS.has(categoria)) {
      return res.status(400).json({ ok: false, message: `Categoría desconocida: ${categoria}` })
    }

    const campos = { ...data }
    delete campos.sharedSecret

    const row = patchToDbRow(categoria, campos)
    if (!row) {
      return res.status(400).json({ ok: false, message: 'No se pudo interpretar los datos' })
    }

    await updateRow(categoria, id, row)
    res.json({ ok: true, message: 'Actualizado correctamente' })
  } catch (err) {
    console.error('PATCH /registros', err.message)
    res.status(err.status || 500).json({ ok: false, message: err.message })
  }
})

app.delete('/registros/:categoria/:id', async (req, res) => {
  try {
    assertSecret(secretFromRequest(req))

    const { categoria, id } = req.params
    if (!CATEGORIAS.has(categoria)) {
      return res.status(400).json({ ok: false, message: `Categoría desconocida: ${categoria}` })
    }

    await deleteRow(categoria, id)
    res.json({ ok: true, message: 'Eliminado correctamente' })
  } catch (err) {
    console.error('DELETE /registros', err.message)
    res.status(err.status || 500).json({ ok: false, message: err.message })
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

