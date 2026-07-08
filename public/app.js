let serviciosCache = [];
let catalogoTipos = [];
let catalogoProveedores = [];
let catalogoDestinos = [];
let catalogoTiposArchivo = [];
let defectosIncluidos = [];
let defectosNoIncluidos = [];
let listaPaises = [];

// Icono de basurero (lineas, hereda el color del boton con currentColor).
const ICONO_BASURERO = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;

// Icono de etiqueta de precio (para el titulo "Tarifas").
const ICONO_ETIQUETA = `<svg class="icono-titulo" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`;

// Icono de subir (flecha hacia arriba con bandeja).
const ICONO_SUBIR = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`;

// Icono de informacion (circulo con "i").
const ICONO_INFO = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

// Icono de robot (para la tarjeta "Extraer datos con IA").
const ICONO_ROBOT = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="2"></rect><path d="M12 8V4"></path><circle cx="12" cy="3" r="1"></circle><line x1="8.5" y1="13" x2="8.5" y2="15"></line><line x1="15.5" y1="13" x2="15.5" y2="15"></line></svg>`;

// Iconos de los encabezados de "Detalles del servicio".
const ICONO_ESCUDO = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>`;
const ICONO_CHECKLIST = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`;
const ICONO_DOCUMENTO = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;

// Iconos de linea para los items de incluye / no incluye y acciones.
const ICONO_CHECK_CIRCULO = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
const ICONO_EQUIS_CIRCULO = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
const ICONO_DESCARGAR = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;

// Iconos de archivo en la tabla de documentos (PDF en rojo, imagen en azul).
const ICONO_PDF = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e5484d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13h1.5a1.5 1.5 0 0 1 0 3H9v-3z" stroke-width="1.4"></path><path d="M9 13v4" stroke-width="1.4"></path></svg>`;
const ICONO_IMAGEN = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;

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

// Como la de arriba, pero mostrando el mensaje de error real que mande el
// servidor (util para la IA: "falta API key", "proveedor no configurado"...).
async function enviarFormDataConError(url, formData) {
  const respuesta = await fetch(url, { method: 'POST', body: formData });
  const cuerpo = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(cuerpo.error || `Error (código ${respuesta.status})`);
  }
  return cuerpo;
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

// Adivina el tipo de archivo (imagen/documento) a partir del mime-type, y lo
// crea en el catalogo si todavia no existe. Asi no hay que preguntarle al
// usuario el tipo de archivo cada vez que sube una portada o un documento.
async function inferirTipoArchivo(mimeType) {
  const nombre = mimeType.startsWith('image/') ? 'imagen' : mimeType === 'application/pdf' ? 'documento' : 'archivo';
  const existente = catalogoTiposArchivo.find((t) => t.nombre.toLowerCase() === nombre);
  if (existente) return existente.id_tipo_archivo;

  const resultado = await enviarJSON('/tipos-archivo', 'POST', { nombre });
  await cargarCatalogos();
  return resultado.id_tipo_archivo;
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

// Que endpoint y que datos usar para crear un registro nuevo al vuelo desde
// el propio autocompletar, cuando lo que se escribe no existe todavia.
const CREACION_RAPIDA_POR_CAMPO = {
  id_tipo_servicio: { endpoint: 'tipos-servicio', construirDatos: (texto) => ({ nombre: texto }) },
  id_proveedor: { endpoint: 'proveedores', construirDatos: (texto) => ({ nombre: texto }) },
  id_tipo_archivo: { endpoint: 'tipos-archivo', construirDatos: (texto) => ({ nombre: texto }) },
  id_destino: {
    endpoint: 'destinos',
    construirDatos: (texto) => {
      const [ciudad, pais] = texto.split(',').map((parte) => parte.trim());
      return pais ? { ciudad, pais } : { ciudad };
    },
  },
};

// Crea el registro con el texto escrito, lo selecciona, y refresca los
// catalogos para que quede disponible en cualquier otro campo/pestaña abierta.
async function crearDesdeAutocompletar(campoId, texto, input, inputOculto) {
  const config = CREACION_RAPIDA_POR_CAMPO[campoId];
  try {
    const resultado = await enviarJSON(`/${config.endpoint}`, 'POST', config.construirDatos(texto));
    input.value = texto;
    inputOculto.value = resultado[campoId];
    await cargarCatalogos();
    mostrarMensaje('Agregado al catálogo', 'exito');
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

// Conecta un campo de texto con su lista de sugerencias: al escribir o
// enfocar, filtra el catalogo y muestra las coincidencias; al hacer clic en
// una, la selecciona y guarda su id en el input oculto. Si lo escrito no
// coincide con nada, ofrece un "+ Agregar" para crearlo sin salir de aqui.
function conectarAutocompletarCampo(input, campoId) {
  // Se buscan por selector dentro del contenedor (no por nextElementSibling)
  // porque algunos campos, como Destino, intercalan otros elementos (el icono
  // de pin) entre el input y la lista de sugerencias.
  const contenedor = input.closest('.autocompletar');
  const inputOculto = contenedor.querySelector('input[type="hidden"]');
  const lista = contenedor.querySelector('.sugerencias');

  function mostrarSugerencias() {
    const texto = input.value.trim();
    const catalogo = catalogoActualPara(campoId);
    const coincidencias = texto
      ? catalogo.filter((item) => textoDeItem(campoId, item).toLowerCase().includes(texto.toLowerCase()))
      : catalogo;

    let html = coincidencias
      .map((item) => `<li data-id="${item[campoId]}" data-texto="${textoDeItem(campoId, item)}">${textoDeItem(campoId, item)}</li>`)
      .join('');

    const hayCoincidenciaExacta = catalogo.some((item) => textoDeItem(campoId, item).toLowerCase() === texto.toLowerCase());
    if (texto && !hayCoincidenciaExacta && CREACION_RAPIDA_POR_CAMPO[campoId]) {
      html += `<li class="sugerencia-crear" data-crear="${texto}">➕ Agregar "${texto}"</li>`;
    }

    if (!html) {
      lista.hidden = true;
      lista.innerHTML = '';
      return;
    }

    lista.innerHTML = html;
    lista.hidden = false;
  }

  input.addEventListener('focus', mostrarSugerencias);
  input.addEventListener('input', () => {
    inputOculto.value = buscarIdPorTexto(catalogoActualPara(campoId), campoId, input.value);
    mostrarSugerencias();
  });

  // mousedown (no click) + preventDefault evita que el input pierda el foco
  // antes de registrar la seleccion, que es lo que ocultaria la lista primero.
  lista.addEventListener('mousedown', async (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    e.preventDefault();
    lista.hidden = true;

    if (li.dataset.crear) {
      await crearDesdeAutocompletar(campoId, li.dataset.crear, input, inputOculto);
      return;
    }

    input.value = li.dataset.texto;
    inputOculto.value = li.dataset.id;
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

// --- Configuración de IA (que proveedor usar y su API key) ---

let modelosPorDefectoIA = {};
let modelosGuardadosIA = {};

function actualizarPlaceholderModeloIA() {
  const form = document.getElementById('form-configuracion-ia');
  const proveedor = campo(form, 'proveedor').value;
  const campoModelo = campo(form, 'modelo');
  campoModelo.value = modelosGuardadosIA[proveedor] || '';
  campoModelo.placeholder = `Por defecto: ${modelosPorDefectoIA[proveedor] || '...'}`;
}

async function cargarConfiguracionIA() {
  try {
    const config = await obtenerJSON('/ia/configuracion');
    const form = document.getElementById('form-configuracion-ia');
    if (config.proveedor) campo(form, 'proveedor').value = config.proveedor;

    modelosPorDefectoIA = config.modelosPorDefecto;
    modelosGuardadosIA = config.modelos;
    actualizarPlaceholderModeloIA();

    const estado = document.getElementById('estado-configuracion-ia');
    if (config.proveedoresConKey.length === 0) {
      estado.textContent = 'Todavía no configuraste ninguna API key.';
    } else {
      estado.textContent = `Proveedor activo: ${config.proveedor}. Con API key guardada: ${config.proveedoresConKey.join(', ')}.`;
    }
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

campo(document.getElementById('form-configuracion-ia'), 'proveedor').addEventListener('change', actualizarPlaceholderModeloIA);

document.getElementById('form-configuracion-ia').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await enviarJSON('/ia/configuracion', 'POST', datosFormulario(e.target));
    campo(e.target, 'apiKey').value = '';
    await cargarConfiguracionIA();
    mostrarMensaje('Configuración de IA guardada', 'exito');
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
});

document.getElementById('boton-eliminar-api-key').addEventListener('click', async () => {
  const form = document.getElementById('form-configuracion-ia');
  const proveedor = campo(form, 'proveedor').value;
  if (!confirm(`¿Eliminar la API key guardada de ${proveedor}?`)) return;

  try {
    await fetch(`/ia/configuracion/${proveedor}`, { method: 'DELETE' });
    campo(form, 'apiKey').value = '';
    await cargarConfiguracionIA();
    mostrarMensaje('API key eliminada', 'exito');
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
});

async function cargarEstadisticasIA() {
  try {
    const stats = await obtenerJSON('/ia/estadisticas');
    const contenedor = document.getElementById('estadisticas-ia');

    if (stats.total === 0) {
      contenedor.innerHTML = '<p class="texto-secundario">Todavía no se ha usado la extracción con IA.</p>';
      return;
    }

    const filasProveedor = stats.porProveedor
      .map(
        (p) =>
          `<li>${p.proveedor}: ${p.total} intento${p.total === 1 ? '' : 's'} (${p.exitosos} exitoso${p.exitosos === 1 ? '' : 's'})</li>`
      )
      .join('');

    contenedor.innerHTML = `
      <p><strong>${stats.total}</strong> extracción${stats.total === 1 ? '' : 'es'} en total ·
      <strong>${stats.exitosos}</strong> exitosa${stats.exitosos === 1 ? '' : 's'} ·
      <strong>${stats.fallidos}</strong> fallida${stats.fallidos === 1 ? '' : 's'}</p>
      <ul class="lista-catalogo">${filasProveedor}</ul>
      <p class="texto-secundario">Último uso: ${new Date(stats.ultimoUso).toLocaleString('es')}</p>
    `;
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

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

// Subpestañas internas de "Servicios": la lista normal y "Servicios por calendario".
document.querySelectorAll('.subpestana-interna').forEach((boton) => {
  boton.addEventListener('click', () => {
    const sub = boton.dataset.subtabInterna;
    document.querySelectorAll('.subpestana-interna').forEach((b) => b.classList.toggle('activa', b === boton));
    document
      .querySelectorAll('.subvista-interna')
      .forEach((v) => v.classList.toggle('activa', v.dataset.subtabInternaContenido === sub));
    if (sub === 'calendario') cargarCalendarioVencimientos();
  });
});

// --- Servicios por calendario (usa la API de control-tiempo) ---

// Texto legible del vencimiento de un item, a partir de su estado y desglose.
function textoVencimiento(item) {
  const d = item.dias_restantes;
  if (item.estado === 'vencido') return `Venció hace ${Math.abs(d)} día${Math.abs(d) === 1 ? '' : 's'}`;
  if (item.estado === 'vence_hoy') return 'Vence hoy';

  const g = item.desglose;
  const partes = [];
  if (g.anios) partes.push(`${g.anios} año${g.anios === 1 ? '' : 's'}`);
  if (g.meses) partes.push(`${g.meses} mes${g.meses === 1 ? '' : 'es'}`);
  if (g.dias) partes.push(`${g.dias} día${g.dias === 1 ? '' : 's'}`);
  return `Vence en ${partes.join(', ') || '0 días'}`;
}

function seccionCalendario(titulo, items, claseEstado) {
  if (!items.length) return '';
  const filas = items
    .map(
      (i) => `
      <li>
        <span class="venc-nombre"><span class="badge-tipo">${i.tipo}</span> ${i.nombre}</span>
        <span class="venc-fecha">${i.fecha_fin}</span>
        <span class="venc-estado ${claseEstado}">${textoVencimiento(i)}</span>
      </li>`
    )
    .join('');
  return `<div class="seccion-venc"><h3 class="titulo-venc ${claseEstado}">${titulo} (${items.length})</h3><ul class="lista-venc">${filas}</ul></div>`;
}

async function cargarCalendarioVencimientos() {
  const umbral = document.getElementById('umbral-vencimiento').value;
  try {
    const data = await obtenerJSON(`/control-tiempo/resumen?umbral=${umbral}`);

    document.getElementById('tiles-vencimiento').innerHTML = `
      <div class="tile-venc venc-vencido"><span class="tile-num">${data.resumen.vencidos}</span><span>Vencidos</span></div>
      <div class="tile-venc venc-hoy"><span class="tile-num">${data.resumen.vence_hoy}</span><span>Vence hoy</span></div>
      <div class="tile-venc venc-proximo"><span class="tile-num">${data.resumen.proximos}</span><span>Próximos (${umbral} d)</span></div>
      <div class="tile-venc venc-vigente"><span class="tile-num">${data.resumen.vigentes}</span><span>Vigentes</span></div>
    `;

    const html =
      seccionCalendario('Vencidos', data.vencidos, 'venc-vencido') +
      seccionCalendario('Vence hoy', data.venceHoy, 'venc-hoy') +
      seccionCalendario('Próximos a vencer', data.proximos, 'venc-proximo') +
      seccionCalendario('Vigentes', data.vigentes, 'venc-vigente');

    document.getElementById('lista-calendario').innerHTML =
      html || '<p class="texto-secundario">No hay servicios ni tarifas con fecha de fin registrada.</p>';
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

document.getElementById('umbral-vencimiento').addEventListener('change', cargarCalendarioVencimientos);

// Subpestañas dentro de "Opciones" (por ahora solo "IA", pero deja espacio
// para agregar mas configuraciones despues sin rehacer la navegacion).
document.querySelectorAll('.subpestana-opciones').forEach((boton) => {
  boton.addEventListener('click', () => {
    const subtab = boton.dataset.subtabOpciones;
    document.querySelectorAll('.subpestana-opciones').forEach((b) => b.classList.toggle('activa', b === boton));
    document
      .querySelectorAll('.subvista-opciones-contenido')
      .forEach((v) => v.classList.toggle('activa', v.dataset.subtabOpcionesContenido === subtab));
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

let contadorFormulariosServicio = 0;

function plantillaServicio(servicio) {
  const esNuevo = !servicio;
  const sufijoFormularios = contadorFormulariosServicio++;
  const idFormularioServicio = `form-servicio-${sufijoFormularios}`;
  const idFormularioTarifa = `form-tarifa-${sufijoFormularios}`;

  return `
    <div class="servicio-layout">
    <aside class="panel-portada">
      <h4>Portada</h4>
      <div class="portada-preview preview-lateral"><span class="miniatura-placeholder">🖼</span></div>
      <p class="texto-secundario">Se define en "Información básica".</p>
    </aside>
    <div class="servicio-contenido">
    <div class="subpestanas-servicio">
      <button type="button" class="subpestana-servicio activa" data-subtab-servicio="info">${ICONO_INFO} Información básica</button>
      <button type="button" class="subpestana-servicio" data-subtab-servicio="detalles">${ICONO_CHECKLIST} Detalles del servicio</button>
    </div>

    <div class="subvista-servicio activa" data-subtab-servicio-contenido="info">
      ${
        esNuevo
          ? `
      <div class="tarjeta tarjeta-ia">
        <div class="tarjeta-ia-icono">${ICONO_ROBOT}</div>
        <div class="tarjeta-ia-texto">
          <h3>Extraer datos con IA</h3>
          <p class="texto-secundario">Sube una foto o un PDF y la IA completará automáticamente los campos relevantes del servicio.</p>
        </div>
        <div class="tarjeta-ia-acciones">
          <label class="boton-subir-ia">
            ${ICONO_SUBIR} Subir imagen o PDF
            <input type="file" class="campo-imagen-ia" accept="image/*" hidden />
          </label>
          <button type="button" class="enlace-info boton-info-ia">Más información ${ICONO_INFO}</button>
        </div>
      </div>
      <p class="texto-secundario estado-extraccion-ia"></p>
      `
          : ''
      }

      <form class="form-servicio" id="${idFormularioServicio}">
        <div class="tarjeta">
          <h2>📄 ${esNuevo ? 'Información básica' : 'Datos del servicio'}</h2>
          <div class="grid-2">
            <div>
              <label>Nombre del servicio</label>
              <input type="text" name="nombre" placeholder="Ej. City Tour por Cartagena" required value="${servicio?.nombre ?? ''}" />
            </div>
            <div class="autocompletar">
              <label>Tipo de servicio</label>
              <input type="text" class="campo-autocompletar" data-campo="id_tipo_servicio" placeholder="Selecciona un tipo" autocomplete="off" required />
              <input type="hidden" name="id_tipo_servicio" />
              <ul class="sugerencias" hidden></ul>
            </div>
            <div class="autocompletar">
              <label>Proveedor</label>
              <input type="text" class="campo-autocompletar" data-campo="id_proveedor" placeholder="Ej. Andes Travel S.A.S." autocomplete="off" required />
              <input type="hidden" name="id_proveedor" />
              <ul class="sugerencias" hidden></ul>
            </div>
            <div class="autocompletar campo-con-icono">
              <label>Destino</label>
              <input type="text" class="campo-autocompletar" data-campo="id_destino" placeholder="Ej. Cartagena, Colombia" autocomplete="off" />
              <input type="hidden" name="id_destino" />
              <span class="icono-campo">📍</span>
              <ul class="sugerencias" hidden></ul>
            </div>
            <div class="col-span-2">
              <label>Estado</label>
              <select name="estado">
                <option value="activo">🟢 Activo</option>
                <option value="inactivo">🔴 Inactivo</option>
              </select>
            </div>
            <div class="col-span-2 campo-con-contador">
              <label>Descripción</label>
              <textarea name="descripcion" maxlength="1000" placeholder="Describe los detalles del servicio, qué incluye, recomendaciones, etc.">${servicio?.descripcion ?? ''}</textarea>
              <span class="contador-caracteres">${(servicio?.descripcion ?? '').length} / 1000</span>
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
          </div>
        </div>

        <div class="tarjeta">
          <div class="grid-3">
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
              <input type="text" class="campo-bloqueado" name="duracion" value="${servicio?.duracion ?? ''}" placeholder="— — —" readonly />
            </div>
          </div>
        </div>
      </form>

      <div class="tarjeta">
        <div class="tarjeta-header">
          <div>
            <h3>${ICONO_ETIQUETA} Tarifas</h3>
            <p class="texto-secundario">Define las tarifas disponibles para este servicio.</p>
          </div>
          <button type="submit" form="${idFormularioTarifa}">+ Agregar tarifa</button>
        </div>
        <form class="form-tarifa" id="${idFormularioTarifa}">
          <table class="tabla-tarifas">
            <thead>
              <tr>
                <th>Nombre tarifa</th>
                <th>Precio</th>
                <th>Moneda</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="text" name="nombre_tarifa" placeholder="Ej. Adulto" required /></td>
                <td><input type="number" step="0.01" min="0" name="precio_base" placeholder="0.00" required /></td>
                <td><input type="text" name="moneda" placeholder="USD" /></td>
                <td>
                  <select name="estado">
                    <option value="activo">🟢 Activo</option>
                    <option value="inactivo">🔴 Inactivo</option>
                  </select>
                </td>
                <td><button type="reset" class="boton-borrar-fila" title="Limpiar esta fila">${ICONO_BASURERO}</button></td>
              </tr>
            </tbody>
            <tbody class="lista-tarifas"></tbody>
          </table>
        </form>
        <p class="texto-secundario">ℹ️ Puedes agregar múltiples tarifas para este servicio.</p>
      </div>

      <div class="tarjeta">
        <div class="tarjeta-titulo-icono">
          <span class="icono-encabezado">🖼</span>
          <div>
            <h3>Imagen de portada</h3>
            <p class="texto-secundario">Se usa como imagen principal del servicio en el catálogo y la ficha.</p>
          </div>
        </div>
        <div class="portada-fila">
          <label class="zona-arrastrar zona-portada">
            <span class="icono-subir">${ICONO_SUBIR}</span>
            <span>Arrastra y suelta una imagen aquí</span>
            <span class="enlace-info">o haz clic para seleccionar</span>
            <small>JPG, PNG o WebP. Máx. 5 MB.</small>
            <input type="file" class="campo-subir-portada" accept="image/*" hidden />
          </label>
          <div class="portada-preview-fila">
            <span class="portada-preview"></span>
          </div>
        </div>
      </div>

      <div class="barra-acciones-servicio">
        <button type="button" class="secundario boton-cancelar-servicio">Cancelar</button>
        <button type="submit" form="${idFormularioServicio}">💾 ${esNuevo ? 'Guardar servicio' : 'Actualizar servicio'}</button>
      </div>
    </div>

    <div class="subvista-servicio" data-subtab-servicio-contenido="detalles">
      <div class="encabezado-detalles">
        <h2>Detalles del servicio</h2>
        <p class="texto-secundario">Administra condiciones, inclusiones y archivos del servicio en una sola vista.</p>
      </div>

      <div class="tarjeta">
        <div class="tarjeta-titulo-icono">
          <span class="icono-encabezado">${ICONO_ESCUDO}</span>
          <div>
            <h3>Condiciones</h3>
            <p class="texto-secundario">Define la política de cancelación, requisitos y notas importantes del servicio.</p>
          </div>
        </div>
        <form class="form-condiciones" id="form-condiciones-${sufijoFormularios}">
          <div class="campo-condicion">
            <label>Política de cancelación</label>
            <div class="campo-con-contador">
              <textarea name="politica_cancelacion" maxlength="1000" placeholder="Ej. La cancelación debe realizarse con al menos 48 horas de anticipación para reembolso completo."></textarea>
              <span class="contador-caracteres">0 / 1000</span>
            </div>
          </div>
          <div class="campo-condicion">
            <label>Requisitos</label>
            <div class="campo-con-contador">
              <textarea name="requisitos" maxlength="1000" placeholder="Ej. Pasaporte vigente, confirmación de reserva, vacunación según destino."></textarea>
              <span class="contador-caracteres">0 / 1000</span>
            </div>
          </div>
          <div class="campo-condicion">
            <label>Notas</label>
            <div class="campo-con-contador">
              <textarea name="notas" maxlength="1000" placeholder="Ej. Llevar ropa cómoda, protector solar y documento de identidad."></textarea>
              <span class="contador-caracteres">0 / 1000</span>
            </div>
          </div>
        </form>
      </div>

      <div class="tarjeta">
        <div class="tarjeta-titulo-icono">
          <span class="icono-encabezado">${ICONO_CHECKLIST}</span>
          <div>
            <h3>Incluye / No incluye</h3>
            <p class="texto-secundario">Administra los servicios que están incluidos y los que no están incluidos.</p>
          </div>
        </div>
        <div class="grid-2">
          <div class="panel-incluye">
            <h4 class="titulo-incluye"><span class="icono-verde">${ICONO_CHECK_CIRCULO}</span> Incluye</h4>
            <form class="form-incluido fila-agregar">
              <input type="text" name="descripcion" placeholder="Ej. Transporte ida y vuelta" required />
              <button type="submit">Agregar</button>
            </form>
            <ul class="lista-incluidos lista-items"></ul>
          </div>

          <div class="panel-incluye">
            <h4 class="titulo-no-incluye"><span class="icono-rojo">${ICONO_EQUIS_CIRCULO}</span> No incluye</h4>
            <form class="form-no-incluido fila-agregar">
              <input type="text" name="descripcion" placeholder="Ej. Propinas" required />
              <button type="submit">Agregar</button>
            </form>
            <ul class="lista-no-incluidos lista-items"></ul>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <div class="tarjeta-titulo-icono">
          <span class="icono-encabezado">${ICONO_DOCUMENTO}</span>
          <div>
            <h3>Documentos</h3>
            <p class="texto-secundario">Sube y administra los documentos relacionados con el servicio.</p>
          </div>
          <div class="documentos-subir">
            <div class="documentos-subir-campo">
              <label>Tipo de archivo</label>
              <select class="select-tipo-documento">
                <option value="">Selecciona un tipo</option>
              </select>
            </div>
            <div class="documentos-subir-campo">
              <label>Archivo</label>
              <div class="elegir-archivo-fila">
                <label class="boton secundario boton-elegir-archivo">
                  Elegir archivo
                  <input type="file" class="campo-subir-documento" accept="image/*,application/pdf" hidden />
                </label>
                <span class="nombre-archivo-elegido texto-secundario">Ningún archivo</span>
              </div>
            </div>
          </div>
        </div>
        <div class="documentos-cuerpo">
          <label class="zona-arrastrar zona-documentos">
            <span class="icono-subir">${ICONO_SUBIR}</span>
            <span>Arrastra y suelta archivos aquí</span>
            <span class="enlace-info">o haz clic para seleccionar</span>
            <small>PDF, JPG, PNG. Máx. 10 MB por archivo.</small>
            <input type="file" class="campo-soltar-documento" accept="image/*,application/pdf" hidden />
          </label>
          <table class="tabla-documentos">
            <thead>
              <tr>
                <th>Archivo</th>
                <th>Tipo</th>
                <th>Tamaño</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody class="lista-archivos"></tbody>
          </table>
        </div>
      </div>

      <div class="barra-acciones-servicio">
        <button type="button" class="secundario boton-cancelar-servicio">Cancelar</button>
        <button type="submit" form="form-condiciones-${sufijoFormularios}">💾 Guardar cambios</button>
      </div>
    </div>
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
    .map(
      (t) => `
        <tr>
          <td>${t.nombre_tarifa}</td>
          <td>${t.precio_base}</td>
          <td>${t.moneda || ''}</td>
          <td><span class="badge ${t.estado}">${t.estado || '-'}</span></td>
          <td><button type="button" class="boton-borrar-fila eliminar-item" data-id="${t.id_tarifa}" title="Eliminar tarifa">${ICONO_BASURERO}</button></td>
        </tr>
      `
    )
    .join('');
}

async function cargarCondiciones(seccion, idServicio) {
  const condiciones = await obtenerJSON(`/servicios/${idServicio}/condiciones`);
  const form = seccion.querySelector('.form-condiciones');
  campo(form, 'politica_cancelacion').value = condiciones?.politica_cancelacion || '';
  campo(form, 'requisitos').value = condiciones?.requisitos || '';
  campo(form, 'notas').value = condiciones?.notas || '';
}

// Un item de incluye/no incluye: icono (check verde o X roja) + texto + basurero.
function liItemIncluye(icono, texto, idItem) {
  return `<li><span class="item-texto">${icono}<span>${texto}</span></span><button type="button" class="boton-borrar-fila eliminar-item" data-id="${idItem}" title="Eliminar">${ICONO_BASURERO}</button></li>`;
}

async function cargarIncluidos(seccion, idServicio) {
  const incluidos = await obtenerJSON(`/servicios/${idServicio}/incluidos`);
  const noIncluidos = await obtenerJSON(`/servicios/${idServicio}/no-incluidos`);
  seccion.querySelector('.lista-incluidos').innerHTML = incluidos
    .map((i) => liItemIncluye(`<span class="icono-verde">${ICONO_CHECK_CIRCULO}</span>`, i.descripcion, i.id_incluido))
    .join('');
  seccion.querySelector('.lista-no-incluidos').innerHTML = noIncluidos
    .map((i) => liItemIncluye(`<span class="icono-rojo">${ICONO_EQUIS_CIRCULO}</span>`, i.descripcion, i.id_no_incluido))
    .join('');
}

// Convierte bytes a un texto legible (KB / MB).
function formatearTamano(bytes) {
  if (!bytes) return '-';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Carga la lista de archivos del servicio: los documentos van a la tabla, y la
// imagen con uso "portada" actualiza la miniatura de portada.
async function cargarArchivos(seccion, idServicio) {
  const archivos = await obtenerJSON(`/servicios/${idServicio}/archivos`);
  const documentos = archivos.filter((a) => a.uso !== 'portada');

  seccion.querySelector('.lista-archivos').innerHTML = documentos.length
    ? documentos
        .map(
          (a) => `
        <tr>
          <td class="celda-archivo">${a.mime_type === 'application/pdf' ? ICONO_PDF : ICONO_IMAGEN} ${a.nombre_original}</td>
          <td>${a.uso}</td>
          <td>${formatearTamano(a.tamano_bytes)}</td>
          <td><span class="badge activo">Subido</span></td>
          <td class="acciones-documento">
            <a class="boton-accion-doc" href="${a.url_archivo}" download title="Descargar">${ICONO_DESCARGAR}</a>
            <button type="button" class="boton-borrar-fila eliminar-item" data-id="${a.id_archivo}" title="Eliminar">${ICONO_BASURERO}</button>
          </td>
        </tr>`
        )
        .join('')
    : `<tr><td colspan="5" class="texto-secundario" style="text-align:center">Aún no hay documentos.</td></tr>`;

  const portada = archivos.find((a) => a.uso === 'portada');
  const htmlPortada = portada
    ? `<img src="${portada.url_archivo}" alt="Portada" />`
    : '<span class="miniatura-placeholder">🖼</span>';
  // Hay dos previsualizaciones: la del panel lateral y la del area de subida.
  seccion.querySelectorAll('.portada-preview').forEach((el) => (el.innerHTML = htmlPortada));
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

// Copia lo que devolvio la IA a los campos del formulario. Los campos de
// texto (tipo/proveedor/destino) se llenan tal cual: si coinciden con un
// registro existente el autocompletar resuelve el id solo, si no, el usuario
// vera el aviso normal de "agrégalo en Catálogos de apoyo" al guardar.
// Tarifas/incluye/no incluye/condiciones se guardan aparte (seccion.datosExtraidosIA)
// porque necesitan que el servicio ya tenga id, y eso pasa recien al guardar.
function aplicarDatosExtraidosIA(seccion, formServicio, datos) {
  if (datos.nombre) formServicio.querySelector('[name="nombre"]').value = datos.nombre;
  if (datos.descripcion) {
    campo(formServicio, 'descripcion').value = datos.descripcion;
    campo(formServicio, 'descripcion').dispatchEvent(new Event('input'));
  }
  if (datos.fecha_inicio) campo(formServicio, 'fecha_inicio').value = datos.fecha_inicio;
  if (datos.fecha_fin) campo(formServicio, 'fecha_fin').value = datos.fecha_fin;
  campo(formServicio, 'fecha_inicio').dispatchEvent(new Event('change'));

  const camposTexto = {
    id_tipo_servicio: datos.tipo_servicio,
    id_proveedor: datos.proveedor,
    id_destino: datos.destino,
  };
  Object.entries(camposTexto).forEach(([campoId, valor]) => {
    if (!valor) return;
    const input = seccion.querySelector(`[data-campo="${campoId}"]`);
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  });

  seccion.datosExtraidosIA = {
    tarifas: datos.tarifas || [],
    incluye: datos.incluye || [],
    no_incluye: datos.no_incluye || [],
    condiciones: datos.condiciones || null,
  };
}

// Una vez que el servicio ya tiene id (recien creado), guarda lo que la IA
// extrajo de tarifas/incluye/no incluye/condiciones.
async function guardarDatosExtraidosIA(idServicio, datos) {
  const tareas = [];

  datos.tarifas.forEach((tarifa) => {
    if (!tarifa.nombre_tarifa || tarifa.precio_base == null) return;
    tareas.push(
      enviarJSON(`/servicios/${idServicio}/tarifas`, 'POST', {
        nombre_tarifa: tarifa.nombre_tarifa,
        precio_base: tarifa.precio_base,
        moneda: tarifa.moneda || '',
        estado: 'activo',
      })
    );
  });

  datos.incluye.forEach((texto) => {
    if (texto) tareas.push(enviarJSON(`/servicios/${idServicio}/incluidos`, 'POST', { descripcion: texto }));
  });

  datos.no_incluye.forEach((texto) => {
    if (texto) tareas.push(enviarJSON(`/servicios/${idServicio}/no-incluidos`, 'POST', { descripcion: texto }));
  });

  const c = datos.condiciones;
  if (c && (c.politica_cancelacion || c.requisitos || c.notas)) {
    // Si tambien se aplicaron valores por defecto, ya existe una fila de
    // condiciones: se borra primero para que la de la IA quede como la unica
    // (si no, quedarian dos filas y solo se veria la primera).
    tareas.push(
      fetch(`/servicios/${idServicio}/condiciones`, { method: 'DELETE' }).then(() =>
        enviarJSON(`/servicios/${idServicio}/condiciones`, 'POST', c)
      )
    );
  }

  await Promise.all(tareas);
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

  // Solo existe en la pestaña de "Nuevo servicio": sube una imagen a la IA y
  // usa lo que devuelva para rellenar el formulario (revisable antes de guardar).
  const inputImagenIA = seccion.querySelector('.campo-imagen-ia');
  if (inputImagenIA) {
    inputImagenIA.addEventListener('change', async () => {
      const archivo = inputImagenIA.files[0];
      if (!archivo) return;

      const estado = seccion.querySelector('.estado-extraccion-ia');
      estado.textContent = 'Analizando imagen con IA...';
      try {
        const formData = new FormData();
        formData.append('imagen', archivo);
        const datos = await enviarFormDataConError('/ia/extraer-imagen', formData);
        aplicarDatosExtraidosIA(seccion, formServicio, datos);
        estado.textContent = 'Datos rellenados. Revísalos antes de guardar.';
      } catch (error) {
        estado.textContent = '';
        mostrarMensaje(error.message, 'error');
      } finally {
        cargarEstadisticasIA();
      }
    });
  }

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

        if (seccion.datosExtraidosIA) {
          await guardarDatosExtraidosIA(idServicioActual, seccion.datosExtraidosIA);
          seccion.datosExtraidosIA = null;
        }

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
      // Se borra la fila previa antes de guardar para no acumular duplicados.
      await fetch(`/servicios/${idServicioActual}/condiciones`, { method: 'DELETE' });
      await enviarJSON(`/servicios/${idServicioActual}/condiciones`, 'POST', datosFormulario(e.target));
      mostrarMensaje('Cambios guardados', 'exito');
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

  // Sube un archivo al servicio. Para portada/documentos, si no se paso un
  // tipo de archivo se adivina solo por el mime-type.
  async function subirArchivo(archivo, uso, idTipoArchivoForzado) {
    if (requiereServicioGuardado(idServicioActual)) return;
    try {
      const idTipoArchivo = idTipoArchivoForzado || (await inferirTipoArchivo(archivo.type));
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('id_tipo_archivo', idTipoArchivo);
      formData.append('uso', uso);
      await enviarFormData(`/servicios/${idServicioActual}/archivos`, formData);
      await cargarArchivos(seccion, idServicioActual);
      mostrarMensaje(uso === 'portada' ? 'Portada actualizada' : 'Documento subido', 'exito');
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  }

  // Conecta una "zona de arrastrar y soltar": funciona con clic (el <label>
  // ya abre el selector nativo) y con arrastrar un archivo encima.
  function conectarZonaArrastrar(zona, inputArchivo, alElegir) {
    inputArchivo.addEventListener('change', () => {
      if (inputArchivo.files[0]) alElegir(inputArchivo.files[0]);
    });
    zona.addEventListener('dragover', (e) => {
      e.preventDefault();
      zona.classList.add('arrastrando');
    });
    zona.addEventListener('dragleave', () => zona.classList.remove('arrastrando'));
    zona.addEventListener('drop', (e) => {
      e.preventDefault();
      zona.classList.remove('arrastrando');
      if (e.dataTransfer.files[0]) alElegir(e.dataTransfer.files[0]);
    });
  }

  // --- Portada (en Información básica) ---
  const zonaPortada = seccion.querySelector('.zona-portada');
  conectarZonaArrastrar(zonaPortada, zonaPortada.querySelector('.campo-subir-portada'), (a) => subirArchivo(a, 'portada'));

  // --- Documentos (en Detalles del servicio) ---
  const selectTipoDoc = seccion.querySelector('.select-tipo-documento');
  catalogoTiposArchivo.forEach((t) => {
    const option = document.createElement('option');
    option.value = t.id_tipo_archivo;
    option.textContent = t.nombre;
    selectTipoDoc.appendChild(option);
  });

  // Usa el tipo elegido en el select; si no hay ninguno, lo infiere del archivo.
  function subirDocumento(archivo) {
    const idTipo = selectTipoDoc.value ? Number(selectTipoDoc.value) : null;
    subirArchivo(archivo, 'documento', idTipo);
  }

  const zonaDocumentos = seccion.querySelector('.zona-documentos');
  conectarZonaArrastrar(zonaDocumentos, zonaDocumentos.querySelector('.campo-soltar-documento'), subirDocumento);

  // Boton "Elegir archivo": muestra el nombre y sube al elegirlo.
  const inputElegirDoc = seccion.querySelector('.campo-subir-documento');
  inputElegirDoc.addEventListener('change', () => {
    const archivo = inputElegirDoc.files[0];
    if (!archivo) return;
    seccion.querySelector('.nombre-archivo-elegido').textContent = archivo.name;
    subirDocumento(archivo);
  });

  // Contadores de caracteres: descripcion (info) y las 3 condiciones (detalles).
  seccion.querySelectorAll('.campo-con-contador').forEach((contenedor) => {
    const area = contenedor.querySelector('textarea');
    const contador = contenedor.querySelector('.contador-caracteres');
    if (!area || !contador) return;
    area.addEventListener('input', () => {
      contador.textContent = `${area.value.length} / ${area.maxLength}`;
    });
  });

  // Cada pestaña (Información básica y Detalles) tiene su boton Cancelar.
  seccion.querySelectorAll('.boton-cancelar-servicio').forEach((boton) => {
    boton.addEventListener('click', () => cerrarPestana(seccion.dataset.tab));
  });

  seccion.querySelector('.boton-info-ia')?.addEventListener('click', () => {
    mostrarMensaje(
      'Sube una foto o afiche del servicio: la IA leerá la imagen e intentará completar nombre, fechas, tipo, proveedor, destino, tarifas, incluye/no incluye y condiciones. Podrás revisar y corregir todo antes de guardar.',
      'exito'
    );
  });

  seccion.querySelector('.campo-imagen-ia')?.addEventListener('change', function () {
    if (this.files[0] && this.files[0].type === 'application/pdf') {
      mostrarMensaje('La extracción con IA por ahora solo funciona con imágenes. Sube el PDF en la pestaña "Detalles del servicio".', 'error');
      this.value = '';
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
cargarConfiguracionIA();
cargarEstadisticasIA();
cargarServicios();
