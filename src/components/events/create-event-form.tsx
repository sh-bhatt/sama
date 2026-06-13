"use client";

import { useEffect, useMemo, useState } from "react";
import { createEventAction } from "@/app/dashboard/events/new/actions";
import { CardStudioControls } from "@/components/events/card-studio-controls";
import { RsvpChoiceButtons } from "@/components/events/rsvp-choice-buttons";
import { defaultCardDesign, getCardDesignStyles, type CardDesign } from "@/lib/card-design";
import { eventThemes, getEventTheme, type EventThemeKey } from "@/lib/event-themes";
import { categories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const inputClass =
  "focus-ring mt-2 w-full rounded-2xl border border-zinc-950/10 bg-white/60 px-4 py-3 font-bold text-zinc-950 placeholder:text-zinc-500 dark:border-white/10 dark:bg-white/8 dark:text-white dark:placeholder:text-zinc-500";

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
  durationHours: "2" | "4" | "6" | "8" | "24";
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
  durationHours: "6",
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
  const [cardDesign, setCardDesign] = useState<CardDesign>(defaultCardDesign);
  const selectedTheme = getEventTheme(form.theme);
  const designStyles = getCardDesignStyles(cardDesign);
  const previewTitle = form.title.trim() || "Moonlit Mehfil";
  const previewDescription =
    form.description.trim() || selectedTheme.description || "A short note with a little personality.";
  const previewCity = form.city.trim() || "Delhi NCR";
  const previewLocation = form.location.trim() || "The Courtyard Cafe";
  const previewCategory = form.category.trim() || selectedTheme.label;
  const previewDate = useMemo(() => formatPreviewDate(form.eventDate), [form.eventDate]);
  const previewTime = useMemo(() => formatPreviewTime(form.eventTime), [form.eventTime]);
  const capacityLabel = form.capacity.trim() ? `${form.capacity.trim()} spots` : "open room";
  const durationLabel = form.durationHours === "24" ? "all day" : `${form.durationHours} hours`;

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
    <div className="mt-8 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_25rem_5rem]">
      <form action={createEventAction} className="min-w-0 space-y-5">
        <section id="details" className="event-soft-panel rounded-[2rem] p-5 sm:p-7">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">invite draft</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">Event title</span>
              <input
                name="title"
                required
                minLength={3}
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className={`${inputClass} text-3xl font-black lowercase sm:text-5xl`}
                placeholder="Moonlit Mehfil"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">Description</span>
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
              <span id="cover" className="text-sm font-black text-zinc-700 dark:text-zinc-300">Event cover photo</span>
              <span className="mt-1 block text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                Optional. Square or wide photos work best.
              </span>
              <input
                name="coverImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => updateCoverImage(event.target.files?.[0] ?? null)}
                className="focus-ring mt-3 w-full rounded-2xl border border-dashed border-zinc-950/14 bg-white/60 px-4 py-3 text-sm font-bold text-zinc-950 file:mr-4 file:rounded-full file:border-0 file:bg-lime-mute file:px-4 file:py-2 file:text-sm file:font-black file:text-zinc-950 dark:border-white/10 dark:bg-white/8 dark:text-white"
              />
              {coverFileName && (
                <span className="mt-2 block text-sm font-black text-lime-mute">
                  Selected: {coverFileName}
                </span>
              )}
            </label>
            <label>
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">Date</span>
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
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">Time</span>
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
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">Location</span>
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
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">City</span>
              <input
                name="city"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                className={inputClass}
                placeholder="Delhi NCR"
              />
            </label>
            <label>
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">Category</span>
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
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">Visibility</span>
              <select
                name="visibility"
                value={form.visibility}
                onChange={(event) => updateField("visibility", event.target.value as FormState["visibility"])}
                className={inputClass}
              >
                <option value="public">Public</option>
                <option value="private">Private link</option>
              </select>
              <span className="mt-2 block text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                Public events can appear in Discover. Private events are visible only by link.
              </span>
            </label>
          </div>
        </section>

        <div id="studio">
          <CardStudioControls value={cardDesign} onChange={setCardDesign} />
        </div>

        <section id="theme" className="event-soft-panel rounded-[2rem] p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">invite mood</p>
              <h2 className="mt-2 text-3xl font-black lowercase text-zinc-950 dark:text-white">choose the poster energy</h2>
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
                      : "border-zinc-950/10 bg-white/58 hover:border-zinc-950/35 dark:border-white/10 dark:bg-white/8 dark:hover:border-white/35",
                  )}
                >
                  <input type="radio" name="theme" value={theme.key} checked={selected} readOnly className="sr-only" />
                  <span className={cn("block h-16 rounded-xl bg-gradient-to-br", theme.gradientClass)} />
                  <span className="mt-2 block text-sm font-black text-zinc-950 dark:text-white">{theme.label}</span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-zinc-600 dark:text-zinc-400">{theme.description}</span>
                </button>
              );
            })}
          </div>
        </section>

        <details id="settings" className="event-soft-panel rounded-[2rem] p-5 sm:p-7" open>
          <summary className="cursor-pointer list-none text-sm font-black uppercase tracking-[0.18em] text-electric">
            guest setup
          </summary>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">Capacity</span>
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
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">Duration</span>
              <select
                name="durationHours"
                value={form.durationHours}
                onChange={(event) => updateField("durationHours", event.target.value as FormState["durationHours"])}
                className={inputClass}
              >
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="6">6 hours</option>
                <option value="8">8 hours</option>
                <option value="24">All day</option>
              </select>
            </label>
            <label>
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">UPI ID optional</span>
              <input
                name="upiId"
                value={form.upiId}
                onChange={(event) => updateField("upiId", event.target.value)}
                className={inputClass}
                placeholder="host@upi"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">Payment note optional</span>
              <input
                name="paymentNote"
                value={form.paymentNote}
                onChange={(event) => updateField("paymentNote", event.target.value)}
                className={inputClass}
                placeholder="INR 499 at venue"
              />
            </label>
            <label className="sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-3 dark:border-white/10 dark:bg-white/8">
              <span>
                <span className="block font-black text-zinc-950 dark:text-white">Allow plus one</span>
                <span className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400">Guests can ask to bring someone along.</span>
              </span>
              <input
                name="allowPlusOne"
                type="checkbox"
                checked={form.allowPlusOne}
                onChange={(event) => updateField("allowPlusOne", event.target.checked)}
                className="size-5 accent-lime-mute"
              />
            </label>
            <label className="sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-3 dark:border-white/10 dark:bg-white/8">
              <span>
                <span className="block font-black text-zinc-950 dark:text-white">Require guest approval</span>
                <span className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400">New Going and Maybe RSVPs wait for your nod.</span>
              </span>
              <input
                name="requiresApproval"
                type="checkbox"
                checked={form.requiresApproval}
                onChange={(event) => updateField("requiresApproval", event.target.checked)}
                className="size-5 accent-lime-mute"
              />
            </label>
            <label className="sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-3 dark:border-white/10 dark:bg-white/8">
              <span>
                <span className="block font-black text-zinc-950 dark:text-white">Enable waitlist</span>
                <span className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400">When approved capacity is full, Going RSVPs can queue up.</span>
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
        </details>

        <button type="submit" className="focus-ring sticky bottom-4 z-20 w-full rounded-2xl bg-lime-mute px-5 py-4 font-black text-zinc-950 shadow-[0_18px_60px_rgba(198,255,69,0.28)] lg:static">
          Create invite
        </button>
      </form>

      <aside id="preview" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="event-soft-panel rounded-[2rem] p-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <div
            className={cn(
              "relative min-h-[34rem] overflow-hidden bg-gradient-to-br shadow-[0_26px_90px_rgba(0,0,0,0.42)]",
              designStyles.cornerClass,
              selectedTheme.gradientClass,
            )}
            style={designStyles.style}
          >
            {coverPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt={`Preview cover for ${previewTitle}`}
                className={cn("absolute inset-0 h-full w-full", designStyles.imageClass)}
              />
            )}
            <div className={cn("absolute inset-0", designStyles.overlayClass)} />
            {designStyles.textureClass && <div className={cn("absolute inset-0", designStyles.textureClass)} />}
            <div className="absolute left-5 right-5 top-5 flex flex-wrap items-center justify-between gap-2">
              <span className={cn(designStyles.badgeClass, "text-zinc-950")} style={designStyles.accentBackgroundStyle}>
                live preview
              </span>
              <span className={cn(designStyles.badgeClass, "bg-black/35 text-white backdrop-blur")}>
                {form.visibility === "private" ? "private link" : "discover-ready"}
              </span>
            </div>
            <div className={cn("absolute bottom-6 left-5 right-5 flex flex-col", designStyles.layoutClass)}>
              <p className="text-sm font-black uppercase tracking-[0.18em]" style={designStyles.bodyStyle}>
                hosted by {hostName || "host the room"}
              </p>
              <h2 className={cn("mt-3 text-5xl lowercase leading-none sm:text-6xl", designStyles.fontClass)} style={designStyles.titleStyle}>
                {previewTitle}
              </h2>
              <p className="mt-4 text-sm font-bold leading-6" style={designStyles.bodyStyle}>
                {previewDescription}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { key: "category", label: previewCategory },
                  { key: "city", label: previewCity },
                  { key: "date", label: previewDate },
                  { key: "time", label: previewTime },
                  { key: "duration", label: durationLabel },
                  { key: "capacity", label: capacityLabel },
                ].map((item) => (
                  <span key={item.key} className={cn(designStyles.badgeClass, "bg-black/38 text-white backdrop-blur")}>
                    {item.label}
                  </span>
                ))}
              </div>
              <div className="mt-5 rounded-[1.3rem] border border-white/12 bg-black/30 p-4 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.16em]" style={designStyles.accentStyle}>place</p>
                <p className="mt-1 text-sm font-black" style={designStyles.titleStyle}>{previewLocation}</p>
                <p className="mt-3 text-xs font-bold" style={designStyles.bodyStyle}>
                  {form.requiresApproval ? "RSVPs need approval" : "RSVPs open instantly"}
                  {form.waitlistEnabled ? " | waitlist on" : " | waitlist off"}
                  {form.allowPlusOne ? " | +1 allowed" : " | solo list"}
                </p>
              </div>
              <div className="mt-4 rounded-[1.4rem] border border-white/12 bg-white/16 p-3 backdrop-blur">
                <RsvpChoiceButtons disabled size="compact" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <nav className="hidden min-w-0 lg:sticky lg:top-28 lg:flex lg:self-start">
        <div className="event-glass flex w-full flex-col gap-2 rounded-[1.5rem] p-2">
          {[
            ["Theme", "#theme"],
            ["Cover", "#cover"],
            ["Studio", "#studio"],
            ["Settings", "#settings"],
            ["Preview", "#preview"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="focus-ring rounded-[1rem] px-3 py-3 text-center text-xs font-black text-zinc-950 transition hover:bg-white/55 dark:text-white dark:hover:bg-white/12"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
