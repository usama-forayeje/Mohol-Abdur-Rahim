"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { FabricSalesTable } from "@/components/fabric-sales-table"
import PageContainer from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ShoppingCart, Calendar, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useFabricSales, useDeleteFabricSale } from "@/services/fabric-sales-service"
import { useCustomers } from "@/services/customer-service"
import { useFabrics } from "@/services/fabric-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"


export default function FabricSalesPage() {
  const { selectedShopId, userProfile } = useAuthStore()
  const router = useRouter()
  const [selectedFabricFilter, setSelectedFabricFilter] = useState("all")

  const { data: salesData = [], isLoading, error, refetch } = useFabricSales(selectedShopId)
  const { data: customers = [] } = useCustomers()
  const { data: fabrics = [], isLoading: fabricsLoading } = useFabrics(selectedShopId)
  const deleteFabricSale = useDeleteFabricSale()

  // Get user role from profile
  const userRole = userProfile?.role || "staff"

  // Create customer lookup map
  const customerMap = customers.reduce((acc, customer) => {
    acc[customer.$id] = customer
    return acc
  }, {})

  // Enrich sales data with customer information
  const enrichedSalesData = salesData.map(sale => {
    let items = []

    // Handle different item formats from database
    if (Array.isArray(sale.items)) {
      // If items is already an array
      items = sale.items.map(item => {
        // If item is a string, parse it
        if (typeof item === 'string') {
          try {
            return JSON.parse(item)
          } catch (e) {
            console.error('Error parsing item string:', e)
            return null
          }
        }
        return item
      }).filter(Boolean)
    } else if (typeof sale.items === 'string') {
      // If items is a single string, try to parse
      try {
        const parsed = JSON.parse(sale.items)
        items = Array.isArray(parsed) ? parsed : [parsed]
      } catch (e) {
        console.error('Error parsing items string:', e)
      }
    }

    // Normalize items - handle both sale_price and unitPrice
    items = items.map(item => ({
      fabricId: item?.fabricId || '',
      quantity: item?.quantity || 0,
      sale_price: item?.sale_price || item?.unitPrice || 0
    }))

    return {
      ...sale,
      customer_name: customerMap[sale.customersId]?.name || "ওয়াক-ইন কাস্টমার",
      customer_phone: customerMap[sale.customersId]?.phone || "",
      items: items,
      payment_method: sale.payment_method || "cash",
    }
  })

  const handleCreateSale = () => {
    router.push("/dashboard/fabrics/sales/new")
  }

  // View details is now handled by the table component internally

  const handleEdit = (sale) => {
    // Navigate to edit page with correct Next.js dynamic route structure
    router.push(`/dashboard/fabrics/sales/${sale.$id}`)
  }

  const handleDelete = async (saleId) => {
    try {
      await deleteFabricSale.mutateAsync(saleId)
      toast.success("বিক্রয় সফলভাবে মুছে ফেলা হয়েছে")
    } catch (error) {
      console.error("Error deleting sale:", error)
      toast.error(error.message || "বিক্রয় মুছতে সমস্যা হয়েছে")
    }
  }

  // No shop selected
  if (!selectedShopId && !isLoading) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <div className="space-y-3">
                    <p className="font-semibold">দোকান নির্বাচন করুন</p>
                    <p className="text-sm">ফ্যাব্রিক বিক্রয় দেখার জন্য প্রথমে একটি দোকান নির্বাচন করুন</p>
                    <Button
                      onClick={() => router.push("/dashboard/shop")}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      দোকান নির্বাচন করুন
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

  // Error State
  if (error) {
    return (
      <PageContainer>
        <div className="min-h-screen  flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-semibold">বিক্রয় তথ্য লোড করতে সমস্যা হয়েছে</p>
                    <p className="text-sm">{error.message}</p>
                    <Button
                      onClick={() => refetch()}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      আবার চেষ্টা করুন
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

  // Loading State
  if (isLoading) {
    return (
      <PageContainer>
        <div className="min-h-screen w-full">
          <div className="border-b bg-card">
            <div className="container mx-auto p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-5 w-72 bg-muted/60 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-7 w-28 bg-muted/40 rounded-full animate-pulse" />
                    <div className="h-7 w-24 bg-muted/40 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="h-10 w-32 bg-primary/20 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          <div className="container mx-auto p-6 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-muted/60 rounded animate-pulse" />
                      <div className="h-7 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="min-h-screen w-full">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">ফ্যাব্রিক বিক্রয়</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      আপনার সমস্ত ফ্যাব্রিক বিক্রয় ব্যবস্থাপনা করুন
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {new Date().toLocaleDateString("bn-BD")}
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <TrendingUp className="h-3 w-3" />
                    {enrichedSalesData.length} টি বিক্রয়
                  </Badge>
                  {enrichedSalesData.length > 0 && (
                    <Badge className="gap-1.5 bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      সক্রিয়
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={handleCreateSale}
                size="lg"
                className="w-full sm:w-auto gap-2"
              >
                <Plus className="h-5 w-5" />
                নতুন বিক্রয়
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto p-4 sm:p-6">
          <FabricSalesTable
            salesData={enrichedSalesData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedFabricFilter={selectedFabricFilter}
            setSelectedFabricFilter={setSelectedFabricFilter}
            availableFabrics={fabrics}
            userRole={userRole}
          />
        </div>
      </div>
    </PageContainer>
  )
}