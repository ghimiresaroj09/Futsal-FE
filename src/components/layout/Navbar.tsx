import {
  CalendarCheck2Icon,
  ChevronDownIcon,
  KeyRoundIcon,
  LogOutIcon,
  MenuIcon,
  UserIcon,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Logo } from "@/components/common/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { publicNavItems } from "@/config/nav";
import { logoutEverywhere } from "@/lib/auth";
import { getInitials } from "@/lib/format";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

/**
 * Public header — everything on one line:
 * logo left · text links (DM Sans 600 / 13px, #8a8da0 → active #6358db) ·
 * right side swaps with auth state:
 *   - logged out:  Login + Sign Up buttons
 *   - logged in:   avatar + name with Profile / View Booking / Logout dropdown
 */
export function Navbar() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const isAuthenticated = Boolean(token);
  const displayName = user?.full_name ?? user?.email ?? "Player";

  const handleLogout = async () => {
    await logoutEverywhere();
    toast.success("Logged out", { description: "See you on the court!" });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 md:gap-6 md:px-6">
        <Logo className="shrink-0" />

        {/* Centred desktop navigation. Small screens use the sheet below. */}
        <nav
          className="absolute left-1/2 hidden min-w-max -translate-x-1/2 items-center gap-5 md:flex"
          aria-label="Main"
        >
          {publicNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "group relative shrink-0 px-0.5 py-1 text-[13px] leading-[18px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:rounded-sm",
                  isActive
                    ? "text-[#6358db]"
                    : "text-[#8a8da0] hover:text-[#6358db]",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.title}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-1 -bottom-0.5 h-[2px] origin-left rounded-full bg-current transition-transform duration-200",
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right side — auth state dependent */}
        <div className="ml-auto hidden shrink-0 md:block">
          {isAuthenticated ? (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg p-1.5 pr-2 outline-none transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-haspopup="menu"
              >
                <Avatar className="size-9">
                  {user?.profile_image ? (
                    <AvatarImage src={user.profile_image} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left leading-tight sm:block">
                  <strong className="block text-sm font-semibold">
                    {displayName}
                  </strong>
                  <span className="text-muted-foreground block text-xs">
                    {user?.role
                      ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
                      : "User"}
                  </span>
                </div>
                <ChevronDownIcon
                  className="text-muted-foreground size-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <UserIcon aria-hidden="true" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/view-bookings")}>
                <CalendarCheck2Icon aria-hidden="true" />
                View Bookings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/change-password")}>
                <KeyRoundIcon aria-hidden="true" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOutIcon aria-hidden="true" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
            </div>
          )}
        </div>

        {/* Mobile navigation keeps links and account actions easy to reach
            without squeezing the header or forcing horizontal scrolling. */}
        <div className="ml-auto md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-10"
                aria-label="Open menu"
              >
                <MenuIcon aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(22rem,calc(100%-1rem))] gap-0 p-0">
              <SheetHeader className="border-b p-5 pr-12">
                <Logo />
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-3" aria-label="Mobile main">
                {publicNavItems.map((item) => (
                  <SheetClose key={item.to} asChild>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      className={({ isActive }) =>
                        cn(
                          "rounded-lg px-3 py-3 text-sm font-semibold transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted",
                        )
                      }
                    >
                      {item.title}
                    </NavLink>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto border-t p-4">
                {isAuthenticated ? (
                  <div className="grid gap-2">
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link to="/profile"><UserIcon aria-hidden="true" /> Profile</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link to="/view-bookings"><CalendarCheck2Icon aria-hidden="true" /> View Bookings</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link to="/change-password"><KeyRoundIcon aria-hidden="true" /> Change Password</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                        <LogOutIcon aria-hidden="true" /> Logout
                      </Button>
                    </SheetClose>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full"><Link to="/login">Login</Link></Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full"><Link to="/signup">Sign Up</Link></Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
