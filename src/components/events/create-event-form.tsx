"use client";

import { useEffect, useMemo, useState } from "react";
import { createEventAction } from "@/app/dashboard/events/new/actions";
import { eventThemes, getEventTheme, type EventThemeKey } from "@/lib/event-themes";
import { categories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const inputClass =
  "focus-ring mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]";

const categoryOptions = categories.filter((category) => category !== "All");

type CreateEventFormProps = {
  hostName: string;
};

type FormState = {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  city: string;
  category: string;
  visibility: "public" | "private";
  theme: EventThemeKey;
  capacity: string;
  allowPlusOne: boolean;
  requiresApproval: boolean;
  waitlistEnabled: boolean;
  upiId: string;
  paymentNote: string;
};

const initialFormState: FormState = {
  title: "",
  description: "",
  eventDate: "",
  eventTime: "",
  location: "",
  city: "",
  category: "",
  visibility: "public",
  theme: "mehfil",
  capacity: "",
  allowPlusOne: true,
  requiresApproval: false,
  waitlistEnabled: true,
  upiId: "",
  paymentNote: "",
};

function formatPreviewDate(value: string) {
  if (!value) {
    return "Sat night";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "Sat night";
  }

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatPreviewTime(value: string) {
  if (!value) {
    return "7:30 PM";
  }

  const [hourValue, minuteValue] = value.split(":");
  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, hour, minute));
}

export function CreateEventForm({ hostName }: CreateEventFormProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState<string | null>(null);
  const selectedTheme = getEventTheme(form.theme);
  const previewTitle = form.title.trim() || "Moonlit Mehfil";
  const previewDescription =
    form.description.trim() || selectedTheme.description || "A short note with a little personality.";
  const previewCity = form.city.trim() || "Delhi NCR";
  const previewLocation = form.location.trim() || "The Courtyard Cafe";
  const previewCategory = form.category.trim() || selectedTheme.label;
  const previewDate = useMemo(() => formatPreviewDate(form.eventDate), [form.eventDate]);
  const previewTime = useMemo(() => formatPreviewTime(form.eventTime), [form.eventTime]);
  const capacityLabel = form.capacity.trim() ? `${form.capacity.trim()} spots` : "open room";

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateCoverImage(file: File | null) {
    setCoverFileName(file?.name || null);
    setCoverPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }

      return file ? URL.createObjectURL(file) : null;
    });
  }

  useEffect(
    () => () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    },
    [coverPreview],
  );

  return (
    <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_25rem]">
      <form action={createEventAction} className="min-w-0 space-y-5">
        <section className="theme-panel rounded-[2rem] border p-5 sm:p-7">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">event details</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="theme-muted text-sm font-black">Event title</span>
              <input
                name="title"
                required
                minLength={3}
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className={inputClass}
                placeholder="Moonlit Mehfil"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="theme-muted text-sm font-black">Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                className={`${inputClass} resize-none`}
                rows={4}
                placeholder="A short note with a little personality."
              />
            </label>
            <label className="sm:col-span-2">
              <span className="theme-muted text-sm font-black">Event cover photo</span>
              <span className="theme-muted mt-1 block text-sm font-semibold">
                Optional. Square or wide photos work best.
              </span>
              <input
                name="coverImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => updateCoverImage(event.target.files?.[0] ?? null)}
                className="focus-ring mt-3 w-full rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 text-sm font-bold text-[color:var(--foreground)] file:mr-4 file:rounded-full file:border-0 file:bg-lime-mute file:px-4 file:py-2 file:text-sm file:font-black file:text-zinc-950"
              />
              {coverFileName && (
                <span className="mt-2 block text-sm font-black text-lime-mute">
                  Selected: {coverFileName}
                </span>
              )}
            </label>
            <label>
              <span className="theme-muted text-sm font-black">Date</span>
              <input
                name="eventDate"
                type="date"
                required
                value={form.eventDate}
                onChange={(event) => updateField("eventDate", event.target.value)}
                className={inputClass}
              />
            </label>
            <label>
              <span className="theme-muted text-sm font-black">Time</span>
              <input
                name="eventTime"
                type="time"
                required
                value={form.eventTime}
                onChange={(event) => updateField("eventTime", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="sm:col-span-2">
              <span className="theme-muted text-sm font-black">Location</span>
              <input
                name="location"
                required
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                className={inputClass}
                placeholder="The Courtyard Cafe, Delhi"
              />
            </label>
            <label>
              <span className="theme-muted text-sm font-black">City</span>
              <input
                name="city"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                className={inputClass}
                placeholder="Delhi NCR"
              />
            </label>
            <label>
              <span className="theme-muted text-sm font-black">Category</span>
              <select
                name="category"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className={inputClass}
              >
                <option value="">Pick a category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2">
              <span className="theme-muted text-sm font-black">Visibility</span>
              <select
                name="visibility"
                value={form.visibility}
                onChange={(event) => updateField("visibility", event.target.value as FormState["visibility"])}
                className={inputClass}
              >
                <option value="public">Public</option>
                <option value="private">Private link</option>
              </select>
              <span className="theme-muted mt-2 block text-sm font-semibold">
                Public events can appear in Discover. Private events are visible only by link.
              </span>
            </label>
          </div>
        </section>

        <section className="theme-panel rounded-[2rem] border p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">invite mood</p>
              <h2 className="theme-heading mt-2 text-3xl font-black lowercase">choose the poster energy</h2>
            </div>
            <span className={cn("w-fit rounded-full px-3 py-1 text-xs font-black", selectedTheme.accentClass)}>
              {selectedTheme.previewBadge}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {eventThemes.map((theme) => {
              const selected = theme.key === form.theme;

              return (
                <button
                  key={theme.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => updateField("theme", theme.key)}
                  className={cn(
                    "focus-ring rounded-2xl border p-2 text-left transition hover:-translate-y-0.5",
                    selected
                      ? "border-lime-mute bg-lime-mute/12 shadow-[0_18px_60px_rgba(198,255,69,0.12)]"
                      : "border-[color:var(--border)] bg-[color:var(--card)] hover:border-[color:var(--foreground)]/35",
                  )}
                >
                  <input type="radio" name="theme" value={theme.key} checked={selected} readOnly className="sr-only" />
                  <span className={cn("block h-16 rounded-xl bg-gradient-to-br", theme.gradientClass)} />
                  <span className="theme-heading mt-2 block text-sm font-black">{theme.label}</span>
                  <span className="theme-muted mt-1 block text-xs font-semibold leading-5">{theme.description}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="theme-panel rounded-[2rem] border p-5 sm:p-7">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-electric">guest setup</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="theme-muted text-sm font-black">Capacity</span>
              <input
                name="capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(event) => updateField("capacity", event.target.value)}
                className={inputClass}
                placeholder="120"
              />
            </label>
            <label>
              <span className="theme-muted text-sm font-black">UPI ID optional</span>
              <input
                name="upiId"
                value={form.upiId}
                onChange={(event) => updateField("upiId", event.target.value)}
                className={inputClass}
                placeholder="host@upi"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="theme-muted text-sm font-black">Payment note optional</span>
              <input
                name="paymentNote"
                value={form.paymentNote}
                onChange={(event) => updateField("paymentNote", event.target.value)}
                className={inputClass}
                placeholder="INR 499 at venue"
              />
            </label>
            <label className="sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3">
              <span>
                <span className="theme-heading block font-black">Allow plus one</span>
                <span className="theme-muted block text-sm font-semibold">Guests can ask to bring someone along.</span>
              </span>
              <input
                name="allowPlusOne"
                type="checkbox"
                checked={form.allowPlusOne}
                onChange={(event) => updateField("allowPlusOne", event.target.checked)}
                className="size-5 accent-lime-mute"
              />
            </label>
            <label className="sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3">
              <span>
                <span className="theme-heading block font-black">Require guest approval</span>
                <span className="theme-muted block text-sm font-semibold">New Going and Maybe RSVPs wait for your nod.</span>
              </span>
              <input
                name="requiresApproval"
                type="checkbox"
                checked={form.requiresApproval}
                onChange={(event) => updateField("requiresApproval", event.target.checked)}
                className="size-5 accent-lime-mute"
              />
            </label>
            <label className="sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3">
              <span>
                <span className="theme-heading block font-black">Enable waitlist</span>
                <span className="theme-muted block text-sm font-semibold">When approved capacity is full, Going RSVPs can queue up.</span>
              </span>
              <input
                name="waitlistEnabled"
                type="checkbox"
                checked={form.waitlistEnabled}
                onChange={(event) => updateField("waitlistEnabled", event.target.checked)}
                className="size-5 accent-lime-mute"
              />
            </label>
          </div>
        </section>

        <button type="submit" className="focus-ring w-full rounded-2xl bg-lime-mute px-5 py-4 font-black text-zinc-950">
          Create invite
        </button>
      </form>

      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="theme-panel rounded-[2rem] border p-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <div
            className={cn(
              "film-grain relative min-h-[34rem] overflow-hidden rounded-[1.6rem] bg-gradient-to-br shadow-[0_26px_90px_rgba(0,0,0,0.42)]",
              selectedTheme.gradientClass,
            )}
          >
            {coverPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt={`Preview cover for ${previewTitle}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,rgba(255,255,255,0.28),transparent_24%),radial-gradient(circle_at_80%_28%,rgba(198,255,69,0.22),transparent_20%),linear-gradient(to_top,rgba(0,0,0,0.82),rgba(0,0,0,0.08))]" />
            <div className="absolute left-5 right-5 top-5 flex flex-wrap items-center justify-between gap-2">
              <span className={cn("rounded-full px-3 py-1 text-xs font-black", selectedTheme.accentClass)}>
                live preview
              </span>
              <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-black text-white backdrop-blur">
                {form.visibility === "private" ? "private link" : "discover-ready"}
              </span>
            </div>
            <div className="absolute bottom-6 left-5 right-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white/72">
                hosted by {hostName || "host the room"}
              </p>
              <h2 className="mt-3 text-5xl font-black lowercase leading-none text-white sm:text-6xl">
                {previewTitle}
              </h2>
              <p className="mt-4 text-sm font-bold leading-6 text-white/78">
                {previewDescription}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { key: "category", label: previewCategory },
                  { key: "city", label: previewCity },
                  { key: "date", label: previewDate },
                  { key: "time", label: previewTime },
                  { key: "capacity", label: capacityLabel },
                ].map((item) => (
                  <span key={item.key} className="rounded-full bg-black/38 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
                    {item.label}
                  </span>
                ))}
              </div>
              <div className="mt-5 rounded-[1.3rem] border border-white/12 bg-black/30 p-4 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-mute">place</p>
                <p className="mt-1 text-sm font-black text-white">{previewLocation}</p>
                <p className="mt-3 text-xs font-bold text-white/62">
                  {form.requiresApproval ? "RSVPs need approval" : "RSVPs open instantly"}
                  {form.waitlistEnabled ? " | waitlist on" : " | waitlist off"}
                  {form.allowPlusOne ? " | +1 allowed" : " | solo list"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
