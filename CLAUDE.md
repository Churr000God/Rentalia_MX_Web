# CLAUDE.md — Rentalia.mx

Reglas y contexto esencial para trabajar en este proyecto. Lee esto **antes** de tocar código.

---

## Identidad del proyecto
Plataforma web para alquiler de habitaciones (rentalia.mx). Sitio público + API de reseñas y agendamiento de visitas.

---

## Stack real (verificado en código)

### Frontend
- HTML/CSS/JS **vanilla** — sin framework, sin build step.
- Páginas: `frontend/pages/`, estilos: `frontend/assets/css/`, scripts: `frontend/assets/js/`.
- Header/footer se inyectan dinámicamente vía `fetch` desde `components/`.
- Usa **Supabase JS client** (CDN) directamente para datos de habitaciones y FAQ.

### Backend ACTIVO — `backend/` (FastAPI / Python 3.12)
- Gunicorn + UvicornWorker, puerto **8000**.
- Entrypoint: `backend/app/main.py`, pool de conexión: `backend/app/db.py`.
- Endpoints:
  - `GET /health`
  - `GET /rooms` — consulta Postgres (`rentalia.habitaciones`, via asyncpg)
  - `GET /api/reviews` — Google Places API + reseñas internas Supabase (paralelo)
  - `GET /api/reviews/google`
  - `GET /api/reviews/internal`
  - `POST /api/reviews/internal` — crea reseña (pendiente aprobación)
  - `POST /api/visitas` — guarda solicitud en tabla `visitas` + envía correo SMTP best-effort (smtplib STARTTLS)
- Dos clientes Supabase en `main.py`:
  - `supabase` (anon key `SUPABASE_KEY`) — lecturas con RLS (reviews aprobadas, etc.)
  - `supabase_admin` (service_role `SUPABASE_SERVICE_KEY`) — escrituras server-side sin RLS (`/api/visitas`)
  - Razón: la key `sb_publishable_*` no autentica como rol `anon` en PostgREST para inserts, incluso con policies permisivas.
- Depende de: fastapi, uvicorn, gunicorn, python-dotenv, supabase, httpx, asyncpg.
- **NO usa MySQL ni SQLAlchemy** en código (pymysql/sqlalchemy declarados en pyproject pero sin imports).

### Backend auxiliar — `backend_node/` (Express / Node)
- Puerto **3000**, un solo endpoint: `POST /api/visitas` — envía email vía MailerSend.
- **Obsoleto para el flujo de visitas**: el agendamiento ahora vive íntegramente en FastAPI (`POST /api/visitas` en `backend/app/main.py`). El backend Node ya no se usa para esto.
- **No está en docker-compose.yml** y no tiene Dockerfile propio.
- No tocarlo salvo trabajo específico en él.

### Base de datos — **Supabase (PostgreSQL)**
- Toda la persistencia es Postgres gestionado por Supabase.
- El backend accede vía `asyncpg` (directo) + `supabase-py` (cliente).
- El frontend accede vía `@supabase/supabase-js` (CDN), directamente, para tablas `habitaciones`/`habitacion_estilos`/`faqs`.
- Variables de entorno necesarias: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY`, `SUPABASE_DB_URL`.
- Tablas principales: `habitaciones`, `habitacion_estilos`, `reviews_internal`, `faqs`, `user_questions`, `ubicaciones`, `location_amenities`, `visitas`, `site_config`.

---

## Variables de entorno
El backend las carga desde `.env` en la **raíz del proyecto** usando pathlib (implementado en `main.py:13-14`):
```python
basedir = pathlib.Path(__file__).parent.parent.parent  # raíz del repo
load_dotenv(basedir / ".env")
```
Crea `.env` copiando `.env.example` y llenando al menos:
- `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY` (service_role para escrituras server-side)
- `SUPABASE_DB_URL` (para asyncpg en `/rooms`)
- `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` (para reviews de Google)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, `MAIL_TO` (para correos de visitas)

---

## Desarrollo local

### Arranque rápido (todos los servicios)
```bash
bash scripts/dev-all.sh
```
Levanta backend :8000 + admin :4000 + frontend :8080 en background. Ctrl-C apaga los tres.
Requiere: `.env` raíz (con `SUPABASE_URL`/`KEY`), `admin/.env.local` y `backend/.venv`.

### Backend FastAPI (manual)
```bash
cd backend
pip install fastapi uvicorn supabase python-dotenv httpx asyncpg pydantic
uvicorn app.main:app --reload --port 8000
```
- Verificar: `curl http://localhost:8000/health`
- Docs interactivas: `http://localhost:8000/docs`

### Frontend (manual)
Abrir `frontend/` con Live Server (VS Code) o cualquier servidor estático en el puerto **8080** u **8081**.

### CORS
El backend acepta `localhost:8080`, `localhost:8081`, `localhost:3000`. No usar otro puerto sin actualizar `main.py:20-32`.

### Docker (producción / staging)
```bash
docker-compose up -d   # levanta db (MySQL residual), backend, frontend/nginx
docker-compose up -d --build backend  # reconstruir backend tras cambios
```
> ⚠️ El servicio `db: mysql:8.0` en docker-compose.yml es **residual** — el backend no lo usa. La DB real es Supabase cloud.

---

## Legado — ignorar/no tocar sin motivo
- `frontend_backup_2025-10-02-18-43/` — backup viejo con archivos vacíos.
- `docker-compose copy.yml` — arquitectura planeada "FUTURO" (Node+Postgres+Redis), inactiva.
- `backend/api/` y `backend/worker/` — solo READMEs placeholder.
- `frontend/set` (0 bytes) — archivo basura.
- `frontend/assets/locales/es.json` y `en.json` — vacíos; i18n no implementada.

---

## Inconsistencias conocidas (no corregir sin tarea aprobada)
1. **MySQL fantasma**: `docker-compose.yml` levanta `mysql:8.0` pero ningún código lo usa.
2. **Credenciales Supabase hardcodeadas** en `frontend/assets/js/supabase.js`, `detalle.js`, `agendar_visita.js`, `scripts/check_db.js`. Hay que centralizarlas vía config.
3. **URLs de backend hardcodeadas** a `localhost:8000`/`:3000` en el frontend — no funcionan en producción.
4. **Dos definiciones de `habitaciones`** incompatibles: migración 002 (PostGIS, precio/capacidad) vs 003 (tipo/rating/status para Supabase).
5. **`faqs` y `user_questions` sin SQL en repo** — se crean manualmente en panel Supabase.

---

## Graphify
El CLI `graphify` no está instalado en este entorno (el paquete npm `graphify@1.0.0` es un generador de gráficos jQuery distinto). El mapeo del código está en `estructura_proyecto/arquitectura.md`.

---

## Skills a usar
- `test-driven-development` — antes de tocar parseo / agregaciones / KPIs.
- `code-review` — si el cambio toca más de 1 módulo o KPIs visibles.
- `verify` / `run` — para validar comportamiento real.
- `security-review` — antes de merge a main (credenciales, RLS, CORS).
- `deep-research` — si hay incertidumbre técnica.
