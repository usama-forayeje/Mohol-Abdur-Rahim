"use client"

import { useState, useMemo, useEffect } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import PageContainer from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  ShoppingBag,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useFabricSales } from "@/services/fabric-sales-service"
import { useFabrics } from "@/services/fabric-service"
import { useCustomers } from "@/services/customer-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  LineChart,
  Line,
} from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

export default function FabricsReportsPage() {
  const { selectedShopId, userProfile } = useAuthStore()
  const { theme } = useTheme()
  const router = useRouter()
  const [dateRange, setDateRange] = useState("30")
  const [selectedFabricFilter, setSelectedFabricFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: salesData = [], isLoading: salesLoading, error, refetch } = useFabricSales(selectedShopId)
  const { data: fabrics = [], isLoading: fabricsLoading } = useFabrics(selectedShopId)
  const { data: customers = [] } = useCustomers()

  const processSalesData = useMemo(() => {
    if (!salesData.length)
      return {
        processed: [],
        metrics: {},
        trendData: [],
      }

    const now = new Date()
    const daysBack = Number.parseInt(dateRange)
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    const processed = salesData
      .filter((sale) => new Date(sale.created_at || sale.$createdAt) >= cutoffDate)
      .map((sale) => {
        let items = []
        if (Array.isArray(sale.items)) {
          items = sale.items
            .map((item) => {
              if (typeof item === "string") {
                try {
                  return JSON.parse(item)
                } catch (e) {
                  return null
                }
              }
              return item
            })
            .filter(Boolean)
        }

        const totalAmount = items.reduce((sum, item) => sum + item.sale_price * item.quantity, 0)

        return {
          ...sale,
          items: items,
          total_amount: totalAmount,
          date: new Date(sale.created_at || sale.$createdAt).toLocaleDateString("bn-BD"),
        }
      })

    const totalRevenue = processed.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
    const totalSales = processed.length
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

    const salesByDay = processed.reduce((acc, sale) => {
      const day = sale.date
      if (!acc[day]) acc[day] = { count: 0, revenue: 0 }
      acc[day].count += 1
      acc[day].revenue += sale.total_amount || 0
      return acc
    }, {})

    const trendData = Object.entries(salesByDay)
      .map(([date, data]) => ({
        date,
        sales: data.count || 0,
        revenue: data.revenue || 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    const forecast =
      trendData.length > 5
        ? (() => {
          const recent = trendData.slice(-5)
          const avgRevenue = recent.reduce((sum, day) => sum + (day.revenue || 0), 0) / recent.length
          const growthRate =
            recent.length > 1 && recent[0].revenue > 0
              ? ((recent[recent.length - 1].revenue || 0) - (recent[0].revenue || 0)) / (recent[0].revenue || 1)
              : 0

          return {
            nextWeek: isNaN(avgRevenue) ? 0 : avgRevenue * 7,
            growthRate: isNaN(growthRate) ? 0 : growthRate * 100,
          }
        })()
        : { nextWeek: 0, growthRate: 0 }

    return {
      processed,
      metrics: {
        totalRevenue,
        totalSales,
        averageOrderValue,
        forecast,
      },
      trendData,
    }
  }, [salesData, dateRange])

  const { processed, metrics, trendData } = processSalesData

  const safeProcessed = Array.isArray(processed) ? processed : []
  const safeTrendData = Array.isArray(trendData) ? trendData : []

  const safeMetrics = {
    totalRevenue: metrics?.totalRevenue || 0,
    totalSales: metrics?.totalSales || 0,
    averageOrderValue: metrics?.averageOrderValue || 0,
    forecast: metrics?.forecast || { nextWeek: 0, growthRate: 0 },
  }

  const filteredSalesData = useMemo(() => {
    if (selectedFabricFilter === "all") {
      return safeProcessed
    }

    const filtered = safeProcessed.filter((sale) => {
      if (!sale.items || !Array.isArray(sale.items)) return false

      return sale.items.some((item) => item && item.fabricId === selectedFabricFilter)
    })
    return filtered
  }, [safeProcessed, selectedFabricFilter])

  const filteredMetrics = useMemo(() => {
    if (!filteredSalesData || filteredSalesData.length === 0) {
      return {
        totalRevenue: 0,
        totalSales: 0,
        averageOrderValue: 0,
        totalSoldQuantity: 0,
      }
    }

    const totalRevenue = filteredSalesData.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
    const totalSales = filteredSalesData.length
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

    const totalSoldQuantity = filteredSalesData.reduce((total, sale) => {
      if (sale.items && Array.isArray(sale.items)) {
        return total + sale.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
      }
      return total
    }, 0)

    return {
      totalRevenue,
      totalSales,
      averageOrderValue,
      totalSoldQuantity,
    }
  }, [filteredSalesData])

  const safeFilteredMetrics = {
    totalRevenue: filteredMetrics?.totalRevenue || 0,
    totalSales: filteredMetrics?.totalSales || 0,
    averageOrderValue: filteredMetrics?.averageOrderValue || 0,
    totalSoldQuantity: filteredMetrics?.totalSoldQuantity || 0,
  }

  const filteredTrendData = useMemo(() => {
    if (selectedFabricFilter === "all") {
      return safeTrendData
    }

    const filteredSalesIds = new Set(filteredSalesData.map((sale) => sale.$id))

    return safeTrendData.filter((trend) => filteredSalesIds.has(trend.saleId))
  }, [safeTrendData, filteredSalesData, selectedFabricFilter])

  const stockChartData = useMemo(() => {
    if (!fabrics?.length) return []

    const filteredFabrics = fabrics
      .filter((fabric) => {
        if (selectedFabricFilter !== "all" && fabric.$id !== selectedFabricFilter) {
          return false
        }
        if (searchTerm && !fabric.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false
        }
        return true
      })
      .slice(0, 20)
      .map((fabric) => ({
        name: fabric.name || "Unknown",
        stock: fabric.stock_quantity || 0,
        type: fabric.fabric_type || "Unknown",
        price: fabric.price_per_unit || 0,
        value: (fabric.stock_quantity || 0) * (fabric.price_per_unit || 0) || 0,
        status: (fabric.stock_quantity || 0) < 10 ? "low" : (fabric.stock_quantity || 0) > 100 ? "high" : "normal",
      }))
      .sort((a, b) => b.value - a.value)

    return filteredFabrics
  }, [fabrics, selectedFabricFilter, searchTerm])

  const salesByFabricType = useMemo(() => {
    const typeMap = {}
    filteredSalesData.forEach((sale) => {
      if (sale && sale.items && Array.isArray(sale.items)) {
        sale.items.forEach((item) => {
          if (item && item.fabricId) {
            const fabric = fabrics.find((f) => f && f.$id === item.fabricId)
            if (fabric) {
              if (selectedFabricFilter !== "all" && fabric.$id !== selectedFabricFilter) {
                return
              }

              const type = fabric.fabric_type || "Unknown"
              if (!typeMap[type]) {
                typeMap[type] = { quantity: 0, revenue: 0 }
              }
              typeMap[type].quantity += item.quantity || 0
              typeMap[type].revenue += (item.sale_price || 0) * (item.quantity || 0)
            }
          }
        })
      }
    })

    return Object.entries(typeMap)
      .map(([type, data]) => ({
        type,
        quantity: data?.quantity || 0,
        revenue: data?.revenue || 0,
      }))
      .filter((item) => item && item.type)
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
  }, [filteredSalesData, fabrics, selectedFabricFilter])

  const dailySalesTrend = useMemo(() => {
    try {
      if (!filteredTrendData) return []

      const trendArray = Array.isArray(filteredTrendData) ? filteredTrendData : []

      return trendArray
        .filter((item) => {
          try {
            if (!item || typeof item !== "object") return false
            if (!item.date || item.date === "") return false

            const revenue = Number(item.revenue) || 0
            const sales = Number(item.sales) || 0

            return revenue >= 0 || sales >= 0
          } catch (itemError) {
            return false
          }
        })
        .slice(-30)
    } catch (error) {
      return []
    }
  }, [filteredTrendData])

  const topSellingFabrics = useMemo(() => {
    const fabricMap = {}
    filteredSalesData.forEach((sale) => {
      if (sale && sale.items && Array.isArray(sale.items)) {
        sale.items.forEach((item) => {
          if (item && item.fabricId) {
            const fabric = fabrics.find((f) => f && f.$id === item.fabricId)
            if (fabric) {
              if (selectedFabricFilter !== "all" && fabric.$id !== selectedFabricFilter) {
                return
              }

              const name = fabric.name || "Unknown"
              if (!fabricMap[name]) {
                fabricMap[name] = { name, quantity: 0, revenue: 0 }
              }
              fabricMap[name].quantity += item.quantity || 0
              fabricMap[name].revenue += (item.sale_price || 0) * (item.quantity || 0)
            }
          }
        })
      }
    })

    return Object.values(fabricMap)
      .filter((fabric) => fabric && fabric.name && fabric.name !== "Unknown")
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
      .slice(0, 12)
  }, [filteredSalesData, fabrics, selectedFabricFilter])

  const handleExportReport = async (format = "pdf") => {
    try {
      toast.success(`রিপোর্ট ${format.toUpperCase()} ফরম্যাটে এক্সপোর্ট করা হচ্ছে...`)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const reportData = {
        dateRange,
        metrics: safeMetrics,
        generatedAt: new Date().toISOString(),
        shopId: selectedShopId,
        totalFabrics: fabrics.length,
        totalSales: processed.length,
      }

      if (format === "pdf") {
        console.log("Exporting PDF report:", reportData)
      } else if (format === "excel") {
        console.log("Exporting Excel report:", reportData)
      }

      toast.success(`রিপোর্ট সফলভাবে এক্সপোর্ট করা হয়েছে!`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("রিপোর্ট এক্সপোর্ট করতে সমস্যা হয়েছে")
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && Array.isArray(payload)) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3">
          <p className="font-semibold text-card-foreground mb-2 text-sm border-b border-border pb-2">
            {label || "Unknown"}
          </p>
          <div className="space-y-1.5">
            {payload.map((entry, index) => {
              const value = entry?.value || 0
              const name = entry?.name || "Unknown"
              const dataKey = entry?.dataKey || ""
              const color = entry?.color || "hsl(var(--chart-1))"

              return (
                <div key={index} className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-muted-foreground">{name}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {typeof value === "number"
                      ? dataKey.includes("revenue") || dataKey.includes("profit") || dataKey.includes("amount")
                        ? `৳${value.toLocaleString()}`
                        : value.toLocaleString()
                      : value || "N/A"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    return null
  }

  // Error State
  if (error) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-semibold">রিপোর্ট তথ্য লোড করতে সমস্যা হয়েছে</p>
                    <p className="text-sm">{error.message}</p>
                    <Button onClick={() => refetch()} variant="outline" size="sm" className="w-full">
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
  if (salesLoading || fabricsLoading) {
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

  // No shop selected
  if (!selectedShopId && !salesLoading) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <div className="space-y-3">
                    <p className="font-semibold">দোকান নির্বাচন করুন</p>
                    <p className="text-sm">ফ্যাব্রিক রিপোর্ট দেখার জন্য প্রথমে একটি দোকান নির্বাচন করুন</p>
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

  return (
    <PageContainer>
      <div className="min-h-screen w-full bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">ফ্যাব্রিক বিজনেস রিপোর্ট</h1>
                  <p className="text-sm text-muted-foreground mt-1">কমপ্রিহেন্সিভ অ্যানালিটিক্স এবং বিজনেস ইনসাইটস</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="gap-2">
                  <Calendar className="h-3 w-3" />
                  {new Date().toLocaleDateString("bn-BD")}
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <Package className="h-3 w-3" />
                  {selectedFabricFilter === "all" ? (fabrics || []).length : 1} ফ্যাব্রিক
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <TrendingUp className="h-3 w-3" />
                  {safeFilteredMetrics.totalSales} বিক্রয়
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <Package className="h-3 w-3" />
                  {safeFilteredMetrics.totalSoldQuantity} গজ বিক্রি
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <Select value={selectedFabricFilter} onValueChange={setSelectedFabricFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="ফ্যাব্রিক ফিল্টার" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ফ্যাব্রিক</SelectItem>
                  {fabrics.map((fabric) => (
                    <SelectItem key={fabric.$id} value={fabric.$id}>
                      {fabric.name || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">১ দিন</SelectItem>
                  <SelectItem value="7">৭ দিন</SelectItem>
                  <SelectItem value="30">৩০ দিন</SelectItem>
                  <SelectItem value="90">৯০ দিন</SelectItem>
                  <SelectItem value="365">১ বছর</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  setSelectedFabricFilter("all")
                  setSearchTerm("")
                }}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                ক্লিয়ার
              </Button>

              <Button onClick={() => handleExportReport("pdf")} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                এক্সপোর্ট
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">ওভারভিউ</TabsTrigger>
              <TabsTrigger value="stock">স্টক রিপোর্ট</TabsTrigger>
              <TabsTrigger value="sales">বিক্রয় বিশ্লেষণ</TabsTrigger>
              <TabsTrigger value="forecast">ট্রেন্ডস</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">মোট রেভেনিউ</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-chart-1/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-chart-1" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">৳{filteredMetrics.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      শেষ {dateRange} দিনের বিক্রয়
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">মোট বিক্রয়</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-chart-2" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{filteredMetrics.totalSales}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      মোট অর্ডার সংখ্যা
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">গড় অর্ডার ভ্যালু</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-chart-3" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">৳{filteredMetrics.averageOrderValue.toFixed(0)}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      প্রতি অর্ডারে গড়ে
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">মোট বিক্রিত গজ</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-chart-4/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-chart-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{safeFilteredMetrics.totalSoldQuantity.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      গজ বিক্রি হয়েছে
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-chart-1" />
                    স্টক লেভেল অ্যানালাইসিস
                  </CardTitle>
                  <CardDescription>বর্তমান ইনভেন্টরি স্ট্যাটাস এবং ভ্যালু ডিস্ট্রিবিউশন</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      stock: {
                        label: "স্টক কোয়ান্টিটি",
                        color: "oklch(var(--chart-1))",
                      },
                      value: {
                        label: "মোট ভ্যালু (৳)",
                        color: "oklch(var(--chart-2))",
                      },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={stockChartData.slice(0, 10)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                        <XAxis
                          dataKey="name"
                          className="text-xs"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                        />
                        <YAxis className="text-xs" />
                        <ChartTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                        <Line
                          type="monotone"
                          dataKey="stock"
                          stroke="#22c55e"
                          strokeWidth={4}
                          name="স্টক কোয়ান্টিটি"
                          dot={{ fill: "#22c55e", strokeWidth: 3, r: 8 }}
                          activeDot={{ r: 10, stroke: "#22c55e", strokeWidth: 3, fill: "#fff" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={4}
                          name="মোট ভ্যালু (৳)"
                          dot={{ fill: "#3b82f6", strokeWidth: 3, r: 8 }}
                          activeDot={{ r: 10, stroke: "#3b82f6", strokeWidth: 3, fill: "#fff" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-chart-1" />
                    রেভেনিউ ট্রেন্ড অ্যানালাইসিস
                  </CardTitle>
                  <CardDescription>সময় অনুসারে বিক্রয়ের ধারা এবং প্যাটার্ন বিশ্লেষণ</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "রেভেনিউ (৳)",
                        color: "oklch(var(--chart-1))",
                      },
                      sales: {
                        label: "বিক্রয় সংখ্যা",
                        color: "oklch(var(--chart-2))",
                      },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailySalesTrend} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.3} />
                          </linearGradient>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.3} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                        <XAxis
                          dataKey="date"
                          className="text-xs"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          interval={Math.floor(dailySalesTrend.length / 10)}
                        />
                        <YAxis className="text-xs" />
                        <ChartTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: "10px" }} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#22c55e"
                          strokeWidth={3}
                          fill="url(#colorRevenue)"
                          name="রেভেনিউ (৳)"
                          dot={false}
                          activeDot={{ r: 6, strokeWidth: 2, stroke: "#22c55e", fill: "#22c55e" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#16a34a"
                          strokeWidth={3}
                          fill="url(#colorSales)"
                          name="বিক্রয় সংখ্যা"
                          dot={false}
                          activeDot={{ r: 6, strokeWidth: 2, stroke: "#16a34a", fill: "#16a34a" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stock" className="space-y-6">
              {/* Stock Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">টোটাল ফ্যাব্রিক্স</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{fabrics.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      স্টকে আছে
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">লো স্টক আইটেমস</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {stockChartData.filter((item) => item.stock < 10).length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ক্রিটিকাল লেভেল
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">টোটাল স্টক ভ্যালু</CardTitle>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      ৳{stockChartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      বর্তমান মার্কেট ভ্যালু
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Stock Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-chart-1" />
                    স্টক লেভেল অ্যানালাইসিস
                  </CardTitle>
                  <CardDescription>ফ্যাব্রিক অনুসারে স্টক লেভেল এবং ভ্যালু ডিস্ট্রিবিউশন</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      stock: {
                        label: "স্টক কোয়ান্টিটি",
                        color: "oklch(var(--chart-1))",
                      },
                      value: {
                        label: "মোট ভ্যালু (৳)",
                        color: "oklch(var(--chart-2))",
                      },
                    }}
                    className="h-[450px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={stockChartData.slice(0, 12)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                        <XAxis
                          dataKey="name"
                          className="text-xs"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          interval={0}
                        />
                        <YAxis className="text-xs" />
                        <ChartTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                        <Line
                          type="monotone"
                          dataKey="stock"
                          stroke="#22c55e"
                          strokeWidth={4}
                          name="স্টক কোয়ান্টিটি"
                          dot={{ fill: "#22c55e", strokeWidth: 3, r: 8 }}
                          activeDot={{ r: 10, stroke: "#22c55e", strokeWidth: 3, fill: "#fff" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={4}
                          name="মোট ভ্যালু (৳)"
                          dot={{ fill: "#3b82f6", strokeWidth: 3, r: 8 }}
                          activeDot={{ r: 10, stroke: "#3b82f6", strokeWidth: 3, fill: "#fff" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Low Stock Alerts - Improved Design */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    লো স্টক অ্যালার্টস
                  </CardTitle>
                  <CardDescription>ক্রিটিকাল স্টক লেভেল মনিটরিং এবং রিপ্লেনিশমেন্ট রেকোমেন্ডেশন</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stockChartData
                      .filter((item) => item.stock < 10)
                      .slice(0, 8)
                      .map((item) => (
                        <div
                          key={item.name}
                          className="group relative overflow-hidden p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-xl border border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.type}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
                                    স্টক: {item.stock} units
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-600">
                                ৳{item.value.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">বর্তমান ভ্যালু</p>
                            </div>
                          </div>

                          {/* Progress bar showing stock level */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span>স্টক লেভেল</span>
                              <span>{item.stock}/100</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((item.stock / 100) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {stockChartData.filter((item) => item.stock < 10).length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                        <Package className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-lg font-semibold text-green-600 mb-2">সব স্টক নরমাল!</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        সব ফ্যাব্রিকের স্টক লেভেল স্বাভাবিক আছে
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-chart-1" />
                    ফ্যাব্রিক সেলস অ্যানালাইসিস
                  </CardTitle>
                  <CardDescription>ফ্যাব্রিক অনুসারে বিক্রয় পারফরম্যান্স বিশ্লেষণ</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      quantity: {
                        label: "বিক্রিত পরিমাণ",
                        color: "oklch(var(--chart-1))",
                      },
                      revenue: {
                        label: "রেভেনিউ (৳)",
                        color: "oklch(var(--chart-2))",
                      },
                    }}
                    className="h-[450px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topSellingFabrics.slice(0, 10)}
                        margin={{ top: 10, right: 20, left: 0, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                        <XAxis
                          dataKey="name"
                          className="text-xs"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                        />
                        <YAxis className="text-xs" />
                        <ChartTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: "10px" }} />
                        <Bar
                          dataKey="quantity"
                          fill="#22c55e"
                          name="বিক্রিত পরিমাণ"
                          radius={[8, 8, 0, 0]}
                          opacity={0.9}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#16a34a"
                          name="রেভেনিউ (৳)"
                          radius={[8, 8, 0, 0]}
                          opacity={0.9}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forecast" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-chart-1" />
                      নেক্সট উইক প্রেডিকশন
                    </CardTitle>
                    <CardDescription>ট্রেন্ড বেইজড সিমপ্লিফাইড ফোরকাস্ট</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <div className="text-5xl font-bold text-chart-1 mb-3">
                      ৳{safeMetrics.forecast.nextWeek.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground mb-6 text-lg">প্রেডিক্টেড রেভেনিউ</p>
                    <div className="flex items-center justify-center gap-3">
                      <Badge
                        variant={
                          safeMetrics.forecast.growthRate > 5
                            ? "default"
                            : safeMetrics.forecast.growthRate > 0
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {safeMetrics.forecast.growthRate > 0 ? "+" : ""}
                        {(safeMetrics.forecast.growthRate || 0).toFixed(1)}% গ্রোথ রেট
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-chart-1" />
                      সেলস ট্রেন্ড অ্যানালাইসিস
                    </CardTitle>
                    <CardDescription>ডেইলি বিক্রয়ের ধারা এবং প্যাটার্ন</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        revenue: {
                          label: "রেভেনিউ (৳)",
                          color: "oklch(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailySalesTrend} margin={{ top: 10, right: 20, left: 0, bottom: 50 }}>
                          <defs>
                            <linearGradient id="colorRevenueForecast" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.3} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                          <XAxis
                            dataKey="date"
                            className="text-xs"
                            angle={-45}
                            textAnchor="end"
                            height={50}
                            interval={Math.floor(dailySalesTrend.length / 8)}
                          />
                          <YAxis className="text-xs" />
                          <ChartTooltip content={<CustomTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#22c55e"
                            strokeWidth={3}
                            fill="url(#colorRevenueForecast)"
                            name="রেভেনিউ (৳)"
                            dot={false}
                            activeDot={{ r: 8, strokeWidth: 2, stroke: "#22c55e", fill: "#22c55e" }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  )
}
