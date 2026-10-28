import { User } from "../models/User.js";
import { isDatabaseConnected } from "../config/database.js";
const inMemoryUsers = /* @__PURE__ */ new Map();
async function getOrCreateUser(firebaseUid, fallbackName, email) {
  if (isDatabaseConnected()) {
    let user2 = await User.findOne({ firebaseUid });
    if (!user2) {
      user2 = await User.create({
        firebaseUid,
        email,
        displayName: fallbackName || "Cyber Pilot",
        avatar: "\u26A1",
        ringColor: "cyan",
        title: "Neural Pathfinder",
        level: 1,
        xp: 150,
        dailyStreak: 1,
        lastPlayedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        totalPlayTimeSeconds: 60,
        sessionsCount: 0
      });
    }
    return user2.toObject();
  }
  let user = inMemoryUsers.get(firebaseUid);
  if (!user) {
    user = {
      firebaseUid,
      email,
      displayName: fallbackName || "Cyber Pilot",
      avatar: "\u26A1",
      ringColor: "cyan",
      title: "Neural Pathfinder",
      level: 1,
      xp: 150,
      dailyStreak: 1,
      lastPlayedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      totalPlayTimeSeconds: 60,
      sessionsCount: 0,
      preferences: {
        soundEnabled: true,
        crtMode: false,
        reducedMotion: false,
        theme: "cyber-neon"
      },
      gameStats: {},
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    inMemoryUsers.set(firebaseUid, user);
  }
  return user;
}
async function updateUserProfile(firebaseUid, updates) {
  if (isDatabaseConnected()) {
    const user2 = await User.findOneAndUpdate(
      { firebaseUid },
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );
    if (!user2) {
      throw new Error("User profile not found");
    }
    return user2.toObject();
  }
  const user = await getOrCreateUser(firebaseUid);
  if (updates.displayName) user.displayName = updates.displayName;
  if (updates.avatar) user.avatar = updates.avatar;
  if (updates.ringColor) user.ringColor = updates.ringColor;
  if (updates.title) user.title = updates.title;
  if (updates.preferences) user.preferences = { ...user.preferences, ...updates.preferences };
  user.updatedAt = /* @__PURE__ */ new Date();
  inMemoryUsers.set(firebaseUid, user);
  return user;
}
async function awardUserXP(firebaseUid, xpAwarded, durationSeconds, gameId, score) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  if (isDatabaseConnected()) {
    const user2 = await User.findOne({ firebaseUid });
    if (!user2) throw new Error("User not found");
    user2.xp += xpAwarded;
    user2.level = Math.floor(user2.xp / 200) + 1;
    user2.sessionsCount += 1;
    user2.totalPlayTimeSeconds += durationSeconds;
    if (user2.lastPlayedDate !== today) {
      const lastDate = new Date(user2.lastPlayedDate);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1e3 * 60 * 60 * 24));
      if (diffDays === 1) {
        user2.dailyStreak += 1;
      } else if (diffDays > 1) {
        user2.dailyStreak = 1;
      }
      user2.lastPlayedDate = today;
    }
    const currentStats = user2.gameStats.get(gameId) || {
      gamesPlayed: 0,
      bestScore: 0,
      totalScore: 0
    };
    currentStats.gamesPlayed += 1;
    currentStats.totalScore += score;
    currentStats.lastPlayedAt = /* @__PURE__ */ new Date();
    user2.gameStats.set(gameId, currentStats);
    await user2.save();
    return { level: user2.level, totalXP: user2.xp, streak: user2.dailyStreak };
  }
  const user = await getOrCreateUser(firebaseUid);
  user.xp += xpAwarded;
  user.level = Math.floor(user.xp / 200) + 1;
  user.sessionsCount += 1;
  user.totalPlayTimeSeconds += durationSeconds;
  if (user.lastPlayedDate !== today) {
    const lastDate = new Date(user.lastPlayedDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1e3 * 60 * 60 * 24));
    if (diffDays === 1) {
      user.dailyStreak += 1;
    } else if (diffDays > 1) {
      user.dailyStreak = 1;
    }
    user.lastPlayedDate = today;
  }
  inMemoryUsers.set(firebaseUid, user);
  return { level: user.level, totalXP: user.xp, streak: user.dailyStreak };
}
function getAllInMemoryUsers() {
  return Array.from(inMemoryUsers.values());
}
export {
  awardUserXP,
  getAllInMemoryUsers,
  getOrCreateUser,
  updateUserProfile
};
