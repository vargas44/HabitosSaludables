-- HabitFlow Database Schema
-- Versión 1.3 (PostgreSQL) - Estable
-- Base de datos para almacenar todos los datos de la aplicación HabitFlow

-- Función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- En producción debe estar hasheado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email ON users(email);

-- Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    biography TEXT,
    timezone VARCHAR(100) DEFAULT 'America/Mexico_City',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_id ON user_profiles(user_id);

-- Tabla de Objetivos del Perfil
CREATE TABLE IF NOT EXISTS profile_goals (
    id SERIAL PRIMARY KEY,
    user_profile_id INT NOT NULL,
    text VARCHAR(255) NOT NULL,
    color VARCHAR(50) NOT NULL DEFAULT 'blue',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_profile_id ON profile_goals(user_profile_id);

-- Tabla de Hábitos
CREATE TABLE IF NOT EXISTS habits (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('salud', 'ejercicio', 'alimentacion', 'mental', 'productividad')),
    goal VARCHAR(255),
    description TEXT,
    icon VARCHAR(100) DEFAULT 'check_circle',
    color VARCHAR(50) DEFAULT 'gray',
    target_value INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_category ON habits(category);
CREATE INDEX IF NOT EXISTS idx_created_at ON habits(created_at);

-- Tabla de Completaciones de Hábitos (marcar como completado)
CREATE TABLE IF NOT EXISTS habit_completions (
    id SERIAL PRIMARY KEY,
    habit_id VARCHAR(255) NOT NULL,
    completion_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE (habit_id, completion_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_completion_date ON habit_completions(completion_date);

-- Tabla de Progreso Diario (seguimiento numérico)
CREATE TABLE IF NOT EXISTS daily_progress (
    id SERIAL PRIMARY KEY,
    habit_id VARCHAR(255) NOT NULL,
    progress_date DATE NOT NULL,
    progress_value DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE (habit_id, progress_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_id ON daily_progress(habit_id);
CREATE INDEX IF NOT EXISTS idx_progress_date ON daily_progress(progress_date);

-- Tabla de Sesiones (opcional, para tracking de sesiones activas)
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_expires_at ON user_sessions(expires_at);

-- Triggers para actualizar automáticamente updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_progress_updated_at BEFORE UPDATE ON daily_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

