import { submitGameSession, getPaginatedSessions } from "../services/sessionService.js";
async function postSession(req, res, next) {
  try {
    const userId = req.user?.uid || null;
    const payload = req.body.session || req.body;
    if (!payload.idempotencyKey) {
      payload.idempotencyKey = "gen_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
    }
    const result = await submitGameSession(payload, userId);
    res.status(result.isDuplicate ? 200 : 201).json({
      success: true,
      isDuplicate: result.isDuplicate,
      session: result.session,
      isNewPersonalBest: result.isNewPersonalBest,
      xpAwarded: result.xpAwarded,
      newAchievements: result.newAchievements,
      userStats: result.userStats,
      isServerConfirmed: true
    });
  } catch (err) {
    next(err);
  }
}
async function getSessions(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const gameId = req.query.gameId;
    const userId = req.query.userId || req.user?.uid;
    const data = await getPaginatedSessions({ page, limit, gameId, userId });
    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    next(err);
  }
}
export {
  getSessions,
  postSession
};
