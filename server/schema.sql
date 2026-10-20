-- Expense Tracker database schema
-- Run once with:  mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS expense_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE expense_tracker;

CREATE TABLE IF NOT EXISTS users (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100)   NOT NULL,
  email          VARCHAR(255)   NOT NULL UNIQUE,
  password_hash  VARCHAR(255)   NOT NULL,
  monthly_budget DECIMAL(10,2)  NULL,
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED  NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,
  category     VARCHAR(50)   NOT NULL,
  note         VARCHAR(255)  NOT NULL DEFAULT '',
  expense_date DATE          NOT NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_expenses_user_date (user_id, expense_date)
);
