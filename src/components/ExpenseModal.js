// src/components/ExpenseModal.js
import React, { useEffect } from "react";
import ExpenseForm from "./ExpenseForm";
import { CloseIcon } from "./Icons";

function ExpenseModal({ editing, onSave, onClose }) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="expense-modal-title">
        <div className="modal-head">
          <h2 id="expense-modal-title">{editing ? "Edit expense" : "Add an expense"}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <ExpenseForm editing={editing} onSave={onSave} onCancel={onClose} />
      </div>
    </div>
  );
}

export default ExpenseModal;
