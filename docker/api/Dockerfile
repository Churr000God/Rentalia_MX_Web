# Dockerfile para el backend API de Rentalia.mx
# FUTURO: Este archivo será implementado cuando se desarrolle el backend

FROM node:18-alpine

# Metadatos
LABEL maintainer="Rentalia.mx <contacto@rentalia.mx>"
LABEL description="Backend API para Rentalia.mx"
LABEL version="1.0.0"

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache \
    curl \
    tzdata \
    postgresql-client

# Configurar zona horaria
ENV TZ=America/Mexico_City
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Copiar archivos de dependencias
# COPY backend/api/package*.json ./

# Instalar dependencias
# RUN npm ci --only=production

# Copiar código fuente
# COPY backend/api/ .

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambiar permisos
# RUN chown -R nodejs:nodejs /app
# USER nodejs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Exponer puerto
EXPOSE 3000

# Comando por defecto
# CMD ["node", "server.js"]
CMD ["echo", "Backend API en desarrollo - usar 'npm start' cuando esté implementado"]