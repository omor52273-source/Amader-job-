<?php
/**
 * Google OAuth 2.0 Callback Handler
 */
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

$db = get_db();
$enabled = get_setting('google_login_enabled', '0');
if ($enabled !== '1') {
    header("Location: " . get_base_app_url() . "/#/login?error=google_disabled");
    exit;
}

$code = $_GET['code'] ?? '';
$state = $_GET['state'] ?? '';
$sessionState = $_SESSION['google_oauth_state'] ?? '';

if (empty($code) || empty($state) || !hash_equals($sessionState, $state)) {
    header("Location: " . get_base_app_url() . "/#/login?error=invalid_oauth_state");
    exit;
}
unset($_SESSION['google_oauth_state']);

$clientId = get_setting('google_client_id', env('GOOGLE_CLIENT_ID', ''));
$clientSecret = get_setting('google_client_secret', env('GOOGLE_CLIENT_SECRET', ''));
$appUrl = get_base_app_url();
$redirectUri = rtrim($appUrl, '/') . '/auth/google_callback.php';

// Exchange authorization code for access token
$tokenUrl = 'https://oauth2.googleapis.com/token';
$postData = [
    'code' => $code,
    'client_id' => $clientId,
    'client_secret' => $clientSecret,
    'redirect_uri' => $redirectUri,
    'grant_type' => 'authorization_code'
];

$ch = curl_init($tokenUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    header("Location: " . get_base_app_url() . "/#/login?error=token_exchange_failed");
    exit;
}

$tokenData = json_decode($response, true);
$accessToken = $tokenData['access_token'] ?? '';

if (empty($accessToken)) {
    header("Location: " . get_base_app_url() . "/#/login?error=no_access_token");
    exit;
}

// Fetch user profile from Google
$userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
$ch = curl_init($userInfoUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
$userResponse = curl_exec($ch);
$userHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($userHttpCode !== 200 || !$userResponse) {
    header("Location: " . get_base_app_url() . "/#/login?error=userinfo_failed");
    exit;
}

$googleUser = json_decode($userResponse, true);
$googleId = $googleUser['sub'] ?? '';
$email = trim(strtolower($googleUser['email'] ?? ''));
$name = $googleUser['name'] ?? 'Google User';
$picture = $googleUser['picture'] ?? '';

if (empty($email) || empty($googleId)) {
    header("Location: " . get_base_app_url() . "/#/login?error=incomplete_google_profile");
    exit;
}

if (!$db) {
    header("Location: " . get_base_app_url() . "/#/login?error=db_connection_failed");
    exit;
}

try {
    // 1. Check if user exists by google_id
    $stmt = $db->prepare("SELECT * FROM users WHERE google_id = ? LIMIT 1");
    $stmt->execute([$googleId]);
    $user = $stmt->fetch();

    if (!$user) {
        // 2. Check if user exists by email (Account Linking)
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            // Safely associate Google account without overwriting password
            $upd = $db->prepare("UPDATE users SET google_id = ?, auth_provider = 'google', avatar = COALESCE(NULLIF(?, ''), avatar) WHERE id = ?");
            $upd->execute([$googleId, $picture, $user['id']]);

            $stmt = $db->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([$user['id']]);
            $user = $stmt->fetch();
        } else {
            // Create new user account automatically
            $uid = (string)random_int(10000000, 99999999);
            $refCode = strtoupper(substr(md5($email . time()), 0, 8));
            $placeholderPassword = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);

            $ins = $db->prepare("INSERT INTO users (uid, name, email, google_id, auth_provider, password_hash, role, avatar, referral_code, status, email_verified, created_at) VALUES (?, ?, ?, ?, 'google', ?, 'worker', ?, ?, 'active', 1, NOW())");
            $ins->execute([$uid, $name, $email, $googleId, $placeholderPassword, $picture ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', $refCode]);

            $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
        }
    }

    if ($user) {
        if ($user['status'] === 'banned') {
            header("Location: " . get_base_app_url() . "/#/login?error=banned");
            exit;
        }

        // Regenerate session ID and login user securely
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_uid'] = $user['uid'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['logged_in'] = true;

        header("Location: " . get_base_app_url() . "/#/" . ($user['role'] === 'employer' ? 'client' : 'freelancer'));
        exit;
    }
} catch (Exception $e) {
    header("Location: " . get_base_app_url() . "/#/login?error=exception");
    exit;
}
