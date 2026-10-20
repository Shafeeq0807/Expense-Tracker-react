// src/components/Dashboard.js
import React, { useState, useEffect, useCallback } from "react";
import Sidebar, { VIEWS } from "./Sidebar";
import Topbar from "./Topbar";
import Overview from "./Overview";
import Insights from "./Insights";
import AnalyticsCharts, { CategoryDoughnut } from "./AnalyticsCharts";
import ExpenseTable from "./ExpenseTable";
import ExpenseModal from "./ExpenseModal";
import { api } from "../api";

const viewFromHash = () => {
  const id = window.location.hash.slice(1);
  return VIEWS.some((v) => v.id === id) ? id : "overview";
};

function Dashboard({ user, onUserChange, onLogout, theme, onToggleTheme }) {
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [view, setView] = useState(viewFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null); // null, or { editing: expense | null }
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Keep the page in the URL hash so refresh and the back button work
  useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((id) => {
    window.location.hash = id;
    setView(id);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const load = useCallback(async () => {
    try {
      const [list, stats] = await Promise.all([api("/expenses"), api("/expenses/analytics?months=6")]);
      setExpenses(list);
      setAnalytics(stats);
      setError("");
    } catch (err) {
      if (err.status === 401) return onLogout();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  // Runs an API call and shows its error in the banner; returns true on success
  const run = async (fn) => {
    try {
      await fn();
      return true;
    } catch (err) {
      if (err.status === 401) onLogout();
      else setError(err.message);
      return false;
    }
  };

  const handleSave = async (payload) => {
    const editing = modal && modal.editing;
    const ok = await run(async () => {
      if (editing) await api(`/expenses/${editing.id}`, { method: "PUT", body: payload });
      else await api("/expenses", { method: "POST", body: payload });
      await load();
    });
    if (ok) setModal(null);
    return ok;
  };

  const handleDelete = (expense) => {
    if (!window.confirm(`Delete "${expense.note || expense.category}"?`)) return;
    run(async () => {
      await api(`/expenses/${expense.id}`, { method: "DELETE" });
      await load();
    });
  };

  const handleBudgetSave = (value) =>
    run(async () => {
      const { monthly_budget } = await api("/auth/budget", { method: "PUT", body: { monthly_budget: value } });
      onUserChange({ ...user, monthly_budget });
      await load();
    });

  const openAdd = () => setModal({ editing: null });
  const openEdit = (expense) => setModal({ editing: expense });
  const closeModal = useCallback(() => setModal(null), []);

  const handleSearch = (value) => {
    setSearch(value);
    if (value && view !== "transactions") navigate("transactions");
  };

  const openCategory = (name) => {
    setCategory(name);
    navigate("transactions");
  };

  const title = VIEWS.find((v) => v.id === view).label;

  let content;
  if (loading || !analytics) {
    content = <div className="panel panel-center">Loading your data…</div>;
  } else if (view === "overview") {
    content = (
      <Overview
        analytics={analytics}
        expenses={expenses}
        budget={user.monthly_budget}
        theme={theme}
        onBudgetSave={handleBudgetSave}
        onEdit={openEdit}
        onDelete={handleDelete}
        onAdd={openAdd}
        onNavigate={navigate}
        onOpenCategory={openCategory}
      />
    );
  } else if (view === "transactions") {
    content = (
      <section className="panel">
        <ExpenseTable
          expenses={expenses}
          search={search}
          onSearch={setSearch}
          category={category}
          onCategory={setCategory}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </section>
    );
  } else {
    content = (
      <div className="analytics-grid">
        <section className="panel span-2">
          <h2>Spending trend</h2>
          <AnalyticsCharts analytics={analytics} theme={theme} />
        </section>
        <section className="panel">
          <h2>Where your money goes</h2>
          <CategoryDoughnut categories={analytics.categories} theme={theme} />
        </section>
        <section className="panel">
          <h2>Smart insights</h2>
          <Insights analytics={analytics} budget={user.monthly_budget} expenses={expenses} />
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        view={view}
        onNavigate={navigate}
        categories={analytics ? analytics.categories : []}
        activeCategory={view === "transactions" ? category : null}
        onPickCategory={openCategory}
        onLogout={onLogout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="main">
        <div className="main-card">
          <Topbar
            user={user}
            search={search}
            onSearch={handleSearch}
            onAdd={openAdd}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onOpenMenu={() => setMenuOpen(true)}
          />

          <div className="page-head">
            <h1>{title}</h1>
            <p>
              {view === "overview"
                ? "Here's how your pocket money is doing this month."
                : view === "transactions"
                ? "Every rupee you've logged, with search and filters."
                : "Trends and tips based on the last 6 months."}
            </p>
          </div>

          {error && (
            <div className="banner banner-error" role="alert">
              {error}
              <button type="button" className="banner-close" onClick={() => setError("")} aria-label="Dismiss">
                ×
              </button>
            </div>
          )}

          {content}
        </div>
      </div>

      {modal && <ExpenseModal editing={modal.editing} onSave={handleSave} onClose={closeModal} />}
    </div>
  );
}

export default Dashboard;
