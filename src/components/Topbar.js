// src/components/Topbar.js
import React from "react";
import { MenuIcon, SearchIcon, PlusIcon, SunIcon, MoonIcon } from "./Icons";
import { initials } from "../utils";

function Topbar({ user, search, onSearch, onAdd, theme, onToggleTheme, onOpenMenu }) {
  const firstName = user.name.split(" ")[0];

  return (
    <header className="topbar">
      <button type="button" className="icon-btn menu-btn" onClick={onOpenMenu} aria-label="Open menu">
        <MenuIcon />
      </button>

      <label className="search">
        <SearchIcon />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search expenses…"
          aria-label="Search expenses"
        />
      </label>

      <div className="topbar-actions">
        <button type="button" className="btn btn-primary add-btn" onClick={onAdd} aria-label="Add expense">
          <PlusIcon />
          <span>Add expense</span>
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
        <div className="user-chip">
          <span className="hello">Hi, {firstName}</span>
          <span className="avatar">{initials(user.name)}</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
