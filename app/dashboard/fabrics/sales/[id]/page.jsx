"use client"

import { useRouter, useParams } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useFabricSale } from "@/services/fabric-sales-service"
import PageContainer from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {  AlertCircle, Loader2 } from "lucide-react"
import { FabricSalesForm } from "@/components/fabric-sales-form"

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
                {/* Main Content */}
                <div className="container mx-auto px-4 py-6">
                    <FabricSalesForm
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