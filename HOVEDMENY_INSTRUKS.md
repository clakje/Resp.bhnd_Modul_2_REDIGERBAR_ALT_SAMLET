# Instruks: Hovedmeny for NIV-scenariene

Denne filen beskriver hvordan vi bygger **Hovedmeny-programmet**: én pakke som lastes opp
i én kodeblokk i Articulate Rise, og som samler alle scenariene. Deltakeren starter i
hovedmenyen, åpner et scenario, og går alltid tilbake til hovedmenyen for å velge et nytt.

Første leveranse er en **prototype med dummyknapper**. Scenariene legges inn ett og ett etterpå.

---

## 1. Beslutninger (avklart)

| Tema | Beslutning |
|---|---|
| Plattform | Én zip i **én kodeblokk i Rise**. Deltakeren bytter scenario inne i blokken. |
| Oppbygging | Hvert scenario ligger som **egen, frittstående mappe** i programmet (egen kopi av `simulator.js`, `renderer.js`, `style.css` osv.). Scenariene deler ingen kode med hverandre eller med menyen. |
| Navigasjon | Meny → scenario → **Hovedmeny**-knapp → meny. Ingen «Neste scenario», ingen fast rekkefølge. |
| Prototype | Alle sju scenariene starter som **dummyknapper** som åpner en plassholderside med «Hovedmeny»-knapp. |
| Tekster | Enkle forslagstekster (se kapittel 6). Vi bearbeider dem senere. |
| Fremdrift | **Ingen** markering av fullførte scenarier og ingen lagring i nettleseren. |
| Brukerveiledning | Egen knapp i menyen som åpner en dialog. |
| NIV_FRISK_OPTIMAL | Et **eget scenario** på lik linje med de andre, ikke en sammenligning lagt over de andre. |
| Design | Følger `ASYNKRONI_HØY_TRIGGERSENSITIVITET_NY_LAYOUT` (mørkt tema, samme header, knapper og dialoger). |

**Om zip-filer:** En nettleser kan ikke åpne en zip-fil inne i Rise. Scenariene må derfor ligge
**utpakket som mapper** i programmet. Vil du ta vare på de originale zip-filene, legger du dem i
`originaler/`. Den mappen kommer ikke med i Rise-pakken.

---

## 2. Mappestruktur

Programmet bygges i `Resp.bhnd modul 2/HOVEDMENY_SCENARIER/`:

```
HOVEDMENY_SCENARIER/
├── index.html                 ← hovedmenyen (må ligge i roten, Rise krever det)
├── meny.css                   ← menyens stiler (egen kopi av design-tokens)
├── meny.js                    ← bygger kortene og styrer brukerveiledningen
├── meny-data.js               ← liste over scenariene + alle menytekster
├── bilder/                    ← ev. illustrasjoner til menyen og veiledningen
├── scenarier/
│   ├── _plassholder/
│   │   └── index.html         ← dummy-side for scenarier som ikke er lagt inn
│   ├── asynkroni-hoy-triggersensitivitet/   ← frittstående scenario (index.html i roten)
│   ├── asynkroni-lav-sensitivitet/
│   ├── for-kort-inspirasjonstid/
│   ├── for-lang-inspirasjonstid/
│   ├── for-kort-stigetid/
│   ├── for-lang-stigetid/
│   └── niv-frisk-optimal/
├── originaler/                ← valgfritt: originale zip-filer (pakkes ikke)
├── lag-rise-zip.js            ← pakker hele programmet til én zip
└── README.md
```

**Mappenavn:** Bruk kun små bokstaver a–z, tall og bindestrek. Unngå Æ, Ø, Å og mellomrom.
Norske tegn i filnavn i zip-filer og nettadresser gir feil på enkelte maskiner og i Rise.
Titlene som vises for deltakeren kan fortsatt ha norske tegn, fordi de ligger i `meny-data.js`.

---

## 3. Hvordan navigasjonen virker

Alt skjer i den samme iframen i Rise, med vanlige relative lenker. Da trengs verken webserver
eller `fetch()`, og det virker både i Rise og når `index.html` åpnes rett fra disk (`file://`).

- **Meny → scenario:** Kortet er en ekte lenke (`<a href="scenarier/<mappe>/index.html">`).
  Da virker det med tastatur, og nettleserens tilbakeknapp virker også.
- **Scenario → meny:** Knappen «Hovedmeny» i scenarioets header går til `../../index.html`.
- **Dummy:** Et kort med `klar: false` lenker til `scenarier/_plassholder/index.html?id=<id>`.
  Plassholdersiden viser scenarioets tittel og teksten «Dette scenariet er ikke lagt inn ennå»,
  og har den samme «Hovedmeny»-knappen. Dermed kan hele rundturen testes i prototypen.

**Rise:**
- `index.html` i menyen sender `postMessage({ type: 'complete' }, '*')` til Rise ved oppstart,
  slik scenariene allerede gjør. Da stopper ikke blokken deltakeren.
- Ikke bruk `100vh` på `body`. Rise setter iframe-høyden etter innholdet, og `100vh` kan gi en
  side som vokser uten stopp (se kommentaren øverst i `player.css`).
- Menyen og scenariene har ulik høyde. Når deltakeren bytter side, justerer Rise høyden på iframen.
  Menyen bør derfor være kompakt, slik at den ikke blir mye høyere enn et scenario.

---

## 4. Hovedmenyen: innhold og layout

Fra toppen og ned:

1. **Header** med samme utseende som i scenariene (`.app-header`): merket `NIV`
   (`.logo-badge`), tittelen på programmet og til høyre knappen **«? Brukerveiledning»** (`.btn-header`).
2. **Innledning:** En kort tekst om hensikten med scenariene (kapittel 6.1), gjerne i et panel
   med `--bg-panel` og en venstrekant i `--color-accent`.
3. **Kortrutenett** med de seks scenariene med samspillsproblemer. Hvert kort har:
   - tema-etikett øverst (f.eks. «Trigger», «Inspirasjonstid», «Stigetid»)
   - tittel
   - 1–2 setninger om hva deltakeren skal se etter
   - teksten «Åpne scenario →»
   - i prototypen i tillegg merket «Ikke lagt inn ennå» når `klar: false`
4. **Skillelinje** og **NIV_FRISK_OPTIMAL** som eget kort. Plasseringen følger oversikten vi
   startet med: de seks først, streken, deretter frisk og optimal. Rekkefølgen styres helt av
   `meny-data.js` og kan endres der.
5. **Kort merknad nederst:** «Scenariene er laget for PC med mus.»

**Rutenett:** 3 kolonner fra 900 px, 2 kolonner fra 600 px, ellers 1. Bruk
`grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` eller tilsvarende.

**Kortene:** bakgrunn `--bg-card`, kant `--border-color`, `border-radius: 10px`. Ved hover og fokus
blir kanten `--color-accent`. Fokusmarkeringen skal være tydelig (`:focus-visible` med outline).

---

## 5. Filene i detalj

### 5.1 `meny-data.js`

All tekst og alle scenarier ligger her, slik at menyen kan endres uten å røre koden. Dataene legges
i en `.js`-fil og ikke i en `.json`-fil, fordi `fetch()` ikke virker fra `file://`. Det er samme
grunn som for `scenario-data.js` i scenariene.

```js
window.MENY_DATA = {
    tittel: 'NIV – samspill mellom pasient og respirator',
    innledning: [ /* avsnitt, se 6.1 */ ],
    veiledning: [ /* { overskrift, tekst } – se 6.3 */ ],
    scenarier: [
        {
            id: 'asynkroni-hoy-triggersensitivitet',
            tema: 'Trigger',
            tittel: 'Asynkroni – høy triggersensitivitet',
            beskrivelse: '…',
            mappe: 'scenarier/asynkroni-hoy-triggersensitivitet/',
            gruppe: 'problem',      // 'problem' = rutenettet, 'referanse' = under skillelinjen
            klar: false             // false = dummy (plassholderside), true = ekte scenario
        },
        // … de seks andre
    ]
};
```

### 5.2 `index.html` og `meny.js`

- `index.html` inneholder header, en tom beholder for innledningen, en tom beholder for kortene
  og dialogen for brukerveiledningen. Scriptene lastes nederst: først `meny-data.js`, så `meny.js`.
- `meny.js`:
  - fyller innledning, kort og veiledning fra `MENY_DATA`
  - lager `href` ut fra `klar`: `mappe + 'index.html'` eller plassholdersiden med `?id=`
  - åpner og lukker veiledningen. Esc lukker, fokus holdes inne i dialogen mens den er åpen,
    og fokus går tilbake til knappen når den lukkes. Gjør det som `infoOverlay` i scenarioets
    `app.js`.
  - sender `postMessage({ type: 'complete' })` til Rise
- Tekst settes med `textContent` eller trygge DOM-metoder, ikke med `innerHTML` fra dataene.

### 5.3 `meny.css`

- Kopier `:root`-blokken (fargene og fontene) fra scenarioets `style.css`, sammen med reglene for
  `.app-header`, `.brand-section`, `.logo-badge`, `.brand-title` og `.btn-header`, og for
  `.info-overlay` og `.info-modal` (dialogen) fra `player.css`.
- Menyen skal **ikke** lenke til scenarioenes css-filer. Da kan ett scenario endres uten at menyen
  endrer seg.
- Plasser dialogen øverst (`align-items: flex-start`), som i scenariene, fordi iframen kan være
  høyere enn skjermen.

### 5.4 `scenarier/_plassholder/index.html`

En enkel side med samme header som scenariene: **← Hovedmeny**, `NIV`-merket og scenarioets tittel.
Midt på står: «Dette scenariet er ikke lagt inn ennå.» Siden leser `?id=` fra adressen og henter
tittelen fra `../../meny-data.js`. CSS hentes fra `../../meny.css`, fordi plassholderen hører
til menyen og ikke er et scenario.

### 5.5 `lag-rise-zip.js`

Bygg videre på `lag-rise-zip.js` fra `ASYNKRONI_HØY_TRIGGERSENSITIVITET_NY_LAYOUT`, men gå
gjennom mappene rekursivt:

- `index.html` skal ligge i **roten** av zip-filen.
- Ta bare med filer nettleseren trenger: `.html`, `.css`, `.js`, `.json` og bilder
  (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`).
- Hopp over `originaler/`, `.git/`, `*.zip`, `*.md`, `*.ps1` og byggeskriptene
  (`bygg-scenario-data.js`, `lag-rise-zip.js`), også de som ligger inne i scenariomappene.
- Skriv ut en liste over filene som ble pakket, og den totale størrelsen.
- Utdata: `hovedmeny-niv-scenarier.zip`.

---

## 6. Forslagstekster (utkast, må kvalitetssikres faglig)

### 6.1 Innledning / hensikt

> **Velkommen til scenariene om NIV**
>
> I disse scenariene øver du på å gjenkjenne vanlige problemer i samspillet mellom pasient og
> respirator ved non-invasiv ventilasjon (NIV). Hvert scenario starter med en innstilling som
> gir et bestemt problem. Studer kurvene og måleverdiene, finn ut hva som er galt, og juster
> innstillingene til samspillet blir bedre.
>
> Du kan ta scenariene i den rekkefølgen du vil. Begynn gjerne med **Frisk pasient – optimale
> innstillinger**, så vet du hvordan kurvene ser ut når alt fungerer.

### 6.2 Kortene

| Tema | Tittel | Beskrivelse (forslag) |
|---|---|---|
| Trigger | Asynkroni – høy triggersensitivitet | Pasient og respirator er ikke i takt. Se hvordan triggerinnstillingen påvirker om pasientens pustforsøk gir støtte. |
| Trigger | Asynkroni – lav triggersensitivitet | Pasient og respirator er ikke i takt. Finn ut hva triggerinnstillingen gjør med samspillet. |
| Inspirasjonstid | For kort inspirasjonstid | Respiratoren avslutter innpusten før pasienten er ferdig. Se hvordan det viser seg i flow og volum. |
| Inspirasjonstid | For lang inspirasjonstid | Respiratoren fortsetter innpusten etter at pasienten vil puste ut. Se etter tegn på dette i kurvene. |
| Stigetid | For kort stigetid | Trykket bygger seg opp veldig raskt i starten av innpusten. Vurder hvordan det påvirker pasienten. |
| Stigetid | For lang stigetid | Trykket bygger seg opp sakte, og pasienten får for lite flow tidlig i innpusten. |
| Referanse | Frisk pasient – optimale innstillinger | Godt samspill mellom pasient og respirator. Bruk scenariet til å se hvordan kurvene ser ut når alt fungerer. |

### 6.3 Brukerveiledning (dialog)

> **Slik bruker du scenariene**
>
> **Velg et scenario:** Klikk på et kort i hovedmenyen. Scenariet åpnes her i vinduet.
>
> **Les kurvene:** Øverst ser du luftveistrykk (Paw), flow og volum. Knappen «Vis muskelinnsats
> (Pes)» viser i tillegg pasientens egen pusteinnsats.
>
> **Les måleverdiene:** Til høyre ser du måleverdier og en vurdering av samspillet mellom pasient og respirator.
>
> **Juster innstillingene:** Under «Innstillinger du kan endre» justerer du parameterne i
> scenariet. Endringen vises i kurvene etter noen pust.
>
> **Info:** Knappen «Info» forteller hva scenariet handler om, og gir deg fasit når du er klar.
>
> **Pause / Frys** stopper kurvene så du kan studere dem. **Nullstill** setter scenariet tilbake
> til start.
>
> **Hovedmeny** (øverst til venstre) tar deg tilbake hit, så du kan velge et nytt scenario.
>
> Scenariene er laget for PC med mus og fungerer dårlig på mobil.

---

## 7. Legge inn et ekte scenario (etter prototypen)

Scenariene legges inn **ferdige**, med samme layout som
`ASYNKRONI_HØY_TRIGGERSENSITIVITET_NY_LAYOUT`. Hovedmeny-programmet skal ikke endre layout,
stiler eller innhold i scenariene. Det eneste som kobles til er selve «Hovedmeny»-knappen.

**For hvert scenario:**

1. Kopier den ferdige scenariomappen til `scenarier/<ascii-navn>/`, med `index.html` i roten av
   mappen.
2. Koble «Hovedmeny»-knappen, slik at den går til menyen. I `app.js` bytter du innholdet i
   `goToMainMenu()` med
   ```js
   function goToMainMenu() {
       window.dispatchEvent(new CustomEvent('scenario:hovedmeny'));
       window.location.href = '../../index.html';
   }
   ```
3. Sett `klar: true` for scenariet i `meny-data.js`, og sjekk at `mappe` stemmer med mappenavnet.
4. Test rundturen meny → scenario → Hovedmeny, både fra disk og i Rise.

---

## 8. Byggetrinn

1. **Prototype:** Lag mappestrukturen, `index.html`, `meny.css`, `meny.js`, `meny-data.js`
   (alle sju med `klar: false`) og plassholdersiden.
2. Test fra disk: kortene, plassholdersiden, Hovedmeny tilbake, brukerveiledningen og
   tastaturnavigasjonen.
3. Lag `lag-rise-zip.js`, pakk og test i Rise (forhåndsvisning).
4. **Første ekte scenario:** Legg inn `asynkroni-hoy-triggersensitivitet` fra NY_LAYOUT
   (kapittel 7) for å kontrollere hele rundturen i Rise.
5. Legg inn resten ett og ett.
6. Gå gjennom tekstene faglig (kapittel 6).

---

## 9. Testsjekkliste

- [ ] `index.html` åpnes fra disk uten feil i konsollen.
- [ ] Alle sju kortene vises, med NIV_FRISK_OPTIMAL under skillelinjen.
- [ ] Et dummykort åpner plassholdersiden med riktig tittel.
- [ ] «Hovedmeny» fører tilbake til menyen, både fra plassholdersiden og fra ekte scenarier.
- [ ] Nettleserens tilbakeknapp virker.
- [ ] Brukerveiledningen åpnes og lukkes med knappen, med ✕ og med Esc, og fokus går tilbake til knappen.
- [ ] Alle kort og knapper kan brukes med Tab og Enter, og fokus er synlig.
- [ ] Rutenettet får 3, 2 og 1 kolonne ved ulike bredder, og siden får ingen horisontal rulling.
- [ ] I Rise: menyen vises, byttet til scenario og tilbake virker, og blokken hindrer ikke deltakeren i å gå videre.
- [ ] I Rise: kurvene i scenariet tegnes og nullstilles ikke når iframe-høyden endres.
- [ ] Zip-filen har `index.html` i roten og inneholder ingen `.md`-, `.zip`- eller byggefiler.
