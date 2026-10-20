// src/api.js
// In development, CRA proxies /api to the Express server (see "proxy" in package.json).
// Set REACT_APP_API_URL to point at a deployed API instead.
const BASE_URL = process.env.REACT_APP_API_URL || "";
const TOKEN_KEY = "expense_tracker_token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage blocked (private mode): the user just has to log in again next visit
  }
};

export async function api(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Is the API running?");
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    // No JSON body on a 5xx means the dev proxy couldn't reach the API (it isn't running)
    const apiDown = !data && res.status >= 500;
    const err = new Error(
      (data && data.error) || (apiDown ? "Can't reach the server. Is the API running?" : "Something went wrong")
    );
    err.status = res.status;
    throw err;
  }
  return data;
}
