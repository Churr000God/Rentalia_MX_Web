-- Migration 010: Ubicaciones — entidad que agrupa habitaciones por propiedad/dirección
-- Proyecto: vefgwrxgfuzgfictdsyo (Rentalia.mx)
-- Aplicar en: Supabase SQL Editor → proyecto vefgwrxgfuzgfictdsyo

-- ── 1. Tabla ubicaciones ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ubicaciones (
  id          uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      text          NOT NULL,                        -- "Casa Narvarte"
  zona        text,                                          -- "Narvarte, CDMX" (público)
  lat         double precision,                              -- latitud para mapa
  lng         double precision,                              -- longitud para mapa
  direccion   text,                                          -- dirección exacta (interna, no pública)
  distancias  jsonb         NOT NULL DEFAULT '[]',           -- [{"icon":"directions_walk","text":"8 min a Metro Etiopía"}]
  activo      boolean       NOT NULL DEFAULT true,
  orden       integer       NOT NULL DEFAULT 0,
  created_at  timestamptz   DEFAULT now()
);

ALTER TABLE public.ubicaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ubicaciones_anon_read" ON public.ubicaciones;
DROP POLICY IF EXISTS "ubicaciones_admin_all"  ON public.ubicaciones;

-- Público: solo lee ubicaciones activas
CREATE POLICY "ubicaciones_anon_read"
  ON public.ubicaciones FOR SELECT
  USING (activo = true);

-- Admin (autenticado): CRUD completo
CREATE POLICY "ubicaciones_admin_all"
  ON public.ubicaciones FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── 2. Seed: Casa Narvarte ────────────────────────────────────────────────
INSERT INTO public.ubicaciones (nombre, zona, lat, lng, direccion, distancias, orden)
VALUES (
  'Casa Narvarte',
  'Narvarte, CDMX',
  19.395,
  -99.156,
  'Calle Interna 00, Narvarte Poniente, CDMX',   -- ajustar con la dirección real
  '[
    {"icon": "directions_walk", "text": "8 min a Metro Etiopía"},
    {"icon": "park",            "text": "12 min a Parque Hundido"},
    {"icon": "shopping_cart",   "text": "5 min a Supermercado"}
  ]'::jsonb,
  1
)
ON CONFLICT DO NOTHING;

-- ── 3. ALTER habitaciones — FK a ubicacion + campo incluye ─────────────────
ALTER TABLE public.habitaciones
  ADD COLUMN IF NOT EXISTS ubicacion_id uuid
    REFERENCES public.ubicaciones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS incluye jsonb NOT NULL DEFAULT '[]';
  -- incluye = ["Amueblado completo", "Servicios (Luz, Agua, Gas)", "WiFi de alta velocidad", "Limpieza quincenal"]

-- Asignar todas las habitaciones existentes a Casa Narvarte
UPDATE public.habitaciones
SET
  ubicacion_id = (SELECT id FROM public.ubicaciones WHERE nombre = 'Casa Narvarte' LIMIT 1),
  incluye = '["Amueblado completo", "Servicios (Luz, Agua, Gas)", "WiFi de alta velocidad", "Limpieza quincenal"]'::jsonb
WHERE ubicacion_id IS NULL;

-- ── 4. ALTER location_amenities — FK a ubicacion ──────────────────────────
ALTER TABLE public.location_amenities
  ADD COLUMN IF NOT EXISTS ubicacion_id uuid
    REFERENCES public.ubicaciones(id) ON DELETE CASCADE;
  -- NULL = amenidad global (aplica a todas las ubicaciones)

-- Asignar las 12 amenidades existentes a Casa Narvarte
UPDATE public.location_amenities
SET ubicacion_id = (SELECT id FROM public.ubicaciones WHERE nombre = 'Casa Narvarte' LIMIT 1)
WHERE ubicacion_id IS NULL;
