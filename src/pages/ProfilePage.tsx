import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  Camera,
  ChevronDown,
  Crown,
  FileText,
  GraduationCap,
  Linkedin,
  Loader2,
  Map,
  Settings,
  Star,
} from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { useAuth } from "@/components/AuthGate";
import { UserAvatar } from "@/components/profile/Avatar";
import { CertificatesPanel } from "@/components/CertificatesPanel";
import { supabase } from "@/integrations/visible7/client";
import { useAccess } from "@/lib/access";
import { useAllBlockVideos } from "@/lib/blockVideos";
import { Certificate, certificateTitle, legacyPdfUrl, linkedInAddUrl, listMyCertificates } from "@/lib/certificates";
import { coursesProgress, hoursLabel, videoMinutes } from "@/lib/courses";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { ENTRY_KEY, type EntryDiagnosis } from "@/lib/entryDiagnosis";
import { recommendedCourses, useMyCourses } from "@/lib/courseRecommend";
import { useToast } from "@/hooks/use-toast";

type TileId = "osvedceni" | "kurzy" | "cesta" | "clenstvi";

const fmtDate = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString("cs-CZ") : "");

/** Dlaždice: rychlý přehled, klik rozbalí podrobnosti pod dlaždicemi (nebo otevře stránku). */
function Tile({
  icon,
  value,
  label,
  color,
  active,
  onClick,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  color: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      className={`flex h-36 w-full flex-col justify-between overflow-hidden rounded-2xl p-4 text-left text-white transition-[filter] hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring sm:h-40 sm:p-5 ${color} ${
        active ? "ring-4 ring-signal ring-offset-2 ring-offset-background" : ""
      }`}
    >
      <span className="flex items-start justify-between">
        {icon}
        {active !== undefined && (
          <ChevronDown className={`h-5 w-5 opacity-70 transition-transform ${active ? "rotate-180" : ""}`} />
        )}
      </span>
      <span>
        <span className="block truncate text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">{value}</span>
        <span className="mt-1 block truncate text-xs font-semibold opacity-90 sm:text-sm">{label}</span>
      </span>
    </button>
  );
}

/** Skupina kurzů v profilu: obrázek, název, postup, hvězdička „moje“ a odkaz do kurzu. */
function CourseGroup({
  title,
  hint,
  empty,
  rows,
  mine,
  onToggle,
}: {
  title: string;
  hint?: string;
  empty?: string;
  rows: CourseRow[];
  mine: string[];
  onToggle: (id: string) => void;
}) {
  if (rows.length === 0 && !empty) return null;
  return (
    <div>
      <h2 className="text-lg font-bold">
        {title} {hint && <span className="text-sm font-normal text-muted-foreground">· {hint}</span>}
      </h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((r) => {
            const isMine = mine.includes(r.course.id);
            return (
              <li
                key={r.course.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 sm:gap-4"
              >
                <img
                  src={r.course.cover}
                  alt=""
                  className="hidden h-14 w-24 shrink-0 rounded-lg object-cover sm:block"
                />
                <Link to={`/kurz/${r.course.id}`} className="min-w-0 flex-1 hover:underline">
                  <p className="font-bold leading-snug">{r.course.title}</p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                      <div className="h-full bg-leaf-500" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {r.done === r.total ? "Hotovo" : r.done > 0 ? `${r.done} z ${r.total} lekcí` : `${r.total} lekcí`}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => onToggle(r.course.id)}
                  aria-pressed={isMine}
                  aria-label={isMine ? "Odebrat z mých kurzů" : "Přidat do mých kurzů"}
                  title={isMine ? "Odebrat z mých kurzů" : "Přidat do mých kurzů"}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-muted"
                >
                  <Star className={`h-5 w-5 ${isMine ? "fill-amber-400 text-amber-500" : "text-muted-foreground"}`} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

type CourseRow = ReturnType<typeof coursesProgress>[number];

/** Profil studenta: kdo jsem, co jsem dokázal(a) a rychlý vstup k osvědčením, kurzům, cestě a členství. */
export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { toast } = useToast();
  const access = useAccess();
  const { videos: all, watched, ready } = useAllBlockVideos();
  const [completed] = useSupabaseProgress<number[]>("completed_phases", []);
  const [certs, setCerts] = useState<Certificate[] | null>(null);
  const [open, setOpen] = useState<TileId | null>("kurzy");
  const [diagnosis] = useSupabaseProgress<EntryDiagnosis | null>(ENTRY_KEY, null);
  const { mine, toggle: toggleMine } = useMyCourses();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = (user?.user_metadata ?? {}) as { first_name?: string; last_name?: string };
  const first = meta.first_name?.trim() || (user?.email ?? "").split("@")[0];
  const fullName = [meta.first_name, meta.last_name].filter(Boolean).join(" ") || first;

  useEffect(() => {
    document.title = "Můj profil | micek.academy";
    listMyCertificates().then(setCerts);
  }, []);
  useEffect(() => {
    const h = hash.replace("#", "") as TileId;
    if (["osvedceni", "kurzy", "cesta", "clenstvi"].includes(h)) setOpen(h);
  }, [hash]);

  const rows = ready ? coursesProgress(all, watched) : [];
  const recommended = recommendedCourses(diagnosis?.answers);
  const started = rows.filter((r) => r.done > 0);
  const finished = rows.filter((r) => r.done === r.total);
  const seenVideos = all.filter((v) => watched.has(v.id));
  const minutes = seenVideos.reduce((s, v) => s + videoMinutes(v), 0);
  const certCount = certs?.length ?? 0;
  const gatesDone = completed.length;

  // Krátká povzbudivá věta podle toho, co už má člověk za sebou.
  const cheer =
    certCount >= 3
      ? `${first}, ${certCount} osvědčení. To je výkon, klobouk dolů!`
      : certCount > 0
        ? `${first}, máte ${certCount === 1 ? "první osvědčení" : `${certCount} osvědčení`}. Skvělá práce, jen tak dál!`
        : seenVideos.length > 0
          ? `${first}, máte za sebou ${seenVideos.length} ${seenVideos.length === 1 ? "lekci" : seenVideos.length <= 4 ? "lekce" : "lekcí"}. Šikovné, pokračujte!`
          : `${first}, vítejte! První lekce je nejtěžší, pak už to jede samo.`;

  const toggle = (t: TileId) => setOpen((o) => (o === t ? null : t));

  const uploadPhoto = async (f: File | undefined) => {
    if (!f || !user) return;
    if (f.size > 2 * 1024 * 1024) {
      toast({ title: "Fotka je moc velká", description: "Nahrajte prosím fotku do 2 MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, f, { upsert: true, contentType: f.type });
    if (!error) {
      const url = `${supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
      await supabase.auth.updateUser({ data: { avatar_url: url } });
    }
    setUploading(false);
    if (error) toast({ title: "Fotku se nepodařilo nahrát", description: error.message, variant: "destructive" });
  };

  return (
    <SidebarLayout>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-8">
        {/* Kdo jsem */}
        <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            <UserAvatar size={96} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary text-white hover:bg-primary/90"
              aria-label="Nahrát profilovou fotku"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => uploadPhoto(e.target.files?.[0])}
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{fullName}</h1>
            <p className="mt-1 text-lg font-semibold text-leaf-700">{cheer}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {seenVideos.length}{" "}
              {seenVideos.length === 1
                ? "zhlédnutá lekce"
                : seenVideos.length >= 2 && seenVideos.length <= 4
                  ? "zhlédnuté lekce"
                  : "zhlédnutých lekcí"}
              {minutes > 0 ? ` · ${hoursLabel(minutes)} studia` : ""} · {finished.length}{" "}
              {finished.length === 1
                ? "dokončený kurz"
                : finished.length >= 2 && finished.length <= 4
                  ? "dokončené kurzy"
                  : "dokončených kurzů"}
            </p>
          </div>
        </header>

        {/* Dlaždice */}
        <nav aria-label="Můj profil" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <Tile
            icon={<Award className="h-7 w-7" />}
            value={certs ? String(certCount) : "…"}
            label="Osvědčení"
            color="bg-primary"
            active={open === "osvedceni"}
            onClick={() => toggle("osvedceni")}
          />
          <Tile
            icon={<GraduationCap className="h-7 w-7" />}
            value={ready ? String(new Set([...started.map((r) => r.course.id), ...mine]).size) : "…"}
            label="Kurzy"
            color="bg-leaf-600"
            active={open === "kurzy"}
            onClick={() => toggle("kurzy")}
          />
          <Tile
            icon={<Map className="h-7 w-7" />}
            value={`${gatesDone}/7`}
            label="Moje cesta"
            color="bg-sky-700"
            active={open === "cesta"}
            onClick={() => toggle("cesta")}
          />
          <Tile
            icon={<Crown className="h-7 w-7" />}
            value={access.loading ? "…" : access.paid ? "Člen" : "Bez členství"}
            label={access.paid && access.until ? `do ${fmtDate(access.until)}` : "Členství"}
            color="bg-amber-600"
            active={open === "clenstvi"}
            onClick={() => toggle("clenstvi")}
          />
          <Tile
            icon={<Settings className="h-7 w-7" />}
            value="Účet"
            label="Nastavení"
            color="bg-slate-700"
            onClick={() => navigate("/settings")}
          />
        </nav>

        {/* Rozbalené podrobnosti */}
        {open === "osvedceni" && (
          <section id="osvedceni" aria-label="Moje osvědčení" className="space-y-3">
            {certs && certs.length === 0 && (
              <p className="rounded-2xl border border-border bg-card p-5 text-muted-foreground">
                Zatím žádné osvědčení. Dokončete kurz v{" "}
                <Link to="/kurzy" className="font-semibold text-primary underline">
                  e-learningu
                </Link>{" "}
                a osvědčení si vystavíte jedním klikem.
              </p>
            )}
            {certs?.map((c) => (
              <article
                key={c.code}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Award className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link to={`/osvedceni/${c.code}`} className="text-lg font-bold leading-snug hover:underline">
                    {certificateTitle(c.kind, c.phase, c.bonus_key)}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Vystaveno {fmtDate(c.issued_at)} · kód {c.code}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/osvedceni/${c.code}?stahnout`}
                    className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-bold text-white hover:bg-primary/90"
                  >
                    Stáhnout
                  </Link>
                  {c.legacy_pdf && (
                    <button
                      type="button"
                      onClick={async () => {
                        const url = await legacyPdfUrl(c.legacy_pdf!);
                        if (url) window.location.href = url;
                      }}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"
                    >
                      <FileText className="h-4 w-4" /> Původní certifikát
                    </button>
                  )}
                  <a
                    href={linkedInAddUrl(c)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                </div>
              </article>
            ))}
          </section>
        )}

        {open === "kurzy" && (
          <section id="kurzy" aria-label="Moje kurzy" className="space-y-6">
            {/* Cesta podle diagnostiky */}
            <div className="rounded-2xl bg-leaf-50 p-5">
              {diagnosis ? (
                <p>
                  <span className="font-bold">
                    Vaše cesta: {diagnosis.answers.level === "start" ? "Rychlý start" : "Kompletní studium"}.
                  </span>{" "}
                  {diagnosis.answers.level === "start"
                    ? "Stačí pár kurzů, které vás posunou ke startu nejrychleji. Brány můžete projít později."
                    : "Projdete všechny doporučené kurzy a k tomu brány s vlastním projektem."}{" "}
                  <Link to="/diagnostika" className="font-semibold text-primary underline">
                    Změnit
                  </Link>
                </p>
              ) : (
                <p>
                  <span className="font-bold">Nevíte, kde začít?</span> Za 4 minuty vám vstupní diagnostika doporučí
                  kurzy na míru.{" "}
                  <Link to="/diagnostika" className="font-semibold text-primary underline">
                    Udělat diagnostiku
                  </Link>
                </p>
              )}
            </div>

            <CourseGroup title="Studuji" rows={rows.filter((r) => r.done > 0)} mine={mine} onToggle={toggleMine} />
            <CourseGroup
              title="Moje vybrané kurzy"
              empty="Zatím žádné. Kurz si přidáte hvězdičkou u doporučených níže nebo na stránce kurzu."
              rows={rows.filter((r) => mine.includes(r.course.id) && r.done === 0)}
              mine={mine}
              onToggle={toggleMine}
            />
            <CourseGroup
              title="Doporučené pro vás"
              hint={diagnosis ? "podle vstupní diagnostiky" : undefined}
              rows={rows.filter(
                (r) => recommended.includes(r.course.id) && r.done === 0 && !mine.includes(r.course.id),
              )}
              mine={mine}
              onToggle={toggleMine}
            />
            <Link to="/kurzy" className="inline-block font-semibold text-primary underline-offset-4 hover:underline">
              Všechny kurzy v e-learningu
            </Link>
          </section>
        )}

        {open === "cesta" && (
          <section id="cesta" aria-label="Moje cesta">
            <p className="mb-3 text-muted-foreground">
              Máte otevřeno {gatesDone} ze 7 bran.{" "}
              <Link to="/home" className="font-semibold text-primary underline">
                Pokračovat v cestě
              </Link>
            </p>
            <CertificatesPanel completed={completed} offersOnly />
          </section>
        )}

        {open === "clenstvi" && (
          <section id="clenstvi" aria-label="Členství" className="rounded-2xl border border-border bg-card p-5">
            {access.paid ? (
              <p>
                Máte členství
                {access.until ? (
                  <>
                    {" "}
                    do <strong>{fmtDate(access.until)}</strong>
                  </>
                ) : null}
                . Všechny kurzy, brány a vybrané semináře máte v ceně.
              </p>
            ) : (
              <p>
                Zatím nemáte členství.{" "}
                <Link to="/cenik" className="font-semibold text-primary underline">
                  Podívat se na ceník
                </Link>
              </p>
            )}
            <Link to="/settings#ucet" className="mt-2 inline-block text-sm font-semibold text-primary underline">
              Máte promo kód? Uplatníte ho v nastavení.
            </Link>
          </section>
        )}
      </main>
    </SidebarLayout>
  );
}
