import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useMessageHoverBackgroundStore = create(
  persist(
    (set) => ({
      selectedHoverBackground: "none",
      isUpdating: false,

      setSelectedHoverBackground: async (backgroundId) => {
        set({ isUpdating: true });
        try {
          // Simular delay de actualización
          await new Promise(resolve => setTimeout(resolve, 300));
          set({ selectedHoverBackground: backgroundId });
        } finally {
          set({ isUpdating: false });
        }
      },
    }),
    {
      name: "message-hover-background-storage",
    }
  )
);
