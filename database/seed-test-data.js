// Script para crear usuario de prueba con datos cargados
const db = require('./database');
const { v4: uuidv4 } = require('uuid');

async function createTestUser() {
    try {
        console.log('Creando usuario de prueba con datos...\n');
        
        // Generar IDs
        const userId = uuidv4();
        const now = new Date();
        
        // 1. Crear usuario
        console.log('[1/6] Creando usuario...');
        await db.query(
            `INSERT INTO users (id, name, email, password, created_at) 
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO NOTHING`,
            [userId, 'Usuario Prueba', 'prueba@habitflow.com', 'hashed_password_123', now]
        );
        console.log('✓ Usuario creado:', userId);
        
        // 2. Crear perfil
        console.log('\n[2/6] Creando perfil...');
        const profileResult = await db.query(
            `INSERT INTO user_profiles (user_id, full_name, email, biography, timezone, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (user_id) DO UPDATE SET full_name = $2, biography = $4
             RETURNING id`,
            [
                userId,
                'Usuario de Prueba HabitFlow',
                'prueba@habitflow.com',
                'Desarrollador apasionado por los hábitos saludables. Me encanta mejorar mi vida día a día.',
                'America/Mexico_City',
                now
            ]
        );
        const profileId = profileResult.rows[0]?.id || (await db.query('SELECT id FROM user_profiles WHERE user_id = $1', [userId])).rows[0].id;
        console.log('✓ Perfil creado:', profileId);
        
        // 3. Crear objetivos del perfil
        console.log('\n[3/6] Creando objetivos...');
        const goals = [
            { text: 'Mejorar mi salud física', color: 'green' },
            { text: 'Desarrollar disciplina mental', color: 'blue' },
            { text: 'Aumentar mi productividad', color: 'purple' }
        ];
        
        for (const goal of goals) {
            await db.query(
                `INSERT INTO profile_goals (user_profile_id, text, color, created_at)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT DO NOTHING`,
                [profileId, goal.text, goal.color, now]
            );
        }
        console.log('✓ Objetivos creados:', goals.length);
        
        // 4. Crear hábitos
        console.log('\n[4/6] Creando hábitos...');
        const habits = [
            {
                id: uuidv4(),
                name: 'Ejercicio Matutino',
                category: 'ejercicio',
                goal: 'Hacer ejercicio 30 minutos cada día',
                description: 'Rutina de ejercicios en la mañana para empezar el día con energía',
                icon: 'fitness_center',
                color: 'red',
                target_value: 1
            },
            {
                id: uuidv4(),
                name: 'Meditación',
                category: 'mental',
                goal: 'Meditar 15 minutos diarios',
                description: 'Tiempo de meditación para calmar la mente',
                icon: 'self_improvement',
                color: 'purple',
                target_value: 1
            },
            {
                id: uuidv4(),
                name: 'Leer',
                category: 'productividad',
                goal: 'Leer 20 páginas al día',
                description: 'Lectura diaria para crecimiento personal',
                icon: 'menu_book',
                color: 'blue',
                target_value: 20
            },
            {
                id: uuidv4(),
                name: 'Beber Agua',
                category: 'salud',
                goal: 'Beber 2 litros de agua',
                description: 'Mantener hidratación adecuada durante el día',
                icon: 'water_drop',
                color: 'cyan',
                target_value: 8
            },
            {
                id: uuidv4(),
                name: 'Comida Saludable',
                category: 'alimentacion',
                goal: 'Comer 3 comidas balanceadas',
                description: 'Alimentación saludable y balanceada',
                icon: 'restaurant',
                color: 'green',
                target_value: 3
            }
        ];
        
        const habitIds = [];
        for (const habit of habits) {
            await db.query(
                `INSERT INTO habits (id, user_id, name, category, goal, description, icon, color, target_value, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 ON CONFLICT (id) DO NOTHING`,
                [
                    habit.id, userId, habit.name, habit.category, habit.goal,
                    habit.description, habit.icon, habit.color, habit.target_value, now
                ]
            );
            habitIds.push(habit.id);
            console.log(`  ✓ ${habit.name}`);
        }
        console.log('✓ Hábitos creados:', habits.length);
        
        // 5. Crear completaciones de hábitos (últimos 30 días)
        console.log('\n[5/6] Creando completaciones de hábitos...');
        const completions = [];
        const today = new Date();
        
        // Crear completaciones aleatorias para los últimos 30 días
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Cada hábito tiene un 70% de probabilidad de estar completado cada día
            for (const habitId of habitIds) {
                if (Math.random() > 0.3) { // 70% de probabilidad
                    try {
                        await db.query(
                            `INSERT INTO habit_completions (habit_id, completion_date, created_at)
                             VALUES ($1, $2, $3)
                             ON CONFLICT (habit_id, completion_date) DO NOTHING`,
                            [habitId, dateStr, date]
                        );
                        completions.push({ habitId, date: dateStr });
                    } catch (err) {
                        // Ignorar errores de duplicados
                    }
                }
            }
        }
        console.log('✓ Completaciones creadas:', completions.length);
        
        // 6. Crear progreso diario (para hábitos numéricos)
        console.log('\n[6/6] Creando progreso diario...');
        const progressHabits = habitIds.filter((_, idx) => [2, 3].includes(idx)); // Leer y Beber Agua
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            for (const habitId of progressHabits) {
                const habitIndex = habitIds.indexOf(habitId);
                const targetValue = habits[habitIndex].target_value;
                // Progreso aleatorio entre 50% y 100% del objetivo
                const progressValue = Math.floor((Math.random() * 0.5 + 0.5) * targetValue);
                
                try {
                    await db.query(
                        `INSERT INTO daily_progress (habit_id, progress_date, progress_value, created_at)
                         VALUES ($1, $2, $3, $4)
                         ON CONFLICT (habit_id, progress_date) DO UPDATE SET progress_value = $3`,
                        [habitId, dateStr, progressValue, date]
                    );
                } catch (err) {
                    // Ignorar errores
                }
            }
        }
        console.log('✓ Progreso diario creado');
        
        // Obtener estadísticas finales
        console.log('\n========================================');
        console.log('Usuario de prueba creado exitosamente!');
        console.log('========================================\n');
        
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE id = $1) as user_exists,
                (SELECT COUNT(*) FROM habits WHERE user_id = $1) as total_habits,
                (SELECT COUNT(*) FROM habit_completions hc 
                 JOIN habits h ON hc.habit_id = h.id 
                 WHERE h.user_id = $1) as total_completions,
                (SELECT COUNT(*) FROM daily_progress dp
                 JOIN habits h ON dp.habit_id = h.id
                 WHERE h.user_id = $1) as total_progress
        `, [userId]);
        
        const statsData = stats.rows[0];
        console.log('Estadísticas del usuario:');
        console.log('  - Usuario ID:', userId);
        console.log('  - Email: prueba@habitflow.com');
        console.log('  - Hábitos:', statsData.total_habits);
        console.log('  - Completaciones:', statsData.total_completions);
        console.log('  - Registros de progreso:', statsData.total_progress);
        console.log('\nPuedes iniciar sesión con:');
        console.log('  Email: prueba@habitflow.com');
        console.log('  Password: (cualquiera, ya que es solo para pruebas)');
        
    } catch (error) {
        console.error('Error al crear usuario de prueba:', error);
        throw error;
    } finally {
        await db.close();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    createTestUser()
        .then(() => {
            console.log('\n✓ Proceso completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n✗ Error:', error.message);
            process.exit(1);
        });
}

module.exports = createTestUser;

