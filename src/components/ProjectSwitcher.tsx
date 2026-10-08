import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, FolderOpen, Pencil, Plus, X } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";

/** Výběr, založení a přejmenování projektu na přehledu. */
export const ProjectSwitcher = () => {
  const { projects, currentProject, loading, switchProject, createProject, renameProject } = useProject();
  const { toast } = useToast();
  const [mode, setMode] = useState<"view" | "create" | "rename">("view");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <Card className="card-apple p-6 mb-6">
        <div className="h-10 animate-pulse rounded-xl bg-muted" />
      </Card>
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
    <Card className="card-apple p-6 mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Aktuální projekt</p>
            {mode === "view" && (
              <p className="text-lg font-semibold text-foreground">{currentProject?.name ?? "Žádný projekt"}</p>
            )}
          </div>
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
              <Button variant="outline" className="h-10 rounded-xl" onClick={startRename}>
                <Pencil className="mr-2 h-4 w-4" />
                Přejmenovat
              </Button>
            )}
            <Button className="h-10 rounded-xl" onClick={() => setMode("create")}>
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
              className="h-10 rounded-xl"
              autoFocus
            />
            <Button type="submit" className="h-10 rounded-xl" disabled={busy || !name.trim()} aria-label="Uložit">
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
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
    </Card>
  );
};
