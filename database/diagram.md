# Diagrama de Relaciones - HabitFlow Database

## Diagrama ER (Entidad-Relación)

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email (UNIQUE)  │
│ password        │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:1
         │
         ▼
┌─────────────────┐
│ user_profiles   │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │──┐
│ full_name       │  │
│ email           │  │
│ biography       │  │
│ timezone        │  │
│ created_at      │  │
│ updated_at      │  │
└────────┬────────┘  │
         │           │
         │ 1:N       │
         │           │
         ▼           │
┌─────────────────┐  │
│ profile_goals   │  │
├─────────────────┤  │
│ id (PK)         │  │
│ user_profile_id │──┘
│ text            │
│ color           │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│     users       │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│     habits      │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │──┐
│ name            │  │
│ category        │  │
│ goal            │  │
│ description     │  │
│ icon            │  │
│ color           │  │
│ target_value    │  │
│ created_at      │  │
│ updated_at      │  │
└────────┬────────┘  │
         │           │
         │ 1:N       │
         │           │
         ▼           │
┌─────────────────┐  │
│habit_completions│  │
├─────────────────┤  │
│ id (PK)         │  │
│ habit_id (FK)   │──┘
│ completion_date │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│     habits      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│ daily_progress  │
├─────────────────┤
│ id (PK)         │
│ habit_id (FK)   │──┐
│ progress_date   │  │
│ progress_value  │  │
│ created_at      │  │
│ updated_at      │  │
└─────────────────┘  │
                     │
┌─────────────────┐  │
│     users       │  │
└────────┬────────┘  │
         │           │
         │ 1:N       │
         │           │
         ▼           │
┌─────────────────┐  │
│ user_sessions   │  │
├─────────────────┤  │
│ id (PK)         │  │
│ user_id (FK)     │──┘
│ token (UNIQUE)   │
│ expires_at      │
│ created_at      │
└─────────────────┘
```

## Relaciones Detalladas

### users → user_profiles
- **Tipo**: 1:1 (One-to-One)
- **Relación**: Un usuario tiene un perfil
- **Cascade**: ON DELETE CASCADE

### user_profiles → profile_goals
- **Tipo**: 1:N (One-to-Many)
- **Relación**: Un perfil tiene muchos objetivos
- **Cascade**: ON DELETE CASCADE

### users → habits
- **Tipo**: 1:N (One-to-Many)
- **Relación**: Un usuario tiene muchos hábitos
- **Cascade**: ON DELETE CASCADE

### habits → habit_completions
- **Tipo**: 1:N (One-to-Many)
- **Relación**: Un hábito tiene muchas completaciones (una por día)
- **Restricción**: UNIQUE (habit_id, completion_date)
- **Cascade**: ON DELETE CASCADE

### habits → daily_progress
- **Tipo**: 1:N (One-to-Many)
- **Relación**: Un hábito tiene muchos registros de progreso (uno por día)
- **Restricción**: UNIQUE (habit_id, progress_date)
- **Cascade**: ON DELETE CASCADE

### users → user_sessions
- **Tipo**: 1:N (One-to-Many)
- **Relación**: Un usuario puede tener múltiples sesiones activas
- **Cascade**: ON DELETE CASCADE

## Índices Clave

### users
- PRIMARY: id
- UNIQUE: email
- INDEX: email

### user_profiles
- PRIMARY: id
- UNIQUE: user_id
- INDEX: user_id

### habits
- PRIMARY: id
- INDEX: user_id, category, created_at

### habit_completions
- PRIMARY: id
- UNIQUE: (habit_id, completion_date)
- INDEX: habit_id, completion_date

### daily_progress
- PRIMARY: id
- UNIQUE: (habit_id, progress_date)
- INDEX: habit_id, progress_date

## Flujo de Datos Típico

1. **Registro de Usuario**
   - Insertar en `users`
   - Crear registro en `user_profiles`
   - Insertar objetivos por defecto en `profile_goals`

2. **Crear Hábito**
   - Insertar en `habits`
   - El `target_value` se extrae automáticamente de `goal` o se establece en 1

3. **Actualizar Progreso**
   - Insertar o actualizar en `daily_progress`
   - Si `progress_value >= target_value`, insertar en `habit_completions`

4. **Marcar Completado**
   - Insertar en `habit_completions`
   - Actualizar `daily_progress` con `target_value`

5. **Reiniciar Progreso**
   - Eliminar de `daily_progress` para la fecha
   - Eliminar de `habit_completions` para la fecha

