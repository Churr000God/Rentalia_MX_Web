-- ─────────────────────────────────────────────────────────────
-- Migración 020 — Términos y condiciones: claves en site_config
-- ─────────────────────────────────────────────────────────────
-- Los campos [confirmar] del aviso de términos se editan desde
-- el panel admin y se leen en el frontend vía Supabase JS client.
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.site_config (key, value) VALUES
  ('terminos_fecha',            'junio de 2026'),
  ('terminos_razon_social',     ''),
  ('terminos_domicilio',        ''),
  ('terminos_email',            'hola@rentalia.mx'),
  ('terminos_whatsapp',         '+52 1 55 2321 5421'),
  ('terminos_estancia_minima',  '1 mes'),
  ('terminos_precio_rango',     '$10,000 a $12,500 MXN al mes'),
  ('terminos_deposito',         ''),
  ('terminos_cancelacion',      ''),
  ('terminos_recargos',         ''),
  ('terminos_mascotas',         ''),
  ('terminos_pasarela',         '')
ON CONFLICT (key) DO NOTHING;
