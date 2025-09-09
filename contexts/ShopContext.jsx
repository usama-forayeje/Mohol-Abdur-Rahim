"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { appwriteService } from "@/appwrite/appwrite";

const ShopContext = createContext({});

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};

export function ShopProvider({ children }) {
  const { isAuthenticated, userProfile, hasInitialized, isAdmin } =
    useAuthStore();

  const [currentShop, setCurrentShop] = useState(null);
  const [availableShops, setAvailableShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shopInitialized, setShopInitialized] = useState(false); // Load shops when user is ready

  useEffect(() => {
    if (
      hasInitialized() &&
      isAuthenticated &&
      userProfile &&
      !shopInitialized
    ) {
      loadShops();
    } else if (!isAuthenticated) {
      resetShops();
    }
  }, [hasInitialized(), isAuthenticated, userProfile, shopInitialized]);

  const resetShops = () => {
    setCurrentShop(null);
    setAvailableShops([]);
    setError(null);
    setShopInitialized(false);
  };

  const loadShops = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      if (isAdmin()) {
        // Admin - load all shops
        try {
          const shops = await appwriteService.getAllShops();
          setAvailableShops(shops);
          console.log("Fetched All Shops:", shops);

          if (shops.length > 0) {
            const savedShopId = localStorage.getItem("selectedShopId");
            const defaultShop = savedShopId
              ? shops.find((s) => s.$id === savedShopId) || shops[0]
              : shops[0];

            setCurrentShop(defaultShop);
            localStorage.setItem("selectedShopId", defaultShop.$id);
          }
        } catch (error) {
          console.error("Shop loading failed:", error);
          setError(error.message);
        }
      } else if (
        userProfile.role === "manager" &&
        userProfile.shopId &&
        userProfile.shopId.$id
      ) {
        // Manager - load specific shop
        try {
          // Fixed: Pass the string ID, not the object
          const shop = await appwriteService.getShop(userProfile.shopId.$id);
          setCurrentShop(shop);
          setAvailableShops([shop]);
        } catch (error) {
          setError("Shop loading failed: " + error.message);
        }
      }

      setShopInitialized(true);
    } catch (error) {
      console.error("Shop context error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchShop = (shopId) => {
    if (!isAdmin()) return;

    const shop = availableShops.find((s) => s.$id === shopId);
    if (shop) {
      setCurrentShop(shop);
      localStorage.setItem("selectedShopId", shopId);
    }
  };

  const refresh = () => {
    setShopInitialized(false);
    setError(null);
    if (isAuthenticated && userProfile) {
      loadShops();
    }
  };

  return (
    <ShopContext.Provider
      value={{
        currentShop,
        availableShops,
        isLoading,
        error,
        switchShop,
        refresh,
        canSwitchShops: isAdmin() && availableShops.length > 1,
        hasInitializedShop: shopInitialized,
      }}
    >
            {children}   {" "}
    </ShopContext.Provider>
  );
}
