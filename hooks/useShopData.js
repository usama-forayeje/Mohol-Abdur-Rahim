"use client";

import { useState, useEffect } from "react";
import { useShop } from "@/contexts/ShopContext";
import { useAuthStore } from "@/store/auth-store";
import { appwriteService } from "@/appwrite/appwrite";

export function useShopData(collection, options = {}) {
  const { currentShop } = useShop();
  const { isAdmin } = useAuthStore();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    autoRefresh = true,
    refreshInterval = null,
    additionalQueries = [],
    dependencies = []
  } = options;

  useEffect(() => {
    if (currentShop && autoRefresh) {
      loadData();
    }
  }, [currentShop, ...dependencies]);

  useEffect(() => {
    let interval;
    if (refreshInterval && currentShop) {
      interval = setInterval(loadData, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [refreshInterval, currentShop]);

  const loadData = async () => {
    if (!currentShop) return;
    
    try {
      setIsLoading(true);
      setError(null);

      let result;
      switch (collection) {
        case 'orders':
          result = await appwriteService.getShopOrders(currentShop.$id);
          break;
        case 'customers':
          result = await appwriteService.getShopCustomers(currentShop.$id);
          break;
        case 'transactions':
          result = await appwriteService.getShopTransactions(currentShop.$id);
          break;
        case 'fabrics':
          result = await appwriteService.getShopFabrics(currentShop.$id);
          break;
        case 'expenses':
          result = await appwriteService.getShopExpenses(currentShop.$id);
          break;
        case 'users':
          result = await appwriteService.getShopUsers(currentShop.$id);
          break;
        default:
          result = await appwriteService.getShopData(
            collection, 
            currentShop.$id, 
            additionalQueries
          );
      }
      
      setData(result);
      console.log(`✅ Loaded ${collection} for shop:`, currentShop.name);
    } catch (error) {
      console.error(`❌ Failed to load ${collection}:`, error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createItem = async (itemData) => {
    if (!currentShop) throw new Error("No shop selected");
    
    try {
      const newItem = await appwriteService.createShopDocument(
        collection,
        itemData,
        currentShop.$id
      );
      
      // Update local state
      setData(prev => [newItem, ...prev]);
      return newItem;
    } catch (error) {
      console.error(`❌ Failed to create ${collection}:`, error);
      throw error;
    }
  };

  const updateItem = async (itemId, updateData) => {
    if (!currentShop) throw new Error("No shop selected");
    
    try {
      const updatedItem = await appwriteService.updateShopDocument(
        collection,
        itemId,
        updateData,
        currentShop.$id,
        isAdmin()
      );
      
      // Update local state
      setData(prev => 
        prev.map(item => item.$id === itemId ? updatedItem : item)
      );
      
      return updatedItem;
    } catch (error) {
      console.error(`❌ Failed to update ${collection}:`, error);
      throw error;
    }
  };

  const deleteItem = async (itemId) => {
    if (!currentShop) throw new Error("No shop selected");
    
    try {
      await appwriteService.deleteShopDocument(
        collection,
        itemId,
        currentShop.$id,
        isAdmin()
      );
      
      // Update local state
      setData(prev => prev.filter(item => item.$id !== itemId));
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete ${collection}:`, error);
      throw error;
    }
  };

  return {
    data,
    isLoading,
    error,
    refresh: loadData,
    create: createItem,
    update: updateItem,
    delete: deleteItem,
    shopName: currentShop?.name,
    shopId: currentShop?.$id,
  };
}