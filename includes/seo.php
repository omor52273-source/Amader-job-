<?php
/**
 * SEO & Social Metadata Engine for Amader Job Online
 * Generates dynamic SEO meta tags, OpenGraph, Twitter Cards, and Schema.org JSON-LD
 */

require_once __DIR__ . '/functions.php';

if (!function_exists('render_seo_tags')) {
    /**
     * Render complete SEO Meta Tags for <head>
     *
     * @param array $options Custom page overrides (title, description, image, type, canonical, keywords, noindex)
     */
    function render_seo_tags(array $options = []) {
        $baseUrl = get_base_app_url();
        
        $siteName = get_setting('site_name', 'Amader Job Online');
        $siteNameBn = get_setting('site_name_bn', 'আমাদের জব অনলাইন');
        $defaultTitle = get_setting('seo_meta_title', 'Amader Job Online - আমাদের জব | Micro Task & Freelance Platform in Bangladesh');
        $defaultDesc = get_setting('seo_meta_description', 'বাংলাদেশের শীর্ষ মাইক্রো-টাস্ক ও ফ্রিল্যান্সিং প্ল্যাটফর্ম। ছোট ছোট কাজ সম্পন্ন করে সরাসরি বিকাশ ও নগদে প্রতিদিন টাকা আয় করুন।');
        $defaultKeywords = get_setting('seo_keywords', 'Amader Job, আমাদের জব, micro job bangladesh, online income bd, freelance micro tasks, earn money online bangladesh, bkash cashout income, daily task earning, microjob bahubal');
        $defaultImage = get_setting('seo_og_image', app_url('assets/logo.svg'));
        $googleVerify = get_setting('google_site_verification', '');
        $bingVerify = get_setting('bing_site_verification', '');

        // Dynamic Overrides
        $pageTitle = !empty($options['title']) ? sanitize_output($options['title']) : $defaultTitle;
        $pageDesc = !empty($options['description']) ? sanitize_output($options['description']) : $defaultDesc;
        $pageKeywords = !empty($options['keywords']) ? sanitize_output($options['keywords']) : $defaultKeywords;
        $pageImage = !empty($options['image']) ? $options['image'] : $defaultImage;
        if (!preg_match('#^https?://#i', $pageImage)) {
            $pageImage = app_url($pageImage);
        }
        
        $pageType = !empty($options['type']) ? sanitize_output($options['type']) : 'website';
        $canonicalUrl = !empty($options['canonical']) ? $options['canonical'] : (isset($_SERVER['REQUEST_URI']) ? app_url($_SERVER['REQUEST_URI']) : $baseUrl);
        $noindex = !empty($options['noindex']);
        
        $robotsContent = $noindex 
            ? 'noindex, nofollow, noarchive' 
            : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

        ?>
        <!-- SEO Primary Meta Tags -->
        <title><?= $pageTitle ?></title>
        <meta name="title" content="<?= $pageTitle ?>">
        <meta name="description" content="<?= $pageDesc ?>">
        <meta name="keywords" content="<?= $pageKeywords ?>">
        <meta name="author" content="<?= sanitize_output($siteName) ?>">
        <meta name="robots" content="<?= $robotsContent ?>">
        <link rel="canonical" href="<?= htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8') ?>">

        <!-- Theme Color & Mobile -->
        <meta name="theme-color" content="#059669">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="<?= sanitize_output($siteName) ?>">

        <!-- Search Engine Verification -->
        <?php if (!empty($googleVerify)): ?>
        <meta name="google-site-verification" content="<?= sanitize_output($googleVerify) ?>">
        <?php endif; ?>
        <?php if (!empty($bingVerify)): ?>
        <meta name="msvalidate.01" content="<?= sanitize_output($bingVerify) ?>">
        <?php endif; ?>

        <!-- Open Graph / Facebook / WhatsApp -->
        <meta property="og:type" content="<?= $pageType ?>">
        <meta property="og:url" content="<?= htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8') ?>">
        <meta property="og:site_name" content="<?= sanitize_output($siteName) ?>">
        <meta property="og:title" content="<?= $pageTitle ?>">
        <meta property="og:description" content="<?= $pageDesc ?>">
        <meta property="og:image" content="<?= htmlspecialchars($pageImage, ENT_QUOTES, 'UTF-8') ?>">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:locale" content="bn_BD">
        <meta property="og:locale:alternate" content="en_US">

        <!-- Twitter / X Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="<?= htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8') ?>">
        <meta name="twitter:title" content="<?= $pageTitle ?>">
        <meta name="twitter:description" content="<?= $pageDesc ?>">
        <meta name="twitter:image" content="<?= htmlspecialchars($pageImage, ENT_QUOTES, 'UTF-8') ?>">
        <?php
    }
}

if (!function_exists('render_json_ld')) {
    /**
     * Render Schema.org JSON-LD Structured Data
     *
     * @param string $type Schema type: 'website', 'organization', 'job_posting', 'breadcrumb'
     * @param array $data Schema payload data
     */
    function render_json_ld($type = 'website', array $data = []) {
        $baseUrl = get_base_app_url();
        $siteName = get_setting('site_name', 'Amader Job Online');
        $siteNameBn = get_setting('site_name_bn', 'আমাদের জব অনলাইন');
        $logoUrl = app_url('assets/logo.svg');

        if ($type === 'website') {
            $schema = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    [
                        '@type' => 'WebSite',
                        '@id' => $baseUrl . '/#website',
                        'url' => $baseUrl . '/',
                        'name' => $siteName,
                        'alternateName' => $siteNameBn,
                        'description' => 'Leading micro-task and freelance marketplace platform in Bangladesh.',
                        'inLanguage' => ['bn', 'en'],
                        'potentialAction' => [
                            '@type' => 'SearchAction',
                            'target' => [
                                '@type' => 'EntryPoint',
                                'urlTemplate' => $baseUrl . '/?search={search_term_string}'
                            ],
                            'query-input' => 'required name=search_term_string'
                        ]
                    ],
                    [
                        '@type' => 'Organization',
                        '@id' => $baseUrl . '/#organization',
                        'name' => $siteName,
                        'url' => $baseUrl . '/',
                        'logo' => [
                            '@type' => 'ImageObject',
                            'url' => $logoUrl,
                            'width' => 460,
                            'height' => 120
                        ],
                        'contactPoint' => [
                            '@type' => 'ContactPoint',
                            'telephone' => get_setting('helpline_phone', '+8801331119361'),
                            'contactType' => 'Customer Support',
                            'email' => get_setting('support_email', 'support@bahubal.com'),
                            'areaServed' => 'BD',
                            'availableLanguage' => ['Bengali', 'English']
                        ]
                    ]
                ]
            ];
            echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>' . "\n";
        } elseif ($type === 'job_posting' && !empty($data['title'])) {
            $salaryBDT = floatval($data['pay_per_task_bdt'] ?? $data['pay_rate'] ?? 2.50);
            $schema = [
                '@context' => 'https://schema.org',
                '@type' => 'JobPosting',
                'title' => $data['title'],
                'description' => strip_tags($data['description'] ?? 'Micro freelance task on Amader Job.'),
                'datePosted' => !empty($data['created_at']) ? date('c', strtotime($data['created_at'])) : date('c'),
                'validThrough' => date('c', strtotime('+30 days')),
                'employmentType' => 'PART_TIME',
                'hiringOrganization' => [
                    '@type' => 'Organization',
                    'name' => $siteName,
                    'sameAs' => $baseUrl,
                    'logo' => $logoUrl
                ],
                'jobLocation' => [
                    '@type' => 'Place',
                    'address' => [
                        '@type' => 'PostalAddress',
                        'addressCountry' => 'BD'
                    ]
                ],
                'baseSalary' => [
                    '@type' => 'MonetaryAmount',
                    'currency' => 'BDT',
                    'value' => [
                        '@type' => 'QuantitativeValue',
                        'value' => $salaryBDT,
                        'unitText' => 'TASK'
                    ]
                ]
            ];
            echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>' . "\n";
        }
    }
}
