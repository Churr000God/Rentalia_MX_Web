-- 011_como_funciona_config.sql
-- Tablas de configuración para la página "Cómo funciona"

-- ─── cf_pasos ────────────────────────────────────────────────────────────────
-- 4 filas fijas (uno por paso). El admin edita texto e imagen; no crea ni borra.
CREATE TABLE IF NOT EXISTS public.cf_pasos (
  paso_num    integer     PRIMARY KEY CHECK (paso_num BETWEEN 1 AND 4),
  titulo      text        NOT NULL DEFAULT '',
  descripcion text        NOT NULL DEFAULT '',
  imagen_url  text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cf_pasos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "público lee pasos"
  ON public.cf_pasos FOR SELECT
  USING (true);

CREATE POLICY "admin edita pasos"
  ON public.cf_pasos FOR ALL
  USING (auth.role() = 'authenticated');

INSERT INTO public.cf_pasos (paso_num, titulo, descripcion, imagen_url) VALUES
  (1, 'Elige tu cuarto',
      'Explora habitaciones disponibles con precio, fotos y fecha de entrada. Decide desde donde estés.',
      NULL),
  (2, 'Agenda tu visita',
      'Ven en persona a conocer la casa o solicita un recorrido virtual 360°. Sin presión, sin cita larga.',
      NULL),
  (3, 'Aplica con lo mínimo',
      'Sin aval ni fiador. Solo ID oficial, 2 referencias personales y el depósito del primer mes.',
      NULL),
  (4, 'Múdate',
      'Firma digital desde tu teléfono y llega con tu maleta. La cama está lista. Bienvenido a casa.',
      NULL)
ON CONFLICT (paso_num) DO NOTHING;

-- ─── cf_valor ────────────────────────────────────────────────────────────────
-- 2 bloques de valor: "sinaval" (Sin aval) y "flexible" (Flexible de verdad).
CREATE TABLE IF NOT EXISTS public.cf_valor (
  bloque      text        PRIMARY KEY CHECK (bloque IN ('sinaval', 'flexible')),
  titulo      text        NOT NULL DEFAULT '',
  texto       text        NOT NULL DEFAULT '',
  imagen_url  text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cf_valor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "público lee valor"
  ON public.cf_valor FOR SELECT
  USING (true);

CREATE POLICY "admin edita valor"
  ON public.cf_valor FOR ALL
  USING (auth.role() = 'authenticated');

INSERT INTO public.cf_valor (bloque, titulo, texto) VALUES
  ('sinaval',
   'Sin aval. En serio.',
   'Rentar en México normalmente requiere un fiador con propiedades, pólizas jurídicas y meses de trámite. En Rentalia lo quitamos todo. Confiamos en las personas, no en los papeles.'),
  ('flexible',
   'Flexible de verdad.',
   '¿Solo un mes? ¿Seis meses? Tú decides. Mismo precio sin importar el tiempo de tu estancia. Y si tus planes cambian, cancelar es tan sencillo como avisar con 30 días de anticipación.')
ON CONFLICT (bloque) DO NOTHING;

-- ─── cf_faq ──────────────────────────────────────────────────────────────────
-- Preguntas frecuentes dinámicas. El admin crea, edita, reordena y elimina.
CREATE TABLE IF NOT EXISTS public.cf_faq (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta    text        NOT NULL,
  respuesta   text        NOT NULL,
  orden       integer     NOT NULL DEFAULT 0,
  activo      boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cf_faq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "público lee faq activo"
  ON public.cf_faq FOR SELECT
  USING (activo = true);

CREATE POLICY "admin gestiona faq"
  ON public.cf_faq FOR ALL
  USING (auth.role() = 'authenticated');

INSERT INTO public.cf_faq (pregunta, respuesta, orden) VALUES
  ('¿Cuánto tiempo mínimo me puedo quedar?',
   'Desde 1 mes, sin compromisos de estancia larga. Y lo mejor: el precio es el mismo si te quedas 1 mes o 6. Sin penalización por salirte antes de tiempo.',
   10),
  ('¿Qué incluye exactamente la renta mensual?',
   'Todo lo que necesitas para vivir sin preocuparte de recibos extra: cuarto amueblado (cama, escritorio, clóset), luz, agua y gas, internet de alta velocidad (300 Mbps), limpieza quincenal, y acceso a cocina equipada, lavandería y terraza.',
   20),
  ('¿Aceptan mascotas?',
   'Por el momento no aceptamos mascotas. Queremos que todos los que viven en la casa estén cómodos, y lo dejamos fuera para garantizar la convivencia. Si eso cambia, lo avisamos primero a nuestra comunidad.',
   30),
  ('¿Cómo se hace el pago mensual?',
   'La renta se paga mensualmente con tarjeta de crédito o débito. Sin efectivo, sin transferencias complicadas. El cobro se realiza cada mes en la misma fecha de tu entrada.',
   40)
ON CONFLICT DO NOTHING;
