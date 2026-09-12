import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheckIcon,
  CircleAlertIcon,
  LoaderCircleIcon,
  CalendarDaysIcon,
  WalletIcon,
  ShieldHalfIcon,
  TimerIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AddBookingDialog } from "@/components/bookings/AddBookingDialog";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { SlotList } from "@/components/bookings/SlotList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatDate, formatTime12h } from "@/lib/format";
import { toDateKey } from "@/lib/slots";
import type { BookableSlot } from "@/lib/slots";
import type { Booking } from "@/types/booking";
import { fetchSlotsForDate } from "@/lib/api/slots";
import { fetchBookingsHeroSection } from "@/lib/api/bookings-hero";
import { clearCacheKey } from "@/lib/api-cache";
import { useAuthStore } from "@/store/auth-store";
import { useFutsalStore } from "@/store/futsal-store";
import type { BookingsHeroSection } from "@/types/bookings-hero";
import type { LucideIcon } from "lucide-react";

// Map Font Awesome icon codes to Lucide icons
const iconMap: Record<string, LucideIcon> = {
  "fa-solid fa-calendar-days": CalendarDaysIcon,
  "fa-solid fa-wallet": WalletIcon,
  "fa-solid fa-shield-halved": ShieldHalfIcon,
  "fa-solid fa-stopwatch": TimerIcon,
};

const steps = [
  {
    title: "Pick a date",
    description: "Browse the calendar — green dots mark dates with open slots.",
  },
  {
    title: "Choose your slot",
    description:
      "Select the hour that fits your squad, from morning to prime time.",
  },
  {
    title: "Confirm & pay at counter",
    description:
      "Enter your details to lock the slot, then pay when you arrive.",
  },
];

/**
 * Bookings page — CMS header banner, the big slot calendar (center of
 * attraction) with the day's slots beside it, and the rate card below.
 */
export function BookingsPage() {
  useDocumentTitle("Bookings");

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(() =>
    toDateKey(new Date()),
  );
  const [reservedOverrides, setBookedOverrides] = useState<string[]>([]);
  const [slotToBook, setSlotToBook] = useState<BookableSlot | null>(null);
  const [heroData, setHeroData] = useState<BookingsHeroSection | null>(null);
  const [heroLoading, setHeroLoading] = useState(true);
  const futsal = useFutsalStore((s) => s.futsal);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  // Fetch bookings hero section data
  useEffect(() => {
    let cancelled = false;

    fetchBookingsHeroSection()
      .then((data) => {
        if (!cancelled) {
          setHeroData(data);
          setHeroLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHeroData(null);
          setHeroLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Slot click: guests get a login nudge (and land on /login, returning
   * here after signing in); signed-in players go straight to booking.
   */
  const handleSelectSlot = (slot: BookableSlot) => {
    if (!token) {
      toast.info("Login required", {
        description: "Please log in to book a slot — you'll be right back.",
      });
      navigate("/login", { state: { from: "/bookings" } });
      return;
    }
    setSlotToBook(slot);
  };

  // Real availability from GET /api/v1/slots/date-wise/?date=…
  const [slots, setSlots] = useState<BookableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slotsReloadKey, setSlotsReloadKey] = useState(0);
  const [isClosed, setIsClosed] = useState(false);
  const [closureReason, setClosureReason] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      setIsClosed(false);
      setClosureReason(null);
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);
    setIsClosed(false);
    setClosureReason(null);

    fetchSlotsForDate(selectedDate)
      .then((result) => {
        if (!cancelled) {
          setSlots(result.slots);
          setIsClosed(result.isClosed ?? false);
          setClosureReason(result.closureReason ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setIsClosed(false);
          setClosureReason(null);
          setSlotsError("Couldn't load slots for this date.");
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, slotsReloadKey]);

  // Slots the user just booked (before the backend list catches up).
  const displaySlots = useMemo(() => {
    const overrides = new Set(reservedOverrides);
    return slots.map((slot) =>
      overrides.has(`${slot.date}-${slot.start_time}`)
        ? { ...slot, status: "RESERVED" as const }
        : slot,
    );
  }, [slots, reservedOverrides]);

  const handleConfirmed = (slot: BookableSlot, created: Booking) => {
    // POST /api/v1/bookings/ succeeded — mark the slot reserved locally
    // (until the next slots refresh) and celebrate with the reference.
    setBookedOverrides((current) => [
      ...current,
      `${slot.date}-${slot.start_time}`,
    ]);
    
    // Clear the cache for this date so next fetch gets fresh data
    clearCacheKey(`slots-${slot.date}`);
    
    setSlotToBook(null);
    toast.success("Booking confirmed!", {
      description: `${created.booking_reference} · ${formatDate(slot.date)}, ${formatTime12h(
        slot.start_time,
      )} – ${formatTime12h(slot.end_time)}. Pay Rs ${Number(created.amount).toLocaleString()} at the counter.`,
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 md:px-6">
      {/* Banner */}
      {heroLoading || !heroData ? (
        <section className="relative overflow-hidden rounded-3xl">
          <Skeleton className="h-64 w-full sm:h-80" />
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-3xl">
          <img
            src={heroData.image_url}
            alt={`${futsal?.name || "Futsal"} court`}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="from-primary/90 via-primary/70 to-primary/30 absolute inset-0 bg-linear-to-r" />
          <div className="text-primary-foreground relative max-w-2xl space-y-3 px-6 py-10 sm:px-10 sm:py-12">
            <p className="text-xs font-semibold tracking-wide uppercase">
              Bookings
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {heroData.title}
            </h1>
            <p className="text-sm text-balance opacity-90 sm:text-base">
              {heroData.description}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                🕕 Open {formatTime12h(futsal?.opening_time ?? "06:00:00")} –{" "}
                {formatTime12h(futsal?.closing_time ?? "22:00:00")} daily
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                💵 Rs {Number(futsal?.price_per_slot ?? 1500).toLocaleString()} /
                hour
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                📍 {futsal?.address ?? "Balaju Height"},{" "}
                {futsal?.location ?? "Kathmandu"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Calendar + slots — the main event */}
      <section className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(24rem,2fr)]">
        <Card className="p-5 sm:p-6">
          <BookingCalendar
            month={month}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onMonthChange={setMonth}
          />
        </Card>
        <Card className="overflow-hidden p-0 py-0">
          {slotsLoading ? (
            <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
              <LoaderCircleIcon
                className="text-muted-foreground size-7 animate-spin"
                aria-hidden="true"
              />
              <p className="text-muted-foreground text-sm">Loading slots…</p>
            </div>
          ) : slotsError ? (
            <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <CircleAlertIcon className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600">
                  {slotsError}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  The slot service didn't respond — maybe it's waking up.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setSlotsReloadKey((key) => key + 1)}
              >
                Retry
              </Button>
            </div>
          ) : isClosed ? (
            <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <CircleAlertIcon className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Facility closed on this date
                </p>
                <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                  {closureReason || "We're closed on this date. Please choose another day."}
                </p>
              </div>
              {selectedDate !== toDateKey(new Date()) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setSelectedDate(toDateKey(new Date()))}
                >
                  Back to today
                </Button>
              )}
            </div>
          ) : (
            <SlotList
              dateKey={selectedDate}
              slots={displaySlots}
              onSelectSlot={handleSelectSlot}
            />
          )}
        </Card>
      </section>

      {/* Booking steps */}
      <section>
        {/* Steps */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight">
              Booking in three steps
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              No calls, no waiting — the court is yours in under a minute.
            </p>
          </div>
          <Card className="rounded-2xl p-6">
            <ol className="relative space-y-6">
              <span
                aria-hidden="true"
                className="border-primary/30 absolute top-2 bottom-2 left-[17px] border-l-2 border-dashed"
              />
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="relative flex items-start gap-4"
                >
                  <span className="bg-primary text-primary-foreground ring-card relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-4">
                    {index + 1}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

      </section>

      {/* Policies */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold tracking-tight">Good to know</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            The fair-play rules that keep the arena running smoothly for
            everyone.
          </p>
        </div>
        {heroLoading || !heroData ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="flex items-start gap-3 rounded-2xl p-5">
                <Skeleton className="size-8 rounded-lg mt-0.5" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {heroData.info.map((policy) => {
              const IconComponent = iconMap[policy.iconcode] || ShieldCheckIcon;
              
              return (
                <Card
                  key={policy.title}
                  className="flex items-start gap-3 rounded-2xl p-5"
                >
                  <div className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <IconComponent className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{policy.title}</h3>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                      {policy.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Help strip */}
      <section className="bg-linear-to-br from-primary via-primary to-primary/80 text-primary-foreground relative overflow-hidden rounded-3xl px-6 py-8 sm:px-10">
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Need a hand with your booking?
            </h2>
            <p className="mt-1 text-sm opacity-90">
              Call the arena at {futsal?.phone ?? "+977 9800000000"} — we're
              around {formatTime12h(futsal?.opening_time ?? "06:00:00")} to{" "}
              {formatTime12h(futsal?.closing_time ?? "22:00:00")}, every day.
            </p>
          </div>
          <Link
            to="/contact"
            className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white inline-flex h-10 items-center justify-center rounded-md border px-5 text-sm font-medium transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* Add booking modal */}
      {slotToBook ? (
        <AddBookingDialog
          key={`${slotToBook.date}-${slotToBook.start_time}`}
          slot={slotToBook}
          onClose={() => setSlotToBook(null)}
          onConfirm={handleConfirmed}
        />
      ) : null}
    </div>
  );
}
