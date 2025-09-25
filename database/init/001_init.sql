-- ==============================================
-- RENTALIA.MX - Inicialización de Base de Datos
-- ==============================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Crear esquemas
CREATE SCHEMA IF NOT EXISTS rentalia;
CREATE SCHEMA IF NOT EXISTS audit;

-- Configurar búsqueda de esquemas
SET search_path TO rentalia, public;

-- ==============================================
-- FUNCIONES AUXILIARES
-- ==============================================

-- Función para timestamps automáticos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para auditoría
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit.activity_log (
            table_name, operation, old_data, user_id, timestamp
        ) VALUES (
            TG_TABLE_NAME, TG_OP, row_to_json(OLD), 
            current_setting('app.current_user_id', true)::uuid, 
            CURRENT_TIMESTAMP
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.activity_log (
            table_name, operation, old_data, new_data, user_id, timestamp
        ) VALUES (
            TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW),
            current_setting('app.current_user_id', true)::uuid,
            CURRENT_TIMESTAMP
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit.activity_log (
            table_name, operation, new_data, user_id, timestamp
        ) VALUES (
            TG_TABLE_NAME, TG_OP, row_to_json(NEW),
            current_setting('app.current_user_id', true)::uuid,
            CURRENT_TIMESTAMP
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TABLAS DE AUDITORÍA
-- ==============================================

CREATE TABLE IF NOT EXISTS audit.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_activity_log_table_name ON audit.activity_log(table_name);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON audit.activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON audit.activity_log(user_id);

-- ==============================================
-- COMENTARIOS
-- ==============================================

COMMENT ON SCHEMA rentalia IS 'Esquema principal de la aplicación Rentalia.mx';
COMMENT ON SCHEMA audit IS 'Esquema para auditoría y logs de actividad';

COMMENT ON FUNCTION update_updated_at_column() IS 'Función para actualizar automáticamente el campo updated_at';
COMMENT ON FUNCTION audit_trigger_function() IS 'Función para registrar cambios en las tablas auditadas';

COMMENT ON TABLE audit.activity_log IS 'Log de actividad para auditoría de cambios en la base de datos';

-- ==============================================
-- CONFIGURACIÓN INICIAL
-- ==============================================

-- Configurar timezone
SET timezone = 'America/Mexico_City';

-- Configurar locale para ordenamiento
-- ALTER DATABASE rentalia_db SET lc_collate = 'es_MX.UTF-8';
-- ALTER DATABASE rentalia_db SET lc_ctype = 'es_MX.UTF-8';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos Rentalia.mx inicializada correctamente';
    RAISE NOTICE 'Esquemas creados: rentalia, audit';
    RAISE NOTICE 'Extensiones habilitadas: uuid-ossp, postgis, pg_trgm';
END $$;