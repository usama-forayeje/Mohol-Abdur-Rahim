import { databases, Query } from "@/appwrite/appwrite";
import { useTailoringStore } from "@/store/tailoring-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ID } from "appwrite";
import { shopService } from "./shop-service";
import { userService } from "./user-service";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TAILORING_ITEMS_COLLECTION_ID || "tailoring_items_collection";

export const tailoringService = {
  async getTailoringItems(shopId = null) {

    if (!DATABASE_ID) {
      throw new Error("NEXT_PUBLIC_APPWRITE_DATABASE_ID environment variable is not set");
    }
    if (!COLLECTION_ID || COLLECTION_ID === "tailoring_items_collection") {
      throw new Error("NEXT_PUBLIC_APPWRITE_TAILORING_ITEMS_COLLECTION_ID environment variable is not set. Please check appwrite/tailoring-collection-setup.js for setup instructions.");
    }

    // If no shopId is provided, return empty array - no items should be visible
    if (!shopId || shopId === "null" || shopId === "undefined" || shopId === "") {
      return [];
    }

    try {
      // Build query to filter by shopId only - using Appwrite Query format
      const queries = [Query.equal("shopId", shopId)];

      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        queries
      );

      return res.documents;

    } catch (err) {
      console.error("Error fetching tailoring items:", err);

      // Handle CORS errors gracefully
      if (err.message?.includes("CORS") || err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        // For development: you can add mock data here to test the UI
        const mockData = [
          {
            $id: "mock_1",
            name: "শার্ট",
            description: "ফুল স্লিভ কটন শার্ট",
            price: 500,
            worker_price: 150,
            shopId: shopId
          },
          {
            $id: "mock_2",
            name: "প্যান্ট",
            description: "কটন প্যান্ট",
            price: 800,
            worker_price: 200,
            shopId: shopId
          }
        ];
        return mockData;
      }

      if (err.message?.includes("Collection with the requested ID could not be found")) {
        throw new Error("Tailoring items collection not found. Please create the collection in Appwrite first. See appwrite/tailoring-collection-setup.js for instructions.");
      }

      // For other errors, return empty array instead of throwing
      // This ensures that if there's any issue, no items from other shops are shown
      return [];
    }
  },

  async createTailoringItem(data) {
    if (!DATABASE_ID) {
      throw new Error("NEXT_PUBLIC_APPWRITE_DATABASE_ID environment variable is not set");
    }
    if (!COLLECTION_ID || COLLECTION_ID === "tailoring_items_collection") {
      throw new Error("NEXT_PUBLIC_APPWRITE_TAILORING_ITEMS_COLLECTION_ID environment variable is not set. Please check appwrite/tailoring-collection-setup.js for setup instructions.");
    }

    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        data
      );
    } catch (err) {
      console.error("Error creating tailoring item:", err);
      if (err.message?.includes("Collection with the requested ID could not be found")) {
        throw new Error("Tailoring items collection not found. Please create the collection in Appwrite first. See appwrite/tailoring-collection-setup.js for instructions.");
      }
      throw err;
    }
  },

  async updateTailoringItem(id, data) {
    if (!DATABASE_ID) {
      throw new Error("NEXT_PUBLIC_APPWRITE_DATABASE_ID environment variable is not set");
    }
    if (!COLLECTION_ID || COLLECTION_ID === "tailoring_items_collection") {
      throw new Error("NEXT_PUBLIC_APPWRITE_TAILORING_ITEMS_COLLECTION_ID environment variable is not set. Please check appwrite/tailoring-collection-setup.js for setup instructions.");
    }

    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id,
        data
      );
    } catch (err) {
      console.error("Error updating tailoring item:", err);
      if (err.message?.includes("Collection with the requested ID could not be found")) {
        throw new Error("Tailoring items collection not found. Please create the collection in Appwrite first. See appwrite/tailoring-collection-setup.js for instructions.");
      }
      throw err;
    }
  },

  async deleteTailoringItem(id) {
    if (!DATABASE_ID) {
      throw new Error("NEXT_PUBLIC_APPWRITE_DATABASE_ID environment variable is not set");
    }
    if (!COLLECTION_ID || COLLECTION_ID === "tailoring_items_collection") {
      throw new Error("NEXT_PUBLIC_APPWRITE_TAILORING_ITEMS_COLLECTION_ID environment variable is not set. Please check appwrite/tailoring-collection-setup.js for setup instructions.");
    }

    try {
      return await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    } catch (err) {
      console.error("Error deleting tailoring item:", err);
      if (err.message?.includes("Collection with the requested ID could not be found")) {
        throw new Error("Tailoring items collection not found. Please create the collection in Appwrite first. See appwrite/tailoring-collection-setup.js for instructions.");
      }
      throw err;
    }
  },
};

// React Query hooks
export function useTailoringItems(shopId = null) {
  const setTailoringItems = useTailoringStore((state) => state.setTailoringItems);

  return useQuery({
    queryKey: ["tailoringItems", shopId],
    queryFn: async () => {
      const items = await tailoringService.getTailoringItems(shopId);

      // Enhance items with shop and user data
      const enhancedItems = await Promise.all(
        items.map(async (item) => {
          try {
            // Fetch shop details
            let shopName = "Unknown Shop";
            let createdByName = "Unknown User";

            if (item.shopId) {
              try {
                const shop = await shopService.getShopById(item.shopId);
                shopName = shop?.name || "Unknown Shop";
              } catch (shopError) {
                console.warn(`Failed to fetch shop ${item.shopId}:`, shopError);
              }
            }

            if (item.createdBy) {
              try {
                const user = await userService.getUserById(item.createdBy);
                createdByName = user?.name || "Unknown User";
              } catch (userError) {
                console.warn(`Failed to fetch user ${item.createdBy}:`, userError);
              }
            }

            return {
              ...item,
              shopName,
              createdByName
            };
          } catch (error) {
            return item;
          }
        })
      );

      return enhancedItems;
    },
    onSuccess: (data) => {
      setTailoringItems(data);
    },
    onError: (error) => {
      // Don't show toast for CORS errors since we're handling them gracefully
      if (!error.message?.includes("CORS") && !error.message?.includes("Failed to fetch")) {
        // toast.error("টেইলারিং আইটেমসমূহ লোড করতে সমস্যা হয়েছে");
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on CORS errors since they won't work without CORS configuration
      if (error.message?.includes("CORS") || error.message?.includes("Failed to fetch")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useCreateTailoringItem() {
  const qc = useQueryClient();
  const addTailoringItem = useTailoringStore((state) => state.addTailoringItem);

  return useMutation({
    mutationFn: tailoringService.createTailoringItem,
    onSuccess: (newItem) => {
      addTailoringItem(newItem);
      qc.invalidateQueries({ queryKey: ["tailoringItems"] });
    },
  });
}

export function useUpdateTailoringItem() {
  const qc = useQueryClient();
  const updateTailoringItem = useTailoringStore((state) => state.updateTailoringItem);

  return useMutation({
    mutationFn: ({ id, data }) => tailoringService.updateTailoringItem(id, data),
    onSuccess: (updated) => {
      updateTailoringItem(updated);
      qc.invalidateQueries({ queryKey: ["tailoringItems"] });
    },
  });
}

export function useDeleteTailoringItem() {
  const qc = useQueryClient();
  const deleteTailoringItemFromStore = useTailoringStore(
    (state) => state.deleteTailoringItemFromStore
  );

  return useMutation({
    mutationFn: tailoringService.deleteTailoringItem,
    onSuccess: (_, id) => {
      deleteTailoringItemFromStore(id);
      qc.invalidateQueries({ queryKey: ["tailoringItems"] });
    },
  });
}