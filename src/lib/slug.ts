import { prisma } from "@/lib/prisma";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export async function generateUniqueEventSlug(title: string) {
  const base = slugify(title) || "sama-event";
  let candidate = base;
  let suffix = 2;

  while (await prisma.event.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
