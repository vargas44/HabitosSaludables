// Conexión a la base de datos PostgreSQL para HabitFlow
const { Pool } = require('pg');
const config = require('./config');

// Determinar el entorno (development o production)
const env = process.env.NODE_ENV || 'development';

// Crear el pool de conexiones
const pool = new Pool(config[env]);

// Manejar errores del pool
pool.on('error', (err, client) => {
    console.error('Error inesperado en el pool de PostgreSQL', err);
    process.exit(-1);
});

// Función para ejecutar consultas
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Consulta ejecutada', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Error en la consulta', { text, error: error.message });
        throw error;
    }
}

// Función para obtener un cliente del pool (para transacciones)
async function getClient() {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);
    
    // Monitorear el tiempo que el cliente está en uso
    const timeout = setTimeout(() => {
        console.error('Un cliente ha estado inactivo por más de 10 segundos');
    }, 10000);
    
    client.release = () => {
        clearTimeout(timeout);
        return release();
    };
    
    return client;
}

// Función para ejecutar transacciones
async function transaction(callback) {
    const client = await getClient();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Función para verificar la conexión
async function testConnection() {
    try {
        const result = await query('SELECT NOW()');
        console.log('Conexión a PostgreSQL exitosa:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('Error al conectar a PostgreSQL:', error.message);
        return false;
    }
}

// Función para cerrar el pool
async function close() {
    await pool.end();
    console.log('Pool de conexiones cerrado');
}

module.exports = {
    pool,
    query,
    getClient,
    transaction,
    testConnection,
    close
};

