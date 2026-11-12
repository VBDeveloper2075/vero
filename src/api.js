/**
 * ─────────────────────────────────────────────────────────────────
 *  CONFIGURACIÓN DEL BACKEND
 * ─────────────────────────────────────────────────────────────────
 *  La URL de la API Express (Neon Postgres) se lee desde la variable
 *  de entorno VITE_BACKEND_URL definida en el archivo .env (local)
 *  o en la configuración del hosting (GitHub Pages / Render).
 *
 *  IMPORTANTE sobre seguridad:
 *  • Las variables con prefijo VITE_ quedan embebidas en el bundle
 *    público — NO pongas tokens, contraseñas ni claves privadas aquí.
 *  • El shared secret se envía en el BODY del payload para proteger
 *    el endpoint contra accesos no autorizados.
 * ─────────────────────────────────────────────────────────────────
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.trim()

if (!BACKEND_URL) {
  console.warn(
    '[api] VITE_BACKEND_URL no está configurada. ' +
    'Copiá .env.example a .env y completá la URL de tu API.'
  )
}

/**
 * Envía datos al backend Express + Neon Postgres.
 *
 * @param {string} categoria  - Clave de la categoría (ej: "pagos", "salud")
 * @param {object} datos      - Datos del formulario listos para guardar
 * @returns {Promise<object>} - Respuesta JSON del servidor
 * @throws {Error}            - Si el servidor responde con un status >= 400
 */
export async function enviarDatos(categoria, datos) {
  if (!BACKEND_URL) {
    throw new Error('Backend no configurado. Revisá el archivo .env.')
  }

  const payload = {
    categoria,
    timestamp: new Date().toISOString(),
    sharedSecret: import.meta.env.VITE_SHARED_SECRET,
    ...datos,
  }

  let response
  try {
    response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error(
      'Error de red al contactar el backend. ' +
      'Verificá que el servidor esté corriendo y la URL sea correcta.'
    )
  }

  const rawBody = await response.text()
  const bodyPreview = rawBody?.slice(0, 240) || '(vacía)'

  if (!response.ok) {
    throw new Error(
      `Error HTTP ${response.status} ${response.statusText}. ` +
      `Respuesta del servidor: ${bodyPreview}`
    )
  }

  if (!rawBody) {
    return { ok: true, message: 'Guardado sin cuerpo de respuesta.' }
  }

  let result
  try {
    result = JSON.parse(rawBody)
  } catch {
    throw new Error(
      `La respuesta del backend no es JSON válido. Respuesta recibida: ${bodyPreview}`
    )
  }

  if (result && result.ok === false) {
    throw new Error(result.message || 'El backend indicó un error al guardar.')
  }

  return result
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Shared-Secret': import.meta.env.VITE_SHARED_SECRET || '',
  }
}

async function parseApiResponse(response) {
  const rawBody = await response.text()
  const bodyPreview = rawBody?.slice(0, 240) || '(vacía)'

  if (!response.ok) {
    throw new Error(
      `Error HTTP ${response.status} ${response.statusText}. ` +
      `Respuesta del servidor: ${bodyPreview}`
    )
  }

  if (!rawBody) return { ok: true }

  let result
  try {
    result = JSON.parse(rawBody)
  } catch {
    throw new Error(`La respuesta del backend no es JSON válido. Respuesta recibida: ${bodyPreview}`)
  }

  if (result?.ok === false) {
    throw new Error(result.message || result.error || 'Error del backend')
  }

  return result
}

/** Lista registros guardados de una categoría (más recientes primero en el server). */
export async function listarRegistros(categoria) {
  if (!BACKEND_URL) throw new Error('Backend no configurado. Revisá el archivo .env.')

  const url = `${BACKEND_URL.replace(/\/$/, '')}/registros/${encodeURIComponent(categoria)}`
  let response
  try {
    response = await fetch(url, { method: 'GET', headers: authHeaders() })
  } catch {
    throw new Error('Error de red al cargar el historial.')
  }

  const data = await parseApiResponse(response)
  return data.registros || []
}

export async function actualizarRegistro(categoria, id, datos) {
  if (!BACKEND_URL) throw new Error('Backend no configurado.')

  const url = `${BACKEND_URL.replace(/\/$/, '')}/registros/${encodeURIComponent(categoria)}/${id}`
  const body = { ...datos, sharedSecret: import.meta.env.VITE_SHARED_SECRET }

  let response
  try {
    response = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Error de red al actualizar.')
  }

  return parseApiResponse(response)
}

export async function borrarRegistro(categoria, id) {
  if (!BACKEND_URL) throw new Error('Backend no configurado.')

  const url = `${BACKEND_URL.replace(/\/$/, '')}/registros/${encodeURIComponent(categoria)}/${id}`
  let response
  try {
    response = await fetch(url, { method: 'DELETE', headers: authHeaders() })
  } catch {
    throw new Error('Error de red al eliminar.')
  }

  return parseApiResponse(response)
}
