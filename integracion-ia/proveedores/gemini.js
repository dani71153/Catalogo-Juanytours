const { PROMPT_EXTRAER_SERVICIO, parsearRespuestaJSON } = require('../prompt');

// Alias "latest": Google lo mantiene apuntando al modelo flash vigente, para
// no tener que perseguir el nombre exacto cada vez que retiran uno.
const MODELO_POR_DEFECTO = 'gemini-flash-latest';

async function extraerDatosDeImagen(apiKey, imagenBuffer, mimeType, modelo = MODELO_POR_DEFECTO) {
  const imagenBase64 = imagenBuffer.toString('base64');

  const respuesta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: PROMPT_EXTRAER_SERVICIO }, { inline_data: { mime_type: mimeType, data: imagenBase64 } }],
          },
        ],
      }),
    }
  );

  if (!respuesta.ok) {
    const cuerpo = await respuesta.text();
    throw new Error(`Gemini respondio con error (${respuesta.status}): ${cuerpo}`);
  }

  const datos = await respuesta.json();
  const texto = datos.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) throw new Error('Gemini no devolvio contenido.');

  return parsearRespuestaJSON(texto);
}

module.exports = { extraerDatosDeImagen, MODELO_POR_DEFECTO };
