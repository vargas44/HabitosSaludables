// Ejemplo de uso de la conexión a PostgreSQL
const db = require('./database');

async function ejemploUso() {
    try {
        // 1. Probar la conexión
        console.log('Probando conexión...');
        await db.testConnection();
        
        // 2. Ejecutar una consulta simple
        console.log('\nEjecutando consulta simple...');
        const result = await db.query('SELECT NOW() as current_time');
        console.log('Hora actual:', result.rows[0].current_time);
        
        // 3. Ejecutar una consulta con parámetros
        console.log('\nEjecutando consulta con parámetros...');
        const userResult = await db.query(
            'SELECT * FROM users WHERE email = $1',
            ['usuario@ejemplo.com']
        );
        console.log('Usuario encontrado:', userResult.rows);
        
        // 4. Ejecutar una transacción
        console.log('\nEjecutando transacción...');
        await db.transaction(async (client) => {
            // Insertar un usuario
            await client.query(
                'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)',
                ['user123', 'Juan Pérez', 'juan@ejemplo.com', 'hashed_password']
            );
            
            // Insertar un perfil
            await client.query(
                'INSERT INTO user_profiles (user_id, full_name, email) VALUES ($1, $2, $3)',
                ['user123', 'Juan Pérez', 'juan@ejemplo.com']
            );
            
            console.log('Transacción completada exitosamente');
        });
        
        // 5. Obtener estadísticas
        console.log('\nObteniendo estadísticas...');
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM habits) as total_habits,
                (SELECT COUNT(*) FROM habit_completions) as total_completions
        `);
        console.log('Estadísticas:', stats.rows[0]);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        // Cerrar el pool de conexiones
        await db.close();
    }
}

// Ejecutar el ejemplo
if (require.main === module) {
    ejemploUso();
}

module.exports = ejemploUso;

