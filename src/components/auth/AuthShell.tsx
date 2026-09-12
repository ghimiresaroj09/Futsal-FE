import type { ReactNode } from "react";
import { useState, useEffect } from "react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchHeroSection } from "@/lib/api/hero";

type HeroContent = {
  image_url: string;
  title: string;
  description: string;
};

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
  imageAlt,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Row below the form — e.g. "Already have an account? Log in". */
  footer?: ReactNode;
  imageAlt: string;
}) {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroSection()
      .then((data) => {
        setHeroContent({
          image_url: data.image_url,
          title: `${data.title_one} ${data.title_two}`,
          description: data.description,
        });
        setLoading(false);
      })
      .catch(() => {
        setHeroContent(null);
        setLoading(false);
      });
  }, []);

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
          {loading || !heroContent ? (
            <div className="from-primary/90 via-primary/60 to-primary/30 absolute inset-0 bg-linear-to-b">
              <div className="relative flex h-full flex-col justify-between p-8">
                <Skeleton className="size-9 rounded-lg bg-white/20" />
                <div className="space-y-4">
                  <Skeleton className="h-7 w-3/4 bg-white/20" />
                  <Skeleton className="h-4 w-full bg-white/20" />
                  <Skeleton className="h-4 w-5/6 bg-white/20" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <img
                src={heroContent.image_url}
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
                    {heroContent.title}
                  </p>
                  <p className="text-sm leading-relaxed opacity-90">
                    {heroContent.description}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </section>
  );
}
