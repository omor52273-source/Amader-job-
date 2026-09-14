<?php
/**
 * Google OAuth 2.0 Initialization
 */
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

$enabled = get_setting('google_login_enabled', '0');
if ($enabled !== '1') {
    die("Google Login is currently disabled by the administrator.");
}

$clientId = get_setting('google_client_id', env('GOOGLE_CLIENT_ID', ''));
if (empty($clientId)) {
    die("Google Client ID is not configured. Please configure it in the Admin Panel.");
}

$appUrl = get_base_app_url();
$redirectUri = rtrim($appUrl, '/') . '/auth/google_callback.php';

$state = bin2hex(random_bytes(16));
$_SESSION['google_oauth_state'] = $state;

$authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
    'client_id' => $clientId,
    'redirect_uri' => $redirectUri,
    'response_type' => 'code',
    'scope' => 'email profile',
    'state' => $state,
    'access_type' => 'online',
    'prompt' => 'select_account'
]);

header("Location: " . $authUrl);
exit;
