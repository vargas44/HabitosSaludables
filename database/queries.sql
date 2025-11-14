-- Queries Útiles para HabitFlow
-- Colección de consultas SQL comunes para la aplicación

-- ============================================
-- CONSULTAS DE USUARIOS
-- ============================================

-- Obtener usuario por email
SELECT * FROM users WHERE email = ?;

-- Obtener usuario con su perfil
SELECT 
    u.id,
    u.name,
    u.email,
    u.created_at,
    up.full_name,
    up.biography,
    up.timezone
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.id = ?;

-- ============================================
-- CONSULTAS DE HÁBITOS
-- ============================================

-- Obtener todos los hábitos de un usuario
SELECT * FROM habits 
WHERE user_id = ? 
ORDER BY created_at DESC;

-- Obtener hábitos con progreso del día actual
SELECT 
    h.*,
    COALESCE(dp.progress_value, 0) as current_progress,
    CASE 
        WHEN h.target_value > 0 
        THEN ROUND((COALESCE(dp.progress_value, 0) / h.target_value) * 100, 2)
        ELSE 0 
    END as progress_percentage,
    CASE 
        WHEN hc.completion_date IS NOT NULL THEN 1 
        ELSE 0 
    END as is_completed_today
FROM habits h
LEFT JOIN daily_progress dp ON h.id = dp.habit_id 
    AND dp.progress_date = CURDATE()
LEFT JOIN habit_completions hc ON h.id = hc.habit_id 
    AND hc.completion_date = CURDATE()
WHERE h.user_id = ?
ORDER BY h.created_at DESC;

-- Obtener hábitos por categoría
SELECT * FROM habits 
WHERE user_id = ? AND category = ?
ORDER BY name;

-- Buscar hábitos por nombre
SELECT * FROM habits 
WHERE user_id = ? 
    AND name LIKE CONCAT('%', ?, '%')
ORDER BY name;

-- ============================================
-- CONSULTAS DE PROGRESO
-- ============================================

-- Obtener progreso de un hábito en un rango de fechas
SELECT 
    progress_date,
    progress_value
FROM daily_progress
WHERE habit_id = ?
    AND progress_date BETWEEN ? AND ?
ORDER BY progress_date;

-- Obtener progreso del día actual de todos los hábitos
SELECT 
    h.id,
    h.name,
    h.target_value,
    COALESCE(dp.progress_value, 0) as current_progress,
    ROUND((COALESCE(dp.progress_value, 0) / h.target_value) * 100, 2) as percentage
FROM habits h
LEFT JOIN daily_progress dp ON h.id = dp.habit_id 
    AND dp.progress_date = CURDATE()
WHERE h.user_id = ?;

-- ============================================
-- CONSULTAS DE COMPLETACIONES
-- ============================================

-- Obtener completaciones de la semana
SELECT 
    hc.*,
    h.name as habit_name,
    h.category
FROM habit_completions hc
JOIN habits h ON hc.habit_id = h.id
WHERE h.user_id = ?
    AND hc.completion_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    AND hc.completion_date <= CURDATE()
ORDER BY hc.completion_date DESC;

-- Obtener días completados en el mes
SELECT 
    DATE_FORMAT(completion_date, '%Y-%m-%d') as date,
    COUNT(*) as habits_completed
FROM habit_completions hc
JOIN habits h ON hc.habit_id = h.id
WHERE h.user_id = ?
    AND YEAR(completion_date) = YEAR(CURDATE())
    AND MONTH(completion_date) = MONTH(CURDATE())
GROUP BY completion_date
ORDER BY completion_date;

-- ============================================
-- CONSULTAS DE ESTADÍSTICAS
-- ============================================

-- Estadísticas del día actual
SELECT 
    COUNT(DISTINCT h.id) as total_habits,
    COUNT(DISTINCT hc.habit_id) as completed_today,
    ROUND((COUNT(DISTINCT hc.habit_id) / COUNT(DISTINCT h.id)) * 100, 2) as completion_rate,
    COUNT(DISTINCT h.category) as active_categories
FROM habits h
LEFT JOIN habit_completions hc ON h.id = hc.habit_id 
    AND hc.completion_date = CURDATE()
WHERE h.user_id = ?;

-- Estadísticas de la semana
SELECT 
    COUNT(DISTINCT DATE(hc.completion_date)) as days_completed,
    COUNT(hc.id) as total_completions,
    ROUND(COUNT(hc.id) / 7.0, 2) as average_daily,
    ROUND((COUNT(DISTINCT DATE(hc.completion_date)) / 7.0) * 100, 2) as week_completion_rate
FROM habits h
LEFT JOIN habit_completions hc ON h.id = hc.habit_id 
    AND hc.completion_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    AND hc.completion_date <= CURDATE()
WHERE h.user_id = ?;

-- Estadísticas del mes
SELECT 
    COUNT(DISTINCT DATE(hc.completion_date)) as active_days,
    COUNT(hc.id) as total_completions,
    COUNT(DISTINCT h.id) as total_habits,
    DAY(LAST_DAY(CURDATE())) as days_in_month,
    ROUND((COUNT(DISTINCT DATE(hc.completion_date)) / DAY(LAST_DAY(CURDATE()))) * 100, 2) as month_completion_rate
FROM habits h
LEFT JOIN habit_completions hc ON h.id = hc.habit_id 
    AND YEAR(hc.completion_date) = YEAR(CURDATE())
    AND MONTH(hc.completion_date) = MONTH(CURDATE())
WHERE h.user_id = ?;

-- Mejor día del mes
SELECT 
    hc.completion_date as date,
    COUNT(hc.id) as completions
FROM habit_completions hc
JOIN habits h ON hc.habit_id = h.id
WHERE h.user_id = ?
    AND YEAR(hc.completion_date) = YEAR(CURDATE())
    AND MONTH(hc.completion_date) = MONTH(CURDATE())
GROUP BY hc.completion_date
ORDER BY completions DESC
LIMIT 1;

-- ============================================
-- CONSULTAS DE RACHAS (STREAKS)
-- ============================================

-- Calcular racha actual de un hábito
SELECT 
    COUNT(*) as current_streak
FROM (
    SELECT 
        completion_date,
        DATE_SUB(completion_date, INTERVAL ROW_NUMBER() OVER (ORDER BY completion_date DESC) DAY) as grp
    FROM habit_completions
    WHERE habit_id = ?
        AND completion_date <= CURDATE()
    ORDER BY completion_date DESC
) t
GROUP BY grp
ORDER BY grp DESC
LIMIT 1;

-- Racha promedio de todos los hábitos
SELECT 
    AVG(streak) as average_streak
FROM (
    SELECT 
        h.id,
        COUNT(*) as streak
    FROM habits h
    JOIN habit_completions hc ON h.id = hc.habit_id
    WHERE h.user_id = ?
        AND hc.completion_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY h.id
) streaks;

-- ============================================
-- CONSULTAS DE PERFIL
-- ============================================

-- Obtener perfil completo con objetivos
SELECT 
    up.*,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', pg.id,
            'text', pg.text,
            'color', pg.color
        )
    ) as goals
FROM user_profiles up
LEFT JOIN profile_goals pg ON up.id = pg.user_profile_id
WHERE up.user_id = ?
GROUP BY up.id;

-- ============================================
-- CONSULTAS DE LIMPIEZA Y MANTENIMIENTO
-- ============================================

-- Eliminar sesiones expiradas
DELETE FROM user_sessions 
WHERE expires_at < NOW();

-- Eliminar progreso antiguo (más de 1 año)
DELETE FROM daily_progress 
WHERE progress_date < DATE_SUB(CURDATE(), INTERVAL 1 YEAR);

-- Eliminar completaciones antiguas (más de 1 año)
DELETE FROM habit_completions 
WHERE completion_date < DATE_SUB(CURDATE(), INTERVAL 1 YEAR);

-- ============================================
-- CONSULTAS DE REPORTES
-- ============================================

-- Resumen completo de usuario para exportación
SELECT 
    u.id,
    u.name,
    u.email,
    u.created_at as user_created_at,
    up.full_name,
    up.biography,
    up.timezone,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', h.id,
            'name', h.name,
            'category', h.category,
            'goal', h.goal,
            'description', h.description,
            'created_at', h.created_at,
            'completions', (
                SELECT COUNT(*) 
                FROM habit_completions 
                WHERE habit_id = h.id
            ),
            'total_progress', (
                SELECT SUM(progress_value) 
                FROM daily_progress 
                WHERE habit_id = h.id
            )
        )
    ) as habits
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN habits h ON u.id = h.user_id
WHERE u.id = ?
GROUP BY u.id, up.id;

