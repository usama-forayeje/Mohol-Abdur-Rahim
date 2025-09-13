import { databases } from "@/appwrite/appwrite";
import { useShopStore } from "@/store/shop-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ID } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SHOPS_COLLECTION_ID;

export const shopService = {
  async getShops() {
    return await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
  },

  async createShop(data) {
    return await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      data,
      [Permission.read(Role.any()), Permission.update(Role.user("current"))]
    );
  },

  async updateShop(id, data) {
    return await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, data);
  },

  async deleteShop(id) {
    return await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
  },
};

// 🔹 Query Hooks
export function useShops() {
  const setShops = useShopStore((state) => state.setShops);
  return useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await shopService.getShops();
      // Zustand store-এ ডেটা সেট করুন
      setShops(res.documents);
      return res.documents;
    },
  });
}

export function useCreateShop() {
  const queryClient = useQueryClient();
  const setShops = useShopStore((state) => state.setShops);
  return useMutation({
    mutationFn: shopService.createShop,
    onSuccess: (newShop) => {
      // React Query invalidate
      queryClient.invalidateQueries({ queryKey: ["shops"] });

      // Zustand store update
      setShops((prev) => [...prev, newShop]);
    },
  });
}

export function useUpdateShop() {
  const queryClient = useQueryClient();
  const setShops = useShopStore((state) => state.setShops);
  return useMutation({
    mutationFn: ({ id, ...data }) => shopService.updateShop(id, data),
    onSuccess: (updatedShop) => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });

      // Zustand store update
      setShops((prev) =>
        prev.map((shop) => (shop.$id === updatedShop.$id ? updatedShop : shop))
      );
    },
  });
}

export function useDeleteShop() {
  const queryClient = useQueryClient();
   const setShops = useShopStore((state) => state.setShops);
  return useMutation({
    mutationFn: (id) => shopService.deleteShop(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });

      // Zustand store update
      setShops((prev) => prev.filter((shop) => shop.$id !== id));
    },
  });
}
