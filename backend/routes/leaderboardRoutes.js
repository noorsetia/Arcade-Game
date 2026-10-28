import { Router } from "express";
import { getGameLeaderboardHandler, getGlobalLeaderboardHandler } from "../controllers/leaderboardController.js";
const router = Router();
router.get("/global", getGlobalLeaderboardHandler);
router.get("/:gameId", getGameLeaderboardHandler);
router.get("/", (req, res, next) => {
  const game = req.query.game || "all";
  req.params.gameId = game;
  return getGameLeaderboardHandler(req, res, next);
});
var stdin_default = router;
export {
  stdin_default as default
};
