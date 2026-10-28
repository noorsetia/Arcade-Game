import { Router } from "express";
import { getGames } from "../controllers/gameController.js";
const router = Router();
router.get("/", getGames);
var stdin_default = router;
export {
  stdin_default as default
};
