// Prompt compartido por los 3 proveedores: le pedimos a la IA que devuelva
// SIEMPRE el mismo JSON, para que el resto del codigo no dependa de cual
// proveedor se uso.
const PROMPT_EXTRAER_SERVICIO = `Analiza esta imagen (puede ser un afiche, folleto o foto de un servicio turistico: tour, paquete, congreso, hotel, traslado, etc.) y extrae la informacion que encuentres.

Responde UNICAMENTE con un JSON valido (sin texto antes ni despues, sin bloques de codigo markdown), con esta forma exacta:

{
  "nombre": "string o null",
  "descripcion": "string o null",
  "fecha_inicio": "YYYY-MM-DD o null",
  "fecha_fin": "YYYY-MM-DD o null",
  "tipo_servicio": "string o null (ej: tour, paquete, congreso, hotel)",
  "proveedor": "string o null (organizador o empresa que ofrece el servicio)",
  "destino": "string o null (ej: Santiago, Chile)",
  "tarifas": [{ "nombre_tarifa": "string", "precio_base": numero, "moneda": "string o null" }],
  "incluye": ["string"],
  "no_incluye": ["string"],
  "condiciones": {
    "politica_cancelacion": "string o null",
    "requisitos": "string o null",
    "notas": "string o null"
  }
}

Si no encuentras un dato, usa null (o un arreglo vacio para las listas). No inventes precios ni fechas que no esten en la imagen.`;

// Le quita los ```json ... ``` que algunos modelos agregan igual aunque se
// les pida que no lo hagan, y convierte el texto a un objeto JS.
function parsearRespuestaJSON(texto) {
  const limpio = texto
    .trim()
    .replace(/^```json/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim();
  return JSON.parse(limpio);
}

module.exports = { PROMPT_EXTRAER_SERVICIO, parsearRespuestaJSON };
