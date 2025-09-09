// components/layout/DashboardHeader.jsx
"use client";

import { useAuthStore } from "@/store/auth-store";
import { useShop } from "@/contexts/ShopContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShopSelector } from "@/components/ShopSelector";
import { User, LogOut, Settings } from "lucide-react";

export function DashboardHeader() {
  const { userProfile, logout } = useAuthStore();
  const { currentShop } = useShop();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">TM</span>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">
                টেইলারিং ম্যানেজমেন্ট
              </h1>
              {currentShop && (
                <p className="text-sm text-gray-600">{currentShop.name}</p>
              )}
            </div>
          </div>

          {/* Shop Selector and User Menu */}
          <div className="flex items-center space-x-4">
            <ShopSelector />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  {userProfile?.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt="Profile"
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{userProfile?.name}</p>
                  <p className="text-xs text-gray-500">{userProfile?.email}</p>
                </div>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  সেটিংস
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  লগআউট
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
