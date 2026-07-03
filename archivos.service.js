const fs = require('fs');
const path = require('path');
const { query, insert, remove } = require('./db');

const CARPETA_SUBIDAS = path.join(__dirname, 'uploads');

// Guarda el archivo físico en disco y devuelve la info para registrarlo
function subirArchivo(file) {
  if (!fs.existsSync(CARPETA_SUBIDAS)) {
    fs.mkdirSync(CARPETA_SUBIDAS, { recursive: true });
  }

  const extension = path.extname(file.originalname);
  const nombreGuardado = `${Date.now()}_${Math.round(Math.random() * 1e9)}${extension}`;
  const rutaDestino = path.join(CARPETA_SUBIDAS, nombreGuardado);

  fs.writeFileSync(rutaDestino, file.buffer);

  return {
    nombre_original: file.originalname,
    nombre_guardado: nombreGuardado,
    extension,
    mime_type: file.mimetype,
    url_archivo: `/uploads/${nombreGuardado}`,
    tamano_bytes: file.size,
    fecha_subida: new Date().toISOString(),
    estado: 'activo',
  };
}

function registrarArchivo(metadata) {
  return insert('archivos', metadata);
}

function vincularArchivoAServicio(idServicio, idArchivo, uso) {
  return insert('servicio_archivos', {
    id_servicio: idServicio,
    id_archivo: idArchivo,
    uso,
  });
}

function listarArchivosDeServicio(idServicio) {
  return query(
    `SELECT a.*, sa.uso, sa.id_servicio_archivo
     FROM servicio_archivos sa
     JOIN archivos a ON a.id_archivo = sa.id_archivo
     WHERE sa.id_servicio = ?`,
    [idServicio]
  );
}

function eliminarArchivoDeServicio(idServicio, idArchivo) {
  return query(
    'DELETE FROM servicio_archivos WHERE id_servicio = ? AND id_archivo = ?',
    [idServicio, idArchivo]
  );
}

module.exports = {
  subirArchivo,
  registrarArchivo,
  vincularArchivoAServicio,
  listarArchivosDeServicio,
  eliminarArchivoDeServicio,
};
