import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";

/** Výběr, založení a přejmenování projektu na přehledu. */
export const ProjectSwitcher = () => {
  const { projects, currentProject, loading, switchProject, createProject, renameProject, deleteProject } = useProject();
  const { toast } = useToast();
  const [mode, setMode] = useState<"view" | "create" | "rename">("view");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="mb-8 h-16 animate-pulse rounded-xl bg-muted" />
    );
  }

  const startRename = () => {
    setName(currentProject?.name ?? "");
    setMode("rename");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    if (mode === "create") {
      const created = await createProject(name);
      toast(
        created
          ? { title: "Projekt založen", description: `Pracujete na projektu „${created.name}“.` }
          : { title: "Projekt se nepodařilo založit", variant: "destructive" }
      );
    } else if (mode === "rename" && currentProject) {
      const ok = await renameProject(currentProject.id, name);
      if (!ok) toast({ title: "Přejmenování se nezdařilo", variant: "destructive" });
    }
    setBusy(false);
    setMode("view");
    setName("");
  };

  return (
    <header className="mb-8 pt-2">
      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <p className="text-muted-foreground">Váš projekt</p>
          {mode === "view" && (
            <h1 className="break-words text-3xl font-extrabold tracking-tight text-foreground sm:text-[2.5rem] sm:leading-tight">
              {currentProject?.name ?? "Žádný projekt"}
            </h1>
          )}
        </div>

        {mode === "view" ? (
          <div className="flex flex-wrap items-center gap-2">
            {projects.length > 1 && (
              <Select value={currentProject?.id} onValueChange={switchProject}>
                <SelectTrigger className="h-10 w-56 rounded-xl">
                  <SelectValue placeholder="Vyberte projekt" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {currentProject && (
              <Button variant="outline" className="h-10 rounded-[10px]" onClick={startRename}>
                <Pencil className="mr-2 h-4 w-4" />
                Přejmenovat
              </Button>
            )}
            {currentProject && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-[10px] text-red-700 hover:text-red-800">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Smazat
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Smazat projekt „{currentProject.name}“?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Projekt i všechny jeho fáze zmizí z vašeho přehledu a nepůjde ho obnovit. Osvědčení, která jste za něj
                      získali, zůstanou platná.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-[10px]">Ponechat</AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-[10px] bg-red-700 text-white hover:bg-red-800"
                      onClick={async () => {
                        const name = currentProject.name;
                        const ok = await deleteProject(currentProject.id);
                        toast(
                          ok
                            ? { title: "Projekt smazán", description: `„${name}“ už na přehledu neuvidíte.` }
                            : { title: "Projekt se nepodařilo smazat", variant: "destructive" }
                        );
                      }}
                    >
                      Smazat projekt
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button className="h-10 rounded-[10px]" onClick={() => setMode("create")}>
              <Plus className="mr-2 h-4 w-4" />
              Nový projekt
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-1 items-center gap-2 md:max-w-md">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={mode === "create" ? "Název nového projektu" : "Nový název"}
              className="h-10 rounded-[10px]"
              autoFocus
            />
            <Button type="submit" className="h-10 rounded-[10px]" disabled={busy || !name.trim()} aria-label="Uložit">
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-[10px]"
              onClick={() => {
                setMode("view");
                setName("");
              }}
              aria-label="Zrušit"
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </header>
  );
};
