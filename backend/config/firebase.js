const path = require("path");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");

// On Render/Vercel the service account file is gitignored, so the credentials
// are provided as a FIREBASE_SERVICE_ACCOUNT_JSON env variable instead.
// Locally it falls back to the downloaded admin SDK JSON file.
const getServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    return process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  }
  const defaultPath = path.join(__dirname, "..", "mentriq-up-firebase-adminsdk-fbsvc-bf13ed697f.json");
  if (process.env.NODE_ENV === "production" || process.env.RENDER) {
    // The admin SDK JSON file is gitignored and does not exist on Render —
    // production must provide FIREBASE_SERVICE_ACCOUNT_JSON.
    return null;
  }
  return defaultPath;
};

let firebaseApp;
try {
  firebaseApp = admin.getApp();
} catch {
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    throw new Error(
      "Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_JSON in the environment " +
        "(full content of the service account JSON) or place the admin SDK JSON file in backend/."
    );
  }
  firebaseApp = admin.initializeApp({
    credential: admin.cert(serviceAccount),
  });
}

const firebaseAuth = getAuth(firebaseApp);

const verifyFirebaseToken = async (idToken) => {
  const decoded = await firebaseAuth.verifyIdToken(idToken);
  return decoded;
};

module.exports = { firebaseApp, firebaseAuth, verifyFirebaseToken };
