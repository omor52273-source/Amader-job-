<?php
/**
 * Amader Job Online - Production Admin Control Center
 * Secure, session-authenticated cPanel management dashboard
 * Single Source of Truth: MySQL (bahubal2_Amaderjob8383)
 */

require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/mail.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

$db = get_db();
$appUrl = get_base_app_url();

// Handle Logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    admin_logout();
    header("Location: " . app_url('admin/index.php?action=login'));
    exit;
}

// Handle Login Submission
$loginError = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['admin_login_submit'])) {
    if (!csrf_verify($_POST['csrf_token'] ?? '')) {
        $loginError = 'Security validation failed (CSRF). Please refresh and try again.';
    } else {
        $emailOrUser = trim($_POST['email_or_user'] ?? '');
        $password = $_POST['password'] ?? '';
        $res = admin_login($emailOrUser, $password);
        if ($res['success']) {
            header("Location: " . app_url('admin/index.php'));
            exit;
        } else {
            $loginError = $res['error'];
        }
    }
}

// Show Login Page if not authenticated
if (!is_admin_logged_in()) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Login - Amader Job Online</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
    </head>
    <body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 shadow-inner">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h1 class="text-2xl font-black tracking-tight text-white">Admin Control Center</h1>
          <p class="text-xs text-slate-400 mt-1">Amader Job Online &bull; Production Management</p>
        </div>

        <?php if (!empty($loginError)): ?>
          <div class="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <svg class="w-5 h-5 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span><?= sanitize_output($loginError) ?></span>
          </div>
        <?php endif; ?>

        <?php if (!$db): ?>
          <div class="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <strong>Notice:</strong> Database is not yet connected. Configure MySQL credentials in <code>.env</code> file.
          </div>
        <?php endif; ?>

        <form method="POST" action="<?= app_url('admin/index.php') ?>" class="space-y-5">
          <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Admin Email or Username</label>
            <input type="text" name="email_or_user" required placeholder="admin@amaderjob.com" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <input type="password" name="password" required placeholder="••••••••" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm">
          </div>

          <button type="submit" name="admin_login_submit" value="1" class="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm flex items-center justify-center gap-2">
            <span>Sign In to Admin Panel</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-800 text-center">
          <a href="<?= app_url() ?>" class="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>Back to Main Website</span>
          </a>
        </div>
      </div>
    </body>
    </html>
    <?php
    exit;
}

// Authenticated Admin Area
require_admin_login();

// Current active tab
$tab = $_GET['tab'] ?? 'dashboard';
$actionMsg = '';
$actionError = '';
$smtpTestResult = null;

// Handle Admin POST Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify($_POST['csrf_token'] ?? '')) {
        $actionError = 'CSRF validation failed. Please refresh and try again.';
    } else {
        $postAction = $_POST['admin_action'] ?? '';

        // Update General Website Settings & Logo/Favicon Upload
        if ($postAction === 'update_site_settings') {
            $keys = [
                'site_name', 'site_name_bn', 'site_subtitle', 'site_subtitle_bn',
                'support_email', 'whatsapp_number', 'helpline_phone',
                'min_deposit_bdt', 'min_withdraw_bdt', 'usd_to_bdt_rate',
                'notice_marquee', 'notice_marquee_bn', 'deposit_bonus_percent'
            ];
            foreach ($keys as $k) {
                if (isset($_POST[$k])) {
                    set_setting($k, trim($_POST[$k]));
                }
            }
            set_setting('maintenance_mode', isset($_POST['maintenance_mode']) ? '1' : '0');

            // Handle Logo Upload
            if (isset($_FILES['logo_file']) && $_FILES['logo_file']['error'] === UPLOAD_ERR_OK) {
                $file = $_FILES['logo_file'];
                $allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
                if (in_array($file['type'], $allowed, true) && $file['size'] <= 2 * 1024 * 1024) {
                    $uploadsDir = __DIR__ . '/../uploads';
                    if (!is_dir($uploadsDir)) {
                        mkdir($uploadsDir, 0755, true);
                    }
                    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
                    $destName = 'site_logo_' . time() . '.' . $ext;
                    $destPath = $uploadsDir . '/' . $destName;
                    if (move_uploaded_file($file['tmp_name'], $destPath)) {
                        $webPath = '/uploads/' . $destName;
                        set_setting('site_logo', $webPath);
                        set_setting('logo_url', $webPath);
                    }
                }
            }

            // Handle Favicon Upload
            if (isset($_FILES['favicon_file']) && $_FILES['favicon_file']['error'] === UPLOAD_ERR_OK) {
                $file = $_FILES['favicon_file'];
                $allowed = ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/jpeg', 'image/svg+xml'];
                if ($file['size'] <= 1 * 1024 * 1024) {
                    $uploadsDir = __DIR__ . '/../uploads';
                    if (!is_dir($uploadsDir)) {
                        mkdir($uploadsDir, 0755, true);
                    }
                    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
                    $destName = 'favicon_' . time() . '.' . $ext;
                    $destPath = $uploadsDir . '/' . $destName;
                    if (move_uploaded_file($file['tmp_name'], $destPath)) {
                        $webPath = '/uploads/' . $destName;
                        set_setting('site_favicon', $webPath);
                    }
                }
            }

            $actionMsg = 'Site settings and media updated successfully in MySQL!';
        }

        // Update Referral Settings
        if ($postAction === 'update_referral_settings') {
            set_setting('referral_enabled', isset($_POST['referral_enabled']) ? '1' : '0');
            set_setting('referral_percentage', trim($_POST['referral_percentage'] ?? '5'));
            set_setting('referral_minimum', trim($_POST['referral_minimum'] ?? '100'));
            $actionMsg = 'Referral commission configuration saved!';
        }

        // Update SMTP Settings
        if ($postAction === 'update_smtp_settings') {
            set_setting('smtp_host', trim($_POST['smtp_host'] ?? ''));
            set_setting('smtp_port', trim($_POST['smtp_port'] ?? '587'));
            set_setting('smtp_username', trim($_POST['smtp_username'] ?? ''));
            set_setting('smtp_encryption', trim($_POST['smtp_encryption'] ?? 'tls'));
            set_setting('smtp_from_email', trim($_POST['smtp_from_email'] ?? ''));
            set_setting('smtp_from_name', trim($_POST['smtp_from_name'] ?? 'Amader Job'));
            set_setting('email_verification_enabled', isset($_POST['email_verification_enabled']) ? '1' : '0');

            $newPassword = trim($_POST['smtp_password'] ?? '');
            if (!empty($newPassword)) {
                set_setting('smtp_password', $newPassword);
            }

            $actionMsg = 'SMTP credentials saved into MySQL settings!';
        }

        // Send Test Email
        if ($postAction === 'test_smtp_email') {
            $testTo = trim($_POST['test_recipient_email'] ?? '');
            if (!filter_var($testTo, FILTER_VALIDATE_EMAIL)) {
                $actionError = 'Invalid test recipient email address.';
            } else {
                $mailer = new SmtpMailer();
                $testHtml = "<h2>Amader Job SMTP Test</h2><p>This is a test message from your Admin Panel. SMTP is working properly on " . date('r') . ".</p>";
                $smtpTestResult = $mailer->send($testTo, "Amader Job - SMTP Live Test", $testHtml);
                if ($smtpTestResult['success']) {
                    $actionMsg = "Test email sent successfully to $testTo!";
                } else {
                    $actionError = "SMTP Test Failed: " . ($smtpTestResult['error'] ?? 'Unknown error');
                }
            }
        }

        // User Management: Update Balance
        if ($postAction === 'update_user_balance') {
            $userId = (int)($_POST['user_id'] ?? 0);
            $earning = (float)($_POST['earning_balance_bdt'] ?? 0);
            $deposit = (float)($_POST['deposit_balance_bdt'] ?? 0);
            if ($db && $userId > 0) {
                $stmt = $db->prepare("UPDATE users SET earning_balance_bdt = ?, deposit_balance_bdt = ? WHERE id = ?");
                $stmt->execute([$earning, $deposit, $userId]);
                $actionMsg = "User balance updated successfully in MySQL!";
            }
        }

        // User Management: Toggle Blue Badge & Verification
        if ($postAction === 'toggle_blue_badge') {
            $userId = (int)($_POST['user_id'] ?? 0);
            $badgeStatus = (int)($_POST['has_blue_badge'] ?? 0);
            if ($db && $userId > 0) {
                $stmt = $db->prepare("UPDATE users SET has_blue_badge = ?, blue_badge_plan = ?, is_verified = ? WHERE id = ?");
                $stmt->execute([$badgeStatus, $badgeStatus ? 'yearly' : null, $badgeStatus ? 1 : 0, $userId]);
                $actionMsg = "User badge & verification status updated!";
            }
        }

        // User Management: Ban / Unban
        if ($postAction === 'toggle_ban_user') {
            $userId = (int)($_POST['user_id'] ?? 0);
            $status = $_POST['status'] === 'banned' ? 'banned' : 'active';
            $reason = trim($_POST['ban_reason'] ?? 'Admin action');
            if ($db && $userId > 0) {
                $stmt = $db->prepare("UPDATE users SET status = ?, ban_reason = ? WHERE id = ?");
                $stmt->execute([$status, $status === 'banned' ? $reason : null, $userId]);
                $actionMsg = "User account status updated to " . strtoupper($status);
            }
        }

        // Review Submission
        if ($postAction === 'review_submission') {
            $subId = $_POST['submission_id'] ?? '';
            $decision = $_POST['decision'] ?? '';
            $feedback = trim($_POST['feedback'] ?? '');

            if ($db && $subId) {
                $stmt = $db->prepare("SELECT * FROM task_submissions WHERE id = ?");
                $stmt->execute([$subId]);
                $sub = $stmt->fetch();

                if ($sub && $sub['status'] === 'pending') {
                    $newStatus = ($decision === 'approved') ? 'approved' : 'rejected';
                    $upd = $db->prepare("UPDATE task_submissions SET status = ?, feedback = ? WHERE id = ?");
                    $upd->execute([$newStatus, $feedback, $subId]);

                    if ($newStatus === 'approved') {
                        $db->prepare("UPDATE users SET earning_balance_bdt = earning_balance_bdt + ?, completed_tasks_count = completed_tasks_count + 1 WHERE uid = ? OR id = ?")
                           ->execute([$sub['earned_bdt'], $sub['worker_id'], $sub['worker_id']]);

                        $db->prepare("UPDATE jobs SET completed_slots = completed_slots + 1 WHERE id = ?")
                           ->execute([$sub['job_id']]);

                        // User notification
                        $notifId = 'notif_' . time();
                        $db->prepare("
                            INSERT INTO notifications (id, user_id, title, title_bn, message, message_bn, type, created_at)
                            VALUES (?, ?, 'Task Approved', 'কাজ অনুমোদিত হয়েছে', ?, ?, 'task_approved', NOW())
                        ")->execute([
                            $notifId, $sub['worker_id'],
                            "Your submission for task has been approved! ৳{$sub['earned_bdt']} added to your earning balance.",
                            "আপনার কাজের সাবমিশন অনুমোদিত হয়েছে! আপনার অ্যাকাউন্টে ৳{$sub['earned_bdt']} যোগ করা হয়েছে।"
                        ]);
                    } else {
                        // Rejection notification
                        $notifId = 'notif_' . time();
                        $db->prepare("
                            INSERT INTO notifications (id, user_id, title, title_bn, message, message_bn, type, created_at)
                            VALUES (?, ?, 'Task Rejected', 'কাজ বাতিল করা হয়েছে', ?, ?, 'task_rejected', NOW())
                        ")->execute([
                            $notifId, $sub['worker_id'],
                            "Your submission was rejected. Reason: " . ($feedback ?: 'Requirements not met.'),
                            "আপনার কাজের সাবমিশন বাতিল করা হয়েছে। কারণ: " . ($feedback ?: 'নির্দেশনা মানা হয়নি।')
                        ]);
                    }
                    $actionMsg = "Submission marked as " . strtoupper($newStatus);
                }
            }
        }

        // Review Transaction (Deposit / Withdrawal)
        if ($postAction === 'review_transaction') {
            $txId = $_POST['tx_id'] ?? '';
            $status = $_POST['decision'] === 'approved' ? 'completed' : 'rejected';

            if ($db && $txId) {
                $stmt = $db->prepare("SELECT * FROM wallet_transactions WHERE id = ?");
                $stmt->execute([$txId]);
                $tx = $stmt->fetch();

                if ($tx && $tx['status'] === 'pending') {
                    $db->prepare("UPDATE wallet_transactions SET status = ? WHERE id = ?")->execute([$status, $txId]);

                    if ($status === 'completed' && $tx['type'] === 'deposit') {
                        // Credit deposit balance
                        $db->prepare("UPDATE users SET deposit_balance_bdt = deposit_balance_bdt + ? WHERE uid = ? OR id = ?")
                           ->execute([$tx['amount_bdt'], $tx['user_id'], $tx['user_id']]);

                        // Notification
                        $notifId = 'notif_' . time();
                        $db->prepare("
                            INSERT INTO notifications (id, user_id, title, title_bn, message, message_bn, type, created_at)
                            VALUES (?, ?, 'Deposit Approved', 'ডিপোজিট অনুমোদিত', ?, ?, 'system', NOW())
                        ")->execute([
                            $notifId, $tx['user_id'],
                            "Your deposit of ৳{$tx['amount_bdt']} has been approved and credited!",
                            "আপনার ৳{$tx['amount_bdt']} ডিপোজিট সফলভাবে অ্যাকাউন্টে যোগ করা হয়েছে!"
                        ]);
                    } elseif ($status === 'completed' && $tx['type'] === 'withdrawal') {
                        // Withdrawal completed - user balance was deducted when requested
                        $notifId = 'notif_' . time();
                        $db->prepare("
                            INSERT INTO notifications (id, user_id, title, title_bn, message, message_bn, type, created_at)
                            VALUES (?, ?, 'Withdrawal Paid', 'ক্যাশআউট সম্পন্ন হয়েছে', ?, ?, 'system', NOW())
                        ")->execute([
                            $notifId, $tx['user_id'],
                            "Your withdrawal of ৳{$tx['amount_bdt']} via " . strtoupper($tx['method'] ?? 'bKash') . " to {$tx['account_number']} has been sent!",
                            "আপনার ৳{$tx['amount_bdt']} ক্যাশআউট ({$tx['method']}) সফলভাবে পাঠানো হয়েছে!"
                        ]);
                    } elseif ($status === 'rejected' && $tx['type'] === 'withdrawal') {
                        // Refund user earning balance safely
                        $db->prepare("UPDATE users SET earning_balance_bdt = earning_balance_bdt + ? WHERE uid = ? OR id = ?")
                           ->execute([$tx['amount_bdt'], $tx['user_id'], $tx['user_id']]);

                        // Notification
                        $notifId = 'notif_' . time();
                        $db->prepare("
                            INSERT INTO notifications (id, user_id, title, title_bn, message, message_bn, type, created_at)
                            VALUES (?, ?, 'Withdrawal Rejected (Refunded)', 'উইথড্রয়াল বাতিল (রিফান্ড)', ?, ?, 'system', NOW())
                        ")->execute([
                            $notifId, $tx['user_id'],
                            "Your withdrawal of ৳{$tx['amount_bdt']} was rejected and the balance has been refunded to your earning wallet.",
                            "আপনার ৳{$tx['amount_bdt']} উইথড্রয়াল বাতিল করা হয়েছে এবং পুরো ব্যালেন্স রিফান্ড করা হয়েছে।"
                        ]);
                    }
                    $actionMsg = "Transaction updated to " . strtoupper($status);
                }
            }
        }

        // Change Admin Password
        if ($postAction === 'change_admin_password') {
            $newPass = $_POST['new_admin_password'] ?? '';
            $confirmPass = $_POST['confirm_admin_password'] ?? '';
            if (strlen($newPass) < 6) {
                $actionError = 'New password must be at least 6 characters.';
            } elseif ($newPass !== $confirmPass) {
                $actionError = 'Password confirmation does not match.';
            } else {
                if ($db) {
                    $newHash = password_hash($newPass, PASSWORD_BCRYPT);
                    $stmt = $db->prepare("UPDATE admins SET password_hash = ? WHERE id = ?");
                    $stmt->execute([$newHash, $_SESSION['admin_id']]);
                    $actionMsg = 'Admin password changed successfully!';
                }
            }
        }

        // Reply to Support Ticket
        if ($postAction === 'reply_ticket') {
            $ticketId = trim($_POST['ticket_id'] ?? '');
            $replyMsg = trim($_POST['reply_message'] ?? '');
            $newStatus = trim($_POST['ticket_status'] ?? 'in_progress');

            if ($db && $ticketId && $replyMsg) {
                $stmt = $db->prepare("INSERT INTO ticket_messages (ticket_id, sender, sender_name, message, created_at) VALUES (?, 'admin', 'Amader Job Support', ?, NOW())");
                $stmt->execute([$ticketId, $replyMsg]);

                $db->prepare("UPDATE support_tickets SET status = ?, unread_user = 1, unread_admin = 0, updated_at = NOW() WHERE id = ?")
                   ->execute([$newStatus, $ticketId]);

                try {
                    $tInfo = $db->prepare("SELECT user_email, user_name, subject FROM support_tickets WHERE id = ?");
                    $tInfo->execute([$ticketId]);
                    $ticketUser = $tInfo->fetch();
                    if ($ticketUser && !empty($ticketUser['user_email'])) {
                        $mailer = new SmtpMailer();
                        if ($mailer->isConfigured()) {
                            $subj = "New Reply on Ticket #{$ticketId}: {$ticketUser['subject']}";
                            $body = "Hello {$ticketUser['user_name']},\n\nOur support team has replied to your ticket (#{$ticketId}):\n\n\"{$replyMsg}\"\n\nPlease log in to your Amader Job account to view and reply.\n\nWarm regards,\nAmader Job Support Team";
                            $mailer->send($ticketUser['user_email'], $subj, nl2br(htmlspecialchars($body)));
                        }
                    }
                } catch (Exception $e) {}

                $actionMsg = "Reply posted successfully to Ticket #{$ticketId}";
            }
        }
    }
}

// Fetch Real-time Dashboard KPIs from MySQL
$kpiUsers = 0;
$kpiJobs = 0;
$kpiPendingWithdrawals = 0;
$kpiPendingDeposits = 0;
$kpiPendingSubmissions = 0;
$kpiOpenTickets = 0;
$kpiTotalPayoutBDT = 0.0;
$kpiTotalDepositBDT = 0.0;

if ($db) {
    try {
        $kpiUsers = (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $kpiJobs = (int)$db->query("SELECT COUNT(*) FROM jobs WHERE status = 'active'")->fetchColumn();
        $kpiPendingWithdrawals = (int)$db->query("SELECT COUNT(*) FROM wallet_transactions WHERE type = 'withdrawal' AND status = 'pending'")->fetchColumn();
        $kpiPendingDeposits = (int)$db->query("SELECT COUNT(*) FROM wallet_transactions WHERE type = 'deposit' AND status = 'pending'")->fetchColumn();
        $kpiPendingSubmissions = (int)$db->query("SELECT COUNT(*) FROM task_submissions WHERE status = 'pending'")->fetchColumn();
        $kpiOpenTickets = (int)$db->query("SELECT COUNT(*) FROM support_tickets WHERE status IN ('open', 'in_progress')")->fetchColumn();
        $kpiTotalPayoutBDT = (float)$db->query("SELECT COALESCE(SUM(amount_bdt), 0) FROM wallet_transactions WHERE type = 'withdrawal' AND status = 'completed'")->fetchColumn();
        $kpiTotalDepositBDT = (float)$db->query("SELECT COALESCE(SUM(amount_bdt), 0) FROM wallet_transactions WHERE type = 'deposit' AND status = 'completed'")->fetchColumn();
    } catch (Exception $e) {}
}

$siteLogo = get_setting('site_logo', get_setting('logo_url', '/assets/logo.png'));
$siteFavicon = get_setting('site_favicon', '/favicon.ico');
$adminUsername = $_SESSION['admin_username'] ?? 'Admin';
?>
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel - Amader Job Online</title>
  <link rel="icon" href="<?= sanitize_output($siteFavicon) ?>">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 9999px; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white">

  <!-- Mobile Top Bar with Admin Avatar & Menu Toggle Button -->
  <div class="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-md text-sm">
        <?= strtoupper(substr($adminUsername, 0, 1)) ?>
      </div>
      <div>
        <div class="font-bold text-white text-sm leading-tight"><?= sanitize_output($adminUsername) ?></div>
        <div class="text-[10px] font-semibold text-emerald-400">SUPER ADMIN</div>
      </div>
    </div>
    
    <button id="mobileMenuBtn" type="button" class="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
  </div>

  <!-- Mobile Drawer Backdrop -->
  <div id="mobileDrawerBackdrop" class="fixed inset-0 bg-slate-950/80 z-50 backdrop-blur-sm hidden transition-opacity lg:hidden"></div>

  <div class="flex-1 flex min-h-screen">

    <!-- Sidebar Navigation Drawer -->
    <aside id="sidebarDrawer" class="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 transform -translate-x-full lg:translate-x-0 lg:static lg:z-auto">
      
      <!-- Sidebar Profile & Header -->
      <div class="p-6 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-emerald-500/20">
            <?= strtoupper(substr($adminUsername, 0, 1)) ?>
          </div>
          <div>
            <h2 class="font-bold text-white text-sm leading-snug"><?= sanitize_output($adminUsername) ?></h2>
            <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 mt-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SUPER ADMIN
            </div>
          </div>
        </div>

        <button id="closeDrawerBtn" type="button" class="lg:hidden p-1.5 text-slate-400 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        <?php
        $navItems = [
            'dashboard' => ['label' => 'Dashboard', 'badge' => '', 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>'],
            'users' => ['label' => 'Users', 'badge' => (string)$kpiUsers, 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>'],
            'withdrawals' => ['label' => 'Withdrawals', 'badge' => $kpiPendingWithdrawals > 0 ? (string)$kpiPendingWithdrawals : '', 'badgeColor' => 'bg-amber-500', 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>'],
            'deposits' => ['label' => 'Deposits', 'badge' => $kpiPendingDeposits > 0 ? (string)$kpiPendingDeposits : '', 'badgeColor' => 'bg-blue-500', 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'],
            'submissions' => ['label' => 'Submissions', 'badge' => $kpiPendingSubmissions > 0 ? (string)$kpiPendingSubmissions : '', 'badgeColor' => 'bg-emerald-500', 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>'],
            'jobs' => ['label' => 'Jobs Marketplace', 'badge' => (string)$kpiJobs, 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>'],
            'tickets' => ['label' => 'Support Tickets', 'badge' => $kpiOpenTickets > 0 ? (string)$kpiOpenTickets : '', 'badgeColor' => 'bg-rose-500', 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>'],
            'settings' => ['label' => 'Site Settings', 'badge' => '', 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>'],
            'referral' => ['label' => 'Referral System', 'badge' => '', 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>'],
            'smtp' => ['label' => 'SMTP Mailer', 'badge' => '', 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>'],
            'security' => ['label' => 'Admin Password', 'badge' => '', 'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>'],
        ];

        foreach ($navItems as $k => $item):
            $isActive = ($tab === $k);
        ?>
          <a href="<?= app_url('admin/index.php?tab=' . $k) ?>" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all <?= $isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60' ?>">
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 shrink-0 <?= $isActive ? 'text-emerald-400' : 'text-slate-400' ?>" fill="none" stroke="currentColor" viewBox="0 0 24 24"><?= $item['icon'] ?></svg>
              <span><?= $item['label'] ?></span>
            </div>
            <?php if (!empty($item['badge'])): ?>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white <?= $item['badgeColor'] ?? 'bg-slate-800 text-slate-300' ?>"><?= $item['badge'] ?></span>
            <?php endif; ?>
          </a>
        <?php endforeach; ?>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-slate-800 space-y-2">
        <a href="<?= app_url() ?>" target="_blank" class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          <span>View Live Site</span>
        </a>
        <a href="<?= app_url('admin/index.php?action=logout') ?>" class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors border border-rose-500/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          <span>Logout</span>
        </a>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
      
      <!-- Top Content Header -->
      <header class="px-6 py-5 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-black text-white capitalize"><?= str_replace('_', ' ', $tab) ?></h1>
          <p class="text-xs text-slate-400 mt-0.5">Database: <span class="text-emerald-400 font-mono"><?= env('DB_NAME', 'bahubal2_Amaderjob8383') ?></span> &bull; Status: <span class="text-emerald-400 font-semibold">Active</span></p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-400 hidden sm:inline"><?= date('D, d M Y - H:i:s') ?></span>
          <a href="<?= app_url('admin/index.php?tab=' . $tab) ?>" class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors" title="Refresh">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </a>
        </div>
      </header>

      <!-- Alert Messages -->
      <div class="p-6 space-y-6">
        <?php if (!empty($actionMsg)): ?>
          <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 shadow-lg shadow-emerald-500/5">
            <svg class="w-5 h-5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span><?= sanitize_output($actionMsg) ?></span>
          </div>
        <?php endif; ?>

        <?php if (!empty($actionError)): ?>
          <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 shadow-lg shadow-rose-500/5">
            <svg class="w-5 h-5 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span><?= sanitize_output($actionError) ?></span>
          </div>
        <?php endif; ?>

        <!-- TAB: DASHBOARD -->
        <?php if ($tab === 'dashboard'): ?>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Users</div>
              <div class="text-3xl font-black text-white mt-2"><?= number_format($kpiUsers) ?></div>
              <div class="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
                <span>Active Community</span>
              </div>
            </div>

            <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Jobs</div>
              <div class="text-3xl font-black text-white mt-2"><?= number_format($kpiJobs) ?></div>
              <div class="text-xs text-blue-400 mt-2 font-semibold">Live on Marketplace</div>
            </div>

            <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Withdrawals</div>
              <div class="text-3xl font-black text-amber-400 mt-2"><?= number_format($kpiPendingWithdrawals) ?></div>
              <a href="<?= app_url('admin/index.php?tab=withdrawals') ?>" class="text-xs text-amber-400 hover:underline mt-2 inline-block font-semibold">Review Requests &rarr;</a>
            </div>

            <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Payouts (BDT)</div>
              <div class="text-3xl font-black text-emerald-400 mt-2">৳<?= number_format($kpiTotalPayoutBDT, 2) ?></div>
              <div class="text-xs text-slate-400 mt-2">Completed Cashouts</div>
            </div>
          </div>

          <!-- Pending Actions Quick Table -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            
            <!-- Pending Withdrawals Card -->
            <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-white text-base">Pending Withdrawals</h3>
                <a href="<?= app_url('admin/index.php?tab=withdrawals') ?>" class="text-xs text-emerald-400 hover:underline">View All</a>
              </div>
              <?php
              $pWithdrawals = [];
              if ($db) {
                  try {
                      $pStmt = $db->query("SELECT * FROM wallet_transactions WHERE type = 'withdrawal' AND status = 'pending' ORDER BY created_at DESC LIMIT 5");
                      $pWithdrawals = $pStmt->fetchAll();
                  } catch (Exception $e) {}
              }
              ?>
              <?php if (empty($pWithdrawals)): ?>
                <p class="text-xs text-slate-400 py-6 text-center">No pending withdrawal requests right now.</p>
              <?php else: ?>
                <div class="space-y-3">
                  <?php foreach ($pWithdrawals as $w): ?>
                    <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div class="text-xs font-bold text-white"><?= sanitize_output($w['user_id']) ?> &bull; <span class="text-emerald-400 uppercase font-mono"><?= sanitize_output($w['method']) ?></span></div>
                        <div class="text-[11px] text-slate-400 font-mono"><?= sanitize_output($w['account_number']) ?> &bull; <?= $w['created_at'] ?></div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-black text-white">৳<?= number_format($w['amount_bdt'], 2) ?></div>
                        <a href="<?= app_url('admin/index.php?tab=withdrawals') ?>" class="text-[10px] font-bold text-amber-400 hover:underline">Process</a>
                      </div>
                    </div>
                  <?php endforeach; ?>
                </div>
              <?php endif; ?>
            </div>

            <!-- Pending Task Submissions Card -->
            <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-white text-base">Pending Submissions</h3>
                <a href="<?= app_url('admin/index.php?tab=submissions') ?>" class="text-xs text-emerald-400 hover:underline">View All</a>
              </div>
              <?php
              $pSubs = [];
              if ($db) {
                  try {
                      $psStmt = $db->query("SELECT * FROM task_submissions WHERE status = 'pending' ORDER BY submitted_at DESC LIMIT 5");
                      $pSubs = $psStmt->fetchAll();
                  } catch (Exception $e) {}
              }
              ?>
              <?php if (empty($pSubs)): ?>
                <p class="text-xs text-slate-400 py-6 text-center">No pending task proofs to review.</p>
              <?php else: ?>
                <div class="space-y-3">
                  <?php foreach ($pSubs as $s): ?>
                    <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div class="text-xs font-bold text-white"><?= sanitize_output($s['worker_name']) ?></div>
                        <div class="text-[11px] text-slate-400">Job: <?= sanitize_output($s['job_id']) ?> &bull; <?= $s['submitted_at'] ?></div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-black text-emerald-400">৳<?= number_format($s['earned_bdt'], 2) ?></div>
                        <a href="<?= app_url('admin/index.php?tab=submissions') ?>" class="text-[10px] font-bold text-emerald-400 hover:underline">Review Proof</a>
                      </div>
                    </div>
                  <?php endforeach; ?>
                </div>
              <?php endif; ?>
            </div>

          </div>
        <?php endif; ?>

        <!-- TAB: WITHDRAWALS -->
        <?php if ($tab === 'withdrawals'): ?>
          <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div class="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 class="text-lg font-bold text-white">Withdrawal Management</h2>
                <p class="text-xs text-slate-400">Approve or reject cashout requests directly connected to MySQL database.</p>
              </div>
            </div>

            <?php
            $wList = [];
            if ($db) {
                try {
                    $wStmt = $db->query("SELECT * FROM wallet_transactions WHERE type = 'withdrawal' ORDER BY created_at DESC LIMIT 200");
                    $wList = $wStmt->fetchAll();
                } catch (Exception $e) {}
            }
            ?>

            <?php if (empty($wList)): ?>
              <div class="p-12 text-center text-slate-400 text-xs">No withdrawal records found in database.</div>
            <?php else: ?>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-300">
                  <thead class="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th class="py-3.5 px-4">User UID</th>
                      <th class="py-3.5 px-4">Amount</th>
                      <th class="py-3.5 px-4">Method</th>
                      <th class="py-3.5 px-4">Receiver Number</th>
                      <th class="py-3.5 px-4">Date / Time</th>
                      <th class="py-3.5 px-4">Status</th>
                      <th class="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/60">
                    <?php foreach ($wList as $item): ?>
                      <tr class="hover:bg-slate-800/30 transition-colors">
                        <td class="py-3.5 px-4 font-mono font-bold text-white"><?= sanitize_output($item['user_id']) ?></td>
                        <td class="py-3.5 px-4 font-black text-white text-sm">৳<?= number_format($item['amount_bdt'], 2) ?></td>
                        <td class="py-3.5 px-4 uppercase font-bold text-emerald-400"><?= sanitize_output($item['method'] ?? 'bKash') ?></td>
                        <td class="py-3.5 px-4 font-mono text-slate-200"><?= sanitize_output($item['account_number'] ?? 'N/A') ?></td>
                        <td class="py-3.5 px-4 text-slate-400"><?= $item['created_at'] ?></td>
                        <td class="py-3.5 px-4">
                          <?php if ($item['status'] === 'completed'): ?>
                            <span class="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">COMPLETED</span>
                          <?php elseif ($item['status'] === 'rejected'): ?>
                            <span class="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-[10px]">REJECTED</span>
                          <?php else: ?>
                            <span class="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[10px] animate-pulse">PENDING</span>
                          <?php endif; ?>
                        </td>
                        <td class="py-3.5 px-4 text-right">
                          <?php if ($item['status'] === 'pending'): ?>
                            <div class="flex items-center justify-end gap-2">
                              <form method="POST" action="<?= app_url('admin/index.php?tab=withdrawals') ?>" onsubmit="return confirm('Approve this withdrawal of ৳<?= $item['amount_bdt'] ?>?');">
                                <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                                <input type="hidden" name="admin_action" value="review_transaction">
                                <input type="hidden" name="tx_id" value="<?= sanitize_output($item['id']) ?>">
                                <input type="hidden" name="decision" value="approved">
                                <button type="submit" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-sm">Approve</button>
                              </form>

                              <form method="POST" action="<?= app_url('admin/index.php?tab=withdrawals') ?>" onsubmit="return confirm('Reject and REFUND this withdrawal of ৳<?= $item['amount_bdt'] ?>?');">
                                <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                                <input type="hidden" name="admin_action" value="review_transaction">
                                <input type="hidden" name="tx_id" value="<?= sanitize_output($item['id']) ?>">
                                <input type="hidden" name="decision" value="rejected">
                                <button type="submit" class="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 font-bold text-xs transition-colors border border-rose-500/30">Reject</button>
                              </form>
                            </div>
                          <?php else: ?>
                            <span class="text-slate-500 text-[11px]">Processed</span>
                          <?php endif; ?>
                        </td>
                      </tr>
                    <?php endforeach; ?>
                  </tbody>
                </table>
              </div>
            <?php endif; ?>
          </div>
        <?php endif; ?>

        <!-- TAB: DEPOSITS -->
        <?php if ($tab === 'deposits'): ?>
          <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div class="p-6 border-b border-slate-800">
              <h2 class="text-lg font-bold text-white">Deposit Requests</h2>
              <p class="text-xs text-slate-400">Verify TrxID and approve deposits to credit user balances.</p>
            </div>

            <?php
            $dList = [];
            if ($db) {
                try {
                    $dStmt = $db->query("SELECT * FROM wallet_transactions WHERE type = 'deposit' ORDER BY created_at DESC LIMIT 200");
                    $dList = $dStmt->fetchAll();
                } catch (Exception $e) {}
            }
            ?>

            <?php if (empty($dList)): ?>
              <div class="p-12 text-center text-slate-400 text-xs">No deposit records found in database.</div>
            <?php else: ?>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-300">
                  <thead class="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th class="py-3.5 px-4">User UID</th>
                      <th class="py-3.5 px-4">Amount</th>
                      <th class="py-3.5 px-4">Method</th>
                      <th class="py-3.5 px-4">TrxID / Sender</th>
                      <th class="py-3.5 px-4">Date / Time</th>
                      <th class="py-3.5 px-4">Status</th>
                      <th class="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/60">
                    <?php foreach ($dList as $item): ?>
                      <tr class="hover:bg-slate-800/30 transition-colors">
                        <td class="py-3.5 px-4 font-mono font-bold text-white"><?= sanitize_output($item['user_id']) ?></td>
                        <td class="py-3.5 px-4 font-black text-emerald-400 text-sm">৳<?= number_format($item['amount_bdt'], 2) ?></td>
                        <td class="py-3.5 px-4 uppercase font-bold text-blue-400"><?= sanitize_output($item['method'] ?? 'bKash') ?></td>
                        <td class="py-3.5 px-4 font-mono text-slate-200">
                          <span class="font-bold text-white"><?= sanitize_output($item['trx_id'] ?? 'N/A') ?></span>
                          <?php if (!empty($item['account_number'])): ?>
                            <span class="text-slate-400 text-[11px] block"><?= sanitize_output($item['account_number']) ?></span>
                          <?php endif; ?>
                        </td>
                        <td class="py-3.5 px-4 text-slate-400"><?= $item['created_at'] ?></td>
                        <td class="py-3.5 px-4">
                          <?php if ($item['status'] === 'completed'): ?>
                            <span class="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">COMPLETED</span>
                          <?php elseif ($item['status'] === 'rejected'): ?>
                            <span class="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-[10px]">REJECTED</span>
                          <?php else: ?>
                            <span class="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[10px] animate-pulse">PENDING</span>
                          <?php endif; ?>
                        </td>
                        <td class="py-3.5 px-4 text-right">
                          <?php if ($item['status'] === 'pending'): ?>
                            <div class="flex items-center justify-end gap-2">
                              <form method="POST" action="<?= app_url('admin/index.php?tab=deposits') ?>" onsubmit="return confirm('Approve deposit of ৳<?= $item['amount_bdt'] ?> for <?= $item['user_id'] ?>?');">
                                <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                                <input type="hidden" name="admin_action" value="review_transaction">
                                <input type="hidden" name="tx_id" value="<?= sanitize_output($item['id']) ?>">
                                <input type="hidden" name="decision" value="approved">
                                <button type="submit" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-sm">Credit Balance</button>
                              </form>

                              <form method="POST" action="<?= app_url('admin/index.php?tab=deposits') ?>" onsubmit="return confirm('Reject deposit transaction?');">
                                <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                                <input type="hidden" name="admin_action" value="review_transaction">
                                <input type="hidden" name="tx_id" value="<?= sanitize_output($item['id']) ?>">
                                <input type="hidden" name="decision" value="rejected">
                                <button type="submit" class="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 font-bold text-xs transition-colors border border-rose-500/30">Reject</button>
                              </form>
                            </div>
                          <?php else: ?>
                            <span class="text-slate-500 text-[11px]">Processed</span>
                          <?php endif; ?>
                        </td>
                      </tr>
                    <?php endforeach; ?>
                  </tbody>
                </table>
              </div>
            <?php endif; ?>
          </div>
        <?php endif; ?>

        <!-- TAB: USERS -->
        <?php if ($tab === 'users'): ?>
          <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div class="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-white">User Accounts Directory</h2>
                <p class="text-xs text-slate-400">Manage user profiles, edit balances, assign blue badges, and enforce status.</p>
              </div>
            </div>

            <?php
            $usersList = [];
            if ($db) {
                try {
                    $uStmt = $db->query("SELECT * FROM users ORDER BY id DESC LIMIT 150");
                    $usersList = $uStmt->fetchAll();
                } catch (Exception $e) {}
            }
            ?>

            <?php if (empty($usersList)): ?>
              <div class="p-12 text-center text-slate-400 text-xs">No user records found in database.</div>
            <?php else: ?>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-300">
                  <thead class="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th class="py-3.5 px-4">User</th>
                      <th class="py-3.5 px-4">UID</th>
                      <th class="py-3.5 px-4">Balances (BDT)</th>
                      <th class="py-3.5 px-4">Badge / Verification</th>
                      <th class="py-3.5 px-4">Referrals</th>
                      <th class="py-3.5 px-4">Status</th>
                      <th class="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/60">
                    <?php foreach ($usersList as $u): ?>
                      <tr class="hover:bg-slate-800/30 transition-colors">
                        <td class="py-3.5 px-4">
                          <div class="flex items-center gap-3">
                            <img src="<?= sanitize_output($u['avatar'] ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150') ?>" class="w-8 h-8 rounded-full object-cover border border-slate-700" alt="Avatar">
                            <div>
                              <div class="font-bold text-white"><?= sanitize_output($u['name']) ?></div>
                              <div class="text-[11px] text-slate-400"><?= sanitize_output($u['email']) ?></div>
                            </div>
                          </div>
                        </td>
                        <td class="py-3.5 px-4 font-mono font-bold text-emerald-400"><?= sanitize_output($u['uid']) ?></td>
                        <td class="py-3.5 px-4">
                          <div class="text-white font-semibold">Earn: <span class="text-emerald-400 font-bold">৳<?= number_format($u['earning_balance_bdt'], 2) ?></span></div>
                          <div class="text-slate-400 text-[11px]">Dep: ৳<?= number_format($u['deposit_balance_bdt'], 2) ?></div>
                        </td>
                        <td class="py-3.5 px-4">
                          <?php if ($u['has_blue_badge']): ?>
                            <span class="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-[10px]">Blue Badge</span>
                          <?php else: ?>
                            <span class="text-slate-500 text-[11px]">Standard</span>
                          <?php endif; ?>
                        </td>
                        <td class="py-3.5 px-4">
                          <div class="text-white font-mono"><?= (int)$u['referred_users_count'] ?> users</div>
                          <div class="text-slate-400 text-[11px]">Code: <?= sanitize_output($u['referral_code']) ?></div>
                        </td>
                        <td class="py-3.5 px-4">
                          <?php if ($u['status'] === 'banned'): ?>
                            <span class="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-[10px]">BANNED</span>
                          <?php else: ?>
                            <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">ACTIVE</span>
                          <?php endif; ?>
                        </td>
                        <td class="py-3.5 px-4 text-right">
                          <div class="flex items-center justify-end gap-2">
                            <!-- Quick Balance Modal Form -->
                            <details class="relative inline-block">
                              <summary class="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer list-none font-semibold text-xs">Edit Balances</summary>
                              <div class="absolute right-0 mt-2 w-64 p-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-20 text-left">
                                <form method="POST" action="<?= app_url('admin/index.php?tab=users') ?>" class="space-y-3">
                                  <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                                  <input type="hidden" name="admin_action" value="update_user_balance">
                                  <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                                  <div>
                                    <label class="block text-[10px] uppercase font-bold text-slate-400">Earning BDT</label>
                                    <input type="number" step="0.01" name="earning_balance_bdt" value="<?= $u['earning_balance_bdt'] ?>" class="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs">
                                  </div>
                                  <div>
                                    <label class="block text-[10px] uppercase font-bold text-slate-400">Deposit BDT</label>
                                    <input type="number" step="0.01" name="deposit_balance_bdt" value="<?= $u['deposit_balance_bdt'] ?>" class="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs">
                                  </div>
                                  <button type="submit" class="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs">Save Changes</button>
                                </form>
                              </div>
                            </details>

                            <!-- Toggle Blue Badge Form -->
                            <form method="POST" action="<?= app_url('admin/index.php?tab=users') ?>" class="inline-block">
                              <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                              <input type="hidden" name="admin_action" value="toggle_blue_badge">
                              <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                              <input type="hidden" name="has_blue_badge" value="<?= $u['has_blue_badge'] ? '0' : '1' ?>">
                              <button type="submit" class="px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-semibold text-xs">
                                <?= $u['has_blue_badge'] ? 'Revoke Badge' : 'Give Badge' ?>
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    <?php endforeach; ?>
                  </tbody>
                </table>
              </div>
            <?php endif; ?>
          </div>
        <?php endif; ?>

        <!-- TAB: SUBMISSIONS -->
        <?php if ($tab === 'submissions'): ?>
          <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div class="p-6 border-b border-slate-800">
              <h2 class="text-lg font-bold text-white">Worker Task Proofs</h2>
              <p class="text-xs text-slate-400">Inspect submitted proof text and screenshots, then approve or reject with feedback.</p>
            </div>

            <?php
            $subsList = [];
            if ($db) {
                try {
                    $sStmt = $db->query("SELECT s.*, j.title as job_title FROM task_submissions s LEFT JOIN jobs j ON s.job_id = j.id ORDER BY s.submitted_at DESC LIMIT 150");
                    $subsList = $sStmt->fetchAll();
                } catch (Exception $e) {}
            }
            ?>

            <?php if (empty($subsList)): ?>
              <div class="p-12 text-center text-slate-400 text-xs">No task submissions found in database.</div>
            <?php else: ?>
              <div class="divide-y divide-slate-800/60">
                <?php foreach ($subsList as $s): ?>
                  <div class="p-6 hover:bg-slate-800/20 transition-colors">
                    <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div class="space-y-2 max-w-2xl">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-white text-sm"><?= sanitize_output($s['worker_name']) ?></span>
                          <span class="text-slate-400 font-mono text-xs">(UID: <?= sanitize_output($s['worker_id']) ?>)</span>
                          <span class="text-slate-500">&bull;</span>
                          <span class="text-emerald-400 font-bold text-xs">৳<?= number_format($s['earned_bdt'], 2) ?></span>
                        </div>
                        <div class="text-xs text-slate-300 font-semibold">Job: <?= sanitize_output($s['job_title'] ?: $s['job_id']) ?></div>
                        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                          <strong>Proof Submitted:</strong><br>
                          <?= nl2br(sanitize_output($s['proof_text'])) ?>
                        </div>
                        <?php if (!empty($s['proof_url'])): ?>
                          <div class="text-xs">
                            <span class="text-slate-400">Proof URL: </span>
                            <a href="<?= sanitize_output($s['proof_url']) ?>" target="_blank" class="text-emerald-400 hover:underline"><?= sanitize_output($s['proof_url']) ?></a>
                          </div>
                        <?php endif; ?>
                      </div>

                      <div class="shrink-0 text-right space-y-3">
                        <div>
                          <?php if ($s['status'] === 'approved'): ?>
                            <span class="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">APPROVED</span>
                          <?php elseif ($s['status'] === 'rejected'): ?>
                            <span class="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs">REJECTED</span>
                          <?php else: ?>
                            <span class="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs">PENDING REVIEW</span>
                          <?php endif; ?>
                        </div>

                        <?php if ($s['status'] === 'pending'): ?>
                          <div class="flex items-center justify-end gap-2 pt-2">
                            <form method="POST" action="<?= app_url('admin/index.php?tab=submissions') ?>">
                              <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                              <input type="hidden" name="admin_action" value="review_submission">
                              <input type="hidden" name="submission_id" value="<?= sanitize_output($s['id']) ?>">
                              <input type="hidden" name="decision" value="approved">
                              <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-sm">Approve & Credit</button>
                            </form>

                            <form method="POST" action="<?= app_url('admin/index.php?tab=submissions') ?>" class="flex items-center gap-1">
                              <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                              <input type="hidden" name="admin_action" value="review_submission">
                              <input type="hidden" name="submission_id" value="<?= sanitize_output($s['id']) ?>">
                              <input type="hidden" name="decision" value="rejected">
                              <button type="submit" class="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 font-bold text-xs border border-rose-500/30 transition-colors">Reject</button>
                            </form>
                          </div>
                        <?php endif; ?>
                      </div>
                    </div>
                  </div>
                <?php endforeach; ?>
              </div>
            <?php endif; ?>
          </div>
        <?php endif; ?>

        <!-- TAB: JOBS -->
        <?php if ($tab === 'jobs'): ?>
          <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div class="p-6 border-b border-slate-800">
              <h2 class="text-lg font-bold text-white">Marketplace Jobs</h2>
              <p class="text-xs text-slate-400">All micro jobs posted by employers and active on the platform.</p>
            </div>

            <?php
            $allJobs = [];
            if ($db) {
                try {
                    $jStmt = $db->query("SELECT * FROM jobs ORDER BY id DESC LIMIT 150");
                    $allJobs = $jStmt->fetchAll();
                } catch (Exception $e) {}
            }
            ?>

            <?php if (empty($allJobs)): ?>
              <div class="p-12 text-center text-slate-400 text-xs">No jobs posted in database yet.</div>
            <?php else: ?>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-300">
                  <thead class="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th class="py-3.5 px-4">Job Title</th>
                      <th class="py-3.5 px-4">Category</th>
                      <th class="py-3.5 px-4">Pay / Task</th>
                      <th class="py-3.5 px-4">Slots</th>
                      <th class="py-3.5 px-4">Employer</th>
                      <th class="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/60">
                    <?php foreach ($allJobs as $job): ?>
                      <tr class="hover:bg-slate-800/30 transition-colors">
                        <td class="py-3.5 px-4">
                          <div class="font-bold text-white"><?= sanitize_output($job['title']) ?></div>
                          <div class="text-slate-400 text-[11px]"><?= sanitize_output($job['title_bn']) ?></div>
                        </td>
                        <td class="py-3.5 px-4 capitalize font-semibold text-emerald-400"><?= sanitize_output($job['category']) ?></td>
                        <td class="py-3.5 px-4 font-black text-white">৳<?= number_format($job['pay_per_task_bdt'], 2) ?></td>
                        <td class="py-3.5 px-4 font-mono"><?= $job['completed_slots'] ?> / <?= $job['total_slots'] ?></td>
                        <td class="py-3.5 px-4"><?= sanitize_output($job['employer_name']) ?></td>
                        <td class="py-3.5 px-4">
                          <span class="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase"><?= sanitize_output($job['status']) ?></span>
                        </td>
                      </tr>
                    <?php endforeach; ?>
                  </tbody>
                </table>
              </div>
            <?php endif; ?>
          </div>
        <?php endif; ?>

        <!-- TAB: SUPPORT TICKETS -->
        <?php if ($tab === 'tickets'): ?>
          <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div class="p-6 border-b border-slate-800">
              <h2 class="text-lg font-bold text-white">Support Helpdesk Tickets</h2>
              <p class="text-xs text-slate-400">View and respond to customer tickets. Admin replies trigger instant MySQL storage and optional SMTP dispatch.</p>
            </div>

            <?php
            $ticketRows = [];
            if ($db) {
                try {
                    $tStmt = $db->query("SELECT * FROM support_tickets ORDER BY updated_at DESC LIMIT 100");
                    $ticketRows = $tStmt->fetchAll();
                } catch (Exception $e) {}
            }
            ?>

            <?php if (empty($ticketRows)): ?>
              <div class="p-12 text-center text-slate-400 text-xs">No support tickets found in database.</div>
            <?php else: ?>
              <div class="divide-y divide-slate-800/60">
                <?php foreach ($ticketRows as $ticket): ?>
                  <div class="p-6 hover:bg-slate-800/20 transition-colors">
                    <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div class="space-y-3 flex-1">
                        <div class="flex items-center gap-3">
                          <span class="px-2.5 py-0.5 rounded-full bg-slate-800 font-mono text-xs font-bold text-slate-300">#<?= sanitize_output($ticket['id']) ?></span>
                          <h3 class="font-bold text-white text-sm"><?= sanitize_output($ticket['subject']) ?></h3>
                          <span class="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-[10px] uppercase"><?= sanitize_output($ticket['category']) ?></span>
                        </div>

                        <div class="text-xs text-slate-400">
                          By: <strong class="text-white"><?= sanitize_output($ticket['user_name']) ?></strong> (<?= sanitize_output($ticket['user_email']) ?>) &bull; <?= $ticket['created_at'] ?>
                        </div>

                        <!-- Ticket Conversation History -->
                        <?php
                        $msgList = [];
                        if ($db) {
                            $mStmt = $db->prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC");
                            $mStmt->execute([$ticket['id']]);
                            $msgList = $mStmt->fetchAll();
                        }
                        ?>
                        <div class="space-y-2 max-w-3xl pt-2">
                          <?php foreach ($msgList as $m): ?>
                            <div class="p-3.5 rounded-2xl <?= $m['sender'] === 'admin' ? 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 ml-6' : 'bg-slate-950 border border-slate-800 text-slate-200' ?> text-xs">
                              <div class="flex items-center justify-between font-bold mb-1 text-[11px]">
                                <span><?= sanitize_output($m['sender_name']) ?> (<?= strtoupper($m['sender']) ?>)</span>
                                <span class="text-slate-500 font-normal"><?= $m['created_at'] ?></span>
                              </div>
                              <div><?= nl2br(sanitize_output($m['message'])) ?></div>
                            </div>
                          <?php endforeach; ?>
                        </div>

                        <!-- Admin Reply Form -->
                        <form method="POST" action="<?= app_url('admin/index.php?tab=tickets') ?>" class="space-y-3 pt-3 max-w-3xl">
                          <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                          <input type="hidden" name="admin_action" value="reply_ticket">
                          <input type="hidden" name="ticket_id" value="<?= sanitize_output($ticket['id']) ?>">
                          <textarea name="reply_message" rows="2" required placeholder="Type your reply to user..." class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"></textarea>
                          <div class="flex items-center justify-between">
                            <select name="ticket_status" class="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs">
                              <option value="in_progress" <?= $ticket['status'] === 'in_progress' ? 'selected' : '' ?>>Status: In Progress</option>
                              <option value="resolved" <?= $ticket['status'] === 'resolved' ? 'selected' : '' ?>>Status: Resolved</option>
                              <option value="closed" <?= $ticket['status'] === 'closed' ? 'selected' : '' ?>>Status: Closed</option>
                            </select>
                            <button type="submit" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm">Send Admin Reply</button>
                          </div>
                        </form>
                      </div>

                      <div class="shrink-0">
                        <span class="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase"><?= sanitize_output($ticket['status']) ?></span>
                      </div>
                    </div>
                  </div>
                <?php endforeach; ?>
              </div>
            <?php endif; ?>
          </div>
        <?php endif; ?>

        <!-- TAB: SITE SETTINGS -->
        <?php if ($tab === 'settings'): ?>
          <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl p-8 max-w-4xl">
            <h2 class="text-xl font-black text-white mb-1">General Site & Branding Settings</h2>
            <p class="text-xs text-slate-400 mb-8">Configurations are stored in MySQL <code>settings</code> table and dynamically served across the platform.</p>

            <form method="POST" action="<?= app_url('admin/index.php?tab=settings') ?>" enctype="multipart/form-data" class="space-y-6">
              <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
              <input type="hidden" name="admin_action" value="update_site_settings">

              <!-- Logo & Favicon Previews and Uploads -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Website Logo</label>
                  <div class="flex items-center gap-4 mb-3">
                    <img src="<?= sanitize_output($siteLogo) ?>" alt="Site Logo" class="h-12 max-w-[160px] object-contain rounded-lg p-1 bg-slate-900 border border-slate-800" onerror="this.src='/assets/logo.png'">
                    <span class="text-xs text-slate-400">Current active logo</span>
                  </div>
                  <input type="file" name="logo_file" accept="image/*" class="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600">
                </div>

                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Website Favicon</label>
                  <div class="flex items-center gap-4 mb-3">
                    <img src="<?= sanitize_output($siteFavicon) ?>" alt="Site Favicon" class="w-10 h-10 object-contain rounded-lg p-1 bg-slate-900 border border-slate-800" onerror="this.src='/favicon.ico'">
                    <span class="text-xs text-slate-400">Browser tab icon</span>
                  </div>
                  <input type="file" name="favicon_file" accept="image/*,.ico" class="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600">
                </div>
              </div>

              <!-- General Names -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Website Name (English)</label>
                  <input type="text" name="site_name" value="<?= sanitize_output(get_setting('site_name', 'Amader Job Online')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Website Name (বাংলা)</label>
                  <input type="text" name="site_name_bn" value="<?= sanitize_output(get_setting('site_name_bn', 'আমাদের জব অনলাইন')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
                </div>
              </div>

              <!-- Subtitles -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Subtitle (English)</label>
                  <input type="text" name="site_subtitle" value="<?= sanitize_output(get_setting('site_subtitle', 'Leading Micro Task Platform')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Subtitle (বাংলা)</label>
                  <input type="text" name="site_subtitle_bn" value="<?= sanitize_output(get_setting('site_subtitle_bn', 'বাংলাদেশের বিশ্বস্ত মাইক্রো টাস্ক প্ল্যাটফর্ম')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
                </div>
              </div>

              <!-- Contact Numbers -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Support Email</label>
                  <input type="email" name="support_email" value="<?= sanitize_output(get_setting('support_email', 'support@amaderjob.com')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">WhatsApp Helpline</label>
                  <input type="text" name="whatsapp_number" value="<?= sanitize_output(get_setting('whatsapp_number', '+8801700000000')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Phone Helpline</label>
                  <input type="text" name="helpline_phone" value="<?= sanitize_output(get_setting('helpline_phone', '+8801800000000')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
                </div>
              </div>

              <!-- Financial Thresholds -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">USD to BDT Rate</label>
                  <input type="number" step="0.01" name="usd_to_bdt_rate" value="<?= sanitize_output(get_setting('usd_to_bdt_rate', '120.00')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Min Deposit (BDT)</label>
                  <input type="number" step="0.01" name="min_deposit_bdt" value="<?= sanitize_output(get_setting('min_deposit_bdt', '50.00')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Min Withdraw (BDT)</label>
                  <input type="number" step="0.01" name="min_withdraw_bdt" value="<?= sanitize_output(get_setting('min_withdraw_bdt', '100.00')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
                </div>
              </div>

              <!-- Notice Marquee -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Top Banner Notice (English)</label>
                <textarea name="notice_marquee" rows="2" class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"><?= sanitize_output(get_setting('notice_marquee', '')) ?></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Top Banner Notice (বাংলা)</label>
                <textarea name="notice_marquee_bn" rows="2" class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"><?= sanitize_output(get_setting('notice_marquee_bn', '')) ?></textarea>
              </div>

              <!-- Maintenance Mode -->
              <div class="flex items-center gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <input type="checkbox" id="maintMode" name="maintenance_mode" value="1" <?= get_setting('maintenance_mode', '0') === '1' ? 'checked' : '' ?> class="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500">
                <label for="maintMode" class="text-xs font-bold text-white cursor-pointer">
                  Activate Maintenance Mode (Visitors will see a maintenance notice; admins can still manage)
                </label>
              </div>

              <button type="submit" class="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-sm transition-all">Save Website Settings</button>
            </form>
          </div>
        <?php endif; ?>

        <!-- TAB: REFERRAL -->
        <?php if ($tab === 'referral'): ?>
          <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl p-8 max-w-2xl">
            <h2 class="text-xl font-black text-white mb-1">Referral Program Configurations</h2>
            <p class="text-xs text-slate-400 mb-8">Manage affiliate commissions and referral bonuses in MySQL.</p>

            <form method="POST" action="<?= app_url('admin/index.php?tab=referral') ?>" class="space-y-6">
              <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
              <input type="hidden" name="admin_action" value="update_referral_settings">

              <div class="flex items-center gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <input type="checkbox" id="refEnabled" name="referral_enabled" value="1" <?= get_setting('referral_enabled', '1') === '1' ? 'checked' : '' ?> class="w-4 h-4 rounded text-emerald-500">
                <label for="refEnabled" class="text-xs font-bold text-white cursor-pointer">Enable Referral & Affiliate System</label>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Referral Commission Rate (%)</label>
                <input type="number" step="0.1" name="referral_percentage" value="<?= sanitize_output(get_setting('referral_percentage', '5.0')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                <p class="text-[11px] text-slate-400 mt-1">Percentage of deposit or task earnings rewarded to referrer.</p>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Minimum Referral Bonus Payout (BDT)</label>
                <input type="number" step="1" name="referral_minimum" value="<?= sanitize_output(get_setting('referral_minimum', '100')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
              </div>

              <button type="submit" class="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-sm transition-all">Save Referral Settings</button>
            </form>
          </div>
        <?php endif; ?>

        <!-- TAB: SMTP MAILER -->
        <?php if ($tab === 'smtp'): ?>
          <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl p-8 max-w-3xl">
            <h2 class="text-xl font-black text-white mb-1">SMTP Email Dispatch Configuration</h2>
            <p class="text-xs text-slate-400 mb-8">Configure your cPanel Webmail or external SMTP server for OTPs and ticket notifications.</p>

            <form method="POST" action="<?= app_url('admin/index.php?tab=smtp') ?>" class="space-y-6">
              <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
              <input type="hidden" name="admin_action" value="update_smtp_settings">

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">SMTP Host</label>
                  <input type="text" name="smtp_host" value="<?= sanitize_output(get_setting('smtp_host', 'mail.amaderjob.com')) ?>" placeholder="mail.amaderjob.com" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">SMTP Port</label>
                  <input type="text" name="smtp_port" value="<?= sanitize_output(get_setting('smtp_port', '587')) ?>" placeholder="587 / 465" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">SMTP Username / Email</label>
                  <input type="text" name="smtp_username" value="<?= sanitize_output(get_setting('smtp_username', 'info@amaderjob.com')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">SMTP Password</label>
                  <input type="password" name="smtp_password" placeholder="Leave blank to keep unchanged" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Encryption</label>
                  <select name="smtp_encryption" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                    <option value="tls" <?= get_setting('smtp_encryption', 'tls') === 'tls' ? 'selected' : '' ?>>TLS (Port 587)</option>
                    <option value="ssl" <?= get_setting('smtp_encryption', 'tls') === 'ssl' ? 'selected' : '' ?>>SSL (Port 465)</option>
                    <option value="none" <?= get_setting('smtp_encryption', 'tls') === 'none' ? 'selected' : '' ?>>None (Port 25)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">From Email</label>
                  <input type="email" name="smtp_from_email" value="<?= sanitize_output(get_setting('smtp_from_email', 'info@amaderjob.com')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">From Name</label>
                  <input type="text" name="smtp_from_name" value="<?= sanitize_output(get_setting('smtp_from_name', 'Amader Job')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm">
                </div>
              </div>

              <button type="submit" class="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-sm transition-all">Save SMTP Credentials</button>
            </form>

            <div class="mt-10 pt-8 border-t border-slate-800">
              <h3 class="text-sm font-bold text-white mb-2">Send Live Test Email</h3>
              <form method="POST" action="<?= app_url('admin/index.php?tab=smtp') ?>" class="flex gap-3">
                <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                <input type="hidden" name="admin_action" value="test_smtp_email">
                <input type="email" name="test_recipient_email" required placeholder="your-email@gmail.com" class="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs">
                <button type="submit" class="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors">Send Test Email</button>
              </form>
            </div>
          </div>
        <?php endif; ?>

        <!-- TAB: SECURITY (ADMIN PASSWORD) -->
        <?php if ($tab === 'security'): ?>
          <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl p-8 max-w-md">
            <h2 class="text-xl font-black text-white mb-1">Change Admin Password</h2>
            <p class="text-xs text-slate-400 mb-8">Update the login password for admin account: <strong class="text-white"><?= sanitize_output($adminUsername) ?></strong></p>

            <form method="POST" action="<?= app_url('admin/index.php?tab=security') ?>" class="space-y-5">
              <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
              <input type="hidden" name="admin_action" value="change_admin_password">

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">New Password</label>
                <input type="password" name="new_admin_password" required placeholder="••••••••" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Confirm New Password</label>
                <input type="password" name="confirm_admin_password" required placeholder="••••••••" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none">
              </div>

              <button type="submit" class="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-sm transition-all">Update Admin Password</button>
            </form>
          </div>
        <?php endif; ?>

      </div>
    </main>
  </div>

  <!-- Mobile Drawer Toggle Script -->
  <script>
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('sidebarDrawer');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    const closeBtn = document.getElementById('closeDrawerBtn');

    function openDrawer() {
      drawer.classList.remove('-translate-x-full');
      backdrop.classList.remove('hidden');
    }

    function closeDrawer() {
      drawer.classList.add('-translate-x-full');
      backdrop.classList.add('hidden');
    }

    if (mobileBtn) mobileBtn.addEventListener('click', openDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  </script>
</body>
</html>
