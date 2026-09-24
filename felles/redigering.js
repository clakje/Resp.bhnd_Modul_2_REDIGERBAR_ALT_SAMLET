/**
 * redigering.js — redigerbare tekster i hovedmenyen og scenariene.
 *
 * Hvert element med data-tekst="<tekst-id>" er en tekstboks. Innholdet i HTML-en
 * (eller det meny.js bygger) er kursets opprinnelige tekst.
 *
 *   data-tekst="id"              tekstboksen. Id-en er nøkkelen i Google Sheets.
 *   data-tekst-type="linje"      overskrift/etikett: én linje, bare fet/kursiv/senket/hevet.
 *                                Uten attributtet er boksen en tekstblokk med avsnitt og lister.
 *   data-tekst-kopi="id"         viser samme tekst et annet sted (ikke redigerbar der)
 *   data-dokumenttittel="tekst"  boksens tekst + denne teksten blir fanetittelen
 *   data-tekst-seksjon           seksjonen skjules for deltakeren når tekstblokkene i den er tomme
 *
 * To moduser, styrt av felles/tekster-data.js:
 *
 *   TEKSTER_DATA = null     Redigeringsversjonen (GitHub). Tekstene hentes fra Google Sheets
 *                           ved sidelasting. En bryter nede til venstre veksler mellom lesemodus
 *                           og redigeringsmodus (Quill), og «Lagre endringer» sender de endrede
 *                           boksene til arket.
 *   TEKSTER_DATA = { … }    Endelig kurs (Rise), laget av lag-endelig-kurs.js. Tekstene er bakt
 *                           inn, siden kontakter ikke Google, og det finnes ingen redigering.
 */
(function () {
    'use strict';

    // Nettapp-URL-en fra Apps Script (Implementer → Administrer implementeringer)
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwFzATBySwauUbNsktzhCNm5FP0SkPX9zeTnRaPktbBq4eQ4U2WVS9YH5zQ_kO8eJdeRA/exec';

    const TIDSAVBRUDD_MS = 20000;
    const FELLES_URL = document.currentScript.src.replace(/[^/]*$/, '');
    const SIDE = document.documentElement.getAttribute('data-tekst-side') || 'ukjent';
    const INNBAKT = window.TEKSTER_DATA && typeof window.TEKSTER_DATA === 'object' ? window.TEKSTER_DATA : null;

    const LAGER_NAVN = 'niv-tekster.navn';
    const LAGER_MODUS = 'niv-tekster.modus';

    function lesLokalt(nokkel) {
        try { return localStorage.getItem(nokkel); } catch (e) { return null; }
    }
    function skrivLokalt(nokkel, verdi) {
        try {
            if (verdi == null) localStorage.removeItem(nokkel);
            else localStorage.setItem(nokkel, verdi);
        } catch (e) { /* privat vindu o.l. */ }
    }

    // =========================================================================
    // Rensing: bare enkel formatering slipper gjennom fra arket
    // =========================================================================
    const TAGGER_BLOKK = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'a', 'ul', 'ol', 'li'];
    const TAGGER_LINJE = ['br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup'];

    if (window.DOMPurify) {
        window.DOMPurify.addHook('afterSanitizeAttributes', node => {
            if (node.tagName === 'A') {
                node.setAttribute('target', '_blank');
                node.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }

    function rens(html, type) {
        html = String(html == null ? '' : html);
        if (!window.DOMPurify) {
            // Uten DOMPurify vises bare ren tekst
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const div = document.createElement('div');
            div.textContent = doc.body.textContent || '';
            return div.innerHTML;
        }
        return window.DOMPurify.sanitize(html, {
            ALLOWED_TAGS: type === 'linje' ? TAGGER_LINJE : TAGGER_BLOKK,
            ALLOWED_ATTR: ['href', 'target', 'rel'],
            ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i
        }).trim();
    }

    function erTom(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent.trim() === '';
    }

    // =========================================================================
    // Tekstboksene
    // =========================================================================
    const bokser = [];

    function finnBokser() {
        document.querySelectorAll('[data-tekst]').forEach(el => {
            const id = el.getAttribute('data-tekst');
            el.classList.add('quill-editor');
            if (!el.id) el.id = 'editor-' + id.replace(/[^A-Za-z0-9_-]/g, '_');
            const html = el.innerHTML.trim();
            bokser.push({
                el: el,
                id: id,
                type: el.getAttribute('data-tekst-type') === 'linje' ? 'linje' : 'blokk',
                standard: html,     // kursets opprinnelige tekst
                vist: html,         // teksten som vises nå (fra arket eller standard)
                info: null,         // { innhold, navn, tidspunkt } fra arket
                editor: null,
                grunnlinje: null    // editorens HTML da redigeringen startet / sist lagret
            });
        });
    }

    function visTekst(boks, html) {
        boks.vist = html;
        if (!boks.editor) boks.el.innerHTML = html;
        oppdaterKopier(boks);
    }

    function oppdaterKopier(boks) {
        document.querySelectorAll('[data-tekst-kopi="' + CSS.escape(boks.id) + '"]').forEach(k => {
            k.innerHTML = boks.vist;
        });
        const tillegg = boks.el.getAttribute('data-dokumenttittel');
        if (tillegg != null) {
            const div = document.createElement('div');
            div.innerHTML = boks.vist;
            document.title = div.textContent.trim() + tillegg;
        }
    }

    // Tomme seksjoner skjules for deltakeren, men vises i redigeringsmodus
    function oppdaterSeksjoner() {
        document.querySelectorAll('[data-tekst-seksjon]').forEach(seksjon => {
            const blokker = bokser.filter(b => b.type === 'blokk' && seksjon.contains(b.el));
            const tom = blokker.length > 0 && blokker.every(b => erTom(b.vist));
            seksjon.classList.toggle('tekst-seksjon-tom', tom && !redigerer);
        });
    }

    function brukData(data) {
        bokser.forEach(boks => {
            const post = data[boks.id];
            if (post == null) return;
            const innhold = typeof post === 'object' ? post.innhold : post;
            if (typeof post === 'object') boks.info = post;
            visTekst(boks, rens(innhold, boks.type));
        });
        // Kopier og fanetittel skal følge boksen selv om den har standardtekst
        bokser.forEach(oppdaterKopier);
        oppdaterSeksjoner();
    }

    function ferdigLastet() {
        document.documentElement.classList.remove('tekster-laster');
    }

    // =========================================================================
    // Kontakt med Google Sheets
    // =========================================================================
    async function hentJson(url, valg) {
        const kontroll = new AbortController();
        const tidtaker = setTimeout(() => kontroll.abort(), TIDSAVBRUDD_MS);
        try {
            const svar = await fetch(url, Object.assign({ signal: kontroll.signal }, valg || {}));
            if (!svar.ok) throw new Error('HTTP ' + svar.status);
            const json = await svar.json();
            if (!json || !json.success) throw new Error((json && json.error) || 'Ukjent svar fra Google Sheets');
            return json;
        } catch (e) {
            if (e.name === 'AbortError') throw new Error('Google Sheets svarte ikke');
            throw e;
        } finally {
            clearTimeout(tidtaker);
        }
    }

    function hentTekster() {
        return hentJson(APPS_SCRIPT_URL + '?t=' + Date.now()).then(json => json.data || {});
    }

    function hentHistorikk(id) {
        return hentJson(APPS_SCRIPT_URL + '?historikk=' + encodeURIComponent(id) + '&t=' + Date.now())
            .then(json => json.data || []);
    }

    function sendEndringer(navn, endringer) {
        // text/plain gir en «enkel» forespørsel uten CORS-forhåndssjekk, som Apps Script ikke støtter
        return hentJson(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ navn: navn, side: SIDE, endringer: endringer })
        });
    }

    // =========================================================================
    // Quill
    // =========================================================================
    let quillLaster = null;

    function lastQuill() {
        if (window.Quill) return Promise.resolve();
        if (quillLaster) return quillLaster;
        quillLaster = new Promise((ok, feil) => {
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = FELLES_URL + 'vendor/quill.snow.css';
            document.head.insertBefore(css, document.head.querySelector('link[href$="redigering.css"]'));

            const skript = document.createElement('script');
            skript.src = FELLES_URL + 'vendor/quill.js';
            skript.onload = () => ok();
            skript.onerror = () => { quillLaster = null; feil(new Error('Fant ikke vendor/quill.js')); };
            document.head.appendChild(skript);
        });
        return quillLaster;
    }

    const VERKTOY_LINJE = [['bold', 'italic'], [{ script: 'sub' }, { script: 'super' }], ['clean']];
    const VERKTOY_BLOKK = [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        [{ script: 'sub' }, { script: 'super' }],
        ['clean']
    ];
    const FORMATER_LINJE = ['bold', 'italic', 'script'];
    const FORMATER_BLOKK = ['bold', 'italic', 'underline', 'strike', 'script', 'link', 'list', 'indent'];

    const VERKTOY_TITLER = {
        'ql-bold': 'Fet', 'ql-italic': 'Kursiv', 'ql-underline': 'Understreket',
        'ql-link': 'Lenke', 'ql-clean': 'Fjern formatering'
    };

    function lagEditor(boks) {
        const el = boks.el;
        el.innerHTML = '';
        el.classList.add('tekstboks-redigerer');

        const holder = document.createElement('div');
        el.appendChild(holder);

        const linje = boks.type === 'linje';
        const bindinger = { tab: false };  // Tab flytter fokus i stedet for å sette inn tabulator
        if (linje) bindinger.enter = { key: 'Enter', shiftKey: null, handler: () => false };

        const quill = new window.Quill(holder, {
            theme: 'snow',
            placeholder: 'Tom – klikk for å skrive',
            formats: linje ? FORMATER_LINJE : FORMATER_BLOKK,
            modules: {
                toolbar: linje ? VERKTOY_LINJE : VERKTOY_BLOKK,
                keyboard: { bindings: bindinger }
            }
        });

        // Verktøylinjen under teksten, så teksten man klikker i ikke flytter seg
        const verktoy = quill.getModule('toolbar').container;
        el.appendChild(verktoy);
        verktoy.querySelectorAll('button').forEach(knapp => {
            const klasse = Array.from(knapp.classList).find(k => VERKTOY_TITLER[k]);
            if (klasse) knapp.title = VERKTOY_TITLER[klasse];
            else if (knapp.classList.contains('ql-list')) knapp.title = knapp.value === 'ordered' ? 'Nummerert liste' : 'Punktliste';
            else if (knapp.classList.contains('ql-script')) knapp.title = knapp.value === 'sub' ? 'Senket skrift' : 'Hevet skrift';
        });

        quill.setContents(quill.clipboard.convert({ html: boks.vist, text: '' }), 'silent');
        quill.history.clear();
        boks.editor = quill;
        boks.grunnlinje = lesEditor(boks);

        quill.on('text-change', planleggStatus);
        quill.on('selection-change', omrade => { if (omrade) settAktiv(boks); });
    }

    function lesEditor(boks) {
        // Quill 2.0.3 gjør alle mellomrom om til &nbsp; i getSemanticHTML
        let html = boks.editor.getSemanticHTML().replace(/&nbsp;/g, ' ');
        if (boks.type === 'linje') {
            html = html.replace(/<\/p>\s*<p>/g, ' ').replace(/^\s*<p>/, '').replace(/<\/p>\s*$/, '');
        }
        html = rens(html, boks.type);
        return erTom(html) ? '' : html;
    }

    function fjernEditor(boks) {
        boks.editor = null;
        boks.grunnlinje = null;
        boks.el.classList.remove('tekstboks-redigerer', 'aktiv');
        boks.el.innerHTML = boks.vist;
    }

    function erEndret(boks) {
        return !!boks.editor && lesEditor(boks) !== boks.grunnlinje;
    }

    function endrede() {
        return bokser.filter(erEndret);
    }

    let aktiv = null;
    function settAktiv(boks) {
        if (aktiv === boks) return;
        if (aktiv) aktiv.el.classList.remove('aktiv');
        aktiv = boks;
        if (boks) boks.el.classList.add('aktiv');
        if (ui) ui.historikk.disabled = !boks;
    }

    // =========================================================================
    // Panelet: bryter, navn, lagre, historikk og status
    // =========================================================================
    let ui = null;
    let redigerer = false;
    let hentetFraArk = false;
    let statusTidtaker = null;

    function lagPanel() {
        const panel = document.createElement('div');
        panel.className = 'redigering-panel';
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-label', 'Redigering av tekster');
        panel.innerHTML =
            '<div class="redigering-rad">' +
            '  <span class="bryter-etikett" aria-hidden="true">Lesemodus</span>' +
            '  <label class="bryter">' +
            '    <input type="checkbox" role="switch" class="bryter-input" aria-label="Redigeringsmodus">' +
            '    <span class="bryter-spor" aria-hidden="true"></span>' +
            '  </label>' +
            '  <span class="bryter-etikett" aria-hidden="true">Redigeringsmodus</span>' +
            '</div>' +
            '<div class="redigering-verktoy">' +
            '  <label class="redigering-navn"><span>Ditt navn</span><input type="text" autocomplete="name" maxlength="100" placeholder="Fornavn Etternavn"></label>' +
            '  <div class="redigering-knapper">' +
            '    <button type="button" class="red-knapp red-historikk" disabled title="Tidligere versjoner av teksten du sist klikket i">Historikk</button>' +
            '    <button type="button" class="red-knapp red-lagre">Lagre endringer</button>' +
            '  </div>' +
            '</div>' +
            '<div class="redigering-status" role="status" aria-live="polite"></div>';
        document.body.appendChild(panel);

        ui = {
            panel: panel,
            bryter: panel.querySelector('.bryter-input'),
            navn: panel.querySelector('.redigering-navn input'),
            lagre: panel.querySelector('.red-lagre'),
            historikk: panel.querySelector('.red-historikk'),
            status: panel.querySelector('.redigering-status')
        };
        ui.navn.value = lesLokalt(LAGER_NAVN) || '';
        ui.navn.addEventListener('change', () => skrivLokalt(LAGER_NAVN, ui.navn.value.trim() || null));
        ui.bryter.addEventListener('change', () => { if (ui.bryter.checked) startRedigering(); else stoppRedigering(); });
        ui.lagre.addEventListener('click', lagre);
        ui.historikk.addEventListener('click', () => { if (aktiv) visHistorikk(aktiv); });
    }

    function visStatus(tekst, type) {
        clearTimeout(statusTidtaker);
        ui.status.textContent = tekst || '';
        ui.status.className = 'redigering-status' + (type ? ' status-' + type : '');
    }

    // Antall ulagrede endringer, oppdatert litt etter hvert tastetrykk
    function planleggStatus() {
        clearTimeout(statusTidtaker);
        statusTidtaker = setTimeout(oppdaterStatus, 250);
    }

    function oppdaterStatus() {
        if (!redigerer) return;
        const n = endrede().length;
        if (n) visStatus(n === 1 ? '1 tekst er ikke lagret.' : n + ' tekster er ikke lagret.', 'ulagret');
        else if (!ui.status.classList.contains('status-ok') && !ui.status.classList.contains('status-advarsel')) visStatus('Ingen ulagrede endringer.');
    }

    async function startRedigering() {
        if (!hentetFraArk) {
            ui.bryter.checked = false;
            visStatus('Tekstene er ikke hentet fra Google Sheets, så redigering er slått av. Last siden på nytt for å prøve igjen.', 'feil');
            return;
        }
        ui.bryter.disabled = true;
        try {
            await lastQuill();
        } catch (e) {
            ui.bryter.checked = false;
            ui.bryter.disabled = false;
            visStatus('Kunne ikke starte redigeringsverktøyet: ' + e.message, 'feil');
            return;
        }
        redigerer = true;
        document.documentElement.classList.add('redigeringsmodus');
        oppdaterSeksjoner();
        bokser.forEach(lagEditor);
        ui.bryter.disabled = false;
        skrivLokalt(LAGER_MODUS, 'rediger');
        visStatus('Klikk i en tekst for å endre den. Husk «Lagre endringer» før du går videre.');
    }

    async function stoppRedigering() {
        const n = endrede().length;
        if (n) {
            const lagreNa = window.confirm(
                (n === 1 ? 'Du har 1 tekst som ikke er lagret.' : 'Du har ' + n + ' tekster som ikke er lagret.') +
                '\n\nOK: lagre og gå til lesemodus.\nAvbryt: fortsett å redigere.');
            if (!lagreNa || !(await lagre())) {
                ui.bryter.checked = true;
                return;
            }
        }
        settAktiv(null);
        bokser.forEach(fjernEditor);
        redigerer = false;
        document.documentElement.classList.remove('redigeringsmodus');
        oppdaterSeksjoner();
        skrivLokalt(LAGER_MODUS, null);
        visStatus('');
    }

    function klokkeslett(iso) {
        const d = iso ? new Date(iso) : new Date();
        if (isNaN(d)) return '';
        return d.toLocaleString('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }

    let lagrer = false;
    async function lagre() {
        if (lagrer) return false;
        const liste = endrede();
        if (!liste.length) {
            visStatus('Ingen endringer å lagre.');
            return true;
        }

        const navn = ui.navn.value.trim();
        if (!navn) {
            visStatus('Skriv inn navnet ditt før du lagrer. Navnet står i loggen sammen med endringen.', 'feil');
            ui.navn.focus();
            return false;
        }
        skrivLokalt(LAGER_NAVN, navn);
        const endringer = liste.map(b => ({ id: b.id, innhold: lesEditor(b), grunnlag: b.info ? b.info.tidspunkt : null }));

        lagrer = true;
        ui.lagre.disabled = true;
        visStatus('Lagrer …');
        try {
            const svar = await sendEndringer(navn, endringer);
            liste.forEach((b, i) => {
                b.grunnlinje = endringer[i].innhold;
                b.info = (svar.data && svar.data[b.id]) || { innhold: endringer[i].innhold, navn: navn, tidspunkt: null };
                visTekst(b, endringer[i].innhold);
            });

            const konflikter = svar.konflikter || [];
            if (konflikter.length) {
                const hvem = konflikter.map(k => k.navn + ' (' + klokkeslett(k.tidspunkt) + ')').join(', ');
                visStatus('Lagret. Merk: ' + hvem + ' lagret også endringer i ' +
                    (konflikter.length === 1 ? 'samme tekst' : 'de samme tekstene') +
                    ' mens du redigerte. Din versjon gjelder nå. Den andre versjonen finner du under «Historikk».', 'advarsel');
            } else {
                visStatus((liste.length === 1 ? '1 tekst' : liste.length + ' tekster') + ' lagret kl. ' +
                    new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }) + '.', 'ok');
            }
            return true;
        } catch (e) {
            visStatus('Kunne ikke lagre (' + e.message + '). Endringene er IKKE lagret. Prøv igjen.', 'feil');
            return false;
        } finally {
            lagrer = false;
            ui.lagre.disabled = false;
        }
    }

    // ------------------------------------------------------------ Historikk
    function visHistorikk(boks) {
        const overlay = document.createElement('div');
        overlay.className = 'red-historikk-overlay';
        overlay.innerHTML =
            '<div class="red-historikk-dialog" role="dialog" aria-modal="true" aria-labelledby="redHistorikkTittel">' +
            '  <div class="red-historikk-topp">' +
            '    <h2 id="redHistorikkTittel">Tidligere versjoner</h2>' +
            '    <button type="button" class="red-knapp red-lukk" aria-label="Lukk">✕</button>' +
            '  </div>' +
            '  <p class="red-historikk-id"></p>' +
            '  <div class="red-historikk-liste"><p>Henter versjoner …</p></div>' +
            '</div>';
        document.body.appendChild(overlay);
        overlay.querySelector('.red-historikk-id').textContent = 'Tekst-id: ' + boks.id;
        const liste = overlay.querySelector('.red-historikk-liste');

        function lukk() {
            overlay.remove();
            document.removeEventListener('keydown', vedTast, true);
            if (boks.editor) boks.editor.focus();
        }
        function vedTast(e) {
            if (e.key === 'Escape') { e.stopPropagation(); lukk(); }
        }
        overlay.querySelector('.red-lukk').addEventListener('click', lukk);
        overlay.addEventListener('click', e => { if (e.target === overlay) lukk(); });
        document.addEventListener('keydown', vedTast, true);
        overlay.querySelector('.red-lukk').focus();

        function versjon(tittel, html) {
            const rad = document.createElement('div');
            rad.className = 'red-versjon';
            const topp = document.createElement('div');
            topp.className = 'red-versjon-topp';
            const t = document.createElement('span');
            t.textContent = tittel;
            const knapp = document.createElement('button');
            knapp.type = 'button';
            knapp.className = 'red-knapp';
            knapp.textContent = 'Bruk denne';
            knapp.addEventListener('click', () => {
                if (boks.editor) {
                    boks.editor.setContents(boks.editor.clipboard.convert({ html: html, text: '' }), 'user');
                }
                lukk();
                visStatus('Versjonen er lagt inn i tekstboksen. Trykk «Lagre endringer» for å ta den i bruk.', 'ulagret');
            });
            topp.append(t, knapp);
            const innhold = document.createElement('div');
            innhold.className = 'red-versjon-innhold';
            innhold.innerHTML = html || '<em>(tom)</em>';
            rad.append(topp, innhold);
            return rad;
        }

        hentHistorikk(boks.id).then(versjoner => {
            liste.innerHTML = '';
            versjoner.forEach((v, i) => {
                liste.appendChild(versjon(klokkeslett(v.tidspunkt) + ' – ' + v.navn + (i === 0 ? ' (gjeldende)' : ''), rens(v.innhold, boks.type)));
            });
            if (!versjoner.length) {
                const p = document.createElement('p');
                p.textContent = 'Teksten er ikke endret ennå.';
                liste.appendChild(p);
            }
            liste.appendChild(versjon('Opprinnelig tekst i kurset', boks.standard));
        }).catch(e => {
            liste.innerHTML = '';
            const p = document.createElement('p');
            p.textContent = 'Kunne ikke hente versjonene (' + e.message + ').';
            liste.appendChild(p);
        });
    }

    // =========================================================================
    // Oppstart
    // =========================================================================
    function start() {
        finnBokser();

        if (INNBAKT) {
            brukData(INNBAKT);
            ferdigLastet();
            return;
        }

        lagPanel();
        ui.bryter.disabled = true;
        visStatus('Henter tekster …');

        window.addEventListener('beforeunload', e => {
            if (redigerer && endrede().length) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        hentTekster().then(data => {
            hentetFraArk = true;
            brukData(data);
            ferdigLastet();
            ui.bryter.disabled = false;
            visStatus('');
            if (lesLokalt(LAGER_MODUS) === 'rediger') {
                ui.bryter.checked = true;
                startRedigering();
            }
        }).catch(e => {
            oppdaterSeksjoner();
            ferdigLastet();
            ui.bryter.disabled = false;
            visStatus('Fikk ikke hentet tekstene fra Google Sheets (' + e.message + '). Du ser kursets opprinnelige tekst, ' +
                'og redigering er slått av. Last siden på nytt for å prøve igjen.', 'feil');
        });
    }

    // Etter sidens egne DOMContentLoaded-lyttere (app.js setter bl.a. tittelen der)
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 0));
    else setTimeout(start, 0);
})();
