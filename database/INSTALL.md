# Instalación y Configuración de PostgreSQL para HabitFlow

## Requisitos Previos

1. **PostgreSQL instalado** (versión 12 o superior)
   - Windows: Descargar desde [postgresql.org](https://www.postgresql.org/download/windows/)
   - Linux: `sudo apt-get install postgresql` (Ubuntu/Debian)
   - macOS: `brew install postgresql`

2. **Node.js y npm** instalados

## Instalación de Dependencias

```bash
npm install pg
```

## Configuración de la Base de Datos

### Paso 1: Crear la Base de Datos y Usuario

Ejecuta el script de inicialización como superusuario:

```bash
psql -U postgres -f database/init.sql
```

O manualmente:

```sql
-- Conectarse como postgres
psql -U postgres

-- Crear usuario
CREATE USER habitflow_user WITH PASSWORD 'tu_password_seguro';

-- Crear base de datos
CREATE DATABASE habitflow_db
    WITH OWNER = habitflow_user
    ENCODING = 'UTF8';

-- Conectarse a la base de datos
\c habitflow_db

-- Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE habitflow_db TO habitflow_user;
GRANT ALL ON SCHEMA public TO habitflow_user;
```

### Paso 2: Crear las Tablas

Ejecuta el schema:

```bash
psql -U habitflow_user -d habitflow_db -f database/schema.sql
```

O desde psql:

```sql
\c habitflow_db
\i database/schema.sql
```

### Paso 3: Configurar las Credenciales

1. Copia el archivo de configuración de ejemplo:
   ```bash
   cp database/config.example.js database/config.js
   ```

2. Edita `database/config.js` con tus credenciales:
   ```javascript
   module.exports = {
       development: {
           host: 'localhost',
           port: 5432,
           user: 'habitflow_user',
           password: 'tu_password_seguro',
           database: 'habitflow_db',
           max: 10,
           idleTimeoutMillis: 30000,
           connectionTimeoutMillis: 2000
       },
       // ...
   };
   ```

## Uso de la Conexión

### Importar el módulo

```javascript
const db = require('./database/database');
```

### Ejecutar Consultas

```javascript
// Consulta simple
const result = await db.query('SELECT * FROM users WHERE id = $1', ['user123']);
console.log(result.rows);

// Transacción
await db.transaction(async (client) => {
    await client.query('INSERT INTO users ...');
    await client.query('INSERT INTO user_profiles ...');
});
```

### Probar la Conexión

```javascript
const db = require('./database/database');

async function test() {
    const connected = await db.testConnection();
    if (connected) {
        console.log('Conexión exitosa!');
    }
    await db.close();
}

test();
```

## Variables de Entorno (Producción)

Para producción, configura las siguientes variables de entorno:

```bash
NODE_ENV=production
DB_HOST=tu_host
DB_PORT=5432
DB_USER=habitflow_user
DB_PASSWORD=tu_password_seguro
DB_NAME=habitflow_db
DB_SSL=true  # Si usas SSL
```

## Solución de Problemas

### Error: "password authentication failed"
- Verifica que el usuario y contraseña sean correctos
- Revisa el archivo `pg_hba.conf` de PostgreSQL

### Error: "database does not exist"
- Asegúrate de haber ejecutado `init.sql` correctamente
- Verifica que el nombre de la base de datos sea correcto

### Error: "relation does not exist"
- Ejecuta `schema.sql` para crear las tablas
- Verifica que estés conectado a la base de datos correcta

### Error: "permission denied"
- Asegúrate de que el usuario tenga los privilegios necesarios
- Ejecuta los comandos GRANT del script `init.sql`

## Ejemplo Completo

Ver `database/connection-example.js` para un ejemplo completo de uso.

