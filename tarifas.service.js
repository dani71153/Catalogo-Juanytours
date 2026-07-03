const { query, getById, insert, update, remove } = require('./db');

const TABLA = 'tarifas_servicio';
const ID_COLUMNA = 'id_tarifa';

function crearTarifa(idServicio, data) {
  return insert(TABLA, { ...data, id_servicio: idServicio });
}

function listarTarifasPorServicio(idServicio) {
  return query(`SELECT * FROM ${TABLA} WHERE id_servicio = ?`, [idServicio]);
}

function actualizarTarifa(idTarifa, data) {
  return update(TABLA, ID_COLUMNA, idTarifa, data);
}

function eliminarTarifa(idTarifa) {
  return remove(TABLA, ID_COLUMNA, idTarifa);
}

module.exports = {
  crearTarifa,
  listarTarifasPorServicio,
  actualizarTarifa,
  eliminarTarifa,
};
