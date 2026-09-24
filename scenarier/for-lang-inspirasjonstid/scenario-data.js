/**
 * scenario-data.js — AUTOGENERERT av bygg-scenario-data.js. Ikke rediger for hånd.
 * Kilde: scenario.json
 *
 * Denne filen har forrang: finnes den, bruker spilleren den i stedet for å
 * hente scenario.json. Kjør skriptet på nytt etter endringer i scenario.json,
 * eller slett filen for å la spilleren hente JSON-en over nett.
 */
window.SCENARIO_DATA = {
  "schemaVersion": "1.0",
  "generator": "Respirator Scenario-Generator",
  "exportedAt": "2026-09-21T08:38:06.502Z",
  "meta": {
    "id": "for_lang_inspirasjonstid",
    "title": "For lang inspirasjonstid",
    "description": "Inspirasjonstiden er for lang, pasienten gir et forsøk på å avslutte inspirasjonen. Pasientens forssøk på avslutte inspirasjonen sees ved at trykk kurven får en positiv økning i slutten av inspirasjonen. Flow-kurven kan også vise et dropp i flow i det pasienten forsøker å puste ut.",
    "author": "Petter",
    "learningObjectives": [
      "Gjenkjenne for lang inspirasjonstid."
    ],
    "answerKey": {
      "optimalSettings": "Optimale innstillinger vil i dette tilfellet være 30% inspiratorisk avslutning.",
      "expectedResponse": "Når optimal innstilling er satt (30%) vil trykkøkningen i slutten av trykk-kurven flate ut. Hvis aktuelt vil også flow-kurven få et jevnt fall før ekspirasjon.",
      "notes": "30% avslutning (cykling) er fasit"
    }
  },
  "initialState": {
    "machine": {
      "mode": "PS",
      "ipap": 12,
      "epap": 5,
      "vcTidalVolume": 500,
      "vcPeakFlow": 60,
      "vcFlowPattern": "constant",
      "inspPause": 0,
      "tiSet": 1,
      "backupRate": 12,
      "stActive": false,
      "fio2": 30,
      "rr": 12,
      "triggerMode": "flow",
      "trigger": 3,
      "cycling": 5,
      "tiMax": 2,
      "riseTime": 150,
      "leak": 0
    },
    "patient": {
      "height": 175,
      "gender": "male",
      "compliance": 76,
      "resistance": 4,
      "rrSpont": 14,
      "pmus": 2.5,
      "responsiveness": 50,
      "responsivePmus": false,
      "pmusOffset": 0,
      "tiNeural": 1,
      "kobleTiNeural": false,
      "triseNeural": 0.3,
      "tholdNeural": 0.4,
      "tdecayNeural": 0.1,
      "pmusExp": 0,
      "recoil": 25,
      "flowLimitation": 0,
      "criticalClosingPressure": 0,
      "flowConductance": 1,
      "peepStenting": 0,
      "expRatio": 1.2,
      "variability": 0,
      "cardiacArtifact": 0,
      "stressIndex": 1,
      "stressIndexEnabled": false,
      "uip": 30,
      "uipEnabled": false,
      "airwayOpening": 0,
      "recruitedVolume": 0,
      "entrainmentRatio": 1,
      "entrainmentEnabled": false
    },
    "alarms": {
      "apneaDelay": 20,
      "alarmLeak": 40,
      "alarmLowVt": 300,
      "alarmHighVt": 1000,
      "alarmLowRr": 0,
      "alarmHighRr": 30,
      "alarmHighPpeak": 40
    }
  },
  "uiConfig": {
    "visibleControls": [
      "ipap",
      "epap",
      "fio2",
      "cycling",
      "kobleTiNeural"
    ],
    "controls": [
      {
        "key": "ipap",
        "group": "machine",
        "label": "IPAP / inspiratorisk trykk",
        "type": "range",
        "unit": "cmH₂O",
        "default": 12,
        "min": 8,
        "max": 30,
        "step": 1
      },
      {
        "key": "epap",
        "group": "machine",
        "label": "EPAP / PEEP",
        "type": "range",
        "unit": "cmH₂O",
        "default": 5,
        "min": 3,
        "max": 15,
        "step": 1
      },
      {
        "key": "fio2",
        "group": "machine",
        "label": "FiO₂",
        "type": "range",
        "unit": "%",
        "default": 30,
        "min": 21,
        "max": 100,
        "step": 1
      },
      {
        "key": "cycling",
        "group": "machine",
        "label": "Cycling / E-sense",
        "type": "range",
        "unit": "%",
        "default": 5,
        "min": 5,
        "max": 90,
        "step": 5
      },
      {
        "key": "kobleTiNeural",
        "group": "patient",
        "label": "Utled innsatsform fra Ti_neural",
        "type": "checkbox",
        "unit": null,
        "default": false
      }
    ]
  }
};
