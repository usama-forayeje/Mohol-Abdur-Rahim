// appwrite/config.js - Environment configuration
export const appwriteConfig = {
  // Server Configuration
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,

  // Database Configuration
  databaseId:
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "68ad2cb1002bfcff4e09",
  storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID,

  // Collections Configuration
  collections: {
    // Core Collections
    users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "users",
    shops:
      process.env.NEXT_PUBLIC_APPWRITE_SHOPS_COLLECTION_ID ||
      "68ad364a00338a503d70",
    customers:
      process.env.NEXT_PUBLIC_APPWRITE_CUSTOMERS_COLLECTION_ID || "customers",

    // Order Management
    tailoringOrders:
      process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID ||
      "tailoring_orders",
    orderItems:
      process.env.NEXT_PUBLIC_APPWRITE_ORDER_ITEMS_COLLECTION_ID ||
      "order_items_and_tasks",
    catalog:
      process.env.NEXT_PUBLIC_APPWRITE_CATALOG_COLLECTION_ID || "catalog",

    // Financial
    transactions:
      process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID ||
      "transactions",
    payments:
      process.env.NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID || "payments",
    expenses:
      process.env.NEXT_PUBLIC_APPWRITE_EXPENSES_COLLECTION_ID || "expenses",
    salaries:
      process.env.NEXT_PUBLIC_APPWRITE_SALARIES_COLLECTION_ID || "salaries",

    // Inventory
    fabrics:
      process.env.NEXT_PUBLIC_APPWRITE_FABRICS_COLLECTION_ID || "fabrics",
    fabricSales:
      process.env.NEXT_PUBLIC_APPWRITE_FABRIC_SALES_COLLECTION_ID ||
      "fabric_sales",
    purchaseInvoices:
      process.env.NEXT_PUBLIC_APPWRITE_PURCHASE_INVOICES_COLLECTION_ID ||
      "purchase_invoices",
  },

  // Storage Buckets
  buckets: {
    avatars: process.env.NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID || "avatars",
    documents:
      process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTS_BUCKET_ID || "documents",
    images: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID || "images",
  },
};

// Validation function
export const validateAppwriteConfig = () => {
  const required = ["endpoint", "projectId", "databaseId"];
  const missing = [];

  for (const key of required) {
    if (!appwriteConfig[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const error = `Missing required Appwrite config: ${missing.join(
      ", "
    )}. Please check your .env.local file.`;
    console.error("❌ " + error);
    throw new Error(error);
  }

  console.log("✅ Appwrite configuration validated successfully");
  return true;
};

// Format currency
export function formatCurrency(amount, locale = "bn-BD") {
  if (amount === null || amount === undefined) return "৳০";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
export function formatDate(date, options = {}) {
  if (!date) return "তারিখ নেই";

  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("bn-BD", defaultOptions).format(
    new Date(date)
  );
}

// Format relative time
export function formatRelativeTime(date) {
  if (!date) return "সময় নেই";

  const rtf = new Intl.RelativeTimeFormat("bn", { numeric: "auto" });
  const diff = new Date(date) - new Date();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (Math.abs(days) > 0) {
    return rtf.format(days, "day");
  } else if (Math.abs(hours) > 0) {
    return rtf.format(hours, "hour");
  } else if (Math.abs(minutes) > 0) {
    return rtf.format(minutes, "minute");
  } else {
    return rtf.format(seconds, "second");
  }
}

// Truncate text
export function truncateText(text, length = 100) {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

// Get role name in Bengali
export function getRoleName(role) {
  const roleMap = {
    superAdmin: "সুপার অ্যাডমিন",
    admin: "অ্যাডমিন",
    manager: "ম্যানেজার",
    tailor: "দর্জি",
    user: "ব্যবহারকারী",
    salesman: "বিক্রয়কারী",
    embroideryMan: "এমব্রয়ডারি কারিগর",
    stoneMan: "স্টোন কারিগর",
  };

  return roleMap[role] || role;
}

// Get status name in Bengali
export function getStatusName(status) {
  const statusMap = {
    active: "সক্রিয়",
    inactive: "নিষ্ক্রিয়",
    pending: "অপেক্ষমান",
    completed: "সম্পন্ন",
    cancelled: "বাতিল",
    delivered: "ডেলিভারি",
    in_progress: "চলমান",
    paid: "পরিশোধিত",
    unpaid: "অপরিশোধিত",
  };

  return statusMap[status] || status;
}

// Constants
export const APP_CONSTANTS = {
  ROLES: {
    SUPER_ADMIN: "superAdmin",
    ADMIN: "admin",
    MANAGER: "manager",
    TAILOR: "tailor",
    USER: "user",
    SALESMAN: "salesman",
    EMBROIDERY_MAN: "embroideryMan",
    STONE_MAN: "stoneMan",
  },

  ORDER_STATUS: {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  },

  PAYMENT_STATUS: {
    PAID: "paid",
    UNPAID: "unpaid",
    PARTIAL: "partial",
  },

  PAYMENT_METHODS: {
    CASH: "cash",
    CARD: "card",
    ONLINE: "online",
    BANK: "bank",
  },

  TRANSACTION_TYPES: {
    TAILORING_ORDER: "tailoring_order",
    FABRIC_SALE: "fabric_sale",
    EXPENSE: "expense",
    SALARY: "salary",
  },
};

// Export individual configs
export const {
  endpoint,
  projectId,
  databaseId,
  storageId,
  collections,
  buckets,
} = appwriteConfig;
