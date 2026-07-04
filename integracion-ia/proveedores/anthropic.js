const { PROMPT_EXTRAER_SERVICIO, parsearRespuestaJSON } = require('../prompt');

const MODELO_POR_DEFECTO = 'claude-3-5-sonnet-20241022';

async function extraerDatosDeImagen(apiKey, imagenBuffer, mimeType, modelo = MODELO_POR_DEFECTO) {
  const imagenBase64 = imagenBuffer.toString('base64');

  const respuesta = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelo,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: imagenBase64 } },
            { type: 'text', text: PROMPT_EXTRAER_SERVICIO },
          ],
        },
      ],
    }),
  });

  if (!respuesta.ok) {
    const cuerpo = await respuesta.text();
    throw new Error(`Anthropic respondio con error (${respuesta.status}): ${cuerpo}`);
  }

  const datos = await respuesta.json();
  const texto = datos.content?.[0]?.text;
  if (!texto) throw new Error('Anthropic no devolvio contenido.');

  return parsearRespuestaJSON(texto);
}

module.exports = { extraerDatosDeImagen, MODELO_POR_DEFECTO };
