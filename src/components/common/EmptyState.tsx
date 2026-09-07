import { InboxIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Friendly "nothing here" block for lists/tables with no data. */
export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Typically a Button ("New item", "Import"…). */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-52 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center",
        className,
      )}
    >
      <div className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-full">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
