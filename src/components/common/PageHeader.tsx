import { ArrowLeftIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Standard page heading: title, optional description, back link and actions. */
export function PageHeader({
  title,
  description,
  actions,
  backTo,
  backLabel = "Back",
  className,
}: {
  title: string;
  description?: string;
  /** Buttons rendered on the right (primary action first). */
  actions?: ReactNode;
  /** Renders a back link when provided (e.g. "/settings"). */
  backTo?: string;
  backLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        {backTo ? (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground"
          >
            <Link to={backTo}>
              <ArrowLeftIcon aria-hidden="true" />
              {backLabel}
            </Link>
          </Button>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-muted-foreground max-w-2xl text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
