-- Migration 007: Amenidades generales de la ubicación
-- Distintas de las amenidades de habitación (habitaciones.amenities).
-- Representan características del edificio/coliving, no de cada cuarto.
-- Aplicar en: Supabase SQL Editor → proyecto vefgwrxgfuzgfictdsyo

CREATE TABLE IF NOT EXISTS location_amenities (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text        UNIQUE NOT NULL,
  label       text        NOT NULL,
  description text,
  icon        text        NOT NULL DEFAULT 'home',
  category    text        NOT NULL DEFAULT 'general'
              CHECK (category IN ('interior','exterior','servicios','comunidad')),
  active      boolean     NOT NULL DEFAULT true,
  orden       int         NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE location_amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "loc_amenities_anon_read" ON location_amenities;
DROP POLICY IF EXISTS "loc_amenities_admin_all" ON location_amenities;

-- Público: solo lee registros activos
CREATE POLICY "loc_amenities_anon_read"
  ON location_amenities FOR SELECT
  USING (active = true);

-- Admin (autenticado): CRUD completo
CREATE POLICY "loc_amenities_admin_all"
  ON location_amenities FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Seed inicial — 12 amenidades generales de Casa Narvarte
INSERT INTO location_amenities (slug, label, description, icon, category, orden) VALUES
  ('wifi_comun',       'WiFi de alta velocidad', 'Fibra óptica en todas las áreas comunes',         'wifi',                  'servicios',  1),
  ('cocina_comun',     'Cocina equipada',         'Refrigerador, horno, microondas y utensilios',    'cooking',               'interior',   2),
  ('sala_estar',       'Sala de estar',           'Espacio cómodo para descansar y socializar',      'weekend',               'interior',   3),
  ('terraza',          'Terraza',                 'Azotea con vista y área de convivencia',          'deck',                  'exterior',   4),
  ('jardin',           'Jardín / patio',          'Área verde privada para todos los residentes',    'yard',                  'exterior',   5),
  ('lavanderia_comun', 'Lavandería',              'Lavadoras y secadoras de uso compartido',         'local_laundry_service', 'servicios',  6),
  ('estacionamiento',  'Estacionamiento',         'Lugares disponibles con costo adicional',         'directions_car',        'exterior',   7),
  ('seguridad',        'Seguridad 24 h',          'CCTV y acceso controlado por código',             'security',              'servicios',  8),
  ('pet_friendly',     'Pet friendly',            'Mascotas bienvenidas en áreas designadas',        'pets',                  'comunidad',  9),
  ('eventos',          'Eventos y actividades',   'Cenas, talleres y salidas organizadas',           'celebration',           'comunidad', 10),
  ('sin_aval',         'Sin aval requerido',      'Proceso 100 % en línea, sin fiadores',            'verified_user',         'servicios', 11),
  ('muebles_comun',    'Áreas amuebladas',        'Espacios comunes decorados y funcionales',        'chair',                 'interior',  12)
ON CONFLICT (slug) DO NOTHING;
