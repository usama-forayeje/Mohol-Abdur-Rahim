"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./authProvider";
import { ShopProvider } from "@/contexts/ShopContext";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ActiveThemeProvider } from "@/components/active-theme";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Simple QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export function Providers({ activeThemeValue, children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <ActiveThemeProvider
          disableTransitionOnChange
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <AuthProvider>
            <ShopProvider>{children}</ShopProvider>
          </AuthProvider>
        </ActiveThemeProvider>
      </NextThemesProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
