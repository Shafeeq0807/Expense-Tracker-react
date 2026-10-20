// src/components/ExpenseForm.js
import React, { useState, useEffect } from "react";
import { CATEGORIES, categoryIcon, todayISO } from "../utils";

const emptyForm = () => ({ amount: "", category: "Food", date: todayISO(), note: "" });

function ExpenseForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Fill the form when editing an expense, clear it otherwise
  useEffect(() => {
    setError("");
    setForm(
      editing
        ? {
            amount: String(editing.amount),
            category: editing.category,
            date: editing.date,
            note: editing.note || "",
          }
        : emptyForm()
    );
  }, [editing]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // Older expenses may use a category that's no longer in the list
  const options = CATEGORIES.includes(form.category) ? CATEGORIES : [...CATEGORIES, form.category];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.amount || !Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than ₹0");
      return;
    }
    if (!form.date) {
      setError("Choose a date");
      return;
    }

    setError("");
    setBusy(true);
    const saved = await onSave({ amount, category: form.category, date: form.date, note: form.note.trim() });
    setBusy(false);
    if (saved && !editing) setForm(emptyForm());
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <label className="amount-field">
        Amount
        <div className="rupee-input">
          <span>₹</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={update("amount")}
            placeholder="0"
            required
            autoFocus
          />
        </div>
      </label>

      <div className="form-grid">
        <label>
          Category
          <select value={form.category} onChange={update("category")}>
            {options.map((c) => (
              <option key={c} value={c}>
                {categoryIcon(c)} {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={form.date} onChange={update("date")} required />
        </label>
        <label className="span-2">
          Note <span className="optional">(optional)</span>
          <input
            type="text"
            maxLength={255}
            value={form.note}
            onChange={update("note")}
            placeholder="e.g. Canteen lunch, bus pass, xerox"
          />
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : editing ? "Save changes" : "Add expense"}
        </button>
      </div>
    </form>
  );
}

export default ExpenseForm;
