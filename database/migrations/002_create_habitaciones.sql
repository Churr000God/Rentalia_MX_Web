SET search_path TO rentalia, public;

CREATE TABLE IF NOT EXISTS habitaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  detalles text,
  descripcion text,
  precio numeric(10,2) NOT NULL,
  capacidad integer NOT NULL CHECK (capacidad > 0),
  disponible boolean NOT NULL DEFAULT true,
  direccion text,
  ubicacion geography(Point,4326),
  imagen_principal text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habitacion_imagenes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  habitacion_id uuid NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
  url text NOT NULL,
  orden integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habitacion_amenidades (
  habitacion_id uuid NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
  amenidad text NOT NULL,
  PRIMARY KEY (habitacion_id, amenidad)
);

CREATE INDEX IF NOT EXISTS idx_habitaciones_disponible ON habitaciones(disponible);
CREATE INDEX IF NOT EXISTS idx_habitaciones_precio ON habitaciones(precio);
CREATE INDEX IF NOT EXISTS idx_habitaciones_capacidad ON habitaciones(capacidad);
CREATE INDEX IF NOT EXISTS idx_habitaciones_ubicacion ON habitaciones USING GIST(ubicacion);
CREATE INDEX IF NOT EXISTS idx_habitaciones_search ON habitaciones USING GIN (to_tsvector('spanish', coalesce(nombre,'') || ' ' || coalesce(detalles,'') || ' ' || coalesce(descripcion,'')));

CREATE TRIGGER habitaciones_update_updated_at BEFORE UPDATE ON habitaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
