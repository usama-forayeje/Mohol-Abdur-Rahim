"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { FabricSalesTable } from "@/components/fabric-sales-table"
import { FabricSalesModal } from "@/components/fabric-sales-modal"
import PageContainer from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ShoppingCart, Sparkles, TrendingUp, Calendar } from "lucide-react"
import { motion } from "framer-motion"

// Mock data for demonstration
const mockSalesData = [
  {
    $id: "sale-1",
    sale_date: new Date().toISOString(),
    customer_name: "আহমেদ হাসান",
    total_amount: 2500,
    payment_status: "paid",
    payment_method: "cash",
  },
  {
    $id: "sale-2",
    sale_date: new Date(Date.now() - 86400000).toISOString(),
    customer_name: "ফাতিমা খাতুন",
    total_amount: 1800,
    payment_status: "pending",
    payment_method: "card",
  },
  {
    $id: "sale-3",
    sale_date: new Date(Date.now() - 172800000).toISOString(),
    customer_name: "ওয়াক-ইন কাস্টমার",
    total_amount: 3200,
    payment_status: "paid",
    payment_method: "online",
  },
]

export default function FabricSalesPage() {
  const { selectedShopId } = useAuthStore()
  // Using mock data instead of API call for demonstration
  const salesData = mockSalesData
  const isLoading = false

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateSale = () => setIsModalOpen(true)

  const handleViewDetails = (sale, showInvoice = false) => {
    console.log("View details:", sale, showInvoice)
  }

  const handleSaleSuccess = () => {
    console.log("Sale completed successfully!")
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-lg">লোড হচ্ছে...</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6 overflow-x-auto w-full">
        {/* Enhanced Header */}
        <motion.div
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-xl border backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                ফ্যাব্রিক বিক্রয়
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">আপনার সমস্ত ফ্যাব্রিক বিক্রয় ব্যবস্থাপনা করুন</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="secondary" className="text-sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date().toLocaleDateString("bn-BD")}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {salesData.length} টি বিক্রয়
                </Badge>
              </div>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleCreateSale}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg h-12 px-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              নতুন বিক্রয়
            </Button>
          </motion.div>
        </motion.div>

        {/* Sales Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                বিক্রয় তালিকা
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FabricSalesTable
                salesData={salesData}
                onViewDetails={handleViewDetails}
                onCreateSale={handleCreateSale}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Modal */}
        <FabricSalesModal open={isModalOpen} onOpenChange={setIsModalOpen} onSuccess={handleSaleSuccess} />
      </div>
    </PageContainer>
  )
}
