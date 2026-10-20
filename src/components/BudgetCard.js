// src/components/BudgetCard.js
// The teal "pocket money" card: monthly budget, what's left, and a daily allowance
import React, { useEffect, useState } from "react";
import { formatMoney, formatMoneyWhole } from "../utils";
import { EditIcon, Flower } from "./Icons";

function BudgetCard({ budget, thisMonth, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(budget ? String(budget) : "");
  }, [budget]);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1;

  const left = budget ? budget - thisMonth : 0;
  const used = budget ? (thisMonth / budget) * 100 : 0;
  const tone = used > 100 ? "danger" : used >= 80 ? "warn" : "good";

  const submit = (e) => {
    e.preventDefault();
    const value = draft.trim() === "" ? null : Number(draft);
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      setError("Enter an amount of 0 or more");
      return;
    }
    setError("");
    onSave(value);
    setEditing(false);
  };

  return (
    <div className="budget-card">
      <Flower className="card-flower one" />
      <Flower className="card-flower two" />

      <div className="budget-head">
        <span className={budget ? "toggle on" : "toggle"} aria-hidden="true" />
        <button
          type="button"
          className="budget-edit"
          onClick={() => setEditing((v) => !v)}
          aria-label="Edit monthly pocket money"
        >
          <EditIcon size={16} />
        </button>
      </div>

      <span className="budget-label">Pocket money left</span>
      <strong className="budget-amount">
        {budget ? (left >= 0 ? formatMoney(left) : `−${formatMoney(-left)}`) : "Not set"}
      </strong>

      {budget ? (
        <>
          <div className="budget-progress" aria-label={`${used.toFixed(0)}% of budget used`}>
            <div className={`budget-progress-bar tone-${tone}`} style={{ width: `${Math.min(used, 100)}%` }} />
          </div>
          <div className="budget-foot">
            <div>
              <small>Monthly budget</small>
              <span>{formatMoneyWhole(budget)}</span>
            </div>
            <div>
              <small>Per day</small>
              <span>{left > 0 ? formatMoneyWhole(left / daysLeft) : "₹0"}</span>
            </div>
            <div>
              <small>Days left</small>
              <span>{daysLeft}</span>
            </div>
          </div>
        </>
      ) : (
        <p className="budget-hint">Set how much pocket money you get each month to see your daily allowance.</p>
      )}

      {(editing || !budget) && (
        <form className="budget-form" onSubmit={submit}>
          <input
            type="number"
            min="0"
            step="1"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. 5000"
            aria-label="Monthly pocket money"
          />
          <button type="submit" className="btn btn-light">
            Save
          </button>
        </form>
      )}
      {error && <span className="budget-error">{error}</span>}
    </div>
  );
}

export default BudgetCard;
