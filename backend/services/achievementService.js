import { UserAchievement } from "../models/UserAchievement.js";
import { isDatabaseConnected } from "../config/database.js";
const SYSTEM_ACHIEVEMENTS = [
  { achievementId: "first_play", name: "First Quarter", description: "Launch any mini-game in the arcade", icon: "\u{1F3AE}", category: "General", rewardXP: 100 },
  { achievementId: "snake_bite", name: "Ouroboros", description: "Score 100+ points in Snake", icon: "\u{1F40D}", category: "Action", rewardXP: 100 },
  { achievementId: "ace_pilot", name: "Cosmic Ace", description: "Score 150+ in Space Shooter", icon: "\u{1F680}", category: "Action", rewardXP: 100 },
  { achievementId: "syntax_guru", name: "Syntax Sage", description: "Get a score of 800+ in Code Quiz", icon: "\u2318", category: "Logic", rewardXP: 100 },
  { achievementId: "eidetic", name: "Photographic Mind", description: "Finish Memory Match in 12 or fewer moves", icon: "\u25C8", category: "Memory", rewardXP: 100 },
  { achievementId: "logic_master", name: "Lateral Genius", description: "Solve all Brain Teaser riddles correctly (500+)", icon: "\u{1F9E0}", category: "Logic", rewardXP: 100 },
  { achievementId: "tile_fusion", name: "Grid Overlord", description: "Reach 256 or higher in 2048", icon: "\u25A6", category: "Special", rewardXP: 100 },
  { achievementId: "warp_reflex", name: "Sub-200ms Synapse", description: "React in under 220ms in Reaction Test", icon: "\u26A1", category: "Reflex", rewardXP: 100 },
  { achievementId: "memory_vault", name: "Cyber Memory", description: "Recall a sequence of 6+ digits in Number Recall", icon: "\u25CE", category: "Memory", rewardXP: 100 },
  { achievementId: "terminal_infiltrator", name: "Mainframe Ghost", description: "Crack the cipher in Cyber Hacker (200+)", icon: "\u{1F4BB}", category: "Logic", rewardXP: 100 },
  { achievementId: "pong_master", name: "Neon Champion", description: "Defeat the Cyber AI in Hyper Pong (7+)", icon: "\u{1F3D3}", category: "Action", rewardXP: 100 },
  { achievementId: "maze_runner", name: "Neural Pathfinder", description: "Score 800+ in Neon Maze", icon: "\u{1F9ED}", category: "Special", rewardXP: 100 },
  { achievementId: "matrix_recall", name: "Synapse Master", description: "Score 400+ points in Memory Matrix", icon: "\u25A6", category: "Memory", rewardXP: 100 },
  { achievementId: "gravity_survivor", name: "Vector Ace", description: "Flip and survive over 500m in Gravity Flip", icon: "\u21C5", category: "Action", rewardXP: 100 },
  { achievementId: "quantum_architect", name: "Dimensional Sage", description: "Solve chambers in Quantum Shift (600+)", icon: "\u{1F300}", category: "Special", rewardXP: 100 },
  { achievementId: "boss_slayer", name: "Overmind Slayer", description: "Score 3,000+ points in Boss Rush", icon: "\u{1F480}", category: "Action", rewardXP: 100 }
];
const inMemoryUserAchievements = /* @__PURE__ */ new Map();
async function getAchievements(userId) {
  let unlockedIds = /* @__PURE__ */ new Set();
  if (userId) {
    if (isDatabaseConnected()) {
      const userAchs = await UserAchievement.find({ userId });
      unlockedIds = new Set(userAchs.map((ua) => ua.achievementId));
    } else {
      unlockedIds = inMemoryUserAchievements.get(userId) || /* @__PURE__ */ new Set();
    }
  }
  return SYSTEM_ACHIEVEMENTS.map((ach) => ({
    ...ach,
    unlocked: unlockedIds.has(ach.achievementId)
  }));
}
async function evaluateAchievements(userId, gameId, score, sessionId) {
  const newlyUnlocked = [];
  const candidateIds = ["first_play"];
  if (gameId === "snake" && score >= 100) candidateIds.push("snake_bite");
  if (gameId === "space-shooter" && score >= 150) candidateIds.push("ace_pilot");
  if (gameId === "code-quiz" && score >= 800) candidateIds.push("syntax_guru");
  if (gameId === "memory" && score > 0 && score <= 12) candidateIds.push("eidetic");
  if (gameId === "brain-teaser" && score >= 500) candidateIds.push("logic_master");
  if (gameId === "2048" && score >= 256) candidateIds.push("tile_fusion");
  if (gameId === "reaction-test" && score > 0 && score <= 220) candidateIds.push("warp_reflex");
  if (gameId === "number-recall" && score >= 6) candidateIds.push("memory_vault");
  if (gameId === "cyber-hacker" && score >= 200) candidateIds.push("terminal_infiltrator");
  if (gameId === "hyper-pong" && score >= 7) candidateIds.push("pong_master");
  if (gameId === "neon-maze" && score >= 800) candidateIds.push("maze_runner");
  if (gameId === "memory-matrix" && score >= 400) candidateIds.push("matrix_recall");
  if (gameId === "gravity-flip" && score >= 500) candidateIds.push("gravity_survivor");
  if (gameId === "quantum-shift" && score >= 600) candidateIds.push("quantum_architect");
  if (gameId === "boss-rush" && score >= 3e3) candidateIds.push("boss_slayer");
  for (const achId of candidateIds) {
    const achDef = SYSTEM_ACHIEVEMENTS.find((a) => a.achievementId === achId);
    if (!achDef) continue;
    if (isDatabaseConnected()) {
      try {
        const created = await UserAchievement.create({
          userId,
          achievementId: achId,
          rewardClaimed: true,
          rewardXP: achDef.rewardXP,
          triggeringSessionId: sessionId
        });
        if (created) newlyUnlocked.push(achDef);
      } catch (err) {
      }
    } else {
      let set = inMemoryUserAchievements.get(userId);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        inMemoryUserAchievements.set(userId, set);
      }
      if (!set.has(achId)) {
        set.add(achId);
        newlyUnlocked.push(achDef);
      }
    }
  }
  return newlyUnlocked;
}
export {
  SYSTEM_ACHIEVEMENTS,
  evaluateAchievements,
  getAchievements
};
