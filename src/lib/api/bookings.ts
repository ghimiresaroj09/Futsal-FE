import { api } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";
import type { ApiEnvelope } from "@/types/auth";
import type { Booking, PaginatedBookings } from "@/types/booking";

/** Contact details sent when creating or updating a booking. */
export interface BookingDetails {
  full_name: string;
  email: string;
  phone_number: string;
  notes: string;
}

/**
 * Create a booking (POST /api/v1/bookings/) → the created booking
 * (status PENDING, payment at the counter).
 */
export async function createBooking(
  slotId: string,
  details: BookingDetails,
): Promise<Booking> {
  const token = useAuthStore.getState().token;
  const response = await api.post<ApiEnvelope<Booking>>(
    "/api/v1/bookings/",
    { slot_id: slotId, ...details },
    {
      // Authenticated request — Bearer token in the header.
      // Render's free tier can take a while on a cold start.
      timeout: 60_000,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
  return response.data;
}

/** Upper bound on pages pulled per load — keeps a runaway dataset honest. */
const MAX_PAGES = 10;

/**
 * All bookings visible to the current user (GET /api/v1/bookings/),
 * following DRF pagination (`data.next`) up to MAX_PAGES.
 *
 * The `next` link from the backend is an absolute URL — pointing the
 * browser at it directly would bypass the proxy (CORS), so each page is
 * re-issued through the relative path with the same query params.
 */
export async function fetchAllBookings(): Promise<Booking[]> {
  const bookings: Booking[] = [];
  let url = "/api/v1/bookings/";

  for (let page = 0; page < MAX_PAGES && url; page++) {
    const response = await api.get<ApiEnvelope<PaginatedBookings>>(url, {
      // Render's free tier can take a while on a cold start.
      timeout: 60_000,
    });

    bookings.push(...response.data.results);

    // Convert the absolute `next` URL back to a relative proxy path.
    url = response.data.next ? relativeFromAbsolute(response.data.next) : "";
  }

  return bookings;
}

function relativeFromAbsolute(absolute: string): string {
  try {
    const parsed = new URL(absolute);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "";
  }
}

/**
 * Update a booking's contact details + notes
 * (PATCH /api/v1/bookings/:id/ → the full updated booking).
 */
export async function updateBooking(
  id: string,
  payload: {
    full_name: string;
    email: string;
    phone_number: string;
    notes: string;
  },
): Promise<Booking> {
  const token = useAuthStore.getState().token;
  const response = await api.patch<ApiEnvelope<Booking>>(
    `/api/v1/bookings/${id}/`,
    payload,
    {
      // Authenticated request — Bearer token in the header.
      // Render's free tier can take a while on a cold start.
      timeout: 60_000,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
  return response.data;
}

/**
 * Cancel a booking (POST /api/v1/bookings/:id/cancel/ with a reason) →
 * the full updated booking (status CANCELLED, refunded payment info).
 */
export async function cancelBooking(
  id: string,
  reason: string,
): Promise<Booking> {
  const token = useAuthStore.getState().token;
  const response = await api.post<ApiEnvelope<Booking>>(
    `/api/v1/bookings/${id}/cancel/`,
    {
      reason,
    },
    {
      // Authenticated request — Bearer token in the header.
      // Render's free tier can take a while on a cold start.
      timeout: 60_000,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
  return response.data;
}

/**
 * A single booking's full record (GET /api/v1/bookings/:id/), used to
 * refresh the details dialog with the freshest server state.
 */
export async function fetchBookingById(id: string): Promise<Booking> {
  const token = useAuthStore.getState().token;
  const response = await api.get<ApiEnvelope<Booking>>(
    `/api/v1/bookings/${id}/`,
    {
      // Authenticated request — Bearer token in the header.
      // Render's free tier can take a while on a cold start.
      timeout: 60_000,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
  return response.data;
}
