import { useState } from "react";
import type { FormEvent } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordChecklist } from "@/components/auth/PasswordChecklist";
import { RequiredLabel } from "@/components/auth/RequiredLabel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import { passwordRules } from "@/lib/password-rules";
import type { ApiEnvelope, RegisterData, ValidationErrors } from "@/types/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FULL_NAME_PATTERN = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const PHONE_PATTERN = /^9[678]\d{8}$/;

interface SignUpForm {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

export function SignUpPage() {
  useDocumentTitle("Sign Up");
  const navigate = useNavigate();

  const [form, setForm] = useState<SignUpForm>({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpForm, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const setField = (field: keyof SignUpForm) => (value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    // Clear the field error as the user types.
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleFullNameChange = (value: string) => setField("full_name")(value);

  /** Digits only, hard-stopped at 10 characters. */
  const handlePhoneChange = (value: string) =>
    setField("phone_number")(value.replace(/\D/g, "").slice(0, 10));

  /** Spaces are simply not allowed in passwords. */
  const handlePasswordChange = (value: string) =>
    setField("password")(value.replace(/\s/g, ""));
  const handleConfirmPasswordChange = (value: string) =>
    setField("confirm_password")(value.replace(/\s/g, ""));

  const fullNameClean = form.full_name.trim().replace(/\s+/g, " ");

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof SignUpForm, string>> = {};

    if (
      fullNameClean.length < 3 ||
      fullNameClean.length > 50 ||
      !FULL_NAME_PATTERN.test(fullNameClean)
    ) {
      nextErrors.full_name = "Full name must be 3–50 letters, alphabets only.";
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!PHONE_PATTERN.test(form.phone_number)) {
      nextErrors.phone_number =
        "Enter a 10-digit number starting with 98, 97 or 96.";
    }
    if (!passwordRules.every((rule) => rule.met(form.password))) {
      nextErrors.password = "Password doesn't meet all the requirements below.";
    }
    if (form.confirm_password !== form.password) {
      nextErrors.confirm_password = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    // Payload matches the backend contract; inputs are trimmed (so
    // "  Saroj Ghimire  " submits as "Saroj Ghimire") and passwords
    // never contain spaces.
    const payload = {
      full_name: fullNameClean,
      email: form.email.trim(),
      phone_number: form.phone_number,
      password: form.password,
      confirm_password: form.confirm_password,
    };

    setLoading(true);
    setFormError(null);

    try {
      const response = await api.post<ApiEnvelope<RegisterData>>(
        "/api/v1/auth/register/",
        payload,
        // Render's free tier can take a while on a cold start.
        { timeout: 60_000 },
      );

      toast.success("Verify your email", {
        description: response.message,
      });
      navigate("/verify-otp", {
        replace: true,
        state: { email: payload.email, purpose: "signup" },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        // Surface per-field messages from the backend's errors object.
        const fieldErrors = (
          error.details as { errors?: ValidationErrors } | undefined
        )?.errors;
        if (fieldErrors) {
          const nextErrors: Partial<Record<keyof SignUpForm, string>> = {};
          for (const [field, messages] of Object.entries(fieldErrors)) {
            if (field in form && messages.length > 0) {
              nextErrors[field as keyof SignUpForm] = messages[0];
            }
          }
          setErrors((previous) => ({ ...previous, ...nextErrors }));
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const showChecklist = passwordFocused || form.password.length > 0;
  const confirmMismatch =
    form.confirm_password.length > 0 && form.confirm_password !== form.password;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Nexus FMS and book your futsal slots in seconds."
      imageAlt="Players celebrating a match at Nexus Futsal"
      footer={
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      }
    >
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
          <RequiredLabel htmlFor="full_name">Full name</RequiredLabel>
          <Input
            id="full_name"
            placeholder="Enter your full name"
            autoComplete="name"
            value={form.full_name}
            onChange={(e) => handleFullNameChange(e.target.value)}
            aria-invalid={Boolean(errors.full_name)}
            required
          />
          {errors.full_name ? (
            <p className="text-destructive text-xs">{errors.full_name}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <RequiredLabel htmlFor="email">Email</RequiredLabel>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
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
            <RequiredLabel htmlFor="phone_number">Phone number</RequiredLabel>
            <Input
              id="phone_number"
              type="tel"
              inputMode="numeric"
              placeholder="Enter your phone number"
              autoComplete="tel"
              value={form.phone_number}
              onChange={(e) => handlePhoneChange(e.target.value)}
              aria-invalid={Boolean(errors.phone_number)}
              required
            />
            {errors.phone_number ? (
              <p className="text-destructive text-xs">{errors.phone_number}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="password">Password</RequiredLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="new-password"
              maxLength={64}
              className="pr-10"
              value={form.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              aria-invalid={Boolean(errors.password)}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 outline-none"
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>

          {/* Live requirements checklist — appears while typing */}
          {showChecklist ? (
            <PasswordChecklist value={form.password} className="mt-1" />
          ) : null}
          {errors.password ? (
            <p className="text-destructive text-xs">{errors.password}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="confirm_password">
            Confirm password
          </RequiredLabel>
          <Input
            id="confirm_password"
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            maxLength={64}
            value={form.confirm_password}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            aria-invalid={Boolean(errors.confirm_password) || confirmMismatch}
            required
          />
          {errors.confirm_password || confirmMismatch ? (
            <p className="text-destructive text-xs">
              {errors.confirm_password ?? "Passwords do not match."}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Creating account…" : "Create Account"}
        </Button>

        <p className="text-muted-foreground text-center text-xs">
          By creating an account you agree to our fair-play rules. Payment
          happens at the counter — we never ask for card details online.
        </p>
      </form>
    </AuthShell>
  );
}
