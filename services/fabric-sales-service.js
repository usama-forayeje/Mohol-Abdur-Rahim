import { databases, ID, Query } from "@/appwrite/appwrite";
import { useFabricStore } from "@/store/fabric-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
      if (saleData.customerId) transactionData.customerId = [saleData.customerId];
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
      const fabricSaleData = {
        // One-way relationships - Single IDs
        transactionId: transaction.$id, // Single ID
        sale_date: new Date().toISOString(),
        total_amount: saleData.total_amount,
        total_cost_of_goods: saleData.total_cost_of_goods,
        items: stringifiedItems || [],
        discount_amount: saleData.discount_amount || 0,
        notes: saleData.notes || "",
        payment_status:
          saleData.payment_amount >= saleData.total_amount ? "paid" : "pending",
      };

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

  return useMutation({
    mutationFn: fabricSalesService.createFabricSale,
    onSuccess: (data, variables) => {
      variables.items.forEach((item) => {
        updateFabricStock(item.fabricId, -item.quantity);
      });

      queryClient.invalidateQueries({ queryKey: fabricSalesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["fabrics"] });
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

export function useFabricSalesReport(shopId, startDate, endDate) {
  return useQuery({
    queryKey: fabricSalesKeys.report({ shopId, startDate, endDate }),
    queryFn: () =>
      fabricSalesService.getFabricSalesReport(shopId, startDate, endDate),
    enabled: !!shopId,
  });
}
