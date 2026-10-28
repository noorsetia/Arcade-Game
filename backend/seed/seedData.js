import { Achievement } from "../models/Achievement.js";
import { DailyChallenge } from "../models/DailyChallenge.js";
import { SYSTEM_ACHIEVEMENTS } from "../services/achievementService.js";
import { isDatabaseConnected, connectDatabase } from "../config/database.js";
async function seedDatabase() {
  if (!isDatabaseConnected()) {
    await connectDatabase();
  }
  if (!isDatabaseConnected()) {
    console.log("[Seed] Database not connected. Using in-memory dataset.");
    return;
  }
  try {
    console.log("[Seed] Checking and seeding system achievements...");
    for (const ach of SYSTEM_ACHIEVEMENTS) {
      await Achievement.findOneAndUpdate(
        { achievementId: ach.achievementId },
        {
          $set: {
            name: ach.name,
            description: ach.description,
            icon: ach.icon,
            category: ach.category,
            rewardXP: ach.rewardXP
          }
        },
        { upsert: true, returnDocument: "after" }
      );
    }
    console.log("[Seed] Checking and seeding today\u2019s daily challenge...");
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const existingChallenge = await DailyChallenge.findOne({ date: today });
    if (!existingChallenge) {
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
      expiresAt.setUTCHours(23, 59, 59, 999);
      await DailyChallenge.create({
        challengeId: `challenge_${today}`,
        date: today,
        timezone: "UTC",
        gameId: "neon-maze",
        title: "Cognitive Matrix Gauntlet",
        description: "Complete the 3-stage neural calibration test: Algorithmic Logic, Memory Buffer, and Syntax Audit.",
        targetScore: 300,
        rewardXP: 250,
        expiresAt,
        stages: [
          {
            stage: 1,
            type: "Logic Puzzle",
            prompt: "A binary tree has 7 nodes. What is the maximum possible height (edges)?",
            options: ["3", "6", "4", "7"],
            correct: 1
          },
          {
            stage: 2,
            type: "Memory Buffer",
            prompt: "Memorize this 5-digit cipher: 9 \xB7 4 \xB7 7 \xB7 1 \xB7 8",
            answer: "94718"
          },
          {
            stage: 3,
            type: "Syntax Audit",
            prompt: "Which method returns a new array with elements transformed by a callback without mutating the original?",
            options: ["Array.prototype.push", "Array.prototype.map", "Array.prototype.splice", "Array.prototype.reverse"],
            correct: 1
          }
        ]
      });
    }
    console.log("[Seed] Database seed completed successfully.");
  } catch (err) {
    console.error("[Seed] Database seed error:", err.message);
  }
}
export {
  seedDatabase
};
