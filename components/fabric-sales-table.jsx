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

export function FabricSalesTable({ salesData, onViewDetails, onCreateSale }) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Format sales data for table
  const formattedSalesData = useMemo(() => {
    return salesData.map((sale) => ({
      ...sale,
      customer_name: sale.customerId?.name || sale.customer_name || "ওয়াক-ইন কাস্টমার",
      payment_status: sale.payment_status || "pending",
      sale_date: sale.sale_date || new Date().toISOString(),
    }))
  }, [salesData])

  // Enhanced filtering
  const filteredData = useMemo(() => {
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
          const name = row.getValue("customer_name") || "ওয়াক-ইন কাস্টমার"
          return (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
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
          return <div className="font-bold text-green-600">৳{amount.toLocaleString("bn-BD")}</div>
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
                onClick={() => onViewDetails(sale)}
                className="h-8 px-3 hover:bg-blue-50 hover:border-blue-300"
              >
                <Eye className="h-4 w-4 mr-1" />
                বিস্তারিত
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(sale, true)}
                className="h-8 px-3 hover:bg-green-50"
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
    data: filteredData,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">মোট বিক্রয়</p>
                  <p className="text-2xl font-bold text-blue-700">{summaryStats.totalSales}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">মোট আয়</p>
                  <p className="text-2xl font-bold text-green-700">
                    ৳{summaryStats.totalAmount.toLocaleString("bn-BD")}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/30 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">পরিশোধিত</p>
                  <p className="text-2xl font-bold text-emerald-700">{summaryStats.paidSales}</p>
                </div>
                <Users className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/30 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">বাকি</p>
                  <p className="text-2xl font-bold text-orange-700">{summaryStats.pendingSales}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
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
              <Button onClick={onCreateSale} className="bg-blue-600 hover:bg-blue-700 h-10">
                <Plus className="h-4 w-4 mr-2" />
                নতুন বিক্রয়
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Table */}
      <Card className="shadow-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-semibold">
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
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="text-muted-foreground">কোনো বিক্রয় তথ্য পাওয়া যায়নি</div>
                        <Button onClick={onCreateSale} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          প্রথম বিক্রয় যোগ করুন
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Enhanced Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
          <div className="text-sm text-muted-foreground">
            পৃষ্ঠা {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}(
            {table.getFilteredRowModel().rows.length} টি এন্ট্রি)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-3"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              পূর্ববর্তী
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 px-3"
            >
              পরবর্তী
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
