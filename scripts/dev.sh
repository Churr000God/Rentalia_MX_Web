#!/bin/bash

# ==============================================
# RENTALIA.MX - Script de Desarrollo
# ==============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Banner
echo -e "${BLUE}"
echo "=================================================="
echo "  RENTALIA.MX - Entorno de Desarrollo"
echo "=================================================="
echo -e "${NC}"

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Por favor instala Docker Desktop."
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado."
fi

# Verificar que Docker esté corriendo
if ! docker info &> /dev/null; then
    error "Docker no está corriendo. Por favor inicia Docker Desktop."
fi

# Ir al directorio del proyecto
cd "$(dirname "$0")/.."

log "Iniciando entorno de desarrollo..."

# Detener contenedores existentes
log "Deteniendo contenedores existentes..."
docker-compose down --remove-orphans

# Construir y levantar solo el frontend
log "Construyendo y levantando el frontend..."
docker-compose up -d web

# Esperar a que el servicio esté listo
log "Esperando a que el servicio esté listo..."
sleep 5

# Verificar que el servicio esté corriendo
if docker-compose ps web | grep -q "Up"; then
    log "✅ Frontend corriendo exitosamente!"
    echo ""
    echo -e "${GREEN}🌐 Aplicación disponible en:${NC}"
    echo -e "   ${BLUE}http://localhost:8080${NC}"
    echo ""
    echo -e "${YELLOW}📋 Comandos útiles:${NC}"
    echo "   docker-compose logs web          # Ver logs"
    echo "   docker-compose restart web      # Reiniciar"
    echo "   docker-compose down             # Detener"
    echo ""
    
    # Abrir en navegador (opcional)
    if command -v start &> /dev/null; then
        read -p "¿Abrir en navegador? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            start http://localhost:8080
        fi
    fi
else
    error "❌ Error al iniciar el frontend. Revisa los logs con: docker-compose logs web"
fi

# Mostrar logs en tiempo real (opcional)
read -p "¿Ver logs en tiempo real? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Mostrando logs en tiempo real (Ctrl+C para salir)..."
    docker-compose logs -f web
fi