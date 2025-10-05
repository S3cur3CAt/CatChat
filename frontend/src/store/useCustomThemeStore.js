import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCustomThemeStore = create(
  persist(
    (set, get) => ({
      // Temas personalizados guardados
      customThemes: {},
      
      // Tema personalizado en edición
      currentCustomTheme: {
        name: "",
        colors: {
          primary: "#3b82f6",
          primaryContent: "#ffffff",
          secondary: "#64748b",
          secondaryContent: "#ffffff",
          accent: "#f59e0b",
          accentContent: "#000000",
          neutral: "#374151",
          neutralContent: "#ffffff",
          base100: "#ffffff",
          base200: "#f8fafc",
          base300: "#e2e8f0",
          baseContent: "#1f2937",
          info: "#0ea5e9",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        }
      },
      
      // Actualizar color del tema en edición
      updateThemeColor: (colorKey, value) => {
        set((state) => ({
          currentCustomTheme: {
            ...state.currentCustomTheme,
            colors: {
              ...state.currentCustomTheme.colors,
              [colorKey]: value
            }
          }
        }));
      },
      
      // Actualizar nombre del tema
      updateThemeName: (name) => {
        set((state) => ({
          currentCustomTheme: {
            ...state.currentCustomTheme,
            name
          }
        }));
      },
      
      // Guardar tema personalizado
      saveCustomTheme: () => {
        const { currentCustomTheme } = get();
        if (!currentCustomTheme.name.trim()) {
          throw new Error("Theme needs a name");
        }
        
        const themeId = `custom-${currentCustomTheme.name.toLowerCase().replace(/\s+/g, '-')}`;
        
        set((state) => ({
          customThemes: {
            ...state.customThemes,
            [themeId]: {
              ...currentCustomTheme,
              id: themeId,
              createdAt: new Date().toISOString()
            }
          }
        }));
        
        return themeId;
      },
      
      // Eliminar tema personalizado
      deleteCustomTheme: (themeId) => {
        set((state) => {
          const newCustomThemes = { ...state.customThemes };
          delete newCustomThemes[themeId];
          return { customThemes: newCustomThemes };
        });
      },
      
      // Cargar tema para editar
      loadThemeForEdit: (themeId) => {
        const { customThemes } = get();
        const theme = customThemes[themeId];
        if (theme) {
          set({
            currentCustomTheme: { ...theme }
          });
        }
      },
      
      // Resetear tema en edición
      resetCurrentTheme: () => {
        set({
          currentCustomTheme: {
            name: "",
            colors: {
              primary: "#3b82f6",
              primaryContent: "#ffffff",
              secondary: "#64748b",
              secondaryContent: "#ffffff",
              accent: "#f59e0b",
              accentContent: "#000000",
              neutral: "#374151",
              neutralContent: "#ffffff",
              base100: "#ffffff",
              base200: "#f8fafc",
              base300: "#e2e8f0",
              baseContent: "#1f2937",
              info: "#0ea5e9",
              success: "#10b981",
              warning: "#f59e0b",
              error: "#ef4444",
            }
          }
        });
      },
      
      // Aplicar tema personalizado al DOM
      applyCustomTheme: (themeId) => {
        const { customThemes } = get();
        const theme = customThemes[themeId];
        if (!theme) return;
        
        const root = document.documentElement;
        const colors = theme.colors;
        
        // Aplicar variables CSS personalizadas
        root.style.setProperty('--primary', colors.primary);
        root.style.setProperty('--primary-content', colors.primaryContent);
        root.style.setProperty('--secondary', colors.secondary);
        root.style.setProperty('--secondary-content', colors.secondaryContent);
        root.style.setProperty('--accent', colors.accent);
        root.style.setProperty('--accent-content', colors.accentContent);
        root.style.setProperty('--neutral', colors.neutral);
        root.style.setProperty('--neutral-content', colors.neutralContent);
        root.style.setProperty('--base-100', colors.base100);
        root.style.setProperty('--base-200', colors.base200);
        root.style.setProperty('--base-300', colors.base300);
        root.style.setProperty('--base-content', colors.baseContent);
        root.style.setProperty('--info', colors.info);
        root.style.setProperty('--success', colors.success);
        root.style.setProperty('--warning', colors.warning);
        root.style.setProperty('--error', colors.error);
        
        // Establecer atributo data-theme
        root.setAttribute('data-theme', themeId);
      },
      
      // Previsualizar tema temporal
      previewTheme: () => {
        const { currentCustomTheme } = get();
        const root = document.documentElement;
        const colors = currentCustomTheme.colors;
        
        // Aplicar variables CSS temporalmente
        root.style.setProperty('--primary', colors.primary);
        root.style.setProperty('--primary-content', colors.primaryContent);
        root.style.setProperty('--secondary', colors.secondary);
        root.style.setProperty('--secondary-content', colors.secondaryContent);
        root.style.setProperty('--accent', colors.accent);
        root.style.setProperty('--accent-content', colors.accentContent);
        root.style.setProperty('--neutral', colors.neutral);
        root.style.setProperty('--neutral-content', colors.neutralContent);
        root.style.setProperty('--base-100', colors.base100);
        root.style.setProperty('--base-200', colors.base200);
        root.style.setProperty('--base-300', colors.base300);
        root.style.setProperty('--base-content', colors.baseContent);
        root.style.setProperty('--info', colors.info);
        root.style.setProperty('--success', colors.success);
        root.style.setProperty('--warning', colors.warning);
        root.style.setProperty('--error', colors.error);
        
        root.setAttribute('data-theme', 'custom-preview');
      }
    }),
    {
      name: "custom-theme-storage",
      partialize: (state) => ({
        customThemes: state.customThemes
      })
    }
  )
);

export { useCustomThemeStore };
