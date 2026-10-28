import rateLimit from "express-rate-limit";
import { ENV } from "../config/env.js";
const apiRateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  // 15 minutes
  max: ENV.RATE_LIMIT_MAX,
  // 300 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP address. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED"
  }
});
const sessionRateLimiter = rateLimit({
  windowMs: 60 * 1e3,
  // 1 minute
  max: ENV.SESSION_RATE_LIMIT_MAX,
  // 60 session submissions per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many session submissions. Please slow down.",
    code: "SESSION_RATE_LIMIT_EXCEEDED"
  }
});
export {
  apiRateLimiter,
  sessionRateLimiter
};
