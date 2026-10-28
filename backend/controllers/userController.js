import { getOrCreateUser, updateUserProfile } from "../services/userService.js";
async function getMe(req, res, next) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required. No active session found.",
        code: "AUTH_REQUIRED"
      });
      return;
    }
    const user = await getOrCreateUser(req.user.uid, req.user.name, req.user.email);
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
}
async function patchMe(req, res, next) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required to update profile.",
        code: "AUTH_REQUIRED"
      });
      return;
    }
    const updated = await updateUserProfile(req.user.uid, req.body);
    res.json({
      success: true,
      user: updated
    });
  } catch (err) {
    next(err);
  }
}
export {
  getMe,
  patchMe
};
