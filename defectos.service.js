const { query, insert, remove } = require('./db');
const incluidos = require('./incluidos.service');
const condiciones = require('./condiciones.service');

// --- Incluidos / no incluidos por defecto ---

function listarIncluidosDefecto() {
  return query('SELECT * FROM incluidos_defecto');
}

function agregarIncluidoDefecto(descripcion) {
  return insert('incluidos_defecto', { descripcion });
}

function eliminarIncluidoDefecto(id) {
  return remove('incluidos_defecto', 'id_incluido_defecto', id);
}

function listarNoIncluidosDefecto() {
  return query('SELECT * FROM no_incluidos_defecto');
}

function agregarNoIncluidoDefecto(descripcion) {
  return insert('no_incluidos_defecto', { descripcion });
}

function eliminarNoIncluidoDefecto(id) {
  return remove('no_incluidos_defecto', 'id_no_incluido_defecto', id);
}

// --- Plantilla de condiciones por defecto (una sola, se actualiza sobre si misma) ---

function obtenerCondicionesDefecto() {
  const filas = query('SELECT * FROM condiciones_defecto');
  return filas[0] || null;
}

function guardarCondicionesDefecto(data) {
  const actual = obtenerCondicionesDefecto();
  if (actual) {
    query('DELETE FROM condiciones_defecto WHERE id_condicion_defecto = ?', [actual.id_condicion_defecto]);
  }
  return insert('condiciones_defecto', data);
}

function eliminarCondicionesDefecto() {
  return query('DELETE FROM condiciones_defecto');
}

// --- Aplicar todos los valores por defecto a un servicio recien creado ---

function aplicarDefectosAServicio(idServicio) {
  listarIncluidosDefecto().forEach((item) => incluidos.agregarIncluido(idServicio, item.descripcion));
  listarNoIncluidosDefecto().forEach((item) => incluidos.agregarNoIncluido(idServicio, item.descripcion));

  const plantillaCondiciones = obtenerCondicionesDefecto();
  if (plantillaCondiciones) {
    condiciones.guardarCondiciones(idServicio, {
      politica_cancelacion: plantillaCondiciones.politica_cancelacion,
      requisitos: plantillaCondiciones.requisitos,
      notas: plantillaCondiciones.notas,
    });
  }
}

module.exports = {
  listarIncluidosDefecto,
  agregarIncluidoDefecto,
  eliminarIncluidoDefecto,
  listarNoIncluidosDefecto,
  agregarNoIncluidoDefecto,
  eliminarNoIncluidoDefecto,
  obtenerCondicionesDefecto,
  guardarCondicionesDefecto,
  eliminarCondicionesDefecto,
  aplicarDefectosAServicio,
};
