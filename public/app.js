let serviciosCache = [];
let catalogoTipos = [];
let catalogoProveedores = [];
let catalogoDestinos = [];
let catalogoTiposArchivo = [];
let defectosIncluidos = [];
let defectosNoIncluidos = [];
let listaPaises = [];

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

// Usado por tarifas/condiciones/incluidos/archivos: esas secciones necesitan
// que el servicio ya tenga un id real (no sirven mientras esta sin guardar).
function requiereServicioGuardado(idServicioActual) {
  if (idServicioActual) return false;
  mostrarMensaje('Guarda el servicio primero (pestaña "Información básica").', 'error');
  return true;
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

// Texto que se muestra (y se compara al escribir) para un registro de
// catalogo. Los destinos combinan ciudad y pais; el resto usa su "nombre".
function textoDeItem(campoId, item) {
  if (campoId === 'id_destino') return [item.ciudad, item.pais].filter(Boolean).join(', ');
  return item.nombre;
}

// Busca en el catalogo el registro cuyo texto coincide exactamente (sin
// distinguir mayusculas) con lo que el usuario escribio, y devuelve su id.
function buscarIdPorTexto(catalogo, campoId, texto) {
  const encontrado = catalogo.find((item) => textoDeItem(campoId, item).toLowerCase() === texto.trim().toLowerCase());
  return encontrado ? String(encontrado[campoId]) : '';
}

// Calcula la duracion en dias a partir de las fechas de inicio y fin
// (ambas fechas cuentan, por eso se le suma 1: 10 al 12 = 3 dias).
function calcularDuracionTexto(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return '';

  const dias = Math.round((new Date(fechaFin) - new Date(fechaInicio)) / 86400000) + 1;
  if (dias <= 0) return 'Verifica las fechas';
  return dias === 1 ? '1 día' : `${dias} días`;
}

function valorMostrado(catalogo, campoId, id) {
  const encontrado = catalogo.find((item) => String(item[campoId]) === String(id));
  return encontrado ? textoDeItem(campoId, encontrado) : '';
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
    poblarFiltros();
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

// Llena un <select> de filtro conservando la opcion elegida si sigue existiendo.
function llenarSelectFiltro(select, opciones, campoId, textoDe) {
  const valorActual = select.value;
  select.innerHTML = '<option value="">Todos</option>';
  opciones.forEach((item) => {
    const option = document.createElement('option');
    option.value = item[campoId];
    option.textContent = textoDe(item);
    select.appendChild(option);
  });
  select.value = valorActual;
}

function poblarFiltros() {
  llenarSelectFiltro(document.getElementById('filtro-tipo'), catalogoTipos, 'id_tipo_servicio', (t) => t.nombre);
  llenarSelectFiltro(document.getElementById('filtro-proveedor'), catalogoProveedores, 'id_proveedor', (p) => p.nombre);
  llenarSelectFiltro(document.getElementById('filtro-destino'), catalogoDestinos, 'id_destino', (d) => textoDeItem('id_destino', d));
}

function campo(form, nombre) {
  return form.querySelector(`[name="${nombre}"]`);
}

// Devuelve el catalogo (siempre actualizado) que corresponde a cada campo.
function catalogoActualPara(campoId) {
  if (campoId === 'id_tipo_servicio') return catalogoTipos;
  if (campoId === 'id_proveedor') return catalogoProveedores;
  if (campoId === 'id_destino') return catalogoDestinos;
  if (campoId === 'id_tipo_archivo') return catalogoTiposArchivo;
  return [];
}

// Conecta un campo de texto con su lista de sugerencias: al escribir o
// enfocar, filtra el catalogo y muestra las coincidencias; al hacer clic en
// una, la selecciona y guarda su id en el input oculto.
function conectarAutocompletarCampo(input, campoId) {
  const inputOculto = input.nextElementSibling; // el input hidden va justo despues en el HTML
  const lista = inputOculto.nextElementSibling; // y la <ul class="sugerencias"> despues del hidden

  function mostrarSugerencias() {
    const texto = input.value.trim().toLowerCase();
    const catalogo = catalogoActualPara(campoId);
    const coincidencias = texto
      ? catalogo.filter((item) => textoDeItem(campoId, item).toLowerCase().includes(texto))
      : catalogo;

    if (coincidencias.length === 0) {
      lista.hidden = true;
      lista.innerHTML = '';
      return;
    }

    lista.innerHTML = coincidencias
      .map((item) => `<li data-id="${item[campoId]}" data-texto="${textoDeItem(campoId, item)}">${textoDeItem(campoId, item)}</li>`)
      .join('');
    lista.hidden = false;
  }

  input.addEventListener('focus', mostrarSugerencias);
  input.addEventListener('input', () => {
    inputOculto.value = buscarIdPorTexto(catalogoActualPara(campoId), campoId, input.value);
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

// Autocompletar simple para campos que no guardan un id, solo texto libre
// (ej. el pais de un destino): la sugerencia elegida se copia tal cual al input.
// alSeleccionar (opcional) se llama con el texto elegido, tanto al hacer
// clic en una sugerencia como al escribirlo manualmente y salir del campo.
function conectarAutocompletarTexto(input, obtenerOpciones, alSeleccionar) {
  const lista = input.nextElementSibling;

  function mostrarSugerencias() {
    const texto = input.value.trim().toLowerCase();
    const opciones = obtenerOpciones();
    const coincidencias = texto ? opciones.filter((o) => o.toLowerCase().includes(texto)) : opciones;

    if (coincidencias.length === 0) {
      lista.hidden = true;
      lista.innerHTML = '';
      return;
    }

    lista.innerHTML = coincidencias.map((o) => `<li data-texto="${o}">${o}</li>`).join('');
    lista.hidden = false;
  }

  input.addEventListener('focus', mostrarSugerencias);
  input.addEventListener('input', mostrarSugerencias);

  lista.addEventListener('mousedown', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    e.preventDefault();
    input.value = li.dataset.texto;
    lista.hidden = true;
    alSeleccionar?.(input.value);
  });

  input.addEventListener('blur', () => {
    lista.hidden = true;
    alSeleccionar?.(input.value);
  });
}

// Conecta todos los campos "escribir y autocompletar" que haya dentro de la
// pestaña del servicio (pueden ser varios: tipo, proveedor, destino, y el
// tipo de archivo tanto en la subpestaña de portada como en Documentos).
function inicializarAutocompletarServicio(seccion) {
  seccion.querySelectorAll('.campo-autocompletar').forEach((input) => {
    conectarAutocompletarCampo(input, input.dataset.campo);
  });
}

function manejarFormularioCatalogo(idFormulario, url, alRecargar = cargarCatalogos) {
  document.getElementById(idFormulario).addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await enviarJSON(url, 'POST', datosFormulario(e.target));
      e.target.reset();
      await alRecargar();
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

// --- Valores por defecto para servicios nuevos ---

async function cargarDefectos() {
  try {
    [defectosIncluidos, defectosNoIncluidos] = await Promise.all([
      obtenerJSON('/incluidos-defecto'),
      obtenerJSON('/no-incluidos-defecto'),
    ]);
    document.getElementById('lista-incluidos-defecto').innerHTML = listaOVacio(
      defectosIncluidos,
      (i) => i.descripcion,
      'incluidos-defecto',
      'id_incluido_defecto'
    );
    document.getElementById('lista-no-incluidos-defecto').innerHTML = listaOVacio(
      defectosNoIncluidos,
      (i) => i.descripcion,
      'no-incluidos-defecto',
      'id_no_incluido_defecto'
    );

    const condicionesDefecto = await obtenerJSON('/condiciones-defecto');
    const formCondicionesDefecto = document.getElementById('form-condiciones-defecto');
    campo(formCondicionesDefecto, 'politica_cancelacion').value = condicionesDefecto?.politica_cancelacion || '';
    campo(formCondicionesDefecto, 'requisitos').value = condicionesDefecto?.requisitos || '';
    campo(formCondicionesDefecto, 'notas').value = condicionesDefecto?.notas || '';
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

manejarFormularioCatalogo('form-incluido-defecto', '/incluidos-defecto', cargarDefectos);
manejarFormularioCatalogo('form-no-incluido-defecto', '/no-incluidos-defecto', cargarDefectos);

// --- Lista de paises (para elegir el pais de un destino sin escribirlo completo) ---

async function cargarPaises() {
  try {
    listaPaises = await obtenerJSON('/paises');
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

// --- Ciudades del pais elegido (para elegir la ciudad sin escribirla completa) ---

let ciudadesPorPais = {};

async function obtenerCiudadesDePais(pais) {
  if (!pais) return [];
  if (!ciudadesPorPais[pais]) {
    try {
      ciudadesPorPais[pais] = await obtenerJSON(`/ciudades?pais=${encodeURIComponent(pais)}`);
    } catch (error) {
      ciudadesPorPais[pais] = [];
    }
  }
  return ciudadesPorPais[pais];
}

const inputPaisDestino = document.querySelector('#form-destino .campo-pais');
const inputCiudadDestino = document.querySelector('#form-destino .campo-ciudad');

// Al elegir/escribir el pais, se precargan sus ciudades para que ya esten
// listas cuando el usuario pase al campo de ciudad.
conectarAutocompletarTexto(inputPaisDestino, () => listaPaises, obtenerCiudadesDePais);
conectarAutocompletarTexto(inputCiudadDestino, () => ciudadesPorPais[inputPaisDestino.value] || []);

document.getElementById('form-condiciones-defecto').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await enviarJSON('/condiciones-defecto', 'POST', datosFormulario(e.target));
    mostrarMensaje('Plantilla de condiciones guardada', 'exito');
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
});

document.getElementById('boton-eliminar-condiciones-defecto').addEventListener('click', async () => {
  if (!confirm('¿Eliminar la plantilla de condiciones por defecto?')) return;
  try {
    await fetch('/condiciones-defecto', { method: 'DELETE' });
    document.getElementById('form-condiciones-defecto').reset();
    mostrarMensaje('Plantilla eliminada', 'exito');
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
});

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
    await Promise.all([cargarCatalogos(), cargarDefectos()]);
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
    aplicarFiltrosYBusqueda();
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

// Conecta los botones Abrir/Archivar/Eliminar de una fila o tarjeta,
// sin importar si el elemento viene de la tabla o de la cuadricula.
function conectarAccionesServicio(elemento, servicio) {
  elemento.querySelector('.boton-abrir').addEventListener('click', () => abrirServicio(servicio.id_servicio));
  elemento.querySelector('.boton-ficha').addEventListener('click', () => window.open(`ficha.html?id=${servicio.id_servicio}`, '_blank'));
  elemento.querySelector('.boton-archivar').addEventListener('click', () => alternarArchivado(servicio));
  elemento.querySelector('.boton-eliminar').addEventListener('click', () => eliminarServicioDesdeTabla(servicio));
}

function botonesAccionServicio(servicio) {
  return `
    <button type="button" class="enlace-accion boton-abrir">Abrir</button>
    <button type="button" class="enlace-accion boton-ficha">📄 Ficha</button>
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

// --- Buscador + panel de filtros ---

function obtenerFiltrosActuales() {
  return {
    texto: document.getElementById('buscador-servicios').value.trim().toLowerCase(),
    tipo: document.getElementById('filtro-tipo').value,
    proveedor: document.getElementById('filtro-proveedor').value,
    destino: document.getElementById('filtro-destino').value,
    estado: document.getElementById('filtro-estado').value,
    fechaDesde: document.getElementById('filtro-fecha-desde').value,
    fechaHasta: document.getElementById('filtro-fecha-hasta').value,
    precioMin: document.getElementById('filtro-precio-min').value,
    precioMax: document.getElementById('filtro-precio-max').value,
  };
}

function servicioCumpleFiltros(servicio, filtros) {
  if (
    filtros.texto &&
    !servicio.nombre.toLowerCase().includes(filtros.texto) &&
    !(servicio.nombre_proveedor || '').toLowerCase().includes(filtros.texto)
  ) {
    return false;
  }
  if (filtros.tipo && String(servicio.id_tipo_servicio) !== filtros.tipo) return false;
  if (filtros.proveedor && String(servicio.id_proveedor) !== filtros.proveedor) return false;
  if (filtros.destino && String(servicio.id_destino) !== filtros.destino) return false;
  if (filtros.estado && servicio.estado !== filtros.estado) return false;
  if (filtros.fechaDesde && (!servicio.fecha_inicio || servicio.fecha_inicio < filtros.fechaDesde)) return false;
  if (filtros.fechaHasta && (!servicio.fecha_fin || servicio.fecha_fin > filtros.fechaHasta)) return false;
  if (filtros.precioMin && (servicio.tarifa_desde_precio == null || servicio.tarifa_desde_precio < Number(filtros.precioMin))) {
    return false;
  }
  if (filtros.precioMax && (servicio.tarifa_desde_precio == null || servicio.tarifa_desde_precio > Number(filtros.precioMax))) {
    return false;
  }
  return true;
}

function aplicarFiltrosYBusqueda() {
  const filtros = obtenerFiltrosActuales();
  const hayFiltrosActivos = Object.entries(filtros).some(([clave, valor]) => clave !== 'texto' && valor !== '');
  document.getElementById('boton-filtros').classList.toggle('activa', hayFiltrosActivos);

  renderizarServicios(serviciosCache.filter((s) => servicioCumpleFiltros(s, filtros)));
}

document.getElementById('buscador-servicios').addEventListener('input', aplicarFiltrosYBusqueda);

['filtro-tipo', 'filtro-proveedor', 'filtro-destino', 'filtro-estado', 'filtro-fecha-desde', 'filtro-fecha-hasta', 'filtro-precio-min', 'filtro-precio-max'].forEach(
  (id) => document.getElementById(id).addEventListener('input', aplicarFiltrosYBusqueda)
);

document.getElementById('boton-filtros').addEventListener('click', () => {
  document.getElementById('panel-filtros').hidden = !document.getElementById('panel-filtros').hidden;
});

document.getElementById('boton-limpiar-filtros').addEventListener('click', () => {
  document.getElementById('filtro-tipo').value = '';
  document.getElementById('filtro-proveedor').value = '';
  document.getElementById('filtro-destino').value = '';
  document.getElementById('filtro-estado').value = '';
  document.getElementById('filtro-fecha-desde').value = '';
  document.getElementById('filtro-fecha-hasta').value = '';
  document.getElementById('filtro-precio-min').value = '';
  document.getElementById('filtro-precio-max').value = '';
  aplicarFiltrosYBusqueda();
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
    <div class="subpestanas-servicio">
      <button type="button" class="subpestana-servicio activa" data-subtab-servicio="info">Información básica</button>
      <button type="button" class="subpestana-servicio" data-subtab-servicio="condiciones">Condiciones</button>
      <button type="button" class="subpestana-servicio" data-subtab-servicio="incluye">Incluye / No incluye</button>
      <button type="button" class="subpestana-servicio" data-subtab-servicio="documentos">Documentos</button>
    </div>

    <div class="subvista-servicio activa" data-subtab-servicio-contenido="info">
      <div class="tarjeta">
        <h3>Imagen de portada</h3>
        <form class="form-portada portada-fila">
          <label class="portada-actual" title="Clic para elegir una imagen">
            <span class="portada-preview"><span class="miniatura-placeholder">🖼</span></span>
            <input type="file" name="archivo" accept="image/*" required hidden />
          </label>
          <div class="portada-campos">
            <span class="portada-archivo-nombre texto-secundario">Ningún archivo elegido</span>
            <div class="autocompletar">
              <input type="text" class="campo-autocompletar" data-campo="id_tipo_archivo" placeholder="Tipo de archivo (imagen...)" autocomplete="off" required />
              <input type="hidden" name="id_tipo_archivo" />
              <ul class="sugerencias" hidden></ul>
            </div>
            <button type="submit">Subir portada</button>
          </div>
        </form>
      </div>

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
            <label>Fecha de inicio</label>
            <input type="date" name="fecha_inicio" value="${servicio?.fecha_inicio ?? ''}" />
          </div>
          <div>
            <label>Fecha de fin</label>
            <input type="date" name="fecha_fin" value="${servicio?.fecha_fin ?? ''}" />
          </div>
          <div>
            <label>Duración (calculada)</label>
            <input type="text" name="duracion" value="${servicio?.duracion ?? ''}" readonly />
          </div>
          <div>
            <label>Estado</label>
            <select name="estado">
              <option value="activo">activo</option>
              <option value="inactivo">inactivo</option>
            </select>
          </div>
          ${
            esNuevo
              ? `
            <div class="col-span-2 casilla-defectos">
              <label><input type="checkbox" name="usar_defectos" value="si" checked /> Usar valores por defecto (incluye, no incluye y condiciones)</label>
            </div>
          `
              : ''
          }
          <div class="col-span-2">
            <button type="submit">${esNuevo ? 'Guardar servicio' : 'Actualizar servicio'}</button>
          </div>
        </form>
      </div>

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
    </div>

    <div class="subvista-servicio" data-subtab-servicio-contenido="condiciones">
      <div class="tarjeta">
        <h3>Condiciones</h3>
        <form class="form-condiciones">
          <textarea name="politica_cancelacion" placeholder="Política de cancelación"></textarea>
          <textarea name="requisitos" placeholder="Requisitos"></textarea>
          <textarea name="notas" placeholder="Notas"></textarea>
          <button type="submit">Guardar condiciones</button>
          <button type="button" class="secundario boton-eliminar-condiciones">Eliminar condiciones</button>
        </form>
      </div>
    </div>

    <div class="subvista-servicio" data-subtab-servicio-contenido="incluye">
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
    </div>

    <div class="subvista-servicio" data-subtab-servicio-contenido="documentos">
      <div class="tarjeta">
        <h3>Documentos</h3>
        <form class="form-archivo grid-2">
          <input type="file" name="archivo" required />
          <div class="autocompletar">
            <input type="text" class="campo-autocompletar" data-campo="id_tipo_archivo" placeholder="Escribe o elige un tipo de archivo" autocomplete="off" required />
            <input type="hidden" name="id_tipo_archivo" />
            <ul class="sugerencias" hidden></ul>
          </div>
          <select name="uso">
            <option value="documento">documento</option>
            <option value="galeria">galeria</option>
            <option value="condiciones">condiciones</option>
          </select>
          <button type="submit" class="col-span-2">Subir documento</button>
        </form>
        <ul class="lista-archivos"></ul>
      </div>
    </div>
  `;
}

// --- Carga de datos relacionados dentro de una pestaña de servicio ---

// Genera un <li> con un texto y un boton "x" para eliminar ese elemento.
function liConBorrar(texto, idItem) {
  return `<li><span>${texto}</span><button type="button" class="eliminar-item" data-id="${idItem}">×</button></li>`;
}

async function cargarTarifas(seccion, idServicio) {
  const tarifas = await obtenerJSON(`/servicios/${idServicio}/tarifas`);
  seccion.querySelector('.lista-tarifas').innerHTML = tarifas
    .map((t) => liConBorrar(`${t.nombre_tarifa}: ${t.precio_base} ${t.moneda || ''}`, t.id_tarifa))
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
  seccion.querySelector('.lista-incluidos').innerHTML = incluidos
    .map((i) => liConBorrar(i.descripcion, i.id_incluido))
    .join('');
  seccion.querySelector('.lista-no-incluidos').innerHTML = noIncluidos
    .map((i) => liConBorrar(i.descripcion, i.id_no_incluido))
    .join('');
}

// Carga la lista de archivos del servicio y de paso actualiza la miniatura
// de portada (si alguno de esos archivos tiene uso = "portada").
async function cargarArchivos(seccion, idServicio) {
  const archivos = await obtenerJSON(`/servicios/${idServicio}/archivos`);
  seccion.querySelector('.lista-archivos').innerHTML = archivos
    .map((a) => liConBorrar(`<a href="${a.url_archivo}" target="_blank">${a.nombre_original}</a> (${a.uso})`, a.id_archivo))
    .join('');

  const portada = archivos.find((a) => a.uso === 'portada');
  seccion.querySelector('.portada-preview').innerHTML = portada
    ? `<img src="${portada.url_archivo}" alt="Portada" />`
    : '<span class="miniatura-placeholder">🖼</span>';
}

// Cambia entre las sub-pestañas (Información básica / Condiciones /
// Incluye / Documentos) de una pestaña de servicio en particular.
function inicializarSubpestanasServicio(seccion) {
  seccion.querySelectorAll('.subpestana-servicio').forEach((boton) => {
    boton.addEventListener('click', () => {
      const subtab = boton.dataset.subtabServicio;
      seccion.querySelectorAll('.subpestana-servicio').forEach((b) => b.classList.toggle('activa', b === boton));
      seccion
        .querySelectorAll('.subvista-servicio')
        .forEach((v) => v.classList.toggle('activa', v.dataset.subtabServicioContenido === subtab));
    });
  });
}

// --- Conecta los formularios de una pestaña de servicio con la API ---

function inicializarSeccionServicio(seccion, servicio) {
  let idServicioActual = servicio ? servicio.id_servicio : null;

  const formServicio = seccion.querySelector('.form-servicio');
  inicializarSubpestanasServicio(seccion);
  try {
    inicializarAutocompletarServicio(seccion);
  } catch (error) {
    mostrarMensaje(`No se pudo preparar el autocompletar: ${error.message}`, 'error');
  }

  // Recalcula la duracion cada vez que cambia la fecha de inicio o de fin.
  function actualizarDuracion() {
    const fechaInicio = campo(formServicio, 'fecha_inicio').value;
    const fechaFin = campo(formServicio, 'fecha_fin').value;
    campo(formServicio, 'duracion').value = calcularDuracionTexto(fechaInicio, fechaFin);
  }
  campo(formServicio, 'fecha_inicio').addEventListener('change', actualizarDuracion);
  campo(formServicio, 'fecha_fin').addEventListener('change', actualizarDuracion);

  if (servicio) {
    seccion.querySelector('[data-campo="id_tipo_servicio"]').value = valorMostrado(
      catalogoTipos,
      'id_tipo_servicio',
      servicio.id_tipo_servicio
    );
    campo(formServicio, 'id_tipo_servicio').value = servicio.id_tipo_servicio;

    seccion.querySelector('[data-campo="id_proveedor"]').value = valorMostrado(
      catalogoProveedores,
      'id_proveedor',
      servicio.id_proveedor
    );
    campo(formServicio, 'id_proveedor').value = servicio.id_proveedor;

    if (servicio.id_destino) {
      seccion.querySelector('[data-campo="id_destino"]').value = valorMostrado(
        catalogoDestinos,
        'id_destino',
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
    if (requiereServicioGuardado(idServicioActual)) return;
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
    if (requiereServicioGuardado(idServicioActual)) return;
    try {
      await enviarJSON(`/servicios/${idServicioActual}/condiciones`, 'POST', datosFormulario(e.target));
      mostrarMensaje('Condiciones guardadas', 'exito');
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  });

  seccion.querySelector('.form-incluido').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (requiereServicioGuardado(idServicioActual)) return;
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
    if (requiereServicioGuardado(idServicioActual)) return;
    try {
      await enviarJSON(`/servicios/${idServicioActual}/no-incluidos`, 'POST', datosFormulario(e.target));
      e.target.reset();
      await cargarIncluidos(seccion, idServicioActual);
      mostrarMensaje('Agregado a "no incluye"', 'exito');
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  });

  seccion.querySelector('.form-portada').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (requiereServicioGuardado(idServicioActual)) return;
    try {
      const formData = new FormData(e.target);
      if (!formData.get('id_tipo_archivo')) {
        throw new Error('Escribe un tipo de archivo ya registrado (agrégalo en Catálogos de apoyo si no existe).');
      }
      formData.set('uso', 'portada');
      await enviarFormData(`/servicios/${idServicioActual}/archivos`, formData);
      e.target.reset();
      await cargarArchivos(seccion, idServicioActual);
      mostrarMensaje('Portada actualizada', 'exito');
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  });

  seccion.querySelector('.form-archivo').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (requiereServicioGuardado(idServicioActual)) return;
    try {
      const formData = new FormData(e.target);
      if (!formData.get('id_tipo_archivo')) {
        throw new Error('Escribe un tipo de archivo ya registrado (agrégalo en Catálogos de apoyo si no existe).');
      }
      await enviarFormData(`/servicios/${idServicioActual}/archivos`, formData);
      e.target.reset();
      await cargarArchivos(seccion, idServicioActual);
      mostrarMensaje('Documento subido', 'exito');
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  });

  // Muestra el nombre del archivo elegido para la portada (el input queda oculto).
  seccion.querySelector('.form-portada [name="archivo"]').addEventListener('change', (e) => {
    const nombre = e.target.files[0]?.name || 'Ningún archivo elegido';
    seccion.querySelector('.portada-archivo-nombre').textContent = nombre;
  });

  seccion.querySelector('.boton-eliminar-condiciones').addEventListener('click', async () => {
    if (requiereServicioGuardado(idServicioActual)) return;
    if (!confirm('¿Eliminar las condiciones de este servicio?')) return;
    try {
      await fetch(`/servicios/${idServicioActual}/condiciones`, { method: 'DELETE' });
      seccion.querySelector('.form-condiciones').reset();
      mostrarMensaje('Condiciones eliminadas', 'exito');
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  });

  // Conecta el boton "x" de una lista (tarifas, incluidos, no incluidos o
  // archivos) con su endpoint de borrado y vuelve a cargar esa lista.
  function conectarBorradoDeLista(selectorLista, endpoint, recargar) {
    seccion.querySelector(selectorLista).addEventListener('click', async (e) => {
      const boton = e.target.closest('.eliminar-item');
      if (!boton) return;
      if (!confirm('¿Eliminar este elemento?')) return;
      try {
        const respuesta = await fetch(`/servicios/${idServicioActual}/${endpoint}/${boton.dataset.id}`, { method: 'DELETE' });
        if (!respuesta.ok) throw new Error(`No se pudo eliminar (código ${respuesta.status})`);
        await recargar();
        mostrarMensaje('Eliminado correctamente', 'exito');
      } catch (error) {
        mostrarMensaje(error.message, 'error');
      }
    });
  }

  conectarBorradoDeLista('.lista-tarifas', 'tarifas', () => cargarTarifas(seccion, idServicioActual));
  conectarBorradoDeLista('.lista-incluidos', 'incluidos', () => cargarIncluidos(seccion, idServicioActual));
  conectarBorradoDeLista('.lista-no-incluidos', 'no-incluidos', () => cargarIncluidos(seccion, idServicioActual));
  conectarBorradoDeLista('.lista-archivos', 'archivos', () => cargarArchivos(seccion, idServicioActual));

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
cargarDefectos();
cargarPaises();
cargarServicios();
