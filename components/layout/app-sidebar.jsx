"use client"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "@/components/ui/sidebar"
import { UserAvatarProfile } from "@/components/user-avatar-profile"
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
  Building2,
  FileText,
  Clock,
  CheckCircle,
  PlusCircle,
  List,
  DollarSign,
  XCircle,
  Star,
  Bell,
  UserCircle2,
  ChevronsDown,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { OrgSwitcher } from "@/components/org-switcher"
import { useMemo } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useShops } from "@/services/shop-service"

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { userProfile, logout, getUserRole, isViewingAllShops, hasPermission } = useAuthStore()
  const { data: availableShops } = useShops()
  const currentRole = getUserRole()


  const getNavigationItems = (userRole) => {
    const baseItems = [
      {
        title: "ড্যাশবোর্ড",
        icon: Home,
        url: "/dashboard",
        roles: ["superAdmin", "admin", "manager", "tailor", "salesman", "embroideryMan", "stoneMan"],
        permission: null, // No specific permission needed for dashboard
      },
    ]

    const managementItems = [
      {
        title: "গ্রাহক ব্যবস্থাপনা",
        icon: Users,
        url: "/dashboard/customers",
        roles: ["superAdmin", "admin", "manager", "salesman"],
        permission: "VIEW_CUSTOMERS",
      },
      {
        title: "অর্ডার ব্যবস্থাপনা",
        icon: ShoppingBag,
        roles: ["superAdmin", "admin", "manager"],
        permission: "VIEW_ALL_ORDERS",
        items: [
          {
            title: "নতুন অর্ডার",
            icon: PlusCircle,
            url: "/dashboard/orders/new",
            roles: ["superAdmin", "admin", "manager", "salesman"],
            permission: "CREATE_ORDERS",
          },
          {
            title: "সব অর্ডার",
            icon: List,
            url: "/dashboard/orders",
            roles: ["superAdmin", "admin", "manager"],
            permission: "VIEW_ALL_ORDERS",
          },
          {
            title: "অপেক্ষমান",
            icon: Clock,
            url: "/dashboard/orders/pending",
            roles: ["superAdmin", "admin", "manager"],
            permission: "VIEW_ALL_ORDERS",
          },
          {
            title: "সম্পূর্ণ",
            icon: CheckCircle,
            url: "/dashboard/orders/completed",
            roles: ["superAdmin", "admin", "manager"],
            permission: "VIEW_ALL_ORDERS",
          },
        ],
      },
      {
        title: "কাপড় ব্যবস্থাপনা",
        icon: Package,
        roles: ["superAdmin", "admin", "manager"],
        permission: "MANAGE_FABRICS",
        items: [
          {
            title: "কাপড় বিক্রি",
            icon: Package,
            url: "/dashboard/fabrics/sales",
            roles: ["superAdmin", "admin", "manager", "salesman"],
            permission: "SELL_FABRICS",
          },
          {
            title: "কাপড়ের রিপোর্ট",
            icon: FileText,
            url: "/dashboard/fabrics/report",
            roles: ["superAdmin", "admin", "manager"],
            permission: "VIEW_REPORTS",
          },
        ],
      },
      {
        title: "ইনভেন্টরি",
        icon: Package,
        roles: ["superAdmin", "admin", "manager"],
        permission: "MANAGE_FABRICS",
        items: [
          {
            title: "কাপড় স্টক",
            icon: Package,
            url: "/dashboard/inventory/fabrics",
            roles: ["superAdmin", "admin", "manager"],
            permission: "MANAGE_FABRICS",
          },
          {
            title: "ক্রয়ের রশীদ",
            icon: FileText,
            url: "/dashboard/inventory/purchase-invoice",
            roles: ["superAdmin", "admin", "manager"],
            permission: "MANAGE_FABRICS",
          },
        ],
      },
      {
        title: "ক্যাটালগ",
        icon: Star,
        url: "/dashboard/catalog",
        roles: ["superAdmin", "admin", "manager", "tailor", "salesman", "embroideryMan", "stoneMan"],
        permission: null,
      },
      {
        title: "আর্থিক ব্যবস্থাপনা",
        icon: CreditCard,
        roles: ["superAdmin", "admin", "manager"],
        permission: "VIEW_FINANCE",
        items: [
          {
            title: "লেনদেন",
            icon: List,
            url: "/dashboard/finance/transactions",
            roles: ["superAdmin", "admin", "manager"],
            permission: "VIEW_FINANCE",
          },
          {
            title: "পেমেন্ট",
            icon: CreditCard,
            url: "/dashboard/finance/payments",
            roles: ["superAdmin", "admin", "manager"],
            permission: "VIEW_FINANCE",
          },
          {
            title: "বেতন",
            icon: DollarSign,
            url: "/dashboard/finance/salaries",
            roles: ["superAdmin", "admin", "manager"],
            permission: "VIEW_FINANCE",
          },
          {
            title: "খরচ",
            icon: XCircle,
            url: "/dashboard/finance/expenses",
            roles: ["superAdmin", "admin", "manager"],
            permission: "VIEW_FINANCE",
          },
        ],
      },
      {
        title: "রিপোর্ট",
        icon: BarChart3,
        url: "/dashboard/reports",
        roles: ["superAdmin", "admin", "manager"],
        permission: "VIEW_REPORTS",
      },
    ]

    const workerItems = [
      {
        title: "আমার কাজ",
        icon: Scissors,
        roles: ["tailor", "embroideryMan", "stoneMan"],
        permission: "VIEW_OWN_ORDERS",
        items: [
          {
            title: "আমার অর্ডার",
            icon: List,
            url: "/dashboard/my-orders",
            roles: ["tailor", "embroideryMan", "stoneMan"],
            permission: "VIEW_OWN_ORDERS",
          },
          {
            title: "কাজের লগ",
            icon: FileText,
            url: "/dashboard/work-log",
            roles: ["tailor", "embroideryMan", "stoneMan"],
            permission: "VIEW_OWN_ORDERS",
          },
        ],
      },
      {
        title: "ব্যক্তিগত হিসাব",
        icon: User,
        url: "/dashboard/personal-accounts",
        roles: ["tailor", "embroideryMan", "stoneMan"],
        permission: "VIEW_OWN_ORDERS",
      },
    ]

    const tailorItems = [
      {
        title: "কাটিং কাজ",
        icon: Scissors,
        url: "/dashboard/cutting",
        roles: ["tailor"],
        permission: "VIEW_OWN_ORDERS",
      },
      {
        title: "সেলাই কাজ",
        icon: Scissors,
        url: "/dashboard/sewing",
        roles: ["tailor"],
        permission: "VIEW_OWN_ORDERS",
      },
    ]

    const embroideryItems = [
      {
        title: "এমব্রয়ডারি কাজ",
        icon: Palette,
        url: "/dashboard/embroidery",
        roles: ["embroideryMan"],
        permission: "VIEW_OWN_ORDERS",
      },
    ]

    const stoneWorkItems = [
      {
        title: "স্টোন ওয়ার্ক",
        icon: Star,
        url: "/dashboard/stone-work",
        roles: ["stoneMan"],
        permission: "VIEW_OWN_ORDERS",
      },
    ]

    const salesmanItems = [
      {
        title: "কাস্টমার",
        icon: Users,
        url: "/dashboard/customers",
        roles: ["salesman"],
        permission: "VIEW_CUSTOMERS",
      },
      {
        title: "অর্ডার তৈরি",
        icon: PlusCircle,
        url: "/dashboard/orders/new",
        roles: ["salesman"],
        permission: "CREATE_ORDERS",
      },
      {
        title: "কাপড় বিক্রয়",
        icon: Package,
        url: "/dashboard/fabric-sales",
        roles: ["salesman"],
        permission: "SELL_FABRICS",
      },
    ]

    const adminItems = [
      {
        title: "ব্যবহারকারী",
        icon: Users,
        url: "/dashboard/users",
        roles: ["superAdmin", "admin"],
        permission: "MANAGE_USERS",
      },
      {
        title: "দোকান ব্যবস্থাপনা",
        icon: Building2,
        url: "/dashboard/shop",
        roles: ["superAdmin"],
        permission: "MANAGE_SHOPS",
      },
      {
        title: "সিস্টেম সেটিংস",
        icon: Settings,
        url: "/dashboard/settings",
        roles: ["superAdmin"],
        permission: "MANAGE_SHOPS",
      },
    ]

    const navigation = [...baseItems]

    // Add items based on user role
    if (["superAdmin", "admin", "manager"].includes(userRole)) {
      navigation.push(...managementItems)
    }

    if (["tailor", "embroideryMan", "stoneMan"].includes(userRole)) {
      navigation.push(...workerItems)
    }

    if (userRole === "tailor") {
      navigation.push(...tailorItems)
    } else if (userRole === "embroideryMan") {
      navigation.push(...embroideryItems)
    } else if (userRole === "stoneMan") {
      navigation.push(...stoneWorkItems)
    } else if (userRole === "salesman") {
      navigation.push(...salesmanItems)
    }

    if (["superAdmin", "admin"].includes(userRole)) {
      navigation.push(...adminItems)
    }

    return navigation
  }

  // Enhanced access check with permission system
  const hasItemAccess = (item, userRole) => {
    if (!userRole) return false

    // Check role-based access first
    const roleAccess = !item.roles || item.roles.includes(userRole)

    // Check permission if specified
    const permissionAccess = !item.permission || hasPermission(item.permission)

    const hasAccess = roleAccess && permissionAccess

    console.log('🔍 Item access check:', {
      item: item.title,
      userRole,
      roleAccess,
      permissionAccess,
      hasAccess
    });

    return hasAccess
  }

  const navigation = useMemo(() => getNavigationItems(currentRole), [currentRole])

  const isItemActive = (item) => {
    if (item.url) return pathname === item.url
    if (item.items) {
      return item.items.some((subItem) => pathname === subItem.url)
    }
    return false
  }

  // Filter navigation based on user role and permissions
  const filteredNavigation = navigation.filter((item) => hasItemAccess(item, currentRole))

  const handleLogout = async () => {
    await logout()
    router.push("/sign-in")
  }

  console.log('📋 Navigation items:', {
    total: navigation.length,
    filtered: filteredNavigation.length,
    currentRole
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <OrgSwitcher />
        {isViewingAllShops && isViewingAllShops() && (
          <div className="px-2 mx-4 mt-2 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs rounded border border-amber-500/30 text-center">
            <span>গ্লোবাল ভিউ</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>মূল মেনু</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              const hasSubItems = item.items && item.items.length > 0
              const isActive = isItemActive(item)

              if (hasSubItems) {
                // Filter sub-items by role and permissions
                const visibleSubItems = item.items.filter((subItem) => hasItemAccess(subItem, currentRole))
                if (visibleSubItems.length === 0) return null

                return (
                  <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                          <Icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {visibleSubItems.map((subItem) => {
                            const SubIcon = subItem.icon
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                  <Link href={subItem.url}>
                                    {SubIcon && <SubIcon className="w-4 h-4" />}
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>

          {/* Show message if no items visible */}
          {filteredNavigation.length === 0 && (
            <div className="px-4 py-2 text-sm text-muted-foreground text-center">
              <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>কোন মেনু আইটেম উপলব্ধ নেই</p>
              <p className="text-xs">আপনার ভূমিকা: {currentRole}</p>
            </div>
          )}
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
                  {userProfile && <UserAvatarProfile className="h-8 w-8 rounded-lg" showInfo user={userProfile} />}
                  <ChevronsDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="px-1 py-1.5">
                    {userProfile && <UserAvatarProfile className="h-8 w-8 rounded-lg" showInfo user={userProfile} />}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                    <UserCircle2 className="mr-2 h-4 w-4" />
                    প্রোফাইল
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCardIcon className="mr-2 h-4 w-4" />
                    বিলিং
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    নোটিফিকেশন
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  লগ আউট
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}