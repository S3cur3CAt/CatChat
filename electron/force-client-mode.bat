@echo off
echo ========================================
echo FORZAR MODO CLIENTE EN ESTE PC
echo ========================================
echo.

echo Este script configurara este PC como CLIENTE
echo para conectarse a: https://pc.tail1e7f42.ts.net
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
echo {"serverMode":false,"clientUrl":"https://pc.tail1e7f42.ts.net"} > "%CONFIG_FILE%"

if exist "%CONFIG_FILE%" (
    echo ✓ Configuracion creada exitosamente
    echo.
    echo Contenido:
    type "%CONFIG_FILE%"
    echo.
    echo.
    echo ========================================
    echo ✅ CONFIGURACION COMPLETADA
    echo ========================================
    echo.
    echo Este PC ahora se conectara como CLIENTE a:
    echo https://pc.tail1e7f42.ts.net
    echo.
    echo IMPORTANTE:
    echo 1. Asegurate de que el PC servidor este ejecutando CatChat
    echo 2. Verifica que Tailscale Funnel este activo en el servidor
    echo 3. Cierra CatChat si esta abierto
    echo 4. Inicia CatChat nuevamente
    echo.
) else (
    echo ❌ Error al crear configuracion
)

pause
