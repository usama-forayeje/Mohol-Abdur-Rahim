"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import {
  Edit3,
  Trash2,
  Eye,
  Calendar,
  Package,
  IndianRupee,
  Search,
  Filter,
  Download,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
} from "lucide-react"
import { toast } from "sonner"


// Mock data - replace with actual data from your service
const mockSales = [
  {
    $id: "1",
    sale_date: new Date().toISOString(),
    total_amount: 2500,
    payment_status: "paid",
    payment_amount: 2500,
    customer: {
      name: "আহমেদ হাসান",
      phone: "01712345678",
    },
    items: [{ fabricName: "কটন ফ্যাব্রিক", quantity: 5, sale_price: 500 }],
    notes: "দ্রুত ডেলিভারি প্রয়োজন",
  },
  {
    $id: "2",
    sale_date: new Date(Date.now() - 86400000).toISOString(),
    total_amount: 1800,
    payment_status: "partial",
    payment_amount: 1000,
    customer: {
      name: "ফাতেমা খাতুন",
      phone: "01812345678",
    },
    items: [{ fabricName: "সিল্ক ফ্যাব্রিক", quantity: 3, sale_price: 600 }],
  },
]

export default function SalesHistory() {
  const [sales, setSales] = useState(mockSales)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSale, setSelectedSale] = useState(null)
  const [editingSale, setEditingSale] = useState(null)

  const filteredSales = sales.filter(
    (sale) =>
      sale.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer?.phone.includes(searchTerm) ||
      sale.$id.includes(searchTerm),
  )

  const handleEdit = (sale) => {
    setEditingSale(sale)
  }

  const handleDelete = (saleId) => {
    setSales(sales.filter((sale) => sale.$id !== saleId))
    toast.success("বিক্রয় রেকর্ড মুছে ফেলা হয়েছে")
  }

  const handleSaveEdit = () => {
    if (editingSale) {
      setSales(sales.map((sale) => (sale.$id === editingSale.$id ? editingSale : sale)))
      setEditingSale(null)
      toast.success("বিক্রয় তথ্য আপডেট করা হয়েছে")
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 border-green-200">পরিশোধিত</Badge>
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">আংশিক</Badge>
      case "pending":
        return <Badge className="bg-red-100 text-red-800 border-red-200">বাকি</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const totalPaid = sales.reduce((sum, sale) => sum + sale.payment_amount, 0)
  const totalDue = totalSales - totalPaid

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">মোট বিক্রয়</p>
                <p className="text-2xl font-bold text-blue-900">{sales.length}</p>
              </div>
              <Receipt className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">মোট আয়</p>
                <p className="text-2xl font-bold text-green-900">৳{totalSales.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">পরিশোধিত</p>
                <p className="text-2xl font-bold text-purple-900">৳{totalPaid.toFixed(2)}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">বাকি</p>
                <p className="text-2xl font-bold text-orange-900">৳{totalDue.toFixed(2)}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            বিক্রয় ইতিহাস
          </CardTitle>
          <CardDescription>সকল বিক্রয় রেকর্ড দেখুন, সম্পাদনা এবং মুছে ফেলুন</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="গ্রাহক নাম, ফোন বা বিক্রয় ID দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              ফিল্টার
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              এক্সপোর্ট
            </Button>
          </div>

          {/* Sales List */}
          <div className="space-y-4">
            {filteredSales.map((sale) => (
              <Card key={sale.$id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {sale.customer?.name?.charAt(0) || "W"}
                      </div>
                      <div>
                        <h3 className="font-semibold">{sale.customer?.name || "ওয়াক-ইন কাস্টমার"}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(sale.sale_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {sale.items.length} আইটেম
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />৳{sale.total_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(sale.payment_status)}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedSale(sale)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>বিক্রয়ের বিস্তারিত</DialogTitle>
                            <DialogDescription>বিক্রয় ID: {selectedSale?.$id}</DialogDescription>
                          </DialogHeader>
                          {selectedSale && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>গ্রাহক</Label>
                                  <p className="font-medium">{selectedSale.customer?.name || "ওয়াক-ইন কাস্টমার"}</p>
                                </div>
                                <div>
                                  <Label>তারিখ</Label>
                                  <p>{formatDate(selectedSale.sale_date)}</p>
                                </div>
                              </div>

                              <Separator />

                              <div>
                                <Label>আইটেম সমূহ</Label>
                                <div className="mt-2 space-y-2">
                                  {selectedSale.items.map((item, index) => (
                                    <div key={index} className="flex justify-between p-2 bg-muted rounded">
                                      <span>{item.fabricName}</span>
                                      <span>
                                        {item.quantity} গজ × ৳{item.sale_price} = ৳
                                        {(item.quantity * item.sale_price).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <Separator />

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>মোট Amount</Label>
                                  <p className="text-lg font-bold">৳{selectedSale.total_amount.toFixed(2)}</p>
                                </div>
                                <div>
                                  <Label>পরিশোধিত</Label>
                                  <p className="text-lg font-bold text-green-600">
                                    ৳{selectedSale.payment_amount.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {selectedSale.notes && (
                                <div>
                                  <Label>নোটস</Label>
                                  <p className="text-sm text-muted-foreground">{selectedSale.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setEditingSale(sale)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>বিক্রয় সম্পাদনা</DialogTitle>
                            <DialogDescription>বিক্রয়ের তথ্য আপডেট করুন</DialogDescription>
                          </DialogHeader>
                          {editingSale && (
                            <div className="space-y-4">
                              <div>
                                <Label>পরিশোধিত Amount</Label>
                                <Input
                                  type="number"
                                  value={editingSale.payment_amount}
                                  onChange={(e) =>
                                    setEditingSale({
                                      ...editingSale,
                                      payment_amount: Number.parseFloat(e.target.value) || 0,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>নোটস</Label>
                                <Input
                                  value={editingSale.notes || ""}
                                  onChange={(e) =>
                                    setEditingSale({
                                      ...editingSale,
                                      notes: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <Button onClick={handleSaveEdit} className="w-full">
                                সংরক্ষণ করুন
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>বিক্রয় মুছে ফেলুন</AlertDialogTitle>
                            <AlertDialogDescription>
                              আপনি কি নিশ্চিত যে এই বিক্রয় রেকর্ডটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>বাতিল</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(sale.$id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              মুছে ফেলুন
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSales.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">কোনো বিক্রয় পাওয়া যায়নি</h3>
              <p className="text-muted-foreground">আপনার অনুসন্ধান অনুযায়ী কোনো বিক্রয় রেকর্ড খুঁজে পাওয়া যায়নি।</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
