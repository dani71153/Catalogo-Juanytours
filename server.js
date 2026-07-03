const express = require('express');
const multer = require('multer');
const path = require('path');

const servicios = require('./services.service');
const tarifas = require('./tarifas.service');
const condiciones = require('./condiciones.service');
const incluidos = require('./incluidos.service');
const archivos = require('./archivos.service');
const { query, insert, remove } = require('./db');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Borra una fila de un catalogo de apoyo. Si esta en uso por otra tabla
// (foreign key), SQLite rechaza el borrado y avisamos con un mensaje claro.
function eliminarDeCatalogo(res, tabla, idColumna, id) {
  try {
    remove(tabla, idColumna, id);
    res.status(204).send();
  } catch (error) {
    res.status(409).json({ error: 'No se puede eliminar: está en uso por un servicio o archivo.' });
  }
}

// --- Catalogos (tablas de apoyo para llenar selects en la interfaz) ---

app.get('/tipos-servicio', (req, res) => {
  res.json(query('SELECT * FROM tipos_servicio'));
});

app.post('/tipos-servicio', (req, res) => {
  const id = insert('tipos_servicio', req.body);
  res.status(201).json({ id_tipo_servicio: id });
});

app.delete('/tipos-servicio/:id', (req, res) => {
  eliminarDeCatalogo(res, 'tipos_servicio', 'id_tipo_servicio', req.params.id);
});

app.get('/proveedores', (req, res) => {
  res.json(query('SELECT * FROM proveedores'));
});

app.post('/proveedores', (req, res) => {
  const id = insert('proveedores', req.body);
  res.status(201).json({ id_proveedor: id });
});

app.delete('/proveedores/:id', (req, res) => {
  eliminarDeCatalogo(res, 'proveedores', 'id_proveedor', req.params.id);
});

app.get('/destinos', (req, res) => {
  res.json(query('SELECT * FROM destinos'));
});

app.post('/destinos', (req, res) => {
  const id = insert('destinos', req.body);
  res.status(201).json({ id_destino: id });
});

app.delete('/destinos/:id', (req, res) => {
  eliminarDeCatalogo(res, 'destinos', 'id_destino', req.params.id);
});

app.get('/tipos-archivo', (req, res) => {
  res.json(query('SELECT * FROM tipos_archivo'));
});

app.post('/tipos-archivo', (req, res) => {
  const id = insert('tipos_archivo', req.body);
  res.status(201).json({ id_tipo_archivo: id });
});

app.delete('/tipos-archivo/:id', (req, res) => {
  eliminarDeCatalogo(res, 'tipos_archivo', 'id_tipo_archivo', req.params.id);
});

// --- Servicios ---

app.post('/servicios', (req, res) => {
  const idServicio = servicios.crearServicio(req.body);
  res.status(201).json({ id_servicio: idServicio });
});

app.get('/servicios', (req, res) => {
  res.json(servicios.listarServicios());
});

app.get('/servicios/:id', (req, res) => {
  const servicio = servicios.obtenerServicio(req.params.id);
  if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });
  res.json(servicio);
});

app.put('/servicios/:id', (req, res) => {
  const cambios = servicios.actualizarServicio(req.params.id, req.body);
  res.json({ cambios });
});

app.delete('/servicios/:id', (req, res) => {
  servicios.eliminarServicio(req.params.id);
  res.status(204).send();
});

// --- Tarifas ---

app.post('/servicios/:id/tarifas', (req, res) => {
  const idTarifa = tarifas.crearTarifa(req.params.id, req.body);
  res.status(201).json({ id_tarifa: idTarifa });
});

app.get('/servicios/:id/tarifas', (req, res) => {
  res.json(tarifas.listarTarifasPorServicio(req.params.id));
});

// --- Condiciones ---

app.post('/servicios/:id/condiciones', (req, res) => {
  condiciones.guardarCondiciones(req.params.id, req.body);
  res.status(201).json({ ok: true });
});

app.get('/servicios/:id/condiciones', (req, res) => {
  res.json(condiciones.obtenerCondiciones(req.params.id));
});

// --- Incluidos / no incluidos ---

app.post('/servicios/:id/incluidos', (req, res) => {
  incluidos.agregarIncluido(req.params.id, req.body.descripcion);
  res.status(201).json({ ok: true });
});

app.post('/servicios/:id/no-incluidos', (req, res) => {
  incluidos.agregarNoIncluido(req.params.id, req.body.descripcion);
  res.status(201).json({ ok: true });
});

app.get('/servicios/:id/incluidos', (req, res) => {
  res.json(incluidos.listarIncluidos(req.params.id));
});

app.get('/servicios/:id/no-incluidos', (req, res) => {
  res.json(incluidos.listarNoIncluidos(req.params.id));
});

// --- Archivos ---

app.post('/servicios/:id/archivos', upload.single('archivo'), (req, res) => {
  const metadata = archivos.subirArchivo(req.file);
  metadata.id_tipo_archivo = req.body.id_tipo_archivo;

  const idArchivo = archivos.registrarArchivo(metadata);
  archivos.vincularArchivoAServicio(req.params.id, idArchivo, req.body.uso);

  res.status(201).json({ id_archivo: idArchivo });
});

app.get('/servicios/:id/archivos', (req, res) => {
  res.json(archivos.listarArchivosDeServicio(req.params.id));
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});
