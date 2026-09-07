import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
} as const;

export function Spinner({
  size = "md",
  className,
  label,
}: {
  size?: keyof typeof sizeClasses;
  className?: string;
  /** Optional accessible label (visually hidden). */
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex items-center justify-center"
    >
      <Loader2Icon
        className={cn(
          "animate-spin text-muted-foreground",
          sizeClasses[size],
          className,
        )}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
