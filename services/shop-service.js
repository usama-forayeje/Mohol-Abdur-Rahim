import { databases, ID } from "@/appwrite/appwrite";
import { useShopStore } from "@/store/shop-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SHOPS_COLLECTION_ID;

export const shopService = {
  //  Get all shops
  async getShops() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching shops:", error);
      throw new Error("Failed to load shops. Please try again.");
    }
  },
  //  Get a shop by ID
  async getShopById(shopId) {
    try {
      const shop = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        shopId
      );
      return shop;
    } catch (error) {
      if (error.code === 404) {
        return null;
      }
      console.error(`Error fetching shop ${shopId}:`, error);
      throw new Error("Failed to load shop details.");
    }
  },
  // Create a new shop
  async createShop(data) {
    try {
      const newShop = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        data
      );
      return newShop;
    } catch (error) {
      console.error("Error creating shop:", error);
      throw new Error("Failed to create shop. Please try again.");
    }
  },
  // Update a shop by ID
  async updateShop(id, data) {
    try {
      const updatedShop = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id,
        data
      );
      return updatedShop;
    } catch (error) {
      console.error(`Error updating shop ${id}:`, error);
      throw new Error("Failed to update shop. Please try again.");
    }
  },
  // Delete a shop by ID
  async deleteShop(id) {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      return id;
    } catch (error) {
      console.error(`Error deleting shop ${id}:`, error);
      throw new Error("Failed to delete shop. Please try again.");
    }
  },
  // Get a shop by ID with related transactions and staff details
  async getShopByIdWithDetails(shopId) {
    try {
      const shop = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        shopId,
        [
          Query.select(["*", "transactions.*", "staff.*"]), // Select all fields + relations
          // Query.orderDesc("$createdAt") // Optional: Order transactions if needed
        ]
      );
      return shop;
    } catch (error) {
      console.error(`Error fetching shop with details ${shopId}:`, error);
      throw new Error("Failed to load shop details.");
    }
  },
};

// =================== REACT QUERY HOOKS ====================
// Query Keys
export const shopKeys = {
  all: ["shops"],
  lists: () => [...shopKeys.all, "list"],
  list: (filters) => [...shopKeys.lists(), filters],
  details: () => [...shopKeys.all, "detail"],
  detail: (id) => [...shopKeys.details(), id],
};
// Fetch all shops
export function useShops() {
  const setShops = useShopStore((state) => state.setShops);
  const setLoading = useShopStore((state) => state.setLoading);
  const setError = useShopStore((state) => state.setError);

  return useQuery({
    queryKey: shopKeys.lists(),
    queryFn: async () => {
      setLoading(true);
      try {
        const shops = await shopService.getShops();
        setShops(shops);
        return shops;
      } catch (error) {
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
// Fetch single shop by ID
export function useShop(shopId) {
  const setSelectedShop = useShopStore((state) => state.setSelectedShop);
  return useQuery({
    queryKey: shopKeys.detail(shopId),
    queryFn: () => shopService.getShopById(shopId),
    enabled: !!shopId, // Only fetch if shopId is provided
    onSuccess: (shop) => {
      setSelectedShop(shop);
    },
  });
}
// Create shop mutation hook
export function useCreateShop() {
  const queryClient = useQueryClient();
  const addShop = useShopStore((state) => state.addShop);
  const setError = useShopStore((state) => state.setError);

  return useMutation({
    mutationFn: shopService.createShop,
    onSuccess: (newShop) => {
      // Update Zustand store
      addShop(newShop);
      // Invalidate and refetch shops list
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
    },
    onError: (error) => {
      setError(error.message);
    },
  });
}
// Update shop mutation hook
export function useUpdateShop() {
  const queryClient = useQueryClient();
  const updateShopInStore = useShopStore((state) => state.updateShop);
  const setError = useShopStore((state) => state.setError);

  return useMutation({
    mutationFn: ({ id, data }) => shopService.updateShop(id, data),
    onSuccess: (updatedShop) => {
      // Update Zustand store
      updateShopInStore(updatedShop);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
      queryClient.setQueryData(shopKeys.detail(updatedShop.$id), updatedShop);
    },
    onError: (error) => {
      setError(error.message);
    },
  });
}
// Delete shop mutation hook
export function useDeleteShop() {
  const queryClient = useQueryClient();
  const deleteShopFromStore = useShopStore((state) => state.deleteShop);
  const setError = useShopStore((state) => state.setError);

  return useMutation({
    mutationFn: shopService.deleteShop,
    onSuccess: (_, shopId) => {
      // Update Zustand store
      deleteShopFromStore(shopId);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
      queryClient.removeQueries({ queryKey: shopKeys.detail(shopId) });
    },
    onError: (error) => {
      setError(error.message);
    },
  });
}
//  Fetch single shop by ID with related transactions and staff details
export function useShopWithDetails(shopId) {
  const setSelectedShop = useShopStore((state) => state.setSelectedShop);
  return useQuery({
    queryKey: [...shopKeys.detail(shopId), "with-details"], // Unique key
    queryFn: () => shopService.getShopByIdWithDetails(shopId),
    enabled: !!shopId,
    onSuccess: (shop) => {
      setSelectedShop(shop);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
