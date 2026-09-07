import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  ArrowLeftIcon,
  CameraIcon,
  LoaderCircleIcon,
  SaveIcon,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { RequiredLabel } from "@/components/auth/RequiredLabel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import { getInitials } from "@/lib/format";
import { useAuthStore } from "@/store/auth-store";
import type { AuthUser } from "@/store/auth-store";
import type { ApiEnvelope } from "@/types/auth";

const FULL_NAME_PATTERN = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const PHONE_PATTERN = /^9[678]\d{8}$/;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
    </div>
  );
}

export function ProfileEditPage() {
  useDocumentTitle("Edit Profile");
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  // Seeded from the auth store until the profile endpoint is wired up.
  // TODO: replace with `api.get("/profile")` once the backend is connected.
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const email = user?.email ?? "";

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    full_name?: string;
    phone_number?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Hydrate the form with the freshest profile on mount (without
  // clobbering fields the user already started editing).
  const touched = useRef(false);
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const response = await api.get<ApiEnvelope<AuthUser>>(
          "/api/v1/users/me/",
          // Authenticated request — Bearer token in the header.
          // Render's free tier can take a while on a cold start.
          { timeout: 60_000, headers: { Authorization: `Bearer ${token}` } },
        );
        if (cancelled || touched.current) return;
        setFullName(response.data.full_name);
        setPhone(response.data.phone_number);
        setUser(response.data);
      } catch {
        // Form stays seeded from the auth store — editing still works.
      }
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  // Guard: only signed-in users can edit a profile.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image is too large", {
        description: "Please choose an image under 2MB.",
      });
      event.target.value = "";
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () =>
      setImage(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = fullName.trim().replace(/\s+/g, " ");
    const nextErrors: typeof errors = {};

    if (
      trimmedName.length < 3 ||
      trimmedName.length > 50 ||
      !FULL_NAME_PATTERN.test(trimmedName)
    ) {
      nextErrors.full_name = "Full name must be 3–50 letters, alphabets only.";
    }
    if (!PHONE_PATTERN.test(phone)) {
      nextErrors.phone_number =
        "Enter a 10-digit number starting with 98, 97 or 96.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setFormError(null);

    // Multipart form data — matches the backend's PATCH /users/me/ contract.
    const payload = new FormData();
    payload.append("full_name", trimmedName);
    payload.append("email", email);
    payload.append("phone_number", phone);
    if (imageFile) payload.append("profile_image", imageFile);

    try {
      const response = await api.patch<ApiEnvelope<AuthUser>>(
        "/api/v1/users/me/",
        payload,
        // Authenticated request — Bearer token in the header.
        // Render's free tier can take a while on a cold start.
        { timeout: 60_000, headers: { Authorization: `Bearer ${token}` } },
      );

      setUser(response.data);
      toast.success("Profile updated", { description: response.message });
      navigate("/profile");
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        // Surface per-field messages from the backend's errors object.
        const fieldErrors = (
          error.details as { errors?: Record<string, string[]> } | undefined
        )?.errors;
        if (fieldErrors) {
          setErrors((previous) => ({
            ...previous,
            full_name: fieldErrors.full_name?.[0] ?? previous.full_name,
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
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => navigate("/profile")}
      >
        <ArrowLeftIcon aria-hidden="true" />
        Back to profile
      </Button>

      <div className="mt-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Account settings
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Update profile
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Keep your account information up to date.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6">
        {formError ? (
          <div
            className="text-destructive bg-destructive/10 mb-6 rounded-lg px-3 py-2 text-sm"
            role="alert"
          >
            {formError}
          </div>
        ) : null}
        <Card className="gap-0 p-0 py-0">
          {/* Profile image */}
          <div className="border-b p-6 sm:p-8">
            <SectionTitle
              title="Profile image"
              description="Choose a clear image for your account."
            />
            <div className="mt-4 flex items-center gap-4">
              <div className="bg-card border size-16 shrink-0 overflow-hidden rounded-full border shadow-sm">
                {image ? (
                  <img
                    src={image}
                    alt="Profile preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-primary flex size-full items-center justify-center text-lg font-bold">
                    {getInitials(fullName || "N P")}
                  </span>
                )}
              </div>
              <div>
                <label className="border-input bg-card inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-accent/60">
                  <CameraIcon className="size-4" aria-hidden="true" />
                  Upload image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={saving}
                  />
                </label>
                <p className="text-muted-foreground mt-1.5 text-xs">
                  JPG, PNG or GIF. Maximum size 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Personal information */}
          <div className="p-6 sm:p-8">
            <SectionTitle
              title="Personal information"
              description="Update the details associated with your account."
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel htmlFor="full_name">Full name</RequiredLabel>
                <Input
                  id="full_name"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    touched.current = true;
                    setFullName(e.target.value);
                    setErrors((previous) => ({
                      ...previous,
                      full_name: undefined,
                    }));
                  }}
                  aria-invalid={Boolean(errors.full_name)}
                  required
                />
                {errors.full_name ? (
                  <p className="text-destructive text-xs">{errors.full_name}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="phone_number">
                  Phone number
                </RequiredLabel>
                <Input
                  id="phone_number"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    touched.current = true;
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                    setErrors((previous) => ({
                      ...previous,
                      phone_number: undefined,
                    }));
                  }}
                  aria-invalid={Boolean(errors.phone_number)}
                  required
                />
                {errors.phone_number ? (
                  <p className="text-destructive text-xs">
                    {errors.phone_number}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <RequiredLabel htmlFor="email">Email address</RequiredLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  aria-label="Email address (cannot be changed)"
                  className="cursor-not-allowed"
                />
                <p className="text-muted-foreground text-xs">
                  Email address cannot be changed.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t p-6 sm:flex-row sm:justify-end sm:p-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/profile")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <LoaderCircleIcon
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  Saving…
                </>
              ) : (
                <>
                  <SaveIcon aria-hidden="true" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
