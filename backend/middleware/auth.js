import { verifyFirebaseToken } from "../config/firebase.js";
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
}
async function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({
      success: false,
      error: "Authentication required. Missing Bearer token.",
      code: "AUTH_TOKEN_MISSING"
    });
    return;
  }
  try {
    const verifiedUser = await verifyFirebaseToken(token);
    if (!verifiedUser) {
      res.status(401).json({
        success: false,
        error: "Invalid authentication credentials.",
        code: "AUTH_TOKEN_INVALID"
      });
      return;
    }
    req.user = verifiedUser;
    req.isGuest = false;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message || "Token verification failed.",
      code: "AUTH_VERIFICATION_FAILED"
    });
  }
}
async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    req.isGuest = true;
    next();
    return;
  }
  try {
    const verifiedUser = await verifyFirebaseToken(token);
    req.user = verifiedUser;
    req.isGuest = false;
  } catch {
    req.user = null;
    req.isGuest = true;
  }
  next();
}
export {
  optionalAuth,
  requireAuth
};
