// src/components/Sidebar.js
import React from "react";
import { GridIcon, ListIcon, ChartIcon, LogoutIcon, CloseIcon, Flower } from "./Icons";
import { categoryColor } from "../utils";

export const VIEWS = [
  { id: "overview", label: "Overview", Icon: GridIcon },
  { id: "transactions", label: "Transactions", Icon: ListIcon },
  { id: "analytics", label: "Analytics", Icon: ChartIcon },
];

function Sidebar({ view, onNavigate, categories, activeCategory, onPickCategory, onLogout, open, onClose }) {
  return (
    <>
      <div className={open ? "sidebar-backdrop show" : "sidebar-backdrop"} onClick={onClose} />
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="sidebar-brand">
          <span className="brand-mark">₹</span>
          <div>
            <strong>PocketPal</strong>
            <small>Student expense tracker</small>
          </div>
          <button type="button" className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        <nav className="side-section">
          <p className="side-title">Navigation</p>
          {VIEWS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={view === id ? "side-link active" : "side-link"}
              onClick={() => onNavigate(id)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>

        <div className="side-section">
          <p className="side-title">Spending groups</p>
          {categories.length === 0 ? (
            <p className="side-empty">Your categories will show up here.</p>
          ) : (
            categories.slice(0, 6).map((c) => (
              <button
                key={c.category}
                type="button"
                className={activeCategory === c.category ? "side-group active" : "side-group"}
                style={{ "--group": categoryColor(c.category) }}
                onClick={() => onPickCategory(c.category)}
              >
                <span className="group-box" />
                {c.category}
              </button>
            ))
          )}
        </div>

        <div className="sidebar-foot">
          <button type="button" className="side-link" onClick={onLogout}>
            <LogoutIcon />
            Log out
          </button>
          <p className="credit">A student project by Shafeeq</p>
        </div>

        <div className="sidebar-deco" aria-hidden="true">
          <Flower className="deco deco-side-1" />
          <Flower className="deco deco-side-2" />
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
