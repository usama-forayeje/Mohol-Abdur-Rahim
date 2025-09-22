"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useInvoices,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  purchaseInvoiceService,
} from "@/services/purchaseInvoice-service";
import { useInvoiceStore } from "@/store/purchesInvoice-store";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Trash2,
  Edit2,
  Eye,
  FileText,
  Search,
  Loader2,
  Plus,
  Upload,
  X,
  FileUp,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import PageContainer from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  invoice_date: z.string().min(1, "Date is required"),
  supplier_name: z.string().min(1, "Supplier name is required"),
  total_amount: z.string().min(1, "Amount is required"),
  file: z.any().optional(),
});

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
};

export default function PurchaseInvoicePage() {
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [search, setSearch] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
  });

  // Watch the total_amount field to handle input changes
  const totalAmountValue = watch("total_amount");

  const { isLoading } = useInvoices();
  const invoices = useInvoiceStore((state) => state.invoices);
  const getFilteredInvoices = useInvoiceStore(
    (state) => state.getFilteredInvoices
  );
  const totalAmount = useInvoiceStore((state) => state.getTotalAmount)();

  const filteredInvoices = getFilteredInvoices(search);

  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const onSubmit = async (values) => {
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
          previousFileId: editingInvoice.fileId // Pass the previous file ID for deletion
        });
        setEditingInvoice(null);
      } else {
        // For create, include the file
        await createInvoice.mutateAsync(values);
      }
      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    reset();
    setSelectedFile(null);
    setFilePreview(null);
    setExistingFileUrl(null);
    setEditingInvoice(null);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setValue("invoice_number", invoice.invoice_number);
    setValue("invoice_date", invoice.invoice_date);
    setValue("supplier_name", invoice.supplier_name);
    setValue("total_amount", invoice.total_amount.toString());

    // Set existing file preview if available
    if (invoice.fileId) {
      const fileUrl = purchaseInvoiceService.getFileUrl(invoice.fileId);
      setExistingFileUrl(fileUrl);

      // Check if it's an image for preview
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl)) {
        setFilePreview(fileUrl);
      }
    }

    setIsFormOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setExistingFileUrl(null); // Clear existing file when new one is selected

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setExistingFileUrl(null);
    setValue("file", null);
  };

  const openForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  // Handle amount input to ensure proper formatting
  const handleAmountChange = (e) => {
    let value = e.target.value;

    // Allow only numbers and decimal point
    value = value.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      value = value.slice(0, -1);
    }

    // Limit to 2 decimal places
    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].slice(0, 2);
      }
    }

    setValue("total_amount", value);
  };

  // Safe Image component that handles errors
  const SafeImage = ({ src, alt, ...props }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    return hasError ? (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
    ) : (
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        onError={() => {
          setHasError(true);
          setImgSrc('/placeholder-image.jpg'); // Fallback image
        }}
      />
    );
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{translations.title}</h1>
            <p className="text-muted-foreground mt-1">
              {translations.description}
            </p>
          </div>
          <Button onClick={openForm} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {translations.addInvoice}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{translations.totalInvoices}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{translations.totalAmount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">OMR {totalAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{translations.thisMonth}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                OMR {invoices
                  .filter(inv => new Date(inv.invoice_date).getMonth() === new Date().getMonth())
                  .reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0)
                  .toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>{translations.invoiceRecords}</CardTitle>
                <CardDescription>
                  {translations.allInvoices}
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={translations.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-[300px]"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-10">
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">{translations.noInvoices}</h3>
                <p className="text-muted-foreground mt-2">
                  {search ? "Try adjusting your search query" : translations.noInvoicesDesc}
                </p>
                {!search && (
                  <Button onClick={openForm} className="mt-4">
                    {translations.addInvoice}
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{translations.invoiceNumber.split(' *')[0]}</TableHead>
                      <TableHead>{translations.date}</TableHead>
                      <TableHead>{translations.supplier}</TableHead>
                      <TableHead className="text-right">{translations.amount}</TableHead>
                      <TableHead>{translations.attachment}</TableHead>
                      <TableHead className="text-right">{translations.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => {
                      const fileUrl = invoice.fileId
                        ? purchaseInvoiceService.getFileUrl(invoice.fileId)
                        : null;
                      const isImage =
                        fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);

                      return (
                        <TableRow key={invoice.$id}>
                          <TableCell className="font-medium">
                            {invoice.invoice_number}
                          </TableCell>
                          <TableCell>
                            {format(new Date(invoice.invoice_date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {invoice.supplier_name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {parseFloat(invoice.total_amount).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {fileUrl ? (
                              isImage ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setImagePreview(fileUrl)}
                                  className="h-8 w-8"
                                >
                                  <ImageIcon className="h-4 w-4" />
                                </Button>
                              ) : (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                >
                                  <FileText className="h-4 w-4" />
                                </a>
                              )
                            ) : (
                              <span className="text-muted-foreground text-xs">No file</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(invoice)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{translations.areYouSure}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {translations.deleteConfirm
                                        .replace("{{number}}", invoice.invoice_number)
                                        .replace("{{supplier}}", invoice.supplier_name)}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="flex justify-end gap-2 mt-4">
                                    <AlertDialogCancel>{translations.cancel}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteInvoice.mutate(invoice)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {translations.delete}
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? translations.editInvoice : translations.newInvoice}
            </DialogTitle>
            <DialogDescription>
              {editingInvoice
                ? translations.editInvoiceDesc
                : translations.newInvoiceDesc}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_number">{translations.invoiceNumber}</Label>
                <Input
                  id="invoice_number"
                  placeholder="e.g., INV-001"
                  {...register("invoice_number")}
                />
                {errors.invoice_number && (
                  <p className="text-sm text-destructive">{errors.invoice_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice_date">{translations.invoiceDate}</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  {...register("invoice_date")}
                />
                {errors.invoice_date && (
                  <p className="text-sm text-destructive">{errors.invoice_date.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier_name">{translations.supplierName}</Label>
              <Input
                id="supplier_name"
                placeholder="e.g., Oman Suppliers LLC"
                {...register("supplier_name")}
              />
              {errors.supplier_name && (
                <p className="text-sm text-destructive">{errors.supplier_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">{translations.totalAmountLabel}</Label>
              <Input
                id="total_amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={totalAmountValue || ''}
                onChange={handleAmountChange}
                onBlur={(e) => {
                  // Format the value to 2 decimal places on blur
                  if (e.target.value && !isNaN(e.target.value)) {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      setValue("total_amount", value.toFixed(2));
                    }
                  }
                }}
              />
              {errors.total_amount && (
                <p className="text-sm text-destructive">{errors.total_amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">{translations.invoiceAttachment}</Label>
              <div className="flex items-center gap-4">
                <Label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 cursor-pointer hover:bg-accent/20 w-full"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-center">
                    {selectedFile ? selectedFile.name : (existingFileUrl ? "Current file attached" : translations.clickToUpload)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {translations.fileTypes}
                  </span>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  {...register("file")}
                  onChange={(e) => {
                    register("file").onChange(e);
                    handleFileChange(e);
                  }}
                />

                {(selectedFile || existingFileUrl) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    className="h-10 w-10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {(filePreview || existingFileUrl) && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">{translations.preview}:</p>
                  <div className="relative h-40 w-40 border rounded-md overflow-hidden">
                    <SafeImage
                      src={filePreview || existingFileUrl}
                      alt="File preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
              >
                {translations.cancel}
              </Button>
              <Button
                type="submit"
                disabled={createInvoice.isPending || updateInvoice.isPending}
              >
                {(createInvoice.isPending || updateInvoice.isPending) && (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                )}
                {editingInvoice ? translations.updateInvoice : translations.addInvoiceButton}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="sm:max-w-[80vw] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{translations.invoicePreview}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <SafeImage
              src={imagePreview}
              alt="Invoice preview"
              width={800}
              height={600}
              className="max-w-full max-h-[60vh] object-contain rounded"
            />
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}