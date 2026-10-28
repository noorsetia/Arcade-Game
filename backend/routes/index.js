import { Router } from "express";
import userRoutes from "./userRoutes.js";
import gameRoutes from "./gameRoutes.js";
import sessionRoutes from "./sessionRoutes.js";
import recordRoutes from "./recordRoutes.js";
import achievementRoutes from "./achievementRoutes.js";
import challengeRoutes from "./challengeRoutes.js";
import leaderboardRoutes from "./leaderboardRoutes.js";
import { getAiCoachFeedback } from "../controllers/aiCoachController.js";
const router = Router();
router.use("/users", userRoutes);
router.use("/games", gameRoutes);
router.use("/sessions", sessionRoutes);
router.use("/records", recordRoutes);
router.use("/achievements", achievementRoutes);
router.use("/challenges", challengeRoutes);
router.use("/leaderboards", leaderboardRoutes);
router.post("/ai-coach", getAiCoachFeedback);
router.get("/activity", (req, res) => {
  res.json({
    success: true,
    activities: [
      { id: "act_1", username: "Cyber_Pilot", avatar: "\u26A1", action: "Set Personal Best", details: "Scored 980 in Neon Maze", timestamp: "3 mins ago" },
      { id: "act_2", username: "Ada_Lovelace", avatar: "\u{1F451}", action: "Completed Daily Arena", details: "Perfect 3/3 Gauntlet Score", timestamp: "15 mins ago" },
      { id: "act_3", username: "Linus_T", avatar: "\u{1F427}", action: "Achievement Unlocked", details: 'Unlocked "Mainframe Ghost"', timestamp: "38 mins ago" },
      { id: "act_4", username: "Cyber_Pilot", avatar: "\u26A1", action: "Rank Promotion", details: "Promoted to Level 4 (Cyber Elite)", timestamp: "1 hour ago" }
    ]
  });
});
var stdin_default = router;
export {
  stdin_default as default
};
