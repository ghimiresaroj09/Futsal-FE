import { NavLink } from "react-router-dom";

import { Logo } from "@/components/common/Logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { navGroups } from "@/config/nav";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex h-full flex-col gap-4 overflow-y-auto px-2 pb-4">
      {navGroups.map((group, groupIndex) => (
        <div key={group.title ?? groupIndex} className="flex flex-col gap-1">
          {group.title ? (
            <p className="text-muted-foreground px-2 pt-2 pb-1 text-xs font-medium tracking-wide uppercase">
              {group.title}
            </p>
          ) : null}
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onNavigate}
              aria-disabled={item.disabled}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  item.disabled && "pointer-events-none opacity-50",
                )
              }
            >
              {item.icon ? (
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
              ) : null}
              {item.title}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

/**
 * Application sidebar: static rail on desktop (lg+), drawer on mobile.
 * Items are configured in src/config/nav.ts.
 */
export function Sidebar() {
  const isSidebarOpen = useUiStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  return (
    <>
      {/* Desktop */}
      <aside className="bg-sidebar fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r lg:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Logo />
        </div>
        <SidebarNav />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="bg-sidebar w-72 gap-0 p-0">
          <SheetHeader className="h-14 justify-center border-b">
            <SheetTitle asChild>
              <div>
                <Logo />
              </div>
            </SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
