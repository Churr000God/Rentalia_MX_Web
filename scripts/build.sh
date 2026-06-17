#!/bin/bash

# ==============================================
# RENTALIA.MX - Script de Construcción
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
echo "  RENTALIA.MX - Construcción para Producción"
echo "=================================================="
echo -e "${NC}"

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado."
fi

# Ir al directorio del proyecto
cd "$(dirname "$0")/.."

# Variables
BUILD_DIR="build"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
VERSION=${1:-"latest"}

log "Iniciando proceso de construcción..."
log "Versión: $VERSION"
log "Timestamp: $TIMESTAMP"

# Limpiar construcciones anteriores
if [ -d "$BUILD_DIR" ]; then
    log "Limpiando directorio de construcción anterior..."
    rm -rf "$BUILD_DIR"
fi

# Crear directorio de construcción
log "Creando directorio de construcción..."
mkdir -p "$BUILD_DIR"

# Construir imagen Docker
log "Construyendo imagen Docker..."
docker build -f docker/web/Dockerfile -t "rentalia/web:$VERSION" -t "rentalia/web:latest" .

# Verificar que la imagen se construyó correctamente
if docker images | grep -q "rentalia/web"; then
    log "✅ Imagen Docker construida exitosamente!"
else
    error "❌ Error al construir la imagen Docker"
fi

# Crear archivo de construcción con metadatos
log "Generando metadatos de construcción..."
cat > "$BUILD_DIR/build-info.json" << EOF
{
  "version": "$VERSION",
  "timestamp": "$TIMESTAMP",
  "build_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "docker_image": "rentalia/web:$VERSION",
  "environment": "production"
}
EOF

# Exportar imagen Docker (opcional)
if [ "$2" = "--export" ]; then
    log "Exportando imagen Docker..."
    docker save "rentalia/web:$VERSION" | gzip > "$BUILD_DIR/rentalia-web-$VERSION.tar.gz"
    log "✅ Imagen exportada a: $BUILD_DIR/rentalia-web-$VERSION.tar.gz"
fi

# Crear archivo docker-compose para producción
log "Generando docker-compose para producción..."
cat > "$BUILD_DIR/docker-compose.prod.yml" << EOF
version: '3.8'

services:
  web:
    image: rentalia/web:$VERSION
    container_name: rentalia_web_prod
    ports:
      - "80:80"
      - "443:443"
    networks:
      - rentalia_network
    restart: unless-stopped
    environment:
      - TZ=America/Mexico_City
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.rentalia-web.rule=Host(\`rentalia.mx\`)"
      - "traefik.http.routers.rentalia-web.tls=true"
      - "traefik.http.routers.rentalia-web.tls.certresolver=letsencrypt"

networks:
  rentalia_network:
    driver: bridge
EOF

# Crear script de despliegue
log "Generando script de despliegue..."
cat > "$BUILD_DIR/deploy.sh" << 'EOF'
#!/bin/bash

# Script de despliegue para producción
set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Iniciando despliegue de Rentalia.mx..."

# Cargar imagen si existe
if [ -f "rentalia-web-*.tar.gz" ]; then
    log "Cargando imagen Docker..."
    docker load < rentalia-web-*.tar.gz
fi

# Detener servicios existentes
log "Deteniendo servicios existentes..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Levantar nuevos servicios
log "Levantando servicios..."
docker-compose -f docker-compose.prod.yml up -d

# Verificar estado
sleep 5
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log "✅ Despliegue exitoso!"
else
    log "❌ Error en el despliegue"
    exit 1
fi
EOF

chmod +x "$BUILD_DIR/deploy.sh"

# Resumen
echo ""
log "🎉 Construcción completada exitosamente!"
echo ""
echo -e "${GREEN}📦 Archivos generados:${NC}"
echo "   $BUILD_DIR/build-info.json"
echo "   $BUILD_DIR/docker-compose.prod.yml"
echo "   $BUILD_DIR/deploy.sh"
if [ "$2" = "--export" ]; then
    echo "   $BUILD_DIR/rentalia-web-$VERSION.tar.gz"
fi
echo ""
echo -e "${YELLOW}🚀 Para desplegar:${NC}"
echo "   1. Copia los archivos del directorio '$BUILD_DIR' al servidor"
echo "   2. Ejecuta: ./deploy.sh"
echo ""
echo -e "${BLUE}💡 Comandos útiles:${NC}"
echo "   docker run -p 8080:80 rentalia/web:$VERSION    # Probar localmente"
echo "   docker images | grep rentalia                   # Ver imágenes"
echo "   docker rmi rentalia/web:$VERSION               # Eliminar imagen"