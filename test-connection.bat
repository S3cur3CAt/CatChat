@echo off
echo ================================================
echo     PRUEBA DE CONEXION ENTRE PCs - CatChat
echo ================================================
echo.

REM Verificar Tailscale
set TAILSCALE_EXE=C:\Program Files\Tailscale\tailscale.exe

if not exist "%TAILSCALE_EXE%" (
    echo [ERROR] Tailscale NO instalado
    pause
    exit /b 1
)

echo [1/4] Verificando conexion Tailscale...
"%TAILSCALE_EXE%" status
echo.

echo [2/4] Estado de Funnel...
"%TAILSCALE_EXE%" funnel status
echo.

echo [3/4] Habilitando Funnel automaticamente...
"%TAILSCALE_EXE%" funnel --set-path=/
echo.

echo [4/4] Iniciando Funnel en puerto 5000...
"%TAILSCALE_EXE%" funnel --bg 5000
echo.

echo ================================================
echo Esperando 3 segundos...
timeout /t 3 /nobreak > nul

echo.
echo Estado final de Funnel:
"%TAILSCALE_EXE%" funnel status
echo.
echo ================================================
echo.
echo COMPARTE ESTA URL CON EL OTRO PC:
echo.
for /f "tokens=*" %%A in ('"%TAILSCALE_EXE%" funnel status ^| findstr "https://"') do echo %%A
echo.
echo ================================================
pause
