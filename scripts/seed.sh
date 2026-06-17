#!/bin/bash

# ==============================================
# RENTALIA.MX - Script de Datos Iniciales (Seeds)
# FUTURO: Para poblar la base de datos con datos iniciales
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
echo "  RENTALIA.MX - Datos Iniciales (Seeds)"
echo "=================================================="
echo -e "${NC}"

# Ir al directorio del proyecto
cd "$(dirname "$0")/.."

# Verificar que el backend esté disponible
if ! docker-compose ps postgres | grep -q "Up"; then
    error "La base de datos no está corriendo. Ejecuta: docker-compose --profile backend up -d postgres"
fi

# Función para ejecutar seeds
run_seeds() {
    local environment=${1:-"development"}
    
    log "Ejecutando seeds para entorno: $environment"
    
    # FUTURO: Implementar lógica de seeds
    # Ejemplo de seeds que se podrían implementar:
    
    case "$environment" in
        "development")
            log "Cargando datos de desarrollo..."
            # seed_users_dev
            # seed_properties_dev
            # seed_categories_dev
            ;;
        "testing")
            log "Cargando datos de prueba..."
            # seed_test_data
            ;;
        "production")
            log "Cargando datos de producción..."
            # seed_basic_data
            ;;
    esac
    
    warn "Los seeds aún no están implementados."
    warn "Este script será funcional cuando se implemente el backend."
}

# Función para limpiar datos
clean_data() {
    log "Limpiando datos existentes..."
    
    # FUTURO: Implementar limpieza de datos
    warn "La limpieza de datos aún no está implementada."
}

# Función para crear seed
create_seed() {
    local name=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local filename="infra/seeds/${timestamp}_${name}.sql"
    
    log "Creando nuevo seed: $filename"
    
    mkdir -p "infra/seeds"
    
    cat > "$filename" << EOF
-- Seed: $name
-- Fecha: $(date)
-- Autor: Rentalia.mx
-- Entorno: development

-- Datos iniciales para $name
BEGIN;

-- TODO: Agregar datos de ejemplo aquí
-- INSERT INTO tabla (columna1, columna2) VALUES 
--   ('valor1', 'valor2'),
--   ('valor3', 'valor4');

COMMIT;
EOF

    log "✅ Seed creado: $filename"
}

# Seeds específicos (FUTURO)
seed_users_dev() {
    log "Cargando usuarios de desarrollo..."
    # Crear usuarios de prueba
}

seed_properties_dev() {
    log "Cargando propiedades de desarrollo..."
    # Crear propiedades de ejemplo
}

seed_categories_dev() {
    log "Cargando categorías..."
    # Crear categorías básicas
}

# Parsear argumentos
case "$1" in
    "run"|"seed")
        environment=${2:-"development"}
        run_seeds "$environment"
        ;;
    "clean")
        read -p "¿Estás seguro de que quieres limpiar todos los datos? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            clean_data
        else
            log "Operación cancelada."
        fi
        ;;
    "create")
        if [ -z "$2" ]; then
            error "Especifica el nombre del seed: ./seed.sh create <nombre>"
        fi
        create_seed "$2"
        ;;
    "reset")
        environment=${2:-"development"}
        log "Reiniciando datos para entorno: $environment"
        clean_data
        run_seeds "$environment"
        ;;
    *)
        echo -e "${YELLOW}Uso: $0 {run|clean|create|reset}${NC}"
        echo ""
        echo "Comandos:"
        echo "  run [env]        Ejecutar seeds (development|testing|production)"
        echo "  clean            Limpiar todos los datos"
        echo "  create <nombre>  Crear nuevo archivo de seed"
        echo "  reset [env]      Limpiar y recargar datos"
        echo ""
        echo "Ejemplos:"
        echo "  $0 run development"
        echo "  $0 create users_sample"
        echo "  $0 reset testing"
        echo "  $0 clean"
        exit 1
        ;;
esac