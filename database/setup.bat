@echo off
REM Script de configuración automática de PostgreSQL para HabitFlow
REM Este script automatiza la instalación y configuración inicial

echo ========================================
echo  Configuracion de PostgreSQL - HabitFlow
echo ========================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado o no esta en el PATH
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si PostgreSQL está instalado
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL no esta instalado o no esta en el PATH
    echo Por favor instala PostgreSQL desde https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo [1/5] Instalando dependencias de Node.js...
call npm install pg
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al instalar las dependencias
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas correctamente
echo.

REM Verificar si config.js ya existe
if exist "config.js" (
    echo [ADVERTENCIA] El archivo config.js ya existe
    set /p OVERWRITE="¿Deseas sobrescribirlo? (s/n): "
    if /i not "%OVERWRITE%"=="s" (
        echo [INFO] Saltando creacion de config.js
        goto :skip_config
    )
)

echo [2/5] Creando archivo de configuracion...
copy /Y "config.example.js" "config.js" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo crear config.js
    pause
    exit /b 1
)
echo [OK] Archivo config.js creado
echo [INFO] Por favor edita config.js con tus credenciales antes de continuar
echo.

:skip_config
echo [3/5] Configuracion de la base de datos
echo.
REM Configurar credenciales de PostgreSQL
set PGUSER=postgres
set PGPASSWORD=1234
echo [INFO] Usando credenciales: usuario=postgres
echo.
set /p DB_USER="Nombre de usuario para la base de datos [habitflow_user]: "
if "%DB_USER%"=="" set DB_USER=habitflow_user

set /p DB_NAME="Nombre de la base de datos [habitflow_db]: "
if "%DB_NAME%"=="" set DB_NAME=habitflow_db

set /p DB_PASSWORD="Contrasena para el usuario %DB_USER%: "
if "%DB_PASSWORD%"=="" (
    echo [ERROR] La contrasena no puede estar vacia
    pause
    exit /b 1
)

echo.
echo [INFO] Creando usuario y base de datos...
echo [INFO] Usando credenciales de postgres (1234)

REM Crear un script SQL temporal para la inicialización
echo -- Script temporal de inicializacion > temp_init.sql
echo DO $$ >> temp_init.sql
echo BEGIN >> temp_init.sql
echo     IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '%DB_USER%') THEN >> temp_init.sql
echo         CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%'; >> temp_init.sql
echo     END IF; >> temp_init.sql
echo END >> temp_init.sql
echo $$; >> temp_init.sql
echo. >> temp_init.sql
echo SELECT 'CREATE DATABASE %DB_NAME%' >> temp_init.sql
echo     'WITH OWNER = %DB_USER%' >> temp_init.sql
echo     'ENCODING = ''UTF8''' >> temp_init.sql
echo     'TEMPLATE = template0;' >> temp_init.sql
echo WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '%DB_NAME%')\gexec >> temp_init.sql

REM Ejecutar el script de inicialización
set PGPASSWORD=1234
psql -U postgres -f temp_init.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al crear la base de datos o usuario
    del temp_init.sql 2>nul
    pause
    exit /b 1
)

REM Limpiar archivo temporal
del temp_init.sql 2>nul

REM Otorgar privilegios
echo.
echo [INFO] Otorgando privilegios...
set PGPASSWORD=1234
psql -U postgres -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;" 2>nul
psql -U postgres -d %DB_NAME% -c "GRANT ALL ON SCHEMA public TO %DB_USER%;" 2>nul
psql -U postgres -d %DB_NAME% -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO %DB_USER%;" 2>nul
psql -U postgres -d %DB_NAME% -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO %DB_USER%;" 2>nul

echo [OK] Base de datos y usuario creados correctamente
echo.

echo [4/5] Creando tablas y estructura...
set PGPASSWORD=%DB_PASSWORD%
psql -U %DB_USER% -d %DB_NAME% -f schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al crear las tablas
    echo [INFO] Puedes ejecutar manualmente: psql -U %DB_USER% -d %DB_NAME% -f schema.sql
    pause
    exit /b 1
)
echo [OK] Tablas creadas correctamente
echo.

echo [5/5] Actualizando config.js con las credenciales...
REM Actualizar config.js con las credenciales proporcionadas
powershell -Command "(Get-Content config.js) -replace 'habitflow_user', '%DB_USER%' -replace 'habitflow_db', '%DB_NAME%' -replace 'password_segura', '%DB_PASSWORD%' | Set-Content config.js"
if %ERRORLEVEL% NEQ 0 (
    echo [ADVERTENCIA] No se pudo actualizar config.js automaticamente
    echo [INFO] Por favor edita config.js manualmente con las siguientes credenciales:
    echo         user: %DB_USER%
    echo         database: %DB_NAME%
    echo         password: %DB_PASSWORD%
) else (
    echo [OK] config.js actualizado con las credenciales
)
echo.

echo ========================================
echo  Configuracion completada exitosamente!
echo ========================================
echo.
echo Resumen de la configuracion:
echo   - Usuario: %DB_USER%
echo   - Base de datos: %DB_NAME%
echo   - Archivo de config: config.js
echo.
echo Puedes probar la conexion ejecutando:
echo   node connection-example.js
echo.
pause

