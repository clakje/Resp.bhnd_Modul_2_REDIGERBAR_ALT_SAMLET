# Redigerbare tekster: oppsett og bruk

Kurset finnes i to versjoner:

| Versjon | Hvor | Tekstene |
|---|---|---|
| **Redigeringsversjonen** (denne mappen) | GitHub Pages | Hentes fra Google Sheets hver gang en side lastes. Alle som har lenken kan redigere og lagre. |
| **Endelig kurs** | Rise | Bakt inn i filene av `lag-endelig-kurs.js`. Ingen redigering, ingen kontakt med Google. |

Google Sheets er både database og logg. Hver lagring legger til én rad per tekstboks som ble
endret (tidspunkt, navn, side, tekst-id og innhold). Ingenting overskrives, så alle tidligere
versjoner kan hentes fram igjen.

---

## Steg 1: Legg inn den nye Apps Script-koden (én gang)

Nettsiden trenger koden i [apps-script/Code.gs](apps-script/Code.gs). Den erstatter koden du har nå.

1. Åpne Google-regnearket.
2. Velg **Utvidelser → Apps Script**.
3. Åpne `Code.gs` til venstre. Vil du ta vare på den gamle koden, kopierer du den til et
   tekstdokument først.
4. Marker all koden (Ctrl+A) og slett den.
5. Åpne [apps-script/Code.gs](apps-script/Code.gs) i dette prosjektet, kopier alt (Ctrl+A, Ctrl+C) og lim det
   inn i Apps Script (Ctrl+V).
6. Trykk **Lagre** (diskettikonet eller Ctrl+S).
7. Publiser en ny versjon med **samme** URL:
   1. Trykk **Implementer → Administrer implementeringer** (øverst til høyre).
   2. Velg implementeringen du har fra før, og trykk **blyanten** (Rediger).
   3. Velg **Ny versjon** under «Versjon».
   4. Sjekk at **Kjør som** er **Meg** og **Hvem har tilgang** er **Alle**.
   5. Trykk **Implementer**.
8. Hvis Google ber om tillatelser: trykk **Gjennomgå tillatelser** og velg kontoen din. Trykk
   **Avansert** og deretter **Gå til … (usikker)**, og til slutt **Tillat**. Advarselen vises fordi
   skriptet er ditt eget og ikke gjennomgått av Google.
9. Test: Åpne nettapp-URL-en i nettleseren. Du skal se `{"success":true,"data":{}}`.

Skriptet lager selv fanen **Tekster** i regnearket første gang noen lagrer. Andre faner blir ikke
rørt.

> Er Apps Script-prosjektet **ikke** opprettet fra regnearket (via Utvidelser-menyen)? Da må du lime
> inn regnearkets ID i `REGNEARK_ID` øverst i `Code.gs`. ID-en er den lange delen av adressen
> mellom `/d/` og `/edit`.

> Får du en **ny** URL (fordi du valgte «Ny implementering» i stedet for å redigere den gamle), må
> den limes inn i `APPS_SCRIPT_URL` øverst i [felles/redigering.js](felles/redigering.js).

---

## Steg 2: Publiser redigeringsversjonen på GitHub Pages

`index.html` må ligge i roten av repoet. Last altså opp **innholdet** i `NIV_HOVEDMENY`, ikke selve
mappen.

1. Lag et nytt repository på GitHub, for eksempel `niv-scenarier-redigering`.
2. Last opp alt innholdet i `NIV_HOVEDMENY` (med `felles/`, `scenarier/`, `apps-script/` osv.).
   `.gitignore` holder zip-filene og `originaler/` utenfor.
3. Gå til **Settings → Pages**. Under «Build and deployment» velger du **Deploy from a branch**,
   **main** og **/ (root)**. Trykk **Save**.
4. Etter et minutt eller to vises adressen øverst på siden, for eksempel
   `https://<brukernavn>.github.io/niv-scenarier-redigering/`. Den adressen sender du til fagekspertene.

Du kan også teste lokalt ved å dobbeltklikke `index.html`. Redigering og lagring virker da også.

---

## Steg 3: Slik redigerer fagekspertene

Denne teksten kan sendes til fagekspertene:

> 1. Åpne lenken. Nede til venstre er en bryter mellom **Lesemodus** og **Redigeringsmodus**.
> 2. Slå på **Redigeringsmodus**. Alle tekster du kan endre får en stiplet ramme.
> 3. Klikk i en tekst og skriv. En verktøylinje under teksten har fet og kursiv skrift, lister,
>    lenker, senket og hevet skrift og «fjern formatering».
> 4. Skriv navnet ditt i feltet **Ditt navn** (bare første gang) og trykk **Lagre endringer**.
>    Lagre før du går til en annen side. Nettleseren varsler hvis du glemmer det.
> 5. Info-dialogen i hvert scenario har tre visninger. Trykk **Forklaring av kurver og
>    symboler** og **Forslag til løsning** for å redigere dem også. Brukerveiledningen i menyen
>    åpnes med knappen øverst til høyre.
> 6. Har du gjort en feil? Klikk i teksten og trykk **Historikk**. Der ligger alle tidligere
>    versjoner og den opprinnelige teksten. Velg **Bruk denne** og lagre.
> 7. En tekstblokk du tømmer helt, blir skjult for deltakerne, sammen med overskriften sin.
>
> Tekstene under **Forklaring av kurver og symboler**, og overskriftene «Om scenariet»,
> «Læringsmål» osv., er felles for alle scenariene. Endrer du dem ett sted, endres de overalt.

Hvis to personer endrer **samme** tekst samtidig, gjelder den som lagrer sist. Den som lagrer sist
får beskjed om det, og den andre versjonen ligger under **Historikk**.

---

## Steg 4: Lag det endelige kurset for Rise

Når fagekspertene er ferdige:

1. Åpne et terminalvindu i `NIV_HOVEDMENY` (i VS Code: **Terminal → New Terminal**).
2. Kjør:
   ```
   node lag-endelig-kurs.js
   ```
3. Skriptet henter de nyeste tekstene fra arket og lager mappen `../ENDELIG_KURS/`. Der ligger
   - kurset med tekstene innbakt (test ved å dobbeltklikke `index.html`)
   - `hovedmeny-niv-scenarier.zip`, som du laster opp i en kodeblokk i Rise
   - `tekster-eksport.json`, en kopi av alle tekstene med navn og tidspunkt (til arkivet)
4. Redigeringsversjonen og arket endres ikke. Du kan kjøre skriptet på nytt så ofte du vil.

Ikke bruk `node lag-rise-zip.js` direkte i `NIV_HOVEDMENY` til Rise. Da blir redigeringsversjonen
lagt inn i Rise, der deltakerne kan endre tekstene. Skriptet advarer om dette.

**Når redigeringen er over,** kan du stenge for flere endringer: Gå til **Implementer →
Administrer implementeringer** i Apps Script og arkiver implementeringen. Da får GitHub-siden
standardteksten og en feilmelding, men arket og loggen blir liggende.

---

## For utvikleren

### Filene

| Fil | Innhold |
|---|---|
| `felles/redigering.js` | Henter, viser og lagrer tekstene. `APPS_SCRIPT_URL` står øverst. |
| `felles/redigering.css` | Tekstboksene, redigeringspanelet og historikken |
| `felles/tekster-data.js` | `null` her; tekstene i det endelige kurset |
| `felles/vendor/` | Quill 2.0.3 (teksteditor) og DOMPurify 3.2.6 (rensing), lagret lokalt |
| `apps-script/Code.gs` | Koden i Google Apps Script |
| `lag-endelig-kurs.js` | Lager det endelige kurset og zip-filen for Rise |

### Tekstboksene

Et element blir en tekstboks med `data-tekst="<tekst-id>"`. Teksten som står i HTML-en
(eller i `meny-data.js` for menyen) er standardteksten. Den brukes til noen lagrer en ny tekst.

- `data-tekst-type="linje"`: overskrift eller etikett, én linje uten avsnitt eller lister
- `data-tekst-kopi="<tekst-id>"`: viser samme tekst et annet sted (scenarioets header viser tittelen)
- `data-dokumenttittel=" — …"`: tittelen på fanen blir teksten i boksen pluss denne teksten
- `data-tekst-seksjon` på en seksjon: den skjules for deltakerne når tekstblokkene i den er tomme

Tekst-id-ene:

| Hvor | Tekst-id |
|---|---|
| Menyen | `meny.tittel`, `meny.innledning.overskrift`, `meny.innledning.tekst`, `meny.merknad` |
| Kortene | `meny.kort.<scenario-id>.tema`, `.tittel`, `.beskrivelse` |
| Brukerveiledningen | `meny.veiledning.overskrift`, `meny.veiledning.<nr>.overskrift`, `.tekst` |
| Info-dialogen i scenariet | `<mappe>.tittel`, `.ingress`, `.om`, `.laeringsmal`, `.prov` |
| Forslag til løsning | `<mappe>.losning.optimale`, `.losning.respons`, `.losning.notater` |
| Felles for alle scenariene | `felles.info.*.overskrift`, `felles.losning.*.overskrift`, `felles.forklaring.*` |

Nummeret i `meny.veiledning.<nr>` følger rekkefølgen i `meny-data.js`. Legger du til et punkt
midt i lista, flytter tekstene i arket seg ett hakk. Legg derfor nye punkter til slutt.

Standardteksten for ingress, læringsmål og fasit ble hentet fra `meta` i hvert scenarios
`scenario.json` da tekstboksene ble laget. `scenario.json` brukes ikke lenger til å vise dem.

### Et nytt scenario

Scenariosidene er like bortsett fra `data-tekst-side` i `<html>` og mappenavnet i tekst-id-ene. Kopier
`index.html` fra et eksisterende scenario og bytt ut mappenavnet overalt. Bytt også ut
standardtekstene i info-dialogen.
