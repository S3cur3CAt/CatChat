import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useMessageStyleStore = create(
  persist(
    (set, get) => ({
      // Configuración de colores de mensajes
      messageColors: {
        sent: {
          background: "#3b82f6",
          text: "#ffffff",
          border: "transparent"
        },
        received: {
          background: "#f1f5f9", // base-200 por defecto
          text: "#1e293b",
          border: "transparent"
        }
      },
      
      // Configuración de estilos adicionales
      messageStyles: {
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "400",
        padding: "12px",
        shadow: "sm",
        enableBackground: true // Nueva opción para habilitar/deshabilitar background
      },

      // Configuración de efectos adicionales por tipo de mensaje
      messageGlow: {
        sent: false,
        received: false,
      },
      
      // Actualizar color de mensaje enviado
      updateSentMessageColor: (colorType, value) => {
        set((state) => ({
          messageColors: {
            ...state.messageColors,
            sent: {
              ...state.messageColors.sent,
              [colorType]: value
            }
          }
        }));
      },
      
      // Actualizar color de mensaje recibido
      updateReceivedMessageColor: (colorType, value) => {
        set((state) => ({
          messageColors: {
            ...state.messageColors,
            received: {
              ...state.messageColors.received,
              [colorType]: value
            }
          }
        }));
      },
      
      // Actualizar estilo de mensaje
      updateMessageStyle: (styleType, value) => {
        set((state) => ({
          messageStyles: {
            ...state.messageStyles,
            [styleType]: value
          }
        }));
      },

      // Actualizar efecto glow por tipo de mensaje
      updateMessageGlow: (type, value) => {
        set((state) => ({
          messageGlow: {
            ...state.messageGlow,
            [type]: value,
          }
        }));
      },
      
      // Resetear a valores por defecto
      resetMessageStyles: () => {
        set({
          messageColors: {
            sent: {
              background: "#3b82f6",
              text: "#ffffff",
              border: "transparent"
            },
            received: {
              background: "#f1f5f9",
              text: "#1e293b",
              border: "transparent"
            }
          },
          messageStyles: {
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "400",
            padding: "12px",
            shadow: "sm",
            enableBackground: true
          },
          messageGlow: {
            sent: false,
            received: false,
          }
        });
      },
      
      // Aplicar estilos personalizados al DOM
      applyMessageStyles: () => {
        const { messageColors, messageStyles } = get();
        const root = document.documentElement;
        
        // Variables CSS para mensajes enviados
        root.style.setProperty('--message-sent-bg', messageColors.sent.background);
        root.style.setProperty('--message-sent-text', messageColors.sent.text);
        root.style.setProperty('--message-sent-border', messageColors.sent.border);
        
        // Variables CSS para mensajes recibidos
        root.style.setProperty('--message-received-bg', messageColors.received.background);
        root.style.setProperty('--message-received-text', messageColors.received.text);
        root.style.setProperty('--message-received-border', messageColors.received.border);
        
        // Variables CSS para estilos generales
        root.style.setProperty('--message-border-radius', messageStyles.borderRadius);
        root.style.setProperty('--message-font-size', messageStyles.fontSize);
        root.style.setProperty('--message-padding', messageStyles.padding);
      },
      
      // Obtener estilos CSS para aplicar directamente
      getMessageStyle: (type) => {
        const { messageColors, messageStyles, messageGlow } = get();
        const colors = messageColors[type];

        return {
          backgroundColor: messageStyles.enableBackground ? colors.background : 'transparent',
          color: colors.text,
          borderColor: colors.border,
          borderRadius: messageStyles.borderRadius,
          fontSize: messageStyles.fontSize,
          fontWeight: messageStyles.fontWeight,
          padding: messageStyles.padding,
          border: colors.border !== 'transparent' ? `1px solid ${colors.border}` : 'none',
          textShadow: messageGlow[type]
            ? `0 0 6px ${colors.text}80, 0 0 12px ${colors.text}60`
            : 'none'
        };
      }
    }),
    {
      name: "message-style-storage",
      partialize: (state) => ({
        messageColors: state.messageColors,
        messageStyles: state.messageStyles,
        messageGlow: state.messageGlow
      })
    }
  )
);
