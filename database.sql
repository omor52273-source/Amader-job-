-- =======================================================
-- Amader Job Online - Production Database Schema (MySQL/MariaDB)
-- Fully compatible with cPanel phpMyAdmin and MySQL 5.7 / 8.0+ / MariaDB 10.3+
-- =======================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- --------------------------------------------------------
-- Table: admins
-- --------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin', 'admin', 'moderator') DEFAULT 'superadmin',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin account creation must be done securely via backend/CLI using password_hash() and password_verify().


-- --------------------------------------------------------
-- Table: settings (Website, App & SMTP Configurations)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` LONGTEXT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('site_name', 'Amader Job Online'),
('site_name_bn', 'আমাদের জব অনলাইন'),
('site_subtitle', 'Leading Micro Task & Freelance Platform'),
('site_subtitle_bn', 'বিশ্বস্ত মাইক্রো টাস্ক ও ফ্রিল্যান্সিং প্ল্যাটফর্ম'),
('logo_url', '/assets/logo.svg'),
('support_email', 'support@example.com'),
('whatsapp_number', '+8801700000000'),
('helpline_phone', '+8801800000000'),
('min_deposit_bdt', '50.00'),
('min_withdraw_bdt', '100.00'),
('usd_to_bdt_rate', '120.00'),
('notice_marquee', '🔥 Welcome to Amader Job Online! Complete micro tasks and earn real BDT daily. Fast automated payouts!'),
('notice_marquee_bn', '🔥 স্বাগতম আমাদের জব অনলাইন প্ল্যাটফর্মে! ছোট ছোট কাজ করে পেমেন্ট নিন।'),
('maintenance_mode', '0'),
('deposit_bonus_percent', '5'),
('seo_meta_title', 'Amader Job Online - Micro Task & Freelance Platform'),
('seo_meta_description', 'Top micro-task and freelance platform. Complete small tasks and earn daily.'),
('seo_keywords', 'Amader Job, micro job, online income bd, freelance micro tasks'),
('seo_og_image', '/assets/logo.svg'),
('google_site_verification', ''),
('bing_site_verification', ''),
('email_verification_enabled', '1'),
('smtp_host', 'mail.example.com'),
('smtp_port', '587'),
('smtp_username', 'info@example.com'),
('smtp_password', ''),
('smtp_encryption', 'tls'),
('smtp_from_email', 'info@example.com'),
('smtp_from_name', 'Amader Job'),
('tpl_password_reset_subject', 'Amader Job - Password Reset Code'),
('tpl_password_reset_body', 'Your password reset OTP is: {{otp}}. Valid for 5 minutes.'),
('tpl_verification_subject', 'Amader Job - Account Verification Code'),
('tpl_verification_body', 'Your registration OTP is: {{otp}}. Valid for 5 minutes.');

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uid` VARCHAR(16) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('worker', 'employer') DEFAULT 'worker',
  `avatar` VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  `earning_balance_bdt` DECIMAL(12,2) DEFAULT 0.00,
  `deposit_balance_bdt` DECIMAL(12,2) DEFAULT 0.00,
  `earning_balance_usd` DECIMAL(12,2) DEFAULT 0.00,
  `deposit_balance_usd` DECIMAL(12,2) DEFAULT 0.00,
  `completed_tasks_count` INT DEFAULT 0,
  `posted_jobs_count` INT DEFAULT 0,
  `satisfaction_rate` DECIMAL(5,2) DEFAULT 100.00,
  `level` VARCHAR(50) DEFAULT 'Bronze',
  `is_verified` TINYINT(1) DEFAULT 0,
  `has_blue_badge` TINYINT(1) DEFAULT 0,
  `blue_badge_plan` VARCHAR(20) NULL,
  `blue_badge_expires_at` DATETIME NULL,
  `two_factor_enabled` TINYINT(1) DEFAULT 0,
  `nid_number` VARCHAR(50) NULL,
  `kyc_status` ENUM('unverified', 'pending', 'verified', 'rejected') DEFAULT 'unverified',
  `referral_code` VARCHAR(20) NOT NULL,
  `referred_by_code` VARCHAR(20) NULL,
  `referral_earnings_bdt` DECIMAL(12,2) DEFAULT 0.00,
  `referred_users_count` INT DEFAULT 0,
  `daily_streak` INT DEFAULT 0,
  `status` ENUM('active', 'warned', 'banned') DEFAULT 'active',
  `ban_reason` TEXT NULL,
  `warning_count` INT DEFAULT 0,
  `email_verified` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: jobs
-- --------------------------------------------------------
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `title_bn` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `category_name` VARCHAR(100) NOT NULL,
  `category_name_bn` VARCHAR(100) NOT NULL,
  `employer_id` VARCHAR(50) NOT NULL,
  `employer_name` VARCHAR(100) NOT NULL,
  `employer_avatar` VARCHAR(255) NULL,
  `employer_verified` TINYINT(1) DEFAULT 0,
  `pay_per_task_bdt` DECIMAL(10,2) NOT NULL,
  `pay_per_task_usd` DECIMAL(10,2) NOT NULL,
  `total_slots` INT NOT NULL,
  `completed_slots` INT DEFAULT 0,
  `estimated_minutes` INT DEFAULT 5,
  `target_country` VARCHAR(50) DEFAULT 'Bangladesh',
  `target_country_bn` VARCHAR(50) DEFAULT 'বাংলাদেশ',
  `target_link` TEXT NULL,
  `description` TEXT,
  `description_bn` TEXT,
  `instructions_json` LONGTEXT,
  `rules_json` LONGTEXT,
  `proof_requirements_json` LONGTEXT,
  `featured` TINYINT(1) DEFAULT 0,
  `status` ENUM('active', 'paused', 'completed') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: task_submissions
-- --------------------------------------------------------
DROP TABLE IF EXISTS `task_submissions`;
CREATE TABLE `task_submissions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `job_id` VARCHAR(50) NOT NULL,
  `worker_id` VARCHAR(50) NOT NULL,
  `worker_name` VARCHAR(100) NOT NULL,
  `worker_avatar` VARCHAR(255) NULL,
  `proof_text` TEXT NOT NULL,
  `proof_url` TEXT NULL,
  `proof_image_url` LONGTEXT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'disputed') DEFAULT 'pending',
  `feedback` TEXT NULL,
  `earned_bdt` DECIMAL(10,2) NOT NULL,
  `earned_usd` DECIMAL(10,2) NOT NULL,
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: wallet_transactions
-- --------------------------------------------------------
DROP TABLE IF EXISTS `wallet_transactions`;
CREATE TABLE `wallet_transactions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `type` ENUM('deposit', 'withdrawal', 'task_earning', 'job_post', 'referral_bonus', 'daily_streak', 'campaign_spend') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `title_bn` VARCHAR(255) NOT NULL,
  `amount_bdt` DECIMAL(12,2) NOT NULL,
  `amount_usd` DECIMAL(12,2) NOT NULL,
  `method` VARCHAR(50) NULL,
  `account_number` VARCHAR(50) NULL,
  `trx_id` VARCHAR(100) NULL,
  `status` ENUM('completed', 'pending', 'rejected') DEFAULT 'pending',
  `note` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: support_tickets
-- --------------------------------------------------------
DROP TABLE IF EXISTS `support_tickets`;
CREATE TABLE `support_tickets` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `user_email` VARCHAR(150) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `status` ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  `unread_user` TINYINT(1) DEFAULT 0,
  `unread_admin` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: ticket_messages
-- --------------------------------------------------------
DROP TABLE IF EXISTS `ticket_messages`;
CREATE TABLE `ticket_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` VARCHAR(50) NOT NULL,
  `sender` ENUM('user', 'admin') NOT NULL,
  `sender_name` VARCHAR(100) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: notifications
-- --------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` VARCHAR(50) NULL,
  `title` VARCHAR(255) NOT NULL,
  `title_bn` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `message_bn` TEXT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'system',
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: password_resets
-- --------------------------------------------------------
DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE `password_resets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(150) NOT NULL,
  `otp` VARCHAR(10) NOT NULL,
  `token_hash` VARCHAR(255) NULL,
  `attempts` INT DEFAULT 0,
  `locked_until` DATETIME NULL,
  `expires_at` DATETIME NOT NULL,
  `used` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`email`),
  INDEX (`token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: email_verifications
-- --------------------------------------------------------
DROP TABLE IF EXISTS `email_verifications`;
CREATE TABLE `email_verifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(150) NOT NULL,
  `token` VARCHAR(100) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `verified` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`email`),
  INDEX (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: referrals
-- --------------------------------------------------------
DROP TABLE IF EXISTS `referrals`;
CREATE TABLE `referrals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `referrer_id` VARCHAR(50) NOT NULL,
  `referred_id` VARCHAR(50) NOT NULL,
  `bonus_bdt` DECIMAL(10,2) DEFAULT 0.00,
  `status` VARCHAR(20) DEFAULT 'registered',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`referrer_id`),
  INDEX (`referred_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
