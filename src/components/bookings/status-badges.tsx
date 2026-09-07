import { bookingStatusLabels } from "@/components/bookings/booking-labels";
import type { BookingStatus, PaymentStatus } from "@/types/booking";

/**
 * Status pills — styled by the `.booking-status` / `.payment-status`
 * classes in index.css (design spec): 14px radius, 5x8 padding, 9px/700.
 */

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`booking-status ${status.toLowerCase()}`}>
      {bookingStatusLabels[status]}
    </span>
  );
}

const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`payment-status ${status.toLowerCase()}`}>
      {paymentStatusLabels[status]}
    </span>
  );
}
