import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { RequiredLabel } from "@/components/auth/RequiredLabel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import type { ApiEnvelope } from "@/types/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
  useDocumentTitle("Forgot Password");
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<ApiEnvelope<object>>(
        "/api/v1/auth/forgot-password/",
        { email: trimmed },
        // Render's free tier can take a while on a cold start.
        { timeout: 60_000 },
      );

      toast.success("OTP sent", { description: response.message });
      navigate("/verify-otp", {
        replace: true,
        state: { email: trimmed, purpose: "reset" },
      });
    } catch (caught) {
      if (caught instanceof ApiError) {
        // Backend field error, e.g. errors.email: ["No active account exists with that email."]
        const fieldErrors = (
          caught.details as { errors?: { email?: string[] } } | undefined
        )?.errors;
        setError(fieldErrors?.email?.[0] ?? caught.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="No worries — enter your email and we'll send you a 6-digit code to reset it."
      imageAlt="Nexus Futsal rooftop court at golden hour"
      footer={
        <p className="text-muted-foreground">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-primary font-semibold hover:underline"
          >
            Back to login
          </Link>
        </p>
      }
    >
      <form
        className="flex flex-1 flex-col justify-center space-y-4"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="space-y-2">
          <RequiredLabel htmlFor="email">Email</RequiredLabel>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            aria-invalid={Boolean(error)}
            required
          />
          {error ? <p className="text-destructive text-xs">{error}</p> : null}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Sending…" : "Send Code"}
        </Button>

        <Button asChild variant="ghost" className="w-full" size="sm">
          <Link to="/login">
            <ArrowLeftIcon aria-hidden="true" />
            Back to login
          </Link>
        </Button>
      </form>
    </AuthShell>
  );
}
