import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ENV } from "./config/env.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import apiRoutes from "./routes/index.js";
import { initializeFirebaseAdmin } from "./config/firebase.js";
import { connectDatabase } from "./config/database.js";
function createApp() {
  const app = express();
  initializeFirebaseAdmin();
  connectDatabase();
  app.use(
    helmet({
      contentSecurityPolicy: false,
      // Vite handles development inline styles/scripts
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || !ENV.isProduction || ENV.ALLOWED_ORIGINS.includes("*") || ENV.ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Blocked by CORS policy"));
        }
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", apiRateLimiter);
  app.use("/api", apiRoutes);
  app.use("/api/*", notFoundHandler);
  app.use(errorHandler);
  return app;
}
var stdin_default = createApp;
export {
  createApp,
  stdin_default as default
};
