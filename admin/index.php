<?php
/**
 * Amader Job Online - Standalone Production Admin Panel
 * Secure, session-authenticated management dashboard for cPanel hosting.
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
    <body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 shadow-inner">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h1 class="text-2xl font-black tracking-tight text-white">Admin Control Center</h1>
          <p class="text-xs text-slate-400 mt-1">Amader Job Online &bull; cPanel Management</p>
        </div>

        <?php if (!empty($loginError)): ?>
          <div class="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <svg class="w-5 h-5 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span><?= sanitize_output($loginError) ?></span>
          </div>
        <?php endif; ?>

        <?php if (!$db): ?>
          <div class="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <strong>Notice:</strong> Database is not yet connected. Configure your MySQL credentials in <code>.env</code> file, then import <code>database.sql</code> via phpMyAdmin.
          </div>
        <?php endif; ?>

        <form method="POST" action="<?= app_url('admin/index.php') ?>" class="space-y-5">
          <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Admin Email or Username</label>
            <input type="text" name="email_or_user" required placeholder="admin@amaderjob.com" class="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <input type="password" name="password" required placeholder="••••••••" class="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm">
          </div>

          <button type="submit" name="admin_login_submit" value="1" class="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm flex items-center justify-center gap-2">
            <span>Sign In to Admin Panel</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-700/60 text-center">
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

        // Update Site Settings
        if ($postAction === 'update_site_settings') {
            $keys = [
                'site_name', 'site_name_bn', 'site_subtitle', 'site_subtitle_bn',
                'support_email', 'whatsapp_number', 'helpline_phone',
                'min_deposit_bdt', 'min_withdraw_bdt', 'usd_to_bdt_rate',
                'notice_marquee', 'notice_marquee_bn', 'maintenance_mode',
                'deposit_bonus_percent'
            ];
            foreach ($keys as $k) {
                if (isset($_POST[$k])) {
                    set_setting($k, trim($_POST[$k]));
                }
            }
            $actionMsg = 'General website settings updated successfully!';
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

            // Only update password if a new one is typed
            $newPassword = trim($_POST['smtp_password'] ?? '');
            if (!empty($newPassword)) {
                set_setting('smtp_password', $newPassword);
            }

            $actionMsg = 'SMTP settings saved! Database settings now take priority over .env';
        }

        // Send Test Email
        if ($postAction === 'test_smtp_email') {
            $testTo = trim($_POST['test_recipient_email'] ?? '');
            if (!filter_var($testTo, FILTER_VALIDATE_EMAIL)) {
                $actionError = 'Invalid test recipient email address.';
            } else {
                $mailer = new SmtpMailer();
                $testHtml = "<h2>Amader Job SMTP Test</h2><p>This is a test message from your Admin Panel. SMTP is working properly on " . date('r') . ".</p>";
                $smtpTestResult = $mailer->send($testTo, "Amader Job - SMTP Test", $testHtml);
                if ($smtpTestResult['success']) {
                    $actionMsg = "Test email sent successfully to $testTo!";
                } else {
                    $actionError = "SMTP Test Failed: " . ($smtpTestResult['error'] ?? 'Unknown error');
                }
            }
        }

        // User Management Actions
        if ($postAction === 'update_user_balance') {
            $userId = (int)($_POST['user_id'] ?? 0);
            $earning = (float)($_POST['earning_balance_bdt'] ?? 0);
            $deposit = (float)($_POST['deposit_balance_bdt'] ?? 0);
            if ($db && $userId > 0) {
                $stmt = $db->prepare("UPDATE users SET earning_balance_bdt = ?, deposit_balance_bdt = ? WHERE id = ?");
                $stmt->execute([$earning, $deposit, $userId]);
                $actionMsg = "User balance updated successfully!";
            }
        }

        if ($postAction === 'toggle_blue_badge') {
            $userId = (int)($_POST['user_id'] ?? 0);
            $badgeStatus = (int)($_POST['has_blue_badge'] ?? 0);
            if ($db && $userId > 0) {
                $stmt = $db->prepare("UPDATE users SET has_blue_badge = ?, blue_badge_plan = ? WHERE id = ?");
                $stmt->execute([$badgeStatus, $badgeStatus ? 'yearly' : null, $userId]);
                $actionMsg = "User Blue Badge status updated!";
            }
        }

        if ($postAction === 'toggle_ban_user') {
            $userId = (int)($_POST['user_id'] ?? 0);
            $status = $_POST['status'] === 'banned' ? 'banned' : 'active';
            $reason = trim($_POST['ban_reason'] ?? 'Admin action');
            if ($db && $userId > 0) {
                $stmt = $db->prepare("UPDATE users SET status = ?, ban_reason = ? WHERE id = ?");
                $stmt->execute([$status, $status === 'banned' ? $reason : null, $userId]);
                $actionMsg = "User status changed to " . strtoupper($status);
            }
        }

        // Submissions Review
        if ($postAction === 'review_submission') {
            $subId = $_POST['submission_id'] ?? '';
            $decision = $_POST['decision'] ?? ''; // 'approved' or 'rejected'
            $feedback = trim($_POST['feedback'] ?? '');

            if ($db && $subId) {
                $stmt = $db->prepare("SELECT * FROM task_submissions WHERE id = ?");
                $stmt->execute([$subId]);
                $sub = $stmt->fetch();

                if ($sub) {
                    $newStatus = ($decision === 'approved') ? 'approved' : 'rejected';
                    $upd = $db->prepare("UPDATE task_submissions SET status = ?, feedback = ? WHERE id = ?");
                    $upd->execute([$newStatus, $feedback, $subId]);

                    if ($newStatus === 'approved') {
                        // Credit worker earning balance and increment completed slots
                        $db->prepare("UPDATE users SET earning_balance_bdt = earning_balance_bdt + ?, completed_tasks_count = completed_tasks_count + 1 WHERE uid = ? OR id = ?")
                           ->execute([$sub['earned_bdt'], $sub['worker_id'], $sub['worker_id']]);

                        $db->prepare("UPDATE jobs SET completed_slots = completed_slots + 1 WHERE id = ?")
                           ->execute([$sub['job_id']]);
                    }
                    $actionMsg = "Task submission marked as " . strtoupper($newStatus);
                }
            }
        }

        // Deposits / Withdrawals Review
        if ($postAction === 'review_transaction') {
            $txId = $_POST['tx_id'] ?? '';
            $status = $_POST['decision'] === 'approved' ? 'completed' : 'rejected';

            if ($db && $txId) {
                $stmt = $db->prepare("SELECT * FROM wallet_transactions WHERE id = ?");
                $stmt->execute([$txId]);
                $tx = $stmt->fetch();

                if ($tx) {
                    $db->prepare("UPDATE wallet_transactions SET status = ? WHERE id = ?")->execute([$status, $txId]);

                    if ($status === 'completed' && $tx['type'] === 'deposit') {
                        // Credit deposit balance
                        $db->prepare("UPDATE users SET deposit_balance_bdt = deposit_balance_bdt + ? WHERE uid = ? OR id = ?")
                           ->execute([$tx['amount_bdt'], $tx['user_id'], $tx['user_id']]);
                    } elseif ($status === 'rejected' && $tx['type'] === 'withdrawal') {
                        // Refund worker earning balance
                        $db->prepare("UPDATE users SET earning_balance_bdt = earning_balance_bdt + ? WHERE uid = ? OR id = ?")
                           ->execute([$tx['amount_bdt'], $tx['user_id'], $tx['user_id']]);
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
                // Insert message
                $stmt = $db->prepare("INSERT INTO ticket_messages (ticket_id, sender, sender_name, message, created_at) VALUES (?, 'admin', 'Amader Job Support', ?, NOW())");
                $stmt->execute([$ticketId, $replyMsg]);

                // Update ticket
                $db->prepare("UPDATE support_tickets SET status = ?, unread_user = 1, unread_admin = 0, updated_at = NOW() WHERE id = ?")
                   ->execute([$newStatus, $ticketId]);

                // Send email notification to user if possible
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

        // Change Ticket Status
        if ($postAction === 'update_ticket_status') {
            $ticketId = trim($_POST['ticket_id'] ?? '');
            $status = trim($_POST['status'] ?? 'open');
            if ($db && $ticketId) {
                $db->prepare("UPDATE support_tickets SET status = ?, updated_at = NOW() WHERE id = ?")
                   ->execute([$status, $ticketId]);
                $actionMsg = "Ticket #{$ticketId} status updated to " . strtoupper($status);
            }
        }
    }
}

// Fetch stats for dashboard
$stats = [
    'users_count' => 0,
    'jobs_count' => 0,
    'submissions_pending' => 0,
    'deposits_pending' => 0,
    'withdrawals_pending' => 0,
    'tickets_open' => 0
];

if ($db) {
    try {
        $stats['users_count'] = (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $stats['jobs_count'] = (int)$db->query("SELECT COUNT(*) FROM jobs WHERE status = 'active'")->fetchColumn();
        $stats['submissions_pending'] = (int)$db->query("SELECT COUNT(*) FROM task_submissions WHERE status = 'pending'")->fetchColumn();
        $stats['deposits_pending'] = (int)$db->query("SELECT COUNT(*) FROM wallet_transactions WHERE type = 'deposit' AND status = 'pending'")->fetchColumn();
        $stats['withdrawals_pending'] = (int)$db->query("SELECT COUNT(*) FROM wallet_transactions WHERE type = 'withdrawal' AND status = 'pending'")->fetchColumn();
        $stats['tickets_open'] = (int)$db->query("SELECT COUNT(*) FROM support_tickets WHERE status = 'open'")->fetchColumn();
    } catch (Exception $e) {}
}

$mailer = new SmtpMailer();
$smtpConfigured = $mailer->isConfigured();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amader Job Online - Admin Panel</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .badge-status { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col md:flex-row">

  <!-- Sidebar -->
  <aside class="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
    <div class="p-6 border-b border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-lg">
          AJ
        </div>
        <div>
          <h2 class="font-black text-white text-base tracking-tight leading-tight">Amader Job</h2>
          <span class="text-[10px] uppercase font-bold tracking-wider text-emerald-400">cPanel Admin</span>
        </div>
      </div>
    </div>

    <nav class="p-4 space-y-1 text-sm font-semibold flex-1">
      <a href="?tab=dashboard" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all <?= $tab === 'dashboard' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white' ?>">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        <span>Dashboard</span>
      </a>

      <a href="?tab=users" class="flex items-center justify-between px-4 py-3 rounded-xl transition-all <?= $tab === 'users' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white' ?>">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          <span>Users</span>
        </div>
        <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400"><?= $stats['users_count'] ?></span>
      </a>

      <a href="?tab=submissions" class="flex items-center justify-between px-4 py-3 rounded-xl transition-all <?= $tab === 'submissions' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white' ?>">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
          <span>Submissions</span>
        </div>
        <?php if ($stats['submissions_pending'] > 0): ?>
          <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold"><?= $stats['submissions_pending'] ?></span>
        <?php endif; ?>
      </a>

      <a href="?tab=jobs" class="flex items-center justify-between px-4 py-3 rounded-xl transition-all <?= $tab === 'jobs' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white' ?>">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span>Jobs</span>
        </div>
        <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400"><?= $stats['jobs_count'] ?></span>
      </a>

      <a href="?tab=deposits" class="flex items-center justify-between px-4 py-3 rounded-xl transition-all <?= $tab === 'deposits' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white' ?>">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
          <span>Deposits</span>
        </div>
        <?php if ($stats['deposits_pending'] > 0): ?>
          <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold"><?= $stats['deposits_pending'] ?></span>
        <?php endif; ?>
      </a>

      <a href="?tab=withdrawals" class="flex items-center justify-between px-4 py-3 rounded-xl transition-all <?= $tab === 'withdrawals' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white' ?>">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          <span>Withdrawals</span>
        </div>
        <?php if ($stats['withdrawals_pending'] > 0): ?>
          <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold"><?= $stats['withdrawals_pending'] ?></span>
        <?php endif; ?>
      </a>

      <a href="?tab=tickets" class="flex items-center justify-between px-4 py-3 rounded-xl transition-all <?= $tab === 'tickets' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white' ?>">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
          <span>Support Tickets</span>
        </div>
        <?php if ($stats['tickets_open'] > 0): ?>
          <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold"><?= $stats['tickets_open'] ?></span>
        <?php endif; ?>
      </a>

      <a href="?tab=smtp" class="flex items-center justify-between px-4 py-3 rounded-xl transition-all <?= $tab === 'smtp' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white' ?>">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span>SMTP Settings</span>
        </div>
        <span class="w-2.5 h-2.5 rounded-full <?= $smtpConfigured ? 'bg-emerald-400' : 'bg-amber-400' ?>" title="<?= $smtpConfigured ? 'Configured' : 'Needs Setup' ?>"></span>
      </a>

      <a href="?tab=settings" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all <?= $tab === 'settings' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white' ?>">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        <span>Site Settings</span>
      </a>

      <a href="?tab=profile" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all <?= $tab === 'profile' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white' ?>">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        <span>Admin Password</span>
      </a>
    </nav>

    <div class="p-4 border-t border-slate-800 space-y-2">
      <a href="<?= app_url() ?>" target="_blank" class="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        <span>Open Website</span>
      </a>
      <a href="?action=logout" class="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        <span>Log Out</span>
      </a>
    </div>
  </aside>

  <!-- Main Content Area -->
  <main class="flex-1 p-6 md:p-10 overflow-y-auto">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-800/80 mb-8">
      <div>
        <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight capitalize">
          <?= str_replace('_', ' ', $tab) ?>
        </h1>
        <p class="text-xs md:text-sm text-slate-400 mt-1">
          Connected to: <code class="text-emerald-400 font-mono"><?= sanitize_output($appUrl) ?></code>
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Production</span>
        </span>
        <span class="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
          <?= sanitize_output($_SESSION['admin_email'] ?? 'admin') ?>
        </span>
      </div>
    </header>

    <!-- Success & Error Banners -->
    <?php if (!empty($actionMsg)): ?>
      <div class="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 shadow-lg">
        <svg class="w-5 h-5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <span><?= sanitize_output($actionMsg) ?></span>
      </div>
    <?php endif; ?>

    <?php if (!empty($actionError)): ?>
      <div class="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 shadow-lg">
        <svg class="w-5 h-5 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span><?= sanitize_output($actionError) ?></span>
      </div>
    <?php endif; ?>

    <!-- TAB: DASHBOARD -->
    <?php if ($tab === 'dashboard'): ?>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Users</span>
            <div class="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
          </div>
          <p class="text-3xl font-black text-white mt-4"><?= number_format($stats['users_count']) ?></p>
          <a href="?tab=users" class="text-xs font-bold text-blue-400 hover:text-blue-300 mt-2 inline-block">Manage Users &rarr;</a>
        </div>

        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Submissions</span>
            <div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            </div>
          </div>
          <p class="text-3xl font-black text-white mt-4"><?= number_format($stats['submissions_pending']) ?></p>
          <a href="?tab=submissions" class="text-xs font-bold text-amber-400 hover:text-amber-300 mt-2 inline-block">Review Proofs &rarr;</a>
        </div>

        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Deposits</span>
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <p class="text-3xl font-black text-white mt-4"><?= number_format($stats['deposits_pending']) ?></p>
          <a href="?tab=deposits" class="text-xs font-bold text-emerald-400 hover:text-emerald-300 mt-2 inline-block">Check bKash/Nagad &rarr;</a>
        </div>
      </div>

      <!-- System Quick Status -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 mb-8">
        <h3 class="text-base font-bold text-white mb-4">System Operational Status</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 block mb-1">Database Driver</span>
            <span class="font-bold text-emerald-400 font-mono"><?= $db ? 'PDO MySQL Connected' : 'Disconnected' ?></span>
          </div>
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 block mb-1">SMTP Status</span>
            <span class="font-bold <?= $smtpConfigured ? 'text-emerald-400' : 'text-amber-400' ?>">
              <?= $smtpConfigured ? 'Ready & Configured' : 'Needs Configuration' ?>
            </span>
          </div>
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 block mb-1">PHP Version</span>
            <span class="font-bold text-slate-200 font-mono"><?= phpversion() ?></span>
          </div>
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 block mb-1">Single Truth Domain</span>
            <span class="font-bold text-emerald-400 truncate block font-mono"><?= sanitize_output($appUrl) ?></span>
          </div>
        </div>
      </div>
    <?php endif; ?>

    <!-- TAB: SMTP & EMAIL SETTINGS -->
    <?php if ($tab === 'smtp'): ?>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Configuration Form -->
        <div class="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <div class="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
            <div>
              <h3 class="text-lg font-black text-white">SMTP Mail Server Configuration</h3>
              <p class="text-xs text-slate-400 mt-1">Configured settings in MySQL database take priority over .env</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold <?= $smtpConfigured ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30' ?>">
              <?= $smtpConfigured ? 'Active' : 'Unconfigured' ?>
            </span>
          </div>

          <form method="POST" action="?tab=smtp" class="space-y-6">
            <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
            <input type="hidden" name="admin_action" value="update_smtp_settings">

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">SMTP Host</label>
                <input type="text" name="smtp_host" value="<?= sanitize_output(get_setting('smtp_host', env('SMTP_HOST', ''))) ?>" placeholder="mail.yourdomain.com" required class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">SMTP Port</label>
                <input type="number" name="smtp_port" value="<?= sanitize_output(get_setting('smtp_port', env('SMTP_PORT', '587'))) ?>" placeholder="587" required class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">SMTP Username</label>
                <input type="text" name="smtp_username" value="<?= sanitize_output(get_setting('smtp_username', env('SMTP_USERNAME', ''))) ?>" placeholder="info@yourdomain.com" required class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">SMTP Password</label>
                <input type="password" name="smtp_password" placeholder="<?= !empty(get_setting('smtp_password', env('SMTP_PASSWORD', ''))) ? '•••••••••••• (Unchanged)' : 'Enter SMTP password' ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
                <span class="text-[11px] text-slate-500 mt-1 block">Leave blank to keep existing password</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Encryption</label>
                <?php $enc = strtolower(get_setting('smtp_encryption', env('SMTP_ENCRYPTION', 'tls'))); ?>
                <select name="smtp_encryption" class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
                  <option value="tls" <?= $enc === 'tls' ? 'selected' : '' ?>>TLS (Recommended - Port 587)</option>
                  <option value="ssl" <?= $enc === 'ssl' ? 'selected' : '' ?>>SSL (Port 465)</option>
                  <option value="none" <?= $enc === 'none' ? 'selected' : '' ?>>None (Plain - Port 25/587)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">From Email</label>
                <input type="email" name="smtp_from_email" value="<?= sanitize_output(get_setting('smtp_from_email', env('SMTP_FROM_EMAIL', ''))) ?>" placeholder="noreply@yourdomain.com" required class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">From Name</label>
                <input type="text" name="smtp_from_name" value="<?= sanitize_output(get_setting('smtp_from_name', env('SMTP_FROM_NAME', 'Amader Job'))) ?>" placeholder="Amader Job" required class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
              </div>
            </div>

            <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="email_verification_enabled" value="1" <?= get_setting('email_verification_enabled', '1') === '1' ? 'checked' : '' ?> class="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700">
                <span class="text-sm font-semibold text-slate-300">Require Email OTP Verification for Sign Up</span>
              </label>

              <button type="submit" class="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all text-sm">
                Save SMTP Settings
              </button>
            </div>
          </form>
        </div>

        <!-- Live SMTP Test Card -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                ⚡
              </div>
              <div>
                <h4 class="font-black text-white text-base">Test SMTP Connection</h4>
                <p class="text-xs text-slate-400">Send an instant test email</p>
              </div>
            </div>

            <p class="text-xs text-slate-400 leading-relaxed mb-6">
              Verify that your cPanel SMTP credentials and firewall ports are open and communicating properly.
            </p>

            <form method="POST" action="?tab=smtp" class="space-y-4">
              <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
              <input type="hidden" name="admin_action" value="test_smtp_email">

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Recipient Email Address</label>
                <input type="email" name="test_recipient_email" placeholder="your-email@example.com" required class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
              </div>

              <button type="submit" class="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-600/30 transition-all text-sm flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                <span>Send Test Email Now</span>
              </button>
            </form>
          </div>

          <?php if ($smtpTestResult !== null && !empty($smtpTestResult['logs'])): ?>
            <div class="mt-6 pt-4 border-t border-slate-800">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Connection Handshake Log:</span>
              <div class="bg-black/80 rounded-xl p-3 text-[10px] font-mono text-slate-300 max-h-48 overflow-y-auto space-y-1">
                <?php foreach ($smtpTestResult['logs'] as $logLine): ?>
                  <div><?= sanitize_output($logLine) ?></div>
                <?php endforeach; ?>
              </div>
            </div>
          <?php endif; ?>
        </div>
      </div>
    <?php endif; ?>

    <!-- TAB: USERS -->
    <?php if ($tab === 'users'): ?>
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
          <h3 class="text-lg font-black text-white">Registered Users Directory</h3>
          <span class="text-xs text-slate-400">Total: <?= $stats['users_count'] ?> Members</span>
        </div>

        <?php
        $users = [];
        if ($db) {
            try {
                $stmt = $db->query("SELECT * FROM users ORDER BY id DESC LIMIT 50");
                $users = $stmt->fetchAll();
            } catch (Exception $e) {}
        }
        ?>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th class="py-3 px-4">User</th>
                <th class="py-3 px-4">UID / Phone</th>
                <th class="py-3 px-4">Earning Bal.</th>
                <th class="py-3 px-4">Deposit Bal.</th>
                <th class="py-3 px-4">Blue Badge</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <?php foreach ($users as $u): ?>
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="py-3 px-4">
                    <div class="font-bold text-white"><?= sanitize_output($u['name']) ?></div>
                    <div class="text-xs text-slate-400"><?= sanitize_output($u['email']) ?></div>
                  </td>
                  <td class="py-3 px-4 font-mono text-xs text-slate-300">
                    <div>UID: <?= sanitize_output($u['uid']) ?></div>
                    <div class="text-slate-500"><?= sanitize_output($u['phone'] ?: 'N/A') ?></div>
                  </td>
                  <td class="py-3 px-4 font-bold text-emerald-400 font-mono">
                    ৳<?= number_format((float)$u['earning_balance_bdt'], 2) ?>
                  </td>
                  <td class="py-3 px-4 font-bold text-blue-400 font-mono">
                    ৳<?= number_format((float)$u['deposit_balance_bdt'], 2) ?>
                  </td>
                  <td class="py-3 px-4">
                    <form method="POST" action="?tab=users" class="inline">
                      <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                      <input type="hidden" name="admin_action" value="toggle_blue_badge">
                      <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                      <input type="hidden" name="has_blue_badge" value="<?= $u['has_blue_badge'] ? '0' : '1' ?>">
                      <button type="submit" class="px-2.5 py-1 rounded-full text-xs font-bold transition-all <?= $u['has_blue_badge'] ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-500 hover:text-slate-300' ?>">
                        <?= $u['has_blue_badge'] ? '✓ Verified Badge' : '+ Give Badge' ?>
                      </button>
                    </form>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold <?= $u['status'] === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400' ?>">
                      <?= ucfirst($u['status']) ?>
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right space-x-2">
                    <!-- Edit balance modal / inline trigger -->
                    <form method="POST" action="?tab=users" class="inline" onsubmit="return confirm('Toggle status for this user?');">
                      <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                      <input type="hidden" name="admin_action" value="toggle_ban_user">
                      <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                      <input type="hidden" name="status" value="<?= $u['status'] === 'active' ? 'banned' : 'active' ?>">
                      <button type="submit" class="px-3 py-1 rounded-lg text-xs font-bold <?= $u['status'] === 'active' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' ?>">
                        <?= $u['status'] === 'active' ? 'Ban' : 'Unban' ?>
                      </button>
                    </form>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    <?php endif; ?>

    <!-- TAB: SUBMISSIONS REVIEW -->
    <?php if ($tab === 'submissions'): ?>
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div class="pb-6 border-b border-slate-800 mb-6">
          <h3 class="text-lg font-black text-white">Worker Task Proof Submissions</h3>
          <p class="text-xs text-slate-400 mt-1">Approve to automatically credit worker balance and complete slot</p>
        </div>

        <?php
        $subs = [];
        if ($db) {
            try {
                $stmt = $db->query("SELECT s.*, j.title as job_title FROM task_submissions s LEFT JOIN jobs j ON s.job_id = j.id ORDER BY s.submitted_at DESC LIMIT 30");
                $subs = $stmt->fetchAll();
            } catch (Exception $e) {}
        }
        ?>

        <div class="space-y-4">
          <?php foreach ($subs as $s): ?>
            <div class="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-emerald-400">৳<?= number_format((float)$s['earned_bdt'], 2) ?></span>
                  <span class="text-xs text-slate-500">&bull;</span>
                  <span class="text-xs font-semibold text-slate-400">Worker: <?= sanitize_output($s['worker_name']) ?> (<?= sanitize_output($s['worker_id']) ?>)</span>
                </div>
                <h4 class="font-bold text-white text-sm"><?= sanitize_output($s['job_title'] ?: $s['job_id']) ?></h4>
                <p class="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 mt-2 font-mono">
                  <?= sanitize_output($s['proof_text']) ?>
                </p>
                <?php if (!empty($s['proof_url'])): ?>
                  <a href="<?= sanitize_output($s['proof_url']) ?>" target="_blank" class="text-xs text-blue-400 hover:underline block mt-1">
                    Proof Link: <?= sanitize_output($s['proof_url']) ?> &rarr;
                  </a>
                <?php endif; ?>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <?php if ($s['status'] === 'pending'): ?>
                  <form method="POST" action="?tab=submissions" class="inline">
                    <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                    <input type="hidden" name="admin_action" value="review_submission">
                    <input type="hidden" name="submission_id" value="<?= $s['id'] ?>">
                    <input type="hidden" name="decision" value="approved">
                    <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30">
                      Approve & Credit
                    </button>
                  </form>

                  <form method="POST" action="?tab=submissions" class="inline">
                    <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                    <input type="hidden" name="admin_action" value="review_submission">
                    <input type="hidden" name="submission_id" value="<?= $s['id'] ?>">
                    <input type="hidden" name="decision" value="rejected">
                    <button type="submit" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs">
                      Reject
                    </button>
                  </form>
                <?php else: ?>
                  <span class="px-3 py-1 rounded-full text-xs font-bold <?= $s['status'] === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400' ?>">
                    <?= ucfirst($s['status']) ?>
                  </span>
                <?php endif; ?>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    <?php endif; ?>

    <!-- TAB: DEPOSITS -->
    <?php if ($tab === 'deposits'): ?>
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div class="pb-6 border-b border-slate-800 mb-6">
          <h3 class="text-lg font-black text-white">Deposit Requests (bKash / Nagad / Rocket)</h3>
          <p class="text-xs text-slate-400 mt-1">Approve to credit user's deposit balance</p>
        </div>

        <?php
        $deposits = [];
        if ($db) {
            try {
                $stmt = $db->query("SELECT * FROM wallet_transactions WHERE type = 'deposit' ORDER BY created_at DESC LIMIT 30");
                $deposits = $stmt->fetchAll();
            } catch (Exception $e) {}
        }
        ?>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th class="py-3 px-4">User ID</th>
                <th class="py-3 px-4">Method / Account</th>
                <th class="py-3 px-4">TrxID</th>
                <th class="py-3 px-4">Amount</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <?php foreach ($deposits as $d): ?>
                <tr class="hover:bg-slate-800/30">
                  <td class="py-3 px-4 font-mono font-bold text-white"><?= sanitize_output($d['user_id']) ?></td>
                  <td class="py-3 px-4 uppercase font-bold text-xs text-emerald-400">
                    <?= sanitize_output($d['method'] ?: 'bKash') ?>
                    <span class="text-slate-400 block font-mono text-[11px]"><?= sanitize_output($d['account_number'] ?: 'N/A') ?></span>
                  </td>
                  <td class="py-3 px-4 font-mono text-xs text-amber-300 font-bold"><?= sanitize_output($d['trx_id'] ?: 'N/A') ?></td>
                  <td class="py-3 px-4 font-bold text-white font-mono">৳<?= number_format((float)$d['amount_bdt'], 2) ?></td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold <?= $d['status'] === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : ($d['status'] === 'pending' ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400') ?>">
                      <?= ucfirst($d['status']) ?>
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <?php if ($d['status'] === 'pending'): ?>
                      <form method="POST" action="?tab=deposits" class="inline">
                        <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                        <input type="hidden" name="admin_action" value="review_transaction">
                        <input type="hidden" name="tx_id" value="<?= $d['id'] ?>">
                        <input type="hidden" name="decision" value="approved">
                        <button type="submit" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs">
                          Approve
                        </button>
                      </form>
                      <form method="POST" action="?tab=deposits" class="inline">
                        <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                        <input type="hidden" name="admin_action" value="review_transaction">
                        <input type="hidden" name="tx_id" value="<?= $d['id'] ?>">
                        <input type="hidden" name="decision" value="rejected">
                        <button type="submit" class="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs">
                          Reject
                        </button>
                      </form>
                    <?php endif; ?>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    <?php endif; ?>

    <!-- TAB: WITHDRAWALS -->
    <?php if ($tab === 'withdrawals'): ?>
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div class="pb-6 border-b border-slate-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-black text-white">Withdrawal Payout Requests</h3>
            <p class="text-xs text-slate-400 mt-1">Approve after transferring funds via bKash, Nagad, or Rocket</p>
          </div>
          <span class="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">Pending: <?= $stats['withdrawals_pending'] ?></span>
        </div>

        <?php
        $withdrawals = [];
        if ($db) {
            try {
                $stmt = $db->query("SELECT * FROM wallet_transactions WHERE type = 'withdrawal' ORDER BY created_at DESC LIMIT 50");
                $withdrawals = $stmt->fetchAll();
            } catch (Exception $e) {}
        }
        ?>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th class="py-3 px-4">User ID</th>
                <th class="py-3 px-4">Payout Method</th>
                <th class="py-3 px-4">Receiver Number</th>
                <th class="py-3 px-4">Amount</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <?php if (empty($withdrawals)): ?>
                <tr>
                  <td colspan="6" class="py-8 text-center text-slate-500 text-xs">No withdrawal requests found.</td>
                </tr>
              <?php endif; ?>
              <?php foreach ($withdrawals as $w): ?>
                <tr class="hover:bg-slate-800/30">
                  <td class="py-3 px-4 font-mono font-bold text-white"><?= sanitize_output($w['user_id']) ?></td>
                  <td class="py-3 px-4 uppercase font-bold text-xs text-emerald-400">
                    <?= sanitize_output($w['method'] ?: 'bKash') ?>
                  </td>
                  <td class="py-3 px-4 font-mono text-xs text-amber-300 font-bold"><?= sanitize_output($w['account_number'] ?: 'N/A') ?></td>
                  <td class="py-3 px-4 font-bold text-white font-mono">৳<?= number_format((float)$w['amount_bdt'], 2) ?></td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold <?= $w['status'] === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : ($w['status'] === 'pending' ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400') ?>">
                      <?= ucfirst($w['status']) ?>
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <?php if ($w['status'] === 'pending'): ?>
                      <form method="POST" action="?tab=withdrawals" class="inline">
                        <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                        <input type="hidden" name="admin_action" value="review_transaction">
                        <input type="hidden" name="tx_id" value="<?= $w['id'] ?>">
                        <input type="hidden" name="decision" value="approved">
                        <button type="submit" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs mr-1">
                          Approve Paid
                        </button>
                      </form>
                      <form method="POST" action="?tab=withdrawals" class="inline">
                        <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                        <input type="hidden" name="admin_action" value="review_transaction">
                        <input type="hidden" name="tx_id" value="<?= $w['id'] ?>">
                        <input type="hidden" name="decision" value="rejected">
                        <button type="submit" class="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs" onclick="return confirm('Reject this withdrawal and refund balance to user?')">
                          Reject & Refund
                        </button>
                      </form>
                    <?php endif; ?>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    <?php endif; ?>

    <!-- TAB: TICKETS -->
    <?php if ($tab === 'tickets'): ?>
      <?php
      $activeTicketId = trim($_GET['ticket_id'] ?? '');
      $activeTicket = null;
      $ticketMessages = [];

      if ($db && $activeTicketId) {
          try {
              $stmt = $db->prepare("SELECT * FROM support_tickets WHERE id = ?");
              $stmt->execute([$activeTicketId]);
              $activeTicket = $stmt->fetch();

              if ($activeTicket) {
                  // Mark as read by admin
                  $db->prepare("UPDATE support_tickets SET unread_admin = 0 WHERE id = ?")->execute([$activeTicketId]);

                  // Fetch messages
                  $mStmt = $db->prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC");
                  $mStmt->execute([$activeTicketId]);
                  $ticketMessages = $mStmt->fetchAll();
              }
          } catch (Exception $e) {}
      }
      ?>

      <?php if ($activeTicket): ?>
        <!-- Conversation Detail View for Admin -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl max-w-4xl space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <a href="?tab=tickets" class="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                  &larr; Back to Tickets
                </a>
                <span class="text-slate-600">&bull;</span>
                <span class="font-mono text-xs text-slate-400 font-bold">#<?= sanitize_output($activeTicket['id']) ?></span>
                <span class="text-xs uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold"><?= sanitize_output($activeTicket['category']) ?></span>
                <span class="text-xs uppercase px-2 py-0.5 rounded-md <?= $activeTicket['priority'] === 'urgent' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400' ?> font-bold"><?= sanitize_output($activeTicket['priority']) ?></span>
              </div>
              <h3 class="text-xl font-black text-white"><?= sanitize_output($activeTicket['subject']) ?></h3>
              <p class="text-xs text-slate-400 mt-1">
                User: <strong class="text-slate-200"><?= sanitize_output($activeTicket['user_name']) ?></strong> (ID: <?= sanitize_output($activeTicket['user_id']) ?>) &bull; Email: <?= sanitize_output($activeTicket['user_email']) ?>
              </p>
            </div>

            <!-- Status Form -->
            <form method="POST" action="?tab=tickets&ticket_id=<?= urlencode($activeTicket['id']) ?>" class="flex items-center gap-2">
              <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
              <input type="hidden" name="admin_action" value="update_ticket_status">
              <input type="hidden" name="ticket_id" value="<?= sanitize_output($activeTicket['id']) ?>">
              <select name="status" class="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white">
                <option value="open" <?= $activeTicket['status'] === 'open' ? 'selected' : '' ?>>Open</option>
                <option value="in_progress" <?= $activeTicket['status'] === 'in_progress' ? 'selected' : '' ?>>In Progress</option>
                <option value="resolved" <?= $activeTicket['status'] === 'resolved' ? 'selected' : '' ?>>Resolved</option>
                <option value="closed" <?= $activeTicket['status'] === 'closed' ? 'selected' : '' ?>>Closed</option>
              </select>
              <button type="submit" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700">
                Update
              </button>
            </form>
          </div>

          <!-- Message Thread -->
          <div class="space-y-4 max-h-[500px] overflow-y-auto p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <?php foreach ($ticketMessages as $m): ?>
              <?php $isAdmin = ($m['sender'] === 'admin'); ?>
              <div class="flex flex-col <?= $isAdmin ? 'items-end' : 'items-start' ?>">
                <div class="flex items-center gap-2 mb-1 px-1">
                  <span class="text-[10px] font-bold <?= $isAdmin ? 'text-emerald-400' : 'text-blue-400' ?>">
                    <?= sanitize_output($m['sender_name'] ?: ($isAdmin ? 'Support Team' : 'User')) ?>
                  </span>
                  <span class="text-[10px] text-slate-500 font-mono">
                    <?= date('M j, g:i A', strtotime($m['created_at'])) ?>
                  </span>
                </div>
                <div class="p-4 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap <?= $isAdmin ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none' ?>">
                  <?= sanitize_output($m['message']) ?>
                </div>
              </div>
            <?php endforeach; ?>
          </div>

          <!-- Admin Reply Form -->
          <form method="POST" action="?tab=tickets&ticket_id=<?= urlencode($activeTicket['id']) ?>" class="space-y-4 pt-2">
            <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
            <input type="hidden" name="admin_action" value="reply_ticket">
            <input type="hidden" name="ticket_id" value="<?= sanitize_output($activeTicket['id']) ?>">

            <div>
              <label class="block text-xs font-bold uppercase text-slate-300 mb-2">Write Official Support Reply</label>
              <textarea name="reply_message" rows="4" required placeholder="Write clear, professional response to the user..." class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 leading-relaxed"></textarea>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-400 font-bold">Set Status After Reply:</span>
                <select name="ticket_status" class="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white">
                  <option value="in_progress">In Progress (Replied)</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <button type="submit" class="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2">
                <span>Send Official Reply</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </form>
        </div>

      <?php else: ?>
        <!-- Tickets Overview Table -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <div class="pb-6 border-b border-slate-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-black text-white">User Support Tickets</h3>
              <p class="text-xs text-slate-400 mt-1">Official helpdesk tickets submitted by users</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">Open Tickets: <?= $stats['tickets_open'] ?></span>
            </div>
          </div>

          <?php
          $tickets = [];
          if ($db) {
              try {
                  $stmt = $db->query("SELECT * FROM support_tickets ORDER BY unread_admin DESC, updated_at DESC LIMIT 50");
                  $tickets = $stmt->fetchAll();
              } catch (Exception $e) {}
          }
          ?>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th class="py-3 px-4">Ticket ID</th>
                  <th class="py-3 px-4">User</th>
                  <th class="py-3 px-4">Subject</th>
                  <th class="py-3 px-4">Category</th>
                  <th class="py-3 px-4">Priority</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <?php if (empty($tickets)): ?>
                  <tr>
                    <td colspan="7" class="py-8 text-center text-slate-500 text-xs">No support tickets found.</td>
                  </tr>
                <?php endif; ?>
                <?php foreach ($tickets as $t): ?>
                  <tr class="hover:bg-slate-800/30 <?= $t['unread_admin'] ? 'bg-emerald-500/5' : '' ?>">
                    <td class="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                      <span>#<?= sanitize_output($t['id']) ?></span>
                      <?php if ($t['unread_admin']): ?>
                        <span class="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Unread User Message"></span>
                      <?php endif; ?>
                    </td>
                    <td class="py-3 px-4">
                      <div class="font-bold text-white text-xs"><?= sanitize_output($t['user_name']) ?></div>
                      <div class="text-[11px] text-slate-400 font-mono"><?= sanitize_output($t['user_email'] ?: $t['user_id']) ?></div>
                    </td>
                    <td class="py-3 px-4 font-semibold text-slate-200 text-xs max-w-xs truncate">
                      <?= sanitize_output($t['subject']) ?>
                    </td>
                    <td class="py-3 px-4 uppercase text-[11px] font-bold text-slate-400">
                      <?= sanitize_output($t['category']) ?>
                    </td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold <?= $t['priority'] === 'urgent' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300' ?>">
                        <?= sanitize_output($t['priority']) ?>
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-bold <?= $t['status'] === 'resolved' ? 'bg-emerald-500/15 text-emerald-400' : ($t['status'] === 'open' ? 'bg-amber-500/15 text-amber-400' : ($t['status'] === 'in_progress' ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-800 text-slate-400')) ?>">
                        <?= ucfirst(str_replace('_', ' ', $t['status'])) ?>
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <a href="?tab=tickets&ticket_id=<?= urlencode($t['id']) ?>" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-1">
                        <span>View & Reply</span>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                      </a>
                    </td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </div>
      <?php endif; ?>
    <?php endif; ?>

    <!-- TAB: SITE SETTINGS -->
    <?php if ($tab === 'settings'): ?>
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl max-w-4xl">
        <h3 class="text-lg font-black text-white mb-6">Website General Settings</h3>
        <form method="POST" action="?tab=settings" class="space-y-6">
          <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
          <input type="hidden" name="admin_action" value="update_site_settings">

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-300 mb-2">Site Name (EN)</label>
              <input type="text" name="site_name" value="<?= sanitize_output(get_setting('site_name', 'Amader Job Online')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-300 mb-2">Site Name (BN)</label>
              <input type="text" name="site_name_bn" value="<?= sanitize_output(get_setting('site_name_bn', 'আমাদের জব অনলাইন')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-300 mb-2">Min Deposit (BDT)</label>
              <input type="number" step="0.01" name="min_deposit_bdt" value="<?= sanitize_output(get_setting('min_deposit_bdt', '50.00')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-300 mb-2">Min Withdraw (BDT)</label>
              <input type="number" step="0.01" name="min_withdraw_bdt" value="<?= sanitize_output(get_setting('min_withdraw_bdt', '100.00')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-300 mb-2">USD to BDT Rate</label>
              <input type="number" step="0.01" name="usd_to_bdt_rate" value="<?= sanitize_output(get_setting('usd_to_bdt_rate', '120.00')) ?>" class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-300 mb-2">Notice Marquee (Bengali)</label>
            <textarea name="notice_marquee_bn" rows="2" class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"><?= sanitize_output(get_setting('notice_marquee_bn', '')) ?></textarea>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-800">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="maintenance_mode" value="1" <?= get_setting('maintenance_mode', '0') === '1' ? 'checked' : '' ?> class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700">
              <span class="text-sm font-semibold text-slate-300">Enable Maintenance Mode</span>
            </label>

            <button type="submit" class="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/30">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    <?php endif; ?>

    <!-- TAB: ADMIN PASSWORD -->
    <?php if ($tab === 'profile'): ?>
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl max-w-md">
        <h3 class="text-lg font-black text-white mb-6">Change Admin Password</h3>
        <form method="POST" action="?tab=profile" class="space-y-4">
          <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
          <input type="hidden" name="admin_action" value="change_admin_password">

          <div>
            <label class="block text-xs font-bold uppercase text-slate-300 mb-2">New Password</label>
            <input type="password" name="new_admin_password" required minlength="6" placeholder="••••••••" class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-300 mb-2">Confirm New Password</label>
            <input type="password" name="confirm_admin_password" required minlength="6" placeholder="••••••••" class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
          </div>

          <button type="submit" class="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/30 transition-all">
            Update Password
          </button>
        </form>
      </div>
    <?php endif; ?>
  </main>
</body>
</html>
