"use client";

import { useShop } from "@/contexts/ShopContext";
import { useAuthStore } from "@/store/auth-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

export function ShopSelector() {
  const { currentShop, availableShops, switchShop, canSwitchShops } = useShop();
  const { isAdmin } = useAuthStore();

  // Don't render if not admin or no shops to switch
  if (!isAdmin() || !canSwitchShops || availableShops.length <= 1) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Building2 className="w-4 h-4" />
        <span>{currentShop?.name || "কোন দোকান নির্বাচিত নেই"}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Building2 className="w-4 h-4 text-gray-600" />
      <Select value={currentShop?.$id || ""} onValueChange={switchShop}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="দোকান নির্বাচন করুন" />
        </SelectTrigger>
        <SelectContent>
          {availableShops.map((shop) => (
            <SelectItem key={shop.$id} value={shop.$id}>
              {String(shop.name)} {/* Convert to string explicitly */}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
