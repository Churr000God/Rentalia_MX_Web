# Documentación Técnica: Módulo de Preguntas Frecuentes (FAQ)

**Versión:** 1.0.0  
**Fecha:** 2026-01-09  
**Autor:** Equipo DevOps / Desarrollo  
**Estado:** Producción

## Descripción General
Este documento detalla la implementación técnica, arquitectura y configuración del módulo de Preguntas Frecuentes (FAQ) para el sitio `rentalia.mx`. El módulo ha sido rediseñado para ser dinámico, modular y fácil de mantener, integrando Supabase como backend para la gestión de contenido.

## Arquitectura

### Frontend
- **HTML**: Estructura modular en `frontend/pages/faq.html` dividida en secciones semánticas (Hero, Search, Stats, Categories, Accordion, CTA).
- **CSS**: Hoja de estilos dedicada `frontend/assets/css/faq.css`.
    - Utiliza variables CSS globales (`var(--color-primario)`, `var(--color-secundario)`) definidas en `main.css`.
    - Diseño completamente responsivo (Mobile First).
    - Animaciones suaves para interacciones (hover, acordeón, modal).
- **JavaScript**: Lógica encapsulada en `frontend/assets/js/faq.js`.
    - Patrón asíncrono (`async/await`) para llamadas a Supabase.
    - Manipulación del DOM para renderizado dinámico.
    - Gestión de estado local para filtros de búsqueda y categorías.

### Backend (Supabase)
- **Base de Datos**: PostgreSQL alojado en Supabase.
- **Tablas**:
    - `faqs`: Almacena las preguntas y respuestas públicas.
    - `user_questions`: Recibe nuevas preguntas de los usuarios a través del formulario de contacto.
- **Seguridad**: Row Level Security (RLS) habilitado en todas las tablas.

## Estructura de Base de Datos

### Tabla: `faqs`
Utilizada para mostrar el contenido en la página.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | uuid | Identificador único. |
| `created_at` | timestamptz | Fecha de creación. |
| `category` | text | Categoría de la pregunta (ej. 'reservas', 'pagos'). |
| `question` | text | El texto de la pregunta. |
| `answer` | text | El texto de la respuesta (admite HTML básico). |
| `is_active` | bool | Controla la visibilidad (true/false). |
| `sort_order` | int4 | Orden de visualización. |

### Tabla: `user_questions`
Utilizada para capturar leads y dudas de usuarios.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | bigint | Identificador único incremental. |
| `created_at` | timestamptz | Fecha de envío. |
| `name` | text | Nombre del usuario. |
| `email` | text | Correo de contacto. |
| `question` | text | Duda o consulta. |
| `status` | text | Estado de gestión ('pending', 'answered'). Default: 'pending'. |

## Políticas de Seguridad (RLS)

### `faqs`
- **SELECT**: `public` (anon). Permitido para todos los usuarios donde `is_active = true`.
- **INSERT/UPDATE/DELETE**: `authenticated` (admin). Solo administradores.

### `user_questions`
- **INSERT**: `public` (anon). Permitido para cualquier usuario (formulario de contacto).
- **SELECT**: `authenticated` (admin). Solo administradores pueden ver las preguntas recibidas.

## Funcionalidades Clave

### 1. Búsqueda en Tiempo Real
El script `faq.js` implementa un filtrado en el cliente sobre el array de preguntas cargadas (`allFaqs`).
- **Trigger**: Evento `input` en el campo de búsqueda.
- **Lógica**: Filtra por coincidencia de texto en `question` O `answer` Y coincidencia con la categoría activa.

### 2. Filtrado por Categorías
- **UI**: Tarjetas de categoría en la parte superior.
- **Lógica**: Al hacer clic, actualiza la clase `.active` y re-ejecuta el filtro de búsqueda.
- **Contadores**: Se calculan dinámicamente al cargar los datos (`updateCategoryCounts()`).

### 3. Formulario de Contacto (Modal)
- **Activación**: Botón "Enviar Mensaje" en la sección CTA.
- **Flujo**:
    1. Abre modal con efecto backdrop-blur.
    2. Usuario completa nombre, email y pregunta.
    3. Envío asíncrono a tabla `user_questions`.
    4. Feedback visual de éxito o error (con manejo específico de errores de configuración).

### 4. Integración WhatsApp
- Enlace directo a API `wa.me` con número configurado y mensaje pre-rellenado ("Hola me gustaria recibir ayuda").

## Guía de Despliegue y Mantenimiento

### Requisitos Previos
- Proyecto Supabase configurado.
- Variables de entorno o constantes en `faq.js` (`SUPABASE_URL`, `SUPABASE_KEY`) configuradas correctamente.

### Procedimiento de Actualización
1. **Modificar Estilos**: Editar `faq.css`. No sobrescribir estilos globales.
2. **Modificar Lógica**: Editar `faq.js`. Incrementar versión en el query string del HTML (`faq.js?v=X`) para invalidar caché de navegadores.
3. **Gestión de Contenido**: Usar el Table Editor de Supabase para agregar/editar/ocultar preguntas en la tabla `faqs`.

### Solución de Problemas Comunes
- **"Conexión establecida, pero no hay preguntas visibles"**: Verificar que la tabla `faqs` tenga registros con `is_active = true`.
- **"Could not find the table 'public.user_questions'"**: Ejecutar script de migración SQL (ver `CHANGELOG.md` o sección Database arriba).
- **Estilos rotos**: Verificar que `faq.css` se carga después de `main.css`.
