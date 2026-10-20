// src/components/StatCards.js
// The thin summary strip at the top of the overview
import React from "react";
import { formatMoney, formatMoneyWhole, formatMoneyCompact, monthShort } from "../utils";

function StatCards({ summary, months }) {
  const { thisMonth, lastMonth, changePct, projectedThisMonth, averageMonthly, windowMonths, windowTotal } = summary;
  const maxMonth = Math.max(...months.map((m) => m.total), 1);

  return (
    <div className="summary-strip">
      <div className="summary-item">
        <span className="summary-label">Spent this month</span>
        <strong className="summary-value">{formatMoney(thisMonth)}</strong>
        {changePct === null ? (
          <span className="summary-sub">Nothing last month to compare</span>
        ) : (
          <span className={changePct > 0 ? "summary-sub trend-up" : "summary-sub trend-down"}>
            {changePct > 0 ? "▲" : "▼"} {Math.abs(changePct).toFixed(0)}% vs last month
          </span>
        )}
      </div>

      <div className="summary-item">
        <span className="summary-label">Last month</span>
        <strong className="summary-value">{formatMoney(lastMonth)}</strong>
        <span className="summary-sub">{monthShort(months[months.length - 2].month)} total</span>
      </div>

      <div className="summary-item">
        <span className="summary-label">Projected month end</span>
        <strong className="summary-value">{formatMoneyWhole(projectedThisMonth)}</strong>
        <span className="summary-sub">At your daily pace</span>
      </div>

      <div className="summary-item summary-bars">
        <div>
          <span className="summary-label">Average per month</span>
          <strong className="summary-value">
            {formatMoneyCompact(averageMonthly)}
            <span className="tag">{formatMoneyCompact(windowTotal)} in {windowMonths}m</span>
          </strong>
          <span className="summary-sub">Last {windowMonths} months</span>
        </div>
        <div className="mini-bars" aria-hidden="true">
          {months.map((m, i) => (
            <span
              key={m.month}
              className={i === months.length - 1 ? "mini-bar current" : "mini-bar"}
              style={{ height: `${Math.max((m.total / maxMonth) * 100, 8)}%` }}
              title={`${monthShort(m.month)}: ${formatMoney(m.total)}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatCards;
