import { GameSession } from "../models/GameSession.js";
import { PersonalBest } from "../models/PersonalBest.js";
import { GAME_RULES, isScoreBetter } from "../config/games.js";
import { awardUserXP } from "./userService.js";
import { evaluateAchievements } from "./achievementService.js";
import { isDatabaseConnected } from "../config/database.js";
const inMemorySessions = /* @__PURE__ */ new Map();
const inMemoryPersonalBests = /* @__PURE__ */ new Map();
async function submitGameSession(input, userId) {
  const { idempotencyKey, gameId, score, durationSeconds, difficulty = "Standard", mode = "Single Player", metrics = {}, guestId } = input;
  if (isDatabaseConnected()) {
    const existing = await GameSession.findOne({ idempotencyKey });
    if (existing) {
      return {
        session: existing.toObject(),
        isNewPersonalBest: existing.isNewPersonalBest,
        xpAwarded: existing.xpAwarded,
        newAchievements: [],
        isDuplicate: true
      };
    }
  } else {
    const existing = inMemorySessions.get(idempotencyKey);
    if (existing) {
      return {
        session: existing,
        isNewPersonalBest: existing.isNewPersonalBest,
        xpAwarded: existing.xpAwarded,
        newAchievements: [],
        isDuplicate: true
      };
    }
  }
  const rule = GAME_RULES[gameId];
  if (!rule) {
    throw new Error(`Unrecognized game identifier: ${gameId}`);
  }
  let validationStatus = "verified";
  let rejectionReason = void 0;
  if (score < rule.minScore || score > rule.maxScore) {
    validationStatus = "rejected";
    rejectionReason = `Score ${score} out of permitted range [${rule.minScore}, ${rule.maxScore}]`;
  }
  if (gameId === "reaction-test" && score < 80) {
    validationStatus = "rejected";
    rejectionReason = `Reaction latency ${score}ms below physiological limit (80ms)`;
  }
  if (durationSeconds < rule.minDurationSeconds && score > 0) {
    validationStatus = "unverified";
    rejectionReason = `Run duration ${durationSeconds}s suspiciously brief`;
  }
  let trustedXP = 0;
  if (validationStatus !== "rejected") {
    trustedXP = rule.calculateTrustedXP(score, difficulty, durationSeconds);
  }
  let isNewPersonalBest = false;
  const pbKey = `${userId || guestId || "guest"}:${gameId}:${mode}:${difficulty}`;
  let incumbentBestScore = 0;
  if (userId) {
    if (isDatabaseConnected()) {
      const existingPB = await PersonalBest.findOne({ userId, gameId, mode, difficulty });
      if (existingPB) {
        incumbentBestScore = existingPB.bestScore;
      }
    } else {
      const existingPB = inMemoryPersonalBests.get(pbKey);
      if (existingPB) {
        incumbentBestScore = existingPB.bestScore;
      }
    }
  }
  if (validationStatus === "verified") {
    isNewPersonalBest = isScoreBetter(gameId, score, incumbentBestScore);
  }
  const sessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  if (userId && isNewPersonalBest && validationStatus === "verified") {
    if (isDatabaseConnected()) {
      await PersonalBest.findOneAndUpdate(
        { userId, gameId, mode, difficulty },
        {
          $set: {
            bestScore: score,
            metricDirection: rule.metricDirection,
            sessionId,
            updatedAt: /* @__PURE__ */ new Date()
          }
        },
        { upsert: true, returnDocument: "after" }
      );
    } else {
      inMemoryPersonalBests.set(pbKey, {
        userId,
        gameId,
        mode,
        difficulty,
        bestScore: score,
        metricDirection: rule.metricDirection,
        sessionId,
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
  }
  let newAchievements = [];
  if (userId && validationStatus === "verified") {
    newAchievements = await evaluateAchievements(userId, gameId, score, sessionId);
    trustedXP += newAchievements.length * 100;
  }
  let userStats;
  if (userId && validationStatus !== "rejected") {
    userStats = await awardUserXP(userId, trustedXP, durationSeconds, gameId, score);
  }
  let sessionRecord;
  if (isDatabaseConnected()) {
    const created = await GameSession.create({
      idempotencyKey,
      userId: userId || null,
      guestId: guestId || null,
      gameId,
      gameName: rule.title,
      mode,
      difficulty,
      score,
      durationSeconds,
      metrics,
      completionStatus: validationStatus === "rejected" ? "failed" : "completed",
      validationStatus,
      rejectionReason,
      xpAwarded: trustedXP,
      isNewPersonalBest,
      isCompetitive: validationStatus === "verified",
      clientSubmittedAt: input.clientSubmittedAt ? new Date(input.clientSubmittedAt) : /* @__PURE__ */ new Date()
    });
    sessionRecord = created.toObject();
  } else {
    sessionRecord = {
      _id: sessionId,
      id: sessionId,
      idempotencyKey,
      userId: userId || null,
      guestId: guestId || null,
      gameId,
      gameName: rule.title,
      mode,
      difficulty,
      score,
      durationSeconds,
      metrics,
      completionStatus: validationStatus === "rejected" ? "failed" : "completed",
      validationStatus,
      rejectionReason,
      xpAwarded: trustedXP,
      isNewPersonalBest,
      isCompetitive: validationStatus === "verified",
      clientSubmittedAt: input.clientSubmittedAt || (/* @__PURE__ */ new Date()).toISOString(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    inMemorySessions.set(idempotencyKey, sessionRecord);
  }
  return {
    session: sessionRecord,
    isNewPersonalBest,
    xpAwarded: trustedXP,
    newAchievements,
    userStats,
    isDuplicate: false
  };
}
async function getPaginatedSessions(query) {
  const { page = 1, limit = 20, gameId, userId } = query;
  const skip = (page - 1) * limit;
  if (isDatabaseConnected()) {
    const filter = {};
    if (gameId) filter.gameId = gameId;
    if (userId) filter.userId = userId;
    const [sessions, total] = await Promise.all([
      GameSession.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      GameSession.countDocuments(filter)
    ]);
    return {
      sessions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }
  let all = Array.from(inMemorySessions.values());
  if (gameId) all = all.filter((s) => s.gameId === gameId);
  if (userId) all = all.filter((s) => s.userId === userId);
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const paginated = all.slice(skip, skip + limit);
  return {
    sessions: paginated,
    total: all.length,
    page,
    limit,
    totalPages: Math.ceil(all.length / limit) || 1
  };
}
export {
  getPaginatedSessions,
  submitGameSession
};
