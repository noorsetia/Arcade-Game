import { z } from "zod";
import { GAME_RULES } from "../config/games.js";
const submitSessionSchema = z.object({
  idempotencyKey: z.string().min(8, "idempotencyKey must be at least 8 characters").max(128, "idempotencyKey must not exceed 128 characters"),
  gameId: z.string().refine((id) => Boolean(GAME_RULES[id]), {
    message: "Unknown gameId. Must match an approved arcade title."
  }),
  mode: z.string().max(32).default("Single Player"),
  difficulty: z.enum(["Casual", "Standard", "Elite"]).default("Standard"),
  score: z.number().int().min(0, "Score cannot be negative").max(1e6, "Score exceeds architectural ceiling"),
  durationSeconds: z.number().int().min(1, "Duration must be at least 1 second").max(86400, "Duration exceeds 24 hours"),
  metrics: z.any().optional().default({}),
  guestId: z.string().max(64).optional(),
  clientSubmittedAt: z.string().optional()
});
const getSessionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  gameId: z.string().optional(),
  userId: z.string().optional()
});
export {
  getSessionsQuerySchema,
  submitSessionSchema
};
