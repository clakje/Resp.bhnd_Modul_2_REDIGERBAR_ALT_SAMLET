/**
 * lag-rise-zip.js — pakker hele hovedmeny-programmet (menyen + alle scenariomapper)
 * til én zip for Articulate Rise (kodeblokk).
 *
 * Rise krever at index.html ligger i roten av zip-filen, ikke i en undermappe.
 * Mappene gås gjennom rekursivt, og bare filene nettleseren trenger tas med.
 *
 *   node lag-rise-zip.js                       (skriver hovedmeny-niv-scenarier.zip)
 *   node lag-rise-zip.js annet-navn.zip
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const vm = require('vm');

const ROOT = __dirname;
const outName = process.argv[2] || 'hovedmeny-niv-scenarier.zip';

// Filtyper nettleseren trenger
const TA_MED = /\.(html|css|js|json|png|jpe?g|gif|svg|webp)$/i;
// Mapper som aldri pakkes (uansett nivå)
const HOPP_OVER_MAPPER = new Set(['originaler', '.git', 'node_modules', 'apps-script']);
// Filer som aldri pakkes (uansett nivå), i tillegg til *.zip, *.md og *.ps1
const HOPP_OVER_FILER = new Set(['bygg-scenario-data.js', 'lag-rise-zip.js', 'lag-endelig-kurs.js', 'tekster-eksport.json']);

function skalHoppesOver(navn) {
    return HOPP_OVER_FILER.has(navn) || /\.(zip|md|ps1)$/i.test(navn);
}

function finnFiler(mappe, rel) {
    const ut = [];
    const oppforinger = fs.readdirSync(mappe, { withFileTypes: true })
        .sort((a, b) => a.name.localeCompare(b.name));
    for (const o of oppforinger) {
        const relSti = rel ? rel + '/' + o.name : o.name;
        if (o.isDirectory()) {
            if (!HOPP_OVER_MAPPER.has(o.name)) ut.push(...finnFiler(path.join(mappe, o.name), relSti));
        } else if (o.isFile() && TA_MED.test(o.name) && !skalHoppesOver(o.name)) {
            ut.push(relSti);
        }
    }
    return ut;
}

if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
    console.error('Fant ikke index.html i roten av programmet.');
    process.exit(1);
}

// index.html først, så resten i mappe-rekkefølge
const FILES = ['index.html', ...finnFiler(ROOT, '').filter(f => f !== 'index.html')];

// ------------------------------------------------------------ Kontroller
const advarsler = [];

// Norske tegn og mellomrom i filnavn gir feil på enkelte maskiner og i Rise
for (const f of FILES) {
    if (/[^A-Za-z0-9._\/-]/.test(f)) advarsler.push('Filnavnet har tegn utenom a–z, 0–9, «-», «_» og «.»: ' + f);
}

// Redigeringsversjonen skal ikke til Rise: der kan deltakerne endre tekstene i Google Sheets
try {
    const tekstData = fs.readFileSync(path.join(ROOT, 'felles', 'tekster-data.js'), 'utf8');
    if (/window\.TEKSTER_DATA\s*=\s*null/.test(tekstData)) {
        advarsler.push('Dette er REDIGERINGSVERSJONEN (tekstene hentes fra Google Sheets og kan redigeres av alle). ' +
            'Til Rise: kjør «node lag-endelig-kurs.js» i stedet.');
    }
} catch (e) {
    advarsler.push('Fant ikke felles/tekster-data.js.');
}

// Scenarier med klar: true må ha index.html i mappen sin
try {
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'meny-data.js'), 'utf8'), sandbox);
    for (const s of (sandbox.window.MENY_DATA || {}).scenarier || []) {
        if (s.klar && !FILES.includes(s.mappe + 'index.html')) {
            advarsler.push('«' + s.tittel + '» har klar: true, men ' + s.mappe + 'index.html finnes ikke.');
        }
    }
} catch (e) {
    advarsler.push('Kunne ikke lese meny-data.js: ' + e.message);
}

// ---------------------------------------------------------------- CRC-32
// zlib.crc32 finnes fra Node 20.15 / 22.2; ellers brukes en enkel tabell.
const crc32 = zlib.crc32 || (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    }
    return buf => {
        let c = 0xffffffff;
        for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
        return (c ^ 0xffffffff) >>> 0;
    };
})();

// ------------------------------------------------------------------ Zip
// DOS-dato/-tid for zip-headerne
const now = new Date();
const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

const local = [];
const central = [];
let offset = 0;
let totalt = 0;

for (const name of FILES) {
    const data = fs.readFileSync(path.join(ROOT, name));
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    const crc = crc32(data);
    const nameBuf = Buffer.from(name, 'utf8');
    totalt += data.length;

    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);          // versjon som trengs
    lh.writeUInt16LE(0x0800, 6);      // UTF-8-filnavn
    lh.writeUInt16LE(8, 8);           // deflate
    lh.writeUInt16LE(dosTime, 10);
    lh.writeUInt16LE(dosDate, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(deflated.length, 18);
    lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);
    local.push(lh, nameBuf, deflated);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);          // laget av
    ch.writeUInt16LE(20, 6);          // versjon som trengs
    ch.writeUInt16LE(0x0800, 8);
    ch.writeUInt16LE(8, 10);
    ch.writeUInt16LE(dosTime, 12);
    ch.writeUInt16LE(dosDate, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(deflated.length, 20);
    ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt32LE(offset, 42);     // resten (ekstra, kommentar, disk, attributter) er 0
    central.push(ch, nameBuf);

    offset += lh.length + nameBuf.length + deflated.length;
}

const centralBuf = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(FILES.length, 8);
end.writeUInt16LE(FILES.length, 10);
end.writeUInt32LE(centralBuf.length, 12);
end.writeUInt32LE(offset, 16);

const zip = Buffer.concat([...local, centralBuf, end]);
fs.writeFileSync(path.join(ROOT, outName), zip);

// ------------------------------------------------------------- Rapport
const kb = n => (n / 1024).toFixed(1).padStart(8) + ' kB';
console.log('Pakket filer:');
for (const f of FILES) console.log(kb(fs.statSync(path.join(ROOT, f)).size) + '  ' + f);
console.log('');
console.log('Skrev ' + outName + ' med ' + FILES.length + ' filer (index.html i roten).');
console.log('Totalt ' + kb(totalt).trim() + ' utpakket, ' + kb(zip.length).trim() + ' pakket.');

if (advarsler.length) {
    console.log('');
    console.log('ADVARSLER:');
    for (const a of advarsler) console.log('  - ' + a);
}
