import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useCatalogStore = create(
  devtools(
    (set, get) => ({
      catalogItems: [],
      selectedCatalogItem: null,
      searchQuery: "",
      isImagePreviewOpen: false,
      previewImages: [],

      setCatalogItems: (items) => set({ catalogItems: items }),

      addCatalogItem: (item) =>
        set((state) => ({
          catalogItems: [item, ...state.catalogItems],
        })),

      updateCatalogItem: (updatedItem) =>
        set((state) => ({
          catalogItems: state.catalogItems.map((item) =>
            item.$id === updatedItem.$id ? updatedItem : item
          ),
        })),

      removeCatalogItem: (id) =>
        set((state) => ({
          catalogItems: state.catalogItems.filter((item) => item.$id !== id),
        })),

      setSelectedCatalogItem: (item) => set({ selectedCatalogItem: item }),

      clearSelectedCatalogItem: () => set({ selectedCatalogItem: null }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      openImagePreview: (imageUrls) =>
        set({
          isImagePreviewOpen: true,
          previewImages: imageUrls,
        }),

      closeImagePreview: () =>
        set({
          isImagePreviewOpen: false,
          previewImages: [],
        }),

      getCatalogItemById: (id) => {
        const state = get();
        return state.catalogItems.find((item) => item.$id === id);
      },

      getFilteredCatalogItems: (searchTerm = "") => {
        const state = get();
        const query = searchTerm || state.searchQuery;

        if (!query) return state.catalogItems;

        return state.catalogItems.filter(
          (item) =>
            item.name?.toLowerCase().includes(query.toLowerCase()) ||
            item.design_code?.toLowerCase().includes(query.toLowerCase()) ||
            item.description?.toLowerCase().includes(query.toLowerCase())
        );
      },

      getCatalogItemsByShop: (shopId) => {
        const state = get();
        return state.catalogItems.filter((item) =>
          item.shopIds?.includes(shopId)
        );
      },

      clearAll: () =>
        set({
          catalogItems: [],
          selectedCatalogItem: null,
          searchQuery: "",
          isImagePreviewOpen: false,
          previewImages: [],
        }),
    }),
    {
      name: "catalog-store",
    }
  )
);
