---
title: "Brána 3: Strategie a čísla (byznys case)"
description: Jak VISIBLE7 počítá plán na 24 měsíců. Vstupy podle typu byznysu, náběh, tržby, zisk, potřebný kapitál, bod zvratu, ROI, PNO, CAC, LTV a scénáře.
---

**Cíl brány:** spočítat, kolik projekt potřebuje peněz, kdy se dostane do zisku a jestli si může dovolit marketing. Plán má **24 měsíců**: měsíc 0 je jednorázová investice před spuštěním, měsíce 1–24 provoz.

Všechny výpočty dělá aplikace pevnými vzorci níže. AI jen navrhuje vstupy a komentuje výsledek.

## 1. Model podle typu byznysu

Typ byznysu z brány 2 určuje, jak se počítají tržby:

| Model | Typy byznysu |
|---|---|
| **E-shop** | E-shop, Web + E-shop, Dropshipping |
| **Předplatné a kurzy** | Members, Online kurz (LMS), Komunita |
| **Web pro získávání zakázek** | Web (prezentační), Konverzní web, Squeeze page |
| **Obsahový web** | Blog, Affiliate web |
| **Marketplace** | Marketplace |
| **Vlastní model** | Vlastní aplikace a ostatní |

## 2. Co zadáváte

### Příjmy (plán pro 12. měsíc po spuštění)

| Vstup | Pro které modely |
|---|---|
| **Cena**: průměrná objednávka / cena za měsíc / hodnota zakázky / hodnota prodeje | všechny kromě obsahového webu |
| **Výnos na 1 000 návštěv (RPM)** | obsahový web (obvykle 50–300 Kč) |
| **Objem ve 12. měsíci**: objednávky / noví zákazníci / poptávky / návštěvy / prodeje za měsíc | všechny |
| **Hrubá marže** (% z ceny) | všechny kromě obsahového webu (ten počítá se 100 %) |
| **Opakované nákupy** (% objednávek, max. 90) | e-shop |
| **Odchodovost** (% zákazníků měsíčně, výchozí 5; jednorázový kurz = 100) | předplatné a kurzy |
| **Konverze poptávky na zákazníka** (%) | web pro zakázky |
| **Provize z prodeje** (%) | marketplace |
| **Růst ve 2. roce** (%, výchozí 20) | všechny |

Ceny zadávejte **bez DPH**. Orientační hrubé marže v nápovědě: e-shop 20–40 %, digitální obsah 80–95 %, marketplace 80–95 %.

### Náklady
Každá položka má název, částku a druh:
- **Jednorázové náklady před spuštěním** (celkem, zaplatí se v měsíci 0),
- **Měsíční provoz** (Kč měsíčně),
- **Marketing** (Kč měsíčně).

Rychlá tlačítka přidají běžné položky: sociální a zdravotní pojištění OSVČ, účetní, platební brána, vlastní odměna; Google Ads, Sklik, Meta, ChatGPT Ads, TikTok Ads, srovnávače zboží.

Při prvním otevření se položky nákladů **předvyplní z Lean Canvasu** (bez částek): marketingové výrazy a kanály jako marketing, tvorba a design jako jednorázové, zbytek jako měsíční provoz.

### Forma podnikání a daně
| Forma | Daň ze zisku v modelu |
|---|---|
| OSVČ, klasický režim | 15 % |
| OSVČ, paušální daň | 0 % a přidá měsíční náklad 9 984 Kč (1. pásmo: daň + pojištění) |
| s.r.o. | 21 % |

Dále: **cílový zisk** (% z obratu, výchozí 10) a volba scénáře.

## 3. Vzorce

### Náběh prodejů
Projekt se nerozjede hned. Objem v měsíci *m*:

- měsíce 1–12: **náběh(m) = (m / 12)<sup>1,5</sup>** (měsíc 1 ≈ 2 %, měsíc 3 = 12,5 %, měsíc 6 ≈ 35 %, měsíc 12 = 100 %)
- měsíce 13–24: **náběh(m) = 1 + růst ve 2. roce × (m − 12) / 12** (lineární růst)

**Objem(m) = objem ve 12. měsíci × koeficient scénáře × náběh(m)**

### Tržby podle modelu

| Model | Tržby v měsíci | Noví zákazníci |
|---|---|---|
| E-shop | objem × cena | objem × (1 − opakované nákupy) |
| Předplatné a kurzy | aktivní zákazníci × cena, kde aktivní(m) = aktivní(m−1) × (1 − odchodovost) + objem(m) | objem |
| Web pro zakázky | noví zákazníci × cena | objem × konverze |
| Obsahový web | objem / 1000 × RPM | – |
| Marketplace | objem × cena × provize | objem |
| Vlastní model | objem × cena | objem |

### Zisk a peníze
- **Hrubý zisk** = tržby × hrubá marže
- **Zisk v měsíci** = hrubý zisk − měsíční provoz − marketing
- **Měsíc 0**: zisk = − jednorázové náklady
- **Kumulativně** = součet zisků od měsíce 0

Náklady na provoz a marketing jsou v modelu **stejné každý měsíc**, nerostou s objemem.

### Ukazatele za 24 měsíců

| Ukazatel | Vzorec |
|---|---|
| **Obrat** | součet tržeb za měsíce 1–24 |
| **Náklady celkem** | jednorázové + variabilní (tržby − hrubý zisk) + 24 × provoz + 24 × marketing |
| **Zisk před daní** | obrat − náklady celkem |
| **Marže zisku** | zisk / obrat |
| **Daň** | (zisk 1. roku, je-li kladný + zisk 2. roku, je-li kladný) × sazba. 1. rok zahrnuje i investici v měsíci 0. Přenos ztráty se nemodeluje. |
| **Zisk po zdanění** | zisk před daní − daň |
| **Potřebný kapitál** | nejnižší bod kumulované křivky peněz (kolik nejvíc budete „v mínusu“) |
| **ROI** | zisk před daní za 24 měsíců / potřebný kapitál. Za 2 roky, ne ročně. |
| **Bod zvratu** | první měsíc, kdy jsou tržby > 0 a měsíční zisk ≥ 0 (po marketingu) |
| **Návratnost** | první měsíc po nejnižším bodě, kdy je kumulativně ≥ 0 („hned“, nebo „přes 2 roky“) |

### Marketing: PNO
- **PNO ve 12. měsíci** = marketing / tržby ve 12. měsíci. Počítá **jen marketingové náklady**.
- **Maximální PNO** = hrubá marže − provoz / tržby ve 12. měsíci − cílový zisk. Tolik procent z tržeb si můžete dovolit dát do reklamy, aby vám zbyl cílový zisk.
- **Hodnocení:** *v pořádku* (PNO ≤ maximum), *na hraně* (do 5 procentních bodů nad), *rizikové* (víc).

Zdravé PNO se liší podle oboru (vzdělávací kurzy unesou výrazně vyšší PNO než prodej elektroniky), proto ho VISIBLE7 nepočítá z tabulky, ale z vaší marže a nákladů.

### Zákazník: CAC a LTV

| Ukazatel | Vzorec |
|---|---|
| **CAC** (cena získání zákazníka) | marketing / noví zákazníci ve 12. měsíci |
| **LTV** e-shop | cena × marže / (1 − opakované nákupy) |
| **LTV** předplatné | cena × marže / odchodovost |
| **LTV** zakázky a vlastní model | cena × marže |
| **LTV : CAC** | v pořádku ≥ 3 : 1, na hraně ≥ 1 : 1, jinak rizikové |

Podle modelu se ukazují i další čísla: marže na objednávku a počet objednávek na zákazníka (e-shop), MRR, počet aktivních předplatitelů a průměrná délka předplatného (předplatné), cena za poptávku (zakázky), provizní tržby (marketplace).

## 4. Scénáře

| Scénář | Koeficient objemu |
|---|---|
| Opatrný | 0,6 |
| Realistický | 1,0 |
| Optimistický | 1,4 |

Scénáře mění **jen objem prodejů**. Ceny, marže a náklady zůstávají stejné. Tabulka porovná zisk, potřebný kapitál, bod zvratu, návratnost a PNO.

## 5. Paušální daň: kontrola

Z realistického scénáře aplikace upozorní:
- **stop**, pokud roční obrat přesáhne 2 000 000 Kč (limit paušálu a povinná registrace k DPH),
- **varování**, pokud paušál (9 984 Kč × 12) tvoří víc než 15 % obratu prvního roku,
- **varování**, pokud skutečné náklady ve 2. roce přesáhnou 60 % obratu (paušální výdaje by se nevyplatily).

DPH a sociální a zdravotní pojištění jako procento se nemodelují. Pojištění přidejte jako měsíční náklad.

## 6. Ukázkový výpočet

Ilustrativní e-shop: objednávka 900 Kč, marže 35 %, 150 objednávek ve 12. měsíci, opakované nákupy 20 %, růst 20 %, jednorázově 30 000 Kč, provoz 3 000 Kč a marketing 5 000 Kč měsíčně, realistický scénář.

| Ukazatel | Výsledek |
|---|---|
| Tržby v 1. / 12. / 24. měsíci | 3 248 / 135 000 / 162 000 Kč |
| Obrat za 24 měsíců | 2 512 324 Kč |
| Potřebný kapitál | 43 742 Kč (nejníž ve 3. měsíci) |
| Bod zvratu | 4. měsíc |
| Návratnost | 8. měsíc |
| PNO ve 12. měsíci / maximální PNO | 3,7 % / 22,8 % → v pořádku |
| CAC / LTV | 41,7 Kč / 393,75 Kč → 9,5 : 1 |

Příklad ukazuje i hranici modelu: marketing je pevná částka, takže PNO s rostoucími prodeji klesá. Ve skutečnosti s objemem obvykle roste i rozpočet na reklamu.

## 7. Jak čísla používají další brány

| Kde | Co se počítá |
|---|---|
| **Brána 5** (test kanálů) | PNO testu = útrata / tržby. Při 3+ konverzích: *škálovat* (≤ max. PNO), *ladit* (do +5 b.), jinak *vypnout*. Bez konverze při útratě ≥ 3 × cena: *vypnout*. |
| **Brána 6** (Launch) | milník MVP = první měsíc s kumulativně 10 zákazníky (obsahový web 10 000 návštěv), dále bod zvratu a návratnost |
| **Brána 7** (Expanze) | páky růstu (+10 % cena, opakované nákupy, noví zákazníci), past cash flow při růstu, výpočet náboru |
| **Pitch pro investory** | potřebný kapitál, bod zvratu, návratnost, obrat a zisk za 24 měsíců, hrubá marže, křivka peněz, velikost trhu |
| **Mapa A → B → C → D** | přepočítá se z vašich skutečných čísel |

### Výpočet náboru (brána 7)
- Náklad zaměstnance = hrubá mzda × 1,338 (odvody zaměstnavatele 24,8 % + 9 %), u OSVČ / DPP hodinovka × hodiny.
- Hodnota vaší hodiny = váš zisk / 166,67 hodin.
- Delegovat se vyplatí, když hodinová sazba pomocníka ≤ čtvrtina hodnoty vaší hodiny.
- Potřebné tržby navíc = náklad / hrubá marže.

## Pitch pro investory

Z byznys case a velikosti trhu vytvoří AI pitch na jednu stranu A4 (pro investora, banku nebo partnera). Čísla v pitchi jsou z realistického scénáře.

## AI v bráně 3

AI umí:
- navrhnout procenta (marže, opakované nákupy, odchodovost, konverze, růst) obvyklá v oboru,
- odhadnout částky nákladů (nízká / obvyklá / vysoká) a doplnit chybějící položky,
- vyplnit celý byznys case jedním kliknutím (jen prázdná pole),
- okomentovat hotový plán: citlivá místa, co ověřit, PNO, opatrný scénář.

Každá funkce je 3× na projekt. Výpočet samotný AI nedělá.

## Export do Excelu

Byznys case jde stáhnout jako .xlsx s **živými vzorci**: listy *Souhrn*, *Předpoklady* a *Po měsících*. Když změníte předpoklad, přepočítá se vše kromě tabulky scénářů. Export je v placeném přístupu.

## Kdy je brána hotová

- zvolený typ byznysu,
- vyplněné příjmy (tržby ve 12. měsíci > 0 a marže > 0),
- aspoň jeden náklad s částkou,
- komentář AI je doporučený, ne povinný.

Shrnutí plánu, ze kterého čerpají další brány, se uloží při dokončení brány (nebo při komentáři AI). Když čísla později změníte, bránu znovu dokončete, aby se změna propsala.
