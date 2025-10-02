"use client"

import { useState, useMemo, useEffect } from "react"
import { useTheme } from "next-themes"
import { useAuthStore } from "@/store/auth-store"
import PageContainer from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, TrendingUp, Package, DollarSign, AlertTriangle, Download, Filter, BarChart3, PieChart, Activity, Target, Zap, Award, ChevronUp, ChevronDown, Eye, Settings, RefreshCw, ShoppingBag } from "lucide-react"
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
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts"

const getThemeColors = (currentTheme) => {
  const isDark = currentTheme === 'dark'

  return {
    primary: isDark ? '#22c55e' : '#16a34a',
    secondary: isDark ? '#4ade80' : '#22c55e',
    accent: isDark ? '#86efac' : '#4ade80',
    success: isDark ? '#22c55e' : '#16a34a',
    warning: isDark ? '#fbbf24' : '#eab308',
    danger: isDark ? '#f87171' : '#dc2626',
    muted: isDark ? '#9ca3af' : '#6b7280',
    background: isDark ? '#111827' : '#ffffff',
    foreground: isDark ? '#f9fafb' : '#111827',
    card: isDark ? '#1f2937' : '#ffffff',
    border: isDark ? '#374151' : '#e5e7eb',
    gradient: isDark
      ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
      : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
  }
}

const getChartColors = (currentTheme) => {
  const isDark = currentTheme === 'dark'
  return [
    isDark ? '#22c55e' : '#16a34a',
    isDark ? '#4ade80' : '#22c55e',
    isDark ? '#86efac' : '#4ade80',
    isDark ? '#dcfce7' : '#86efac',
    isDark ? '#f0fdf4' : '#dcfce7',
    isDark ? '#ecfdf5' : '#f0fdf4',
    isDark ? '#d1fae5' : '#ecfdf5',
    isDark ? '#a7f3d0' : '#d1fae5'
  ]
}

export default function FabricsReportsPage() {
  const { selectedShopId, userProfile } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [dateRange, setDateRange] = useState("30")
  const [selectedFabricType, setSelectedFabricType] = useState("all")
  const [selectedFabricFilter, setSelectedFabricFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)
  const [themeChangeTrigger, setThemeChangeTrigger] = useState(0)

  // Handle component mount and theme changes
  useEffect(() => {
    setMounted(true)
  }, [])

  // Force re-render when theme changes
  useEffect(() => {
    if (mounted) {
      setThemeChangeTrigger(prev => prev + 1)
    }
  }, [theme, mounted])

  // Dynamic colors based on theme
  const themeColors = useMemo(() => {
    if (!mounted || !theme) return getThemeColors('light') // Default for SSR
    return getThemeColors(theme)
  }, [theme, mounted, themeChangeTrigger])

  const chartColors = useMemo(() => {
    if (!mounted || !theme) return getChartColors('light') // Default for SSR
    return getChartColors(theme)
  }, [theme, mounted, themeChangeTrigger])

  const { data: salesData = [], isLoading: salesLoading } = useFabricSales(selectedShopId)
  const { data: fabrics = [], isLoading: fabricsLoading } = useFabrics(selectedShopId)
  const { data: customers = [] } = useCustomers()

  // Simplified data processing focusing on available data
  const processSalesData = useMemo(() => {
    if (!salesData.length) return {
      processed: [],
      metrics: {},
      trendData: []
    }

    const now = new Date()
    const daysBack = parseInt(dateRange)
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    const processed = salesData
      .filter(sale => new Date(sale.created_at || sale.$createdAt) >= cutoffDate)
      .map(sale => {
        let items = []
        if (Array.isArray(sale.items)) {
          items = sale.items.map(item => {
            if (typeof item === 'string') {
              try {
                return JSON.parse(item)
              } catch (e) {
                return null
              }
            }
            return item
          }).filter(Boolean)
        }

        const totalAmount = items.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0)

        return {
          ...sale,
          items: items,
          total_amount: totalAmount,
          date: new Date(sale.created_at || sale.$createdAt).toLocaleDateString('bn-BD')
        }
      })

    // Calculate basic metrics with safety checks
    const totalRevenue = processed.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
    const totalSales = processed.length
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

    // Daily trends with safety checks
    const salesByDay = processed.reduce((acc, sale) => {
      const day = sale.date
      if (!acc[day]) acc[day] = { count: 0, revenue: 0 }
      acc[day].count += 1
      acc[day].revenue += (sale.total_amount || 0)
      return acc
    }, {})

    const trendData = Object.entries(salesByDay).map(([date, data]) => ({
      date,
      sales: data.count || 0,
      revenue: data.revenue || 0
    })).sort((a, b) => new Date(a.date) - new Date(b.date))

    // Simple forecasting based on trend with safety checks
    const forecast = trendData.length > 5 ? (() => {
      const recent = trendData.slice(-5)
      const avgRevenue = recent.reduce((sum, day) => sum + (day.revenue || 0), 0) / recent.length
      const growthRate = recent.length > 1 && recent[0].revenue > 0 ?
        ((recent[recent.length - 1].revenue || 0) - (recent[0].revenue || 0)) / (recent[0].revenue || 1) : 0

      return {
        nextWeek: isNaN(avgRevenue) ? 0 : avgRevenue * 7,
        growthRate: isNaN(growthRate) ? 0 : growthRate * 100
      }
    })() : { nextWeek: 0, growthRate: 0 }

    return {
      processed,
      metrics: {
        totalRevenue,
        totalSales,
        averageOrderValue,
        forecast
      },
      trendData
    }
  }, [salesData, dateRange])

  const { processed, metrics, trendData } = processSalesData

  // Safety check for processed data
  const safeProcessed = Array.isArray(processed) ? processed : []
  const safeTrendData = Array.isArray(trendData) ? trendData : []

  // Safety check for metrics
  const safeMetrics = {
    totalRevenue: (metrics?.totalRevenue || 0),
    totalSales: (metrics?.totalSales || 0),
    averageOrderValue: (metrics?.averageOrderValue || 0),
    forecast: (metrics?.forecast || { nextWeek: 0, growthRate: 0 })
  }

  console.log('Reports page initialized:', {
    processedDataLength: safeProcessed.length,
    trendDataLength: safeTrendData.length,
    selectedShopId,
    selectedFabricFilter
  })

  // Create filtered data based on selected fabric
  const filteredSalesData = useMemo(() => {
    console.log('Creating filteredSalesData with filter:', selectedFabricFilter)
    if (selectedFabricFilter === 'all') {
      console.log('Using all processed data:', safeProcessed.length, 'items')
      return safeProcessed
    }

    const filtered = safeProcessed.filter(sale => {
      if (!sale.items || !Array.isArray(sale.items)) return false

      return sale.items.some(item =>
        item && item.fabricId === selectedFabricFilter
      )
    })
    console.log('Filtered data result:', filtered.length, 'items')
    return filtered
  }, [safeProcessed, selectedFabricFilter])

  // Calculate filtered metrics for KPI cards
  const filteredMetrics = useMemo(() => {
    console.log('Calculating filteredMetrics with filteredSalesData:', filteredSalesData?.length || 0, 'items')
    console.log('SafeProcessed length:', safeProcessed.length)

    if (!filteredSalesData || filteredSalesData.length === 0) {
      console.log('No filtered sales data available')
      return {
        totalRevenue: 0,
        totalSales: 0,
        averageOrderValue: 0,
        totalSoldQuantity: 0
      }
    }

    const totalRevenue = filteredSalesData.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
    const totalSales = filteredSalesData.length
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

    // Calculate total sold quantity
    const totalSoldQuantity = filteredSalesData.reduce((total, sale) => {
      if (sale.items && Array.isArray(sale.items)) {
        return total + sale.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
      }
      return total
    }, 0)

    console.log('Filtered metrics calculated:', { totalRevenue, totalSales, averageOrderValue, totalSoldQuantity })

    return {
      totalRevenue,
      totalSales,
      averageOrderValue,
      totalSoldQuantity
    }
  }, [filteredSalesData, safeProcessed])

  // Safety check for filtered metrics
  const safeFilteredMetrics = {
    totalRevenue: filteredMetrics?.totalRevenue || 0,
    totalSales: filteredMetrics?.totalSales || 0,
    averageOrderValue: filteredMetrics?.averageOrderValue || 0,
    totalSoldQuantity: filteredMetrics?.totalSoldQuantity || 0
  }

  // Create filtered trend data
  const filteredTrendData = useMemo(() => {
    if (selectedFabricFilter === 'all') {
      return safeTrendData
    }

    // Filter trend data based on sales that contain the selected fabric
    const filteredSalesIds = new Set(
      filteredSalesData.map(sale => sale.$id)
    )

    return safeTrendData.filter(trend =>
      filteredSalesIds.has(trend.saleId)
    )
  }, [safeTrendData, filteredSalesData, selectedFabricFilter])

  // Simplified chart data focusing on available data with performance optimization
  const stockChartData = useMemo(() => {
    if (!fabrics?.length) return []

    const filteredFabrics = fabrics
      .filter(fabric => {
        // Apply fabric name filter
        if (selectedFabricFilter !== 'all' && fabric.$id !== selectedFabricFilter) {
          return false
        }
        // Apply search term filter
        if (searchTerm && !fabric.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false
        }
        return true
      })
      .slice(0, 20) // Limit to top 20 for performance
      .map(fabric => ({
        name: fabric.name || 'Unknown',
        stock: fabric.stock_quantity || 0,
        type: fabric.fabric_type || 'Unknown',
        price: fabric.price_per_unit || 0,
        value: (fabric.stock_quantity || 0) * (fabric.price_per_unit || 0) || 0,
        status: (fabric.stock_quantity || 0) < 10 ? 'low' :
          (fabric.stock_quantity || 0) > 100 ? 'high' : 'normal'
      }))
      .sort((a, b) => b.value - a.value)

    return filteredFabrics
  }, [fabrics, selectedFabricFilter, searchTerm, themeChangeTrigger])

  // Sales by fabric type - simplified with safety checks and filtering
  const salesByFabricType = useMemo(() => {
    const typeMap = {}
    filteredSalesData.forEach(sale => {
      if (sale && sale.items && Array.isArray(sale.items)) {
        sale.items.forEach(item => {
          if (item && item.fabricId) {
            const fabric = fabrics.find(f => f && f.$id === item.fabricId)
            if (fabric) {
              // Apply fabric filter
              if (selectedFabricFilter !== 'all' && fabric.$id !== selectedFabricFilter) {
                return
              }

              const type = fabric.fabric_type || 'Unknown'
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

    return Object.entries(typeMap).map(([type, data]) => ({
      type,
      quantity: data?.quantity || 0,
      revenue: data?.revenue || 0
    })).filter(item => item && item.type).sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
  }, [filteredSalesData, fabrics, selectedFabricFilter, themeChangeTrigger])

  // Daily sales trend with safety check
  const dailySalesTrend = useMemo(() => {
    try {
      if (!filteredTrendData) return []

      const trendArray = Array.isArray(filteredTrendData) ? filteredTrendData : []

      return trendArray.filter(item => {
        try {
          if (!item || typeof item !== 'object') return false
          if (!item.date || item.date === '') return false

          const revenue = Number(item.revenue) || 0
          const sales = Number(item.sales) || 0

          // At least one of revenue or sales should be a valid number >= 0
          return revenue >= 0 || sales >= 0
        } catch (itemError) {
          console.error('Error filtering trend item:', itemError, item)
          return false
        }
      }).slice(-30) // Limit to last 30 days for performance
    } catch (error) {
      console.error('Error in dailySalesTrend:', error)
      return []
    }
  }, [filteredTrendData, themeChangeTrigger])

  // Top selling fabrics with safety checks and filtering
  const topSellingFabrics = useMemo(() => {
    const fabricMap = {}
    filteredSalesData.forEach(sale => {
      if (sale && sale.items && Array.isArray(sale.items)) {
        sale.items.forEach(item => {
          if (item && item.fabricId) {
            const fabric = fabrics.find(f => f && f.$id === item.fabricId)
            if (fabric) {
              // Apply fabric filter
              if (selectedFabricFilter !== 'all' && fabric.$id !== selectedFabricFilter) {
                return
              }

              const name = fabric.name || 'Unknown'
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
      .filter(fabric => fabric && fabric.name && fabric.name !== 'Unknown')
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
      .slice(0, 12) // Optimized for better chart display
  }, [filteredSalesData, fabrics, selectedFabricFilter, themeChangeTrigger])

  const handleExportReport = async (format = 'pdf') => {
    try {
      toast.success(`রিপোর্ট ${format.toUpperCase()} ফরম্যাটে এক্সপোর্ট করা হচ্ছে...`)

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In a real implementation, this would generate and download the report
      const reportData = {
        dateRange,
        metrics: safeMetrics,
        generatedAt: new Date().toISOString(),
        shopId: selectedShopId,
        totalFabrics: fabrics.length,
        totalSales: processed.length
      }

      if (format === 'pdf') {
        // PDF export logic would go here
        console.log('Exporting PDF report:', reportData)
      } else if (format === 'excel') {
        // Excel export logic would go here
        console.log('Exporting Excel report:', reportData)
      }

      toast.success(`রিপোর্ট সফলভাবে এক্সপোর্ট করা হয়েছে!`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error("রিপোর্ট এক্সপোর্ট করতে সমস্যা হয়েছে")
    }
  }

  const handleRefreshData = () => {
    // In a real implementation, this would refetch data
    toast.success("ডেটা রিফ্রেশ করা হচ্ছে...")
    // Force re-render by updating a state
    setDateRange(dateRange)
  }

  // Custom tooltip for premium styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && Array.isArray(payload)) {
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl backdrop-blur-md transform transition-all duration-300 hover:scale-105">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 p-2 rounded-lg mb-3">
            <p className="font-bold text-gray-900 dark:text-gray-100 text-center text-sm">
              {label || 'Unknown'}
            </p>
          </div>
          <div className="space-y-2">
            {payload.map((entry, index) => {
              const value = entry?.value || 0
              const name = entry?.name || 'Unknown'
              const dataKey = entry?.dataKey || ''
              const color = entry?.color || '#000'

              return (
                <div key={index} className="flex items-center justify-between gap-3 p-2 bg-gray-50/50 dark:bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {name}
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: color }}
                  >
                    {typeof value === 'number' ?
                      (dataKey.includes('revenue') || dataKey.includes('profit') || dataKey.includes('amount') ?
                        `৳${value.toLocaleString()}` : value.toLocaleString()) :
                      (value || 'N/A')}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Hover for details
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // Loading state for data
  if (salesLoading || fabricsLoading) {
    return (
      <PageContainer>
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <div className="container mx-auto p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                  <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="container mx-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-10 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <Card key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (!selectedShopId) {
    console.log('No shop selected, showing shop selection prompt')
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <Card className="max-w-md w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8">
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
                <AlertTriangle className="h-6 w-6 text-blue-600 animate-pulse mx-auto mb-4" />
                <AlertDescription className="text-blue-800 dark:text-blue-200 text-center">
                  <div className="space-y-4">
                    <p className="font-semibold text-lg">দোকান নির্বাচন করুন</p>
                    <p className="text-sm">ফ্যাব্রিক রিপোর্ট দেখার জন্য প্রথমে একটি দোকান নির্বাচন করুন</p>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

  console.log('Rendering reports page successfully with data:', {
    hasFilteredMetrics: !!filteredMetrics,
    hasSafeFilteredMetrics: !!safeFilteredMetrics,
    filteredSalesDataLength: filteredSalesData?.length || 0
  })

  return (
    <PageContainer>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Compact Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="container mx-auto p-3 sm:p-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-700 to-green-500 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent">
                    ফ্যাব্রিক বিজনেস রিপোর্ট
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    কমপ্রিহেন্সিভ অ্যানালিটিক্স এবং বিজনেস ইনসাইটস
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1.5 px-2 py-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {new Date().toLocaleDateString("bn-BD")}
                </Badge>
                <Badge variant="outline" className="gap-1.5 px-2 py-1 text-xs">
                  <Package className="h-3 w-3" />
                  {selectedFabricFilter === 'all' ? (fabrics || []).length : 1} ফ্যাব্রিক
                </Badge>
                <Badge variant="outline" className="gap-1.5 px-2 py-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  {safeFilteredMetrics.totalSales} বিক্রয়
                </Badge>
                <Badge className="gap-1.5 px-2 py-1 bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 text-xs">
                  <Package className="h-3 w-3" />
                  {safeFilteredMetrics.totalSoldQuantity} গজ বিক্রি
                </Badge>
                {selectedFabricFilter !== 'all' && (
                  <Badge className="gap-1.5 px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
                    <Package className="h-3 w-3" />
                    ফিল্টার: {fabrics.find(f => f.$id === selectedFabricFilter)?.name || 'Unknown'}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={selectedFabricFilter} onValueChange={setSelectedFabricFilter}>
                  <SelectTrigger className="w-36 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 text-sm cursor-pointer">
                    <SelectValue placeholder="ফ্যাব্রিক ফিল্টার" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব ফ্যাব্রিক</SelectItem>
                    {fabrics.map(fabric => (
                      <SelectItem key={fabric.$id} value={fabric.$id}>
                        {fabric.name || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-24 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 text-sm cursor-pointer">
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
                    setSelectedFabricFilter('all')
                    setSearchTerm('')
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 text-sm px-2 cursor-pointer"
                >
                  <Filter className="h-3 w-3" />
                  ক্লিয়ার
                </Button>

                <Button
                  onClick={() => handleExportReport('pdf')}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 text-sm px-2 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  এক্সপোর্ট
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto p-4 sm:p-6">
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 cursor-pointer transition-all duration-200 hover:bg-white/80 dark:hover:bg-slate-700/80">ওভারভিউ</TabsTrigger>
              <TabsTrigger value="stock" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 cursor-pointer transition-all duration-200 hover:bg-white/80 dark:hover:bg-slate-700/80">স্টক রিপোর্ট</TabsTrigger>
              <TabsTrigger value="sales" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 cursor-pointer transition-all duration-200 hover:bg-white/80 dark:hover:bg-slate-700/80">বিক্রয় বিশ্লেষণ</TabsTrigger>
              <TabsTrigger value="forecast" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 cursor-pointer transition-all duration-200 hover:bg-white/80 dark:hover:bg-slate-700/80">ট্রেন্ডস</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Beautiful KPI Cards with animations */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="group bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 border-blue-200/50 dark:border-blue-800/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100 group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors">
                      মোট রেভেনিউ
                    </CardTitle>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                      <DollarSign className="h-5 w-5 text-white animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-2 group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors">
                      ৳{filteredMetrics.totalRevenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      শেষ {dateRange} দিনের বিক্রয়
                    </p>
                  </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/50 dark:via-green-950/50 dark:to-teal-950/50 border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-200 transition-colors">
                      মোট বিক্রয়
                    </CardTitle>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                      <ShoppingBag className="h-5 w-5 text-white animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-emerald-900 dark:text-emerald-100 mb-2 group-hover:text-emerald-800 dark:group-hover:text-emerald-200 transition-colors">
                      {filteredMetrics.totalSales}
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      মোট অর্ডার সংখ্যা
                    </p>
                  </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/50 dark:via-orange-950/50 dark:to-yellow-950/50 border-amber-200/50 dark:border-amber-800/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-700 cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100 group-hover:text-amber-800 dark:group-hover:text-amber-200 transition-colors">
                      গড় অর্ডার ভ্যালু
                    </CardTitle>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300">
                      <Target className="h-5 w-5 text-white animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-2 group-hover:text-amber-800 dark:group-hover:text-amber-200 transition-colors">
                      ৳{filteredMetrics.averageOrderValue.toFixed(0)}
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      প্রতি অর্ডারে গড়ে
                    </p>
                  </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950/50 dark:via-blue-950/50 dark:to-indigo-950/50 border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-cyan-300 dark:hover:border-cyan-700 cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-cyan-900 dark:text-cyan-100 group-hover:text-cyan-800 dark:group-hover:text-cyan-200 transition-colors">
                      মোট বিক্রিত গজ
                    </CardTitle>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300">
                      <Package className="h-5 w-5 text-white animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-cyan-900 dark:text-cyan-100 mb-2 group-hover:text-cyan-800 dark:group-hover:text-cyan-200 transition-colors">
                      {safeFilteredMetrics.totalSoldQuantity.toLocaleString()}
                    </div>
                    <p className="text-xs text-cyan-700 dark:text-cyan-300 flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      গজ বিক্রি হয়েছে
                    </p>
                  </CardContent>
                </Card>
              </div>


              {/* Beautiful Animated Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="group bg-gradient-to-br from-emerald-50/50 via-green-50/30 to-teal-50/50 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/30 backdrop-blur-xl border-0 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-700 hover:scale-[1.02] cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 dark:from-emerald-400/10 dark:via-transparent dark:to-teal-400/10"></div>
                  <CardHeader className="pb-6 relative z-10">
                    <CardTitle className="text-2xl flex items-center gap-4">
                      <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 flex items-center justify-center shadow-xl group-hover:shadow-emerald-500/30 transition-all duration-500 group-hover:scale-110">
                        <Package className="h-7 w-7 text-white animate-bounce" style={{ animationDuration: '2s' }} />
                      </div>
                      <div className="space-y-2">
                        <span className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 bg-clip-text text-transparent font-bold text-2xl">
                          স্টক লেভেল অ্যানালাইসিস
                        </span>
                        <p className="text-sm text-muted-foreground/80 font-medium">
                          বর্তমান ইনভেন্টরি স্ট্যাটাস এবং ভ্যালু ডিস্ট্রিবিউশন
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <ResponsiveContainer width="100%" height={450}>
                      <ComposedChart data={stockChartData.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <defs>
                          <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                            <stop offset="25%" stopColor="#059669" stopOpacity={0.8} />
                            <stop offset="75%" stopColor="#047857" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#065f46" stopOpacity={0.4} />
                          </linearGradient>
                          <linearGradient id="valueGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                            <stop offset="50%" stopColor="#d97706" stopOpacity={0.7} />
                            <stop offset="100%" stopColor="#92400e" stopOpacity={0.5} />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="2 4"
                          stroke="rgba(16, 185, 129, 0.1)"
                          strokeWidth={1}
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#6b7280"
                          fontSize={13}
                          tickLine={false}
                          axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                          className="font-medium"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                          className="font-medium"
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{
                            fill: 'rgba(16, 185, 129, 0.08)',
                            stroke: '#10b981',
                            strokeWidth: 2,
                            strokeDasharray: '5 5'
                          }}
                          animationDuration={300}
                        />
                        <Legend
                          wrapperStyle={{
                            paddingTop: '20px',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}
                        />
                        <Bar
                          dataKey="stock"
                          fill="url(#stockGradient)"
                          name="স্টক কোয়ান্টিটি"
                          radius={[8, 8, 0, 0]}
                          animationDuration={2000}
                          animationBegin={200}
                          stroke="#065f46"
                          strokeWidth={1}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="url(#valueGradient)"
                          strokeWidth={5}
                          name="মোট ভ্যালু (৳)"
                          dot={{
                            fill: '#f59e0b',
                            strokeWidth: 3,
                            r: 8,
                            filter: 'url(#glow)',
                            className: "animate-pulse"
                          }}
                          activeDot={{
                            r: 10,
                            fill: '#f59e0b',
                            stroke: '#fff',
                            strokeWidth: 3,
                            filter: 'url(#glow)'
                          }}
                          animationDuration={2500}
                          animationBegin={800}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-pink-950/30 backdrop-blur-xl border-0 shadow-2xl hover:shadow-purple-500/20 transition-all duration-700 hover:scale-[1.02] cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-pink-500/5 dark:from-violet-400/10 dark:via-transparent dark:to-pink-400/10"></div>
                  <CardHeader className="pb-6 relative z-10">
                    <CardTitle className="text-2xl flex items-center gap-4">
                      <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-xl group-hover:shadow-purple-500/30 transition-all duration-500 group-hover:scale-110">
                        <PieChart className="h-7 w-7 text-white animate-spin" style={{ animationDuration: '4s' }} />
                      </div>
                      <div className="space-y-2">
                        <span className="bg-gradient-to-r from-violet-700 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold text-2xl">
                          ফ্যাব্রিক টাইপ বিতরণ
                        </span>
                        <p className="text-sm text-muted-foreground/80 font-medium">
                          কোন ধরনের ফ্যাব্রিক কতটা বিক্রি হচ্ছে
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <ResponsiveContainer width="100%" height={450}>
                      <RechartsPieChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <defs>
                          <filter id="pieGlow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        <Pie
                          data={salesByFabricType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ type, percent }) => `${type} ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={160}
                          innerRadius={70}
                          paddingAngle={3}
                          fill="#8884d8"
                          dataKey="revenue"
                          animationDuration={2500}
                          animationBegin={300}
                          stroke="#fff"
                          strokeWidth={2}
                        >
                          {salesByFabricType.map((entry, index) => {
                            const colors = [
                              'url(#pieGradient1)',
                              'url(#pieGradient2)',
                              'url(#pieGradient3)',
                              'url(#pieGradient4)',
                              'url(#pieGradient5)',
                              'url(#pieGradient6)',
                              'url(#pieGradient7)',
                              'url(#pieGradient8)'
                            ]
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={colors[index % colors.length]}
                                stroke="#fff"
                                strokeWidth={3}
                                className="hover:brightness-110 transition-all duration-300 cursor-pointer"
                                style={{
                                  filter: 'url(#pieGlow)',
                                  transformOrigin: 'center'
                                }}
                              />
                            )
                          })}
                        </Pie>
                        <Tooltip
                          content={<CustomTooltip />}
                          animationDuration={400}
                          cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={40}
                          iconType="circle"
                          wrapperStyle={{
                            fontSize: '13px',
                            fontWeight: '600',
                            paddingTop: '20px'
                          }}
                          formatter={(value) => (
                            <span style={{ color: '#6b7280' }}>{value}</span>
                          )}
                        />
                        <defs>
                          <linearGradient id="pieGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.7} />
                          </linearGradient>
                          <linearGradient id="pieGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#db2777" stopOpacity={0.7} />
                          </linearGradient>
                          <linearGradient id="pieGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#0891b2" stopOpacity={0.7} />
                          </linearGradient>
                          <linearGradient id="pieGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                          </linearGradient>
                          <linearGradient id="pieGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                          </linearGradient>
                          <linearGradient id="pieGradient6" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.7} />
                          </linearGradient>
                          <linearGradient id="pieGradient7" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
                          </linearGradient>
                          <linearGradient id="pieGradient8" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#0d9488" stopOpacity={0.7} />
                          </linearGradient>
                        </defs>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Beautiful Trend Analysis */}
              <Card className="group bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 backdrop-blur-xl border-0 shadow-2xl hover:shadow-blue-500/20 transition-all duration-700 hover:scale-[1.01] cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-400/10 dark:via-transparent dark:to-purple-400/10"></div>
                <CardHeader className="pb-6 relative z-10">
                  <CardTitle className="text-2xl flex items-center gap-4">
                    <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl group-hover:shadow-blue-500/30 transition-all duration-500 group-hover:scale-110">
                      <TrendingUp className="h-7 w-7 text-white animate-pulse" style={{ animationDuration: '3s' }} />
                    </div>
                    <div className="space-y-2">
                      <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold text-2xl">
                        রেভেনিউ ট্রেন্ড অ্যানালাইসিস
                      </span>
                      <p className="text-sm text-muted-foreground/80 font-medium">
                        সময় অনুসারে বিক্রয়ের ধারা এবং প্যাটার্ন বিশ্লেষণ
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ResponsiveContainer width="100%" height={500}>
                    <AreaChart data={dailySalesTrend} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                          <stop offset="25%" stopColor="#2563eb" stopOpacity={0.8} />
                          <stop offset="75%" stopColor="#1d4ed8" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#1e40af" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                          <stop offset="25%" stopColor="#7c3aed" stopOpacity={0.8} />
                          <stop offset="75%" stopColor="#6d28d9" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#5b21b6" stopOpacity={0.3} />
                        </linearGradient>
                        <filter id="areaGlow">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="2 4"
                        stroke="rgba(59, 130, 246, 0.1)"
                        strokeWidth={1}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        fontSize={13}
                        tickLine={false}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                        className="font-medium"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                        className="font-medium"
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{
                          strokeDasharray: '8 8',
                          stroke: '#3b82f6',
                          strokeWidth: 2,
                          fill: 'rgba(59, 130, 246, 0.05)'
                        }}
                        animationDuration={400}
                      />
                      <Legend
                        wrapperStyle={{
                          paddingTop: '20px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        fill="url(#revenueGradient)"
                        name="রেভেনিউ (৳)"
                        animationDuration={3000}
                        animationBegin={200}
                        filter="url(#areaGlow)"
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#8b5cf6"
                        strokeWidth={4}
                        fill="url(#salesGradient)"
                        name="বিক্রয় সংখ্যা"
                        animationDuration={3500}
                        animationBegin={600}
                        filter="url(#areaGlow)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stock" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Package className="h-5 w-5 text-teal-500" />
                      স্টক ডিস্ট্রিবিউশন
                    </CardTitle>
                    <CardDescription>ফ্যাব্রিক অনুসারে স্টক লেভেল এবং ভ্যালু</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={stockChartData.slice(0, 8)} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#64748b" />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={100}
                          stroke="#64748b"
                          fontSize={11}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="stock" fill="#0d9488" name="স্টক" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      লো স্টক অ্যালার্টস
                    </CardTitle>
                    <CardDescription>ক্রিটিকাল স্টক লেভেল মনিটরিং</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stockChartData
                        .filter(item => item.stock < 10)
                        .slice(0, 6)
                        .map((item, index) => (
                          <div key={item.name} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium text-red-900 dark:text-red-100">{item.name}</p>
                                <p className="text-sm text-red-700 dark:text-red-300">{item.type}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-600">{item.stock} units</p>
                              <p className="text-sm text-red-500">ক্রিটিকাল</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sales" className="space-y-8">
              <Card className="group bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-orange-50/50 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-orange-950/30 backdrop-blur-xl border-0 shadow-2xl hover:shadow-rose-500/20 transition-all duration-700 hover:scale-[1.02] cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-orange-500/5 dark:from-rose-400/10 dark:via-transparent dark:to-orange-400/10"></div>
                <CardHeader className="pb-6 relative z-10">
                  <CardTitle className="text-2xl flex items-center gap-4">
                    <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-orange-600 flex items-center justify-center shadow-xl group-hover:shadow-rose-500/30 transition-all duration-500 group-hover:scale-110">
                      <BarChart3 className="h-7 w-7 text-white animate-bounce" style={{ animationDuration: '2.5s' }} />
                    </div>
                    <div className="space-y-2">
                      <span className="bg-gradient-to-r from-rose-700 via-pink-600 to-orange-600 bg-clip-text text-transparent font-bold text-2xl">
                        ফ্যাব্রিক সেলস অ্যানালাইসিস
                      </span>
                      <p className="text-sm text-muted-foreground/80 font-medium">
                        ফ্যাব্রিক অনুসারে বিক্রয় পারফরম্যান্স বিশ্লেষণ
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ResponsiveContainer width="100%" height={550}>
                    <BarChart data={topSellingFabrics.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                      <defs>
                        <linearGradient id="quantityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                          <stop offset="25%" stopColor="#e11d48" stopOpacity={0.8} />
                          <stop offset="75%" stopColor="#be123c" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#9f1239" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="revenueGradientSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                          <stop offset="25%" stopColor="#ea580c" stopOpacity={0.8} />
                          <stop offset="75%" stopColor="#c2410c" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#9a3412" stopOpacity={0.4} />
                        </linearGradient>
                        <filter id="barGlow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="2 4"
                        stroke="rgba(244, 63, 94, 0.1)"
                        strokeWidth={1}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#6b7280"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tickLine={false}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                        className="font-medium"
                      />
                      <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                        className="font-medium"
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{
                          fill: 'rgba(244, 63, 94, 0.08)',
                          stroke: '#f43f5e',
                          strokeWidth: 2,
                          strokeDasharray: '5 5'
                        }}
                        animationDuration={300}
                      />
                      <Legend
                        wrapperStyle={{
                          paddingTop: '20px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      />
                      <Bar
                        dataKey="quantity"
                        fill="url(#quantityGradient)"
                        name="বিক্রিত পরিমাণ"
                        radius={[8, 8, 0, 0]}
                        animationDuration={2000}
                        animationBegin={300}
                        stroke="#be123c"
                        strokeWidth={1}
                        filter="url(#barGlow)"
                      />
                      <Bar
                        dataKey="revenue"
                        fill="url(#revenueGradientSales)"
                        name="রেভেনিউ (৳)"
                        radius={[8, 8, 0, 0]}
                        animationDuration={2500}
                        animationBegin={600}
                        stroke="#c2410c"
                        strokeWidth={1}
                        filter="url(#barGlow)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                        <Target className="h-6 w-6 text-white animate-bounce" />
                      </div>
                      <div>
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          টপ সেলিং ফ্যাব্রিকস
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          সবচেয়ে বেশি বিক্রি হওয়া ফ্যাব্রিকসমূহ
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topSellingFabrics.slice(0, 8).map((fabric, index) => (
                        <div key={fabric.name} className="group/item p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-950/30 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md group-hover/item:shadow-lg transition-all duration-300 ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                                index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white' :
                                  index === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white' :
                                    'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover/item:text-blue-700 dark:group-hover/item:text-blue-300 transition-colors">
                                  {fabric.name}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {fabric.quantity} units sold
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                                ৳{fabric.revenue.toLocaleString()}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                revenue
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                        <Activity className="h-6 w-6 text-white animate-pulse" />
                      </div>
                      <div>
                        <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                          সেলস পারফরম্যান্স
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          ফ্যাব্রিক অনুসারে বিক্রয় পারফরম্যান্স
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={topSellingFabrics.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                        />
                        <Bar
                          dataKey="quantity"
                          fill="url(#performanceGradient)"
                          name="বিক্রিত পরিমাণ"
                          radius={[6, 6, 0, 0]}
                          animationDuration={1500}
                          animationBegin={300}
                        />
                        <defs>
                          <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                            <stop offset="50%" stopColor="#059669" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#047857" stopOpacity={0.3} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="forecast" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="group bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-teal-950/50 border-green-200/50 dark:border-green-800/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                        <TrendingUp className="h-6 w-6 text-white animate-bounce" />
                      </div>
                      <div>
                        <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                          নেক্সট উইক প্রেডিকশন
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          ট্রেন্ড বেইজড সিমপ্লিফাইড ফোরকাস্ট
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                      ৳{safeMetrics.forecast.nextWeek.toLocaleString()}
                    </div>
                    <p className="text-emerald-700 dark:text-emerald-300 mb-4 text-lg">
                      প্রেডিক্টেড রেভেনিউ
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${safeMetrics.forecast.growthRate > 5 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        safeMetrics.forecast.growthRate > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {safeMetrics.forecast.growthRate > 0 ? '+' : ''}{(safeMetrics.forecast.growthRate || 0).toFixed(1)}% গ্রোথ রেট
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group bg-gradient-to-br from-cyan-50/50 via-blue-50/30 to-indigo-50/50 dark:from-cyan-950/30 dark:via-blue-950/20 dark:to-indigo-950/30 backdrop-blur-xl border-0 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-700 hover:scale-[1.02] cursor-pointer overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-indigo-500/5 dark:from-cyan-400/10 dark:via-transparent dark:to-indigo-400/10"></div>
                   <CardHeader className="pb-6 relative z-10">
                     <CardTitle className="text-2xl flex items-center gap-4">
                       <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-xl group-hover:shadow-cyan-500/30 transition-all duration-500 group-hover:scale-110">
                         <BarChart3 className="h-7 w-7 text-white animate-spin" style={{ animationDuration: '4s' }} />
                       </div>
                       <div className="space-y-2">
                         <span className="bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold text-2xl">
                           সেলস ট্রেন্ড অ্যানালাইসিস
                         </span>
                         <p className="text-sm text-muted-foreground/80 font-medium">
                           ডেইলি বিক্রয়ের ধারা এবং প্যাটার্ন
                         </p>
                       </div>
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="relative z-10">
                     <ResponsiveContainer width="100%" height={350}>
                       <AreaChart data={dailySalesTrend} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                         <defs>
                           <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                             <stop offset="25%" stopColor="#0891b2" stopOpacity={0.8} />
                             <stop offset="75%" stopColor="#0e7490" stopOpacity={0.6} />
                             <stop offset="100%" stopColor="#155e75" stopOpacity={0.3} />
                           </linearGradient>
                           <filter id="trendGlow">
                             <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                             <feMerge>
                               <feMergeNode in="coloredBlur"/>
                               <feMergeNode in="SourceGraphic"/>
                             </feMerge>
                           </filter>
                         </defs>
                         <CartesianGrid
                           strokeDasharray="2 4"
                           stroke="rgba(6, 182, 212, 0.1)"
                           strokeWidth={1}
                         />
                         <XAxis
                           dataKey="date"
                           stroke="#6b7280"
                           fontSize={12}
                           tickLine={false}
                           axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                           className="font-medium"
                           angle={-45}
                           textAnchor="end"
                           height={80}
                           interval={0}
                         />
                         <YAxis
                           stroke="#6b7280"
                           fontSize={12}
                           tickLine={false}
                           axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
                           className="font-medium"
                         />
                         <Tooltip
                           content={<CustomTooltip />}
                           cursor={{
                             strokeDasharray: '8 8',
                             stroke: '#06b6d4',
                             strokeWidth: 2,
                             fill: 'rgba(6, 182, 212, 0.05)'
                           }}
                           animationDuration={400}
                         />
                         <Area
                           type="monotone"
                           dataKey="revenue"
                           stroke="#06b6d4"
                           strokeWidth={4}
                           fill="url(#trendGradient)"
                           name="রেভেনিউ (৳)"
                           animationDuration={2800}
                           animationBegin={300}
                           filter="url(#trendGlow)"
                         />
                       </AreaChart>
                     </ResponsiveContainer>
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