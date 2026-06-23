-- 014_amenidades.sql
-- Página pública "Amenidades" (reemplaza "Experiencias")
-- Tablas: lugares_cercanos, barrio_fotos
-- ALTER: location_amenities (+ badge), site_config (+ keys amenidades_*)
-- Proyecto: vefgwrxgfuzgfictdsyo (Rentalia.mx)
-- Aplicar en: Supabase SQL Editor → proyecto vefgwrxgfuzgfictdsyo

-- ─── 1. ALTER location_amenities → añadir columna badge ───────────────────────
-- badge: etiqueta visual libre ("Área común", "Incluida", "Smart", "Seguridad", etc.)
-- Nullable: amenidades sin badge simplemente no muestran el chip.
ALTER TABLE public.location_amenities
  ADD COLUMN IF NOT EXISTS badge text;

-- Backfill de badges para el seed inicial (12 amenidades)
UPDATE public.location_amenities SET badge = 'Servicios'    WHERE slug = 'wifi_comun';
UPDATE public.location_amenities SET badge = 'Área común'   WHERE slug = 'cocina_comun';
UPDATE public.location_amenities SET badge = 'Área común'   WHERE slug = 'sala_estar';
UPDATE public.location_amenities SET badge = 'Área común'   WHERE slug = 'terraza';
UPDATE public.location_amenities SET badge = 'Área común'   WHERE slug = 'jardin';
UPDATE public.location_amenities SET badge = 'Incluida'     WHERE slug = 'lavanderia_comun';
UPDATE public.location_amenities SET badge = 'Exterior'     WHERE slug = 'estacionamiento';
UPDATE public.location_amenities SET badge = 'Seguridad'    WHERE slug = 'seguridad';
UPDATE public.location_amenities SET badge = 'Comunidad'    WHERE slug = 'pet_friendly';
UPDATE public.location_amenities SET badge = 'Comunidad'    WHERE slug = 'eventos';
UPDATE public.location_amenities SET badge = 'Servicios'    WHERE slug = 'sin_aval';
UPDATE public.location_amenities SET badge = 'Área común'   WHERE slug = 'muebles_comun';


-- ─── 2. Tabla lugares_cercanos ─────────────────────────────────────────────────
-- Catálogo de lugares del barrio (transporte, restaurantes, parques, etc.)
-- Filtrables por categoría en la página pública. Admin hace CRUD completo.
CREATE TABLE IF NOT EXISTS public.lugares_cercanos (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria     text        NOT NULL DEFAULT 'comer'
                CHECK (categoria IN ('transporte','universidades','parques','comer','compras','cultura')),
  nombre        text        NOT NULL,
  distancia     text        NOT NULL,    -- "8 min a pie", "~20 min en Metrobús"
  descripcion   text        NOT NULL,
  lat           double precision,        -- para pin en mapa (nullable hasta que el admin lo complete)
  lng           double precision,
  por_confirmar boolean     NOT NULL DEFAULT false,  -- muestra badge "Por confirmar"
  activo        boolean     NOT NULL DEFAULT true,
  orden         integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lugares_cercanos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lugares_anon_read"
  ON public.lugares_cercanos FOR SELECT
  USING (activo = true);

CREATE POLICY "lugares_admin_all"
  ON public.lugares_cercanos FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Seed: 21 lugares de la maqueta (lat/lng NULL; el admin los completa para los pines del mapa)
-- Coordenadas de referencia: Casa Rentalia ≈ lat 19.3956, lng -99.1572
INSERT INTO public.lugares_cercanos (categoria, nombre, distancia, descripcion, lat, lng, por_confirmar, orden) VALUES
  -- Transporte
  ('transporte', 'Metro Etiopía',          '8 min a pie',      'Línea 3. Acceso directo al centro, Tlatelolco y todo el norte sin transbordo.',           19.3944, -99.1594, false, 10),
  ('transporte', 'Metrobús Eje 3 Sur',     '3 min a pie',      'Conecta hacia el Aeropuerto, Indios Verdes y el sur.',                                      null,    null,    true,  20),
  ('transporte', 'Ciclovía Eje 3',         '2 min a pie',      'Carril dedicado para rodar cómodo hacia el centro. Ideal con bici o scooter.',              null,    null,    true,  30),
  ('transporte', 'Viaducto / Insurgentes', '5 min en coche',   'Dos arterias clave de la ciudad para salir rápido en coche.',                               null,    null,    true,  40),
  -- Universidades
  ('universidades', 'UNAM Ciudad Universitaria', '~20 min en Metrobús', 'El campus más grande de Latinoamérica. Línea directa desde la zona.',              null,    null,    true,  10),
  ('universidades', 'IPN Zacatenco',              '~30 min en Metro',   'Acceso por Línea 3 sin transbordos (dirección Indios Verdes).',                    null,    null,    true,  20),
  ('universidades', 'UVM Campus Narvarte',         '10 min a pie',       'Campus a unas cuadras de la casa, ideal si estudias ahí.',                        null,    null,    true,  30),
  ('universidades', 'Tec de Monterrey CDMX',       '~20 min',            'Accesible por Viaducto o Insurgentes para posgrado y seminarios.',                null,    null,    true,  40),
  -- Parques
  ('parques', 'Parque Hundido',          '12 min a pie',   'Jardines enormes, pistas para trotar y árboles para desconectar. El pulmón verde de la zona.',  19.3840, -99.1659, false, 10),
  ('parques', 'Parque España',           '15 min a pie',   'Quiosco, cafeterías y vida de barrio en la colonia Nápoles.',                                    null,    null,    true,  20),
  ('parques', 'Jardines de la Narvarte', '8 min a pie',    'Área verde tranquila para leer o tomar el sol en el barrio.',                                    null,    null,    true,  30),
  -- Comer
  ('comer', 'Supercito',             '5 min a pie',   'El súper de barrio con todo lo del día a día, sin largas filas.',                                     null,    null,    false, 10),
  ('comer', 'Mercado Narvarte',      '8 min a pie',   'Frutas, verduras, guisados y antojitos. Más fresco y sabroso que el súper.',                          null,    null,    true,  20),
  ('comer', 'Av. Álvaro Obregón',   '10 min a pie',  'La calle de los cafés de la Roma Sur: decenas de opciones para desayunar o trabajar.',                null,    null,    true,  30),
  ('comer', 'Antojitos de la colonia', '5 min a pie', 'Tacos, pozole y tostadas en la propia Narvarte. Sin buscar mucho.',                                   null,    null,    true,  40),
  -- Compras
  ('compras', 'Parque Delta',          '8 min a pie',    'Centro comercial con cine, Walmart, tiendas, gym y todo en un solo lugar.',                        19.3951, -99.1507, false, 10),
  ('compras', 'Farmacias y bancos',    '3 min a pie',    'Farmacias del Ahorro, OXXO y cajeros literalmente a la vuelta de la esquina.',                     null,    null,    true,  20),
  ('compras', 'Gimnasios (Smart Fit)', '5 min a pie',    'Opciones de gym en la zona para mantener la rutina sin rodeos.',                                   null,    null,    true,  30),
  -- Cultura
  ('cultura', 'Cine Parque Delta',           '8 min a pie',     'Multiplex con las últimas películas. El plan perfecto para terminar la semana.',            null,    null,    false, 10),
  ('cultura', 'Librerías Gandhi / Porrúa',   '10 min a pie',    'Para los que leen, estudian o hojean. Siempre hay algo nuevo.',                            null,    null,    true,  20),
  ('cultura', 'Roma y Condesa',              '15 min en bici',   'Bares, museos, galerías y vida nocturna de las colonias más vibrantes de CDMX.',          null,    null,    true,  30)
ON CONFLICT DO NOTHING;


-- ─── 3. Tabla barrio_fotos ─────────────────────────────────────────────────────
-- 5 slots fijos para la galería de fotos del barrio (collage mosaico).
-- El admin edita label/photo_url/alt_text; no puede crear ni borrar slots.
CREATE TABLE IF NOT EXISTS public.barrio_fotos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slot        integer     NOT NULL UNIQUE CHECK (slot BETWEEN 1 AND 5),
  label       text        NOT NULL,       -- caption visible en el collage
  photo_url   text,                       -- URL de la foto (admin la pega); NULL → gradiente de fallback
  alt_text    text,                       -- descripción accesible
  active      boolean     NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.barrio_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "barrio_fotos_anon_read"
  ON public.barrio_fotos FOR SELECT
  USING (active = true);

CREATE POLICY "barrio_fotos_admin_all"
  ON public.barrio_fotos FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Seed: 5 slots con captions de la maqueta; sin foto hasta que el equipo las suba
INSERT INTO public.barrio_fotos (slot, label, alt_text) VALUES
  (1, 'El barrio',        'Narvarte · La colonia — foto de la calle principal'),
  (2, 'Café y trabajo',   'Café de la zona — cafetería de Narvarte'),
  (3, 'Parque Hundido',   'Parque Hundido — área verde de Narvarte'),
  (4, 'El mercado',       'Mercado del barrio — mercado local de Narvarte'),
  (5, 'Tu terraza',       'Terraza Rentalia — área exterior de la casa')
ON CONFLICT (slot) DO NOTHING;


-- ─── 4. site_config: textos y stats de la página Amenidades ───────────────────
-- Cada clave es un string; las claves *_pills, *_stats, *_mapa_stats
-- guardan un array JSON serializado como texto para editar en el admin.

INSERT INTO public.site_config (key, value) VALUES
  -- Header de página
  ('amenidades_header_eyebrow', 'Vive dentro y fuera'),
  ('amenidades_header_h1',      'Todo lo que te rodea'),
  ('amenidades_header_sub',     'En Rentalia no solo tienes una gran casa: tienes Narvarte entera a tu alcance. Una colonia diseñada para vivir bien.'),
  -- Pills del header (JSON)
  ('amenidades_pills',          '[{"icon":"location","text":"Narvarte Poniente, CDMX"},{"icon":"schedule","text":"Metro a 8 min a pie"},{"icon":"home","text":"Todo incluido adentro"}]'),
  -- Stats strip (JSON)
  ('amenidades_stats',          '[{"num":"8","label":"min — Metro Etiopía"},{"num":"3","label":"min — Metrobús Eje 3"},{"num":"12","label":"min — Parque Hundido"},{"num":"+21","label":"lugares a tu alcance"}]'),
  -- Sección mapa
  ('amenidades_mapa_h2',        'Narvarte Poniente, CDMX'),
  ('amenidades_mapa_p',         'En el corazón de la ciudad. Acceso directo a Metro, Metrobús, ciclovías y las grandes avenidas. A igual distancia del centro histórico, la UNAM y las colonias más vibrantes.'),
  -- Stats del mapa (JSON)
  ('amenidades_mapa_stats',     '[{"num":"L3","label":"Metro directa sin transbordos"},{"num":"~20","label":"min a la UNAM en Metrobús"},{"num":"15","label":"min en bici a Roma / Condesa"},{"num":"5","label":"min en coche al Viaducto"}]')
ON CONFLICT (key) DO NOTHING;
