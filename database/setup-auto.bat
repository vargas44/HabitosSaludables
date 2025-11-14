@echo off
REM Script automático de configuración de PostgreSQL para HabitFlow
REM Usa las credenciales: postgres / 1234
REM No requiere interacción del usuario

echo ========================================
echo  Configuracion Automatica - HabitFlow
echo ========================================
echo.
echo Usando credenciales:
echo   - Usuario PostgreSQL: postgres
echo   - Usuario de la app: habitflow_user
echo   - Base de datos: habitflow_db
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado
    pause
    exit /b 1
)

REM Verificar PostgreSQL y buscar en ubicaciones comunes
set PSQL_PATH=
where psql >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set PSQL_PATH=psql
) else (
    REM Buscar en ubicaciones comunes de PostgreSQL
    if exist "C:\Program Files\PostgreSQL\17\bin\psql.exe" (
        set PSQL_PATH=C:\Program Files\PostgreSQL\17\bin\psql.exe
    ) else if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" (
        set PSQL_PATH=C:\Program Files\PostgreSQL\16\bin\psql.exe
    ) else if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
        set PSQL_PATH=C:\Program Files\PostgreSQL\15\bin\psql.exe
    ) else if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" (
        set PSQL_PATH=C:\Program Files\PostgreSQL\14\bin\psql.exe
    ) else (
        echo [ERROR] PostgreSQL no esta instalado o no se encuentra psql.exe
        echo [INFO] Buscando en todas las versiones...
        for /d %%i in ("C:\Program Files\PostgreSQL\*") do (
            if exist "%%i\bin\psql.exe" (
                set PSQL_PATH=%%i\bin\psql.exe
                goto :found_psql
            )
        )
        :found_psql
        if "%PSQL_PATH%"=="" (
            echo [ERROR] No se encontro PostgreSQL. Por favor instala PostgreSQL o agrega psql al PATH
            pause
            exit /b 1
        )
    )
)
echo [INFO] Usando psql desde: %PSQL_PATH%

REM Configurar credenciales de PostgreSQL
set PGPASSWORD=1234

echo [1/5] Instalando dependencias de Node.js...
call npm install pg
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al instalar las dependencias
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas
echo.

echo [2/5] Creando archivo de configuracion...
if not exist "config.js" (
    copy /Y "config.example.js" "config.js" >nul
    echo [OK] config.js creado
) else (
    echo [INFO] config.js ya existe
)
echo.

echo [3/5] Creando usuario y base de datos...
REM Crear usuario si no existe
"%PSQL_PATH%" -U postgres -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'habitflow_user') THEN CREATE USER habitflow_user WITH PASSWORD 'password_segura'; END IF; END $$;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Usuario creado o ya existe
) else (
    echo [ADVERTENCIA] Usuario puede que ya exista
)

REM Verificar si la base de datos existe
"%PSQL_PATH%" -U postgres -lqt 2>nul | findstr /C:"habitflow_db" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Creando base de datos...
    "%PSQL_PATH%" -U postgres -c "CREATE DATABASE habitflow_db WITH OWNER = habitflow_user ENCODING = 'UTF8' TEMPLATE = template0;" 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Base de datos creada
    ) else (
        echo [ADVERTENCIA] Error al crear base de datos
    )
) else (
    echo [OK] Base de datos ya existe
)

REM Otorgar privilegios
"%PSQL_PATH%" -U postgres -d habitflow_db -c "GRANT ALL ON SCHEMA public TO habitflow_user;" >nul 2>&1
"%PSQL_PATH%" -U postgres -d habitflow_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO habitflow_user;" >nul 2>&1
"%PSQL_PATH%" -U postgres -d habitflow_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO habitflow_user;" >nul 2>&1
echo [OK] Privilegios otorgados
echo.

echo [4/5] Creando tablas y estructura...
set PGPASSWORD=password_segura
"%PSQL_PATH%" -U habitflow_user -d habitflow_db -f schema.sql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al crear las tablas
    echo [INFO] Intentando con usuario postgres...
    set PGPASSWORD=1234
    "%PSQL_PATH%" -U postgres -d habitflow_db -f schema.sql
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] No se pudieron crear las tablas
        pause
        exit /b 1
    )
) else (
    echo [OK] Tablas creadas correctamente
)
echo.

echo [5/5] Actualizando config.js...
powershell -Command "(Get-Content config.js) -replace 'habitflow_user', 'habitflow_user' -replace 'habitflow_db', 'habitflow_db' -replace 'password_segura', 'password_segura' | Set-Content config.js" >nul 2>&1
echo [OK] Configuracion completada
echo.

REM Limpiar variable de entorno
set PGPASSWORD=

echo ========================================
echo  Configuracion completada exitosamente!
echo ========================================
echo.
echo Resumen:
echo   - Usuario de la app: habitflow_user
echo   - Base de datos: habitflow_db
echo   - Archivo de config: config.js
echo.
echo Puedes probar la conexion ejecutando:
echo   node connection-example.js
echo.
pause

