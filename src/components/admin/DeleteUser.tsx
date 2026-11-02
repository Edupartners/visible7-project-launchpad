import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminDeleteUser } from "@/lib/privacy";

/** Smazání uživatele správcem. Potvrzuje se přepsáním e-mailu; nevratné. */
export const DeleteUserButton = ({
  userId,
  email,
  paid,
  onDeleted,
}: {
  userId: string;
  email: string;
  paid: boolean;
  onDeleted: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ok = confirm.trim().toLowerCase() === email.toLowerCase();

  const run = async () => {
    setBusy(true);
    setError(null);
    const err = await adminDeleteUser(userId, confirm);
    setBusy(false);
    if (err) return setError(err);
    setOpen(false);
    onDeleted();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="rounded-[10px] border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          setConfirm("");
          setError(null);
          setOpen(true);
        }}
      >
        <Trash2 className="mr-1.5 h-4 w-4" /> Smazat uživatele
      </Button>
      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Smazat uživatele {email}?</DialogTitle>
            <DialogDescription>
              Nevratně se smaže účet, všechny projekty, data bran, výstupy AI, weby projektů se zájemci, osvědčení,
              souhlasy a nastavení e-mailů. Záznamy o platbách zůstanou bez vazby na účet (doklady musíme uchovat).
            </DialogDescription>
          </DialogHeader>
          {paid && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
              Uživatel má zaplacené členství. Smazáním přijde o přístup, který si koupil. Mažte jen na jeho žádost nebo
              po dohodě.
            </p>
          )}
          <label className="text-sm font-semibold" htmlFor="delete-confirm">
            Pro potvrzení napište jeho e-mail
          </label>
          <Input
            id="delete-confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={email}
            autoComplete="off"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Zrušit
            </Button>
            <Button variant="destructive" onClick={run} disabled={!ok || busy}>
              {busy ? "Mažu…" : "Smazat natrvalo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
