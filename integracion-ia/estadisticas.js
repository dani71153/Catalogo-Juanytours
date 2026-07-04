const { query, insert } = require('../db');

function registrarUso({ proveedor, modelo, exito, mensajeError }) {
  insert('ia_usos', {
    fecha: new Date().toISOString(),
    proveedor: proveedor || '',
    modelo: modelo || '',
    exito: exito ? 1 : 0,
    mensaje_error: mensajeError || '',
  });
}

function obtenerEstadisticas() {
  const [{ total }] = query('SELECT COUNT(*) AS total FROM ia_usos');
  const [{ exitosos }] = query('SELECT COUNT(*) AS exitosos FROM ia_usos WHERE exito = 1');
  const porProveedor = query(`
    SELECT proveedor, COUNT(*) AS total, SUM(exito) AS exitosos
    FROM ia_usos
    WHERE proveedor != ''
    GROUP BY proveedor
    ORDER BY total DESC
  `);
  const filas = query('SELECT fecha FROM ia_usos ORDER BY id_uso DESC LIMIT 1');

  return {
    total,
    exitosos,
    fallidos: total - exitosos,
    porProveedor,
    ultimoUso: filas[0]?.fecha || null,
  };
}

module.exports = { registrarUso, obtenerEstadisticas };
