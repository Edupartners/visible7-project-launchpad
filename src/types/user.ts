
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
  privacy: {
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    analyticsConsent: boolean;
  };
  basic: {
    language: string;
    theme: 'light' | 'dark' | 'system';
  };
  communication: {
    emailNotifications: boolean;
    newsletter: boolean;
  };
}

export const defaultUserSettings: UserSettings = {
  privacy: {
    dataProcessingConsent: true,
    marketingConsent: false,
    analyticsConsent: true,
  },
  basic: {
    language: 'cs',
    theme: 'system',
  },
  communication: {
    emailNotifications: true,
    newsletter: false,
  },
};
