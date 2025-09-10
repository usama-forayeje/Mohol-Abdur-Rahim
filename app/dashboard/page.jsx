"use client";

import React from "react";
import { useAuthStore } from "@/store/auth-store";
import { ProtectedRoute } from "@/components/ProtectedRotue";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Building2,
  Users,
  DollarSign,
  CreditCard,
  Activity,
  ShoppingBag,
  Package,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  Star,
  Calendar,
  Filter,
  Download,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { useShopData } from "@/hooks/useShopData";
import { useShop } from "@/contexts/ShopContext";

// Mock data for different shops
const shopData = {
  "shop-1": {
    name: "মহল আব্দুর রহীম ১",
    totalRevenue: "৳৮৫,২৪০.৭৮",
    totalCustomers: "+৩,৫৬০",
    totalSales: "+১৮,৯৪৫",
    activeNow: "+৮১",
    revenueGrowth: "+২৮.৫%",
    customerGrowth: "+২৪.৩%",
    salesGrowth: "+৩২.১%",
    activeGrowth: "+৪৫",
    monthlySales: [
      { name: "জানু", total: 4500, orders: 234, customers: 156 },
      { name: "ফেব্রু", total: 3200, orders: 189, customers: 134 },
      { name: "মার্চ", total: 5800, orders: 298, customers: 198 },
      { name: "এপ্রি", total: 4900, orders: 267, customers: 187 },
      { name: "মে", total: 6200, orders: 334, customers: 223 },
      { name: "জুন", total: 7100, orders: 378, customers: 267 },
      { name: "জুলা", total: 8500, orders: 456, customers: 334 },
      { name: "আগস্ট", total: 7800, orders: 423, customers: 298 },
      { name: "সেপ্টে", total: 9200, orders: 498, customers: 378 },
      { name: "অক্টো", total: 8900, orders: 467, customers: 345 },
      { name: "নভে", total: 7600, orders: 398, customers: 289 },
      { name: "ডিসে", total: 8300, orders: 445, customers: 334 },
    ],
    recentSales: [
      {
        name: "আহমেদ আলী",
        email: "ahmed@email.com",
        amount: "৳৮,৫০০.০০",
        product: "iPhone 15 Pro",
        time: "২ মিনিট আগে",
      },
      {
        name: "ফাতেমা খান",
        email: "fatema@email.com",
        amount: "৳৩,২০০.০০",
        product: "MacBook Air",
        time: "৫ মিনিট আগে",
      },
      {
        name: "করিম উদ্দিন",
        email: "karim@email.com",
        amount: "৳১,৮০০.০০",
        product: "AirPods Pro",
        time: "১০ মিনিট আগে",
      },
      {
        name: "রাহেলা বেগম",
        email: "rahela@email.com",
        amount: "৳৪,৫০০.০০",
        product: "iPad Pro",
        time: "১৫ মিনিট আগে",
      },
      {
        name: "মোহাম্মদ রহিম",
        email: "rahim@email.com",
        amount: "৳২,৯০০.০০",
        product: "Apple Watch",
        time: "২০ মিনিট আগে",
      },
    ],
    categoryData: [
      { name: "ইলেক্ট্রনিক্স", value: 45 },
      { name: "ফোন", value: 25 },
      { name: "ল্যাপটপ", value: 15 },
      { name: "গেমিং", value: 10 },
      { name: "অন্যান্য", value: 5 },
    ],
  },
  "shop-2": {
    name: "মহল আব্দুর রহিম ২",
    totalRevenue: "৳৬২,৮৯০.৪৫",
    totalCustomers: "+২,৮৯০",
    totalSales: "+১৪,৬৭৮",
    activeNow: "+৬৫৪",
    revenueGrowth: "+১৮.৭%",
    customerGrowth: "+১৫.২%",
    salesGrowth: "+২১.৮%",
    activeGrowth: "+৩২",
    monthlySales: [
      { name: "জানু", total: 3200, orders: 167, customers: 123 },
      { name: "ফেব্রু", total: 2800, orders: 145, customers: 98 },
      { name: "মার্চ", total: 4100, orders: 198, customers: 156 },
      { name: "এপ্রি", total: 3600, orders: 178, customers: 134 },
      { name: "মে", total: 4800, orders: 234, customers: 189 },
      { name: "জুন", total: 5300, orders: 267, customers: 198 },
      { name: "জুলা", total: 6200, orders: 298, customers: 234 },
      { name: "আগস্ট", total: 5800, orders: 278, customers: 213 },
      { name: "সেপ্টে", total: 6700, orders: 334, customers: 267 },
      { name: "অক্টো", total: 6100, orders: 298, customers: 245 },
      { name: "নভে", total: 5400, orders: 267, customers: 198 },
      { name: "ডিসে", total: 5900, orders: 289, customers: 223 },
    ],
    recentSales: [
      {
        name: "সাকিব হাসান",
        email: "sakib@email.com",
        amount: "৳৩,৫০০.০০",
        product: "Designer Suit",
        time: "১ মিনিট আগে",
      },
      {
        name: "নুসরাত জাহান",
        email: "nusrat@email.com",
        amount: "৳২,৮০০.০০",
        product: "Bridal Dress",
        time: "৪ মিনিট আগে",
      },
      {
        name: "তানভীর আহমেদ",
        email: "tanvir@email.com",
        amount: "৳১,২০০.০০",
        product: "Casual Wear",
        time: "৮ মিনিট আগে",
      },
      {
        name: "রুমানা আক্তার",
        email: "rumana@email.com",
        amount: "৳৪,২০০.০০",
        product: "Evening Gown",
        time: "১২ মিনিট আগে",
      },
      {
        name: "শাহরিয়ার কবির",
        email: "shahriar@email.com",
        amount: "৳২,১০০.০০",
        product: "Formal Shirt",
        time: "১৮ মিনিট আগে",
      },
    ],
    categoryData: [
      { name: "পুরুষের পোশাক", value: 35 },
      { name: "মহিলা পোশাক", value: 30 },
      { name: "জুতা", value: 20 },
      { name: "ব্যাগ", value: 10 },
      { name: "অ্যাক্সেসরিজ", value: 5 },
    ],
  },
  "shop-3": {
    name: "মহল আব্দুর রহীম ৩",
    totalRevenue: "৳৩৮,৯৬৫.২৩",
    totalCustomers: "+১,৭৮৯",
    totalSales: "+৯,৮৪৫",
    activeNow: "+৩২৩",
    revenueGrowth: "+১২.৩%",
    customerGrowth: "+৯.৮%",
    salesGrowth: "+১০.৪%",
    activeGrowth: "+১৮",
    monthlySales: [
      { name: "জানু", total: 2100, orders: 98, customers: 67 },
      { name: "ফেব্রু", total: 1800, orders: 89, customers: 56 },
      { name: "মার্চ", total: 2600, orders: 123, customers: 89 },
      { name: "এপ্রি", total: 2300, orders: 109, customers: 78 },
      { name: "মে", total: 2900, orders: 134, customers: 98 },
      { name: "জুন", total: 3200, orders: 145, customers: 109 },
      { name: "জুলা", total: 3800, orders: 167, customers: 123 },
      { name: "আগস্ট", total: 3500, orders: 156, customers: 112 },
      { name: "সেপ্টে", total: 4100, orders: 189, customers: 134 },
      { name: "অক্টো", total: 3700, orders: 167, customers: 123 },
      { name: "নভে", total: 3300, orders: 145, customers: 98 },
      { name: "ডিসে", total: 3600, orders: 156, customers: 109 },
    ],
    recentSales: [
      {
        name: "ড. আব্দুল করিম",
        email: "karim@email.com",
        amount: "৳১,৮০০.০০",
        product: "Academic Books",
        time: "৩ মিনিট আগে",
      },
      {
        name: "ফরিদা আক্তার",
        email: "farida@email.com",
        amount: "৳৯৫০.০০",
        product: "Novel Collection",
        time: "৬ মিনিট আগে",
      },
      {
        name: "রফিকুল ইসলাম",
        email: "rafiq@email.com",
        amount: "৳১,২০০.০০",
        product: "Religious Books",
        time: "৯ মিনিট আগে",
      },
      {
        name: "সালমা খাতুন",
        email: "salma@email.com",
        amount: "৳৭৫০.০০",
        product: "Children Books",
        time: "১৪ মিনিট আগে",
      },
      {
        name: "আনোয়ার হোসেন",
        email: "anwar@email.com",
        amount: "৳২,১০০.০০",
        product: "Medical Books",
        time: "২২ মিনিট আগে",
      },
    ],
    categoryData: [
      { name: "পুরুষ", value: 40 },
      { name: "মহিলা", value: 25 },
      { name: "বোরখা", value: 15 },
      { name: "ওরনা", value: 12 },
      { name: "অন্যান্য", value: 8 },
    ],
  },
};

function DashboardContent() {
  const router = useRouter();
  const { userProfile, isAdmin } = useAuthStore();
  const {
    currentShop,
    availableShops,
    error,
    refresh,
    isLoading,
    hasInitializedShop,
  } = useShop();
  const { theme, resolvedTheme } = useTheme();
  console.log(availableShops);
  console.log(currentShop);

  // Determine if we're in dark mode
  const isDarkMode = resolvedTheme === "dark" || theme === "dark";

  // Theme-based colors
  const getThemeColors = () => {
    if (isDarkMode) {
      return {
        primary: "#3b82f6", // blue-500
        primaryGradient: ["#3b82f6", "#1d4ed8"], // blue-500 to blue-700
        secondary: "#10b981", // emerald-500
        secondaryGradient: ["#10b981", "#047857"], // emerald-500 to emerald-700
        tertiary: "#f59e0b", // amber-500
        quaternary: "#8b5cf6", // violet-500
        quinary: "#ef4444", // red-500
        gridColor: "#374151", // gray-700
        textColor: "#f3f4f6", // gray-100
        mutedText: "#9ca3af", // gray-400
        cardBg: "#1f2937", // gray-800
        borderColor: "#4b5563", // gray-600
      };
    } else {
      return {
        primary: "#2563eb", // blue-600
        primaryGradient: ["#3b82f6", "#1e40af"], // blue-500 to blue-800
        secondary: "#059669", // emerald-600
        secondaryGradient: ["#10b981", "#065f46"], // emerald-500 to emerald-800
        tertiary: "#d97706", // amber-600
        quaternary: "#7c3aed", // violet-600
        quinary: "#dc2626", // red-600
        gridColor: "#e5e7eb", // gray-200
        textColor: "#111827", // gray-900
        mutedText: "#6b7280", // gray-500
        cardBg: "#ffffff", // white
        borderColor: "#d1d5db", // gray-300
      };
    }
  };

  const colors = getThemeColors();

  // Dynamic category colors
  const categoryColors = [
    colors.primary,
    colors.secondary,
    colors.tertiary,
    colors.quaternary,
    colors.quinary,
  ];

  // Get current shop data based on shop ID
  const getCurrentShopData = () => {
    if (!currentShop) return shopData["shop-1"]; // fallback

    const shopKey =
      Object.keys(shopData).find((key, index) => {
        return (
          availableShops.findIndex((shop) => shop.$id === currentShop.$id) ===
          index
        );
      }) || "shop-1";

    return shopData[shopKey] || shopData["shop-1"];
  };

  const currentShopData = getCurrentShopData();

  // Add colors to category data
  const categoryDataWithColors = currentShopData.categoryData.map(
    (item, index) => ({
      ...item,
      color: categoryColors[index % categoryColors.length],
    })
  );

  // Loading state
  if (!hasInitializedShop && isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">
                দোকানের তথ্য লোড হচ্ছে...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // No Shop Message
  if (isAdmin() && !currentShop && availableShops.length === 0 && !error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">
                কোনো দোকান পাওয়া যায়নি
              </h3>
              <p className="text-muted-foreground mb-6">
                প্রথমে একটি দোকান তৈরি করুন।
              </p>
              <Button onClick={() => router.push("/dashboard/shops/create")}>
                নতুন দোকান তৈরি করুন
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                ব্যবসায়িক ড্যাশবোর্ড
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentShop ? currentShop.name : "দোকান নাম নেই"} - রিয়েল টাইম
                ডেটা
              </p>
            </div>
          </div>
          <Button className="w-full lg:w-auto">
            <Download className="w-4 h-4 mr-2" />
            রিপোর্ট ডাউনলোড
          </Button>
        </div>

        <Separator />

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>ত্রুটি</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{String(error)}</span>
              <Button onClick={refresh} size="sm" variant="outline">
                আবার চেষ্টা করুন
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                মোট আয়
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentShopData.totalRevenue}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <p className="text-xs text-green-500 font-medium">
                  {currentShopData.revenueGrowth} গত মাস থেকে
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                গ্রাহক
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentShopData.totalCustomers}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <p className="text-xs text-blue-500 font-medium">
                  {currentShopData.customerGrowth} গত মাস থেকে
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                মোট বিক্রি
              </CardTitle>
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentShopData.totalSales}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-3 h-3 text-orange-500" />
                <p className="text-xs text-orange-500 font-medium">
                  {currentShopData.salesGrowth} গত মাস থেকে
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                সক্রিয় এখন
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentShopData.activeNow}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <Zap className="w-3 h-3 text-purple-500" />
                <p className="text-xs text-purple-500 font-medium">
                  +{currentShopData.activeGrowth} গত ঘন্টায়
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">ওভারভিউ</TabsTrigger>
            <TabsTrigger value="analytics">বিশ্লেষণ</TabsTrigger>
            <TabsTrigger value="reports">রিপোর্ট</TabsTrigger>
            <TabsTrigger value="notifications">নোটিফিকেশন</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart */}
              <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        বিক্রয় বিশ্লেষণ
                      </CardTitle>
                      <CardDescription className="text-sm">
                        মাসিক বিক্রয় ও অর্ডার ট্রেন্ড
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Filter className="w-4 h-4" />
                      <span>ফিল্টার</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                      data={currentShopData.monthlySales}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={colors.primaryGradient[0]}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={colors.primaryGradient[1]}
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorOrders"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={colors.secondaryGradient[0]}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={colors.secondaryGradient[1]}
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={colors.gridColor}
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        stroke={colors.mutedText}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={colors.mutedText}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `৳${value}`}
                      />
                      <Tooltip
                        cursor={{
                          strokeDasharray: "3 3",
                          stroke: colors.mutedText,
                          opacity: 0.5,
                        }}
                        contentStyle={{
                          backgroundColor: colors.cardBg,
                          border: `1px solid ${colors.borderColor}`,
                          borderRadius: "8px",
                          color: colors.textColor,
                          boxShadow: isDarkMode
                            ? "0px 4px 20px rgba(0,0,0,0.5)"
                            : "0px 4px 20px rgba(0,0,0,0.15)",
                          padding: "12px",
                        }}
                        labelStyle={{
                          color: colors.primary,
                          fontWeight: "bold",
                          marginBottom: "8px",
                        }}
                        itemStyle={{
                          color: colors.textColor,
                          padding: "2px 0",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: 20 }}
                        iconType="line"
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke={colors.primary}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="আয় (৳)"
                        activeDot={{
                          r: 6,
                          fill: colors.primary,
                          stroke: colors.cardBg,
                          strokeWidth: 2,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="orders"
                        stroke={colors.secondary}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorOrders)"
                        name="অর্ডার সংখ্যা"
                        activeDot={{
                          r: 6,
                          fill: colors.secondary,
                          stroke: colors.cardBg,
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    পণ্যের ক্যাটাগরি
                  </CardTitle>
                  <CardDescription className="text-sm">
                    বিক্রয়ের শতকরা হার
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryDataWithColors}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelStyle={{
                          fill: colors.textColor,
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {categoryDataWithColors.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke={colors.cardBg}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: colors.cardBg,
                          border: `1px solid ${colors.borderColor}`,
                          borderRadius: "8px",
                          color: colors.textColor,
                          boxShadow: isDarkMode
                            ? "0px 4px 20px rgba(0,0,0,0.5)"
                            : "0px 4px 20px rgba(0,0,0,0.15)",
                          padding: "12px",
                        }}
                        formatter={(value, name) => [`${value}%`, name]}
                        labelStyle={{
                          color: colors.primary,
                          fontWeight: "bold",
                        }}
                      />
                      <Legend
                        align="center"
                        verticalAlign="bottom"
                        layout="horizontal"
                        wrapperStyle={{
                          paddingTop: 20,
                          color: colors.textColor,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {categoryDataWithColors.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full shadow-sm"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sales & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Sales */}
              <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        সাম্প্রতিক বিক্রয়
                      </CardTitle>
                      <CardDescription className="text-sm">
                        আজকের লেনদেন তালিকা
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>সব দেখুন</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentShopData.recentSales.map((sale, index) => (
                      <div
                        key={index}
                        className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-card/50 hover:bg-card transition-all hover:scale-[1.02] cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg ring-2 ring-primary/50">
                          {sale.name.charAt(0)}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-base font-medium">{sale.name}</p>
                            <div className="text-xl font-bold text-green-600 dark:text-green-400">
                              {sale.amount}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">
                              {sale.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sale.time}
                            </p>
                          </div>
                          <p className="text-xs mt-1 text-primary font-semibold">
                            {sale.product}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    দ্রুত কার্যক্রম
                  </CardTitle>
                  <CardDescription className="text-sm">
                    আপনার ব্যবসার জন্য দ্রুত শর্টকাট
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-6 items-center justify-center space-y-1 group hover:bg-primary/10 transition-colors"
                    onClick={() =>
                      router.push(`/dashboard/shops/edit/${currentShop.$id}`)
                    }
                  >
                    <ShoppingBag className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium text-primary group-hover:text-primary transition-colors">
                      নতুন পণ্য যোগ করুন
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-6 items-center justify-center space-y-1 group hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    onClick={() => router.push(`/dashboard/orders`)}
                  >
                    <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      অর্ডার দেখুন
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-6 items-center justify-center space-y-1 group hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    onClick={() => router.push(`/dashboard/customers`)}
                  >
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      গ্রাহকদের তালিকা
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-6 items-center justify-center space-y-1 group hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    onClick={() => router.push(`/dashboard/products/create`)}
                  >
                    <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      নতুন পণ্য তৈরি
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart - Monthly Comparison */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    মাসিক তুলনা
                  </CardTitle>
                  <CardDescription className="text-sm">
                    গ্রাহক ও অর্ডারের তুলনামূলক বিশ্লেষণ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={currentShopData.monthlySales}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={colors.gridColor}
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        stroke={colors.mutedText}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={colors.mutedText}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: colors.cardBg,
                          border: `1px solid ${colors.borderColor}`,
                          borderRadius: "8px",
                          color: colors.textColor,
                          boxShadow: isDarkMode
                            ? "0px 4px 20px rgba(0,0,0,0.5)"
                            : "0px 4px 20px rgba(0,0,0,0.15)",
                          padding: "12px",
                        }}
                        labelStyle={{
                          color: colors.primary,
                          fontWeight: "bold",
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Bar
                        dataKey="customers"
                        fill={colors.tertiary}
                        name="গ্রাহক"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="orders"
                        fill={colors.quaternary}
                        name="অর্ডার"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Line Chart - Trend Analysis */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    ট্রেন্ড বিশ্লেষণ
                  </CardTitle>
                  <CardDescription className="text-sm">
                    বিক্রয় প্রবণতা ও পূর্বাভাস
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={currentShopData.monthlySales}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={colors.gridColor}
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        stroke={colors.mutedText}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={colors.mutedText}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `৳${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: colors.cardBg,
                          border: `1px solid ${colors.borderColor}`,
                          borderRadius: "8px",
                          color: colors.textColor,
                          boxShadow: isDarkMode
                            ? "0px 4px 20px rgba(0,0,0,0.5)"
                            : "0px 4px 20px rgba(0,0,0,0.15)",
                          padding: "12px",
                        }}
                        labelStyle={{
                          color: colors.primary,
                          fontWeight: "bold",
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke={colors.primary}
                        strokeWidth={3}
                        name="আয় ট্রেন্ড (৳)"
                        dot={{
                          r: 4,
                          fill: colors.primary,
                          strokeWidth: 2,
                          stroke: colors.cardBg,
                        }}
                        activeDot={{
                          r: 6,
                          fill: colors.primary,
                          stroke: colors.cardBg,
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">বিস্তারিত বিশ্লেষণ</h3>
                <p className="text-muted-foreground mb-6">
                  এই বিভাগটি শীঘ্রই আসছে...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <Download className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">রিপোর্ট জেনারেটর</h3>
                <p className="text-muted-foreground mb-6">
                  কাস্টম রিপোর্ট তৈরি করুন...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">নোটিফিকেশন সেন্টার</h3>
                <p className="text-muted-foreground mb-6">
                  সকল আপডেট এখানে দেখুন...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute
      requireAuth={true}
      requiredRoles={["admin", "superAdmin", "manager"]}
    >
      <DashboardContent />
    </ProtectedRoute>
  );
}
