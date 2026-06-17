-- Migration to create habitaciones and habitacion_estilos tables for Supabase

-- Enable pgcrypto if not already enabled (usually standard in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table 1: habitaciones
CREATE TABLE IF NOT EXISTS habitaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  zona text,
  tipo text CHECK (tipo IN ('privada', 'compartida', 'estudio')),
  rating numeric(2,1),
  reviews integer,
  status text DEFAULT 'available',
  created_at timestamp DEFAULT now()
);

-- Table 2: habitacion_estilos
CREATE TABLE IF NOT EXISTS habitacion_estilos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habitacion_id uuid REFERENCES habitaciones(id) ON DELETE CASCADE,
  nombre text NOT NULL, -- Ej: Minimalista, Industrial, Premium
  precio integer NOT NULL,
  imagenes jsonb NOT NULL,
  amenities jsonb,
  created_at timestamp DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_habitaciones_status ON habitaciones(status);
CREATE INDEX IF NOT EXISTS idx_habitacion_estilos_habitacion_id ON habitacion_estilos(habitacion_id);

-- Comment: Example data insertion (optional, for testing)
/*
INSERT INTO habitaciones (nombre, descripcion, zona, tipo, rating, reviews)
VALUES
('Habitación Privada Roma', 'Habitación privada amplia y bien iluminada', 'Roma Norte', 'privada', 4.8, 124);

-- Assuming we get the ID from the previous insert, e.g., 'hab-123' (but it will be a UUID)
INSERT INTO habitacion_estilos (habitacion_id, nombre, precio, imagenes)
VALUES
((SELECT id FROM habitaciones WHERE nombre = 'Habitación Privada Roma' LIMIT 1), 'Minimalista', 7500, '["img/minimal1.jpg", "img/minimal2.jpg"]'::jsonb),
((SELECT id FROM habitaciones WHERE nombre = 'Habitación Privada Roma' LIMIT 1), 'Industrial', 8200, '["img/industrial1.jpg", "img/industrial2.jpg"]'::jsonb);
*/
