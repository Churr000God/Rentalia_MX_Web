# Contexto de Dominio — Rentalia.mx

**Fuente de verdad** sobre las entidades de negocio y flujos de la plataforma.

---

## ¿Qué es Rentalia?
Plataforma web mexicana para alquiler de habitaciones y espacios de vivienda. Los usuarios buscan habitaciones disponibles, agendan visitas y pueden dejar reseñas. El negocio tiene una página pública (`rentalia.mx`) y proyecta un panel administrativo futuro.

---

## Entidades principales

### Habitación (`habitaciones`)
Unidad central del negocio. Atributos clave:
- `id` (uuid), `nombre`, `descripcion`, `tipo` (enum), `precio`, `capacidad`
- `direccion`, geolocalización (PostGIS en migración 002; sin PostGIS en 003/Supabase)
- `disponible` (bool), `status` (string en 003), `rating` (float)
- `imagen_principal`, relación 1:N con `habitacion_imagenes` / `imagenes` (jsonb en 003)
- Amenidades: tabla separada `habitacion_amenidades` (002) o jsonb `amenities` (003)
- Estilos/categorías: tabla `habitacion_estilos` (003 Supabase, la activa)

**Consulta activa del frontend:**
```js
supabase.from('habitaciones').select('*, habitacion_estilos(*)')
```
**Consulta activa del backend:**
```sql
SELECT id, nombre, detalles, descripcion, precio, capacidad, disponible, direccion, imagen_principal
FROM rentalia.habitaciones WHERE disponible = true ORDER BY precio ASC
```

---

### Reseña (`reviews_internal`)
Reseñas de usuarios sobre la experiencia general o habitación específica.
- Campos: `author_name`, `rating` (1–5), `comment`, `created_at`, `approved` (bool), `room_id` (nullable)
- Flujo: usuario POST → `approved=false` → admin aprueba → aparece en el sitio
- Política RLS: todos pueden insertar (anon); solo `approved=true` es legible públicamente
- El endpoint `GET /api/reviews` combina estas (internas) con reviews de Google Places API

---

### Reseña Google (`Google Places API`)
Fuente externa. Se obtienen en tiempo real con `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID`.
- Campos retornados: `rating`, `user_ratings_total`, `reviews[:5]`, idioma ES
- Si las credenciales faltan, el endpoint devuelve rating=0, lista vacía (sin error 500)

---

### Visita agendada
El usuario llena un formulario en `agendar_visita.html` → `POST /api/visitas` (backend_node/:3000) → MailerSend envía email de notificación al equipo Rentalia.
- No se persiste en BD (solo notificación por email).
- El formulario también usa Supabase directamente para cargar habitaciones disponibles (selector).

---

### FAQ (`faqs`)
Preguntas frecuentes cargadas dinámicamente desde Supabase.
- Tabla `faqs` creada manualmente en el panel Supabase (no hay SQL en el repo).
- El frontend (`faq.js`) filtra y busca en tiempo real.
- Tabla `user_questions`: permite que usuarios envíen preguntas; RLS = inserción pública (anon), lectura solo admin.

---

## Flujos de usuario

```
1. BUSCAR HABITACIÓN
   Landing → Alternativas → Detalle de habitación
   (datos: Supabase directo, habitaciones + estilos)

2. AGENDAR VISITA
   Detalle o formulario → agendar_visita.html
   → selecciona habitación (Supabase) → llena form → POST /api/visitas → email MailerSend

3. DEJAR RESEÑA
   Landing (sección reseñas) → formulario → POST /api/reviews/internal (FastAPI)
   → queda pendiente de aprobación → admin aprueba en Supabase → aparece en sitio

4. VER RESEÑAS
   Landing → GET /api/reviews → FastAPI combina Google + reseñas internas aprobadas

5. FAQ
   faq.html → Supabase tabla faqs (directo) → búsqueda/filtro en tiempo real
   → modal "Enviar Mensaje" → Supabase tabla user_questions
```

---

## Internacionalización
Esbozada pero **no implementada**. `frontend/assets/locales/{es,en}.json` existen pero están vacíos. Todo el texto del sitio está hardcodeado en español.

---

## Segmentos objetivo
Mencionados en páginas específicas:
- `estudiantes.html` — estudiantes buscando cuarto
- `extranjeros.html` — extranjeros recién llegados a México

---

## Dominio técnico — vocabulario
- **habitaciones**: cuartos/espacios en alquiler (no "rooms" en el negocio, pero el endpoint usa `/rooms`)
- **alternativas**: catálogo de tipos de vivienda/habitaciones
- **experiencias**: sección del sitio sobre vivir en Rentalia
- **admin**: panel administrativo (futuro; hoy solo es placeholder en nginx)
