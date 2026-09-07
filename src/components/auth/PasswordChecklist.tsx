import { CheckIcon, XIcon } from "lucide-react";

import { passwordRules } from "@/lib/password-rules";
import { cn } from "@/lib/utils";

/** Live checklist showing which password rules are satisfied. */
export function PasswordChecklist({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <ul
      className={cn("grid gap-1.5 sm:grid-cols-2", className)}
      aria-label="Password requirements"
    >
      {passwordRules.map((rule) => {
        const met = rule.met(value);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              met ? "text-primary font-medium" : "text-muted-foreground",
            )}
          >
            {met ? (
              <CheckIcon className="size-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <XIcon
                className="size-3.5 shrink-0 opacity-50"
                aria-hidden="true"
              />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
