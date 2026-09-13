<?php
/**
 * Amader Job Online - Production Website Entry Point (cPanel)
 * Injects dynamic APP_URL, Meta tags, and Database Configurations
 */

require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

$appUrl = get_base_app_url();
$siteName = get_setting('site_name', 'Amader Job Online');
$siteNameBn = get_setting('site_name_bn', 'আমাদের জব অনলাইন');
$siteSubtitle = get_setting('site_subtitle', 'Leading Micro Task & Freelance Platform in Bangladesh');
$siteSubtitleBn = get_setting('site_subtitle_bn', 'বাংলাদেশের বিশ্বস্ত মাইক্রো টাস্ক প্ল্যাটফর্ম');
$maintenanceMode = (get_setting('maintenance_mode', '0') === '1');

// If Maintenance Mode is active and visitor is not an authenticated admin
if ($maintenanceMode && !is_admin_logged_in()) {
    http_response_code(503);
    ?>
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8">
      <title><?= sanitize_output($siteName) ?> - রক্ষণাবেক্ষণ চলছে</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-6 text-center">
      <div class="max-w-md p-8 bg-slate-800/80 rounded-3xl border border-slate-700 shadow-2xl">
        <div class="text-4xl mb-4">🛠️</div>
        <h1 class="text-2xl font-black text-white mb-2"><?= sanitize_output($siteNameBn) ?></h1>
        <p class="text-sm text-slate-300 mb-4">আমাদের প্ল্যাটফর্মের নিয়মিত সিস্টেম রক্ষণাবেক্ষণের কাজ চলছে। সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত। কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
        <span class="text-xs font-mono text-emerald-400">Status: Scheduled Maintenance Mode</span>
      </div>
    </body>
    </html>
    <?php
    exit;
}

// Find built JS and CSS assets dynamically in assets/
$jsFile = '';
$cssFile = '';

$assetsDir = __DIR__ . '/assets';
if (is_dir($assetsDir)) {
    $files = scandir($assetsDir);
    foreach ($files as $file) {
        if (substr($file, -3) === '.js' && strpos($file, 'index-') === 0) {
            $jsFile = '/assets/' . $file;
        } elseif (substr($file, -4) === '.css' && strpos($file, 'index-') === 0) {
            $cssFile = '/assets/' . $file;
        }
    }
}
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
    <meta name="theme-color" content="#059669" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    
    <title><?= sanitize_output($siteName) ?> - <?= sanitize_output($siteNameBn) ?></title>
    <meta name="description" content="<?= sanitize_output($siteSubtitle) ?>" />
    
    <!-- Open Graph / SEO using dynamic APP_URL as single source of truth -->
    <meta property="og:title" content="<?= sanitize_output($siteName) ?> - <?= sanitize_output($siteNameBn) ?>" />
    <meta property="og:description" content="<?= sanitize_output($siteSubtitle) ?>" />
    <meta property="og:url" content="<?= sanitize_output($appUrl) ?>" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Dynamic Injected Configuration for Client -->
    <script>
      window.__APP_CONFIG__ = {
        appUrl: <?= json_encode($appUrl) ?>,
        siteName: <?= json_encode($siteName) ?>,
        siteNameBn: <?= json_encode($siteNameBn) ?>,
        usdToBdt: <?= json_encode((float)get_setting('usd_to_bdt_rate', 120)) ?>,
        minDeposit: <?= json_encode((float)get_setting('min_deposit_bdt', 50)) ?>,
        minWithdraw: <?= json_encode((float)get_setting('min_withdraw_bdt', 100)) ?>
      };
    </script>

    <?php if ($cssFile): ?>
      <link rel="stylesheet" crossorigin href="<?= $cssFile ?>">
    <?php endif; ?>
    <?php if ($jsFile): ?>
      <script type="module" crossorigin src="<?= $jsFile ?>"></script>
    <?php endif; ?>
  </head>
  <body class="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
    <div id="root"></div>
  </body>
</html>
