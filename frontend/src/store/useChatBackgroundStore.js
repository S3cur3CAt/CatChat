import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatBackgroundStore = create(
  persist(
    (set) => ({
      selectedChatBackground: "none",
      isLoading: false,

      setSelectedChatBackground: async (background) => {
        set({ isLoading: true });
        try {
          // Simulate API call or processing
          await new Promise(resolve => setTimeout(resolve, 300));
          set({ selectedChatBackground: background });
        } catch (error) {
          console.error("Failed to update chat background:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "chat-background-store",
      partialize: (state) => ({
        selectedChatBackground: state.selectedChatBackground
      })
    }
  )
);
