import { z } from "zod";

const optionalFilter = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
  z.string().max(80).optional(),
);

export const discoverFiltersSchema = z.object({
  city: optionalFilter,
  category: optionalFilter,
  q: optionalFilter,
});

export const interestInputSchema = z.object({
  eventId: z.string().trim().min(1, "Event is missing."),
  guestId: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.string().max(120).optional(),
  ),
  name: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.string().max(60, "Name must be 60 characters or less.").optional(),
  ),
});

export type DiscoverFilters = z.infer<typeof discoverFiltersSchema>;

export function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseDiscoverFilters(searchParams: {
  city?: string | string[];
  category?: string | string[];
  q?: string | string[];
}) {
  const parsed = discoverFiltersSchema.safeParse({
    city: firstSearchParam(searchParams.city),
    category: firstSearchParam(searchParams.category),
    q: firstSearchParam(searchParams.q),
  });

  if (!parsed.success) {
    return {};
  }

  return parsed.data;
}

export function parseInterestFormData(formData: FormData) {
  return interestInputSchema.safeParse({
    eventId: formData.get("eventId"),
    guestId: formData.get("guestId"),
    name: formData.get("name"),
  });
}
