import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useUserStore = create(
  devtools(
    (set, get) => ({
      users: [],
      selectedUser: null,
      searchQuery: "",
      roleFilter: "all",
      statusFilter: "all",

      setUsers: (users) => set({ users }),

      addUser: (user) =>
        set((state) => ({
          users: [user, ...state.users],
        })),

      updateUser: (updatedUser) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.$id === updatedUser.$id ? updatedUser : user
          ),
        })),

      removeUser: (userId) =>
        set((state) => ({
          users: state.users.filter((user) => user.$id !== userId),
        })),

      setSelectedUser: (user) => set({ selectedUser: user }),

      clearSelectedUser: () => set({ selectedUser: null }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setRoleFilter: (role) => set({ roleFilter: role }),

      setStatusFilter: (status) => set({ statusFilter: status }),

      clearFilters: () =>
        set({
          searchQuery: "",
          roleFilter: "all",
          statusFilter: "all",
        }),

      getFilteredUsers: () => {
        const state = get();
        const { users, searchQuery, roleFilter, statusFilter } = state;

        return users.filter((user) => {
          // Search filter
          const searchMatch =
            searchQuery === "" ||
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone?.toLowerCase().includes(searchQuery.toLowerCase());

          // Role filter
          const roleMatch = roleFilter === "all" || user.role === roleFilter;

          // Status filter
          const statusMatch =
            statusFilter === "all" || user.status === statusFilter;

          return searchMatch && roleMatch && statusMatch;
        });
      },

      getUsersByRole: (role) => {
        const state = get();
        return state.users.filter((user) => user.role === role);
      },

      getUsersByStatus: (status) => {
        const state = get();
        return state.users.filter((user) => user.status === status);
      },

      clearAll: () =>
        set({
          users: [],
          selectedUser: null,
          searchQuery: "",
          roleFilter: "all",
          statusFilter: "all",
        }),
    }),
    {
      name: "user-store",
    }
  )
);
