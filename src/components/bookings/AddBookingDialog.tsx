import { useState } from "react";
import type { FormEvent } from "react";
import { CalendarDaysIcon } from "lucide-react";

import { RequiredLabel } from "@/components/auth/RequiredLabel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBooking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/error";
import { formatDate, formatTime12h } from "@/lib/format";
import type { BookableSlot } from "@/lib/slots";
import { useAuthStore } from "@/store/auth-store";
import type { Booking } from "@/types/booking";
import {
  EMAIL_PATTERN,
  FULL_NAME_PATTERN,
  PHONE_PATTERN,
} from "@/lib/validation";

/** Booking creation payload — matches the backend contract. */
export interface BookingPayload {
  full_name: string;
  email: string;
  phone_number: string;
  notes: string;
}

/**
 * Add Booking modal — opens when an available slot is selected.
 * POST /api/v1/bookings/ with { slot_id, full_name, email, phone_number, notes };
 * the form is prefilled from the signed-in account.
 */
export function AddBookingDialog({
  slot,
  onClose,
  onConfirm,
}: {
  slot: BookableSlot | null;
  onClose: () => void;
  /** Called with the created booking record after a successful POST. */
  onConfirm: (slot: BookableSlot, created: Booking) => void;
}) {
  // Prefill from the signed-in user (the slot click requires login).
  const user = useAuthStore((s) => s.user);
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{
    full_name?: string;
    email?: string;
    phone_number?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Guarded render (parent only opens this with a slot, but stay safe).
  if (!slot) return null;

  const trimmedName = fullName.trim().replace(/\s+/g, " ");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    if (
      trimmedName.length < 3 ||
      trimmedName.length > 50 ||
      !FULL_NAME_PATTERN.test(trimmedName)
    ) {
      nextErrors.full_name = "Full name must be 3–50 letters, alphabets only.";
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!PHONE_PATTERN.test(phone)) {
      nextErrors.phone_number =
        "Enter a 10-digit number starting with 98, 97 or 96.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: BookingPayload = {
      full_name: trimmedName,
      email: email.trim(),
      phone_number: phone,
      notes: notes.trim(),
    };

    if (!slot.id) {
      setFormError(
        "This slot can't be booked right now — refresh the page and try again.",
      );
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      // POST /api/v1/bookings/ — response is the created booking record.
      const created = await createBooking(slot.id, payload);
      onConfirm(slot, created);
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        const fieldErrors = (
          error.details as { errors?: Record<string, string[]> } | undefined
        )?.errors;
        if (fieldErrors) {
          setErrors((previous) => ({
            ...previous,
            full_name: fieldErrors.full_name?.[0] ?? previous.full_name,
            email: fieldErrors.email?.[0] ?? previous.email,
            phone_number:
              fieldErrors.phone_number?.[0] ?? previous.phone_number,
          }));
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book this slot</DialogTitle>
          <DialogDescription>
            Confirm your details — payment happens at the counter.
          </DialogDescription>
        </DialogHeader>

        {/* Selected slot summary */}
        <div className="bg-muted/60 flex items-center gap-3 rounded-lg p-3">
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
            <CalendarDaysIcon className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{formatDate(slot.date)}</p>
            <p className="text-muted-foreground text-xs tabular-nums">
              {formatTime12h(slot.start_time)} – {formatTime12h(slot.end_time)}
            </p>
          </div>
          <p className="text-primary ml-auto text-sm font-bold tabular-nums">
            Rs {slot.price.toLocaleString()}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {formError ? (
            <div
              className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm"
              role="alert"
            >
              {formError}
            </div>
          ) : null}
          <div className="space-y-2">
            <RequiredLabel htmlFor="booking-full-name">Full name</RequiredLabel>
            <Input
              id="booking-full-name"
              placeholder="Enter your full name"
              autoComplete="name"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setErrors((previous) => ({
                  ...previous,
                  full_name: undefined,
                }));
              }}
              aria-invalid={Boolean(errors.full_name)}
              required
            />
            {errors.full_name ? (
              <p className="text-destructive text-xs">{errors.full_name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="booking-email">Email</RequiredLabel>
            <Input
              id="booking-email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((previous) => ({ ...previous, email: undefined }));
              }}
              aria-invalid={Boolean(errors.email)}
              required
            />
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="booking-phone">Phone number</RequiredLabel>
            <Input
              id="booking-phone"
              type="tel"
              inputMode="numeric"
              placeholder="Enter your phone number"
              autoComplete="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
                setErrors((previous) => ({
                  ...previous,
                  phone_number: undefined,
                }));
              }}
              aria-invalid={Boolean(errors.phone_number)}
              required
            />
            {errors.phone_number ? (
              <p className="text-destructive text-xs">{errors.phone_number}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="booking-notes"
              className="flex items-center gap-2 text-sm leading-none font-medium select-none"
            >
              Notes
              <span className="text-muted-foreground text-xs font-normal">
                (optional)
              </span>
            </label>
            <Textarea
              id="booking-notes"
              placeholder="Anything we should know? Team name, requests…"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              maxLength={200}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Booking…" : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
