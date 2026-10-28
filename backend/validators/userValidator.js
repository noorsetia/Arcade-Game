import { z } from "zod";
const updateUserProfileSchema = z.object({
  displayName: z.string().trim().min(2, "Display name must be at least 2 characters").max(32, "Display name cannot exceed 32 characters").regex(/^[a-zA-Z0-9_\-\s]+$/, "Display name may only contain alphanumeric, underscore, hyphen, and spaces").optional(),
  avatar: z.string().max(8).optional(),
  ringColor: z.enum(["cyan", "magenta", "emerald", "gold", "indigo"]).optional(),
  title: z.string().max(32).optional(),
  preferences: z.object({
    soundEnabled: z.boolean().optional(),
    crtMode: z.boolean().optional(),
    reducedMotion: z.boolean().optional(),
    theme: z.string().max(32).optional()
  }).optional()
});
export {
  updateUserProfileSchema
};
