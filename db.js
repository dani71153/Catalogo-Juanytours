const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'base_de_datos', 'gestor_servicios.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');

// Ejecuta cualquier SQL (SELECT, INSERT, UPDATE, DELETE) con parámetros
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  if (sql.trim().toUpperCase().startsWith('SELECT')) {
    return stmt.all(...params);
  }
  return stmt.run(...params);
}

function getById(table, idColumn, id) {
  return db.prepare(`SELECT * FROM ${table} WHERE ${idColumn} = ?`).get(id);
}

function insert(table, data) {
  const columnas = Object.keys(data);
  const placeholders = columnas.map(() => '?').join(', ');
  const sql = `INSERT INTO ${table} (${columnas.join(', ')}) VALUES (${placeholders})`;
  const info = db.prepare(sql).run(...Object.values(data));
  return info.lastInsertRowid;
}

function update(table, idColumn, id, data) {
  const columnas = Object.keys(data);
  const sets = columnas.map((col) => `${col} = ?`).join(', ');
  const sql = `UPDATE ${table} SET ${sets} WHERE ${idColumn} = ?`;
  const info = db.prepare(sql).run(...Object.values(data), id);
  return info.changes;
}

function remove(table, idColumn, id) {
  const info = db.prepare(`DELETE FROM ${table} WHERE ${idColumn} = ?`).run(id);
  return info.changes;
}

module.exports = { db, query, getById, insert, update, remove };
