import { databases, ID, Query } from "@/appwrite/appwrite";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFabricStore } from "@/store/fabric-store";
import { fabricService } from "@/services/fabric-service";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const FABRIC_SALES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FABRIC_SALES_COLLECTION_ID;
const TRANSACTIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID;
const PAYMENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID;
const FABRICS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FABRICS_COLLECTION_ID;

export const fabricSalesService = {
  async createFabricSale(saleData) {
    try {
      console.log("🛒 Starting fabric sale creation...", {
        shopId: saleData.shopId,
        customerId: saleData.customerId,
        soldBy: saleData.soldBy,
        itemsCount: saleData.items?.length,
      });

      // 1. Create transaction - Two-way relationships (Arrays)
      const transactionData = {
        type: "fabric_sale",
        transaction_date: new Date().toISOString(),
        total_amount: saleData.total_amount,
      };

      // Two-way relationships - Use arrays
      if (saleData.shopId) transactionData.shopId = [saleData.shopId];
      if (saleData.customerId)
        transactionData.customerId = [saleData.customerId];
      if (saleData.soldBy) transactionData.createdBy = saleData.soldBy;

      const transaction = await databases.createDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        ID.unique(),
        transactionData
      );

      console.log("✅ Transaction created:", transaction.$id);

      const stringifiedItems = (saleData.items || []).map((item) =>
        JSON.stringify(item)
      );
      // 2. Create fabric sale record - Mixed relationships
      const netAmount = saleData.total_amount - (saleData.discount_amount || 0);
      const paymentStatus =
        (saleData.payment_amount || 0) >= netAmount ? "paid" : "pending";

      console.log("=== CREATE SALE PAYMENT DEBUG ===");
      console.log("Total Amount:", saleData.total_amount);
      console.log("Discount Amount:", saleData.discount_amount);
      console.log("Payment Amount:", saleData.payment_amount);
      console.log("Net Amount:", netAmount);
      console.log("Payment Status:", paymentStatus);

      const fabricSaleData = {
        // One-way relationships - Single IDs
        transactionId: transaction.$id, // Single ID
        sale_date: new Date().toISOString(),
        total_amount: saleData.total_amount,
        total_cost_of_goods: saleData.total_cost_of_goods,
        items: stringifiedItems || [],
        discount_amount: saleData.discount_amount || 0,
        payment_amount: saleData.payment_amount || 0,
        payment_status: paymentStatus,
        notes: saleData.notes || "",
      };

      console.log("📦 Fabric sale data to save:", fabricSaleData);

      // One-way relationships - Single IDs
      if (saleData.shopId) fabricSaleData.shopId = saleData.shopId; // Single ID
      if (saleData.soldBy) fabricSaleData.soldBy = saleData.soldBy; // Single ID

      // Two-way relationship with customers
      if (saleData.customerId) fabricSaleData.customersId = saleData.customerId; // Array for two-way

      const fabricSale = await databases.createDocument(
        DATABASE_ID,
        FABRIC_SALES_COLLECTION_ID,
        ID.unique(),
        fabricSaleData
      );

      console.log("✅ Fabric sale created:", fabricSale.$id);
      console.log("📋 Saved fabric sale data:", fabricSale);

      // 3. Create payment record - One-way relationships
      if (saleData.payment_amount > 0) {
        const paymentData = {
          // One-way relationships - Single IDs
          transactions: transaction.$id, // Single ID (field name is 'transactions' but it's one-way)
          amount: saleData.payment_amount,
          payment_date: new Date().toISOString(),
          payment_method: saleData.payment_method,
        };

        // One-way relationship - Single ID
        if (saleData.soldBy) paymentData.paidBy = saleData.soldBy; // Single ID

        await databases.createDocument(
          DATABASE_ID,
          PAYMENTS_COLLECTION_ID,
          ID.unique(),
          paymentData
        );
        console.log("✅ Payment record created");
      }

      // 4. Update fabric stock
      for (const item of saleData.items) {
        try {
          const fabric = await databases.getDocument(
            DATABASE_ID,
            FABRICS_COLLECTION_ID,
            item.fabricId
          );

          const newStock = Math.max(0, fabric.stock_quantity - item.quantity);
          await databases.updateDocument(
            DATABASE_ID,
            FABRICS_COLLECTION_ID,
            item.fabricId,
            { stock_quantity: newStock }
          );
          console.log(`✅ Updated stock for ${item.fabricId}: ${newStock}`);
        } catch (error) {
          console.error(`❌ Error updating stock for ${item.fabricId}:`, error);
        }
      }

      return {
        transaction,
        fabricSale,
        success: true,
        message: "ফ্যাব্রিক বিক্রয় সফলভাবে সম্পন্ন হয়েছে",
      };
    } catch (error) {
      console.error("❌ Error creating fabric sale:", error);

      let errorMessage = "ফ্যাব্রিক বিক্রয় সংরক্ষণ করতে সমস্যা হয়েছে";

      if (error.message.includes("relationship")) {
        errorMessage =
          "ডেটাবেজ সম্পর্ক সেটআপে সমস্যা। দয়া করে নিচের নির্দেশনা অনুসরণ করুন।";
      }

      throw new Error(`${errorMessage}`);
    }
  },

  // Alternative method to test with minimal data
  async createMinimalTransaction(saleData) {
    try {
      console.log("🧪 Testing minimal transaction creation...");

      // Create transaction with NO relationship fields first
      const minimalTransactionData = {
        type: "fabric_sale",
        transaction_date: new Date().toISOString(),
        total_amount: saleData.total_amount,
      };

      console.log("📦 Minimal transaction data:", minimalTransactionData);

      const transaction = await databases.createDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        ID.unique(),
        minimalTransactionData
      );

      console.log(
        "✅ Minimal transaction created successfully:",
        transaction.$id
      );
      return transaction;
    } catch (error) {
      console.error("❌ Even minimal transaction failed:", error);
      throw error;
    }
  },

  // Rest of the methods remain the same
  async getFabricSales(shopId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FABRIC_SALES_COLLECTION_ID,
        [
          Query.equal("shopId", shopId),
          Query.orderDesc("sale_date"),
          Query.limit(50),
        ]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching fabric sales:", error);
      throw new Error("বিক্রয় তথ্য লোড করতে সমস্যা হয়েছে");
    }
  },

  async getFabricSale(saleId) {
    try {
      const sale = await databases.getDocument(
        DATABASE_ID,
        FABRIC_SALES_COLLECTION_ID,
        saleId
      );
      return sale;
    } catch (error) {
      console.error("Error fetching fabric sale:", error);
      throw new Error("বিক্রয়ের বিস্তারিত তথ্য লোড করতে সমস্যা হয়েছে");
    }
  },

  async getFabricSalesReport(shopId, startDate, endDate) {
    try {
      const queries = [
        Query.equal("shopId", shopId),
        Query.orderDesc("sale_date"),
      ];

      if (startDate) {
        queries.push(Query.greaterThanEqual("sale_date", startDate));
      }
      if (endDate) {
        queries.push(Query.lessThanEqual("sale_date", endDate));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        FABRIC_SALES_COLLECTION_ID,
        queries
      );

      return response.documents;
    } catch (error) {
      console.error("Error fetching fabric sales report:", error);
      throw new Error("বিক্রয় রিপোর্ট লোড করতে সমস্যা হয়েছে");
    }
  },

  async updateFabricSale(saleId, data) {
    try {
      console.log("🔄 Updating fabric sale:", saleId, data);

      // First, get the existing sale to compare quantities
      console.log("📦 Fetching existing sale data...");
      const existingSale = await databases.getDocument(
        DATABASE_ID,
        FABRIC_SALES_COLLECTION_ID,
        saleId
      );

      console.log("📋 Existing sale items:", existingSale.items);

      // Parse existing items
      let existingItems = [];
      if (typeof existingSale.items === "string") {
        try {
          const parsed = JSON.parse(existingSale.items);
          existingItems = Array.isArray(parsed) ? parsed : [parsed];
          console.log("Parsed existing items from string:", existingItems);
        } catch (e) {
          console.error("Error parsing existing items:", e);
          existingItems = [];
        }
      } else if (Array.isArray(existingSale.items)) {
        existingItems = existingSale.items
          .map((item) => {
            if (typeof item === "string") {
              try {
                return JSON.parse(item);
              } catch (e) {
                console.error("Error parsing individual item:", e);
                return null;
              }
            }
            return item;
          })
          .filter(Boolean);
        console.log("Parsed existing items from array:", existingItems);
      }

      // Stringify new items for database
      const stringifiedItems = data.items.map((item) =>
        JSON.stringify({
          fabricId: item.fabricId,
          quantity: item.quantity,
          sale_price: item.sale_price,
        })
      );

      // Calculate payment status
      const netAmount = data.totalAmount - data.discountAmount;
      const paymentStatus =
        (data.paymentAmount || 0) >= netAmount ? "paid" : "pending";

      console.log("=== PAYMENT STATUS CALCULATION ===");
      console.log("Total Amount:", data.totalAmount);
      console.log("Discount Amount:", data.discountAmount);
      console.log("Payment Amount:", data.paymentAmount);
      console.log("Net Amount:", netAmount);
      console.log("Payment Status:", paymentStatus);

      const updatePayload = {
        items: stringifiedItems,
        total_amount: data.totalAmount,
        discount_amount: data.discountAmount,
        payment_amount: data.paymentAmount || 0,
        payment_status: paymentStatus,
        notes: data.notes,
        customersId: data.customerId || null,
      };

      console.log("📦 Update payload:", updatePayload);

      // Update the sale record
      const result = await databases.updateDocument(
        DATABASE_ID,
        FABRIC_SALES_COLLECTION_ID,
        saleId,
        updatePayload
      );

      console.log("✅ Fabric sale updated successfully:", result);

      // Handle stock adjustments
      console.log("📦 Starting stock adjustments...");

      // Create lookup maps for easy comparison
      const existingItemsMap = new Map();
      existingItems.forEach((item) => {
        if (item && item.fabricId) {
          existingItemsMap.set(item.fabricId, item);
        }
      });

      const newItemsMap = new Map();
      data.items.forEach((item) => {
        if (item && item.fabricId) {
          newItemsMap.set(item.fabricId, item);
        }
      });

      // Process each fabric for stock adjustment
      const allFabricIds = new Set([
        ...existingItemsMap.keys(),
        ...newItemsMap.keys(),
      ]);

      for (const fabricId of allFabricIds) {
        try {
          const existingItem = existingItemsMap.get(fabricId);
          const newItem = newItemsMap.get(fabricId);

          const existingQuantity = Number(existingItem?.quantity) || 0;
          const newQuantity = Number(newItem?.quantity) || 0;

          console.log(`🔄 Processing fabric ${fabricId}:`);
          console.log(`   Existing quantity in sale: ${existingQuantity}`);
          console.log(`   New quantity in sale: ${newQuantity}`);

          if (existingQuantity !== newQuantity) {
            // Get current fabric stock
            const fabric = await databases.getDocument(
              DATABASE_ID,
              FABRICS_COLLECTION_ID,
              fabricId
            );

            const currentStock = Number(fabric.stock_quantity) || 0;
            const quantityDifference = existingQuantity - newQuantity;

            console.log(`📊 Stock adjustment for ${fabricId}:`);
            console.log(`   Current stock: ${currentStock}`);
            console.log(
              `   Quantity difference: ${quantityDifference} (${existingQuantity} - ${newQuantity})`
            );

            // Stock adjustment logic:
            // If quantityDifference > 0 (selling less), add back to stock
            // If quantityDifference < 0 (selling more), subtract from stock
            const newStock = currentStock + quantityDifference;

            console.log(
              `📦 Stock adjustment: ${currentStock} + ${quantityDifference} = ${newStock}`
            );

            await databases.updateDocument(
              DATABASE_ID,
              FABRICS_COLLECTION_ID,
              fabricId,
              { stock_quantity: Math.max(0, newStock) }
            );

            console.log(
              `✅ Updated stock for ${fabricId}: ${Math.max(0, newStock)} गज`
            );
          } else {
            console.log(
              `ℹ️ No quantity change for ${fabricId}, skipping stock update`
            );
          }
        } catch (error) {
          console.error(`❌ Error updating stock for ${fabricId}:`, error);
          // Don't throw error here, just log it - the sale update was successful
        }
      }

      console.log("🎉 Stock adjustments completed successfully");
      return result;
    } catch (error) {
      console.error("❌ Error updating fabric sale:", error);
      throw new Error("বিক্রয় তথ্য পরিবর্তন করতে সমস্যা হয়েছে");
    }
  },
  async deleteFabricSale(saleId) {
    try {
      return await databases.deleteDocument(
        DATABASE_ID,
        FABRIC_SALES_COLLECTION_ID,
        saleId
      );
    } catch (error) {
      console.error("Error deleting fabric sale:", error);
      throw new Error("বিক্রয় তথ্য মুছে ফেলতে সমস্যা হয়েছে");
    }
  },
};

// React Query Hooks remain the same...
export const fabricSalesKeys = {
  all: ["fabric-sales"],
  lists: () => [...fabricSalesKeys.all, "list"],
  list: (filters) => [...fabricSalesKeys.lists(), filters],
  details: () => [...fabricSalesKeys.all, "detail"],
  detail: (id) => [...fabricSalesKeys.details(), id],
  reports: () => [...fabricSalesKeys.all, "report"],
  report: (filters) => [...fabricSalesKeys.reports(), filters],
};

export function useCreateFabricSale() {
  const queryClient = useQueryClient();
  const updateFabricStock = useFabricStore((state) => state.updateFabricStock);
  const refreshFabrics = useFabricStore((state) => state.refreshFabrics);

  return useMutation({
    mutationFn: fabricSalesService.createFabricSale,
    onSuccess: async (data, variables) => {
      // Update stock in the fabric store for real-time UI updates
      variables.items.forEach((item) => {
        updateFabricStock(item.fabricId, -item.quantity);
      });

      // Refresh fabrics data from database to ensure consistency
      try {
        const updatedFabrics = await fabricService.getFabrics();
        refreshFabrics(updatedFabrics);
      } catch (error) {
        console.error("Error refreshing fabrics after sale:", error);
      }

      // Invalidate all related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: fabricSalesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["fabrics"] });
      queryClient.invalidateQueries({ queryKey: ["fabric-sales"] });
      queryClient.invalidateQueries({ queryKey: ["fabric-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });

      console.log("🔄 All related queries invalidated after sale creation");
    },
    onError: (error, variables) => {
      console.error("❌ Fabric sale mutation failed:", error);
    },
  });
}

export function useFabricSales(shopId) {
  return useQuery({
    queryKey: fabricSalesKeys.list({ shopId }),
    queryFn: () => fabricSalesService.getFabricSales(shopId),
    enabled: !!shopId,
  });
}

export function useFabricSale(saleId) {
  return useQuery({
    queryKey: fabricSalesKeys.detail(saleId),
    queryFn: () => fabricSalesService.getFabricSale(saleId),
    enabled: !!saleId,
  });
}

export function useUpdateFabricSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ saleId, data }) =>
      fabricSalesService.updateFabricSale(saleId, data),
    onSuccess: (result, variables) => {
      console.log("✅ Update mutation successful:", result);

      // Invalidate all related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: fabricSalesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["fabric-sales"] });
      queryClient.invalidateQueries({
        queryKey: fabricSalesKeys.detail(variables.saleId),
      });

      // Critical: Invalidate fabrics queries for real-time stock updates
      queryClient.invalidateQueries({ queryKey: ["fabrics"] });
      queryClient.invalidateQueries({ queryKey: ["fabric-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });

      console.log("🔄 All related queries invalidated for real-time updates");
    },
    onError: (error, variables) => {
      console.error("❌ Update mutation failed:", error);
    },
  });
}

export function useDeleteFabricSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fabricSalesService.deleteFabricSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fabricSalesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["fabric-sales"] });
    },
  });
}

export function useFabricSalesReport(shopId, startDate, endDate) {
  return useQuery({
    queryKey: fabricSalesKeys.report({ shopId, startDate, endDate }),
    queryFn: () =>
      fabricSalesService.getFabricSalesReport(shopId, startDate, endDate),
    enabled: !!shopId,
  });
}
