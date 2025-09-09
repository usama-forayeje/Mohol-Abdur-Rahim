import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appwriteService } from "@/appwrite/appwrite";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

// Query Keys
export const queryKeys = {
  user: ["user"],
  userProfile: (userId) => ["userProfile", userId],
  customers: (shopId) => ["customers", shopId],
  shops: (userId) => ["shops", userId],
  transactions: (shopId, type) => ["transactions", shopId, type],
  orders: (shopId, status) => ["orders", shopId, status],
};

// Auth Queries
export const useUserQuery = () => {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: appwriteService.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useUserProfileQuery = (userId) => {
  return useQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: () => appwriteService.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// Shop Queries
export const useShopsQuery = (userId) => {
  return useQuery({
    queryKey: queryKeys.shops(userId),
    queryFn: () => appwriteService.getUserShops(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Customer Queries
export const useCustomersQuery = (shopId) => {
  return useQuery({
    queryKey: queryKeys.customers(shopId),
    queryFn: () => appwriteService.getCustomers(shopId),
    enabled: !!shopId,
    staleTime: 5 * 60 * 1000,
  });
};

// Auth Mutations
export const useLoginMutation = () => {
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: () => {
      toast.success("সফলভাবে লগইন হয়েছে!");
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
    onError: (error) => {
      toast.error(error.message || "লগইন করতে সমস্যা হয়েছে");
    },
  });
};

export const useRegisterMutation = () => {
  const { register } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, name }) => register(email, password, name),
    onSuccess: () => {
      toast.success("সফলভাবে অ্যাকাউন্ট তৈরি হয়েছে!");
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
    onError: (error) => {
      toast.error(error.message || "অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে");
    },
  });
};

export const useLogoutMutation = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("সফলভাবে লগআউট হয়েছে!");
      queryClient.clear(); // Clear all cached data
    },
    onError: (error) => {
      toast.error(error.message || "লগআউট করতে সমস্যা হয়েছে");
    },
  });
};

// Profile Mutations
export const useUpdateProfileMutation = () => {
  const { updateProfile } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      toast.success("প্রোফাইল আপডেট হয়েছে!");
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.setQueryData(queryKeys.userProfile(data.userId), data);
    },
    onError: (error) => {
      toast.error(error.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে");
    },
  });
};

// Customer Mutations
export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appwriteService.createCustomer,
    onSuccess: (data, variables) => {
      toast.success("কাস্টমার যোগ করা হয়েছে!");
      queryClient.invalidateQueries({
        queryKey: queryKeys.customers(variables.shopId),
      });
    },
    onError: (error) => {
      toast.error(error.message || "কাস্টমার যোগ করতে সমস্যা হয়েছে");
    },
  });
};

// Generic fetch hook
export const useFetch = (queryKey, queryFn, options = {}) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Generic mutation hook
export const useMutate = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(error.message || options.errorMessage || "একটি ত্রুটি ঘটেছে");
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};
