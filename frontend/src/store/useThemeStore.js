import { create } from "zustand";
import { useCustomThemeStore } from "./useCustomThemeStore";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
    
    // Si es un tema personalizado, aplicarlo
    if (theme.startsWith('custom-')) {
      const customThemeStore = useCustomThemeStore.getState();
      customThemeStore.applyCustomTheme(theme);
    } else {
      // Limpiar variables CSS personalizadas para temas predefinidos
      const root = document.documentElement;
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-content');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--secondary-content');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-content');
      root.style.removeProperty('--neutral');
      root.style.removeProperty('--neutral-content');
      root.style.removeProperty('--base-100');
      root.style.removeProperty('--base-200');
      root.style.removeProperty('--base-300');
      root.style.removeProperty('--base-content');
      root.style.removeProperty('--info');
      root.style.removeProperty('--success');
      root.style.removeProperty('--warning');
      root.style.removeProperty('--error');
    }
  },
}));
