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

-- Default Admin Account (Username: admin, Email: admin@amaderjob.com, Password: admin123456)
INSERT INTO `admins` (`id`, `username`, `email`, `password_hash`, `role`) VALUES
(1, 'admin', 'admin@amaderjob.com', '$2y$10$5M8y2lT0h9n6N4rZ1uO4yeiF7pX0vH6aB7e8r3j2k1m4q5w6e7r8u', 'superadmin');

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
('site_subtitle', 'Leading Micro Task & Freelance Platform in Bangladesh'),
('site_subtitle_bn', 'বাংলাদেশের বিশ্বস্ত মাইক্রো টাস্ক ও ফ্রিল্যান্সিং প্ল্যাটফর্ম'),
('logo_url', '/assets/logo.png'),
('domain', 'https://amaderjob.com'),
('support_email', 'support@amaderjob.com'),
('whatsapp_number', '+8801700000000'),
('helpline_phone', '+8801800000000'),
('min_deposit_bdt', '50.00'),
('min_withdraw_bdt', '100.00'),
('usd_to_bdt_rate', '120.00'),
('notice_marquee', '🔥 Welcome to Amader Job Online! Complete micro tasks, follow social channels and earn real BDT daily. Fast automated payouts via bKash, Nagad & Rocket!'),
('notice_marquee_bn', '🔥 স্বাগতম আমাদের জব অনলাইন প্ল্যাটফর্মে! প্রতিদিন ছোট ছোট কাজ করে সরাসরি বিকাশ ও নগদে পেমেন্ট নিন। যেকোনো প্রয়োজনে হেল্পলাইনে যোগাযোগ করুন।'),
('maintenance_mode', '0'),
('deposit_bonus_percent', '5'),
('email_verification_enabled', '1'),
('smtp_host', 'mail.amaderjob.com'),
('smtp_port', '587'),
('smtp_username', 'info@amaderjob.com'),
('smtp_password', ''),
('smtp_encryption', 'tls'),
('smtp_from_email', 'info@amaderjob.com'),
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

-- Initial Demo Users
INSERT INTO `users` (`id`, `uid`, `name`, `email`, `phone`, `password_hash`, `role`, `avatar`, `earning_balance_bdt`, `deposit_balance_bdt`, `earning_balance_usd`, `deposit_balance_usd`, `completed_tasks_count`, `posted_jobs_count`, `satisfaction_rate`, `level`, `is_verified`, `has_blue_badge`, `blue_badge_plan`, `referral_code`, `referred_users_count`, `referral_earnings_bdt`, `daily_streak`) VALUES
(1, '84920173', 'Md. Rafiul Islam', 'rafi2377a@amaderjob.com', '01712345678', '$2y$10$5M8y2lT0h9n6N4rZ1uO4yeiF7pX0vH6aB7e8r3j2k1m4q5w6e7r8u', 'worker', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 1250.00, 500.00, 10.42, 4.17, 34, 3, 99.20, 'Gold', 1, 1, 'yearly', '84920173', 42, 1260.00, 7),
(2, '71938204', 'Tanjim Ahmed', 'tanjim@example.com', '01811223344', '$2y$10$5M8y2lT0h9n6N4rZ1uO4yeiF7pX0vH6aB7e8r3j2k1m4q5w6e7r8u', 'worker', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 3820.00, 200.00, 31.83, 1.67, 142, 1, 99.50, 'Platinum', 1, 1, 'yearly', '71938204', 128, 3840.00, 12),
(3, '58204917', 'Fatima Akter', 'fatima@example.com', '01922334455', '$2y$10$5M8y2lT0h9n6N4rZ1uO4yeiF7pX0vH6aB7e8r3j2k1m4q5w6e7r8u', 'worker', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 3240.00, 0.00, 27.00, 0.00, 118, 0, 98.80, 'Gold', 1, 1, 'monthly', '58204917', 94, 2820.00, 9),
(4, '39482015', 'Nayeem Hasan', 'nayeem@example.com', '01633445566', '$2y$10$5M8y2lT0h9n6N4rZ1uO4yeiF7pX0vH6aB7e8r3j2k1m4q5w6e7r8u', 'worker', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 2910.00, 450.00, 24.25, 3.75, 96, 2, 97.40, 'Gold', 1, 0, NULL, '39482015', 73, 2190.00, 5);

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

INSERT INTO `jobs` (`id`, `title`, `title_bn`, `category`, `category_name`, `category_name_bn`, `employer_id`, `employer_name`, `employer_avatar`, `employer_verified`, `pay_per_task_bdt`, `pay_per_task_usd`, `total_slots`, `completed_slots`, `estimated_minutes`, `target_link`, `description`, `description_bn`, `instructions_json`, `rules_json`, `proof_requirements_json`, `featured`, `status`) VALUES
('job_1', 'Subscribe YouTube Channel & Watch 2 Minutes', 'ইউটিউব চ্যানেল সাবস্ক্রাইব করুন এবং ২ মিনিট ভিডিও দেখুন', 'youtube', 'YouTube', 'ইউটিউব', 'emp_101', 'TechReview BD', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100', 1, 12.50, 0.10, 500, 342, 3, 'https://youtube.com', 'Watch 2 mins, like video and subscribe channel.', 'ভিডিওটি ২ মিনিট দেখুন, লাইক দিন এবং সাবস্ক্রাইব করুন।', '["Search channel name on YouTube", "Watch any latest video for at least 2 minutes", "Subscribe and click bell icon"]', '["No bot accounts allowed", "Do not unsubscribe within 30 days"]', '["Channel screenshot showing subscribed button", "Your YouTube channel name"]', 1, 'active'),
('job_2', 'Install & Sign Up on bKash / Fintech Android App', 'অ্যান্ড্রয়েড অ্যাপ ইনস্টল এবং সাইন আপ করুন', 'app_download', 'App Install', 'অ্যাপ ইনস্টল', 'emp_102', 'AppDev Global', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', 1, 35.00, 0.29, 200, 89, 7, 'https://play.google.com', 'Download app, complete initial registration.', 'গুগল প্লে স্টোর থেকে অ্যাপ ডাউনলোড করে সাইন আপ করুন।', '["Open Play Store link", "Download app", "Sign up with your phone or email"]', '["One submission per phone/IP", "Must keep app for 24 hours"]', '["Profile screenshot inside app", "Account registered phone number"]', 1, 'active'),
('job_3', 'Follow Facebook Official Page & Like 3 Posts', 'ফেসবুক পেজ ফলো এবং ৩টি পোস্টে লাইক দিন', 'facebook', 'Facebook', 'ফেসবুক', 'emp_103', 'Organic Fashion BD', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', 1, 8.00, 0.07, 1000, 680, 2, 'https://facebook.com', 'Follow page and like 3 recent posts.', 'পেজ ফলো দিন এবং সাম্প্রতিক ৩টি পোস্টে লাইক দিন।', '["Go to Facebook page", "Click Follow and Like", "Like 3 most recent posts"]', '["Profile must be genuine with profile picture"]', '["Screenshot showing Followed status", "Your Facebook profile link"]', 0, 'active');

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

INSERT INTO `task_submissions` (`id`, `job_id`, `worker_id`, `worker_name`, `worker_avatar`, `proof_text`, `proof_url`, `status`, `earned_bdt`, `earned_usd`) VALUES
('sub_1', 'job_1', '84920173', 'Md. Rafiul Islam', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Completed youtube subscription. Channel name: Rafiul Tech.', 'https://imgur.com/example1', 'approved', 12.50, 0.10),
('sub_2', 'job_2', '84920173', 'Md. Rafiul Islam', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Installed app and signed up with 01712345678.', 'https://imgur.com/example2', 'pending', 35.00, 0.29);

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

INSERT INTO `wallet_transactions` (`id`, `user_id`, `type`, `title`, `title_bn`, `amount_bdt`, `amount_usd`, `method`, `account_number`, `trx_id`, `status`) VALUES
('tx_1', '84920173', 'deposit', 'Deposit via bKash', 'বিকাশ ডিপোজিট', 500.00, 4.17, 'bkash', '01712345678', 'BK9827163', 'completed'),
('tx_2', '84920173', 'task_earning', 'Earned from YouTube Task', 'ইউটিউব টাস্ক থেকে আয়', 12.50, 0.10, NULL, NULL, NULL, 'completed'),
('tx_3', '84920173', 'withdrawal', 'Withdrawal to Nagad', 'নগদ ক্যাশআউট', 300.00, 2.50, 'nagad', '01712345678', 'NG5519283', 'pending');

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

INSERT INTO `support_tickets` (`id`, `user_id`, `user_name`, `user_email`, `subject`, `category`, `priority`, `status`, `unread_user`, `unread_admin`) VALUES
('TCK-78419', '84920173', 'Md. Rafiul Islam', 'rafi2377a@amaderjob.com', 'Deposit balance not updated via bKash', 'deposit', 'high', 'in_progress', 1, 0);

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

INSERT INTO `ticket_messages` (`ticket_id`, `sender`, `sender_name`, `message`) VALUES
('TCK-78419', 'user', 'Md. Rafiul Islam', 'Hello, I deposited 500 BDT using bKash TrxID BK9827163 20 minutes ago.'),
('TCK-78419', 'admin', 'Support Team', 'We received your ticket. Our finance team is reviewing your transaction ID now.');

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

INSERT INTO `notifications` (`id`, `user_id`, `title`, `title_bn`, `message`, `message_bn`, `type`, `is_read`) VALUES
('notif_1', '84920173', 'Welcome to Amader Job!', 'আমাদের জব-এ স্বাগতম!', 'Complete your profile and start micro jobs now.', 'আপনার প্রোফাইল সম্পন্ন করুন এবং কাজ শুরু করুন।', 'system', 0),
('notif_2', '84920173', 'Deposit Confirmed', 'ডিপোজিট সফল', 'Your bKash deposit of 500 BDT was approved.', 'আপনার ৫০০ টাকা বিকাশ ডিপোজিট অনুমোদিত হয়েছে।', 'wallet', 0);

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
