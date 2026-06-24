-- 018_nosotros.sql
-- Página "Nosotros": equipo, pilares de filosofía, valores y textos de la página,
-- editables desde el admin. El público solo lee lo activo.

-- ─── nosotros_equipo ──────────────────────────────────────────────────────────
-- Tarjetas del equipo detrás de Rentalia. Fotos como URL de texto.
CREATE TABLE IF NOT EXISTS public.nosotros_equipo (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text        NOT NULL,
  rol         text,
  bio         text,
  foto_url    text,                              -- URL de foto; sin URL → gradiente de respaldo
  orden       integer     NOT NULL DEFAULT 0,
  activo      boolean     NOT NULL DEFAULT false, -- false = no visible hasta confirmar datos
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nosotros_equipo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "público lee equipo activo"
  ON public.nosotros_equipo FOR SELECT
  USING (activo = true);

CREATE POLICY "admin gestiona equipo"
  ON public.nosotros_equipo FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Seed: 3 placeholders con activo=false (no aparecen en público hasta que el equipo los active)
INSERT INTO public.nosotros_equipo (nombre, rol, bio, orden, activo) VALUES
  ('[Nombre del fundador/a]',    'Co-fundador/a · Rentalia',     '[Una línea cálida sobre el porqué de Rentalia y su pasión por la ciudad]',                             10, false),
  ('[Nombre del co-fundador/a]', 'Co-fundador/a · Rentalia',     '[Una línea sobre el perfil y la visión de esta persona]',                                             20, false),
  ('[Nombre del host]',          'Anfitrión/a · Casa Narvarte',  '[Quién cuida la casa día a día — la persona que los residentes ven y conocen de verdad]',             30, false)
ON CONFLICT DO NOTHING;


-- ─── nosotros_pilares ─────────────────────────────────────────────────────────
-- Pilares de la filosofía ("Diseñada para vivir bien", "Comunidad", "Sin amarres").
CREATE TABLE IF NOT EXISTS public.nosotros_pilares (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text        NOT NULL,
  descripcion text,
  icono       text,                              -- clave del diccionario de iconos curados
  orden       integer     NOT NULL DEFAULT 0,
  activo      boolean     NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nosotros_pilares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "público lee pilares nosotros activos"
  ON public.nosotros_pilares FOR SELECT
  USING (activo = true);

CREATE POLICY "admin gestiona pilares nosotros"
  ON public.nosotros_pilares FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

INSERT INTO public.nosotros_pilares (nombre, descripcion, icono, orden) VALUES
  ('Diseñada para vivir bien', 'Cuartos amueblados con cuidado, áreas comunes con vida y servicios que no dan problemas. Llega con tu maleta.',           'casa',     10),
  ('Comunidad que se siente',  'Gente con quien da gusto compartir el espacio. Convivencia sin imposición: hay vida compartida para quien quiere.',       'usuarios', 20),
  ('Sin amarres',              'Sin aval, sin meses de depósito, sin contratos eternos. Desde 1 mes, mismo precio, sin penalización por salir.',         'escudo',   30)
ON CONFLICT DO NOTHING;


-- ─── nosotros_valores ─────────────────────────────────────────────────────────
-- Los 4 valores de la marca: Calidez, Comunidad, Transparencia, Flexibilidad.
CREATE TABLE IF NOT EXISTS public.nosotros_valores (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text        NOT NULL,
  descripcion text,
  icono       text,                              -- clave del diccionario de iconos curados
  orden       integer     NOT NULL DEFAULT 0,
  activo      boolean     NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nosotros_valores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "público lee valores nosotros activos"
  ON public.nosotros_valores FOR SELECT
  USING (activo = true);

CREATE POLICY "admin gestiona valores nosotros"
  ON public.nosotros_valores FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

INSERT INTO public.nosotros_valores (nombre, descripcion, icono, orden) VALUES
  ('Calidez',        'Trato humano antes que cualquier transacción. Que cada persona que llega sienta que importa.',                                                                   'corazon',   10),
  ('Comunidad',      'Creemos en el poder de las conexiones reales. Seleccionamos personas afines y facilitamos la convivencia.',                                                     'usuarios',  20),
  ('Transparencia',  'Sin letras chiquitas, sin procesos ocultos. El precio que ves es lo que pagas. Siempre.',                                                                      'chispa',    30),
  ('Flexibilidad',   'Contratos que se adaptan al ritmo de tu vida. Desde 1 mes, sin penalización por salir antes.',                                                                 'calendario', 40)
ON CONFLICT DO NOTHING;


-- ─── site_config — textos y fotos de la página Nosotros ──────────────────────
-- Todo lo que es texto singleton o URL de foto única se almacena aquí.
-- El admin edita estos valores vía upsert. El frontend los inyecta en el DOM.
INSERT INTO public.site_config (key, value) VALUES

  -- Hero
  ('nosotros_hero_pill',           'Quiénes somos'),
  ('nosotros_hero_h1',             'Detrás de Rentalia'),
  ('nosotros_hero_sub',            'Creemos que mudarte no debería sentirse como un trámite, sino como llegar a casa. Estamos aquí para rediseñar la experiencia de rentar en la ciudad.'),
  ('nosotros_hero_foto_url',       ''),
  ('nosotros_hero_badge_titulo',   'Casa Narvarte'),
  ('nosotros_hero_badge_sub',      'Narvarte Poniente · CDMX'),

  -- Historia
  ('nosotros_hist_titulo',         'Nuestra Historia'),
  ('nosotros_hist_p1',             'Rentalia nació de una frustración que conocemos bien: buscar cuarto en CDMX es difícil, caro y frío. Fiadores imposibles, depósitos exagerados, cuartos sin alma que nadie querría llamar "casa".'),
  ('nosotros_hist_p2',             'La pregunta fue sencilla: ¿cómo sería el lugar donde uno sí quiere vivir? Un lugar diseñado para vivir bien, con gente afín, en un barrio que valga la pena. La respuesta fue Narvarte.'),
  ('nosotros_hist_p3',             'Rentalia es el resultado de buscar un hogar propio y no encontrarlo en el mercado tradicional. Así que decidimos construirlo nosotros mismos.'),
  ('nosotros_hist_foto_url',       ''),
  ('nosotros_hist_quote',          '"Dejamos de rentar m², empezamos a crear hogares."'),

  -- Filosofía (pilares)
  ('nosotros_filo_eyebrow',        'Nuestra filosofía'),
  ('nosotros_filo_tagline',        '¡El lugar donde SÍ quieres vivir!'),

  -- La Casa de Narvarte
  ('nosotros_casa_eyebrow',        'La primera casa'),
  ('nosotros_casa_titulo',         'La Casa de Narvarte'),
  ('nosotros_casa_sub',            'Donde todo comenzó.'),
  ('nosotros_casa_texto',          'Elegimos Narvarte por su espíritu de barrio, sus camellones llenos de vida y esa arquitectura que tiene tanto carácter. Adaptamos la casa respetando sus arcos y sus mosaicos originales, pero pensándola para la vida de hoy.'),
  ('nosotros_casa_stat_ubicaciones', '1'),
  ('nosotros_casa_stat_habitaciones', '11'),
  ('nosotros_casa_foto1_url',      ''),
  ('nosotros_casa_foto1_alt',      'Fachada de la Casa Rentalia Narvarte'),
  ('nosotros_casa_foto2_url',      ''),
  ('nosotros_casa_foto2_alt',      'Cocina equipada de la casa'),
  ('nosotros_casa_foto3_url',      ''),
  ('nosotros_casa_foto3_alt',      'Patio y áreas comunes de la casa'),
  ('nosotros_casa_foto4_url',      ''),
  ('nosotros_casa_foto4_alt',      'Vida compartida en la casa'),

  -- Valores
  ('nosotros_valores_eyebrow',     'Lo que nos mueve'),
  ('nosotros_valores_titulo',      'Nuestros valores'),

  -- Equipo
  ('nosotros_equipo_eyebrow',      'Las caras del proyecto'),
  ('nosotros_equipo_titulo',       'El equipo detrás'),
  ('nosotros_equipo_sub',          'Un equipo pequeño pero apasionado por el buen vivir.'),

  -- Proyecto crece
  ('nosotros_crece_eyebrow',       'El futuro'),
  ('nosotros_crece_titulo',        'Narvarte es el primer paso'),
  ('nosotros_crece_texto',         'Somos honestos: por ahora somos una sola casa, en Narvarte, y estamos aprendiendo con ella. Nuestra visión es llevar este modelo de "vida con alma" a otros barrios icónicos de la ciudad — pero solo cuando lo hayamos hecho muy bien aquí primero.'),
  ('nosotros_crece_badge',         'Casa activa: Narvarte Poniente · CDMX'),

  -- Bridge card
  ('nosotros_bridge_titulo',       '¿Quieres ver la vida real aquí?'),
  ('nosotros_bridge_texto',        'Nuestra comunidad es más que fotos bonitas; son sobremesas, café los domingos y gente con quien da gusto convivir. Conoce a quienes ya son parte.'),

  -- CTA banda
  ('nosotros_cta_titulo',          '¿Te late nuestra forma de ver el hogar?'),
  ('nosotros_cta_sub',             'Ven a conocer la casa de Narvarte y las personas detrás de Rentalia.')

ON CONFLICT (key) DO NOTHING;
