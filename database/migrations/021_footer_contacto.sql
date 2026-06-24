-- ─────────────────────────────────────────────────────────────
-- Migración 021 — Footer contacto: claves en site_config
-- ─────────────────────────────────────────────────────────────
-- Los datos de contacto del footer (WhatsApp, email, Instagram,
-- dirección) se editan desde el panel admin y se leen en el
-- frontend vía Supabase JS client (initFooter en main.js).
-- Se guardan valores "limpios" (sin prefijos https:// / @ /
-- mailto:); el frontend construye los enlaces en runtime.
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.site_config (key, value) VALUES
  ('footer_whatsapp',  '5215523215421'),
  ('footer_email',     'hola@rentalia.mx'),
  ('footer_instagram', 'rentalia.mx'),
  ('footer_direccion', 'C. Palenque 35, Narvarte Poniente, Benito Juárez, CDMX')
ON CONFLICT (key) DO NOTHING;
