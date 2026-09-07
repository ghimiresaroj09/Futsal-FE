import { useState } from "react";
import type { FormEvent } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
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
import { useAuthStore } from "@/store/auth-store";
import type { ApiEnvelope } from "@/types/auth";

export function ChangePasswordPage() {
  useDocumentTitle("Change Password");
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [errors, setErrors] = useState<{
    current_password?: string;
    password?: string;
    confirm_password?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Guard: only signed-in users can change their password.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const setField = (
    field: "current_password" | "password" | "confirm_password",
    value: string,
  ) => {
    const clean = value.replace(/\s/g, ""); // no spaces in passwords
    if (field === "current_password") setCurrentPassword(clean);
    else if (field === "password") setNewPassword(clean);
    else setConfirmPassword(clean);
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    if (currentPassword.length < 6) {
      nextErrors.current_password = "Enter your current password.";
    }
    if (!meetsAllPasswordRules(newPassword)) {
      nextErrors.password = "Password doesn't meet all the requirements below.";
    }
    if (newPassword === currentPassword) {
      nextErrors.password =
        "New password must be different from the current one.";
    }
    if (confirmPassword !== newPassword) {
      nextErrors.confirm_password = "Passwords do not match.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const response = await api.post<ApiEnvelope<object>>(
        "/api/v1/auth/change-password/",
        {
          old_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        // Authenticated request — Bearer token in the header.
        // Render's free tier can take a while on a cold start.
        { timeout: 60_000, headers: { Authorization: `Bearer ${token}` } },
      );

      // The backend invalidates the session on success ("Please login
      // again") — clear the local tokens and head to the login page.
      logout();
      toast.success("Password changed", { description: response.message });
      navigate("/login", { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        // Map backend field errors onto the form (old_password is our
        // "current password" field, new_password our "new password").
        const fieldErrors = (
          error.details as { errors?: Record<string, string[]> } | undefined
        )?.errors;
        if (fieldErrors) {
          setErrors((previous) => ({
            ...previous,
            current_password:
              fieldErrors.old_password?.[0] ?? previous.current_password,
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

  const showChecklist = newPasswordFocused || newPassword.length > 0;
  const confirmMismatch =
    confirmPassword.length > 0 && confirmPassword !== newPassword;

  return (
    <AuthShell
      title="Change password"
      subtitle="Enter your current password and pick a new one."
      image="/images/venue-indoor.jpg"
      imageAlt="Nexus Futsal indoor court"
      footer={
        <button
          type="button"
          className="text-primary cursor-pointer font-semibold hover:underline"
          onClick={() => navigate("/profile")}
        >
          Back to profile
        </button>
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
          <RequiredLabel htmlFor="current_password">
            Current password
          </RequiredLabel>
          <div className="relative">
            <Input
              id="current_password"
              type={showCurrent ? "text" : "password"}
              placeholder="Enter your current password"
              autoComplete="current-password"
              className="pr-10"
              value={currentPassword}
              onChange={(e) => setField("current_password", e.target.value)}
              aria-invalid={Boolean(errors.current_password)}
              required
            />
            <button
              type="button"
              aria-label={showCurrent ? "Hide password" : "Show password"}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer outline-none"
              onClick={() => setShowCurrent((visible) => !visible)}
            >
              {showCurrent ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>
          {errors.current_password ? (
            <p className="text-destructive text-xs">
              {errors.current_password}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="password">New password</RequiredLabel>
          <div className="relative">
            <Input
              id="password"
              type={showNew ? "text" : "password"}
              placeholder="Enter your new password"
              autoComplete="new-password"
              maxLength={64}
              className="pr-10"
              value={newPassword}
              onChange={(e) => setField("password", e.target.value)}
              onFocus={() => setNewPasswordFocused(true)}
              onBlur={() => setNewPasswordFocused(false)}
              aria-invalid={Boolean(errors.password)}
              required
            />
            <button
              type="button"
              aria-label={showNew ? "Hide password" : "Show password"}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer outline-none"
              onClick={() => setShowNew((visible) => !visible)}
            >
              {showNew ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>
          {showChecklist ? (
            <PasswordChecklist value={newPassword} className="mt-1" />
          ) : null}
          {errors.password ? (
            <p className="text-destructive text-xs">{errors.password}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="confirm_password">
            Confirm new password
          </RequiredLabel>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              maxLength={64}
              className="pr-10"
              value={confirmPassword}
              onChange={(e) => setField("confirm_password", e.target.value)}
              aria-invalid={Boolean(errors.confirm_password) || confirmMismatch}
              required
            />
            <button
              type="button"
              aria-label={showConfirm ? "Hide password" : "Show password"}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer outline-none"
              onClick={() => setShowConfirm((visible) => !visible)}
            >
              {showConfirm ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>
          {errors.confirm_password || confirmMismatch ? (
            <p className="text-destructive text-xs">
              {errors.confirm_password ?? "Passwords do not match."}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Changing…" : "Change Password"}
        </Button>
      </form>
    </AuthShell>
  );
}
