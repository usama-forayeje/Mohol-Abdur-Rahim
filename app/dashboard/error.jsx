"use client";

import PageContainer from "@/components/layout/page-container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function OverviewError({ error }) {
  return (
    <PageContainer >
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load statistics: {error.message}
        </AlertDescription>
      </Alert>
    </PageContainer>

  );
}
