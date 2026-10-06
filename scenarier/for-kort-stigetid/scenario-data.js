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
  "exportedAt": "2026-09-21T10:49:36.241Z",
  "meta": {
    "id": "for_kort_stigetid",
    "title": "For kort stigetid",
    "description": "For kort stigetid gir unødvendig høye trykk i begynnelsen av inspirasjonen.",
    "author": "Petter",
    "learningObjectives": [
      "Gjenkjenne for rask stigetid"
    ],
    "answerKey": {
      "optimalSettings": "Optimal stigetid vil være når trykk-kurven ikke lengre har en pigg i begynnelsen av inspirasjonen.",
      "expectedResponse": "Når stigetid økes vil man kunne se at piggen avtar og blir borte. Piggen er borte ved 150-200 ms.",
      "notes": ""
    }
  },
  "initialState": {
    "machine": {
      "mode": "PS",
      "ipap": 13,
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
      "trigger": 2,
      "cycling": 25,
      "tiMax": 2,
      "riseTime": 50,
      "leak": 0
    },
    "patient": {
      "height": 175,
      "gender": "male",
      "compliance": 50,
      "resistance": 10,
      "rrSpont": 20,
      "pmus": 2.5,
      "responsiveness": 50,
      "responsivePmus": false,
      "pmusOffset": 0,
      "tiNeural": 1,
      "kobleTiNeural": false,
      "triseNeural": 0.55,
      "tholdNeural": 0.1,
      "tdecayNeural": 0.25,
      "pmusExp": 6,
      "recoil": 5,
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
      "triggerMode",
      "cycling",
      "riseTime"
    ],
    "controls": [
      {
        "key": "ipap",
        "group": "machine",
        "label": "IPAP / inspiratorisk trykk",
        "type": "range",
        "unit": "cmH₂O",
        "default": 13,
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
        "key": "triggerMode",
        "group": "machine",
        "label": "Triggertype",
        "type": "buttons",
        "unit": null,
        "default": "flow",
        "options": [
          {
            "value": "flow",
            "label": "Flowtrigger"
          },
          {
            "value": "pressure",
            "label": "Trykktrigger"
          }
        ]
      },
      {
        "key": "cycling",
        "group": "machine",
        "label": "Inspiratorisk avslutning",
        "type": "range",
        "unit": "%",
        "default": 25,
        "min": 5,
        "max": 90,
        "step": 5
      },
      {
        "key": "riseTime",
        "group": "machine",
        "label": "Stigetid (rise time)",
        "type": "range",
        "unit": "ms",
        "default": 50,
        "min": 50,
        "max": 900,
        "step": 25
      }
    ]
  }
};
