# 🔍 Diagnóstico Rápido - CatChat

## Para ver por qué ambos PCs están en modo SERVIDOR

### Paso 1: Abrir la Consola del Navegador

En la aplicación, presiona **F12** o **Ctrl+Shift+I**

### Paso 2: Ejecutar este comando en la consola:

```javascript
await window.electronAPI.getDiagnosticInfo()
```

### Paso 3: Comparte el resultado

El comando mostrará algo como:

```json
{
  "mode": "SERVER",
  "serverMode": true,
  "clientUrl": null,
  "tunnelUrl": null,
  "autoDetected": true,
  "backendPort": 5000,
  "tailscaleInstalled": true,
  "tailscaleStatus": "...",
  "funnelStatus": "..."
}
```

---

## Solución Manual Temporal

### En el PC que quieres como SERVIDOR:

1. Abre la consola (F12)
2. Ejecuta:
```javascript
await window.electronAPI.setServerMode()
```
3. Reinicia la app

### En el PC que quieres como CLIENTE:

1. Primero necesitas la URL del servidor. En el PC servidor ejecuta en consola:
```javascript
await window.electronAPI.getDiagnosticInfo()
```
2. Copia el valor de `tunnelUrl` (ejemplo: `https://pc.tail1e7f42.ts.net`)

3. En el PC cliente, ejecuta:
```javascript
await window.electronAPI.setClientMode('https://TU-URL-AQUI.ts.net')
```
(Reemplaza con la URL real)

4. Reinicia la app

---

## Verificación Rápida de Tailscale

### Ejecuta en una terminal (cmd):

```cmd
"C:\Program Files\Tailscale\tailscale.exe" status
```

Deberías ver:
- Una IP tipo `100.x.x.x` (significa que está conectado)
- Otros dispositivos listados (tu otro PC)

### Verificar Funnel:

```cmd
"C:\Program Files\Tailscale\tailscale.exe" funnel status
```

Si dice "funnel not enabled", ejecuta:

```cmd
"C:\Program Files\Tailscale\tailscale.exe" funnel --set-path=/
"C:\Program Files\Tailscale\tailscale.exe" funnel --bg 5000
```

---

## Si nada funciona:

Ejecuta este archivo: `test-connection.bat` en el PC servidor
