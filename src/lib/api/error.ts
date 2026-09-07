import { AxiosError } from "axios";

/**
 * Normalised error thrown by every API call (see src/lib/api/client.ts).
 * Catch `ApiError` in components instead of digging through axios errors.
 */
export class ApiError extends Error {
  readonly status: number | null;
  readonly code: string | null;
  readonly details: unknown;

  constructor(
    message: string,
    status: number | null = null,
    code: string | null = null,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isNetworkError(): boolean {
    return this.status === null;
  }

  /** Convert any thrown value (axios error, Error, unknown) into an ApiError. */
  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (error instanceof AxiosError) {
      const data = error.response?.data as Record<string, unknown> | undefined;
      const message =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        error.message ||
        "Request failed";
      const code = typeof data?.code === "string" ? data.code : null;
      return new ApiError(message, error.response?.status ?? null, code, data);
    }

    if (error instanceof Error) {
      return new ApiError(error.message);
    }

    return new ApiError("An unknown error occurred");
  }
}
