// Ejemplo de script de migración desde LocalStorage a Base de Datos
// Este es un ejemplo de cómo migrar los datos existentes

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Configuración de la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'habitflow_user',
    password: 'password_segura',
    database: 'habitflow_db',
    charset: 'utf8mb4'
};

async function migrateFromLocalStorage(jsonData) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        await connection.beginTransaction();
        
        // Migrar usuarios
        for (const user of jsonData.users || []) {
            // Hashear contraseña
            const hashedPassword = await bcrypt.hash(user.password, 10);
            
            await connection.execute(
                `INSERT INTO users (id, name, email, password, created_at) 
                 VALUES (?, ?, ?, ?, ?)`,
                [user.id, user.name, user.email, hashedPassword, user.createdAt]
            );
            
            // Migrar perfil
            if (user.profile) {
                await connection.execute(
                    `INSERT INTO user_profiles (user_id, full_name, email, biography, timezone, created_at)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        user.id,
                        user.profile.fullName,
                        user.profile.email,
                        user.profile.biography,
                        user.profile.timezone || 'America/Mexico_City',
                        user.createdAt
                    ]
                );
                
                // Obtener ID del perfil creado
                const [profileRows] = await connection.execute(
                    'SELECT id FROM user_profiles WHERE user_id = ?',
                    [user.id]
                );
                const profileId = profileRows[0].id;
                
                // Migrar objetivos
                if (user.profile.goals && user.profile.goals.length > 0) {
                    for (const goal of user.profile.goals) {
                        await connection.execute(
                            `INSERT INTO profile_goals (user_profile_id, text, color, created_at)
                             VALUES (?, ?, ?, NOW())`,
                            [profileId, goal.text, goal.color]
                        );
                    }
                }
            }
        }
        
        // Migrar hábitos
        for (const habit of jsonData.habits || []) {
            await connection.execute(
                `INSERT INTO habits (id, user_id, name, category, goal, description, icon, color, target_value, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    habit.id,
                    habit.userId, // Necesitarías mapear esto desde los datos
                    habit.name,
                    habit.category,
                    habit.goal,
                    habit.description,
                    habit.icon,
                    habit.color,
                    habit.targetValue || 1,
                    habit.createdAt
                ]
            );
            
            // Migrar completaciones
            if (habit.completions) {
                for (const dateStr of Object.keys(habit.completions)) {
                    if (habit.completions[dateStr]) {
                        await connection.execute(
                            `INSERT INTO habit_completions (habit_id, completion_date, created_at)
                             VALUES (?, ?, NOW())
                             ON DUPLICATE KEY UPDATE completion_date = completion_date`,
                            [habit.id, dateStr]
                        );
                    }
                }
            }
            
            // Migrar progreso diario
            if (habit.dailyProgress) {
                for (const dateStr of Object.keys(habit.dailyProgress)) {
                    const progressValue = habit.dailyProgress[dateStr];
                    await connection.execute(
                        `INSERT INTO daily_progress (habit_id, progress_date, progress_value, created_at, updated_at)
                         VALUES (?, ?, ?, NOW(), NOW())
                         ON DUPLICATE KEY UPDATE progress_value = ?, updated_at = NOW()`,
                        [habit.id, dateStr, progressValue, progressValue]
                    );
                }
            }
        }
        
        await connection.commit();
        console.log('Migración completada exitosamente');
        
    } catch (error) {
        await connection.rollback();
        console.error('Error en la migración:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Ejemplo de uso
// const jsonData = JSON.parse(fs.readFileSync('habitflow-data-export.json', 'utf8'));
// migrateFromLocalStorage(jsonData);

module.exports = { migrateFromLocalStorage };

