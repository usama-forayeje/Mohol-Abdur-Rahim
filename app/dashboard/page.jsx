// app/dashboard/page.js - Full Fixed Version
"use client";

import { useAuthStore } from "@/store/auth-store";
import { useShop } from "@/contexts/ShopContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ShopSelector } from "@/components/ShopSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  AlertTriangle,
  Users,
  Package,
  ShoppingBag,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRotue";

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

  console.log(currentShop);

  // Loading state
  if (!hasInitializedShop && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg">দোকানের তথ্য লোড হচ্ছে...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- Main Dashboard Content ---
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              স্বাগতম, {userProfile?.name || "ব্যবহারকারী"}!
            </h1>
            <p className="text-gray-600 mt-2">
              {currentShop?.name
                ? `${String(currentShop.name)} - এর ড্যাশবোর্ড`
                : "ড্যাশবোর্ড"}
            </p>
          </div>
          {/* ShopSelector Component is here */}
          <ShopSelector />
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="flex justify-between items-center">
                <span>{String(error)}</span>
                <Button onClick={refresh} size="sm" variant="outline">
                  আবার চেষ্টা করুন
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* No Shop Message */}
        {isAdmin() && !currentShop && availableShops.length === 0 && !error && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                কোনো দোকান পাওয়া যায়নি
              </h3>
              <p className="text-gray-600 mb-6">প্রথমে একটি দোকান তৈরি করুন।</p>
              <Button onClick={() => router.push("/dashboard/shops/create")}>
                নতুন দোকান তৈরি করুন
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {currentShop && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-blue-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">মোট অর্ডার</p>
                    <p className="text-2xl font-bold">--</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">গ্রাহক</p>
                    <p className="text-2xl font-bold">--</p>
                  </div>
                  <Users className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">ইনভেন্টরি</p>
                    <p className="text-2xl font-bold">--</p>
                  </div>
                  <Package className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">রিপোর্ট</p>
                    <p className="text-2xl font-bold">--</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Shop Information */}
        {currentShop && (
          <Card>
            <CardHeader>
              <CardTitle>দোকানের তথ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Shop Name */}
                <div>
                  <p className="font-medium text-gray-900 mb-1">দোকানের নাম:</p>
                  <p className="text-gray-700">
                    {String(currentShop.name || "N/A")}
                  </p>
                </div>
                {/* Address */}
                <div>
                  <p className="font-medium text-gray-900 mb-1">ঠিকানা:</p>
                  <p className="text-gray-700">
                    {String(currentShop.address || "যোগ করা হয়নি")}
                  </p>
                </div>
                {/* Contact */}
                <div>
                  <p className="font-medium text-gray-900 mb-1">যোগাযোগ:</p>
                  <p className="text-gray-700">
                    {String(currentShop.contact || "যোগ করা হয়নি")}
                  </p>
                </div>
                {/* Status */}
                <div>
                  <p className="font-medium text-gray-900 mb-1">স্ট্যাটাস:</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    সক্রিয়
                  </span>
                </div>
              </div>
              {/* Debug Information */}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push("/dashboard/customers")}
          >
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">গ্রাহক ব্যবস্থাপনা</h3>
              <p className="text-gray-600 text-sm">
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
              <h3 className="text-lg font-semibold mb-2">অর্ডার ব্যবস্থাপনা</h3>
              <p className="text-gray-600 text-sm">
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
              <h3 className="text-lg font-semibold mb-2">ইনভেন্টরি</h3>
              <p className="text-gray-600 text-sm">স্টক ও পণ্য পরিচালনা করুন</p>
            </CardContent>
          </Card>
        </div>
      </main>
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