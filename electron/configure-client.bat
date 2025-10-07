@echo off
echo ========================================
echo    CONFIGURAR PC COMO CLIENTE
echo ========================================
echo.

echo Este script configurara este PC para conectarse
echo al servidor principal de CatChat.
echo.

set /p SERVER_URL="Ingresa la URL del servidor (ej: https://pc.tail1e7f42.ts.net): "

if "%SERVER_URL%"=="" (
    echo Error: Debes ingresar una URL del servidor
    pause
    exit /b 1
)

echo.
echo Configurando como cliente para: %SERVER_URL%
echo.

set CONFIG_DIR=%APPDATA%\CatChat
set CONFIG_FILE=%CONFIG_DIR%\config.json

echo [1] Creando directorio de configuracion...
if not exist "%CONFIG_DIR%" (
    mkdir "%CONFIG_DIR%"
    echo ✓ Directorio creado: %CONFIG_DIR%
) else (
    echo ✓ Directorio ya existe: %CONFIG_DIR%
)

echo.
echo [2] Creando archivo de configuracion...
echo {"mode":"client","serverUrl":"%SERVER_URL%"} > "%CONFIG_FILE%"

if exist "%CONFIG_FILE%" (
    echo ✓ Configuracion creada exitosamente
    echo.
    echo ========================================
    echo           CONFIGURACION COMPLETA
    echo ========================================
    echo.
    echo Este PC ahora se conectara como CLIENTE a:
    echo %SERVER_URL%
    echo.
    echo IMPORTANTE:
    echo 1. Reinicia CatChat para aplicar los cambios
    echo 2. Asegurate de que el servidor este ejecutandose
    echo 3. Ambos usuarios deben estar registrados en el mismo servidor
    echo.
) else (
    echo ✗ Error creando la configuracion
)

echo.
pause
