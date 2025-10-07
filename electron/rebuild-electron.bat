@echo off
echo ========================================
echo REBUILD ELECTRON WITH LATEST CHANGES
echo ========================================
echo.

echo [1/4] Building frontend...
cd ..\frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)

echo.
echo [2/4] Copying backend files...
cd ..\electron
if exist "dist" rmdir /s /q dist
echo Backend will be copied during Electron build...

echo.
echo [3/4] Building Electron app...
call npm run build-win
if errorlevel 1 (
    echo ERROR: Electron build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo BUILD COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo You can now run: dist\win-unpacked\CatChat.exe
echo.
pause
