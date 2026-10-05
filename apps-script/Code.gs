/**
 * Code.gs — database og logg for de redigerbare tekstene i NIV-kurset.
 *
 * Lim hele filen inn i Apps Script-prosjektet som hører til regnearket
 * (Utvidelser → Apps Script), og publiser som nettapp. Se REDIGERING_INSTRUKS.md.
 *
 * Arket «Tekster» er både database og logg. Hver lagring legger til én rad per
 * tekstboks som ble endret — ingenting overskrives eller slettes:
 *
 *   Tidspunkt | Navn | Side | Tekst-id | Innhold (HTML)
 *
 * Den nederste raden for en tekst-id er gjeldende tekst. Eldre rader er historikken.
 *
 *   GET  ?                  → { success, data: { <tekst-id>: { innhold, navn, tidspunkt } } }
 *   GET  ?historikk=<id>    → { success, data: [ { innhold, navn, side, tidspunkt }, … ] } (nyeste først)
 *   POST { navn, side, endringer: [ { id, innhold, grunnlag } ] }
 *                           → { success, lagret, konflikter: [ { id, navn, tidspunkt } ], data }
 *
 * «grunnlag» er tidspunktet for versjonen nettleseren hentet. Har noen andre lagret
 * samme tekst siden da, lagres endringen likevel (begge ligger i loggen), men
 * nettsiden får beskjed om det.
 */

const ARK_NAVN = 'Tekster';
const KOLONNER = ['Tidspunkt', 'Navn', 'Side', 'Tekst-id', 'Innhold'];

// Tomt = regnearket skriptet er opprettet fra. Lim inn ID-en fra regnearkets
// adresse (…/spreadsheets/d/<ID>/edit) hvis skriptet er et frittstående prosjekt.
const REGNEARK_ID = '';

const MAKS_TEGN = 45000;          // en celle i Google Sheets rommer 50 000 tegn
const MAKS_ENDRINGER = 200;
const MAKS_HISTORIKK = 50;
const GYLDIG_ID = /^[A-Za-z0-9._-]{1,120}$/;

function doGet(e) {
  try {
    const ark = hentArk_();
    const id = e && e.parameter && e.parameter.historikk;
    if (id) return svar_({ success: true, data: historikk_(ark, String(id)) });
    return svar_({ success: true, data: nyesteTekster_(ark) });
  } catch (feil) {
    return svar_({ success: false, error: String(feil && feil.message || feil) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const foresporsel = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const navn = String(foresporsel.navn || '').trim().slice(0, 100);
    const side = String(foresporsel.side || '').trim().slice(0, 100);
    const endringer = Array.isArray(foresporsel.endringer) ? foresporsel.endringer : [];

    if (!navn) return svar_({ success: false, error: 'Navn mangler.' });
    if (!endringer.length) return svar_({ success: false, error: 'Ingen endringer å lagre.' });
    if (endringer.length > MAKS_ENDRINGER) return svar_({ success: false, error: 'For mange endringer på én gang.' });

    for (const en of endringer) {
      if (!en || !GYLDIG_ID.test(String(en.id))) return svar_({ success: false, error: 'Ugyldig tekst-id: ' + (en && en.id) });
      if (String(en.innhold == null ? '' : en.innhold).length > MAKS_TEGN) {
        return svar_({ success: false, error: 'Teksten «' + en.id + '» er for lang (maks ' + MAKS_TEGN + ' tegn).' });
      }
    }

    lock.waitLock(20000);
    const ark = hentArk_();
    const foer = nyesteTekster_(ark);
    const tid = new Date();
    const konflikter = [];

    const rader = endringer.map(en => {
      const id = String(en.id);
      const naa = foer[id];
      const grunnlag = en.grunnlag || null;
      if (naa && naa.tidspunkt !== grunnlag) konflikter.push({ id: id, navn: naa.navn, tidspunkt: naa.tidspunkt });
      return [tid, navn, side, id, somTekst_(String(en.innhold == null ? '' : en.innhold))];
    });

    ark.getRange(ark.getLastRow() + 1, 1, rader.length, KOLONNER.length).setValues(rader);
    SpreadsheetApp.flush();

    // Les tilbake, så nettleseren får tidspunktet slik arket lagret det
    const etter = nyesteTekster_(ark);
    const data = {};
    endringer.forEach(en => { data[en.id] = etter[en.id]; });

    return svar_({ success: true, lagret: rader.length, konflikter: konflikter, data: data });
  } catch (feil) {
    return svar_({ success: false, error: String(feil && feil.message || feil) });
  } finally {
    try { lock.releaseLock(); } catch (e2) { /* ikke låst */ }
  }
}

// ---------------------------------------------------------------- Flytting fra den gamle koden

/**
 * Kjøres for hånd én gang (velg flyttGamleEndringer øverst i Apps Script og trykk Kjør).
 *
 * Den gamle koden lagret hele forespørselen som én rad, med endringene som tekst i
 * kolonnen «endringer»: {id=…, innhold=…, grunnlag=…}. Denne funksjonen leser slike
 * rader i de andre fanene og legger dem inn i «Tekster». Tekst-id-er som allerede
 * finnes i «Tekster» hoppes over, så funksjonen kan trygt kjøres flere ganger.
 */
function flyttGamleEndringer() {
  const ark = hentArk_();
  const finnes = nyesteTekster_(ark);
  const nye = [];
  const hoppetOver = new Set();

  ark.getParent().getSheets().forEach(gammel => {
    if (gammel.getName() === ARK_NAVN || gammel.getLastRow() < 2) return;
    const verdier = gammel.getDataRange().getValues();
    const topp = verdier[0].map(v => String(v).trim().toLowerCase());
    const kEndringer = topp.indexOf('endringer');
    if (kEndringer < 0) return;
    const kNavn = topp.indexOf('navn');
    const kSide = topp.indexOf('side');
    const kTid = topp.findIndex(t => /tid|dato|time|stamp/.test(t));

    verdier.slice(1).forEach(rad => {
      const tid = kTid >= 0 && rad[kTid] instanceof Date ? rad[kTid] : new Date();
      const navn = kNavn >= 0 ? String(rad[kNavn]).trim() : '';
      const side = kSide >= 0 ? String(rad[kSide]).trim() : '';
      lesGamleEndringer_(rad[kEndringer]).forEach(en => {
        if (finnes[en.id]) { hoppetOver.add(en.id); return; }
        nye.push([tid, navn || 'ukjent', side, en.id, somTekst_(en.innhold)]);
      });
    });
  });

  // Eldste først, så den nyeste versjonen av hver tekst havner nederst og blir gjeldende
  nye.sort((a, b) => a[0] - b[0]);
  if (nye.length) ark.getRange(ark.getLastRow() + 1, 1, nye.length, KOLONNER.length).setValues(nye);
  Logger.log(nye.length + ' endringer flyttet til «' + ARK_NAVN + '».' +
    (hoppetOver.size ? ' Hoppet over (finnes allerede): ' + Array.from(hoppetOver).join(', ') : ''));
}

// Godtar både JSON og tekstformen Apps Script lager av objekter: [{id=…, innhold=…, grunnlag=…}, …]
function lesGamleEndringer_(celle) {
  const tekst = String(celle || '').trim();
  if (!tekst) return [];
  try {
    const json = JSON.parse(tekst);
    return (Array.isArray(json) ? json : [json])
      .filter(en => en && GYLDIG_ID.test(String(en.id)))
      .map(en => ({ id: String(en.id), innhold: String(en.innhold == null ? '' : en.innhold) }));
  } catch (e) { /* ikke JSON */ }
  const ut = [];
  const monster = /\{id=([A-Za-z0-9._-]{1,120}), innhold=([\s\S]*?), grunnlag=[^{}]*?\}(?=\s*(?:,\s*\{id=|\]|$))/g;
  let treff;
  while ((treff = monster.exec(tekst))) ut.push({ id: treff[1], innhold: treff[2] });
  return ut;
}

// ---------------------------------------------------------------- Hjelpere

function hentArk_() {
  const regneark = REGNEARK_ID ? SpreadsheetApp.openById(REGNEARK_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!regneark) throw new Error('Fant ikke regnearket. Fyll inn REGNEARK_ID i Code.gs.');
  let ark = regneark.getSheetByName(ARK_NAVN);
  if (!ark) {
    ark = regneark.insertSheet(ARK_NAVN);
    ark.getRange(1, 1, 1, KOLONNER.length).setValues([KOLONNER]).setFontWeight('bold');
    ark.setFrozenRows(1);
    ark.setColumnWidth(1, 160);
    ark.setColumnWidth(4, 280);
    ark.setColumnWidth(5, 600);
  }
  return ark;
}

function alleRader_(ark) {
  const antall = ark.getLastRow() - 1;
  if (antall < 1) return [];
  return ark.getRange(2, 1, antall, KOLONNER.length).getValues();
}

function tidTekst_(verdi) {
  return verdi instanceof Date ? verdi.toISOString() : String(verdi || '');
}

// Radene står i tidsrekkefølge, så den siste raden for en id vinner
function nyesteTekster_(ark) {
  const data = {};
  alleRader_(ark).forEach(rad => {
    const id = String(rad[3] || '').trim();
    if (!id) return;
    data[id] = { innhold: String(rad[4]), navn: String(rad[1]), tidspunkt: tidTekst_(rad[0]) };
  });
  return data;
}

function historikk_(ark, id) {
  const ut = [];
  alleRader_(ark).forEach(rad => {
    if (String(rad[3] || '').trim() !== id) return;
    ut.push({ innhold: String(rad[4]), navn: String(rad[1]), side: String(rad[2]), tidspunkt: tidTekst_(rad[0]) });
  });
  return ut.reverse().slice(0, MAKS_HISTORIKK);
}

// Tekst som starter med = + - @ tolkes ellers som formel av Google Sheets
function somTekst_(tekst) {
  return /^[=+\-@]/.test(tekst) ? "'" + tekst : tekst;
}

function svar_(objekt) {
  return ContentService.createTextOutput(JSON.stringify(objekt)).setMimeType(ContentService.MimeType.JSON);
}
