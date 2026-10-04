import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, STORAGE_KEY, localDate, toCents, loadExpenses, money, csv } from "./ledger.js";

function download(text, name, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function App() {
  const [initial] = useState(() => loadExpenses());
  const [expenses, setExpenses] = useState(initial.expenses);
  const [storageError, setStorageError] = useState(initial.error);
  const [storageBlocked, setStorageBlocked] = useState(Boolean(initial.error));
  const [status, setStatus] = useState("");
  const [formError, setFormError] = useState("");
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("All");
  const [month, setMonth] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ amount: "", category: "Food", date: localDate(), note: "" });
  useEffect(() => {
    if (storageBlocked) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      setStorageError("");
    } catch {
      setStorageError(
        "Browser storage is unavailable or full. Export a CSV to keep a copy of your records.",
      );
    }
  }, [expenses, storageBlocked]);
  const visible = useMemo(
    () =>
      expenses
        .filter(
          (e) =>
            (filter === "All" || e.category === filter) &&
            (!month || e.date.startsWith(month)) &&
            (!query || `${e.note} ${e.category}`.toLowerCase().includes(query.toLowerCase())),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, filter, month, query],
  );
  const total = visible.reduce((sum, e) => sum + e.cents, 0);
  const grouped = CATEGORIES.map((category) => ({
    category,
    cents: visible.filter((e) => e.category === category).reduce((sum, e) => sum + e.cents, 0),
  })).filter((e) => e.cents > 0);
  const largest = grouped.slice().sort((a, b) => b.cents - a.cents)[0];
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  function submit(event) {
    event.preventDefault();
    if (storageBlocked) return;
    try {
      const cents = toCents(form.amount);
      if (!form.date) throw new Error("Choose a date.");
      const record = {
        id: editing ?? crypto.randomUUID(),
        cents,
        category: form.category,
        date: form.date,
        note: form.note.trim(),
      };
      setExpenses((current) =>
        editing ? current.map((e) => (e.id === editing ? record : e)) : [record, ...current],
      );
      setStatus(editing ? "Expense updated." : "Expense added.");
      setForm({ amount: "", category: "Food", date: localDate(), note: "" });
      setEditing(null);
      setFormError("");
    } catch (error) {
      setFormError(error.message);
    }
  }
  function edit(record) {
    setEditing(record.id);
    setForm({
      amount: (record.cents / 100).toFixed(2),
      category: record.category,
      date: record.date,
      note: record.note,
    });
    setFormError("");
    document.getElementById("amount").focus();
  }
  function remove(record) {
    if (window.confirm(`Delete ${money(record.cents)} ${record.category} expense?`)) {
      setExpenses((current) => current.filter((e) => e.id !== record.id));
      setStatus("Expense deleted.");
      if (editing === record.id) {
        setEditing(null);
        setForm({ amount: "", category: "Food", date: localDate(), note: "" });
      }
    }
  }
  function resetStorage() {
    if (window.confirm("Reset unreadable saved data? Download a raw backup first.")) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("expenses");
        setStorageBlocked(false);
        setStorageError("");
        setExpenses([]);
      } catch {
        setStorageError("Storage cannot be reset in this browser.");
      }
    }
  }
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <nav className="wrap">
          <a className="brand" href="./">
            ledger<span> /</span>
          </a>
          <span className="badge">Private by design · stored locally</span>
        </nav>
      </header>
      <main id="main" className="wrap">
        <section className="hero">
          <span className="eyebrow">Personal finance workspace</span>
          <h1>
            Small expenses.
            <br />A bigger picture.
          </h1>
          <p className="lead">
            Make room for better decisions. Track your spending, understand your habits, and keep
            everything in one place.
          </p>
        </section>
        {storageError && (
          <div className="notice warning" role="alert">
            <p>{storageError}</p>
            {storageBlocked && (
              <div className="actions">
                <button
                  onClick={() => {
                    try {
                      download(
                        localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("expenses") ?? "",
                        "ledger-raw-backup.json",
                        "application/json",
                      );
                    } catch {
                      setStorageError("Browser storage cannot be read.");
                    }
                  }}
                >
                  Download raw backup
                </button>
                <button className="secondary" onClick={resetStorage}>
                  Reset saved data
                </button>
              </div>
            )}
          </div>
        )}
        <div className="grid three stats">
          <article className="card">
            <span className="eyebrow">Filtered spending</span>
            <div className="number" data-testid="total">
              {money(total)}
            </div>
            <small>
              {visible.length} {visible.length === 1 ? "expense" : "expenses"} in view
            </small>
          </article>
          <article className="card">
            <span className="eyebrow">Average expense</span>
            <div className="number">
              {money(visible.length ? Math.round(total / visible.length) : 0)}
            </div>
            <small>Across the selected records</small>
          </article>
          <article className="card">
            <span className="eyebrow">Top category</span>
            <div className="category-name">{largest?.category ?? "No spending yet"}</div>
            <small>
              {largest
                ? `${money(largest.cents)} · ${Math.round((largest.cents / total) * 100)}% of spending`
                : "Add your first expense to begin"}
            </small>
          </article>
        </div>
        <div className="ledger-layout section">
          <section className="card entry">
            <span className="eyebrow">Capture the details</span>
            <h2>{editing ? "Edit expense" : "Add an expense"}</h2>
            <form onSubmit={submit}>
              <fieldset disabled={storageBlocked}>
                <div className="field">
                  <label htmlFor="amount">Amount (USD)</label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0.01"
                    max="99999999.99"
                    step="0.01"
                    value={form.amount}
                    onChange={update}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" value={form.category} onChange={update}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="date">Date</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={update}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="note">
                    Note <span className="muted">(optional)</span>
                  </label>
                  <input
                    id="note"
                    name="note"
                    maxLength={120}
                    value={form.note}
                    onChange={update}
                    placeholder="What was it for?"
                  />
                </div>
                <p className="error" role="alert">
                  {formError}
                </p>
                <button type="submit">{editing ? "Save changes" : "Add expense + "}</button>
                {editing && (
                  <button
                    type="button"
                    className="secondary cancel"
                    onClick={() => {
                      setEditing(null);
                      setForm({ amount: "", category: "Food", date: localDate(), note: "" });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </fieldset>
            </form>
            <p className="muted fine">
              Currency is USD, as in the original tracker. Your records stay in this browser.
            </p>
          </section>
          <div>
            <section className="card records">
              <div className="section-title">
                <h2>Expense history</h2>
                <button
                  className="secondary"
                  disabled={!visible.length}
                  onClick={() => download(csv(visible), "ledger-expenses.csv")}
                >
                  Export CSV ↗
                </button>
              </div>
              <div className="filters">
                <div>
                  <label htmlFor="filter">Category filter</label>
                  <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option>All</option>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="month">Month</label>
                  <input
                    id="month"
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="search">Search notes</label>
                  <input
                    id="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search expenses"
                  />
                </div>
              </div>
              {(filter !== "All" || month || query) && (
                <button
                  className="text-button"
                  onClick={() => {
                    setFilter("All");
                    setMonth("");
                    setQuery("");
                  }}
                >
                  Clear filters
                </button>
              )}
              <p className="sr-only" role="status">
                {status}
              </p>
              {!visible.length ? (
                <div className="empty">
                  <span className="empty-symbol" aria-hidden="true">
                    ＋
                  </span>
                  <h3>{expenses.length ? "No matching expenses" : "A fresh start."}</h3>
                  <p>
                    {expenses.length
                      ? "Adjust your filters to see more records."
                      : "Your first expense is the first step toward understanding your spending."}
                  </p>
                </div>
              ) : (
                <ul className="expense-list">
                  {visible.map((e) => (
                    <li key={e.id}>
                      <div className="expense-icon" aria-hidden="true">
                        {e.category.slice(0, 1)}
                      </div>
                      <div className="expense-info">
                        <strong>{e.note || e.category}</strong>
                        <small>
                          {e.date} · {e.category}
                        </small>
                      </div>
                      <strong>{money(e.cents)}</strong>
                      <div className="row-actions">
                        <button
                          className="text-button"
                          aria-label={`Edit ${e.note || e.category}`}
                          onClick={() => edit(e)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-button danger"
                          aria-label={`Delete ${e.note || e.category}`}
                          onClick={() => remove(e)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="card breakdown">
              <span className="eyebrow">Where it goes</span>
              <h2>Spending by category</h2>
              {grouped.length ? (
                <ul className="category-bars">
                  {grouped.map((e) => (
                    <li key={e.category}>
                      <div>
                        <strong>{e.category}</strong>
                        <span>
                          {money(e.cents)} · {Math.round((e.cents / total) * 100)}%
                        </span>
                      </div>
                      <div className="bar">
                        <span style={{ width: `${(e.cents / total) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Your category breakdown will appear once you add expenses.</p>
              )}
            </section>
          </div>
        </div>
      </main>
      <footer>
        <div className="wrap">
          <span>Ledger / Built by Shafeeq</span>
          <span>No account required. No data sent to a server.</span>
        </div>
      </footer>
    </>
  );
}
