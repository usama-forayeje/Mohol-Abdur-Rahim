import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatarProfile({ className, showInfo = false, user }) {
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "CN";

  return (
    <div className="flex items-center gap-2">
      <Avatar className={className}>
        <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{user?.name || ""}</span>
          <span className="truncate text-xs">
            {user?.emailAddresses?.[0]?.emailAddress || user?.email || ""}
          </span>
        </div>
      )}
    </div>
  );
}
