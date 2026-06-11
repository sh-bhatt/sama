"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/app/dashboard/profile/actions";

type ProfileFormUser = {
  name: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  publicProfile: boolean;
};

const inputClass =
  "focus-ring mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]";

export function ProfileForm({ user }: { user: ProfileFormUser }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(user.imageUrl || "");
  const [profileHref, setProfileHref] = useState<string | null>(
    user.publicProfile && user.username ? `/u/${user.username}` : null,
  );
  const displayName = user.name || user.username || "Sama host";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function submitProfile(formData: FormData) {
    setMessage("");
    setError("");

    startTransition(async () => {
      const result = await updateProfileAction(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(result.message);
      setProfileHref(result.href);
      setImagePreview(result.imageUrl || "");
      router.refresh();
    });
  }

  function previewImage(file: File | undefined) {
    if (!file) {
      setImagePreview(user.imageUrl || "");
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setImagePreview((current) => {
      if (current.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }

      return nextPreview;
    });
  }

  return (
    <form action={submitProfile} className="theme-panel rounded-[2rem] border p-5 sm:p-7">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
        organizer profile
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <span className="theme-muted text-sm font-black">Profile photo</span>
          <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 sm:flex-row sm:items-center">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-neon to-lime-mute text-xl font-black text-zinc-950">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt={`${displayName} profile preview`} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <label
                htmlFor="profile-image"
                className="focus-ring inline-flex cursor-pointer rounded-2xl bg-[color:var(--foreground)] px-4 py-3 text-sm font-black text-[color:var(--background)]"
              >
                {user.imageUrl ? "Change photo" : "Upload profile photo"}
              </label>
              <input
                id="profile-image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => previewImage(event.target.files?.[0])}
              />
              <p className="theme-muted mt-3 text-sm font-semibold">
                Square photos work best. JPG, PNG, or WebP under 3MB.
              </p>
            </div>
          </div>
        </div>
        <label className="sm:col-span-2">
          <span className="theme-muted text-sm font-black">Display name</span>
          <input name="name" defaultValue={user.name || ""} maxLength={80} className={inputClass} placeholder="Aarav & Friends" />
        </label>
        <label className="sm:col-span-2">
          <span className="theme-muted text-sm font-black">Username</span>
          <input name="username" defaultValue={user.username || ""} minLength={3} maxLength={32} className={inputClass} placeholder="aarav-hosts" />
          <span className="theme-muted mt-2 block text-sm font-semibold">
            Lowercase letters, numbers, hyphens, and underscores. This becomes your /u/ link.
          </span>
        </label>
        <label className="sm:col-span-2">
          <span className="theme-muted text-sm font-black">Bio</span>
          <textarea name="bio" defaultValue={user.bio || ""} maxLength={240} rows={4} className={`${inputClass} resize-none`} placeholder="Tell guests what kind of rooms you host." />
        </label>
        <label>
          <span className="theme-muted text-sm font-black">Location</span>
          <input name="location" defaultValue={user.location || ""} maxLength={80} className={inputClass} placeholder="Delhi NCR" />
        </label>
        <label>
          <span className="theme-muted text-sm font-black">Instagram</span>
          <input name="instagramUrl" defaultValue={user.instagramUrl || ""} className={inputClass} placeholder="@sama.host" />
        </label>
        <label className="sm:col-span-2">
          <span className="theme-muted text-sm font-black">Website</span>
          <input name="websiteUrl" defaultValue={user.websiteUrl || ""} className={inputClass} placeholder="https://yourcollective.in" />
        </label>
        <label className="sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3">
          <span>
            <span className="theme-heading block font-black">Public profile</span>
            <span className="theme-muted block text-sm font-semibold">When enabled, guests can visit your organizer page.</span>
          </span>
          <input name="publicProfile" type="checkbox" defaultChecked={user.publicProfile} className="size-5 accent-lime-mute" />
        </label>
      </div>

      {error && (
        <p className="mt-5 rounded-2xl border border-rose-neon/30 bg-rose-neon/10 px-4 py-3 text-sm font-black text-rose-neon">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-5 rounded-2xl border border-lime-mute/30 bg-lime-mute/10 px-4 py-3 text-sm font-black text-lime-mute">
          {message}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isPending}
          className="focus-ring rounded-2xl bg-lime-mute px-5 py-4 font-black text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save profile"}
        </button>
        {profileHref && (
          <Link
            href={profileHref}
            className="focus-ring rounded-2xl bg-[color:var(--card)] px-5 py-4 text-center font-black text-[color:var(--foreground)]"
          >
            View public profile
          </Link>
        )}
      </div>
    </form>
  );
}
