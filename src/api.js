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
