"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { TailoringItemsForm } from "@/components/tailoring-items-form"
import { useTailoringItems } from "@/services/tailoring-service"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import PageContainer from "@/components/layout/page-container"
import { AlertCircle } from "lucide-react"

export default function EditTailoringItemPage() {
    const params = useParams()
    const router = useRouter()
    const { data: tailoringItems, isLoading } = useTailoringItems()
    const [item, setItem] = useState(null)

    useEffect(() => {
        if (tailoringItems && params.id) {
            const foundItem = tailoringItems.find((i) => i.$id === params.id)
            if (foundItem) {
                setItem(foundItem)
            } else {
                // Item not found, redirect to main page
                router.push("/dashboard/settings/tailoring-items")
            }
        }
    }, [tailoringItems, params.id, router])

    if (isLoading) {
        return (
            <PageContainer>
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                            <div className="space-y-3">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </PageContainer>
        )
    }

    if (!item) {
        return (
            <PageContainer>
                <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 dark:text-red-400">
                            টেইলারিং আইটেম খুঁজে পাওয়া যায়নি
                        </p>
                    </CardContent>
                </Card>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <TailoringItemsForm mode="edit" initialData={item} itemId={params.id} />
        </PageContainer>
    )
}