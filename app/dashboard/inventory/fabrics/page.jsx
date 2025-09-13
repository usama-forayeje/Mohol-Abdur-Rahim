"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
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
} from "lucide-react";
import {
  useFabrics,
  useCreateFabric,
  useDeleteFabric,
  useUpdateFabric,
} from "@/services/fabric-service";
import { useShops } from "@/services/shop-service";
import { toast } from "sonner";

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

export default function FabricPage() {
  const { data: fabrics, isLoading, refetch } = useFabrics();
  const createFabric = useCreateFabric();
  const deleteFabric = useDeleteFabric();
  const updateFabric = useUpdateFabric();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const { data: shops, isLoading: shopsLoading } = useShops();

  const form = useForm({
    resolver: zodResolver(fabricSchema),
    defaultValues: {
      name: "",
      code: "",
      stock_quantity: 0,
      purchase_cost_per_meter: 0,
      price_per_meter: 0,
      shopId: "",
    },
  });

  useEffect(() => {
    if (selectedFabric) {
      form.reset({
        name: selectedFabric.name,
        code: selectedFabric.code,
        stock_quantity: selectedFabric.stock_quantity,
        purchase_cost_per_meter: selectedFabric.purchase_cost_per_meter,
        price_per_meter: selectedFabric.price_per_meter,
        shopId: selectedFabric.shopId ? selectedFabric.shopId.$id : "none",
      });
      setIsEditDialogOpen(true);
    }
  }, [selectedFabric, form]);

  const onSubmit = (values) => {
    const dataToSend = {
      ...values,
      shopId: values.shopId === "none" ? "" : values.shopId,
    };

    if (selectedFabric) {
      updateFabric.mutate(
        { id: selectedFabric.$id, data: dataToSend },
        {
          onSuccess: () => {
            toast.success("ফ্যাব্রিক সফলভাবে আপডেট হয়েছে");
            form.reset();
            setIsEditDialogOpen(false);
            setSelectedFabric(null);
            refetch();
          },
          onError: () => toast.error("ফ্যাব্রিক আপডেট করতে সমস্যা হয়েছে"),
        }
      );
    } else {
      createFabric.mutate(dataToSend, {
        onSuccess: () => {
          toast.success("ফ্যাব্রিক সফলভাবে যোগ করা হয়েছে");
          form.reset();
          setIsDialogOpen(false);
          refetch();
        },
        onError: () => toast.error("ফ্যাব্রিক যোগ করতে সমস্যা হয়েছে"),
      });
    }
  };

  const handleDelete = (id) => {
    deleteFabric.mutate(id, {
      onSuccess: () => {
        toast.success("ফ্যাব্রিক সফলভাবে ডিলিট হয়েছে");
        refetch();
      },
      onError: () => toast.error("ফ্যাব্রিক ডিলিট করতে সমস্যা হয়েছে"),
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "ফ্যাব্রিক",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.code}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "stock_quantity",
        header: "স্টক",
        cell: ({ row }) => `${row.original.stock_quantity} মিটার`,
      },
      {
        accessorKey: "purchase_cost_per_meter",
        header: "ক্রয়মূল্য/মিটার",
        cell: ({ row }) => `৳${row.original.purchase_cost_per_meter}`,
      },
      {
        accessorKey: "price_per_meter",
        header: "বিক্রয়মূল্য/মিটার",
        cell: ({ row }) => `৳${row.original.price_per_meter}`,
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
                    onClick={() => setSelectedFabric(row.original)}
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
                      "{row.original.name}" ফ্যাব্রিকটি মুছে ফেলতে চলেছেন। এই
                      কাজটি বাতিল করা সম্ভব হবে না।
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
    data: fabrics || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <PageContainer>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">ফ্যাব্রিক স্টক</h1>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-2 cursor-pointer w-full sm:w-auto"
                onClick={() => {
                  form.reset();
                  setSelectedFabric(null);
                }}
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
                        <FormLabel>স্টক পরিমাণ (মিটার) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="স্টক পরিমাণ লিখুন"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
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
                        <FormLabel>ক্রয়মূল্য/মিটার *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="ক্রয়মূল্য লিখুন"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
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
                        <FormLabel>বিক্রয়মূল্য/মিটার *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="বিক্রয়মূল্য লিখুন"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shopId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>দোকান নির্বাচন করুন</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || "none"}
                          disabled={shopsLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="দোকান নির্বাচন করুন" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">
                              দোকান নির্বাচন করুন
                            </SelectItem>
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
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
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
        <hr className="my-6 border-t border-gray-200" />
        <div className="mt-8 w-full">
          <h2 className="text-xl font-semibold mb-4 px-4 sm:px-0">
            ফ্যাব্রিক তালিকা
          </h2>
          {isLoading || shopsLoading ? (
            <div className="space-y-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : fabrics && fabrics.length > 0 ? (
            <div className="w-full">
              {/* Desktop Table View */}
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
                        <TableRow key={row.id}>
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

              {/* Mobile Card View (for responsive design) */}
              <div className="md:hidden grid grid-cols-1 gap-4 px-4 sm:px-0">
                {fabrics.map((fabric) => (
                  <Card
                    key={fabric.$id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">
                        {fabric.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {fabric.code}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          স্টক: {fabric.stock_quantity} মিটার
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          ক্রয়মূল্য: ৳{fabric.purchase_cost_per_meter}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          বিক্রয়মূল্য: ৳{fabric.price_per_meter}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          দোকান: {fabric.shopId ? fabric.shopId.name : "N/A"}
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
                                onClick={() => setSelectedFabric(fabric)}
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
                কোন ফ্যাব্রিক যোগ করা হয়নি
              </h3>
              <p className="text-muted-foreground mb-4">
                নতুন ফ্যাব্রিক যোগ করে আপনার তালিকা শুরু করুন
              </p>
              <Button
                onClick={() => {
                  form.reset();
                  setSelectedFabric(null);
                  setIsDialogOpen(true);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                প্রথম ফ্যাব্রিক যোগ করুন
              </Button>
            </div>
          )}
        </div>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                    <FormLabel>স্টক পরিমাণ (মিটার) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="স্টক পরিমাণ লিখুন"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel>ক্রয়মূল্য/মিটার *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="ক্রয়মূল্য লিখুন"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel>বিক্রয়মূল্য/মিটার *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="বিক্রয়মূল্য লিখুন"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shopId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>দোকান নির্বাচন করুন</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "none"}
                      disabled={shopsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="দোকান নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          দোকান নির্বাচন করুন
                        </SelectItem>
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
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
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
