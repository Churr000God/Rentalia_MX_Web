# MANUAL DE FLUJO DE TRABAJO PARA DESARROLLO Y DEPLOYMENT

## 📋 ÍNDICE
1. [Flujo de Trabajo GitHub → Servidor](#flujo-de-trabajo-github--servidor)
2. [Comandos para Actualizar desde Servidor](#comandos-para-actualizar-desde-servidor)
3. [Implementación en Nuevos Dominios](#implementación-en-nuevos-dominios)
4. [Scripts de Automatización](#scripts-de-automatización)
5. [Troubleshooting](#troubleshooting)

---

## 🔄 FLUJO DE TRABAJO GITHUB → SERVIDOR

### PASO 1: DESARROLLO LOCAL
```bash
# 1. Crear rama de desarrollo
git checkout -b nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "Descripción de cambios"

# 3. Subir rama a GitHub
git push origin nueva-funcionalidad
```

### PASO 2: PULL REQUEST EN GITHUB
1. Ir a GitHub → Create Pull Request
2. Solicitar review del código
3. **APROBAR** el Pull Request
4. **MERGER** a la rama `main`

### PASO 3: DEPLOYMENT EN SERVIDOR
Una vez aprobados los cambios en GitHub:

```bash
# Conectarse al servidor
ssh usuario@dominio.com

# Ir al directorio del dominio
cd /srv/proyecto/dominios/[DOMINIO]/

# Ejecutar script de sincronización
./sync_[DOMINIO].sh

# IMPORTANTE: Si hubo cambios en el Backend (Python/FastAPI)
# Es necesario reconstruir el contenedor para aplicar los cambios de código:
sudo docker-compose up -d --build backend
```

---

## 🛠️ CONFIGURACIÓN LOCAL Y DEBUGGING

### BACKEND (FASTAPI)
Para desarrollar y probar cambios en el backend sin reconstruir contenedores Docker constantemente:

1. **Detener el contenedor del backend (si está corriendo):**
   ```bash
   docker stop rentaliamx-backend-1
   ```

2. **Instalar dependencias locales (una sola vez):**
   ```bash
   cd sites/rentalia.mx/backend
   pip install fastapi uvicorn supabase python-dotenv httpx asyncpg pydantic
   ```

3. **Ejecutar servidor de desarrollo:**
   ```bash
   # Desde sites/rentalia.mx/backend
   uvicorn app.main:app --reload --port 8000
   ```
   *El flag `--reload` reiniciará el servidor automáticamente al guardar cambios en el código.*

4. **Verificar funcionamiento:**
   - Endpoint de reseñas: `http://localhost:8000/api/reviews`
   - Documentación interactiva: `http://localhost:8000/docs`

### FRONTEND
Si usas VS Code o similar con "Live Server":
1. Abrir `sites/rentalia.mx/frontend`
2. Iniciar Live Server (generalmente en puerto 8080 u 8081).
3. El backend está configurado para aceptar peticiones CORS desde `localhost:8080`, `localhost:8081` y `localhost:3000`.

---

## 🖥️ COMANDOS PARA ACTUALIZAR DESDE SERVIDOR

### OPCIÓN 1: SCRIPT AUTOMÁTICO (RECOMENDADO)
```bash
cd /srv/proyecto/dominios/rentalia.mx/
./sync_rentalia.sh
```

### OPCIÓN 2: PROCESO MANUAL
```bash
# 1. Ir al directorio del dominio
cd /srv/proyecto/dominios/[DOMINIO]/

# 2. Crear backup del frontend actual
sudo mv frontend frontend_backup_$(date +%F-%H-%M)

# 3. Crear directorio frontend vacío
sudo mkdir frontend

# 4. Descargar cambios desde GitHub
sudo git pull origin main

# 5. Reorganizar estructura si es necesario
if [ -d "frontend/web" ]; then
    sudo mv frontend/web/* frontend/
    sudo rm -rf frontend/web
fi

# 6. Aplicar permisos correctos
sudo chown -R root:root frontend/
sudo find frontend -type d -exec chmod 755 {} \;
sudo find frontend -type f -exec chmod 644 {} \;

# 7. Reiniciar Nginx
cd /srv/proyecto/
sudo docker-compose restart nginx

# 8. Verificar deployment
ls -l /srv/proyecto/dominios/[DOMINIO]/frontend/index.html
```

---

## 🌐 IMPLEMENTACIÓN EN NUEVOS DOMINIOS

### PASO 1: PREPARAR DIRECTORIO DEL DOMINIO
```bash
# 1. Crear directorio para el nuevo dominio
sudo mkdir -p /srv/proyecto/dominios/[NUEVO_DOMINIO]/

# 2. Cambiar al directorio
cd /srv/proyecto/dominios/[NUEVO_DOMINIO]/

# 3. Configurar permisos del directorio
sudo chown -R www-data:www-data .
```

### PASO 2: CONECTAR CON REPOSITORIO GITHUB
```bash
# 1. Inicializar repositorio Git
sudo git init

# 2. Configurar directorio como seguro
sudo git config --global --add safe.directory /srv/proyecto/dominios/[NUEVO_DOMINIO]

# 3. Agregar repositorio remoto
sudo git remote add origin https://github.com/[USUARIO]/[REPOSITORIO].git

# 4. Configurar usuario Git
sudo git config user.email "deploy@[DOMINIO]"
sudo git config user.name "Server Deploy"

# 5. Descargar contenido inicial
sudo git pull origin main
```

### PASO 3: CONFIGURAR ESTRUCTURA DE DEPLOYMENT
```bash
# 1. Crear estructura necesaria para nginx
sudo mkdir -p config

# 2. Crear archivos de log necesarios
sudo touch config/access.log config/error.log

# 3. Reorganizar frontend si es necesario
if [ -d "frontend/web" ]; then
    sudo mv frontend/web/* frontend/
    sudo rm -rf frontend/web
fi

# 4. Aplicar permisos correctos
sudo chown -R root:root frontend/
sudo find frontend -type d -exec chmod 755 {} \;
sudo find frontend -type f -exec chmod 644 {} \;
```

### PASO 4: CREAR SCRIPT DE SINCRONIZACIÓN
```bash
# Crear script personalizado para el dominio
sudo tee sync_[NUEVO_DOMINIO].sh > /dev/null << 'EOL'
#!/bin/bash

# Script de sincronización para [NUEVO_DOMINIO]
echo "=== Iniciando sincronización de [NUEVO_DOMINIO] ==="

# Cambiar al directorio del dominio
cd /srv/proyecto/dominios/[NUEVO_DOMINIO]

# Verificar repositorio git
if [ ! -d ".git" ]; then
    echo "Error: No es un repositorio Git"
    exit 1
fi

# Backup del frontend actual
if [ -d "frontend" ]; then
    echo "Creando backup del frontend actual..."
    sudo mv frontend frontend_backup_$(date +%F-%H-%M)
fi

# Crear directorio frontend
echo "Creando directorio frontend..."
sudo mkdir frontend

# Descargar cambios
echo "Descargando cambios del repositorio..."
sudo git pull origin main

# Reorganizar estructura si es necesario
if [ -d "frontend/web" ]; then
    echo "Reorganizando estructura del frontend..."
    sudo mv frontend/web/* frontend/
    sudo rm -rf frontend/web
fi

# Aplicar permisos
echo "Configurando permisos..."
sudo chown -R root:root frontend/
sudo find frontend -type d -exec chmod 755 {} \;
sudo find frontend -type f -exec chmod 644 {} \;

# Reiniciar Nginx
echo "Reiniciando Nginx..."
cd /srv/proyecto/
sudo docker-compose restart nginx

# Verificar
echo "Verificando instalación..."
if [ -f "/srv/proyecto/dominios/[NUEVO_DOMINIO]/frontend/index.html" ]; then
    echo "✅ index.html encontrado"
    echo "✅ Sitio disponible en: https://[NUEVO_DOMINIO]"
else
    echo "❌ ERROR: No se encontró index.html"
fi

echo "=== Sincronización completada ==="
EOL

# Hacer ejecutable
sudo chmod +x sync_[NUEVO_DOMINIO].sh
```

### PASO 5: CONFIGURAR NGINX (Si es necesario)
```bash
# Reiniciar nginx para reconocer el nuevo dominio
cd /srv/proyecto/
sudo docker-compose restart nginx
```

---

## 🤖 SCRIPTS DE AUTOMATIZACIÓN

### SCRIPT MAESTRO PARA MÚLTIPLES DOMINIOS
```bash
sudo tee sync_all_domains.sh > /dev/null << 'EOL'
#!/bin/bash

# Script para sincronizar todos los dominios
DOMINIOS=("rentalia.mx" "oceaan.us" "reparalandia.com")

echo "=== Sincronización masiva de dominios ==="

for dominio in "${DOMINIOS[@]}"; do
    echo "🔄 Sincronizando $dominio..."
    cd /srv/proyecto/dominios/$dominio/
    
    if [ -f "sync_$dominio.sh" ]; then
        ./sync_$dominio.sh
        echo "✅ $dominio sincronizado"
    else
        echo "❌ Script de sincronización no encontrado para $dominio"
    fi
    
    echo "---"
done

echo "=== Sincronización masiva completada ==="
EOL

sudo chmod +x sync_all_domains.sh
```

### SCRIPT DE VERIFICACIÓN DE SITIOS
```bash
sudo tee verify_sites.sh > /dev/null << 'EOL'
#!/bin/bash

# Script para verificar que todos los sitios estén funcionando
DOMINIOS=("rentalia.mx" "oceaan.us" "reparalandia.com")

echo "=== Verificación de sitios web ==="

for dominio in "${DOMINIOS[@]}"; do
    echo "🔍 Verificando $dominio..."
    
    # Verificar index.html existe
    if [ -f "/srv/proyecto/dominios/$dominio/frontend/index.html" ]; then
        echo "  ✅ index.html existe"
    else
        echo "  ❌ index.html NO encontrado"
    fi
    
    # Verificar respuesta HTTP
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ -H "Host: $dominio" || echo "000")
    if [ "$response" = "200" ] || [ "$response" = "301" ] || [ "$response" = "302" ]; then
        echo "  ✅ HTTP responde correctamente ($response)"
    else
        echo "  ❌ HTTP error ($response)"
    fi
    
    echo "---"
done

echo "=== Verificación completada ==="
EOL

sudo chmod +x verify_sites.sh
```

---

## 🚨 TROUBLESHOOTING

### PROBLEMAS COMUNES Y SOLUCIONES

#### Error: "ERR_CONNECTION_REFUSED"
```bash
# Verificar estado de nginx
sudo docker-compose ps nginx

# Ver logs de nginx
sudo docker-compose logs nginx | tail -20

# Verificar archivos de configuración necesarios
ls -la /srv/proyecto/dominios/[DOMINIO]/config/

# Crear archivos de log si faltan
sudo mkdir -p config
sudo touch config/access.log config/error.log

# Reiniciar nginx
sudo docker-compose restart nginx
```

#### Error: "No se encontró index.html"
```bash
# Verificar estructura del frontend
ls -la /srv/proyecto/dominios/[DOMINIO]/frontend/

# Si el contenido está en frontend/web/, moverlo
if [ -d "frontend/web" ]; then
    sudo mv frontend/web/* frontend/
    sudo rm -rf frontend/web
fi

# Verificar permisos
sudo chown -R root:root frontend/
sudo find frontend -type d -exec chmod 755 {} \;
sudo find frontend -type f -exec chmod 644 {} \;
```

#### Error: Git "dubious ownership"
```bash
sudo git config --global --add safe.directory /srv/proyecto/dominios/[DOMINIO]
```

#### Error: "failed to push some refs"
```bash
# Forzar push (usar con cuidado)
sudo git push --force-with-lease origin [RAMA]

# O hacer pull primero
sudo git pull origin main --rebase
sudo git push origin [RAMA]
```

---

## 📝 CHECKLIST DE DEPLOYMENT

### ANTES DE HACER DEPLOYMENT:
- [ ] Pull Request aprobado en GitHub
- [ ] Rama mergeada a `main`
- [ ] Backup del sitio actual realizado
- [ ] Nginx funcionando correctamente

### DURANTE EL DEPLOYMENT:
- [ ] Ejecutar script de sincronización
- [ ] Verificar que no hay errores en el script
- [ ] Confirmar que nginx reinició correctamente

### DESPUÉS DEL DEPLOYMENT:
- [ ] Verificar que `index.html` existe y es accesible
- [ ] Probar el sitio web en el navegador
- [ ] Revisar logs de nginx para errores
- [ ] Confirmar que todos los assets cargan correctamente

---

## 🔧 COMANDOS ÚTILES

```bash
# Ver estado de todos los containers
sudo docker-compose ps

# Ver logs de nginx en tiempo real
sudo docker-compose logs -f nginx

# Verificar espacio en disco
df -h

# Ver procesos de git activos
ps aux | grep git

# Limpiar archivos temporales de git
sudo git clean -fd

# Ver historial de commits
sudo git --no-pager log --oneline -10

# Ver diferencias entre ramas
sudo git --no-pager diff main..origin/main

# Verificar conectividad con GitHub
curl -I https://github.com

# Test de conectividad HTTP local
curl -I http://localhost/
```

---

## 📞 CONTACTO Y SOPORTE

**En caso de problemas:**
1. Verificar logs de nginx: `sudo docker-compose logs nginx`
2. Comprobar permisos de archivos: `ls -la frontend/`
3. Verificar estado de git: `sudo git status`
4. Revisar este manual en la sección de troubleshooting

**Ubicación de este manual:**
`/srv/proyecto/dominios/rentalia.mx/MANUAL_FLUJO_DESARROLLO.md`

---

*Última actualización: $(date +"%Y-%m-%d %H:%M:%S")*
*Servidor: $(hostname)*
