# Servidor Backend HabitFlow

Este servidor conecta el frontend de HabitFlow con la base de datos PostgreSQL.

## 🚀 Inicio Rápido

### 1. Iniciar el servidor

**Opción A: Usando el script batch (Windows)**
```bash
START_SERVER.bat
```

**Opción B: Usando npm**
```bash
npm start
```

**Opción C: Manualmente**
```bash
node server.js
```

El servidor se iniciará en `http://localhost:3000`

### 2. Verificar que funciona

Abre tu navegador y visita: `http://localhost:3000/api/statistics`

Deberías ver una respuesta JSON (aunque falle por falta de autenticación, eso es normal).

## 📡 Endpoints de la API

### Autenticación

- **POST** `/api/auth/register` - Registrar nuevo usuario
- **POST** `/api/auth/login` - Iniciar sesión

### Hábitos

- **GET** `/api/habits` - Obtener todos los hábitos del usuario
- **POST** `/api/habits` - Crear nuevo hábito
- **PUT** `/api/habits/:id` - Actualizar hábito
- **DELETE** `/api/habits/:id` - Eliminar hábito

### Completaciones

- **POST** `/api/habits/:id/complete` - Marcar hábito como completado
- **DELETE** `/api/habits/:id/complete` - Desmarcar completación

### Progreso

- **POST** `/api/habits/:id/progress` - Registrar progreso diario

### Estadísticas

- **GET** `/api/statistics` - Obtener estadísticas del usuario

### Perfil

- **GET** `/api/profile` - Obtener perfil del usuario
- **PUT** `/api/profile` - Actualizar perfil

## 🔧 Configuración

El servidor usa la configuración de `database/config.js`. Asegúrate de que:

1. PostgreSQL esté corriendo
2. La base de datos `habitflow_db` exista
3. Las credenciales en `database/config.js` sean correctas

## 📝 Notas Importantes

- **Autenticación**: Actualmente el servidor usa el header `user-id` para identificar al usuario. En producción, deberías usar JWT tokens.
- **Contraseñas**: Las contraseñas se guardan en texto plano. En producción, deben estar hasheadas (bcrypt).
- **CORS**: El servidor permite peticiones desde cualquier origen. En producción, configura CORS apropiadamente.

## 🐛 Solución de Problemas

### El servidor no inicia

1. Verifica que PostgreSQL esté corriendo
2. Verifica las credenciales en `database/config.js`
3. Verifica que el puerto 3000 no esté en uso

### Error de conexión a la base de datos

1. Ejecuta `node database/test-database.js` para probar la conexión
2. Verifica que la base de datos exista: `psql -U habitflow_user -d habitflow_db`

### El frontend no se conecta

1. Asegúrate de que el servidor esté corriendo
2. Verifica que la URL en `js/api.js` sea correcta (`http://localhost:3000/api`)
3. Abre la consola del navegador (F12) para ver errores

## 📚 Próximos Pasos

Para conectar completamente el frontend con el backend:

1. Modifica `js/auth.js` para usar `api.login()` y `api.register()` en lugar de LocalStorage
2. Modifica `js/habits.js` para usar los métodos de la API
3. Actualiza las otras páginas para usar la API

El archivo `js/api.js` ya contiene todos los métodos necesarios.

