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
  "exportedAt": "2026-09-18T10:43:00.925Z",
  "meta": {
    "id": "scenario - NIV Optimale kurver",
    "title": "NIV Optimale kurver",
    "description": "NIV Optimale kurver",
    "author": "Petter",
    "learningObjectives": [
      "Kjenne til optimale kurver ved NIV"
    ],
    "answerKey": {
      "optimalSettings": "",
      "expectedResponse": "",
      "notes": ""
    }
  },
  "initialState": {
    "machine": {
      "mode": "PS",
      "ipap": 10,
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
      "trigger": 1.5,
      "cycling": 25,
      "tiMax": 2,
      "riseTime": 150,
      "leak": 0
    },
    "patient": {
      "height": 175,
      "gender": "male",
      "compliance": 100,
      "resistance": 3,
      "rrSpont": 20,
      "pmus": 3,
      "responsiveness": 50,
      "responsivePmus": false,
      "pmusOffset": 0,
      "tiNeural": 1,
      "kobleTiNeural": false,
      "triseNeural": 0.2,
      "tholdNeural": 0.35,
      "tdecayNeural": 0.6,
      "pmusExp": 0,
      "recoil": 0,
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
      "alarmHighVt": 800,
      "alarmLowRr": 0,
      "alarmHighRr": 30,
      "alarmHighPpeak": 40
    }
  },
  "uiConfig": {
    "visibleControls": [
      "ipap",
      "epap",
      "cycling",
      "trigger",
      "riseTime",
      "fio2",
      "apneaDelay",
      "alarmLeak",
      "alarmLowVt",
      "alarmHighVt",
      "alarmLowRr",
      "alarmHighRr",
      "alarmHighPpeak"
    ],
    "controls": [
      {
        "key": "ipap",
        "group": "machine",
        "label": "IPAP / inspiratorisk trykk",
        "type": "range",
        "unit": "cmH₂O",
        "default": 10,
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
        "key": "cycling",
        "group": "machine",
        "label": "Inspiratorisk avslutning (cycling)",
        "type": "range",
        "unit": "%",
        "default": 25,
        "min": 5,
        "max": 90,
        "step": 5
      },
      {
        "key": "trigger",
        "group": "machine",
        "label": "Triggersensitivitet (flow)",
        "type": "range",
        "unit": "L/min",
        "default": 1.5,
        "min": 1,
        "max": 5,
        "step": 0.5
      },
      {
        "key": "riseTime",
        "group": "machine",
        "label": "Stigetid",
        "type": "range",
        "unit": "ms",
        "default": 150,
        "min": 50,
        "max": 900,
        "step": 25
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
        "key": "apneaDelay",
        "group": "alarms",
        "label": "Apnétid",
        "type": "range",
        "unit": "s",
        "default": 20,
        "min": 5,
        "max": 30,
        "step": 1
      },
      {
        "key": "alarmLeak",
        "group": "alarms",
        "label": "Lekkasje, maks",
        "type": "range",
        "unit": "L/min",
        "default": 40,
        "min": 10,
        "max": 60,
        "step": 5
      },
      {
        "key": "alarmLowVt",
        "group": "alarms",
        "label": "Tidevolum, min",
        "type": "range",
        "unit": "ml",
        "default": 300,
        "min": 100,
        "max": 600,
        "step": 10
      },
      {
        "key": "alarmHighVt",
        "group": "alarms",
        "label": "Tidevolum, maks",
        "type": "range",
        "unit": "ml",
        "default": 800,
        "min": 300,
        "max": 1000,
        "step": 10
      },
      {
        "key": "alarmLowRr",
        "group": "alarms",
        "label": "Frekvens, min (0 = av)",
        "type": "range",
        "unit": "/min",
        "default": 0,
        "min": 0,
        "max": 25,
        "step": 1
      },
      {
        "key": "alarmHighRr",
        "group": "alarms",
        "label": "Frekvens, maks",
        "type": "range",
        "unit": "/min",
        "default": 30,
        "min": 20,
        "max": 50,
        "step": 1
      },
      {
        "key": "alarmHighPpeak",
        "group": "alarms",
        "label": "Topptrykk, maks",
        "type": "range",
        "unit": "cmH₂O",
        "default": 40,
        "min": 10,
        "max": 50,
        "step": 1
      }
    ]
  }
};
