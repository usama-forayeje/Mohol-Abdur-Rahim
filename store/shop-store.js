import { create } from "zustand";

export const useShopStore = create((set) => ({
  shops: [],
  selectedShop: null,
  isLoading: false,
  error: null,

  // Actions
  setShops: (shops) => set({ shops, error: null }),
  addShop: (shop) =>
    set((state) => ({ shops: [shop, ...state.shops], error: null })),
  updateShop: (updatedShop) =>
    set((state) => ({
      shops: state.shops.map((shop) =>
        shop.$id === updatedShop.$id ? updatedShop : shop
      ),
      error: null,
    })),
  deleteShop: (shopId) =>
    set((state) => ({
      shops: state.shops.filter((shop) => shop.$id !== shopId),
      error: null,
    })),

  setSelectedShop: (shop) => set({ selectedShop: shop }),
  clearSelectedShop: () => set({ selectedShop: null }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
