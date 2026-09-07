import { useEffect, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  CameraIcon,
  CheckIcon,
  Edit3Icon,
  LoaderCircleIcon,
  MailIcon,
  PhoneIcon,
  UserRoundIcon,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import { formatDate, getInitials } from "@/lib/format";
import { useAuthStore } from "@/store/auth-store";
import type { AuthUser } from "@/store/auth-store";
import type { ApiEnvelope } from "@/types/auth";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

interface Profile {
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  is_verified: boolean;
  profile_image: string | null;
  created_at?: string;
}

/** Map the API user to the page's display shape. */
function toProfile(user: AuthUser): Profile {
  return {
    full_name: user.full_name,
    email: user.email,
    phone_number: user.phone_number,
    role: user.role === "ADMIN" ? "Admin" : "Player",
    is_verified: user.is_verified,
    profile_image: user.profile_image,
    created_at: user.created_at,
  };
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-xl border p-4">
      <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
        {icon}
      </div>
      <div className="min-w-0">
        <span className="text-muted-foreground block text-xs">{label}</span>
        <strong className="block truncate text-sm font-semibold">
          {value}
        </strong>
      </div>
    </div>
  );
}

export function ProfilePage() {
  useDocumentTitle("Profile");
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  // Seeded from the auth store, then refreshed live from the backend.
  const [profile, setProfile] = useState<Profile>(
    user
      ? toProfile(user)
      : {
          full_name: "—",
          email: "—",
          phone_number: "—",
          role: "Player",
          is_verified: true,
          profile_image: null,
        },
  );
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [savingImage, setSavingImage] = useState(false);

  // Fetch the real profile from the API and keep the store in sync so the
  // navbar reflects any backend-side changes too.
  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const response = await api.get<ApiEnvelope<AuthUser>>(
          "/api/v1/users/me/",
          // Authenticated request — Bearer token in the header.
          // Render's free tier can take a while on a cold start.
          { timeout: 60_000, headers: { Authorization: `Bearer ${token}` } },
        );
        if (cancelled) return;
        setProfile(toProfile(response.data));
        setUser(response.data);
        setRefreshFailed(false);
      } catch {
        if (!cancelled) setRefreshFailed(true);
      }
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [setUser, reloadKey]);

  // Guard: only signed-in users have a profile.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image is too large", {
        description: "Please choose an image under 2MB.",
      });
      event.target.value = "";
      return;
    }

    // Upload straight away — the camera button is the quick way to swap
    // the avatar; everything else lives on the edit page.
    setSavingImage(true);
    try {
      const payload = new FormData();
      payload.append("profile_image", file);

      const response = await api.patch<ApiEnvelope<AuthUser>>(
        "/api/v1/users/me/",
        payload,
        // Authenticated request — Bearer token in the header.
        // Render's free tier can take a while on a cold start.
        { timeout: 60_000, headers: { Authorization: `Bearer ${token}` } },
      );

      setProfile(toProfile(response.data));
      setUser(response.data);
      toast.success("Profile image updated", { description: response.message });
    } catch (error) {
      toast.error("Unable to update your profile image.", {
        description:
          error instanceof ApiError ? error.message : "Please try again.",
      });
    } finally {
      setSavingImage(false);
      event.target.value = "";
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
      {/* Heading */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            Account settings
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">My profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your personal information and profile image.
          </p>
        </div>
        <Button onClick={() => navigate("/profile/edit")}>
          <Edit3Icon aria-hidden="true" />
          Edit profile
        </Button>
      </div>

      {/* Refresh failed note */}
      {refreshFailed ? (
        <div className="border-amber-200 bg-amber-50 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <p className="text-amber-700 text-sm">
            Showing saved info — we couldn't reach the server for your latest
            profile.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {/* Profile card */}
      <Card className="mt-6 gap-0 overflow-hidden p-0 py-0">
        {/* Cover + avatar */}
        <div className="from-primary via-primary to-primary/70 relative h-28 bg-linear-to-br sm:h-32">
          <div className="absolute -bottom-12 left-6 sm:left-8">
            <div className="bg-card border-background relative size-24 overflow-hidden rounded-full border-4 shadow-lg">
              {profile.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt="Profile"
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-primary flex size-full items-center justify-center text-2xl font-bold">
                  {getInitials(profile.full_name)}
                </span>
              )}
            </div>
            <label
              className="bg-primary text-primary-foreground absolute right-0 bottom-0 flex size-8 cursor-pointer items-center justify-center rounded-full shadow-md transition-opacity hover:opacity-90"
              title="Change profile image"
            >
              {savingImage ? (
                <LoaderCircleIcon
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <CameraIcon className="size-4" aria-hidden="true" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={savingImage}
              />
            </label>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pt-16 pb-6 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {profile.full_name}
              </h2>
              <p className="text-muted-foreground text-sm">{profile.role}</p>
              {profile.created_at ? (
                <p className="text-muted-foreground/70 mt-0.5 text-xs">
                  Member since {formatDate(profile.created_at)}
                </p>
              ) : null}
            </div>
            <span
              className={
                profile.is_verified
                  ? "inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                  : "inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
              }
            >
              <CheckIcon className="size-3.5" aria-hidden="true" />
              {profile.is_verified ? "Verified" : "Unverified"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Detail
              icon={<UserRoundIcon className="size-4" aria-hidden="true" />}
              label="Full Name"
              value={profile.full_name}
            />
            <Detail
              icon={<PhoneIcon className="size-4" aria-hidden="true" />}
              label="Phone Number"
              value={profile.phone_number}
            />
            <Detail
              icon={<MailIcon className="size-4" aria-hidden="true" />}
              label="Email Address"
              value={profile.email}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
