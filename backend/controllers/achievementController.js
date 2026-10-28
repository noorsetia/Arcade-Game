import { getAchievements } from "../services/achievementService.js";
async function getAchievementsList(req, res, next) {
  try {
    const userId = req.user?.uid || req.query.userId || null;
    const achievements = await getAchievements(userId);
    res.json({
      success: true,
      count: achievements.length,
      unlockedCount: achievements.filter((a) => a.unlocked).length,
      achievements
    });
  } catch (err) {
    next(err);
  }
}
export {
  getAchievementsList
};
