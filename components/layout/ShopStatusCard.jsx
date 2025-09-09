"use client";

import { useEffect, useState } from "react";
import { useShop } from "@/contexts/ShopContext";
import { useAuthStore } from "@/store/auth-store";
import { appwriteService } from "@/appwrite/appwrite";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package,
  TrendingUp,
  Clock
} from "lucide-react";

export function ShopStatsCards() {
  const { currentShop } = useShop();
  const { isAdmin } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentShop) {
      loadStats();
    }
  }, [currentShop]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const shopStats = await appwriteService.getShopStats(currentShop.$id);
      setStats(shopStats);
    } catch (error) {
      console.error("Failed to load shop stats:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">পরিসংখ্যান লোড করতে ব্যর্থ: {error}</p>
        <button 
          onClick={loadStats}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return `৳${amount?.toLocaleString('bn-BD') || '০'}`;
  };

  const statCards = [
    {
      title: "মোট অর্ডার",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-100"
    },
    {
      title: "মোট বিক্রয়",
      value: formatCurrency(stats?.totalRevenue),
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      textColor: "text-green-100"
    },
    {
      title: "গ্রাহক",
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-100"
    },
    {
      title: "পেন্ডিং অর্ডার",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`bg-gradient-to-r ${stat.color} text-white border-0`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${stat.textColor} text-sm font-medium mb-1`}>
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.textColor.replace('text-', 'text-').replace('-100', '-200')}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
