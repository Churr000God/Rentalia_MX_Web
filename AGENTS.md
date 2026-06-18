# AGENTS.md — Rentalia.mx

Guía de incorporación para agentes IA. Lee en este orden antes de proponer cambios.

---

## Orden de lectura del código

### 1. Contexto y reglas base
1. `CLAUDE.md` — stack real, gotchas, inconsistencias conocidas.
2. `contexto/dominio.md` — entidades de negocio y flujos.
3. `estructura_proyecto/arquitectura.md` — árbol del proyecto y relaciones entre módulos.

### 2. Backend (FastAPI)
4. `backend/app/main.py` — entrypoint, endpoints, CORS, clientes Supabase y asyncpg.
5. `backend/app/db.py` — pool asyncpg (Postgres directo a Supabase).
6. `backend/pyproject.toml` — dependencias.
7. `backend/Dockerfile` — imagen de producción (Python 3.12, gunicorn).

### 3. Frontend
8. `frontend/assets/js/main.js` — orquestación principal: inyección de componentes, reviews, Google Maps.
9. `frontend/assets/js/supabase.js` — cliente Supabase, consulta de habitaciones (contiene credenciales hardcodeadas).
10. `frontend/index.html` — landing principal (estructura HTML base).
11. `frontend/pages/*.html` — páginas específicas.
12. `frontend/assets/js/<pagina>.js` — lógica por página (alternativas, faq, agendar_visita, etc.).

### 4. Base de datos
13. `database/migrations/003_setup_habitaciones_supabase.sql` — esquema activo de habitaciones en Supabase.
14. `database/migrations/004_create_reviews_internal.sql` — tabla de reseñas internas.
15. `database/init/001_init.sql` — extensiones y funciones base.

### 5. Infraestructura
16. `docker-compose.yml` — stack de producción activo.
17. `nginx/default.conf` — reverse proxy (proxea `/api/` → backend:8000).

---

## Módulos activos vs. legado

| Módulo | Estado | Notas |
|---|---|---|
| `backend/` | ✅ ACTIVO | FastAPI Python, el único en docker-compose |
| `backend_node/` | ⚠️ AUXILIAR | Express :3000, visitas/email, sin docker ni Dockerfile |
| `frontend/` | ✅ ACTIVO | HTML/CSS/JS vanilla, nginx:alpine |
| `database/migrations/` | ✅ ACTIVO | Postgres/Supabase (ver 003+) |
| `frontend_backup_*/` | ❌ LEGADO | No leer ni modificar |
| `docker-compose copy.yml` | ❌ LEGADO/FUTURO | Arquitectura no implementada |
| `backend/api/`, `backend/worker/` | ❌ PLACEHOLDER | Solo READMEs |
| `infra/`, `ops/` | ❌ PLACEHOLDER | Solo .gitkeep |
| `database/migrations/002_*` | ⚠️ CONFLICTO | Define `habitaciones` con esquema distinto al 003 |

---

## Flujo de datos principal

```
Browser
  ├─ fetch HTML → frontend/pages/*.html
  ├─ Supabase JS client (directo) → habitaciones, habitacion_estilos, faqs
  └─ fetch → backend:8000
       ├─ GET /api/reviews → Google Places API + supabase.reviews_internal
       ├─ GET /rooms → asyncpg → rentalia.habitaciones (Postgres/Supabase)
       └─ POST /api/reviews/internal → supabase.reviews_internal
  └─ fetch → backend_node:3000
       └─ POST /api/visitas → MailerSend (email de notificación)
```

---

## Skills recomendados por tipo de tarea

| Tarea | Skills |
|---|---|
| Cambio en parseo / cálculos | `test-driven-development` primero |
| Cambio en >1 módulo o KPIs | `code-review` al terminar |
| Validar que algo funciona | `verify` / `run` |
| Antes de merge a main | `security-review` |
| Incertidumbre técnica | `deep-research` |

---

## Checklist antes de proponer código
- [ ] ¿Leí `CLAUDE.md` y las inconsistencias conocidas?
- [ ] ¿El cambio toca credenciales/CORS/RLS? → `security-review`.
- [ ] ¿Modifiqué el esquema de BD? → Verificar contra migración 003 (activa en Supabase).
- [ ] ¿Agregué URLs hardcodeadas? → No: usar variables de entorno o config central.
- [ ] ¿Toqué `docker-compose.yml`? → No agregar ni usar el servicio MySQL fantasma.
