"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ActiveThemeProvider } from "@/components/active-theme";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/providers/auth-provider";

// Simple QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export function Providers({ activeThemeValue, children, initialAuthData }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialAuthData={initialAuthData}>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <ActiveThemeProvider
            disableTransitionOnChange
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            {children}
          </ActiveThemeProvider>
        </NextThemesProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
