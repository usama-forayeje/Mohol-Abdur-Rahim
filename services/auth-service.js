// services/auth-service.js
import { account, databases, Query, ID } from "@/appwrite/appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;
const SHOPS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_SHOPS_COLLECTION_ID;
const USER_SHOPS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USER_SHOPS_COLLECTION_ID;

const debugLog = (message, data = null) => {
  console.log(
    `🔐 [AUTH-SERVICE] ${message}`,
    data ? JSON.stringify(data, null, 2) : ""
  );
};

export const authService = {
  async loginWithGoogle() {
    try {
      const successUrl = `${window.location.origin}/callback`;
      const failureUrl = `${window.location.origin}/sign-in?error=auth_failed`;
      await account.createOAuth2Session("google", successUrl, failureUrl);
    } catch (error) {
      console.error("Google OAuth failed:", error);
      throw new Error("Google login failed. Please try again.");
    }
  },

  async handleOAuthCallback() {
    try {
      const user = await account.get();
      debugLog("OAuth user received:", user);
      if (!user || !user.$id) throw new Error("Authentication failed");
      return user;
    } catch (error) {
      console.error("OAuth callback failed:", error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  },

  getGoogleAvatar(authUser) {
    try {
      let avatarUrl = authUser.prefs?.picture || authUser.prefs?.avatar;
      if (!avatarUrl) {
        const displayName = authUser.name || authUser.email.split("@")[0];
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          displayName
        )}&background=4F46E5&color=fff&size=200&rounded=true`;
      }
      return avatarUrl;
    } catch (error) {
      const displayName = authUser.name || authUser.email.split("@")[0];
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        displayName
      )}&background=4F46E5&color=fff&size=200&rounded=true`;
    }
  },

  async getCompleteUserProfile() {
    try {
      debugLog("=== STARTING COMPLETE USER PROFILE ===");
      const authUser = await account.get();
      if (!authUser?.$id) throw new Error("User not authenticated");

      let dbUserProfile = null;

      try {
        dbUserProfile = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          authUser.$id
        );
        debugLog("Existing user found in database");
      } catch (error) {
        if (error.code === 404) {
          const userAvatar = this.getGoogleAvatar(authUser);
          const userData = {
            name: authUser.name || authUser.email.split("@")[0],
            email: authUser.email,
            phone: authUser.phone || "",
            avatar: userAvatar,
            status: "active",
          };
          dbUserProfile = await databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            authUser.$id,
            userData
          );
          try {
            await this.createPendingShopAssignment(authUser.$id);
          } catch {}
        } else throw error;
      }

      let userShops = [];
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          USER_SHOPS_COLLECTION_ID,
          [Query.orderDesc("$createdAt"), Query.limit(100)]
        );
        userShops = response.documents.filter((doc) => {
          if (Array.isArray(doc.userId))
            return doc.userId.some((u) => u.$id === authUser.$id);
          if (doc.userId?.$id) return doc.userId.$id === authUser.$id;
          return doc.userId === authUser.$id;
        });
      } catch {}

      const completeProfile = {
        ...authUser,
        profile: dbUserProfile,
        userShops,
      };
      debugLog("=== COMPLETE USER PROFILE RESULT ===", {
        userId: completeProfile.$id,
        profileId: completeProfile.profile?.$id,
        userShopsCount: completeProfile.userShops.length,
        avatar: completeProfile.profile?.avatar,
        hasActiveShopAccess: completeProfile.userShops.some(
          (shop) => shop.status === "active" && shop.shopId
        ),
      });

      return completeProfile;
    } catch (error) {
      console.error("Error in getCompleteUserProfile:", error);
      throw error;
    }
  },

  async createPendingShopAssignment(userId) {
    try {
      const existingAssignments = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.limit(100)]
      );
      const existingPending = existingAssignments.documents.find((doc) => {
        const userMatches = Array.isArray(doc.userId)
          ? doc.userId.some((u) => u.$id === userId)
          : doc.userId?.$id === userId || doc.userId === userId;
        const isPending =
          doc.status === "inactive" &&
          (!doc.shopId ||
            (Array.isArray(doc.shopId) && doc.shopId.length === 0));
        return userMatches && isPending;
      });
      if (existingPending) return existingPending;

      const assignmentData = {
        userId: [userId],
        shopId: [],
        role: "user",
        status: "inactive",
      };
      const assignment = await databases.createDocument(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        ID.unique(),
        assignmentData
      );
      return assignment;
    } catch (error) {
      console.error("Error creating pending shop assignment:", error);
      throw new Error(`Failed to create pending assignment: ${error.message}`);
    }
  },

  async assignShopToPendingUser(userShopId, shopId, role = "user") {
    try {
      await databases.getDocument(DATABASE_ID, SHOPS_COLLECTION_ID, shopId);
      const updatedAssignment = await databases.updateDocument(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        userShopId,
        {
          shopId: [shopId],
          role,
          status: "active",
        }
      );
      return updatedAssignment;
    } catch (error) {
      console.error("Error assigning shop to pending user:", error);
      throw new Error(`Failed to assign shop: ${error.message}`);
    }
  },

  async getPendingUserAssignments() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [
          Query.equal("status", "inactive"),
          Query.orderDesc("$createdAt"),
          Query.limit(100),
        ]
      );
      return response.documents.filter(
        (doc) =>
          !doc.shopId || (Array.isArray(doc.shopId) && doc.shopId.length === 0)
      );
    } catch (error) {
      console.error("Error getting pending assignments:", error);
      throw new Error("Failed to get pending assignments");
    }
  },

  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      if (error.code === 401) return null;
      throw error;
    }
  },

  async logout() {
    try {
      await account.deleteSession("current");
    } catch {
      throw new Error("Logout failed");
    }
  },

  generateDefaultAvatar(email, name = "") {
    const displayName = name || email.split("@")[0];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=4F46E5&color=fff&size=200&rounded=true`;
  },

  async updateUserProfile(userId, updates) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        updates
      );
    } catch {
      throw new Error("Failed to update user profile");
    }
  },

  async checkUserExists(userId) {
    try {
      await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
      return true;
    } catch (error) {
      if (error.code === 404) return false;
      throw error;
    }
  },
};
