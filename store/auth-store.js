import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth-service";
import { ROLES } from "@/lib/roles";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      userProfile: null,
      userShops: [],
      selectedShopId: null,
      viewMode: "single-shop",
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),

      setAuth: (user, userProfile, userShops = []) => {
        console.log("🔐 Setting Auth:", {
          user: user?.$id,
          userProfile: userProfile?.name,
          userShopsCount: userShops.length,
          userShops: userShops,
        });

        // Extract shop IDs from user shops
        const shopIds = userShops
          .filter(us => us.status === "active")
          .map(us => {
            if (typeof us.shopId === 'string') return us.shopId;
            if (us.shopId?.$id) return us.shopId.$id;
            if (Array.isArray(us.shopId) && us.shopId.length > 0) {
              return typeof us.shopId[0] === 'string' ? us.shopId[0] : us.shopId[0].$id;
            }
            return null;
          })
          .filter(Boolean);

        // Get user's highest role
        const roles = userShops.map(us => us.role).filter(Boolean);
        const userRole = roles.includes(ROLES.SUPER_ADMIN) ? ROLES.SUPER_ADMIN :
                        roles.includes(ROLES.ADMIN) ? ROLES.ADMIN :
                        roles.includes(ROLES.MANAGER) ? ROLES.MANAGER :
                        roles.includes(ROLES.TAILOR) ? ROLES.TAILOR :
                        roles.includes(ROLES.SALESMAN) ? ROLES.SALESMAN :
                        roles.includes(ROLES.EMBROIDERY_MAN) ? ROLES.EMBROIDERY_MAN :
                        roles.includes(ROLES.STONE_MAN) ? ROLES.STONE_MAN : ROLES.USER;

        // Update user profile with correct role
        const updatedProfile = {
          ...userProfile,
          role: userRole
        };

        // Set first shop as selected if available
        const firstShopId = shopIds[0] || null;

        set({
          user,
          userProfile: updatedProfile,
          userShops,
          selectedShopId: firstShopId,
          viewMode: firstShopId ? "single-shop" : "all-shops",
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
        });

        // Save to localStorage
        if (firstShopId) {
          localStorage.setItem("selectedShopId", firstShopId);
        }
        localStorage.setItem("viewMode", firstShopId ? "single-shop" : "all-shops");
      },

      clearAuth: () => {
        set({
          user: null,
          userProfile: null,
          userShops: [],
          selectedShopId: null,
          viewMode: "single-shop",
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        localStorage.removeItem("selectedShopId");
        localStorage.removeItem("viewMode");
      },

      setError: (error) => set({ error, isLoading: false }),
      clearError: () => set({ error: null }),

      // View Mode Management
      setViewMode: (mode) => {
        set({ viewMode: mode });
        localStorage.setItem("viewMode", mode);
      },

      // Shop selection
      setSelectedShopId: (shopId) => {
        set({ selectedShopId: shopId });
        if (shopId) {
          localStorage.setItem("selectedShopId", shopId);
        }
      },

      // Auth methods
      loginWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null });
          await authService.loginWithGoogle();
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await authService.logout();
          get().clearAuth();
        } catch (error) {
          set({ error: error.message, isLoading: false });
          get().clearAuth();
          throw error;
        }
      },

      // Helper methods
      canAccessDashboard: () => {
        const { userProfile, isAuthenticated } = get();
        return isAuthenticated && userProfile?.role !== ROLES.USER;
      },

      canSwitchShops: () => {
        const { userProfile } = get();
        return [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userProfile?.role);
      },

      canViewAllShops: () => {
        const { userProfile } = get();
        return userProfile?.role === ROLES.SUPER_ADMIN;
      },

      isViewingAllShops: () => {
        return get().viewMode === "all-shops";
      },

      getUserRole: () => {
        const { userProfile, selectedShopId, userShops } = get();
        
        // If user has a specific shop selected, find role for that shop
        if (selectedShopId && userShops.length > 0) {
          const userShop = userShops.find(us => {
            const shopId = typeof us.shopId === 'string' ? us.shopId :
                          us.shopId?.$id || (Array.isArray(us.shopId) && us.shopId[0]?.$id);
            return shopId === selectedShopId && us.status === "active";
          });
          
          if (userShop?.role) {
            return userShop.role;
          }
        }
        
        // Otherwise return the highest role from user profile
        return userProfile?.role || ROLES.USER;
      },

      hasPermission: (permission) => {
        const { getUserRole } = get();
        const role = getUserRole();
        
        // Define permissions for each role
        const permissions = {
          [ROLES.SUPER_ADMIN]: [
            "VIEW_REPORTS", "CREATE_ORDERS", "VIEW_CUSTOMERS", "VIEW_ALL_ORDERS", 
            "MANAGE_FABRICS", "MANAGE_USERS", "MANAGE_SHOPS", "VIEW_FINANCE"
          ],
          [ROLES.ADMIN]: [
            "VIEW_REPORTS", "CREATE_ORDERS", "VIEW_CUSTOMERS", "VIEW_ALL_ORDERS", 
            "MANAGE_FABRICS", "MANAGE_USERS", "VIEW_FINANCE"
          ],
          [ROLES.MANAGER]: [
            "VIEW_REPORTS", "CREATE_ORDERS", "VIEW_CUSTOMERS", "VIEW_ALL_ORDERS", 
            "MANAGE_FABRICS", "VIEW_FINANCE"
          ],
          [ROLES.SALESMAN]: ["CREATE_ORDERS", "VIEW_CUSTOMERS", "SELL_FABRICS"],
          [ROLES.TAILOR]: ["VIEW_OWN_ORDERS", "UPDATE_ORDER_STATUS"],
          [ROLES.EMBROIDERY_MAN]: ["VIEW_OWN_ORDERS", "UPDATE_ORDER_STATUS"],
          [ROLES.STONE_MAN]: ["VIEW_OWN_ORDERS", "UPDATE_ORDER_STATUS"],
          [ROLES.USER]: []
        };

        return permissions[role]?.includes(permission) || false;
      },

      // Get accessible shops for the current user
      getAccessibleShops: (allShops = []) => {
        const { userProfile, userShops } = get();
        
        if (!userProfile) return [];
        
        // SuperAdmin can access all shops
        if (userProfile.role === ROLES.SUPER_ADMIN) {
          return allShops;
        }
        
        // For other users, filter by their assigned shops
        const userShopIds = userShops
          .filter(us => us.status === "active")
          .map(us => {
            if (typeof us.shopId === 'string') return us.shopId;
            if (us.shopId?.$id) return us.shopId.$id;
            if (Array.isArray(us.shopId) && us.shopId.length > 0) {
              return typeof us.shopId[0] === 'string' ? us.shopId[0] : us.shopId[0].$id;
            }
            return null;
          })
          .filter(Boolean);

        return allShops.filter(shop => userShopIds.includes(shop.$id));
      }
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        userProfile: state.userProfile,
        userShops: state.userShops,
        selectedShopId: state.selectedShopId,
        viewMode: state.viewMode,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);