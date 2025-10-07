@echo off
echo ================================================
echo      CONECTAR Y CONFIGURAR TAILSCALE
echo ================================================
echo.

set TAILSCALE_EXE=C:\Program Files\Tailscale\tailscale.exe

echo [1/4] Verificando instalacion de Tailscale...
if not exist "%TAILSCALE_EXE%" (
    echo [ERROR] Tailscale NO esta instalado
    echo Descarga desde: https://tailscale.com/download
    pause
    exit /b 1
)
echo [OK] Tailscale instalado

echo.
echo [2/4] Verificando estado de conexion...
"%TAILSCALE_EXE%" status
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Tailscale NO esta conectado!
    echo.
    echo ACCION REQUERIDA:
    echo 1. Busca el icono de Tailscale en la bandeja del sistema
    echo 2. Haz clic derecho y selecciona "Connect"
    echo 3. Inicia sesion si es necesario
    echo 4. Espera a que aparezca una IP 100.x.x.x
    echo 5. Vuelve a ejecutar este script
    echo.
    pause
    exit /b 1
)

echo [OK] Tailscale conectado correctamente!
echo.

echo [3/4] Habilitando Tailscale Funnel...
"%TAILSCALE_EXE%" funnel --set-path=/
if %ERRORLEVEL% NEQ 0 (
    echo [ADVERTENCIA] No se pudo habilitar Funnel automaticamente
    echo Puedes necesitar hacerlo desde: https://login.tailscale.com/admin/settings/funnel
)

echo.
echo [4/4] Iniciando Tailscale Funnel en puerto 5000...
"%TAILSCALE_EXE%" funnel --bg 5000

echo.
echo ================================================
echo Esperando 2 segundos para obtener URL...
timeout /t 2 /nobreak > nul

echo.
echo [RESULTADO] Tu URL publica de Tailscale Funnel:
echo.
"%TAILSCALE_EXE%" funnel status
echo.
echo ================================================
echo.
echo AHORA PUEDES INICIAR LA APLICACION
echo.
pause
