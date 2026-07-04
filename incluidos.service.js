const { query, insert, remove } = require('./db');

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

function eliminarIncluido(idIncluido) {
  return remove('incluidos_servicio', 'id_incluido', idIncluido);
}

function eliminarNoIncluido(idNoIncluido) {
  return remove('no_incluidos_servicio', 'id_no_incluido', idNoIncluido);
}

module.exports = {
  agregarIncluido,
  agregarNoIncluido,
  listarIncluidos,
  listarNoIncluidos,
  eliminarIncluido,
  eliminarNoIncluido,
};
