/**
 * lag-endelig-kurs.js — lager det endelige kurset for Rise fra redigeringsversjonen.
 *
 *   node lag-endelig-kurs.js                  (skriver til ../ENDELIG_KURS/)
 *   node lag-endelig-kurs.js C:/et/annet/sted
 *
 * 1. Henter de nyeste tekstene fra Google Sheets (samme Apps Script-URL som i
 *    felles/redigering.js).
 * 2. Kopierer kurset til en egen mappe, uten redigeringsverktøyet (Quill) og uten
 *    utviklerfilene.
 * 3. Skriver tekstene inn i kopiens felles/tekster-data.js. Da viser sidene den
 *    innbakte teksten, kontakter ikke Google og har ingen redigeringsbryter.
 * 4. Kjører lag-rise-zip.js i kopien. Zip-filen der er den som lastes opp i Rise.
 *
 * Redigeringsversjonen (denne mappen) endres ikke. Krever Node 18 eller nyere.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const UT = path.resolve(process.argv[2] || path.join(ROOT, '..', 'ENDELIG_KURS'));
const MERKE = '.endelig-kurs';   // viser at mappen er laget av dette skriptet og kan slettes

// Mapper og filer som ikke hører hjemme i det endelige kurset
const HOPP_OVER_MAPPER = new Set(['.git', '.github', 'node_modules', 'originaler', 'apps-script']);
const HOPP_OVER_FILER = new Set(['lag-endelig-kurs.js', 'bygg-scenario-data.js', 'quill.js', 'quill.snow.css', '.gitignore']);
const HOPP_OVER_ENDELSER = /\.(zip|md|ps1)$/i;

function feil(melding) {
    console.error('\nFEIL: ' + melding);
    process.exit(1);
}

function hentUrl() {
    const kilde = fs.readFileSync(path.join(ROOT, 'felles', 'redigering.js'), 'utf8');
    const treff = kilde.match(/const APPS_SCRIPT_URL = '([^']+)'/);
    if (!treff) feil('Fant ikke APPS_SCRIPT_URL i felles/redigering.js.');
    return treff[1];
}

function kopier(fra, til) {
    fs.mkdirSync(til, { recursive: true });
    for (const o of fs.readdirSync(fra, { withFileTypes: true })) {
        const kilde = path.join(fra, o.name);
        if (path.resolve(kilde) === UT) continue;
        if (o.isDirectory()) {
            if (!HOPP_OVER_MAPPER.has(o.name)) kopier(kilde, path.join(til, o.name));
        } else if (o.isFile() && !HOPP_OVER_FILER.has(o.name) && !HOPP_OVER_ENDELSER.test(o.name)) {
            fs.copyFileSync(kilde, path.join(til, o.name));
        }
    }
}

async function main() {
    if (typeof fetch !== 'function') feil('Denne Node-versjonen mangler fetch. Installer Node 18 eller nyere.');

    // ---------------------------------------------------- 1. Tekstene
    const url = hentUrl();
    console.log('Henter tekstene fra Google Sheets …');
    let json;
    try {
        const svar = await fetch(url + '?t=' + Date.now());
        json = await svar.json();
    } catch (e) {
        feil('Kunne ikke hente tekstene (' + e.message + '). Sjekk nettforbindelsen og Apps Script-URL-en.');
    }
    if (!json || !json.success) feil('Apps Script svarte med feil: ' + (json && json.error));

    const data = json.data || {};
    const ider = Object.keys(data).sort();
    const tekster = {};
    for (const id of ider) tekster[id] = data[id].innhold;

    // ---------------------------------------------------- 2. Kopien
    if (fs.existsSync(UT)) {
        if (!fs.existsSync(path.join(UT, MERKE))) {
            feil('Mappen ' + UT + ' finnes allerede og er ikke laget av dette skriptet. Flytt eller slett den, eller velg en annen mappe.');
        }
        fs.rmSync(UT, { recursive: true, force: true });
    }
    kopier(ROOT, UT);
    fs.writeFileSync(path.join(UT, MERKE), 'Laget av lag-endelig-kurs.js ' + new Date().toISOString() + '\n');

    // ---------------------------------------------------- 3. Innbakte tekster
    const tekstfil = '/**\n'
        + ' * tekster-data.js — AUTOGENERERT av lag-endelig-kurs.js ' + new Date().toISOString() + '.\n'
        + ' * Tekstene fra Google Sheets, bakt inn i det endelige kurset. Ikke rediger for hånd;\n'
        + ' * rediger i redigeringsversjonen og kjør skriptet på nytt.\n'
        + ' */\n'
        + 'window.TEKSTER_DATA = ' + JSON.stringify(tekster, null, 2) + ';\n';
    fs.writeFileSync(path.join(UT, 'felles', 'tekster-data.js'), tekstfil, 'utf8');

    // Hele loggen med navn og tidspunkt, til arkivet (pakkes ikke i zip-filen)
    fs.writeFileSync(path.join(UT, 'tekster-eksport.json'),
        JSON.stringify({ eksportert: new Date().toISOString(), tekster: data }, null, 2), 'utf8');

    // ---------------------------------------------------- 4. Zip til Rise
    console.log('');
    execFileSync(process.execPath, [path.join(UT, 'lag-rise-zip.js')], { cwd: UT, stdio: 'inherit' });

    // ---------------------------------------------------- Rapport
    const navn = new Set(ider.map(id => data[id].navn).filter(Boolean));
    const sist = ider.map(id => data[id].tidspunkt).filter(Boolean).sort().pop();
    console.log('');
    console.log('Endelig kurs: ' + UT);
    console.log(ider.length + ' tekster er endret i Google Sheets og bakt inn. De andre bruker standardteksten.');
    if (navn.size) console.log('Redigert av: ' + Array.from(navn).join(', '));
    if (sist) console.log('Siste endring: ' + new Date(sist).toLocaleString('nb-NO'));
    console.log('');
    console.log('Test ved å åpne ' + path.join(UT, 'index.html') + ', og last opp hovedmeny-niv-scenarier.zip fra samme mappe i Rise.');
}

main();
