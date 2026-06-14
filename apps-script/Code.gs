/**
 * ═══════════════════════════════════════════════════════════════════
 *  MI ESPACIO PERSONAL — Backend Google Apps Script
 * ═══════════════════════════════════════════════════════════════════
 *
 *  CONFIGURACIÓN INICIAL (hacer una sola vez):
 *  1. Abrí este script en script.google.com
 *  2. Menú → Proyecto → Propiedades del script → Propiedades de secuencia
 *  3. Agregá la propiedad:  SPREADSHEET_ID  =  <ID de tu Google Sheet>
 *     (el ID está en la URL de la hoja: /spreadsheets/d/ID_AQUI/edit)
 *  4. Guardá y deployá como Web App (ver README.md para detalles)
 *
 * ═══════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
//  REGISTRO DE CATEGORÍAS
//  Para agregar una categoría nueva solo agregás una entrada aquí.
//  App.jsx y api.js no requieren cambios en el backend.
// ─────────────────────────────────────────────────────────────────

var SHEET_CONFIG = {

  pagos: {
    nombre:  '💳 Pagos',
    headers: ['Timestamp', 'Fecha', 'Concepto', 'Monto ($)'],
    // Retorna un array de filas. Simple = una sola fila.
    toRows: function(ts, d) {
      return [[ ts, d.fecha, d.concepto, d.monto ]]
    }
  },

  visa: {
    nombre:  '🏷️ VISA',
    headers: ['Timestamp', 'Fecha Cierre', 'Fecha Vencimiento', 'Saldo ($)', 'Saldo (u$s)', 'Pago Mínimo ($)', 'Observaciones'],
    toRows: function(ts, d) {
      return [[ ts, d.fechaCierre, d.fechaVencimiento, d.saldoPesos, d.saldoDolares, d.pagoMinimo, d.observaciones ]]
    }
  },

  vencimientos: {
    nombre:  '📅 Vencimientos',
    headers: ['Timestamp', 'Servicio', 'Fecha Vencimiento', 'Notas'],
    toRows: function(ts, d) {
      return [[ ts, d.servicio, d.fechaVencimiento, d.notas ]]
    }
  },

  limpieza: {
    nombre:  '🧹 Limpieza',
    headers: ['Timestamp', 'Tarea', 'Completada'],
    // Una tarea por fila
    toRows: function(ts, d) {
      if (!d.tareas || !d.tareas.length) return []
      return d.tareas.map(function(t) {
        return [ ts, t.texto, t.hecho ? 'Sí' : 'No' ]
      })
    }
  },

  salud: {
    nombre:  '🩺 Salud',
    headers: ['Timestamp', 'Fecha Consulta', 'Especialidad', 'Profesional', 'Notas'],
    toRows: function(ts, d) {
      return [[ ts, d.fecha, d.especialidad, d.profesional, d.notas ]]
    }
  },

  ideas: {
    nombre:  '💡 Ideas y Proyectos',
    headers: ['Timestamp', 'Título', 'Enlaces', 'Notas'],
    toRows: function(ts, d) {
      return [[ ts, d.titulo, d.enlaces, d.notas ]]
    }
  },

  contrasenas: {
    nombre:  '🔑 Contraseñas',
    headers: ['Timestamp', 'Web / App', 'Email', 'Usuario', 'Contraseña'],
    toRows: function(ts, d) {
      return [[ ts, d.webApp, d.email, d.usuario, d.contrasena ]]
    }
  },

  habitos: {
    nombre:  '✨ Hábitos',
    headers: ['Timestamp', 'Fecha', 'Hábito', 'Completado'],
    // Un hábito por fila para facilitar el análisis de tendencias
    toRows: function(ts, d) {
      if (!d.habitos || !d.habitos.length) return []
      return d.habitos.map(function(h) {
        return [ ts, d.fecha, h.habito, h.completado ? 'Sí' : 'No' ]
      })
    }
  },

  compras: {
    nombre:  '🛒 Compras',
    headers: ['Timestamp', 'Categoría', 'Artículo', 'Cantidad'],
    // Un artículo por fila
    toRows: function(ts, d) {
      if (!d.items || !d.items.length) return []
      return d.items.map(function(it) {
        return [ ts, d.categoria, it.articulo, it.cantidad ]
      })
    }
  },

  hobbies: {
    nombre:  '🌿 Hobbies',
    headers: ['Timestamp', 'Actividad', 'Notas'],
    toRows: function(ts, d) {
      return [[ ts, d.actividad, d.notas ]]
    }
  }

}


// ─────────────────────────────────────────────────────────────────
//  PUNTO DE ENTRADA — recibe el POST del frontend
// ─────────────────────────────────────────────────────────────────

function doGet() {
  return respuestaJSON({
    ok: true,
    message: 'Web App activa',
    timestamp: new Date().toISOString(),
  })
}

function doPost(e) {
  try {
    var raw = e.postData.contents
    if (!raw) throw new Error('Body vacío')

    var data = JSON.parse(raw)
    var secretRecibido = data.sharedSecret
    var secretEsperado = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET')

    if (!secretRecibido || !secretEsperado || secretRecibido !== secretEsperado) {
      return respuestaJSON({ ok: false, error: 'Acceso denegado' })
    }

    var categoria = data.categoria
    var timestamp = data.timestamp || new Date().toISOString()

    // Elimina los campos de control del payload de datos
    var campos = {}
    for (var key in data) {
      if (key !== 'categoria' && key !== 'timestamp' && key !== 'sharedSecret') {
        campos[key] = data[key]
      }
    }

    if (!categoria) throw new Error('Falta el campo "categoria"')

    var config = SHEET_CONFIG[categoria]
    if (!config) throw new Error('Categoría desconocida: "' + categoria + '"')

    var filas = config.toRows(timestamp, campos)
    if (!filas || filas.length === 0) throw new Error('No hay datos para guardar')

    var hoja = obtenerOCrearHoja(config.nombre, config.headers)
    agregarFilas(hoja, filas)

    return respuestaJSON({ ok: true, message: 'Guardado correctamente', filas: filas.length })

  } catch (err) {
    Logger.log('ERROR doPost: ' + err.message)
    return respuestaJSON({ ok: false, message: err.message })
  }
}


// ─────────────────────────────────────────────────────────────────
//  UTILIDADES
// ─────────────────────────────────────────────────────────────────

/**
 * Obtiene la hoja con el nombre dado, o la crea si no existe.
 * Si es nueva, agrega la fila de encabezados y le da formato.
 */
function obtenerOCrearHoja(nombre, headers) {
  var ss = obtenerSpreadsheet()
  var hoja = ss.getSheetByName(nombre)

  if (!hoja) {
    hoja = ss.insertSheet(nombre)
    hoja.appendRow(headers)
    formatearEncabezados(hoja, headers.length)
  }

  return hoja
}

/**
 * Agrega un array de filas al final de la hoja.
 */
function agregarFilas(hoja, filas) {
  filas.forEach(function(fila) {
    hoja.appendRow(fila)
  })
}

/**
 * Obtiene la Spreadsheet configurada vía Script Properties.
 * Fallback: busca la primera spreadsheet abierta (útil en desarrollo).
 */
function obtenerSpreadsheet() {
  var props = PropertiesService.getScriptProperties()
  var id = props.getProperty('SPREADSHEET_ID')

  if (id) {
    return SpreadsheetApp.openById(id)
  }

  // Fallback para desarrollo: usa el spreadsheet activo si el script
  // está vinculado directamente a una hoja.
  var activo = SpreadsheetApp.getActiveSpreadsheet()
  if (activo) return activo

  throw new Error(
    'No está configurado SPREADSHEET_ID. ' +
    'Agregalo en Proyecto → Propiedades de secuencia de comandos.'
  )
}

/**
 * Da formato visual a la fila de encabezados:
 * fondo lila suave, texto en negrita, fila congelada.
 */
function formatearEncabezados(hoja, cantColumnas) {
  var rango = hoja.getRange(1, 1, 1, cantColumnas)
  rango.setBackground('#E6E6FA')       // lila suave
  rango.setFontWeight('bold')
  rango.setFontSize(10)
  hoja.setFrozenRows(1)
  hoja.autoResizeColumns(1, cantColumnas)
}

/**
 * Devuelve una respuesta JSON con los headers CORS necesarios.
 */
function respuestaJSON(objeto) {
  var json = JSON.stringify(objeto)
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON)
}


// ─────────────────────────────────────────────────────────────────
//  FUNCIÓN DE PRUEBA MANUAL
//  Ejecutala desde el editor de Apps Script para verificar
//  que la conexión con Google Sheets funciona correctamente.
// ─────────────────────────────────────────────────────────────────

function testManual() {
  var evento = {
    postData: {
      contents: JSON.stringify({
        categoria:  'pagos',
        timestamp:  new Date().toISOString(),
        fecha:      '2026-06-13',
        concepto:   'AYSA',
        monto:      '5200'
      })
    }
  }
  var resultado = doPost(evento)
  Logger.log(resultado.getContent())
}
