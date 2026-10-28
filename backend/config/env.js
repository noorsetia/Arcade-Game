import dotenv from "dotenv";
dotenv.config();
const ENV = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://noorsetia24_db_user:arcade@cluster0.srypef2.mongodb.net/developer_arcade?retryWrites=true&w=majority",
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || "developer_arcade",
  // Firebase Admin Configuration
  FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "public/assets/aistudio/arcade-game-17c0f-firebase-adminsdk-fbsvc-56c20a8191_b911a2c2.json",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "arcade-game-17c0f",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@arcade-game-17c0f.iam.gserviceaccount.com",
  FIREBASE_PRIVATE_KEY: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || "",
  // Security & Rate Limiting
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()) : ["http://localhost:3000", "http://127.0.0.1:3000", "*"],
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  // 15 mins
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "300", 10),
  SESSION_RATE_LIMIT_MAX: parseInt(process.env.SESSION_RATE_LIMIT_MAX || "60", 10),
  // 60 session submissions per window
  // Gemini AI Key
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ""
};
export {
  ENV
};
