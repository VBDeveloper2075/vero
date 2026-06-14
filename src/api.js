/**
 * ─────────────────────────────────────────────────────────────────
 *  CONFIGURACIÓN DEL BACKEND
 * ─────────────────────────────────────────────────────────────────
 *  La URL del Web App de Google Apps Script se lee desde la variable
 *  de entorno VITE_BACKEND_URL definida en el archivo .env (local)
 *  o en la configuración del hosting (Netlify / Vercel).
 *
 *  IMPORTANTE sobre seguridad:
 *  • Las variables con prefijo VITE_ quedan embebidas en el bundle
 *    público — NO pongas tokens, contraseñas ni claves privadas aquí.
 *  • La URL de un Web App de Apps Script es un endpoint público por
 *    diseño: no es un secreto y es seguro exponerla.
 *  • Si en el futuro necesitás proteger el endpoint, agregá un
 *    "shared secret" en el BODY del payload (no como query param),
 *    y verificalo dentro del Apps Script.
 * ─────────────────────────────────────────────────────────────────
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.trim()

if (!BACKEND_URL) {
  console.warn(
    '[api] VITE_BACKEND_URL no está configurada. ' +
    'Copiá .env.example a .env y completá la URL de tu Apps Script.'
  )
}

/**
 * Envía datos al backend serverless (Google Apps Script).
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
    ...datos,
  }

  let response
  try {
    // Google Apps Script suele funcionar mejor con text/plain para evitar
    // preflight OPTIONS en navegadores.
    response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error(
      'Error de red al contactar el backend. ' +
      'Verificá CORS, conectividad y que la Web App esté publicada.'
    )
  }

  const rawBody = await response.text()
  const bodyPreview = rawBody?.slice(0, 240) || '(vacía)'

  // Errores frecuentes de Apps Script mal desplegado/permisos.
  if (response.status === 401 || response.status === 403) {
    throw new Error(
      'Apps Script rechazó la petición (401/403). ' +
      'Re-deployá como Web App con acceso "Cualquier persona" y usá la URL /exec.'
    )
  }

  if (!response.ok) {
    throw new Error(
      `Error HTTP ${response.status} ${response.statusText}. ` +
      `Respuesta del servidor: ${bodyPreview}`
    )
  }

  if (!rawBody) {
    return { ok: true, message: 'Guardado sin cuerpo de respuesta.' }
  }

  // Si Apps Script devuelve HTML, suele ser URL incorrecta o falta de permisos.
  if (rawBody.includes('<!DOCTYPE html') || rawBody.includes('<html')) {
    throw new Error(
      'El backend devolvió HTML en vez de JSON. ' +
      'Usá la URL de Web App (/exec) y verificá permisos públicos.'
    )
  }

  let result
  try {
    result = JSON.parse(rawBody)
  } catch {
    throw new Error(
      `La respuesta del backend no es JSON válido. Respuesta recibida: ${bodyPreview}`
    )
  }

  // Apps Script puede responder 200 con { ok: false } en errores de negocio.
  if (result && result.ok === false) {
    throw new Error(result.message || 'El backend indicó un error al guardar.')
  }

  return result
}
