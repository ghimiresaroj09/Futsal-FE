import type { BookingStatus } from "@/types/booking";

/** Display labels for booking + payment enums (kept out of the component
 * file so fast-refresh stays clean). */
export const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  RESCHEDULED: "Rescheduled",
};

export const paymentMethodLabels: Record<string, string> = {
  CASH: "Cash",
  ESEWA: "eSewa",
  KHALTI: "Khalti",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
};
