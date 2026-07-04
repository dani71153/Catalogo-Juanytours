const express = require('express');
const multer = require('multer');
const { leerConfig, guardarConfig } = require('./config');
const iaService = require('./ia.service');
const estadisticas = require('./estadisticas');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Nunca se devuelven las API keys reales al frontend, solo cuales proveedores
// ya tienen una key guardada y cual esta activo.
router.get('/ia/configuracion', (req, res) => {
  const config = leerConfig();
  res.json({
    proveedor: config.proveedor,
    proveedoresDisponibles: iaService.NOMBRES_PROVEEDORES,
    proveedoresConKey: Object.keys(config.apiKeys).filter((p) => config.apiKeys[p]),
    modelos: config.modelos,
    modelosPorDefecto: iaService.obtenerModelosPorDefecto(),
  });
});

router.post('/ia/configuracion', (req, res) => {
  const { proveedor, apiKey, modelo } = req.body;
  const config = leerConfig();

  if (proveedor) config.proveedor = proveedor;
  // trim: un espacio o salto de linea de mas al copiar la key hace que la
  // API del proveedor la rechace como invalida.
  if (apiKey) config.apiKeys[proveedor] = apiKey.trim();
  if (modelo) config.modelos[proveedor] = modelo.trim();

  guardarConfig(config);
  res.status(201).json({ ok: true });
});

// Borra la API key (y el modelo personalizado) guardados de un proveedor.
router.delete('/ia/configuracion/:proveedor', (req, res) => {
  const config = leerConfig();
  delete config.apiKeys[req.params.proveedor];
  delete config.modelos[req.params.proveedor];
  guardarConfig(config);
  res.status(204).send();
});

router.get('/ia/estadisticas', (req, res) => {
  res.json(estadisticas.obtenerEstadisticas());
});

router.post('/ia/extraer-imagen', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) throw new Error('Falta la imagen.');
    const datos = await iaService.extraerDatosDeImagen(req.file.buffer, req.file.mimetype);
    res.json(datos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
