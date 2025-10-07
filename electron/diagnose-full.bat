@echo off
echo ========================================
echo DIAGNOSTIC COMPLETO - CONEXION ENTRE PCS
echo ========================================
echo.

echo === INFORMACION DEL PC ===
hostname
echo.

echo === 1. VERIFICANDO TAILSCALE ===
echo [1.1] Estado de Tailscale:
"C:\Program Files\Tailscale\tailscale.exe" status
echo.

echo [1.2] Funnel activo:
"C:\Program Files\Tailscale\tailscale.exe" funnel status
echo.

echo === 2. VERIFICANDO BACKEND LOCAL ===
echo [2.1] Test API local:
curl -s http://localhost:5000/api/auth/test
echo.

echo [2.2] Test Socket.IO local:
curl -s http://localhost:5000/socket.io/
echo.

echo === 3. VERIFICANDO CONECTIVIDAD REMOTA ===
echo [3.1] Ping a URL remota (API):
curl -v https://pc.tail1e7f42.ts.net/api/auth/test 2>&1 | findstr /C:"Connected" /C:"HTTP" /C:"502" /C:"ECONNRESET"
echo.

echo [3.2] Ping a URL remota (Socket.IO):
curl -v https://pc.tail1e7f42.ts.net/socket.io/ 2>&1 | findstr /C:"Connected" /C:"HTTP" /C:"502" /C:"ECONNRESET"
echo.

echo === 4. VERIFICANDO CONFIGURACION GUARDADA ===
set CONFIG_PATH=%APPDATA%\CatChat\config.json
echo Buscando config en: %CONFIG_PATH%
if exist "%CONFIG_PATH%" (
    echo [ENCONTRADO] Contenido:
    type "%CONFIG_PATH%"
) else (
    echo [NO ENCONTRADO] No hay configuracion guardada
)
echo.

echo === 5. VERIFICANDO PROCESOS ACTIVOS ===
echo Procesos Node.js:
tasklist | findstr /I "node.exe"
echo.

echo ========================================
echo DIAGNOSTIC COMPLETADO
echo ========================================
echo.
echo INTERPRETACION:
echo - Si Tailscale status muestra dispositivos: OK
echo - Si Funnel status muestra URL: Servidor activo
echo - Si curl remoto funciona: Conectividad OK
echo - Si curl remoto falla (502/ECONNRESET): Problema de red
echo.
pause
