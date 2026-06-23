-- 017_comunidad_secciones.sql
-- Hace editables desde el admin las secciones hoy hardcodeadas de la página Comunidad:
-- Pilares del manifiesto, Agenda/Eventos, Cómo cuidamos la convivencia,
-- y los textos/fotos de la sección "Narvarte afuera".

-- ─── comunidad_pilares ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comunidad_pilares (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text        NOT NULL,
  descripcion text,
  icono       text,                           -- clave de icono curado (ej. 'usuarios', 'corazon')
  orden       integer     NOT NULL DEFAULT 0,
  activo      boolean     NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.comunidad_pilares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "público lee pilares activos"
  ON public.comunidad_pilares FOR SELECT
  USING (activo = true);

CREATE POLICY "admin gestiona pilares"
  ON public.comunidad_pilares FOR ALL
  USING (auth.role() = 'authenticated');

-- Seed con los valores actuales hardcodeados en comunidad-page.js
INSERT INTO public.comunidad_pilares (nombre, descripcion, icono, orden) VALUES
  ('Diversidad',   'Estudiantes, profesionistas y viajeros que suman perspectivas distintas a la convivencia.', 'usuarios',  10),
  ('Respeto',      'Convivencia sin imposición. Reglas claras, espacios propios y comunidad cuando se quiere.', 'corazon',   20),
  ('Crecimiento',  'Gente que viene a vivir la ciudad y se lleva algo más que un cuarto: conexiones reales.',   'estrella',  30)
ON CONFLICT DO NOTHING;


-- ─── comunidad_eventos ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comunidad_eventos (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        text        NOT NULL,
  descripcion   text,
  icono         text,                          -- clave de icono curado
  tiempo        text,                          -- ej. "Jueves · 19:00 h"
  color         text        NOT NULL DEFAULT 'selva',  -- 'selva' | 'barro'
  por_confirmar boolean     NOT NULL DEFAULT false,
  orden         integer     NOT NULL DEFAULT 0,
  activo        boolean     NOT NULL DEFAULT true,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.comunidad_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "público lee eventos activos"
  ON public.comunidad_eventos FOR SELECT
  USING (activo = true);

CREATE POLICY "admin gestiona eventos"
  ON public.comunidad_eventos FOR ALL
  USING (auth.role() = 'authenticated');

-- Seed con los valores actuales hardcodeados en comunidad-page.js
INSERT INTO public.comunidad_eventos (nombre, descripcion, icono, tiempo, color, por_confirmar, orden) VALUES
  ('Cooking Nights',         'Cenas temáticas donde cada quien aporta algo de su cultura. Sin reglas, todos prueban.',  'chef',      'Jueves · 19:00 h',    'selva', false, 10),
  ('Cine en la terraza',     'Proyección bajo las estrellas con palomitas y buena compañía.',                           'cine',      'Sábados · 20:30 h',   'barro', false, 20),
  ('Café de los domingos',   'Sin agenda. Solo café, sol en la terraza y quien quiera aparecer.',                       'cafe',      'Domingos · 10:00 h',  'barro', false, 30),
  ('Intercambio de idiomas', 'Para los viajeros y los que quieren practicar. Inglés, español y lo que llegue.',         'idiomas',   'Martes · 18:00 h',    'selva', true,  40)
ON CONFLICT DO NOTHING;


-- ─── comunidad_cuidamos ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comunidad_cuidamos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      text        NOT NULL,
  descripcion text,
  icono       text,                           -- clave de icono curado
  orden       integer     NOT NULL DEFAULT 0,
  activo      boolean     NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.comunidad_cuidamos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "público lee cuidamos activos"
  ON public.comunidad_cuidamos FOR SELECT
  USING (activo = true);

CREATE POLICY "admin gestiona cuidamos"
  ON public.comunidad_cuidamos FOR ALL
  USING (auth.role() = 'authenticated');

-- Seed con los valores actuales hardcodeados en comunidad-page.js
INSERT INTO public.comunidad_cuidamos (titulo, descripcion, icono, orden) VALUES
  ('House Host dedicado',           'Hay alguien que cuida que la convivencia funcione — desde el onboarding de nuevos residentes hasta resolver cualquier fricción.',                                                  'casa',      10),
  ('Selección de roomies afines',   'No es azar. Leemos cada presentación y verificamos que quien llega encaje con quien ya vive.',                                                                                    'usuarios',  20),
  ('Canales de comunicación claros','Grupo de la casa para avisos y coordinación. Canal directo con nosotros para lo que no quieras decir en el grupo.',                                                              'chat',      30),
  ('Reglas simples y acordadas',    'Silencio nocturno, limpieza de áreas comunes, visitas. Conocidas desde el primer día, sin letra chica.',                                                                         'documento', 40)
ON CONFLICT DO NOTHING;


-- ─── site_config — textos de secciones fijas ─────────────────────────────────
INSERT INTO public.site_config (key, value) VALUES
  -- Sección "Narvarte afuera" / connection
  ('comunidad_conn_eyebrow',    'Narvarte afuera'),
  ('comunidad_conn_titulo',     'La comunidad no termina en la puerta'),
  ('comunidad_conn_texto',      'Nuestras casas están en el corazón de Narvarte, conectándote con los mejores cafés, parques, mercados y la vida de barrio de la colonia.'),
  ('comunidad_conn_link_text',  'Ver amenidades y experiencias'),
  ('comunidad_conn_link_url',   '/pages/amenidades.html'),
  ('comunidad_conn_foto1_url',  ''),
  ('comunidad_conn_foto1_alt',  'Cafetería de Narvarte'),
  ('comunidad_conn_foto2_url',  ''),
  ('comunidad_conn_foto2_alt',  'Parque Hundido'),
  -- Encabezados de secciones Eventos y Cómo cuidamos
  ('comunidad_eventos_eyebrow', 'Vida en casa'),
  ('comunidad_eventos_titulo',  'Agenda de la casa'),
  ('comunidad_cuida_eyebrow',   'Por qué funciona'),
  ('comunidad_cuida_titulo',    'Cómo cuidamos la convivencia')
ON CONFLICT (key) DO NOTHING;
