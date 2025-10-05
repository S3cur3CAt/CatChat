@echo off
echo ========================================
echo DIAGNOSTIC: SOCKET CONNECTION STATUS
echo ========================================
echo.

echo [1] Checking if backend is running...
curl -s http://localhost:5000/api/auth/test
if errorlevel 1 (
    echo ERROR: Backend not responding on localhost:5000
) else (
    echo SUCCESS: Backend is running locally
)

echo.
echo [2] Checking Tailscale Funnel status...
"C:\Program Files\Tailscale\tailscale.exe" funnel status

echo.
echo [3] Testing Tailscale URL...
curl -s https://pc.tail1e7f42.ts.net/api/auth/test
if errorlevel 1 (
    echo ERROR: Tailscale URL not responding
) else (
    echo SUCCESS: Tailscale URL is working
)

echo.
echo [4] Checking socket.io endpoint...
curl -s http://localhost:5000/socket.io/
if errorlevel 1 (
    echo ERROR: Socket.IO not responding
) else (
    echo SUCCESS: Socket.IO endpoint available
)

echo.
echo ========================================
echo DIAGNOSTIC COMPLETE
echo ========================================
pause
