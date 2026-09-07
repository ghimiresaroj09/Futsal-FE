import type { ReactNode } from "react";
import { LoaderCircleIcon } from "lucide-react";

import { paymentMethodLabels } from "@/components/bookings/booking-labels";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/bookings/status-badges";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateTime, formatTime12h } from "@/lib/format";
import type { Booking } from "@/types/booking";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className="text-sm font-medium break-all">{children}</div>
    </div>
  );
}

function Text({ value }: { value: string }) {
  return <>{value || "—"}</>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold tracking-wide uppercase">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/** Full booking details dialog — mirrors the backend's booking payload. */
export function BookingDetailsDialog({
  booking,
  refreshing = false,
  onClose,
}: {
  booking: Booking | null;
  /** True while the freshest record is being fetched. */
  refreshing?: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={Boolean(booking)}
      onOpenChange={(open) => (!open ? onClose() : undefined)}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {booking ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {booking.booking_reference}
                <BookingStatusBadge status={booking.status} />
                {refreshing ? (
                  <LoaderCircleIcon
                    className="text-muted-foreground ml-1 size-3.5 animate-spin"
                    aria-label="Refreshing details"
                  />
                ) : null}
              </DialogTitle>
              <DialogDescription>Full booking details</DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <Section title="Booking">
                <Field label="Reference">
                  <Text value={booking.booking_reference} />
                </Field>
                <Field label="Booking status">
                  <BookingStatusBadge status={booking.status} />
                </Field>
                <Field label="Source">
                  <Text
                    value={
                      booking.booking_source === "ADMIN" ? "Admin" : "Website"
                    }
                  />
                </Field>
                <Field label="Arena">
                  <Text value={booking.futsal_name} />
                </Field>
                <Field label="Booked on">
                  <Text value={formatDateTime(booking.created_at)} />
                </Field>
                <Field label="Last updated">
                  <Text value={formatDateTime(booking.updated_at)} />
                </Field>
              </Section>

              <Separator />

              <Section title="Slot">
                <Field label="Date">
                  <Text value={formatDate(booking.slot.date)} />
                </Field>
                <Field label="Time">
                  {formatTime12h(booking.slot.start_time)} –{" "}
                  {formatTime12h(booking.slot.end_time)}
                </Field>
                <Field label="Slot price">
                  Rs {Number(booking.slot.price).toLocaleString()}
                </Field>
                <Field label="Slot status">
                  <Text
                    value={
                      booking.slot.status.charAt(0) +
                      booking.slot.status.slice(1).toLowerCase()
                    }
                  />
                </Field>
              </Section>

              <Separator />

              <Section title="Customer">
                <Field label="Full name">
                  <Text value={booking.full_name} />
                </Field>
                <Field label="Phone number">
                  <Text value={booking.phone_number} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Email">
                    <Text value={booking.email} />
                  </Field>
                </div>
              </Section>

              <Separator />

              <Section title="Payment">
                <Field label="Amount">
                  Rs {Number(booking.amount).toLocaleString()}
                </Field>
                <Field label="Payment status">
                  <PaymentStatusBadge status={booking.payment_status} />
                </Field>
                <Field label="Payment method">
                  <Text
                    value={
                      paymentMethodLabels[booking.payment_method] ??
                      booking.payment_method
                    }
                  />
                </Field>
                <Field label="Advance paid">
                  Rs {Number(booking.advance_amount).toLocaleString()}
                </Field>
                <Field label="Remaining">
                  Rs {Number(booking.remaining_amount).toLocaleString()}
                </Field>
              </Section>

              <Separator />

              <Section title="Notes">
                <div className="sm:col-span-2">
                  <Field label="Notes">
                    <Text value={booking.notes} />
                  </Field>
                </div>
              </Section>

              {booking.cancelled_at ? (
                <>
                  <Separator />
                  <Section title="Cancellation">
                    <Field label="Cancelled at">
                      <Text value={formatDateTime(booking.cancelled_at)} />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Reason">
                        <Text value={booking.cancellation_reason} />
                      </Field>
                    </div>
                  </Section>
                </>
              ) : null}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
