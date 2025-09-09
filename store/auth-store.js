import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      userProfile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      initialized: false,

      // Simple initialization
      initializeAuth: async () => {
        const state = get();
        if (state.initialized) return state.user;

        set({ isLoading: true });

        try {
          const { appwriteService } = await import("@/appwrite/appwrite");
          const user = await appwriteService.getCurrentUser();

          if (user) {
            set({
              user,
              userProfile: user.profile,
              isAuthenticated: true,
              initialized: true,
              isLoading: false,
              error: null,
            });
            return user;
          } else {
            set({
              user: null,
              userProfile: null,
              isAuthenticated: false,
              initialized: true,
              isLoading: false,
              error: null,
            });
            return null;
          }
        } catch (error) {
          console.error("Auth init failed:", error);
          set({
            user: null,
            userProfile: null,
            isAuthenticated: false,
            initialized: true,
            isLoading: false,
            error: error.message,
          });
          return null;
        }
      },

      loginWithGoogle: async () => {
        try {
          set({ isLoading: true });
          const { appwriteService } = await import("@/appwrite/appwrite");
          await appwriteService.loginWithGoogle();
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { appwriteService } = await import("@/appwrite/appwrite");
          await appwriteService.logoutUser();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            userProfile: null,
            isAuthenticated: false,
            initialized: true,
            isLoading: false,
            error: null,
          });
          localStorage.clear();
        }
      },

      // Helper functions
      isAdmin: () => {
        const { userProfile, isAuthenticated } = get();
        return (
          isAuthenticated && ["admin", "superAdmin"].includes(userProfile?.role)
        );
      },

      canAccessDashboard: () => {
        const { userProfile, isAuthenticated } = get();
        return (
          isAuthenticated &&
          ["admin", "superAdmin", "manager"].includes(userProfile?.role)
        );
      },

      hasInitialized: () => get().initialized,
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        userProfile: state.userProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
