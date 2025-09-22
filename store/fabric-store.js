import { create } from "zustand"

export const useFabricStore = create((set) => ({
  fabrics: [],
  selectedFabric: null,

  setFabrics: (fabrics) => set({ fabrics }),
  setSelectedFabric: (fabric) => set({ selectedFabric: fabric }),

  // helper functions
  addFabric: (fabric) => set((state) => ({ fabrics: [...state.fabrics, fabric] })),
  updateFabric: (updated) =>
    set((state) => ({
      fabrics: state.fabrics.map((f) => (f.$id === updated.$id ? updated : f)),
    })),
  deleteFabricFromStore: (id) => set((state) => ({ fabrics: state.fabrics.filter((f) => f.$id !== id) })),

  // Fabric stock  function
  updateFabricStock: (fabricId, quantityChange) =>
    set((state) => ({
      fabrics: state.fabrics.map((fabric) =>
        fabric.$id === fabricId
          ? {
              ...fabric,
              stock_quantity: fabric.stock_quantity + quantityChange,
            }
          : fabric,
      ),
    })),
}))
