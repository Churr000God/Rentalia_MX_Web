-- =============================================================
-- Migration 001: Tabla habitaciones — esquema limpio (inicio)
-- Proyecto: vefgwrxgfuzgfictdsyo (Rentalia.mx)
-- Pegar en SQL Editor → supabase.com/dashboard/project/vefgwrxgfuzgfictdsyo/sql
-- =============================================================

-- Extensión para UUID
create extension if not exists pgcrypto;

-- ── Tabla principal ────────────────────────────────────────────
create table if not exists public.habitaciones (
  id               uuid        primary key default gen_random_uuid(),
  nombre           text        not null,
  descripcion      text,
  zona             text,
  tipo             text        check (tipo in ('privada', 'compartida', 'estudio')),
  status           text        not null default 'available'
                               check (status in ('available', 'occupied', 'maintenance')),
  precio_min       integer,
  precio_max       integer,
  imagen_principal text,
  imagenes         jsonb       not null default '[]'::jsonb,  -- galería: ["url1","url2",...]
  amenities        jsonb       not null default '[]'::jsonb,  -- slugs: ["wifi","bano_privado",...]
  tags             jsonb       not null default '[]'::jsonb,  -- etiquetas libres: ["Sin aval","Flexible",...]
  orden            integer     not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── Índices ────────────────────────────────────────────────────
create index if not exists idx_habitaciones_status on public.habitaciones(status);
create index if not exists idx_habitaciones_orden  on public.habitaciones(orden);

-- ── updated_at automático ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_habitaciones_updated_at on public.habitaciones;
create trigger trg_habitaciones_updated_at
  before update on public.habitaciones
  for each row execute function public.set_updated_at();

-- ── Row Level Security ─────────────────────────────────────────
alter table public.habitaciones enable row level security;

-- Home (anónimo): solo cuartos disponibles
drop policy if exists habitaciones_anon_read on public.habitaciones;
create policy habitaciones_anon_read
  on public.habitaciones for select
  using (status = 'available');

-- Admin (usuario autenticado): CRUD completo sobre todos los estados
drop policy if exists habitaciones_admin_all on public.habitaciones;
create policy habitaciones_admin_all
  on public.habitaciones for all
  using      (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── Seed — habitaciones de ejemplo ───────────────────────────────
-- Borra el seed anterior si existe y lo vuelve a insertar de forma idempotente
delete from public.habitaciones
  where nombre in (
    'Habitación Jardín',
    'Estudio Roma Norte',
    'Habitación Compartida Centro',
    'Suite Narvarte',
    'Habitación Condesa',
    'Estudio Polanco'
  );

insert into public.habitaciones
  (nombre, descripcion, zona, tipo, status, precio_min, precio_max,
   imagen_principal, imagenes, amenities, tags, orden)
values
  (
    'Habitación Jardín',
    'Amplia habitación privada con vistas al jardín interior. Ideal para profesionistas o estudiantes que buscan tranquilidad.',
    'Narvarte',
    'privada',
    'available',
    6500, 7500,
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800","https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800","https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"]',
    '["wifi","bano_privado","amueblada","servicios"]',
    '["Sin aval","Estancia flexible"]',
    1
  ),
  (
    'Estudio Roma Norte',
    'Estudio completamente independiente a una cuadra del Parque México. Excelente iluminación y ubicación.',
    'Roma Norte',
    'estudio',
    'available',
    9500, 11000,
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800","https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"]',
    '["wifi","cocina","amueblada","escritorio","servicios"]',
    '["Departamento propio","Cocina equipada"]',
    2
  ),
  (
    'Habitación Compartida Centro',
    'Habitación compartida en casa con ambiente familiar. Incluye todos los servicios y limpieza semanal.',
    'Del Valle',
    'compartida',
    'available',
    3800, 4500,
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
    '["https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800"]',
    '["wifi","lavadora","servicios"]',
    '["Ambiente familiar","Limpieza incluida"]',
    3
  ),
  (
    'Suite Narvarte',
    'Habitación tipo suite con baño propio y entrada independiente. Perfecta para parejas o profesionistas.',
    'Narvarte Poniente',
    'privada',
    'available',
    8000, 9200,
    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800',
    '["https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800","https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800","https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800"]',
    '["wifi","bano_privado","amueblada","aire","servicios","escritorio"]',
    '["Entrada independiente","Pet friendly"]',
    4
  ),
  (
    'Habitación Condesa',
    'Luminosa habitación en planta alta con balcón. Rodeada de restaurantes y vida cultural.',
    'Condesa',
    'privada',
    'occupied',
    7200, 8500,
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
    '["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800"]',
    '["wifi","amueblada","escritorio","servicios"]',
    '["Balcón","Colonia premium"]',
    5
  ),
  (
    'Estudio Polanco',
    'Estudio moderno y minimalista en Polanco. Acceso a gimnasio y estacionamiento opcional.',
    'Polanco',
    'estudio',
    'maintenance',
    12000, 14000,
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800","https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"]',
    '["wifi","bano_privado","amueblada","aire","estacionamiento","escritorio"]',
    '["Gimnasio","Zona premium"]',
    6
  );
