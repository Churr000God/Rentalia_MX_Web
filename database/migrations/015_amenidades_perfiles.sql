-- 015_amenidades_perfiles.sql
-- Tabla para los 3 perfiles de la página Amenidades ("Perfecto para ti")
-- Slots fijos (estudiantes, profesionistas, viajeros). El admin edita, no crea ni borra.
-- Proyecto: vefgwrxgfuzgfictdsyo (Rentalia.mx)
-- Aplicar en: Supabase SQL Editor → proyecto vefgwrxgfuzgfictdsyo

CREATE TABLE IF NOT EXISTS public.amenidades_perfiles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text        NOT NULL UNIQUE
              CHECK (slug IN ('estudiantes','profesionistas','viajeros')),
  role_label  text        NOT NULL,          -- "Para estudiantes"
  titulo      text        NOT NULL,          -- "Cerca de todo lo que importa para estudiar"
  descripcion text        NOT NULL,          -- párrafo descriptivo
  puntos      jsonb       NOT NULL DEFAULT '[]',  -- ["WiFi 300 Mbps...", "Estancia desde 1 mes..."]
  icono       text        NOT NULL DEFAULT 'school',  -- nombre Material Symbols Outlined
  orden       integer     NOT NULL DEFAULT 0,
  activo      boolean     NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.amenidades_perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfiles_anon_read"
  ON public.amenidades_perfiles FOR SELECT
  USING (activo = true);

CREATE POLICY "perfiles_admin_all"
  ON public.amenidades_perfiles FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Seed: 3 perfiles con contenido del maqueta
INSERT INTO public.amenidades_perfiles (slug, role_label, titulo, descripcion, puntos, icono, orden) VALUES
  (
    'estudiantes',
    'Para estudiantes',
    'Cerca de todo lo que importa para estudiar',
    'UNAM, IPN y otras universidades conectadas en metro directo. Cafeterías tranquilas para estudiar a pasos. Y sin el estrés de un contrato largo.',
    '["Metro sin transbordos a universidades","WiFi 300 Mbps para estudiar en casa","Estancia desde 1 mes, sin castigo","Comunidad de gente en tu misma etapa"]'::jsonb,
    'school',
    10
  ),
  (
    'profesionistas',
    'Para profesionistas',
    'Conectividad, cafés y vida de barrio',
    'Viaducto y Periférico en minutos. Docenas de cafeterías para trabajar remoto. Y una casa donde al llegar solo tienes que relajarte.',
    '["Internet fibra 300 Mbps","Acceso Viaducto / Periférico","Cafeterías para home office a 5 min","Renta sin aval ni trámites"]'::jsonb,
    'laptop',
    20
  ),
  (
    'viajeros',
    'Para viajeros',
    'Todo a la mano desde el primer día',
    'Llegaste a CDMX por una temporada o para quedarte. En Rentalia estás en una de las mejores colonias: transporte, comida, parques y cultura, todo desde el día 1.',
    '["Cuarto listo desde que llegas","Metrobús al Aeropuerto","Restaurantes y mercados a la puerta","Comunidad que te ayuda a adaptarte"]'::jsonb,
    'travel_explore',
    30
  )
ON CONFLICT (slug) DO NOTHING;

-- ─── site_config: textos del encabezado de la sección Perfiles ───────────────
INSERT INTO public.site_config (key, value) VALUES
  ('amenidades_perfiles_h2',  'Perfecto para ti, seas quien seas'),
  ('amenidades_perfiles_sub', 'Narvarte tiene lo que cada quien necesita. Rentalia lo pone en tu puerta.')
ON CONFLICT (key) DO NOTHING;
