## Cíl
Přidat nový typ podnikání "Vlastní nápad app" do fáze Implementation. Uživatel si pomocí vibe codingu (AI-asistovaného programování) postaví aplikaci přesně podle své vize. Kroky ukážou konkrétní nástroje jako AI Studio, Claude, n8n, GitHub a další.

## Změny

### 1. `src/types/implementation.ts`
Přidat nový záznam do pole `businessTypes` (na konec, jako 13. položku):

- `id`: `vlastni-napad-app`
- `name`: `Vlastní nápad app`
- `difficulty`: `Vyšší`
- `duration`: `14–30 dní`
- `description`: Vytvořte si vlastní aplikaci na míru pomocí vibe codingu a AI nástrojů. Bez nutnosti umět programovat.
- `videoUrl`: placeholder (jako ostatní)
- `templateUrl`: `#template-vibe-coding` (žádná WP šablona — je to app, ne web)
- `steps`: cca 13–15 kroků pokrývajících celý workflow vibe codingu:

  1. Ujasnění nápadu a sepsání zadání (Notion / Google Docs, 0 Kč)
  2. Rozvedení konceptu pomocí AI (Google AI Studio – Gemini, 0 Kč)
  3. Vytvoření detailního product briefu (Claude – Anthropic, 0 / 500 Kč měsíčně Pro)
  4. Návrh UI/UX wireframů (Figma + AI pluginy, 0 Kč)
  5. Založení účtu na Lovable (Lovable.dev, 0 / od 500 Kč)
  6. Vygenerování prototypu aplikace (Lovable / v0.dev / Bolt.new, dle plánu)
  7. Založení repozitáře pro verzování kódu (GitHub, 0 Kč)
  8. Napojení backendu a databáze (Supabase / Lovable Cloud, 0 Kč free tier)
  9. Automatizace workflow a integrací (n8n / Make, 0 Kč self-host / od 500 Kč)
  10. Napojení AI funkcionalit do aplikace (OpenAI API / Anthropic API / Lovable AI, dle spotřeby)
  11. Nastavení plateb (Stripe, 0 Kč + provize z transakcí)
  12. Deploy aplikace (Vercel / Lovable hosting, 0 Kč free tier)
  13. Napojení vlastní domény (WEDOS.cz + DNS, 299 Kč)
  14. Testování a ladění s AI (Cursor / Claude Code, 0 / od 500 Kč)
  15. Spuštění a sběr zpětné vazby uživatelů (PostHog / Plausible, 0 Kč free tier)

Konkrétní ceny a znění polí `note` sladím s tónem ostatních záznamů (krátká, praktická poznámka).

### 2. Nic dalšího není potřeba
- `ImplementationPhase.tsx` čte pole `businessTypes` a filtruje/vykresluje automaticky — nová karta se objeví bez dalších úprav.
- `BusinessTypeRoadmap.tsx` (detail) pracuje generický nad `steps` a `templateUrl` — funguje out-of-the-box. Tlačítko "Automatická instalace WordPress" má smysl skrýt pro tento typ, protože nejde o WP → pokud se to bude hodit, přidám jednoduchou podmínku `if businessType.id !== 'vlastni-napad-app'`.

## Otázka na potvrzení
- Skrýt u tohoto typu tlačítko "Automatická instalace WordPress" v roadmap detailu? (dává smysl, není to WP projekt) — pokud ano, přidám tu podmínku.
