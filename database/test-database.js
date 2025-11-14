// Script de prueba para verificar que la base de datos funciona correctamente
const db = require('./database');

async function testDatabase() {
    console.log('========================================');
    console.log('  Prueba de Base de Datos HabitFlow');
    console.log('========================================\n');
    
    let allTestsPassed = true;
    const testResults = [];
    
    // Función auxiliar para registrar resultados
    function recordTest(name, passed, message = '') {
        testResults.push({ name, passed, message });
        const icon = passed ? '✓' : '✗';
        const status = passed ? 'PASÓ' : 'FALLÓ';
        const color = passed ? '\x1b[32m' : '\x1b[31m';
        console.log(`${color}${icon}\x1b[0m [${status}] ${name}${message ? ': ' + message : ''}`);
        if (!passed) allTestsPassed = false;
    }
    
    try {
        // Test 1: Conexión a la base de datos
        console.log('\n[1/10] Probando conexión...');
        const connectionTest = await db.testConnection();
        recordTest('Conexión a PostgreSQL', connectionTest, connectionTest ? 'Conexión exitosa' : 'Error de conexión');
        
        // Test 2: Verificar que las tablas existen
        console.log('\n[2/10] Verificando tablas...');
        const tables = ['users', 'user_profiles', 'profile_goals', 'habits', 'habit_completions', 'daily_progress', 'user_sessions'];
        for (const table of tables) {
            try {
                const result = await db.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)`, [table]);
                const exists = result.rows[0].exists;
                recordTest(`Tabla ${table}`, exists, exists ? 'Existe' : 'No existe');
            } catch (error) {
                recordTest(`Tabla ${table}`, false, error.message);
            }
        }
        
        // Test 3: Verificar usuario de prueba
        console.log('\n[3/10] Verificando usuario de prueba...');
        const testUserEmail = 'prueba@habitflow.com';
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [testUserEmail]);
        const userExists = userResult.rows.length > 0;
        recordTest('Usuario de prueba existe', userExists, userExists ? `Usuario encontrado: ${userResult.rows[0].name}` : 'Usuario no encontrado');
        
        if (userExists) {
            const userId = userResult.rows[0].id;
            console.log(`   ID: ${userId}`);
            console.log(`   Nombre: ${userResult.rows[0].name}`);
            console.log(`   Email: ${userResult.rows[0].email}`);
            
            // Test 4: Verificar perfil del usuario
            console.log('\n[4/10] Verificando perfil de usuario...');
            const profileResult = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
            const profileExists = profileResult.rows.length > 0;
            recordTest('Perfil de usuario existe', profileExists, profileExists ? 'Perfil encontrado' : 'Perfil no encontrado');
            
            if (profileExists) {
                const profile = profileResult.rows[0];
                console.log(`   Nombre completo: ${profile.full_name}`);
                console.log(`   Biografía: ${profile.biography ? profile.biography.substring(0, 50) + '...' : 'N/A'}`);
                console.log(`   Timezone: ${profile.timezone}`);
            }
            
            // Test 5: Verificar objetivos del perfil
            console.log('\n[5/10] Verificando objetivos del perfil...');
            if (profileExists) {
                const profileId = profileResult.rows[0].id;
                const goalsResult = await db.query('SELECT * FROM profile_goals WHERE user_profile_id = $1', [profileId]);
                recordTest('Objetivos del perfil', goalsResult.rows.length > 0, `${goalsResult.rows.length} objetivos encontrados`);
                if (goalsResult.rows.length > 0) {
                    goalsResult.rows.forEach((goal, idx) => {
                        console.log(`   ${idx + 1}. ${goal.text} (${goal.color})`);
                    });
                }
            }
            
            // Test 6: Verificar hábitos
            console.log('\n[6/10] Verificando hábitos...');
            const habitsResult = await db.query('SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at', [userId]);
            recordTest('Hábitos del usuario', habitsResult.rows.length > 0, `${habitsResult.rows.length} hábitos encontrados`);
            if (habitsResult.rows.length > 0) {
                console.log('   Hábitos:');
                habitsResult.rows.forEach((habit, idx) => {
                    console.log(`   ${idx + 1}. ${habit.name} (${habit.category}) - Objetivo: ${habit.goal || 'N/A'}`);
                });
            }
            
            // Test 7: Verificar completaciones
            console.log('\n[7/10] Verificando completaciones...');
            const completionsResult = await db.query(`
                SELECT COUNT(*) as total 
                FROM habit_completions hc
                JOIN habits h ON hc.habit_id = h.id
                WHERE h.user_id = $1
            `, [userId]);
            const totalCompletions = parseInt(completionsResult.rows[0].total);
            recordTest('Completaciones de hábitos', totalCompletions > 0, `${totalCompletions} completaciones encontradas`);
            
            // Test 8: Verificar progreso diario
            console.log('\n[8/10] Verificando progreso diario...');
            const progressResult = await db.query(`
                SELECT COUNT(*) as total 
                FROM daily_progress dp
                JOIN habits h ON dp.habit_id = h.id
                WHERE h.user_id = $1
            `, [userId]);
            const totalProgress = parseInt(progressResult.rows[0].total);
            recordTest('Registros de progreso', totalProgress > 0, `${totalProgress} registros encontrados`);
            
            // Test 9: Consulta compleja - Estadísticas
            console.log('\n[9/10] Probando consulta compleja (estadísticas)...');
            try {
                const statsResult = await db.query(`
                    SELECT 
                        (SELECT COUNT(*) FROM users) as total_users,
                        (SELECT COUNT(*) FROM habits WHERE user_id = $1) as user_habits,
                        (SELECT COUNT(*) FROM habit_completions hc
                         JOIN habits h ON hc.habit_id = h.id
                         WHERE h.user_id = $1) as user_completions,
                        (SELECT COUNT(*) FROM daily_progress dp
                         JOIN habits h ON dp.habit_id = h.id
                         WHERE h.user_id = $1) as user_progress
                `, [userId]);
                const stats = statsResult.rows[0];
                recordTest('Consulta de estadísticas', true, 'Consulta ejecutada correctamente');
                console.log('   Estadísticas:');
                console.log(`   - Total usuarios: ${stats.total_users}`);
                console.log(`   - Hábitos del usuario: ${stats.user_habits}`);
                console.log(`   - Completaciones: ${stats.user_completions}`);
                console.log(`   - Registros de progreso: ${stats.user_progress}`);
            } catch (error) {
                recordTest('Consulta de estadísticas', false, error.message);
            }
            
            // Test 10: Transacción
            console.log('\n[10/10] Probando transacción...');
            try {
                await db.transaction(async (client) => {
                    // Simular una operación de transacción
                    const testResult = await client.query('SELECT NOW() as current_time');
                    await client.query('SELECT 1'); // Operación dummy
                });
                recordTest('Transacciones', true, 'Transacción ejecutada correctamente');
            } catch (error) {
                recordTest('Transacciones', false, error.message);
            }
        }
        
        // Resumen final
        console.log('\n========================================');
        console.log('  Resumen de Pruebas');
        console.log('========================================\n');
        
        const passedTests = testResults.filter(t => t.passed).length;
        const failedTests = testResults.filter(t => !t.passed).length;
        
        console.log(`Total de pruebas: ${testResults.length}`);
        console.log(`\x1b[32m✓ Pasaron: ${passedTests}\x1b[0m`);
        console.log(`\x1b[31m✗ Fallaron: ${failedTests}\x1b[0m`);
        
        if (allTestsPassed) {
            console.log('\n\x1b[32m✓✓✓ TODAS LAS PRUEBAS PASARON ✓✓✓\x1b[0m');
            console.log('La base de datos está funcionando correctamente.\n');
        } else {
            console.log('\n\x1b[31m✗✗✗ ALGUNAS PRUEBAS FALLARON ✗✗✗\x1b[0m');
            console.log('Revisa los errores arriba.\n');
        }
        
    } catch (error) {
        console.error('\n\x1b[31m✗ Error crítico en las pruebas:\x1b[0m', error.message);
        console.error(error.stack);
        allTestsPassed = false;
    } finally {
        await db.close();
    }
    
    process.exit(allTestsPassed ? 0 : 1);
}

// Ejecutar pruebas
testDatabase();

