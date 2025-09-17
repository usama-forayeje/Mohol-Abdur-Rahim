import { databases, account } from "@/appwrite/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ID, Query } from "appwrite";
import { useUserStore } from "@/store/user-store";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;

export const userService = {
  // Get all users
  async getUsers() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.orderDesc("$createdAt"), Query.limit(1000)]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Update user role
  async updateUserRole(userId, newRole) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        userId,
        {
          role: newRole,
        }
      );
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  },

  // Update user status
  async updateUserStatus(userId, newStatus) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        userId,
        {
          status: newStatus,
        }
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  },

  // Update user shop
  async updateUserShop(userId, shopId) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        userId,
        {
          shopId: shopId || null,
        }
      );
    } catch (error) {
      console.error("Error updating user shop:", error);
      throw error;
    }
  },

  // Update user phone
  async updateUserPhone(userId, phone) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        userId,
        {
          phone: phone || "",
        }
      );
    } catch (error) {
      console.error("Error updating user phone:", error);
      throw error;
    }
  },

  // Create user
  async createUser(userData) {
    try {
      // Generate a unique ID for the user
      const userId = ID.unique();

      return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        userId,
        {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone || "",
          shopId: userData.shopId || null,
          status: "active", // Default status
          userId: userId, // Custom user ID field
        }
      );
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Delete user (from database only, not from auth)
  async deleteUser(userId) {
    try {
      return await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, userId);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};

// Fetch users
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await userService.getUsers();
      useUserStore.getState().setUsers(data);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Update user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, newRole }) =>
      userService.updateUserRole(userId, newRole),
    onSuccess: (updatedUser) => {
      useUserStore.getState().updateUser(updatedUser);
      queryClient.invalidateQueries(["users"]);
    },
  });
}

// Update user status
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, newStatus }) =>
      userService.updateUserStatus(userId, newStatus),
    onSuccess: (updatedUser) => {
      useUserStore.getState().updateUser(updatedUser);
      queryClient.invalidateQueries(["users"]);
    },
  });
}

// Update user shop
export function useUpdateUserShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, shopId }) =>
      userService.updateUserShop(userId, shopId),
    onSuccess: (updatedUser) => {
      useUserStore.getState().updateUser(updatedUser);
      queryClient.invalidateQueries(["users"]);
    },
  });
}

// Update user phone
export function useUpdateUserPhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, phone }) =>
      userService.updateUserPhone(userId, phone),
    onSuccess: (updatedUser) => {
      useUserStore.getState().updateUser(updatedUser);
      queryClient.invalidateQueries(["users"]);
    },
  });
}

// Create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => userService.createUser(userData),
    onSuccess: (newUser) => {
      useUserStore.getState().addUser(newUser);
      queryClient.invalidateQueries(["users"]);
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => userService.deleteUser(userId),
    onSuccess: (_, userId) => {
      useUserStore.getState().removeUser(userId);
      queryClient.invalidateQueries(["users"]);
    },
  });
}
