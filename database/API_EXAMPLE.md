# Ejemplo de API REST para HabitFlow

Este documento muestra ejemplos de endpoints de API REST para interactuar con la base de datos.

## Autenticación

### POST /api/auth/register
Registrar nuevo usuario.

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1234567890",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/login
Iniciar sesión.

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1234567890",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "token": "jwt_token_here"
}
```

## Hábitos

### GET /api/habits
Obtener todos los hábitos del usuario autenticado.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "habits": [
    {
      "id": "habit123",
      "name": "Ejercicio diario",
      "category": "ejercicio",
      "goal": "30 minutos",
      "description": "Hacer ejercicio todos los días",
      "icon": "fitness_center",
      "color": "green",
      "target_value": 30,
      "created_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

### POST /api/habits
Crear nuevo hábito.

**Request:**
```json
{
  "name": "Meditación",
  "category": "mental",
  "goal": "10 minutos",
  "description": "Meditar diariamente",
  "target_value": 10
}
```

**Response:**
```json
{
  "success": true,
  "habit": {
    "id": "habit456",
    "name": "Meditación",
    "category": "mental",
    "goal": "10 minutos",
    "description": "Meditar diariamente",
    "icon": "psychology",
    "color": "purple",
    "target_value": 10,
    "created_at": "2025-11-14T12:00:00Z"
  }
}
```

### PUT /api/habits/:id
Actualizar hábito existente.

**Request:**
```json
{
  "name": "Meditación",
  "category": "mental",
  "goal": "15 minutos",
  "description": "Meditar diariamente",
  "target_value": 15
}
```

### DELETE /api/habits/:id
Eliminar hábito.

**Response:**
```json
{
  "success": true,
  "message": "Hábito eliminado correctamente"
}
```

## Progreso y Completaciones

### POST /api/habits/:id/progress
Actualizar progreso diario de un hábito.

**Request:**
```json
{
  "date": "2025-11-14",
  "value": 5,
  "operation": "add" // "add" o "subtract"
}
```

**Response:**
```json
{
  "success": true,
  "progress": {
    "habit_id": "habit123",
    "progress_date": "2025-11-14",
    "progress_value": 35.0,
    "updated_at": "2025-11-14T15:30:00Z"
  }
}
```

### POST /api/habits/:id/complete
Marcar hábito como completado.

**Request:**
```json
{
  "date": "2025-11-14"
}
```

**Response:**
```json
{
  "success": true,
  "completion": {
    "habit_id": "habit123",
    "completion_date": "2025-11-14"
  }
}
```

### DELETE /api/habits/:id/progress
Reiniciar progreso del día.

**Request:**
```json
{
  "date": "2025-11-14"
}
```

## Perfil

### GET /api/profile
Obtener perfil del usuario autenticado.

**Response:**
```json
{
  "success": true,
  "profile": {
    "full_name": "Juan Pérez",
    "email": "juan@example.com",
    "biography": "Amante de los hábitos saludables",
    "timezone": "America/Argentina/Buenos_Aires",
    "goals": [
      {
        "id": 1,
        "text": "Mejor salud",
        "color": "blue"
      }
    ]
  }
}
```

### PUT /api/profile
Actualizar perfil.

**Request:**
```json
{
  "full_name": "Juan Carlos Pérez",
  "email": "juancarlos@example.com",
  "biography": "Nueva biografía",
  "timezone": "America/Argentina/Buenos_Aires",
  "goals": [
    {
      "text": "Mejor salud",
      "color": "blue"
    },
    {
      "text": "Más productividad",
      "color": "green"
    }
  ]
}
```

## Estadísticas

### GET /api/statistics/day
Obtener estadísticas del día actual.

**Response:**
```json
{
  "success": true,
  "statistics": {
    "date": "2025-11-14",
    "total_habits": 5,
    "completed_today": 3,
    "completion_rate": 60,
    "active_categories": 3
  }
}
```

### GET /api/statistics/week
Obtener estadísticas de la semana.

**Response:**
```json
{
  "success": true,
  "statistics": {
    "week_start": "2025-11-10",
    "week_end": "2025-11-16",
    "days_completed": 5,
    "completion_rate": 71,
    "total_completions": 25,
    "average_daily": 3.57
  }
}
```

### GET /api/statistics/month
Obtener estadísticas del mes.

**Response:**
```json
{
  "success": true,
  "statistics": {
    "month": 11,
    "year": 2025,
    "active_days": 12,
    "completion_rate": 65,
    "total_completions": 78,
    "best_day": {
      "date": "2025-11-10",
      "completions": 5
    }
  }
}
```

## Notas de Implementación

- Todos los endpoints requieren autenticación (excepto register y login)
- Usar JWT para autenticación
- Validar todos los inputs
- Implementar rate limiting
- Usar HTTPS en producción
- Validar permisos (usuarios solo pueden acceder a sus propios datos)

