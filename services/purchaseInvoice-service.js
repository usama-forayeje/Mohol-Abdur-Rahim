import { account, databases, storage } from "@/appwrite/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ID, Query } from "appwrite";
import { useInvoiceStore } from "@/store/purchesInvoice-store";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PURCHASE_INVOICES_COLLECTION_ID;
const STORAGE_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID;

export const purchaseInvoiceService = {
  // Get all invoices
  async getInvoices() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.orderDesc("$createdAt"), Query.limit(100)]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  },

  // Create invoice
  async createInvoice(values) {
    try {
      let fileId = null;

      // File upload
      if (values.file && values.file[0]) {
        const uploadedFile = await storage.createFile(
          STORAGE_ID,
          ID.unique(),
          values.file[0]
        );
        fileId = uploadedFile.$id;
      }

      // Get current user
      const user = await account.get();

      return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          invoice_number: values.invoice_number,
          invoice_date: values.invoice_date,
          supplier_name: values.supplier_name,
          total_amount: parseFloat(values.total_amount),
          fileId,
          addedBy: user.$id,
        }
      );
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  },

  // Update invoice - FIXED to handle file updates and delete previous file
  async updateInvoice(id, data, fileInput, previousFileId = null) {
    try {
      let fileId = null;
      
      // Check if a new file was provided
      if (fileInput && fileInput[0]) {
        // Upload new file
        const uploadedFile = await storage.createFile(
          STORAGE_ID,
          ID.unique(),
          fileInput[0]
        );
        fileId = uploadedFile.$id;
        
        // Delete previous file if it exists and a new file is uploaded
        if (previousFileId) {
          try {
            await storage.deleteFile(STORAGE_ID, previousFileId);
          } catch (err) {
            if (err.code !== 404) { // Ignore "not found" errors
              console.error("Error deleting previous file:", err);
            }
          }
        }
      }

      // Prepare update data
      const updateData = {
        invoice_number: data.invoice_number,
        invoice_date: data.invoice_date,
        supplier_name: data.supplier_name,
        total_amount: parseFloat(data.total_amount),
      };

      // Only include fileId if a new file was uploaded
      if (fileId) {
        updateData.fileId = fileId;
      }

      return await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, updateData);
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  },

  // Delete invoice
  async deleteInvoice(id) {
    try {
      return await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    } catch (error) {
      console.error("Error deleting invoice from database:", error);
      throw error;
    }
  },

  // Get file URL
  getFileUrl(fileId) {
    if (!fileId) return null;
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
  },
};

// Fetch invoices + Store এ save
export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const data = await purchaseInvoiceService.getInvoices();

      // Store এ invoices set করি
      useInvoiceStore.getState().setInvoices(data);

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create invoice + Store এ add
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseInvoiceService.createInvoice,

    onMutate: async (newInvoice) => {
      // Optimistic update - Store এ immediately add করি
      const tempId = `temp_${Date.now()}`;
      const optimisticInvoice = {
        $id: tempId,
        invoice_number: newInvoice.invoice_number,
        invoice_date: newInvoice.invoice_date,
        supplier_name: newInvoice.supplier_name,
        total_amount: parseFloat(newInvoice.total_amount),
        fileId: null,
        addedBy: null,
        $createdAt: new Date().toISOString(),
      };

      useInvoiceStore.getState().addInvoice(optimisticInvoice);

      return { tempId };
    },

    onSuccess: (newInvoice, variables, context) => {
      // Remove temporary invoice and add real one
      useInvoiceStore.getState().removeInvoice(context.tempId);
      useInvoiceStore.getState().addInvoice(newInvoice);

      // Invalidate query
      queryClient.invalidateQueries(["invoices"]);
    },

    onError: (error, variables, context) => {
      // Remove temporary invoice on error
      if (context?.tempId) {
        useInvoiceStore.getState().removeInvoice(context.tempId);
      }
    },
  });
}

// Update invoice + Store এ update - FIXED to handle file updates and previous file deletion
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, file, previousFileId }) =>
      purchaseInvoiceService.updateInvoice(id, data, file, previousFileId),

    onMutate: async ({ id, data, file, previousFileId }) => {
      // Optimistic update - Store এ immediately update করি
      const currentInvoices = useInvoiceStore.getState().invoices;
      const existingInvoice = currentInvoices.find((inv) => inv.$id === id);

      if (existingInvoice) {
        const updatedInvoice = {
          ...existingInvoice,
          invoice_number: data.invoice_number,
          invoice_date: data.invoice_date,
          supplier_name: data.supplier_name,
          total_amount: parseFloat(data.total_amount),
        };

        useInvoiceStore.getState().updateInvoice(updatedInvoice);
      }

      return { previousInvoice: existingInvoice };
    },

    onSuccess: (updatedInvoice) => {
      // Real data দিয়ে store update করি
      useInvoiceStore.getState().updateInvoice(updatedInvoice);

      // Invalidate query
      queryClient.invalidateQueries(["invoices"]);
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousInvoice) {
        useInvoiceStore.getState().updateInvoice(context.previousInvoice);
      }
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoice) => {
      // Delete file first
      if (invoice.fileId) {
        try {
          await storage.deleteFile(STORAGE_ID, invoice.fileId);
        } catch (err) {
          if (err.code === 404) {
            console.warn("File not found, skipping storage delete.");
          } else {
            throw err;
          }
        }
      }
      // Delete from database
      return purchaseInvoiceService.deleteInvoice(invoice.$id);
    },
    onMutate: (invoice) => {
      useInvoiceStore.getState().removeInvoice(invoice.$id);
      return { deletedInvoice: invoice };
    },
    onSuccess: () => queryClient.invalidateQueries(["invoices"]),
    onError: (error, invoice, context) => {
      if (context?.deletedInvoice)
        useInvoiceStore.getState().addInvoice(context.deletedInvoice);
    },
  });
}