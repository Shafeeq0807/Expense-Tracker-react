// src/components/Overview.js
import React, { useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import StatCards from "./StatCards";
import BudgetCard from "./BudgetCard";
import { ArrowUpRightIcon, EditIcon, TrashIcon, PlusIcon } from "./Icons";
import { chartColors } from "../chartTheme";
import {
  categoryIcon,
  categoryColor,
  categoryMonthlySeries,
  dayLabel,
  formatMoney,
  formatMoneyCompact,
  monthLabel,
  monthShort,
  relativeDay,
  todayISO,
} from "../utils";

const CARD_STYLES = ["mint", "butter", "peach"];

const moneyTooltip = {
  displayColors: false,
  callbacks: { label: (ctx) => formatMoney(ctx.parsed.y) },
};

const hiddenAxes = {
  x: { display: false },
  y: { display: false, beginAtZero: true, grace: "15%" },
};

function MiniChart({ style, labels, data, colors }) {
  const common = {
    responsive: true,
    maintainAspectRatio: false,
    scales: hiddenAxes,
    plugins: { legend: { display: false }, tooltip: moneyTooltip },
    interaction: { mode: "index", intersect: false },
  };

  if (style === "peach") {
    return (
      <Bar
        data={{ labels, datasets: [{ data, backgroundColor: colors.peach, borderRadius: 3, barPercentage: 0.6 }] }}
        options={common}
      />
    );
  }

  const area = style === "mint";
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            data,
            borderColor: area ? colors.teal : colors.butter,
            backgroundColor: area ? colors.teal : "transparent",
            fill: area,
            tension: 0.45,
            borderWidth: area ? 0 : 2,
            pointRadius: area ? 0 : 4,
            pointBackgroundColor: colors.butter,
          },
        ],
      }}
      options={{ ...common, layout: { padding: area ? 0 : 8 } }}
    />
  );
}

function QuickCards({ analytics, expenses, theme, onOpenCategory, onAdd }) {
  const colors = chartColors(theme);
  const labels = analytics.months.map((m) => monthShort(m.month));
  const series = useMemo(
    () => categoryMonthlySeries(expenses, analytics.months.map((m) => m.month)),
    [expenses, analytics.months]
  );
  const top = analytics.categories.slice(0, 3);

  return (
    <div className="quick-cards">
      {top.map((c, i) => (
        <div key={c.category} className={`quick-card ${CARD_STYLES[i]}`}>
          <div className="quick-head">
            <div>
              <strong>{formatMoneyCompact(c.total)}</strong>
              <span>
                {categoryIcon(c.category)} {c.category}
              </span>
            </div>
            <button
              type="button"
              className="quick-open"
              onClick={() => onOpenCategory(c.category)}
              aria-label={`See ${c.category} expenses`}
            >
              <ArrowUpRightIcon size={14} />
            </button>
          </div>
          <div className="quick-chart">
            <MiniChart style={CARD_STYLES[i]} labels={labels} data={series[c.category] || []} colors={colors} />
          </div>
        </div>
      ))}
      {top.length < 3 && (
        <button type="button" className="quick-card quick-empty" onClick={onAdd}>
          <PlusIcon size={22} />
          <span>{top.length === 0 ? "Add your first expense" : "Spend in more categories to fill these cards"}</span>
        </button>
      )}
    </div>
  );
}

function RecentList({ expenses, onEdit, onDelete, onSeeAll }) {
  const recent = expenses.slice(0, 4);

  return (
    <section className="panel recent">
      <div className="panel-head">
        <h2>Recently added</h2>
        <button type="button" className="link-btn" onClick={onSeeAll}>
          View all
        </button>
      </div>
      {recent.length === 0 ? (
        <p className="empty">Nothing here yet. Your latest expenses will show up here.</p>
      ) : (
        <ul className="recent-list">
          {recent.map((e) => (
            <li key={e.id} className="recent-item">
              <span className="recent-avatar" style={{ "--chip": categoryColor(e.category) }}>
                {categoryIcon(e.category)}
              </span>
              <div className="recent-text">
                <strong>{e.note || e.category}</strong>
                <small>
                  {relativeDay(e.date)} · {e.category}
                </small>
              </div>
              <span className="recent-amount">{formatMoney(e.amount)}</span>
              <div className="recent-actions">
                <button type="button" onClick={() => onDelete(e)} aria-label="Delete expense">
                  <TrashIcon size={16} />
                </button>
                <button type="button" onClick={() => onEdit(e)} aria-label="Edit expense">
                  <EditIcon size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActivityChart({ daily, theme }) {
  const colors = chartColors(theme);
  const total = daily.reduce((sum, d) => sum + d.total, 0);

  return (
    <section className="panel activity">
      <div className="panel-head">
        <h2>Last 30 days activity</h2>
        <span className="muted">{monthLabel(todayISO().slice(0, 7))}</span>
      </div>
      <strong className="activity-total">{formatMoney(total)}</strong>
      <div className="activity-chart">
        <Line
          data={{
            labels: daily.map((d) => dayLabel(d.date)),
            datasets: [
              {
                data: daily.map((d) => d.total),
                borderColor: colors.teal,
                backgroundColor: colors.tealFill,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: colors.teal,
                pointHoverBorderColor: colors.surface,
                pointHoverBorderWidth: 3,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            scales: {
              x: { grid: { color: colors.grid }, ticks: { color: colors.text, maxTicksLimit: 7, font: { size: 10 } } },
              y: { display: false, beginAtZero: true, grace: "10%" },
            },
            plugins: { legend: { display: false }, tooltip: moneyTooltip },
          }}
        />
      </div>
    </section>
  );
}

function Overview({ analytics, expenses, budget, theme, onBudgetSave, onEdit, onDelete, onAdd, onNavigate, onOpenCategory }) {
  return (
    <div className="overview">
      <StatCards summary={analytics.summary} months={analytics.months} />

      <div className="overview-row">
        <section className="overview-quick">
          <h2>Quick overview</h2>
          <QuickCards
            analytics={analytics}
            expenses={expenses}
            theme={theme}
            onOpenCategory={onOpenCategory}
            onAdd={onAdd}
          />
        </section>
        <section className="overview-budget">
          <h2>My pocket money</h2>
          <BudgetCard budget={budget} thisMonth={analytics.summary.thisMonth} onSave={onBudgetSave} />
        </section>
      </div>

      <div className="overview-row bottom">
        <RecentList
          expenses={expenses}
          onEdit={onEdit}
          onDelete={onDelete}
          onSeeAll={() => onNavigate("transactions")}
        />
        <ActivityChart daily={analytics.daily} theme={theme} />
      </div>
    </div>
  );
}

export default Overview;
