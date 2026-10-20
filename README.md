# PocketPal: Student Expense Tracker

A student-friendly expense tracker with login, spending analytics and a MySQL database.
All amounts are in Indian Rupees (₹).

- **Repository:** https://github.com/Shafeeq0807/Expense-Tracker-react
- **Live site (frontend only):** https://Shafeeq0807.github.io/Expense-Tracker-react/

## Features

- **Accounts:** sign up and log in. Each user only sees their own data.
- **Expenses:** add, edit and delete expenses from a quick pop-up, with student categories
  (Food, Transport, Books & Stationery, Rent & Hostel, Recharge & Internet, Fees and more).
- **Pocket money budget:** set a monthly budget and see what's left and how much you can spend per day.
- **Overview:** this month vs last month, month-end projection, top-category cards with mini charts,
  recent expenses and a 30-day activity chart.
- **Analytics:** monthly and 30-day trends, category split, and plain-language money tips.
- **Navigation:** side menu (slide-out on phones), search from the top bar, and filters by spending group.
- **Light and dark mode:** follows your system setting, and remembers your choice.
- **Tools:** search and filter the expense list, and export it to CSV.

## Tech stack

- Frontend: React (Create React App), Chart.js
- Backend: Node.js, Express, mysql2, bcryptjs (password hashing), JSON Web Tokens
- Database: MySQL 8

## One-time setup

### 1. Create the database

From the project folder, run (you'll be asked for your MySQL root password):

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source server/schema.sql"
```

### 2. Create a limited database user

Open the MySQL client with the same command, then run:

```sql
CREATE USER 'expense_app'@'localhost' IDENTIFIED BY 'choose-a-strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON expense_tracker.* TO 'expense_app'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configure the server

```powershell
cd server
copy .env.example .env
```

Edit `server/.env`:

- `DB_PASSWORD`: the password you chose in step 2.
- `JWT_SECRET`: a long random string, for example from
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

### 4. Install dependencies

```powershell
cd server
npm install
cd ..
npm install
```

## Running the app

**Easiest:** double-click `start-app.bat`. It opens the API and the app in two windows, then your browser.

Or start them yourself:

Use two terminals from the project folder:

```powershell
# Terminal 1: API on http://localhost:5000
cd server
npm run dev

# Terminal 2: frontend on http://localhost:3000
npm start
```

Open http://localhost:3000, sign up, and start adding expenses.

Check the API and database connection at http://localhost:5000/api/health.

## Project structure

```
server/
  index.js            Express app and middleware
  db.js               MySQL connection pool
  schema.sql          Database tables
  middleware/auth.js  Checks the login token on protected routes
  routes/auth.js      Register, login, current user, budget
  routes/expenses.js  Expense CRUD and analytics
src/
  App.js              Login state and page switching
  api.js              Calls the API and attaches the login token
  components/         Dashboard, stat cards, insights, charts, form, table
```

## Notes

- Passwords are stored as bcrypt hashes, never in plain text.
- The API runs on your own machine, so the app works locally. Publishing it online
  (for example on GitHub Pages) needs a hosted API and MySQL server, with the
  frontend's `REACT_APP_API_URL` pointing at that API.
- Amounts are shown in US dollars. To change the currency, edit `src/utils.js`.
