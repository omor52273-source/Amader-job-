<?php
/**
 * Amader Job Online - Production Website Entry Point (cPanel)
 * Injects dynamic APP_URL, SEO Meta tags, Schema.org JSON-LD, and Database Configurations
 */

require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/seo.php';

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

// Check for dynamic Job SEO
$jobId = $_GET['job_id'] ?? $_GET['id'] ?? null;
$jobData = null;
$seoOptions = [];

if ($jobId) {
    $db = get_db();
    if ($db) {
        try {
            $stmt = $db->prepare("SELECT * FROM jobs WHERE id = :id AND status = 'active' LIMIT 1");
            $stmt->execute([':id' => $jobId]);
            $jobData = $stmt->fetch();
            if ($jobData) {
                $seoOptions = [
                    'title' => $jobData['title'] . ' | ' . $siteName,
                    'description' => 'টাস্ক রেট: ৳' . number_format($jobData['pay_per_task_bdt'], 2) . '। কাজ সম্পন্ন করে সরাসরি বিকাশ/নগদে পেমেন্ট নিন।',
                    'type' => 'article'
                ];
            }
        } catch (Exception $e) {}
    }
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
<html lang="bn" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
    
    <!-- Render complete SEO Meta Tags -->
    <?php render_seo_tags($seoOptions); ?>

    <!-- Favicons -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/logo-icon.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/logo-icon.svg" />

    <!-- Google Fonts with Preconnect for Core Web Vitals Optimization -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Schema.org JSON-LD Structured Data -->
    <?php 
    if ($jobData) {
        render_json_ld('job_posting', $jobData);
    } else {
        render_json_ld('website');
    }
    ?>

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
  <body class="font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white min-h-screen">
    <div id="root"></div>
  </body>
</html>
