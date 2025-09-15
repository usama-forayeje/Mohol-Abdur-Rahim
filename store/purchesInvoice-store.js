import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useInvoiceStore = create(
  devtools(
    (set, get) => ({
      // State
      invoices: [],
      selectedInvoice: null,
      searchQuery: "",
      isImagePreviewOpen: false,
      previewImage: null,

      // Actions
      setInvoices: (invoices) => set({ invoices }, false, "setInvoices"),

      addInvoice: (invoice) =>
        set(
          (state) => ({
            invoices: [invoice, ...state.invoices],
          }),
          false,
          "addInvoice"
        ),

      updateInvoice: (updatedInvoice) =>
        set(
          (state) => ({
            invoices: state.invoices.map((invoice) =>
              invoice.$id === updatedInvoice.$id ? updatedInvoice : invoice
            ),
          }),
          false,
          "updateInvoice"
        ),

      removeInvoice: (id) =>
        set(
          (state) => ({
            invoices: state.invoices.filter((invoice) => invoice.$id !== id),
            selectedInvoice:
              state.selectedInvoice?.$id === id ? null : state.selectedInvoice,
          }),
          false,
          "removeInvoice"
        ),

      setSelectedInvoice: (invoice) =>
        set({ selectedInvoice: invoice }, false, "setSelectedInvoice"),

      clearSelectedInvoice: () =>
        set({ selectedInvoice: null }, false, "clearSelectedInvoice"),

      setSearchQuery: (query) =>
        set({ searchQuery: query }, false, "setSearchQuery"),

      // Image preview actions
      openImagePreview: (imageUrl) =>
        set(
          {
            isImagePreviewOpen: true,
            previewImage: imageUrl,
          },
          false,
          "openImagePreview"
        ),

      closeImagePreview: () =>
        set(
          {
            isImagePreviewOpen: false,
            previewImage: null,
          },
          false,
          "closeImagePreview"
        ),

      // Utility functions
      getInvoiceById: (id) => {
        const state = get();
        return state.invoices.find((invoice) => invoice.$id === id);
      },

      getFilteredInvoices: (searchTerm = "") => {
        const state = get();
        const query = searchTerm || state.searchQuery;

        if (!query) return state.invoices;

        return state.invoices.filter(
          (invoice) =>
            invoice.invoice_number
              ?.toLowerCase()
              .includes(query.toLowerCase()) ||
            invoice.supplier_name?.toLowerCase().includes(query.toLowerCase())
        );
      },

      getTotalAmount: () => {
        const state = get();
        return state.invoices.reduce(
          (total, invoice) => total + (parseFloat(invoice.total_amount) || 0),
          0
        );
      },

      clearAll: () =>
        set(
          {
            invoices: [],
            selectedInvoice: null,
            searchQuery: "",
            isImagePreviewOpen: false,
            previewImage: null,
          },
          false,
          "clearAll"
        ),
    }),
    {
      name: "invoice-store",
      version: 1,
    }
  )
);
