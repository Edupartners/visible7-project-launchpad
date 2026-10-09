/**
 * Reference absolventů a klientů na úvodní stránce.
 * Jen skutečné citace se souhlasem autora (jméno, role). Dokud je seznam prázdný, citace se nezobrazují.
 */
export interface Reference {
  quote: string;
  name: string;
  role: string;
  /** Volitelná fotka (URL) */
  photo?: string;
}

export const REFERENCES: Reference[] = [];
