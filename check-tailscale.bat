@echo off
echo ================================================
echo       DIAGNOSTICO DE TAILSCALE - CatChat
echo ================================================
echo.

REM Verificar si Tailscale esta instalado
set TAILSCALE_EXE=C:\Program Files\Tailscale\tailscale.exe

if not exist "%TAILSCALE_EXE%" (
    echo [ERROR] Tailscale NO esta instalado en: %TAILSCALE_EXE%
    echo.
    echo Por favor instala Tailscale desde: https://tailscale.com/download
    pause
    exit /b 1
)

echo [OK] Tailscale encontrado en: %TAILSCALE_EXE%
echo.

echo ================================================
echo           ESTADO DE LA CONEXION
echo ================================================
"%TAILSCALE_EXE%" status
echo.

echo ================================================
echo      DISPOSITIVOS EN LA RED TAILSCALE
echo ================================================
echo.
echo Buscando otros dispositivos en tu red Tailscale...
echo.

REM Obtener hostname actual
for /f "tokens=*" %%A in ('hostname') do set CURRENT_HOST=%%A
echo Tu PC: %CURRENT_HOST%
echo.

echo Dispositivos conectados:
echo ------------------------
"%TAILSCALE_EXE%" status | findstr /v "OFFLINE" | findstr "100."
echo.

echo ================================================
echo         ESTADO DE TAILSCALE FUNNEL
echo ================================================
"%TAILSCALE_EXE%" funnel status
echo.

echo ================================================
echo                  RESUMEN
echo ================================================
echo.
echo 1. Si ves otros dispositivos arriba, la deteccion automatica deberia funcionar
echo 2. Si NO ves otros dispositivos, verifica que:
echo    - Ambos PCs esten conectados a la misma red Tailscale (misma cuenta)
echo    - Ambos PCs tengan Tailscale activo (no OFFLINE)
echo 3. El PC que inicie primero sera el SERVIDOR
echo 4. El PC que inicie despues detectara al primero y sera CLIENTE
echo.
echo ================================================
pause
