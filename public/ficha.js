function obtenerIdDeUrl() {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get('id');
}

async function obtenerJSON(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar ${url} (código ${respuesta.status})`);
  }
  return respuesta.json();
}

function formatearFecha(fechaTexto) {
  const fecha = new Date(`${fechaTexto}T00:00:00`);
  return fecha.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

function textoFechasYDuracion(servicio) {
  if (servicio.fecha_inicio && servicio.fecha_fin) {
    const rango = `${formatearFecha(servicio.fecha_inicio)} – ${formatearFecha(servicio.fecha_fin)}`;
    return servicio.duracion ? `${rango} (${servicio.duracion})` : rango;
  }
  return servicio.duracion || '';
}

function seccionLista(titulo, items) {
  if (items.length === 0) return '';
  return `
    <div class="ficha-columna">
      <h3>${titulo}</h3>
      <ul>${items.map((i) => `<li>${i.descripcion}</li>`).join('')}</ul>
    </div>
  `;
}

async function cargarFicha() {
  const id = obtenerIdDeUrl();
  const contenedor = document.getElementById('ficha');

  if (!id) {
    contenedor.innerHTML = '<p class="error">Falta el id del servicio en la URL (ejemplo: ficha.html?id=1)</p>';
    return;
  }

  try {
    const [servicios, tarifas, condiciones, incluidos, noIncluidos, archivos] = await Promise.all([
      obtenerJSON('/servicios'), // ya trae nombre_tipo y nombre_proveedor unidos
      obtenerJSON(`/servicios/${id}/tarifas`),
      obtenerJSON(`/servicios/${id}/condiciones`),
      obtenerJSON(`/servicios/${id}/incluidos`),
      obtenerJSON(`/servicios/${id}/no-incluidos`),
      obtenerJSON(`/servicios/${id}/archivos`),
    ]);

    const servicio = servicios.find((s) => String(s.id_servicio) === String(id));
    if (!servicio) throw new Error('Servicio no encontrado');

    document.title = `Ficha · ${servicio.nombre}`;

    const portada = archivos.find((a) => a.uso === 'portada');
    const galeria = archivos.filter((a) => a.uso === 'galeria');
    const documentos = archivos.filter((a) => a.uso === 'documento' || a.uso === 'condiciones');

    contenedor.innerHTML = `
      ${portada ? `<img class="ficha-portada" src="${portada.url_archivo}" alt="${servicio.nombre}" />` : ''}

      <header class="ficha-encabezado">
        <h1>${servicio.nombre}</h1>
        <p class="ficha-subtitulo">
          ${servicio.nombre_tipo ? `${servicio.nombre_tipo} · ` : ''}${servicio.nombre_proveedor || ''}${
      textoFechasYDuracion(servicio) ? ` · ${textoFechasYDuracion(servicio)}` : ''
    }
        </p>
      </header>

      ${servicio.descripcion ? `<p class="ficha-descripcion">${servicio.descripcion}</p>` : ''}

      ${
        tarifas.length > 0
          ? `
        <section>
          <h2>Tarifas</h2>
          <table class="ficha-tabla">
            <thead><tr><th>Tarifa</th><th>Precio</th></tr></thead>
            <tbody>
              ${tarifas.map((t) => `<tr><td>${t.nombre_tarifa}</td><td>${t.precio_base} ${t.moneda || ''}</td></tr>`).join('')}
            </tbody>
          </table>
        </section>
      `
          : ''
      }

      ${
        incluidos.length > 0 || noIncluidos.length > 0
          ? `<section class="ficha-columnas">${seccionLista('Incluye', incluidos)}${seccionLista('No incluye', noIncluidos)}</section>`
          : ''
      }

      ${
        condiciones && (condiciones.politica_cancelacion || condiciones.requisitos || condiciones.notas)
          ? `
        <section>
          <h2>Condiciones</h2>
          ${condiciones.politica_cancelacion ? `<p><strong>Política de cancelación:</strong> ${condiciones.politica_cancelacion}</p>` : ''}
          ${condiciones.requisitos ? `<p><strong>Requisitos:</strong> ${condiciones.requisitos}</p>` : ''}
          ${condiciones.notas ? `<p><strong>Notas:</strong> ${condiciones.notas}</p>` : ''}
        </section>
      `
          : ''
      }

      ${
        galeria.length > 0
          ? `
        <section>
          <h2>Galería</h2>
          <div class="ficha-galeria">
            ${galeria.map((a) => `<img src="${a.url_archivo}" alt="${a.nombre_original}" />`).join('')}
          </div>
        </section>
      `
          : ''
      }

      ${
        documentos.length > 0
          ? `
        <section>
          <h2>Documentos</h2>
          <ul>${documentos.map((a) => `<li><a href="${a.url_archivo}" target="_blank">${a.nombre_original}</a></li>`).join('')}</ul>
        </section>
      `
          : ''
      }
    `;
  } catch (error) {
    contenedor.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

document.getElementById('boton-imprimir').addEventListener('click', () => window.print());

cargarFicha();
