const { query, insert, update } = require('./db');

const TABLA = 'condiciones_servicio';
const ID_COLUMNA = 'id_condicion';

function guardarCondiciones(idServicio, data) {
  return insert(TABLA, { ...data, id_servicio: idServicio });
}

function obtenerCondiciones(idServicio) {
  const filas = query(`SELECT * FROM ${TABLA} WHERE id_servicio = ?`, [idServicio]);
  return filas[0] || null;
}

function actualizarCondiciones(idServicio, data) {
  const condiciones = obtenerCondiciones(idServicio);
  if (!condiciones) {
    return guardarCondiciones(idServicio, data);
  }
  return update(TABLA, ID_COLUMNA, condiciones.id_condicion, data);
}

function eliminarCondiciones(idServicio) {
  return query(`DELETE FROM ${TABLA} WHERE id_servicio = ?`, [idServicio]);
}

module.exports = {
  guardarCondiciones,
  obtenerCondiciones,
  actualizarCondiciones,
  eliminarCondiciones,
};
