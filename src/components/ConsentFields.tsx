import { Link } from "react-router-dom";

export interface ConsentValues {
  terms: boolean;
  klub: boolean;
  marketing: boolean;
}

const Box = ({
  id,
  checked,
  onChange,
  children,
  required,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      required={required}
      className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-[hsl(var(--primary))]"
    />
    <span>{children}</span>
  </label>
);

/** Zaškrtávátka souhlasů – při registraci i v dialogu pro stávající uživatele. Podmínky jsou povinné, klub a novinky ne. */
export const ConsentFields = ({
  value,
  onChange,
  showOptional = true,
}: {
  value: ConsentValues;
  onChange: (v: ConsentValues) => void;
  showOptional?: boolean;
}) => (
  <div className="space-y-3">
    <Box id="consent-terms" checked={value.terms} onChange={(v) => onChange({ ...value, terms: v })} required>
      Souhlasím s{" "}
      <Link to="/podminky" target="_blank" className="font-semibold text-primary underline underline-offset-2">
        podmínkami užívání
      </Link>
      , prohlašuji, že můj projekt nebude sloužit k nezákonné činnosti, a beru na vědomí{" "}
      <Link
        to="/ochrana-osobnich-udaju"
        target="_blank"
        className="font-semibold text-primary underline underline-offset-2"
      >
        zásady zpracování osobních údajů
      </Link>
      . <span className="text-muted-foreground">(povinné)</span>
    </Box>
    {showOptional && (
      <>
        <Box id="consent-klub" checked={value.klub} onChange={(v) => onChange({ ...value, klub: v })}>
          Chci být členem <strong>Klubu VISIBLE7</strong> pro rozvoj digitálního a AI podnikání – zdarma, akce, novinky
          a zvýhodněné nabídky. Členství můžu kdykoli zrušit.
        </Box>
        <Box id="consent-marketing" checked={value.marketing} onChange={(v) => onChange({ ...value, marketing: v })}>
          Souhlasím se zasíláním novinek a nabídek Edu partners s.r.o. e-mailem. Souhlas můžu kdykoli odvolat.
        </Box>
      </>
    )}
  </div>
);
