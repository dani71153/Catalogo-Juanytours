const { leerConfig } = require('./config');
const estadisticas = require('./estadisticas');
const openai = require('./proveedores/openai');
const anthropic = require('./proveedores/anthropic');
const gemini = require('./proveedores/gemini');

const ADAPTADORES = { openai, anthropic, gemini };
const NOMBRES_PROVEEDORES = Object.keys(ADAPTADORES);

async function extraerDatosDeImagen(imagenBuffer, mimeType) {
  const config = leerConfig();

  if (!config.proveedor) {
    throw new Error('No hay un proveedor de IA configurado. Ve a "Configuración de IA" en Opciones.');
  }

  const apiKey = config.apiKeys[config.proveedor];
  if (!apiKey) {
    throw new Error(`Falta la API key de ${config.proveedor}. Configúrala en "Configuración de IA".`);
  }

  const adaptador = ADAPTADORES[config.proveedor];
  const modelo = config.modelos[config.proveedor] || adaptador.MODELO_POR_DEFECTO;

  try {
    const datos = await adaptador.extraerDatosDeImagen(apiKey, imagenBuffer, mimeType, modelo);
    estadisticas.registrarUso({ proveedor: config.proveedor, modelo, exito: true });
    return datos;
  } catch (error) {
    estadisticas.registrarUso({ proveedor: config.proveedor, modelo, exito: false, mensajeError: error.message });
    throw error;
  }
}

// Los modelos por defecto de cada proveedor, para mostrarlos como referencia
// en el formulario de configuración (placeholder), sin tener que duplicarlos.
function obtenerModelosPorDefecto() {
  return Object.fromEntries(NOMBRES_PROVEEDORES.map((nombre) => [nombre, ADAPTADORES[nombre].MODELO_POR_DEFECTO]));
}

module.exports = { extraerDatosDeImagen, NOMBRES_PROVEEDORES, obtenerModelosPorDefecto };
