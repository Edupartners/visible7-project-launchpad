import { useState } from "react";
import { Expand, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { track } from "@/lib/track";
import { FIGURES, FigureId, figureSrc as src } from "@/lib/figures";

/** Galerie obrázků metodiky. Klik otevře obrázek ve velkém; na mobilu se dá posouvat. */
export const MethodFigures = ({
  ids,
  title = "Metodika v obrázcích",
  intro,
}: {
  ids: FigureId[];
  title?: string;
  intro?: string;
}) => {
  const [open, setOpen] = useState<FigureId | null>(null);
  const single = ids.length === 1;
  const show = (id: FigureId) => {
    setOpen(id);
    track("figure_open", { figure: id });
  };
  return (
    <section aria-label={title} className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-xl font-bold">{title}</h2>
      {intro && <p className="mt-1 text-sm text-muted-foreground">{intro}</p>}
      <div className={`mt-4 grid gap-4 ${single ? "" : "sm:grid-cols-2"}`}>
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => show(id)}
            className="group relative overflow-hidden rounded-xl border border-border bg-white text-left transition hover:shadow-[0_14px_32px_-18px_rgba(15,23,42,0.45)]"
          >
            <img src={src(id)} alt={FIGURES[id]} loading="lazy" className="w-full" />
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white opacity-90 group-hover:opacity-100">
              <Expand className="h-3.5 w-3.5" aria-hidden="true" /> Zvětšit
            </span>
          </button>
        ))}
      </div>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-[min(96vw,1200px)] p-3 sm:p-5">
          <DialogHeader>
            <DialogTitle>{open ? FIGURES[open] : ""}</DialogTitle>
            <DialogDescription className="flex items-center gap-3">
              <span className="sm:hidden">Obrázek posouvejte prstem do stran.</span>
              {open && (
                <a
                  href={src(open)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Otevřít v plné velikosti
                </a>
              )}
            </DialogDescription>
          </DialogHeader>
          {open && (
            <div className="max-h-[78vh] overflow-auto rounded-lg border border-border">
              <img src={src(open)} alt={FIGURES[open]} className="w-full min-w-[900px] sm:min-w-0" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
