# Gestor de Servicios · Juanytours

Aplicación web para catalogar los servicios turísticos de la agencia (tours, paquetes, congresos, traslados, etc.): sus tarifas, condiciones, qué incluyen/no incluyen, imágenes y documentos. Corre 100% local con Node.js y SQLite, sin frameworks de frontend ni paso de compilación.

## Cómo correrlo

```bash
npm install
npm start
```

Abre `http://localhost:3000`. La base de datos vive en `base_de_datos/gestor_servicios.db` (SQLite, se crea/usa automáticamente).

---

## 1. Estructura general del proyecto

```
catalogos-gestor-de-servicios-Juanytours/
├── server.js                  # Servidor Express: define todas las rutas de la API
├── db.js                      # Conexión a SQLite y helpers genéricos (query, insert, update, remove)
│
├── services.service.js        # Logica de negocio: servicios (CRUD + listado con joins)
├── tarifas.service.js         # Logica de negocio: tarifas de un servicio
├── condiciones.service.js     # Logica de negocio: condiciones de un servicio
├── incluidos.service.js       # Logica de negocio: incluye / no incluye
├── archivos.service.js        # Logica de negocio: subir/borrar archivos (portada, galería, documentos)
├── defectos.service.js        # Logica de negocio: valores por defecto (incluye/no incluye/condiciones)
│
├── integracion-ia/            # Extraer datos de una imagen con IA (aislado del resto, ver sección 5)
│   ├── config.js                # Lee/escribe integracion-ia/config.json (no versionado)
│   ├── prompt.js                 # Prompt compartido + parseo de la respuesta a JSON
│   ├── ia.service.js             # Elige el proveedor activo y le delega la extracción
│   ├── ia.routes.js              # Rutas: /ia/configuracion y /ia/extraer-imagen
│   └── proveedores/
│       ├── openai.js
│       ├── anthropic.js
│       └── gemini.js
│
├── base_de_datos/
│   ├── schema.sql              # Definición completa de las tablas (referencia, no se ejecuta sola)
│   └── gestor_servicios.db     # Base de datos SQLite real
│
├── uploads/                    # Archivos subidos (imágenes, PDFs...), servidos como estáticos
│
├── public/                     # Todo el frontend (HTML/CSS/JS planos, sin build)
│   ├── index.html               # Página principal (catálogo + pestañas de servicios)
│   ├── app.js                   # Toda la lógica de la interfaz principal
│   ├── style.css                # Estilos de la interfaz principal
│   ├── ficha.html / ficha.js / ficha.css   # Ficha imprimible de un servicio (documento aparte)
│
├── package.json
├── .gitignore
└── CLAUDE.md                   # Reglas de estilo de código para este proyecto
```

**Convención de nombres**: cada tabla de la base de datos tiene un archivo `*.service.js` a cargo de su lógica (patrón "un servicio de datos por tabla/concepto"). `server.js` no habla con la base de datos directamente salvo para los catálogos simples (tipos de servicio, proveedores, destinos, tipos de archivo), que son casi siempre lectura/escritura directa sin lógica extra.

---

## 2. Estructura de la base de datos

Motor: **SQLite** (vía el módulo nativo `node:sqlite`, sin dependencias externas). Claves foráneas activas (`PRAGMA foreign_keys = ON`).

### Tablas principales

| Tabla | Para qué sirve |
|---|---|
| `tipos_servicio` | Catálogo de tipos: tour, hotel, vuelo, traslado, paquete, congreso, etc. |
| `proveedores` | Quién presta el servicio (nombre, teléfono, email, dirección, estado). |
| `destinos` | País + ciudad (+ zona opcional) de un servicio. |
| `servicios` | **Tabla central.** El producto vendible: nombre, descripción, fechas de inicio/fin, duración (calculada), estado, y a qué tipo/proveedor/destino pertenece. |
| `tarifas_servicio` | Precios de un servicio (puede tener varias: adulto, niño, temporada alta...). |
| `condiciones_servicio` | Política de cancelación, requisitos y notas de un servicio. |
| `incluidos_servicio` / `no_incluidos_servicio` | Listas de qué incluye / no incluye un servicio. |
| `tipos_archivo` | Catálogo de tipos de archivo: imagen, pdf, contrato, voucher... |
| `archivos` | Metadatos de cada archivo subido (nombre, ruta, tamaño, tipo). |
| `servicio_archivos` | Relaciona un archivo con un servicio y su uso (`portada`, `galeria`, `documento`, `condiciones`). |

### Tablas de "valores por defecto"

| Tabla | Para qué sirve |
|---|---|
| `incluidos_defecto` / `no_incluidos_defecto` | Listas reutilizables que se copian a un servicio nuevo si se marca la casilla "Usar valores por defecto". |
| `condiciones_defecto` | Una plantilla única de condiciones, con el mismo fin. |

### Relaciones (resumen)

```
tipos_servicio ─┐
proveedores ─────┼──< servicios >──┬──< tarifas_servicio
destinos ────────┘                 ├──< condiciones_servicio (1 a 1)
                                    ├──< incluidos_servicio
                                    ├──< no_incluidos_servicio
                                    └──< servicio_archivos >── archivos ──> tipos_archivo
```

El detalle exacto de columnas está en [`base_de_datos/schema.sql`](base_de_datos/schema.sql).

---

## 3. Estructura lógica (backend)

Arquitectura por capas, sin ORM:

```
Petición HTTP
   │
   ▼
server.js  (rutas Express: valida el request y llama a la capa de servicio)
   │
   ▼
*.service.js  (reglas de negocio: qué tablas tocar, en qué orden, qué borrar en cascada)
   │
   ▼
db.js  (ejecuta el SQL sobre SQLite)
```

### `db.js` — capa de datos genérica

Expone 4 funciones que usan todos los `*.service.js`:

```js
query(sql, params)        // SELECT/INSERT/UPDATE/DELETE con SQL a mano
getById(table, idColumn, id)
insert(table, data)       // arma el INSERT a partir de un objeto {columna: valor}
update(table, idColumn, id, data)
remove(table, idColumn, id)
```

### Módulos de servicio (`*.service.js`)

- **`services.service.js`**: `crearServicio`, `listarServicios` (trae tipo/proveedor/destino ya unidos + conteos de tarifas/archivos + precio más bajo, para no tener que pedir esos datos aparte), `obtenerServicio`, `actualizarServicio`, `eliminarServicio` (borra en cascada tarifas, condiciones, incluidos y vínculos de archivos antes de borrar el servicio).
- **`tarifas.service.js`**: `crearTarifa`, `listarTarifasPorServicio`, `actualizarTarifa`, `eliminarTarifa`.
- **`condiciones.service.js`**: `guardarCondiciones`, `obtenerCondiciones`, `actualizarCondiciones` (upsert: si no existen las crea), `eliminarCondiciones`.
- **`incluidos.service.js`**: `agregarIncluido/NoIncluido`, `listarIncluidos/NoIncluidos`, `eliminarIncluido/NoIncluido`.
- **`archivos.service.js`**: `subirArchivo` (guarda el archivo físico en `uploads/`), `registrarArchivo`, `vincularArchivoAServicio`, `listarArchivosDeServicio`, `eliminarArchivoDeServicio` (si nadie más usa ese archivo, también borra el registro y el archivo físico del disco).
- **`defectos.service.js`**: CRUD de los catálogos "por defecto" + `aplicarDefectosAServicio(idServicio)`, que copia todos los valores por defecto a un servicio recién creado.

### Rutas de la API (`server.js`)

| Método | Ruta | Qué hace |
|---|---|---|
| GET/POST/DELETE | `/tipos-servicio`, `/proveedores`, `/destinos`, `/tipos-archivo` (`/:id` para borrar) | Catálogos de apoyo |
| GET/POST/DELETE | `/incluidos-defecto`, `/no-incluidos-defecto` (`/:id` para borrar) | Valores por defecto (listas) |
| GET/POST/DELETE | `/condiciones-defecto` | Valor por defecto (plantilla única) |
| GET | `/paises` | Lista de países en español (librería `i18n-iso-countries`) |
| GET | `/ciudades?pais=...` | Ciudades de un país (librería `country-state-city`) |
| GET/POST | `/ia/configuracion` | Ver/guardar qué proveedor de IA está activo y su API key (ver sección 5) |
| POST | `/ia/extraer-imagen` | Sube una imagen y devuelve los datos de servicio que la IA pudo extraer |
| POST/GET/PUT/DELETE | `/servicios`, `/servicios/:id` | CRUD de servicios. El `POST` acepta `usar_defectos` para aplicar los valores por defecto al crear |
| POST/GET/DELETE | `/servicios/:id/tarifas` (`/:idTarifa` para borrar) | Tarifas de un servicio |
| POST/GET/DELETE | `/servicios/:id/condiciones` | Condiciones de un servicio |
| POST/GET/DELETE | `/servicios/:id/incluidos`, `/servicios/:id/no-incluidos` (`/:id` para borrar) | Incluye / no incluye |
| POST/GET/DELETE | `/servicios/:id/archivos` (`/:idArchivo` para borrar) | Subida y gestión de archivos (multipart, vía `multer`) |

---

## 4. Estructura de la interfaz gráfica (frontend)

Todo en `public/`, HTML/CSS/JS planos servidos como estáticos (`express.static`) — sin build, sin framework.

### `index.html` + `app.js` + `style.css` — la app principal

Organización por **pestañas anidadas**:

```
Barra de pestañas superior
├── 📚 Catálogo (fija)
│     ├── Subpestaña "Servicios"       → cuadrícula/lista de servicios, buscador, panel de filtros
│     ├── Subpestaña "Catálogos de apoyo" → tipos, proveedores, destinos, tipos de archivo, valores por defecto
│     └── Subpestaña "🔧 Opciones"        → sub-subpestaña "✨ IA" con la Configuración de IA
└── Una pestaña por cada servicio abierto (dinámica, con "×" para cerrarla)
      └── Sub-subpestañas dentro de esa pestaña:
            ├── Información básica  → extraer con IA, portada, datos del servicio, tarifas
            ├── Condiciones
            ├── Incluye / No incluye
            └── Documentos
```

**Piezas reutilizables clave en `app.js`:**

- **Autocompletar con id** (`conectarAutocompletarCampo`): campos como Tipo de servicio, Proveedor o Destino — escribes o eliges de una lista desplegable propia (no usa `<datalist>` nativo por inconsistencias entre navegadores), y guarda el `id` real en un input oculto.
- **Autocompletar de solo texto** (`conectarAutocompletarTexto`): usado para País y Ciudad — no guarda un id, el valor elegido es el texto mismo. La ciudad depende del país elegido (se piden las ciudades a `/ciudades` recién ahí).
- **Buscador + filtros** (`aplicarFiltrosYBusqueda`): todo el filtrado (texto, tipo, proveedor, destino, estado, rango de fechas, rango de precio) se hace en el cliente sobre los datos ya cargados, sin pedir nada al servidor.
- **Mensajes de éxito/error** (`mostrarMensaje`): un toast en la esquina superior derecha.
- Cada pestaña de servicio se genera dinámicamente desde una plantilla (`plantillaServicio`) y se conecta con `inicializarSeccionServicio`, que arma todos los formularios y listas de esa pestaña.

### `ficha.html` + `ficha.js` + `ficha.css` — documento imprimible

Página completamente aparte (no forma parte de las pestañas). Se abre en una pestaña nueva del navegador con `ficha.html?id=<id_servicio>`, arma un documento tipo folleto (portada, tarifas, incluye/no incluye, condiciones, galería, documentos) a partir de los mismos endpoints de la API, y tiene un botón "Imprimir / Guardar como PDF" que usa la función nativa de impresión del navegador.

---

## 5. Integración con IA (`integracion-ia/`)

Permite subir una foto o afiche de un servicio y que una IA con visión extraiga los datos (nombre, descripción, fechas, tipo, proveedor, destino, tarifas, incluye/no incluye, condiciones) para precargar el formulario de "Nuevo servicio" — el usuario revisa/edita todo antes de guardar (la "previsualización" es el propio formulario ya lleno).

### Por qué está aislada

Toda la lógica de IA vive en `integracion-ia/`, con un solo punto de contacto con el resto del proyecto: `server.js` monta sus rutas con una línea (`app.use(require('./integracion-ia/ia.routes'))`). Ningún otro archivo del backend depende de esta carpeta.

### Proveedores soportados

Cada uno implementa la misma función `extraerDatosDeImagen(apiKey, imagenBuffer, mimeType)` y devuelve siempre el mismo JSON (definido en `prompt.js`), así que cambiar de proveedor no afecta al resto del código:

- `proveedores/openai.js` — OpenAI (`gpt-4o-mini`)
- `proveedores/anthropic.js` — Anthropic (`claude-3-5-sonnet`)
- `proveedores/gemini.js` — Google (`gemini-1.5-flash`)

### Configuración

Desde la interfaz (Catálogo → 🔧 Opciones → ✨ IA) se elige el proveedor activo y se pega su API key. Se guarda en `integracion-ia/config.json`, que **no se sube a git** (está en `.gitignore`) porque contiene las API keys en texto plano.

### Flujo completo

1. En la pestaña "Nuevo servicio" → "✨ Extraer datos con IA", se sube una imagen.
2. El navegador la manda a `POST /ia/extraer-imagen`.
3. `ia.service.js` mira qué proveedor está configurado (`config.json`) y le delega la extracción a su adaptador.
4. El adaptador arma la petición HTTP nativa (con `fetch`, sin librerías de por medio) hacia la API del proveedor, pidiendo la imagen + un prompt que exige responder en JSON, y parsea la respuesta.
5. El frontend recibe ese JSON y llena el formulario (nombre, descripción, fechas, tipo/proveedor/destino como texto).
6. Al guardar el servicio, las tarifas/incluye/no incluye/condiciones que la IA haya encontrado se agregan automáticamente (si además estaba marcada la casilla de "valores por defecto", las condiciones de la IA reemplazan a las de la plantilla, para que no queden dos guardadas a la vez).

### Limitaciones a tener en cuenta

- Las API keys son de pago (cada extracción consume créditos de la cuenta configurada).
- La IA puede no encontrar todos los datos en la imagen (deja esos campos en `null`) — por eso el flujo siempre pasa por el formulario editable antes de guardar, nunca guarda directo.
- Si el texto/tipo/proveedor/destino que la IA sugiere no coincide con ningún registro existente en los catálogos, el formulario pedirá agregarlo primero en "Catálogos de apoyo" antes de guardar (mismo comportamiento que si se escribe a mano).
