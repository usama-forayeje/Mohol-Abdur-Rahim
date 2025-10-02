import { databases, storage, account } from "@/appwrite/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ID, Query } from "appwrite";
import { useCatalogStore } from "@/store/catalogStore";
import { processImages, validateImageFile } from "@/lib/image-optimizer";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CATALOG_COLLECTION_ID;
const STORAGE_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID;

export const catalogService = {
  // Get all catalog items
  async getCatalogItems() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.orderDesc("$createdAt"), Query.limit(100)]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching catalog items:", error);
      throw error;
    }
  },

  // Create catalog item with current user
  async createCatalogItem(values) {
    try {
      let imageIds = [];

      // Get current user
      const user = await account.get();

      // Multiple image upload with optimization
      if (values.images && values.images.length > 0) {
        try {
          const filesArray = Array.from(values.images);

          // Validate all files first
          filesArray.forEach(file => validateImageFile(file));

          // Process and optimize images (with fallback)
          let { processedFiles } = await processImages(filesArray, {
            enableCompression: true,
            enableFormatConversion: false, // Disable for now to avoid extension issues
            targetFormat: 'image/webp'
          });

          // If processing fails, use original files
          if (!processedFiles || processedFiles.length === 0) {
            processedFiles = filesArray;
          }

          // Upload optimized images
          const uploadPromises = processedFiles.map((file) =>
            storage.createFile(STORAGE_ID, ID.unique(), file)
          );
          const uploadedFiles = await Promise.all(uploadPromises);
          imageIds = uploadedFiles.map((file) => file.$id);
        } catch (error) {
          console.error("Image processing error:", error);
          // Fallback to original files if processing fails
          try {
            const filesArray = Array.from(values.images);
            const uploadPromises = filesArray.map((file) =>
              storage.createFile(STORAGE_ID, ID.unique(), file)
            );
            const uploadedFiles = await Promise.all(uploadPromises);
            imageIds = uploadedFiles.map((file) => file.$id);
          } catch (fallbackError) {
            console.error("Fallback upload also failed:", fallbackError);
            throw new Error(`ছবি আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।`);
          }
        }
      }

      // Ensure shopIds is an array
      const shopIdsArray = Array.isArray(values.shopIds)
        ? values.shopIds
        : values.shopIds
        ? [values.shopIds]
        : [];

      return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          shopIds: shopIdsArray,
          type: values.type,
          name: values.name,
          description: values.description,
          sell_price: parseFloat(values.sell_price),
          worker_price: parseFloat(values.worker_price),
          design_code: values.design_code,
          images: imageIds,
          createdBy: user.$id, // Set current user
        }
      );
    } catch (error) {
      console.error("Error creating catalog item:", error);
      throw error;
    }
  },

  // Update catalog item
  async updateCatalogItem(id, data, newImages = [], previousImageIds = []) {
    try {
      let imageIds = [...previousImageIds];

      // Upload new images if provided with optimization
      if (newImages && newImages.length > 0) {
        try {
          // Validate and process new images
          const filesArray = Array.from(newImages);

          // Validate all files first
          filesArray.forEach(file => validateImageFile(file));

          // Process and optimize images (with fallback)
          let { processedFiles } = await processImages(filesArray, {
            enableCompression: true,
            enableFormatConversion: false, // Disable for now to avoid extension issues
            targetFormat: 'image/webp'
          });

          // If processing fails, use original files
          if (!processedFiles || processedFiles.length === 0) {
            processedFiles = filesArray;
          }

          // Upload optimized images
          const uploadPromises = processedFiles.map((file) =>
            storage.createFile(STORAGE_ID, ID.unique(), file)
          );
          const uploadedFiles = await Promise.all(uploadPromises);
          imageIds = [...imageIds, ...uploadedFiles.map((file) => file.$id)];
        } catch (error) {
          console.error("New image processing error:", error);
          // Fallback to original files if processing fails
          try {
            const filesArray = Array.from(newImages);
            const uploadPromises = filesArray.map((file) =>
              storage.createFile(STORAGE_ID, ID.unique(), file)
            );
            const uploadedFiles = await Promise.all(uploadPromises);
            imageIds = [...imageIds, ...uploadedFiles.map((file) => file.$id)];
          } catch (fallbackError) {
            console.error("Fallback upload also failed:", fallbackError);
            throw new Error(`নতুন ছবি আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।`);
          }
        }
      }

      // Ensure shopIds is an array
      const shopIdsArray = Array.isArray(data.shopIds)
        ? data.shopIds
        : data.shopIds
        ? [data.shopIds]
        : [];

      const updateData = {
        shopIds: shopIdsArray,
        type: data.type,
        name: data.name,
        description: data.description,
        sell_price: parseFloat(data.sell_price),
        worker_price: parseFloat(data.worker_price),
        design_code: data.design_code,
        images: imageIds,
      };

      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id,
        updateData
      );
    } catch (error) {
      console.error("Error updating catalog item:", error);
      throw error;
    }
  },

  // Delete catalog item
  async deleteCatalogItem(id) {
    try {
      return await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    } catch (error) {
      console.error("Error deleting catalog item:", error);
      throw error;
    }
  },

  // Delete specific images
  async deleteCatalogImages(itemId, imageIdsToDelete) {
    try {
      // Delete images from storage
      const deletePromises = imageIdsToDelete.map((imageId) =>
        storage.deleteFile(STORAGE_ID, imageId).catch((err) => {
          if (err.code !== 404) console.error("Error deleting image:", err);
        })
      );
      await Promise.all(deletePromises);

      // Get current item to update images array
      const currentItem = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        itemId
      );
      const remainingImages = currentItem.images.filter(
        (imageId) => !imageIdsToDelete.includes(imageId)
      );

      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        itemId,
        {
          images: remainingImages,
        }
      );
    } catch (error) {
      console.error("Error deleting catalog images:", error);
      throw error;
    }
  },

  // Get image URL
  getImageUrl(imageId) {
    if (!imageId) return null;
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_ID}/files/${imageId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
  },

  // Get multiple image URLs
  getImageUrls(imageIds) {
    if (!imageIds || imageIds.length === 0) return [];
    return imageIds.map((imageId) => this.getImageUrl(imageId));
  },
};

// Fetch catalog items
export function useCatalogItems() {
  return useQuery({
    queryKey: ["catalog"],
    queryFn: async () => {
      const data = await catalogService.getCatalogItems();
      useCatalogStore.getState().setCatalogItems(data);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Create catalog item
export function useCreateCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: catalogService.createCatalogItem,
    onMutate: async (newItem) => {
      const tempId = `temp_${Date.now()}`;
      const optimisticItem = {
        $id: tempId,
        shopIds: newItem.shopIds || [],
        type: newItem.type,
        name: newItem.name,
        description: newItem.description,
        sell_price: parseFloat(newItem.sell_price),
        worker_price: parseFloat(newItem.worker_price),
        design_code: newItem.design_code,
        images: [],
        createdBy: "current-user", // Temporary value
        $createdAt: new Date().toISOString(),
      };
      useCatalogStore.getState().addCatalogItem(optimisticItem);
      return { tempId };
    },
    onSuccess: (newItem, variables, context) => {
      useCatalogStore.getState().removeCatalogItem(context.tempId);
      useCatalogStore.getState().addCatalogItem(newItem);
      queryClient.invalidateQueries(["catalog"]);
    },
    onError: (error, variables, context) => {
      if (context?.tempId) {
        useCatalogStore.getState().removeCatalogItem(context.tempId);
      }
    },
  });
}

// Update catalog item
export function useUpdateCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, newImages, previousImageIds }) =>
      catalogService.updateCatalogItem(id, data, newImages, previousImageIds),
    onMutate: async ({ id, data, newImages, previousImageIds }) => {
      const currentItems = useCatalogStore.getState().catalogItems;
      const existingItem = currentItems.find((item) => item.$id === id);

      if (existingItem) {
        const updatedItem = {
          ...existingItem,
          shopIds: data.shopIds || [],
          type: data.type,
          name: data.name,
          description: data.description,
          sell_price: parseFloat(data.sell_price),
          worker_price: parseFloat(data.worker_price),
          design_code: data.design_code,
        };
        useCatalogStore.getState().updateCatalogItem(updatedItem);
      }
      return { previousItem: existingItem };
    },
    onSuccess: (updatedItem) => {
      useCatalogStore.getState().updateCatalogItem(updatedItem);
      queryClient.invalidateQueries(["catalog"]);
    },
    onError: (error, variables, context) => {
      if (context?.previousItem) {
        useCatalogStore.getState().updateCatalogItem(context.previousItem);
      }
    },
  });
}

// Delete catalog images
export function useDeleteCatalogImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, imageIds }) =>
      catalogService.deleteCatalogImages(itemId, imageIds),
    onSuccess: () => {
      queryClient.invalidateQueries(["catalog"]);
    },
  });
}

export function useDeleteCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item) => {
      // Delete all images first
      if (item.images && item.images.length > 0) {
        const deletePromises = item.images.map((imageId) =>
          storage.deleteFile(STORAGE_ID, imageId).catch((err) => {
            if (err.code === 404) {
              console.warn("Image not found, skipping storage delete.");
            } else {
              throw err;
            }
          })
        );
        await Promise.all(deletePromises);
      }
      // Delete from database
      return catalogService.deleteCatalogItem(item.$id);
    },
    onMutate: (item) => {
      useCatalogStore.getState().removeCatalogItem(item.$id);
      return { deletedItem: item };
    },
    onSuccess: () => queryClient.invalidateQueries(["catalog"]),
    onError: (error, item, context) => {
      if (context?.deletedItem)
        useCatalogStore.getState().addCatalogItem(context.deletedItem);
    },
  });
}
