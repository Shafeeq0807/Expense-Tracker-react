// src/utils.js
// Keep this list in sync with server/routes/expenses.js
export const CATEGORIES = [
  "Food",
  "Transport",
  "Books & Stationery",
  "Rent & Hostel",
  "Recharge & Internet",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Health",
  "Fees",
  "Others",
];

export const CATEGORY_COLORS = {
  Food: "#e8956b",
  Transport: "#5f9e92",
  "Books & Stationery": "#8b7fd1",
  "Rent & Hostel": "#d1a94a",
  "Recharge & Internet": "#4d8fc7",
  Utilities: "#9cb04a",
  Entertainment: "#d9708f",
  Shopping: "#c48ad6",
  Health: "#4fb39a",
  Fees: "#7a8a9e",
  Others: "#a8a29e",
};

export const CATEGORY_ICONS = {
  Food: "🍔",
  Transport: "🚌",
  "Books & Stationery": "📚",
  "Rent & Hostel": "🏠",
  "Recharge & Internet": "📱",
  Utilities: "💡",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Health: "💊",
  Fees: "🎓",
  Others: "📦",
};

export const categoryColor = (c) => CATEGORY_COLORS[c] || CATEGORY_COLORS.Others;
export const categoryIcon = (c) => CATEGORY_ICONS[c] || CATEGORY_ICONS.Others;

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });
const moneyWhole = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const moneyCompact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export const formatMoney = (value) => money.format(Number(value) || 0);
export const formatMoneyWhole = (value) => moneyWhole.format(Number(value) || 0);
// ₹1.2K, ₹2.5L, ₹1.3Cr
export const formatMoneyCompact = (value) => moneyCompact.format(Number(value) || 0);

const pad = (n) => String(n).padStart(2, "0");

// Today's date in local time as "YYYY-MM-DD" (for <input type="date">)
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const parseKey = (key) => {
  const [year, month, day = 1] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// "2026-10" -> "Oct 2026"
export const monthLabel = (key) =>
  parseKey(key).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

// "2026-10" -> "Oct"
export const monthShort = (key) => parseKey(key).toLocaleDateString("en-IN", { month: "short" });

// "2026-10-05" -> "5 Oct"
export const dayLabel = (key) => parseKey(key).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

// "2026-10-05" -> "5 Oct 2026"
export const fullDate = (key) =>
  parseKey(key).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// "Today", "Yesterday", "3 days ago", or a date
export const relativeDay = (key) => {
  const days = Math.round((parseKey(todayISO()) - parseKey(key)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) return `${days} days ago`;
  return fullDate(key);
};

// Monthly totals per category for the given month keys: { Food: [120, 0, 340], ... }
export const categoryMonthlySeries = (expenses, monthKeys) => {
  const index = Object.fromEntries(monthKeys.map((m, i) => [m, i]));
  const series = {};
  for (const e of expenses) {
    const i = index[e.date.slice(0, 7)];
    if (i === undefined) continue;
    if (!series[e.category]) series[e.category] = monthKeys.map(() => 0);
    series[e.category][i] += e.amount;
  }
  return series;
};

export const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
