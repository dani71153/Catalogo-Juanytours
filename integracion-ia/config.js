const fs = require('fs');
const path = require('path');

// Permite apuntar a otro archivo (ej. en pruebas) sin tocar el config.json real.
const RUTA_CONFIG = process.env.IA_CONFIG_PATH || path.join(__dirname, 'config.json');

function leerConfig() {
  if (!fs.existsSync(RUTA_CONFIG)) {
    return { proveedor: '', apiKeys: {}, modelos: {} };
  }
  const contenido = fs.readFileSync(RUTA_CONFIG, 'utf-8');
  const config = JSON.parse(contenido);
  return { proveedor: config.proveedor || '', apiKeys: config.apiKeys || {}, modelos: config.modelos || {} };
}

function guardarConfig(config) {
  fs.writeFileSync(RUTA_CONFIG, JSON.stringify(config, null, 2));
}

module.exports = { leerConfig, guardarConfig };
