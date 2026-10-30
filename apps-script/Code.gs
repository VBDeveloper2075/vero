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

// Conceptos = columnas del cuadro de doble entrada (Presupuesto YYYY)
var PAGOS_CONCEPTOS = [
  'GARAGE',
  'AYSA',
  'GAS',
  'Muni3F',
  'Muni patente',
  'Celu (pers)',
  'Agip nuñez',
  'copilot',
  'GitHub',
  'Gemini One',
  'Sitas Cuota',
  'Sitas locker'
]

var MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

// Abreviaturas de mes para la matriz de actividad fisica (columnas)
var MESES_ABREV = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

// Orden estable al fusionar codigos en una misma celda
var CODIGOS_EJERCICIO = ['C', 'g', 'nat', 'str', 'y']

var SHEET_CONFIG = {

  pagos: {
    nombre:  '💳 Pagos',
    headers: ['Timestamp', 'Fecha', 'Concepto', 'Monto ($)'],
    // Retorna un array de filas. Simple = una sola fila.
    toRows: function(ts, d) {
      return [[ ts, d.fecha, d.concepto, d.monto ]]
    },
    // Además del log, suma el monto en la matriz mes × concepto
    afterSave: function(ts, d) {
      actualizarMatrizPresupuesto(d)
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
    headers: ['Timestamp', 'Tarea', 'Completada', 'Notas'],
    // Una tarea por fila
    toRows: function(ts, d) {
      if (!d.tareas || !d.tareas.length) return []
      return d.tareas.map(function(t) {
        return [ ts, t.texto, t.hecho ? 'Sí' : 'No', d.notas || '' ]
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

  actividadFisica: {
    nombre:  '🏃 Actividad Física',
    headers: ['Timestamp', 'Fecha', 'Actividades'],
    toRows: function(ts, d) {
      var codigos = d.actividades || []
      return [[ ts, d.fecha, codigos.join(' ') ]]
    },
    afterSave: function(ts, d) {
      actualizarMatrizEjercicios(d)
    }
  },

  compras: {
    nombre:  '🛒 Compras',
    headers: ['Timestamp', 'Categoría', 'Artículo', 'Cantidad'],
    // Un artículo por fila
    toRows: function(ts, d) {
      if (!d.items || !d.items.length) return []
      return d.items.map(function(it) {
        var categoriaCompra = d.rubro || d.categoriaCompra || d.categoria
        return [ ts, categoriaCompra, it.articulo, it.cantidad ]
      })
    }
  },

  hobbies: {
    nombre:  '🌿 Hobbies',
    headers: ['Timestamp', 'Actividad', 'Notas'],
    toRows: function(ts, d) {
      var actividad = ''
      if (d.hobbies && d.hobbies.length) {
        actividad = d.hobbies.join(' | ')
      } else {
        actividad = d.actividad || ''
      }
      return [[ ts, actividad, d.notas || '' ]]
    },
    afterSave: function(ts, d) {
      actualizarMatrizHobbies(d)
    }
  }

}


// ─────────────────────────────────────────────────────────────────
//  PUNTO DE ENTRADA — recibe el POST del frontend
// ─────────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    var config = SHEET_CONFIG.vencimientos
    var ss = obtenerSpreadsheet()
    var hoja = ss.getSheetByName(config.nombre)

    if (!hoja) {
      return respuestaJSON({ ok: true, vencimientos: [] })
    }

    var ultimaFila = hoja.getLastRow()
    if (ultimaFila < 2) {
      return respuestaJSON({ ok: true, vencimientos: [] })
    }

    // Columnas: Timestamp(1), Servicio(2), Fecha Vencimiento(3), Notas(4)
    var filas = hoja.getRange(2, 1, ultimaFila, 4).getValues()
    var vencimientos = []

    for (var i = 0; i < filas.length; i++) {
      var servicio = filas[i][1]
      var fechaRaw = filas[i][2]

      if (!servicio && !fechaRaw) continue

      vencimientos.push({
        servicio: String(servicio || '').trim(),
        fechaVencimiento: formatearFechaISO(fechaRaw),
      })
    }

    return respuestaJSON({ ok: true, vencimientos: vencimientos })

  } catch (err) {
    Logger.log('ERROR doGet: ' + err.message)
    return respuestaJSON({ ok: false, error: err.message, vencimientos: [] })
  }
}

/**
 * Convierte fechas de Sheets a string ISO (yyyy-MM-dd).
 */
function formatearFechaISO(valor) {
  if (!valor) return ''
  if (valor instanceof Date && !isNaN(valor.getTime())) {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), 'yyyy-MM-dd')
  }
  return String(valor).trim()
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

    if (typeof config.afterSave === 'function') {
      config.afterSave(timestamp, campos)
    }

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

// ─────────────────────────────────────────────────────────────────
//  MATRIZ PRESUPUESTO (mes × concepto)
// ─────────────────────────────────────────────────────────────────

function normalizarConcepto(texto) {
  return String(texto || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/**
 * Interpreta la fecha del formulario (yyyy-MM-dd) sin desfases por zona horaria.
 */
function parsearFechaPago(valor) {
  if (!valor) return null
  if (valor instanceof Date && !isNaN(valor.getTime())) return valor

  var s = String(valor).trim()
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }

  var d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function nombreHojaPresupuesto(anio) {
  return '📊 Presupuesto ' + anio
}

/**
 * Crea (si hace falta) la hoja de doble entrada del año:
 * fila 1 = año + conceptos + Total · filas 2–13 = meses.
 */
function obtenerOCrearMatrizPresupuesto(anio) {
  var ss = obtenerSpreadsheet()
  var nombre = nombreHojaPresupuesto(anio)
  var hoja = ss.getSheetByName(nombre)
  if (hoja) return hoja

  hoja = ss.insertSheet(nombre)
  var headers = [String(anio)].concat(PAGOS_CONCEPTOS).concat(['Total'])
  var nCols = headers.length

  hoja.getRange(1, 1, 1, nCols).setValues([headers])
  formatearEncabezados(hoja, nCols)

  for (var i = 0; i < MESES_ES.length; i++) {
    var row = i + 2
    hoja.getRange(row, 1).setValue(MESES_ES[i])
    // Total = suma de conceptos (columnas B … penúltima)
    hoja.getRange(row, nCols).setFormulaR1C1('=SUM(RC2:RC' + (nCols - 1) + ')')
  }

  hoja.getRange(2, 2, 13, nCols).setNumberFormat('#,##0.00')
  hoja.setFrozenColumns(1)
  hoja.autoResizeColumns(1, nCols)
  return hoja
}

/**
 * Suma el monto del pago en la celda [mes, concepto] de la matriz del año.
 * Si el concepto no existe como columna, lo inserta antes de Total.
 */
function actualizarMatrizPresupuesto(d) {
  var fecha = parsearFechaPago(d.fecha)
  if (!fecha) throw new Error('Fecha inválida para la matriz de presupuesto')

  var anio = fecha.getFullYear()
  var mesNombre = MESES_ES[fecha.getMonth()]
  var monto = Number(String(d.monto).replace(',', '.'))
  if (isNaN(monto)) monto = 0

  var hoja = obtenerOCrearMatrizPresupuesto(anio)
  var lastRow = Math.max(hoja.getLastRow(), 2)
  var lastCol = Math.max(hoja.getLastColumn(), 2)

  // Buscar fila del mes
  var labels = hoja.getRange(1, 1, lastRow, 1).getValues()
  var row = -1
  for (var i = 1; i < labels.length; i++) {
    if (String(labels[i][0]).trim().toLowerCase() === mesNombre) {
      row = i + 1
      break
    }
  }
  if (row < 0) throw new Error('No se encontró el mes "' + mesNombre + '" en la matriz')

  // Buscar columna del concepto (ignora "Total")
  var headers = hoja.getRange(1, 1, 1, lastCol).getValues()[0]
  var conceptoNorm = normalizarConcepto(d.concepto)
  var col = -1
  var totalCol = -1

  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c]).trim()
    if (h.toLowerCase() === 'total') {
      totalCol = c + 1
      continue
    }
    if (c === 0) continue // columna del año
    if (normalizarConcepto(h) === conceptoNorm) {
      col = c + 1
      break
    }
  }

  // Concepto nuevo → insertar columna antes de Total
  if (col < 0) {
    if (totalCol > 0) {
      hoja.insertColumnBefore(totalCol)
      col = totalCol
    } else {
      col = lastCol + 1
    }
    hoja.getRange(1, col).setValue(d.concepto)
    hoja.getRange(1, col).setFontWeight('bold').setBackground('#E6E6FA')
  }

  var cell = hoja.getRange(row, col)
  var actual = cell.getValue()
  var prev = typeof actual === 'number' ? actual : Number(actual) || 0
  cell.setValue(prev + monto)
  cell.setNumberFormat('#,##0.00')
}

// Matriz ejercicios: dia x mes

function nombreHojaEjercicios(anio) {
  return 'Ejercicios ' + anio
}

function diasEnMes(anio, mesIdx) {
  return new Date(anio, mesIdx + 1, 0).getDate()
}

// Crea la hoja anual si no existe (dias 1-31 x meses E..D)
function obtenerOCrearMatrizEjercicios(anio) {
  var ss = obtenerSpreadsheet()
  var nombre = nombreHojaEjercicios(anio)
  var hoja = ss.getSheetByName(nombre)
  if (hoja) return hoja

  hoja = ss.insertSheet(nombre)
  var headers = ['dia'].concat(MESES_ABREV)
  var nCols = headers.length

  hoja.getRange(1, 1, 1, nCols).setValues([headers])
  formatearEncabezados(hoja, nCols)

  var dia
  var row
  var m
  for (dia = 1; dia <= 31; dia++) {
    row = dia + 1
    hoja.getRange(row, 1).setValue(dia)
    for (m = 0; m < 12; m++) {
      if (dia > diasEnMes(anio, m)) {
        hoja.getRange(row, m + 2).setValue('--')
      }
    }
  }

  hoja.setFrozenColumns(1)
  hoja.autoResizeColumns(1, nCols)
  return hoja
}

// Une codigos nuevos con los existentes, sin duplicar
function fusionarCodigosEjercicio(existente, nuevos) {
  var vistos = {}
  var orden = []
  var i
  var c
  var partes
  var lista
  var ordenados

  function agregar(codigo) {
    c = String(codigo || '').trim()
    if (!c || c === '--') return
    if (vistos[c]) return
    vistos[c] = true
    orden.push(c)
  }

  partes = String(existente || '').split(/\s+/)
  for (i = 0; i < partes.length; i++) {
    agregar(partes[i])
  }

  lista = nuevos || []
  for (i = 0; i < lista.length; i++) {
    agregar(lista[i])
  }

  ordenados = []
  for (i = 0; i < CODIGOS_EJERCICIO.length; i++) {
    c = CODIGOS_EJERCICIO[i]
    if (vistos[c]) ordenados.push(c)
  }
  for (i = 0; i < orden.length; i++) {
    c = orden[i]
    if (CODIGOS_EJERCICIO.indexOf(c) < 0) ordenados.push(c)
  }
  return ordenados.join(' ')
}

// Suma (fusiona) las actividades del dia en la celda [dia, mes]
function actualizarMatrizEjercicios(d) {
  var fecha = parsearFechaPago(d.fecha)
  if (!fecha) throw new Error('Fecha invalida para la matriz de ejercicios')

  var anio = fecha.getFullYear()
  var mesIdx = fecha.getMonth()
  var dia = fecha.getDate()
  var actividades = d.actividades || []
  if (!actividades.length) throw new Error('No hay actividades para guardar')

  if (dia > diasEnMes(anio, mesIdx)) {
    throw new Error('Dia invalido para el mes seleccionado')
  }

  var hoja = obtenerOCrearMatrizEjercicios(anio)
  var row = dia + 1
  var col = mesIdx + 2

  var cell = hoja.getRange(row, col)
  var actual = cell.getValue()
  if (String(actual).trim() === '--') {
    throw new Error('Esa fecha no existe en el calendario')
  }

  cell.setValue(fusionarCodigosEjercicio(actual, actividades))
}

// Matriz hobbies: dia x mes (misma estructura que ejercicios)

function nombreHojaHobbies(anio) {
  return 'Hobbies ' + anio
}

function obtenerOCrearMatrizHobbies(anio) {
  var ss = obtenerSpreadsheet()
  var nombre = nombreHojaHobbies(anio)
  var hoja = ss.getSheetByName(nombre)
  if (hoja) return hoja

  hoja = ss.insertSheet(nombre)
  var headers = ['dia'].concat(MESES_ABREV)
  var nCols = headers.length

  hoja.getRange(1, 1, 1, nCols).setValues([headers])
  formatearEncabezados(hoja, nCols)

  var dia
  var row
  var m
  for (dia = 1; dia <= 31; dia++) {
    row = dia + 1
    hoja.getRange(row, 1).setValue(dia)
    for (m = 0; m < 12; m++) {
      if (dia > diasEnMes(anio, m)) {
        hoja.getRange(row, m + 2).setValue('--')
      }
    }
  }

  hoja.setFrozenColumns(1)
  hoja.autoResizeColumns(1, nCols)
  return hoja
}

// Une hobbies con separador " | " para permitir nombres con espacios
function fusionarHobbies(existente, nuevos) {
  var vistos = {}
  var orden = []
  var i
  var nombre
  var partes
  var lista

  function agregar(valor) {
    nombre = String(valor || '').trim()
    if (!nombre || nombre === '--') return
    if (vistos[nombre]) return
    vistos[nombre] = true
    orden.push(nombre)
  }

  partes = String(existente || '').split(/\s*\|\s*/)
  for (i = 0; i < partes.length; i++) {
    agregar(partes[i])
  }

  lista = nuevos || []
  for (i = 0; i < lista.length; i++) {
    agregar(lista[i])
  }

  return orden.join(' | ')
}

function actualizarMatrizHobbies(d) {
  var fecha = parsearFechaPago(d.fecha)
  if (!fecha) throw new Error('Fecha invalida para la matriz de hobbies')

  var anio = fecha.getFullYear()
  var mesIdx = fecha.getMonth()
  var dia = fecha.getDate()
  var lista = d.hobbies || []
  if (!lista.length && d.actividad) lista = [d.actividad]
  if (!lista.length) throw new Error('No hay hobbies para guardar')

  if (dia > diasEnMes(anio, mesIdx)) {
    throw new Error('Dia invalido para el mes seleccionado')
  }

  var hoja = obtenerOCrearMatrizHobbies(anio)
  var row = dia + 1
  var col = mesIdx + 2

  var cell = hoja.getRange(row, col)
  var actual = cell.getValue()
  if (String(actual).trim() === '--') {
    throw new Error('Esa fecha no existe en el calendario')
  }

  cell.setValue(fusionarHobbies(actual, lista))
}

// Respuesta JSON
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
