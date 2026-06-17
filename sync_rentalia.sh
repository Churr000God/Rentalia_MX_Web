#!/bin/bash

# Script de sincronización para Rentalia.mx
# Actualiza el sitio web desde el repositorio de GitHub

echo "=== Iniciando sincronización de Rentalia.mx ==="

# Cambiar al directorio del dominio
cd /srv/proyecto/dominios/rentalia.mx

# Verificar que estamos en un repositorio git
if [ ! -d ".git" ]; then
    echo "Error: No es un repositorio Git"
    exit 1
fi

# Hacer backup del frontend actual (solo si existe)
if [ -d "frontend" ]; then
    echo "Creando backup del frontend actual..."
    sudo mv frontend frontend_backup_$(date +%F-%H-%M)
fi

# Crear directorio frontend vacío
echo "Creando directorio frontend..."
sudo mkdir frontend

# Hacer pull del repositorio
echo "Descargando cambios del repositorio..."
sudo git pull origin main

# Mover contenido web a la ubicación correcta
if [ -d "frontend/web" ]; then
    echo "Reorganizando estructura del frontend..."
    sudo mv frontend/web/* frontend/
    sudo rm -rf frontend/web
fi

# Aplicar permisos correctos
echo "Configurando permisos..."
sudo chown -R root:root frontend/
sudo find frontend -type d -exec chmod 755 {} \;
sudo find frontend -type f -exec chmod 644 {} \;

# Reiniciar Nginx
echo "Reiniciando Nginx..."
cd /srv/proyecto/
sudo docker-compose restart nginx

# Verificar que existe index.html
echo "Verificando instalación..."
if [ -f "/srv/proyecto/dominios/rentalia.mx/frontend/index.html" ]; then
    echo "✅ index.html encontrado"
else
    echo "❌ ERROR: No se encontró index.html"
fi

echo "=== Sincronización completada ==="
echo "Sitio disponible en: https://rentalia.mx"
echo "Para ver logs de Nginx: sudo docker-compose logs -f nginx"
