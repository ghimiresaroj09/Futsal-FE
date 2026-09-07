import { Outlet } from "react-router-dom";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

/**
 * Default app shell: fixed sidebar (desktop) + sticky header + content area.
 * Use as a layout route parent in the router.
 */
export function AppLayout() {
  return (
    <div className="bg-background min-h-svh">
      <Sidebar />
      <div className="flex min-h-svh flex-col lg:pl-64">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
