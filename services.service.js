const { query, getById, insert, update, remove } = require('./db');

const TABLA = 'servicios';
const ID_COLUMNA = 'id_servicio';

function crearServicio(data) {
  return insert(TABLA, data);
}

// Trae los servicios con el nombre de su tipo/proveedor, conteos y la URL de
// su imagen "portada" (si tiene una), para poder mostrarlos en el catalogo
// (tabla o cuadricula) sin pedir cada dato aparte.
function listarServicios() {
  return query(`
    SELECT
      s.*,
      t.nombre AS nombre_tipo,
      p.nombre AS nombre_proveedor,
      (SELECT COUNT(*) FROM tarifas_servicio WHERE id_servicio = s.id_servicio) AS total_tarifas,
      (SELECT COUNT(*) FROM servicio_archivos WHERE id_servicio = s.id_servicio) AS total_archivos,
      (
        SELECT a.url_archivo
        FROM servicio_archivos sa
        JOIN archivos a ON a.id_archivo = sa.id_archivo
        WHERE sa.id_servicio = s.id_servicio AND sa.uso = 'portada'
        ORDER BY sa.id_servicio_archivo
        LIMIT 1
      ) AS portada_url,
      (
        SELECT precio_base FROM tarifas_servicio
        WHERE id_servicio = s.id_servicio
        ORDER BY precio_base ASC LIMIT 1
      ) AS tarifa_desde_precio,
      (
        SELECT moneda FROM tarifas_servicio
        WHERE id_servicio = s.id_servicio
        ORDER BY precio_base ASC LIMIT 1
      ) AS tarifa_desde_moneda
    FROM ${TABLA} s
    LEFT JOIN tipos_servicio t ON t.id_tipo_servicio = s.id_tipo_servicio
    LEFT JOIN proveedores p ON p.id_proveedor = s.id_proveedor
    ORDER BY s.id_servicio DESC
  `);
}

function obtenerServicio(id) {
  return getById(TABLA, ID_COLUMNA, id);
}

function actualizarServicio(id, data) {
  return update(TABLA, ID_COLUMNA, id, data);
}

// Borrado permanente: quita primero los datos relacionados (tarifas,
// condiciones, incluidos, vinculos de archivos) y despues el servicio.
function eliminarServicio(id) {
  query('DELETE FROM servicio_archivos WHERE id_servicio = ?', [id]);
  query('DELETE FROM incluidos_servicio WHERE id_servicio = ?', [id]);
  query('DELETE FROM no_incluidos_servicio WHERE id_servicio = ?', [id]);
  query('DELETE FROM condiciones_servicio WHERE id_servicio = ?', [id]);
  query('DELETE FROM tarifas_servicio WHERE id_servicio = ?', [id]);
  return remove(TABLA, ID_COLUMNA, id);
}

module.exports = {
  crearServicio,
  listarServicios,
  obtenerServicio,
  actualizarServicio,
  eliminarServicio,
};
