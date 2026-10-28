import { Router } from "express";
import { getRecords, getRecordByGameId } from "../controllers/recordController.js";
import { optionalAuth } from "../middleware/auth.js";
const router = Router();
router.get("/", optionalAuth, getRecords);
router.get("/:gameId", optionalAuth, getRecordByGameId);
var stdin_default = router;
export {
  stdin_default as default
};
