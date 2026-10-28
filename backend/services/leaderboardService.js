import { PersonalBest } from "../models/PersonalBest.js";
import { User } from "../models/User.js";
import { GAME_RULES } from "../config/games.js";
import { isDatabaseConnected } from "../config/database.js";
import { getAllInMemoryUsers } from "./userService.js";
function determineTier(gameId, score) {
  if (gameId === "reaction-test") {
    if (score <= 180) return "Sub-200ms Apex";
    if (score <= 220) return "Synapse Elite";
    if (score <= 280) return "Standard Reflex";
    return "Cadet";
  }
  if (gameId === "memory") {
    if (score <= 10) return "Eidetic Master";
    if (score <= 16) return "Photographic";
    return "Standard";
  }
  if (score >= 2e3) return "Apex Legend";
  if (score >= 1e3) return "Grandmaster";
  if (score >= 500) return "Cyber Elite";
  return "Skilled Pilot";
}
async function getGameLeaderboard(gameId, page = 1, limit = 20) {
  const rule = GAME_RULES[gameId];
  const isLowerBetter = rule?.metricDirection === "lower";
  const sortDirection = isLowerBetter ? 1 : -1;
  const skip = (page - 1) * limit;
  if (isDatabaseConnected()) {
    const total = await PersonalBest.countDocuments({ gameId });
    const records = await PersonalBest.find({ gameId }).sort({ bestScore: sortDirection, updatedAt: 1 }).skip(skip).limit(limit).lean();
    const userIds = records.map((r) => r.userId);
    const users = await User.find({ firebaseUid: { $in: userIds } }).lean();
    const userMap = new Map(users.map((u) => [u.firebaseUid, u]));
    const leaderboards = records.map((record, index) => {
      const user = userMap.get(record.userId);
      return {
        rank: skip + index + 1,
        userId: record.userId,
        username: user?.displayName || `Pilot_${record.userId.slice(0, 6)}`,
        avatar: user?.avatar || "\u26A1",
        ringColor: user?.ringColor || "cyan",
        gameId: record.gameId,
        score: record.bestScore,
        tier: determineTier(record.gameId, record.bestScore),
        date: record.updatedAt ? new Date(record.updatedAt).toISOString().split("T")[0] : "Recent"
      };
    });
    return {
      leaderboards,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    };
  }
  const baselineSeeds = {
    "all": [
      { rank: 1, userId: "u_1", username: "Ada_Lovelace", avatar: "\u{1F451}", ringColor: "gold", gameId: "all", score: 3850, tier: "Apex Legend", date: "2026-10-26" },
      { rank: 2, userId: "u_2", username: "K_Thompson", avatar: "\u{1F4BB}", ringColor: "cyan", gameId: "all", score: 3420, tier: "Master Mind", date: "2026-10-26" },
      { rank: 3, userId: "u_3", username: "Linus_T", avatar: "\u{1F427}", ringColor: "emerald", gameId: "all", score: 3100, tier: "Grandmaster", date: "2026-10-27" },
      { rank: 4, userId: "u_4", username: "Turing_Enigma", avatar: "\u{1F9E0}", ringColor: "magenta", gameId: "all", score: 2890, tier: "Grandmaster", date: "2026-10-27" },
      { rank: 5, userId: "u_5", username: "Grace_Hopper", avatar: "\u{1F98B}", ringColor: "indigo", gameId: "all", score: 2640, tier: "Cyber Elite", date: "2026-10-25" }
    ],
    "snake": [
      { rank: 1, userId: "u_s1", username: "PythonMaster", avatar: "\u{1F40D}", ringColor: "emerald", gameId: "snake", score: 340, tier: "Apex Legend", date: "2026-10-26" },
      { rank: 2, userId: "u_s2", username: "Linus_T", avatar: "\u{1F427}", ringColor: "cyan", gameId: "snake", score: 280, tier: "Grandmaster", date: "2026-10-27" }
    ],
    "reaction-test": [
      { rank: 1, userId: "u_r1", username: "Synapse_God", avatar: "\u26A1", ringColor: "cyan", gameId: "reaction-test", score: 168, tier: "Sub-200ms Apex", date: "2026-10-26" },
      { rank: 2, userId: "u_r2", username: "F1_Driver", avatar: "\u{1F3CE}\uFE0F", ringColor: "gold", gameId: "reaction-test", score: 196, tier: "Sub-200ms Apex", date: "2026-10-27" }
    ]
  };
  const list = baselineSeeds[gameId] || baselineSeeds["all"];
  return {
    leaderboards: list.slice(skip, skip + limit),
    total: list.length,
    page,
    totalPages: Math.ceil(list.length / limit) || 1
  };
}
async function getGlobalLeaderboard(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  if (isDatabaseConnected()) {
    const total = await User.countDocuments();
    const users = await User.find().sort({ xp: -1, level: -1 }).skip(skip).limit(limit).lean();
    const leaderboards = users.map((u, index) => ({
      rank: skip + index + 1,
      userId: u.firebaseUid,
      username: u.displayName,
      avatar: u.avatar,
      ringColor: u.ringColor,
      gameId: "global",
      score: u.xp,
      tier: u.level >= 10 ? "Grandmaster" : u.level >= 5 ? "Cyber Elite" : "Senior Dev",
      date: u.lastPlayedDate || "Today"
    }));
    return {
      leaderboards,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    };
  }
  const memUsers = getAllInMemoryUsers().sort((a, b) => b.xp - a.xp);
  if (memUsers.length > 0) {
    const leaderboards = memUsers.slice(skip, skip + limit).map((u, index) => ({
      rank: skip + index + 1,
      userId: u.firebaseUid,
      username: u.displayName,
      avatar: u.avatar,
      ringColor: u.ringColor,
      gameId: "global",
      score: u.xp,
      tier: u.level >= 10 ? "Grandmaster" : u.level >= 5 ? "Cyber Elite" : "Senior Dev",
      date: u.lastPlayedDate || "Today"
    }));
    return {
      leaderboards,
      total: memUsers.length,
      page,
      totalPages: Math.ceil(memUsers.length / limit) || 1
    };
  }
  return getGameLeaderboard("all", page, limit);
}
async function getUserPersonalBests(userId) {
  if (isDatabaseConnected()) {
    const pbs = await PersonalBest.find({ userId }).lean();
    const res = {};
    pbs.forEach((pb) => {
      res[pb.gameId] = pb.bestScore;
    });
    return res;
  }
  return {};
}
async function getUserGameRecord(userId, gameId) {
  if (isDatabaseConnected()) {
    return await PersonalBest.findOne({ userId, gameId }).lean();
  }
  return null;
}
export {
  determineTier,
  getGameLeaderboard,
  getGlobalLeaderboard,
  getUserGameRecord,
  getUserPersonalBests
};
