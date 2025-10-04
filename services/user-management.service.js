// services/user-management.service.js
import { databases, Query, ID } from "@/appwrite/appwrite";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;
const USER_SHOPS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USER_SHOPS_COLLECTION_ID;
const SHOPS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SHOPS_COLLECTION_ID;

export const userManagementService = {
  // Get all users with their shop assignments
  async getAllUsersWithShops() {
    try {
      // Get all users
      const usersResponse = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.orderDesc("$createdAt"), Query.limit(100)]
      );

      // Get all user-shop assignments
      const userShopsResponse = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.limit(500)]
      );

      // Get all shops
      const shopsResponse = await databases.listDocuments(
        DATABASE_ID,
        SHOPS_COLLECTION_ID,
        [Query.limit(100)]
      );

      // Map users with their shop assignments
      const usersWithShops = usersResponse.documents.map(user => {
        // Find all shop assignments for this user
        const userAssignments = userShopsResponse.documents.filter(assignment => {
          if (Array.isArray(assignment.userId)) {
            return assignment.userId.some(u => u.$id === user.$id || u === user.$id);
          }
          return assignment.userId?.$id === user.$id || assignment.userId === user.$id;
        });

        // Map shop details to assignments
        const shopsWithRoles = userAssignments.map(assignment => {
          let shopId = null;
          
          if (Array.isArray(assignment.shopId) && assignment.shopId.length > 0) {
            shopId = typeof assignment.shopId[0] === 'string' 
              ? assignment.shopId[0] 
              : assignment.shopId[0]?.$id;
          } else if (typeof assignment.shopId === 'string') {
            shopId = assignment.shopId;
          } else if (assignment.shopId?.$id) {
            shopId = assignment.shopId.$id;
          }

          const shop = shopsResponse.documents.find(s => s.$id === shopId);
          
          return {
            assignmentId: assignment.$id,
            shop: shop || null,
            role: assignment.role || 'user',
            status: assignment.status || 'inactive',
            assignedAt: assignment.$createdAt
          };
        }).filter(item => item.shop !== null);

        return {
          ...user,
          assignments: shopsWithRoles,
          primaryRole: shopsWithRoles.find(s => s.status === 'active')?.role || 'user',
          activeShops: shopsWithRoles.filter(s => s.status === 'active').length
        };
      });

      return usersWithShops;
    } catch (error) {
      console.error("Error fetching users with shops:", error);
      throw new Error("Failed to fetch users");
    }
  },

  // Assign role to user for a specific shop
  async assignUserRole(userId, shopId, role, currentUserId, currentUserRole) {
    try {
      // Permission check
      if (!this.canAssignRole(currentUserRole, role)) {
        throw new Error("আপনার এই role assign করার অনুমতি নেই");
      }

      // Check if assignment already exists
      const existingAssignments = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.limit(500)]
      );

      const existing = existingAssignments.documents.find(doc => {
        const userMatch = Array.isArray(doc.userId) 
          ? doc.userId.some(u => u.$id === userId || u === userId)
          : doc.userId?.$id === userId || doc.userId === userId;
          
        const shopMatch = Array.isArray(doc.shopId)
          ? doc.shopId.some(s => s.$id === shopId || s === shopId)
          : doc.shopId?.$id === shopId || doc.shopId === shopId;
          
        return userMatch && shopMatch;
      });

      if (existing) {
        // Update existing assignment
        return await databases.updateDocument(
          DATABASE_ID,
          USER_SHOPS_COLLECTION_ID,
          existing.$id,
          {
            role: role,
            status: 'active'
          }
        );
      } else {
        // Create new assignment
        return await databases.createDocument(
          DATABASE_ID,
          USER_SHOPS_COLLECTION_ID,
          ID.unique(),
          {
            userId: [userId],
            shopId: [shopId],
            role: role,
            status: 'active'
          }
        );
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      throw error;
    }
  },

  // Update user role
  async updateUserRole(assignmentId, newRole, currentUserRole) {
    try {
      if (!this.canAssignRole(currentUserRole, newRole)) {
        throw new Error("আপনার এই role update করার অনুমতি নেই");
      }

      return await databases.updateDocument(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        assignmentId,
        { role: newRole }
      );
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  },

  // Remove user from shop
  async removeUserFromShop(assignmentId, currentUserRole) {
    try {
      if (!['superAdmin', 'admin', 'manager'].includes(currentUserRole)) {
        throw new Error("আপনার user remove করার অনুমতি নেই");
      }

      return await databases.updateDocument(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        assignmentId,
        { status: 'inactive' }
      );
    } catch (error) {
      console.error("Error removing user from shop:", error);
      throw error;
    }
  },

  // Activate/Deactivate user assignment
  async toggleUserStatus(assignmentId, newStatus, currentUserRole) {
    try {
      if (!['superAdmin', 'admin', 'manager'].includes(currentUserRole)) {
        throw new Error("আপনার status পরিবর্তনের অনুমতি নেই");
      }

      return await databases.updateDocument(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        assignmentId,
        { status: newStatus }
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
      throw error;
    }
  },

  // Permission helper - who can assign which roles
  canAssignRole(currentUserRole, targetRole) {
    const roleHierarchy = {
      superAdmin: ['superAdmin', 'admin', 'manager', 'salesman', 'tailor', 'embroideryMan', 'stoneMan', 'user'],
      admin: ['manager', 'salesman', 'tailor', 'embroideryMan', 'stoneMan', 'user'],
      manager: ['salesman', 'tailor', 'embroideryMan', 'stoneMan', 'user'],
      salesman: [],
      tailor: [],
      embroideryMan: [],
      stoneMan: [],
      user: []
    };

    return roleHierarchy[currentUserRole]?.includes(targetRole) || false;
  },

  // Get available roles that current user can assign
  getAssignableRoles(currentUserRole) {
    const roleHierarchy = {
      superAdmin: [
        { value: 'superAdmin', label: 'Super Admin', color: 'red' },
        { value: 'admin', label: 'Admin', color: 'purple' },
        { value: 'manager', label: 'Manager', color: 'blue' },
        { value: 'salesman', label: 'Salesman', color: 'orange' },
        { value: 'tailor', label: 'Tailor', color: 'green' },
        { value: 'embroideryMan', label: 'Embroidery Man', color: 'pink' },
        { value: 'stoneMan', label: 'Stone Man', color: 'yellow' },
        { value: 'user', label: 'User', color: 'gray' }
      ],
      admin: [
        { value: 'manager', label: 'Manager', color: 'blue' },
        { value: 'salesman', label: 'Salesman', color: 'orange' },
        { value: 'tailor', label: 'Tailor', color: 'green' },
        { value: 'embroideryMan', label: 'Embroidery Man', color: 'pink' },
        { value: 'stoneMan', label: 'Stone Man', color: 'yellow' },
        { value: 'user', label: 'User', color: 'gray' }
      ],
      manager: [
        { value: 'salesman', label: 'Salesman', color: 'orange' },
        { value: 'tailor', label: 'Tailor', color: 'green' },
        { value: 'embroideryMan', label: 'Embroidery Man', color: 'pink' },
        { value: 'stoneMan', label: 'Stone Man', color: 'yellow' },
        { value: 'user', label: 'User', color: 'gray' }
      ]
    };

    return roleHierarchy[currentUserRole] || [];
  },

  // Delete user completely
  async deleteUser(userId, currentUserRole) {
    try {
      // Only superAdmin and admin can delete users
      if (!['superAdmin', 'admin'].includes(currentUserRole)) {
        throw new Error("শুধুমাত্র Super Admin এবং Admin ইউজার delete করতে পারবে");
      }

      // Get all user shop assignments
      const userShopsResponse = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.limit(100)]
      );

      const userAssignments = userShopsResponse.documents.filter(assignment => {
        if (Array.isArray(assignment.userId)) {
          return assignment.userId.some(u => u.$id === userId || u === userId);
        }
        return assignment.userId?.$id === userId || assignment.userId === userId;
      });

      // Remove user from all shops first
      if (userAssignments.length > 0) {
        const removePromises = userAssignments.map(assignment =>
          databases.updateDocument(
            DATABASE_ID,
            USER_SHOPS_COLLECTION_ID,
            assignment.$id,
            { status: 'inactive' }
          )
        );
        await Promise.all(removePromises);
      }

      // Finally delete the user
      return await databases.deleteDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // Get pending users (no shop assigned)
  async getPendingUsers() {
    try {
      const allUsers = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.orderDesc("$createdAt"), Query.limit(100)]
      );

      const userShops = await databases.listDocuments(
        DATABASE_ID,
        USER_SHOPS_COLLECTION_ID,
        [Query.equal("status", "active"), Query.limit(500)]
      );

      // Find users with no active shop assignments
      const pendingUsers = allUsers.documents.filter(user => {
        const hasActiveAssignment = userShops.documents.some(assignment => {
          const userMatch = Array.isArray(assignment.userId)
            ? assignment.userId.some(u => u.$id === user.$id || u === user.$id)
            : assignment.userId?.$id === user.$id || assignment.userId === user.$id;

          const hasShop = assignment.shopId &&
            (Array.isArray(assignment.shopId) ? assignment.shopId.length > 0 : true);

          return userMatch && hasShop && assignment.status === 'active';
        });

        return !hasActiveAssignment;
      });

      return pendingUsers;
    } catch (error) {
      console.error("Error fetching pending users:", error);
      throw error;
    }
  },

  // Bulk assign users to shop
  async bulkAssignToShop(userIds, shopId, role, currentUserRole) {
    try {
      if (!this.canAssignRole(currentUserRole, role)) {
        throw new Error("আপনার এই role assign করার অনুমতি নেই");
      }

      const results = await Promise.allSettled(
        userIds.map(userId => 
          this.assignUserRole(userId, shopId, role, null, currentUserRole)
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return { successful, failed };
    } catch (error) {
      console.error("Error in bulk assignment:", error);
      throw error;
    }
  },

  // Delete user mutation hook
  useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ userId, currentUserRole }) =>
        userManagementService.deleteUser(userId, currentUserRole),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("ইউজার সফলভাবে delete করা হয়েছে");
      },
      onError: (error) => {
        toast.error(error.message || "ইউজার delete করতে ব্যর্থ");
      },
    });
  }
};