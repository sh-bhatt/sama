import type { RsvpQuestion, RsvpQuestionType } from "@prisma/client";
import { z } from "zod";

export const maxRsvpQuestionsPerEvent = 8;
const choiceTypes: RsvpQuestionType[] = ["SINGLE_CHOICE", "MULTIPLE_CHOICE"];

function parseOptions(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((option) => option.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export const rsvpQuestionInputSchema = z
  .object({
    eventId: z.string().trim().min(1, "Event is missing."),
    type: z
      .enum(["TEXT", "SHORT_TEXT", "LONG_TEXT", "SINGLE_CHOICE", "MULTIPLE_CHOICE"])
      .default("TEXT"),
    question: z
      .string()
      .trim()
      .min(3, "Question must be at least 3 characters.")
      .max(160, "Keep questions under 160 characters."),
    options: z
      .array(z.string().trim().min(1).max(80, "Keep each option under 80 characters."))
      .max(8, "Use at most 8 options."),
    required: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
    sortOrder: z.preprocess(
      (value) => {
        if (typeof value !== "string" || value.trim() === "") {
          return 0;
        }

        return Number(value);
      },
      z.number().int().min(0).max(99).default(0),
    ),
  })
  .refine((value) => !choiceTypes.includes(value.type) || value.options.length > 0, {
    message: "Choice questions need at least one option.",
    path: ["options"],
  });

export type RsvpQuestionInput = z.infer<typeof rsvpQuestionInputSchema>;

export function parseRsvpQuestionFormData(formData: FormData) {
  return rsvpQuestionInputSchema.safeParse({
    eventId: formData.get("eventId"),
    type: formData.get("type") || "TEXT",
    question: formData.get("question"),
    options: parseOptions(formData.get("options")),
    required: formData.get("required"),
    sortOrder: formData.get("sortOrder"),
  });
}

export function parseRsvpAnswers(formData: FormData, questions: RsvpQuestion[]) {
  const answers: { questionId: string; answer: string }[] = [];

  for (const question of questions) {
    const values = formData
      .getAll(`answer:${question.id}`)
      .map((value) => String(value).trim())
      .filter(Boolean);
    const answer =
      question.type === "MULTIPLE_CHOICE"
        ? values.filter((value) => question.options.includes(value)).join(", ")
        : String(formData.get(`answer:${question.id}`) || "").trim();

    if (question.required && !answer) {
      return {
        success: false as const,
        message: `Answer required: ${question.question}`,
      };
    }

    if (!answer) {
      continue;
    }

    if (answer.length > 300) {
      return {
        success: false as const,
        message: `Keep answers under 300 characters: ${question.question}`,
      };
    }

    if (question.type === "SINGLE_CHOICE" && !question.options.includes(answer)) {
      return {
        success: false as const,
        message: `Choose an available option: ${question.question}`,
      };
    }

    answers.push({ questionId: question.id, answer });
  }

  return { success: true as const, answers };
}
