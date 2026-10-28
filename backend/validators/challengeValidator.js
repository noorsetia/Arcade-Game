import { z } from "zod";
const completeChallengeSchema = z.object({
  score: z.number().int().min(0).max(1e3),
  stagesCompleted: z.number().int().min(1).max(10),
  answers: z.array(z.any()).optional().default([]),
  durationSeconds: z.number().int().min(1).max(3600)
});
export {
  completeChallengeSchema
};
