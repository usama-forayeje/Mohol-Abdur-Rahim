"use client"

import React, { useState, useMemo, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  useInvoices,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  purchaseInvoiceService,
} from "@/services/purchaseInvoice-service"
import { useInvoiceStore } from "@/store/purchesInvoice-store"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"

import {
  Trash2,
  Edit2,
  FileText,
  Search,
  Loader2,
  Plus,
  Upload,
  X,
  ImageIcon,
  Calendar,
  DollarSign,
  Building2,
  Receipt,
  ImagePlusIcon as ImageLucide,
  ExternalLink,
} from "lucide-react"
import Image from "next/image"
import PageContainer from "@/components/layout/page-container"
import { format } from "date-fns"
import { toast } from "sonner"
import { VoiceTypingButton } from "@/components/ui/voice-typing-button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const invoiceSchema = z.object({
  invoice_number: z
    .string()
    .min(1, "ইনভয়েস নম্বর আবশ্যক")
    .regex(/^[A-Za-z0-9\-/]+$/, "শুধুমাত্র অক্ষর, সংখ্যা, ড্যাশ এবং স্ল্যাশ ব্যবহার করুন"),
  invoice_date: z
    .string()
    .min(1, "তারিখ আবশ্যক")
    .refine((date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      return selectedDate <= today
    }, "তারিখ আজকের বা পূর্ববর্তী হতে হবে"),
  supplier_name: z
    .string()
    .min(1, "সরবরাহকারীর নাম আবশ্যক")
    .min(2, "সরবরাহকারীর নাম কমপক্ষে ২ অক্ষরের হতে হবে")
    .max(100, "সরবরাহকারীর নাম ১০০ অক্ষরের বেশি হতে পারবে না"),
  total_amount: z
    .string()
    .min(1, "পরিমাণ আবশ্যক")
    .regex(/^\d+(\.\d{1,2})?$/, "সঠিক পরিমাণ লিখুন (যেমন: ১২৩.৪৫)")
    .refine((val) => Number.parseFloat(val) > 0, "পরিমাণ শূন্যের বেশি হতে হবে")
    .refine((val) => Number.parseFloat(val) <= 999999.99, "পরিমাণ খুব বেশি"),
  file: z.any().optional(),
})

// Bengali translations
const translations = {
  title: "ক্রয় ইনভয়েস",
  description: "আপনার ক্রয় ইনভয়েসগুলি দক্ষতার সাথে পরিচালনা করুন",
  addInvoice: "ইনভয়েস যোগ করুন",
  totalInvoices: "মোট ইনভয়েস",
  totalAmount: "মোট পরিমাণ",
  thisMonth: "এই মাস",
  invoiceRecords: "ইনভয়েস রেকর্ড",
  allInvoices: "সমস্ত আপনার ক্রয় ইনভয়েস এক জায়গায়",
  searchPlaceholder: "ইনভয়েস বা সরবরাহকারী অনুসন্ধান করুন...",
  noInvoices: "কোন ইনভয়েস পাওয়া যায়নি",
  noInvoicesDesc: "আপনার প্রথম ইনভয়েস যোগ করে শুরু করুন",
  invoiceNumber: "ইনভয়েস নম্বর *",
  invoiceDate: "ইনভয়েস তারিখ *",
  supplierName: "সরবরাহকারীর নাম *",
  totalAmountLabel: "মোট পরিমাণ (OMR) *",
  invoiceAttachment: "ইনভয়েস সংযুক্তি",
  clickToUpload: "আপলোড করতে ক্লিক করুন বা ফাইলটি এখানে ড্র্যাগ করুন",
  fileTypes: "PNG, JPG, PDF 10MB পর্যন্ত",
  preview: "প্রিভিউ",
  cancel: "বাতিল",
  updateInvoice: "ইনভয়েস আপডেট করুন",
  addInvoiceButton: "ইনভয়েস যোগ করুন",
  editInvoice: "ইনভয়েস সম্পাদনা করুন",
  editInvoiceDesc: "নিচে আপনার ইনভয়েস তথ্য আপডেট করুন",
  newInvoice: "নতুন ইনভয়েস যোগ করুন",
  newInvoiceDesc: "আপনার নতুন ক্রয় ইনভয়েসের বিবরণ পূরণ করুন",
  areYouSure: "আপনি কি নিশ্চিত?",
  deleteConfirm: "ইনভয়েস #{{number}} থেকে {{supplier}} মুছে ফেলা হবে। এই কর্মটি পূর্বাবস্থায় ফেরানো যাবে না।",
  delete: "মুছুন",
  invoicePreview: "ইনভয়েস ইমেজ প্রিভিউ",
  actions: "ক্রিয়াসমূহ",
  amount: "পরিমাণ (OMR)",
  attachment: "সংযুক্তি",
  date: "তারিখ",
  supplier: "সরবরাহকারী",
}


export default function PurchaseInvoicePage() {
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [search, setSearch] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [existingFileUrl, setExistingFileUrl] = useState(null)

  // Date filtering
  const [dateFilter, setDateFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState("all")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
  })

  // Watch the total_amount field to handle input changes
  const totalAmountValue = watch("total_amount")

  const { isLoading } = useInvoices()
  const invoices = useInvoiceStore((state) => state.invoices)

  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()
  const deleteInvoice = useDeleteInvoice()

  // Memoized unique suppliers for filter - performance optimization
  const uniqueSuppliers = useMemo(() => {
    if (!invoices?.length) return []
    const suppliers = [...new Set(invoices.map((inv) => inv?.supplier_name).filter(Boolean))]
    return suppliers.sort()
  }, [invoices])

  // Memoized enhanced filtering - performance optimization
  const filteredInvoices = useMemo(() => {
    if (!invoices?.length) return []

    let filtered = invoices

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoice_number.toLowerCase().includes(searchLower) ||
          invoice.supplier_name.toLowerCase().includes(searchLower),
      )
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(invoice.invoice_date)

        switch (dateFilter) {
          case "today":
            return invoiceDate >= today
          case "week":
            const weekAgo = new Date(today)
            weekAgo.setDate(today.getDate() - 7)
            return invoiceDate >= weekAgo
          case "month":
            const monthAgo = new Date(today)
            monthAgo.setMonth(today.getMonth() - 1)
            return invoiceDate >= monthAgo
          default:
            return true
        }
      })
    }

    // Supplier filter
    if (supplierFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.supplier_name === supplierFilter)
    }

    return filtered
  }, [invoices, search, dateFilter, supplierFilter])

  // Memoized callbacks for performance
  const clearFilters = useCallback(() => {
    setSearch("")
    setDateFilter("all")
    setSupplierFilter("all")
  }, [])

  const hasActiveFilters = useMemo(() => {
    return search || dateFilter !== "all" || supplierFilter !== "all"
  }, [search, dateFilter, supplierFilter])

  const openForm = useCallback(() => {
    resetForm()
    setIsFormOpen(true)
  }, [])

  const resetForm = useCallback(() => {
    reset()
    setSelectedFile(null)
    setFilePreview(null)
    setExistingFileUrl(null)
    setEditingInvoice(null)
  }, [reset])

  // Memoized handlers for performance
  const handleEdit = useCallback(
    (invoice) => {
      setEditingInvoice(invoice)
      setValue("invoice_number", invoice.invoice_number)
      setValue("invoice_date", invoice.invoice_date)
      setValue("supplier_name", invoice.supplier_name)
      setValue("total_amount", invoice.total_amount.toString())

      // Set existing file preview if available
      if (invoice.fileId) {
        const fileUrl = purchaseInvoiceService.getFileUrl(invoice.fileId)
        setExistingFileUrl(fileUrl)

        // Check if it's an image for preview
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl)) {
          setFilePreview(fileUrl)
        }
      }

      setIsFormOpen(true)
    },
    [setValue],
  )

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0]
    if (file && file.type) {
      setSelectedFile(file)
      setExistingFileUrl(null) // Clear existing file when new one is selected

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => setFilePreview(e.target.result)
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }, [])

  const removeFile = useCallback(() => {
    setSelectedFile(null)
    setFilePreview(null)
    setExistingFileUrl(null)
    setValue("file", null)
  }, [setValue])

  const handleAmountChange = useCallback(
    (e) => {
      let value = e.target.value

      // Allow only numbers and decimal point
      value = value.replace(/[^0-9.]/g, "")

      // Ensure only one decimal point
      const decimalCount = (value.match(/\./g) || []).length
      if (decimalCount > 1) {
        value = value.slice(0, -1)
      }

      // Limit to 2 decimal places
      if (value.includes(".")) {
        const parts = value.split(".")
        if (parts[1].length > 2) {
          value = parts[0] + "." + parts[1].slice(0, 2)
        }
      }

      setValue("total_amount", value)
    },
    [setValue],
  )

  // Safe Image component that handles errors
  const SafeImage = ({ src, alt, ...props }) => {
    const [imgSrc, setImgSrc] = useState(src)
    const [hasError, setHasError] = useState(false)

    return hasError ? (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
    ) : (
      <Image
        {...props}
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        onError={() => {
          setHasError(true)
          setImgSrc("/placeholder-image.jpg") // Fallback image
        }}
      />
    )
  }

  const onSubmit = useCallback(
    async (values) => {
      try {
        if (editingInvoice) {
          // For update, pass both the data and the file separately along with previous file ID
          await updateInvoice.mutateAsync({
            id: editingInvoice.$id,
            data: {
              invoice_number: values.invoice_number,
              invoice_date: values.invoice_date,
              supplier_name: values.supplier_name,
              total_amount: values.total_amount,
            },
            file: values.file, // Pass the new file
            previousFileId: editingInvoice.fileId, // Pass the previous file ID for deletion
          })

          toast.success("ইনভয়েস সফলভাবে আপডেট করা হয়েছে! ✅", {
            description: `${values.invoice_number} - ${values.supplier_name}`,
          })
          setEditingInvoice(null)
        } else {
          // For create, include the file
          await createInvoice.mutateAsync(values)

          toast.success("নতুন ইনভয়েস সফলভাবে যোগ করা হয়েছে! 🎉", {
            description: `${values.invoice_number} - ${values.supplier_name}`,
          })
        }
        resetForm()
        setIsFormOpen(false)
      } catch (err) {
        console.error(err)
        toast.error("একটি ত্রুটি ঘটেছে! ❌", {
          description: err.message || "অনুগ্রহ করে আবার চেষ্টা করুন",
        })
      }
    },
    [editingInvoice, updateInvoice, createInvoice, resetForm],
  )

  const InvoiceStats = ({ filteredInvoices, uniqueSuppliers }) => {
    const totalAmount = filteredInvoices?.reduce((sum, inv) => sum + Number.parseFloat(inv?.total_amount || 0), 0) || 0

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">{filteredInvoices.length}</div>
              <div className="text-sm font-medium text-muted-foreground">মোট ইনভয়েস</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                OMR {totalAmount.toFixed(2)}
              </div>
              <div className="text-sm font-medium text-muted-foreground">মোট মূল্য</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">{uniqueSuppliers.length}</div>
              <div className="text-sm font-medium text-muted-foreground">সরবরাহকারী</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const InvoiceFilters = ({
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    supplierFilter,
    setSupplierFilter,
    uniqueSuppliers,
    hasActiveFilters,
    clearFilters,
  }) => {
    return (
      <div className="bg-muted/50 rounded-lg border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ইনভয়েস নাম্বার বা সরবরাহকারী দিয়ে খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 lg:w-auto">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="তারিখ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব তারিখ</SelectItem>
                <SelectItem value="today">আজকের</SelectItem>
                <SelectItem value="week">এই সপ্তাহ</SelectItem>
                <SelectItem value="month">এই মাস</SelectItem>
              </SelectContent>
            </Select>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="সরবরাহকারী" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব সরবরাহকারী</SelectItem>
                {uniqueSuppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                size="sm"
                className="flex items-center gap-2 bg-transparent"
              >
                <X className="h-4 w-4" />
                সাফ করুন
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageContainer>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary shadow-md">
              <Receipt className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ক্রয় ইনভয়েস</h1>
              <p className="text-sm text-muted-foreground">আপনার ইনভয়েস পরিচালনা করুন</p>
            </div>
          </div>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white"
                onClick={openForm}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">নতুন ইনভয়েস যোগ করুন</span>
                <span className="sm:hidden">নতুন</span>
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        <InvoiceStats filteredInvoices={filteredInvoices} uniqueSuppliers={uniqueSuppliers} />

        <Separator className="my-6" />

        <InvoiceFilters
          search={search}
          setSearch={setSearch}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          supplierFilter={supplierFilter}
          setSupplierFilter={setSupplierFilter}
          uniqueSuppliers={uniqueSuppliers}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />

        {/* Invoice List Section */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-4 px-4 sm:px-0">
            <h2 className="text-xl font-semibold">ইনভয়েস তালিকা</h2>
            <div className="text-sm text-muted-foreground">মোট: {filteredInvoices.length} টি ইনভয়েস</div>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-4 border border-blue-200/50 dark:border-blue-800/30 rounded-lg">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredInvoices && filteredInvoices.length > 0 ? (
            <div className="w-full space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block border border-blue-200/50 dark:border-blue-800/30 rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
                    <TableRow>
                      <TableHead className="font-semibold">ইনভয়েস নম্বর</TableHead>
                      <TableHead className="font-semibold">তারিখ</TableHead>
                      <TableHead className="font-semibold">সরবরাহকারী</TableHead>
                      <TableHead className="text-right font-semibold">পরিমাণ</TableHead>
                      <TableHead className="font-semibold">সংযুক্তি</TableHead>
                      <TableHead className="text-right font-semibold">ক্রিয়াসমূহ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => {
                      const fileUrl = invoice.fileId ? purchaseInvoiceService.getFileUrl(invoice.fileId) : null
                      const isImage = fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl)

                      return (
                        <TableRow key={invoice.$id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-primary">{invoice.invoice_number}</div>
                              <div className="text-xs text-muted-foreground">ID: {invoice.$id.slice(-8)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {format(new Date(invoice.invoice_date), "MMM dd, yyyy")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(invoice.invoice_date), "EEEE")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="font-normal bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                            >
                              {invoice.supplier_name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-bold text-lg text-green-600 dark:text-green-400">
                              {Number.parseFloat(invoice.total_amount).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">OMR</div>
                          </TableCell>
                          <TableCell>
                            {fileUrl ? (
                              <div className="flex items-center gap-2">
                                {isImage ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setImagePreview(fileUrl)}
                                    className="h-9 px-3 gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                  >
                                    <ImageIcon className="h-4 w-4" />
                                    ছবি
                                  </Button>
                                ) : (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    লিঙ্ক
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm italic">কোনো ফাইল নেই</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEdit(invoice)}
                                      className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>ইনভয়েস সম্পাদনা করুন</p>
                                  </TooltipContent>
                                </Tooltip>

                                <AlertDialog>
                                  <Tooltip>
                                    <AlertDialogTrigger asChild>
                                      <TooltipTrigger asChild>
                                        <Button size="sm" variant="destructive" className="h-9 w-9 p-0">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                    </AlertDialogTrigger>
                                    <TooltipContent>
                                      <p>ইনভয়েস মুছে ফেলুন</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <AlertDialogContent className="max-w-md">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center gap-2">
                                        <Trash2 className="h-5 w-5 text-destructive" />
                                        আপনি কি নিশ্চিত?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="space-y-2">
                                        <p>
                                          ইনভয়েস #{invoice.invoice_number} ({invoice.supplier_name}) মুছে ফেলা হবে।
                                        </p>
                                        <p className="text-sm text-muted-foreground">এই কর্মটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="flex justify-end gap-3 pt-4">
                                      <AlertDialogCancel className="min-w-[80px]">বাতিল</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteInvoice.mutate(invoice)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-[80px]"
                                      >
                                        মুছে ফেলুন
                                      </AlertDialogAction>
                                    </div>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden space-y-3 px-4 sm:px-0">
                {filteredInvoices.map((invoice) => {
                  const fileUrl = invoice.fileId ? purchaseInvoiceService.getFileUrl(invoice.fileId) : null
                  const isImage = fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl)

                  return (
                    <Card
                      key={invoice.$id}
                      className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/10"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                              {invoice.invoice_number}
                            </CardTitle>
                            <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-2">
                              সরবরাহকারী: {invoice.supplier_name}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-950/50">
                                <Receipt className="h-3 w-3 mr-1" />
                                {format(new Date(invoice.invoice_date), "MMM dd, yyyy")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium">পরিমাণ:</span>
                            </div>
                            <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                              OMR {Number.parseFloat(invoice.total_amount).toFixed(2)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium">তারিখ:</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                            </p>
                          </div>
                        </div>

                        {fileUrl && (
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <ImageLucide className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium">সংযুক্তি:</span>
                            </div>
                            <div className="flex gap-2">
                              {isImage ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setImagePreview(fileUrl)}
                                  className="h-8 px-3 text-xs"
                                >
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  ছবি দেখুন
                                </Button>
                              ) : (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-secondary hover:bg-secondary/80 transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  ফাইল দেখুন
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 justify-end pt-3 border-t">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(invoice)}
                                  className="h-8 px-3 text-xs"
                                >
                                  <Edit2 className="h-3 w-3 mr-1" />
                                  এডিট
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>ইনভয়েস এডিট করুন</p>
                              </TooltipContent>
                            </Tooltip>
                            <AlertDialog>
                              <Tooltip>
                                <AlertDialogTrigger asChild>
                                  <TooltipTrigger asChild>
                                    <Button variant="destructive" size="sm" className="h-8 px-3 text-xs">
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      ডিলিট
                                    </Button>
                                  </TooltipTrigger>
                                </AlertDialogTrigger>
                                <TooltipContent>
                                  <p>ইনভয়েস ডিলিট করুন</p>
                                </TooltipContent>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    "{invoice.invoice_number}" ইনভয়েসটি মুছে ফেলতে চলেছেন।
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteInvoice.mutate(invoice)}>
                                    ডিলিট করুন
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TooltipProvider>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-gradient-to-br from-blue-50/50 to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/10 w-full">
              <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {hasActiveFilters ? "কোন ইনভয়েস পাওয়া যায়নি" : "কোন ইনভয়েস যোগ করা হয়নি"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters ? "আপনার ফিল্টার অনুযায়ী কোন ইনভয়েস খুঁজে পাওয়া যায়নি" : "নতুন ইনভয়েস যোগ করে আপনার তালিকা শুরু করুন"}
              </p>

              {hasActiveFilters ? (
                <Button onClick={clearFilters} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <X className="h-4 w-4" />
                  ফিল্টার সাফ করুন
                </Button>
              ) : (
                <Button
                  onClick={openForm}
                  className="flex items-center gap-2 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  প্রথম ইনভয়েস যোগ করুন
                </Button>
              )}
            </div>
          )}
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
            <DialogHeader className="space-y-2 pb-4">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                  <Receipt className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-xl font-bold">{editingInvoice ? "ইনভয়েস সম্পাদনা করুন" : "নতুন ইনভয়েস যোগ করুন"}</div>
                  <div className="text-sm font-normal text-muted-foreground">
                    {editingInvoice ? "নিচে আপনার ইনভয়েস তথ্য আপডেট করুন" : "আপনার নতুন ক্রয় ইনভয়েসের বিবরণ পূরণ করুন"}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto px-1">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice_number" className="flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        ইনভয়েস নম্বর *
                      </Label>
                      <div className="relative">
                        <Input
                          id="invoice_number"
                          placeholder="যেমন: INV-2024-001"
                          className="pr-12"
                          {...register("invoice_number")}
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <VoiceTypingButton
                            fieldName="invoice_number"
                            setValue={setValue}
                            currentValue={watch("invoice_number")}
                            placeholder="ইনভয়েস নম্বর"
                          />
                        </div>
                      </div>
                      {errors.invoice_number && (
                        <p className="text-xs text-destructive">{errors.invoice_number.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invoice_date" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        ইনভয়েস তারিখ *
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-transparent"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {watch("invoice_date") ? (
                              format(new Date(watch("invoice_date")), "PPP")
                            ) : (
                              <span>তারিখ নির্বাচন করুন</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={watch("invoice_date") ? new Date(watch("invoice_date")) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                setValue("invoice_date", format(date, "yyyy-MM-dd"))
                              }
                            }}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.invoice_date && <p className="text-xs text-destructive">{errors.invoice_date.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier_name" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      সরবরাহকারীর নাম *
                    </Label>
                    <div className="relative">
                      <Input
                        id="supplier_name"
                        placeholder="সরবরাহকারীর পুরো নাম লিখুন"
                        className="pr-12"
                        {...register("supplier_name")}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <VoiceTypingButton
                          fieldName="supplier_name"
                          setValue={setValue}
                          currentValue={watch("supplier_name")}
                          placeholder="সরবরাহকারীর নাম"
                        />
                      </div>
                    </div>
                    {errors.supplier_name && <p className="text-xs text-destructive">{errors.supplier_name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_amount" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      মোট পরিমাণ (OMR) *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground font-semibold">
                        OMR
                      </span>
                      <Input
                        id="total_amount"
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        className="pl-14 text-lg font-semibold"
                        value={totalAmountValue || ""}
                        onChange={handleAmountChange}
                      />
                    </div>
                    {errors.total_amount && <p className="text-xs text-destructive">{errors.total_amount.message}</p>}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    ইনভয়েস সংযুক্তি (ঐচ্ছিক)
                  </Label>
                  <div className="relative">
                    <Label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-all duration-200 group"
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {selectedFile ? selectedFile.name : existingFileUrl ? "ফাইল পরিবর্তন করুন" : "ফাইল আপলোড করুন"}
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, PDF (সর্বোচ্চ ১০MB)</p>
                          <p className="text-xs text-muted-foreground">ক্লিক করুন বা ড্র্যাগ করুন</p>
                        </div>
                      </div>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.pdf"
                      {...register("file")}
                      onChange={(e) => {
                        register("file").onChange(e)
                        handleFileChange(e)
                      }}
                    />
                  </div>

                  {(selectedFile || existingFileUrl) && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{selectedFile ? selectedFile.name : "বর্তমান ফাইল"}</span>
                          {selectedFile && (
                            <p className="text-xs text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {(filePreview || existingFileUrl) && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <ImageLucide className="h-4 w-4" />
                        ফাইল প্রিভিউ
                      </span>
                      <div className="relative h-40 w-full border rounded-lg overflow-hidden bg-muted">
                        <SafeImage
                          src={filePreview || existingFileUrl}
                          alt="File preview"
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <DialogFooter className="pt-4 border-t">
              <div className="flex justify-between w-full gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false)
                    resetForm()
                  }}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={createInvoice.isPending || updateInvoice.isPending}
                  className="min-w-[120px] bg-green-600 hover:bg-green-700 text-white"
                >
                  {(createInvoice.isPending || updateInvoice.isPending) && (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  )}
                  {editingInvoice ? "আপডেট করুন" : "ইনভয়েস যোগ করুন"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Simple Image Preview Dialog */}
        <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
          <DialogContent className="sm:max-w-[90vw] max-h-[95vh] p-0">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                ইনভয়েস ইমেজ প্রিভিউ
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-6 pt-0 min-h-[400px]">
              {imagePreview && (
                <SafeImage
                  src={imagePreview}
                  alt="Invoice preview"
                  width={800}
                  height={600}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  )
}
