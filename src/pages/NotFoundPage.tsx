import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function NotFoundPage() {
  useDocumentTitle("Page not found");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-primary text-7xl font-bold tracking-tight">404</p>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground text-sm">
          The page you're looking for doesn't exist or has moved.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
