import { GAME_RULES } from "../config/games.js";
function getGames(req, res) {
  const gamesList = Object.values(GAME_RULES).map((rule) => ({
    id: rule.id,
    title: rule.title,
    category: rule.category,
    metricDirection: rule.metricDirection,
    minScore: rule.minScore,
    maxScore: rule.maxScore,
    supportedDifficulties: rule.supportedDifficulties,
    supportedModes: rule.supportedModes,
    allowedMetrics: rule.allowedMetrics,
    baseXP: rule.baseXP
  }));
  res.json({
    success: true,
    count: gamesList.length,
    games: gamesList
  });
}
export {
  getGames
};
