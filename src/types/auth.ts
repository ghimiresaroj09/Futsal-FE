import type { AuthUser } from "@/store/auth-store";

/**
 * Auth API contracts — mirror the backend's /api/v1/auth/** responses.
 * Every response is wrapped in an envelope: { success, message, data }.
 */

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/** POST /api/v1/auth/login/ → data */
export interface LoginData {
  access: string;
  refresh: string;
  user: AuthUser;
}

/** POST /api/v1/auth/login/ */
export interface LoginPayload {
  email: string;
  password: string;
}

/** POST /api/v1/auth/register/ → data (the created, not-yet-verified user) */
export type RegisterData = AuthUser;

/** POST /api/v1/auth/register/ */
export interface RegisterPayload {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

/**
 * Backend validation failure body:
 * { success: false, message: "Validation failed.", errors: { field: string[] } }
 */
export interface ValidationErrors {
  [field: string]: string[];
}

/** OTP purposes as the backend expects them. */
export type OtpPurpose = "REGISTRATION" | "FORGOT_PASSWORD";

/** POST /api/v1/auth/verify-otp/ */
export interface VerifyOtpPayload {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}

/**
 * POST /api/v1/auth/verify-otp/ → data. The shape depends on `purpose`:
 * - REGISTRATION → tokens + user (the user is logged in on verify)
 * - FORGOT_PASSWORD → a short-lived reset_token for the reset-password step
 */
export type VerifyOtpRegistrationData = LoginData;

export interface VerifyOtpResetData {
  reset_token: string;
}

/** POST /api/v1/auth/reset-password/ */
export interface ResetPasswordPayload {
  email: string;
  new_password: string;
  confirm_password: string;
  reset_token: string;
}

/** POST /api/v1/auth/refresh/ → data (rotated tokens) */
export interface RefreshData {
  access: string;
  refresh: string;
}
