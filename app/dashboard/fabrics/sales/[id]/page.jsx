"use client"

import { useRouter, useParams } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useFabricSale } from "@/services/fabric-sales-service"
import PageContainer from "@/components/layout/page-container"
import { EnhancedFabricSalesForm } from "@/components/fabric-sales-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Edit, AlertCircle, Loader2 } from "lucide-react"

export default function EditFabricSalePage() {
    const router = useRouter()
    const params = useParams()
    const { selectedShopId } = useAuthStore()
    const saleId = params?.id

    const { data: sale, isLoading, error } = useFabricSale(saleId)

    // Redirect if no sale ID
    if (!saleId) {
        router.push("/dashboard/fabrics/sales")
        return null
    }

    // Loading state
    if (isLoading) {
        return (
            <PageContainer>
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6 text-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                            <p className="text-lg">বিক্রয়ের তথ্য লোড হচ্ছে...</p>
                        </CardContent>
                    </Card>
                </div>
            </PageContainer>
        )
    }

    // Error state
    if (error) {
        return (
            <PageContainer>
                <div className="min-h-screen flex items-center justify-center p-6">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="space-y-3">
                                        <p className="font-semibold">বিক্রয়ের তথ্য লোড করতে সমস্যা হয়েছে</p>
                                        <p className="text-sm">{error.message}</p>
                                        <Button
                                            onClick={() => router.push("/dashboard/fabrics/sales")}
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            ফিরে যান
                                        </Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <div className="min-h-screen">
                {/* Header */}
                <div className="border-b bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-950 dark:to-blue-950">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push("/dashboard/fabrics/sales")}
                                className="text-white hover:bg-white/20"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Edit className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">
                                        বিক্রয় এডিট করুন
                                    </h1>
                                    <p className="text-indigo-100 text-sm mt-1">
                                        বিক্রয়ের তথ্য পরিবর্তন করুন
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-6">
                    <EnhancedFabricSalesForm
                        mode="edit"
                        initialData={sale}
                        saleId={saleId}
                        onSuccess={() => router.push("/dashboard/fabrics/sales")}
                        onCancel={() => router.push("/dashboard/fabrics/sales")}
                    />
                </div>
            </div>
        </PageContainer>
    )
}