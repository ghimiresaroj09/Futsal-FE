import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  CircleCheckIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SendIcon,
} from "lucide-react";
import { toast } from "sonner";

import { RequiredLabel } from "@/components/auth/RequiredLabel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import { formatTime12h } from "@/lib/format";
import {
  EMAIL_PATTERN,
  FULL_NAME_PATTERN,
  PHONE_PATTERN,
} from "@/lib/validation";
import { useFutsalStore } from "@/store/futsal-store";
import type { ContactMessage, ContactPayload } from "@/types/contact";
import type { ApiEnvelope } from "@/types/auth";

/** Contact form payload — matches the backend contract. */
export type { ContactPayload };

const CONTACT_EMAIL = "hello@nexusfms.com";
const CONTACT_PHONE = "+977 9800000000";
const MAPS_URL = "https://maps.google.com/?q=Balaju+Height,+Kathmandu";

const EMPTY_FORM: ContactPayload = {
  name: "",
  email: "",
  phone_number: "",
  subject: "",
  message: "",
};

export function ContactPage() {
  useDocumentTitle("Contact Us");
  const futsal = useFutsalStore((s) => s.futsal);
  const [form, setForm] = useState<ContactPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactPayload, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const setField = (field: keyof ContactPayload) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePhoneChange = (value: string) =>
    setField("phone_number")(value.replace(/\D/g, "").slice(0, 10));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const name = form.name.trim().replace(/\s+/g, " ");
    const email = form.email.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();

    const nextErrors: Partial<Record<keyof ContactPayload, string>> = {};
    if (name.length < 3 || name.length > 50 || !FULL_NAME_PATTERN.test(name)) {
      nextErrors.name = "Full name must be 3–50 letters, alphabets only.";
    }
    if (!EMAIL_PATTERN.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!PHONE_PATTERN.test(form.phone_number)) {
      nextErrors.phone_number =
        "Enter a 10-digit number starting with 98, 97 or 96.";
    }
    if (subject.length < 3 || subject.length > 80) {
      nextErrors.subject = "Subject must be 3–80 characters.";
    }
    if (message.length < 10 || message.length > 500) {
      nextErrors.message = "Message must be 10–500 characters.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: ContactPayload = { ...form, name, email, subject, message };

    setLoading(true);
    setFormError(null);

    try {
      const response = await api.post<ApiEnvelope<ContactMessage>>(
        "/api/v1/contact/",
        payload,
        // Render's free tier can take a while on a cold start.
        { timeout: 60_000 },
      );

      setSent(true);
      toast.success("Message sent", { description: response.message });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        // Surface per-field messages from the backend's errors object.
        const fieldErrors = (
          error.details as
            | { errors?: Partial<Record<keyof ContactPayload, string[]>> }
            | undefined
        )?.errors;
        if (fieldErrors) {
          setErrors((previous) => ({
            ...previous,
            name: fieldErrors.name?.[0] ?? previous.name,
            email: fieldErrors.email?.[0] ?? previous.email,
            phone_number:
              fieldErrors.phone_number?.[0] ?? previous.phone_number,
            subject: fieldErrors.subject?.[0] ?? previous.subject,
            message: fieldErrors.message?.[0] ?? previous.message,
          }));
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSent(false);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
      {/* Page header */}
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Contact Us
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          We'd love to hear from you
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Booking questions, event plans, a compliment for the groundskeeper —
          drop us a message and we'll get back to you, or reach us directly.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-5 lg:gap-8">
        {/* Message form */}
        <Card className="gap-0 rounded-2xl p-6 sm:p-8 lg:order-2 lg:col-span-3">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CircleCheckIcon className="size-7" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold tracking-tight">
                  Message sent!
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Thanks {form.name.trim().split(" ")[0]} — we'll reply to{" "}
                  <span className="font-medium text-foreground">
                    {form.email}
                  </span>{" "}
                  within a few hours during opening times.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={resetForm}
                className="cursor-pointer"
              >
                Send another message
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold tracking-tight">
                Send us a message
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Fill in the form below — we usually reply within a couple of
                hours.
              </p>

              <form
                className="mt-6 space-y-4"
                onSubmit={handleSubmit}
                noValidate
              >
                {formError ? (
                  <div
                    className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm"
                    role="alert"
                  >
                    {formError}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <RequiredLabel htmlFor="contact-name">
                    Full name
                  </RequiredLabel>
                  <Input
                    id="contact-name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setField("name")(e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    maxLength={50}
                    required
                  />
                  {errors.name ? (
                    <p className="text-destructive text-xs">{errors.name}</p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <RequiredLabel htmlFor="contact-email">Email</RequiredLabel>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setField("email")(e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      required
                    />
                    {errors.email ? (
                      <p className="text-destructive text-xs">{errors.email}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel htmlFor="contact-phone">
                      Phone number
                    </RequiredLabel>
                    <Input
                      id="contact-phone"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      value={form.phone_number}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      aria-invalid={Boolean(errors.phone_number)}
                      maxLength={10}
                      required
                    />
                    {errors.phone_number ? (
                      <p className="text-destructive text-xs">
                        {errors.phone_number}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <RequiredLabel htmlFor="contact-subject">
                    Subject
                  </RequiredLabel>
                  <Input
                    id="contact-subject"
                    placeholder="e.g. Corporate event on a Saturday"
                    value={form.subject}
                    onChange={(e) => setField("subject")(e.target.value)}
                    aria-invalid={Boolean(errors.subject)}
                    maxLength={80}
                    required
                  />
                  {errors.subject ? (
                    <p className="text-destructive text-xs">{errors.subject}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <RequiredLabel htmlFor="contact-message">
                      Message
                    </RequiredLabel>
                    <span className="text-muted-foreground/60 text-xs tabular-nums">
                      {form.message.length}/500
                    </span>
                  </div>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us what's on your mind"
                    value={form.message}
                    onChange={(e) => setField("message")(e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    maxLength={500}
                    rows={5}
                    className="resize-none"
                    required
                  />
                  {errors.message ? (
                    <p className="text-destructive text-xs">{errors.message}</p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Send Message"}
                  {!loading && <SendIcon aria-hidden="true" />}
                </Button>
              </form>
            </>
          )}
        </Card>

        {/* Contact details */}
        <div className="space-y-5 lg:order-1 lg:col-span-2">
          <Card className="gap-0 rounded-2xl p-6">
            <h2 className="text-sm font-semibold">Reach us directly</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              The counter is staffed whenever the lights are on.
            </p>

            <ul className="mt-6 space-y-5">
              <li className="flex items-start gap-3.5">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <MapPinIcon className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Visit
                  </p>
                  <p className="mt-0.5 text-sm font-medium">
                    {futsal
                      ? `${futsal.address}, ${futsal.location}`
                      : "Balaju Height, Kathmandu"}
                  </p>
                  <a
                    href={
                      futsal
                        ? `https://maps.google.com/?q=${encodeURIComponent(`${futsal.address}, ${futsal.location}`)}`
                        : MAPS_URL
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary text-xs font-medium underline-offset-2 hover:underline"
                  >
                    Get directions
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <PhoneIcon className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Call
                  </p>
                  <a
                    href={`tel:${(futsal?.phone ?? CONTACT_PHONE).replace(/[^\d+]/g, "")}`}
                    className="mt-0.5 block text-sm font-medium hover:underline"
                  >
                    {futsal?.phone ?? CONTACT_PHONE}
                  </a>
                  <p className="text-muted-foreground/70 mt-0.5 text-xs">
                    Fastest way to reach us during opening hours.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <MailIcon className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Email
                  </p>
                  <a
                    href={`mailto:${futsal?.email ?? CONTACT_EMAIL}`}
                    className="mt-0.5 block text-sm font-medium hover:underline"
                  >
                    {futsal?.email ?? CONTACT_EMAIL}
                  </a>
                  <p className="text-muted-foreground/70 mt-0.5 text-xs">
                    We reply within a few hours.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <ClockIcon className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Hours
                  </p>
                  <p className="mt-0.5 text-sm font-medium">
                    {formatTime12h(futsal?.opening_time ?? "06:00:00")} –{" "}
                    {formatTime12h(futsal?.closing_time ?? "22:00:00")}
                  </p>
                  <p className="text-muted-foreground/70 mt-0.5 text-xs">
                    Open every day of the week.
                  </p>
                </div>
              </li>
            </ul>
          </Card>

          <div className="border-primary/20 bg-primary/5 rounded-2xl border p-5">
            <p className="text-sm font-semibold">Looking to book instead?</p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              Skip the queue — pick your slot online and pay at the counter.
            </p>
            <Button asChild size="sm" className="mt-3 cursor-pointer">
              <Link to="/bookings">Book a Slot</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
