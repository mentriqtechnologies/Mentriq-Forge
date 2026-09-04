import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import firebaseApi, { isFirebaseConfigured } from "../firebase";

const AuthContext = createContext(null);

const getRolePath = (role) => {
  if (role === "company") return "/company/dashboard";
  if (role === "candidate") return "/candidate/dashboard";
  if (role === "evaluator") return "/evaluator/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/";
};

const storeSession = (user, token) => {
  localStorage.setItem("forge_token", token);
  localStorage.setItem("forge_user", JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem("forge_token");
  localStorage.removeItem("forge_user");
};

// A special error used when the account exists but hasn't been activated yet
const createNotVerifiedError = (message = "Please activate your account from the email we sent you.") => {
  const err = new Error(message);
  err.code = "ACCOUNT_NOT_VERIFIED";
  return err;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("forge_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    const userParam = urlParams.get("user");
    if (tokenParam && userParam) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam));
        storeSession(parsedUser, tokenParam);
        setUser(parsedUser);
        setLoading(false);
        window.history.replaceState({}, document.title, "/");
        navigate(getRolePath(parsedUser.role));
        return;
      } catch {
      }
    }

    const token = localStorage.getItem("forge_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("forge_user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Exchange a Firebase ID token for an app session (JWT + Mongo user)
  const exchangeFirebaseToken = async (idToken, role, companyName, intent) => {
    const res = await api.post("/auth/firebase", { idToken, role, companyName, intent });
    return res.data;
  };

  const persist = (userData, token) => {
    storeSession(userData, token);
    setUser(userData);
    return userData;
  };

  // Firebase Google sign-in (popup).
  // On the login page → intent "login": account must already exist, else error.
  // On the register page → intent "signup": new account is created with the chosen role.
  const loginWithGoogle = async (role = "candidate", companyName, { signup = false } = {}) => {
    if (!isFirebaseConfigured()) {
      window.location.href = `${(import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "")}/auth/google`;
      return null;
    }
    const cred = await firebaseApi.signInWithGoogle();
    const idToken = await cred.user.getIdToken(true);
    const { user: userData, token } = await exchangeFirebaseToken(idToken, role, companyName, signup ? "signup" : "login");
    return persist(userData, token);
  };

  // Email + password login via Firebase. Falls back to the legacy backend
  // login for accounts created before Firebase was introduced (and migrates them).
  const login = async (email, password) => {
    if (!isFirebaseConfigured()) {
      const res = await api.post("/auth/login", { email, password });
      return persist(res.data.user, res.data.token);
    }

    let cred;
    try {
      cred = await firebaseApi.signInWithEmailAndPassword(email, password);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        const res = await api.post("/auth/firebase/migrate", { email, password });
        return persist(res.data.user, res.data.token);
      }
      throw err;
    }

    const idToken = await cred.user.getIdToken(true);
    const { user: userData, token } = await exchangeFirebaseToken(idToken, undefined, undefined, "login");

    if (!userData.isVerified) {
      await firebaseApi.signOut().catch(() => {});
      throw createNotVerifiedError();
    }

    return persist(userData, token);
  };

  // Firebase register: creates the Firebase account and sends the activation
  // email, but does NOT create the Mongo user yet. The user is only stored in
  // the database (and appears in User Management) after clicking the activation
  // link, which creates the Mongo record via firebaseAuth. No login until then.
  const register = async ({ name, email, password, role = "candidate", companyName } = {}) => {
    if (!isFirebaseConfigured()) {
      const res = await api.post("/auth/register", { name, email, password, role, companyName });
      return persist(res.data.user, res.data.token);
    }

    const cred = await firebaseApi.createUser(email, password);
    try {
      await firebaseApi.updateDisplayName(cred.user, name);
    } catch (err) {
      await firebaseApi.signOut().catch(() => {});
      throw err;
    }

    // Persist the chosen role + company on the Firebase account so they can be
    // applied later. Crucially, we do NOT create the Mongo user yet — the user
    // only becomes an active user (and appears in the database / User Management)
    // after clicking the activation link and verifying their email.
    try {
      const idToken = await cred.user.getIdToken(true);
      await api.post("/auth/firebase/pending", { idToken, role, companyName });
    } catch {
      // best-effort; role defaults to candidate if claims are not set
    }

    // Send the branded activation email through the backend (SMTP/Resend).
    // This gives us full control over the professional HTML template.
    try {
      await api.post("/auth/send-verification-email", { email, name });
    } catch {
      // Fall back to Firebase's built-in verification email if the backend
      // email provider is unavailable.
      try {
        await firebaseApi.sendVerificationEmail(cred.user);
      } catch {
        // ignore — the frontend still shows the "check your inbox" message
      }
    }

    await firebaseApi.signOut().catch(() => {});
    return { user: null, needsVerification: true };
  };

  // Re-send the activation email (sent through the backend so it uses the
  // branded HTML template)
  const resendVerification = async (email, password) => {
    await api.post("/auth/send-verification-email", { email });
  };

  // Called from /verify-email after the user clicks the activation link in Gmail
  const verifyEmail = async (oobCode) => {
    await firebaseApi.applyActionCode(oobCode);
    const fbUser = firebaseApi.getFirebaseUser();
    if (fbUser) {
      await firebaseApi.reloadUser();
      const idToken = await fbUser.getIdToken(true);
      const { user: userData, token } = await exchangeFirebaseToken(idToken);
      return persist(userData, token);
    }
    return null; // not signed in on this device — user must log in to finish
  };

  // Forgot password — Firebase sends the reset link email (no SMTP needed).
  // Accounts that don't exist in Firebase get a clear "create an account first" error.
  const forgotPassword = async (email) => {
    try {
      await firebaseApi.sendPasswordReset(email);
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-email") {
        const notFound = new Error("No account found with this email address. Please create an account first.");
        notFound.code = "auth/user-not-found";
        throw notFound;
      }
      throw err;
    }
  };

  // Firebase reset password using the oobCode from the reset link
  const resetPassword = async (oobCode, newPassword) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase is not configured yet. Please add your VITE_FIREBASE_* values to frontend/.env");
    }
    await firebaseApi.confirmPasswordReset(oobCode, newPassword);
  };

  const logout = () => {
    clearSession();
    setUser(null);
    firebaseApi.signOut().catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        loginWithGoogle,
        register,
        resendVerification,
        verifyEmail,
        forgotPassword,
        resetPassword,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
