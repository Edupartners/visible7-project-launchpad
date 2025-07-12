interface PromoCode {
  code: string;
  description: string;
  expiresAt?: Date;
  isActive: boolean;
}

interface BetaCode {
  code: string;
  description: string;
  expiresAt?: Date;
  isActive: boolean;
  type: 'beta' | 'admin' | 'family' | 'friend';
}

const VALID_PROMO_CODES: PromoCode[] = [
  {
    code: "ONLINE2024",
    description: "Online kurz 2024",
    isActive: true,
  },
  {
    code: "PREZENCNI2024", 
    description: "Prezenční kurz 2024",
    isActive: true,
  },
  {
    code: "VISIBLE7FREE",
    description: "Speciální přístup zdarma",
    isActive: true,
  },
];

const VALID_BETA_CODES: BetaCode[] = [
  {
    code: "BETA2024",
    description: "Beta testování 2024",
    isActive: true,
    type: 'beta',
  },
  {
    code: "ADMIN2024",
    description: "Admin přístup",
    isActive: true,
    type: 'admin',
  },
  {
    code: "FAMILY",
    description: "Přístup pro rodinu",
    isActive: true,
    type: 'family',
  },
  {
    code: "FRIEND01",
    description: "Přístup pro přátele",
    isActive: true,
    type: 'friend',
  },
  {
    code: "FRIEND02",
    description: "Přístup pro přátele",
    isActive: true,
    type: 'friend',
  },
  {
    code: "FRIEND03",
    description: "Přístup pro přátele",
    isActive: true,
    type: 'friend',
  },
  {
    code: "FRIEND04",
    description: "Přístup pro přátele",
    isActive: true,
    type: 'friend',
  },
  {
    code: "FRIEND05",
    description: "Přístup pro přátele",
    isActive: true,
    type: 'friend',
  },
];

export const validatePromoCode = (code: string): boolean => {
  const promoCode = VALID_PROMO_CODES.find(
    promo => promo.code.toLowerCase() === code.toLowerCase() && promo.isActive
  );
  
  if (!promoCode) return false;
  
  // Check expiration if set
  if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
    return false;
  }
  
  return true;
};

export const getPromoCodeDescription = (code: string): string | null => {
  const promoCode = VALID_PROMO_CODES.find(
    promo => promo.code.toLowerCase() === code.toLowerCase()
  );
  
  return promoCode?.description || null;
};

export const savePromoCodeAccess = (code: string): void => {
  localStorage.setItem('promoCodeAccess', code);
  localStorage.setItem('promoCodeAccessTimestamp', new Date().toISOString());
};

export const getPromoCodeAccess = (): string | null => {
  return localStorage.getItem('promoCodeAccess');
};

export const clearPromoCodeAccess = (): void => {
  localStorage.removeItem('promoCodeAccess');
  localStorage.removeItem('promoCodeAccessTimestamp');
};

export const validateBetaCode = (code: string): boolean => {
  const betaCode = VALID_BETA_CODES.find(
    beta => beta.code.toLowerCase() === code.toLowerCase() && beta.isActive
  );
  
  if (!betaCode) return false;
  
  // Check expiration if set
  if (betaCode.expiresAt && new Date() > betaCode.expiresAt) {
    return false;
  }
  
  return true;
};

export const getBetaCodeDescription = (code: string): string | null => {
  const betaCode = VALID_BETA_CODES.find(
    beta => beta.code.toLowerCase() === code.toLowerCase()
  );
  
  return betaCode?.description || null;
};

export const getBetaCodeType = (code: string): string | null => {
  const betaCode = VALID_BETA_CODES.find(
    beta => beta.code.toLowerCase() === code.toLowerCase()
  );
  
  return betaCode?.type || null;
};

export const saveBetaAccess = (code: string): void => {
  localStorage.setItem('betaAccessGranted', 'true');
  localStorage.setItem('betaAccessCode', code);
  localStorage.setItem('betaAccessTimestamp', new Date().toISOString());
};

export const getBetaAccess = (): boolean => {
  return localStorage.getItem('betaAccessGranted') === 'true';
};

export const clearBetaAccess = (): void => {
  localStorage.removeItem('betaAccessGranted');
  localStorage.removeItem('betaAccessCode');
  localStorage.removeItem('betaAccessTimestamp');
};

export const isLauncherEnabled = (): boolean => {
  // Check if launcher mode is disabled (for development or admin)
  const launcherDisabled = localStorage.getItem('launcherDisabled') === 'true';
  return !launcherDisabled;
};

export const disableLauncher = (): void => {
  localStorage.setItem('launcherDisabled', 'true');
};

export const enableLauncher = (): void => {
  localStorage.removeItem('launcherDisabled');
};