; Script personalizado para el instalador NSIS de CatChat
; Este script se ejecuta durante la instalación

!macro customInstall
  ; Crear reglas de firewall para permitir conexiones
  DetailPrint "Configurando firewall para CatChat..."
  
  ; Permitir la aplicación a través del firewall de Windows
  ExecWait 'netsh advfirewall firewall add rule name="CatChat" dir=in action=allow program="$INSTDIR\CatChat.exe" enable=yes'
  ExecWait 'netsh advfirewall firewall add rule name="CatChat" dir=out action=allow program="$INSTDIR\CatChat.exe" enable=yes'
  
  ; Permitir el puerto del backend (5001)
  ExecWait 'netsh advfirewall firewall add rule name="CatChat Backend" dir=in action=allow protocol=TCP localport=5001'
  
  DetailPrint "Configuración de firewall completada."
!macroend

!macro customUnInstall
  ; Remover reglas de firewall al desinstalar
  DetailPrint "Removiendo reglas de firewall..."
  
  ExecWait 'netsh advfirewall firewall delete rule name="CatChat"'
  ExecWait 'netsh advfirewall firewall delete rule name="CatChat Backend"'
  
  DetailPrint "Reglas de firewall removidas."
!macroend

; Configuración adicional del instalador
!macro customHeader
  !system "echo Preparando instalador de CatChat..."
!macroend

; Mensaje personalizado de bienvenida
!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Bienvenido a CatChat"
  !define MUI_WELCOMEPAGE_TEXT "Esta aplicación te permitirá chatear y hacer videollamadas con tus amigos de forma fácil y segura.$\r$\n$\r$\nCatChat incluye un servidor integrado que se ejecuta automáticamente cuando inicias la aplicación."
!macroend
