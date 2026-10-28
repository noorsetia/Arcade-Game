import { Router } from "express";
import { postSession, getSessions } from "../controllers/sessionController.js";
import { optionalAuth } from "../middleware/auth.js";
import { sessionRateLimiter } from "../middleware/rateLimiter.js";
import { validateBody, validateQuery } from "../middleware/validator.js";
import { submitSessionSchema, getSessionsQuerySchema } from "../validators/sessionValidator.js";
const router = Router();
router.post("/", sessionRateLimiter, optionalAuth, validateBody(submitSessionSchema), postSession);
router.get("/", optionalAuth, validateQuery(getSessionsQuerySchema), getSessions);
var stdin_default = router;
export {
  stdin_default as default
};
