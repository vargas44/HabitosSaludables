@echo off
REM Script simplificado de configuración de PostgreSQL para HabitFlow
REM Versión rápida que usa valores por defecto

echo ========================================
echo  Configuracion Rapida - HabitFlow
echo ========================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado
    pause
    exit /b 1
)

REM Verificar PostgreSQL
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL no esta instalado
    pause
    exit /b 1
)

echo [1/4] Instalando dependencias...
call npm install pg
echo.

echo [2/4] Creando config.js...
if not exist "config.js" (
    copy /Y "config.example.js" "config.js" >nul
    echo [OK] config.js creado - Por favor editalo con tus credenciales
) else (
    echo [INFO] config.js ya existe
)
echo.

echo [3/4] Configuracion de base de datos
echo [INFO] Se usaran los valores por defecto:
echo        Usuario PostgreSQL: postgres (contraseña: 1234)
echo        Usuario de la app: habitflow_user
echo        Base de datos: habitflow_db
echo.
set PGPASSWORD=1234

REM Crear script SQL simplificado
echo DO $$ > temp_setup.sql
echo BEGIN >> temp_setup.sql
echo     IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'habitflow_user') THEN >> temp_setup.sql
echo         CREATE USER habitflow_user WITH PASSWORD 'password_segura'; >> temp_setup.sql
echo     END IF; >> temp_setup.sql
echo END >> temp_setup.sql
echo $$; >> temp_setup.sql
echo. >> temp_setup.sql
echo CREATE DATABASE habitflow_db >> temp_setup.sql
echo     WITH OWNER = habitflow_user >> temp_setup.sql
echo     ENCODING = 'UTF8' >> temp_setup.sql
echo     TEMPLATE = template0; >> temp_setup.sql

REM Ejecutar creación de base de datos (ignorar error si ya existe)
set PGPASSWORD=1234
psql -U postgres -f temp_setup.sql 2>nul
del temp_setup.sql 2>nul

REM Otorgar privilegios
set PGPASSWORD=1234
psql -U postgres -d habitflow_db -c "GRANT ALL ON SCHEMA public TO habitflow_user;" 2>nul
psql -U postgres -d habitflow_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO habitflow_user;" 2>nul
psql -U postgres -d habitflow_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO habitflow_user;" 2>nul

echo.
echo [4/4] Creando tablas...
set PGPASSWORD=password_segura
psql -U habitflow_user -d habitflow_db -f schema.sql
echo.

echo ========================================
echo  Configuracion completada!
echo ========================================
echo.
echo IMPORTANTE: Edita config.js y cambia la contraseña por defecto
echo.
pause

