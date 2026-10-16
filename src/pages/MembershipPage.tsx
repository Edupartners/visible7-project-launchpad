import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, PartyPopper, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/visible7/client";
import { kc, monthsLabel, nbsp, perMonth, useShop } from "@/lib/shop";
import { track } from "@/lib/track";

const ITEMS = [
  "Všech 7 bran metodiky VISIBLE7 MICEK®",
  "Přes 100 videonávodů, kde je vidět každé kliknutí",
  "AI asistent u každé brány",
  "Byznys case v Excelu a pitch na A4",
  "Osvědčení za každou bránu",
];

/** Objednávkový formulář SimpleShopu v iframu.
 *  Jejich zavaděč (SimpleShopService.js) v React aplikaci padal („Načítám objednávkový formulář…“ beze změny),
 *  hostovaný formulář v iframu funguje spolehlivě. */
function SimpleShopForm({ formId, url }: { formId: string; url?: string }) {
  const src = url || `https://form.simpleshop.cz/${encodeURIComponent(formId)}/buy/`;
  return (
    <div>
      <iframe
        src={src}
        title="Objednávka členství VISIBLE7"
        className="h-[820px] w-full rounded-xl border-0 bg-white"
      />
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Formulář se nezobrazuje?{" "}
        <a href={src} target="_blank" rel="noopener noreferrer" className="underline">
          Otevřít objednávku v novém okně
        </a>
      </p>
    </div>
  );
}

/** Stránka s nákupem členství – zákazník zůstává na visible7.io. */
const MembershipPage = () => {
  const shop = useShop();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [params] = useSearchParams();
  const paid = params.has("zaplaceno");
  const paidMail = params.get("mail");

  useEffect(() => {
    document.title = "Členství | VISIBLE7 MICEK";
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    track(paid ? "membership_paid_return" : "membership_page", { price: shop.price });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (paid) {
    const mail = email ?? (paidMail && !paidMail.includes("{") ? paidMail : null);
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PublicHeader onStart={() => navigate("/home?novy")} />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-8 lg:py-24">
          <PartyPopper className="mx-auto h-12 w-12 text-orange-500" />
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">Děkujeme, platba je přijatá</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Členství VISIBLE7 se vám zapne do pár minut
            {mail ? (
              <>
                {" "}
                na účtu <strong className="break-all text-foreground">{mail}</strong>
              </>
            ) : null}
            . Pokud s tímto e-mailem ještě účet nemáte, zaregistrujte se – členství se zapne hned po registraci.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Daňový doklad vám přijde e-mailem od Edu Partners s.r.o.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(email ? "/home" : "/home?novy")}
              className="flex h-12 items-center justify-center rounded-xl bg-orange-500 px-7 font-semibold text-white hover:bg-orange-600"
            >
              {email ? "Pokračovat v projektu" : "Přihlásit se nebo zaregistrovat"}
            </button>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Něco nefunguje? Napište nám na{" "}
            <a href="mailto:info@visible7.io" className="underline">
              info@visible7.io
            </a>
            .
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader onStart={() => navigate("/home?novy")} />
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:px-12 lg:py-16">
        <section>
          <p className="font-semibold text-orange-700">Členství VISIBLE7</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Celá cesta od nápadu k prvním zákazníkům
          </h1>
          <p className="mt-5 text-5xl font-extrabold tracking-tight">{kc(shop.price)}</p>
          <p className="text-muted-foreground">
            na {monthsLabel(shop.months)} · vychází na {perMonth(shop)} měsíčně · včetně DPH
          </p>
          {shop.anchor && <p className="mt-3 text-muted-foreground">{nbsp(shop.anchor)}</p>}
          <ul className="mt-6 space-y-2.5">
            {ITEMS.map((it) => (
              <li key={it} className="flex gap-2">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" strokeWidth={3} />
                {it}
              </li>
            ))}
          </ul>
          <ul className="mt-6 space-y-1.5 text-sm text-muted-foreground">
            <li>Platíte jednou, nic se samo neobnovuje.</li>
            <li>Vaše projekty a data zůstávají uložené i po skončení členství.</li>
            <li>Daňový doklad vám přijde e-mailem od Edu Partners s.r.o.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-4 flex gap-3 rounded-xl bg-orange-50 p-4 text-sm">
            <ShieldCheck className="h-5 w-5 shrink-0 text-orange-700" />
            <p>
              {email ? (
                <>
                  Do objednávky zadejte e-mail <strong className="break-all">{email}</strong> – členství se vám po
                  zaplacení zapne samo.
                </>
              ) : (
                <>
                  Zadejte e-mail, kterým se přihlašujete do aplikace (nebo se jím pak zaregistrujte). Členství se vám po
                  zaplacení zapne samo.
                </>
              )}
            </p>
          </div>
          {shop.form_id ? (
            <SimpleShopForm formId={shop.form_id} url={shop.checkout_url} />
          ) : shop.checkout_url ? (
            <a
              href={shop.checkout_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center rounded-xl bg-orange-500 font-semibold text-white hover:bg-orange-600"
            >
              Přejít k objednávce
            </a>
          ) : (
            <p className="text-muted-foreground">Prodej členství spouštíme brzy.</p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Objednávkou souhlasíte s{" "}
            <Link to="/podminky" className="underline">
              podmínkami užívání
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MembershipPage;
