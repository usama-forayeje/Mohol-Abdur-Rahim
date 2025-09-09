"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/contexts/ShopContext";
import { useShopData } from "@/hooks/useShopData";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ShopGuard } from "@/components/ShopGuard";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

export default function OrdersPage() {
  const router = useRouter();
  const { currentShop } = useShop();
  const { 
    data: orders, 
    isLoading, 
    error, 
    refresh,
    delete: deleteOrder 
  } = useShopData('orders', {
    refreshInterval: 30000 // Auto refresh every 30 seconds
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", label: "অপেক্ষমাণ" },
      in_progress: { variant: "default", label: "চলমান" },
      completed: { variant: "success", label: "সম্পন্ন" },
      delivered: { variant: "outline", label: "ডেলিভারড" }
    };
    
    const config = statusConfig[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = [
    {
      header: "অর্ডার ID",
      accessorKey: "orderId",
      cell: (order) => (
        <span className="font-mono text-sm">{order.orderId}</span>
      )
    },
    {
      header: "গ্রাহক",
      accessorKey: "customerName",
      cell: (order) => order.customerName || "N/A"
    },
    {
      header: "অর্ডারের তারিখ", 
      accessorKey: "order_date",
      cell: (order) => format(new Date(order.order_date), "dd MMM yyyy", { locale: bn })
    },
    {
      header: "ডেলিভারি তারিখ",
      accessorKey: "delivery_date", 
      cell: (order) => order.delivery_date 
        ? format(new Date(order.delivery_date), "dd MMM yyyy", { locale: bn })
        : "নির্ধারিত নয়"
    },
    {
      header: "স্ট্যাটাস",
      accessorKey: "status",
      cell: (order) => getStatusBadge(order.status)
    },
    {
      header: "মোট দাম",
      accessorKey: "total_price",
      cell: (order) => `৳${order.total_price?.toLocaleString('bn-BD') || '০'}`
    }
  ];

  const actionItems = [
    {
      label: "বিস্তারিত দেখুন",
      icon: Eye,
      onClick: (order) => router.push(`/dashboard/orders/${order.$id}`)
    },
    {
      label: "সম্পাদনা",
      icon: Edit,
      onClick: (order) => router.push(`/dashboard/orders/${order.$id}/edit`)
    },
    {
      label: "মুছে ফেলুন",
      icon: Trash2,
      className: "text-red-600",
      onClick: async (order) => {
        if (confirm(`অর্ডার ${order.orderId} মুছে ফেলতে চান?`)) {
          try {
            await deleteOrder(order.$id);
            alert("অর্ডার সফলভাবে মুছে ফেলা হয়েছে");
          } catch (error) {
            alert("অর্ডার মুছতে ব্যর্থ: " + error.message);
          }
        }
      }
    }
  ];

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'salesman']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <DashboardHeader />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ShopGuard>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">অর্ডার ব্যবস্থাপনা</h1>
                  <p className="text-gray-600 mt-1">
                    {currentShop?.name} - এর সকল অর্ডার
                  </p>
                </div>
                
                <Button onClick={() => router.push('/dashboard/orders/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন অর্ডার
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "মোট অর্ডার", value: orders.length, color: "blue" },
                  { 
                    label: "অপেক্ষমাণ", 
                    value: orders.filter(o => o.status === 'pending').length,
                    color: "yellow" 
                  },
                  { 
                    label: "চলমান", 
                    value: orders.filter(o => o.status === 'in_progress').length,
                    color: "blue" 
                  },
                  { 
                    label: "সম্পন্ন", 
                    value: orders.filter(o => o.status === 'completed').length,
                    color: "green" 
                  }
                ].map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Orders Table */}
              <Card>
                <CardHeader>
                  <CardTitle>অর্ডার তালিকা</CardTitle>
                  <CardDescription>
                    সকল অর্ডার এবং তাদের বর্তমান স্ট্যাটাস
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={orders}
                    columns={columns}
                    isLoading={isLoading}
                    searchKey="orderId"
                    actionItems={actionItems}
                    emptyMessage="কোন অর্ডার পাওয়া যায়নি"
                  />
                </CardContent>
              </Card>
            </div>
          </ShopGuard>
        </main>
      </div>
    </ProtectedRoute>
  );
}
