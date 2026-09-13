/**
 * Dynamic Application Configuration & APP_URL resolver
 * Single source of truth for the site domain across the frontend
 */

export function getAppUrl(): string {
  if (typeof window !== 'undefined') {
    // 1. Check if injected into window by index.php via window.__APP_CONFIG__
    const injected = (window as any).__APP_CONFIG__?.appUrl;
    if (injected && typeof injected === 'string' && injected.trim() !== '') {
      return injected.trim().replace(/\/+$/, '');
    }
    // 2. Fallback to current browser origin (dynamic, never hardcoded)
    if (window.location && window.location.origin) {
      return window.location.origin.replace(/\/+$/, '');
    }
  }
  return '';
}

export function getReferralUrl(referralCode: string): string {
  const base = getAppUrl();
  const code = encodeURIComponent(referralCode || '84920173');
  return `${base}/?ref=${code}`;
}

export function getResetPasswordUrl(token: string): string {
  const base = getAppUrl();
  return `${base}/?reset_token=${encodeURIComponent(token)}`;
}
