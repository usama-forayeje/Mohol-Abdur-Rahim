import AppSidebar from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Providers } from "@/providers/provider";
import { cookies } from "next/headers";

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <Providers>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset className="-mt-5 md:-mt-8">
          <Header />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  );
}
