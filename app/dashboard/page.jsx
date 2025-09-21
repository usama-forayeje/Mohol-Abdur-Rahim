"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useShops } from "@/services/shop-service";
import { useRouter } from "next/navigation";
import { roleHelpers } from "@/lib/roles";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Eye,
  ShoppingCart,
  Download,
  Zap,
  UserCheck,
  GalleryVerticalEnd,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { ProtectedRoute } from "@/components/ProtectedRotue";

// ==================== MOCK DATA GENERATOR ====================
const generateDashboardData = (shopId, shopName) => {
  const shopIndex = parseInt(shopId?.split("-")[1] || "1");
  const baseRevenue = 50000 + shopIndex * 15000;
  const baseCustomers = 1000 + shopIndex * 500;
  const baseSales = 5000 + shopIndex * 2000;

  const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন"];

  const monthlySales = months.map((name) => ({
    name,
    total: Math.floor(baseRevenue / 6 * (0.8 + Math.random() * 0.4)),
    orders: Math.floor(baseSales / 6 * (0.8 + Math.random() * 0.4)),
  }));

  return {
    shopName: shopName || `দোকান ${shopIndex}`,
    totalRevenue: `৳${baseRevenue.toLocaleString()}`,
    totalCustomers: `+${baseCustomers.toLocaleString()}`,
    totalSales: `+${baseSales.toLocaleString()}`,
    activeNow: `+${50 + shopIndex * 15}`,
    revenueGrowth: `+${15 + shopIndex * 5}%`,
    customerGrowth: `+${12 + shopIndex * 3}%`,
    salesGrowth: `+${18 + shopIndex * 4}%`,
    activeGrowth: `+${5 + shopIndex}`,
    monthlySales,
  };
};

// ==================== DASHBOARD CONTENT ====================
function DashboardContent() {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();

  const {
    userProfile,
    selectedShopId,
    getUserRole,
    hasPermission,
    canAccessDashboard,
    getAccessibleShops,
    isViewingAllShops,
  } = useAuthStore();

  const { data: shops, isLoading: shopsLoading, error: shopsError } = useShops();

  useEffect(() => {
    if (!canAccessDashboard()) router.replace("/");
  }, [canAccessDashboard, router]);

  const accessibleShops = React.useMemo(() => getAccessibleShops(shops || []), [shops, getAccessibleShops]);
  const currentShop = accessibleShops.find((shop) => shop.$id === selectedShopId);
  const currentRole = getUserRole();
  const isViewingAll = isViewingAllShops();

  const dashboardData = React.useMemo(() => {
    if (isViewingAll) {
      return {
        shopName: "সব দোকান",
        totalRevenue: "৳২,৫০,০০০",
        totalCustomers: "+৫,০০০",
        totalSales: "+২৫,০০০",
        activeNow: "+২৫০",
        revenueGrowth: "+২০%",
        customerGrowth: "+১৫%",
        salesGrowth: "+২২%",
        activeGrowth: "+১০",
        monthlySales: [
          { name: "জানুয়ারি", total: 45000, orders: 800 },
          { name: "ফেব্রুয়ারি", total: 52000, orders: 950 },
          { name: "মার্চ", total: 48000, orders: 850 },
          { name: "এপ্রিল", total: 61000, orders: 1100 },
          { name: "মে", total: 58000, orders: 1000 },
          { name: "জুন", total: 65000, orders: 1200 },
        ],
      };
    } else if (currentShop) {
      return generateDashboardData(currentShop.$id, currentShop.name);
    } else if (accessibleShops.length > 0) {
      return generateDashboardData(accessibleShops[0].$id, accessibleShops[0].name);
    } else {
      return generateDashboardData("shop-1", "ডিফল্ট দোকান");
    }
  }, [currentShop, isViewingAll, accessibleShops]);

  const isDarkMode = resolvedTheme === "dark" || theme === "dark";
  const colors = {
    primary: isDarkMode ? "#3b82f6" : "#2563eb",
    secondary: isDarkMode ? "#10b981" : "#059669",
    tertiary: isDarkMode ? "#f59e0b" : "#d97706",
    gridColor: isDarkMode ? "#374151" : "#e5e7eb",
    textColor: isDarkMode ? "#f3f4f6" : "#111827",
  };

  // ===== Loading / Error / No access states =====
  if (shopsLoading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );

  if (shopsError)
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>ত্রুটি</AlertTitle>
          <AlertDescription>ড্যাশবোর্ড লোড করতে সমস্যা হচ্ছে: {shopsError.message}</AlertDescription>
        </Alert>
      </div>
    );

  if (!canAccessDashboard())
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-lg text-center">
          <CardContent className="p-12">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">অ্যাক্সেস অনুমতি নেই</h3>
            <p className="text-muted-foreground mb-6">আপনার ড্যাশবোর্ড দেখার অনুমতি নেই।</p>
            <Button onClick={() => router.push("/")}>হোম পেজে ফিরুন</Button>
          </CardContent>
        </Card>
      </div>
    );

  if (!accessibleShops.length && !isViewingAll)
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-lg text-center">
          <CardContent className="p-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">দোকানের অ্যাক্সেস নেই</h3>
            <p className="text-muted-foreground mb-6">আপনার কোন দোকানে অ্যাক্সেস নেই। অ্যাডমিনের সাথে যোগাযোগ করুন।</p>
          </CardContent>
        </Card>
      </div>
    );

  // ===== Main Dashboard =====
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            {isViewingAll ? <GalleryVerticalEnd className="w-6 h-6 text-primary" /> : <Building2 className="w-6 h-6 text-primary" />}
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">ব্যবসায়িক ড্যাশবোর্ড</h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{dashboardData.shopName}</span>
              <span>•</span>
              <UserCheck className="w-4 h-4" />
              <span>ভূমিকা: {roleHelpers.getRoleDisplayName(currentRole)}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {hasPermission("VIEW_REPORTS") && (
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              রিপোর্ট ডাউনলোড
            </Button>
          )}
          {hasPermission("CREATE_ORDERS") && (
            <Button onClick={() => router.push("/dashboard/orders/new")}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              নতুন অর্ডার
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Revenue Card */}
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
            <div className="text-2xl font-bold">{dashboardData.totalRevenue}</div>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <p className="text-xs text-green-500 font-medium">
                {dashboardData.revenueGrowth} গত মাস থেকে
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Customers Card */}
        <Card className="group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              মোট গ্রাহক
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalCustomers}</div>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              <p className="text-xs text-blue-500 font-medium">
                {dashboardData.customerGrowth} গত মাস থেকে
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sales Card */}
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
            <div className="text-2xl font-bold">{dashboardData.totalSales}</div>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className="w-3 h-3 text-orange-500" />
              <p className="text-xs text-orange-500 font-medium">
                {dashboardData.salesGrowth} গত মাস থেকে
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Now Card */}
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
            <div className="text-2xl font-bold">{dashboardData.activeNow}</div>
            <div className="flex items-center space-x-1 mt-1">
              <Zap className="w-3 h-3 text-purple-500" />
              <p className="text-xs text-purple-500 font-medium">
                +{dashboardData.activeGrowth} গত ঘন্টায়
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Sales Chart */}
        <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">বিক্রয় বিশ্লেষণ</CardTitle>
                <CardDescription className="text-sm">
                  {isViewingAll ? "সব দোকানের" : dashboardData.shopName} মাসিক বিক্রয় ট্রেন্ড
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={dashboardData.monthlySales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.secondary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={colors.secondary} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} opacity={0.3} />
                <XAxis dataKey="name" stroke={colors.textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={colors.textColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    color: colors.textColor,
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="total" stroke={colors.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="আয় (৳)" />
                <Area type="monotone" dataKey="orders" stroke={colors.secondary} strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" name="অর্ডার সংখ্যা" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">দ্রুত কার্যক্রম</CardTitle>
            <CardDescription className="text-sm">
              আপনার ভূমিকা: {roleHelpers.getRoleDisplayName(currentRole)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hasPermission("CREATE_ORDERS") && (
              <Button
                variant="outline"
                className="w-full flex items-center justify-start space-x-3 h-auto py-4"
                onClick={() => router.push("/dashboard/orders/new")}
              >
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="font-medium">নতুন অর্ডার তৈরি</span>
              </Button>
            )}

            {hasPermission("VIEW_CUSTOMERS") && (
              <Button
                variant="outline"
                className="w-full flex items-center justify-start space-x-3 h-auto py-4"
                onClick={() => router.push("/dashboard/customers")}
              >
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium">গ্রাহকদের তালিকা</span>
              </Button>
            )}

            {hasPermission("VIEW_ALL_ORDERS") && (
              <Button
                variant="outline"
                className="w-full flex items-center justify-start space-x-3 h-auto py-4"
                onClick={() => router.push("/dashboard/orders")}
              >
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <span className="font-medium">অর্ডার দেখুন</span>
              </Button>
            )}

            {hasPermission("MANAGE_FABRICS") && (
              <Button
                variant="outline"
                className="w-full flex items-center justify-start space-x-3 h-auto py-4"
                onClick={() => router.push("/dashboard/inventory/fabrics")}
              >
                <Package className="w-5 h-5 text-purple-600" />
                <span className="font-medium">কাপড় ইনভেন্টরি</span>
              </Button>
            )}

            {hasPermission("VIEW_OWN_ORDERS") && !hasPermission("VIEW_ALL_ORDERS") && (
              <Button
                variant="outline"
                className="w-full flex items-center justify-start space-x-3 h-auto py-4"
                onClick={() => router.push("/dashboard/my-orders")}
              >
                <Eye className="w-5 h-5 text-orange-600" />
                <span className="font-medium">আমার কাজের অর্ডার</span>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role-specific information */}
      {currentRole && (
        <Card>
          <CardHeader>
            <CardTitle>আপনার ভূমিকার তথ্য</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">{roleHelpers.getRoleDisplayName(currentRole)}</h3>
                <p className="text-sm text-muted-foreground">আপনার বর্তমান ভূমিকা</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">{dashboardData.shopName}</h3>
                <p className="text-sm text-muted-foreground">{isViewingAll ? "সব দোকান" : "নির্বাচিত দোকান"}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">সক্রিয়</h3>
                <p className="text-sm text-muted-foreground">আপনার স্ট্যাটাস</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== DASHBOARD PAGE ====================
export default function DashboardPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="flex flex-col h-screen">
        <DashboardContent />
      </div>
    </ProtectedRoute>
  );
}
