export const CATEGORIES = ["Food", "Transport", "Utilities", "Entertainment", "Others"];
export const STORAGE_KEY = "ledger.expenses.v1";
export function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function validDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}
export function toCents(value) {
  const text = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text))
    throw new Error("Enter an amount with at most two decimal places.");
  const cents = Math.round(Number(text) * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 9999999999)
    throw new Error("Amount must be between $0.01 and $99,999,999.99.");
  return cents;
}
export function validateExpense(expense) {
  if (
    !expense ||
    typeof expense !== "object" ||
    typeof expense.id !== "string" ||
    !expense.id ||
    !Number.isSafeInteger(expense.cents) ||
    expense.cents <= 0 ||
    expense.cents > 9999999999 ||
    !CATEGORIES.includes(expense.category) ||
    !validDate(expense.date) ||
    typeof expense.note !== "string" ||
    expense.note.length > 120
  )
    throw new Error("Saved records contain invalid expense data.");
  return {
    id: expense.id,
    cents: expense.cents,
    category: expense.category,
    date: expense.date,
    note: expense.note,
  };
}
export function loadExpenses(storage) {
  try {
    storage ??= window.localStorage;
    const current = storage.getItem(STORAGE_KEY);
    if (current !== null) {
      const parsed = JSON.parse(current);
      if (!Array.isArray(parsed)) throw new Error("Invalid saved data");
      const expenses = parsed.map(validateExpense);
      if (new Set(expenses.map((e) => e.id)).size !== expenses.length)
        throw new Error("Duplicate record IDs");
      return { expenses, error: "" };
    }
    const legacy = storage.getItem("expenses");
    if (legacy === null) return { expenses: [], error: "" };
    const parsed = JSON.parse(legacy);
    if (!Array.isArray(parsed)) throw new Error("Invalid saved data");
    const expenses = parsed.map((record, index) =>
      validateExpense({
        id: `legacy-${index}`,
        cents: toCents(record.amount),
        category: record.category,
        date: localDate(),
        note: "Migrated from the original tracker",
      }),
    );
    return { expenses, error: "" };
  } catch {
    return {
      expenses: [],
      error:
        "Saved data could not be loaded. It has been preserved. Export your raw backup before resetting storage.",
    };
  }
}
export const money = (cents) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
export function csv(expenses) {
  // Neutralize spreadsheet formulas, including leading whitespace before a formula.
  const cell = (value) =>
    `"${String(/^[\s]*[=+@-]/.test(String(value)) ? "'" + value : value).replaceAll('"', '""')}"`;
  return [
    "Date,Category,Amount (USD),Note",
    ...expenses.map((e) =>
      [e.date, e.category, (e.cents / 100).toFixed(2), e.note].map(cell).join(","),
    ),
  ].join("\r\n");
}
