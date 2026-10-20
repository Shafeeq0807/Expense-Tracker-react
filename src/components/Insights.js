// src/components/Insights.js
import React from "react";
import { formatMoney, formatMoneyWhole, fullDate, todayISO } from "../utils";

const TONE_ICONS = { good: "✅", warn: "⚠️", danger: "🚨", info: "💡", tip: "🎯" };

// Rule-based analysis of the summary data. Each rule adds at most one insight.
export function buildInsights({ summary, budget, expenses = [] }) {
  const { thisMonth, lastMonth, changePct, projectedThisMonth, averageMonthly, windowMonths, windowTotal, topCategory } =
    summary;

  if (summary.windowCount === 0) {
    return [{ tone: "info", text: "Add your first expense to unlock insights about your spending." }];
  }

  const items = [];
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1;

  if (budget) {
    const used = (thisMonth / budget) * 100;
    const left = budget - thisMonth;
    if (used > 100) {
      items.push({
        tone: "danger",
        text: `You've gone over your pocket money by ${formatMoney(-left)} this month. Time for mess food and fewer outings!`,
      });
    } else {
      items.push({
        tone: used >= 80 ? "warn" : "good",
        text: `You can spend about ${formatMoneyWhole(left / daysLeft)} a day for the next ${daysLeft} days and still stay within your pocket money.`,
      });
    }
    if (used <= 100 && projectedThisMonth > budget) {
      items.push({
        tone: "warn",
        text: `At this pace you'll spend ${formatMoneyWhole(projectedThisMonth)} this month, which is ${formatMoneyWhole(
          projectedThisMonth - budget
        )} more than your budget.`,
      });
    }
  } else {
    items.push({ tone: "tip", text: "Set your monthly pocket money to see how much you can spend each day." });
  }

  if (changePct !== null) {
    const up = changePct > 0;
    items.push({
      tone: up ? "warn" : "good",
      text: `Spending this month is ${up ? "up" : "down"} ${Math.abs(changePct).toFixed(0)}% on last month (${formatMoney(
        thisMonth
      )} vs ${formatMoney(lastMonth)}).`,
    });
  } else if (thisMonth > 0 && !budget) {
    items.push({
      tone: "info",
      text: `At your current pace you'll spend about ${formatMoneyWhole(projectedThisMonth)} by the end of this month.`,
    });
  }

  if (topCategory) {
    const share = (topCategory.total / windowTotal) * 100;
    items.push({
      tone: "info",
      text: `${topCategory.category} is your biggest expense: ${share.toFixed(0)}% of spending over the last ${windowMonths} months.`,
    });

    const cuttable = ["Food", "Entertainment", "Shopping", "Recharge & Internet"].includes(topCategory.category);
    if (cuttable && share >= 35) {
      const perMonth = topCategory.total / windowMonths;
      items.push({
        tone: "tip",
        text: `Cutting ${topCategory.category} by just 10% would save you about ${formatMoney(perMonth * 0.1)} a month.`,
      });
    }
  }

  const monthKey = todayISO().slice(0, 7);
  const biggest = expenses
    .filter((e) => e.date.startsWith(monthKey))
    .reduce((max, e) => (!max || e.amount > max.amount ? e : max), null);
  if (biggest) {
    items.push({
      tone: "info",
      text: `Biggest spend this month: ${formatMoney(biggest.amount)} on ${biggest.note || biggest.category} (${fullDate(
        biggest.date
      )}).`,
    });
  }

  items.push({
    tone: "info",
    text: `You average ${formatMoneyWhole(averageMonthly)} a month across the last ${windowMonths} months.`,
  });

  return items;
}

function Insights({ analytics, budget, expenses }) {
  const items = buildInsights({ summary: analytics.summary, budget, expenses });

  return (
    <ul className="insights">
      {items.map((item, i) => (
        <li key={i} className={`insight tone-${item.tone}`}>
          <span className="insight-icon" aria-hidden="true">
            {TONE_ICONS[item.tone]}
          </span>
          {item.text}
        </li>
      ))}
    </ul>
  );
}

export default Insights;
