// Servidor Express para HabitFlow - Conecta frontend con PostgreSQL
const express = require('express');
const cors = require('cors');
const path = require('path');
const { randomUUID } = require('crypto');
const db = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname)));

// Ruta raíz - redirigir a login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// ==================== AUTENTICACIÓN ====================

// POST /api/auth/register - Registrar nuevo usuario
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'El email ya está registrado' });
        }

        // Crear usuario (en producción, hashear la contraseña)
        const userId = randomUUID();
        await db.query(
            'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)',
            [userId, name, email, password]
        );

        // Crear perfil
        const profileResult = await db.query(
            `INSERT INTO user_profiles (user_id, full_name, email, timezone) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [userId, name, email, 'America/Mexico_City']
        );

        // Crear objetivos por defecto
        const profileId = profileResult.rows[0].id;
        const defaultGoals = [
            { text: 'Mejor salud', color: 'blue' },
            { text: 'Más productividad', color: 'green' },
            { text: 'Bienestar mental', color: 'purple' }
        ];

        for (const goal of defaultGoals) {
            await db.query(
                'INSERT INTO profile_goals (user_profile_id, text, color) VALUES ($1, $2, $3)',
                [profileId, goal.text, goal.color]
            );
        }

        res.json({
            success: true,
            user: { id: userId, name, email }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/auth/login - Iniciar sesión
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email y contraseña requeridos' });
        }

        const result = await db.query(
            'SELECT id, name, email FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
        }

        const user = result.rows[0];
        
        // Obtener nombre completo del perfil
        const profileResult = await db.query(
            'SELECT full_name FROM user_profiles WHERE user_id = $1',
            [user.id]
        );
        
        const displayName = profileResult.rows[0]?.full_name || user.name;

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: displayName
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== HÁBITOS ====================

// GET /api/habits - Obtener todos los hábitos del usuario con sus completaciones
app.get('/api/habits', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        }

        const habitsResult = await db.query(
            'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        // Obtener completaciones para cada hábito
        const habits = await Promise.all(habitsResult.rows.map(async (habit) => {
            const completionsResult = await db.query(
                'SELECT completion_date FROM habit_completions WHERE habit_id = $1',
                [habit.id]
            );
            
            // Convertir completaciones a objeto con fechas como keys
            // PostgreSQL devuelve las fechas como objetos Date, necesitamos convertirlas a string YYYY-MM-DD
            const completions = {};
            completionsResult.rows.forEach(row => {
                let dateStr;
                if (row.completion_date instanceof Date) {
                    // Si es un objeto Date, convertir a string YYYY-MM-DD
                    dateStr = row.completion_date.toISOString().split('T')[0];
                } else if (typeof row.completion_date === 'string') {
                    // Si ya es string, usar directamente (puede venir en formato YYYY-MM-DD o con hora)
                    dateStr = row.completion_date.split('T')[0];
                } else {
                    // Si es otro formato, intentar parsearlo
                    dateStr = new Date(row.completion_date).toISOString().split('T')[0];
                }
                completions[dateStr] = true;
            });
            
            console.log(`Servidor - Hábito ${habit.name} (${habit.id}):`, {
                completionsCount: completionsResult.rows.length,
                completions: completions,
                completionDates: Object.keys(completions)
            });
            
            return {
                ...habit,
                completions: completions
            };
        }));

        res.json({ success: true, habits: habits });
    } catch (error) {
        console.error('Error al obtener hábitos:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/habits - Crear nuevo hábito
app.post('/api/habits', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        }

        const { name, category, goal, description, icon, color, target_value } = req.body;
        
        if (!name || !category) {
            return res.status(400).json({ success: false, error: 'Nombre y categoría requeridos' });
        }

        const habitId = randomUUID();
        const result = await db.query(
            `INSERT INTO habits (id, user_id, name, category, goal, description, icon, color, target_value)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [habitId, userId, name, category, goal || null, description || null, icon || 'check_circle', color || 'gray', target_value || 1]
        );

        res.json({ success: true, habit: result.rows[0] });
    } catch (error) {
        console.error('Error al crear hábito:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/habits/:id - Actualizar hábito
app.put('/api/habits/:id', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const habitId = req.params.id;
        
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        }

        const { name, category, goal, description, icon, color, target_value } = req.body;

        const result = await db.query(
            `UPDATE habits 
             SET name = $1, category = $2, goal = $3, description = $4, icon = $5, color = $6, target_value = $7
             WHERE id = $8 AND user_id = $9 RETURNING *`,
            [name, category, goal, description, icon, color, target_value, habitId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Hábito no encontrado' });
        }

        res.json({ success: true, habit: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar hábito:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/habits/:id - Eliminar hábito
app.delete('/api/habits/:id', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const habitId = req.params.id;
        
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        }

        const result = await db.query(
            'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id',
            [habitId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Hábito no encontrado' });
        }

        res.json({ success: true, message: 'Hábito eliminado' });
    } catch (error) {
        console.error('Error al eliminar hábito:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== COMPLETACIONES ====================

// POST /api/habits/:id/complete - Marcar hábito como completado
app.post('/api/habits/:id/complete', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const habitId = req.params.id;
        const { date } = req.body; // Formato: YYYY-MM-DD
        
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        }

        // Verificar que el hábito pertenece al usuario
        const habitCheck = await db.query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [habitId, userId]);
        if (habitCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Hábito no encontrado' });
        }

        const completionDate = date || new Date().toISOString().split('T')[0];
        
        const result = await db.query(
            `INSERT INTO habit_completions (habit_id, completion_date)
             VALUES ($1, $2)
             ON CONFLICT (habit_id, completion_date) DO NOTHING
             RETURNING *`,
            [habitId, completionDate]
        );

        res.json({ success: true, completion: result.rows[0] || { message: 'Ya estaba completado' } });
    } catch (error) {
        console.error('Error al completar hábito:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/habits/:id/complete - Desmarcar completación
app.delete('/api/habits/:id/complete', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const habitId = req.params.id;
        const { date } = req.body;
        
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        }

        const completionDate = date || new Date().toISOString().split('T')[0];
        
        await db.query(
            `DELETE FROM habit_completions 
             WHERE habit_id = $1 AND completion_date = $2
             AND habit_id IN (SELECT id FROM habits WHERE user_id = $3)`,
            [habitId, completionDate, userId]
        );

        res.json({ success: true, message: 'Completación eliminada' });
    } catch (error) {
        console.error('Error al eliminar completación:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== PROGRESO DIARIO ====================

// POST /api/habits/:id/progress - Registrar progreso diario
app.post('/api/habits/:id/progress', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const habitId = req.params.id;
        const { date, progress_value } = req.body;
        
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        }

        const progressDate = date || new Date().toISOString().split('T')[0];
        
        const result = await db.query(
            `INSERT INTO daily_progress (habit_id, progress_date, progress_value)
             VALUES ($1, $2, $3)
             ON CONFLICT (habit_id, progress_date) 
             DO UPDATE SET progress_value = $3
             RETURNING *`,
            [habitId, progressDate, progress_value || 0]
        );

        res.json({ success: true, progress: result.rows[0] });
    } catch (error) {
        console.error('Error al registrar progreso:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ESTADÍSTICAS ====================

// GET /api/statistics - Obtener estadísticas del usuario
app.get('/api/statistics', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        }

        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM habits WHERE user_id = $1) as total_habits,
                (SELECT COUNT(*) FROM habit_completions hc
                 JOIN habits h ON hc.habit_id = h.id
                 WHERE h.user_id = $1) as total_completions,
                (SELECT COUNT(*) FROM daily_progress dp
                 JOIN habits h ON dp.habit_id = h.id
                 WHERE h.user_id = $1) as total_progress
        `, [userId]);

        res.json({ success: true, statistics: stats.rows[0] });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== PERFIL ====================

// GET /api/profile - Obtener perfil del usuario
app.get('/api/profile', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        }

        const result = await db.query(
            'SELECT * FROM user_profiles WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Perfil no encontrado' });
        }

        // Obtener objetivos
        const goalsResult = await db.query(
            'SELECT * FROM profile_goals WHERE user_profile_id = $1',
            [result.rows[0].id]
        );

        res.json({
            success: true,
            profile: {
                ...result.rows[0],
                goals: goalsResult.rows
            }
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/profile - Actualizar perfil
app.put('/api/profile', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        }

        const { full_name, email, biography, timezone } = req.body;

        const result = await db.query(
            `UPDATE user_profiles 
             SET full_name = $1, email = $2, biography = $3, timezone = $4
             WHERE user_id = $5 RETURNING *`,
            [full_name, email, biography, timezone, userId]
        );

        res.json({ success: true, profile: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, async () => {
    console.log(`\n🚀 Servidor HabitFlow iniciado en http://localhost:${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api\n`);
    
    // Probar conexión a la base de datos
    const connected = await db.testConnection();
    if (connected) {
        console.log('✅ Conexión a PostgreSQL establecida\n');
    } else {
        console.log('❌ Error al conectar con PostgreSQL\n');
    }
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('Error no manejado:', error);
});

