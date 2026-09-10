import { CalendarDaysIcon } from "lucide-react";

import { formatTime12h } from "@/lib/format";
import { daypartOf, isSlotEnded, parseDateKey } from "@/lib/slots";
import type { BookableSlot } from "@/lib/slots";
import { cn } from "@/lib/utils";

const DAYPART_ORDER = ["Morning", "Afternoon", "Evening"] as const;

/** Visual treatment per slot state: Available / Booked / Reserved / Blocked. */
const stateStyles = {
  available: {
    card: "border-emerald-200 bg-card cursor-pointer hover:border-primary/50 hover:shadow-sm",
    status: "text-emerald-600",
    dot: "bg-emerald-500",
    label: "Available",
  },
  booked: {
    card: "border-red-200 bg-red-50/50 cursor-not-allowed",
    status: "text-red-500",
    dot: "bg-red-500",
    label: "Booked",
  },
  reserved: {
    card: "border-amber-200 bg-amber-50/50 cursor-not-allowed",
    status: "text-amber-600",
    dot: "bg-amber-500",
    label: "Reserved",
  },
  blocked: {
    card: "border-zinc-200 bg-zinc-50 cursor-not-allowed opacity-70",
    status: "text-zinc-500",
    dot: "bg-zinc-400",
    label: "Blocked",
  },
} as const;

type SlotState = keyof typeof stateStyles;

function slotState(slot: BookableSlot, dateKey: string): SlotState {
  // A slot only blocks once it has ENDED — at 2:30 PM the ongoing 2–3 PM
  // slot is still bookable, 12–1 and 1–2 are not.
  if (isSlotEnded(dateKey, Number(slot.end_time.slice(0, 2)))) return "blocked";
  if (slot.status === "BOOKED") return "booked";
  if (slot.status === "RESERVED") return "reserved";
  return "available";
}

/**
 * Right-hand column: all slots for the selected date as three horizontal
 * daypart sections (Morning / Afternoon / Evening), each a stack of cards
 * showing time, price and a color-coded status.
 */
export function SlotList({
  dateKey,
  slots,
  onSelectSlot,
}: {
  dateKey: string | null;
  slots: BookableSlot[];
  onSelectSlot: (slot: BookableSlot) => void;
}) {
  if (!dateKey) {
    return (
      <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
        <CalendarDaysIcon
          className="text-muted-foreground size-8"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold">Pick a date</p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Choose a date on the calendar to see available slots.
          </p>
        </div>
      </div>
    );
  }

  const heading = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(parseDateKey(dateKey));

  // The backend listed no slots for this date (bookings not opened yet).
  if (slots.length === 0) {
    return (
      <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <CalendarDaysIcon className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold">No slots listed for {heading}</p>
          <p className="text-muted-foreground mt-1 max-w-xs text-sm">
            Slots for this day aren't open for booking yet — try a nearby date,
            or give us a call and we'll sort you out.
          </p>
        </div>
      </div>
    );
  }

  const availableCount = slots.filter(
    (slot) => slotState(slot, dateKey) === "available",
  ).length;

  const sections = DAYPART_ORDER.map((part) => {
    const sectionSlots = slots.filter(
      (slot) => daypartOf(Number(slot.start_time.slice(0, 2))) === part,
    );
    return {
      part,
      slots: sectionSlots,
      available: sectionSlots.filter(
        (slot) => slotState(slot, dateKey) === "available",
      ).length,
    };
  });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-5">
        <h2 className="text-sm font-semibold">{heading}</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {availableCount} of {slots.length} slots available
        </p>
      </div>

      {/* Three horizontal daypart sections */}
      <div className="grid flex-1 gap-3 overflow-y-auto p-4 sm:grid-cols-3">
        {sections.map(({ part, slots: sectionSlots, available }) => (
          <div key={part} className="flex min-w-0 flex-col gap-2">
            <div className="flex items-baseline justify-between px-0.5">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {part}
              </p>
              <p className="text-muted-foreground text-[11px] tabular-nums">
                {available} free
              </p>
            </div>

            {sectionSlots.map((slot) => {
              const state = slotState(slot, dateKey);
              const style = stateStyles[state];
              const disabled = state !== "available";

              return (
                <button
                  key={slot.start_time}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectSlot(slot)}
                  aria-label={`${formatTime12h(slot.start_time)} to ${formatTime12h(
                    slot.end_time,
                  )}, ${style.label}, Rs ${slot.price}`}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    style.card,
                  )}
                >
                  <span className="text-xs font-semibold tabular-nums">
                    {formatTime12h(slot.start_time)} –{" "}
                    {formatTime12h(slot.end_time)}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium tabular-nums">
                    Rs {slot.price.toLocaleString()}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 text-[11px] font-semibold",
                      style.status,
                    )}
                  >
                    <span
                      className={cn("size-1.5 rounded-full", style.dot)}
                      aria-hidden="true"
                    />
                    {style.label}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
