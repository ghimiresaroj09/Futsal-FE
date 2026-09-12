import { useState } from "react";
import type { FormEvent } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordChecklist } from "@/components/auth/PasswordChecklist";
import { RequiredLabel } from "@/components/auth/RequiredLabel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import { meetsAllPasswordRules } from "@/lib/password-rules";
import type { ApiEnvelope, ResetPasswordPayload } from "@/types/auth";

interface ResetState {
  email: string;
  /** Short-lived token from verifying the forgot-password OTP. */
  resetToken?: string;
}

export function ResetPasswordPage() {
  useDocumentTitle("Reset Password");
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResetState | null;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirm_password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Guard: reached only after OTP verification for a forgot-password flow.
  if (!state?.email || !state.resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const email = state.email;
  const resetToken = state.resetToken;

  const setField = (field: "password" | "confirm_password", value: string) => {
    // Spaces are not allowed in passwords.
    const clean = value.replace(/\s/g, "");
    if (field === "password") setPassword(clean);
    else setConfirmPassword(clean);
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    if (!meetsAllPasswordRules(password)) {
      nextErrors.password = "Password doesn't meet all the requirements below.";
    }
    if (confirmPassword !== password) {
      nextErrors.confirm_password = "Passwords do not match.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setFormError(null);

    const payload: ResetPasswordPayload = {
      email,
      new_password: password,
      confirm_password: confirmPassword,
      reset_token: resetToken,
    };

    try {
      const response = await api.post<ApiEnvelope<object>>(
        "/api/v1/auth/reset-password/",
        payload,
        // Render's free tier can take a while on a cold start.
        { timeout: 60_000 },
      );

      toast.success("Password reset!", { description: response.message });
      navigate("/login", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        // Surface per-field messages, e.g. errors.new_password: ["…"]
        const fieldErrors = (
          error.details as { errors?: Record<string, string[]> } | undefined
        )?.errors;
        if (fieldErrors) {
          setErrors((previous) => ({
            ...previous,
            password: fieldErrors.new_password?.[0] ?? previous.password,
            confirm_password:
              fieldErrors.confirm_password?.[0] ?? previous.confirm_password,
          }));
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const showChecklist = passwordFocused || password.length > 0;
  const confirmMismatch =
    confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <AuthShell
      title="Reset password"
      subtitle={`Set a new password for ${email}.`}
      imageAlt="Nexus Futsal outdoor court"
      footer={
        <p className="text-muted-foreground">
          Remembered your password?{" "}
          <button
            type="button"
            className="text-primary cursor-pointer font-semibold hover:underline"
            onClick={() => navigate("/login", { replace: true })}
          >
            Back to login
          </button>
        </p>
      }
    >
      <form
        className="flex flex-1 flex-col justify-center space-y-4"
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
          <RequiredLabel htmlFor="password">New password</RequiredLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              autoComplete="new-password"
              maxLength={64}
              className="pr-10"
              value={password}
              onChange={(e) => setField("password", e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              aria-invalid={Boolean(errors.password)}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer outline-none"
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>
          {showChecklist ? (
            <PasswordChecklist value={password} className="mt-1" />
          ) : null}
          {errors.password ? (
            <p className="text-destructive text-xs">{errors.password}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="confirm_password">
            Confirm new password
          </RequiredLabel>
          <Input
            id="confirm_password"
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            maxLength={64}
            value={confirmPassword}
            onChange={(e) => setField("confirm_password", e.target.value)}
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
          {loading ? "Resetting…" : "Reset Password"}
        </Button>
      </form>
    </AuthShell>
  );
}
