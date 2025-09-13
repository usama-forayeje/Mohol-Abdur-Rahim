import { create } from "zustand";

export const useShopStore = create((set) => ({
  shops: [],
  setShops: (shops) => set({ shops }),
}));
