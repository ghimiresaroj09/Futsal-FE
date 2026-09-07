import { useState } from "react";
import type { FormEvent } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { RequiredLabel } from "@/components/auth/RequiredLabel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import { clearTokens } from "@/lib/tokens";
import { useAuthStore } from "@/store/auth-store";
import type { ApiEnvelope, LoginData } from "@/types/auth";

const REMEMBER_KEY = "nexus:remembered-email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Field = "email" | "password";

export function LoginPage() {
  useDocumentTitle("Login");
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  // Prefill the email when "remember me" was used before.
  const rememberedEmail = localStorage.getItem(REMEMBER_KEY) ?? "";
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(Boolean(rememberedEmail));
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setField = (field: Field) => (value: string) => {
    if (field === "email") setEmail(value);
    else setPassword(value);
    // Clear that field's error as soon as the user edits it.
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleRememberChange = (checked: boolean) => {
    setRemember(checked);
    // Save / clear immediately when the box is clicked (if there's an email).
    if (checked && EMAIL_PATTERN.test(email)) {
      localStorage.setItem(REMEMBER_KEY, email);
    } else if (!checked) {
      localStorage.removeItem(REMEMBER_KEY);
    }
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<Field, string>> = {};

    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    // Re-save the email in case it was typed after checking the box.
    if (remember) localStorage.setItem(REMEMBER_KEY, email.trim());
    else localStorage.removeItem(REMEMBER_KEY);

    // Logging in always REPLACES the session: drop any stale tokens from
    // a previous session first, so the fresh pair lands in a clean jar.
    clearTokens();

    setLoading(true);
    setFormError(null);

    try {
      const response = await api.post<ApiEnvelope<LoginData>>(
        "/api/v1/auth/login/",
        { email: email.trim(), password },
        // Render's free tier can take a while on a cold start.
        { timeout: 60_000 },
      );

      setAuth(response.data.access, response.data.refresh, response.data.user);
      toast.success("Welcome back!", {
        description: `You're logged in as ${response.data.user.full_name}.`,
      });
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? "/", { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to book your next match at Nexus Futsal."
      image="/images/venue-indoor.jpg"
      imageAlt="Nexus Futsal indoor court"
      footer={
        <p className="text-muted-foreground">
          New to Nexus?{" "}
          <Link
            to="/signup"
            className="text-primary font-semibold hover:underline"
          >
            Create an account
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
          <RequiredLabel htmlFor="email">Email</RequiredLabel>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(e) => setField("email")(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              required
            />
          </div>
          {errors.email ? (
            <p className="text-destructive text-xs">{errors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="password">Password</RequiredLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="pr-10"
              value={password}
              onChange={(e) => setField("password")(e.target.value)}
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
          {errors.password ? (
            <p className="text-destructive text-xs">{errors.password}</p>
          ) : null}
        </div>

        {/* Remember me + Forgot password on one row */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium select-none">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(checked) =>
                handleRememberChange(checked === true)
              }
            />
            Remember me
          </label>
          <button
            type="button"
            className="text-primary cursor-pointer text-sm font-semibold hover:underline"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </Button>
      </form>
    </AuthShell>
  );
}
