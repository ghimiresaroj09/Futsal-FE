import { useEffect, useState } from "react";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { fetchSlotsForDate } from "@/lib/api/slots";
import { formatTime12h } from "@/lib/format";
import { isSlotEnded, toDateKey } from "@/lib/slots";
import { useFutsalStore } from "@/store/futsal-store";

/** "HH:mm:ss" → minutes past midnight. */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":");
  return Number(hours) * 60 + Number(minutes ?? 0);
}

const heroStats = [
  { value: "2", label: "Premium courts" },
  { value: "20K+", label: "Matches hosted" },
  { value: "6AM–10PM", label: "Open every day" },
];

/**
 * Home hero: headline + CTAs left, arena photo with a floating
 * availability chip right (live open/closed status + next free slot from
 * the backend), and a stats card that floats over the boundary.
 */
export function Hero() {
  const futsal = useFutsalStore((s) => s.futsal);

  // Ticking clock so the open/closed status stays honest while the page
  // sits open (checked every 30s).
  const [now, setNow] = useState(() => new Date());
  const [nextSlot, setNextSlot] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  // Today's first still-bookable slot from the real availability feed.
  useEffect(() => {
    let cancelled = false;
    const dateKey = toDateKey(new Date());
    fetchSlotsForDate(dateKey)
      .then((slots) => {
        if (cancelled) return;
        const free = slots.find(
          (slot) =>
            slot.status === "AVAILABLE" &&
            !isSlotEnded(dateKey, Number(slot.end_time.slice(0, 2))),
        );
        setNextSlot(free ? formatTime12h(free.start_time) : null);
      })
      .catch(() => {
        if (!cancelled) setNextSlot(null);
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

  return (
    <section className="relative">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 md:px-6 lg:grid-cols-2 lg:py-24">
        {/* Copy */}
        <div className="space-y-6">
          <span className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
            ⚽{" "}
            {futsal
              ? `${futsal.name} — home of futsal`
              : "Kathmandu's home of futsal"}
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Book your slot. <span className="text-primary">Own the game.</span>
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg text-balance">
            Premium turf, floodlights and locker rooms at Nexus Futsal — reserve
            your hour online in seconds, gather your squad and just show up to
            play.
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
              src="/images/hero.jpg"
              alt="Players in a mid-match action on the Nexus Futsal court"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          {/* Floating live-status chip */}
          <div className="border bg-card/95 text-card-foreground absolute -bottom-5 left-4 flex items-center gap-2.5 rounded-xl border-border/60 px-3.5 py-2.5 shadow-lg backdrop-blur sm:left-8">
            <span className="relative flex size-2.5">
              {isOpen ? (
                <>
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
              )}
            </span>
            <div className="text-xs">
              <p
                className={
                  isOpen ? "font-semibold" : "text-red-600 font-semibold"
                }
              >
                {isOpen
                  ? `Open now · closes ${formatTime12h(closingTime)}`
                  : `Closed now · opens ${formatTime12h(openingTime)}`}
              </p>
              <p className="text-muted-foreground">
                {nextSlot
                  ? `Next free slot today · ${nextSlot}`
                  : "No free slots left today"}
              </p>
            </div>
            <ClockIcon className="text-primary size-5" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Floating stats card — overlaps into the next section */}
      <div className="relative z-10 mx-auto -mb-10 w-full max-w-5xl px-4 md:px-6">
        <dl className="bg-card grid grid-cols-1 divide-y divide-border rounded-2xl border p-2 shadow-lg shadow-primary/5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:p-4">
          {heroStats.map((stat) => (
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
      </div>
    </section>
  );
}
