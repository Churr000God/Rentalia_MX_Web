#!/bin/bash

# ==============================================
# RENTALIA.MX - Entorno de Desarrollo Completo
# Levanta: backend FastAPI :8000 + admin Next.js :4000 + frontend estático :8080
# Uso: bash scripts/dev-all.sh
# Salir con Ctrl-C apaga los 3 servicios.
# ==============================================

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log()   { echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"; }
warn()  { echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠  $1${NC}"; }
error() { echo -e "${RED}[$(date +'%H:%M:%S')] ✗  $1${NC}" >&2; exit 1; }
info()  { echo -e "${CYAN}$1${NC}"; }

# ── Directorio raíz del proyecto ──────────────────────────────────────────────
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ── Banner ────────────────────────────────────────────────────────────────────
echo -e "${BLUE}"
echo "=================================================="
echo "  RENTALIA.MX - Entorno de Desarrollo Completo"
echo "=================================================="
echo -e "${NC}"

# ══════════════════════════════════════════════════════════════════════════════
# VERIFICACIONES PREVIAS
# ══════════════════════════════════════════════════════════════════════════════
log "Verificando prerrequisitos..."

# .env raíz (backend FastAPI lo necesita para SUPABASE_URL/KEY)
if [[ ! -f "$ROOT/.env" ]]; then
    error ".env no encontrado en la raíz. Copia .env.example y llena SUPABASE_URL + SUPABASE_KEY."
fi
if ! grep -q "SUPABASE_URL=" "$ROOT/.env" 2>/dev/null; then
    warn ".env existe pero SUPABASE_URL no está definido — el backend podría fallar."
fi

# admin/.env.local (Next.js lo necesita para Supabase)
if [[ ! -f "$ROOT/admin/.env.local" ]]; then
    warn "admin/.env.local no encontrado. El panel admin no podrá conectarse a Supabase."
fi

# backend/.venv — si no existe, dar instrucción clara
if [[ ! -d "$ROOT/backend/.venv" ]]; then
    error "Entorno virtual no encontrado en backend/.venv.\nCrealo con:\n  cd backend && python3 -m venv .venv && source .venv/bin/activate\n  pip install fastapi uvicorn supabase python-dotenv httpx asyncpg pydantic"
fi

# admin/node_modules — instalar si falta
if [[ ! -d "$ROOT/admin/node_modules" ]]; then
    log "node_modules no encontrado en admin/. Instalando dependencias..."
    (cd "$ROOT/admin" && npm install) || error "npm install falló en admin/."
fi

# python3 para servir el frontend
if ! command -v python3 &>/dev/null; then
    error "python3 no está instalado — necesario para servir el frontend estático."
fi

log "Prerrequisitos OK."
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# TRAMPA: matar todos los hijos al salir (Ctrl-C o error)
# ══════════════════════════════════════════════════════════════════════════════
PIDS=()
cleanup() {
    echo ""
    log "Apagando servicios..."
    for pid in "${PIDS[@]:-}"; do
        kill "$pid" 2>/dev/null || true
    done
    wait 2>/dev/null || true
    log "Todos los servicios detenidos."
}
trap cleanup INT TERM EXIT

# ══════════════════════════════════════════════════════════════════════════════
# 1. BACKEND FASTAPI — puerto 8000
# ══════════════════════════════════════════════════════════════════════════════
log "Iniciando backend FastAPI en :8000..."
(
    cd "$ROOT/backend"
    source .venv/bin/activate
    uvicorn app.main:app --reload --port 8000 2>&1 | sed 's/^/[backend] /'
) &
PIDS+=($!)

# Dar un momento para que arranque y detectar fallos inmediatos
sleep 2
if ! kill -0 "${PIDS[-1]}" 2>/dev/null; then
    error "El backend no arrancó. Revisa los logs arriba."
fi

# ══════════════════════════════════════════════════════════════════════════════
# 2. ADMIN NEXT.JS — puerto 4000
# ══════════════════════════════════════════════════════════════════════════════
log "Iniciando admin Next.js en :4000..."
(
    cd "$ROOT/admin"
    npm run dev 2>&1 | sed 's/^/[admin]   /'
) &
PIDS+=($!)

# ══════════════════════════════════════════════════════════════════════════════
# 3. FRONTEND ESTÁTICO — puerto 8080
# (CORS del backend sólo acepta :8080 y :8081 — no cambiar el puerto)
# ══════════════════════════════════════════════════════════════════════════════
log "Iniciando frontend estático en :8080..."
(
    cd "$ROOT/frontend"
    python3 -m http.server 8080 2>&1 | sed 's/^/[frontend]/'
) &
PIDS+=($!)

# ══════════════════════════════════════════════════════════════════════════════
# RESUMEN DE URLS
# ══════════════════════════════════════════════════════════════════════════════
sleep 1
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Servicios activos${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
info "  🌐 Frontend    →  http://localhost:8080"
info "  🛠  Admin       →  http://localhost:4000"
info "  ⚙️  Backend API →  http://localhost:8000/docs"
echo ""
warn "Presiona Ctrl-C para detener todos los servicios."
echo ""

# Esperar indefinidamente hasta Ctrl-C
wait
