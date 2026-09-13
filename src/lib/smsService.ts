/**
 * Email OTP Verification Client Service (SMTP Powered)
 */

export interface SendOtpResponse {
  success: boolean;
  message?: string;
  error?: string;
  maskedEmail?: string;
  maskedPhone?: string;
  identifier?: string;
  cooldown?: number;
  expiresInSeconds?: number;
  devOtp?: string;
  isSimulationFallback?: boolean;
  warning?: string;
  isLocked?: boolean;
  lockedUntil?: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  error?: string;
  verificationToken?: string;
  identifier?: string;
  attemptsRemaining?: number;
  isLocked?: boolean;
  lockedUntil?: number;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const EmailOtpService = {
  /**
   * Request 6-digit OTP sent to user email via SMTP
   */
  async sendOtp(
    emailOrPhone: string, 
    purpose: 'register' | 'forgot_password' | '2fa' = 'register'
  ): Promise<SendOtpResponse> {
    try {
      const isEmail = emailOrPhone.includes('@');
      const payload = isEmail 
        ? { email: emailOrPhone.trim().toLowerCase(), purpose }
        : { phone: emailOrPhone.trim(), purpose };

      const response = await fetch('/api/otp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      return data;
    } catch (err: any) {
      console.error('Failed to send OTP:', err);
      return {
        success: false,
        error: err.message || 'নেটওয়ার্ক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
      };
    }
  },

  /**
   * Verify entered 6-digit OTP for Email
   */
  async verifyOtp(
    emailOrPhone: string, 
    otp: string, 
    purpose: 'register' | 'forgot_password' | '2fa' = 'register'
  ): Promise<VerifyOtpResponse> {
    try {
      const isEmail = emailOrPhone.includes('@');
      const payload = isEmail
        ? { email: emailOrPhone.trim().toLowerCase(), otp: otp.trim(), purpose }
        : { phone: emailOrPhone.trim(), otp: otp.trim(), purpose };

      const response = await fetch('/api/otp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      return data;
    } catch (err: any) {
      console.error('Failed to verify OTP:', err);
      return {
        success: false,
        error: err.message || 'ওটিপি ভেরিফিকেশন ব্যর্থ হয়েছে।'
      };
    }
  },

  /**
   * Reset password with verified OTP session token
   */
  async resetPassword(
    emailOrPhone: string, 
    verificationToken: string, 
    newPassword: string
  ): Promise<ResetPasswordResponse> {
    try {
      const isEmail = emailOrPhone.includes('@');
      const payload = isEmail
        ? { email: emailOrPhone.trim().toLowerCase(), verificationToken, newPassword }
        : { phone: emailOrPhone.trim(), verificationToken, newPassword };

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      return data;
    } catch (err: any) {
      console.error('Failed to reset password:', err);
      return {
        success: false,
        error: err.message || 'পাসওয়ার্ড পরিবর্তন সম্পন্ন করা যায়নি।'
      };
    }
  }
};

// Backward-compatible alias
export const SmsOtpService = EmailOtpService;

