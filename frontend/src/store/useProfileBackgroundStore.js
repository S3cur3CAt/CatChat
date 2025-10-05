import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useProfileBackgroundStore = create(
  persist(
    (set) => ({
      selectedBackground: "none",
      isUpdating: false,

      setSelectedBackground: (background) => {
        // Guardar solo localmente (persiste automáticamente con zustand/persist)
        set({ selectedBackground: background });
      },

      // Cargar desde usuario autenticado
      loadFromUser: (user) => {
        if (user?.profileBackground) {
          set({ selectedBackground: user.profileBackground });
        }
      },
    }),
    {
      name: "profile-background-storage",
      // Solo persistir localmente como backup
    }
  )
);
