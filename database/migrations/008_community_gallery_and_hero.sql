-- 008_community_gallery_and_hero.sql
-- Galería de la sección "Comunidad" y configuración global del hero del home

-- ─── community_gallery ──────────────────────────────────────────────────────
-- 5 slots fijos (uno por recuadro de la galería). El admin edita, no crea ni borra.
CREATE TABLE IF NOT EXISTS public.community_gallery (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slot        integer     NOT NULL UNIQUE CHECK (slot BETWEEN 1 AND 5),
  label       text        NOT NULL,
  photo_url   text,
  alt_text    text,
  active      boolean     NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public lee galería activa"
  ON public.community_gallery FOR SELECT
  USING (active = true);

CREATE POLICY "admin edita galería"
  ON public.community_gallery FOR ALL
  USING (auth.role() = 'authenticated');

-- Seed: 5 slots con labels pero sin fotos (el admin las sube desde el panel)
INSERT INTO public.community_gallery (slot, label, alt_text) VALUES
  (1, 'Terraza',    'Terraza con plantas de Casa Rentalia en Narvarte'),
  (2, 'Cocina',     'Cocina compartida con la comunidad'),
  (3, 'Sala',       'Sala y áreas comunes'),
  (4, 'Habitación', 'Habitación amueblada con luz natural'),
  (5, 'Entrada',    'Entrada y zaguán de la casa')
ON CONFLICT (slot) DO NOTHING;

-- ─── site_config ────────────────────────────────────────────────────────────
-- Clave-valor para configuración global del home.
-- Clave inicial: hero_habitacion_id → UUID de la habitación que aparece en el hero.
CREATE TABLE IF NOT EXISTS public.site_config (
  key        text        PRIMARY KEY,
  value      text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public lee config"
  ON public.site_config FOR SELECT
  USING (true);

CREATE POLICY "admin edita config"
  ON public.site_config FOR ALL
  USING (auth.role() = 'authenticated');

INSERT INTO public.site_config (key, value) VALUES
  ('hero_habitacion_id', NULL)
ON CONFLICT (key) DO NOTHING;
