-- =============================================
-- KIRLOSKAR CHILLERS – DATABASE SCHEMA
-- Run this in phpMyAdmin or MySQL Workbench
-- =============================================

-- CREATE DATABASE IF NOT EXISTS kirloskar_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kirloskar_db;

-- ─────────────────────────────────────────────
-- TABLE 1: users
-- Stores all registered user accounts
-- ─────────────────────────────────────────────
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  fname       VARCHAR(100)  NOT NULL,
  lname       VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  mobile      VARCHAR(20)   DEFAULT NULL,
  pass        VARCHAR(255)  NOT NULL,         -- store hashed with password_hash()
  role        ENUM('user','admin')  NOT NULL DEFAULT 'user',
  status      ENUM('pending','approved','revoked') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Master admin account (password: kirloskar@)
-- NOTE: In production, use password_hash() from PHP instead of plain text
INSERT INTO users (fname, lname, email, mobile, pass, role, status)
VALUES ('Master', 'Admin', 'abhijit.chavhan@kirloskar.com', NULL, 'kirloskar@', 'admin', 'approved');


-- ─────────────────────────────────────────────
-- TABLE 2: activity_log
-- Stores every admin action + login event
-- ─────────────────────────────────────────────
CREATE TABLE activity_log (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  type        ENUM('login','approve','reject','revoke','restore','delete','select') NOT NULL,
  user_name   VARCHAR(255)  NOT NULL,         -- display name of the affected user
  detail      VARCHAR(500)  DEFAULT '',
  done_by     VARCHAR(255)  DEFAULT NULL,     -- email of admin who did it
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ─────────────────────────────────────────────
-- TABLE 3: selections
-- Tracks how many reports each user generated
-- ─────────────────────────────────────────────
CREATE TABLE selections (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_email  VARCHAR(255)  NOT NULL,
  count       INT           NOT NULL DEFAULT 0,
  last_used   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_email (user_email)
);


-- ─────────────────────────────────────────────
-- Useful queries for the admin panel
-- ─────────────────────────────────────────────

-- Get all pending users:
-- SELECT * FROM users WHERE status = 'pending' AND role = 'user';

-- Get all users with their selection count:
-- SELECT u.fname, u.lname, u.email, u.status, COALESCE(s.count, 0) AS selections
-- FROM users u
-- LEFT JOIN selections s ON u.email = s.user_email
-- WHERE u.role = 'user';

-- Approve a user:
-- UPDATE users SET status = 'approved' WHERE email = 'user@example.com';

-- Revoke a user:
-- UPDATE users SET status = 'revoked' WHERE email = 'user@example.com';

-- Get recent activity (last 50 events):
-- SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 50;

-- Increment selection count:
-- INSERT INTO selections (user_email, count) VALUES ('user@example.com', 1)
-- ON DUPLICATE KEY UPDATE count = count + 1, last_used = NOW();