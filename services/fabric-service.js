import { databases } from "@/appwrite/appwrite";
import { useFabricStore } from "@/store/fabric-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ID } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FABRICS_COLLECTION_ID;

export const fabricService = {
  async getFabrics() {
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
      return res.documents;
    } catch (err) {
      console.error("Error fetching fabrics:", err);
      throw err;
    }
  },

  async createFabric(data) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        data
      );
    } catch (err) {
      console.error("Error creating fabric:", err);
      throw err;
    }
  },

  async updateFabric(id, data) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id,
        data
      );
    } catch (err) {
      console.error("Error updating fabric:", err);
      throw err;
    }
  },

  async deleteFabric(id) {
    try {
      return await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    } catch (err) {
      console.error("Error deleting fabric:", err);
      throw err;
    }
  },
};

// React Query hooks
export function useFabrics() {
  const setFabrics = useFabricStore((state) => state.setFabrics);

  return useQuery({
    queryKey: ["fabrics"],
    queryFn: fabricService.getFabrics,
    onSuccess: (data) => {
      setFabrics(data);
    },
  });
}

export function useCreateFabric() {
  const qc = useQueryClient();
  const addFabric = useFabricStore((state) => state.addFabric);

  return useMutation({
    mutationFn: fabricService.createFabric,
    onSuccess: (newFabric) => {
      addFabric(newFabric);
      qc.invalidateQueries({ queryKey: ["fabrics"] });
    },
  });
}

export function useUpdateFabric() {
  const qc = useQueryClient();
  const updateFabric = useFabricStore((state) => state.updateFabric);

  return useMutation({
    mutationFn: ({ id, data }) => fabricService.updateFabric(id, data),
    onSuccess: (updated) => {
      updateFabric(updated);
      qc.invalidateQueries({ queryKey: ["fabrics"] });
    },
  });
}

export function useDeleteFabric() {
  const qc = useQueryClient();
  const deleteFabricFromStore = useFabricStore(
    (state) => state.deleteFabricFromStore
  );

  return useMutation({
    mutationFn: fabricService.deleteFabric,
    onSuccess: (_, id) => {
      deleteFabricFromStore(id);
      qc.invalidateQueries({ queryKey: ["fabrics"] });
    },
  });
}
