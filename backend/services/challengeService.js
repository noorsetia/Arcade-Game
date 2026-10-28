import { DailyChallenge } from "../models/DailyChallenge.js";
import { awardUserXP } from "./userService.js";
import { isDatabaseConnected } from "../config/database.js";
const completedChallengeRecords = /* @__PURE__ */ new Set();
async function getCurrentDailyChallenge() {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  if (isDatabaseConnected()) {
    let challenge = await DailyChallenge.findOne({ date: today }).lean();
    if (!challenge) {
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
      expiresAt.setUTCHours(23, 59, 59, 999);
      challenge = await DailyChallenge.create({
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
    return challenge;
  }
  return {
    challengeId: `challenge_${today}`,
    date: today,
    timezone: "UTC",
    gameId: "neon-maze",
    title: "Cognitive Matrix Gauntlet",
    description: "Complete the 3-stage neural calibration test: Algorithmic Logic, Memory Buffer, and Syntax Audit.",
    targetScore: 300,
    rewardXP: 250,
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
  };
}
async function completeDailyChallenge(userId, challengeId, completion) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const claimKey = `${userId || "guest"}:${today}`;
  if (userId && completedChallengeRecords.has(claimKey)) {
    return {
      success: true,
      xpAwarded: 0,
      message: "Daily Challenge already claimed today! Check back tomorrow for a new gauntlet."
    };
  }
  const rewardXP = 250;
  if (userId) {
    completedChallengeRecords.add(claimKey);
    await awardUserXP(userId, rewardXP, completion.durationSeconds, "daily-arena", completion.score);
  }
  return {
    success: true,
    xpAwarded: rewardXP,
    message: `Gauntlet Conquered! Awarded +${rewardXP} XP bounty to your pilot profile.`
  };
}
export {
  completeDailyChallenge,
  getCurrentDailyChallenge
};
