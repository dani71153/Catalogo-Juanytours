const { query } = require('../db');

// ============================================================================
// Helpers de fecha
// Todo se trabaja en fecha LOCAL a medianoche (sin horas) y como dias de
// calendario, para evitar los errores tipicos de zona horaria / horario de
// verano. Nunca se mezcla UTC con hora local.
// ============================================================================

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

// Convierte "YYYY-MM-DD" a un Date local a medianoche. Devuelve null si el
// texto falta, no tiene el formato esperado, o es una fecha que no existe
// (ej. 2026-02-30). Asi nunca se propaga un "Invalid Date" silencioso.
function parsearFecha(texto) {
  if (!texto || !FORMATO_FECHA.test(texto)) return null;
  const [anio, mes, dia] = texto.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia); // hora local, medianoche
  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
    return null;
  }
  return fecha;
}

// "Hoy" local a medianoche. Se calcula en cada llamada (nunca se cachea) para
// que el resultado sea correcto aunque el servidor lleve dias encendido.
function hoyLocal() {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

// Dias de calendario entre dos fechas (ambas ya a medianoche). Positivo = la
// fecha "hasta" esta en el futuro. Se redondea para absorber cualquier resto
// de +/-1 hora que pueda meter el horario de verano.
function diasEntre(desde, hasta) {
  const MS_POR_DIA = 86400000;
  return Math.round((hasta - desde) / MS_POR_DIA);
}

// Suma n meses a una fecha, recortando el dia si el mes destino tiene menos
// dias (ej. 31 de enero + 1 mes = 28 de febrero), evitando el "desborde" que
// hace setMonth() de forma nativa (que pasaria a marzo).
function sumarMeses(fecha, n) {
  const totalMeses = fecha.getMonth() + n;
  const anio = fecha.getFullYear() + Math.floor(totalMeses / 12);
  const mes = ((totalMeses % 12) + 12) % 12;
  const diasEnMesDestino = new Date(anio, mes + 1, 0).getDate();
  return new Date(anio, mes, Math.min(fecha.getDate(), diasEnMesDestino));
}

// Desglosa la diferencia entre dos fechas en años, meses y dias de calendario
// REAL (no dividiendo por 30). Cuenta cuantos meses completos caben sin pasarse
// de "fin", y el resto en dias. Los valores son siempre >= 0; el estado
// (vencido/vigente) indica la direccion. Robusto para fines de mes y bisiestos.
function desglosarTiempo(desde, hasta) {
  let inicio = desde;
  let fin = hasta;
  if (fin < inicio) [inicio, fin] = [fin, inicio];

  let mesesTotales = 0;
  while (sumarMeses(inicio, mesesTotales + 1) <= fin) mesesTotales += 1;

  const trasSumarMeses = sumarMeses(inicio, mesesTotales);
  const dias = diasEntre(trasSumarMeses, fin);

  return { anios: Math.floor(mesesTotales / 12), meses: mesesTotales % 12, dias };
}

// Regla de clasificacion, explicita para evitar off-by-one:
//   dias < 0        -> vencido
//   dias === 0      -> vence hoy
//   1 .. umbral     -> proximo a vencer
//   dias > umbral   -> vigente
function clasificarEstado(diasRestantes, umbral) {
  if (diasRestantes < 0) return 'vencido';
  if (diasRestantes === 0) return 'vence_hoy';
  if (diasRestantes <= umbral) return 'proximo';
  return 'vigente';
}

// Calcula el vencimiento de una fecha_fin respecto a hoy.
function calcularVencimiento(fechaFinTexto, umbral) {
  const fechaFin = parsearFecha(fechaFinTexto);
  if (!fechaFin) return { estado: 'sin_fecha', dias_restantes: null, desglose: null };

  const hoy = hoyLocal();
  const dias = diasEntre(hoy, fechaFin);
  return {
    estado: clasificarEstado(dias, umbral),
    dias_restantes: dias,
    desglose: desglosarTiempo(hoy, fechaFin),
  };
}

// ============================================================================
// Items con vencimiento (servicios + tarifas)
// ============================================================================

// Trae todos los items que tienen fecha_fin, normalizados a una forma comun.
function listarItemsConVencimiento() {
  const servicios = query(
    `SELECT id_servicio AS id, nombre, fecha_fin
     FROM servicios
     WHERE fecha_fin IS NOT NULL AND fecha_fin != ''`
  );

  const tarifas = query(
    `SELECT t.id_tarifa AS id, t.nombre_tarifa AS nombre, t.fecha_fin, s.nombre AS nombre_servicio
     FROM tarifas_servicio t
     JOIN servicios s ON s.id_servicio = t.id_servicio
     WHERE t.fecha_fin IS NOT NULL AND t.fecha_fin != ''`
  );

  return [
    ...servicios.map((s) => ({ tipo: 'servicio', id: s.id, nombre: s.nombre, fecha_fin: s.fecha_fin })),
    ...tarifas.map((t) => ({
      tipo: 'tarifa',
      id: t.id,
      nombre: `${t.nombre} — ${t.nombre_servicio}`,
      fecha_fin: t.fecha_fin,
    })),
  ];
}

// Cada item con su calculo de vencimiento incluido.
function itemsConEstado(umbral) {
  return listarItemsConVencimiento().map((item) => ({ ...item, ...calcularVencimiento(item.fecha_fin, umbral) }));
}

// Resumen para un panel: listas por estado (ordenadas por urgencia) + conteos.
function obtenerResumen(umbral = 30) {
  const items = itemsConEstado(umbral).filter((i) => i.estado !== 'sin_fecha');
  const porEstado = (estado) =>
    items.filter((i) => i.estado === estado).sort((a, b) => a.dias_restantes - b.dias_restantes);

  const vencidos = porEstado('vencido');
  const venceHoy = porEstado('vence_hoy');
  const proximos = porEstado('proximo');
  const vigentes = porEstado('vigente');

  return {
    umbral,
    resumen: {
      total: items.length,
      vencidos: vencidos.length,
      vence_hoy: venceHoy.length,
      proximos: proximos.length,
      vigentes: vigentes.length,
    },
    vencidos,
    venceHoy,
    proximos,
    vigentes,
  };
}

// Items que vencen dentro de los proximos N dias (incluye "vence hoy",
// excluye los ya vencidos), ordenados del mas urgente al menos.
function proximosAVencer(dias = 30) {
  return itemsConEstado(dias)
    .filter((i) => i.dias_restantes !== null && i.dias_restantes >= 0 && i.dias_restantes <= dias)
    .sort((a, b) => a.dias_restantes - b.dias_restantes);
}

// Agrupa los items por periodo de calendario de su fecha_fin (no por duracion),
// para listados o graficos. periodo: 'dia' (YYYY-MM-DD) | 'mes' (YYYY-MM) | 'ano' (YYYY).
function agruparPorPeriodo(periodo = 'mes') {
  const items = listarItemsConVencimiento();
  const claveDe = (fecha) => {
    if (periodo === 'ano') return fecha.slice(0, 4);
    if (periodo === 'dia') return fecha;
    return fecha.slice(0, 7);
  };

  const grupos = {};
  items.forEach((item) => {
    const clave = claveDe(item.fecha_fin);
    (grupos[clave] = grupos[clave] || []).push(item);
  });

  return Object.keys(grupos)
    .sort()
    .map((clave) => ({ periodo: clave, cantidad: grupos[clave].length, items: grupos[clave] }));
}

module.exports = {
  // Principales (usadas por las rutas)
  obtenerResumen,
  proximosAVencer,
  agruparPorPeriodo,
  // Helpers reutilizables (por si otro modulo los necesita / para pruebas)
  calcularVencimiento,
  desglosarTiempo,
  clasificarEstado,
  parsearFecha,
};
