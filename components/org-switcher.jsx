"use client";

import { Check, ChevronsUpDown, GalleryVerticalEnd, Building2, AlertCircle } from "lucide-react";
import * as React from "react";
import { useShops } from "@/services/shop-service";
import { useAuthStore } from "@/store/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function OrgSwitcher() {
  const { data: allShops, isLoading, error } = useShops();

  const {
    selectedShopId,
    viewMode,
    userShops,
    userProfile,
    setSelectedShopId,
    setViewMode,
    canViewAllShops,
    canSwitchShops,
    getAccessibleShops,
    isViewingAllShops
  } = useAuthStore();

  // Check if viewing all shops
  const isViewingAll = isViewingAllShops();

  // Get accessible shops based on user permissions  
  const accessibleShops = React.useMemo(() => {
    if (!allShops || !userProfile) {
      console.log('🏪 No shops or profile available');
      return [];
    }

    const accessible = getAccessibleShops(allShops);
    console.log('🏪 Accessible shops:', accessible.length);
    return accessible;
  }, [allShops, userProfile, getAccessibleShops]);

  const selectedShop = accessibleShops.find(shop => shop.$id === selectedShopId);

  // Get user's role for the selected shop
  const currentUserRole = React.useMemo(() => {
    if (isViewingAll) return userProfile?.role;

    if (!selectedShopId || !userShops.length) return userProfile?.role;

    const userShop = userShops.find(us => {
      const shopId = typeof us.shopId === "string"
        ? us.shopId
        : us.shopId?.$id || us.shopId?.[0]?.$id;
      return shopId === selectedShopId;
    });

    return userShop?.role || userProfile?.role;
  }, [selectedShopId, userShops, userProfile, isViewingAll]);

  const handleViewAllShops = () => {
    console.log('🌍 Switching to all shops view');
    if (canViewAllShops()) {
      setViewMode('all-shops');
      setSelectedShopId(null);
    }
  };

  const handleSelectShop = (shopId) => {
    console.log('🏪 Selecting shop:', shopId);
    if (canSwitchShops() || accessibleShops.some(shop => shop.$id === shopId)) {
      setViewMode('single-shop');
      setSelectedShopId(shopId);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-gray-300 animate-pulse flex aspect-square size-8 items-center justify-center rounded-lg">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">লোড হচ্ছে...</span>
              <span className="text-xs">অপেক্ষা করুন</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Error state
  if (error) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled className="text-red-600">
            <div className="bg-red-500 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
              <AlertCircle className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">ত্রুটি</span>
              <span className="text-xs">লোড হয়নি</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // No accessible shops and not superAdmin
  if (!accessibleShops?.length && !canViewAllShops()) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled className="text-amber-600">
            <div className="bg-amber-500 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
              <Building2 className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">দোকানের অ্যাক্সেস নেই</span>
              <span className="text-xs">অ্যাডমিনের সাথে যোগাযোগ করুন</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Main component
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
            >
              <div className={`flex aspect-square size-8 items-center justify-center rounded-lg text-white shadow-sm ${isViewingAll
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gradient-to-r from-green-600 to-blue-600'
                }`}>
                {isViewingAll ?
                  <GalleryVerticalEnd className="size-4" /> :
                  <Building2 className="size-4" />
                }
              </div>
              <div className="flex flex-col gap-0.5 leading-none text-left">
                <span className="font-semibold truncate">আব্দুর রহিম টেইলার্স</span>
                <span className="text-xs text-sidebar-foreground/70 truncate">
                  {isViewingAll
                    ? `সব দোকান (${accessibleShops.length})`
                    : selectedShop?.name || 'দোকান নির্বাচন করুন'
                  }
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              দোকান নির্বাচন
            </DropdownMenuLabel>

            {/* Show "All Shops" option only for superAdmin */}
            {canViewAllShops() && (
              <>
                <DropdownMenuItem
                  onSelect={handleViewAllShops}
                  className="flex items-center gap-2 py-2"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <GalleryVerticalEnd className="size-4 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="font-medium">সব দোকানের ওভারভিউ</span>
                      <span className="text-xs text-muted-foreground">
                        সব দোকানের ডেটা দেখুন
                      </span>
                    </div>
                  </div>
                  {isViewingAll && <Check className="size-4 text-green-600" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {/* List accessible shops */}
            {accessibleShops.map((shop) => {
              const userShop = userShops.find(us => {
                const shopId = typeof us.shopId === "string"
                  ? us.shopId
                  : us.shopId?.$id || us.shopId?.[0]?.$id;
                return shopId === shop.$id;
              });
              const isSelected = shop.$id === selectedShopId && !isViewingAll;

              return (
                <DropdownMenuItem
                  key={shop.$id}
                  onSelect={() => handleSelectShop(shop.$id)}
                  className="flex items-center gap-2 py-2"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Building2 className="size-4 text-green-600" />
                    <div className="flex flex-col">
                      <span className="font-medium">{shop.name}</span>
                      {userShop && (
                        <span className="text-xs text-muted-foreground">
                          ভূমিকা: {userShop.role}
                        </span>
                      )}
                      {shop.address && (
                        <span className="text-xs text-muted-foreground truncate">
                          {shop.address}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="size-4 text-green-600" />}
                </DropdownMenuItem>
              );
            })}

            {/* Show user's current role info */}
            {currentUserRole && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <span className="text-xs text-muted-foreground">
                    বর্তমান ভূমিকা: <span className="font-medium">{currentUserRole}</span>
                  </span>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}