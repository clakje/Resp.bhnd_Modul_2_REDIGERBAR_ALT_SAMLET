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
  "exportedAt": "2026-09-22T11:21:12.280Z",
  "meta": {
    "id": "for_lang_stigetid",
    "title": "For lang stigetid",
    "description": "Pasient med for lang stigetid, her må stigetid justeres for å unngå \"air hunger\"",
    "author": "Petter",
    "learningObjectives": [
      "Kjenne til asynkroni ved for lang stigetid og hvilke justeringer som må gjøres for å oppnå optimal stigetid."
    ],
    "answerKey": {
      "optimalSettings": "Stigetid på 125-175 gir optimal trykk-kurve",
      "expectedResponse": "Når stigetid justeres ned så vil trykk-kurven bli brattere ved starten av innpust. Justeres den for lavt til det tilkomme en unødvenig topp i trykk kurven før den flater ut som igjen er motsatt effekt av hva vi viser her. Ideell innstilling for stigetid er så kort som mulig uten at man får en \"pigg\" i begynnelsen av trykk kurven som igjen viser til for kort stigetid og gir dermed asynkroni forbudet med kort stigetid.",
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
      "riseTime": 400,
      "leak": 0
    },
    "patient": {
      "height": 175,
      "gender": "male",
      "compliance": 63,
      "resistance": 5,
      "rrSpont": 15,
      "pmus": 6,
      "responsiveness": 50,
      "responsivePmus": false,
      "pmusOffset": -0.05,
      "tiNeural": 1.2,
      "kobleTiNeural": false,
      "triseNeural": 0.4,
      "tholdNeural": 0.4,
      "tdecayNeural": 0.35,
      "pmusExp": 0,
      "recoil": 0,
      "flowLimitation": 0,
      "criticalClosingPressure": 0,
      "flowConductance": 1,
      "peepStenting": 0,
      "expRatio": 1,
      "variability": 0,
      "cardiacArtifact": 0,
      "stressIndex": 1,
      "stressIndexEnabled": false,
      "uip": 30,
      "uipEnabled": false,
      "airwayOpening": 0,
      "recruitedVolume": 0,
      "entrainmentRatio": 1,
      "entrainmentEnabled": false,
      "upperAirwayResistance": 0,
      "upperAirwayResistanceEnabled": false,
      "upperAirwayTurbulence": 0,
      "upperAirwayExpFraction": 30,
      "flowDemand": 15,
      "flowDemandEnabled": false
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
        "label": "Cycling / E-sense",
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
        "default": 400,
        "min": 50,
        "max": 900,
        "step": 25
      }
    ]
  }
};
