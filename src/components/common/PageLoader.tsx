import { Spinner } from "@/components/common/Spinner";
import { cn } from "@/lib/utils";

/** Full-screen loader for route-level suspense / initial app bootstrap. */
export function PageLoader({
  className,
  label = "Loading…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-svh w-full flex-col items-center justify-center gap-3 bg-background",
        className,
      )}
    >
      <Spinner size="lg" label={label} />
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}
