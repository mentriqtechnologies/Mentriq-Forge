const path = require("path");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, "..", "mentriq-up-firebase-adminsdk-fbsvc-bf13ed697f.json");

let firebaseApp;
try {
  firebaseApp = admin.getApp();
} catch {
  firebaseApp = admin.initializeApp({
    credential: admin.cert(serviceAccountPath),
  });
}

const firebaseAuth = getAuth(firebaseApp);

const verifyFirebaseToken = async (idToken) => {
  const decoded = await firebaseAuth.verifyIdToken(idToken);
  return decoded;
};

module.exports = { firebaseApp, firebaseAuth, verifyFirebaseToken };
