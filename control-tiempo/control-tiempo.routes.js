const express = require('express');
const control = require('./control-tiempo.service');

const router = express.Router();

// Resumen: conteos + listas por estado (vencidos, vence hoy, proximos, vigentes).
router.get('/control-tiempo/resumen', (req, res) => {
  const umbral = Number(req.query.umbral) > 0 ? Number(req.query.umbral) : 30;
  res.json(control.obtenerResumen(umbral));
});

// Items que vencen dentro de los proximos N dias (por defecto 30).
router.get('/control-tiempo/proximos', (req, res) => {
  const dias = Number(req.query.dias) > 0 ? Number(req.query.dias) : 30;
  res.json(control.proximosAVencer(dias));
});

// Items agrupados por periodo de calendario: dia | mes | ano (por defecto mes).
router.get('/control-tiempo/por-periodo', (req, res) => {
  const periodo = ['dia', 'mes', 'ano'].includes(req.query.periodo) ? req.query.periodo : 'mes';
  res.json(control.agruparPorPeriodo(periodo));
});

module.exports = router;
