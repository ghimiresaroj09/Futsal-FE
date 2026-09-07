import { useEffect, useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import { useAuthStore } from "@/store/auth-store";
import type {
  ApiEnvelope,
  VerifyOtpRegistrationData,
  VerifyOtpResetData,
} from "@/types/auth";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 120;

type OtpPurpose = "signup" | "reset";

interface OtpState {
  email: string;
  purpose: OtpPurpose;
}

function formatCooldown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

/** Six single-digit boxes: auto-advance, backspace-back, arrow keys, paste. */
function OtpInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focusCell = (index: number) => {
    const target = refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))];
    target?.focus();
    target?.select();
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;

    const next = [...value];
    digits
      .slice(0, OTP_LENGTH - index)
      .split("")
      .forEach((digit, offset) => {
        next[index + offset] = digit;
      });
    onChange(next);
    focusCell(Math.min(index + digits.length, OTP_LENGTH - 1));
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...value];
      if (next[index]) {
        next[index] = "";
        onChange(next);
      } else if (index > 0) {
        next[index - 1] = "";
        onChange(next);
        focusCell(index - 1);
      }
    }
    if (event.key === "ArrowLeft") focusCell(index - 1);
    if (event.key === "ArrowRight") focusCell(index + 1);
  };

  const handlePaste = (
    index: number,
    event: ClipboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!digits) return;

    const next = [...value];
    digits.split("").forEach((digit, offset) => {
      if (index + offset < OTP_LENGTH) next[index + offset] = digit;
    });
    onChange(next);
    focusCell(Math.min(index + digits.length, OTP_LENGTH - 1));
  };

  return (
    <div
      className="mx-auto grid w-full max-w-[280px] grid-cols-6 gap-1.5 sm:gap-2"
      aria-label="6-digit verification code"
    >
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          id={`otp-${index}`}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of 6`}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={() => focusCell(index)}
          className="border-input bg-card h-10 w-full rounded-md border text-center text-base font-semibold outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      ))}
    </div>
  );
}

export function OtpVerificationPage() {
  useDocumentTitle("Verify OTP");
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OtpState | null;

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);

  // Tick the resend cooldown down to zero. (Runs on every render path —
  // hooks must not sit below the redirect guard below.)
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(
      () => setCooldown((remaining) => remaining - 1),
      1000,
    );
    return () => clearInterval(timer);
  }, [cooldown]);

  // Guard: this page needs an email + purpose from the previous step.
  if (
    !state?.email ||
    (state.purpose !== "signup" && state.purpose !== "reset")
  ) {
    return <Navigate to="/login" replace />;
  }

  const email = state.email;
  const purpose = state.purpose;
  const code = digits.join("");
  const isComplete = code.length === OTP_LENGTH;

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setFormError(null);

    try {
      const response = await api.post<ApiEnvelope<object>>(
        "/api/v1/auth/resend-otp/",
        {
          email,
          purpose: purpose === "signup" ? "REGISTRATION" : "FORGOT_PASSWORD",
        },
        // Render's free tier can take a while on a cold start.
        { timeout: 60_000 },
      );

      // Only start the cooldown once a new code is actually on its way.
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(""));
      toast.success("New code sent", { description: response.message });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!isComplete) return;
    setLoading(true);
    setFormError(null);

    try {
      if (purpose === "signup") {
        // Registration verify returns tokens + user — log straight in.
        const response = await api.post<ApiEnvelope<VerifyOtpRegistrationData>>(
          "/api/v1/auth/verify-otp/",
          { email, otp: code, purpose: "REGISTRATION" },
          // Render's free tier can take a while on a cold start.
          { timeout: 60_000 },
        );
        setAuth(
          response.data.access,
          response.data.refresh,
          response.data.user,
        );
        toast.success("Account verified!", { description: response.message });
        navigate("/", { replace: true });
      } else {
        // Forgot-password verify returns a short-lived reset_token.
        const response = await api.post<ApiEnvelope<VerifyOtpResetData>>(
          "/api/v1/auth/verify-otp/",
          { email, otp: code, purpose: "FORGOT_PASSWORD" },
          { timeout: 60_000 },
        );
        toast.success("Code verified", { description: response.message });
        navigate("/reset-password", {
          replace: true,
          state: { email, resetToken: response.data.reset_token },
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        // e.g. errors: { otp: ["No active OTP found."] } — clear for a retry.
        setDigits(Array(OTP_LENGTH).fill(""));
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Verify your code"
      subtitle={`Enter the 6-digit code we sent to ${email}.`}
      image="/images/action-1.jpg"
      imageAlt="Player skills on the Nexus Futsal court"
      footer={
        <p className="text-muted-foreground">
          Wrong email?{" "}
          <button
            type="button"
            className="text-primary cursor-pointer font-semibold hover:underline"
            onClick={() =>
              navigate(purpose === "signup" ? "/signup" : "/forgot-password", {
                replace: true,
              })
            }
          >
            Go back
          </button>
        </p>
      }
    >
      <div className="flex flex-1 flex-col justify-center gap-5">
        {formError ? (
          <div
            className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-center text-sm"
            role="alert"
          >
            {formError}
          </div>
        ) : null}

        <OtpInput
          value={digits}
          onChange={(next) => {
            setDigits(next);
            setFormError(null);
          }}
        />

        <Button
          className="mx-auto w-full max-w-[280px] cursor-pointer"
          size="lg"
          onClick={handleVerify}
          disabled={!isComplete || loading}
        >
          {loading ? "Verifying…" : "Verify"}
        </Button>

        <div className="text-center">
          {cooldown > 0 ? (
            <p className="text-muted-foreground text-sm tabular-nums">
              Resend OTP in {formatCooldown(cooldown)}
            </p>
          ) : (
            <button
              type="button"
              className="text-primary cursor-pointer text-sm font-semibold hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              disabled={resending}
              onClick={handleResend}
            >
              {resending ? "Resending…" : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
