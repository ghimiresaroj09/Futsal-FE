import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";

/** Compose every app-wide provider here so main.tsx stays a one-liner. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster richColors position="top-right" />
    </QueryProvider>
  );
}
