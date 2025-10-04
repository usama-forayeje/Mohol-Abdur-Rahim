"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuthStore } from "@/store/auth-store"
import { useShopStore } from "@/store/shop-store"
import { useCreateTailoringItem, useUpdateTailoringItem } from "@/services/tailoring-service"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    ArrowLeft,
    CheckCircle,
    Shirt,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const tailoringItemSchema = z.object({
    name: z.string().min(1, "টেইলারিং আইটেমের নাম লিখুন"),
    description: z.string().optional(),
    price: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (val === "" || val === null || val === undefined) return 0
            const num = Number.parseFloat(val)
            return isNaN(num) ? 0 : num
        })
        .refine((val) => val >= 0, "দর ০ এর কম হতে পারে না"),
    workerPrice: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (val === "" || val === null || val === undefined) return 0
            const num = Number.parseFloat(val)
            return isNaN(num) ? 0 : num
        })
        .refine((val) => val >= 0, "কর্মী দর ০ এর কম হতে পারে না"),
})

export function TailoringItemsForm({ mode = "create", initialData, onSuccess, onCancel, itemId }) {
    const { userProfile, selectedShopId } = useAuthStore()
    const { shops } = useShopStore()
    const createTailoringItem = useCreateTailoringItem()
    const updateTailoringItem = useUpdateTailoringItem()
    const router = useRouter()

    const [showSuccess, setShowSuccess] = useState(false)
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        resolver: zodResolver(tailoringItemSchema),
        defaultValues: {
            name: "",
            description: "",
            price: "",
            workerPrice: "",
        },
    })

    const selectedShop = shops?.find((s) => s.$id === selectedShopId)

    useEffect(() => {
        // Only run once when we have initial data and haven't loaded it yet
        if (mode === "edit" && initialData && itemId && !isInitialDataLoaded) {
            console.log("=== POPULATING FORM WITH INITIAL DATA ===")
            console.log("Initial data:", initialData)

            const formData = {
                name: initialData.name || "",
                description: initialData.description || "",
                price: Number(initialData.price) || "",
                workerPrice: Number(initialData.worker_price || initialData.workerPrice) || "",
            }

            console.log("Setting form data:", formData)

            // Set form values
            Object.keys(formData).forEach((key) => {
                form.setValue(key, formData[key])
            })

            // Mark as loaded to prevent re-running
            setIsInitialDataLoaded(true)

            console.log("Form populated successfully")
            console.log("Current form values:", form.getValues())
        }
    }, [mode, initialData, itemId, isInitialDataLoaded, form])

    const onSubmit = async (data) => {
        if (!selectedShopId) {
            toast.error("দোকান নির্বাচন করুন")
            return
        }

        if (!userProfile?.$id) {
            toast.error("লগইন করুন")
            return
        }

        setIsSubmitting(true)

        try {
            if (mode === "edit" && itemId) {
                // Update existing item
                const updateData = {
                    name: data.name,
                    description: data.description,
                    price: Number.parseFloat(data.price) || 0,
                    worker_price: Number.parseFloat(data.workerPrice) || 0,
                }

                await updateTailoringItem.mutateAsync({
                    id: itemId,
                    data: updateData,
                })

                toast.success("টেইলারিং আইটেম সফলভাবে আপডেট হয়েছে")

                if (onSuccess) {
                    onSuccess()
                } else {
                    router.push("/dashboard/settings/tailoring-items")
                }
            } else {
                // Create new item for current shop
                const itemData = {
                    shopId: selectedShopId,
                    createdBy: userProfile.$id,
                    name: data.name,
                    description: data.description,
                    price: Number.parseFloat(data.price) || 0,
                    worker_price: Number.parseFloat(data.workerPrice) || 0,
                }

                await createTailoringItem.mutateAsync(itemData)

                setShowSuccess(true)

                setTimeout(() => {
                    setShowSuccess(false)

                    if (onSuccess) {
                        onSuccess()
                    } else {
                        form.reset({
                            name: "",
                            description: "",
                            price: "",
                            workerPrice: "",
                        })
                        router.push("/dashboard/settings/tailoring-items")
                    }
                }, 2000)
            }
        } catch (error) {
            console.error("Tailoring item error:", error)
            toast.error(error.message || "টেইলারিং আইটেম তৈরি করতে সমস্যা হয়েছে")
        } finally {
            setIsSubmitting(false)
        }
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
                                    🎉 আইটেম তৈরি সফল!
                                </h3>
                                <p className="text-sm sm:text-base text-green-700 dark:text-green-300 leading-relaxed">
                                    আপনার টেইলারিং আইটেম সফলভাবে তৈরি হয়েছে
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
                            onClick={() => mode === "page" ? router.push("/dashboard/settings/tailoring-items") : onCancel?.()}
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
                                        {mode === "edit" ? "টেইলারিং আইটেম এডিট" : "নতুন টেইলারিং আইটেম"}
                                    </h1>
                                    <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                                        টেইলারিং আইটেমের বিস্তারিত তথ্য লিখে তৈরি করুন
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
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 relative z-10">
                <div className="w-full max-w-3xl mx-auto">
                    {/* Form Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full"
                    >
                        <Card className={`shadow-xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl  dark:hover:bg-slate-900/95 ${isSubmitting ? "opacity-90 scale-[0.99] shadow-lg" : "opacity-100 "
                            }`}>
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 border-b p-3 sm:p-4">
                                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200 text-base sm:text-lg">
                                    <motion.div
                                        className="p-1.5 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 rounded-lg"
                                    >
                                        <Shirt className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                                    </motion.div>
                                    আইটেমের তথ্য
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-3 sm:p-4 lg:p-3">
                                <div className="space-y-4 sm:space-y-5">
                                    {/* Compact Form Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                                        {/* Item Name and Description in same row */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                আইটেমের নাম *
                                            </Label>
                                            <Controller
                                                name="name"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        className="h-9 border border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 text-sm"
                                                        placeholder="শার্ট, প্যান্ট..."
                                                    />
                                                )}
                                            />
                                            {form.formState.errors.name && (
                                                <p className="text-xs text-red-600">
                                                    {form.formState.errors.name.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                বিবরণ
                                            </Label>
                                            <Controller
                                                name="description"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        className="h-9 border border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 text-sm"
                                                        placeholder="সংক্ষিপ্ত বিবরণ..."
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Pricing Information - Compact */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                বিক্রয় মূল্য (R) *
                                            </Label>
                                            <Controller
                                                name="price"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="h-9 border border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 text-sm"
                                                        placeholder="0.00"
                                                        value={field.value === 0 || field.value === "" ? "" : field.value}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === "" || val === null || val === undefined) {
                                                                field.onChange("");
                                                            } else {
                                                                const num = parseFloat(val);
                                                                field.onChange(isNaN(num) ? "" : num);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                            {form.formState.errors.price && (
                                                <p className="text-xs text-red-600">
                                                    {form.formState.errors.price.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                কর্মী মূল্য (R) *
                                            </Label>
                                            <Controller
                                                name="workerPrice"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="h-9 border border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 text-sm"
                                                        placeholder="0.00"
                                                        value={field.value === 0 || field.value === "" ? "" : field.value}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === "" || val === null || val === undefined) {
                                                                field.onChange("");
                                                            } else {
                                                                const num = parseFloat(val);
                                                                field.onChange(isNaN(num) ? "" : num);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                            {form.formState.errors.workerPrice && (
                                                <p className="text-xs text-red-600">
                                                    {form.formState.errors.workerPrice.message}
                                                </p>
                                            )}
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
                                            className={`w-full cursor-pointer h-10 sm:h-12 text-sm sm:text-base font-semibold rounded-xl shadow-lg transition-all duration-300 relative overflow-hidden group ${isSubmitting
                                                ? "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 cursor-not-allowed opacity-80"
                                                : "bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:via-blue-700 hover:to-purple-700 hover:shadow-indigo-500/50 hover:scale-105"
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
                                                            {mode === "edit" ? "আপডেট হচ্ছে..." : "তৈরি হচ্ছে..."}
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
                                                            {mode === "edit" ? "আপডেট কনফার্ম করুন" : "আইটেম তৈরি করুন"}
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