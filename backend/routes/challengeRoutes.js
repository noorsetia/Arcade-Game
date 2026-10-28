import { Router } from "express";
import { getDaily, completeDaily } from "../controllers/challengeController.js";
import { optionalAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validator.js";
import { completeChallengeSchema } from "../validators/challengeValidator.js";
const router = Router();
router.get("/daily", getDaily);
router.post("/:id/complete", optionalAuth, validateBody(completeChallengeSchema), completeDaily);
var stdin_default = router;
export {
  stdin_default as default
};
