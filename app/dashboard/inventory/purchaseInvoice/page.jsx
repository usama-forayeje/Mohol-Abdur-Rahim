"use client";

import React, { useState } from "react";
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

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

import { Trash2, Edit2, Eye, FileText, Search, Loader2 } from "lucide-react";
import Image from "next/image";
import PageContainer from "@/components/layout/page-container";

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number required"),
  invoice_date: z.string().min(1, "Date required"),
  supplier_name: z.string().min(1, "Supplier required"),
  total_amount: z.string().min(1, "Amount required"),
  file: z.any().optional(),
});

export default function PurchaseInvoicePage() {
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [search, setSearch] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
  });

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
        await updateInvoice.mutateAsync({ id: editingInvoice.$id, ...values });
        setEditingInvoice(null);
      } else {
        await createInvoice.mutateAsync(values);
      }
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setValue("invoice_number", invoice.invoice_number);
    setValue("invoice_date", invoice.invoice_date);
    setValue("supplier_name", invoice.supplier_name);
    setValue("total_amount", invoice.total_amount.toString());
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Purchase Invoices</h1>
        <p>Total: OMR {totalAmount.toFixed(2)}</p>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editingInvoice ? "Update Invoice" : "Add Invoice"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input placeholder="Invoice #" {...register("invoice_number")} />
              {errors.invoice_number && (
                <p className="text-red-500">{errors.invoice_number.message}</p>
              )}

              <Input type="date" {...register("invoice_date")} />
              {errors.invoice_date && (
                <p className="text-red-500">{errors.invoice_date.message}</p>
              )}

              <Input placeholder="Supplier" {...register("supplier_name")} />
              {errors.supplier_name && (
                <p className="text-red-500">{errors.supplier_name.message}</p>
              )}

              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                {...register("total_amount")}
              />
              {errors.total_amount && (
                <p className="text-red-500">{errors.total_amount.message}</p>
              )}

              <Input type="file" {...register("file")} />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createInvoice.isPending || updateInvoice.isPending}
                >
                  {(createInvoice.isPending || updateInvoice.isPending) && (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  )}
                  {editingInvoice ? "Update" : "Save"}
                </Button>
                {editingInvoice && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingInvoice(null);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Invoice Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : filteredInvoices.length === 0 ? (
              <p>No invoices found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const fileUrl = invoice.fileId
                      ? purchaseInvoiceService.getFileUrl(invoice.fileId)
                      : null;
                    const isImage =
                      fileUrl && /\.(jpg|jpeg|png|gif)$/i.test(fileUrl);

                    return (
                      <TableRow key={invoice.$id}>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>
                          {new Date(invoice.invoice_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{invoice.supplier_name}</TableCell>
                        <TableCell>{invoice.total_amount}</TableCell>
                        <TableCell>
                          {fileUrl ? (
                            isImage ? (
                              <Button
                                variant="ghost"
                                onClick={() => setImagePreview(fileUrl)}
                              >
                                <Eye />
                              </Button>
                            ) : (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <FileText />
                              </a>
                            )
                          ) : (
                            "No file"
                          )}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(invoice)}
                          >
                            <Edit2 />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="flex justify-end gap-2 mt-4">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteInvoice.mutate(invoice)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setImagePreview(null)}
        >
          <div className="max-w-4xl max-h-[90vh] p-4 relative">
            <Image
              src={imagePreview}
              alt="preview"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded"
            />
            <Button
              className="absolute top-2 right-2"
              onClick={() => setImagePreview(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
