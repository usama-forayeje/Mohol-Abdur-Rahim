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
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
   Search,
   Eye,
   Filter,
   Calendar,
   DollarSign,
   TrendingUp,
   ArrowUpDown,
   ChevronLeft,
   ChevronRight,
   Download,
   Users,
   Edit,
   Trash2,
   User,
   ShoppingCart,
   Package,
 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function FabricSalesTable({
   salesData = [],
   selectedFabricFilter,
   setSelectedFabricFilter,
   availableFabrics = [],
   userRole = "staff", 
   onEdit,
   onDelete
 }) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  // Check if user can edit/delete
  const canModify = ["admin", "superAdmin", "manager"].includes(userRole)

  // Create fabric lookup map
  const fabricMap = useMemo(() => {
    return availableFabrics.reduce((acc, fabric) => {
      acc[fabric.$id] = fabric
      return acc
    }, {})
  }, [availableFabrics])

  // Format and parse sales data properly
  const formattedSalesData = useMemo(() => {
    if (!salesData || !Array.isArray(salesData)) return []

    return salesData.map((sale) => {
      let parsedItems = []
      if (typeof sale.items === 'string') {
        try {
          parsedItems = JSON.parse(sale.items)
        } catch (e) {
          console.error('Error parsing items:', e)
        }
      } else if (Array.isArray(sale.items)) {
        parsedItems = sale.items
      }

      // Enrich items with fabric data
      const enrichedItems = parsedItems.map(item => {
        const fabric = fabricMap[item.fabricId]
        return {
          ...item,
          fabricName: fabric?.name || "অজানা ফ্যাব্রিক",
          fabricColor: fabric?.color || "#3B82F6"
        }
      })

      return {
        ...sale,
        customer_name: sale.customer_name || "ওয়াক-ইন কাস্টমার",
        seller_name: sale.soldBy?.name || "অজানা",
        payment_status: sale.payment_status || "pending",
        sale_date: sale.sale_date || new Date().toISOString(),
        items: enrichedItems,
        item_count: enrichedItems.length || 0,
      }
    })
  }, [salesData, fabricMap])

  // Enhanced filtering with date and fabric
  const filteredData = useMemo(() => {
    let filtered = formattedSalesData

    // Fabric filtering
    if (selectedFabricFilter && selectedFabricFilter !== "all") {
      filtered = filtered.filter((sale) => {
        return sale.items.some(item => item.fabricId === selectedFabricFilter)
      })
    }

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
  }, [formattedSalesData, selectedFabricFilter, dateFilter])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalSales = filteredData.length
    const totalPaymentAmount = filteredData.reduce((sum, sale) => sum + (Number(sale.payment_amount) || 0), 0)
    const totalQuantityInMeters = filteredData.reduce((sum, sale) => {
      const items = Array.isArray(sale.items) ? sale.items : []
      return sum + items.reduce((itemSum, item) => itemSum + (Number(item.quantity) || 0), 0)
    }, 0)
    const totalQuantityInYards = totalQuantityInMeters * 1.09361 // Convert meters to yards

    return {
      totalSales,
      totalPaymentAmount,
      totalQuantityInYards: Math.round(totalQuantityInYards * 100) / 100 // Round to 2 decimal places
    }
  }, [filteredData])

  const handleDeleteClick = (sale) => {
    setSelectedSale(sale)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (onDelete && selectedSale) {
      onDelete(selectedSale.$id)
    }
    setDeleteDialogOpen(false)
    setSelectedSale(null)
  }

  const handleViewDetails = (sale) => {
    setSelectedSale(sale)
    setViewModalOpen(true)
  }

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        accessorKey: "sale_date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            তারিখ
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue("sale_date")
          return (
            <div className="font-medium text-sm">
              {date ? new Date(date).toLocaleDateString("bn-BD", {
                day: 'numeric',
                month: 'short',
              }) : "-"}
            </div>
          )
        },
      },
      {
        accessorKey: "items",
        header: "ফ্যাব্রিক বিবরণ",
        cell: ({ row }) => {
          const items = row.getValue("items") || []

          if (!Array.isArray(items) || items.length === 0) {
            return <span className="text-muted-foreground text-sm">কোনো আইটেম নেই</span>
          }

          // Calculate total quantity across all fabrics
          const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

          return (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <div
                    className="w-3 h-3 rounded-full border flex-shrink-0"
                    style={{ backgroundColor: item.fabricColor }}
                  />
                  <span
                    className="text-sm font-medium flex-1 truncate max-w-[120px] relative"
                    title={item.fabricName}
                  >
                    {item.fabricName}
                  </span>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {item.quantity}গজ
                  </Badge>
                </div>
              ))}

              {/* Show total quantity summary */}
              <div className="pt-2 border-t border-dashed border-indigo-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">মোট পরিমাণ:</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs font-bold">
                    {totalQuantity} গজ
                  </Badge>
                </div>
              </div>
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
            className="h-8 px-2"
          >
            মোট টাকা
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const totalAmount = Number(row.getValue("total_amount")) || 0
          const discountAmount = Number(row.original.discount_amount) || 0
          const finalAmount = totalAmount - discountAmount

          return (
            <div className="space-y-1">
              <div className="font-bold text-green-600 dark:text-green-400 text-base">
                ৳{finalAmount.toLocaleString("bn-BD")}
              </div>
              {discountAmount > 0 && (
                <div className="text-xs text-red-600">
                  (ডিস: ৳{discountAmount.toLocaleString("bn-BD")})
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "seller_name",
        header: "বিক্রেতা",
        cell: ({ row }) => {
          const name = row.getValue("seller_name")
          return (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium">{name}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "payment_status",
        header: "স্ট্যাটাস",
        cell: ({ row }) => {
          const status = row.getValue("payment_status") || "pending"
          return (
            <Badge
              variant={status === "paid" ? "default" : "secondary"}
              className="font-medium"
            >
              {status === "paid" ? "পরিশোধিত" : "বাকি"}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        header: "অ্যাকশন",
        cell: ({ row }) => {
          const sale = row.original
          return (
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(sale)}
                className="h-8 px-2.5"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              {canModify && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit && onEdit(sale)}
                    className="h-8 px-2.5 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30"
                  >
                    <Edit className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(sale)}
                    className="h-8 px-2.5 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  </Button>
                </>
              )}
            </div>
          )
        },
      },
    ],
    [onEdit, canModify]
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
    <div className="space-y-4">
      {/* Premium Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Total Revenue Card */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">মোট আয়</p>
                <p className="text-3xl font-black text-emerald-800 dark:text-emerald-200">
                  ৳{summaryStats.totalPaymentAmount.toLocaleString("bn-BD")}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Total Revenue Collected
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders Card */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">মোট অর্ডার</p>
                <p className="text-3xl font-black text-blue-800 dark:text-blue-200">
                  {summaryStats.totalSales}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Total Sales Orders
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Yards Card */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">মোট গজ</p>
                <p className="text-3xl font-black text-amber-800 dark:text-amber-200">
                  {summaryStats.totalQuantityInYards}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Total Yards Sold
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Package className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            ফিল্টার এবং সার্চ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="বিক্রয় খুঁজুন..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedFabricFilter || "all"} onValueChange={setSelectedFabricFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="ফ্যাব্রিক" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ফ্যাব্রিক</SelectItem>
                {availableFabrics.map((fabric) => (
                  <SelectItem key={fabric.$id} value={fabric.$id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: fabric.color || '#3B82F6' }} />
                      <span>{fabric.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full lg:w-36">
                <SelectValue />
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
                table.getColumn("payment_status")?.setFilterValue(value === "all" ? undefined : value)
              }}
            >
              <SelectTrigger className="w-full lg:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                <SelectItem value="paid">পরিশোধিত</SelectItem>
                <SelectItem value="pending">বাকি</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="default" className="flex-1 lg:flex-none gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden lg:inline">এক্সপোর্ট</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground">কোনো বিক্রয় পাওয়া যায়নি</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            পৃষ্ঠা {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            ({table.getFilteredRowModel().rows.length} টি এন্ট্রি)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              পূর্ববর্তী
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              পরবর্তী
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>বিক্রয় মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই বিক্রয়টি স্থায়ীভাবে মুছে যাবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sale Details Modal */}
      <AlertDialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-600" />
              বিক্রয়ের বিস্তারিত তথ্য
            </AlertDialogTitle>
            <AlertDialogDescription>
              বিক্রয়ের সম্পূর্ণ তথ্য দেখুন
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedSale && (
            <div className="space-y-6">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">বিক্রয় আইডি</Label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{selectedSale.$id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">তারিখ</Label>
                  <p className="font-medium">
                    {selectedSale.sale_date ? new Date(selectedSale.sale_date).toLocaleDateString("bn-BD", {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : "N/A"}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              {selectedSale.customer_name && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">গ্রাহক</Label>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedSale.customer_name}</p>
                      {selectedSale.customer_phone && (
                        <p className="text-sm text-muted-foreground">{selectedSale.customer_phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">ফ্যাব্রিক আইটেম</Label>
                <div className="space-y-3">
                  {selectedSale.items?.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border flex-shrink-0"
                          style={{ backgroundColor: item.fabricColor }}
                        />
                        <span className="font-medium">{item.fabricName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {item.quantity}গজ
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">পরিমাণ: </span>
                          <span className="font-medium">{item.quantity} গজ</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">দর/গজ: </span>
                          <span className="font-medium">৳{item.sale_price}</span>
                        </div>
                      </div>
                      <div className="text-right font-semibold text-green-600">
                        মোট: ৳{(item.quantity * item.sale_price).toLocaleString("bn-BD")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">পেমেন্ট সারাংশ</Label>
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>মোট Amount:</span>
                    <span className="font-bold">৳{Number(selectedSale.total_amount || 0).toLocaleString("bn-BD")}</span>
                  </div>
                  {Number(selectedSale.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>ডিসকাউন্ট:</span>
                      <span>-৳{Number(selectedSale.discount_amount || 0).toLocaleString("bn-BD")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>পরিশোধিত:</span>
                    <span className="font-bold text-green-600">৳{Number(selectedSale.payment_amount || 0).toLocaleString("bn-BD")}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>স্ট্যাটাস:</span>
                    <Badge className={selectedSale.payment_status === "paid" ? "bg-green-500/20 text-green-700 border-green-400/30" : "bg-yellow-500/20 text-yellow-700 border-yellow-400/30"}>
                      {selectedSale.payment_status === "paid" ? "পরিশোধিত" : "বাকি"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedSale.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">নোট</Label>
                  <p className="p-3 bg-muted rounded-lg text-sm">{selectedSale.notes}</p>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>বন্ধ করুন</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}