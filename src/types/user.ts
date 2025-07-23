
export interface UserProfile {
  id: string;
  email: string;
  name: string; // Keep for backward compatibility
  firstName?: string;
  lastName?: string;
  company?: string;
  position?: string;
  phone?: string;
  website?: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface UserSettings {
  general: {
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    updates: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    density: 'compact' | 'comfortable' | 'spacious';
    sidebarCollapsed: boolean;
  };
  data: {
    autoSave: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    exportFormat: 'json' | 'csv' | 'excel';
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginAlerts: boolean;
  };
  account: {
    publicProfile: boolean;
    allowAnalytics: boolean;
    subscribeNewsletter: boolean;
  };
}

export const defaultUserSettings: UserSettings = {
  general: {
    language: 'cs',
    timezone: 'Europe/Prague',
    dateFormat: 'DD.MM.YYYY',
    currency: 'CZK',
  },
  notifications: {
    email: true,
    push: true,
    marketing: false,
    updates: true,
  },
  display: {
    theme: 'system',
    density: 'comfortable',
    sidebarCollapsed: false,
  },
  data: {
    autoSave: true,
    backupFrequency: 'weekly',
    exportFormat: 'json',
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true,
  },
  account: {
    publicProfile: false,
    allowAnalytics: true,
    subscribeNewsletter: false,
  },
};
