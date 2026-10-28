import mongoose from "mongoose";
import { ENV } from "./env.js";
let isConnected = false;
async function connectDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }
  let uri = ENV.MONGODB_URI;
  if (!uri) {
    console.warn(
      "[MongoDB Atlas] Warning: MONGODB_URI is not set in environment variables.\n  The backend will operate with graceful mock/hybrid persistence."
    );
    return false;
  }
  if (uri.endsWith("/")) {
    uri = `${uri}${ENV.MONGODB_DB_NAME}?retryWrites=true&w=majority`;
  }
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, {
      dbName: ENV.MONGODB_DB_NAME,
      autoIndex: !ENV.isProduction,
      serverSelectionTimeoutMS: 8e3,
      socketTimeoutMS: 45e3
    });
    isConnected = true;
    console.log(`[MongoDB Atlas] Successfully connected to database: ${ENV.MONGODB_DB_NAME}`);
    return true;
  } catch (err) {
    console.error("[MongoDB Atlas] Connection failed:", err.message);
    return false;
  }
}
function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
export {
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected
};
