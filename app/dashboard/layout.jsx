import AppSidebar from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Providers } from "@/providers/provider";
import { cookies } from "next/headers";
import { authService } from "@/services/auth-service";
import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // Get initial auth data for server-side rendering (without redirect)
  let initialAuthData = null;

  try {
    // Try to get current user but don't redirect if not authenticated
    // Let the client-side handle the authentication check
    const currentUser = await authService.getCurrentUser();
    if (currentUser) {
      try {
        const completeUser = await authService.getCompleteUserProfile();
        initialAuthData = {
          user: currentUser,
          userProfile: completeUser.profile,
          userShops: completeUser.userShops || [],
          isAuthenticated: true,
        };
      } catch (profileError) {
        console.error("Error getting user profile on server:", profileError);
        initialAuthData = {
          user: currentUser,
          userProfile: null,
          userShops: [],
          isAuthenticated: true,
        };
      }
    }
  } catch (error) {
    console.error("Server-side auth error:", error);
    // Don't redirect on server-side errors, let client handle it
    initialAuthData = null;
  }

  return (
    <Providers initialAuthData={initialAuthData}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <DashboardAuthGuard>
            {children}
          </DashboardAuthGuard>
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  );
}
