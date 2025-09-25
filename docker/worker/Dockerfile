# Dockerfile para el worker de Rentalia.mx
# FUTURO: Este archivo será implementado para manejar colas y tareas en background

FROM node:18-alpine

# Metadatos
LABEL maintainer="Rentalia.mx <contacto@rentalia.mx>"
LABEL description="Worker para tareas en background de Rentalia.mx"
LABEL version="1.0.0"

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache \
    curl \
    tzdata \
    postgresql-client \
    redis

# Configurar zona horaria
ENV TZ=America/Mexico_City
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Variables de entorno
ENV NODE_ENV=production

# Copiar archivos de dependencias
# COPY backend/worker/package*.json ./

# Instalar dependencias
# RUN npm ci --only=production

# Copiar código fuente
# COPY backend/worker/ .

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambiar permisos
# RUN chown -R nodejs:nodejs /app
# USER nodejs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ps aux | grep -v grep | grep worker || exit 1

# Comando por defecto
# CMD ["node", "worker.js"]
CMD ["echo", "Worker en desarrollo - implementar cuando se requieran tareas en background"]