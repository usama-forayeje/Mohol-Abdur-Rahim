"use client";

import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, User, Package, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Helper function to get role in Bengali
const getRoleBengali = (role) => {
  const roleMap = {
    superAdmin: "সুপার অ্যাডমিন",
    admin: "অ্যাডমিন",
    manager: "ম্যানেজার",
    tailor: "দর্জি",
    user: "গ্রাহক",
    salesman: "বিক্রয়কারী",
    embroideryMan: "এমব্রয়ডারি কারিগর",
    stoneMan: "স্টোন কারিগর",
  };
  return roleMap[role] || role || "ব্যবহারকারী";
};

export default function HomePage() {
  const {
    isAuthenticated,
    userProfile,
    canAccessDashboard,
    logout,
    hasInitialized,
  } = useAuthStore();

  // Wait for auth to initialize
  if (!hasInitialized()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Debug: Log user info
  console.log("User Profile:", userProfile);
  console.log("User Role:", userProfile?.role);
  console.log("Can Access Dashboard:", canAccessDashboard());

  // Admin/Manager view - has dashboard access
  if (canAccessDashboard()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                স্বাগতম, {userProfile?.name || "অ্যাডমিন"}!
              </h1>
              <p className="text-gray-600">টেইলারিং ম্যানেজমেন্ট সিস্টেম</p>
              {/* Role Display */}
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getRoleBengali(userProfile?.role)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {userProfile?.avatar && (
                <img
                  src={userProfile.avatar}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <Button onClick={logout} variant="outline">
                লগআউট
              </Button>
            </div>
          </div>

          {/* Quick Access */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  ড্যাশবোর্ড
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  সম্পূর্ণ ব্যবসার ওভারভিউ দেখুন
                </p>
                <Link href="/dashboard">
                  <Button className="w-full">ড্যাশবোর্ডে যান</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                  অর্ডার ম্যানেজমেন্ট
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  অর্ডার দেখুন এবং পরিচালনা করুন
                </p>
                <Link href="/dashboard/orders">
                  <Button variant="outline" className="w-full">
                    অর্ডার দেখুন
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                প্রোফাইল তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">নাম:</p>
                  <p className="text-gray-600">{userProfile?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium">ইমেইল:</p>
                  <p className="text-gray-600">{userProfile?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium">ভূমিকা:</p>
                  <p className="text-gray-600 font-semibold text-blue-600">
                    {getRoleBengali(userProfile?.role)}
                  </p>
                </div>
                <div>
                  <p className="font-medium">স্ট্যাটাস:</p>
                  <p className="text-green-600 font-semibold">সক্রিয়</p>
                </div>
                {/* Fixed: Conditional rendering for shopId */}
                {userProfile?.shopId &&
                  typeof userProfile.shopId === "object" && (
                    <div>
                      <p className="font-medium">দোকান:</p>
                      <p className="text-gray-600 text-sm">
                        {userProfile.shopId.name || "N/A"}
                      </p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Regular user view (authenticated but no dashboard access)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">TM</span>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  টেইলারিং ম্যানেজমেন্ট
                </h1>
              </div>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    স্বাগতম, {userProfile?.name || "ব্যবহারকারী"}
                  </p>
                  <p className="text-xs text-gray-600">{userProfile?.email}</p>
                  <p className="text-xs text-blue-600 font-medium">
                    {getRoleBengali(userProfile?.role)}
                  </p>
                </div>
                {userProfile?.avatar && (
                  <img
                    src={userProfile.avatar}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <Button onClick={logout} variant="outline">
                  লগআউট
                </Button>
              </div>
            ) : (
              <Link href="/sign-in">
                <Button>সাইন ইন করুন</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isAuthenticated ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              আপনার ড্যাশবোর্ড
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              আপনি একজন {getRoleBengali(userProfile?.role)} হিসেবে লগইন করেছেন
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    প্রোফাইল
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">আপনার প্রোফাইল তথ্য দেখুন</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-green-600" />
                    আমার অর্ডার
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">আপনার অর্ডারের তালিকা দেখুন</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Package className="w-6 h-6 text-purple-600" />
                    সেবা
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">আমাদের সেবা সম্পর্কে জানুন</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>আপনার প্রোফাইল</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-left">
                    <p className="font-medium mb-2">নাম:</p>
                    <p className="text-gray-600">
                      {userProfile?.name || "N/A"}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium mb-2">ইমেইল:</p>
                    <p className="text-gray-600">
                      {userProfile?.email || "N/A"}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium mb-2">ভূমিকা:</p>
                    <p className="text-gray-600 font-semibold">
                      {getRoleBengali(userProfile?.role)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium mb-2">স্ট্যাটাস:</p>
                    <p className="text-green-600 font-semibold">সক্রিয়</p>
                  </div>
                </div>

                {/* Debug Information */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Debug তথ্য:
                  </p>
                  <div className="text-sm text-gray-600">
                    <p>User ID: {userProfile?.$id || "N/A"}</p>
                    <p>Role: {userProfile?.role || "No role"}</p>
                    {/* Fixed line to handle object rendering */}
                    <p>Shop: {userProfile?.shopId?.name || "No shop"}</p>
                    <p>
                      Can Access Dashboard:{" "}
                      {canAccessDashboard() ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Not authenticated view
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              আধুনিক টেইলারিং সেবা
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              আমাদের উন্নত ম্যানেজমেন্ট সিস্টেমের মাধ্যমে সহজেই আপনার টেইলারিং
              এর কাজ সম্পন্ন করুন
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <ShoppingBag className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">সহজ অর্ডার</h3>
                <p className="text-gray-600">
                  অনলাইনে সহজেই আপনার অর্ডার দিন এবং ট্র্যাক করুন
                </p>
              </div>

              <div className="text-center">
                <User className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">দক্ষ কারিগর</h3>
                <p className="text-gray-600">
                  অভিজ্ঞ এবং দক্ষ কারিগরদের হাতে তৈরি হোক আপনার পোশাক
                </p>
              </div>

              <div className="text-center">
                <Package className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">গুণগত সেবা</h3>
                <p className="text-gray-600">
                  উন্নত মানের কাপড় এবং নিখুঁত ফিটিং এর নিশ্চয়তা
                </p>
              </div>
            </div>

            <Link href="/sign-in">
              <Button size="lg" className="px-8 py-3 text-lg">
                শুরু করুন
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
