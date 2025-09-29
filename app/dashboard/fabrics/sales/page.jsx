"use client"

import { useAuthStore } from "@/store/auth-store"
import { FabricSalesTable } from "@/components/fabric-sales-table"
import PageContainer from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ShoppingCart, Sparkles, TrendingUp, Calendar, ArrowRight, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useFabricSales } from "@/services/fabric-sales-service"
import { useCustomers } from "@/services/customer-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function FabricSalesPage() {
  const { selectedShopId } = useAuthStore()
  const router = useRouter()

  // Fetch real sales data from database
  const { data: salesData = [], isLoading, error, refetch } = useFabricSales(selectedShopId)
  const { data: customers = [] } = useCustomers()

  // Create a map of customers for quick lookup
  const customerMap = customers.reduce((acc, customer) => {
    acc[customer.$id] = customer
    return acc
  }, {})

  // Enrich sales data with customer information
  const enrichedSalesData = salesData.map(sale => {
    // Parse items if it's a string (from database)
    let items = sale.items
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items)
      } catch (e) {
        items = []
      }
    }

    return {
      ...sale,
      customer_name: customerMap[sale.customersId]?.name || "No Name",
      customer_phone: customerMap[sale.customersId]?.phone || "",
      items: items || [],
      payment_method: sale.payment_method || "cash",
    }
  })

  // Debug: Log the first sale to see data structure
  if (enrichedSalesData.length > 0) {
    console.log("Sample sale data:", enrichedSalesData[0])
  }

  const handleCreateSale = () => {
    router.push("/dashboard/fabrics/sales/new")
  }

  const handleViewDetails = (sale, showInvoice = false) => {
    console.log("View details:", sale, showInvoice)
  }

  // Handle error state
  if (error) {
    return (
      <PageContainer>
        <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-muted/10 flex items-center justify-center p-6">
          <motion.div
            className="max-w-md w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Alert className="border-destructive/50 bg-destructive/5">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <AlertDescription className="text-destructive">
                <div className="space-y-3">
                  <p className="font-semibold">বিক্রয় তথ্য লোড করতে সমস্যা হয়েছে</p>
                  <p className="text-sm text-muted-foreground">{error.message}</p>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                    className="w-full border-destructive/30 hover:bg-destructive/10"
                  >
                    আবার চেষ্টা করুন
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>
      </PageContainer>
    )
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex w-full items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg">লোড হচ্ছে...</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-muted/10">
        {/* Enhanced Premium Header */}
        <div className="relative overflow-hidden border-b bg-gradient-to-r from-primary/5 via-background to-primary/5">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <motion.div
            className="relative p-6 lg:p-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                <motion.div
                  className="flex items-center gap-6 flex-1"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <motion.div
                    className="relative p-4 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl shadow-2xl"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                    <Sparkles className="relative h-10 w-10 text-primary-foreground" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                  </motion.div>

                  <div className="flex-1">
                    <motion.h1
                      className="text-4xl lg:text-5xl xl:text-6xl font-black text-transparent bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text leading-tight"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      ফ্যাব্রিক বিক্রয়
                    </motion.h1>
                    <motion.p
                      className="text-muted-foreground mt-3 text-lg lg:text-xl font-medium"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      আপনার সমস্ত ফ্যাব্রিক বিক্রয় ব্যবস্থাপনা করুন
                    </motion.p>
                    <motion.div
                      className="flex flex-wrap items-center gap-3 mt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <Badge variant="secondary" className="px-4 py-2 bg-primary/10 text-primary border-primary/20 text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date().toLocaleDateString("bn-BD")}
                      </Badge>
                      <Badge variant="outline" className="px-4 py-2 bg-background/80 backdrop-blur-sm text-sm">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {enrichedSalesData.length} টি বিক্রয়
                      </Badge>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex-shrink-0"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleCreateSale}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold px-8 py-4 text-lg rounded-2xl shadow-2xl hover:shadow-primary/25 transition-all duration-300"
                    >
                      <motion.div
                        className="flex items-center gap-3"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        <Plus className="h-6 w-6" />
                        নতুন বিক্রয়
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background"></div>
          <motion.div
            className="relative max-w-7xl mx-auto p-6 lg:p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-2xl lg:text-3xl">
                        <motion.div
                          className="p-2 bg-primary/10 rounded-lg"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <ShoppingCart className="h-8 w-8 text-primary" />
                        </motion.div>
                        বিক্রয় তালিকা
                      </CardTitle>
                      <p className="text-muted-foreground mt-2 text-base">
                        সমস্ত বিক্রয়ের তথ্য এখানে দেখুন এবং পরিচালনা করুন
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <FabricSalesTable
                    salesData={enrichedSalesData}
                    onViewDetails={handleViewDetails}
                    onCreateSale={handleCreateSale}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  )
}
