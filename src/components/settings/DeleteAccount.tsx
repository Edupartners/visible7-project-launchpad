import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/components/AuthGate";
import { useToast } from "@/hooks/use-toast";
import { deleteAccount } from "@/lib/privacy";

/** Smazání účtu se všemi projekty (právo na výmaz podle GDPR). */
export const DeleteAccount = () => {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const ready = confirm.trim().toUpperCase() === "SMAZAT";

  const run = async () => {
    setBusy(true);
    const err = await deleteAccount("SMAZAT");
    setBusy(false);
    if (err) {
      toast({ title: "Účet se nepodařilo smazat", description: err, variant: "destructive" });
      return;
    }
    await signOut().catch(() => {});
    toast({ title: "Účet je smazaný", description: "Vaše projekty a data jsme odstranili." });
    navigate("/");
  };

  return (
    <div className="space-y-3 text-sm">
      <p>
        Smaže se účet, všechny projekty, výstupy AI, weby projektu se zájemci, osvědčení i vaše nastavení. Nejde to
        vrátit.
      </p>
      <p className="text-muted-foreground">
        Zůstanou jen doklady o nákupu, které musíme podle zákona uchovat.{" "}
        <Link to="/bezpecnost" className="font-semibold text-primary underline underline-offset-4">
          Jak chráníme vaše data
        </Link>
      </p>
      <AlertDialog onOpenChange={(o) => !o && setConfirm("")}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="rounded-[10px] text-red-700 hover:text-red-800">
            <Trash2 className="mr-2 h-4 w-4" /> Smazat účet a všechna data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Opravdu smazat účet?</AlertDialogTitle>
            <AlertDialogDescription>
              Všechny projekty a data zmizí a nepůjde je obnovit. Pro potvrzení napište SMAZAT.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="SMAZAT"
            aria-label="Pro potvrzení napište SMAZAT"
            autoComplete="off"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[10px]">Ponechat účet</AlertDialogCancel>
            <Button
              className="rounded-[10px] bg-red-700 text-white hover:bg-red-800"
              disabled={!ready || busy}
              onClick={run}
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Smazat účet
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
