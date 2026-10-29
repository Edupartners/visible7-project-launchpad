---
title: Průzkum trhu (TAM, SAM, SOM)
description: Odkud VISIBLE7 bere data o velikosti trhu, jak vznikají čísla TAM, SAM a SOM a které veřejné registry aplikace používá.
---

VISIBLE7 nabízí dva nástroje na odhad trhu. Oba jsou **orientační odhad z veřejných dat, ne profesionální průzkum trhu**. Před jednáním s bankou nebo investorem si zdroje vždy otevřete a čísla zkontrolujte.

## 1. Velikost trhu v bráně 2 (placený přístup)

### Odkud se berou data

- Výpočet dělá AI (model Claude od Anthropicu) s **vyhledáváním na webu**. Při jednom výpočtu provede až 6 vyhledávání.
- AI má pokyn hledat česky i anglicky a upřednostnit **ČSÚ, Eurostat, ČNB, profesní asociace, výroční zprávy firem a studie z posledních 3 let**.
- Aplikace **se nepřipojuje přímo do žádné statistické databáze** (ČSÚ, Eurostat apod.). Tyto instituce AI dohledává přes běžné vyhledávání na webu, stejně jako by je hledal člověk.

### Co AI dostane

Údaje z vašeho projektu: název, slogan, zákazník, problém, nabídka, levná a prémiová konkurence, USP, Lean Canvas, typ byznysu a realistický scénář byznys case (pokud už ho máte). Musí být vyplněné alespoň zákazník, problém a nabídka.

Zvolíte region: **Česko**, nebo **Česko a Slovensko**.

### Jak vznikají čísla

| Úroveň | Význam | Jak se počítá |
|---|---|---|
| **TAM** – celý trh | roční útrata za celou kategorii v regionu | AI z dohledaných dat |
| **SAM** – dostupný trh | část TAM, kterou obsloužíte svým modelem, kanálem a zákaznickým segmentem | AI z TAM a vašeho canvasu |
| **SOM** – získatelný trh | realistický podíl SAM za 2–3 roky pro malý začínající projekt (obvykle jednotky procent SAM) | AI z SAM |

U každé úrovně uvidíte **výpočet slovy s čísly**, například „430 000 OSVČ × 12 % online × 2 900 Kč“. Čísla, která AI odhadla sama (nejsou přímo ze zdroje), jsou vypsaná zvlášť jako *předpoklady*.

Aplikace pak výsledek kontroluje:
- pořadí musí dávat smysl: TAM ≥ SAM ≥ SOM,
- jako zdroj se zobrazí **jen odkazy, které vyhledávání skutečně vrátilo** (AI nemůže zdroj vymyslet), nejvýš 8,
- když AI nenajde žádný ověřitelný zdroj, jistota se automaticky nastaví na **nízkou** a aplikace vás na to upozorní.

Navíc aplikace porovná váš plán s trhem: roční obrat z realistického scénáře (obrat za 24 měsíců / 2) vydělí SAM a ukáže, jaký podíl trhu plán předpokládá. Pokud je plán vyšší než SOM, označí ho jako **ambiciózní**.

### Jak výsledek číst

- Tři karty TAM, SAM, SOM s procenty mezi úrovněmi.
- Štítek jistoty: nízká / střední / vysoká, s vysvětlením.
- Seznam zdrojů s odkazy a poznámkou, k čemu byl každý použit.
- Předpoklady, které nejsou přímo ze zdroje.

Výsledek se uloží k projektu a použije se i v [pitchi pro investory](/brany/brana-3-strategie-a-cisla/#pitch-pro-investory). Na projekt jsou 2 výpočty. Každý výpočet hledá znovu, výsledek se nebere z mezipaměti.

## 2. Rentgen trhu (zdarma, ve vašem ChatGPT nebo Claude)

Jednodušší varianta pro každého:
1. Zadáte, kde chcete prodávat (město, čtvrť, region).
2. Aplikace sestaví dotaz z vašeho nápadu, zákazníka, ceny a bodu zvratu.
3. Dotaz otevřete jedním kliknutím v ChatGPT nebo Claude (ve vlastním účtu) nebo ho zkopírujete.
4. AI odpoví a na konec napíše řádek *VELIKOST TRHU · KONKURENCE · POTŘEBNÝ PODÍL · VERDIKT (reálné / ambiciózní / nereálné)*.
5. Ten řádek vložíte zpět do aplikace a uložíte k projektu.

Bod zvratu do dotazu počítá aplikace: **počet prodejů za měsíc = měsíční fixní náklady / (cena × hrubá marže v %)**, zaokrouhleno nahoru. Díky tomu AI posuzuje, jaký podíl místního trhu potřebujete získat.

VISIBLE7 v tomto případě nic nevyhledává, dotaz běží ve vašem účtu u ChatGPT nebo Claude.

## Které veřejné registry VISIBLE7 používá

| Registr | Používá se | K čemu |
|---|---|---|
| **ARES** (Ministerstvo financí) | ano, napřímo | ověření IČO pro osvědčení Gold (viz níže) |
| ČSÚ, Eurostat, ČNB | ne napřímo | AI je dohledává přes vyhledávání na webu při odhadu trhu |
| Živnostenský rejstřík (RŽP), ÚPV, Finanční správa, ČSSZ, VZP | ne | aplikace na ně jen odkazuje v návodech (živnost, ochranná známka, daně) |

### Ověření IČO v ARES

Kdo už podniká, může v bránách 5 a 6 ověřit své IČO. Aplikace:
1. zkontroluje formát IČO (8 číslic a kontrolní číslice),
2. zeptá se registru ARES, jestli subjekt existuje a je aktivní,
3. u fyzických osob ověří, že obchodní jméno obsahuje vaše příjmení.

Uloží se jen IČO, obchodní jméno, právní forma, datum vzniku a datum ověření. Adresa ani další údaje z ARES se neukládají. Ověřené IČO je podmínkou pro **osvědčení Gold**.
