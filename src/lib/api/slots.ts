import { api } from "@/lib/api/client";
import type { BookableSlot } from "@/lib/slots";
import type { ApiEnvelope } from "@/types/auth";
import type { BookingSlot } from "@/types/booking";

/** Paginated slot envelope from GET /api/v1/slots/date-wise/?date=YYYY-MM-DD */
interface SlotPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: BookingSlot[];
}

/** Response when facility is closed on a specific date */
interface ClosedDateResponse {
  date: string;
  is_closed: true;
  reason: string;
  slots: [];
}

/** Response data can be either slot page or closed date info */
type SlotDateResponse = SlotPage | ClosedDateResponse;

/** Result of fetching slots - either slots or closure info */
export interface SlotsFetchResult {
  slots: BookableSlot[];
  isClosed?: boolean;
  closureReason?: string;
}

/**
 * Real slot availability for a single date, mapped to the UI's slot shape
 * (price as a number). An empty result set is legitimate — it means no
 * slots are listed for that day yet (e.g. a closure).
 */
export async function fetchSlotsForDate(
  dateKey: string,
): Promise<SlotsFetchResult> {
  const response = await api.get<ApiEnvelope<SlotDateResponse>>(
    "/api/v1/slots/date-wise/",
    {
      params: { date: dateKey },
      // Render's free tier can take a while on a cold start.
      timeout: 60_000,
    },
  );

  // Check if the facility is closed on this date
  if ("is_closed" in response.data && response.data.is_closed) {
    return {
      slots: [],
      isClosed: true,
      closureReason: response.data.reason,
    };
  }

  // Normal slot response
  const slotPage = response.data as SlotPage;
  return {
    slots: slotPage.results.map((slot) => ({
      id: slot.id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      price: Number(slot.price),
      status: slot.status as BookableSlot["status"],
    })),
    isClosed: false,
  };
}
