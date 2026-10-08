/**
 * meny-data.js — alle tekster og scenarier i hovedmenyen.
 *
 * Endre menyen her, ikke i meny.js. Dataene ligger i en .js-fil (ikke .json)
 * fordi fetch() ikke virker når index.html åpnes rett fra disk (file://).
 *
 * Scenariene:
 *   id          unik id, brukes i plassholdersidens adresse (?id=…)
 *   tema        etiketten øverst på kortet
 *   tittel      overskriften på kortet (norske tegn går fint her)
 *   beskrivelse 1–2 setninger om hva deltakeren skal se etter
 *   mappe       scenariomappen, med / til slutt. Kun a–z, 0–9 og bindestrek.
 *   gruppe      'problem' = rutenettet øverst, 'referanse' = under skillelinjen
 *   klar        false = dummy (plassholderside), true = ekte scenario i mappen
 *
 * Rekkefølgen i listen er rekkefølgen i menyen.
 *
 * Et avsnitt i innledningen kan være en tekst, eller en liste med deler der
 * { fet: '…' } gir fet skrift.
 */
window.MENY_DATA = {
    tittel: 'NIV – samspill mellom pasient og respirator',

    innledningOverskrift: 'Velkommen til scenariene om NIV',
    innledning: [
        'I disse scenariene øver du på å gjenkjenne vanlige problemer i samspillet mellom pasient og ' +
        'respirator ved non-invasiv ventilasjon (NIV). Hvert scenario starter med en innstilling som ' +
        'gir et bestemt problem. Studer kurvene og måleverdiene, finn ut hva som er galt, og juster ' +
        'innstillingene til samspillet blir bedre.',
        [
            'Du kan ta scenariene i den rekkefølgen du vil. Begynn gjerne med ',
            { fet: 'Frisk pasient – optimale innstillinger' },
            ', så vet du hvordan kurvene ser ut når alt fungerer.'
        ]
    ],

    merknad: 'Scenariene er laget for PC med mus.',

    kortLenketekst: 'Åpne scenario →',
    ikkeKlarMerke: 'Ikke lagt inn ennå',
    plassholderTekst: 'Dette scenariet er ikke lagt inn ennå.',

    veiledningOverskrift: 'Slik bruker du scenariene',
    veiledning: [
        { overskrift: 'Velg et scenario', tekst: 'Klikk på et kort i hovedmenyen. Scenariet åpnes her i vinduet.' },
        { overskrift: 'Les kurvene', tekst: 'Øverst ser du luftveistrykk (Paw), flow og volum. Knappen «Vis muskelinnsats (Pes)» viser i tillegg pasientens egen pusteinnsats.' },
        { overskrift: 'Les måleverdiene', tekst: 'Til høyre ser du måleverdier og en vurdering av samspillet mellom pasient og respirator.' },
        { overskrift: 'Juster innstillingene', tekst: 'Under «Respiratorinnstillinger» justerer du parameterne i scenariet. Endringen vises i kurvene etter noen pust.' },
        { overskrift: 'Info', tekst: 'Knappen «Info» forteller hva scenariet handler om, og gir deg fasit når du er klar.' },
        { overskrift: 'Pause / Frys og Nullstill', tekst: 'Pause / Frys stopper kurvene så du kan studere dem. Nullstill setter scenariet tilbake til start.' },
        { overskrift: 'Hovedmeny', tekst: 'Knappen «Hovedmeny» øverst til venstre tar deg tilbake hit, så du kan velge et nytt scenario.' },
        { overskrift: '', tekst: 'Scenariene er laget for PC med mus og fungerer dårlig på mobil.' }
    ],

    scenarier: [
        {
            id: 'asynkroni-hoy-triggersensitivitet',
            tema: 'Trigger',
            tittel: 'Asynkroni – høy triggersensitivitet',
            beskrivelse: 'Pasient og respirator er ikke i takt. Se hvordan triggerinnstillingen påvirker om pasientens pustforsøk gir støtte.',
            mappe: 'scenarier/asynkroni-hoy-triggersensitivitet/',
            gruppe: 'problem',
            klar: true
        },
        {
            id: 'asynkroni-lav-sensitivitet',
            tema: 'Trigger',
            tittel: 'Asynkroni – lav triggersensitivitet',
            beskrivelse: 'Pasient og respirator er ikke i takt. Finn ut hva triggerinnstillingen gjør med samspillet.',
            mappe: 'scenarier/asynkroni-lav-sensitivitet/',
            gruppe: 'problem',
            klar: true
        },
        {
            id: 'for-kort-inspirasjonstid',
            tema: 'Inspirasjonstid',
            tittel: 'For kort inspirasjonstid',
            beskrivelse: 'Respiratoren avslutter innpusten før pasienten er ferdig. Se hvordan det viser seg i flow og volum.',
            mappe: 'scenarier/for-kort-inspirasjonstid/',
            gruppe: 'problem',
            klar: true
        },
        {
            id: 'for-lang-inspirasjonstid',
            tema: 'Inspirasjonstid',
            tittel: 'For lang inspirasjonstid',
            beskrivelse: 'Respiratoren fortsetter innpusten etter at pasienten vil puste ut. Se etter tegn på dette i kurvene.',
            mappe: 'scenarier/for-lang-inspirasjonstid/',
            gruppe: 'problem',
            klar: true
        },
        {
            id: 'for-kort-stigetid',
            tema: 'Stigetid',
            tittel: 'For kort stigetid',
            beskrivelse: 'Trykket bygger seg opp veldig raskt i starten av innpusten. Vurder hvordan det påvirker pasienten.',
            mappe: 'scenarier/for-kort-stigetid/',
            gruppe: 'problem',
            klar: true
        },
        {
            id: 'for-lang-stigetid',
            tema: 'Stigetid',
            tittel: 'For lang stigetid',
            beskrivelse: 'Trykket bygger seg opp sakte, og pasienten får for lite flow tidlig i innpusten.',
            mappe: 'scenarier/for-lang-stigetid/',
            gruppe: 'problem',
            klar: true
        },
        {
            id: 'niv-frisk-optimal',
            tema: 'Referanse',
            tittel: 'Frisk pasient – optimale innstillinger',
            beskrivelse: 'Godt samspill mellom pasient og respirator. Bruk scenariet til å se hvordan kurvene ser ut når alt fungerer.',
            mappe: 'scenarier/niv-frisk-optimal/',
            gruppe: 'referanse',
            klar: true
        }
    ]
};
