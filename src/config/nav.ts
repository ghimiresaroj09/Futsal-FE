import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  to: string;
  /** Optional icon (used by the app sidebar, not by the public navbar). */
  icon?: LucideIcon;
  /** Visually disables the link (for pages not built yet). */
  disabled?: boolean;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

/** Top navigation for the public layout — plain text links, no icons. */
export const publicNavItems: NavItem[] = [
  { title: "Home", to: "/" },
  { title: "Bookings", to: "/bookings" },
  { title: "Gallery", to: "/gallery" },
  { title: "About", to: "/about" },
  { title: "Contact Us", to: "/contact" },
];

/**
 * Sidebar navigation for the (future) app shell — intentionally empty until
 * your design defines it.
 *
 * export const navGroups: NavGroup[] = [
 *   {
 *     title: "Workspace",
 *     items: [{ title: "Dashboard", to: "/dashboard", icon: LayoutDashboard }],
 *   },
 * ]
 */
export const navGroups: NavGroup[] = [];
