"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useInfiniteQuery,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import PageContainer from "@/components/layout/page-container";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Pencil,
  Package,
  Store,
  BarChart3,
  DollarSign,
  NotebookIcon,
  Search,
  Filter,
  AlertTriangle,
  X,
  Ruler,
  Palette,
  LayoutGrid,
  Download,
  Tag,
} from "lucide-react";
import {
  useFabrics,
  useCreateFabric,
  useDeleteFabric,
  useUpdateFabric,
} from "@/services/fabric-service";
import { useShops } from "@/services/shop-service";
import { toast } from "sonner";
import { useInvoices } from "@/services/purchaseInvoice-service";
import { VoiceTypingButton } from "@/components/ui/voice-typing-button";
import jsPDF from 'jspdf';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const fabricSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষর হতে হবে"),
  code: z.string().min(1, "কোড অবশ্যই দিতে হবে"),
  stock_quantity: z.number().min(0, "স্টক পরিমাণ ০ বা তার বেশি হতে হবে"),
  purchase_cost_per_meter: z
    .number()
    .min(0, "ক্রয়মূল্য ০ বা তার বেশি হতে হবে"),
  price_per_meter: z.number().min(0, "বিক্রয়মূল্য ০ বা তার বেশি হতে হবে"),
  shopId: z.string().optional(),
});

const LOW_STOCK_THRESHOLD = 10;


export default function FabricPage() {
  const { data: fabrics, isLoading, refetch } = useFabrics();
  const createFabric = useCreateFabric();
  const deleteFabric = useDeleteFabric();
  const updateFabric = useUpdateFabric();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShopFilter, setSelectedShopFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Advanced table states
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });

  // Virtual scrolling
  const tableContainerRef = useRef(null);
  const { data: shops, isLoading: shopsLoading } = useShops();
  const { data: invoices, isLoading: invoiceLoading } = useInvoices();

  const defaultFormValues = {
    name: "",
    code: "",
    stock_quantity: "",
    purchase_cost_per_meter: "",
    price_per_meter: "",
    shopId: "",
  };

  const form = useForm({
    resolver: zodResolver(fabricSchema),
    defaultValues: defaultFormValues,
  });

  const resetForm = () => {
    form.reset(defaultFormValues);
    setSelectedFabric(null);
  };

  useEffect(() => {
    if (selectedFabric && isEditDialogOpen) {
      let purchaseInvoicesToSet = [];

      try {
        const selectedInvoices = selectedFabric.purchaseInvoices;
        if (selectedInvoices) {
          if (Array.isArray(selectedInvoices) && selectedInvoices.length > 0) {
            const firstInvoice = selectedInvoices[0];
            const invoiceId =
              firstInvoice?.$id ||
              (typeof firstInvoice === "string" ? firstInvoice : null);
            if (invoiceId) {
              purchaseInvoicesToSet = [invoiceId];
            }
          } else if (selectedInvoices.$id) {
            purchaseInvoicesToSet = [selectedInvoices.$id];
          } else if (typeof selectedInvoices === "string") {
            purchaseInvoicesToSet = [selectedInvoices];
          }
        }
      } catch (error) {
        console.error("Error parsing purchaseInvoices:", error);
        purchaseInvoicesToSet = [];
      }

      form.reset({
        name: selectedFabric.name || "",
        code: selectedFabric.code || "",
        stock_quantity: selectedFabric.stock_quantity ?? 0,
        purchase_cost_per_meter: selectedFabric.purchase_cost_per_meter ?? 0,
        price_per_meter: selectedFabric.price_per_meter ?? 0,
        shopId: selectedFabric.shopId?.$id || "",
      });
    }
  }, [selectedFabric, isEditDialogOpen, form]);

  const onSubmit = (values) => {
    const dataToSend = {
      ...values,
      shopId: values.shopId === "" ? null : values.shopId,
    };

    if (selectedFabric) {
      updateFabric.mutate(
        { id: selectedFabric.$id, data: dataToSend },
        {
          onSuccess: () => {
            toast.success("ফ্যাব্রিক সফলভাবে আপডেট হয়েছে");
            setIsEditDialogOpen(false);
            resetForm();
            refetch();
          },
          onError: (error) => toast.error("ফ্যাব্রিক আপডেট করতে সমস্যা হয়েছে"),
        }
      );
    } else {
      createFabric.mutate(dataToSend, {
        onSuccess: () => {
          toast.success("ফ্যাব্রিক সফলভাবে যোগ করা হয়েছে");
          setIsDialogOpen(false);
          resetForm();
          refetch();
        },
        onError: (error) => toast.error("ফ্যাব্রিক যোগ করতে সমস্যা হয়েছে"),
      });
    }
  };

  const handleDelete = (id) => {
    deleteFabric.mutate(id, {
      onSuccess: () => {
        toast.success("ফ্যাব্রিক সফলভাবে ডিলিট হয়েছে");
        refetch();
      },
      onError: (error) => toast.error("ফ্যাব্রিক ডিলিট করতে সমস্যা হয়েছে"),
    });
  };

  const handleEditClick = (fabric) => {
    setSelectedFabric(fabric);
    setIsEditDialogOpen(true);
  };

  const handleNewFabricClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredFabrics = useMemo(() => {
    if (!fabrics) return [];

    return fabrics.filter((fabric) => {
      const searchMatch =
        fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fabric.code.toLowerCase().includes(searchTerm.toLowerCase());

      const shopMatch =
        selectedShopFilter === "all" ||
        fabric.shopId?.$id === selectedShopFilter;

      const stockMatch =
        stockFilter === "all" ||
        (stockFilter === "low" &&
          fabric.stock_quantity <= LOW_STOCK_THRESHOLD) ||
        (stockFilter === "normal" &&
          fabric.stock_quantity > LOW_STOCK_THRESHOLD);

      return searchMatch && shopMatch && stockMatch;
    });
  }, [fabrics, searchTerm, selectedShopFilter, stockFilter]);

  const lowStockCount = useMemo(() => {
    return (
      fabrics?.filter((fabric) => fabric.stock_quantity <= LOW_STOCK_THRESHOLD)
        .length || 0
    );
  }, [fabrics]);

  const isLowStock = (quantity) => quantity <= LOW_STOCK_THRESHOLD;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedShopFilter("all");
    setStockFilter("all");
  };

  const hasActiveFilters =
    searchTerm || selectedShopFilter !== "all" || stockFilter !== "all";

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "ফ্যাব্রিক",
        cell: ({ row }) => (
          <div>
            <div className="font-medium flex items-center gap-2">
              {row.original.name}
              {isLowStock(row.original.stock_quantity) && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  কম স্টক
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.original.code}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "stock_quantity",
        header: "স্টক",
        cell: ({ row }) => (
          <div
            className={`font-medium ${isLowStock(row.original.stock_quantity) ? "text-red-600" : ""
              }`}
          >
            {row.original.stock_quantity} গজ
          </div>
        ),
      },
      {
        accessorKey: "purchase_cost_per_meter",
        header: "ক্রয়মূল্য/গজ",
        cell: ({ row }) => `(R) ${row.original.purchase_cost_per_meter}`,
      },
      {
        accessorKey: "price_per_meter",
        header: "বিক্রয়মূল্য/গজ",
        cell: ({ row }) => `(R) ${row.original.price_per_meter}`,
      },
      {
        accessorKey: "shopId",
        header: "দোকান",
        cell: ({ row }) =>
          row.original.shopId ? row.original.shopId.name : "N/A",
      },
      {
        id: "actions",
        header: "অ্যাকশন",
        cell: ({ row }) => (
          <div className="flex gap-2 justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditClick(row.original)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>ফ্যাব্রিক এডিট করুন</p>
                </TooltipContent>
              </Tooltip>
              <AlertDialog>
                <Tooltip>
                  <AlertDialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                  </AlertDialogTrigger>
                  <TooltipContent>
                    <p>ফ্যাব্রিক ডিলিট করুন</p>
                  </TooltipContent>
                </Tooltip>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                    <AlertDialogDescription>
                      আপনি এই "{row.original.code}" ফ্যাব্রিকটি মুছে ফেলতে
                      চলেছেন।
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>বাতিল</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(row.original.$id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      ডিলিট করুন
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredFabrics || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    enableMultiRowSelection: false,
    manualPagination: false,
    pageCount: Math.ceil((filteredFabrics?.length || 0) / pagination.pageSize),
  });

  // Virtual scrolling setup
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 45,
    overscan: 5,
  });

  return (
    <PageContainer>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">ফ্যাব্রিক স্টক</h1>
            {lowStockCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {lowStockCount} কম স্টক
              </Badge>
            )}
          </div>

          {/* Quick Stats - Green Theme */}
          <div className="flex items-center gap-4 text-sm bg-green-50/50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200/50 dark:border-green-800/30">
            <div className="text-center">
              <div className="font-bold text-lg text-green-700 dark:text-green-300">{filteredFabrics.length}</div>
              <div className="text-green-600/80 dark:text-green-400/80">মোট ফ্যাব্রিক</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-green-700 dark:text-green-300">
                {filteredFabrics.reduce((sum, fabric) => sum + fabric.stock_quantity, 0)} গজ
              </div>
              <div className="text-green-600/80 dark:text-green-400/80">মোট স্টক</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-green-700 dark:text-green-300">
                (R) {filteredFabrics.reduce((sum, fabric) => sum + (fabric.price_per_meter * fabric.stock_quantity), 0).toFixed(2)}
              </div>
              <div className="text-green-600/80 dark:text-green-400/80">মোট মূল্য</div>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-2 cursor-pointer w-full sm:w-auto"
                onClick={handleNewFabricClick}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">
                  নতুন ফ্যাব্রিক যোগ করুন
                </span>
                <span className="sm:hidden">নতুন</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  নতুন ফ্যাব্রিক যোগ করুন
                </DialogTitle>
                <DialogDescription>
                  নিচের ফর্ম পূরণ করে নতুন ফ্যাব্রিক যোগ করুন
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 mt-4"
                >
                  {/* Name Field - Full Width and Prominent */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          ফ্যাব্রিকের নাম *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="ফ্যাব্রিকের নাম লিখুন (যেমন: সুতি কাপড়, সিল্ক, লিনেন ইত্যাদি)"
                              className="h-12 text-base pr-12"
                              {...field}
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <VoiceTypingButton
                                fieldName="name"
                                setValue={form.setValue}
                                currentValue={field.value}
                                placeholder="ফ্যাব্রিকের নাম"
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ফ্যাব্রিক কোড *</FormLabel>
                          <FormControl>
                            <Input placeholder="ফ্যাব্রিক কোড লিখুন" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stock_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>স্টক পরিমাণ (গজ) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="স্টক পরিমাণ লিখুন"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="purchase_cost_per_meter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ক্রয়মূল্য/গজ *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="ক্রয়মূল্য লিখুন"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price_per_meter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>বিক্রয়মূল্য/গজ *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="বিক্রয়মূল্য লিখুন"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="shopId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>দোকান নির্বাচন করুন</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                            disabled={shopsLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="দোকান নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {shops?.map((shop) => (
                                <SelectItem key={shop.$id} value={shop.$id}>
                                  {shop.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={resetForm}
                      >
                        বাতিল
                      </Button>
                    </DialogClose>
                    <Button type="submit" className="w-full sm:w-auto">
                      সংরক্ষণ করুন
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters Section - Green Theme */}
        <div className="bg-green-50/30 dark:bg-green-950/10 rounded-lg border border-green-200/50 dark:border-green-800/30 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="ফ্যাব্রিক নাম বা কোড দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={selectedShopFilter}
                onValueChange={setSelectedShopFilter}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Store className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="দোকান ফিল্টার" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব দোকান</SelectItem>
                  {shops?.map((shop) => (
                    <SelectItem key={shop.$id} value={shop.$id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="স্টক ফিল্টার" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব স্টক</SelectItem>
                  <SelectItem value="low">কম স্টক (১০ এর কম)</SelectItem>
                  <SelectItem value="normal">স্বাভাবিক স্টক</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  ফিল্টার সাফ করুন
                </Button>
              )}

              {/* Export Button - Green Theme */}
              <Button
                variant="default"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white dark:text-white"
                onClick={async () => {
                  try {
                    // Dynamically import jspdf-autotable
                    const jspdfAutotable = await import('jspdf-autotable');

                    // Create new PDF document with Bengali font support
                    const doc = new jsPDF({
                      orientation: 'portrait',
                      unit: 'mm',
                      format: 'a4',
                      putOnlyUsedFonts: true,
                      compress: true
                    });

                    // Set font for Bengali text
                    doc.setFont('helvetica');

                    // Add company header with proper encoding
                    doc.setFontSize(20);
                    doc.setTextColor(34, 197, 94); // Green color
                    try {
                      doc.text('Amar Fabrics', 20, 20);
                    } catch (e) {
                      doc.text('Amar Fabrics', 20, 20);
                    }

                    doc.setFontSize(16);
                    doc.setTextColor(0, 0, 0);
                    doc.text('Fabric Stock Report', 20, 35);

                    // Add current date
                    const currentDate = new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 100);
                    doc.text(`Report Generated: ${currentDate}`, 20, 50);

                    // Add summary statistics
                    doc.setFontSize(12);
                    doc.setTextColor(0, 0, 0);
                    doc.text(`Total Fabrics: ${filteredFabrics.length}`, 20, 65);
                    doc.text(`Total Stock: ${filteredFabrics.reduce((sum, fabric) => sum + fabric.stock_quantity, 0)} yards`, 20, 75);
                    doc.text(`Total Value: (R) ${filteredFabrics.reduce((sum, fabric) => sum + (fabric.price_per_meter * fabric.stock_quantity), 0).toFixed(2)}`, 20, 85);

                    // Add note about data format
                    doc.setFontSize(9);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Note: For original Bengali names and shop details, please check the web interface', 20, 95);

                    // Prepare table data (simplified for PDF compatibility)
                    const tableData = filteredFabrics.map((fabric, index) => [
                      (index + 1).toString(),
                      `Fabric-${fabric.code}`, // Use code as identifier
                      fabric.code,
                      fabric.stock_quantity.toString(),
                      `(R) ${fabric.purchase_cost_per_meter}`,
                      `(R) ${fabric.price_per_meter}`,
                      fabric.shopId ? `Shop-${fabric.shopId.$id.slice(-4)}` : "N/A"
                    ]);

                    // Add table using jspdf-autotable
                    jspdfAutotable.default(doc, {
                      head: [['Sl.No', 'Fabric ID', 'Code', 'Stock (yards)', 'Purchase Price', 'Sale Price', 'Shop ID']],
                      body: tableData,
                      startY: 105,
                      styles: {
                        fontSize: 9,
                        cellPadding: 3,
                      },
                      headStyles: {
                        fillColor: [34, 197, 94], // Green header
                        textColor: 255,
                        fontSize: 10,
                        fontStyle: 'bold',
                      },
                      alternateRowStyles: {
                        fillColor: [240, 253, 244], // Light green for alternate rows
                      },
                      margin: { top: 100 },
                    });

                    // Add footer
                    const pageCount = doc.getNumberOfPages();
                    for (let i = 1; i <= pageCount; i++) {
                      doc.setPage(i);
                      doc.setFontSize(8);
                      doc.setTextColor(100, 100, 100);
                      doc.text(
                        `Page ${i} of ${pageCount}`,
                        doc.internal.pageSize.width - 30,
                        doc.internal.pageSize.height - 10
                      );
                    }

                    // Save PDF
                    const fileName = `fabric-stock-report-${new Date().toISOString().split('T')[0]}.pdf`;
                    doc.save(fileName);

                    toast.success("ফ্যাব্রিক স্টক রিপোর্ট PDF এ এক্সপোর্ট করা হয়েছে");
                  } catch (error) {
                    console.error('PDF Export Error:', error);
                    toast.error("PDF এক্সপোর্ট করতে সমস্যা হয়েছে");
                  }
                }}
              >
                <Download className="h-4 w-4" />
                এক্সপোর্ট
              </Button>
            </div>
          </div>
        </div>

        <hr className="my-6 border-t border-gray-200" />
        <div className="mt-8 w-full">
          <div className="flex justify-between items-center mb-4 px-4 sm:px-0">
            <h2 className="text-xl font-semibold">ফ্যাব্রিক তালিকা</h2>
            <div className="text-sm text-muted-foreground">
              মোট: {filteredFabrics.length} টি ফ্যাব্রিক
            </div>
          </div>

          {isLoading || shopsLoading ? (
            <div className="space-y-3 p-4 border border-green-200/50 dark:border-green-800/30 rounded-lg">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px] dark:bg-muted/50" />
                    <Skeleton className="h-4 w-[200px] dark:bg-muted/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFabrics && filteredFabrics.length > 0 ? (
            <div className="w-full space-y-4">
              {/* Advanced Table Controls - Green Theme */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-green-50/30 dark:bg-green-950/10 rounded-lg border border-green-200/50 dark:border-green-800/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">সারি নির্বাচন করুন:</span>
                  <Select
                    value={pagination.pageSize.toString()}
                    onValueChange={(value) => setPagination(prev => ({ ...prev, pageSize: Number(value) }))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    পূর্ববর্তী
                  </Button>
                  <span className="text-sm">
                    পৃষ্ঠা {table.getState().pagination.pageIndex + 1} এর {table.getPageCount()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    পরবর্তী
                  </Button>
                </div>
              </div>

              {/* Virtual Scrolling Table - Green Theme */}
              <div className="hidden md:block border border-green-200/50 dark:border-green-800/30 rounded-lg overflow-hidden">
                <div className="max-h-[600px] overflow-auto" ref={tableContainerRef}>
                  <Table>
                    <TableHeader className="sticky top-0 bg-background dark:bg-background/95 backdrop-blur-sm z-10 border-b dark:border-border/50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="whitespace-nowrap">
                              {header.isPlaceholder
                                ? null
                                : header.column.getCanSort() ? (
                                  <Button
                                    variant="ghost"
                                    onClick={header.column.getToggleSortingHandler()}
                                    className="h-auto p-0 font-semibold hover:bg-transparent"
                                  >
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                                    {header.column.getIsSorted() === "asc" && (
                                      <ArrowUpDown className="ml-2 h-4 w-4" />
                                    )}
                                    {header.column.getIsSorted() === "desc" && (
                                      <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" />
                                    )}
                                  </Button>
                                ) : (
                                  flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )
                                )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {rowVirtualizer.getVirtualItems().length > 0 ? (
                        rowVirtualizer.getVirtualItems().map((virtualRow) => {
                          const row = rows[virtualRow.index];
                          return (
                            <TableRow
                              key={row.id}
                              className={`hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors ${isLowStock(row.original.stock_quantity)
                                ? "bg-red-50/50 dark:bg-red-950/30 border-l-2 border-l-red-500"
                                : "dark:bg-background/50"
                                }`}
                              style={{
                                height: `${virtualRow.size}px`,
                              }}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="py-3">
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            কোন ডেটা নেই।
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {/* Enhanced Mobile View */}
              <div className="md:hidden space-y-3 px-4 sm:px-0">
                {filteredFabrics.map((fabric) => (
                  <Card
                    key={fabric.$id}
                    className={`hover:shadow-lg transition-all duration-200 border-l-4 dark:border-border/50 ${isLowStock(fabric.stock_quantity)
                      ? "border-l-red-500 bg-red-50/50 dark:bg-red-950/30"
                      : "border-l-green-500 hover:border-l-green-400 dark:bg-green-50/30 dark:hover:bg-green-950/20"
                      }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                            {fabric.name}
                          </CardTitle>
                          <p className="text-sm font-mono text-green-600 dark:text-green-400 mb-2">
                            কোড: {fabric.code}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isLowStock(fabric.stock_quantity) ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              <Package className="h-3 w-3 mr-1" />
                              {fabric.stock_quantity} গজ
                            </Badge>
                            {isLowStock(fabric.stock_quantity) && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                কম স্টক
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="font-medium text-foreground dark:text-foreground">ক্রয়মূল্য:</span>
                          </div>
                          <p className="text-sm font-bold text-green-700 dark:text-green-300">
                            (R) {fabric.purchase_cost_per_meter}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="font-medium text-foreground dark:text-foreground">বিক্রয়মূল্য:</span>
                          </div>
                          <p className="text-sm font-bold text-green-700 dark:text-green-300">
                            (R) {fabric.price_per_meter}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Store className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="font-medium text-foreground dark:text-foreground">দোকান:</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {fabric.shopId ? fabric.shopId.name : "N/A"}
                        </p>
                      </div>

                      {fabric.purchaseInvoices &&
                        Array.isArray(fabric.purchaseInvoices) &&
                        fabric.purchaseInvoices.length > 0 && (
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <NotebookIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="font-medium text-foreground dark:text-foreground">সাপ্লায়ার:</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {fabric.purchaseInvoices[0].supplier_name || "N/A"}
                            </p>
                          </div>
                        )}

                      <div className="flex gap-2 justify-end pt-3 border-t">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(fabric)}
                                className="h-8 px-3 text-xs"
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                এডিট
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>ফ্যাব্রিক এডিট করুন</p>
                            </TooltipContent>
                          </Tooltip>
                          <AlertDialog>
                            <Tooltip>
                              <AlertDialogTrigger asChild>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 px-3 text-xs"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    ডিলিট
                                  </Button>
                                </TooltipTrigger>
                              </AlertDialogTrigger>
                              <TooltipContent>
                                <p>ফ্যাব্রিক ডিলিট করুন</p>
                              </TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  আপনি কি নিশ্চিত?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{fabric.name}" ({fabric.code}) ফ্যাব্রিকটি মুছে ফেলতে চলেছেন।
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(fabric.$id)}
                                >
                                  ডিলিট করুন
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20 w-full">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {hasActiveFilters
                  ? "কোন ফ্যাব্রিক পাওয়া যায়নি"
                  : "কোন ফ্যাব্রিক যোগ করা হয়নি"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "আপনার ফিল্টার অনুযায়ী কোন ফ্যাব্রিক খুঁজে পাওয়া যায়নি"
                  : "নতুন ফ্যাব্রিক যোগ করে আপনার তালিকা শুরু করুন"
                }
              </p>

              {hasActiveFilters ? (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  ফিল্টার সাফ করুন
                </Button>
              ) : (
                <Button
                  onClick={handleNewFabricClick}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  প্রথম ফ্যাব্রিক যোগ করুন
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">ফ্যাব্রিক এডিট করুন</DialogTitle>
            <DialogDescription>
              নিচের ফর্মটি পূরণ করে ফ্যাব্রিক তথ্য আপডেট করুন
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              {/* Name Field - Full Width and Prominent */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center justify-between">
                      <span>ফ্যাব্রিকের নাম *</span>
                      <VoiceTypingButton
                        fieldName="name"
                        setValue={form.setValue}
                        currentValue={field.value}
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ফ্যাব্রিকের নাম লিখুন (যেমন: সুতি কাপড়, সিল্ক, লিনেন ইত্যাদি)"
                        className="h-12 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ফ্যাব্রিক কোড *</FormLabel>
                      <FormControl>
                        <Input placeholder="ফ্যাব্রিক কোড লিখুন" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>স্টক পরিমাণ (গজ) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="স্টক পরিমাণ লিখুন"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? "" : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchase_cost_per_meter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ক্রয়মূল্য/গজ *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ক্রয়মূল্য লিখুন"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? "" : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_per_meter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>বিক্রয়মূল্য/গজ *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="বিক্রয়মূল্য লিখুন"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? "" : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="shopId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>দোকান নির্বাচন করুন</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        disabled={shopsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="দোকান নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shops?.map((shop) => (
                            <SelectItem key={shop.$id} value={shop.$id}>
                              {shop.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={resetForm}
                  >
                    বাতিল
                  </Button>
                </DialogClose>
                <Button type="submit" className="w-full sm:w-auto">
                  আপডেট করুন
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}