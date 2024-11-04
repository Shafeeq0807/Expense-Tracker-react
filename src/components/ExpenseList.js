// src/components/ExpenseList.js
import React from "react";

function ExpenseList({ expenses }) {
  return (
    <div>
      <h2>Expense List</h2>
      {expenses.length === 0 ? (
        <p>No expenses added yet!</p>
      ) : (
        <ul>
          {expenses.map((expense, index) => (
            <li key={index}>
              {expense.category}: ${expense.amount.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ExpenseList;
