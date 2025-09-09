"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserAvatarProfile } from "@/components/user-avatar-profile";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  ChevronRight,
  Home,
  Users,
  ShoppingBag,
  Package,
  Scissors,
  Palette,
  CreditCard,
  BarChart3,
  Settings,
  User,
  LogOut,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  PlusCircle,
  List,
  DollarSign,
  XCircle,
  Briefcase,
  Star,
  Bell,
  UserCircle2,
  ChevronsDown,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { useAuthStore } from "@/store/auth-store";
import { useShop } from "@/contexts/ShopContext";
import { roleHelpers, PERMISSIONS, ROLES } from "@/lib/roles";
import { OrgSwitcher } from "../org-switcher";
import { useMemo } from "react";

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, logout } = useAuthStore();
  const { currentShop, availableShops, switchShop } = useShop();
  const { isOpen } = useMediaQuery();

  const getNavigationItems = (userRole) => {
    const baseItems = [
      {
        title: "ড্যাশবোর্ড",
        icon: Home,
        url: "/dashboard",
        permissions: [PERMISSIONS.VIEW_DASHBOARD],
      },
    ];

    const managementItems = [
      {
        title: "গ্রাহক ব্যবস্থাপনা",
        icon: Users,
        url: "/dashboard/customers",
        permissions: [PERMISSIONS.VIEW_CUSTOMERS],
      },
      {
        title: "অর্ডার ব্যবস্থাপনা",
        icon: ShoppingBag,
        permissions: [PERMISSIONS.VIEW_ALL_ORDERS],
        items: [
          {
            title: "নতুন অর্ডার",
            icon: PlusCircle,
            url: "/dashboard/orders/new",
            permissions: [PERMISSIONS.CREATE_ORDERS],
          },
          {
            title: "সব অর্ডার",
            icon: List,
            url: "/dashboard/orders",
            permissions: [PERMISSIONS.VIEW_ALL_ORDERS],
          },
          {
            title: "অপেক্ষমান",
            icon: Clock,
            url: "/dashboard/orders/pending",
            permissions: [PERMISSIONS.VIEW_ALL_ORDERS],
          },
          {
            title: "সম্পূর্ণ",
            icon: CheckCircle,
            url: "/dashboard/orders/completed",
            permissions: [PERMISSIONS.VIEW_ALL_ORDERS],
          },
        ],
      },
      {
        title: "ইনভেন্টরি",
        icon: Package,
        permissions: [PERMISSIONS.VIEW_INVENTORY],
        items: [
          {
            title: "কাপড় ব্যবস্থাপনা",
            icon: Package,
            url: "/dashboard/inventory/fabrics",
            permissions: [PERMISSIONS.MANAGE_FABRICS],
          },
          {
            title: "কাপড় বিক্রয়",
            icon: DollarSign,
            url: "/dashboard/inventory/sales",
            permissions: [PERMISSIONS.MANAGE_FABRIC_SALES],
          },
          {
            title: "কাঁচামাল",
            icon: Briefcase,
            url: "/dashboard/inventory/materials",
            permissions: [PERMISSIONS.MANAGE_RAW_MATERIALS],
          },
        ],
      },
      {
        title: "ক্যাটালগ",
        icon: Star,
        url: "/dashboard/catalog",
        permissions: [PERMISSIONS.VIEW_CATALOG],
      },
      {
        title: "আর্থিক ব্যবস্থাপনা",
        icon: CreditCard,
        permissions: [PERMISSIONS.VIEW_TRANSACTIONS],
        items: [
          {
            title: "লেনদেন",
            icon: List,
            url: "/dashboard/finance/transactions",
            permissions: [PERMISSIONS.VIEW_TRANSACTIONS],
          },
          {
            title: "পেমেন্ট",
            icon: CreditCard,
            url: "/dashboard/finance/payments",
            permissions: [PERMISSIONS.MANAGE_PAYMENTS],
          },
          {
            title: "বেতন",
            icon: DollarSign,
            url: "/dashboard/finance/salaries",
            permissions: [PERMISSIONS.MANAGE_SALARIES],
          },
          {
            title: "খরচ",
            icon: XCircle,
            url: "/dashboard/finance/expenses",
            permissions: [PERMISSIONS.MANAGE_EXPENSES],
          },
        ],
      },
      {
        title: "রিপোর্ট",
        icon: BarChart3,
        url: "/dashboard/reports",
        permissions: [PERMISSIONS.VIEW_REPORTS],
      },
    ];

    const workerItems = [
      {
        title: "আমার কাজ",
        icon: Scissors,
        permissions: [PERMISSIONS.VIEW_OWN_ORDERS],
        items: [
          {
            title: "আমার অর্ডার",
            icon: List,
            url: "/dashboard/my-orders",
            permissions: [PERMISSIONS.VIEW_OWN_ORDERS],
          },
          {
            title: "কাজের লগ",
            icon: FileText,
            url: "/dashboard/work-log",
            permissions: [PERMISSIONS.VIEW_WORK_LOG],
          },
        ],
      },
      {
        title: "ব্যক্তিগত হিসাব",
        icon: User,
        url: "/dashboard/personal-accounts",
        permissions: [PERMISSIONS.MANAGE_PERSONAL_ACCOUNTS],
      },
    ];

    const tailorItems = [
      {
        title: "কাটিং কাজ",
        icon: Scissors,
        url: "/dashboard/cutting",
        permissions: [PERMISSIONS.MANAGE_CUTTING],
      },
      {
        title: "সেলাই কাজ",
        icon: Scissors,
        url: "/dashboard/sewing",
        permissions: [PERMISSIONS.MANAGE_SEWING],
      },
    ];

    const embroideryItems = [
      {
        title: "এমব্রয়ডারি কাজ",
        icon: Palette,
        url: "/dashboard/embroidery",
        permissions: [PERMISSIONS.MANAGE_EMBROIDERY],
      },
    ];

    const stoneWorkItems = [
      {
        title: "স্টোন ওয়ার্ক",
        icon: Star,
        url: "/dashboard/stone-work",
        permissions: [PERMISSIONS.MANAGE_STONE_WORK],
      },
    ];

    const salesmanItems = [
      {
        title: "কাস্টমার",
        icon: Users,
        url: "/dashboard/customers",
        permissions: [PERMISSIONS.VIEW_CUSTOMERS],
      },
      {
        title: "অর্ডার তৈরি",
        icon: PlusCircle,
        url: "/dashboard/orders/new",
        permissions: [PERMISSIONS.CREATE_ORDERS],
      },
      {
        title: "কাপড় বিক্রয়",
        icon: Package,
        url: "/dashboard/fabric-sales",
        permissions: [PERMISSIONS.MANAGE_FABRIC_SALES],
      },
    ];

    const adminItems = [
      {
        title: "ব্যবহারকারী",
        icon: Users,
        url: "/dashboard/users",
        permissions: [PERMISSIONS.MANAGE_USERS],
      },
      {
        title: "দোকান ব্যবস্থাপনা",
        icon: Building2,
        url: "/dashboard/shops",
        permissions: [PERMISSIONS.MANAGE_SHOPS],
      },
      {
        title: "সিস্টেম সেটিংস",
        icon: Settings,
        url: "/dashboard/settings",
        permissions: [PERMISSIONS.MANAGE_SYSTEM],
      },
    ];

    let navigation = [...baseItems];

    if (roleHelpers.isManagement(userRole)) {
      navigation.push(...managementItems);
    }

    if (roleHelpers.isWorker(userRole)) {
      navigation.push(...workerItems);
    }

    if (userRole === ROLES.TAILOR) {
      navigation.push(...tailorItems);
    } else if (userRole === ROLES.EMBROIDERY_MAN) {
      navigation.push(...embroideryItems);
    } else if (userRole === ROLES.STONE_MAN) {
      navigation.push(...stoneWorkItems);
    } else if (userRole === ROLES.SALESMAN) {
      navigation.push(...salesmanItems);
    }

    if (roleHelpers.isAdmin(userRole)) {
      navigation.push(...adminItems);
    }

    return navigation;
  };

  const navigation = useMemo(
    () => getNavigationItems(userProfile?.role),
    [userProfile?.role]
  );

  const hasPermission = (permissions) => {
    return roleHelpers.hasAnyPermission(userProfile?.role, permissions);
  };

  const isItemActive = (item) => {
    if (item.url) return pathname === item.url;
    if (item.items) {
      return item.items.some((subItem) => pathname === subItem.url);
    }
    return false;
  };

  const filteredNavigation = navigation.filter((item) =>
    hasPermission(item.permissions)
  );

  const handleSwitchTenant = (_tenantId) => {
    switchShop(_tenantId);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/sign-in");
  };

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <OrgSwitcher
          tenants={availableShops}
          defaultTenant={currentShop}
          onTenantSwitch={handleSwitchTenant}
        />
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>মূল মেনু</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const hasSubItems = item.items && item.items.length > 0;
              const isActive = isItemActive(item);
              if (hasSubItems) {
                const visibleSubItems = item.items.filter((subItem) =>
                  hasPermission(subItem.permissions)
                );
                if (visibleSubItems.length === 0) return null;
                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isActive}
                        >
                          <Icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {visibleSubItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.url}
                                >
                                  <Link href={subItem.url}>
                                    {SubIcon && <SubIcon className="w-4 h-4" />}
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {userProfile && (
                    <UserAvatarProfile
                      className="h-8 w-8 rounded-lg"
                      showInfo
                      user={userProfile}
                    />
                  )}
                  <ChevronsDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="px-1 py-1.5">
                    {userProfile && (
                      <UserAvatarProfile
                        className="h-8 w-8 rounded-lg"
                        showInfo
                        user={userProfile}
                      />
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/profile")}
                  >
                    <UserCircle2 className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCardIcon className="mr-2 h-4 w-4" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
