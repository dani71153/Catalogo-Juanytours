PRAGMA foreign_keys = ON;

CREATE TABLE tipos_servicio (
  id_tipo_servicio INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE -- vuelo, hotel, tour, traslado, seguro, paquete
);

CREATE TABLE proveedores (
  id_proveedor INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  estado TEXT
);

CREATE TABLE destinos (
  id_destino INTEGER PRIMARY KEY AUTOINCREMENT,
  pais TEXT,
  ciudad TEXT,
  zona TEXT
);

CREATE TABLE servicios (
  id_servicio INTEGER PRIMARY KEY AUTOINCREMENT,
  id_tipo_servicio INTEGER NOT NULL,
  id_proveedor INTEGER NOT NULL,
  id_destino INTEGER,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TEXT, -- YYYY-MM-DD
  fecha_fin TEXT, -- YYYY-MM-DD
  duracion TEXT, -- se calcula solo a partir de fecha_inicio y fecha_fin
  estado TEXT,
  FOREIGN KEY (id_tipo_servicio) REFERENCES tipos_servicio(id_tipo_servicio),
  FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
  FOREIGN KEY (id_destino) REFERENCES destinos(id_destino)
);

CREATE TABLE tarifas_servicio (
  id_tarifa INTEGER PRIMARY KEY AUTOINCREMENT,
  id_servicio INTEGER NOT NULL,
  nombre_tarifa TEXT NOT NULL,
  precio_base NUMERIC NOT NULL,
  moneda TEXT,
  fecha_inicio TEXT,
  fecha_fin TEXT,
  estado TEXT,
  FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
);

CREATE TABLE condiciones_servicio (
  id_condicion INTEGER PRIMARY KEY AUTOINCREMENT,
  id_servicio INTEGER NOT NULL,
  politica_cancelacion TEXT,
  requisitos TEXT,
  notas TEXT,
  FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
);

CREATE TABLE incluidos_servicio (
  id_incluido INTEGER PRIMARY KEY AUTOINCREMENT,
  id_servicio INTEGER NOT NULL,
  descripcion TEXT NOT NULL,
  FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
);

CREATE TABLE no_incluidos_servicio (
  id_no_incluido INTEGER PRIMARY KEY AUTOINCREMENT,
  id_servicio INTEGER NOT NULL,
  descripcion TEXT NOT NULL,
  FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
);

CREATE TABLE tipos_archivo (
  id_tipo_archivo INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE -- imagen, pdf, contrato, voucher, ficha_tecnica
);

CREATE TABLE archivos (
  id_archivo INTEGER PRIMARY KEY AUTOINCREMENT,
  id_tipo_archivo INTEGER NOT NULL,
  nombre_original TEXT NOT NULL,
  nombre_guardado TEXT NOT NULL,
  extension TEXT,
  mime_type TEXT,
  url_archivo TEXT,
  tamano_bytes INTEGER,
  fecha_subida TEXT,
  estado TEXT,
  FOREIGN KEY (id_tipo_archivo) REFERENCES tipos_archivo(id_tipo_archivo)
);

CREATE TABLE servicio_archivos (
  id_servicio_archivo INTEGER PRIMARY KEY AUTOINCREMENT,
  id_servicio INTEGER NOT NULL,
  id_archivo INTEGER NOT NULL,
  uso TEXT, -- portada, galeria, documento, condiciones
  FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio),
  FOREIGN KEY (id_archivo) REFERENCES archivos(id_archivo)
);

-- Valores por defecto que se pueden copiar a un servicio nuevo (opcional,
-- via un checkbox al crearlo) para no tener que escribirlos uno a uno.

CREATE TABLE incluidos_defecto (
  id_incluido_defecto INTEGER PRIMARY KEY AUTOINCREMENT,
  descripcion TEXT NOT NULL
);

CREATE TABLE no_incluidos_defecto (
  id_no_incluido_defecto INTEGER PRIMARY KEY AUTOINCREMENT,
  descripcion TEXT NOT NULL
);

CREATE TABLE condiciones_defecto (
  id_condicion_defecto INTEGER PRIMARY KEY AUTOINCREMENT,
  politica_cancelacion TEXT,
  requisitos TEXT,
  notas TEXT
);

-- Registro de cada intento de extraccion con IA, para las estadisticas de
-- uso en Opciones > IA.
CREATE TABLE ia_usos (
  id_uso INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL,
  proveedor TEXT,
  modelo TEXT,
  exito INTEGER NOT NULL, -- 1 o 0
  mensaje_error TEXT
);