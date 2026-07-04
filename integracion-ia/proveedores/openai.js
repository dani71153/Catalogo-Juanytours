const { PROMPT_EXTRAER_SERVICIO, parsearRespuestaJSON } = require('../prompt');

const MODELO_POR_DEFECTO = 'gpt-4o-mini';

async function extraerDatosDeImagen(apiKey, imagenBuffer, mimeType, modelo = MODELO_POR_DEFECTO) {
  const imagenBase64 = imagenBuffer.toString('base64');

  const respuesta = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelo,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT_EXTRAER_SERVICIO },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imagenBase64}` } },
          ],
        },
      ],
    }),
  });

  if (!respuesta.ok) {
    const cuerpo = await respuesta.text();
    throw new Error(`OpenAI respondio con error (${respuesta.status}): ${cuerpo}`);
  }

  const datos = await respuesta.json();
  const texto = datos.choices?.[0]?.message?.content;
  if (!texto) throw new Error('OpenAI no devolvio contenido.');

  return parsearRespuestaJSON(texto);
}

module.exports = { extraerDatosDeImagen, MODELO_POR_DEFECTO };
