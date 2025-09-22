"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useShopStore } from "@/store/shop-store"
import { useFabrics } from "@/services/fabric-service"
import { useCreateFabricSale } from "@/services/fabric-sales-service"
import { useCustomers, useCreateCustomer } from "@/services/customer-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
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
  Eye,
  Receipt,
  FileText,
  Loader2,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react"
import PageContainer from "@/components/layout/page-container"
import InvoiceGenerator from "@/components/InvoiceGenerator"
import SalesHistory from "@/components/SalesHistory"
import { toast } from "react-hot-toast"
import { Input } from "@/components/ui/input"

export default function FabricSalesPage() {
  const { userProfile, selectedShopId } = useAuthStore()
  const { shops } = useShopStore()
  const { data: fabrics, isLoading: fabricsLoading } = useFabrics()
  const { data: customers, isLoading: customersLoading } = useCustomers()
  const createFabricSale = useCreateFabricSale()
  const createCustomer = useCreateCustomer()

  const [activeTab, setActiveTab] = useState("sale")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerSearch, setCustomerSearch] = useState("")
  const [saleItems, setSaleItems] = useState([{ fabricId: "", quantity: 1, sale_price: 0 }])
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [discountAmount, setDiscountAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", address: "" })
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [currentSale, setCurrentSale] = useState(null)

  const selectedShop = shops.find((shop) => shop.$id === selectedShopId)
  const filteredCustomers =
    customers?.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(customerSearch.toLowerCase()) || customer.phone?.includes(customerSearch),
    ) || []

  const subtotal = saleItems.reduce((total, item) => {
    const fabric = fabrics?.find((f) => f.$id === item.fabricId)
    const price = item.sale_price || (fabric ? fabric.price_per_meter : 0)
    return total + price * item.quantity
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
      const fabric = fabrics.find((f) => f.$id === value)
      if (fabric) {
        newItems[index].sale_price = fabric.price_per_meter

        if (newItems[index].quantity > fabric.stock_quantity) {
          toast.error(`স্টক সীমা অতিক্রম! এই ফ্যাব্রিকের মাত্র ${fabric.stock_quantity} মিটার স্টক আছে`)
        }
      }
    }

    if (field === "quantity" && value > 0 && newItems[index].fabricId) {
      const fabric = fabrics.find((f) => f.$id === newItems[index].fabricId)
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
      const fabric = fabrics.find((f) => f.$id === item.fabricId)
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
      const result = await createFabricSale.mutateAsync({
        shopId: selectedShopId,
        customerId: selectedCustomer,
        soldBy: userProfile.$id,
        items: saleItems,
        total_amount: totalAmount,
        payment_amount: paymentValue,
        payment_method: paymentMethod,
        discount_amount: discountValue,
        notes: notes,
      })

      setCurrentSale({
        ...result.fabricSale,
        payment_amount: paymentValue,
        payment_method: paymentMethod,
        items: saleItems,
      })

      setSaleItems([{ fabricId: "", quantity: 1, sale_price: 0 }])
      setSelectedCustomer(null)
      setCustomerSearch("")
      setPaymentAmount("")
      setDiscountAmount("")
      setNotes("")

      toast.success("বিক্রয় সফল! 🎉", {
        duration: 4000,
      })
    } catch (error) {
      console.error("Error creating fabric sale:", error)
      toast.error(error.message || "ফ্যাব্রিক বিক্রয় করতে সমস্যা হয়েছে")
    }
  }

  if (fabricsLoading || customersLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                তথ্য লোড হচ্ছে...
              </p>
              <p className="text-muted-foreground">অনুগ্রহ করে অপেক্ষা করুন</p>
            </div>
          </div>
        </div>
      </PageContainer>
    )
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
    <>
      <PageContainer>
        <div className="min-h-screen">
          <div className="container mx-auto py-8 space-y-8">
            <div className="text-center space-y-6">
              <div className="relative inline-flex items-center gap-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-8 py-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl"></div>
                <div className="relative flex items-center gap-3">
                  <div className="h-3 w-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse shadow-lg"></div>
                  <Badge
                    variant="secondary"
                    className="text-sm font-medium px-4 py-1 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                  >
                    <Star className="h-3 w-3 mr-1 text-yellow-500" />
                    {selectedShop?.name || "দোকান নির্বাচন করুন"}
                  </Badge>
                  <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                  প্রিমিয়াম ফ্যাব্রিক সেলস সিস্টেম
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  অত্যাধুনিক প্রযুক্তি সহ পেশাদার ফ্যাব্রিক বিক্রয় ব্যবস্থাপনা - দ্রুত, সহজ এবং সম্পূর্ণ নির্ভরযোগ্য
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200/50 shadow-lg">
                <TabsTrigger
                  value="sale"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200"
                >
                  <ShoppingCart className="h-4 w-4" />
                  নতুন বিক্রয়
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200"
                >
                  <Eye className="h-4 w-4" />
                  বিক্রয় ইতিহাস
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sale" className="space-y-8">
                <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
                  {/* Left Column - Forms */}
                  <div className="lg:col-span-2 space-y-8">
                    <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm">
                      <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            গ্রাহক ব্যবস্থাপনা
                          </span>
                        </CardTitle>
                        <CardDescription className="text-base">
                          বিদ্যমান গ্রাহক নির্বাচন করুন বা নতুন গ্রাহক রেজিস্টার করুন
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="relative">
                          <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="গ্রাহক খুঁজুন (নাম বা ফোন নম্বর লিখুন)..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="pl-12 h-12 text-base border-2 focus:border-blue-400 rounded-xl"
                          />
                        </div>

                        {selectedCustomer && (
                          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                  ✓
                                </div>
                                <div>
                                  <p className="font-semibold text-green-900 dark:text-green-100 text-lg">
                                    নির্বাচিত গ্রাহক
                                  </p>
                                  <div className="text-green-700 dark:text-green-300">
                                    {customers?.find((c) => c.$id === selectedCustomer)?.name} -
                                    {customers?.find((c) => c.$id === selectedCustomer)?.phone}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedCustomer(null)}
                                className="text-green-700 hover:text-green-800 hover:bg-green-100"
                              >
                                পরিবর্তন
                              </Button>
                            </div>
                          </div>
                        )}

                        {customerSearch && filteredCustomers.length > 0 && (
                          <div className="grid gap-3 max-h-80 overflow-y-auto border-2 rounded-xl p-3 bg-white/50 dark:bg-slate-800/50">
                            {filteredCustomers.map((customer) => (
                              <div
                                key={customer.$id}
                                className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${selectedCustomer === customer.$id
                                  ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-700 shadow-lg"
                                  : "hover:border-blue-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                                  }`}
                                onClick={() => {
                                  setSelectedCustomer(customer.$id)
                                  setCustomerSearch("")
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                                    {customer.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-lg">{customer.name}</p>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Phone className="h-4 w-4" />
                                      {customer.phone}
                                    </div>
                                  </div>
                                </div>
                                {selectedCustomer === customer.$id && (
                                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-6 border-t-2 border-dashed border-slate-200">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                            className="w-full h-12 text-base border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50"
                          >
                            <UserPlus className="h-5 w-5 mr-2" />
                            নতুন গ্রাহক রেজিস্টার করুন
                          </Button>

                          {showNewCustomerForm && (
                            <div className="mt-6 space-y-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                              <h4 className="font-semibold text-xl text-blue-900 dark:text-blue-100">নতুন গ্রাহক তথ্য</h4>
                              <div className="grid gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="customer-name" className="text-base font-medium">
                                    গ্রাহকের নাম *
                                  </Label>
                                  <Input
                                    id="customer-name"
                                    placeholder="পূর্ণ নাম লিখুন"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    className="h-11 text-base"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="customer-phone" className="text-base font-medium">
                                    ফোন নম্বর *
                                  </Label>
                                  <Input
                                    id="customer-phone"
                                    placeholder="০১XXXXXXXXX"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    className="h-11 text-base"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="customer-address" className="text-base font-medium">
                                    ঠিকানা
                                  </Label>
                                  <Textarea
                                    id="customer-address"
                                    placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                                    value={newCustomer.address}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    rows={3}
                                    className="resize-none text-base"
                                  />
                                </div>
                                <div className="flex gap-3 pt-2">
                                  <Button
                                    type="button"
                                    onClick={handleCreateCustomer}
                                    disabled={createCustomer.isLoading}
                                    className="flex-1 h-11 text-base bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                  >
                                    {createCustomer.isLoading ? (
                                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    ) : (
                                      <CheckCircle2 className="h-5 w-5 mr-2" />
                                    )}
                                    গ্রাহক রেজিস্টার করুন
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowNewCustomerForm(false)}
                                    className="h-11 px-6"
                                  >
                                    বাতিল
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-slate-800 dark:via-purple-900/10 dark:to-pink-900/10">
                      <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            ফ্যাব্রিক সিলেকশন
                          </span>
                        </CardTitle>
                        <CardDescription className="text-base">
                          বিক্রয়কৃত ফ্যাব্রিক আইটেম সিলেক্ট এবং পরিমাণ নির্ধারণ করুন
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {saleItems.map((item, index) => {
                          const selectedFabric = fabrics?.find((f) => f.$id === item.fabricId)
                          const hasStockIssue = selectedFabric && item.quantity > selectedFabric.stock_quantity
                          const itemTotal = item.quantity * item.sale_price

                          return (
                            <div
                              key={index}
                              className={`grid gap-6 lg:grid-cols-12 p-6 border-2 rounded-2xl transition-all duration-200 ${hasStockIssue
                                ? "border-red-300 bg-gradient-to-r from-red-50 to-pink-50 dark:border-red-700 dark:from-red-900/20 dark:to-pink-900/20 shadow-lg"
                                : "border-slate-200 bg-gradient-to-r from-white to-slate-50 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 hover:shadow-lg"
                                }`}
                            >
                              <div className="lg:col-span-5 space-y-3">
                                <Label htmlFor={`fabric-${index}`} className="text-base font-medium">
                                  ফ্যাব্রিক সিলেক্ট করুন
                                </Label>
                                <Select
                                  value={item.fabricId}
                                  onValueChange={(value) => handleItemChange(index, "fabricId", value)}
                                >
                                  <SelectTrigger
                                    className={`h-12 text-base ${hasStockIssue ? "border-red-300" : "border-2 focus:border-purple-400"}`}
                                  >
                                    <SelectValue placeholder="ফ্যাব্রিক নির্বাচন করুন" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {fabrics?.map((fabric) => (
                                      <SelectItem key={fabric.$id} value={fabric.$id}>
                                        <div className="flex justify-between items-center w-full">
                                          <span className="font-medium">{fabric.name}</span>
                                          <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">{fabric.code}</span>
                                            <Badge
                                              variant={fabric.stock_quantity > 0 ? "secondary" : "destructive"}
                                              className="text-xs"
                                            >
                                              {fabric.stock_quantity} মি
                                            </Badge>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {hasStockIssue && (
                                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                                    <AlertCircle className="h-4 w-4" />
                                    স্টক সীমা অতিক্রম! মাত্র {selectedFabric.stock_quantity} মিটার আছে
                                  </div>
                                )}
                              </div>

                              <div className="lg:col-span-2 space-y-3">
                                <Label htmlFor={`quantity-${index}`} className="text-base font-medium">
                                  পরিমাণ (মিটার)
                                </Label>
                                <Input
                                  id={`quantity-${index}`}
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  value={item.quantity || ""}
                                  onChange={(e) =>
                                    handleItemChange(index, "quantity", Number.parseFloat(e.target.value) || 0)
                                  }
                                  className={`h-12 text-base ${hasStockIssue ? "border-red-300" : "border-2 focus:border-purple-400"}`}
                                />
                              </div>

                              <div className="lg:col-span-2 space-y-3">
                                <Label htmlFor={`price-${index}`} className="text-base font-medium">
                                  দাম/মিটার (৳)
                                </Label>
                                <Input
                                  id={`price-${index}`}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.sale_price || ""}
                                  onChange={(e) =>
                                    handleItemChange(index, "sale_price", Number.parseFloat(e.target.value) || 0)
                                  }
                                  className="h-12 text-base border-2 focus:border-purple-400"
                                />
                              </div>

                              <div className="lg:col-span-2 space-y-3">
                                <Label className="text-base font-medium">মোট (৳)</Label>
                                <div className="h-12 flex items-center">
                                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    ৳{itemTotal.toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              <div className="lg:col-span-1 flex items-end justify-end">
                                {saleItems.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleRemoveItem(index)}
                                    className="h-12 w-12 rounded-xl"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        <Button
                          type="button"
                          onClick={handleAddItem}
                          variant="outline"
                          className="w-full h-14 text-base border-2 border-dashed border-purple-300 dark:border-purple-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl bg-transparent"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          নতুন আইটেম যোগ করুন
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-orange-50/30 to-yellow-50/30 dark:from-slate-800 dark:via-orange-900/10 dark:to-yellow-900/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl shadow-lg">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                            বিশেষ নির্দেশনা
                          </span>
                        </CardTitle>
                        <CardDescription className="text-base">
                          বিক্রয় সম্পর্কিত কোনো বিশেষ তথ্য বা নির্দেশনা লিখুন
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="যেমন: ডেলিভারি নির্দেশনা, বিশেষ ডিসকাউন্ট, গ্রাহকের বিশেষ অনুরোধ ইত্যাদি..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                          className="resize-none border-2 focus:border-orange-400 text-base rounded-xl"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Enhanced Summary */}
                  <div className="space-y-8">
                    <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-slate-800 dark:via-green-900/10 dark:to-emerald-900/10">
                      <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                            <CreditCard className="h-6 w-6 text-white" />
                          </div>
                          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            পেমেন্ট তথ্য
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="payment-method" className="text-base font-medium">
                            পেমেন্ট মেথড
                          </Label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger className="h-12 text-base border-2 focus:border-green-400">
                              <SelectValue placeholder="পেমেন্ট পদ্ধতি" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">
                                <div className="flex items-center gap-3">
                                  <Banknote className="h-5 w-5" />
                                  নগদ (Cash)
                                </div>
                              </SelectItem>
                              <SelectItem value="card">
                                <div className="flex items-center gap-3">
                                  <CreditCard className="h-5 w-5" />
                                  ডেবিট/ক্রেডিট কার্ড
                                </div>
                              </SelectItem>
                              <SelectItem value="online">
                                <div className="flex items-center gap-3">
                                  <Smartphone className="h-5 w-5" />
                                  মোবাইল ব্যাংকিং
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="discount" className="text-base font-medium">
                            ডিসকাউন্ট (৳)
                          </Label>
                          <Input
                            id="discount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            placeholder="0.00"
                            className="h-12 text-base border-2 focus:border-green-400"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="paid-amount" className="text-base font-medium">
                            পরিশোধিত Amount (৳)
                          </Label>
                          <Input
                            id="paid-amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="0.00"
                            className="h-12 text-base border-2 focus:border-green-400"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                      <CardHeader className="pb-6 relative z-10">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <ShieldCheck className="h-7 w-7" />
                          বিক্রয় সারাংশ
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 relative z-10">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-blue-100 text-lg">
                            <span>সাবটোটাল:</span>
                            <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between items-center text-blue-100 text-lg">
                            <span>ডিসকাউন্ট:</span>
                            <span className="text-red-200 font-semibold">-৳{discountValue.toFixed(2)}</span>
                          </div>

                          <Separator className="bg-blue-400/50" />

                          <div className="flex justify-between items-center text-2xl font-bold">
                            <span>মোট Amount:</span>
                            <span className="text-white">৳{totalAmount.toFixed(2)}</span>
                          </div>

                          <Separator className="bg-blue-400/50" />

                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-blue-100 text-lg">
                              <span className="flex items-center gap-2">
                                {getPaymentMethodIcon(paymentMethod)}
                                পরিশোধিত:
                              </span>
                              <span className="font-semibold">৳{paymentValue.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center text-xl font-bold">
                              <span>বাকি Amount:</span>
                              <span className={dueAmount > 0 ? "text-orange-300" : "text-green-300"}>
                                ৳{dueAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-14 text-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 shadow-xl mt-6 rounded-xl transition-all duration-200 hover:scale-105"
                          size="lg"
                          disabled={createFabricSale.isLoading}
                        >
                          {createFabricSale.isLoading ? (
                            <>
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              প্রসেস হচ্ছে...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-6 w-6 mr-2" />
                              বিক্রয় কনফার্ম করুন
                            </>
                          )}
                        </Button>

                        {currentSale && (
                          <Button
                            type="button"
                            onClick={() => setShowInvoice(true)}
                            variant="outline"
                            className="w-full h-12 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-xl"
                          >
                            <Receipt className="h-5 w-5 mr-2" />
                            রসিদ দেখুন
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          দ্রুত পরিসংখ্যান
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="space-y-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200">
                            <div className="text-3xl font-bold text-blue-600">{saleItems.length}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">মোট আইটেম</div>
                          </div>
                          <div className="space-y-2 p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200">
                            <div className="text-3xl font-bold text-purple-600">
                              {saleItems.reduce((total, item) => total + item.quantity, 0).toFixed(1)}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">মোট মিটার</div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {totalAmount > 0 ? "✓" : "○"}
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-300">
                              {totalAmount > 0 ? "প্রস্তুত" : "অপেক্ষমাণ"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="history">
                <SalesHistory />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageContainer>

      {showInvoice && currentSale && (
        <InvoiceGenerator
          saleData={currentSale}
          customerData={customers?.find((c) => c.$id === selectedCustomer)}
          shopData={selectedShop}
          fabrics={fabrics}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </>
  )
}
