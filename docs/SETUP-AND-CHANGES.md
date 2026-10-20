# Expense Tracker: Setup, Database Connection and Changes

This guide covers three things:

1. What changed in the code, file by file.
2. How to connect the app to MySQL.
3. How to run the project day to day.

All commands are for Windows PowerShell and assume you are in the project folder:

```powershell
cd "C:\Users\SHAFEEQ PC\Desktop\expense-tracker\expense-tracker-app"
```

---

## Part 1: What changed

### Architecture

Before, everything ran in the browser and expenses were saved in `localStorage`.

Now there are two parts:

```
Browser (React, port 3000)  --/api requests-->  Express API (port 5000)  --SQL-->  MySQL (port 3306)
```

A browser can't connect to MySQL directly, so the Express API sits in the middle. It checks the login token, runs the SQL, and returns JSON.

### New files

| File | Purpose |
|---|---|
| `server/index.js` | Starts the Express server, sets up CORS and JSON parsing, mounts the routes, and adds a `/api/health` check. Refuses to start if `JWT_SECRET` is missing. |
| `server/db.js` | Creates the MySQL connection pool from the values in `server/.env`. |
| `server/schema.sql` | Creates the `expense_tracker` database, the `users` table and the `expenses` table. |
| `server/create-db-user.sql` | Creates a limited MySQL user for the app with only the permissions it needs. |
| `server/middleware/auth.js` | Reads the `Authorization: Bearer <token>` header and rejects requests without a valid token. |
| `server/routes/auth.js` | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/budget`. Hashes passwords with bcrypt. |
| `server/routes/expenses.js` | Expense CRUD (`GET`, `POST`, `PUT`, `DELETE`) and `GET /api/expenses/analytics`. |
| `server/.env.example` | Template for the settings file. You copy it to `server/.env`. |
| `server/package.json` | Server dependencies and the `start` and `dev` scripts. |
| `src/api.js` | Calls the API and attaches the saved login token to each request. |
| `src/utils.js` | Categories, colours, money and date formatting helpers. |
| `src/components/AuthPage.js` | Login and sign-up screen. |
| `src/components/Dashboard.js` | Main page: loads data and holds the add, edit, delete and budget actions. |
| `src/components/StatCards.js` | Summary cards and the budget input. |
| `src/components/Insights.js` | Rule-based text insights built from your spending data. |
| `src/components/AnalyticsCharts.js` | Monthly, 30-day and category charts (Chart.js). |
| `src/components/ExpenseForm.js` | Add and edit form with amount, category, date and note. |
| `src/components/ExpenseTable.js` | Expense list with search, filters, totals and CSV export. |
| `docs/SETUP-AND-CHANGES.md` | This file. |

### Changed files

| File | Change |
|---|---|
| `src/App.js` | Replaced the single page with login handling. Shows `AuthPage` when logged out and `Dashboard` when logged in. Restores the session from the saved token on load. |
| `src/App.css` | Rewritten with a design system: colour variables, light and dark themes, responsive grid. |
| `src/App.test.js` | Replaced the broken default test with one that checks the login form appears. |
| `package.json` | Added `"proxy": "http://localhost:5000"` so `/api` requests reach the server during development. Your existing `homepage` and `deploy` lines are unchanged. |
| `.gitignore` | Added `server/node_modules` and `server/.env`, so the password and secret never reach GitHub. |
| `README.md` | Replaced the generic Create React App text with project documentation. |

### Deleted files

- `src/components/ExpenseList.js` and `src/components/ExpenseChart.js`. The new dashboard components replace them.

### Data model

**`users`**

| Column | Type | Notes |
|---|---|---|
| `id` | INT, auto-increment | Primary key |
| `name` | VARCHAR(100) | |
| `email` | VARCHAR(255) | Unique |
| `password_hash` | VARCHAR(255) | bcrypt hash, never the plain password |
| `monthly_budget` | DECIMAL(10,2) | NULL means no budget set |
| `created_at` | TIMESTAMP | |

**`expenses`**

| Column | Type | Notes |
|---|---|---|
| `id` | INT, auto-increment | Primary key |
| `user_id` | INT | Foreign key to `users`, deleted with the user |
| `amount` | DECIMAL(10,2) | |
| `category` | VARCHAR(50) | Food, Transport, Utilities, Entertainment, Shopping, Health, Others |
| `note` | VARCHAR(255) | Optional |
| `expense_date` | DATE | The date the money was spent |
| `created_at`, `updated_at` | TIMESTAMP | |

### API reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Checks the server and database connection |
| POST | `/api/auth/register` | No | Create an account, returns a token |
| POST | `/api/auth/login` | No | Log in, returns a token |
| GET | `/api/auth/me` | Yes | Current user |
| PUT | `/api/auth/budget` | Yes | Set or clear the monthly budget |
| GET | `/api/expenses` | Yes | List expenses (optional `from`, `to`, `category`) |
| POST | `/api/expenses` | Yes | Add an expense |
| PUT | `/api/expenses/:id` | Yes | Edit an expense |
| DELETE | `/api/expenses/:id` | Yes | Delete an expense |
| GET | `/api/expenses/analytics?months=6` | Yes | Trends, categories, projections and summary |

---

## Part 2: Connecting the database

Do these steps once. Each has a check you can use to confirm it worked.

### Step 1: Confirm MySQL is running

MySQL 8.0 is installed as the `MySQL80` Windows service. Check it:

```powershell
Get-Service MySQL80
```

The status should be `Running`. If it says `Stopped`, start it from an administrator PowerShell:

```powershell
Start-Service MySQL80
```

### Step 2: Create the tables

This creates the `expense_tracker` database, `users` and `expenses`. Enter your MySQL **root** password when asked.

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source server/schema.sql"
```

No output means success. To check, run:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "SHOW TABLES;" expense_tracker
```

You should see `expenses` and `users`.

### Step 3: Create the app's database user

Open `server/create-db-user.sql` and replace `CHANGE-ME-strong-password` with a password you choose. Write it down, you'll need it in step 4.

Then run:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source server/create-db-user.sql"
```

The app connects as this user, not as root. That limits the damage if the password leaks.

### Step 4: Create the server settings file

```powershell
cd server
copy .env.example .env
```

Open `server/.env` in your editor and set:

```ini
DB_PASSWORD=the-password-you-chose-in-step-3
JWT_SECRET=a-long-random-string
```

To generate a good `JWT_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the output into `JWT_SECRET`. Leave the other values as they are unless your setup is different.

Go back to the project root:

```powershell
cd ..
```

### Step 5: Install dependencies

Run this once, and again only if `package.json` changes:

```powershell
cd server
npm install
cd ..
npm install
```

### Step 6: Check the connection

Start the API (see Part 3), then open this in your browser:

```
http://localhost:5000/api/health
```

Expected response:

```json
{"ok":true,"database":"connected"}
```

If you see `"database":"not connected"`, check the troubleshooting table below.

---

## Part 3: Running the project

Each time you work on the project, you need two terminals open in the project folder.

**Terminal 1: API server (port 5000)**

```powershell
cd server
npm run dev
```

You should see `API running on http://localhost:5000`. `npm run dev` restarts the server automatically when you edit server files. Use `npm start` if you don't need that.

**Terminal 2: React app (port 3000)**

```powershell
npm start
```

The browser opens at http://localhost:3000. If it doesn't, open it manually.

**First use:** click **Sign up**, create an account, and add an expense. Your data is saved in MySQL. To confirm, run:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "SELECT id, name, email FROM users; SELECT id, amount, category, expense_date FROM expenses;" expense_tracker
```

To stop either server, press `Ctrl + C` in its terminal.

### Production build (optional)

To check that the frontend compiles without errors:

```powershell
npm run build
```

The build runs with warnings treated as errors when `CI=true`. This is the check used during development.

### Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `JWT_SECRET is missing` when starting the server | `.env` is missing or in the wrong folder | It must be `server/.env`, not the project root. Check the name is exactly `.env`. |
| `/api/health` shows `not connected` | MySQL is stopped, or the settings are wrong | Run `Get-Service MySQL80`. Check `DB_HOST`, `DB_PORT` and `DB_NAME` in `.env`. |
| `ER_ACCESS_DENIED_ERROR` in the server console | Wrong `DB_USER` or `DB_PASSWORD` | Make sure `.env` matches the password in `create-db-user.sql`. Re-run step 3 if needed. |
| `ER_BAD_DB_ERROR` or `Unknown database` | Step 2 wasn't run | Run the schema command in step 2. |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL service isn't running | `Start-Service MySQL80` from an administrator PowerShell. |
| "Can't reach the server" in the browser | API isn't running | Start Terminal 1 (`npm run dev` in `server`). |
| CORS error in the browser console | `CLIENT_ORIGIN` doesn't match the React address | Keep `CLIENT_ORIGIN=http://localhost:3000` in `.env`. Restart the API after editing it. |
| `Port 5000 is already in use` | Another process uses the port | Change `PORT` in `.env`, or stop the other process. |
| Login loops or "session expired" after a database reset | Old token in the browser | Click **Log out**, or clear the site data for `localhost:3000`. |
| Charts or totals look wrong after changing the code | Browser cache | Hard refresh with `Ctrl + Shift + R`. |

### Resetting the data

To delete all accounts and expenses and start fresh:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "DROP DATABASE expense_tracker;"
```

Then repeat step 2. The app user from step 3 stays in place.

---

## Going online

This setup only runs on your own machine. To put the app online, you'd need:

1. A hosted MySQL database (for example PlanetScale, AWS RDS, or Railway).
2. The Express server hosted on a service such as Render, Railway, or a VPS. Set the same `.env` values there, with a strong `JWT_SECRET` and `CLIENT_ORIGIN` set to your frontend's URL.
3. The frontend built with `REACT_APP_API_URL=https://your-api-address` set before `npm run build`.

GitHub Pages only serves static files, so it can host the frontend but not the API or the database.
