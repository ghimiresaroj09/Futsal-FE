import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useFutsalStore } from "@/store/futsal-store";

/** Layout for public/marketing pages: sticky Navbar, page content, Footer. */
export function PublicLayout() {
  const loadFutsal = useFutsalStore((s) => s.loadFutsal);

  // Fetch the arena record once per session — every page (footer, contact,
  // bookings hours…) reads it from the store.
  useEffect(() => {
    void loadFutsal();
  }, [loadFutsal]);

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
