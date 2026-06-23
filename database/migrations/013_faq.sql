-- 013_faq.sql
-- Página "Preguntas frecuentes": FAQs administrables + cola de preguntas de usuarios

-- ─── faq_items ───────────────────────────────────────────────────────────────
-- FAQs públicas con categoría. El admin crea, edita, reordena y elimina.
-- La columna `respuesta` admite HTML básico (<strong>, <ul>, <li>).
CREATE TABLE IF NOT EXISTS public.faq_items (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria     text        NOT NULL DEFAULT 'renta'
                CHECK (categoria IN ('renta', 'contrato', 'convivencia', 'casa')),
  pregunta      text        NOT NULL,
  respuesta     text        NOT NULL,
  orden         integer     NOT NULL DEFAULT 0,
  activo        boolean     NOT NULL DEFAULT true,
  por_confirmar boolean     NOT NULL DEFAULT false,  -- muestra badge "política en confirmación"
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "público lee faq activo"
  ON public.faq_items FOR SELECT
  USING (activo = true);

CREATE POLICY "admin gestiona faq items"
  ON public.faq_items FOR ALL
  USING (auth.role() = 'authenticated');

-- Seed: 14 preguntas de la página inicial (categorías: renta, contrato, convivencia, casa)
-- por_confirmar = true → el equipo debe validar la respuesta antes de publicarla oficial
INSERT INTO public.faq_items (categoria, pregunta, respuesta, orden, por_confirmar) VALUES
  -- La renta
  ('renta',
   '¿Qué incluye la renta mensual?',
   'Todo lo que necesitas, sin recibos extras: cuarto privado <strong>completamente amueblado</strong> (cama, escritorio y clóset), luz, agua, gas, internet de alta velocidad (300 Mbps), limpieza quincenal de tu cuarto y de las áreas comunes, y acceso a la cocina equipada, lavandería y terraza. Un solo precio al mes — sin sorpresas.',
   10, false),
  ('renta',
   '¿Cuánto cuesta una habitación?',
   'Las habitaciones van de <strong>$10,000 a $12,500 al mes</strong>, todo incluido, según el cuarto. Puedes ver el precio exacto y la disponibilidad de cada cuarto en la página de Habitaciones.',
   20, false),
  ('renta',
   '¿Hay costos ocultos?',
   'No. El precio que ves es lo que pagas al mes. Sin cuotas de administración, sin recargos por servicios, sin nada extra. Transparencia total.',
   30, false),
  -- Contrato y pagos
  ('contrato',
   '¿Necesito aval o fiador?',
   'No. En Rentalia no pedimos aval, fiador ni póliza jurídica. Solo necesitas tu <strong>identificación oficial</strong>, un par de referencias personales y una breve presentación. Eso es todo.',
   10, false),
  ('contrato',
   '¿Cuál es la estancia mínima?',
   'Desde <strong>1 mes</strong>. Y lo mejor: el precio es exactamente el mismo si te quedas 1 mes o 6. Sin penalización por estancia corta — entra cuando puedas y sal cuando quieras.',
   20, false),
  ('contrato',
   '¿Cómo es el contrato?',
   'Claro, simple y se firma <strong>en línea desde tu teléfono</strong>. Puedes terminarlo con 30 días de aviso previo, sin trámites complicados ni cargos extra.',
   30, true),
  ('contrato',
   '¿Qué depósito piden?',
   'Al apartar tu cuarto pagas un mes de depósito más el primer mes de renta. El depósito se regresa íntegro al final de tu estancia si el cuarto queda en buen estado.',
   40, false),
  ('contrato',
   '¿Cómo pago la renta mensual?',
   'En línea, con <strong>tarjeta de crédito o débito</strong>. Sin efectivo ni transferencias complicadas. El cargo se hace automáticamente cada mes en tu fecha de entrada.',
   50, true),
  -- Convivencia
  ('convivencia',
   '¿Aceptan mascotas?',
   'Por el momento no. Para garantizar la comodidad de todos los que viven en la casa, preferimos mantener los espacios sin mascotas. Si eso cambia, serás de los primeros en saberlo.',
   10, true),
  ('convivencia',
   '¿Puedo recibir visitas?',
   'Claro, es tu casa. Puedes recibir visitas en tu cuarto y en las áreas comunes respetando los horarios de convivencia y el descanso de tus compañeros. Las visitas no pernoctan.',
   20, true),
  ('convivencia',
   '¿Cómo es la comunidad?',
   'Gente con la que da gusto compartir el espacio: jóvenes profesionistas, estudiantes y viajeros que vienen a Narvarte a vivir, no solo a pasar. Hay áreas comunes para convivir y de vez en cuando organizamos algo juntos.',
   30, false),
  -- La casa
  ('casa',
   '¿Dónde está la casa?',
   'En la colonia <strong>Narvarte Poniente, CDMX</strong> — una de las mejores para vivir en la ciudad: bien conectada, llena de cafeterías, restaurantes y parques, con Metro Etiopía a 8 minutos caminando. La dirección exacta se comparte al confirmar tu visita.',
   10, false),
  ('casa',
   '¿Qué amenidades tiene la casa?',
   'Cocina completamente equipada, terraza con jardín, lavandería con secadora, sala y comedor compartidos, videovigilancia 24/7 y acceso con sistema de seguridad. Todo diseñado para que puedas vivir bien sin necesitar nada extra.',
   20, false),
  ('casa',
   '¿Puedo personalizar mi cuarto?',
   'Claro, hazlo tuyo. Trae tus plantas, pon tus cuadros, decóralo a tu estilo. Solo pedimos que no hagas cambios estructurales ni dañes la pintura con instalaciones permanentes. El cuarto es tu espacio.',
   30, false)
ON CONFLICT DO NOTHING;

-- ─── faq_preguntas_usuario ────────────────────────────────────────────────────
-- Preguntas enviadas por visitantes desde la página pública.
-- El admin las revisa, responde y opcionalmente las publica como FAQ pública.
CREATE TABLE IF NOT EXISTS public.faq_preguntas_usuario (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre    text        NOT NULL,
  email     text        NOT NULL,
  pregunta  text        NOT NULL,
  status    text        NOT NULL DEFAULT 'pendiente'
            CHECK (status IN ('pendiente', 'respondida', 'publicada', 'descartada')),
  respuesta text,                    -- respuesta redactada por el admin (interna o para publicar)
  notas     text,                    -- notas internas del admin (no visibles al usuario)
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faq_preguntas_usuario ENABLE ROW LEVEL SECURITY;

-- Inserción pública/anónima — el formulario usa la anon/publishable key vía supabase-js
CREATE POLICY "público envía pregunta"
  ON public.faq_preguntas_usuario FOR INSERT WITH CHECK (true);

-- El admin (sesión autenticada) lee, edita y borra
CREATE POLICY "admin gestiona preguntas usuario"
  ON public.faq_preguntas_usuario FOR ALL
  USING (auth.role() = 'authenticated');
