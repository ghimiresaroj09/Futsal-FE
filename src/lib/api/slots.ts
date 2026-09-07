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

/**
 * Real slot availability for a single date, mapped to the UI's slot shape
 * (price as a number). An empty result set is legitimate — it means no
 * slots are listed for that day yet (e.g. a closure).
 */
export async function fetchSlotsForDate(
  dateKey: string,
): Promise<BookableSlot[]> {
  const response = await api.get<ApiEnvelope<SlotPage>>(
    "/api/v1/slots/date-wise/",
    {
      params: { date: dateKey },
      // Render's free tier can take a while on a cold start.
      timeout: 60_000,
    },
  );

  return response.data.results.map((slot) => ({
    id: slot.id,
    date: slot.date,
    start_time: slot.start_time,
    end_time: slot.end_time,
    price: Number(slot.price),
    status: slot.status as BookableSlot["status"],
  }));
}
