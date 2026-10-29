---
title: Cash flow a napojení účtu (PSD2)
description: Jak funguje napojení podnikatelského účtu ve VISIBLE7, kudy tečou data, co se ukládá, co nikdy nevidíme a jak účet odpojit.
---

:::note[Stav: uzavřený pilot]
Napojení účtu je zatím v uzavřeném pilotu. Ostatní uživatelé vidí Cash flow a Můj podnik na ukázkových datech a mohou se přihlásit do pilotu tlačítkem „Chci do pilotu“.
:::

## K čemu to je

Sekce **Můj podnik** je pro ty, kdo už podnikají. **Cash flow** porovnává váš plán z [byznys case](/brany/brana-3-strategie-a-cisla/) se skutečností z bankovního účtu: kolik přišlo, kolik odešlo a za co, po měsících.

## Na čem stojí: PSD2

Evropská směrnice PSD2 dovoluje, abyste s vaším souhlasem nechali licencovaného poskytovatele číst pohyby na účtu (služba informování o účtu, AISP). VISIBLE7 **nemá vlastní bankovní licenci ani přímé napojení na banky**. Využívá licencovaného poskytovatele a jeho partnera, který platby kategorizuje.

## Tok dat krok za krokem

```
Vy ──► VISIBLE7: vyberete banku
         │
         ▼
   Přihlášení přímo v bance ──► udělíte souhlas se čtením účtu
         │
         ▼
   Licencovaný poskytovatel (AISP) čte pohyby za posledních 365 dní
         │
         ▼
   Partner pro kategorizaci: každé platbě přidá štítky (daně, nájem, faktury…)
         │
         ▼
   Server VISIBLE7: v paměti sečte platby po měsících a kategoriích
         │
         ▼
   Databáze VISIBLE7: uloží JEN měsíční souhrny ──► Cash flow a Můj podnik
```

1. V aplikaci vyberete banku.
2. Přesměrujeme vás **na přihlášení do vaší banky**. Přihlašovací údaje zadáváte jen bance, VISIBLE7 je nikdy nevidí.
3. V bance udělíte souhlas se čtením účtu.
4. Po návratu do aplikace se načtou pohyby za posledních 365 dní.
5. Server VISIBLE7 je zpracuje **jen v paměti** a uloží měsíční souhrny.
6. Cash flow a Můj podnik se přepnou z ukázkových dat na „Data z vašeho účtu“.

## Co ukládáme a co ne

| Ukládáme | Neukládáme |
|---|---|
| banku a maskované číslo účtu (•••• 1234) | celé číslo účtu |
| stav připojení a do kdy platí souhlas | přihlašovací údaje do banky (nikdy je nevidíme) |
| za každý měsíc: příjmy, výdaje, součty podle kategorií, počet plateb, zůstatek | jednotlivé platby |
| | popisy plateb a protistrany (komu a od koho) |

Souhrny vidí jen majitel účtu. Zapisovat je umí jen server VISIBLE7. Počítají se platby v korunách.

## Kategorie

| Kategorie VISIBLE7 | Co do ní patří |
|---|---|
| Tržby | faktury a běžné příchozí platby |
| Daně a odvody | daně, sociální a zdravotní pojištění |
| Provoz | nájem, energie, telefon, IT, předplatné, pojištění, pohonné hmoty |
| Zboží a materiál | nákupy |
| Převody mezi vlastními účty | mění zůstatek, ale nepočítají se do tržeb ani nákladů |
| Ostatní | zbytek |

Mzdy a marketing zatím automaticky nepoznáme, spadnou do „Ostatní“.

## Bez napojení: PDF výpisy

Místo napojení můžete nahrát 1–12 výpisů v PDF. Zpracují se stejně a uloží se jen měsíční souhrny, PDF se neukládá.

## Souhlas a odpojení

- Souhlas v bance platí omezenou dobu (počítáme se 180 dny). Pak vás aplikace požádá o nové připojení.
- **Odpojení** jedním tlačítkem: nejdřív odvoláme souhlas u poskytovatele, pak smažeme připojení i všechny jeho měsíční souhrny z VISIBLE7.

## Co zatím neumíme

- automatickou denní aktualizaci (data obnovíte tlačítkem),
- e-mailová upozornění na cash flow,
- přesné daně: data z banky ukazují peníze, ne účetní doklady. Odhady jsou orientační, nejde o daňové ani finanční poradenství.
