import { ENV } from "../config/env.js";
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.name === "ValidationError" ? 400 : 500);
  const code = err.code || (statusCode === 400 ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR");
  if (!ENV.isProduction || statusCode >= 500) {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);
  }
  res.status(statusCode).json({
    success: false,
    error: err.message || "An unexpected error occurred.",
    code,
    ...err.details ? { details: err.details } : {}
  });
}
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Resource not found: ${req.method} ${req.originalUrl}`,
    code: "NOT_FOUND"
  });
}
export {
  errorHandler,
  notFoundHandler
};
