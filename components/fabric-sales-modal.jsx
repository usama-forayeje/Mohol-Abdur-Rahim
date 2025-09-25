"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useShopStore } from "@/store/shop-store"
import { useFabrics } from "@/services/fabric-service"
import { useCreateFabricSale } from "@/services/fabric-sales-service"
import { useCustomers, useCreateCustomer } from "@/services/customer-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Plus,
    Search,
    UserPlus,
    Package,
    ShoppingCart,
    User,
    Phone,
    CreditCard,
    Banknote,
    Smartphone,
    AlertCircle,
    CheckCircle2,
    Trash2,
    Loader2,
    ShieldCheck,
    Receipt,
    Star,
    TrendingUp,
    MapPin,
    Building,
    Info,
    Calendar,
    DollarSign,
    SortAsc,
    SortDesc,
    X,
    Maximize2,
    Minimize2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

export function FabricSalesModal({ open, onOpenChange, onSuccess }) {
    const { userProfile, selectedShopId } = useAuthStore()
    const { shops } = useShopStore()
    const { data: fabrics, isLoading: fabricsLoading } = useFabrics()
    const { data: customers, isLoading: customersLoading } = useCustomers()
    const createFabricSale = useCreateFabricSale()
    const createCustomer = useCreateCustomer()

    const [activeTab, setActiveTab] = useState("items")
    const [selectedCustomer, setSelectedCustomer] = useState("")
    const [customerSearch, setCustomerSearch] = useState("")
    const [saleItems, setSaleItems] = useState([{ fabricId: "", quantity: 1, sale_price: 0 }])
    const [paymentMethod, setPaymentMethod] = useState("cash")
    const [paymentAmount, setPaymentAmount] = useState("")
    const [discountAmount, setDiscountAmount] = useState("")
    const [notes, setNotes] = useState("")
    const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", address: "" })
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [fabricFilter, setFabricFilter] = useState("")
    const [sortBy, setSortBy] = useState("name")
    const [sortOrder, setSortOrder] = useState("asc")

    const selectedShop = shops.find((shop) => shop.$id === selectedShopId)

    // Enhanced fabric filtering and sorting
    const filteredAndSortedFabrics =
        fabrics
            ?.filter(
                (fabric) =>
                    fabric.name?.toLowerCase().includes(fabricFilter.toLowerCase()) ||
                    fabric.category?.toLowerCase().includes(fabricFilter.toLowerCase()),
            )
            .sort((a, b) => {
                const aValue = a[sortBy] || ""
                const bValue = b[sortBy] || ""
                if (sortOrder === "asc") {
                    return aValue.toString().localeCompare(bValue.toString())
                }
                return bValue.toString().localeCompare(aValue.toString())
            }) || []

    const filteredCustomers =
        customers?.filter(
            (customer) =>
                customer.name?.toLowerCase().includes(customerSearch.toLowerCase()) || customer.phone?.includes(customerSearch),
        ) || []

    const subtotal = saleItems.reduce((total, item) => {
        const fabric = fabrics?.find((f) => f.$id === item.fabricId)
        const price = item.sale_price || (fabric ? fabric.price_per_meter : 0)
        return total + price * (item.quantity || 0)
    }, 0)

    const discountValue = Number.parseFloat(discountAmount) || 0
    const totalAmount = subtotal - discountValue
    const paymentValue = Number.parseFloat(paymentAmount) || 0
    const dueAmount = totalAmount - paymentValue

    useEffect(() => {
        if (paymentMethod === "cash" && paymentAmount === "") {
            setPaymentAmount(totalAmount.toString())
        }
    }, [totalAmount, paymentMethod])

    const handleAddItem = () => {
        setSaleItems([...saleItems, { fabricId: "", quantity: 1, sale_price: 0 }])
    }

    const handleRemoveItem = (index) => {
        if (saleItems.length > 1) {
            setSaleItems(saleItems.filter((_, i) => i !== index))
        }
    }

    const handleItemChange = (index, field, value) => {
        const newItems = [...saleItems]
        newItems[index][field] = value

        if (field === "fabricId" && value) {
            const fabric = fabrics?.find((f) => f.$id === value)
            if (fabric) {
                newItems[index].sale_price = fabric.price_per_meter
                if (newItems[index].quantity > fabric.stock_quantity) {
                    toast.error(`স্টক সীমা অতিক্রম! এই ফ্যাব্রিকের মাত্র ${fabric.stock_quantity} মিটার স্টক আছে`)
                }
            }
        }

        if (field === "quantity" && value > 0 && newItems[index].fabricId) {
            const fabric = fabrics?.find((f) => f.$id === newItems[index].fabricId)
            if (fabric && value > fabric.stock_quantity) {
                toast.error(`স্টক সীমা অতিক্রম! এই ফ্যাব্রিকের মাত্র ${fabric.stock_quantity} মিটার স্টক আছে`)
            }
        }

        setSaleItems(newItems)
    }

    const handleCreateCustomer = async () => {
        if (!newCustomer.name || !newCustomer.phone) {
            toast.error("নাম এবং ফোন নম্বর প্রয়োজন")
            return
        }

        try {
            const customer = await createCustomer.mutateAsync(newCustomer)
            setSelectedCustomer(customer.$id)
            setNewCustomer({ name: "", phone: "", address: "" })
            setCustomerSearch("")
            setShowNewCustomerForm(false)
            toast.success("নতুন গ্রাহক যোগ করা হয়েছে")
        } catch (error) {
            toast.error(error.message || "গ্রাহক তৈরি করতে সমস্যা হয়েছে")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedShopId) {
            toast.error("বিক্রয় করতে একটি দোকান নির্বাচন করুন")
            return
        }

        const hasEmptyItems = saleItems.some((item) => !item.fabricId || item.quantity <= 0)
        if (hasEmptyItems) {
            toast.error("দয়া করে সকল আইটেমের তথ্য সঠিকভাবে পূরণ করুন")
            return
        }

        for (const item of saleItems) {
            const fabric = fabrics?.find((f) => f.$id === item.fabricId)
            if (!fabric) {
                toast.error("দয়া করে একটি বৈধ ফ্যাব্রিক নির্বাচন করুন")
                return
            }

            if (item.quantity > fabric.stock_quantity) {
                toast.error(`${fabric.name} এর পর্যাপ্ত স্টক নেই`)
                return
            }
        }

        try {
            await createFabricSale.mutateAsync({
                shopId: selectedShopId,
                customerId: selectedCustomer || null,
                soldBy: userProfile.$id,
                items: saleItems,
                total_amount: totalAmount,
                payment_amount: paymentValue,
                payment_method: paymentMethod,
                discount_amount: discountValue,
                notes: notes,
            })

            // Reset form
            resetForm()

            toast.success("বিক্রয় সফল! 🎉", {
                duration: 4000,
                icon: "🎉",
                style: {
                    background: "#10b981",
                    color: "#ffffff",
                },
            })

            if (onSuccess) onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error("Error creating fabric sale:", error)
            toast.error(error.message || "ফ্যাব্রিক বিক্রয় করতে সমস্যা হয়েছে")
        }
    }

    const resetForm = () => {
        setSaleItems([{ fabricId: "", quantity: 1, sale_price: 0 }])
        setSelectedCustomer("")
        setCustomerSearch("")
        setPaymentAmount("")
        setDiscountAmount("")
        setNotes("")
        setShowNewCustomerForm(false)
        setActiveTab("items")
        setFabricFilter("")
        setSortBy("name")
        setSortOrder("asc")
    }

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case "cash":
                return <Banknote className="h-4 w-4" />
            case "card":
                return <CreditCard className="h-4 w-4" />
            case "online":
                return <Smartphone className="h-4 w-4" />
            default:
                return <Banknote className="h-4 w-4" />
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen)
                if (!isOpen) resetForm()
            }}
        >
            <DialogContent
                className={`max-w-none p-0 overflow-auto transition-all duration-300 ${isFullscreen ? "w-screen h-screen rounded-none" : "w-[95vw] max-w-7xl h-[95vh] rounded-xl"
                    }`}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isFullscreen ? "fullscreen" : "windowed"}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="h-full flex flex-col"
                    >
                        {/* Enhanced Header */}
                        <DialogHeader className="p-4 md:p-6 border-b bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 backdrop-blur-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                    <motion.div
                                        className="p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex-shrink-0 shadow-lg"
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    </motion.div>
                                    <div className="min-w-0 flex-1">
                                        <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            নতুন ফ্যাব্রিক বিক্রয়
                                        </DialogTitle>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge
                                                            variant="secondary"
                                                            className="cursor-help text-xs sm:text-sm hover:bg-secondary/80 transition-colors"
                                                        >
                                                            <Building className="h-3 w-3 mr-1" />
                                                            <span className="truncate max-w-[120px] sm:max-w-none">
                                                                {selectedShop?.name || "দোকান নির্বাচন করুন"}
                                                            </span>
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        <div className="space-y-2">
                                                            <p className="font-semibold">{selectedShop?.name}</p>
                                                            {selectedShop?.address && (
                                                                <p className="text-sm flex items-start gap-1">
                                                                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                                    {selectedShop.address}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-muted-foreground">বর্তমান সক্রিয় দোকান</p>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <Badge variant="outline" className="text-xs sm:text-sm">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {new Date().toLocaleDateString("bn-BD")}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right flex-shrink-0">
                                        <motion.div
                                            className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600"
                                            key={totalAmount}
                                            initial={{ scale: 1.1 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            ৳{totalAmount.toFixed(2)}
                                        </motion.div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">মোট Amount</div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="h-8 w-8 hover:bg-white/20"
                                    >
                                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                            {/* Left Side - Main Content */}
                            <div className="lg:w-[70%] flex-1 overflow-y-auto">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                    <div className="px-4 md:px-6 pt-4 flex-shrink-0">
                                        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg h-10 sm:h-12">
                                            <TabsTrigger
                                                value="items"
                                                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm sm:text-base font-medium transition-all"
                                            >
                                                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                                                <span className="hidden xs:inline">ফ্যাব্রিক আইটেম</span>
                                                <span className="xs:hidden">আইটেম</span>
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="customer"
                                                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm sm:text-base font-medium transition-all"
                                            >
                                                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                                                <span className="hidden xs:inline">গ্রাহক তথ্য</span>
                                                <span className="xs:hidden">গ্রাহক</span>
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                                        {/* Items Tab */}
                                        <TabsContent value="items" className="space-y-4 md:space-y-6 m-0 h-full">
                                            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
                                                <CardHeader className="pb-3 md:pb-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div>
                                                            <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
                                                                <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                                    <Package className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                                                                </div>
                                                                <span>ফ্যাব্রিক সিলেকশন</span>
                                                            </CardTitle>
                                                            <CardDescription className="text-sm md:text-base">
                                                                বিক্রয়কৃত ফ্যাব্রিক আইটেম সিলেক্ট এবং পরিমাণ নির্ধারণ করুন
                                                            </CardDescription>
                                                        </div>

                                                        {/* Enhanced Fabric Filters */}
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    placeholder="ফ্যাব্রিক খুঁজুন..."
                                                                    value={fabricFilter}
                                                                    onChange={(e) => setFabricFilter(e.target.value)}
                                                                    className="pl-10 w-full sm:w-48"
                                                                />
                                                            </div>
                                                            <Select
                                                                value={`${sortBy}-${sortOrder}`}
                                                                onValueChange={(value) => {
                                                                    const [field, order] = value.split("-")
                                                                    setSortBy(field)
                                                                    setSortOrder(order)
                                                                }}
                                                            >
                                                                <SelectTrigger className="w-full sm:w-32">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="name-asc">
                                                                        <div className="flex items-center gap-2">
                                                                            <SortAsc className="h-4 w-4" />
                                                                            নাম A-Z
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="name-desc">
                                                                        <div className="flex items-center gap-2">
                                                                            <SortDesc className="h-4 w-4" />
                                                                            নাম Z-A
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="price_per_meter-asc">দাম কম-বেশি</SelectItem>
                                                                    <SelectItem value="price_per_meter-desc">দাম বেশি-কম</SelectItem>
                                                                    <SelectItem value="stock_quantity-desc">স্টক বেশি-কম</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4 md:space-y-6">
                                                    <AnimatePresence>
                                                        {saleItems.map((item, index) => {
                                                            const selectedFabric = fabrics?.find((f) => f.$id === item.fabricId)
                                                            const hasStockIssue = selectedFabric && item.quantity > selectedFabric.stock_quantity
                                                            const itemTotal = (item.quantity || 0) * (item.sale_price || 0)

                                                            return (
                                                                <motion.div
                                                                    key={index}
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -20 }}
                                                                    transition={{ duration: 0.3 }}
                                                                    className={`p-4 md:p-6 border-2 rounded-xl transition-all ${hasStockIssue
                                                                            ? "border-red-300 bg-red-50/50 dark:bg-red-950/20 shadow-red-100 dark:shadow-red-900/20"
                                                                            : "border-border hover:border-primary/50 bg-card/50 hover:shadow-lg"
                                                                        } shadow-sm`}
                                                                >
                                                                    {/* Desktop Layout */}
                                                                    <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4">
                                                                        <div className="col-span-4">
                                                                            <Label className="text-sm font-medium mb-2 block">ফ্যাব্রিক *</Label>
                                                                            <Select
                                                                                value={item.fabricId}
                                                                                onValueChange={(value) => handleItemChange(index, "fabricId", value)}
                                                                            >
                                                                                <SelectTrigger
                                                                                    className={`h-12 text-base ${hasStockIssue ? "border-red-300" : ""}`}
                                                                                >
                                                                                    <SelectValue placeholder="ফ্যাব্রিক নির্বাচন করুন" />
                                                                                </SelectTrigger>
                                                                                <SelectContent className="max-h-60">
                                                                                    {filteredAndSortedFabrics?.map((fabric) => (
                                                                                        <SelectItem key={fabric.$id} value={fabric.$id}>
                                                                                            <div className="flex justify-between items-center w-full">
                                                                                                <div className="flex flex-col">
                                                                                                    <span className="font-medium">{fabric.name}</span>
                                                                                                    <span className="text-xs text-muted-foreground">
                                                                                                        ৳{fabric.price_per_meter}/মি
                                                                                                    </span>
                                                                                                </div>
                                                                                                <Badge
                                                                                                    variant={
                                                                                                        fabric.stock_quantity > 10
                                                                                                            ? "secondary"
                                                                                                            : fabric.stock_quantity > 0
                                                                                                                ? "destructive"
                                                                                                                : "outline"
                                                                                                    }
                                                                                                    className="ml-2"
                                                                                                >
                                                                                                    {fabric.stock_quantity} মি
                                                                                                </Badge>
                                                                                            </div>
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>

                                                                        <div className="col-span-2">
                                                                            <Label className="text-sm font-medium mb-2 block">পরিমাণ (মিটার) *</Label>
                                                                            <Input
                                                                                type="number"
                                                                                min="0.1"
                                                                                step="0.1"
                                                                                value={item.quantity}
                                                                                onChange={(e) =>
                                                                                    handleItemChange(index, "quantity", Number.parseFloat(e.target.value) || 0)
                                                                                }
                                                                                className={`h-12 text-base ${hasStockIssue ? "border-red-300" : ""}`}
                                                                            />
                                                                        </div>

                                                                        <div className="col-span-2">
                                                                            <Label className="text-sm font-medium mb-2 block">দর/মি (৳) *</Label>
                                                                            <Input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={item.sale_price}
                                                                                onChange={(e) =>
                                                                                    handleItemChange(index, "sale_price", Number.parseFloat(e.target.value) || 0)
                                                                                }
                                                                                className="h-12 text-base"
                                                                            />
                                                                        </div>

                                                                        <div className="col-span-2">
                                                                            <Label className="text-sm font-medium mb-2 block">মোট (৳)</Label>
                                                                            <motion.div
                                                                                className="h-12 flex items-center justify-center font-bold text-lg bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border-2"
                                                                                key={itemTotal}
                                                                                initial={{ scale: 1.05 }}
                                                                                animate={{ scale: 1 }}
                                                                                transition={{ duration: 0.2 }}
                                                                            >
                                                                                <DollarSign className="h-4 w-4 mr-1" />
                                                                                {itemTotal.toFixed(2)}
                                                                            </motion.div>
                                                                        </div>

                                                                        <div className="col-span-2 flex items-end justify-end">
                                                                            {saleItems.length > 1 && (
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="destructive"
                                                                                    size="icon"
                                                                                    onClick={() => handleRemoveItem(index)}
                                                                                    className="h-12 w-12 hover:scale-105 transition-transform"
                                                                                >
                                                                                    <Trash2 className="h-5 w-5" />
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Mobile/Tablet Layout */}
                                                                    <div className="lg:hidden space-y-4">
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="flex-1">
                                                                                <Label className="text-sm font-medium mb-2 block">ফ্যাব্রিক *</Label>
                                                                                <Select
                                                                                    value={item.fabricId}
                                                                                    onValueChange={(value) => handleItemChange(index, "fabricId", value)}
                                                                                >
                                                                                    <SelectTrigger
                                                                                        className={`h-10 md:h-12 text-sm md:text-base ${hasStockIssue ? "border-red-300" : ""}`}
                                                                                    >
                                                                                        <SelectValue placeholder="ফ্যাব্রিক নির্বাচন করুন" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent className="max-h-60">
                                                                                        {filteredAndSortedFabrics?.map((fabric) => (
                                                                                            <SelectItem key={fabric.$id} value={fabric.$id}>
                                                                                                <div className="flex justify-between items-center w-full">
                                                                                                    <div className="flex flex-col">
                                                                                                        <span className="font-medium text-sm">{fabric.name}</span>
                                                                                                        <span className="text-xs text-muted-foreground">
                                                                                                            ৳{fabric.price_per_meter}/মি
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <Badge
                                                                                                        variant={
                                                                                                            fabric.stock_quantity > 10
                                                                                                                ? "secondary"
                                                                                                                : fabric.stock_quantity > 0
                                                                                                                    ? "destructive"
                                                                                                                    : "outline"
                                                                                                        }
                                                                                                        className="ml-2 text-xs"
                                                                                                    >
                                                                                                        {fabric.stock_quantity} মি
                                                                                                    </Badge>
                                                                                                </div>
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            {saleItems.length > 1 && (
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="destructive"
                                                                                    size="icon"
                                                                                    onClick={() => handleRemoveItem(index)}
                                                                                    className="h-10 w-10 md:h-12 md:w-12 ml-2 flex-shrink-0 hover:scale-105 transition-transform"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                                                                                </Button>
                                                                            )}
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <div>
                                                                                <Label className="text-sm font-medium mb-2 block">পরিমাণ (মিটার) *</Label>
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0.1"
                                                                                    step="0.1"
                                                                                    value={item.quantity}
                                                                                    onChange={(e) =>
                                                                                        handleItemChange(index, "quantity", Number.parseFloat(e.target.value) || 0)
                                                                                    }
                                                                                    className={`h-10 md:h-12 text-sm md:text-base ${hasStockIssue ? "border-red-300" : ""}`}
                                                                                />
                                                                            </div>

                                                                            <div>
                                                                                <Label className="text-sm font-medium mb-2 block">দর/মি (৳) *</Label>
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    value={item.sale_price}
                                                                                    onChange={(e) =>
                                                                                        handleItemChange(
                                                                                            index,
                                                                                            "sale_price",
                                                                                            Number.parseFloat(e.target.value) || 0,
                                                                                        )
                                                                                    }
                                                                                    className="h-10 md:h-12 text-sm md:text-base"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <Label className="text-sm font-medium mb-2 block">মোট (৳)</Label>
                                                                            <motion.div
                                                                                className="h-10 md:h-12 flex items-center justify-center font-bold text-base md:text-lg bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border-2"
                                                                                key={itemTotal}
                                                                                initial={{ scale: 1.05 }}
                                                                                animate={{ scale: 1 }}
                                                                                transition={{ duration: 0.2 }}
                                                                            >
                                                                                <DollarSign className="h-4 w-4 mr-1" />
                                                                                {itemTotal.toFixed(2)}
                                                                            </motion.div>
                                                                        </div>
                                                                    </div>

                                                                    {hasStockIssue && (
                                                                        <motion.div
                                                                            className="flex items-center gap-2 text-red-600 text-sm font-medium mt-3 p-2 bg-red-100 dark:bg-red-900/20 rounded"
                                                                            initial={{ opacity: 0, y: -10 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ duration: 0.3 }}
                                                                        >
                                                                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                                            <span className="text-xs sm:text-sm">
                                                                                স্টক সীমা অতিক্রম! মাত্র {selectedFabric.stock_quantity} মিটার আছে
                                                                            </span>
                                                                        </motion.div>
                                                                    )}
                                                                </motion.div>
                                                            )
                                                        })}
                                                    </AnimatePresence>

                                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                        <Button
                                                            type="button"
                                                            onClick={handleAddItem}
                                                            variant="outline"
                                                            className="w-full h-12 md:h-14 text-sm md:text-base border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all bg-transparent"
                                                        >
                                                            <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                                                            নতুন আইটেম যোগ করুন
                                                        </Button>
                                                    </motion.div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        {/* Customer Tab */}
                                        <TabsContent value="customer" className="space-y-4 md:space-y-6 m-0">
                                            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-950/20">
                                                <CardHeader className="pb-3 md:pb-4">
                                                    <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
                                                        <div className="p-1.5 md:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                            <User className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                                                        </div>
                                                        <span>গ্রাহক ব্যবস্থাপনা</span>
                                                    </CardTitle>
                                                    <CardDescription className="text-sm md:text-base">
                                                        বিদ্যমান গ্রাহক নির্বাচন করুন বা নতুন গ্রাহক রেজিস্টার করুন
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4 md:space-y-6">
                                                    <div className="space-y-4">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-3 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                                                            <Input
                                                                placeholder="গ্রাহক খুঁজুন (নাম বা ফোন নম্বর লিখুন)..."
                                                                value={customerSearch}
                                                                onChange={(e) => setCustomerSearch(e.target.value)}
                                                                className="pl-10 md:pl-12 h-10 md:h-12 text-sm md:text-base"
                                                            />
                                                            {customerSearch && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setCustomerSearch("")}
                                                                    className="absolute right-2 top-2 h-6 w-6"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>

                                                        <AnimatePresence>
                                                            {selectedCustomer && (
                                                                <motion.div
                                                                    className="p-3 md:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg"
                                                                    initial={{ opacity: 0, y: -20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -20 }}
                                                                    transition={{ duration: 0.3 }}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                                                            <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                                                                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
                                                                            </div>
                                                                            <div className="min-w-0 flex-1">
                                                                                <p className="font-semibold text-base md:text-lg">নির্বাচিত গ্রাহক</p>
                                                                                <p className="text-green-700 dark:text-green-300 text-sm md:text-base truncate">
                                                                                    {customers?.find((c) => c.$id === selectedCustomer)?.name} -
                                                                                    {customers?.find((c) => c.$id === selectedCustomer)?.phone}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => setSelectedCustomer("")}
                                                                            className="text-green-700 hover:text-green-800 flex-shrink-0"
                                                                        >
                                                                            পরিবর্তন
                                                                        </Button>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>

                                                        <AnimatePresence>
                                                            {customerSearch && filteredCustomers.length > 0 && (
                                                                <motion.div
                                                                    className="grid gap-2 md:gap-3 max-h-48 md:max-h-60 overflow-y-auto border rounded-lg p-2 md:p-3"
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: "auto" }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                >
                                                                    {filteredCustomers.map((customer) => (
                                                                        <motion.div
                                                                            key={customer.$id}
                                                                            className={`flex items-center justify-between p-2 md:p-3 border rounded-lg cursor-pointer transition-all ${selectedCustomer === customer.$id
                                                                                    ? "bg-blue-50 dark:bg-blue-950/20 border-blue-300 shadow-md"
                                                                                    : "hover:bg-muted/50 hover:border-blue-200"
                                                                                }`}
                                                                            onClick={() => {
                                                                                setSelectedCustomer(customer.$id)
                                                                                setCustomerSearch("")
                                                                            }}
                                                                            whileHover={{ scale: 1.02 }}
                                                                            whileTap={{ scale: 0.98 }}
                                                                        >
                                                                            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                                                                <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg flex-shrink-0">
                                                                                    {customer.name?.charAt(0)}
                                                                                </div>
                                                                                <div className="min-w-0 flex-1">
                                                                                    <p className="font-semibold text-sm md:text-lg truncate">{customer.name}</p>
                                                                                    <p className="text-muted-foreground flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                                                                                        <Phone className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                                                                        <span className="truncate">{customer.phone}</span>
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            {selectedCustomer === customer.$id && (
                                                                                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0" />
                                                                            )}
                                                                        </motion.div>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    <Separator />

                                                    <div className="space-y-4">
                                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                                                                className="w-full h-10 md:h-12 text-sm md:text-base border-2 border-dashed border-green-300 hover:border-green-400 transition-all"
                                                            >
                                                                <UserPlus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                                                                নতুন গ্রাহক রেজিস্টার করুন
                                                            </Button>
                                                        </motion.div>

                                                        <AnimatePresence>
                                                            {showNewCustomerForm && (
                                                                <motion.div
                                                                    className="p-4 md:p-6 border-2 rounded-lg bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 space-y-4"
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: "auto" }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                >
                                                                    <h4 className="font-semibold text-base md:text-lg flex items-center gap-2">
                                                                        <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                                                                        নতুন গ্রাহক তথ্য
                                                                    </h4>
                                                                    <div className="grid gap-4">
                                                                        <div>
                                                                            <Label className="text-sm md:text-base font-medium">গ্রাহকের নাম *</Label>
                                                                            <Input
                                                                                placeholder="পূর্ণ নাম লিখুন"
                                                                                value={newCustomer.name}
                                                                                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                                                                className="h-10 md:h-12 text-sm md:text-base"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-sm md:text-base font-medium">ফোন নম্বর *</Label>
                                                                            <Input
                                                                                placeholder="০১XXXXXXXXX"
                                                                                value={newCustomer.phone}
                                                                                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                                                                className="h-10 md:h-12 text-sm md:text-base"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-sm md:text-base font-medium">ঠিকানা</Label>
                                                                            <Textarea
                                                                                placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                                                                                value={newCustomer.address}
                                                                                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                                                                rows={3}
                                                                                className="text-sm md:text-base"
                                                                            />
                                                                        </div>
                                                                        <div className="flex gap-3">
                                                                            <Button
                                                                                type="button"
                                                                                onClick={handleCreateCustomer}
                                                                                disabled={createCustomer.isLoading}
                                                                                className="flex-1 h-10 md:h-12 bg-green-600 hover:bg-green-700 text-sm md:text-base"
                                                                            >
                                                                                {createCustomer.isLoading ? (
                                                                                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 mr-2 animate-spin" />
                                                                                ) : (
                                                                                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                                                                                )}
                                                                                গ্রাহক রেজিস্টার করুন
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                onClick={() => setShowNewCustomerForm(false)}
                                                                                className="h-10 md:h-12 px-4 md:px-6 text-sm md:text-base"
                                                                            >
                                                                                বাতিল
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </div>

                            {/* Right Side - Enhanced Summary Panel */}
                            <div className="lg:w-[30%] overflow-y-auto border-l bg-gradient-to-b from-gray-50/80 to-white/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm p-4 md:p-6">
                                <div className="space-y-6">
                                    {/* Payment Information */}
                                    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <CreditCard className="h-5 w-5 text-blue-600" />
                                                পেমেন্ট তথ্য
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label className="font-medium">পেমেন্ট মেথড</Label>
                                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder="পেমেন্ট পদ্ধতি" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cash" className="text-base">
                                                            <div className="flex items-center gap-3">
                                                                <Banknote className="h-4 w-4" />
                                                                নগদ (Cash)
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="card" className="text-base">
                                                            <div className="flex items-center gap-3">
                                                                <CreditCard className="h-4 w-4" />
                                                                ডেবিট/ক্রেডিট কার্ড
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="online" className="text-base">
                                                            <div className="flex items-center gap-3">
                                                                <Smartphone className="h-4 w-4" />
                                                                মোবাইল ব্যাংকিং
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label className="font-medium">ডিসকাউন্ট (৳)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={discountAmount}
                                                    onChange={(e) => setDiscountAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="h-12 text-base"
                                                />
                                            </div>

                                            <div>
                                                <Label className="font-medium">পরিশোধিত Amount (৳)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={paymentAmount}
                                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="h-12 text-base"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Enhanced Sales Summary */}
                                    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-sm"></div>
                                        <CardHeader className="pb-4 relative z-10">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Receipt className="h-5 w-5" />
                                                বিক্রয় সারাংশ
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 relative z-10">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-blue-100">সাবটোটাল:</span>
                                                    <motion.span
                                                        className="font-semibold"
                                                        key={subtotal}
                                                        initial={{ scale: 1.1 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        ৳{subtotal.toFixed(2)}
                                                    </motion.span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-blue-100">ডিসকাউন্ট:</span>
                                                    <motion.span
                                                        className="text-red-200 font-semibold"
                                                        key={discountValue}
                                                        initial={{ scale: 1.1 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        -৳{discountValue.toFixed(2)}
                                                    </motion.span>
                                                </div>

                                                <Separator className="bg-blue-400/50" />

                                                <div className="flex justify-between items-center text-xl font-bold">
                                                    <span>মোট Amount:</span>
                                                    <motion.span
                                                        key={totalAmount}
                                                        initial={{ scale: 1.1 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        ৳{totalAmount.toFixed(2)}
                                                    </motion.span>
                                                </div>

                                                <Separator className="bg-blue-400/50" />

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-blue-100 flex items-center gap-2">
                                                            {getPaymentMethodIcon(paymentMethod)}
                                                            পরিশোধিত:
                                                        </span>
                                                        <motion.span
                                                            className="font-semibold"
                                                            key={paymentValue}
                                                            initial={{ scale: 1.1 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            ৳{paymentValue.toFixed(2)}
                                                        </motion.span>
                                                    </div>

                                                    <div className="flex justify-between items-center text-lg font-bold">
                                                        <span>বাকি Amount:</span>
                                                        <motion.span
                                                            className={dueAmount > 0 ? "text-orange-300" : "text-green-300"}
                                                            key={dueAmount}
                                                            initial={{ scale: 1.1 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            ৳{dueAmount.toFixed(2)}
                                                        </motion.span>
                                                    </div>
                                                </div>
                                            </div>

                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Button
                                                    type="submit"
                                                    onClick={handleSubmit}
                                                    className="w-full h-14 text-lg font-bold bg-white text-blue-600 hover:bg-blue-50 mt-4 shadow-xl transition-all"
                                                    disabled={createFabricSale.isLoading}
                                                >
                                                    {createFabricSale.isLoading ? (
                                                        <>
                                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                            প্রসেস হচ্ছে...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldCheck className="h-5 w-5 mr-2" />
                                                            বিক্রয় কনফার্ম করুন
                                                        </>
                                                    )}
                                                </Button>
                                            </motion.div>
                                        </CardContent>
                                    </Card>

                                    {/* Enhanced Quick Stats */}
                                    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                <TrendingUp className="h-4 w-4" />
                                                দ্রুত পরিসংখ্যান
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                                <motion.div
                                                    className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 rounded-lg"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <motion.div
                                                        className="text-2xl font-bold text-blue-600"
                                                        key={saleItems.length}
                                                        initial={{ scale: 1.2 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        {saleItems.length}
                                                    </motion.div>
                                                    <div className="text-xs text-muted-foreground">মোট আইটেম</div>
                                                </motion.div>
                                                <motion.div
                                                    className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 rounded-lg"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <motion.div
                                                        className="text-2xl font-bold text-green-600"
                                                        key={saleItems.reduce((total, item) => total + (item.quantity || 0), 0)}
                                                        initial={{ scale: 1.2 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        {saleItems.reduce((total, item) => total + (item.quantity || 0), 0).toFixed(1)}
                                                    </motion.div>
                                                    <div className="text-xs text-muted-foreground">মোট মিটার</div>
                                                </motion.div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Notes Section */}
                                    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 text-sm">
                                                <Info className="h-4 w-4" />
                                                বিশেষ নির্দেশনা
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Textarea
                                                placeholder="বিক্রয় সম্পর্কিত কোনো বিশেষ তথ্য বা নির্দেশনা..."
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                rows={4}
                                                className="resize-none text-base bg-white/50 dark:bg-gray-800/50"
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    )
}
