import {
  BriefcaseIcon,
  CalendarClockIcon,
  ClockIcon,
  DumbbellIcon,
  TrophyIcon,
  ZapIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: ZapIcon,
    title: "Instant Online Booking",
    description:
      "Reserve a court in a few taps, 24/7 — no phone calls, no waiting.",
  },
  {
    icon: ClockIcon,
    title: "Live Slot Availability",
    description:
      "Our real-time calendar shows exactly which hours are open, right now.",
  },
  {
    icon: CalendarClockIcon,
    title: "Free Rescheduling",
    description:
      "Plans change? Reschedule or cancel your slot at no cost up to 12 hours before.",
  },
  {
    icon: TrophyIcon,
    title: "Tournaments & Leagues",
    description:
      "Join our regular leagues and knockout nights, with fixtures and standings tracked.",
  },
  {
    icon: DumbbellIcon,
    title: "Coaching & Training",
    description:
      "Qualified coaching sessions for kids and adults, mornings and evenings.",
  },
  {
    icon: BriefcaseIcon,
    title: "Corporate & Events",
    description:
      "Book the whole arena for corporate matches, birthdays and private events.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 md:px-6">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Why Nexus
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Everything managed in-house
        </h2>
        <p className="text-muted-foreground mt-3 text-base text-balance">
          From perfectly maintained turf to hassle-free booking — one team, one
          arena, zero compromise.
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
