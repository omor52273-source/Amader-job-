<?php
/**
 * Standalone SMTP Mailer Engine for cPanel Hosting
 * Zero-dependency RFC 5321 pure PHP SMTP client.
 * Supports: SSL, TLS (STARTTLS), AUTH LOGIN, HTML/text multipart,
 * and reads configuration from MySQL settings first, with .env as fallback.
 */

require_once __DIR__ . '/env.php';
require_once __DIR__ . '/db.php';

class SmtpMailer {
    private string $host;
    private int $port;
    private string $username;
    private string $password;
    private string $encryption; // 'tls', 'ssl', 'none'
    private string $fromEmail;
    private string $fromName;
    private array $logs = [];

    public function __construct(?array $customConfig = null) {
        if ($customConfig !== null) {
            $this->host       = $customConfig['host'] ?? '';
            $this->port       = (int)($customConfig['port'] ?? 587);
            $this->username   = $customConfig['username'] ?? '';
            $this->password   = $customConfig['password'] ?? '';
            $this->encryption = strtolower($customConfig['encryption'] ?? 'tls');
            $this->fromEmail  = $customConfig['from_email'] ?? '';
            $this->fromName   = $customConfig['from_name'] ?? 'Amader Job';
            return;
        }

        // Priority 1: Database Settings
        $dbSettings = $this->loadDbSmtpSettings();

        // Priority 2: Fallback to .env
        $this->host = !empty($dbSettings['smtp_host']) 
            ? $dbSettings['smtp_host'] 
            : env('SMTP_HOST', '');

        $this->port = !empty($dbSettings['smtp_port']) 
            ? (int)$dbSettings['smtp_port'] 
            : (int)env('SMTP_PORT', 587);

        $this->username = !empty($dbSettings['smtp_username']) 
            ? $dbSettings['smtp_username'] 
            : env('SMTP_USERNAME', env('SMTP_USER', ''));

        $this->password = !empty($dbSettings['smtp_password']) 
            ? $dbSettings['smtp_password'] 
            : env('SMTP_PASSWORD', env('SMTP_PASS', ''));

        $this->encryption = !empty($dbSettings['smtp_encryption']) 
            ? strtolower($dbSettings['smtp_encryption']) 
            : strtolower(env('SMTP_ENCRYPTION', (env('SMTP_SECURE') === 'true' || $this->port === 465) ? 'ssl' : 'tls'));

        $this->fromEmail = !empty($dbSettings['smtp_from_email']) 
            ? $dbSettings['smtp_from_email'] 
            : env('SMTP_FROM_EMAIL', env('SMTP_FROM', $this->username ?: 'no-reply@amaderjob.com'));

        $this->fromName = !empty($dbSettings['smtp_from_name']) 
            ? $dbSettings['smtp_from_name'] 
            : env('SMTP_FROM_NAME', 'Amader Job');
    }

    private function loadDbSmtpSettings(): array {
        $db = get_db();
        if (!$db) return [];

        try {
            $stmt = $db->query("SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'smtp_%'");
            $rows = $stmt->fetchAll();
            $settings = [];
            foreach ($rows as $r) {
                $settings[$r['setting_key']] = $r['setting_value'];
            }
            return $settings;
        } catch (Exception $e) {
            return [];
        }
    }

    public function isConfigured(): bool {
        return !empty($this->host) && !empty($this->username) && !empty($this->password);
    }

    public function getLogs(): array {
        return $this->logs;
    }

    private function log(string $msg): void {
        $this->logs[] = "[" . date('H:i:s') . "] " . $msg;
    }

    /**
     * Send an email through SMTP
     */
    public function send(string $toEmail, string $subject, string $htmlBody, string $textBody = ''): array {
        $this->logs = [];
        $toEmail = trim($toEmail);

        if (!filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'error' => 'Invalid recipient email address'];
        }

        if (!$this->isConfigured()) {
            return [
                'success' => false, 
                'error' => 'SMTP server is not configured. Please configure SMTP in Admin Panel or .env'
            ];
        }

        $timeout = 20;
        $connectionHost = $this->host;
        $sslContext = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ]);

        if ($this->encryption === 'ssl' || $this->port === 465) {
            $connectionHost = 'ssl://' . $this->host;
        }

        $this->log("Connecting to $connectionHost:{$this->port} (Timeout: {$timeout}s)...");
        $errno = 0;
        $errstr = '';
        $socket = @stream_socket_client(
            $connectionHost . ':' . $this->port,
            $errno,
            $errstr,
            $timeout,
            STREAM_CLIENT_CONNECT,
            $sslContext
        );

        if (!$socket) {
            $this->log("Connection failed: $errstr ($errno)");
            return ['success' => false, 'error' => "Could not connect to SMTP host {$this->host}: $errstr ($errno)", 'logs' => $this->logs];
        }

        stream_set_timeout($socket, $timeout);

        // Read initial greeting
        $response = $this->readResponse($socket);
        if (substr($response, 0, 3) !== '220') {
            fclose($socket);
            return ['success' => false, 'error' => "Unexpected greeting from SMTP server: $response", 'logs' => $this->logs];
        }

        // Send EHLO
        $clientHost = !empty($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'localhost';
        $this->sendCommand($socket, "EHLO $clientHost");
        $response = $this->readResponse($socket);

        // STARTTLS if configured
        if ($this->encryption === 'tls' || ($this->port === 587 && strpos($response, 'STARTTLS') !== false)) {
            $this->log("Initiating STARTTLS negotiation...");
            $this->sendCommand($socket, "STARTTLS");
            $response = $this->readResponse($socket);
            if (substr($response, 0, 3) !== '220') {
                fclose($socket);
                return ['success' => false, 'error' => "STARTTLS failed: $response", 'logs' => $this->logs];
            }

            $cryptoMethod = STREAM_CRYPTO_METHOD_TLS_CLIENT;
            if (defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')) {
                $cryptoMethod |= STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT;
            }
            if (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT')) {
                $cryptoMethod |= STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;
            }

            $cryptoOk = @stream_socket_enable_crypto($socket, true, $cryptoMethod);
            if (!$cryptoOk) {
                fclose($socket);
                return ['success' => false, 'error' => "TLS encryption handshake failed.", 'logs' => $this->logs];
            }
            $this->log("TLS handshake established successfully.");

            // Resend EHLO over TLS
            $this->sendCommand($socket, "EHLO $clientHost");
            $response = $this->readResponse($socket);
        }

        // Authentication
        if (!empty($this->username) && !empty($this->password)) {
            $this->log("Authenticating as " . $this->username . "...");
            $this->sendCommand($socket, "AUTH LOGIN");
            $response = $this->readResponse($socket);
            if (substr($response, 0, 3) !== '334') {
                fclose($socket);
                return ['success' => false, 'error' => "SMTP Server rejected AUTH LOGIN command: $response", 'logs' => $this->logs];
            }

            $this->sendCommand($socket, base64_encode($this->username));
            $response = $this->readResponse($socket);
            if (substr($response, 0, 3) !== '334') {
                fclose($socket);
                return ['success' => false, 'error' => "SMTP Server rejected username: $response", 'logs' => $this->logs];
            }

            $this->sendCommand($socket, base64_encode($this->password));
            $response = $this->readResponse($socket);
            if (substr($response, 0, 3) !== '235') {
                fclose($socket);
                return ['success' => false, 'error' => "Authentication failed. Invalid SMTP username or password: $response", 'logs' => $this->logs];
            }
            $this->log("SMTP Authentication successful!");
        }

        // MAIL FROM
        $this->sendCommand($socket, "MAIL FROM: <{$this->fromEmail}>");
        $response = $this->readResponse($socket);
        if (substr($response, 0, 3) !== '250') {
            fclose($socket);
            return ['success' => false, 'error' => "MAIL FROM failed: $response", 'logs' => $this->logs];
        }

        // RCPT TO
        $this->sendCommand($socket, "RCPT TO: <$toEmail>");
        $response = $this->readResponse($socket);
        if (substr($response, 0, 3) !== '250') {
            fclose($socket);
            return ['success' => false, 'error' => "RCPT TO failed for <$toEmail>: $response", 'logs' => $this->logs];
        }

        // DATA
        $this->sendCommand($socket, "DATA");
        $response = $this->readResponse($socket);
        if (substr($response, 0, 3) !== '354') {
            fclose($socket);
            return ['success' => false, 'error' => "DATA command rejected: $response", 'logs' => $this->logs];
        }

        // Prepare Headers & MIME Body
        $boundary = "----=_NextPart_" . md5(uniqid((string)time()));
        $encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
        $encodedFromName = "=?UTF-8?B?" . base64_encode($this->fromName) . "?=";

        $headers = [
            "Date: " . date('r'),
            "From: $encodedFromName <{$this->fromEmail}>",
            "To: <$toEmail>",
            "Subject: $encodedSubject",
            "Message-ID: <" . md5(uniqid((string)microtime(true))) . "@" . ($this->host ?: 'amaderjob.com') . ">",
            "X-Mailer: AmaderJob PHP-SMTP Engine/2.0",
            "MIME-Version: 1.0",
            "Content-Type: multipart/alternative; boundary=\"$boundary\""
        ];

        $messageBody = implode("\r\n", $headers) . "\r\n\r\n";

        // Plain text part
        if (empty($textBody)) {
            $textBody = strip_tags($htmlBody);
        }
        $messageBody .= "--$boundary\r\n";
        $messageBody .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $messageBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $messageBody .= chunk_split(base64_encode($textBody)) . "\r\n";

        // HTML part
        $messageBody .= "--$boundary\r\n";
        $messageBody .= "Content-Type: text/html; charset=UTF-8\r\n";
        $messageBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $messageBody .= chunk_split(base64_encode($htmlBody)) . "\r\n";
        $messageBody .= "--$boundary--\r\n";

        // End of DATA indicator
        $messageBody .= ".\r\n";

        fwrite($socket, $messageBody);
        $response = $this->readResponse($socket);

        $this->sendCommand($socket, "QUIT");
        fclose($socket);

        if (substr($response, 0, 3) === '250') {
            $this->log("Email delivered successfully to $toEmail!");
            return ['success' => true, 'message' => "Email sent successfully to $toEmail", 'logs' => $this->logs];
        } else {
            return ['success' => false, 'error' => "Sending data failed: $response", 'logs' => $this->logs];
        }
    }

    private function sendCommand($socket, string $command): void {
        $this->log("> " . (strpos($command, 'AUTH') === false && !base64_decode($command, true) ? $command : '[CREDENTIALS]'));
        fwrite($socket, $command . "\r\n");
    }

    private function readResponse($socket): string {
        $data = '';
        while ($str = fgets($socket, 515)) {
            $data .= $str;
            if (substr($str, 3, 1) === ' ') {
                break;
            }
        }
        $trimmed = trim($data);
        $this->log("< " . $trimmed);
        return $trimmed;
    }
}

/**
 * Helper to dispatch an OTP Email
 */
function send_otp_email(string $toEmail, string $otp, string $purpose = 'register'): array {
    $mailer = new SmtpMailer();
    $appName = 'Amader Job';
    $appUrl = get_base_app_url();

    $db = get_db();
    if ($db) {
        try {
            $stmt = $db->query("SELECT setting_value FROM settings WHERE setting_key = 'site_name' LIMIT 1");
            $nameVal = $stmt->fetchColumn();
            if (!empty($nameVal)) $appName = $nameVal;
        } catch (Exception $e) {}
    }

    $subject = ($purpose === 'forgot_password')
        ? "$appName - পাসওয়ার্ড রিসেট ওটিপি কোড (Password Reset Code)"
        : "$appName - অ্যাকাউন্ট ভেরিফিকেশন ওটিপি কোড (Verification Code)";

    $title = ($purpose === 'forgot_password')
        ? "পাসওয়ার্ড রিসেট ওটিপি (Password Reset)"
        : "নতুন অ্যাকাউন্ট ভেরিফিকেশন (Account Verification)";

    $greeting = ($purpose === 'forgot_password')
        ? "আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তনের অনুরোধ পাওয়া গেছে। পাসওয়ার্ড রিসেট করতে নিচের ৬ ডিজিটের ওটিপি কোডটি ব্যবহার করুন:"
        : "আমাদের প্ল্যাটফর্মে স্বাগতম! আপনার রেজিস্ট্রেশন সম্পূর্ণ করতে নিচের ৬ ডিজিটের ওটিপি কোডটি প্রদান করুন:";

    $resetUrl = "$appUrl/?reset_token=" . urlencode($otp);

    $html = <<<HTML
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b; }
    .wrapper { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header-title { margin: 0; font-size: 24px; font-weight: 900; }
    .header-sub { margin: 6px 0 0 0; font-size: 13px; opacity: 0.95; }
    .body-content { padding: 32px 28px; }
    .intro-text { font-size: 14px; line-height: 1.65; color: #334155; margin-bottom: 24px; }
    .otp-container { background: #f0fdf4; border: 2px dashed #10b981; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #047857; background: #dcfce7; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; }
    .otp-digits { font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #047857; margin: 0; font-family: 'Courier New', Courier, monospace; }
    .otp-timer { font-size: 12px; color: #64748b; margin-top: 10px; font-weight: 600; }
    .warning-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 8px; font-size: 12px; line-height: 1.6; color: #92400e; margin-top: 24px; }
    .footer { padding: 20px 28px; background: #f8fafc; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="header-title">{$appName}</h1>
      <p class="header-sub">{$title}</p>
    </div>
    <div class="body-content">
      <p class="intro-text">
        প্রিয় গ্রাহক,<br><br>
        {$greeting}
      </p>

      <div class="otp-container">
        <div class="otp-badge">আপনার ওটিপি কোড</div>
        <div class="otp-digits">{$otp}</div>
        <div class="otp-timer">⏱️ কোডটির মেয়াদ ৫ মিনিট (Valid for 5 minutes)</div>
      </div>

      <div class="warning-box">
        🔒 <strong>নিরাপত্তা বার্তা:</strong> এই কোডটি একান্তই আপনার। প্ল্যাটফর্মের কোনো অ্যাডমিন বা প্রতিনিধি কখনো আপনার কাছে এই কোড বা পাসওয়ার্ড চাইবেন না। কারো সাথে এটি শেয়ার করবেন না।
      </div>
    </div>
    <div class="footer">
      &copy; Amader Job Online &bull; <a href="{$appUrl}" style="color:#059669;text-decoration:none;">{$appUrl}</a><br>
      This is an automated security email. Please do not reply directly.
    </div>
  </div>
</body>
</html>
HTML;

    return $mailer->send($toEmail, $subject, $html);
}
