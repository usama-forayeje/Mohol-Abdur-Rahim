"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuthStore } from "@/store/auth-store"
import { useShopStore } from "@/store/shop-store"
import { useFabrics } from "@/services/fabric-service"
import { useCreateFabricSale, useUpdateFabricSale } from "@/services/fabric-sales-service"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Package,
    Loader2,
    Plus,
    Trash2,
    ArrowLeft,
    ShoppingBag,
    CreditCard,
    Wallet,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Sparkles,
    DollarSign,
    Smartphone,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const fabricSaleSchema = z.object({
    saleItems: z
        .array(
            z.object({
                fabricId: z.string().min(1, "ফ্যাব্রিক নির্বাচন করুন"),
                quantity: z.number().min(0.1, "পরিমাণ ০.১ এর কম হতে পারে না"),
                unitPrice: z
                    .union([z.string(), z.number()])
                    .transform((val) => {
                        if (val === "" || val === null || val === undefined) return 0
                        return Number.parseFloat(val) || 0
                    })
                    .refine((val) => val >= 0, "দর ০ এর কম হতে পারে না"),
            }),
        )
        .min(1, "কমপক্ষে একটি ফ্যাব্রিক যোগ করুন"),
    paymentMethod: z.enum(["cash", "card", "online"]),
    paymentAmount: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (val === "" || val === null || val === undefined) return 0
            return Number.parseFloat(val) || 0
        })
        .refine((val) => val >= 0, "পরিশোধিত Amount ০ এর কম হতে পারে না"),
    discountAmount: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (val === "" || val === null || val === undefined) return 0
            return Number.parseFloat(val) || 0
        })
        .refine((val) => val >= 0, "ডিসকাউন্ট ০ এর কম হতে পারে না")
        .optional(),
    notes: z.string().optional(),
})

export function FabricSalesForm({ mode = "page", initialData, onSuccess, onCancel, saleId }) {
    const { userProfile, selectedShopId } = useAuthStore()
    const { shops } = useShopStore()
    const { data: fabrics, isLoading: fabricsLoading } = useFabrics()
    const createFabricSale = useCreateFabricSale()
    const updateFabricSale = useUpdateFabricSale()
    const router = useRouter()

    const [showSuccess, setShowSuccess] = useState(false)
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        resolver: zodResolver(fabricSaleSchema),
        defaultValues: {
            saleItems: [{ fabricId: "", quantity: 2.5, unitPrice: "" }],
            paymentMethod: "cash",
            paymentAmount: "",
            discountAmount: "",
        },
    })

    const {
        fields: saleItems,
        append,
        remove,
        replace,
    } = useFieldArray({
        control: form.control,
        name: "saleItems",
    })

    const watchedItems = form.watch("saleItems")
    const watchedPaymentAmount = form.watch("paymentAmount")
    const watchedDiscountAmount = form.watch("discountAmount")

    // Watch all form values for comprehensive updates
    const watchedValues = form.watch()

    // More responsive calculation - runs immediately on any change
    const calculateTotal = () => {
        const totalAmount = watchedItems.reduce((total, item) => {
            const quantity = Number.parseFloat(item.quantity) || 0
            const unitPrice = Number.parseFloat(item.unitPrice) || 0
            return total + (quantity * unitPrice)
        }, 0)

        const discountValue = Number.parseFloat(watchedDiscountAmount) || 0
        return Math.max(0, totalAmount - discountValue)
    }

    // Auto-calculate payment amount based on items and discount - runs immediately on any change
    useEffect(() => {
        const discountedTotal = calculateTotal()

        // Always keep payment amount in sync with calculated total
        if (watchedItems.length > 0 && watchedItems.some(item => item.fabricId && item.quantity > 0)) {
            const currentPaymentAmount = form.getValues("paymentAmount")
            if (currentPaymentAmount !== discountedTotal && discountedTotal > 0) {
                form.setValue("paymentAmount", discountedTotal)
            }
        }
    }, [watchedItems, watchedDiscountAmount, form, calculateTotal])

    // Debug logging for troubleshooting
    useEffect(() => {
        const totalAmount = watchedItems.reduce((total, item) => {
            const quantity = Number.parseFloat(item.quantity) || 0
            const unitPrice = Number.parseFloat(item.unitPrice) || 0
            return total + quantity * unitPrice
        }, 0)

        const discountValue = Number.parseFloat(watchedDiscountAmount) || 0
        const discountedTotal = Math.max(0, totalAmount - discountValue)

        console.log("=== AUTO CALCULATION DEBUG ===");
        console.log("Items:", watchedItems);
        console.log("Total Amount:", totalAmount);
        console.log("Discount:", discountValue);
        console.log("Final Amount:", discountedTotal);
        console.log("Payment Amount Field:", watchedPaymentAmount);
    }, [watchedItems, watchedDiscountAmount, watchedPaymentAmount])

    const selectedShop = shops?.find((s) => s.$id === selectedShopId)

    const discountValue = Number.parseFloat(watchedDiscountAmount) || 0
    const paymentValue = Number.parseFloat(watchedPaymentAmount) || 0
    const totalAmount = watchedItems.reduce((total, item) => {
        const quantity = Number.parseFloat(item.quantity) || 0
        const unitPrice = Number.parseFloat(item.unitPrice) || 0
        return total + quantity * unitPrice
    }, 0)
    const discountedTotal = totalAmount - discountValue
    const dueAmount = discountedTotal - paymentValue

    // Debug payment status calculation
    const isPaid = dueAmount <= 0
    console.log("=== PAYMENT STATUS DEBUG ===");
    console.log("Total Amount:", totalAmount);
    console.log("Discount:", discountValue);
    console.log("Payment:", paymentValue);
    console.log("Discounted Total:", discountedTotal);
    console.log("Due Amount:", dueAmount);
    console.log("Is Paid:", isPaid);

    useEffect(() => {
        // Only run once when we have initial data and haven't loaded it yet
        if (mode === "edit" && initialData && saleId && !isInitialDataLoaded) {
            console.log("=== POPULATING FORM WITH INITIAL DATA ===")
            console.log("Initial data:", initialData)

            // Parse items from database
            let parsedItems = []

            if (typeof initialData.items === "string") {
                try {
                    parsedItems = JSON.parse(initialData.items)
                } catch (e) {
                    console.error("Error parsing items string:", e)
                }
            } else if (Array.isArray(initialData.items)) {
                parsedItems = initialData.items
            }

            // Handle items that might be stringified within the array
            parsedItems = parsedItems
                .map((item) => {
                    if (typeof item === "string") {
                        try {
                            return JSON.parse(item)
                        } catch (e) {
                            console.error("Error parsing item:", e)
                            return null
                        }
                    }
                    return item
                })
                .filter(Boolean)

            console.log("Parsed items:", parsedItems)

            // Transform items to form structure
            const formItems = parsedItems.map((item) => ({
                fabricId: item?.fabricId || "",
                quantity: Number(item?.quantity) || 2.5,
                unitPrice: Number(item?.sale_price || item?.unitPrice) || 0,
            }))

            console.log("Form items:", formItems)

            // Prepare complete form data
            const formData = {
                saleItems: formItems.length > 0 ? formItems : [{ fabricId: "", quantity: 2.5, unitPrice: "" }],
                paymentMethod: initialData.payment_method || "cash",
                paymentAmount: Number(initialData.payment_amount || initialData.paid_amount || 0),
                discountAmount: Number(initialData.discount_amount) || 0,
            }

            console.log("Setting form data:", formData)

            // Replace the field array items
            replace(formData.saleItems)

            // Set other form values
            form.setValue("paymentMethod", formData.paymentMethod)
            form.setValue("paymentAmount", formData.paymentAmount)
            form.setValue("discountAmount", formData.discountAmount)

            // Mark as loaded to prevent re-running
            setIsInitialDataLoaded(true)

            console.log("Form populated successfully")
            console.log("Current form values:", form.getValues())
        }
    }, [mode, initialData, saleId, isInitialDataLoaded, replace]) // Removed 'form' from dependencies

    const handleFabricChange = (index, fabricId) => {
        const fabric = fabrics?.find((f) => f.$id === fabricId)
        if (fabric) {
            console.log(`Selected fabric: ${fabric.name}, Price: ${fabric.price_per_meter}`)
            form.setValue(`saleItems.${index}.unitPrice`, fabric.price_per_meter || "")
            form.setValue(`saleItems.${index}.fabricId`, fabricId)
        }
    }

    const handleAddItem = () => {
        append({ fabricId: "", quantity: 2.5, unitPrice: "" })
    }

    const handleRemoveItem = (index) => {
        if (saleItems.length > 1) {
            remove(index)
        }
    }

    const onSubmit = async (data) => {
        if (!selectedShopId) {
            toast.error("দোকান নির্বাচন করুন")
            return
        }

        if (!userProfile?.$id) {
            toast.error("লগইন করুন")
            return
        }

        // Validate stock
        for (const item of data.saleItems) {
            const fabric = fabrics?.find((f) => f.$id === item.fabricId)
            if (!fabric) {
                toast.error("একটি অবৈধ ফ্যাব্রিক নির্বাচন করা হয়েছে")
                return
            }
            const quantity = Number.parseFloat(item.quantity) || 0
            if (quantity > fabric.stock_quantity) {
                toast.error(`${fabric.name} এর স্টক সীমা অতিক্রম! মাত্র ${fabric.stock_quantity} গজ আছে`)
                return
            }
        }

        setIsSubmitting(true)

        try {
            if (mode === "edit" && saleId) {
                // Update existing sale
                const updateData = {
                    items: data.saleItems.map((item) => ({
                        fabricId: item.fabricId,
                        quantity: Number.parseFloat(item.quantity) || 0,
                        sale_price: Number.parseFloat(item.unitPrice) || 0,
                    })),
                    totalAmount: totalAmount,
                    discountAmount: Number.parseFloat(data.discountAmount) || 0,
                    paymentAmount: Number.parseFloat(data.paymentAmount) || 0,
                }

                await updateFabricSale.mutateAsync({
                    saleId: saleId,
                    data: updateData,
                })

                toast.success("বিক্রয় সফলভাবে আপডেট হয়েছে")

                if (onSuccess) {
                    onSuccess()
                } else {
                    router.push("/dashboard/fabrics/sales")
                }

                // Don't show success modal for edit mode
                return
            } else {
                // Create new sale
                const saleData = {
                    shopId: selectedShopId,
                    soldBy: userProfile.$id,
                    items: data.saleItems.map((item) => ({
                        fabricId: item.fabricId,
                        quantity: Number.parseFloat(item.quantity) || 0,
                        sale_price: Number.parseFloat(item.unitPrice) || 0,
                    })),
                    total_amount: totalAmount,
                    payment_amount: Number.parseFloat(data.paymentAmount) || 0,
                    payment_method: data.paymentMethod,
                    discount_amount: Number.parseFloat(data.discountAmount) || 0,
                }

                await createFabricSale.mutateAsync(saleData)

                setShowSuccess(true)

                setTimeout(() => {
                    setShowSuccess(false)

                    if (mode === "page") {
                        form.reset({
                            saleItems: [{ fabricId: "", quantity: 2.5, unitPrice: "" }],
                            paymentMethod: "cash",
                            paymentAmount: "",
                            discountAmount: "",
                        })
                        router.push("/dashboard/fabrics/sales")
                    } else if (onSuccess) {
                        onSuccess()
                    }
                }, 2000)
            }
        } catch (error) {
            console.error("Sale error:", error)
            toast.error(error.message || "বিক্রয় করতে সমস্যা হয়েছে")
        }
    }

    if (fabricsLoading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
                {/* Header Skeleton */}
                <div className="relative overflow-hidden border-b bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 dark:from-indigo-950 dark:via-blue-950 dark:to-indigo-900">
                    <div className="relative container mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 lg:py-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4">
                            {/* Left Section - Logo and Main Info */}
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                                {/* Hide icon on mobile, show on larger screens */}
                                <div className="hidden sm:block">
                                    <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-lg flex-shrink-0" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
                                    <Skeleton className="h-4 w-24 sm:h-5 sm:w-28 md:h-6 md:w-32 lg:h-8 lg:w-48 bg-white/20" />
                                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 sm:gap-3 md:gap-4">
                                        <Skeleton className="h-2 w-16 sm:h-3 sm:w-20 md:h-4 md:w-24 lg:w-32 bg-white/10" />
                                        <Skeleton className="h-3 w-14 sm:h-4 sm:w-16 md:h-5 md:w-20 lg:h-6 lg:w-28 bg-white/10" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Section - Amount and Controls */}
                            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 self-end sm:self-center">
                                <div className="text-right flex-shrink-0 space-y-0.5 sm:space-y-1">
                                    <Skeleton className="h-4 w-14 sm:h-5 sm:w-16 md:h-6 md:w-20 lg:h-8 lg:w-28 bg-white/20 ml-auto" />
                                    <Skeleton className="h-2 w-10 sm:h-3 sm:w-12 md:h-4 md:w-16 lg:w-20 bg-white/10 ml-auto" />
                                </div>
                                <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 rounded flex-shrink-0" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="container mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 lg:py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Form Section Skeleton */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl border-0 p-3 sm:p-4 md:p-6 animate-pulse">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 border-b rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {/* Hide icon on mobile for more space */}
                                        <div className="hidden sm:block">
                                            <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-lg flex-shrink-0" />
                                        </div>
                                        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                                            <Skeleton className="h-4 w-20 sm:h-5 sm:w-24 md:h-6 md:w-32" />
                                            <Skeleton className="h-2 w-28 sm:h-3 sm:w-32 md:h-4 md:w-48" />
                                        </div>
                                    </div>
                                </div>

                                {/* Fabric Items Skeleton */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-5 w-5" />
                                            <Skeleton className="h-6 w-24" />
                                        </div>
                                        <Skeleton className="h-9 w-32" />
                                    </div>

                                    {/* Item Skeletons */}
                                    {[1, 2].map((index) => (
                                        <div
                                            key={index}
                                            className="relative p-2 sm:p-3 md:p-4 lg:p-5 border-2 border-indigo-100 dark:border-indigo-900 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/30"
                                            style={{
                                                animationDelay: `${index * 0.1}s`
                                            }}
                                        >
                                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full"></div>

                                            {/* Desktop Layout */}
                                            <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4">
                                                <div className="col-span-4 space-y-2">
                                                    <Skeleton className="h-4 w-16" />
                                                    <Skeleton className="h-12 w-full" />
                                                </div>
                                                <div className="col-span-2 space-y-2">
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-12 w-full" />
                                                </div>
                                                <div className="col-span-2 space-y-2">
                                                    <Skeleton className="h-4 w-12" />
                                                    <Skeleton className="h-12 w-full" />
                                                </div>
                                                <div className="col-span-2 flex items-end">
                                                    <Skeleton className="h-12 w-full" />
                                                </div>
                                                <div className="col-span-2 flex items-end justify-end">
                                                    <Skeleton className="h-12 w-12 rounded-full" />
                                                </div>
                                            </div>

                                            {/* Mobile/Tablet Layout */}
                                            <div className="lg:hidden space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-4 w-16" />
                                                        <Skeleton className="h-10 md:h-12 w-full" />
                                                    </div>
                                                    <Skeleton className="h-10 w-10 md:h-12 md:w-12 ml-2 rounded-full" />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-20" />
                                                        <Skeleton className="h-10 md:h-12 w-full" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-12" />
                                                        <Skeleton className="h-10 md:h-12 w-full" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-16" />
                                                    <Skeleton className="h-10 md:h-12 w-full" />
                                                </div>
                                            </div>

                                            <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                                <div className="flex justify-between items-center">
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-6 w-16" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Customer & Payment Section Skeleton */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-4" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                        <Skeleton className="h-11 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-4" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                        <Skeleton className="h-11 w-full" />
                                    </div>
                                </div>

                                {/* Amount Fields Skeleton */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                </div>

                                {/* Notes Skeleton */}
                                <div className="space-y-2 mt-6">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-20 w-full" />
                                </div>

                                {/* Submit Button Skeleton */}
                                <div className="mt-6">
                                    <Skeleton className="h-16 w-full rounded-2xl" />
                                </div>
                            </div>
                        </div>

                        {/* Summary Section Skeleton */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 space-y-4">
                                <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl border-0 animate-pulse">
                                    <div className="border-b border-white/10 p-3 sm:p-4 md:p-6">
                                        <Skeleton className="h-4 w-16 sm:h-5 sm:w-20 md:h-6 md:w-24 bg-white/20" />
                                    </div>
                                    <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
                                        {/* Summary Items Skeleton */}
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center p-1.5 sm:p-2 md:p-3 bg-white/10 backdrop-blur-sm rounded-md sm:rounded-lg"
                                                    style={{
                                                        animationDelay: `${index * 0.15}s`
                                                    }}
                                                >
                                                    <div className="space-y-0.5 sm:space-y-1">
                                                        <Skeleton className="h-2.5 w-12 sm:h-3 sm:w-16 md:h-4 md:w-20 bg-white/20" />
                                                        <Skeleton className="h-2 w-8 sm:h-2.5 sm:w-12 md:h-3 md:w-16 bg-white/10" />
                                                    </div>
                                                    <Skeleton className="h-3 w-10 sm:h-4 sm:w-12 md:h-5 md:w-16 bg-white/20" />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="h-px bg-white/20"></div>

                                        <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                                            <div className="flex justify-between items-center p-1.5 sm:p-2 md:p-3 bg-white/5 rounded-md sm:rounded-lg">
                                                <Skeleton className="h-3 w-12 sm:h-4 sm:w-16 md:h-5 md:w-20 bg-white/20" />
                                                <Skeleton className="h-5 w-16 sm:h-6 sm:w-20 md:h-7 md:w-24 bg-white/20" />
                                            </div>
                                            <div className="flex justify-between items-center p-1.5 sm:p-2 md:p-3 bg-white/5 rounded-md sm:rounded-lg">
                                                <Skeleton className="h-3 w-10 sm:h-4 sm:w-12 md:h-5 md:w-16 bg-white/20" />
                                                <Skeleton className="h-5 w-12 sm:h-6 sm:w-16 md:h-7 md:w-20 bg-white/20" />
                                            </div>
                                            <div className="flex justify-between items-center p-2 sm:p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl">
                                                <Skeleton className="h-3 w-8 sm:h-4 sm:w-10 md:h-5 md:w-12 bg-white/30" />
                                                <Skeleton className="h-5 w-12 sm:h-6 sm:w-16 md:h-7 md:w-20 bg-white/30" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl -translate-y-48"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl translate-y-48"></div>
            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950 dark:via-emerald-950 dark:to-green-900 p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full text-center border-2 border-green-200 dark:border-green-800 relative overflow-hidden"
                        >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:20px_20px] opacity-50"></div>
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-2xl relative"
                            >
                                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full bg-green-400/30"
                                ></motion.div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 dark:text-green-200 mb-2 sm:mb-3">
                                    {mode === "edit" ? "✨ আপডেট সফল!" : "🎉 বিক্রয় সফল!"}
                                </h3>
                                <p className="text-sm sm:text-base text-green-700 dark:text-green-300 leading-relaxed">
                                    আপনার ফ্যাব্রিক {mode === "edit" ? "আপডেট" : "বিক্রয়"} সফলভাবে সম্পন্ন হয়েছে
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="relative overflow-hidden border-b bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 dark:from-indigo-950 dark:via-blue-950 dark:to-indigo-900">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => mode === "page" ? router.push("/dashboard/fabrics/sales") : onCancel?.()}
                            className="text-white bg-blue-300 hover:bg-white/20 hover:scale-110 transition-all duration-200"
                        >
                            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1">
                            {/* Page Description - Left Side */}
                            <div className="flex-1 text-white min-w-0">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                                        {mode === "edit" ? "ফ্যাব্রিক বিক্রয় এডিট" : "নতুন ফ্যাব্রিক বিক্রয়"}
                                    </h1>
                                    <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                                        ফ্যাব্রিক নির্বাচন করে পরিমাণ এবং দর লিখে বিক্রয় করুন
                                    </p>
                                </motion.div>
                            </div>

                            {/* Current Shop Info - Right Side */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-left sm:text-right self-start sm:self-center"
                            >
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-200">
                                    <div className="text-xs text-white/70 uppercase tracking-wide mb-1">কারেন্ট শপ</div>
                                    <div className="text-base sm:text-lg font-bold text-white">
                                        {selectedShop?.name || "শপ নির্বাচন করুন"}
                                    </div>
                                    {selectedShop?.address && (
                                        <div className="text-xs text-white/60 mt-1 hidden sm:block">
                                            {selectedShop.address}
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 relative z-10">
                <div className="w-full max-w-7xl mx-auto">
                    {/* Form Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full"
                    >
                        <Card className={`shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl  dark:hover:bg-slate-900/95 ${isSubmitting ? "opacity-90 scale-[0.99] shadow-lg" : "opacity-100 "
                            }`}>
                            
                            <CardContent className="p-4 sm:p-6 lg:p-4">
                                <div className="space-y-6 sm:space-y-8">
                                    {/* Fabric Items */}
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                            <Label className="text-xl sm:text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-slate-200">
                                                <motion.div
                                                    className="p-2 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 rounded-lg"
                                                >
                                                    <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                                </motion.div>
                                                ফ্যাব্রিক আইটেমসমূহ
                                            </Label>
                                            <motion.div
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    type="button"
                                                    onClick={handleAddItem}
                                                    size="default"
                                                    className="cursor-pointer bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 hover:from-indigo-600 hover:via-blue-600 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold"
                                                >
                                                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                                    আইটেম যোগ করুন
                                                </Button>
                                            </motion.div>
                                        </div>

                                        <AnimatePresence>
                                            {saleItems.map((item, index) => (
                                                <motion.div
                                                    key={item.id}
                                                    className="relative p-4 sm:p-6 border-2 border-indigo-100 dark:border-indigo-900 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 shadow-xl hover:shadow-2xl transition-all duration-500 group"
                                                >
                                                    <motion.div
                                                        className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-xl border-2 border-white dark:border-slate-900"
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        animate={{ scale: [1, 1.05, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    >
                                                        {index + 1}
                                                    </motion.div>

                                                    {saleItems.length > 1 && (
                                                        <motion.div
                                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="absolute -top-2 -right-2 z-20"
                                                        >
                                                            <Button
                                                                type="button"
                                                                onClick={() => handleRemoveItem(index)}
                                                                className="h-10 w-10 p-0 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-xl hover:shadow-2xl border-2 border-white dark:border-slate-900 transition-all duration-300"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </motion.div>
                                                    )}

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                ফ্যাব্রিক *
                                                            </Label>
                                                            <Controller
                                                                name={`saleItems.${index}.fabricId`}
                                                                control={form.control}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        value={field.value}
                                                                        onValueChange={(value) => {
                                                                            field.onChange(value)
                                                                            handleFabricChange(index, value)
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="h-11 border-2 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500">
                                                                            <SelectValue placeholder="নির্বাচন করুন" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {fabrics?.map((fabric) => {
                                                                                const isLowStock = fabric.stock_quantity <= 10;
                                                                                const isOutOfStock = fabric.stock_quantity <= 0;

                                                                                return (
                                                                                    <SelectItem key={fabric.$id} value={fabric.$id}>
                                                                                        <div className="flex justify-between items-center w-full gap-2">
                                                                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                                                <span
                                                                                                    className="font-medium truncate max-w-[150px]"
                                                                                                    title={fabric.name}
                                                                                                >
                                                                                                    {fabric.name}
                                                                                                </span>
                                                                                                {isOutOfStock && (
                                                                                                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                                                                                )}
                                                                                                {isLowStock && !isOutOfStock && (
                                                                                                    <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                                                                                )}
                                                                                            </div>
                                                                                            <Badge
                                                                                                variant={
                                                                                                    isOutOfStock
                                                                                                        ? "destructive"
                                                                                                        : isLowStock
                                                                                                            ? "outline"
                                                                                                            : "secondary"
                                                                                                }
                                                                                                className={`ml-2 flex-shrink-0 ${isOutOfStock
                                                                                                    ? "bg-red-100 text-red-800 border-red-300"
                                                                                                    : isLowStock
                                                                                                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                                                                                        : "bg-green-100 text-green-800 border-green-300"
                                                                                                    }`}
                                                                                            >
                                                                                                {fabric.stock_quantity} গজ
                                                                                            </Badge>
                                                                                        </div>
                                                                                    </SelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                            />
                                                            {form.formState.errors.saleItems?.[index]?.fabricId && (
                                                                <p className="text-sm text-red-600 mt-1">
                                                                    {form.formState.errors.saleItems[index]?.fabricId?.message}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                পরিমাণ (গজ) *
                                                            </Label>
                                                            <Controller
                                                                name={`saleItems.${index}.quantity`}
                                                                control={form.control}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        type="number"
                                                                        min="0.1"
                                                                        step="0.1"
                                                                        className="h-11 border-2 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500"
                                                                        {...field}
                                                                        onChange={(e) => {
                                                                            field.onChange(parseFloat(e.target.value) || 0)
                                                                            // Trigger immediate calculation update
                                                                            setTimeout(() => {
                                                                                const newTotal = calculateTotal()
                                                                                if (newTotal > 0) {
                                                                                    form.setValue("paymentAmount", newTotal)
                                                                                }
                                                                            }, 0)
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                দর/গজ (R) *
                                                            </Label>
                                                            <Controller
                                                                name={`saleItems.${index}.unitPrice`}
                                                                control={form.control}
                                                                render={({ field }) => (
                                                                    <div className="relative">
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            step="0.01"
                                                                            className="h-11 border-2 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500"
                                                                            {...field}
                                                                            value={field.value === 0 || field.value === "" ? "" : field.value}
                                                                            onChange={(e) => {
                                                                                field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)
                                                                                // Trigger immediate calculation update
                                                                                setTimeout(() => {
                                                                                    const newTotal = calculateTotal()
                                                                                    if (newTotal > 0) {
                                                                                        form.setValue("paymentAmount", newTotal)
                                                                                    }
                                                                                }, 0)
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            />
                                                        </div>
                                                    </div>

                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>


                                    {/* All Payment Fields in One Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-indigo-500" />
                                                ডিসকাউন্ট (R)
                                            </Label>
                                            <Controller
                                                name="discountAmount"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="h-11 border-2 border-indigo-200 dark:border-indigo-800 text-base"
                                                        {...field}
                                                        value={field.value === 0 || field.value === "" ? "" : field.value}
                                                        onChange={(e) => {
                                                            field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)
                                                            // Trigger immediate calculation update
                                                            setTimeout(() => {
                                                                const newTotal = calculateTotal()
                                                                if (newTotal >= 0) {
                                                                    form.setValue("paymentAmount", newTotal)
                                                                }
                                                            }, 0)
                                                        }}
                                                        placeholder="0.00"
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-indigo-500" />
                                                পরিশোধিত (R) *
                                            </Label>
                                            <Controller
                                                name="paymentAmount"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="h-11 border-2 border-indigo-200 dark:border-indigo-800 text-base font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20"
                                                        {...field}
                                                        value={field.value === 0 || field.value === "" ? "" : field.value}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                                                        placeholder="0.00"
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-indigo-500" />
                                                পেমেন্ট মেথড *
                                            </Label>
                                            <Controller
                                                name="paymentMethod"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className="h-10 border-2 border-indigo-200 dark:border-indigo-800">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="cash">
                                                                <div className="flex items-center gap-2">
                                                                    <Wallet className="h-4 w-4" />
                                                                    নগদ
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="card">
                                                                <div className="flex items-center gap-2">
                                                                    <CreditCard className="h-4 w-4" />
                                                                    কার্ড
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="online">
                                                                <div className="flex items-center gap-2">
                                                                    <Smartphone className="h-4 w-4" />
                                                                    মোবাইল ব্যাংকিং
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <motion.div
                                        className="w-full relative group"
                                    >
                                        {/* Instant Loading Feedback */}
                                        {isSubmitting && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                className="absolute inset-0 bg-white rounded-2xl z-5"
                                            />
                                        )}
                                        <Button
                                            onClick={form.handleSubmit(onSubmit)}
                                            disabled={isSubmitting}
                                            className={`w-full cursor-pointer h-14 sm:h-16 lg:h-18 text-lg sm:text-xl lg:text-2xl font-bold rounded-2xl shadow-2xl transition-all duration-300 relative overflow-hidden group ${isSubmitting
                                                ? "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 cursor-not-allowed opacity-80 shadow-inner scale-95"
                                                : "bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:via-blue-700 hover:to-purple-700 hover:shadow-indigo-500/50 "
                                                } text-white border-0`}
                                        >
                                            <div className="flex items-center justify-center gap-3">
                                                {isSubmitting ? (
                                                    <>
                                                        {/* Loading Spinner */}
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                                            className="w-6 h-6 border-3 border-white border-t-transparent rounded-full flex-shrink-0"
                                                        />
                                                        {/* Loading Text */}
                                                        <motion.span
                                                            animate={{ opacity: [0.7, 1, 0.7] }}
                                                            transition={{ duration: 1.2, repeat: Infinity }}
                                                            className="text-lg font-semibold"
                                                        >
                                                            {mode === "edit" ? "আপডেট হচ্ছে..." : "বিক্রয় প্রসেস হচ্ছে..."}
                                                        </motion.span>
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* Success Icon */}
                                                        <motion.div
                                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                        >
                                                            <CheckCircle className="h-6 w-6 flex-shrink-0" />
                                                        </motion.div>
                                                        {/* Normal Text */}
                                                        <span className="font-bold">
                                                            {mode === "edit" ? "আপডেট কনফার্ম করুন" : "বিক্রয় কনফার্ম করুন"}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Loading Overlay */}
                                            {isSubmitting && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 0.15, scale: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute inset-0 bg-white rounded-2xl"
                                                />
                                            )}
                                        </Button>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}