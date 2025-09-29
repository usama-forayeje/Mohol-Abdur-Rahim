"use client"

import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Plus,
  Eye,
  Receipt,
  Filter,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function FabricSalesTable({ salesData = [], onViewDetails, onCreateSale }) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Format sales data for table
  const formattedSalesData = useMemo(() => {
    if (!salesData || !Array.isArray(salesData)) {
      return []
    }

    return salesData.map((sale) => ({
      ...sale,
      customer_name: sale.customerId?.name || sale.customer_name || "No Name",
      payment_status: sale.payment_status || "pending",
      sale_date: sale.sale_date || new Date().toISOString(),
    }))
  }, [salesData])

  // Enhanced filtering
  const filteredData = useMemo(() => {
    if (!formattedSalesData || !Array.isArray(formattedSalesData)) {
      return []
    }

    let filtered = formattedSalesData

    // Date filtering
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter((sale) => new Date(sale.sale_date) >= filterDate)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter((sale) => new Date(sale.sale_date) >= filterDate)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter((sale) => new Date(sale.sale_date) >= filterDate)
          break
      }
    }

    return filtered
  }, [formattedSalesData, dateFilter])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!filteredData || !Array.isArray(filteredData)) {
      return { totalSales: 0, totalAmount: 0, paidSales: 0, pendingSales: 0 }
    }

    const totalSales = filteredData.length
    const totalAmount = filteredData.reduce((sum, sale) => sum + (Number.parseFloat(sale.total_amount) || 0), 0)
    const paidSales = filteredData.filter((sale) => sale.payment_status === "paid").length
    const pendingSales = filteredData.filter((sale) => sale.payment_status === "pending").length

    return { totalSales, totalAmount, paidSales, pendingSales }
  }, [filteredData])

  const columns = useMemo(
    () => [
      {
        accessorKey: "sale_date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            তারিখ
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue("sale_date")
          return <div className="font-medium">{date ? new Date(date).toLocaleDateString("bn-BD") : "-"}</div>
        },
      },
      {
        accessorKey: "customer_name",
        header: "গ্রাহক",
        cell: ({ row }) => {
          const name = row.getValue("customer_name") || "No Name"
          return (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                {name.charAt(0)}
              </div>
              <span className="font-medium">{name}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "total_amount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            মোট Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = Number.parseFloat(row.getValue("total_amount")) || 0
          return <div className="font-bold text-green-600 dark:text-green-400">৳{amount.toLocaleString("bn-BD")}</div>
        },
      },
      {
        accessorKey: "payment_status",
        header: "স্ট্যাটাস",
        cell: ({ row }) => {
          const status = row.getValue("payment_status") || "pending"
          return (
            <Badge
              variant={status === "paid" ? "default" : status === "pending" ? "secondary" : "destructive"}
              className="font-medium"
            >
              {status === "paid" ? "পরিশোধিত" : status === "pending" ? "বাকি" : "বাতিল"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "payment_method",
        header: "পদ্ধতি",
        cell: ({ row }) => {
          const method = row.getValue("payment_method") || "cash"
          return (
            <Badge variant="outline" className="capitalize font-medium">
              {method === "cash" ? "নগদ" : method === "card" ? "কার্ড" : "অনলাইন"}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        header: "একশন",
        cell: ({ row }) => {
          const sale = row.original
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails && onViewDetails(sale)}
                className="h-8 px-3 hover:bg-primary/10 hover:border-primary/50"
              >
                <Eye className="h-4 w-4 mr-1" />
                বিস্তারিত
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails && onViewDetails(sale, true)}
                className="h-8 px-3 hover:bg-green-50 dark:hover:bg-green-950/30"
              >
                <Receipt className="h-4 w-4 mr-1" />
                রসিদ
              </Button>
            </div>
          )
        },
      },
    ],
    [onViewDetails],
  )

  const table = useReactTable({
    data: filteredData || [],
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">মোট বিক্রয়</p>
                  <p className="text-3xl font-black text-primary">{summaryStats.totalSales}</p>
                </div>
                <motion.div
                  className="p-3 bg-primary/10 rounded-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <TrendingUp className="h-8 w-8 text-primary" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">মোট আয়</p>
                  <p className="text-3xl font-black text-green-700 dark:text-green-300">
                    ৳{summaryStats.totalAmount.toLocaleString("bn-BD")}
                  </p>
                </div>
                <motion.div
                  className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">পরিশোধিত</p>
                  <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{summaryStats.paidSales}</p>
                </div>
                <motion.div
                  className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/30 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">বাকি</p>
                  <p className="text-3xl font-black text-orange-700 dark:text-orange-300">{summaryStats.pendingSales}</p>
                </div>
                <motion.div
                  className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced Filters */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            ফিল্টার এবং সার্চ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="বিক্রয় খুঁজুন..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(String(e.target.value))}
                  className="pl-10 h-10"
                />
              </div>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="তারিখ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব তারিখ</SelectItem>
                  <SelectItem value="today">আজ</SelectItem>
                  <SelectItem value="week">এই সপ্তাহ</SelectItem>
                  <SelectItem value="month">এই মাস</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={table.getColumn("payment_status")?.getFilterValue() ?? "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    table.getColumn("payment_status")?.setFilterValue(undefined)
                  } else {
                    table.getColumn("payment_status")?.setFilterValue(value)
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="স্ট্যাটাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                  <SelectItem value="paid">পরিশোধিত</SelectItem>
                  <SelectItem value="pending">বাকি</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-10 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                এক্সপোর্ট
              </Button>
              <Button onClick={onCreateSale} className="bg-primary hover:bg-primary/90 h-10">
                <Plus className="h-4 w-4 mr-2" />
                নতুন বিক্রয়
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Table */}
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-background to-muted/10">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 transition-all duration-300">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-bold text-foreground/80 py-4">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/10 transition-all duration-300"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4 px-6">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-32 text-center">
                      <motion.div
                        className="flex flex-col items-center justify-center space-y-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-muted-foreground text-lg">কোনো বিক্রয় তথ্য পাওয়া যায়নি</div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button onClick={onCreateSale} variant="outline" size="lg" className="bg-primary/10 hover:bg-primary/20 border-primary/30">
                            <Plus className="h-5 w-5 mr-2" />
                            প্রথম বিক্রয় যোগ করুন
                          </Button>
                        </motion.div>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Enhanced Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-gradient-to-r from-muted/10 to-muted/20">
          <motion.div
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            পৃষ্ঠা {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} (
            {table.getFilteredRowModel().rows.length} টি এন্ট্রি)
          </motion.div>
          <div className="flex items-center space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-10 px-4 bg-background/80 hover:bg-background border-border/50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                পূর্ববর্তী
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-10 px-4 bg-background/80 hover:bg-background border-border/50"
              >
                পরবর্তী
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </div>
  )
}
