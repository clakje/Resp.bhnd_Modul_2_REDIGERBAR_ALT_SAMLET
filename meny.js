/**
 * meny.js — bygger hovedmenyen fra MENY_DATA (meny-data.js) og styrer
 * brukerveiledningen.
 *
 * All tekst settes med textContent / DOM-metoder, aldri med innerHTML fra dataene.
 *
 * Tekstene i meny-data.js er standardtekst. Hver tekst får et data-tekst-attributt
 * (tekst-id), og felles/redigering.js bytter den ut med teksten fra Google Sheets.
 */
(function () {
    'use strict';

    const data = window.MENY_DATA;
    if (!data) {
        console.error('meny-data.js ble ikke lastet (MENY_DATA mangler).');
        return;
    }

    const PLASSHOLDER = 'scenarier/_plassholder/index.html';

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    // Tekstboks for redigering.js. linje = overskrift/etikett, ellers tekstblokk.
    function tekst(node, id, linje) {
        node.setAttribute('data-tekst', id);
        if (linje) node.setAttribute('data-tekst-type', 'linje');
        return node;
    }

    // Et avsnitt er enten en tekst eller en liste med deler, der { fet: '…' } blir <strong>
    function lagAvsnitt(avsnitt) {
        const p = el('p');
        const deler = Array.isArray(avsnitt) ? avsnitt : [avsnitt];
        for (const del of deler) {
            if (del && typeof del === 'object') p.appendChild(el('strong', null, del.fet));
            else p.appendChild(document.createTextNode(String(del)));
        }
        return p;
    }

    // Ekte scenario: mappe + index.html. Dummy: plassholdersiden med ?id=
    function lenkeFor(s) {
        return s.klar ? s.mappe + 'index.html' : PLASSHOLDER + '?id=' + encodeURIComponent(s.id);
    }

    // Kortet er et <li> med lenken «Åpne scenario →», som dekker hele kortet (meny.css).
    // Tekstene ligger utenfor lenken, så de kan redigeres.
    function lagKort(s) {
        const li = el('li', 'scenario-kort');
        const tittelId = 'kort-tittel-' + s.id;

        const topp = el('div', 'kort-topp');
        topp.appendChild(tekst(el('span', 'kort-tema', s.tema), 'meny.kort.' + s.id + '.tema', true));
        if (!s.klar) topp.appendChild(el('span', 'kort-ikke-klar', data.ikkeKlarMerke));
        li.appendChild(topp);

        const tittel = tekst(el('h3', 'kort-tittel', s.tittel), 'meny.kort.' + s.id + '.tittel', true);
        tittel.id = tittelId;
        li.appendChild(tittel);
        li.appendChild(tekst(el('div', 'kort-beskrivelse', s.beskrivelse), 'meny.kort.' + s.id + '.beskrivelse'));

        const a = el('a', 'kort-lenke', data.kortLenketekst);
        a.href = lenkeFor(s);
        a.setAttribute('aria-describedby', tittelId);
        li.appendChild(a);
        return li;
    }

    // ------------------------------------------------------------ Innhold
    document.title = data.tittel;
    const menyTittel = document.getElementById('menyTittel');
    menyTittel.textContent = data.tittel;
    tekst(menyTittel, 'meny.tittel', true).setAttribute('data-dokumenttittel', '');
    tekst(document.getElementById('innledningOverskrift'), 'meny.innledning.overskrift', true)
        .textContent = data.innledningOverskrift;

    const innledning = tekst(document.getElementById('innledningTekst'), 'meny.innledning.tekst');
    for (const avsnitt of data.innledning) innledning.appendChild(lagAvsnitt(avsnitt));

    const kortProblem = document.getElementById('kortProblem');
    const kortReferanse = document.getElementById('kortReferanse');
    for (const s of data.scenarier) {
        (s.gruppe === 'referanse' ? kortReferanse : kortProblem).appendChild(lagKort(s));
    }

    tekst(document.getElementById('menyMerknad'), 'meny.merknad', true).textContent = data.merknad;

    // ------------------------------------------------------ Brukerveiledning
    // Samme oppførsel som infoOverlay i scenarioets app.js: lukkes med knappene
    // eller Esc (ikke klikk utenfor), fokus holdes inne i dialogen, og går
    // tilbake til knappen i headeren når den lukkes.
    const overlay = document.getElementById('veiledningOverlay');
    const modal = document.getElementById('veiledningModal');
    const btnVeiledning = document.getElementById('btnVeiledning');
    const btnLukkX = document.getElementById('btnLukkVeiledningX');
    const btnLukk = document.getElementById('btnLukkVeiledning');
    const veiledningTekst = document.getElementById('veiledningTekst');

    tekst(document.getElementById('veiledningOverskrift'), 'meny.veiledning.overskrift', true)
        .textContent = data.veiledningOverskrift;
    // Tekst-id-ene er nummerert (meny.veiledning.1, .2 …) etter rekkefølgen i meny-data.js
    data.veiledning.forEach((punkt, i) => {
        const id = 'meny.veiledning.' + (i + 1);
        const seksjon = el('section', 'info-section');
        if (punkt.overskrift) seksjon.appendChild(tekst(el('h3', null, punkt.overskrift), id + '.overskrift', true));
        else seksjon.classList.add('veiledning-merknad');
        const blokk = tekst(el('div'), id + '.tekst');
        blokk.appendChild(el('p', null, punkt.tekst));
        seksjon.appendChild(blokk);
        veiledningTekst.appendChild(seksjon);
    });

    function erApen() { return !overlay.classList.contains('hidden'); }

    function apneVeiledning() {
        overlay.classList.remove('hidden');
        veiledningTekst.scrollTop = 0;
        btnLukkX.focus();
    }

    function lukkVeiledning() {
        overlay.classList.add('hidden');
        btnVeiledning.focus();
    }

    btnVeiledning.addEventListener('click', apneVeiledning);
    btnLukkX.addEventListener('click', lukkVeiledning);
    btnLukk.addEventListener('click', lukkVeiledning);

    // Hold tastaturfokus inne i dialogen mens den er åpen
    overlay.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return;
        const fokuserbare = Array.from(modal.querySelectorAll('button, a[href]')).filter(b => b.offsetParent !== null);
        if (!fokuserbare.length) return;
        const forste = fokuserbare[0];
        const siste = fokuserbare[fokuserbare.length - 1];
        if (e.shiftKey && document.activeElement === forste) { e.preventDefault(); siste.focus(); }
        else if (!e.shiftKey && document.activeElement === siste) { e.preventDefault(); forste.focus(); }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && erApen()) lukkVeiledning();
    });

    // -------------------------------------------------------------- Rise
    // Meld kodeblokken fullført, så deltakeren ikke blir stoppet av blokken.
    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'complete' }, '*');
        }
    } catch (e) { /* ikke innebygd */ }
})();
