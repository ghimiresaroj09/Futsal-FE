import { RefreshCwIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Error block with an optional retry — pass `error.message` from React Query. */
export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-52 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-5" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        {message ? (
          <p className="text-muted-foreground text-sm">{message}</p>
        ) : null}
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCwIcon aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
