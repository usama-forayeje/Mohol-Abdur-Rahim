"use client";

import { useEffect, useState } from "react";
import { useShop } from "@/contexts/ShopContext";
import { appwriteService } from "@/appwrite/appwrite";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";

export function RecentActivity() {
  const { currentShop } = useShop();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentShop) {
      loadRecentActivity();
    }
  }, [currentShop]);

  const loadRecentActivity = async () => {
    try {
      setIsLoading(true);
      
      // Get recent orders and transactions
      const [orders, transactions] = await Promise.all([
        appwriteService.getShopOrders(currentShop.$id),
        appwriteService.getShopTransactions(currentShop.$id)
      ]);

      // Combine and sort by date
      const combined = [
        ...orders.slice(0, 3).map(order => ({
          type: 'order',
          title: `নতুন অর্ডার পেয়েছেন`,
          description: `অর্ডার #${order.orderId}`,
          date: new Date(order.order_date),
          status: order.status
        })),
        ...transactions.slice(0, 3).map(transaction => ({
          type: 'transaction',
          title: transaction.type === 'tailoring_order' ? 'পেমেন্ট সম্পন্ন' : 
                 transaction.type === 'fabric_sale' ? 'কাপড় বিক্রি' : 'খরচ',
          description: `৳${transaction.total_amount?.toLocaleString('bn-BD')}`,
          date: new Date(transaction.transaction_date),
          status: 'completed'
        }))
      ].sort((a, b) => b.date - a.date).slice(0, 5);

      setActivities(combined);
    } catch (error) {
      console.error("Failed to load recent activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>সাম্প্রতিক কার্যক্রম</CardTitle>
        <CardDescription>
          {currentShop?.name} - এর সাম্প্রতিক আপডেট
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            কোন সাম্প্রতিক কার্যক্রম নেই
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.status)}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(activity.date, { 
                      addSuffix: true, 
                      locale: bn 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}