import { describe, it, expect } from "vitest";
import { toCents, loadExpenses, STORAGE_KEY, csv } from "./ledger.js";
describe("ledger integrity", () => {
  it("uses integer cents and rejects invalid precision", () => {
    expect(toCents("0.29")).toBe(29);
    for (const value of ["0", "-1", "1.001", "Infinity", "NaN"])
      expect(() => toCents(value)).toThrow();
  });
  it("loads old expenses without losing the original key", () => {
    localStorage.clear();
    localStorage.setItem("expenses", JSON.stringify([{ amount: 12.5, category: "Food" }]));
    expect(loadExpenses(localStorage).expenses[0].cents).toBe(1250);
    expect(localStorage.getItem("expenses")).not.toBeNull();
  });
  it("preserves malformed data for recovery", () => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, "broken");
    expect(loadExpenses(localStorage).error).not.toBe("");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("broken");
  });
  it("neutralizes formula injection and quotes CSV fields", () => {
    expect(
      csv([{ date: "2026-10-04", category: "Food", cents: 100, note: ' =HYPERLINK("x")' }]),
    ).toContain(`"' =HYPERLINK(""x"")"`);
  });
});
