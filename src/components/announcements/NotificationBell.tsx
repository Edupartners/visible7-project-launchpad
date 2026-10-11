import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CalendarDays, ExternalLink, Info, Sparkles, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Announcement, AnnouncementKind, KIND_LABELS, useAnnouncements } from "@/lib/announcements";

const KIND_ICON: Record<AnnouncementKind, typeof Bell> = { novinka: Sparkles, akce: CalendarDays, info: Info };

const fmt = (iso: string) => new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" });

export function AnnouncementLink({ a, onClick }: { a: Announcement; onClick?: () => void }) {
  if (!a.link_url) return null;
  const label = a.link_label || "Více informací";
  const cls = "mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline";
  return a.link_url.startsWith("/") ? (
    <Link to={a.link_url} className={cls} onClick={onClick}>
      {label}
    </Link>
  ) : (
    <a href={a.link_url} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
      {label} <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

/** Zvoneček s počtem nepřečtených zpráv. Otevřením se zprávy označí jako přečtené. */
export function NotificationBell({ className = "" }: { className?: string }) {
  const { items, unread, isRead, markAllRead, dismiss } = useAnnouncements();
  const [open, setOpen] = useState(false);
  const [seenUnread, setSeenUnread] = useState<Set<string>>(new Set());

  const onOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      setSeenUnread(new Set(items.filter((a) => !isRead(a.id)).map((a) => a.id)));
      void markAllRead();
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground ${className}`}
          aria-label={unread ? `Oznámení, nepřečtené: ${unread}` : "Oznámení"}
          title="Oznámení"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="font-bold">Oznámení</p>
        </div>
        {items.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">Zatím žádné zprávy.</p>
        ) : (
          <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
            {items.map((a) => {
              const Icon = KIND_ICON[a.kind];
              return (
                <li key={a.id} className={`relative px-4 py-3 pr-10 ${seenUnread.has(a.id) ? "bg-orange-50" : ""}`}>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" /> {KIND_LABELS[a.kind]} · {fmt(a.starts_at)}
                  </p>
                  <p className="mt-0.5 font-semibold">{a.title}</p>
                  {a.body && <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{a.body}</p>}
                  <AnnouncementLink a={a} onClick={() => setOpen(false)} />
                  <button
                    type="button"
                    onClick={() => dismiss(a.id)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`Skrýt oznámení ${a.title}`}
                    title="Skrýt"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Zvýrazněná oznámení na nástěnce – zůstanou, dokud je uživatel nezavře. */
export function DashboardAnnouncements() {
  const { highlighted, dismiss } = useAnnouncements();
  if (!highlighted.length) return null;
  return (
    <div className="space-y-3">
      {highlighted.map((a) => {
        const Icon = KIND_ICON[a.kind];
        return (
          <section
            key={a.id}
            className="relative flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 pr-11"
            aria-label={a.title}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-orange-700">{KIND_LABELS[a.kind]}</p>
              <p className="font-bold">{a.title}</p>
              {a.body && <p className="mt-1 whitespace-pre-line text-sm text-foreground/80">{a.body}</p>}
              <AnnouncementLink a={a} />
            </div>
            <button
              type="button"
              onClick={() => dismiss(a.id)}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-orange-100 hover:text-foreground"
              aria-label="Zavřít oznámení"
            >
              <X className="h-4 w-4" />
            </button>
          </section>
        );
      })}
    </div>
  );
}
