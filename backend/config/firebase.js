import fs from "fs";
import path from "path";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { ENV } from "./env.js";
let adminApp = null;
let firebaseInitialized = false;
function initializeFirebaseAdmin() {
  if (firebaseInitialized) return true;
  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0];
      firebaseInitialized = true;
      return true;
    }
    const possiblePaths = [
      ENV.FIREBASE_SERVICE_ACCOUNT_PATH,
      ENV.FIREBASE_SERVICE_ACCOUNT_PATH
        ? path.resolve(process.cwd(), ENV.FIREBASE_SERVICE_ACCOUNT_PATH)
        : null
    ];
    let serviceAccountData = null;
    for (const p of possiblePaths) {
      if (p && fs.existsSync(p)) {
        try {
          const content = fs.readFileSync(p, "utf-8");
          serviceAccountData = JSON.parse(content);
          break;
        } catch (e) {
        }
      }
    }
    if (serviceAccountData) {
      adminApp = initializeApp({
        credential: cert(serviceAccountData),
        databaseURL: ENV.FIREBASE_DATABASE_URL || void 0
      });
      firebaseInitialized = true;
      console.log(`[Firebase Admin] Successfully initialized with Service Account for project: ${serviceAccountData.project_id}`);
      return true;
    }
    if (ENV.FIREBASE_PROJECT_ID && ENV.FIREBASE_CLIENT_EMAIL && ENV.FIREBASE_PRIVATE_KEY) {
      adminApp = initializeApp({
        credential: cert({
          projectId: ENV.FIREBASE_PROJECT_ID,
          clientEmail: ENV.FIREBASE_CLIENT_EMAIL,
          privateKey: ENV.FIREBASE_PRIVATE_KEY
        }),
        databaseURL: ENV.FIREBASE_DATABASE_URL || void 0
      });
      firebaseInitialized = true;
      console.log(`[Firebase Admin] Initialized with Service Account for project: ${ENV.FIREBASE_PROJECT_ID}`);
      return true;
    }
    if (ENV.FIREBASE_PROJECT_ID) {
      adminApp = initializeApp({
        projectId: ENV.FIREBASE_PROJECT_ID
      });
      firebaseInitialized = true;
      console.log(`[Firebase Admin] Initialized with ADC for project: ${ENV.FIREBASE_PROJECT_ID}`);
      return true;
    }
    console.warn("[Firebase Admin] No Firebase credentials found. Running in dev mock auth mode.");
    return false;
  } catch (err) {
    console.warn("[Firebase Admin] Initialization warning (falling back to dev mock auth):", err.message);
    return false;
  }
}
async function verifyFirebaseToken(token) {
  if (!token) return null;
  if (firebaseInitialized && adminApp) {
    try {
      const decoded = await getAuth(adminApp).verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.displayName || "Cyber Pilot",
        picture: decoded.picture,
        isAnonymous: decoded.firebase?.sign_in_provider === "anonymous"
      };
    } catch (err) {
      if (ENV.isProduction) {
        throw new Error(`Firebase token verification failed: ${err.message}`);
      }
    }
  }
  if (!ENV.isProduction) {
    if (token.startsWith("mock_token_") || token.startsWith("dev_token_") || token.startsWith("tok_")) {
      const parts = token.split("_");
      const uid = parts.slice(2).join("_") || "dev_user_1";
      return {
        uid,
        email: `${uid}@arcade.local`,
        name: `Pilot ${uid.slice(0, 6)}`,
        isAnonymous: false
      };
    }
  }
  throw new Error("Invalid or unverified Firebase authentication token");
}
export {
  initializeFirebaseAdmin,
  verifyFirebaseToken
};
