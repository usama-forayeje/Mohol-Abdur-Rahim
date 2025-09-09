// app/dashboard/page.jsx - Redesigned Dashboard UI
"use client";

import { useAuthStore } from "@/store/auth-store";
import { useShop } from "@/contexts/ShopContext";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const salesData = [
  {
    name: "জানু",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "ফেব্রু",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "মার্চ",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "এপ্রি",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "মে",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "জুন",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "জুলা",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "আগস্ট",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "সেপ্টে",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "অক্টো",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "নভে",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "ডিসে",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
];

const recentSalesData = [
  {
    name: "সোমা",
    email: "soma@example.com",
    amount: "৳৪,৫০০.০০",
  },
  {
    name: "আসিফ",
    email: "asif@example.com",
    amount: "৳২,০০০.০০",
  },
  {
    name: "রেহেনা",
    email: "rehena@example.com",
    amount: "৳১,৫০০.০০",
  },
  {
    name: "রাতুল",
    email: "ratul@example.com",
    amount: "৳৮০০.০০",
  },
  {
    name: "সুমাইয়া",
    email: "sumaiya@example.com",
    amount: "৳৯,০০০.০০",
  },
];

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

  // Loading state
  if (!hasInitializedShop && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4">
                {" "}
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                কোনো দোকান পাওয়া যায়নি
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
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

  // --- Main Dashboard Content ---
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight"> ড্যাশবোর্ড </h2>
          <div className="flex items-center space-x-2">
          </div>
        </div>
        <Separator />{" "}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle> ত্রুটি </AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span> {String(error)} </span>
              <Button onClick={refresh} size="sm" variant="outline">
                আবার চেষ্টা করুন
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview"> ওভারভিউ </TabsTrigger>
            <TabsTrigger value="analytics">বিশ্লেষণ</TabsTrigger>
            <TabsTrigger value="reports">রিপোর্ট</TabsTrigger>
            <TabsTrigger value="notifications">নোটিফিকেশন</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {" "}
                    মোট আয়{" "}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold"> ৳৪৫,২০০.৭৮ </div>
                  <p className="text-xs text-muted-foreground">
                    গত মাস থেকে +২০.১%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {" "}
                    গ্রাহক{" "}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold"> +২৩৫০ </div>
                  <p className="text-xs text-muted-foreground">
                    গত মাস থেকে +১৮০.১%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {" "}
                    মোট বিক্রি{" "}
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold"> +১২,২৩৪ </div>
                  <p className="text-xs text-muted-foreground">
                    গত মাস থেকে +১৯%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {" "}
                    সক্রিয় এখন{" "}
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold"> +৫৭৩ </div>
                  <p className="text-xs text-muted-foreground">
                    গত ঘন্টা থেকে +২০১
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle> ওভারভিউ </CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={salesData}>
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `৳${value}`}
                      />
                      <Bar
                        dataKey="total"
                        fill="#adfa1d"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle> সাম্প্রতিক বিক্রয় </CardTitle>
                  <CardDescription>
                    আপনি এই মাসে ১,৫০,০০০ টাকা বিক্রি করেছেন।
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {" "}
                    {recentSalesData.map((sale, index) => (
                      <div key={index} className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                          <span className="font-medium">
                            {" "}
                            {sale.name.charAt(0)}{" "}
                          </span>
                        </div>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {" "}
                            {sale.name}{" "}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {" "}
                            {sale.email}{" "}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          {" "}
                          {sale.amount}{" "}
                        </div>
                      </div>
                    ))}{" "}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push("/dashboard/customers")}
              >
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {" "}
                    গ্রাহক ব্যবস্থাপনা{" "}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    গ্রাহকদের তথ্য দেখুন ও পরিচালনা করুন
                  </p>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push("/dashboard/orders")}
              >
                <CardContent className="p-6 text-center">
                  <ShoppingBag className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {" "}
                    অর্ডার ব্যবস্থাপনা{" "}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    অর্ডার তৈরি ও ট্র্যাক করুন
                  </p>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push("/dashboard/inventory")}
              >
                <CardContent className="p-6 text-center">
                  <Package className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2"> ইনভেন্টরি </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    স্টক ও পণ্য পরিচালনা করুন
                  </p>
                </CardContent>
              </Card>
            </div>
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
