/**
 * ─────────────────────────────────────────────────────────────────
 *  CONFIGURACIÓN DEL BACKEND
 * ─────────────────────────────────────────────────────────────────
 *  VITE_BACKEND_URL → URL de la API (ej. http://localhost:3001)
 *  VITE_SHARED_SECRET → debe coincidir con SHARED_SECRET del server
 *
 *  Nunca pongas DATABASE_URL en variables VITE_.
 * ─────────────────────────────────────────────────────────────────
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.trim()
const SHARED_SECRET = import.meta.env.VITE_SHARED_SECRET

if (!BACKEND_URL) {
  console.warn(
    '[api] VITE_BACKEND_URL no está configurada. ' +
    'Copiá .env.example a .env y completá la URL de tu API.'
  )
}

function authHeaders(extra = {}) {
  return {
    ...extra,
    ...(SHARED_SECRET ? { 'X-Shared-Secret': SHARED_SECRET } : {}),
  }
}

async function leerJson(response) {
  const rawBody = await response.text()
  const bodyPreview = rawBody?.slice(0, 240) || '(vacía)'

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      'La API rechazó la petición (401/403). ' +
      'Revisá que VITE_SHARED_SECRET coincida con SHARED_SECRET del servidor.'
    )
  }

  if (!response.ok) {
    throw new Error(
      `Error HTTP ${response.status} ${response.statusText}. ` +
      `Respuesta del servidor: ${bodyPreview}`
    )
  }

  if (!rawBody) return {}

  try {
    return JSON.parse(rawBody)
  } catch {
    throw new Error(
      `La respuesta del backend no es JSON válido. Respuesta recibida: ${bodyPreview}`
    )
  }
}

/**
 * Envía datos al backend (Neon vía API Express).
 */
export async function enviarDatos(categoria, datos) {
  if (!BACKEND_URL) {
    throw new Error('Backend no configurado. Revisá el archivo .env.')
  }

  const payload = {
    categoria,
    timestamp: new Date().toISOString(),
    sharedSecret: SHARED_SECRET,
    ...datos,
  }

  let response
  try {
    response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error(
      'Error de red al contactar el backend. ' +
      'Verificá que la API esté corriendo y VITE_BACKEND_URL sea correcta.'
    )
  }

  const result = await leerJson(response)
  if (result && result.ok === false) {
    throw new Error(result.message || 'El backend indicó un error al guardar.')
  }
  return result
}

/**
 * Lista registros de una categoría desde Neon.
 */
export async function listarRegistros(categoria) {
  if (!BACKEND_URL) {
    throw new Error('Backend no configurado. Revisá el archivo .env.')
  }

  let response
  try {
    response = await fetch(`${BACKEND_URL}/registros/${encodeURIComponent(categoria)}`, {
      method: 'GET',
      headers: authHeaders(),
    })
  } catch {
    throw new Error(
      'Error de red al listar registros. Verificá que la API esté corriendo.'
    )
  }

  const result = await leerJson(response)
  if (result && result.ok === false) {
    throw new Error(result.message || 'No se pudieron cargar los registros.')
  }
  return result.registros || []
}

/**
 * Vencimientos para el banner de alertas.
 */
export async function listarVencimientos() {
  if (!BACKEND_URL) return []

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'GET',
      headers: authHeaders(),
    })
    const result = await leerJson(response)
    return result.vencimientos || []
  } catch (err) {
    console.warn('[vencimientos] No se pudo obtener la lista:', err.message)
    return []
  }
}
