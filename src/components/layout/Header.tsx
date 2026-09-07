import { LogOutIcon, MenuIcon, UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Logo } from "@/components/common/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/format";
import { logoutEverywhere } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";

/** Top bar for the (future) authenticated app shell: menu button + user menu. */
export function Header() {
  const navigate = useNavigate();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);

  const displayName = user?.full_name ?? user?.email ?? "Guest";

  const handleLogout = async () => {
    await logoutEverywhere();
    navigate("/");
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/75 sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-4 backdrop-blur lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open menu"
        onClick={toggleSidebar}
      >
        <MenuIcon className="size-5" />
      </Button>

      <div className="lg:hidden">
        <Logo showName={false} />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-1.5 sm:px-2">
              <Avatar className="size-7">
                {user?.profile_image ? (
                  <AvatarImage src={user.profile_image} alt={displayName} />
                ) : null}
                <AvatarFallback className="text-xs">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="flex flex-col">
              <span>{displayName}</span>
              {user?.email ? (
                <span className="text-muted-foreground text-xs font-normal">
                  {user.email}
                </span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Add: Profile, Settings… */}
            <DropdownMenuItem disabled>
              <UserIcon aria-hidden="true" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOutIcon aria-hidden="true" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
