const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando construcción de la aplicación Electron...');

// Función para ejecutar comandos
function runCommand(command, cwd = process.cwd()) {
  console.log(`📦 Ejecutando: ${command}`);
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`);
    process.exit(1);
  }
}

// Función para copiar archivos
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`📄 Copiado: ${src} -> ${dest}`);
}

async function buildApp() {
  try {
    // 1. Instalar dependencias del backend
    console.log('\n📦 Instalando dependencias del backend...');
    runCommand('npm install', './backend');

    // 2. Instalar dependencias del frontend
    console.log('\n📦 Instalando dependencias del frontend...');
    runCommand('npm install', './frontend');

    // 3. Construir el frontend para producción
    console.log('\n🏗️ Construyendo frontend para producción...');
    runCommand('npm run build', './frontend');

    // 4. Instalar dependencias de Electron
    console.log('\n📦 Instalando dependencias de Electron...');
    runCommand('npm install', './electron');

    // 5. Crear directorio de assets si no existe
    const assetsDir = './electron/assets';
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // 6. Crear iconos básicos si no existen
    console.log('\n🎨 Verificando iconos...');
    const iconFiles = [
      { name: 'icon.png', size: '256x256' },
      { name: 'icon.ico', size: '256x256' },
      { name: 'icon.icns', size: '512x512' }
    ];

    // Crear un icono básico usando ImageMagick si está disponible, sino usar un placeholder
    for (const icon of iconFiles) {
      const iconPath = path.join(assetsDir, icon.name);
      if (!fs.existsSync(iconPath)) {
        console.log(`⚠️ Icono ${icon.name} no encontrado, creando placeholder...`);
        // Crear un archivo placeholder (en producción deberías usar iconos reales)
        fs.writeFileSync(iconPath, ''); // Placeholder vacío
      }
    }

    // 7. Crear archivo de licencia
    const licensePath = './electron/LICENSE.txt';
    if (!fs.existsSync(licensePath)) {
      const licenseContent = `MIT License

Copyright (c) 2024 Fullstack Chat App

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
      fs.writeFileSync(licensePath, licenseContent);
    }

    // 8. Construir la aplicación Electron
    console.log('\n🏗️ Construyendo aplicación Electron...');
    runCommand('npm run build-win', './electron');

    console.log('\n✅ ¡Construcción completada exitosamente!');
    console.log('📁 Los archivos de instalación están en: ./electron/dist/');
    
    // Mostrar información sobre los archivos generados
    const distDir = './electron/dist';
    if (fs.existsSync(distDir)) {
      const files = fs.readdirSync(distDir);
      console.log('\n📦 Archivos generados:');
      files.forEach(file => {
        const filePath = path.join(distDir, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`  - ${file} (${size} MB)`);
      });
    }

  } catch (error) {
    console.error('❌ Error durante la construcción:', error);
    process.exit(1);
  }
}

// Ejecutar construcción
buildApp();
