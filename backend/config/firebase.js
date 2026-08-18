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
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    path.join(__dirname, "..", "mentriq-up-firebase-adminsdk-fbsvc-bf13ed697f.json");
  return serviceAccountPath;
};

let firebaseApp;
try {
  firebaseApp = admin.getApp();
} catch {
  firebaseApp = admin.initializeApp({
    credential: admin.cert(getServiceAccount()),
  });
}

const firebaseAuth = getAuth(firebaseApp);

const verifyFirebaseToken = async (idToken) => {
  const decoded = await firebaseAuth.verifyIdToken(idToken);
  return decoded;
};

module.exports = { firebaseApp, firebaseAuth, verifyFirebaseToken };
