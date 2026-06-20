# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-06-19

### Añadido

#### Feature: Ubicaciones — agrupar habitaciones por propiedad

- **Base de datos** (`database/migrations/010_ubicaciones.sql`): tabla `ubicaciones` (nombre, zona pública, lat/lng, `distancias` jsonb, activo, orden). Columnas `ubicacion_id` (FK → `ubicaciones`) e `incluye` (jsonb) en `habitaciones`. Columna `ubicacion_id` en `location_amenities` (NULL = amenidad global; ON DELETE CASCADE). RLS: lectura anónima sólo si `activo`, CRUD para autenticados. Seed "Casa Narvarte" + migración de datos existentes.
- **Admin — CRUD de ubicaciones**: formulario `UbicacionForm.tsx` (nombre, zona, dirección interna, lat/lng, editor dinámico de puntos de interés, toggle activo, orden); páginas `dashboard/ubicaciones/` (lista), `nueva/` y `[id]/` (edición); enlace "Ubicaciones" con ícono de pin en el `Sidebar.tsx`.
- **Admin — Habitaciones** (`RoomForm.tsx`): selector de `ubicacion_id`; campo "Qué incluye la renta" como chips editables (`incluye`); amenidades divididas por `showInCard` (con ícono en tarjeta de catálogo vs sólo en detalle).
- **Admin — Amenidades generales** (`AmenidadGeneralForm.tsx`): selector para asociar la amenidad a una ubicación concreta o dejarla global (aplica a todas).
- **Admin — `lib/amenities.ts`**: flag `showInCard` en cada amenidad; nuevas amenidades `cama_matrimonial` y `ventana_exterior` marcadas como sólo-detalle.
- **Frontend — Detalle de habitación** (`detalle-habitacion.html`, `detalle.js`, `detalle.css`): sustituye mapa decorativo CSS por mapa **Leaflet real** (tiles OSM, círculo aproximado ~300 m para privacidad). Secciones "Qué incluye", "Amenidades de la casa" y "Ubicación" pasan de contenido hardcodeado a secciones dinámicas cargadas desde Supabase (`ubicacion_id`, `incluye`, `location_amenities`). Cargas en paralelo con `Promise.all`.

#### Infraestructura

- **`scripts/dev-all.sh`**: script único que levanta los 3 servicios activos en background (backend FastAPI :8000, admin Next.js :4000, frontend estático :8080), verifica prerrequisitos y apaga todos con un solo Ctrl-C.
- **`backend/uv.lock`**: lockfile del gestor `uv` para el backend Python.

---

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
