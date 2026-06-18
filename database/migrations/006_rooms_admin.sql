-- Migration 006: Extend habitaciones for admin panel + home carousel
-- Run this in the Supabase SQL editor

-- Add fields needed for the new design
ALTER TABLE habitaciones
  ADD COLUMN IF NOT EXISTS precio_min      integer,
  ADD COLUMN IF NOT EXISTS precio_max      integer,
  ADD COLUMN IF NOT EXISTS imagen_principal text,
  ADD COLUMN IF NOT EXISTS tags            jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS orden           integer DEFAULT 0;

-- Enable RLS (idempotent)
ALTER TABLE habitaciones       ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitacion_estilos ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (safe re-run)
DROP POLICY IF EXISTS "habitaciones_anon_read"  ON habitaciones;
DROP POLICY IF EXISTS "habitaciones_admin_all"  ON habitaciones;
DROP POLICY IF EXISTS "estilos_anon_read"       ON habitacion_estilos;
DROP POLICY IF EXISTS "estilos_admin_all"       ON habitacion_estilos;

-- Public: anyone can read available rooms
CREATE POLICY "habitaciones_anon_read"
  ON habitaciones FOR SELECT
  USING (status = 'available');

-- Admins (authenticated): full CRUD
CREATE POLICY "habitaciones_admin_all"
  ON habitaciones FOR ALL
  USING      (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Estilos: public read, admin write
CREATE POLICY "estilos_anon_read"
  ON habitacion_estilos FOR SELECT
  USING (true);

CREATE POLICY "estilos_admin_all"
  ON habitacion_estilos FOR ALL
  USING      (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Index for carousel ordering
CREATE INDEX IF NOT EXISTS idx_habitaciones_orden ON habitaciones(orden);

-- Supabase Storage bucket for room images
-- Run separately if SQL errors (storage.buckets requires superuser in some plans):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('habitaciones', 'habitaciones', true)
-- ON CONFLICT (id) DO NOTHING;
