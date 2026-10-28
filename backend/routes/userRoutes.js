import { Router } from "express";
import { getMe, patchMe } from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validator.js";
import { updateUserProfileSchema } from "../validators/userValidator.js";
const router = Router();
router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, validateBody(updateUserProfileSchema), patchMe);
var stdin_default = router;
export {
  stdin_default as default
};
