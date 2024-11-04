// src/components/ExpenseForm.js
import React, { useState } from "react";

function ExpenseForm({ addExpense }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    addExpense({ amount: parseFloat(amount), category });
    setAmount("");
    setCategory("Food");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        required
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Utilities">Utilities</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Others">Others</option>
      </select>
      <button type="submit">Add Expense</button>
    </form>
  );
}

export default ExpenseForm;
