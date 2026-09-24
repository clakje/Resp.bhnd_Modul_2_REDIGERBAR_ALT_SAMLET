# Hovedmeny for NIV-scenariene

Én pakke til én kodeblokk i Articulate Rise. Deltakeren starter i hovedmenyen, åpner et
scenario og går tilbake med «Hovedmeny». Hele planen står i [HOVEDMENY_INSTRUKS.md](HOVEDMENY_INSTRUKS.md).

**Dette er redigeringsversjonen.** Alle tekstene er tekstbokser som fageksperter kan redigere
(tekstene lagres i Google Sheets). Oppsett, bruk og hvordan du lager det endelige kurset for Rise,
står i [REDIGERING_INSTRUKS.md](REDIGERING_INSTRUKS.md).

## Filer

| Fil | Innhold |
|---|---|
| `index.html` | Hovedmenyen (må ligge i roten) |
| `meny-data.js` | Scenariene og **standardtekstene** i menyen. Gjeldende tekst ligger i Google Sheets. |
| `meny.js` | Bygger kortene og styrer brukerveiledningen |
| `meny.css` | Menyens stiler (egen kopi av design-tokens fra scenariene) |
| `scenarier/_plassholder/` | Dummy-side for scenarier med `klar: false` |
| `scenarier/<navn>/` | Ett frittstående scenario per mappe, med `index.html` i roten |
| `originaler/` | Valgfritt: originale zip-filer. Pakkes ikke. |
| `felles/` | Redigerbare tekster: `redigering.js`, `redigering.css`, `tekster-data.js`, Quill og DOMPurify |
| `apps-script/Code.gs` | Koden i Google Apps Script (databasen og loggen) |
| `lag-endelig-kurs.js` | Lager det endelige kurset for Rise med tekstene fra arket innbakt |
| `lag-rise-zip.js` | Pakker alt til `hovedmeny-niv-scenarier.zip` (brukes av `lag-endelig-kurs.js`) |

## Scenariene og kildemappene

Alle sju er lagt inn (`klar: true`). Kopiene i `scenarier/` er hentet fra disse mappene i
`NIV_SCENARIER/`, og `goToMainMenu()` i `app.js` er koblet til `../../index.html`:

| Mappe i `scenarier/` | Kilde |
|---|---|
| `asynkroni-hoy-triggersensitivitet` | `ASYNKRONI_HØY_TRIGGERSENSITIVITET_NY_LAYOUT` |
| `asynkroni-lav-sensitivitet` | `ASYNKRONI_LAV_SENSITIVITET` |
| `for-kort-inspirasjonstid` | `FOR_KORT_INSPIRASJONSTID` |
| `for-lang-inspirasjonstid` | `FOR_LANG_INSPIRASJONSTID/RISE-VERSJON` |
| `for-kort-stigetid` | `FOR_KORT_STIGETID` |
| `for-lang-stigetid` | `FOR_LANG_STIGETID` |
| `niv-frisk-optimal` | `NIV_FRISK_OPTIMAL` |

Endrer du et scenario i kildemappen, må det kopieres inn på nytt, og `goToMainMenu()` må kobles igjen.
Ikke kopier `index.html` fra kildemappen: kopien i `scenarier/` har tekstboksene (se REDIGERING_INSTRUKS.md).

## Teste lokalt

Åpne `index.html` rett fra disk (dobbeltklikk). Det trengs ingen webserver.

## Legge inn et ferdig scenario

1. Kopier scenariomappen til `scenarier/<ascii-navn>/`. Bruk bare a–z, 0–9 og bindestrek i
   navnet, og sørg for at `index.html` ligger i roten av mappen.
2. Bytt ut `goToMainMenu()` i scenarioets `app.js` med:
   ```js
   function goToMainMenu() {
       window.dispatchEvent(new CustomEvent('scenario:hovedmeny'));
       window.location.href = '../../index.html';
   }
   ```
3. Sett `klar: true` for scenariet i `meny-data.js`, og sjekk at `mappe` stemmer.
4. Test meny → scenario → Hovedmeny fra disk og i Rise.

## Lage Rise-pakken

```
node lag-endelig-kurs.js
```

Skriptet henter tekstene fra Google Sheets, lager det endelige kurset i `../ENDELIG_KURS/` og kjører
`lag-rise-zip.js` der. Kjører du `lag-rise-zip.js` direkte her, pakkes redigeringsversjonen.

Skriptet lister filene som ble pakket og den totale størrelsen. Det advarer hvis et scenario
har `klar: true` uten `index.html`, eller hvis et filnavn har norske tegn eller mellomrom.
Last opp `ENDELIG_KURS/hovedmeny-niv-scenarier.zip` i en kodeblokk i Rise.
