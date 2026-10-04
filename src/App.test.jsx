import { beforeEach, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App.jsx";
import { STORAGE_KEY } from "./ledger.js";
beforeEach(() => localStorage.clear());
it("restores persisted data before writing and supports adding expenses", () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      { id: "saved", cents: 1250, category: "Food", date: "2026-10-04", note: "Lunch" },
    ]),
  );
  render(<App />);
  expect(screen.getByTestId("total")).toHaveTextContent("$12.50");
  fireEvent.change(screen.getByLabelText("Amount (USD)"), { target: { value: "0.29" } });
  fireEvent.click(screen.getByRole("button", { name: /Add expense/ }));
  expect(screen.getByTestId("total")).toHaveTextContent("$12.79");
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(2);
});
it("does not overwrite corrupt storage during render", () => {
  localStorage.setItem(STORAGE_KEY, "broken");
  render(<App />);
  expect(screen.getByRole("button", { name: /Add expense/ })).toBeDisabled();
  expect(localStorage.getItem(STORAGE_KEY)).toBe("broken");
});
