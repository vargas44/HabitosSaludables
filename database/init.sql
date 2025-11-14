-- Script de Inicialización de Base de Datos HabitFlow (PostgreSQL)
-- Ejecutar este script como superusuario (postgres) para crear la base de datos y el usuario
-- psql -U postgres -f init.sql

-- Crear usuario (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'habitflow_user') THEN
        CREATE USER habitflow_user WITH PASSWORD 'password_segura_cambiar';
    END IF;
END
$$;

-- Crear base de datos (si no existe)
SELECT 'CREATE DATABASE habitflow_db
    WITH OWNER = habitflow_user
    ENCODING = ''UTF8''
    LC_COLLATE = ''en_US.utf8''
    LC_CTYPE = ''en_US.utf8''
    TEMPLATE = template0;'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'habitflow_db')\gexec

-- Conectarse a la base de datos habitflow_db
\c habitflow_db

-- Otorgar todos los privilegios al usuario
GRANT ALL PRIVILEGES ON DATABASE habitflow_db TO habitflow_user;

-- Otorgar privilegios en el esquema público
GRANT ALL ON SCHEMA public TO habitflow_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO habitflow_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO habitflow_user;

-- Configurar privilegios por defecto para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO habitflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO habitflow_user;

-- Nota: Después de ejecutar este script, ejecutar schema.sql para crear las tablas
-- psql -U habitflow_user -d habitflow_db -f schema.sql

