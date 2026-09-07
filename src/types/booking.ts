/** Booking types — mirror the backend's API contract exactly. */

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "RESCHEDULED";
export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED";
export type PaymentMethod =
  | "CASH"
  | "ESEWA"
  | "KHALTI"
  | "CARD"
  | "BANK_TRANSFER";
export type BookingSource = "ADMIN" | "USER";

export interface BookingSlot {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm:ss */
  start_time: string;
  end_time: string;
  price: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  slot: BookingSlot;
  futsal_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  amount: string;
  status: BookingStatus;
  booking_source: BookingSource;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  advance_amount: string;
  remaining_amount: string;
  cancelled_at: string | null;
  cancellation_reason: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

/** DRF-style paginated envelope: { count, next, previous, results }. */
export interface PaginatedBookings {
  count: number;
  next: string | null;
  previous: string | null;
  results: Booking[];
}
