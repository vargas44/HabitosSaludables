# Schema de Base de Datos - HabitFlow

Este documento describe el schema de base de datos para HabitFlow v1.2.

## Descripción General

El schema está diseñado para almacenar todos los datos de la aplicación HabitFlow, incluyendo usuarios, perfiles, hábitos, completaciones y progreso diario.

## Estructura de Tablas

### 1. users
Almacena la información básica de los usuarios.

**Campos:**
- `id` (VARCHAR): Identificador único del usuario
- `name` (VARCHAR): Nombre del usuario
- `email` (VARCHAR): Correo electrónico (único)
- `password` (VARCHAR): Contraseña (debe estar hasheada en producción)
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

**Índices:**
- PRIMARY KEY: id
- UNIQUE: email
- INDEX: email

### 2. user_profiles
Almacena el perfil extendido de cada usuario.

**Campos:**
- `id` (INT): Identificador único del perfil
- `user_id` (VARCHAR): Referencia al usuario (FK)
- `full_name` (VARCHAR): Nombre completo
- `email` (VARCHAR): Email del perfil
- `biography` (TEXT): Biografía del usuario
- `timezone` (VARCHAR): Zona horaria (default: 'America/Mexico_City')
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

**Relaciones:**
- FOREIGN KEY: user_id -> users(id) ON DELETE CASCADE

**Índices:**
- PRIMARY KEY: id
- UNIQUE: user_id (un perfil por usuario)
- INDEX: user_id

### 3. profile_goals
Almacena los objetivos personales de cada usuario.

**Campos:**
- `id` (INT): Identificador único
- `user_profile_id` (INT): Referencia al perfil (FK)
- `text` (VARCHAR): Texto del objetivo
- `color` (VARCHAR): Color del objetivo (blue, green, purple, red, yellow)
- `created_at` (TIMESTAMP): Fecha de creación

**Relaciones:**
- FOREIGN KEY: user_profile_id -> user_profiles(id) ON DELETE CASCADE

**Índices:**
- PRIMARY KEY: id
- INDEX: user_profile_id

### 4. habits
Almacena los hábitos de cada usuario.

**Campos:**
- `id` (VARCHAR): Identificador único del hábito
- `user_id` (VARCHAR): Referencia al usuario (FK)
- `name` (VARCHAR): Nombre del hábito
- `category` (ENUM): Categoría (salud, ejercicio, alimentacion, mental, productividad)
- `goal` (VARCHAR): Meta diaria (ej: "30 minutos")
- `description` (TEXT): Descripción del hábito
- `icon` (VARCHAR): Icono Material Icons
- `color` (VARCHAR): Color del hábito
- `target_value` (INT): Valor objetivo numérico (default: 1)
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

**Relaciones:**
- FOREIGN KEY: user_id -> users(id) ON DELETE CASCADE

**Índices:**
- PRIMARY KEY: id
- INDEX: user_id, category, created_at

### 5. habit_completions
Almacena las fechas en que un hábito fue marcado como completado.

**Campos:**
- `id` (INT): Identificador único
- `habit_id` (VARCHAR): Referencia al hábito (FK)
- `completion_date` (DATE): Fecha de completación
- `created_at` (TIMESTAMP): Fecha de creación del registro

**Relaciones:**
- FOREIGN KEY: habit_id -> habits(id) ON DELETE CASCADE

**Índices:**
- PRIMARY KEY: id
- UNIQUE: (habit_id, completion_date) - Un hábito solo puede completarse una vez por día
- INDEX: habit_id, completion_date

### 6. daily_progress
Almacena el progreso numérico diario de cada hábito.

**Campos:**
- `id` (INT): Identificador único
- `habit_id` (VARCHAR): Referencia al hábito (FK)
- `progress_date` (DATE): Fecha del progreso
- `progress_value` (DECIMAL): Valor del progreso (ej: 31.0 de 50.0)
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

**Relaciones:**
- FOREIGN KEY: habit_id -> habits(id) ON DELETE CASCADE

**Índices:**
- PRIMARY KEY: id
- UNIQUE: (habit_id, progress_date) - Un registro de progreso por hábito por día
- INDEX: habit_id, progress_date

### 7. user_sessions (Opcional)
Almacena las sesiones activas de los usuarios (para autenticación mejorada).

**Campos:**
- `id` (VARCHAR): Identificador único de la sesión
- `user_id` (VARCHAR): Referencia al usuario (FK)
- `token` (VARCHAR): Token de sesión (único)
- `expires_at` (TIMESTAMP): Fecha de expiración
- `created_at` (TIMESTAMP): Fecha de creación

**Relaciones:**
- FOREIGN KEY: user_id -> users(id) ON DELETE CASCADE

**Índices:**
- PRIMARY KEY: id
- UNIQUE: token
- INDEX: user_id, token, expires_at

## Relaciones entre Tablas

```
users
  ├── user_profiles (1:1)
  │     └── profile_goals (1:N)
  ├── habits (1:N)
  │     ├── habit_completions (1:N)
  │     └── daily_progress (1:N)
  └── user_sessions (1:N)
```

## Notas de Implementación

### Seguridad
- Las contraseñas deben estar hasheadas usando bcrypt o similar
- Los tokens de sesión deben ser seguros y aleatorios
- Implementar rate limiting para prevenir ataques de fuerza bruta

### Optimización
- Los índices están diseñados para consultas frecuentes
- Usar particionamiento por fecha en tablas grandes (completions, progress)
- Considerar cache para datos frecuentemente accedidos

### Migración desde LocalStorage
Para migrar datos existentes desde LocalStorage:
1. Exportar datos en JSON desde la aplicación
2. Crear script de migración que lea el JSON
3. Insertar datos en las tablas correspondientes
4. Validar integridad de datos

### Consultas Comunes

**Obtener hábitos de un usuario:**
```sql
SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC;
```

**Obtener progreso del día actual:**
```sql
SELECT h.*, dp.progress_value, dp.progress_date
FROM habits h
LEFT JOIN daily_progress dp ON h.id = dp.habit_id 
  AND dp.progress_date = CURDATE()
WHERE h.user_id = ?;
```

**Obtener completaciones de la semana:**
```sql
SELECT hc.*, h.name
FROM habit_completions hc
JOIN habits h ON hc.habit_id = h.id
WHERE h.user_id = ?
  AND hc.completion_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);
```

**Obtener estadísticas del mes:**
```sql
SELECT 
  COUNT(DISTINCT hc.completion_date) as dias_completados,
  COUNT(hc.id) as total_completaciones,
  AVG(dp.progress_value) as promedio_progreso
FROM habits h
LEFT JOIN habit_completions hc ON h.id = hc.habit_id 
  AND MONTH(hc.completion_date) = MONTH(CURDATE())
LEFT JOIN daily_progress dp ON h.id = dp.habit_id 
  AND MONTH(dp.progress_date) = MONTH(CURDATE())
WHERE h.user_id = ?;
```

## Compatibilidad

Este schema es compatible con:
- MySQL 5.7+
- MariaDB 10.2+
- PostgreSQL (con ajustes menores en tipos de datos)

