<?php
/**
 * Admin & User Authentication Utilities
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/functions.php';

if (session_status() === PHP_SESSION_NONE) {
    // Set secure session cookie parameters
    $isSecure = (
        (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
        (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
    );
    session_set_cookie_params([
        'lifetime' => 86400 * 7, // 7 days
        'path' => '/',
        'secure' => $isSecure,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

/**
 * Check if Admin is currently logged in
 */
function is_admin_logged_in(): bool {
    return !empty($_SESSION['admin_id']) && !empty($_SESSION['admin_logged_in']);
}

/**
 * Require admin authentication or redirect to login
 */
function require_admin_login(): void {
    if (!is_admin_logged_in()) {
        $loginUrl = app_url('admin/index.php?action=login');
        header("Location: $loginUrl");
        exit;
    }
}

/**
 * Attempt admin login
 */
function admin_login(string $emailOrUser, string $password): array {
    $db = get_db();
    if (!$db) {
        return ['success' => false, 'error' => 'Database connection failed. Please check your DB settings in .env'];
    }

    try {
        $val = trim($emailOrUser);
        $stmt = $db->prepare("SELECT * FROM admins WHERE email = ? OR username = ? LIMIT 1");
        $stmt->execute([$val, $val]);
        $admin = $stmt->fetch();

        if (!$admin) {
            return ['success' => false, 'error' => 'Invalid email/username or password.'];
        }

        $passwordMatches = password_verify($password, $admin['password_hash']);

        if (!$passwordMatches) {
            return ['success' => false, 'error' => 'Invalid email/username or password.'];
        }

        // Login successful
        session_regenerate_id(true);
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_email'] = $admin['email'];
        $_SESSION['admin_username'] = $admin['username'];
        $_SESSION['admin_role'] = $admin['role'];
        $_SESSION['admin_logged_in'] = true;

        return ['success' => true, 'admin' => $admin];
    } catch (Exception $e) {
        return ['success' => false, 'error' => 'Authentication error: ' . $e->getMessage()];
    }
}

/**
 * Admin logout
 */
function admin_logout(): void {
    unset($_SESSION['admin_id']);
    unset($_SESSION['admin_email']);
    unset($_SESSION['admin_username']);
    unset($_SESSION['admin_role']);
    unset($_SESSION['admin_logged_in']);
    session_destroy();
}
