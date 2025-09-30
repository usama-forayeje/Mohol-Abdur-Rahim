"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Tag,
  NotebookIcon,
  Search,
  Filter,
  AlertTriangle,
  X,
  Ruler,
  Palette,
  LayoutGrid,
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

const fabricSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষর হতে হবে"),
  code: z.string().min(1, "কোড অবশ্যই দিতে হবে"),
  stock_quantity: z.number().min(0, "স্টক পরিমাণ ০ বা তার বেশি হতে হবে"),
  purchase_cost_per_meter: z
    .number()
    .min(0, "ক্রয়মূল্য ০ বা তার বেশি হতে হবে"),
  price_per_meter: z.number().min(0, "বিক্রয়মূল্য ০ বা তার বেশি হতে হবে"),
  shopId: z.string().optional(),
  purchaseInvoices: z.array(z.string()).optional(),
  width: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
});

const LOW_STOCK_THRESHOLD = 10;

// ড্রপডাউনের জন্য ডামি অপশন ডেটা
const COLOR_OPTIONS = [
  "লাল", "নীল", "সবুজ", "হলুদ", "কালো", "সাদা", "বাদামী", "গোলাপী", "বেগুনী", "কমলা"
];

const CATEGORY_OPTIONS = [
  "কটন", "সিল্ক", "লিনেন", "পলিয়েস্টার", "উল", "ডেনিম", "নাইলন", "রেয়ন"
];

const WIDTH_OPTIONS = [
  "120", "130", "140", "150", "160", "170", "180"
];

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
  const { data: shops, isLoading: shopsLoading } = useShops();
  const { data: invoices, isLoading: invoiceLoading } = useInvoices();

  const defaultFormValues = {
    name: "",
    code: "",
    stock_quantity: "",
    purchase_cost_per_meter: "",
    price_per_meter: "",
    shopId: "",
    purchaseInvoices: [],
    width: "",
    color: "",
    category: "",
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
        purchaseInvoices: purchaseInvoicesToSet,
        width: selectedFabric.width ? selectedFabric.width.toString() : "",
        color: selectedFabric.color || "",
        category: selectedFabric.category || "",
      });
    }
  }, [selectedFabric, isEditDialogOpen, form]);

  const onSubmit = (values) => {
    const dataToSend = {
      ...values,
      shopId: values.shopId === "" ? null : values.shopId,
      purchaseInvoices:
        values.purchaseInvoices.length > 0 ? values.purchaseInvoices : null,
      width: values.width === "" ? null : values.width,
      color: values.color === "" ? null : values.color,
      category: values.category === "" ? null : values.category,
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
        cell: ({ row }) => `OMR ${row.original.purchase_cost_per_meter}`,
      },
      {
        accessorKey: "price_per_meter",
        header: "বিক্রয়মূল্য/গজ",
        cell: ({ row }) => `OMR ${row.original.price_per_meter}`,
      },
      {
        accessorKey: "width",
        header: "প্রস্থ",
        cell: ({ row }) => row.original.width ? `${row.original.width} সেমি` : "N/A",
      },
      {
        accessorKey: "color",
        header: "রং",
        cell: ({ row }) => row.original.color || "N/A",
      },
      {
        accessorKey: "category",
        header: "ক্যাটাগরি",
        cell: ({ row }) => row.original.category || "N/A",
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
                      আপনি এই "{row.original.name}" ফ্যাব্রিকটি মুছে ফেলতে
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
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ফ্যাব্রিকের নাম *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ফ্যাব্রিকের নাম লিখুন"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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

                  {/* নতুন ফিল্ডগুলো যোগ করুন */}
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>প্রস্থ (সেমি)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="প্রস্থ নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {WIDTH_OPTIONS.map((width) => (
                                <SelectItem key={width} value={width.toString()}>
                                  {width} সেমি
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>রং</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="রং নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COLOR_OPTIONS.map((color) => (
                                <SelectItem key={color} value={color}>
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ক্যাটাগরি</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORY_OPTIONS.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <FormField
                      control={form.control}
                      name="purchaseInvoices"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ইনভয়েস নির্বাচন করুন</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(value ? [value] : [])
                            }
                            value={
                              field.value && field.value.length > 0
                                ? field.value[0]
                                : undefined
                            }
                            disabled={invoiceLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="ইনভয়েস নির্বাচন করুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {invoices?.map((invoice) => (
                                <SelectItem
                                  key={invoice.$id}
                                  value={invoice.$id}
                                >
                                  {invoice.invoice_number} (
                                  {invoice.supplier_name})
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

        {/* Filters Section */}
        <div className="bg-card rounded-lg border p-4 mb-6">
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
                  <Filter className="h-4 w-4 mr-2" />
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
                  <SelectItem value="low">কম স্টক</SelectItem>
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
            <div className="space-y-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredFabrics && filteredFabrics.length > 0 ? (
            <div className="w-full">
              <div className="hidden md:block border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className={
                            isLowStock(row.original.stock_quantity) ? "" : ""
                          }
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
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
              <div className="md:hidden grid grid-cols-1 gap-4 px-4 sm:px-0">
                {filteredFabrics.map((fabric) => (
                  <Card
                    key={fabric.$id}
                    className={`hover:shadow-md transition-shadow ${isLowStock(fabric.stock_quantity) ? " " : ""
                      }`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold flex items-center justify-between">
                        <span>{fabric.name}</span>
                        {isLowStock(fabric.stock_quantity) && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            কম স্টক
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {fabric.code}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <p
                          className={`text-sm font-medium ${isLowStock(fabric.stock_quantity)
                            ? "text-red-600"
                            : ""
                            }`}
                        >
                          স্টক: {fabric.stock_quantity} গজ
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          ক্রয়মূল্য: OMR {fabric.purchase_cost_per_meter}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          বিক্রয়মূল্য: OMR {fabric.price_per_meter}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          প্রস্থ: {fabric.width ? `${fabric.width} সেমি` : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          রং: {fabric.color || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          ক্যাটাগরি: {fabric.category || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          দোকান: {fabric.shopId ? fabric.shopId.name : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <NotebookIcon className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          সাপ্লায়ার নাম:{" "}
                          {fabric.purchaseInvoices &&
                            Array.isArray(fabric.purchaseInvoices) &&
                            fabric.purchaseInvoices.length > 0
                            ? fabric.purchaseInvoices[0].supplier_name || "N/A"
                            : "N/A"}
                        </p>
                      </div>
                      <div className="pt-2 flex gap-2 justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditClick(fabric)}
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
                                <AlertDialogTitle>
                                  আপনি কি নিশ্চিত?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{fabric.name}" ফ্যাব্রিকটি মুছে ফেলতে চলেছেন।
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ফ্যাব্রিকের নাম *</FormLabel>
                    <FormControl>
                      <Input placeholder="ফ্যাব্রিকের নাম লিখুন" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

              {/* নতুন ফিল্ডগুলো যোগ করুন */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>প্রস্থ (সেমি)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="প্রস্থ নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {WIDTH_OPTIONS.map((width) => (
                            <SelectItem key={width} value={width}>
                              {width} সেমি
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>রং</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="রং নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COLOR_OPTIONS.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ক্যাটাগরি</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="purchaseInvoices"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ইনভয়েস নির্বাচন করুন</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value ? [value] : [])
                        }
                        value={
                          field.value && field.value.length > 0
                            ? field.value[0]
                            : undefined
                        }
                        disabled={invoiceLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ইনভয়েস নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {invoices?.map((invoice) => (
                            <SelectItem key={invoice.$id} value={invoice.$id}>
                              {invoice.invoice_number} ({invoice.supplier_name})
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