interface PromoCode {
  code: string;
  description: string;
  expiresAt?: Date;
  isActive: boolean;
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