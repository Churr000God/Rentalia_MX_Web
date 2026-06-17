# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-01-09

### Añadido
- **Frontend / FAQ**: Reestructuración completa de la página de Preguntas Frecuentes (`faq.html`).
    - Nuevo diseño modular con secciones: Hero, Búsqueda, Estadísticas, Categorías, Acordeón de Preguntas y Call to Action (CTA).
    - Implementación de `faq.css` con estilos adaptados a la identidad de marca de Rentalia (paleta de colores naranja/azul, diseño responsivo).
    - Funcionalidad de búsqueda en tiempo real y filtrado por categorías en `faq.js`.
    - Integración con Supabase para carga dinámica de preguntas desde la tabla `faqs`.
    - Botón de WhatsApp actualizado con enlace directo (`wa.me`) y mensaje predefinido.
    - Nuevo modal de contacto ("Enviar Mensaje") con formulario integrado.
- **Backend / Base de Datos**:
    - Script SQL para creación de tabla `user_questions` para recibir consultas de usuarios.
    - Políticas de seguridad (RLS) configuradas para permitir inserción pública (anon) y lectura solo admin en `user_questions`.

### Corregido
- **Frontend / FAQ**: Solucionado conflicto de estilos al sobrescribir `faq.css` accidentalmente; se restauraron los estilos base y se añadieron correctamente los estilos del modal.
- **Frontend / UX**: Manejo de errores amigable en el formulario de contacto (mensajes específicos para errores de configuración vs permisos).

## [Unreleased] - 2025-12-22

### Corregido
- **Frontend / Supabase**: Solucionado error en `supabase.js` que intentaba acceder a `#habitaciones-grid` en páginas donde no existía (como `agendar_visita.html`). Se agregó una validación de existencia del elemento antes de intentar manipularlo.
- **Backend / CORS**: Corregida la política de CORS en `backend/app/main.py`.
    - Se reemplazó el comodín `"*"` (que conflictuaba con `allow_credentials=True`) por una lista explícita de orígenes permitidos (`http://localhost:8081`, `http://127.0.0.1:8081`, etc.).
    - Esto resolvió el error `net::ERR_FAILED` y problemas de bloqueo por CORS al consultar `/api/reviews`.
- **Backend / Configuración**: Corregida la carga de variables de entorno en `backend/app/main.py`.
    - Se implementó `pathlib` para localizar correctamente el archivo `.env` en la raíz del proyecto (`sites/rentalia.mx/.env`), ya que la ejecución desde `uvicorn` dentro de subdirectorios no lo encontraba automáticamente.

### Infraestructura
- **Desarrollo Local**: Se identificó que el contenedor Docker `rentaliamx-backend-1` ejecutaba una versión desactualizada del código. Se procedió a detener el contenedor y ejecutar el backend directamente con `uvicorn` para desarrollo rápido y validación de cambios.

### Análisis
- **Google Maps**: Se investigó el error `net::ERR_BLOCKED_BY_CLIENT` en `main.js`. Se determinó que es un falso positivo causado por bloqueadores de anuncios (AdBlockers) del lado del cliente que impiden la telemetría de Google Maps (`gen_204`), sin afectar la funcionalidad del mapa incrustado en el footer. No se requieren cambios de código.
