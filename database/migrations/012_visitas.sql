-- 012_visitas.sql
-- Solicitudes de visita recibidas desde el formulario público "Agendar visita"

-- ─── visitas ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.visitas (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            text        NOT NULL,
  whatsapp          text        NOT NULL,
  email             text        NOT NULL,
  habitacion_id     uuid        REFERENCES public.habitaciones(id) ON DELETE SET NULL,
  habitacion_nombre text,                 -- snapshot del nombre al momento del envío
  fecha_preferida   text,                 -- texto libre ("martes por la tarde…")
  mensaje           text,
  status            text        NOT NULL DEFAULT 'pendiente'
                    CHECK (status IN ('pendiente', 'contactado', 'agendado', 'descartado')),
  notas             text,                 -- notas internas del admin
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;

-- Inserción pública / anónima — el formulario usa la anon key vía FastAPI
CREATE POLICY "public inserta visita"
  ON public.visitas FOR INSERT WITH CHECK (true);

-- El admin (sesión autenticada con anon key) lee, edita y borra
CREATE POLICY "admin gestiona visitas"
  ON public.visitas FOR ALL
  USING (auth.role() = 'authenticated');

-- ─── site_config: correo de notificación del equipo ───────────────────────────
-- Editable desde el admin panel (sección Leads → Visitas → Configuración)
INSERT INTO public.site_config (key, value)
VALUES ('visitas_notify_email', 'hola@rentalia.mx')
ON CONFLICT (key) DO NOTHING;
