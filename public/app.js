let serviciosCache = [];
let catalogoTipos = [];
let catalogoProveedores = [];
let catalogoDestinos = [];
let catalogoTiposArchivo = [];

// --- Mensajes de exito / error ---

let temporizadorMensaje = null;

function mostrarMensaje(texto, tipo) {
  const el = document.getElementById('mensaje');
  el.textContent = texto;
  el.className = `mensaje ${tipo}`;
  el.hidden = false;

  clearTimeout(temporizadorMensaje);
  temporizadorMensaje = setTimeout(() => {
    el.hidden = true;
  }, 3500);
}

// --- Helpers de red ---

async function obtenerJSON(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar ${url} (código ${respuesta.status})`);
  }
  return respuesta.json();
}

async function enviarJSON(url, metodo, data) {
  const respuesta = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!respuesta.ok) {
    throw new Error(`No se pudo guardar (código ${respuesta.status})`);
  }
  return respuesta.json();
}

async function enviarFormData(url, formData) {
  const respuesta = await fetch(url, { method: 'POST', body: formData });
  if (!respuesta.ok) {
    throw new Error(`No se pudo subir el archivo (código ${respuesta.status})`);
  }
  return respuesta.json();
}

function datosFormulario(form) {
  const data = {};
  new FormData(form).forEach((valor, clave) => {
    if (valor !== '') data[clave] = valor;
  });
  return data;
}

// Busca en el catalogo el registro cuyo nombre coincide exactamente (sin
// distinguir mayusculas) con lo que el usuario escribio, y devuelve su id.
function buscarIdPorTexto(catalogo, campoId, campoTexto, texto) {
  const encontrado = catalogo.find((item) => item[campoTexto].toLowerCase() === texto.trim().toLowerCase());
  return encontrado ? String(encontrado[campoId]) : '';
}

function valorMostrado(catalogo, campoId, campoTexto, id) {
  const encontrado = catalogo.find((item) => String(item[campoId]) === String(id));
  return encontrado ? encontrado[campoTexto] : '';
}

// --- Catalogos de apoyo (cache global, usado por todas las pestañas) ---

async function cargarCatalogos() {
  try {
    [catalogoTipos, catalogoProveedores, catalogoDestinos, catalogoTiposArchivo] = await Promise.all([
      obtenerJSON('/tipos-servicio'),
      obtenerJSON('/proveedores'),
      obtenerJSON('/destinos'),
      obtenerJSON('/tipos-archivo'),
    ]);
    renderizarListasCatalogo();
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

function campo(form, nombre) {
  return form.querySelector(`[name="${nombre}"]`);
}

function campoDeTexto(form, campoId) {
  return form.querySelector(`[data-campo="${campoId}"]`);
}

// Devuelve el catalogo (siempre actualizado) que corresponde a cada campo.
function catalogoActualPara(campoId) {
  if (campoId === 'id_tipo_servicio') return catalogoTipos;
  if (campoId === 'id_proveedor') return catalogoProveedores;
  if (campoId === 'id_destino') return catalogoDestinos;
  if (campoId === 'id_tipo_archivo') return catalogoTiposArchivo;
  return [];
}

// Los 4 campos "escribir y autocompletar" del formulario de servicio/archivo,
// cada uno con: input de texto visible (con data-campo), input oculto con el
// id real (name) y una lista <ul> propia para mostrar las sugerencias.
function configuracionCamposAutocompletar(formServicio, formArchivo) {
  const config = [
    { input: campoDeTexto(formServicio, 'id_tipo_servicio'), campoId: 'id_tipo_servicio', campoTexto: 'nombre' },
    { input: campoDeTexto(formServicio, 'id_proveedor'), campoId: 'id_proveedor', campoTexto: 'nombre' },
    { input: campoDeTexto(formServicio, 'id_destino'), campoId: 'id_destino', campoTexto: 'ciudad' },
  ];
  if (formArchivo) {
    config.push({ input: campoDeTexto(formArchivo, 'id_tipo_archivo'), campoId: 'id_tipo_archivo', campoTexto: 'nombre' });
  }
  return config;
}

// Conecta un campo de texto con su lista de sugerencias: al escribir o
// enfocar, filtra el catalogo y muestra las coincidencias; al hacer clic en
// una, la selecciona y guarda su id en el input oculto.
function conectarAutocompletarCampo(input, campoId, campoTexto) {
  const inputOculto = input.nextElementSibling; // el input hidden va justo despues en el HTML
  const lista = inputOculto.nextElementSibling; // y la <ul class="sugerencias"> despues del hidden

  function mostrarSugerencias() {
    const texto = input.value.trim().toLowerCase();
    const catalogo = catalogoActualPara(campoId);
    const coincidencias = texto ? catalogo.filter((item) => item[campoTexto].toLowerCase().includes(texto)) : catalogo;

    if (coincidencias.length === 0) {
      lista.hidden = true;
      lista.innerHTML = '';
      return;
    }

    lista.innerHTML = coincidencias
      .map((item) => `<li data-id="${item[campoId]}" data-texto="${item[campoTexto]}">${item[campoTexto]}</li>`)
      .join('');
    lista.hidden = false;
  }

  input.addEventListener('focus', mostrarSugerencias);
  input.addEventListener('input', () => {
    inputOculto.value = buscarIdPorTexto(catalogoActualPara(campoId), campoId, campoTexto, input.value);
    mostrarSugerencias();
  });

  // mousedown (no click) + preventDefault evita que el input pierda el foco
  // antes de registrar la seleccion, que es lo que ocultaria la lista primero.
  lista.addEventListener('mousedown', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    e.preventDefault();
    input.value = li.dataset.texto;
    inputOculto.value = li.dataset.id;
    lista.hidden = true;
  });

  input.addEventListener('blur', () => {
    lista.hidden = true;
  });
}

function inicializarAutocompletarServicio(formServicio, formArchivo) {
  configuracionCamposAutocompletar(formServicio, formArchivo).forEach(({ input, campoId, campoTexto }) => {
    conectarAutocompletarCampo(input, campoId, campoTexto);
  });
}

function manejarFormularioCatalogo(idFormulario, url) {
  document.getElementById(idFormulario).addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await enviarJSON(url, 'POST', datosFormulario(e.target));
      e.target.reset();
      await cargarCatalogos();
      mostrarMensaje('Agregado correctamente', 'exito');
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  });
}

manejarFormularioCatalogo('form-tipo-servicio', '/tipos-servicio');
manejarFormularioCatalogo('form-proveedor', '/proveedores');
manejarFormularioCatalogo('form-destino', '/destinos');
manejarFormularioCatalogo('form-tipo-archivo', '/tipos-archivo');

// --- Subpestaña "Catálogos de apoyo": listas de lo ya registrado ---

function listaOVacio(items, textoItem, endpoint, idField) {
  if (items.length === 0) return '<li class="vacio">Sin registros</li>';
  return items
    .map(
      (item) => `
        <li>
          <span>${textoItem(item)}</span>
          <button type="button" class="eliminar-item" data-endpoint="${endpoint}" data-id="${item[idField]}">×</button>
        </li>
      `
    )
    .join('');
}

function renderizarListasCatalogo() {
  document.getElementById('lista-tipos-servicio').innerHTML = listaOVacio(
    catalogoTipos,
    (t) => t.nombre,
    'tipos-servicio',
    'id_tipo_servicio'
  );
  document.getElementById('lista-proveedores').innerHTML = listaOVacio(
    catalogoProveedores,
    (p) => p.nombre,
    'proveedores',
    'id_proveedor'
  );
  document.getElementById('lista-destinos').innerHTML = listaOVacio(
    catalogoDestinos,
    (d) => [d.ciudad, d.pais].filter(Boolean).join(', ') || 'Sin nombre',
    'destinos',
    'id_destino'
  );
  document.getElementById('lista-tipos-archivo').innerHTML = listaOVacio(
    catalogoTiposArchivo,
    (t) => t.nombre,
    'tipos-archivo',
    'id_tipo_archivo'
  );
}

document.getElementById('subvista-apoyo').addEventListener('click', async (e) => {
  const boton = e.target.closest('.eliminar-item');
  if (!boton) return;

  const { endpoint, id } = boton.dataset;
  if (!confirm('¿Eliminar este registro?')) return;

  try {
    const respuesta = await fetch(`/${endpoint}/${id}`, { method: 'DELETE' });
    if (!respuesta.ok) {
      const cuerpo = await respuesta.json().catch(() => ({}));
      throw new Error(cuerpo.error || `No se pudo eliminar (código ${respuesta.status})`);
    }
    mostrarMensaje('Eliminado correctamente', 'exito');
    await cargarCatalogos();
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
});

document.querySelectorAll('.subpestana').forEach((boton) => {
  boton.addEventListener('click', () => {
    const subtab = boton.dataset.subtab;
    document.querySelectorAll('.subpestana').forEach((b) => b.classList.toggle('activa', b === boton));
    document.querySelectorAll('.subvista').forEach((v) => v.classList.toggle('activa', v.id === `subvista-${subtab}`));
  });
});

// --- Pestañas ---

function cambiarPestana(tabId) {
  document.querySelectorAll('.pestana').forEach((boton) => {
    boton.classList.toggle('activa', boton.dataset.tab === tabId);
  });
  document.querySelectorAll('.vista').forEach((seccion) => {
    seccion.classList.toggle('activa', seccion.dataset.tab === tabId);
  });
}

function crearBotonPestana(tabId, etiqueta, cerrable) {
  const boton = document.createElement('button');
  boton.className = 'pestana';
  boton.dataset.tab = tabId;

  const texto = document.createElement('span');
  texto.className = 'pestana-texto';
  texto.textContent = etiqueta;
  // Se lee boton.dataset.tab (no el parametro tabId) porque el id de la
  // pestaña cambia cuando un servicio nuevo se guarda y pasa a tener id real.
  texto.addEventListener('click', () => cambiarPestana(boton.dataset.tab));
  boton.appendChild(texto);

  if (cerrable) {
    const cerrar = document.createElement('span');
    cerrar.className = 'pestana-cerrar';
    cerrar.textContent = '×';
    cerrar.title = 'Cerrar';
    cerrar.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarPestana(boton.dataset.tab);
    });
    boton.appendChild(cerrar);
  }

  document.getElementById('barra-pestanas').appendChild(boton);
  return boton;
}

function cerrarPestana(tabId) {
  document.querySelector(`.pestana[data-tab="${tabId}"]`)?.remove();
  document.querySelector(`.vista[data-tab="${tabId}"]`)?.remove();
  cambiarPestana('catalogo');
}

document.querySelector('.pestana[data-tab="catalogo"] .pestana-texto').addEventListener('click', () => {
  cambiarPestana('catalogo');
});

// --- Catálogo: listado, búsqueda y acciones ---

let vistaActualServicios = 'grid';

async function cargarServicios() {
  try {
    serviciosCache = await obtenerJSON('/servicios');
    renderizarServicios(serviciosCache);
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

// Conecta los botones Abrir/Archivar/Eliminar de una fila o tarjeta,
// sin importar si el elemento viene de la tabla o de la cuadricula.
function conectarAccionesServicio(elemento, servicio) {
  elemento.querySelector('.boton-abrir').addEventListener('click', () => abrirServicio(servicio.id_servicio));
  elemento.querySelector('.boton-archivar').addEventListener('click', () => alternarArchivado(servicio));
  elemento.querySelector('.boton-eliminar').addEventListener('click', () => eliminarServicioDesdeTabla(servicio));
}

function botonesAccionServicio(servicio) {
  return `
    <button type="button" class="enlace-accion boton-abrir">Abrir</button>
    <button type="button" class="enlace-accion boton-archivar">${servicio.estado === 'activo' ? 'Archivar' : 'Reactivar'}</button>
    <button type="button" class="enlace-accion peligro boton-eliminar">Eliminar</button>
  `;
}

// Texto de la tarifa mas barata del servicio, para mostrar en la tarjeta/fila.
function textoTarifaDesde(servicio) {
  if (servicio.tarifa_desde_precio == null) return 'Sin tarifas';
  const moneda = servicio.tarifa_desde_moneda ? ` ${servicio.tarifa_desde_moneda}` : '';
  return `Desde ${servicio.tarifa_desde_precio}${moneda}`;
}

function renderizarServicios(lista) {
  document.getElementById('conteo-servicios').textContent = `${lista.length} servicio${lista.length === 1 ? '' : 's'}`;
  renderizarTablaServicios(lista);
  renderizarGridServicios(lista);
}

function renderizarTablaServicios(lista) {
  const tbody = document.querySelector('#tabla-servicios tbody');
  tbody.innerHTML = '';

  lista.forEach((servicio) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>
        <strong>${servicio.nombre}</strong><br>
        <span class="texto-secundario">${servicio.duracion || ''}</span>
      </td>
      <td>${servicio.nombre_tipo || '-'} · ${servicio.nombre_proveedor || '-'}</td>
      <td><span class="badge ${servicio.estado}">${servicio.estado || '-'}</span></td>
      <td>
        <strong>${textoTarifaDesde(servicio)}</strong><br>
        <span class="texto-secundario">${servicio.total_tarifas} tarifa${servicio.total_tarifas === 1 ? '' : 's'}</span>
      </td>
      <td>${servicio.total_archivos} archivo${servicio.total_archivos === 1 ? '' : 's'}</td>
      <td class="acciones">${botonesAccionServicio(servicio)}</td>
    `;
    conectarAccionesServicio(fila, servicio);
    tbody.appendChild(fila);
  });
}

function renderizarGridServicios(lista) {
  const grid = document.getElementById('grid-servicios');
  grid.innerHTML = '';

  lista.forEach((servicio) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-servicio';
    tarjeta.innerHTML = `
      <div class="miniatura">
        ${
          servicio.portada_url
            ? `<img src="${servicio.portada_url}" alt="${servicio.nombre}" />`
            : '<span class="miniatura-placeholder">🖼</span>'
        }
      </div>
      <div class="tarjeta-servicio-cuerpo">
        <span class="tarjeta-servicio-nombre">${servicio.nombre}</span>
        <span class="texto-secundario">${servicio.nombre_tipo || '-'} · ${servicio.nombre_proveedor || '-'}</span>
        <span class="tarjeta-servicio-precio">${textoTarifaDesde(servicio)}</span>
        <span class="badge ${servicio.estado}">${servicio.estado || '-'}</span>
        <div class="tarjeta-servicio-acciones">${botonesAccionServicio(servicio)}</div>
      </div>
    `;
    conectarAccionesServicio(tarjeta, servicio);
    grid.appendChild(tarjeta);
  });
}

document.getElementById('buscador-servicios').addEventListener('input', (e) => {
  const texto = e.target.value.trim().toLowerCase();
  const filtrados = serviciosCache.filter(
    (s) => s.nombre.toLowerCase().includes(texto) || (s.nombre_proveedor || '').toLowerCase().includes(texto)
  );
  renderizarServicios(filtrados);
});

document.querySelectorAll('.boton-vista').forEach((boton) => {
  boton.addEventListener('click', () => {
    vistaActualServicios = boton.dataset.vista;
    document.querySelectorAll('.boton-vista').forEach((b) => b.classList.toggle('activa', b === boton));
    document.getElementById('grid-servicios').hidden = vistaActualServicios !== 'grid';
    document.getElementById('tabla-servicios').hidden = vistaActualServicios !== 'lista';
  });
});

async function alternarArchivado(servicio) {
  try {
    const nuevoEstado = servicio.estado === 'activo' ? 'inactivo' : 'activo';
    await enviarJSON(`/servicios/${servicio.id_servicio}`, 'PUT', { estado: nuevoEstado });
    mostrarMensaje(nuevoEstado === 'inactivo' ? 'Servicio archivado' : 'Servicio reactivado', 'exito');
    await cargarServicios();
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

async function eliminarServicioDesdeTabla(servicio) {
  const confirmado = confirm(
    `¿Eliminar "${servicio.nombre}" y todos sus datos (tarifas, condiciones, incluidos, archivos)? Esta acción no se puede deshacer.`
  );
  if (!confirmado) return;

  try {
    const respuesta = await fetch(`/servicios/${servicio.id_servicio}`, { method: 'DELETE' });
    if (!respuesta.ok) throw new Error(`No se pudo eliminar (código ${respuesta.status})`);
    cerrarPestana(String(servicio.id_servicio));
    mostrarMensaje('Servicio eliminado', 'exito');
    await cargarServicios();
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

// --- Plantilla de contenido para una pestaña de servicio ---

function plantillaServicio(servicio) {
  const esNuevo = !servicio;
  return `
    <div class="tarjeta">
      <h2>${esNuevo ? 'Nuevo servicio' : 'Datos del servicio'}</h2>
      <form class="form-servicio grid-2">
        <div class="autocompletar">
          <label>Tipo de servicio</label>
          <input type="text" class="campo-autocompletar" data-campo="id_tipo_servicio" placeholder="Escribe o elige un tipo" autocomplete="off" required />
          <input type="hidden" name="id_tipo_servicio" />
          <ul class="sugerencias" hidden></ul>
        </div>
        <div class="autocompletar">
          <label>Proveedor</label>
          <input type="text" class="campo-autocompletar" data-campo="id_proveedor" placeholder="Escribe o elige un proveedor" autocomplete="off" required />
          <input type="hidden" name="id_proveedor" />
          <ul class="sugerencias" hidden></ul>
        </div>
        <div class="autocompletar">
          <label>Destino (opcional)</label>
          <input type="text" class="campo-autocompletar" data-campo="id_destino" placeholder="Escribe o elige un destino" autocomplete="off" />
          <input type="hidden" name="id_destino" />
          <ul class="sugerencias" hidden></ul>
        </div>
        <div>
          <label>Nombre</label>
          <input type="text" name="nombre" required value="${servicio?.nombre ?? ''}" />
        </div>
        <div class="col-span-2">
          <label>Descripción</label>
          <textarea name="descripcion">${servicio?.descripcion ?? ''}</textarea>
        </div>
        <div>
          <label>Duración</label>
          <input type="text" name="duracion" value="${servicio?.duracion ?? ''}" />
        </div>
        <div>
          <label>Estado</label>
          <select name="estado">
            <option value="activo">activo</option>
            <option value="inactivo">inactivo</option>
          </select>
        </div>
        <div class="col-span-2">
          <button type="submit">${esNuevo ? 'Guardar servicio' : 'Actualizar servicio'}</button>
        </div>
      </form>
    </div>

    <div class="secciones-relacionadas" ${esNuevo ? 'hidden' : ''}>
      <div class="grid-2">
        <div class="tarjeta">
          <h3>Tarifas</h3>
          <form class="form-tarifa grid-2">
            <input type="text" name="nombre_tarifa" placeholder="Nombre tarifa (adulto, niño...)" required />
            <input type="number" step="0.01" name="precio_base" placeholder="Precio" required />
            <input type="text" name="moneda" placeholder="USD, DOP..." />
            <select name="estado">
              <option value="activo">activo</option>
              <option value="inactivo">inactivo</option>
            </select>
            <button type="submit" class="col-span-2">Agregar tarifa</button>
          </form>
          <ul class="lista-tarifas"></ul>
        </div>

        <div class="tarjeta">
          <h3>Condiciones</h3>
          <form class="form-condiciones">
            <textarea name="politica_cancelacion" placeholder="Política de cancelación"></textarea>
            <textarea name="requisitos" placeholder="Requisitos"></textarea>
            <textarea name="notas" placeholder="Notas"></textarea>
            <button type="submit">Guardar condiciones</button>
          </form>
        </div>
      </div>

      <div class="grid-2">
        <div class="tarjeta">
          <h3>Incluye</h3>
          <form class="form-incluido">
            <input type="text" name="descripcion" placeholder="Ej: Almuerzo buffet" required />
            <button type="submit">Agregar</button>
          </form>
          <ul class="lista-incluidos"></ul>
        </div>

        <div class="tarjeta">
          <h3>No incluye</h3>
          <form class="form-no-incluido">
            <input type="text" name="descripcion" placeholder="Ej: Propinas" required />
            <button type="submit">Agregar</button>
          </form>
          <ul class="lista-no-incluidos"></ul>
        </div>
      </div>

      <div class="tarjeta">
        <h3>Archivos</h3>
        <form class="form-archivo grid-2">
          <input type="file" name="archivo" required />
          <div class="autocompletar">
            <input type="text" class="campo-autocompletar" data-campo="id_tipo_archivo" placeholder="Escribe o elige un tipo de archivo" autocomplete="off" required />
            <input type="hidden" name="id_tipo_archivo" />
            <ul class="sugerencias" hidden></ul>
          </div>
          <select name="uso">
            <option value="portada">portada</option>
            <option value="galeria">galeria</option>
            <option value="documento">documento</option>
            <option value="condiciones">condiciones</option>
          </select>
          <button type="submit" class="col-span-2">Subir archivo</button>
        </form>
        <ul class="lista-archivos"></ul>
      </div>
    </div>
  `;
}

// --- Carga de datos relacionados dentro de una pestaña de servicio ---

async function cargarTarifas(seccion, idServicio) {
  const tarifas = await obtenerJSON(`/servicios/${idServicio}/tarifas`);
  seccion.querySelector('.lista-tarifas').innerHTML = tarifas
    .map((t) => `<li>${t.nombre_tarifa}: ${t.precio_base} ${t.moneda || ''}</li>`)
    .join('');
}

async function cargarCondiciones(seccion, idServicio) {
  const condiciones = await obtenerJSON(`/servicios/${idServicio}/condiciones`);
  const form = seccion.querySelector('.form-condiciones');
  campo(form, 'politica_cancelacion').value = condiciones?.politica_cancelacion || '';
  campo(form, 'requisitos').value = condiciones?.requisitos || '';
  campo(form, 'notas').value = condiciones?.notas || '';
}

async function cargarIncluidos(seccion, idServicio) {
  const incluidos = await obtenerJSON(`/servicios/${idServicio}/incluidos`);
  const noIncluidos = await obtenerJSON(`/servicios/${idServicio}/no-incluidos`);
  seccion.querySelector('.lista-incluidos').innerHTML = incluidos.map((i) => `<li>${i.descripcion}</li>`).join('');
  seccion.querySelector('.lista-no-incluidos').innerHTML = noIncluidos.map((i) => `<li>${i.descripcion}</li>`).join('');
}

async function cargarArchivos(seccion, idServicio) {
  const archivos = await obtenerJSON(`/servicios/${idServicio}/archivos`);
  seccion.querySelector('.lista-archivos').innerHTML = archivos
    .map((a) => `<li><a href="${a.url_archivo}" target="_blank">${a.nombre_original}</a> (${a.uso})</li>`)
    .join('');
}

// --- Conecta los formularios de una pestaña de servicio con la API ---

function inicializarSeccionServicio(seccion, servicio) {
  let idServicioActual = servicio ? servicio.id_servicio : null;

  const formServicio = seccion.querySelector('.form-servicio');
  const formArchivo = seccion.querySelector('.form-archivo');
  try {
    inicializarAutocompletarServicio(formServicio, formArchivo);
  } catch (error) {
    mostrarMensaje(`No se pudo preparar el autocompletar: ${error.message}`, 'error');
  }

  if (servicio) {
    seccion.querySelector('[data-campo="id_tipo_servicio"]').value = valorMostrado(
      catalogoTipos,
      'id_tipo_servicio',
      'nombre',
      servicio.id_tipo_servicio
    );
    campo(formServicio, 'id_tipo_servicio').value = servicio.id_tipo_servicio;

    seccion.querySelector('[data-campo="id_proveedor"]').value = valorMostrado(
      catalogoProveedores,
      'id_proveedor',
      'nombre',
      servicio.id_proveedor
    );
    campo(formServicio, 'id_proveedor').value = servicio.id_proveedor;

    if (servicio.id_destino) {
      seccion.querySelector('[data-campo="id_destino"]').value = valorMostrado(
        catalogoDestinos,
        'id_destino',
        'ciudad',
        servicio.id_destino
      );
      campo(formServicio, 'id_destino').value = servicio.id_destino;
    }

    campo(formServicio, 'estado').value = servicio.estado || 'activo';
  }

  formServicio.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = datosFormulario(formServicio);

      if (!data.id_tipo_servicio) {
        throw new Error('Escribe un tipo de servicio ya registrado (agrégalo en Catálogos de apoyo si no existe).');
      }
      if (!data.id_proveedor) {
        throw new Error('Escribe un proveedor ya registrado (agrégalo en Catálogos de apoyo si no existe).');
      }

      if (idServicioActual) {
        await enviarJSON(`/servicios/${idServicioActual}`, 'PUT', data);
        mostrarMensaje('Servicio actualizado', 'exito');
      } else {
        const resultado = await enviarJSON('/servicios', 'POST', data);
        idServicioActual = resultado.id_servicio;

        const tabAnterior = seccion.dataset.tab;
        seccion.dataset.tab = String(idServicioActual);
        const boton = document.querySelector(`.pestana[data-tab="${tabAnterior}"]`);
        boton.dataset.tab = String(idServicioActual);
        boton.querySelector('.pestana-texto').textContent = data.nombre;

        seccion.querySelector('.secciones-relacionadas').hidden = false;
        await Promise.all([
          cargarTarifas(seccion, idServicioActual),
          cargarCondiciones(seccion, idServicioActual),
          cargarIncluidos(seccion, idServicioActual),
          cargarArchivos(seccion, idServicioActual),
        ]);
        mostrarMensaje('Servicio creado', 'exito');
      }

      await cargarServicios();
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  });

  seccion.querySelector('.form-tarifa').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!idServicioActual) return;
    try {
      await enviarJSON(`/servicios/${idServicioActual}/tarifas`, 'POST', datosFormulario(e.target));
      e.target.reset();
      await cargarTarifas(seccion, idServicioActual);
      mostrarMensaje('Tarifa agregada', 'exito');
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  });

  seccion.querySelector('.form-condiciones').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!idServicioActual) return;
    try {
      await enviarJSON(`/servicios/${idServicioActual}/condiciones`, 'POST', datosFormulario(e.target));
      mostrarMensaje('Condiciones guardadas', 'exito');
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  });

  seccion.querySelector('.form-incluido').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!idServicioActual) return;
    try {
      await enviarJSON(`/servicios/${idServicioActual}/incluidos`, 'POST', datosFormulario(e.target));
      e.target.reset();
      await cargarIncluidos(seccion, idServicioActual);
      mostrarMensaje('Agregado a "incluye"', 'exito');
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  });

  seccion.querySelector('.form-no-incluido').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!idServicioActual) return;
    try {
      await enviarJSON(`/servicios/${idServicioActual}/no-incluidos`, 'POST', datosFormulario(e.target));
      e.target.reset();
      await cargarIncluidos(seccion, idServicioActual);
      mostrarMensaje('Agregado a "no incluye"', 'exito');
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  });

  seccion.querySelector('.form-archivo').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!idServicioActual) return;
    try {
      const formData = new FormData(e.target);
      if (!formData.get('id_tipo_archivo')) {
        throw new Error('Escribe un tipo de archivo ya registrado (agrégalo en Catálogos de apoyo si no existe).');
      }
      await enviarFormData(`/servicios/${idServicioActual}/archivos`, formData);
      e.target.reset();
      await cargarArchivos(seccion, idServicioActual);
      mostrarMensaje('Archivo subido', 'exito');
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  });

  if (servicio) {
    Promise.all([
      cargarTarifas(seccion, idServicioActual),
      cargarCondiciones(seccion, idServicioActual),
      cargarIncluidos(seccion, idServicioActual),
      cargarArchivos(seccion, idServicioActual),
    ]).catch((error) => mostrarMensaje(error.message, 'error'));
  }
}

// --- Abrir pestañas ---

async function abrirServicio(idServicio) {
  const tabId = String(idServicio);
  if (document.querySelector(`.pestana[data-tab="${tabId}"]`)) {
    cambiarPestana(tabId);
    return;
  }
  try {
    const servicio = await obtenerJSON(`/servicios/${idServicio}`);
    crearBotonPestana(tabId, servicio.nombre, true);

    const seccion = document.createElement('section');
    seccion.className = 'vista';
    seccion.dataset.tab = tabId;
    seccion.innerHTML = plantillaServicio(servicio);
    document.getElementById('contenedor-vistas').appendChild(seccion);

    inicializarSeccionServicio(seccion, servicio);
    cambiarPestana(tabId);
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

let contadorNuevoServicio = 0;

function abrirNuevoServicio() {
  // Cada clic abre una pestaña independiente (id unico), para poder tener
  // varios servicios nuevos sin guardar al mismo tiempo.
  contadorNuevoServicio += 1;
  const tabId = `nuevo-${contadorNuevoServicio}`;

  crearBotonPestana(tabId, '✏ Nuevo servicio', true);

  const seccion = document.createElement('section');
  seccion.className = 'vista';
  seccion.dataset.tab = tabId;
  seccion.innerHTML = plantillaServicio(null);
  document.getElementById('contenedor-vistas').appendChild(seccion);

  inicializarSeccionServicio(seccion, null);
  cambiarPestana(tabId);
}

document.getElementById('boton-nuevo-servicio').addEventListener('click', abrirNuevoServicio);

// --- Inicio ---

cargarCatalogos();
cargarServicios();
