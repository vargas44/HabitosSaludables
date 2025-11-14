// Configuración de ejemplo para la base de datos HabitFlow
// Renombrar a config.js y actualizar con tus credenciales

module.exports = {
    development: {
        host: 'localhost',
        user: 'habitflow_user',
        password: 'password_segura',
        database: 'habitflow_db',
        charset: 'utf8mb4',
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0
    },
    production: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'habitflow_user',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'habitflow_db',
        charset: 'utf8mb4',
        connectionLimit: 20,
        waitForConnections: true,
        queueLimit: 0,
        ssl: {
            rejectUnauthorized: false
        }
    }
};

