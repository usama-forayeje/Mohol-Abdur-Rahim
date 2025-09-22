import { databases, ID, Query } from "@/appwrite/appwrite";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const CUSTOMERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_CUSTOMERS_COLLECTION_ID;

export const customerService = {
  async getCustomers() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        [Query.orderDesc("$createdAt"), Query.limit(1000)]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw new Error("গ্রাহকদের তথ্য লোড করতে সমস্যা হয়েছে");
    }
  },

  async createCustomer(data) {
    try {
      // Check if customer with same phone already exists
      const existingCustomers = await databases.listDocuments(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        [Query.equal("phone", data.phone), Query.limit(1)]
      );

      if (existingCustomers.documents.length > 0) {
        throw new Error("এই ফোন নম্বরের গ্রাহক ইতিমধ্যে আছে");
      }

      const newCustomer = await databases.createDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        ID.unique(),
        {
          name: data.name,
          phone: data.phone,
          address: data.address || "",
          // Remove relationship fields from create - they will be set automatically
        }
      );

      return newCustomer;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw new Error(error.message || "নতুন গ্রাহক তৈরি করতে সমস্যা হয়েছে");
    }
  },

  async updateCustomer(customerId, data) {
    try {
      const updatedCustomer = await databases.updateDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        customerId,
        {
          name: data.name,
          phone: data.phone,
          address: data.address || "",
          // Don't update relationship fields directly
        }
      );
      return updatedCustomer;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw new Error("গ্রাহকের তথ্য আপডেট করতে সমস্যা হয়েছে");
    }
  },

  async deleteCustomer(customerId) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        customerId
      );
      return { success: true };
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw new Error("গ্রাহক মুছে ফেলতে সমস্যা হয়েছে");
    }
  },

  async getCustomer(customerId) {
    try {
      const customer = await databases.getDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        customerId
      );
      return customer;
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw new Error("গ্রাহকের তথ্য লোড করতে সমস্যা হয়েছে");
    }
  },
};

// ================= React Query Hooks =================

export const customerKeys = {
  all: ["customers"],
  lists: () => [...customerKeys.all, "list"],
  list: (filters) => [...customerKeys.lists(), filters],
  details: () => [...customerKeys.all, "detail"],
  detail: (id) => [...customerKeys.details(), id],
};

export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: customerService.getCustomers,
  });
}

export function useCustomer(customerId) {
  return useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: () => customerService.getCustomer(customerId),
    enabled: !!customerId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerService.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, data }) =>
      customerService.updateCustomer(customerId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(data.$id),
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerService.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
