import { useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getSlotsForDate,
  isSlotStarted,
  monthMatrix,
  toDateKey,
} from "@/lib/slots";
import { futsalHours, useFutsalStore } from "@/store/futsal-store";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * The big month calendar: past dates disabled, availability dot under days
 * with open slots, selected date in brand purple.
 */
export function BookingCalendar({
  month,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: {
  /** Any date within the month to display. */
  month: Date;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  onMonthChange: (month: Date) => void;
}) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const cells = useMemo(
    () => monthMatrix(year, monthIndex),
    [year, monthIndex],
  );

  const hours = futsalHours(useFutsalStore((s) => s.futsal)) ?? {
    open: 6,
    close: 22,
  };

  const availability = useMemo(() => {
    const counts = new Map<string, number>();
    for (const date of cells) {
      if (!date) continue;
      const key = toDateKey(date);
      counts.set(
        key,
        getSlotsForDate(key, hours).filter(
          (slot) =>
            slot.status === "AVAILABLE" &&
            !isSlotStarted(key, Number(slot.start_time.slice(0, 2))),
        ).length,
      );
    }
    return counts;
  }, [cells, hours]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoToPrevious = new Date(year, monthIndex, 1) > currentMonthStart;

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between px-1 pb-4">
        <div>
          <h2 className="text-sm font-semibold">
            {MONTHS[monthIndex] ?? ""} {year}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Select a date to see its slots
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Previous month"
            disabled={!canGoToPrevious}
            onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Next month"
            onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="text-muted-foreground py-1 text-center text-xs font-semibold"
          >
            {weekday}
          </div>
        ))}

        {/* Days */}
        {cells.map((date, index) => {
          if (!date)
            return <div key={`empty-${index}`} className="aspect-square" />;

          const key = toDateKey(date);
          const isPast = date < today;
          const isSelected = key === selectedDate;
          const isToday = key === toDateKey(today);
          const available = availability.get(key) ?? 0;

          return (
            <button
              key={key}
              type="button"
              disabled={isPast}
              onClick={() => onSelectDate(key)}
              aria-pressed={isSelected}
              aria-label={`${MONTHS[monthIndex] ?? ""} ${date.getDate()}, ${available} slots available`}
              className={cn(
                "flex aspect-square w-full min-h-11 flex-col items-center justify-center rounded-lg text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-13 sm:text-base lg:min-h-15",
                isPast
                  ? "cursor-not-allowed opacity-30"
                  : "cursor-pointer hover:bg-accent",
                isToday && !isSelected && "text-primary font-bold",
                isSelected &&
                  "bg-primary text-primary-foreground font-semibold hover:bg-primary",
              )}
            >
              {date.getDate()}
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 size-1.5 rounded-full",
                  isSelected
                    ? "bg-primary-foreground"
                    : available > 0 && !isPast
                      ? "bg-emerald-500"
                      : "transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-xs">
        <span className="flex items-center gap-1.5">
          <span
            className="size-1.5 rounded-full bg-emerald-500"
            aria-hidden="true"
          />
          Slots available
        </span>
      </div>
    </div>
  );
}
