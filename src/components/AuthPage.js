// src/components/AuthPage.js
import React, { useState } from "react";
import { api } from "../api";
import { Flower, SunIcon, MoonIcon } from "./Icons";

function AuthPage({ onAuth, theme, onToggleTheme }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const switchMode = (next) => {
    if (next === mode) return;
    setMode(next);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const data = await api(isRegister ? "/auth/register" : "/auth/login", {
        method: "POST",
        body: payload,
      });
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <button
        type="button"
        className="icon-btn theme-corner"
        onClick={onToggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>

      <Flower className="deco deco-auth-1" />
      <Flower className="deco deco-auth-2" />

      <div className="auth-card">
        <div className="auth-art">
          <Flower className="card-flower one" />
          <Flower className="card-flower two" />
          <span className="brand-mark light">₹</span>
          <h2>Know where your pocket money goes.</h2>
          <p>Log canteen snacks, bus fares, books and recharges in seconds, and see where every rupee goes.</p>
          <ul>
            <li>📊 Monthly and 30-day charts</li>
            <li>🎯 Daily spending allowance</li>
            <li>💡 Simple money tips</li>
          </ul>
        </div>

        <div className="auth-main">
          <div className="auth-brand">
            <strong>PocketPal</strong>
            <span>Student expense tracker</span>
          </div>

          <h1>{isRegister ? "Create your account" : "Welcome back 👋"}</h1>

          <div className="auth-tabs">
            <button type="button" className={!isRegister ? "tab active" : "tab"} onClick={() => switchMode("login")}>
              Log in
            </button>
            <button type="button" className={isRegister ? "tab active" : "tab"} onClick={() => switchMode("register")}>
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <label>
                Name
                <input
                  type="text"
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@college.edu"
                autoComplete="email"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={update("password")}
                placeholder={isRegister ? "At least 6 characters" : "Your password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "Please wait…" : isRegister ? "Create account" : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
