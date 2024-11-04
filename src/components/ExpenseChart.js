// src/components/ExpenseChart.js
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function ExpenseChart({ expenses }) {
  const expenseCategories = expenses.reduce((acc, { amount, category }) => {
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        data: Object.values(expenseCategories),
        backgroundColor: [
          "#ff9999",
          "#66b3ff",
          "#99ff99",
          "#ffcc99",
          "#a569bd",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // This allows you to control the size independently
    plugins: {
      legend: {
        position: 'top',
      },
    },
    aspectRatio: 1, // Set aspect ratio if needed (1:1 for a square)
  };

  return (
    <div style={{ width: '300px', height: '300px' }}>
      <h2>Expense Breakdown</h2>
      <Pie data={data} options={options} />
    </div>
  );
}

export default ExpenseChart;
