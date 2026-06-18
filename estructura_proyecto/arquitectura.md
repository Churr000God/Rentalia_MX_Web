# Arquitectura Técnica — Rentalia.mx

Generado por exploración de código (2026-06-17). Graphify no disponible; mapeo manual.

---

## Árbol del proyecto (simplificado)

```
Rentalia/
├── CLAUDE.md                    ← reglas + gotchas
├── AGENTS.md                    ← guía de incorporación
├── contexto/                    ← lógica de negocio (fuente de verdad)
├── estructura_proyecto/         ← este archivo
├── .ai-agents/
│   ├── errors/ERROR_LOG.md
│   └── learning/SESSION_LOG.md
│
├── backend/                     ← FastAPI Python (ACTIVO)
│   ├── app/
│   │   ├── main.py              ← entrypoint, endpoints, CORS, clientes
│   │   └── db.py                ← pool asyncpg (Postgres directo)
│   ├── tests/
│   │   └── test_reviews.py      ← tests de /api/reviews
│   ├── Dockerfile               ← python:3.12-slim, gunicorn, puerto 8000
│   ├── pyproject.toml           ← deps: fastapi, uvicorn, supabase, httpx, asyncpg
│   ├── api/README.md            ← placeholder "FUTURO Node" (ignorar)
│   └── worker/README.md         ← placeholder "FUTURO" (ignorar)
│
├── backend_node/                ← Express Node (AUXILIAR - no en docker)
│   ├── server.js                ← Express app, puerto 3000
│   ├── api/visitas.js           ← POST /api/visitas → MailerSend email
│   └── package.json             ← deps: express, cors, dotenv, mailersend
│
├── frontend/                    ← HTML/CSS/JS vanilla (ACTIVO)
│   ├── index.html               ← landing principal
│   ├── pages/                   ← páginas específicas
│   │   ├── alternativas.html
│   │   ├── experiencias.html
│   │   ├── agendar_visita.html
│   │   ├── faq.html
│   │   ├── detalle-habitacion.html
│   │   ├── como-funciona.html
│   │   ├── contacto.html
│   │   ├── ayuda.html
│   │   ├── blog.html
│   │   ├── estudiantes.html
│   │   ├── extranjeros.html
│   │   └── login.html
│   ├── assets/
│   │   ├── css/                 ← estilos (base, layout, components, por página)
│   │   ├── js/
│   │   │   ├── main.js          ← orquestación: componentes, reviews, Google Maps
│   │   │   ├── supabase.js      ← cliente Supabase + consulta habitaciones
│   │   │   ├── alternativas.js
│   │   │   ├── faq.js           ← búsqueda/filtro FAQ + modal contacto
│   │   │   ├── agendar_visita.js← agendamiento + POST /api/visitas
│   │   │   ├── detalle.js
│   │   │   ├── experiencias.js
│   │   │   ├── carusel.js
│   │   │   ├── hero.js
│   │   │   └── layout.js
│   │   ├── images/              ← imágenes (alternativas, experiencias, habitaciones, slider)
│   │   └── locales/             ← es.json, en.json (VACÍOS - i18n no implementada)
│   └── components/
│       ├── header/              ← header.html + header.css (cargados por main.js)
│       └── footer/              ← footer.html + footer.css
│
├── database/
│   ├── init/001_init.sql        ← extensiones Postgres (uuid, postgis, trgm), schemas, audit
│   └── migrations/
│       ├── 002_create_habitaciones.sql ← esquema PostGIS (CONFLICTO con 003, no usar)
│       ├── 003_setup_habitaciones_supabase.sql ← esquema Supabase ACTIVO
│       ├── 004_create_reviews_internal.sql
│       └── 005_update_reviews_anonymous.sql
│
├── docker-compose.yml           ← producción activa: db(mysql/fantasma)+backend+frontend/nginx
├── docker-compose copy.yml      ← plantilla FUTURA (Postgres+Redis+Worker Node), inactiva
├── nginx/
│   └── default.conf             ← reverse proxy: / → frontend, /api/ → backend:8000
│
├── docker/                      ← usado por docker-compose copy.yml
│   ├── web/Dockerfile           ← nginx:alpine para frontend
│   ├── api/Dockerfile           ← placeholder Node FUTURO
│   ├── worker/Dockerfile        ← placeholder Node FUTURO
│   └── nginx/                   ← config global nginx + conf.d/rentalia.conf
├── infra/                       ← solo .gitkeep (vacío)
├── ops/                         ← solo .gitkeep (vacío)
│
├── scripts/
│   ├── dev.sh                   ← `docker-compose up -d web` (solo frontend)
│   ├── build.sh                 ← genera build de producción + docker-compose.prod.yml
│   ├── migrate.sh               ← CLI de migraciones (placeholder, no implementado)
│   ├── seed.sh                  ← CLI de seeds (placeholder, no implementado)
│   └── check_db.js              ← verifica habitaciones en Supabase REST API (contiene keys hardcodeadas)
│
├── docs/
│   └── technical/FAQ_MODULE.md  ← doc del módulo FAQ (tablas faqs, user_questions)
│
├── frontend_backup_2025-10-02-18-43/ ← LEGADO/BACKUP, ignorar
├── .env.example                 ← plantilla de variables de entorno
├── .gitignore                   ← incluye graphify-out/ (línea 123)
├── CHANGELOG.md
├── README.md
├── MANUAL_FLUJO_DESARROLLO.md   ← guía de deployment a producción
└── sync_rentalia.sh             ← script de deploy del frontend al servidor
```

---

## Diagrama de relaciones

```
Browser ─── GET /pages/*.html ──────────────────→ nginx:80 → frontend/ (estático)
        │
        ├── Supabase JS SDK (CDN) ──────────────→ Supabase Cloud (PostgreSQL)
        │   ├── habitaciones + habitacion_estilos  (supabase.js, detalle.js, agendar_visita.js)
        │   ├── faqs + user_questions               (faq.js)
        │   └── reviews_internal                    (supabase.js)
        │
        ├── fetch /api/* ────────────────────────→ nginx:80 → backend:8000 (FastAPI)
        │   ├── GET /health
        │   ├── GET /rooms          → asyncpg → Supabase PostgreSQL (rentalia.habitaciones)
        │   ├── GET /api/reviews    → asyncio.gather(Google Places API, supabase.reviews_internal)
        │   └── POST /api/reviews/internal → supabase.reviews_internal (approved=False)
        │
        └── fetch :3000/api/visitas ─────────────→ backend_node:3000 (Express)
            └── POST /api/visitas   → MailerSend API (email de notificación)

Supabase Cloud ─── REST API ──────────────────→ scripts/check_db.js (verificación)
```

---

## "God nodes" (archivos más acoplados)

| Archivo | Por qué es crítico |
|---|---|
| `backend/app/main.py` | Todo el backend: CORS, clientes, endpoints, startup |
| `frontend/assets/js/main.js` | Orquesta header/footer, reviews, mapa, init del frontend |
| `frontend/assets/js/supabase.js` | Punto de acceso a Supabase desde el frontend; duplica credenciales |
| `nginx/default.conf` | Routing de todo el tráfico producción |
| `docker-compose.yml` | Define el stack completo de producción |

---

## Tablas en Supabase (activas)

| Tabla | Schema | Cómo se crea | Quién accede |
|---|---|---|---|
| `habitaciones` | public | migración 003 | frontend (SDK), backend (/rooms) |
| `habitacion_estilos` | public | migración 003 | frontend (SDK, join) |
| `reviews_internal` | public | migración 004+005 | frontend (SDK), backend FastAPI |
| `faqs` | public | **manual en panel** | frontend (SDK, faq.js) |
| `user_questions` | public | **manual en panel** | frontend (SDK, faq.js) |
| `audit.activity_log` | audit | migración 001 | triggers internos |

---

## Variables de entorno requeridas (`.env`)

```
# Backend FastAPI (requeridas)
SUPABASE_URL=
SUPABASE_KEY=          # service_role o anon
SUPABASE_DB_URL=       # postgres://... (acceso directo asyncpg)
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=

# Backend Node (requeridas para visitas)
MAILERSEND_API_KEY=

# Frontend (hardcodeadas actualmente en supabase.js - ⚠️ inconsistencia)
# SUPABASE_URL / SUPABASE_ANON_KEY están en el código fuente JS
```
