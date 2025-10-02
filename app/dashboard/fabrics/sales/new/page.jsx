"use client"

import { FabricSalesForm } from "@/components/fabric-sales-form"
import PageContainer from "@/components/layout/page-container"

export default function SellFabricPage() {
    return (
        <PageContainer>
            <FabricSalesForm mode="page" />
        </PageContainer>
    )
}