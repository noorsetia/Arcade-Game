import { getUserPersonalBests, getUserGameRecord } from "../services/leaderboardService.js";
async function getRecords(req, res, next) {
  try {
    const userId = req.query.userId || req.user?.uid;
    if (!userId) {
      res.json({
        success: true,
        records: {},
        isGuest: true
      });
      return;
    }
    const records = await getUserPersonalBests(userId);
    res.json({
      success: true,
      records,
      userId
    });
  } catch (err) {
    next(err);
  }
}
async function getRecordByGameId(req, res, next) {
  try {
    const { gameId } = req.params;
    const userId = req.query.userId || req.user?.uid;
    if (!userId) {
      res.json({
        success: true,
        gameId,
        record: null
      });
      return;
    }
    const record = await getUserGameRecord(userId, gameId);
    res.json({
      success: true,
      gameId,
      record
    });
  } catch (err) {
    next(err);
  }
}
export {
  getRecordByGameId,
  getRecords
};
