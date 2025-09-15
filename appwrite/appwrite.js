// appwrite/appwrite.js - Fixed user profile fetching
import { Account, Client, Databases, ID, Storage, Query } from "appwrite";

const client = new Client()
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export class AppwriteService {
  constructor() {
    this.currentUser = null;
  }

  // Enhanced user profile fetching with better logging
  async getCurrentUser() {
    try {
      // Get current user from Appwrite auth
      const user = await account.get();
      console.log("🔍 Raw Appwrite user:", user);

      if (!user) return null;

      // Try to get user profile from database
      let userProfile = null;

      try {
        userProfile = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
          user.$id
        );

        console.log("✅ Profile from database:", userProfile);
        console.log("🏷️ Role from database:", userProfile.role);

        return {
          ...user,
          profile: userProfile,
        };
      } catch (profileError) {
        console.error("❌ Profile fetch error:", profileError);

        // If profile doesn't exist in database, create minimal profile
        if (profileError.code === 404) {
          console.log("📝 Creating new profile for user");

          try {
            const newProfile = await this.createUserProfile(user);
            console.log("✅ New profile created:", newProfile);

            return {
              ...user,
              profile: newProfile,
            };
          } catch (createError) {
            console.error("❌ Profile creation failed:", createError);
          }
        }

        // Fallback: use minimal profile
        console.log("⚠️ Using fallback profile");
        const fallbackProfile = this.getMinimalProfile(user);

        return {
          ...user,
          profile: fallbackProfile,
        };
      }
    } catch (error) {
      console.error("❌ getCurrentUser failed:", error);

      if (error.code === 401) {
        this.currentUser = null;
        return null;
      }

      throw error;
    }
  }

  // Create user profile with default role
  async createUserProfile(user) {
    const profileData = {
      userId: user.$id,
      name: user.name || user.email.split("@")[0],
      email: user.email,
      phone: user.phone || null,
      role: "user", // Default role - admin should manually change this
      shopId: null,
      status: "active",
      avatar: this.generateFallbackAvatar(user.email),
    };

    console.log("📝 Creating profile with data:", profileData);

    const profile = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      user.$id,
      profileData
    );

    return profile;
  }

  // Minimal profile for fallback
  getMinimalProfile(user) {
    return {
      $id: user.$id,
      userId: user.$id,
      name: user.name || user.email.split("@")[0],
      email: user.email,
      role: "user", // Default role
      shopId: null,
      status: "active",
      avatar: this.generateFallbackAvatar(user.email),
    };
  }

  // Generate fallback avatar
  generateFallbackAvatar(email) {
    const name = email.split("@")[0];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=4F46E5&color=fff&size=200&rounded=true`;
  }

  // Debug method to check user profile
  async debugUserProfile() {
    try {
      console.log("🔍 Starting user profile debug...");

      // Check current auth user
      const authUser = await account.get();
      console.log("👤 Auth User:", authUser);

      if (!authUser) {
        console.log("❌ No authenticated user");
        return;
      }

      // Try to fetch profile from database
      try {
        const profile = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
          authUser.$id
        );

        console.log("📄 Database Profile:");
        console.log("- ID:", profile.$id);
        console.log("- Name:", profile.name);
        console.log("- Email:", profile.email);
        console.log("- Role:", profile.role);
        console.log("- Shop ID:", profile.shopId);
        console.log("- Status:", profile.status);
        console.log("- Full Profile:", profile);

        return profile;
      } catch (error) {
        console.log("❌ Profile fetch failed:", error);
        console.log("- Error Code:", error.code);
        console.log("- Error Type:", error.type);
        console.log("- Error Message:", error.message);
      }

      // Test database connection
      console.log("🔗 Testing database connection...");
      console.log(
        "- Database ID:",
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
      );
      console.log(
        "- Users Collection ID:",
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID
      );
    } catch (error) {
      console.error("🚫 Debug failed:", error);
    }
  }

  // Rest of your existing methods...
  async loginWithGoogle() {
    try {
      const successUrl = `${window.location.origin}/callback`;
      const failureUrl = `${window.location.origin}/sign-in?error=login_failed`;
      await account.createOAuth2Session("google", successUrl, failureUrl);
    } catch (error) {
      throw error;
    }
  }

  async handleOAuthCallback() {
    try {
      let user = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts && !user) {
        try {
          user = await account.get();
          if (user) break;
        } catch (error) {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (!user) {
        throw new Error("OAuth session timeout");
      }

      const userWithProfile = await this.getCurrentUser();
      return userWithProfile;
    } catch (error) {
      throw error;
    }
  }

  async logoutUser() {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      this.currentUser = null;
    }
  }

  async getAllShops() {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "68ad2cb1002bfcff4e09",
        process.env.NEXT_PUBLIC_APPWRITE_SHOPS_COLLECTION_ID ||
          "68ad364a00338a503d70",
        [Query.orderDesc("$createdAt")]
      );
      return response.documents;
    } catch (error) {
      throw error;
    }
  }

  async getShop(shopId) {
    try {
      const shop = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_SHOPS_COLLECTION_ID,
        shopId
      );
      return shop;
    } catch (error) {
      throw error;
    }
  }
}

export const appwriteService = new AppwriteService();

// Add global debug function
if (typeof window !== "undefined") {
  window.debugUserProfile = () => appwriteService.debugUserProfile();
}
