"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useShopStore } from "@/store/shop-store"
import { useTailoringItems, useDeleteTailoringItem } from "@/services/tailoring-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import PageContainer from "@/components/layout/page-container"
import {
    Plus,
    Edit,
    Trash2,
    DollarSign,
    Users,
    Package,
    TrendingUp,
    AlertCircle,
    MoreVertical,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { motion, AnimatePresence } from "framer-motion"

export default function TailoringPage() {
    const router = useRouter()
    const { selectedShopId, userProfile } = useAuthStore()
    const { shops } = useShopStore()

    const { data: tailoringItems, isLoading, error } = useTailoringItems(selectedShopId)
    const deleteTailoringItem = useDeleteTailoringItem()

    const selectedShop = shops?.find((s) => s.$id === selectedShopId)

    // Delete dialog state
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        item: null,
    })

    const handleCreateNew = () => {
        router.push("/dashboard/settings/tailoring-items/new")
    }

    const handleEdit = (itemId) => {
        router.push(`/dashboard/settings/tailoring-items/${itemId}/edit`)
    }

    const handleDelete = (item) => {
        setDeleteDialog({ open: true, item })
    }

    const confirmDelete = async () => {
        if (deleteDialog.item) {
            try {
                await deleteTailoringItem.mutateAsync(deleteDialog.item.$id)
                setDeleteDialog({ open: false, item: null })
            } catch (error) {
                console.error("Delete failed:", error)
            }
        }
    }

    const closeDeleteDialog = () => {
        setDeleteDialog({ open: false, item: null })
    }

    if (isLoading) {
        return (
            <PageContainer>
                <div className="space-y-6 w-full">
                    {/* Header Skeleton */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>

                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-lg" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-6 w-16" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Items Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-6 w-32" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                        </div>
                                        <Skeleton className="h-16 w-full" />
                                        <div className="flex justify-between items-center">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-6 w-16" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </PageContainer>
        )
    }

    if (error && !error.message?.includes("CORS") && !error.message?.includes("Failed to fetch")) {
        return (
            <PageContainer>
                <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 w-full">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                            কানেকশন সমস্যা
                        </h3>
                        <p className="text-red-600 dark:text-red-400 mb-4">
                            টেইলারিং আইটেমসমূহ লোড করতে সমস্যা হয়েছে
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                            আবার চেষ্টা করুন
                        </Button>
                    </CardContent>
                </Card>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <div className="space-y-4 w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
                            টেইলারিং আইটেমসমূহ
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            আপনার দোকানের সকল টেইলারিং আইটেম পরিচালনা করুন
                        </p>
                    </div>
                    <Button
                        onClick={handleCreateNew}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        নতুন আইটেম যোগ করুন
                    </Button>
                </motion.div>


                {/* Items Display */}
                {tailoringItems?.length > 0 ? (
                    <>
                        {/* Desktop Table View */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="hidden lg:block"
                        >
                            <Card>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="min-w-[200px]">আইটেমের নাম</TableHead>
                                                    <TableHead className="min-w-[300px]">বিবরণ</TableHead>
                                                    <TableHead className="min-w-[150px]">দোকান</TableHead>
                                                    <TableHead className="min-w-[150px]">তৈরি করেছেন</TableHead>
                                                    <TableHead className="min-w-[120px]">বিক্রয় মূল্য</TableHead>
                                                    <TableHead className="min-w-[120px]">কর্মী মূল্য</TableHead>
                                                    <TableHead className="min-w-[120px] text-right">ক্রিয়া</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {tailoringItems.map((item) => (
                                                    <TableRow key={item.$id}>
                                                        <TableCell className="font-medium">
                                                            {item.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="max-w-[300px]">
                                                                {item.description ? (
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                                                        {item.description}
                                                                    </p>
                                                                ) : (
                                                                    <span className="text-sm text-slate-400">কোনো বিবরণ নেই</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-sm">
                                                                {item.shopName || 'Unknown Shop'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-sm">
                                                                {item.createdByName || 'Unknown User'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                                ৳{item.price || 0}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                                ৳{item.worker_price || item.workerPrice || 0}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleEdit(item.$id)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(item)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                            <CardContent className="p-8 text-center">
                                <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                    {error?.message?.includes("CORS") || error?.message?.includes("Failed to fetch")
                                        ? "কানেকশন সমস্যা"
                                        : "কোনো টেইলারিং আইটেম নেই"
                                    }
                                </h3>
                                <p className="text-slate-500 dark:text-slate-500 mb-6">
                                    {error?.message?.includes("CORS") || error?.message?.includes("Failed to fetch")
                                        ? "Appwrite এ CORS কনফিগারেশন করুন অথবা নতুন আইটেম তৈরি করে শুরু করুন"
                                        : "আপনার প্রথম টেইলারিং আইটেম তৈরি করে শুরু করুন"
                                    }
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button onClick={handleCreateNew}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        নতুন আইটেম তৈরি করুন
                                    </Button>
                                    {error?.message?.includes("CORS") && (
                                        <Button
                                            variant="outline"
                                            onClick={() => window.open("https://cloud.appwrite.io/console/project/68ab185200289d955b79/settings/domains", "_blank")}
                                        >
                                            CORS কনফিগার করুন
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>আইটেম ডিলিট করুন</AlertDialogTitle>
                            <AlertDialogDescription>
                                আপনি কি নিশ্চিত যে আপনি "{deleteDialog.item?.name}" আইটেমটি ডিলিট করতে চান?
                                এই ক্রিয়াটি পূর্বাবস্থায় ফেরানো যাবে না।
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>বাতিল করুন</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleteTailoringItem.isPending}
                            >
                                {deleteTailoringItem.isPending ? "ডিলিট হচ্ছে..." : "ডিলিট করুন"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </PageContainer>
    )
}

