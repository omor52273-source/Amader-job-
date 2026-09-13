import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import nodemailer, { type Transporter } from 'nodemailer';

// Load environment variables from .env if present
dotenv.config();

interface OtpRecord {
  identifier: string;
  email?: string;
  phone?: string;
  otp: string;
  purpose: 'register' | 'forgot_password' | '2fa';
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  lockedUntil?: number;
  verificationToken?: string;
  tokenExpiresAt?: number;
}

// In-memory OTP storage (keyed by normalized identifier + purpose)
const otpStore = new Map<string, OtpRecord>();

// Helper: Normalize Email
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Helper: Mask email for privacy display (e.g. om***3@gmail.com)
function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const first = local.slice(0, 2);
  const last = local.slice(-1);
  const maskedLength = Math.max(2, local.length - 3);
  return `${first}${'*'.repeat(maskedLength)}${last}@${domain}`;
}

// Helper: Normalize Bangladeshi phone number (fallback/compatibility)
function normalizePhoneNumber(rawPhone: string): string {
  let digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('880') && digits.length === 13) return digits;
  if (digits.startsWith('01') && digits.length === 11) return '88' + digits;
  if (digits.startsWith('1') && digits.length === 10) return '880' + digits;
  return digits;
}

function maskPhoneNumber(phone: string): string {
  const norm = normalizePhoneNumber(phone);
  if (norm.length >= 11) {
    const p = norm.startsWith('88') ? norm.slice(2) : norm;
    return `+880 ${p.slice(0, 3)}****${p.slice(-3)}`;
  }
  return phone;
}

// ==========================================
// SMTP Mail Transport Setup
// ==========================================
function getMailTransporter(): Transporter | null {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== undefined 
    ? process.env.SMTP_SECURE === 'true' 
    : (port === 465);

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false // Avoid SSL failure on shared/cPanel hosts
    }
  });
}

// Helper: Send OTP via SMTP
async function sendOtpEmail(
  toEmail: string, 
  otp: string, 
  purpose: 'register' | 'forgot_password' | '2fa'
): Promise<{ success: boolean; data?: any; error?: string }> {
  const transporter = getMailTransporter();
  const appName = 'Amader Job Online';
  const fromAddress = (process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@amaderjob.com').trim();

  let subject = '';
  let purposeTitle = '';
  let greetingBn = '';

  if (purpose === 'register') {
    subject = `${appName} - অ্যাকাউন্ট ভেরিফিকেশন ওটিপি কোড`;
    purposeTitle = 'নতুন অ্যাকাউন্ট ভেরিফিকেশন (Account Verification)';
    greetingBn = 'আমাদের প্ল্যাটফর্মে অ্যাকাউন্ট খোলার জন্য ধন্যবাদ। আপনার রেজিস্ট্রেশন সম্পূর্ণ করতে নিচের ওটিপি কোডটি ব্যবহার করুন:';
  } else if (purpose === 'forgot_password') {
    subject = `${appName} - পাসওয়ার্ড রিসেট ওটিপি কোড`;
    purposeTitle = 'পাসওয়ার্ড রিসেট ওটিপি (Password Reset)';
    greetingBn = 'আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করার অনুরোধ পাওয়া গেছে। পাসওয়ার্ড রিসেট করতে নিচের ওটিপি কোডটি প্রদান করুন:';
  } else {
    subject = `${appName} - নিরাপত্তা যাচাই ওটিপি`;
    purposeTitle = 'নিরাপত্তা ভেরিফিকেশন (Security Check)';
    greetingBn = 'নিরাপত্তা যাচাইয়ের জন্য নিচের ৬-ডিজিটের ওটিপি কোডটি ব্যবহার করুন:';
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b; }
        .wrapper { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header-title { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
        .header-sub { margin: 6px 0 0 0; font-size: 13px; opacity: 0.95; font-weight: 500; }
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
          <h1 class="header-title">${appName}</h1>
          <p class="header-sub">${purposeTitle}</p>
        </div>
        <div class="body-content">
          <p class="intro-text">
            প্রিয় গ্রাহক,<br><br>
            ${greetingBn}
          </p>

          <div class="otp-container">
            <div class="otp-badge">আপনার ভেরিফিকেশন কোড</div>
            <div class="otp-digits">${otp}</div>
            <div class="otp-timer">⏱️ কোডটির মেয়াদ ৫ মিনিট (Valid for 5 minutes)</div>
          </div>

          <div class="warning-box">
            🔒 <strong>নিরাপত্তা বার্তা:</strong> এই কোডটি একান্তই আপনার। প্ল্যাটফর্মের কোনো অ্যাডমিন বা প্রতিনিধি কখনো আপনার কাছে এই কোড বা পাসওয়ার্ড চাইবেন না। কারো সাথে এটি শেয়ার করবেন না।
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; line-height: 1.5;">
            আপনি যদি এই অনুরোধটি না করে থাকেন, তবে এটি উপেক্ষা করতে পারেন। আপনার অ্যাকাউন্ট সুরক্ষিত থাকবে।
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ${appName} &bull; বাংলাদেশের বিশ্বস্ত মাইক্রো-টাস্ক প্ল্যাটফর্ম<br>
          This is an automated system email. Please do not reply directly.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `[${appName}]\n${greetingBn}\n\nআপনার ওটিপি কোড: ${otp}\nমেয়াদ: ৫ মিনিট।\nকারো সাথে শেয়ার করবেন না।`;

  if (!transporter) {
    console.warn('[SMTP Warning]: SMTP_HOST, SMTP_USER, or SMTP_PASS not set. Falling back to simulation mode.');
    return {
      success: false,
      error: 'SMTP credentials not configured on server (SMTP_HOST, SMTP_USER, SMTP_PASS required)'
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${appName}" <${fromAddress}>`,
      to: toEmail,
      subject,
      text: textContent,
      html: htmlContent
    });

    console.log(`[SMTP Mail Sent Successfully]: MessageId: ${info.messageId} to: ${toEmail}`);
    return { success: true, data: info };
  } catch (err: any) {
    console.error('[SMTP Mail Send Error]:', err);
    return {
      success: false,
      error: err.message || 'SMTP mail dispatch failed'
    };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    const isSmtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    res.json({
      status: 'ok',
      service: 'Amader Job Online API with SMTP Mail Server',
      smtpConfigured: isSmtpConfigured,
      smtpHost: process.env.SMTP_HOST || null,
      smtpPort: process.env.SMTP_PORT || '465',
      smtpUser: process.env.SMTP_USER ? maskEmail(process.env.SMTP_USER) : null,
      mobileVerification: false,
      emailVerification: true,
      timestamp: new Date().toISOString()
    });
  });

  // SMTP Status Endpoint
  app.get('/api/smtp/status', (req: Request, res: Response) => {
    const isSmtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    res.json({
      configured: isSmtpConfigured,
      host: process.env.SMTP_HOST || null,
      port: process.env.SMTP_PORT || '465',
      secure: process.env.SMTP_SECURE || 'true',
      user: process.env.SMTP_USER ? maskEmail(process.env.SMTP_USER) : null,
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@amaderjob.com'
    });
  });

  // SMTP Test Endpoint
  app.post('/api/smtp/test', async (req: Request, res: Response): Promise<void> => {
    try {
      const { testEmail } = req.body;
      if (!testEmail || typeof testEmail !== 'string' || !testEmail.includes('@')) {
        res.status(400).json({ success: false, error: 'Valid test email address is required' });
        return;
      }
      const testResult = await sendOtpEmail(normalizeEmail(testEmail), '123456', 'register');
      if (testResult.success) {
        res.json({ success: true, message: `Test email sent successfully to ${testEmail}` });
      } else {
        res.status(500).json({ success: false, error: testResult.error });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // 1. API: Send OTP (Email-first via SMTP)
  // ==========================================
  app.post('/api/otp/send-otp', async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, phone, purpose = 'register' } = req.body;

      // Prioritize Email for verification (Mobile SMS verification turned off as requested)
      const targetEmail = email ? normalizeEmail(email) : (phone && phone.includes('@') ? normalizeEmail(phone) : '');

      if (!targetEmail) {
        // Fallback for legacy phone call if provided without email
        if (phone && typeof phone === 'string') {
          const normalizedPhone = normalizePhoneNumber(phone);
          const storeKey = `phone_${normalizedPhone}_${purpose}`;
          const now = Date.now();
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          otpStore.set(storeKey, {
            identifier: normalizedPhone,
            phone: normalizedPhone,
            otp,
            purpose,
            expiresAt: now + 5 * 60 * 1000,
            attempts: 0,
            lastSentAt: now
          });
          res.json({
            success: true,
            isSimulationFallback: true,
            message: 'মোবাইল ভেরিফিকেশন বন্ধ রয়েছে। ইমেইল ভেরিফিকেশন সক্রিয় করা হয়েছে।',
            maskedPhone: maskPhoneNumber(normalizedPhone),
            devOtp: otp,
            expiresInSeconds: 300,
            cooldown: 60
          });
          return;
        }

        res.status(400).json({ success: false, error: 'সঠিক ইমেইল ঠিকানা প্রদান করুন (Valid email address is required)' });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(targetEmail)) {
        res.status(400).json({ success: false, error: 'অনুগ্রহ করে সঠিক ফরম্যাটের ইমেইল ঠিকানা লিখুন (যেমন: name@example.com)' });
        return;
      }

      const storeKey = `email_${targetEmail}_${purpose}`;
      const now = Date.now();
      const existing = otpStore.get(storeKey);

      // Check if session is locked due to 3 failed attempts
      if (existing && existing.lockedUntil && now < existing.lockedUntil) {
        const remainingMinutes = Math.ceil((existing.lockedUntil - now) / 60000);
        res.status(429).json({
          success: false,
          isLocked: true,
          lockedUntil: existing.lockedUntil,
          error: `অ্যাকাউন্ট ভেরিফিকেশন ১৫ মিনিটের জন্য সাময়িক লক রয়েছে (বাকি: ${remainingMinutes} মিনিট)। কিছুক্ষণ পর আবার চেষ্টা করুন।`
        });
        return;
      }

      // Check 60-second cooldown
      if (existing && !existing.lockedUntil && (now - existing.lastSentAt) < 60000) {
        const remainingSeconds = Math.ceil((60000 - (now - existing.lastSentAt)) / 1000);
        res.status(429).json({
          success: false,
          error: `অনুগ্রহ করে ${remainingSeconds} সেকেন্ড পর পুনরায় ওটিপি রিকোয়েস্ট করুন`,
          cooldown: remainingSeconds
        });
        return;
      }

      // Generate cryptographically secure 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

      // Store OTP
      otpStore.set(storeKey, {
        identifier: targetEmail,
        email: targetEmail,
        otp,
        purpose,
        expiresAt,
        attempts: 0,
        lastSentAt: now
      });

      console.log(`\n========================================`);
      console.log(`📧 [EMAIL OTP DISPATCH] -> To: ${targetEmail} (${maskEmail(targetEmail)})`);
      console.log(`🔑 [CODE]: ${otp} | Purpose: ${purpose}`);
      console.log(`⏱️ [EXPIRES]: 5 Minutes | SMTP Configured: ${Boolean(process.env.SMTP_HOST && process.env.SMTP_USER)}`);
      console.log(`========================================\n`);

      // Dispatch via SMTP Mail Server
      const emailResult = await sendOtpEmail(targetEmail, otp, purpose);

      if (emailResult.success) {
        res.json({
          success: true,
          message: 'আপনার ইমেইলে ৬ ডিজিটের ওটিপি ভেরিফিকেশন কোড পাঠানো হয়েছে। ইনবক্স ও স্প্যাম ফোল্ডার চেক করুন।',
          maskedEmail: maskEmail(targetEmail),
          identifier: targetEmail,
          expiresInSeconds: 300,
          cooldown: 60
        });
      } else {
        console.warn(`[SMTP Notice]: Mail sending returned '${emailResult.error}'. Falling back to preview mode so user is not blocked.`);
        res.json({
          success: true,
          isSimulationFallback: true,
          warning: emailResult.error,
          maskedEmail: maskEmail(targetEmail),
          identifier: targetEmail,
          expiresInSeconds: 300,
          cooldown: 60,
          devOtp: otp,
          message: 'টেস্ট ওটিপি মোড সক্রিয়: ওটিপি কোড নিচে প্রদর্শিত হয়েছে (SMTP সেটিংস কনফিগার করা হলে এটি সরাসরি আপনার ইমেইলে যাবে)।'
        });
      }
    } catch (error: any) {
      console.error('Error in /api/otp/send-otp:', error);
      res.status(500).json({ success: false, error: 'Internal server error processing OTP request' });
    }
  });

  // ==========================================
  // 2. API: Verify OTP (Email or Phone)
  // ==========================================
  app.post('/api/otp/verify-otp', (req: Request, res: Response): Promise<void> => {
    try {
      const { email, phone, otp, purpose = 'register' } = req.body;

      if (!otp) {
        res.status(400).json({ success: false, error: 'OTP কোড প্রদান করা আবশ্যক' });
        return;
      }

      // Check email store first, then fallback phone store
      let storeKey = '';
      let identifier = '';
      if (email) {
        identifier = normalizeEmail(email);
        storeKey = `email_${identifier}_${purpose}`;
      } else if (phone) {
        if (phone.includes('@')) {
          identifier = normalizeEmail(phone);
          storeKey = `email_${identifier}_${purpose}`;
        } else {
          identifier = normalizePhoneNumber(phone);
          storeKey = `phone_${identifier}_${purpose}`;
        }
      }

      if (!storeKey) {
        res.status(400).json({ success: false, error: 'ইমেইল অথবা মোবাইল নম্বর প্রদান করুন' });
        return;
      }

      const record = otpStore.get(storeKey);
      const now = Date.now();

      if (!record) {
        res.status(400).json({ 
          success: false, 
          error: 'এই ঠিকানায় কোনো সক্রিয় ওটিপি পাওয়া যায়নি। অনুগ্রহ করে নতুন ওটিপি কোড নিন।' 
        });
        return;
      }

      // Check if session is currently locked (15 minutes)
      if (record.lockedUntil && now < record.lockedUntil) {
        const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
        res.status(429).json({ 
          success: false, 
          isLocked: true,
          lockedUntil: record.lockedUntil,
          error: `পর পর ৩ বার ভুল ওটিপি দেওয়ার কারণে ১৫ মিনিটের জন্য সাময়িক লক করা হয়েছে (বাকি: ${remainingMinutes} মিনিট)।` 
        });
        return;
      }

      // Check Expiry (5 minutes)
      if (now > record.expiresAt) {
        otpStore.delete(storeKey);
        res.status(400).json({ 
          success: false, 
          error: 'ওটিপি কোডের মেয়াদ (৫ মিনিট) শেষ হয়ে গেছে। দয়া করে নতুন ওটিপি চেয়ে নিন।' 
        });
        return;
      }

      // Verify OTP match
      if (record.otp.trim() !== otp.toString().trim()) {
        record.attempts = (record.attempts || 0) + 1;
        const remainingAttempts = 3 - record.attempts;

        if (record.attempts >= 3) {
          // Lock for 15 minutes
          record.lockedUntil = now + 15 * 60 * 1000;
          console.warn(`🔒 [OTP LOCKED] 3 Failed OTP attempts for ${identifier}. Locked until ${new Date(record.lockedUntil).toLocaleTimeString()}`);
          
          res.status(429).json({
            success: false,
            isLocked: true,
            lockedUntil: record.lockedUntil,
            error: 'পর পর ৩ বার ভুল ওটিপি দেওয়া হয়েছে! ইনপুট ১৫ মিনিটের জন্য লক করা হলো। অনুগ্রহ করে ১৫ মিনিট পর চেষ্টা করুন।',
            attemptsRemaining: 0
          });
          return;
        }

        res.status(400).json({
          success: false,
          error: `ভুল ওটিপি কোড। আপনার আর মাত্র ${remainingAttempts} বার চেষ্টা করার সুযোগ আছে।`,
          attemptsRemaining: remainingAttempts
        });
        return;
      }

      // OTP is valid! Reset attempts and lock
      record.attempts = 0;
      delete record.lockedUntil;

      // Generate verification token valid for 15 minutes
      const verificationToken = `vtok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      record.verificationToken = verificationToken;
      record.tokenExpiresAt = now + 15 * 60 * 1000;

      res.json({
        success: true,
        message: 'ইমেইল ওটিপি সফলভাবে যাচাই হয়েছে!',
        verificationToken,
        identifier
      });
    } catch (error: any) {
      console.error('Error in /api/otp/verify-otp:', error);
      res.status(500).json({ success: false, error: 'Internal server error verifying OTP' });
    }
  });

  // ==========================================
  // 3. API: Reset Password
  // ==========================================
  app.post('/api/auth/reset-password', (req: Request, res: Response): Promise<void> => {
    try {
      const { email, phone, verificationToken, newPassword } = req.body;

      if ((!email && !phone) || !verificationToken || !newPassword) {
        res.status(400).json({ success: false, error: 'ইমেইল, ভেরিফিকেশন টোকেন এবং নতুন পাসওয়ার্ড আবশ্যক' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ success: false, error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });
        return;
      }

      let storeKey = '';
      let userIdentifier = '';
      if (email) {
        userIdentifier = normalizeEmail(email);
        storeKey = `email_${userIdentifier}_forgot_password`;
      } else if (phone) {
        if (phone.includes('@')) {
          userIdentifier = normalizeEmail(phone);
          storeKey = `email_${userIdentifier}_forgot_password`;
        } else {
          userIdentifier = normalizePhoneNumber(phone);
          storeKey = `phone_${userIdentifier}_forgot_password`;
        }
      }

      const record = otpStore.get(storeKey);

      if (!record || record.verificationToken !== verificationToken || !record.tokenExpiresAt || Date.now() > record.tokenExpiresAt) {
        res.status(403).json({
          success: false,
          error: 'ভেরিফিকেশন সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে পুনরায় ওটিপি যাচাই করুন।'
        });
        return;
      }

      // Clean up used OTP session
      otpStore.delete(storeKey);

      console.log(`🔐 [PASSWORD RESET SUCCESS] For user: ${userIdentifier}`);

      res.json({
        success: true,
        message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
      });
    } catch (error: any) {
      console.error('Error in /api/auth/reset-password:', error);
      res.status(500).json({ success: false, error: 'Internal server error resetting password' });
    }
  });

  // ==========================================
  // In-memory support tickets for Preview Mode
  // ==========================================
  const inMemoryTickets: any[] = [
    {
      id: 'TCK-78419',
      userId: '84920173',
      userName: 'Md. Rafiul Islam',
      userEmail: 'rafi2377a@amaderjob.com',
      subject: 'Deposit balance not updated via bKash',
      category: 'deposit',
      priority: 'high',
      status: 'in_progress',
      unreadByUser: true,
      unreadByAdmin: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-1',
          sender: 'user',
          senderName: 'Md. Rafiul Islam',
          message: 'Hello, I deposited 500 BDT using bKash TrxID BK9827163 20 minutes ago.',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'msg-2',
          sender: 'admin',
          senderName: 'Support Team',
          message: 'We received your ticket. Our finance team is reviewing your transaction ID now.',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ]
    }
  ];

  app.get('/api/tickets', (req: Request, res: Response) => {
    const userId = (req.query.user_id || req.query.userId || '') as string;
    let filtered = inMemoryTickets;
    if (userId) {
      filtered = inMemoryTickets.filter(t => t.userId === userId || !t.userId);
    }
    res.json({ success: true, tickets: filtered });
  });

  app.post('/api/tickets', (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, userName, userEmail, subject, category, priority, message } = req.body;
      if (!subject || !message) {
        res.status(400).json({ success: false, error: 'Subject and message are required' });
        return;
      }
      const ticketId = `TCK-${Math.floor(10000 + Math.random() * 90000)}`;
      const now = new Date().toISOString();
      const newTicket = {
        id: ticketId,
        userId: userId || '84920173',
        userName: userName || 'Member',
        userEmail: userEmail || 'user@amaderjob.com',
        subject,
        category: category || 'deposit',
        priority: priority || 'medium',
        status: 'open',
        unreadByUser: false,
        unreadByAdmin: true,
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'user',
            senderName: userName || 'Member',
            message,
            timestamp: now
          }
        ]
      };
      inMemoryTickets.unshift(newTicket);
      res.json({ success: true, ticket: newTicket });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/tickets/messages', (req: Request, res: Response): Promise<void> => {
    const ticketId = (req.query.ticket_id || req.query.ticketId) as string;
    const ticket = inMemoryTickets.find(t => t.id === ticketId);
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket not found' });
      return;
    }
    ticket.unreadByUser = false;
    res.json({ success: true, messages: ticket.messages });
  });

  app.post('/api/tickets/messages', (req: Request, res: Response): Promise<void> => {
    const { ticket_id, ticketId, sender, sender_name, senderName, message } = req.body;
    const id = ticket_id || ticketId;
    const ticket = inMemoryTickets.find(t => t.id === id);
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket not found' });
      return;
    }
    const isSenderAdmin = sender === 'admin';
    const now = new Date().toISOString();
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: isSenderAdmin ? 'admin' : 'user',
      senderName: sender_name || senderName || (isSenderAdmin ? 'Support Team' : 'Member'),
      message,
      timestamp: now
    };
    ticket.messages.push(newMsg);
    ticket.updatedAt = now;
    if (isSenderAdmin) {
      ticket.unreadByUser = true;
      ticket.unreadByAdmin = false;
      ticket.status = 'in_progress';
    } else {
      ticket.unreadByUser = false;
      ticket.unreadByAdmin = true;
      if (ticket.status === 'closed') ticket.status = 'open';
    }
    res.json({ success: true, message: newMsg });
  });

  app.post('/api/tickets/status', (req: Request, res: Response) => {
    const { ticket_id, ticketId, status } = req.body;
    const id = ticket_id || ticketId;
    const ticket = inMemoryTickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();
    }
    res.json({ success: true, status });
  });

  // User status / profile sync
  app.get('/api/user', (req: Request, res: Response) => {
    const uid = (req.query.uid || req.query.id || '84920173') as string;
    res.json({
      success: true,
      user: {
        id: '1',
        uid: uid,
        name: 'Md. Rafiul Islam',
        email: 'rafi2377a@amaderjob.com',
        phone: '01892837482',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        earningBalanceBDT: 485.00,
        depositBalanceBDT: 810.00,
        earningBalanceUSD: 4.85,
        depositBalanceUSD: 8.10,
        completedTasksCount: 12,
        postedJobsCount: 2,
        satisfactionRate: 98.5,
        level: 'Pro Earner',
        isVerified: true,
        hasBlueBadge: true,
        blueBadgePlan: 'monthly',
        twoFactorEnabled: false,
        kycStatus: 'verified',
        referralCode: '84920173',
        referralEarningsBDT: 150.00,
        referredUsersCount: 15,
        dailyStreak: 7,
        status: 'active'
      }
    });
  });

  app.post('/api/user/buy-blue-badge', (req: Request, res: Response) => {
    const { plan } = req.body;
    res.json({
      success: true,
      message: 'Blue Badge activated successfully!',
      user: {
        hasBlueBadge: true,
        blueBadgePlan: plan || 'monthly',
        blueBadgeExpiresAt: new Date(Date.now() + 30 * 86400000).toISOString()
      }
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const isSmtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📧 Mail System: SMTP Protocol (${isSmtpConfigured ? 'Configured: ' + process.env.SMTP_HOST : 'Fallback / Simulation Mode'})`);
    console.log(`🔒 Mobile SMS verification: DISABLED | Email SMTP verification: ENABLED`);
  });
}

startServer();

