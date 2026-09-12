import { useEffect, useState } from "react";
import {
  BriefcaseIcon,
  CalendarClockIcon,
  ClockIcon,
  DumbbellIcon,
  TrophyIcon,
  ZapIcon,
  CalendarCheckIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWhyUsSection } from "@/lib/api/why-us";
import type { WhyUsSection } from "@/types/why-us";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Map Font Awesome icon codes to Lucide icons
const iconMap: Record<string, LucideIcon> = {
  "fa-solid fa-calendar-check": CalendarCheckIcon,
  "fa-solid fa-clock": ClockIcon,
  "fa-solid fa-arrows-rotate": RefreshCwIcon,
  "fa-solid fa-trophy": TrophyIcon,
  "fa-solid fa-dumbbell": DumbbellIcon,
  "fa-solid fa-people-group": UsersIcon,
  "fa-solid fa-zap": ZapIcon,
  "fa-solid fa-briefcase": BriefcaseIcon,
  "fa-solid fa-calendar-clock": CalendarClockIcon,
};

export function FeatureGrid() {
  const [whyUsData, setWhyUsData] = useState<WhyUsSection | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch why us section data
  useEffect(() => {
    let cancelled = false;

    fetchWhyUsSection()
      .then((data) => {
        if (!cancelled) {
          setWhyUsData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWhyUsData(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !whyUsData) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-20 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Skeleton className="mx-auto h-4 w-24 mb-2" />
          <Skeleton className="mx-auto h-10 w-3/4 mb-3" />
          <Skeleton className="mx-auto h-5 w-full" />
          <Skeleton className="mx-auto h-5 w-5/6" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="gap-3 rounded-2xl py-5">
              <CardContent className="px-5">
                <Skeleton className="size-11 rounded-xl mb-3" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  // Map API features to component features with Lucide icons
  const features: Feature[] = whyUsData.features.map((feat) => ({
    icon: iconMap[feat.iconcode] || ZapIcon,
    title: feat.title,
    description: feat.description,
  }));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 md:px-6">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Why Nexus
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {whyUsData.title}
        </h2>
        <p className="text-muted-foreground mt-3 text-base text-balance">
          {whyUsData.description}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="gap-3 rounded-2xl py-5 transition-shadow hover:shadow-md"
          >
            <CardContent className="px-5">
              <div className="bg-primary/10 text-primary mb-3 flex size-11 items-center justify-center rounded-xl">
                <feature.icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
