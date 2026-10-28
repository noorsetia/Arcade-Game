import { Router } from "express";
import { getAchievementsList } from "../controllers/achievementController.js";
import { optionalAuth } from "../middleware/auth.js";
const router = Router();
router.get("/", optionalAuth, getAchievementsList);
var stdin_default = router;
export {
  stdin_default as default
};
