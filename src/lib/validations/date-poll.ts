import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const optionSchema = z.object({
  optionDate: z
    .string()
    .trim()
    .min(1, "Option date is required.")
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), {
      message: "Use a valid option date.",
    }),
  label: optionalText,
});

export const datePollSchema = z
  .object({
    question: z.string().trim().min(3, "Question must be at least 3 characters."),
    options: z.array(optionSchema).min(2, "Add at least 2 date options.").max(6),
  })
  .refine(
    (value) => {
      const dates = value.options.map((option) => option.optionDate);
      return new Set(dates).size === dates.length;
    },
    { message: "Date options should not repeat." },
  );

export const pollVoteSchema = z.object({
  slug: z.string().trim().min(1),
  pollId: z.string().trim().min(1),
  guestName: z.string().trim().min(2, "Name must be at least 2 characters."),
  guestPhone: optionalText,
  selectedOptionIds: z.array(z.string().trim().min(1)).min(1, "Pick at least one date."),
});

export function parseDatePollFormData(formData: FormData) {
  const options = [1, 2, 3, 4, 5, 6]
    .map((index) => ({
      optionDate: String(formData.get(`optionDate${index}`) || "").trim(),
      label: String(formData.get(`optionLabel${index}`) || "").trim(),
    }))
    .filter((option) => option.optionDate);

  return datePollSchema.safeParse({
    question: formData.get("question"),
    options,
  });
}

export function parsePollVoteFormData(formData: FormData) {
  return pollVoteSchema.safeParse({
    slug: formData.get("slug"),
    pollId: formData.get("pollId"),
    guestName: formData.get("guestName"),
    guestPhone: formData.get("guestPhone"),
    selectedOptionIds: formData.getAll("selectedOptionIds"),
  });
}

export function pollDateStringToDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export type PollVoteActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialPollVoteActionState: PollVoteActionState = {
  status: "idle",
  message: "",
};
