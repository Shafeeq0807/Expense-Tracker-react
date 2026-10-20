// src/components/ExpenseTable.js
import React, { useMemo, useState } from "react";
import { CATEGORIES, categoryColor, categoryIcon, formatMoney, fullDate, monthLabel } from "../utils";
import { DownloadIcon, EditIcon, TrashIcon } from "./Icons";

const toCsv = (rows) => {
  const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const header = ["Date", "Category", "Note", "Amount (INR)"];
  const lines = rows.map((r) => [r.date, r.category, r.note, r.amount.toFixed(2)].map(escape).join(","));
  return [header.join(","), ...lines].join("\n");
};

// search and category are owned by the dashboard so the top bar and sidebar can set them
function ExpenseTable({ expenses, search, onSearch, category, onCategory, onEdit, onDelete }) {
  const [month, setMonth] = useState("All");

  // Months that actually have expenses, newest first
  const months = useMemo(
    () => [...new Set(expenses.map((e) => e.date.slice(0, 7)))].sort().reverse(),
    [expenses]
  );

  // Categories to offer in the filter: the current list plus any older ones still in the data
  const categoryOptions = useMemo(
    () => [...new Set([...CATEGORIES, ...expenses.map((e) => e.category)])],
    [expenses]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses.filter(
      (e) =>
        (category === "All" || e.category === category) &&
        (month === "All" || e.date.startsWith(month)) &&
        (!q || e.note.toLowerCase().includes(q) || e.category.toLowerCase().includes(q))
    );
  }, [expenses, search, category, month]);

  const filteredTotal = filtered.reduce((sum, e) => sum + e.amount, 0);

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const hasFilters = search || category !== "All" || month !== "All";

  return (
    <div className="expense-table">
      <div className="table-tools">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search notes or categories"
          aria-label="Search in table"
        />
        <select value={category} onChange={(e) => onCategory(e.target.value)} aria-label="Filter by category">
          <option value="All">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Filter by month">
          <option value="All">All months</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-ghost" onClick={exportCsv} disabled={!filtered.length}>
          <DownloadIcon size={16} />
          CSV
        </button>
      </div>

      <div className="table-summary">
        <span>
          {filtered.length} {filtered.length === 1 ? "expense" : "expenses"}
          {hasFilters && (
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                onSearch("");
                onCategory("All");
                setMonth("All");
              }}
            >
              Clear filters
            </button>
          )}
        </span>
        <strong>{formatMoney(filteredTotal)}</strong>
      </div>

      {expenses.length === 0 ? (
        <p className="empty">No expenses yet. Tap “Add expense” to log your first one.</p>
      ) : filtered.length === 0 ? (
        <p className="empty">No expenses match these filters.</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Expense</th>
                <th>Category</th>
                <th>Date</th>
                <th className="num">Amount</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div className="cell-expense">
                      <span className="recent-avatar small" style={{ "--chip": categoryColor(e.category) }}>
                        {categoryIcon(e.category)}
                      </span>
                      <span className="note">{e.note || "—"}</span>
                    </div>
                  </td>
                  <td>
                    <span className="chip" style={{ "--chip": categoryColor(e.category) }}>
                      {e.category}
                    </span>
                  </td>
                  <td className="nowrap muted">{fullDate(e.date)}</td>
                  <td className="num nowrap amount">{formatMoney(e.amount)}</td>
                  <td className="row-actions">
                    <button type="button" className="icon-btn small" onClick={() => onEdit(e)} aria-label="Edit">
                      <EditIcon size={15} />
                    </button>
                    <button type="button" className="icon-btn small danger" onClick={() => onDelete(e)} aria-label="Delete">
                      <TrashIcon size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ExpenseTable;
