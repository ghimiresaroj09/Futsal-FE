/**
 * Slot engine — generates the arena's bookable hours (6 AM – 10 PM, hourly).
 * Deterministic "booked" slots (hash-based) so the calendar looks realistic
 * and stays stable between renders.
 *
 * TODO: replace `getSlotsForDate` with the real endpoint, e.g.
 *   api.get(`/slots?date=${dateKey}`)
 */

export type SlotStatus = "AVAILABLE" | "BOOKED";

export interface BookableSlot {
  /** Backend slot id — required when creating a booking (slot_id). */
  id?: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm:ss */
  start_time: string;
  end_time: string;
  price: number;
  status: SlotStatus;
}

export const OPEN_HOUR = 6;
export const CLOSE_HOUR = 22;

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Rates by daypart and day type. Evenings cost more — the floodlights stay
 * on — and weekends carry a premium. Kept in sync with the rates table on
 * the bookings page.
 */
export function slotPrice(dateKey: string, hour: number): number {
  const day = parseDateKey(dateKey).getDay();
  const weekend = day === 0 || day === 6;

  if (hour < 12) return weekend ? 1800 : 1500; // Morning
  if (hour < 17) return weekend ? 2300 : 2000; // Afternoon
  return weekend ? 2800 : 2500; // Evening (floodlights on)
}

/** Opening hours override from the arena record (GET /api/v1/futsal/). */
export interface SlotHours {
  open: number;
  close: number;
}

export function getSlotsForDate(
  dateKey: string,
  hours: SlotHours = { open: OPEN_HOUR, close: CLOSE_HOUR },
): BookableSlot[] {
  const slots: BookableSlot[] = [];

  for (let hour = hours.open; hour < hours.close; hour++) {
    slots.push({
      date: dateKey,
      start_time: `${String(hour).padStart(2, "0")}:00:00`,
      end_time: `${String(hour + 1).padStart(2, "0")}:00:00`,
      price: slotPrice(dateKey, hour),
      // ~30% of slots appear already booked in the demo.
      status:
        hashString(`${dateKey}:${hour}`) % 10 < 3 ? "BOOKED" : "AVAILABLE",
    });
  }

  return slots;
}

/** Weeks × 7 matrix (Sunday-first) for a month grid; null = padding cell. */
export function monthMatrix(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let index = 0; index < first.getDay(); index++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++)
    cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export function daypartOf(
  startHour: number,
): "Morning" | "Afternoon" | "Evening" {
  if (startHour < 12) return "Morning";
  if (startHour < 17) return "Afternoon";
  return "Evening";
}

/**
 * True once the slot has ended. At 2:30 PM the 12–1 and 1–2 slots are past,
 * but the ongoing 2–3 slot is still bookable.
 */
export function isSlotEnded(
  dateKey: string,
  endHour: number,
  now = new Date(),
): boolean {
  const end = parseDateKey(dateKey);
  end.setHours(endHour, 0, 0, 0);
  return end.getTime() <= now.getTime();
}
