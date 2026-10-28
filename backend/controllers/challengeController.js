import { getCurrentDailyChallenge, completeDailyChallenge } from "../services/challengeService.js";
async function getDaily(req, res, next) {
  try {
    const challenge = await getCurrentDailyChallenge();
    res.json({
      success: true,
      challenge
    });
  } catch (err) {
    next(err);
  }
}
async function completeDaily(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.uid || null;
    const result = await completeDailyChallenge(userId, id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
export {
  completeDaily,
  getDaily
};
