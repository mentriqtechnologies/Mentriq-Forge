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

  // Firebase register: creates the account, sends the activation email,
  // syncs the Mongo user — but does NOT log the user in until they activate
  // their account from the Gmail link.
  const register = async ({ name, email, password, role = "candidate", companyName } = {}) => {
    if (!isFirebaseConfigured()) {
      const res = await api.post("/auth/register", { name, email, password, role, companyName });
      return persist(res.data.user, res.data.token);
    }

    const cred = await firebaseApi.createUser(email, password);
    try {
      await firebaseApi.updateDisplayName(cred.user, name);
      await firebaseApi.sendVerificationEmail(cred.user);
    } catch (err) {
      await firebaseApi.signOut().catch(() => {});
      throw err;
    }

    const idToken = await cred.user.getIdToken(true);
    const { user: userData } = await exchangeFirebaseToken(idToken, role, companyName, "signup");

    await firebaseApi.signOut().catch(() => {});
    return { user: userData, needsVerification: true };
  };

  // Re-send the activation email for an existing (unverified) account
  const resendVerification = async (email, password) => {
    const cred = await firebaseApi.signInWithEmailAndPassword(email, password);
    await firebaseApi.sendVerificationEmail(cred.user);
    await firebaseApi.signOut().catch(() => {});
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

  // Firebase forgot password — sends the reset link email
  const forgotPassword = async (email) => {
    if (!isFirebaseConfigured()) {
      await api.post("/auth/forgot-password", { email });
      return;
    }
    try {
      await firebaseApi.sendPasswordReset(email);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        // Legacy (pre-Firebase) account → fall back to the old reset mailer
        await api.post("/auth/forgot-password", { email });
        return;
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
