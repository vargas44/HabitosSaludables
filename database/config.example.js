// Configuración de ejemplo para la base de datos HabitFlow (PostgreSQL)
// Renombrar a config.js y actualizar con tus credenciales

module.exports = {
    development: {
        host: 'localhost',
        port: 5432,
        user: 'habitflow_user',
        password: 'password_segura', // Cambiar por la contraseña del usuario habitflow_user
        database: 'habitflow_db',
        max: 10, // Máximo de conexiones en el pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    },
    production: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'habitflow_user',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'habitflow_db',
        max: 20, // Máximo de conexiones en el pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ssl: process.env.DB_SSL === 'true' ? {
            rejectUnauthorized: false
        } : false
    }
};

