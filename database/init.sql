-- Script de Inicialización de Base de Datos HabitFlow
-- Ejecutar este script para crear la base de datos y el usuario

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS habitflow_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Crear usuario (ajustar según tu configuración)
CREATE USER IF NOT EXISTS 'habitflow_user'@'localhost' IDENTIFIED BY 'password_segura_cambiar';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON habitflow_db.* TO 'habitflow_user'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Usar la base de datos
USE habitflow_db;

-- Ejecutar el schema
-- SOURCE schema.sql;

