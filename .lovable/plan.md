

## Odemknutí fáze 7 (Expansion) a všech placených fází

### Problém
Dashboard naviguje na `/expansion/preview` místo `/expansion`, protože fáze 5-7 mají `isFree: false` a `previewOnly: true`. Přístup závisí na `hasAccess` nebo `promoCodeAccess`, které jsou `false`.

### Řešení
Označit všechny fáze jako `isFree: true` a odstranit `previewOnly` flag z fází 5-7 v `Dashboard.tsx`. Tím se všechny fáze odemknou bez nutnosti platby.

### Technické změny

**Soubor: `src/components/Dashboard.tsx`**
- Fáze 5 (Benchmarking): `isFree: true`, odstranit `previewOnly: true`
- Fáze 6 (Launch): `isFree: true`, odstranit `previewOnly: true`
- Fáze 7 (Expansion): `isFree: true`, odstranit `previewOnly: true`

Tím se zjednoduší logika v `handlePhaseClick` — všechny fáze projdou větví pro free fáze a navigují přímo na plnou verzi.

