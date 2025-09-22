"use client"

import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, X, User, Package, Receipt, Send, Star, Shield, Zap } from "lucide-react"
import { toast } from "react-hot-toast"

export default function InvoiceGenerator({ saleData, customerData, shopData, fabrics, onClose }) {
  const invoiceRef = useRef()

  const generateInvoiceNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `FSS-${year}${month}${day}-${random}`
  }

  const invoiceNumber = generateInvoiceNumber()

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getItemDetails = () => {
    return saleData.items.map((item) => {
      const fabric = fabrics.find((f) => f.$id === item.fabricId)
      return {
        ...item,
        fabricName: fabric?.name || "অজানা ফ্যাব্রিক",
        fabricCode: fabric?.code || "N/A",
        total: item.quantity * item.sale_price,
      }
    })
  }

  const itemDetails = getItemDetails()

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    const printContent = invoiceRef.current.innerHTML

    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${invoiceNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .print-header { text-align: center; margin-bottom: 20px; }
                    .print-content { max-width: 80mm; margin: 0 auto; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                    .total-row { font-weight: bold; border-top: 2px solid #000; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="print-content">
                    ${printContent}
                </div>
            </body>
            </html>
        `)

    printWindow.document.close()
    printWindow.print()
    printWindow.close()

    toast.success("প্রিন্ট কমান্ড পাঠানো হয়েছে")
  }

  const handleDownload = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      })

      const link = document.createElement("a")
      link.download = `invoice-${invoiceNumber}.png`
      link.href = canvas.toDataURL("image/png", 1.0)
      link.click()

      toast.success("রসিদ ডাউনলোড সম্পন্ন হয়েছে")
    } catch (error) {
      console.error("Download error:", error)
      handlePrint()
      toast.error("ডাউনলোড করতে সমস্যা হয়েছে, প্রিন্ট করুন")
    }
  }

  const handleWhatsAppShare = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      })

      // Convert to blob
      canvas.toBlob(
        async (blob) => {
          if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({ files: [new File([blob], `invoice-${invoiceNumber}.png`, { type: "image/png" })] })
          ) {
            try {
              await navigator.share({
                title: `রসিদ - ${invoiceNumber}`,
                text: `গ্রাহক: ${customerData?.name || "ওয়াক-ইন কাস্টমার"}\nমোট: ৳${saleData.total_amount.toFixed(2)}`,
                files: [new File([blob], `invoice-${invoiceNumber}.png`, { type: "image/png" })],
              })
              toast.success("রসিদ শেয়ার করা হয়েছে")
            } catch (error) {
              console.error("Share error:", error)
              fallbackWhatsAppShare()
            }
          } else {
            fallbackWhatsAppShare()
          }
        },
        "image/png",
        1.0,
      )
    } catch (error) {
      console.error("WhatsApp share error:", error)
      fallbackWhatsAppShare()
    }
  }

  const fallbackWhatsAppShare = () => {
    const message =
      `🧾 *রসিদ - ${invoiceNumber}*\n\n` +
      `🏪 *দোকান:* ${shopData?.name || "ফ্যাব্রিক শপ"}\n` +
      `👤 *গ্রাহক:* ${customerData?.name || "ওয়াক-ইন কাস্টমার"}\n` +
      `📅 *তারিখ:* ${formatDate(saleData.sale_date)}\n\n` +
      `💰 *মোট Amount:* ৳${saleData.total_amount.toFixed(2)}\n` +
      `💳 *পরিশোধিত:* ৳${(saleData.payment_amount || 0).toFixed(2)}\n` +
      `📱 *পেমেন্ট:* ${saleData.payment_method === "cash" ? "নগদ" : saleData.payment_method === "card" ? "কার্ড" : "অনলাইন"}\n\n` +
      `✨ *ধন্যবাদ আপনার ক্রয়ের জন্য!*`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
    toast.success("WhatsApp এ শেয়ার করার জন্য প্রস্তুত")
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:bg-white print:p-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden print:shadow-none print:max-h-none print:max-w-none print:rounded-none">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 print:hidden">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                প্রিমিয়াম রসিদ
              </h2>
              <p className="text-sm text-muted-foreground">পেশাদার ফ্যাব্রিক বিক্রয়ের রসিদ</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handlePrint}
              size="sm"
              className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Printer className="h-4 w-4" />
              POS প্রিন্ট
            </Button>
            <Button onClick={handleDownload} size="sm" variant="outline" className="gap-2 border-2 bg-transparent">
              <Download className="h-4 w-4" />
              ডাউনলোড
            </Button>
            <Button
              onClick={handleWhatsAppShare}
              size="sm"
              className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Send className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button onClick={onClose} size="sm" variant="ghost" className="hover:bg-red-50 hover:text-red-600">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)] print:max-h-none">
          <div
            ref={invoiceRef}
            className="bg-white p-8 border-2 border-slate-200 rounded-2xl print:border-0 print:rounded-none"
          >
            <div className="text-center mb-10 pb-8 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {shopData?.name || "প্রিমিয়াম ফ্যাব্রিক শপ"}
                </h1>
              </div>
              <p className="text-lg text-slate-600 mb-2">{shopData?.address || "ঠিকানা"}</p>
              <p className="text-slate-600 mb-4">ফোন: {shopData?.contact || "ফোন নম্বর"}</p>
              <div className="flex items-center justify-center gap-4">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm">
                  <Shield className="h-4 w-4 mr-1" />
                  অফিসিয়াল রসিদ
                </Badge>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm">
                  <Zap className="h-4 w-4 mr-1" />
                  ডিজিটাল
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Receipt className="h-6 w-6 text-blue-600" />
                    <h3 className="font-bold text-xl text-blue-900">রসিদ তথ্য</h3>
                  </div>
                  <div className="space-y-3 text-base">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">রসিদ নং:</span>
                      <span className="font-mono font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {invoiceNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">তারিখ:</span>
                      <span className="font-medium">{formatDate(saleData.sale_date)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">পেমেন্ট:</span>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">
                        {saleData.payment_method === "cash"
                          ? "💵 নগদ"
                          : saleData.payment_method === "card"
                            ? "💳 কার্ড"
                            : "📱 অনলাইন"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="h-6 w-6 text-green-600" />
                    <h3 className="font-bold text-xl text-green-900">গ্রাহক তথ্য</h3>
                  </div>
                  {customerData ? (
                    <div className="space-y-3 text-base">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">নাম:</span>
                        <span className="font-semibold text-lg">{customerData.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">ফোন:</span>
                        <span className="font-medium">{customerData.phone}</span>
                      </div>
                      {customerData.address && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">ঠিকানা:</span>
                          <span className="text-right font-medium">{customerData.address}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
                        <User className="h-4 w-4" />
                        ওয়াক-ইন কাস্টমার
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-2xl mb-6 flex items-center gap-3">
                <Package className="h-6 w-6 text-purple-600" />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  বিক্রয়কৃত আইটেম
                </span>
              </h3>
              <div className="border-2 border-slate-200 rounded-xl overflow-hidden shadow-lg">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <tr>
                      <th className="p-4 text-left font-bold text-slate-700 border-b">ক্রম</th>
                      <th className="p-4 text-left font-bold text-slate-700 border-b">ফ্যাব্রিক নাম</th>
                      <th className="p-4 text-left font-bold text-slate-700 border-b">কোড</th>
                      <th className="p-4 text-left font-bold text-slate-700 border-b">পরিমাণ</th>
                      <th className="p-4 text-left font-bold text-slate-700 border-b">দাম/মিটার</th>
                      <th className="p-4 text-left font-bold text-slate-700 border-b">মোট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemDetails.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium">{index + 1}</td>
                        <td className="p-4 font-semibold text-slate-800">{item.fabricName}</td>
                        <td className="p-4 text-slate-600 font-mono">{item.fabricCode}</td>
                        <td className="p-4 font-medium">{item.quantity} মিটার</td>
                        <td className="p-4 font-medium">৳{item.sale_price.toFixed(2)}</td>
                        <td className="p-4 font-bold text-green-600 text-lg">৳{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 shadow-xl">
              <CardContent className="p-8">
                <h3 className="font-bold text-2xl mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  বিক্রয় সারাংশ
                </h3>
                <div className="space-y-4 text-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">সাবটোটাল:</span>
                    <span className="font-semibold">
                      ৳{(saleData.total_amount + (saleData.discount_amount || 0)).toFixed(2)}
                    </span>
                  </div>
                  {(saleData.discount_amount || 0) > 0 && (
                    <div className="flex justify-between items-center text-red-600">
                      <span className="font-medium">ডিসকাউন্ট:</span>
                      <span className="font-semibold">-৳{(saleData.discount_amount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    <span>মোট Amount:</span>
                    <span>৳{saleData.total_amount.toFixed(2)}</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium">পরিশোধিত:</span>
                    <span className="font-semibold text-green-600">৳{(saleData.payment_amount || 0).toFixed(2)}</span>
                  </div>
                  {saleData.total_amount - (saleData.payment_amount || 0) > 0 && (
                    <div className="flex justify-between items-center font-bold text-xl text-orange-600">
                      <span>বাকি:</span>
                      <span>৳{(saleData.total_amount - (saleData.payment_amount || 0)).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-10 pt-8 border-t-2 border-gradient-to-r from-blue-200 to-purple-200">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-2xl">
                  <span>🙏</span>
                  <p className="font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ক্রয়ের জন্য আপনাকে ধন্যবাদ!
                  </p>
                  <span>🙏</span>
                </div>
                <p className="text-sm text-slate-500">
                  এই রসিদটি স্বয়ংক্রিয়ভাবে তৈরি হয়েছে - {formatDate(new Date().toISOString())}
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    সুরক্ষিত
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    দ্রুত
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    প্রিমিয়াম
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
