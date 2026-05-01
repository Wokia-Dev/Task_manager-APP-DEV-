-- ============================================
-- TaskFlow Database Initialization Script
-- Run: mysql -u root -p < init_db.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS taskflow_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE taskflow_db;

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    email           VARCHAR(120) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    avatar_color    VARCHAR(7)   DEFAULT '#6C63FF',
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- Teams Table
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    invite_code     VARCHAR(20)  NOT NULL UNIQUE,
    created_by      INT          NOT NULL,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- Team Members (join table)
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    team_id         INT NOT NULL,
    user_id         INT NOT NULL,
    role            ENUM('owner', 'member') DEFAULT 'member',
    joined_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_membership (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- Tasks Table
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    team_id         INT          NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    status          ENUM('todo', 'in_progress', 'completed') DEFAULT 'todo',
    priority        ENUM('low', 'medium', 'high', 'urgent')  DEFAULT 'medium',
    due_date        DATE,
    created_by      INT          NOT NULL,
    assigned_to     INT,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at    DATETIME,
    FOREIGN KEY (team_id)     REFERENCES teams(id)  ON DELETE CASCADE,
    FOREIGN KEY (created_by)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id)  ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- Performance Indexes
-- ============================================
CREATE INDEX idx_tasks_team_status  ON tasks(team_id, status);
CREATE INDEX idx_tasks_assigned     ON tasks(assigned_to);
CREATE INDEX idx_tasks_due_date     ON tasks(due_date);
CREATE INDEX idx_team_members_user  ON team_members(user_id);
