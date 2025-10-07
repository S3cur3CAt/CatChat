@echo off
echo ========================================
echo   Fullstack Chat App - Electron
echo ========================================
echo.

echo 🚀 Iniciando aplicacion Electron...
echo.

REM Verificar si Node.js esta instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js no esta instalado
    echo    Descarga Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

REM Cambiar al directorio electron
cd /d "%~dp0electron"

echo 📦 Verificando dependencias de Electron...
if not exist "node_modules" (
    echo 📥 Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ❌ Error instalando dependencias de Electron
        pause
        exit /b 1
    )
)

echo ✅ Dependencias verificadas
echo.

REM Verificar dependencias del backend
echo 📦 Verificando dependencias del backend...
cd /d "%~dp0backend"
if not exist "node_modules" (
    echo 📥 Instalando dependencias del backend...
    npm install
    if errorlevel 1 (
        echo ❌ Error instalando dependencias del backend
        pause
        exit /b 1
    )
)

echo ✅ Backend verificado
echo.

REM Verificar dependencias del frontend
echo 📦 Verificando dependencias del frontend...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo 📥 Instalando dependencias del frontend...
    npm install
    if errorlevel 1 (
        echo ❌ Error instalando dependencias del frontend
        pause
        exit /b 1
    )
)

echo ✅ Frontend verificado
echo.

REM Volver al directorio electron y ejecutar
cd /d "%~dp0electron"

echo 🚀 Iniciando aplicacion...
echo.
echo ⏳ La aplicacion se abrira en unos momentos...
echo 🌐 Se creara automaticamente un tunel publico
echo 📋 Podras compartir la URL con otros usuarios
echo.

npm start

if errorlevel 1 (
    echo.
    echo ❌ Error al iniciar la aplicacion
    echo 💡 Consejos:
    echo    - Verifica tu conexion a internet
    echo    - Asegurate de que el puerto 5001 este libre
    echo    - Revisa los logs para mas detalles
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Aplicacion cerrada correctamente
pause
