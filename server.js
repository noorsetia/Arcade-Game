import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import { createApp } from "./backend/app.js";
import { ENV } from "./backend/config/env.js";
import { seedDatabase } from "./backend/seed/seedData.js";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = createApp();
const PORT = ENV.PORT;
const isProduction = ENV.isProduction;
seedDatabase().catch((err) => {
  console.warn("[Server] Seed warning:", err.message);
});
app.get(["/developer-arcade.zip", "/api/download-zip"], (req, res) => {
  const filePath = path.join(__dirname, "public", "developer-arcade.zip");
  res.download(filePath, "developer-arcade.zip");
});
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`[Developer Arcade] Server running on port ${PORT} [${isProduction ? "PRODUCTION" : "DEVELOPMENT"}]`);
  });
}
startServer();
export {
  app
};
