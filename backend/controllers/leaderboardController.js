import { getGameLeaderboard, getGlobalLeaderboard } from "../services/leaderboardService.js";
async function getGameLeaderboardHandler(req, res, next) {
  try {
    const { gameId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    if (gameId === "global" || gameId === "all") {
      const data2 = await getGlobalLeaderboard(page, limit);
      res.json({
        success: true,
        gameId,
        ...data2
      });
      return;
    }
    const data = await getGameLeaderboard(gameId, page, limit);
    res.json({
      success: true,
      gameId,
      ...data
    });
  } catch (err) {
    next(err);
  }
}
async function getGlobalLeaderboardHandler(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const data = await getGlobalLeaderboard(page, limit);
    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    next(err);
  }
}
export {
  getGameLeaderboardHandler,
  getGlobalLeaderboardHandler
};
