---
title: Test nápadu (Rentgen)
description: Čtyři otázky, výsledek do minuty. Co se zadává, co vrací AI, jak se počítá kapitál, bod zvratu a mapa A → B → C → D.
---

Test nápadu (v aplikaci „Rentgen“) je vstupní bod. Ze 4 krátkých otázek vytvoří první diagnózu projektu a předvyplní brány 1–3. Zabere asi 5 minut, výsledek je obvykle do 30 sekund.

Na začátku vyberete, kde jste:
- **Začínám podnikat**: ověření nápadu.
- **Už podnikám**: kde vám online přinese nové zákazníky a peníze.

## Co zadáváte (Začínám podnikat)

| Krok | Otázka | Možnosti |
|---|---|---|
| 1 | **Jaký máte nápad?** | jedna věta (max. 600 znaků), příklady jako tlačítka |
| 2 | **Pro koho to je a co mu to vyřeší?** | kdo bude platit, jaký problém mu vyřešíte. Obojí nepovinné, AI navrhne. |
| 3 | **Jaká je vaše situace?** | hodiny týdně (5 / 10 / 20 / 40), kolik peněz můžete riskovat (0 / 10 / 30 / 100 / 250+ tisíc Kč), cíl (přivýdělek / nahradit mzdu / velká firma), dnešní čistý měsíční příjem (nepovinné) |
| 4 | **Co umíte?** | prodej, marketing, web a technika, znalost oboru, čísla, nebo „nic z toho zatím“ |

## Co zadáváte (Už podnikám)

| Krok | Otázka |
|---|---|
| 1 | Čím se dnes živíte a co chcete od online (víc zákazníků / nový příjem / méně práce s objednávkami / nevím) |
| 2 | Kdo k vám chodí a proč právě k vám |
| 3 | Měsíční tržby (pásmo, nepovinné), průměrná útrata zákazníka, co už online máte (web, Google profil, sítě, rezervace, e-shop), čas a rozpočet na online |
| 4 | Co umíte |

## Co s odpověďmi dělá AI

AI (model Claude od Anthropicu) dostane **jen vaše odpovědi z testu**, ne vaše jméno ani e-mail. Má tyto pokyny:
- být upřímná a nelichotit,
- brát ohled na váš čas, rozpočet a dovednosti,
- počítat s online projektem a podnikatelským minimalismem (začít s malým rozpočtem),
- uvádět realistická čísla pro daný typ byznysu, objem odhadovat opatrně podle hodin týdně,
- mezi náklady nezahrnovat vaši vlastní odměnu.

Hodnotu přidané hodnoty posuzuje podle strategie modrého oceánu a Hormoziho rovnice hodnoty: *vysněný výsledek × pravděpodobnost úspěchu ÷ (čas × úsilí)*.

## Co dostanete (Začínám podnikat)

- **Semafor**
  - zelená: dává smysl začít hned,
  - oranžová: dává smysl, ale je potřeba něco upravit nebo nejdřív ověřit,
  - červená: v této podobě nedoporučujeme, s vysvětlením proč a co by to změnilo.
- **Název projektu a slogan** (pracovní návrh).
- **Typ byznysu** (jeden ze 13) a platforma.
- **Čtyři čísla:** typ byznysu, potřebný kapitál, bod zvratu, tržby potřebné pro bod C.
- **Mapa cesty A → B → C → D.**
- **3 největší rizika**, ke každému levný test do 14 dnů.
- **Na čem stavět**: 1–3 silné stránky.
- Doporučený další krok: brána 1.

## Jak se čísla počítají

AI odhadne vstupy byznys case (cena, objem ve 12. měsíci, marže, 3–10 položek nákladů). Výpočet pak dělá aplikace **stejnými vzorci jako v [bráně 3](/brany/brana-3-strategie-a-cisla/)**:

| Číslo | Výpočet |
|---|---|
| **Potřebný kapitál** | nejnižší bod kumulovaného cash flow za 24 měsíců (realistický scénář). Porovná se s tím, kolik chcete riskovat. |
| **Bod zvratu** | první měsíc, kdy jsou tržby nad nulou a měsíční zisk ≥ 0 |
| **Cílový příjem (bod C)** | přivýdělek: méně z 10 000 Kč a dnešního příjmu · nahradit mzdu: dnešní čistý příjem · velká firma: 2 × více z dnešního příjmu a 35 000 Kč. Bez zadaného příjmu se počítá s 35 000 Kč. |
| **Tržby pro bod C** | (cílový příjem + měsíční provoz + marketing) / hrubá marže, zaokrouhleno nahoru na tisíce |

### Mapa A → B → C → D

Mapa se počítá na 60 měsíců ve dvou scénářích: **realistickém** (100 % plánovaného objemu) a **opatrném** (60 %). Rozpětí „od–do“ je měsíc v realistickém a v opatrném scénáři.

| Bod | Název | Kdy nastane |
|---|---|---|
| A | Dnes | výchozí bod: nápad, čas, rozpočet |
| B | První zákazníci | kumulativně 10 platících zákazníků (u obsahového webu 1 000 návštěv měsíčně) |
| C | Živí mě to | první měsíc, kdy zisk ≥ cílový příjem |
| D | Roste to beze mě | první měsíc, kdy zisk ≥ cílový příjem + 25 000 Kč (unese prvního spolupracovníka) |

Pokud bod nenastane do 5 let, mapa to řekne. Údaje nad 24 měsíců jsou jen orientační. Až v bráně 3 vyplníte vlastní čísla, mapa na přehledu projektu se přepočítá z nich.

## Co dostanete (Už podnikám)

- **Co vás dnes nejvíc brzdí**: jedna věta.
- **3 příležitosti, kde vám online vydělá**, seřazené od nejrychlejšího efektu. U každé: náročnost, odhad přínosu od–do Kč měsíčně s výpočtem (průměrná útrata × realistický počet zákazníků), proč právě pro vás a **první krok na tento týden**. Kroky si odškrtáváte.
- Na čem online stavět.
- Doporučený další krok: strategie modrého oceánu (brána 1).

AI má pokyn stavět na tom, co už máte (nedoporučí web, když ho máte), a hledat novou hodnotu, ne jen „víc reklamy“.

## Co se předvyplní do bran

Jen pokud v bráně ještě nic nemáte:

| Kam | Co |
|---|---|
| Brána 1 | název, slogan, zákazník, problém, nabídka, levná a prémiová konkurence |
| Brána 2 | všech 8 polí Lean Canvasu |
| Brána 3 | příjmy a náklady byznys case |

ERRC matice ani USP se nepředvyplňují, ty jsou na vás. Předvyplněné brány nesou upozornění, že jde o první návrh AI, který je potřeba projít a přepsat.

## Limity a soukromí

- Test jde na jeden projekt udělat třikrát.
- Výsledek je **odhad z vašich odpovědí a obvyklých čísel v oboru, ne záruka**.
