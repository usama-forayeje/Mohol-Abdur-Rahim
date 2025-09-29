"use client"

import { EnhancedFabricSalesForm } from "@/components/fabric-sales-form"
import PageContainer from "@/components/layout/page-container"

export default function SellFabricPage() {
    return (
        <PageContainer>
            <EnhancedFabricSalesForm mode="page" />
        </PageContainer>
    )
}