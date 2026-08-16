import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext(null);

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
        localStorage.setItem("forge_token", tokenParam);
        localStorage.setItem("forge_user", JSON.stringify(parsedUser));
        setUser(parsedUser);
        setLoading(false);
        window.history.replaceState({}, document.title, "/");
        const role = parsedUser.role;
        if (role === "company") navigate("/company/dashboard");
        else if (role === "candidate") navigate("/candidate/dashboard");
        else if (role === "evaluator") navigate("/evaluator/dashboard");
        else if (role === "admin") navigate("/admin/dashboard");
        else navigate("/");
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
        localStorage.removeItem("forge_token");
        localStorage.removeItem("forge_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("forge_token", res.data.token);
    localStorage.setItem("forge_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await api.post("/auth/register", payload);
    localStorage.setItem("forge_token", res.data.token);
    localStorage.setItem("forge_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("forge_token");
    localStorage.removeItem("forge_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
