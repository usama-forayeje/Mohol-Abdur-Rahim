import { useQuery } from "@tanstack/react-query";
import { ID, Query } from "appwrite";
import { useUserStore } from "@/store/user-store";
import { databases } from "@/appwrite/appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;
const USER_SHOPS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USER_SHOPS_COLLECTION_ID;
const SHOPS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SHOPS_COLLECTION_ID;

const debugLog = (message, data = null) => {
  console.log(`🟢 [USER-SERVICE] ${message}`, data || "");
};

export const userService = {
  async getUsers(options = {}) {
    try {
      const queries = [
        Query.orderDesc("$createdAt"),
        Query.limit(options.limit || 100),
        Query.offset(options.offset || 0),
      ];

      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        queries
      );

      debugLog("Fetched users:", response.documents.length);
      return response.documents;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users. Please try again.");
    }
  },

  async getUserById(userId) {
    try {
      if (!userId) throw new Error("User ID is required");

      const user = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      );

      debugLog(`Fetched user ${userId}`);
      return user;
    } catch (error) {
      if (error.code === 404) return null;
      console.error(`Error fetching user ${userId}:`, error);
      throw new Error("Failed to fetch user details.");
    }
  },

  async getUsersByShopId(shopId, options = {}) {
    try {
      if (!shopId) throw new Error("Shop ID is required");

      const userShops = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [
          Query.equal("shopId", shopId),
          Query.limit(options.limit || 1000),
          Query.offset(options.offset || 0),
        ]
      );

      const users = await Promise.all(
        userShops.documents.map(async (userShop) => {
          const user = await this.getUserById(userShop.userId?.$id || userShop.userId);
          return user
            ? {
                ...user,
                shopRole: userShop.role,
                shopStatus: userShop.status,
              }
            : null;
        })
      );

      debugLog(`Fetched users for shop ${shopId}:`, users.length);
      return users.filter((u) => u !== null);
    } catch (error) {
      console.error(`Error fetching users for shop ${shopId}:`, error);
      throw new Error("Failed to fetch users by shop.");
    }
  },

  async createUser(userData) {
    try {
      if (!userData.email || !userData.name) {
        throw new Error("Email and name are required to create a user");
      }

      const documentId = userData.$id || ID.unique();

      const userDocument = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
        avatar: userData.avatar || null,
        status: userData.status || "active",
      };

      const newUser = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        documentId,
        userDocument
      );

      debugLog("Created new user:", newUser.$id);

      if (userData.shopId) {
        await this.assignUserToShop(
          newUser.$id,
          userData.shopId,
          userData.role || "user"
        );
      }

      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.code === 409) throw new Error("A user with this email already exists.");
      throw new Error("Failed to create user. Please try again.");
    }
  },

  async assignUserToShop(userId, shopId, role = "user") {
    try {
      // Verify shop exists
      await databases.getDocument(DATABASE_ID, SHOPS_COLLECTION_ID, shopId);

      const existing = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.equal("userId", userId), Query.equal("shopId", shopId)]
      );

      if (existing.documents.length > 0) {
        return await databases.updateDocument(
          DATABASE_ID,
          USER_SHOPS_COLLECTION_ID,
          existing.documents[0].$id,
          { role, status: "active" }
        );
      }

      return await databases.createDocument(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          shopId: shopId,
          role,
          status: "active",
        }
      );
    } catch (error) {
      console.error("Error assigning user to shop:", error);
      throw new Error("Failed to assign user to shop");
    }
  },

  async getUserShops(userId) {
    try {
      if (!userId) throw new Error("User ID is required");

      const userShops = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      debugLog(`Fetched ${userShops.documents.length} shops for user ${userId}`);
      return userShops.documents;
    } catch (error) {
      console.error(`Error fetching shops for user ${userId}:`, error);
      throw new Error("Failed to fetch user shops.");
    }
  },
};

export const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  list: (filters) => [...userKeys.lists(), filters],
  details: () => [...userKeys.all, "detail"],
  detail: (id) => [...userKeys.details(), id],
  byShop: (shopId) => [...userKeys.all, "shop", shopId],
  userShops: (userId) => [...userKeys.all, "shops", userId],
};

export function useUsers(options = {}) {
  const setUsers = useUserStore((state) => state.setUsers);

  return useQuery({
    queryKey: userKeys.list(options),
    queryFn: () => userService.getUsers(options),
    onSuccess: (data) => setUsers(data),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUsersByShopId(shopId, options = {}) {
  return useQuery({
    queryKey: userKeys.byShop(shopId),
    queryFn: () => userService.getUsersByShopId(shopId, options),
    enabled: !!shopId,
    staleTime: 2 * 60 * 1000,
  });
}
