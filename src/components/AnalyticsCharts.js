// src/components/AnalyticsCharts.js
import React, { useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { chartColors } from "../chartTheme";
import { formatMoney, formatMoneyCompact, monthShort, dayLabel, categoryColor } from "../utils";

const VIEWS = [
  { id: "monthly", label: "Monthly" },
  { id: "daily", label: "Last 30 days" },
];

function AnalyticsCharts({ analytics, theme }) {
  const [view, setView] = useState("monthly");
  const { months, daily } = analytics;
  const colors = chartColors(theme);
  const hasData = analytics.summary.windowCount > 0;

  const scales = {
    x: { grid: { display: false }, ticks: { color: colors.text } },
    y: {
      grid: { color: colors.grid },
      border: { display: false },
      ticks: { color: colors.text, callback: (v) => formatMoneyCompact(v) },
      beginAtZero: true,
    },
  };
  const plugins = {
    legend: { display: false },
    tooltip: { displayColors: false, callbacks: { label: (ctx) => formatMoney(ctx.parsed.y) } },
  };

  const chart =
    view === "monthly" ? (
      <Bar
        data={{
          labels: months.map((m) => monthShort(m.month)),
          datasets: [
            {
              data: months.map((m) => m.total),
              backgroundColor: months.map((_, i) => (i === months.length - 1 ? colors.teal : colors.faint)),
              hoverBackgroundColor: colors.teal,
              borderRadius: 10,
              maxBarThickness: 46,
            },
          ],
        }}
        options={{ responsive: true, maintainAspectRatio: false, scales, plugins }}
      />
    ) : (
      <Line
        data={{
          labels: daily.map((d) => dayLabel(d.date)),
          datasets: [
            {
              data: daily.map((d) => d.total),
              borderColor: colors.peach,
              backgroundColor: "transparent",
              tension: 0.35,
              pointRadius: 0,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: colors.peach,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          scales: { ...scales, x: { ...scales.x, ticks: { color: colors.text, maxTicksLimit: 8 } } },
          plugins,
        }}
      />
    );

  return (
    <div className="charts">
      <div className="segmented" role="tablist">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={view === v.id}
            className={view === v.id ? "segment active" : "segment"}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="chart-box">
        {hasData ? chart : <p className="empty">Your charts will appear once you add expenses.</p>}
      </div>
    </div>
  );
}

export function CategoryDoughnut({ categories, theme }) {
  const colors = chartColors(theme);
  const total = categories.reduce((sum, c) => sum + c.total, 0);

  if (categories.length === 0) {
    return <p className="empty">No categories yet.</p>;
  }

  return (
    <div className="category-split">
      <div className="doughnut-box">
        <Doughnut
          data={{
            labels: categories.map((c) => c.category),
            datasets: [
              {
                data: categories.map((c) => c.total),
                backgroundColor: categories.map((c) => categoryColor(c.category)),
                borderColor: colors.surface,
                borderWidth: 3,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${formatMoney(ctx.parsed)}` } },
            },
          }}
        />
        <div className="doughnut-center">
          <small>Total</small>
          <strong>{formatMoneyCompact(total)}</strong>
        </div>
      </div>

      <ul className="category-bars">
        {categories.map((c) => {
          const share = total > 0 ? (c.total / total) * 100 : 0;
          return (
            <li key={c.category}>
              <div className="category-bar-head">
                <span>
                  <span className="dot" style={{ background: categoryColor(c.category) }} />
                  {c.category}
                </span>
                <span>
                  {formatMoney(c.total)} <small>{share.toFixed(0)}%</small>
                </span>
              </div>
              <div className="category-bar-track">
                <div style={{ width: `${share}%`, background: categoryColor(c.category) }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default AnalyticsCharts;
