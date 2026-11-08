import { z } from "zod";

// Strict Indian mobile number: 10 digits starting with 6, 7, 8, or 9
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export const joinSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(100, { message: "Name must be under 100 characters." })
    .regex(/^[a-zA-Z\s.'-]+$/, { message: "Name can only contain letters, spaces, dots, and hyphens." }),
  mobile_number: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, "")) // strip spaces, dashes, etc.
    .refine((val) => INDIAN_MOBILE_REGEX.test(val), {
      message: "Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).",
    }),
});

export type JoinInput = z.infer<typeof joinSchema>;

export const voteSchema = z.object({
  poll_id: z.string().uuid({ message: "Invalid poll ID." }),
  option_id: z.string().uuid({ message: "Invalid option selected." }),
});

export type VoteInput = z.infer<typeof voteSchema>;

// Earliest selectable date: Nov 25, 2026 (strictly after Nov 24, 2026)
export const MIN_POLL_DATE = "2026-11-25";

export const dateOptionSchema = z.object({
  poll_id: z.string().uuid(),
  option_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be formatted as YYYY-MM-DD." })
    .refine((dateStr) => dateStr >= MIN_POLL_DATE, {
      message: `Date must be after November 24, 2026 (earliest is ${MIN_POLL_DATE}).`,
    }),
});

export type DateOptionInput = z.infer<typeof dateOptionSchema>;

export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, { message: "Message cannot be empty." })
    .max(500, { message: "Message cannot exceed 500 characters." }),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

export const tieResolutionSchema = z.object({
  poll_id: z.string().uuid(),
  selected_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  resolution_note: z
    .string()
    .trim()
    .min(5, { message: "Please provide a reason or note for resolving the tie." })
    .max(250),
});

export type TieResolutionInput = z.infer<typeof tieResolutionSchema>;

export const pollConfigSchema = z.object({
  poll_id: z.string().uuid(),
  title: z.string().trim().min(5).max(150),
  voting_deadline: z.string(),
  status: z.enum(["draft", "open", "closed", "finalized"]),
  min_date: z.string().refine((d) => d >= MIN_POLL_DATE, {
    message: "Minimum date must be on or after 2026-11-25.",
  }),
  max_date: z.string(),
});

export type PollConfigInput = z.infer<typeof pollConfigSchema>;
