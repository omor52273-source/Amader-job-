<?php
/**
 * Global Utility Functions & Application Helpers
 */

require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/db.php';

if (!function_exists('app_url')) {
    /**
     * Generate dynamic absolute URL using APP_URL as single source of truth
     */
    function app_url($path = '') {
        $base = get_base_app_url();
        $trimmedPath = ltrim($path, '/');
        return $trimmedPath ? "$base/$trimmedPath" : $base;
    }
}

if (!function_exists('get_setting')) {
    /**
     * Get a setting from MySQL settings table
     */
    function get_setting($key, $default = null) {
        static $cache = null;
        if ($cache === null) {
            $cache = [];
            $db = get_db();
            if ($db) {
                try {
                    $stmt = $db->query("SELECT setting_key, setting_value FROM settings");
                    while ($row = $stmt->fetch()) {
                        $cache[$row['setting_key']] = $row['setting_value'];
                    }
                } catch (Exception $e) {
                    // ignore if table not yet created
                }
            }
        }
        return array_key_exists($key, $cache) ? $cache[$key] : $default;
    }
}

if (!function_exists('set_setting')) {
    /**
     * Set a setting in MySQL settings table
     */
    function set_setting($key, $value) {
        $db = get_db();
        if (!$db) return false;
        try {
            $stmt = $db->prepare("
                INSERT INTO settings (setting_key, setting_value, updated_at) 
                VALUES (:k, :v, NOW()) 
                ON DUPLICATE KEY UPDATE setting_value = :v2, updated_at = NOW()
            ");
            return $stmt->execute([':k' => $key, ':v' => $value, ':v2' => $value]);
        } catch (Exception $e) {
            return false;
        }
    }
}

if (!function_exists('json_response')) {
    /**
     * Send JSON response and exit
     */
    function json_response($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}

if (!function_exists('sanitize_output')) {
    /**
     * Escape output against XSS
     */
    function sanitize_output($string) {
        return htmlspecialchars((string)$string, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}

if (!function_exists('csrf_token')) {
    /**
     * Generate or get CSRF token for forms
     */
    function csrf_token() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
}

if (!function_exists('csrf_verify')) {
    /**
     * Verify CSRF token from request
     */
    function csrf_verify($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        return !empty($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], (string)$token);
    }
}

if (!function_exists('mask_email')) {
    /**
     * Mask email for secure display (e.g. ra***7@amaderjob.com)
     */
    function mask_email($email) {
        $parts = explode('@', (string)$email);
        if (count($parts) !== 2) return $email;
        $local = $parts[0];
        $domain = $parts[1];
        if (strlen($local) <= 2) {
            return $local[0] . '*@' . $domain;
        }
        $first = substr($local, 0, 2);
        $last = substr($local, -1);
        $maskedLength = max(2, strlen($local) - 3);
        return $first . str_repeat('*', $maskedLength) . $last . '@' . $domain;
    }
}

if (!function_exists('generate_uid')) {
    /**
     * Generate unique 8-digit numeric profile UID
     */
    function generate_uid() {
        return (string)random_int(10000000, 99999999);
    }
}
