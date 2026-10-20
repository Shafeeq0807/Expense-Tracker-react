// src/App.js
import React, { useState, useEffect, useCallback } from "react";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import { api, getToken, setToken } from "./api";
import "./App.css";

const THEME_KEY = "expense_tracker_theme";

// Saved choice first, then the system preference
const initialTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage blocked: fall through to the system preference
  }
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(getToken()));
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Not saved; the theme still applies for this visit
    }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  // Restore the session from a saved token on first load
  useEffect(() => {
    if (!getToken()) return;
    api("/auth/me")
      .then(({ user }) => setUser(user))
      .catch(() => setToken(null))
      .finally(() => setChecking(false));
  }, []);

  const handleAuth = useCallback(({ token, user }) => {
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  if (checking) {
    return <div className="splash">Loading your dashboard…</div>;
  }

  if (!user) {
    return <AuthPage onAuth={handleAuth} theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <Dashboard
      user={user}
      onUserChange={setUser}
      onLogout={logout}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}

export default App;
