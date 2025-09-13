"use client";

import PageContainer from "@/components/layout/page-container";
import {
  useCreateShop,
  useDeleteShop,
  useShops,
  useUpdateShop,
} from "@/services/shop-service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, MapPin, Phone, Store } from "lucide-react";

const shopSchema = z.object({
  name: z.string().min(2, "দোকানের নাম কমপক্ষে ২ অক্ষর হতে হবে"),
  address: z.string().min(5, "ঠিকানা কমপক্ষে ৫ অক্ষর হতে হবে"),
  contact: z.string().optional(),
});

function ShopPage() {
  const { data: shops, isLoading, refetch } = useShops();
  const createShop = useCreateShop();
  const updateShop = useUpdateShop();
  const deleteShop = useDeleteShop();
  const [editShop, setEditShop] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      name: "",
      address: "",
      contact: "",
    },
  });

  useEffect(() => {
    if (editShop) {
      form.reset({
        name: editShop.name,
        address: editShop.address,
        contact: editShop.contact || "",
      });
    } else {
      form.reset({
        name: "",
        address: "",
        contact: "",
      });
    }
  }, [editShop, form]);

  const onSubmit = (values) => {
    if (editShop) {
      updateShop.mutate(
        { id: editShop.$id, ...values },
        {
          onSuccess: () => {
            toast.success("দোকান সফলভাবে আপডেট হয়েছে");
            setEditShop(null);
            setIsDialogOpen(false);
            refetch();
          },
          onError: () => toast.error("দোকান আপডেট করতে সমস্যা হয়েছে"),
        }
      );
    } else {
      createShop.mutate(values, {
        onSuccess: () => {
          toast.success("নতুন দোকান সফলভাবে তৈরি হয়েছে");
          setIsDialogOpen(false);
          form.reset();
          refetch();
        },
        onError: () => toast.error("দোকান তৈরি করতে সমস্যা হয়েছে"),
      });
    }
  };

  const handleDelete = (id) => {
    deleteShop.mutate(id, {
      onSuccess: () => {
        toast.success("দোকান সফলভাবে ডিলিট হয়েছে");
        refetch();
      },
      onError: () => toast.error("দোকান ডিলিট করতে সমস্যা হয়েছে"),
    });
  };

  return (
    <PageContainer>
      <div>
        {/* Header Section with Title and Create Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">দোকান ব্যবস্থাপনা</h1>
          </div>

          {/* Create / Update Modal */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setEditShop(null)}
              >
                <Plus className="h-4 w-4" />
                নতুন দোকান যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editShop ? "দোকান সম্পাদনা করুন" : "নতুন দোকান তৈরি করুন"}
                </DialogTitle>
                <DialogDescription>
                  {editShop
                    ? "নিচের ফর্মে প্রয়োজনীয় তথ্য পরিবর্তন করুন"
                    : "নিচের ফর্ম পূরণ করে নতুন দোকান যোগ করুন"}
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
                        <FormLabel>দোকানের নাম *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="দোকানের নাম লিখুন"
                            {...field}
                            disabled={
                              createShop.isPending || updateShop.isPending
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ঠিকানা *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="দোকানের সম্পূর্ণ ঠিকানা লিখুন"
                            {...field}
                            disabled={
                              createShop.isPending || updateShop.isPending
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>যোগাযোগ নম্বর</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="যোগাযোগের নম্বর লিখুন"
                            {...field}
                            disabled={
                              createShop.isPending || updateShop.isPending
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-2">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={createShop.isPending || updateShop.isPending}
                      >
                        বাতিল
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      className="cursor-pointer"
                      disabled={createShop.isPending || updateShop.isPending}
                    >
                      {createShop.isPending || updateShop.isPending
                        ? "প্রসেস হচ্ছে..."
                        : editShop
                        ? "আপডেট করুন"
                        : "তৈরি করুন"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        {/* Divider Line */}
        <hr className="my-6 border-t border-gray-200" />

        {/* Shops List - Cards at the bottom */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">দোকানের তালিকা</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {shops && shops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shops.map((shop) => (
                    <Card
                      key={shop.$id}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex justify-between items-start">
                          <span className="truncate">{shop.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            {shop.address}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            {shop.contact || "যোগাযোগ নম্বর নেই"}
                          </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={() => {
                              setEditShop(shop);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            সম্পাদনা
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                ডিলিট
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  আপনি কি নিশ্চিত?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{shop.name}" দোকানটি মুছে ফেলতে চলেছেন। এই
                                  কাজটি撤销 করা সম্ভব হবে না।
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(shop.$id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  ডিলিট করুন
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20">
                  <Store className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    কোন দোকান যোগ করা হয়নি
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    নতুন দোকান যোগ করে আপনার তালিকা শুরু করুন
                  </p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    প্রথম দোকান যোগ করুন
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

export default ShopPage;
