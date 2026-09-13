import { UserProfile, Job, TaskSubmission, WalletTransaction, NotificationItem, SupportTicket, SiteSettings } from '../types';
import { INITIAL_USER, INITIAL_USERS, INITIAL_JOBS, INITIAL_SUBMISSIONS, INITIAL_TRANSACTIONS, INITIAL_NOTIFICATIONS, INITIAL_TICKETS, INITIAL_SITE_SETTINGS } from '../data/initialData';

const STORAGE_KEYS = {
  USER: 'amader_job_v3_user',
  USERS: 'amader_job_v3_users',
  SETTINGS: 'amader_job_v3_site_settings',
  JOBS: 'amader_job_v3_jobs',
  SUBMISSIONS: 'amader_job_v3_submissions',
  TRANSACTIONS: 'amader_job_v3_transactions',
  NOTIFICATIONS: 'amader_job_v3_notifications',
  TICKETS: 'amader_job_v3_support_tickets',
  AUTH: 'amader_job_v3_auth'
};

// In-memory fallback dictionary if localStorage quota is exceeded or unavailable
const memoryFallback: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    const val = localStorage.getItem(key);
    if (val !== null) return val;
  } catch (e) {
    // ignore access error
  }
  return memoryFallback[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  // Always update memory fallback
  memoryFallback[key] = value;
  try {
    localStorage.setItem(key, value);
  } catch (err: any) {
    // Handle QuotaExceededError
    console.warn(`LocalStorage quota issue on key "${key}". Performing cleanup...`);
    try {
      // 1. Prune obsolete/unrelated or legacy keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && !k.startsWith('amader_job_v3_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      // Retry setItem
      localStorage.setItem(key, value);
    } catch (err2) {
      // If still exceeding quota, try stripping large base64 proof images from old submissions
      try {
        const savedSubmissions = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
        if (savedSubmissions && key !== STORAGE_KEYS.SUBMISSIONS) {
          const parsed = JSON.parse(savedSubmissions);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.map((s: any) => ({
              ...s,
              proofImageUrl: s.proofImageUrl && s.proofImageUrl.length > 200 ? '' : s.proofImageUrl
            }));
            localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(cleaned));
          }
        }
        localStorage.setItem(key, value);
      } catch (err3) {
        // Safe degrade: keeps in-memory state so user app runs without error
        console.warn(`LocalStorage quota filled. Stored key "${key}" in active memory fallback.`);
      }
    }
  }
}

/**
 * Generate a distinct 8-digit numeric UID for each user
 * (e.g. 84920173, 59182304)
 */
export function generateUnique8DigitUid(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

export const StorageService = {
  getUser(): UserProfile {
    try {
      const saved = safeGetItem(STORAGE_KEYS.USER);
      if (saved) {
        const u = JSON.parse(saved);
        // Ensure 8-digit numeric UID
        if (!u.uid || !/^\d{8}$/.test(u.uid)) {
          u.uid = (u.id && /^\d{8}$/.test(u.id)) ? u.id : generateUnique8DigitUid();
          u.id = u.uid;
          u.referralCode = u.uid;
          this.saveUser(u);
        }
        return u;
      }
    } catch (e) {
      console.error('StorageService error reading user', e);
    }
    return INITIAL_USER;
  },
  saveUser(user: UserProfile) {
    try {
      safeSetItem(STORAGE_KEYS.USER, JSON.stringify(user));
      // Keep in sync with users list
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === user.id || (u.uid && u.uid === user.uid));
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...user };
      } else {
        users.push(user);
      }
      safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('StorageService error saving user', e);
    }
  },
  getUsers(): UserProfile[] {
    try {
      const saved = safeGetItem(STORAGE_KEYS.USERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('StorageService error reading users', e);
    }
    return INITIAL_USERS;
  },
  saveUsers(users: UserProfile[]) {
    try {
      safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      // Also update primary active user if present
      const activeUser = this.getUser();
      const updatedActive = users.find(u => u.id === activeUser.id || (u.uid && u.uid === activeUser.uid));
      if (updatedActive) {
        safeSetItem(STORAGE_KEYS.USER, JSON.stringify(updatedActive));
      }
    } catch (e) {
      console.error('StorageService error saving users', e);
    }
  },
  getSiteSettings(): SiteSettings {
    try {
      const saved = safeGetItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...INITIAL_SITE_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('StorageService error reading settings', e);
    }
    return INITIAL_SITE_SETTINGS;
  },
  saveSiteSettings(settings: SiteSettings) {
    try {
      safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('StorageService error saving settings', e);
    }
  },
  getJobs(): Job[] {
    try {
      const saved = safeGetItem(STORAGE_KEYS.JOBS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('StorageService error reading jobs', e);
    }
    return INITIAL_JOBS;
  },
  saveJobs(jobs: Job[]) {
    try {
      safeSetItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.error('StorageService error saving jobs', e);
    }
  },
  getSubmissions(): TaskSubmission[] {
    try {
      const saved = safeGetItem(STORAGE_KEYS.SUBMISSIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('StorageService error reading submissions', e);
    }
    return INITIAL_SUBMISSIONS;
  },
  saveSubmissions(subs: TaskSubmission[]) {
    try {
      safeSetItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(subs));
    } catch (e) {
      console.error('StorageService error saving submissions', e);
    }
  },
  getTransactions(): WalletTransaction[] {
    try {
      const saved = safeGetItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('StorageService error reading transactions', e);
    }
    return INITIAL_TRANSACTIONS;
  },
  saveTransactions(txs: WalletTransaction[]) {
    try {
      safeSetItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    } catch (e) {
      console.error('StorageService error saving transactions', e);
    }
  },
  getNotifications(): NotificationItem[] {
    try {
      const saved = safeGetItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('StorageService error reading notifications', e);
    }
    return INITIAL_NOTIFICATIONS;
  },
  saveNotifications(notifs: NotificationItem[]) {
    try {
      safeSetItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch (e) {
      console.error('StorageService error saving notifications', e);
    }
  },
  getTickets(): SupportTicket[] {
    try {
      const saved = safeGetItem(STORAGE_KEYS.TICKETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('StorageService error reading tickets', e);
    }
    return INITIAL_TICKETS;
  },
  saveTickets(tickets: SupportTicket[]) {
    try {
      safeSetItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch (e) {
      console.error('StorageService error saving tickets', e);
    }
  },
  getAuthStatus(): boolean {
    try {
      const saved = safeGetItem(STORAGE_KEYS.AUTH);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error('StorageService error reading auth', e);
    }
    return true;
  },
  saveAuthStatus(isAuth: boolean) {
    try {
      safeSetItem(STORAGE_KEYS.AUTH, JSON.stringify(isAuth));
    } catch (e) {
      console.error('StorageService error saving auth', e);
    }
  }
};
