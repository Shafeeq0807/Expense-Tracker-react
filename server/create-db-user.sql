-- Creates a limited MySQL user for the app. Run AFTER schema.sql, as root:
--   mysql -u root -p -e "source server/create-db-user.sql"
--
-- Before running: replace the password below with your own, and put the SAME
-- password in server/.env as DB_PASSWORD.

CREATE USER IF NOT EXISTS 'expense_app'@'localhost' IDENTIFIED BY 'CHANGE-ME-strong-password';

-- Only the four permissions the app needs, only on this one database
GRANT SELECT, INSERT, UPDATE, DELETE ON expense_tracker.* TO 'expense_app'@'localhost';

FLUSH PRIVILEGES;
