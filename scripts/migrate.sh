#!/bin/bash

# ==============================================
# RENTALIA.MX - Script de Migraciones
# FUTURO: Para manejar migraciones de base de datos
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
echo "  RENTALIA.MX - Migraciones de Base de Datos"
echo "=================================================="
echo -e "${NC}"

# Ir al directorio del proyecto
cd "$(dirname "$0")/.."

# Verificar que el backend esté disponible
if ! docker-compose ps postgres | grep -q "Up"; then
    error "La base de datos no está corriendo. Ejecuta: docker-compose --profile backend up -d postgres"
fi

# Función para ejecutar migraciones
run_migrations() {
    log "Ejecutando migraciones..."
    
    # FUTURO: Implementar lógica de migraciones
    # Ejemplo con herramientas como Flyway, Liquibase, o scripts SQL
    
    # for migration in database/migrations/*.sql; do
    #     if [ -f "$migration" ]; then
    #         log "Ejecutando migración: $(basename "$migration")"
    #         docker-compose exec postgres psql -U rentalia_user -d rentalia_db -f "/migrations/$(basename "$migration")"
    #     fi
    # done
    
    warn "Las migraciones aún no están implementadas."
    warn "Este script será funcional cuando se implemente el backend."
}

# Función para rollback
rollback_migration() {
    local version=$1
    log "Haciendo rollback a la versión: $version"
    
    # FUTURO: Implementar lógica de rollback
    warn "El rollback aún no está implementado."
}

# Función para mostrar estado
show_status() {
    log "Estado de migraciones:"
    
    # FUTURO: Mostrar qué migraciones se han ejecutado
    warn "El estado de migraciones aún no está implementado."
}

# Función para crear nueva migración
create_migration() {
    local name=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local filename="database/migrations/${timestamp}_${name}.sql"
    
    log "Creando nueva migración: $filename"
    
    mkdir -p "database/migrations"
    
    cat > "$filename" << EOF
-- Migración: $name
-- Fecha: $(date)
-- Autor: Rentalia.mx

-- UP: Aplicar cambios
BEGIN;

-- TODO: Agregar comandos SQL aquí

COMMIT;

-- DOWN: Revertir cambios (comentado)
-- BEGIN;
-- TODO: Agregar comandos de rollback aquí
-- COMMIT;
EOF

    log "✅ Migración creada: $filename"
}

# Parsear argumentos
case "$1" in
    "up"|"migrate")
        run_migrations
        ;;
    "down"|"rollback")
        if [ -z "$2" ]; then
            error "Especifica la versión para rollback: ./migrate.sh rollback <version>"
        fi
        rollback_migration "$2"
        ;;
    "status")
        show_status
        ;;
    "create")
        if [ -z "$2" ]; then
            error "Especifica el nombre de la migración: ./migrate.sh create <nombre>"
        fi
        create_migration "$2"
        ;;
    *)
        echo -e "${YELLOW}Uso: $0 {up|down|status|create}${NC}"
        echo ""
        echo "Comandos:"
        echo "  up, migrate           Ejecutar migraciones pendientes"
        echo "  down, rollback <ver>  Revertir a una versión específica"
        echo "  status                Mostrar estado de migraciones"
        echo "  create <nombre>       Crear nueva migración"
        echo ""
        echo "Ejemplos:"
        echo "  $0 up"
        echo "  $0 create add_users_table"
        echo "  $0 rollback 20231201_120000"
        echo "  $0 status"
        exit 1
        ;;
esac