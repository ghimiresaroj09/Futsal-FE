import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

import { Button } from "@/components/ui/button";

/**
 * Router-level error boundary — replaces React Router's default crash screen
 * with a friendly message and recovery actions.
 */
export function RouteError() {
  const error = useRouteError();

  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const message =
    error instanceof Error && !isNotFound
      ? error.message
      : isNotFound
        ? "The page you're looking for doesn't exist."
        : "Something went wrong while loading this page.";

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangleIcon className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">
          {isNotFound ? "Page not found" : "Unexpected error"}
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">{message}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RotateCcwIcon aria-hidden="true" />
          Reload page
        </Button>
        <Button asChild>
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
