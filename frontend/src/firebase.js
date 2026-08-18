import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset,
  applyActionCode,
  signOut,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

let authInstance = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

if (isConfigured) {
  const app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
}

const getAuthInstance = () => {
  if (!authInstance) {
    throw new Error(
      "Firebase is not configured. Add VITE_FIREBASE_* values to frontend/.env (Firebase Console → Project settings → Your apps → Web app)."
    );
  }
  return authInstance;
};

const getCurrentIdToken = async () => {
  const user = getAuthInstance().currentUser;
  if (!user) throw new Error("Not signed in");
  return user.getIdToken(true);
};

export const isFirebaseConfigured = () => isConfigured;

export const firebaseApi = {
  signInWithGoogle: () => signInWithPopup(getAuthInstance(), googleProvider),
  signInWithEmailAndPassword: (email, password) =>
    signInWithEmailAndPassword(getAuthInstance(), email, password),
  createUser: (email, password) => createUserWithEmailAndPassword(getAuthInstance(), email, password),
  updateDisplayName: (user, displayName) => updateProfile(user, { displayName }),
  sendVerificationEmail: (user) =>
    sendEmailVerification(user, {
      url: `${window.location.origin}/verify-email`,
      handleCodeInApp: false,
    }),
  sendPasswordReset: (email) =>
    sendPasswordResetEmail(getAuthInstance(), email, {
      url: `${window.location.origin}/reset-password`,
      handleCodeInApp: false,
    }),
  confirmPasswordReset: (oobCode, newPassword) =>
    confirmPasswordReset(getAuthInstance(), oobCode, newPassword),
  applyActionCode: (oobCode) => applyActionCode(getAuthInstance(), oobCode),
  signOut: () => signOut(getAuthInstance()),
  getCurrentIdToken,
  getFirebaseUser: () => getAuthInstance().currentUser,
  reloadUser: () => getAuthInstance().currentUser?.reload(),
};

export default firebaseApi;
