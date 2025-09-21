import { databases, Query, ID } from "@/appwrite/appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;
const USER_SHOPS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USER_SHOPS_COLLECTION_ID;
const SHOPS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SHOPS_COLLECTION_ID;

const debugLog = (message, data = null) => {
  console.log(`🟢 [USER-SHOP-SERVICE] ${message}`, data || "");
};

export const userShopService = {
  // Get all shops assigned to a user
  async getUserShops(userId) {
    try {
      if (!userId) return [];

      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.orderDesc("$createdAt"), Query.limit(100)]
      );

      const userShops = response.documents.filter((doc) => {
        if (Array.isArray(doc.userId)) {
          return doc.userId.some((u) => u.$id === userId);
        } else if (doc.userId?.$id) {
          return doc.userId.$id === userId;
        } else if (typeof doc.userId === "string") {
          return doc.userId === userId;
        }
        return false;
      });

      debugLog(`Found ${userShops.length} shops for user ${userId}`);
      return userShops;
    } catch (error) {
      console.error("Error fetching user shops:", error);
      return [];
    }
  },

  // Assign user to a shop (create or update)
  async assignUserToShop(userId, shopId, role = "user") {
    try {
      if (!userId || !shopId) throw new Error("userId and shopId required");

      // Verify user exists
      await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);

      // Verify shop exists
      await databases.getDocument(DATABASE_ID, SHOPS_COLLECTION_ID, shopId);

      // Check existing assignment
      const allAssignments = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.limit(100)]
      );

      const existing = allAssignments.documents.find(
        (doc) => (doc.userId?.$id || doc.userId) === userId &&
                 (doc.shopId?.$id || doc.shopId) === shopId
      );

      if (existing) {
        const updated = await databases.updateDocument(
          DATABASE_ID,
          USER_SHOPS_COLLECTION_ID,
          existing.$id,
          { role, status: "active" }
        );
        debugLog("Updated existing assignment", updated.$id);
        return updated;
      }

      // Create new assignment
      const newAssignment = await databases.createDocument(
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

      debugLog("Created new assignment", newAssignment.$id);
      return newAssignment;
    } catch (error) {
      console.error("Error assigning user to shop:", error);
      throw error;
    }
  },

  // Remove user from shop
  async removeUserFromShop(userId, shopId) {
    try {
      const allAssignments = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.limit(100)]
      );

      const existing = allAssignments.documents.find(
        (doc) => (doc.userId?.$id || doc.userId) === userId &&
                 (doc.shopId?.$id || doc.shopId) === shopId
      );

      if (existing) {
        const updated = await databases.updateDocument(
          DATABASE_ID,
          USER_SHOPS_COLLECTION_ID,
          existing.$id,
          { status: "inactive" }
        );
        debugLog("User removed from shop", updated.$id);
        return updated;
      }

      throw new Error("User shop assignment not found");
    } catch (error) {
      console.error("Error removing user from shop:", error);
      throw error;
    }
  },

  // Update user's role in shop
  async updateUserRole(userId, shopId, role) {
    try {
      const allAssignments = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.limit(100)]
      );

      const existing = allAssignments.documents.find(
        (doc) => (doc.userId?.$id || doc.userId) === userId &&
                 (doc.shopId?.$id || doc.shopId) === shopId &&
                 doc.status === "active"
      );

      if (existing) {
        const updated = await databases.updateDocument(
          DATABASE_ID,
          USER_SHOPS_COLLECTION_ID,
          existing.$id,
          { role }
        );
        debugLog("Updated user role", updated.$id);
        return updated;
      }

      throw new Error("Active assignment not found");
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  },

  // Get user's role in a specific shop
  async getUserRoleInShop(userId, shopId) {
    try {
      const allAssignments = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.limit(100)]
      );

      const assignment = allAssignments.documents.find(
        (doc) => (doc.userId?.$id || doc.userId) === userId &&
                 (doc.shopId?.$id || doc.shopId) === shopId &&
                 doc.status === "active"
      );

      return assignment ? assignment.role : null;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  },

  // Check if user has active access to shop
  async hasShopAccess(userId, shopId) {
    try {
      const allAssignments = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.limit(100)]
      );

      return allAssignments.documents.some(
        (doc) => (doc.userId?.$id || doc.userId) === userId &&
                 (doc.shopId?.$id || doc.shopId) === shopId &&
                 doc.status === "active"
      );
    } catch (error) {
      console.error("Error checking shop access:", error);
      return false;
    }
  },

  // Get all pending user assignments (inactive + no shop)
  async getPendingUserAssignments() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.equal("status", "inactive"), Query.limit(100)]
      );

      const pending = response.documents.filter(
        (doc) => !doc.shopId
      );

      debugLog(`Found ${pending.length} pending assignments`);
      return pending;
    } catch (error) {
      console.error("Error getting pending assignments:", error);
      throw error;
    }
  },

  // Assign shop to pending user
  async assignShopToPendingUser(userShopId, shopId, role = "user") {
    try {
      await databases.getDocument(DATABASE_ID, SHOPS_COLLECTION_ID, shopId);

      const updated = await databases.updateDocument(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        userShopId,
        { shopId, role, status: "active" }
      );

      debugLog("Assigned shop to pending user", updated.$id);
      return updated;
    } catch (error) {
      console.error("Error assigning shop to pending user:", error);
      throw error;
    }
  },

  // Bulk assign users to a shop
  async bulkAssignUsersToShop(userIds, shopId, role = "user") {
    const results = await Promise.allSettled(
      userIds.map((userId) => this.assignUserToShop(userId, shopId, role))
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    debugLog("Bulk assignment result", { successful, failed });
    return { successful, failed, results };
  },
};
