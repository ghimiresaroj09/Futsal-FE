import type * as React from "react";
import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";

/**
 * App-wide toaster (light theme only). Fire notifications anywhere with:
 *   import { toast } from "sonner"
 *   toast.success("Saved") / toast.error("Failed", { description: ... })
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
