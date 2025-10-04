"use client"

import { TailoringItemsForm } from "@/components/tailoring-items-form"
import PageContainer from "@/components/layout/page-container"

export default function NewTailoringItemPage() {
    return (
        <PageContainer>
            <TailoringItemsForm mode="page" />
        </PageContainer>
    )
}