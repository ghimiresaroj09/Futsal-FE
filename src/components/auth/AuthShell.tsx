import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

/**
 * Shared shell for the auth pages: white card with the form on the left
 * and a branded image panel (purple overlay + tagline) on the right.
 * The image panel is hidden on small screens.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  image,
  imageAlt,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Row below the form — e.g. "Already have an account? Log in". */
  footer?: ReactNode;
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="flex items-center justify-center px-4 py-12 md:py-16">
      <Card className="w-full max-w-4xl gap-0 overflow-hidden rounded-3xl p-0 py-0 shadow-xl shadow-primary/5 lg:grid lg:grid-cols-[1fr_42%]">
        {/* Form side */}
        <div className="flex flex-col p-6 sm:p-10">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>
          <div className="mt-7 flex flex-1 flex-col">{children}</div>
          {footer ? (
            <div className="mt-6 text-center text-sm">{footer}</div>
          ) : null}
        </div>

        {/* Image side */}
        <div className="relative hidden lg:block">
          <img
            src={image}
            alt={imageAlt}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="from-primary/90 via-primary/60 to-primary/30 absolute inset-0 bg-linear-to-b" />
          <div className="text-primary-foreground relative flex h-full flex-col justify-between p-8">
            <span className="bg-primary-foreground text-primary flex size-9 items-center justify-center rounded-lg text-lg font-bold">
              N
            </span>
            <div className="space-y-4">
              <p className="text-xl font-bold text-balance">
                Book your slot. Own the game.
              </p>
              <ul className="space-y-2 text-sm font-medium">
                <li className="flex items-center gap-2">
                  <span
                    className="size-1.5 rounded-full bg-current"
                    aria-hidden="true"
                  />
                  Real-time slot availability
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="size-1.5 rounded-full bg-current"
                    aria-hidden="true"
                  />
                  Free rescheduling up to 12 hours before
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="size-1.5 rounded-full bg-current"
                    aria-hidden="true"
                  />
                  Pay at the counter — no online payment needed
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
