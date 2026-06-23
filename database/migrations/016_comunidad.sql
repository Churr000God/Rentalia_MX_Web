-- 016_comunidad.sql
-- Página "Comunidad": galería de fotos + testimonios de residentes, editables desde el admin.
-- El admin cura todo el contenido (CRUD). El público solo lee lo activo.

-- ─── comunidad_galeria ────────────────────────────────────────────────────────
-- Fotos de la vida en el coliving. El admin crea, edita y elimina libremente.
CREATE TABLE IF NOT EXISTS public.comunidad_galeria (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  imagen_url  text        NOT NULL,
  alt_text    text,
  caption     text,
  orden       integer     NOT NULL DEFAULT 0,
  activo      boolean     NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.comunidad_galeria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "público lee galería activa"
  ON public.comunidad_galeria FOR SELECT
  USING (activo = true);

CREATE POLICY "admin gestiona galería comunidad"
  ON public.comunidad_galeria FOR ALL
  USING (auth.role() = 'authenticated');

-- ─── comunidad_testimonios ────────────────────────────────────────────────────
-- Testimonios de residentes curados por el admin (nombre, foto, cita, rating opcional).
CREATE TABLE IF NOT EXISTS public.comunidad_testimonios (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text        NOT NULL,
  detalle     text,                              -- ej. "Diseñadora · 8 meses aquí"
  foto_url    text,                              -- URL de foto; sin URL → se muestra inicial
  texto       text        NOT NULL,
  rating      integer     CHECK (rating BETWEEN 1 AND 5),
  orden       integer     NOT NULL DEFAULT 0,
  activo      boolean     NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.comunidad_testimonios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "público lee testimonios activos"
  ON public.comunidad_testimonios FOR SELECT
  USING (activo = true);

CREATE POLICY "admin gestiona testimonios"
  ON public.comunidad_testimonios FOR ALL
  USING (auth.role() = 'authenticated');

-- ─── site_config — claves de texto de la página Comunidad ────────────────────
-- Reutiliza la tabla site_config (key-value) ya existente. Seed con valores por defecto.
INSERT INTO public.site_config (key, value) VALUES
  ('comunidad_eyebrow',          'La vida en Rentalia'),
  ('comunidad_h1',               'Tu casa, tus personas'),
  ('comunidad_sub',              'Conoce a quienes ya viven aquí y descubre cómo es el día a día en nuestro coliving de Narvarte.'),
  ('comunidad_galeria_titulo',   'La vida aquí'),
  ('comunidad_testimonios_titulo','Lo que dicen quienes viven aquí'),
  ('comunidad_cta_titulo',       '¿Quieres vivir aquí?'),
  ('comunidad_cta_texto',        'Agenda una visita sin compromiso y conoce el espacio en persona.')
ON CONFLICT (key) DO NOTHING;
