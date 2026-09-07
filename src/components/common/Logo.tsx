import { Link } from "react-router-dom";

import { appConfig } from "@/config";
import { cn } from "@/lib/utils";

/**
 * App logo — purple square with the initial + app name in DM Sans.
 * Swap for your brand mark when you have one.
 */
export function Logo({
  to = "/",
  showName = true,
  className,
}: {
  to?: string;
  showName?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-sm font-bold">
        {appConfig.appName.charAt(0).toUpperCase()}
      </span>
      {showName ? (
        <span className="text-[15px] leading-none font-bold tracking-tight">
          {appConfig.appName}
        </span>
      ) : null}
    </Link>
  );
}
