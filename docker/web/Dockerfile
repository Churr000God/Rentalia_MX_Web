# Dockerfile para servir el frontend de Rentalia.mx
FROM nginx:alpine

# Metadatos
LABEL maintainer="Rentalia.mx <contacto@rentalia.mx>"
LABEL description="Frontend web para Rentalia.mx"
LABEL version="1.0.0"

# Instalar dependencias adicionales si es necesario
RUN apk add --no-cache \
    curl \
    tzdata

# Configurar zona horaria
ENV TZ=America/Mexico_City
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copiar configuración personalizada de nginx
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/conf.d/ /etc/nginx/conf.d/

# Copiar archivos del frontend
COPY frontend/web/ /usr/share/nginx/html/
COPY public/ /usr/share/nginx/html/

# Crear directorio para logs
RUN mkdir -p /var/log/nginx

# Configurar permisos
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/log/nginx \
    && chmod -R 755 /usr/share/nginx/html

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Exponer puerto
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]