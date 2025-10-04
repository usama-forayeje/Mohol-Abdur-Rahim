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
      // Enhanced Firefox detection
      const userAgent = window.navigator.userAgent;
      const isFirefox = userAgent.includes('Firefox');

      console.log("🔐 Login attempt - Browser Info:", {
        isFirefox,
        userAgent: userAgent.substring(0, 100),
        cookieEnabled: window.navigator.cookieEnabled,
        onLine: window.navigator.onLine
      });

      const successUrl = `${window.location.origin}/callback`;
      const failureUrl = `${window.location.origin}/sign-in?error=auth_failed`;

      // Simplified approach for Firefox - use basic OAuth without extra scopes
      if (isFirefox) {
        console.log("🔐 Firefox detected - using simplified OAuth flow");

        // For Firefox, use the simplest possible OAuth configuration
        await account.createOAuth2Session("google", successUrl, failureUrl);

        // Wait for session creation
        await new Promise(resolve => setTimeout(resolve, 1500));

      } else {
        // Standard OAuth flow for other browsers
        await account.createOAuth2Session("google", successUrl, failureUrl);
      }
    } catch (error) {
      console.error("Google OAuth failed:", error);

      // For Firefox, provide more generic error handling
      const userAgent = window.navigator.userAgent;
      if (userAgent.includes('Firefox')) {
        console.log("🔐 Firefox login failed - checking error type");

        // Only throw Firefox-specific error for actual session issues
        if (error.message?.includes('missing scopes') || error.message?.includes('guests')) {
          throw new Error("Firefox_session_blocked");
        } else {
          // For other Firefox errors, try a more generic approach
          throw new Error("Firefox_login_failed");
        }
      }

      throw new Error("Google login failed. Please try again.");
    }
  },

  async handleOAuthCallback() {
    const maxRetries = 2; // Reduced retries for Firefox
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Shorter delay for Firefox
        const delay = attempt === 1 ? 800 : 1200;
        await new Promise((resolve) => setTimeout(resolve, delay));

        debugLog(`OAuth callback attempt ${attempt}/${maxRetries}`);

        const user = await account.get();
        debugLog("OAuth user received:", user);

        if (!user || !user.$id) {
          throw new Error("Authentication failed - no user data");
        }

        // For Firefox, be more lenient with session validation
        const isFirefox = typeof window !== 'undefined' && window.navigator.userAgent.includes('Firefox');

        if (isFirefox) {
          // For Firefox, accept the session even with limited scopes
          console.log("🔐 Firefox session detected - accepting with limited scopes");
          if (user && user.$id) {
            console.log("🔐 Firefox session accepted - proceeding despite limited scopes");
            return user;
          }
        }

        // Standard validation for other browsers
        if (user.role === "guests" || !user.email) {
          debugLog("Invalid session detected - redirecting to login");

          if (isFirefox) {
            // For Firefox, try to accept anyway if we have basic user data
            if (user && user.$id && user.name) {
              console.log("🔐 Firefox: Accepting session with limited data");
              return user;
            }
            throw new Error("Firefox_session_blocked");
          } else {
            throw new Error("Session not properly created. Please try logging in again.");
          }
        }

        debugLog("OAuth callback successful for user:", user.email);
        return user;

      } catch (error) {
        console.error(`OAuth callback attempt ${attempt} failed:`, error);
        lastError = error;

        // For Firefox, handle errors more gracefully
        const isFirefox = typeof window !== 'undefined' && window.navigator.userAgent.includes('Firefox');

        if (isFirefox && (error.message?.includes("missing scopes") || error.code === 401)) {
          // For Firefox, try to continue even with limited session data
          try {
            const user = await account.get();
            if (user && user.$id) {
              console.log("🔐 Firefox: Accepting limited session data");
              return user;
            }
          } catch (fallbackError) {
            console.log("🔐 Firefox fallback also failed");
          }
        }

        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          if (isFirefox) {
            throw new Error("Firefox_session_blocked");
          }
          throw lastError;
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    throw new Error(`Authentication failed: ${lastError.message}`);
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

      // Handle missing scopes error - be more lenient for Firefox
      const isFirefox = typeof window !== 'undefined' && window.navigator.userAgent.includes('Firefox');

      if (authUser.role === "guests" || authUser.$id === undefined) {
        if (isFirefox && authUser.$id) {
          debugLog("Firefox session with limited scopes - proceeding");
        } else {
          debugLog("User session invalid, redirecting to login");
          throw new Error("Session expired. Please login again.");
        }
      }

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

      // Auto-assign to first available shop if user has no active assignments
      if (
        userShops.length === 0 ||
        !userShops.some(
          (us) =>
            us.status === "active" &&
            us.shopId &&
            (Array.isArray(us.shopId) ? us.shopId.length > 0 : true)
        )
      ) {
        try {
          await this.autoAssignUserToShop(authUser.$id);
        } catch (error) {
          debugLog("Auto-assignment failed:", error.message);
        }
      }

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
      if (error.code === 401 || error.message?.includes("missing scopes"))
        return null;
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

  async autoAssignUserToShop(userId) {
    try {
      debugLog("Starting auto-assignment for user:", userId);

      // Get all available shops
      const shopsResponse = await databases.listDocuments(
        DATABASE_ID,
        SHOPS_COLLECTION_ID,
        [Query.limit(100)]
      );

      if (shopsResponse.documents.length === 0) {
        debugLog("No shops available for auto-assignment");
        return null;
      }

      // Get first available shop
      const firstShop = shopsResponse.documents[0];
      debugLog("Auto-assigning to first shop:", firstShop.name);

      // Create shop assignment with appropriate role
      const assignmentData = {
        userId: [userId],
        shopId: [firstShop.$id],
        role: "salesman", // Default role for new users
        status: "active",
      };

      const assignment = await databases.createDocument(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        ID.unique(),
        assignmentData
      );

      debugLog("Auto-assignment successful:", assignment);
      return assignment;
    } catch (error) {
      console.error("Error in auto-assignment:", error);
      throw new Error(`Failed to auto-assign user to shop: ${error.message}`);
    }
  },
};
