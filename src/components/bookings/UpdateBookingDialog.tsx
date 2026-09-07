import { useState } from "react";
import type { FormEvent } from "react";

import { RequiredLabel } from "@/components/auth/RequiredLabel";
import { BookingStatusBadge } from "@/components/bookings/status-badges";
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
import { updateBooking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/error";
import {
  EMAIL_PATTERN,
  FULL_NAME_PATTERN,
  PHONE_PATTERN,
} from "@/lib/validation";
import type { Booking } from "@/types/booking";

/** Booking update payload — matches the backend contract. */
export interface UpdateBookingPayload {
  full_name: string;
  email: string;
  phone_number: string;
  notes: string;
}

/**
 * Update dialog (the "update" action): edit contact details + notes.
 * Only reachable for PENDING bookings (enforced by the caller).
 * Mount-fresh state per booking via `key` in the parent.
 */
export function UpdateBookingDialog({
  booking,
  onClose,
  onSave,
}: {
  booking: Booking | null;
  onClose: () => void;
  /** Called with the fresh booking record after a successful PATCH. */
  onSave: (booking: Booking, updated: Booking) => void;
}) {
  // Hooks always run (stable order); values only matter when booking exists.
  const [fullName, setFullName] = useState(booking?.full_name ?? "");
  const [email, setEmail] = useState(booking?.email ?? "");
  const [phone, setPhone] = useState(booking?.phone_number ?? "");
  const [notes, setNotes] = useState(booking?.notes ?? "");
  const [errors, setErrors] = useState<{
    full_name?: string;
    email?: string;
    phone_number?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!booking) return null;

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

    const payload: UpdateBookingPayload = {
      full_name: trimmedName,
      email: email.trim(),
      phone_number: phone,
      notes: notes.trim(),
    };

    setSaving(true);
    setFormError(null);

    try {
      // PATCH /api/v1/bookings/:id/ — the response is the full updated
      // booking, handed back to the page to refresh the row.
      const updated = await updateBooking(booking.id, payload);
      onSave(booking, updated);
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
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Update booking
            <BookingStatusBadge status={booking.status} />
          </DialogTitle>
          <DialogDescription>
            {booking.booking_reference} — edit your details for this slot.
          </DialogDescription>
        </DialogHeader>

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
            <RequiredLabel htmlFor="update-full-name">Full name</RequiredLabel>
            <Input
              id="update-full-name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((prev) => ({ ...prev, full_name: undefined }));
              }}
              aria-invalid={Boolean(errors.full_name)}
              maxLength={50}
              required
            />
            {errors.full_name ? (
              <p className="text-destructive text-xs">{errors.full_name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="update-email">Email</RequiredLabel>
            <Input
              id="update-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              aria-invalid={Boolean(errors.email)}
              required
            />
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="update-phone">Phone number</RequiredLabel>
            <Input
              id="update-phone"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                setErrors((prev) => ({ ...prev, phone_number: undefined }));
              }}
              aria-invalid={Boolean(errors.phone_number)}
              maxLength={10}
              required
            />
            {errors.phone_number ? (
              <p className="text-destructive text-xs">{errors.phone_number}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="update-notes">Notes</RequiredLabel>
            <Textarea
              id="update-notes"
              placeholder="Add or update notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
