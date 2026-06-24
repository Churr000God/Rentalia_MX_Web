-- ─────────────────────────────────────────────────────────────
-- Migración 019 — Aviso de privacidad: claves en site_config
-- ─────────────────────────────────────────────────────────────
-- Los campos [confirmar] del aviso de privacidad se editan desde
-- el panel admin y se leen en el frontend vía Supabase JS client.
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.site_config (key, value) VALUES
  ('aviso_responsable_razon_social', ''),
  ('aviso_responsable_domicilio',    ''),
  ('aviso_whatsapp',                 '+52 1 55 2321 5421'),
  ('aviso_fecha',                    'junio de 2026'),
  ('aviso_pasarela',                 ''),
  ('aviso_proveedores',              '')
ON CONFLICT (key) DO NOTHING;
