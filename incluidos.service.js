const { query, insert } = require('./db');

function agregarIncluido(idServicio, descripcion) {
  return insert('incluidos_servicio', { id_servicio: idServicio, descripcion });
}

function agregarNoIncluido(idServicio, descripcion) {
  return insert('no_incluidos_servicio', { id_servicio: idServicio, descripcion });
}

function listarIncluidos(idServicio) {
  return query('SELECT * FROM incluidos_servicio WHERE id_servicio = ?', [idServicio]);
}

function listarNoIncluidos(idServicio) {
  return query('SELECT * FROM no_incluidos_servicio WHERE id_servicio = ?', [idServicio]);
}

module.exports = {
  agregarIncluido,
  agregarNoIncluido,
  listarIncluidos,
  listarNoIncluidos,
};
