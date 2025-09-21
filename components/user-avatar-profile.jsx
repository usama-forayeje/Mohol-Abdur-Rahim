'use client';
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function UserAvatarProfile({
  user,
  className,
  showInfo = false,
  size = "default"
}) {
  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    default: "h-8 w-8 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg"
  };

  return (
    <div className="flex items-center gap-2">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage
          src={user.avatar}
          alt={user.name || user.email}
          className="object-cover"
        />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {getInitials(user.name || user.email)}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className="flex flex-col">
          <span className="font-medium text-sm truncate">
            {user.name || "নাম নেই"}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {user.email}
          </span>
        </div>
      )}
    </div>
  );
}