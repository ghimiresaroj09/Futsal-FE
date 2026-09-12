import { useEffect, useState } from "react";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSlotsForDate } from "@/lib/api/slots";
import { fetchHeroSection } from "@/lib/api/hero";
import { formatTime12h } from "@/lib/format";
import { isSlotStarted, toDateKey } from "@/lib/slots";
import { useFutsalStore } from "@/store/futsal-store";
import type { HeroSection } from "@/types/hero";

/** "HH:mm:ss" → minutes past midnight. */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":");
  return Number(hours) * 60 + Number(minutes ?? 0);
}

/**
 * Home hero: headline + CTAs left, arena photo with a floating
 * availability chip right (live open/closed status + next free slot from
 * the backend), and a stats card that floats over the boundary.
 */
export function Hero() {
  const futsal = useFutsalStore((s) => s.futsal);
  const [heroData, setHeroData] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);

  // Ticking clock so the open/closed status stays honest while the page
  // sits open (checked every 30s).
  const [now, setNow] = useState(() => new Date());
  const [nextSlot, setNextSlot] = useState<string | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const [closureReason, setClosureReason] = useState<string | null>(null);

  // Fetch hero section data
  useEffect(() => {
    let cancelled = false;

    fetchHeroSection()
      .then((data) => {
        if (!cancelled) {
          setHeroData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHeroData(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  // Today's first still-bookable slot from the real availability feed.
  useEffect(() => {
    let cancelled = false;
    const dateKey = toDateKey(new Date());
    fetchSlotsForDate(dateKey)
      .then((result) => {
        if (cancelled) return;
        
        // Check if facility is closed
        if (result.isClosed) {
          setIsClosed(true);
          setClosureReason(result.closureReason || "Closed today");
          setNextSlot(null);
          return;
        }
        
        setIsClosed(false);
        setClosureReason(null);
        
        if (result.slots.length === 0) {
          setNextSlot(null);
          return;
        }
        
        const free = result.slots.find(
          (slot) =>
            slot.status === "AVAILABLE" &&
            !isSlotStarted(dateKey, Number(slot.start_time.slice(0, 2))),
        );
        setNextSlot(free ? formatTime12h(free.start_time) : null);
      })
      .catch(() => {
        if (!cancelled) {
          setNextSlot(null);
          setIsClosed(false);
          setClosureReason(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openingTime = futsal?.opening_time ?? "06:00:00";
  const closingTime = futsal?.closing_time ?? "22:00:00";
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isOpen =
    nowMinutes >= timeToMinutes(openingTime) &&
    nowMinutes < timeToMinutes(closingTime);

  if (loading || !heroData) {
    return (
      <section className="relative">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 md:px-6 lg:grid-cols-2 lg:py-24">
          {/* Copy skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-2/3" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Skeleton className="h-12 w-full sm:w-32" />
              <Skeleton className="h-12 w-full sm:w-32" />
            </div>
          </div>

          {/* Visual skeleton */}
          <div className="relative">
            <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
            <Skeleton className="absolute -bottom-5 left-4 h-16 w-64 rounded-xl sm:left-8" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="relative z-10 mx-auto -mb-10 w-full max-w-5xl px-4 md:px-6">
          <div className="bg-card grid grid-cols-1 gap-4 rounded-2xl border p-4 shadow-lg sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 md:px-6 lg:grid-cols-2 lg:py-24">
        {/* Copy */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {heroData.title_one}{" "}
            <span className="text-primary">{heroData.title_two}</span>
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg text-balance">
            {heroData.description}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/bookings">
                Book a Slot
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/gallery">Explore Gallery</Link>
            </Button>
          </div>
        </div>

        {/* Visual */}
        <div className="relative">
          <div className="border border-border/60 bg-card overflow-hidden rounded-3xl shadow-xl shadow-black/5">
            <img
              src={heroData.image_url}
              alt={`Players in a mid-match action at ${futsal?.name || "Nexus Futsal"} court`}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          {/* Floating live-status chip */}
          <div className="border bg-card/95 text-card-foreground absolute -bottom-5 left-4 flex items-center gap-2.5 rounded-xl border-border/60 px-3.5 py-2.5 shadow-lg backdrop-blur sm:left-8">
            <span className="relative flex size-2.5">
              {isClosed ? (
                <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
              ) : isOpen ? (
                <>
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
              )}
            </span>
            <div className="text-xs">
              {isClosed ? (
                <>
                  <p className="text-red-600 font-semibold">
                    Closed today
                  </p>
                  <p className="text-red-500">
                    {closureReason}
                  </p>
                </>
              ) : (
                <>
                  <p
                    className={
                      isOpen ? "font-semibold" : "text-red-600 font-semibold"
                    }
                  >
                    {isOpen
                      ? `Open now · closes ${formatTime12h(closingTime)}`
                      : `Closed now · opens ${formatTime12h(openingTime)}`}
                  </p>
                  {nextSlot && (
                    <p className="text-muted-foreground">
                      Next free slot today · {nextSlot}
                    </p>
                  )}
                </>
              )}
            </div>
            <ClockIcon className="text-primary size-5" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Floating stats card */}
      <div className="relative z-10 mx-auto -mb-10 w-full max-w-5xl px-4 md:px-6">
        {(() => {
          const stats = heroData.stats;
          const gridCols = stats.length === 2 ? "sm:grid-cols-2" : stats.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";
          
          return (
            <dl className={`bg-card grid grid-cols-1 divide-y divide-border rounded-2xl border p-2 shadow-lg shadow-primary/5 ${gridCols} sm:divide-x sm:divide-y-0 sm:p-4`}>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-0.5 px-4 py-3 text-center"
                >
                  <dd className="text-primary text-xl font-bold tracking-tight">
                    {stat.value}
                  </dd>
                  <dt className="text-muted-foreground text-xs">{stat.label}</dt>
                </div>
              ))}
            </dl>
          );
        })()}
      </div>
    </section>
  );
}
