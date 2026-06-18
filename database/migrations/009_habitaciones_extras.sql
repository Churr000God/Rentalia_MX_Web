-- Migration 009: Campos extra en habitaciones para la página de catálogo
-- Proyecto: vefgwrxgfuzgfictdsyo (Rentalia.mx)
-- Aplicar en SQL Editor → supabase.com/dashboard/project/vefgwrxgfuzgfictdsyo/sql

ALTER TABLE public.habitaciones
  ADD COLUMN IF NOT EXISTS piso              integer,
  ADD COLUMN IF NOT EXISTS metros_cuadrados  integer,
  ADD COLUMN IF NOT EXISTS fecha_disponibilidad text;   -- "Disponible ahora" | "1 de julio" | etc.
