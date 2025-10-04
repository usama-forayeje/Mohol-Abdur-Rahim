import { create } from "zustand"

export const useTailoringStore = create((set) => ({
  tailoringItems: [],
  selectedTailoringItem: null,

  setTailoringItems: (tailoringItems) => set({ tailoringItems }),
  setSelectedTailoringItem: (tailoringItem) => set({ selectedTailoringItem: tailoringItem }),

  // helper functions
  addTailoringItem: (tailoringItem) => set((state) => ({ tailoringItems: [...state.tailoringItems, tailoringItem] })),
  updateTailoringItem: (updated) =>
    set((state) => ({
      tailoringItems: state.tailoringItems.map((item) => (item.$id === updated.$id ? updated : item)),
    })),
  deleteTailoringItemFromStore: (id) => set((state) => ({ tailoringItems: state.tailoringItems.filter((item) => item.$id !== id) })),

  // Refresh tailoring items from database
  refreshTailoringItems: (tailoringItems) => set({ tailoringItems }),

  // Get tailoring item by ID
  getTailoringItemById: (tailoringItemId) => (state) =>
    state.tailoringItems.find((item) => item.$id === tailoringItemId),
}))