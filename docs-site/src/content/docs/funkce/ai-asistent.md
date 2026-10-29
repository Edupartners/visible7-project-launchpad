---
title: AI asistent
description: Jakou AI VISIBLE7 používá, co přesně dělá v každé bráně, jaká data dostane, kdy hledá na webu a jaké má limity.
---

## Jaká AI to je

VISIBLE7 používá modely **Claude od společnosti Anthropic**. Volání jdou vždy přes server VISIBLE7, prohlížeč nikdy nevolá AI napřímo a klíče nejsou nikde v aplikaci vidět.

## Zásady

- **AI navrhuje, vy rozhodujete.** Návrh nikdy automaticky nepřepíše váš text. U každého pole zvolíte *Použít*, *Upravit*, nebo *Ponechat můj text*.
- **AI nepočítá.** Výpočty (byznys case, bod zvratu, mapa cesty) dělá aplikace pevnými vzorci. AI jen odhaduje vstupy a komentuje výsledky.
- **AI dostane jen údaje z projektu**, bez vašeho jména a e-mailu. Anthropic na těchto datech své modely neučí.
- **Výstup má pevnou strukturu.** AI vyplňuje předem dané kolonky, takže odpověď jde rovnou do správných polí.

## Co AI dělá v jednotlivých krocích

| Kde | Co dělá | Kolikrát na projekt |
|---|---|---|
| [Test nápadu](/test-napadu/) | diagnóza nápadu nebo podniku, návrh vstupů pro brány 1–3 | 3× |
| [Brána 1](/brany/brana-1-vize/) | nepoužívá AI (rozhodnutí o odlišení je na vás) | – |
| [Brána 2](/brany/brana-2-ideace/) | návrh polí Lean Canvasu a typu byznysu | 3× |
| | vyhodnocení canvasu mentorem (5 kritérií) | 3× |
| [Průzkum trhu](/brany/pruzkum-trhu/) | velikost trhu TAM / SAM / SOM s vyhledáváním na webu | 2× |
| [Brána 3](/brany/brana-3-strategie-a-cisla/) | doporučená procenta podle oboru | 3× |
| | orientační částky nákladů a chybějící položky | 3× |
| | vyplnění celého byznys case | 3× |
| | komentář mentora k hotovému plánu | 3× |
| Pitch | pitch na A4 pro investora, banku nebo partnera | 3× |
| Testovací stránka | texty stránky pro test zájmu | 3× |

## Kdy AI hledá na webu

**Jen při výpočtu velikosti trhu.** Ostatní funkce pracují pouze s údaji vašeho projektu a obecnými znalostmi modelu. U velikosti trhu se zobrazí jen zdroje, které vyhledávání opravdu vrátilo, takže AI nemůže zdroj vymyslet.

„Rentgen trhu“ zdarma web neprohledává sám: připraví dotaz, který spustíte ve vlastním ChatGPT nebo Claude.

## Jaká data AI dostane

| Funkce | Data |
|---|---|
| Test nápadu | jen odpovědi z testu |
| Brána 2 | brána 1 (název, slogan, zákazník, problém, nabídka, konkurence, ERRC matice se skóre, USP) a Lean Canvas |
| Brána 3 a pitch | navíc typ byznysu, vstupy byznys case a souhrn scénářů |
| Velikost trhu | brány 1 a 2, typ byznysu a realistický scénář |

Data čte server přímo z vašeho projektu. Každý výstup AI se uloží k projektu, takže se k němu můžete vrátit.

## Denní limity

| Uživatel | Volání AI za den |
|---|---|
| s placeným přístupem | 20 |
| bez placeného přístupu (když je zapnutý ceník) | 5 |

V pilotním provozu, kdy je vše odemčené, platí limit 20 pro všechny. Kromě toho platí limity na projekt v tabulce výše. Pokud se odpověď AI nepovede (je useknutá), do limitu se nepočítá.

## Samostatní AI asistenti (GPT a skilly)

Mimo aplikaci nabízí VISIBLE7 knihovnu krátkých AI asistentů pro jednotlivé kroky metodiky (Karta projektu, Six Paths, ERRC, USP, Hooked, Lean Canvas, MVP, Pitch…). Fungují i v bezplatném ChatGPT. Každý řeší jednu úlohu za 5–10 minut a uvádí zdroj převzaté metody.
