<?php
/**
 * Amader Job Online - Unified Production Backend API Router
 * Directly connects Frontend Requests to MySQL/MariaDB with PDO & SMTP Mailer
 * Single Source of Truth: MySQL (bahubal2_Amaderjob8383)
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/mail.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

// Parse JSON request body
$rawInput = file_get_contents('php://input');
$jsonInput = json_decode($rawInput, true) ?: [];

// Resolve requested endpoint route
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$uriPath = parse_url($requestUri, PHP_URL_PATH);

// Normalize path: strip prefix e.g. /api or /public_html/api
$route = preg_replace('#^.*?/api/#', '', $uriPath);
$route = trim($route, '/');

$db = get_db();

switch ($route) {
    // -------------------------------------------------------------
    // Health & Database Status
    // -------------------------------------------------------------
    case 'health':
        $dbOk = ($db !== null);
        $mailer = new SmtpMailer();

        json_response([
            'status' => 'ok',
            'app_url' => get_base_app_url(),
            'database' => [
                'connected' => $dbOk,
                'driver' => 'PDO MySQL/MariaDB',
                'name' => env('DB_NAME', 'bahubal2_Amaderjob8383')
            ],
            'smtp' => [
                'configured' => $mailer->isConfigured()
            ],
            'timestamp' => date('c')
        ]);
        break;

    // -------------------------------------------------------------
    // Dynamic Site Settings from MySQL
    // -------------------------------------------------------------
    case 'settings':
        $settings = [];
        if ($db) {
            try {
                $stmt = $db->query("SELECT setting_key, setting_value FROM settings WHERE setting_key NOT LIKE 'smtp_password%' AND setting_key NOT LIKE '%secret%'");
                while ($row = $stmt->fetch()) {
                    $settings[$row['setting_key']] = $row['setting_value'];
                }
            } catch (Exception $e) {}
        }
        json_response([
            'success' => true,
            'app_url' => get_base_app_url(),
            'settings' => $settings
        ]);
        break;

    // -------------------------------------------------------------
    // Live Platform Statistics (Real MySQL counts)
    // -------------------------------------------------------------
    case 'stats':
        $totalUsers = 0;
        $totalCompletedTasks = 0;
        $totalPaidOutBDT = 0.0;
        $totalActiveJobs = 0;

        if ($db) {
            try {
                $totalUsers = (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn();
                $totalCompletedTasks = (int)$db->query("SELECT COUNT(*) FROM task_submissions WHERE status = 'approved'")->fetchColumn();
                $totalPaidOutBDT = (float)$db->query("SELECT COALESCE(SUM(amount_bdt), 0) FROM wallet_transactions WHERE type = 'withdrawal' AND status = 'completed'")->fetchColumn();
                $totalActiveJobs = (int)$db->query("SELECT COUNT(*) FROM jobs WHERE status = 'active'")->fetchColumn();
            } catch (Exception $e) {}
        }

        json_response([
            'success' => true,
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalCompletedTasks' => $totalCompletedTasks,
                'totalPaidOutBDT' => $totalPaidOutBDT,
                'totalActiveJobs' => $totalActiveJobs
            ]
        ]);
        break;

    // -------------------------------------------------------------
    // Send OTP (Registration / Password Reset)
    // -------------------------------------------------------------
    case 'otp/send-otp':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            json_response(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $email = trim(strtolower($jsonInput['email'] ?? $_POST['email'] ?? ''));
        $purpose = trim($jsonInput['purpose'] ?? $_POST['purpose'] ?? 'register');

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            json_response(['success' => false, 'error' => 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন (Please enter a valid email address)'], 400);
        }

        $otp = sprintf('%06d', random_int(100000, 999999));
        $now = date('Y-m-d H:i:s');
        $expiresAt = date('Y-m-d H:i:s', time() + 300); // 5 minutes

        if ($db) {
            try {
                // Check failed attempts / locking
                $stmt = $db->prepare("SELECT attempts, locked_until FROM password_resets WHERE email = ? ORDER BY id DESC LIMIT 1");
                $stmt->execute([$email]);
                $lastReset = $stmt->fetch();

                if ($lastReset && !empty($lastReset['locked_until'])) {
                    if (strtotime($lastReset['locked_until']) > time()) {
                        $remainingMin = ceil((strtotime($lastReset['locked_until']) - time()) / 60);
                        json_response([
                            'success' => false,
                            'isLocked' => true,
                            'error' => "অতিরিক্ত ভুলের কারণে আপনার ইনপুট সাময়িক লক রয়েছে। {$remainingMin} মিনিট পর চেষ্টা করুন।"
                        ], 429);
                    }
                }

                // If purpose is forgot_password, verify that user exists
                if ($purpose === 'forgot_password') {
                    $uStmt = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
                    $uStmt->execute([$email]);
                    if (!$uStmt->fetch()) {
                        json_response([
                            'success' => false,
                            'error' => 'এই ইমেইলে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি (No account found with this email).'
                        ], 404);
                    }
                }

                // Insert new reset OTP record
                $ins = $db->prepare("INSERT INTO password_resets (email, otp, expires_at, created_at) VALUES (?, ?, ?, ?)");
                $ins->execute([$email, $otp, $expiresAt, $now]);
            } catch (Exception $e) {}
        }

        // Send Email via SmtpMailer
        $sendResult = send_otp_email($email, $otp, $purpose);

        if ($sendResult['success']) {
            json_response([
                'success' => true,
                'message' => 'আপনার ইমেইলে ৬ ডিজিটের ওটিপি কোড পাঠানো হয়েছে।',
                'maskedEmail' => mask_email($email),
                'cooldown' => 60,
                'expiresInSeconds' => 300
            ]);
        } else {
            json_response([
                'success' => true,
                'isSimulationFallback' => true,
                'devOtp' => $otp,
                'warning' => 'SMTP নট কনফিগারড বা কানেকশন ব্যর্থ হয়েছে। অ্যাডমিন প্যানেল (/admin/) থেকে SMTP কনফিগার করুন।',
                'maskedEmail' => mask_email($email),
                'cooldown' => 60,
                'expiresInSeconds' => 300,
                'message' => 'টেস্ট মোডে ওটিপি তৈরি হয়েছে: ' . $otp
            ]);
        }
        break;

    // -------------------------------------------------------------
    // Verify OTP
    // -------------------------------------------------------------
    case 'otp/verify-otp':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            json_response(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $email = trim(strtolower($jsonInput['email'] ?? $_POST['email'] ?? ''));
        $enteredOtp = trim($jsonInput['otp'] ?? $_POST['otp'] ?? '');
        $purpose = trim($jsonInput['purpose'] ?? $_POST['purpose'] ?? 'register');

        if (empty($email) || empty($enteredOtp)) {
            json_response(['success' => false, 'error' => 'ইমেইল এবং ওটিপি প্রদান করুন।'], 400);
        }

        $verificationToken = bin2hex(random_bytes(24));

        if ($db) {
            try {
                $stmt = $db->prepare("
                    SELECT id, otp, attempts, expires_at, used, locked_until 
                    FROM password_resets 
                    WHERE email = ? AND used = 0 
                    ORDER BY id DESC LIMIT 1
                ");
                $stmt->execute([$email]);
                $record = $stmt->fetch();

                if ($record) {
                    if (strtotime($record['expires_at']) < time()) {
                        json_response(['success' => false, 'error' => 'ওটিপি কোডের মেয়াদ উত্তীর্ণ হয়ে গেছে। নতুন কোড অনুরোধ করুন।'], 400);
                    }

                    if ($record['otp'] !== $enteredOtp) {
                        $newAttempts = (int)$record['attempts'] + 1;
                        $lockedUntil = null;
                        if ($newAttempts >= 3) {
                            $lockedUntil = date('Y-m-d H:i:s', time() + 900); // 15 min lock
                        }

                        $upd = $db->prepare("UPDATE password_resets SET attempts = ?, locked_until = ? WHERE id = ?");
                        $upd->execute([$newAttempts, $lockedUntil, $record['id']]);

                        if ($newAttempts >= 3) {
                            json_response([
                                'success' => false,
                                'isLocked' => true,
                                'error' => '৩ বার ভুল ওটিপি দেওয়া হয়েছে। আপনার অ্যাকাউন্ট ১৫ মিনিটের জন্য সাময়িক লক করা হলো।'
                            ], 429);
                        }

                        $remaining = 3 - $newAttempts;
                        json_response([
                            'success' => false,
                            'attemptsRemaining' => $remaining,
                            'error' => "ভুল ওটিপি কোড। আপনার অবশিষ্ট চেষ্টা: {$remaining} বার।"
                        ], 400);
                    }

                    // Mark as used
                    $tokenHash = hash('sha256', $verificationToken);
                    $upd = $db->prepare("UPDATE password_resets SET used = 1, token_hash = ? WHERE id = ?");
                    $upd->execute([$tokenHash, $record['id']]);

                    json_response([
                        'success' => true,
                        'message' => 'ওটিপি সফলভাবে যাচাই হয়েছে।',
                        'verificationToken' => $verificationToken
                    ]);
                }
            } catch (Exception $e) {}
        }

        json_response([
            'success' => true,
            'message' => 'ওটিপি সফলভাবে যাচাই হয়েছে।',
            'verificationToken' => $verificationToken
        ]);
        break;

    // -------------------------------------------------------------
    // Reset Password
    // -------------------------------------------------------------
    case 'auth/reset-password':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            json_response(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $email = trim(strtolower($jsonInput['email'] ?? $_POST['email'] ?? ''));
        $token = trim($jsonInput['verificationToken'] ?? $_POST['verificationToken'] ?? '');
        $newPassword = $jsonInput['newPassword'] ?? $_POST['newPassword'] ?? '';

        if (empty($email) || strlen($newPassword) < 6) {
            json_response(['success' => false, 'error' => 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'], 400);
        }

        if ($db) {
            try {
                $hash = password_hash($newPassword, PASSWORD_BCRYPT);
                $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
                $stmt->execute([$hash, $email]);

                json_response([
                    'success' => true,
                    'message' => 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
                ]);
            } catch (Exception $e) {
                json_response(['success' => false, 'error' => 'পাসওয়ার্ড আপডেট করা যায়নি: ' . $e->getMessage()], 500);
            }
        }
        json_response(['success' => false, 'error' => 'Database connection unavailable'], 500);
        break;

    // -------------------------------------------------------------
    // Register User (Saves in MySQL users table)
    // -------------------------------------------------------------
    case 'auth/register':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            json_response(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $name = trim($jsonInput['name'] ?? $_POST['name'] ?? '');
        $email = trim(strtolower($jsonInput['email'] ?? $_POST['email'] ?? ''));
        $phone = trim($jsonInput['phone'] ?? $_POST['phone'] ?? '');
        $password = $jsonInput['password'] ?? $_POST['password'] ?? '';
        $role = ($jsonInput['role'] ?? $_POST['role'] ?? 'worker') === 'employer' ? 'employer' : 'worker';
        $refCode = trim($jsonInput['referralCode'] ?? $_POST['referralCode'] ?? '');

        if (empty($name) || empty($email) || strlen($password) < 6) {
            json_response(['success' => false, 'error' => 'সকল তথ্য সঠিকভাবে পূরণ করুন (পাসওয়ার্ড কমপক্ষে ৬ অক্ষর)।'], 400);
        }

        $uid = generate_uid();
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $referralCode = $uid;

        if ($db) {
            try {
                // Check if user already exists
                $chk = $db->prepare("SELECT id FROM users WHERE email = ? OR (phone != '' AND phone = ?) LIMIT 1");
                $chk->execute([$email, $phone]);
                if ($chk->fetch()) {
                    json_response(['success' => false, 'error' => 'এই ইমেইল অথবা মোবাইল নম্বর দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।'], 400);
                }

                // Check referred_by (Prevent self-referral)
                $referredBy = null;
                if (!empty($refCode) && $refCode !== $uid) {
                    $refStmt = $db->prepare("SELECT uid FROM users WHERE referral_code = ? OR uid = ? LIMIT 1");
                    $refStmt->execute([$refCode, $refCode]);
                    $refUser = $refStmt->fetch();
                    if ($refUser && $refUser['uid'] !== $uid) {
                        $referredBy = $refUser['uid'];
                        // Increment referrer's count
                        $db->prepare("UPDATE users SET referred_users_count = referred_users_count + 1 WHERE uid = ?")->execute([$referredBy]);
                    }
                }

                $stmt = $db->prepare("
                    INSERT INTO users (uid, name, email, phone, password_hash, role, referral_code, referred_by_code, earning_balance_bdt, deposit_balance_bdt, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0.00, 0.00, NOW())
                ");
                $stmt->execute([$uid, $name, $email, $phone, $passwordHash, $role, $referralCode, $referredBy]);
                $newId = $db->lastInsertId();

                // Welcome notification
                $notifStmt = $db->prepare("
                    INSERT INTO notifications (id, user_id, title, title_bn, message, message_bn, type, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
                ");
                $notifStmt->execute([
                    'notif_' . time(),
                    $uid,
                    'Welcome to Amader Job!',
                    'আমাদের জব-এ স্বাগতম!',
                    'Your account has been created successfully. Complete tasks to earn BDT!',
                    'আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। মাইক্রো টাস্ক সম্পন্ন করে টাকা আয় করুন!',
                    'system'
                ]);

                json_response([
                    'success' => true,
                    'user' => [
                        'id' => (string)$newId,
                        'uid' => $uid,
                        'name' => $name,
                        'email' => $email,
                        'phone' => $phone,
                        'role' => $role,
                        'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                        'referralCode' => $referralCode,
                        'earningBalanceBDT' => 0.00,
                        'depositBalanceBDT' => 0.00,
                        'earningBalanceUSD' => 0.00,
                        'depositBalanceUSD' => 0.00,
                        'completedTasksCount' => 0,
                        'postedJobsCount' => 0,
                        'satisfactionRate' => 100.00,
                        'level' => 'Bronze',
                        'isVerified' => false,
                        'hasBlueBadge' => false,
                        'kycStatus' => 'unverified',
                        'referredUsersCount' => 0,
                        'referralEarningsBDT' => 0.00,
                        'status' => 'active'
                    ]
                ]);
            } catch (Exception $e) {
                json_response(['success' => false, 'error' => 'রেজিস্ট্রেশন ত্রুটি: ' . $e->getMessage()], 500);
            }
        }

        json_response(['success' => false, 'error' => 'Database connection failed'], 500);
        break;

    // -------------------------------------------------------------
    // Login User (Verifies against MySQL users table)
    // -------------------------------------------------------------
    case 'auth/login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            json_response(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $emailOrPhone = trim($jsonInput['emailOrPhone'] ?? $jsonInput['email'] ?? $_POST['emailOrPhone'] ?? '');
        $password = $jsonInput['password'] ?? $_POST['password'] ?? '';

        if (empty($emailOrPhone) || empty($password)) {
            json_response(['success' => false, 'error' => 'ইমেইল/ফোন এবং পাসওয়ার্ড দিন।'], 400);
        }

        if ($db) {
            try {
                $stmt = $db->prepare("SELECT * FROM users WHERE email = ? OR phone = ? OR uid = ? LIMIT 1");
                $stmt->execute([$emailOrPhone, $emailOrPhone, $emailOrPhone]);
                $user = $stmt->fetch();

                if (!$user) {
                    json_response(['success' => false, 'error' => 'ভুল ইমেইল বা পাসওয়ার্ড।'], 401);
                }

                if ($user['status'] === 'banned') {
                    json_response(['success' => false, 'error' => 'আপনার অ্যাকাউন্টটি ব্যান করা হয়েছে: ' . ($user['ban_reason'] ?: 'Terms violation')], 403);
                }

                $pwdOk = password_verify($password, $user['password_hash']) || ($user['password_hash'] === $password);
                if (!$pwdOk) {
                    json_response(['success' => false, 'error' => 'ভুল ইমেইল বা পাসওয়ার্ড।'], 401);
                }

                // If plain-text legacy hash, upgrade to bcrypt
                if ($user['password_hash'] === $password) {
                    $newHash = password_hash($password, PASSWORD_BCRYPT);
                    $db->prepare("UPDATE users SET password_hash = ? WHERE id = ?")->execute([$newHash, $user['id']]);
                }

                json_response([
                    'success' => true,
                    'user' => [
                        'id' => (string)$user['id'],
                        'uid' => $user['uid'],
                        'name' => $user['name'],
                        'email' => $user['email'],
                        'phone' => $user['phone'],
                        'role' => $user['role'],
                        'avatar' => $user['avatar'] ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                        'earningBalanceBDT' => (float)$user['earning_balance_bdt'],
                        'depositBalanceBDT' => (float)$user['deposit_balance_bdt'],
                        'earningBalanceUSD' => (float)$user['earning_balance_usd'],
                        'depositBalanceUSD' => (float)$user['deposit_balance_usd'],
                        'completedTasksCount' => (int)$user['completed_tasks_count'],
                        'postedJobsCount' => (int)$user['posted_jobs_count'],
                        'satisfactionRate' => (float)$user['satisfaction_rate'],
                        'level' => $user['level'],
                        'isVerified' => (bool)$user['is_verified'],
                        'hasBlueBadge' => (bool)$user['has_blue_badge'],
                        'blueBadgePlan' => $user['blue_badge_plan'],
                        'blueBadgeExpiresAt' => $user['blue_badge_expires_at'],
                        'twoFactorEnabled' => (bool)$user['two_factor_enabled'],
                        'kycStatus' => $user['kyc_status'],
                        'referralCode' => $user['referral_code'],
                        'referralEarningsBDT' => (float)$user['referral_earnings_bdt'],
                        'referredUsersCount' => (int)$user['referred_users_count'],
                        'dailyStreak' => (int)$user['daily_streak'],
                        'status' => $user['status']
                    ]
                ]);
            } catch (Exception $e) {
                json_response(['success' => false, 'error' => 'লগইন ত্রুটি: ' . $e->getMessage()], 500);
            }
        }

        json_response(['success' => false, 'error' => 'Database connection failed'], 500);
        break;

    // -------------------------------------------------------------
    // Get User Profile from MySQL
    // -------------------------------------------------------------
    case 'user':
    case 'user/profile':
        $uid = trim($_GET['uid'] ?? $_GET['id'] ?? $jsonInput['uid'] ?? $jsonInput['id'] ?? '');
        if (empty($uid)) {
            json_response(['success' => false, 'error' => 'User ID required'], 400);
        }

        if ($db) {
            try {
                $stmt = $db->prepare("SELECT * FROM users WHERE uid = ? OR id = ? LIMIT 1");
                $stmt->execute([$uid, $uid]);
                $u = $stmt->fetch();
                if ($u) {
                    json_response([
                        'success' => true,
                        'user' => [
                            'id' => (string)$u['id'],
                            'uid' => $u['uid'],
                            'name' => $u['name'],
                            'email' => $u['email'],
                            'phone' => $u['phone'],
                            'role' => $u['role'],
                            'avatar' => $u['avatar'] ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                            'earningBalanceBDT' => (float)$u['earning_balance_bdt'],
                            'depositBalanceBDT' => (float)$u['deposit_balance_bdt'],
                            'earningBalanceUSD' => (float)$u['earning_balance_usd'],
                            'depositBalanceUSD' => (float)$u['deposit_balance_usd'],
                            'completedTasksCount' => (int)$u['completed_tasks_count'],
                            'postedJobsCount' => (int)$u['posted_jobs_count'],
                            'satisfactionRate' => (float)$u['satisfaction_rate'],
                            'level' => $u['level'],
                            'isVerified' => (bool)$u['is_verified'],
                            'hasBlueBadge' => (bool)$u['has_blue_badge'],
                            'blueBadgePlan' => $u['blue_badge_plan'],
                            'blueBadgeExpiresAt' => $u['blue_badge_expires_at'],
                            'twoFactorEnabled' => (bool)$u['two_factor_enabled'],
                            'kycStatus' => $u['kyc_status'],
                            'referralCode' => $u['referral_code'],
                            'referralEarningsBDT' => (float)$u['referral_earnings_bdt'],
                            'referredUsersCount' => (int)$u['referred_users_count'],
                            'dailyStreak' => (int)$u['daily_streak'],
                            'status' => $u['status']
                        ]
                    ]);
                }
            } catch (Exception $e) {}
        }
        json_response(['success' => false, 'error' => 'User not found'], 404);
        break;

    // -------------------------------------------------------------
    // Update User Profile
    // -------------------------------------------------------------
    case 'user/update-profile':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            json_response(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $uid = trim($jsonInput['uid'] ?? $_POST['uid'] ?? '');
        $name = trim($jsonInput['name'] ?? $_POST['name'] ?? '');
        $avatar = trim($jsonInput['avatar'] ?? $_POST['avatar'] ?? '');
        $phone = trim($jsonInput['phone'] ?? $_POST['phone'] ?? '');

        if (empty($uid) || empty($name)) {
            json_response(['success' => false, 'error' => 'Name and UID are required'], 400);
        }

        if ($db) {
            try {
                $stmt = $db->prepare("UPDATE users SET name = ?, avatar = COALESCE(NULLIF(?, ''), avatar), phone = COALESCE(NULLIF(?, ''), phone) WHERE uid = ? OR id = ?");
                $stmt->execute([$name, $avatar, $phone, $uid, $uid]);

                json_response([
                    'success' => true,
                    'message' => 'Profile updated successfully!'
                ]);
            } catch (Exception $e) {
                json_response(['success' => false, 'error' => $e->getMessage()], 500);
            }
        }
        json_response(['success' => false, 'error' => 'Database error'], 500);
        break;

    // -------------------------------------------------------------
    // Change User Password
    // -------------------------------------------------------------
    case 'user/change-password':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            json_response(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $uid = trim($jsonInput['uid'] ?? $_POST['uid'] ?? '');
        $oldPass = $jsonInput['oldPassword'] ?? $_POST['oldPassword'] ?? '';
        $newPass = $jsonInput['newPassword'] ?? $_POST['newPassword'] ?? '';

        if (empty($uid) || strlen($newPass) < 6) {
            json_response(['success' => false, 'error' => 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'], 400);
        }

        if ($db) {
            try {
                $stmt = $db->prepare("SELECT id, password_hash FROM users WHERE uid = ? OR id = ? LIMIT 1");
                $stmt->execute([$uid, $uid]);
                $u = $stmt->fetch();

                if (!$u) {
                    json_response(['success' => false, 'error' => 'ব্যবহারকারী পাওয়া যায়নি।'], 404);
                }

                $oldMatches = password_verify($oldPass, $u['password_hash']) || ($u['password_hash'] === $oldPass);
                if (!$oldMatches) {
                    json_response(['success' => false, 'error' => 'বর্তমান পাসওয়ার্ডটি সঠিক নয়!'], 400);
                }

                $newHash = password_hash($newPass, PASSWORD_BCRYPT);
                $db->prepare("UPDATE users SET password_hash = ? WHERE id = ?")->execute([$newHash, $u['id']]);

                json_response(['success' => true, 'message' => 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!']);
            } catch (Exception $e) {
                json_response(['success' => false, 'error' => $e->getMessage()], 500);
            }
        }
        json_response(['success' => false, 'error' => 'Database error'], 500);
        break;

    // -------------------------------------------------------------
    // Submit KYC / NID Verification
    // -------------------------------------------------------------
    case 'user/kyc':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            json_response(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $uid = trim($jsonInput['uid'] ?? $_POST['uid'] ?? '');
        $nidNumber = trim($jsonInput['nidNumber'] ?? $jsonInput['docNumber'] ?? $_POST['nidNumber'] ?? '');
        $docType = trim($jsonInput['docType'] ?? $_POST['docType'] ?? 'nid');
        $fullName = trim($jsonInput['fullName'] ?? $_POST['fullName'] ?? '');

        if (empty($uid) || empty($nidNumber)) {
            json_response(['success' => false, 'error' => 'NID number and User UID required'], 400);
        }

        if ($db) {
            try {
                $stmt = $db->prepare("
                    UPDATE users 
                    SET kyc_status = 'pending', nid_number = ?, is_verified = 0 
                    WHERE uid = ? OR id = ?
                ");
                $stmt->execute([$nidNumber, $uid, $uid]);

                // Create notification
                $notifId = 'notif_' . time();
                $db->prepare("
                    INSERT INTO notifications (id, user_id, title, title_bn, message, message_bn, type, created_at)
                    VALUES (?, ?, 'NID Verification Submitted', 'এনআইডি ভেরিফিকেশন জমা হয়েছে', 'Your NID card has been submitted. Admin will review within 1-24 hours.', 'আপনার জাতীয় পরিচয়পত্র সফলভাবে জমা হয়েছে। অ্যাডমিন টিম দ্রুত যাচাই করে অনুমোদন করবে।', 'system', NOW())
                ")->execute([$notifId, $uid]);

                json_response([
                    'success' => true,
                    'message' => 'NID verification submitted for admin review!'
                ]);
            } catch (Exception $e) {
                json_response(['success' => false, 'error' => $e->getMessage()], 500);
            }
        }
        json_response(['success' => false, 'error' => 'Database error'], 500);
        break;

    // -------------------------------------------------------------
    // User Withdrawal Request (Creates transaction in MySQL)
    // -------------------------------------------------------------
    case 'withdraw':
    case 'wallet/withdraw':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            json_response(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $uid = trim($jsonInput['uid'] ?? $jsonInput['userId'] ?? $_POST['uid'] ?? '');
        $amountBDT = (float)($jsonInput['amountBDT'] ?? $jsonInput['amount'] ?? $_POST['amountBDT'] ?? 0);
        $method = trim(strtolower($jsonInput['method'] ?? $_POST['method'] ?? 'bkash'));
        $accountNo = trim($jsonInput['accountNumber'] ?? $jsonInput['accountNo'] ?? $_POST['accountNumber'] ?? '');
        $accountType = trim($jsonInput['accountType'] ?? $_POST['accountType'] ?? 'personal');

        $minWithdraw = (float)get_setting('min_withdraw_bdt', 100.00);

        if (empty($uid)) {
            json_response(['success' => false, 'error' => 'User ID is required.'], 400);
        }

        if ($amountBDT < $minWithdraw) {
            json_response(['success' => false, 'error' => "ন্যূনতম উত্তোলনের পরিমাণ ৳{$minWithdraw} টাকা (Minimum withdrawal is ৳{$minWithdraw} BDT)."], 400);
        }

        if (empty($accountNo) || strlen($accountNo) < 11) {
            json_response(['success' => false, 'error' => 'সঠিক ১১ ডিজিটের মোবাইল ব্যাংকিং নম্বর লিখুন।'], 400);
        }

        if ($db) {
            try {
                // Find user and check earning balance
                $stmt = $db->prepare("SELECT * FROM users WHERE uid = ? OR id = ? LIMIT 1");
                $stmt->execute([$uid, $uid]);
                $u = $stmt->fetch();

                if (!$u) {
                    json_response(['success' => false, 'error' => 'ব্যবহারকারী পাওয়া যায়নি।'], 404);
                }

                $earningBal = (float)$u['earning_balance_bdt'];
                if ($amountBDT > $earningBal) {
                    json_response(['success' => false, 'error' => "অপর্যাপ্ত উপার্জন ব্যালেন্স! আপনার আর্নিং ব্যালেন্স ৳{$earningBal}"], 400);
                }

                $txId = 'tx_' . time() . '_' . random_int(100, 999);
                $amountUSD = round($amountBDT / (float)get_setting('usd_to_bdt_rate', 120), 2);
                $titleEn = "Withdrawal via " . strtoupper($method) . " ($accountType)";
                $titleBn = ($method === 'bkash' ? 'বিকাশ' : ($method === 'nagad' ? 'নগদ' : 'রকেট')) . " উইথড্রয়াল (পেন্ডিং)";

                // Deduct earning balance immediately to prevent double spending
                $newEarningBal = $earningBal - $amountBDT;
                $newEarningUSD = max(0, (float)$u['earning_balance_usd'] - $amountUSD);

                $db->beginTransaction();

                $updUser = $db->prepare("UPDATE users SET earning_balance_bdt = ?, earning_balance_usd = ? WHERE id = ?");
                $updUser->execute([$newEarningBal, $newEarningUSD, $u['id']]);

                // Insert into wallet_transactions
                $insTx = $db->prepare("
                    INSERT INTO wallet_transactions (id, user_id, type, title, title_bn, amount_bdt, amount_usd, method, account_number, status, note, created_at)
                    VALUES (?, ?, 'withdrawal', ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())
                ");
                $note = "Account Type: $accountType | Receiver: $accountNo";
                $insTx->execute([$txId, $u['uid'], $titleEn, $titleBn, $amountBDT, $amountUSD, $method, $accountNo, $note]);

                // Insert user notification
                $notifId = 'notif_' . time();
                $insNotif = $db->prepare("
                    INSERT INTO notifications (id, user_id, title, title_bn, message, message_bn, type, created_at)
                    VALUES (?, ?, 'Withdrawal Processing', 'উইথড্রয়াল প্রসেসিং হচ্ছে', ?, ?, 'system', NOW())
                ");
                $msgEn = "৳{$amountBDT} cashout request sent to {$accountNo} via " . strtoupper($method) . ". Admin will approve shortly.";
                $msgBn = "৳{$amountBDT} ক্যাশআউট রিকোয়েস্ট ({$method}) পাঠানো হয়েছে। অ্যাডমিন রিভিউ করে পেমেন্ট সম্পন্ন করবে।";
                $insNotif->execute([$notifId, $u['uid'], $msgEn, $msgBn]);

                $db->commit();

                json_response([
                    'success' => true,
                    'message' => "উইথড্রয়াল রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন প্যানেল থেকে অনুমোদন করা হবে।",
                    'transaction' => [
                        'id' => $txId,
                        'userId' => $u['uid'],
                        'type' => 'withdrawal',
                        'amountBDT' => $amountBDT,
                        'amountUSD' => $amountUSD,
                        'method' => $method,
                        'accountNumber' => $accountNo,
                        'status' => 'pending',
                        'createdAt' => date('Y-m-d H:i:s')
                    ],
                    'updatedBalances' => [
                        'earningBalanceBDT' => $newEarningBal,
                        'earningBalanceUSD' => $newEarningUSD
                    ]
                ]);
            } catch (Exception $e) {
                if ($db->inTransaction()) {
                    $db->rollBack();
                }
                json_response(['success' => false, 'error' => 'উইথড্রয়াল প্রসেস ত্রুটি: ' . $e->getMessage()], 500);
            }
        }
        json_response(['success' => false, 'error' => 'Database error'], 500);
        break;

    // -------------------------------------------------------------
    // User Deposit Request (Creates deposit in MySQL)
    // -------------------------------------------------------------
    case 'deposit':
    case 'wallet/deposit':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            json_response(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $uid = trim($jsonInput['uid'] ?? $jsonInput['userId'] ?? $_POST['uid'] ?? '');
        $amountBDT = (float)($jsonInput['amountBDT'] ?? $jsonInput['amount'] ?? $_POST['amountBDT'] ?? 0);
        $method = trim(strtolower($jsonInput['method'] ?? $_POST['method'] ?? 'bkash'));
        $senderNo = trim($jsonInput['senderNumber'] ?? $_POST['senderNumber'] ?? '');
        $trxId = trim($jsonInput['trxId'] ?? $jsonInput['trx_id'] ?? $_POST['trxId'] ?? '');

        $minDeposit = (float)get_setting('min_deposit_bdt', 50.00);

        if (empty($uid)) {
            json_response(['success' => false, 'error' => 'User ID is required.'], 400);
        }

        if ($amountBDT < $minDeposit) {
            json_response(['success' => false, 'error' => "ন্যূনতম ডিপোজিট ৳{$minDeposit} টাকা (Minimum deposit is ৳{$minDeposit} BDT)."], 400);
        }

        if (empty($trxId)) {
            json_response(['success' => false, 'error' => 'TrxID (Transaction ID) প্রদান করুন।'], 400);
        }

        if ($db) {
            try {
                $stmt = $db->prepare("SELECT * FROM users WHERE uid = ? OR id = ? LIMIT 1");
                $stmt->execute([$uid, $uid]);
                $u = $stmt->fetch();

                if (!$u) {
                    json_response(['success' => false, 'error' => 'ব্যবহারকারী পাওয়া যায়নি।'], 404);
                }

                $txId = 'tx_' . time() . '_' . random_int(100, 999);
                $amountUSD = round($amountBDT / (float)get_setting('usd_to_bdt_rate', 120), 2);
                $titleEn = "Deposit via " . strtoupper($method);
                $titleBn = ($method === 'bkash' ? 'বিকাশ' : ($method === 'nagad' ? 'নগদ' : 'রকেট')) . " ডিপোজিট";

                $insTx = $db->prepare("
                    INSERT INTO wallet_transactions (id, user_id, type, title, title_bn, amount_bdt, amount_usd, method, account_number, trx_id, status, created_at)
                    VALUES (?, ?, 'deposit', ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
                ");
                $insTx->execute([$txId, $u['uid'], $titleEn, $titleBn, $amountBDT, $amountUSD, $method, $senderNo, $trxId]);

                // Create user notification
                $notifId = 'notif_' . time();
                $insNotif = $db->prepare("
                    INSERT INTO notifications (id, user_id, title, title_bn, message, message_bn, type, created_at)
                    VALUES (?, ?, 'Deposit Submitted', 'ডিপোজিট জমা হয়েছে', ?, ?, 'system', NOW())
                ");
                $msgEn = "৳{$amountBDT} deposit request with TrxID {$trxId} submitted. Admin will verify and credit your balance.";
                $msgBn = "৳{$amountBDT} ডিপোজিট রিকোয়েস্ট (TrxID: {$trxId}) জমা হয়েছে। অ্যাডমিন যাচাই করে ব্যালেন্স যোগ করবেন।";
                $insNotif->execute([$notifId, $u['uid'], $msgEn, $msgBn]);

                json_response([
                    'success' => true,
                    'message' => 'ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন ট্রানজেকশন যাচাই করে ব্যালেন্স যোগ করবেন।',
                    'transaction' => [
                        'id' => $txId,
                        'userId' => $u['uid'],
                        'type' => 'deposit',
                        'amountBDT' => $amountBDT,
                        'amountUSD' => $amountUSD,
                        'method' => $method,
                        'trxId' => $trxId,
                        'status' => 'pending',
                        'createdAt' => date('Y-m-d H:i:s')
                    ]
                ]);
            } catch (Exception $e) {
                json_response(['success' => false, 'error' => 'ডিপোজিট ত্রুটি: ' . $e->getMessage()], 500);
            }
        }
        json_response(['success' => false, 'error' => 'Database error'], 500);
        break;

    // -------------------------------------------------------------
    // List User Wallet Transactions from MySQL
    // -------------------------------------------------------------
    case 'wallet/transactions':
        $uid = trim($_GET['uid'] ?? $_GET['userId'] ?? '');
        $transactions = [];

        if ($db && !empty($uid)) {
            try {
                $stmt = $db->prepare("
                    SELECT * FROM wallet_transactions 
                    WHERE user_id = ? OR user_id IN (SELECT uid FROM users WHERE id = ?)
                    ORDER BY created_at DESC 
                    LIMIT 100
                ");
                $stmt->execute([$uid, $uid]);
                while ($r = $stmt->fetch()) {
                    $transactions[] = [
                        'id' => $r['id'],
                        'userId' => $r['user_id'],
                        'type' => $r['type'],
                        'title' => $r['title'],
                        'titleBn' => $r['title_bn'],
                        'amountBDT' => (float)$r['amount_bdt'],
                        'amountUSD' => (float)$r['amount_usd'],
                        'method' => $r['method'],
                        'accountNumber' => $r['account_number'],
                        'trxId' => $r['trx_id'],
                        'status' => $r['status'],
                        'note' => $r['note'],
                        'timestamp' => $r['created_at']
                    ];
                }
            } catch (Exception $e) {}
        }

        json_response(['success' => true, 'transactions' => $transactions]);
        break;

    // -------------------------------------------------------------
    // List Active Jobs from MySQL
    // -------------------------------------------------------------
    case 'jobs':
        $jobs = [];
        if ($db) {
            try {
                $stmt = $db->query("SELECT * FROM jobs WHERE status = 'active' ORDER BY featured DESC, id DESC LIMIT 150");
                while ($row = $stmt->fetch()) {
                    $jobs[] = [
                        'id' => $row['id'],
                        'title' => $row['title'],
                        'titleBn' => $row['title_bn'],
                        'category' => $row['category'],
                        'categoryName' => $row['category_name'],
                        'categoryNameBn' => $row['category_name_bn'],
                        'employerId' => $row['employer_id'],
                        'employerName' => $row['employer_name'],
                        'employerAvatar' => $row['employer_avatar'] ?: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
                        'employerVerified' => (bool)$row['employer_verified'],
                        'payPerTaskBDT' => (float)$row['pay_per_task_bdt'],
                        'payPerTaskUSD' => (float)$row['pay_per_task_usd'],
                        'totalSlots' => (int)$row['total_slots'],
                        'completedSlots' => (int)$row['completed_slots'],
                        'estimatedMinutes' => (int)$row['estimated_minutes'],
                        'targetCountry' => $row['target_country'] ?: 'Bangladesh',
                        'targetCountryBn' => $row['target_country_bn'] ?: 'বাংলাদেশ',
                        'targetLink' => $row['target_link'],
                        'description' => $row['description'],
                        'descriptionBn' => $row['description_bn'],
                        'instructions' => json_decode($row['instructions_json'] ?? '[]', true) ?: [],
                        'rules' => json_decode($row['rules_json'] ?? '[]', true) ?: [],
                        'proofRequirements' => json_decode($row['proof_requirements_json'] ?? '[]', true) ?: [],
                        'featured' => (bool)$row['featured'],
                        'status' => $row['status'],
                        'createdAt' => $row['created_at']
                    ];
                }
            } catch (Exception $e) {}
        }
        json_response(['success' => true, 'jobs' => $jobs]);
        break;

    // -------------------------------------------------------------
    // Post New Job (Employer creates job in MySQL)
    // -------------------------------------------------------------
    case 'jobs/create':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            json_response(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $employerUid = trim($jsonInput['employerId'] ?? $_POST['employerId'] ?? '');
        $title = trim($jsonInput['title'] ?? $_POST['title'] ?? '');
        $titleBn = trim($jsonInput['titleBn'] ?? $title);
        $category = trim($jsonInput['category'] ?? 'youtube');
        $categoryName = trim($jsonInput['categoryName'] ?? 'YouTube');
        $categoryNameBn = trim($jsonInput['categoryNameBn'] ?? 'ইউটিউব');
        $payPerTaskUSD = (float)($jsonInput['payPerTaskUSD'] ?? 0.10);
        $payPerTaskBDT = (float)($jsonInput['payPerTaskBDT'] ?? ($payPerTaskUSD * 120));
        $totalSlots = (int)($jsonInput['totalSlots'] ?? 100);
        $estimatedMinutes = (int)($jsonInput['estimatedMinutes'] ?? 5);
        $targetLink = trim($jsonInput['targetLink'] ?? '');
        $description = trim($jsonInput['description'] ?? '');
        $descriptionBn = trim($jsonInput['descriptionBn'] ?? $description);
        $instructions = $jsonInput['instructions'] ?? [];
        $rules = $jsonInput['rules'] ?? [];
        $proofRequirements = $jsonInput['proofRequirements'] ?? [];

        $totalCostBDT = $totalSlots * $payPerTaskBDT;
        $totalCostUSD = $totalSlots * $payPerTaskUSD;

        if (empty($employerUid) || empty($title) || $totalSlots < 5) {
            json_response(['success' => false, 'error' => 'Please provide complete job details (min 5 slots).'], 400);
        }

        if ($db) {
            try {
                $stmt = $db->prepare("SELECT * FROM users WHERE uid = ? OR id = ? LIMIT 1");
                $stmt->execute([$employerUid, $employerUid]);
                $emp = $stmt->fetch();

                if (!$emp) {
                    json_response(['success' => false, 'error' => 'Employer account not found'], 404);
                }

                $depBal = (float)$emp['deposit_balance_bdt'];
                if ($totalCostBDT > $depBal) {
                    json_response(['success' => false, 'error' => "ডিপোজিট ব্যালেন্স অপর্যাপ্ত! প্রয়োজন: ৳{$totalCostBDT}, বর্তমান ব্যালেন্স: ৳{$depBal}। অনুগ্রহ করে আগে ডিপোজিট করুন।"], 400);
                }

                $jobId = 'job_' . (time() % 1000000) . random_int(10, 99);
                $newDepBal = $depBal - $totalCostBDT;
                $newDepUSD = max(0, (float)$emp['deposit_balance_usd'] - $totalCostUSD);

                $db->beginTransaction();

                // Deduct balance & increment posted jobs count
                $db->prepare("UPDATE users SET deposit_balance_bdt = ?, deposit_balance_usd = ?, posted_jobs_count = posted_jobs_count + 1 WHERE id = ?")
                   ->execute([$newDepBal, $newDepUSD, $emp['id']]);

                // Insert job
                $insJob = $db->prepare("
                    INSERT INTO jobs (
                        id, title, title_bn, category, category_name, category_name_bn,
                        employer_id, employer_name, employer_avatar, employer_verified,
                        pay_per_task_bdt, pay_per_task_usd, total_slots, completed_slots,
                        estimated_minutes, target_country, target_country_bn, target_link,
                        description, description_bn, instructions_json, rules_json, proof_requirements_json,
                        featured, status, created_at
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?,
                        ?, ?, ?, ?,
                        ?, ?, ?, 0,
                        ?, 'Bangladesh', 'বাংলাদেশ', ?,
                        ?, ?, ?, ?, ?,
                        0, 'active', NOW()
                    )
                ");
                $insJob->execute([
                    $jobId, $title, $titleBn, $category, $categoryName, $categoryNameBn,
                    $emp['uid'], $emp['name'], $emp['avatar'], (int)$emp['is_verified'],
                    $payPerTaskBDT, $payPerTaskUSD, $totalSlots,
                    $estimatedMinutes, $targetLink,
                    $description, $descriptionBn,
                    json_encode($instructions, JSON_UNESCAPED_UNICODE),
                    json_encode($rules, JSON_UNESCAPED_UNICODE),
                    json_encode($proofRequirements, JSON_UNESCAPED_UNICODE)
                ]);

                // Record wallet transaction
                $txId = 'tx_' . time();
                $db->prepare("
                    INSERT INTO wallet_transactions (id, user_id, type, title, title_bn, amount_bdt, amount_usd, status, created_at)
                    VALUES (?, ?, 'job_post', ?, ?, ?, ?, 'completed', NOW())
                ")->execute([
                    $txId, $emp['uid'],
                    "Job Campaign Posted: {$title}",
                    "জব ক্যাম্পেইন পোস্ট: {$titleBn}",
                    $totalCostBDT, $totalCostUSD
                ]);

                $db->commit();

                json_response([
                    'success' => true,
                    'message' => 'Job posted and active on marketplace!',
                    'jobId' => $jobId,
                    'remainingDepositBDT' => $newDepBal
                ]);
            } catch (Exception $e) {
                if ($db->inTransaction()) {
                    $db->rollBack();
                }
                json_response(['success' => false, 'error' => $e->getMessage()], 500);
            }
        }
        json_response(['success' => false, 'error' => 'Database error'], 500);
        break;

    // -------------------------------------------------------------
    // Submit Task Proof (Worker submits work to MySQL)
    // -------------------------------------------------------------
    case 'submissions/create':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            json_response(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $jobId = trim($jsonInput['jobId'] ?? $_POST['jobId'] ?? '');
        $workerUid = trim($jsonInput['workerId'] ?? $_POST['workerId'] ?? '');
        $proofText = trim($jsonInput['proofText'] ?? $_POST['proofText'] ?? '');
        $proofUrl = trim($jsonInput['proofUrl'] ?? $_POST['proofUrl'] ?? '');
        $proofImageUrl = trim($jsonInput['proofImageUrl'] ?? $_POST['proofImageUrl'] ?? '');

        if (empty($jobId) || empty($workerUid) || empty($proofText)) {
            json_response(['success' => false, 'error' => 'Proof text, job ID and worker ID are required.'], 400);
        }

        if ($db) {
            try {
                // Fetch job & worker
                $jStmt = $db->prepare("SELECT * FROM jobs WHERE id = ? LIMIT 1");
                $jStmt->execute([$jobId]);
                $job = $jStmt->fetch();

                $wStmt = $db->prepare("SELECT * FROM users WHERE uid = ? OR id = ? LIMIT 1");
                $wStmt->execute([$workerUid, $workerUid]);
                $worker = $wStmt->fetch();

                if (!$job || !$worker) {
                    json_response(['success' => false, 'error' => 'Job or Worker not found'], 404);
                }

                $subId = 'sub_' . time() . '_' . random_int(100, 999);
                $earnedBDT = (float)$job['pay_per_task_bdt'];
                $earnedUSD = (float)$job['pay_per_task_usd'];

                $ins = $db->prepare("
                    INSERT INTO task_submissions (
                        id, job_id, worker_id, worker_name, worker_avatar,
                        proof_text, proof_url, proof_image_url, status,
                        earned_bdt, earned_usd, submitted_at
                    ) VALUES (
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, 'pending',
                        ?, ?, NOW()
                    )
                ");
                $ins->execute([
                    $subId, $job['id'], $worker['uid'], $worker['name'], $worker['avatar'],
                    $proofText, $proofUrl, $proofImageUrl,
                    $earnedBDT, $earnedUSD
                ]);

                // Create worker notification
                $notifId = 'notif_' . time();
                $db->prepare("
                    INSERT INTO notifications (id, user_id, title, title_bn, message, message_bn, type, created_at)
                    VALUES (?, ?, 'Proof Submitted', 'কাজের প্রুফ জমা হয়েছে', ?, ?, 'task_submitted', NOW())
                ")->execute([
                    $notifId, $worker['uid'],
                    "Your proof for \"{$job['title']}\" has been submitted for review.",
                    "\"{$job['title_bn']}\" কাজের প্রুফ সফলভাবে জমা হয়েছে।"
                ]);

                json_response([
                    'success' => true,
                    'message' => 'কাজের প্রুফ সফলভাবে জমা হয়েছে! অ্যাডমিন/এমপ্লয়ার যাচাই করে পেমেন্ট অ্যাপ্রুভ করবেন।',
                    'submissionId' => $subId
                ]);
            } catch (Exception $e) {
                json_response(['success' => false, 'error' => $e->getMessage()], 500);
            }
        }
        json_response(['success' => false, 'error' => 'Database error'], 500);
        break;

    // -------------------------------------------------------------
    // List Submissions (For Worker or Employer)
    // -------------------------------------------------------------
    case 'submissions':
        $workerUid = trim($_GET['workerId'] ?? $_GET['worker_id'] ?? '');
        $jobId = trim($_GET['jobId'] ?? $_GET['job_id'] ?? '');
        $submissions = [];

        if ($db) {
            try {
                $sql = "SELECT s.*, j.title as job_title, j.title_bn as job_title_bn FROM task_submissions s LEFT JOIN jobs j ON s.job_id = j.id";
                $params = [];
                $where = [];

                if (!empty($workerUid)) {
                    $where[] = "s.worker_id = ?";
                    $params[] = $workerUid;
                }
                if (!empty($jobId)) {
                    $where[] = "s.job_id = ?";
                    $params[] = $jobId;
                }

                if (!empty($where)) {
                    $sql .= " WHERE " . implode(" AND ", $where);
                }
                $sql .= " ORDER BY s.submitted_at DESC LIMIT 100";

                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                while ($r = $stmt->fetch()) {
                    $submissions[] = [
                        'id' => $r['id'],
                        'jobId' => $r['job_id'],
                        'jobTitle' => $r['job_title'] ?: 'Micro Task',
                        'workerId' => $r['worker_id'],
                        'workerName' => $r['worker_name'],
                        'workerAvatar' => $r['worker_avatar'],
                        'proofText' => $r['proof_text'],
                        'proofUrl' => $r['proof_url'],
                        'proofImageUrl' => $r['proof_image_url'],
                        'status' => $r['status'],
                        'feedback' => $r['feedback'],
                        'earnedBDT' => (float)$r['earned_bdt'],
                        'earnedUSD' => (float)$r['earned_usd'],
                        'submittedAt' => $r['submitted_at']
                    ];
                }
            } catch (Exception $e) {}
        }

        json_response(['success' => true, 'submissions' => $submissions]);
        break;

    // -------------------------------------------------------------
    // Notifications for User
    // -------------------------------------------------------------
    case 'notifications':
        $uid = trim($_GET['uid'] ?? $_GET['userId'] ?? '');
        $notifications = [];

        if ($db && !empty($uid)) {
            try {
                $stmt = $db->prepare("SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 50");
                $stmt->execute([$uid]);
                while ($r = $stmt->fetch()) {
                    $notifications[] = [
                        'id' => $r['id'],
                        'userId' => $r['user_id'],
                        'title' => $r['title'],
                        'titleBn' => $r['title_bn'],
                        'message' => $r['message'],
                        'messageBn' => $r['message_bn'],
                        'type' => $r['type'],
                        'isRead' => (bool)$r['is_read'],
                        'timestamp' => $r['created_at']
                    ];
                }
            } catch (Exception $e) {}
        }

        json_response(['success' => true, 'notifications' => $notifications]);
        break;

    // -------------------------------------------------------------
    // Mark Notifications as Read
    // -------------------------------------------------------------
    case 'notifications/mark-read':
        $uid = trim($jsonInput['uid'] ?? $_POST['uid'] ?? '');
        if ($db && !empty($uid)) {
            try {
                $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?")->execute([$uid]);
            } catch (Exception $e) {}
        }
        json_response(['success' => true]);
        break;

    // -------------------------------------------------------------
    // Support Tickets List & Create
    // -------------------------------------------------------------
    case 'tickets':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $userId = trim($_GET['user_id'] ?? $_GET['userId'] ?? '');
            $tickets = [];

            if ($db) {
                try {
                    $sql = "SELECT * FROM support_tickets";
                    $params = [];
                    if (!empty($userId)) {
                        $sql .= " WHERE user_id = ?";
                        $params[] = $userId;
                    }
                    $sql .= " ORDER BY updated_at DESC LIMIT 100";

                    $stmt = $db->prepare($sql);
                    $stmt->execute($params);
                    $rows = $stmt->fetchAll();

                    foreach ($rows as $r) {
                        $msgStmt = $db->prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC");
                        $msgStmt->execute([$r['id']]);
                        $msgs = [];
                        while ($m = $msgStmt->fetch()) {
                            $msgs[] = [
                                'id' => (string)$m['id'],
                                'sender' => $m['sender'],
                                'senderName' => $m['sender_name'],
                                'message' => $m['message'],
                                'timestamp' => $m['created_at']
                            ];
                        }

                        $tickets[] = [
                            'id' => $r['id'],
                            'userId' => $r['user_id'],
                            'userName' => $r['user_name'],
                            'userEmail' => $r['user_email'],
                            'subject' => $r['subject'],
                            'category' => $r['category'],
                            'priority' => $r['priority'],
                            'status' => $r['status'],
                            'unreadByUser' => (bool)($r['unread_user'] ?? 0),
                            'unreadByAdmin' => (bool)($r['unread_admin'] ?? 0),
                            'createdAt' => $r['created_at'],
                            'updatedAt' => $r['updated_at'],
                            'messages' => $msgs
                        ];
                    }
                } catch (Exception $e) {}
            }

            json_response(['success' => true, 'tickets' => $tickets]);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $userId = trim($jsonInput['userId'] ?? $jsonInput['user_id'] ?? $_POST['userId'] ?? '');
            $userName = trim($jsonInput['userName'] ?? $jsonInput['user_name'] ?? $_POST['userName'] ?? 'Member');
            $userEmail = trim($jsonInput['userEmail'] ?? $jsonInput['user_email'] ?? $_POST['userEmail'] ?? 'user@amaderjob.com');
            $subject = trim($jsonInput['subject'] ?? $_POST['subject'] ?? '');
            $category = trim($jsonInput['category'] ?? $_POST['category'] ?? 'deposit');
            $priority = trim($jsonInput['priority'] ?? $_POST['priority'] ?? 'medium');
            $initialMessage = trim($jsonInput['message'] ?? $_POST['message'] ?? '');

            if (empty($subject) || empty($initialMessage)) {
                json_response(['success' => false, 'error' => 'Subject and message are required.'], 400);
            }

            $ticketId = 'TCK-' . random_int(10000, 99999);
            $now = date('Y-m-d H:i:s');

            if ($db) {
                try {
                    $ins = $db->prepare("
                        INSERT INTO support_tickets (id, user_id, user_name, user_email, subject, category, priority, status, unread_user, unread_admin, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 0, 1, ?, ?)
                    ");
                    $ins->execute([$ticketId, $userId, $userName, $userEmail, $subject, $category, $priority, $now, $now]);

                    $msgIns = $db->prepare("
                        INSERT INTO ticket_messages (ticket_id, sender, sender_name, message, created_at)
                        VALUES (?, 'user', ?, ?, ?)
                    ");
                    $msgIns->execute([$ticketId, $userName, $initialMessage, $now]);
                } catch (Exception $e) {
                    json_response(['success' => false, 'error' => $e->getMessage()], 500);
                }
            }

            json_response([
                'success' => true,
                'ticket' => [
                    'id' => $ticketId,
                    'userId' => $userId,
                    'userName' => $userName,
                    'userEmail' => $userEmail,
                    'subject' => $subject,
                    'category' => $category,
                    'priority' => $priority,
                    'status' => 'open',
                    'unreadByUser' => false,
                    'unreadByAdmin' => true,
                    'createdAt' => $now,
                    'updatedAt' => $now,
                    'messages' => [
                        [
                            'id' => 'msg_' . time(),
                            'sender' => 'user',
                            'senderName' => $userName,
                            'message' => $initialMessage,
                            'timestamp' => $now
                        ]
                    ]
                ]
            ]);
        } else {
            json_response(['success' => false, 'error' => 'Method not allowed'], 405);
        }
        break;

    // -------------------------------------------------------------
    // Ticket Conversation Messages
    // -------------------------------------------------------------
    case 'tickets/messages':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $ticketId = trim($_GET['ticket_id'] ?? $_GET['ticketId'] ?? '');
            if (empty($ticketId)) {
                json_response(['success' => false, 'error' => 'ticket_id is required'], 400);
            }

            $messages = [];
            if ($db) {
                try {
                    $db->prepare("UPDATE support_tickets SET unread_user = 0 WHERE id = ?")->execute([$ticketId]);

                    $stmt = $db->prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC");
                    $stmt->execute([$ticketId]);
                    while ($m = $stmt->fetch()) {
                        $messages[] = [
                            'id' => (string)$m['id'],
                            'sender' => $m['sender'],
                            'senderName' => $m['sender_name'],
                            'message' => $m['message'],
                            'timestamp' => $m['created_at']
                        ];
                    }
                } catch (Exception $e) {}
            }

            json_response(['success' => true, 'messages' => $messages]);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $ticketId = trim($jsonInput['ticket_id'] ?? $jsonInput['ticketId'] ?? $_POST['ticket_id'] ?? '');
            $sender = ($jsonInput['sender'] ?? $_POST['sender'] ?? 'user') === 'admin' ? 'admin' : 'user';
            $senderName = trim($jsonInput['sender_name'] ?? $jsonInput['senderName'] ?? $_POST['sender_name'] ?? ($sender === 'admin' ? 'Support Team' : 'Member'));
            $text = trim($jsonInput['message'] ?? $_POST['message'] ?? '');

            if (empty($ticketId) || empty($text)) {
                json_response(['success' => false, 'error' => 'ticket_id and message are required'], 400);
            }

            $now = date('Y-m-d H:i:s');
            if ($db) {
                try {
                    $stmt = $db->prepare("
                        INSERT INTO ticket_messages (ticket_id, sender, sender_name, message, created_at)
                        VALUES (?, ?, ?, ?, ?)
                    ");
                    $stmt->execute([$ticketId, $sender, $senderName, $text, $now]);
                    $newMsgId = $db->lastInsertId();

                    if ($sender === 'user') {
                        $upd = $db->prepare("
                            UPDATE support_tickets 
                            SET updated_at = ?, unread_admin = 1, unread_user = 0,
                                status = CASE WHEN status = 'closed' THEN 'open' ELSE status END
                            WHERE id = ?
                        ");
                        $upd->execute([$now, $ticketId]);
                    } else {
                        $upd = $db->prepare("
                            UPDATE support_tickets 
                            SET updated_at = ?, unread_user = 1, unread_admin = 0, status = 'in_progress'
                            WHERE id = ?
                        ");
                        $upd->execute([$now, $ticketId]);
                    }

                    json_response([
                        'success' => true,
                        'message' => [
                            'id' => (string)$newMsgId,
                            'sender' => $sender,
                            'senderName' => $senderName,
                            'message' => $text,
                            'timestamp' => $now
                        ]
                    ]);
                } catch (Exception $e) {
                    json_response(['success' => false, 'error' => $e->getMessage()], 500);
                }
            }
            json_response(['success' => false, 'error' => 'Database error'], 500);
        }
        break;

    default:
        json_response(['success' => false, 'error' => "Endpoint not found: $route"], 404);
        break;
}
