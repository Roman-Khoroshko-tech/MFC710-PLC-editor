/* Terminology and page references extracted from the user-supplied OP-11 manuals, edition 8.1. */
const MANUAL_LOCALES={
 "en": {
  "edition": "8.1",
  "file": "dtr-mfc710-op11-en.pdf",
  "pages": {
   "26": [
    25
   ],
   "27": [
    26
   ],
   "61": [
    58
   ],
   "64": [
    61
   ],
   "65": [
    62
   ],
   "66": [
    63
   ],
   "67": [
    63
   ],
   "73": [
    68
   ],
   "74": [
    69
   ],
   "75": [
    70
   ],
   "76": [
    71
   ],
   "77": [
    72
   ],
   "78": [
    73
   ],
   "79": [
    74
   ],
   "80": [
    75
   ],
   "81": [
    76
   ],
   "91": [
    82
   ],
   "105": [
    92
   ],
   "107": [
    93,
    94
   ],
   "108": [
    94,
    95
   ],
   "109": [
    95
   ]
  },
  "pch": {
   "0": "Switch Off",
   "1": "In.C1",
   "2": "In.C2",
   "3": "In.C3",
   "4": "In.C4",
   "5": "In.C5",
   "6": "In.C6",
   "7": "Switch on",
   "8": "F1",
   "9": "F2",
   "10": "F3",
   "20": "Failure AI0",
   "21": "Failure AI1",
   "22": "Failure AI2",
   "30": "Remote start",
   "31": "Local start",
   "32": "RS start",
   "33": "Remote reverse",
   "34": "Local reverse",
   "35": "Ref.-unit sign",
   "36": "Below f_stop",
   "37": "START",
   "38": "Reverse",
   "39": "A/B control",
   "40": "Enable RS",
   "41": "Operation permission",
   "42": "Fconst is active",
   "59": "PUMP 6",
   "60": "K_ZERO",
   "61": "OPERATION",
   "62": "READY",
   "63": "FAILURE",
   "64": "NOT FAILURE",
   "65": "WARNING",
   "66": "FAIL. or WARN.",
   "67": "Motor windings drying",
   "68": "Threshold 1",
   "69": "Threshold 2",
   "70": "",
   "71": "Temperature",
   "72": "",
   "73": "BLOCKING",
   "74": "Limitation of current",
   "75": "Brake",
   "76": "PUMP 1",
   "77": "PUMP 2",
   "78": "PUMP 3",
   "79": "PUMP 4",
   "80": "PUMP 5",
   "81": "Relay 1",
   "82": "Relay 2",
   "83": "Relay 3",
   "84": "Relay 4",
   "90": "Timer 50 ms",
   "91": "Timer 1s",
   "92": "Timer 1min",
   "93": "Timer 1 hour (t.1hour)",
   "125": "RSTout",
   "126": "NULL",
   "127": "NOT NULL",
   "133": "Keyboard ref.-unit",
   "134": "Input A0",
   "135": "Input A1",
   "136": "Input A2",
   "137": "PID Output",
   "138": "Моtopotentiometer",
   "139": "RS ref.-unit",
   "140": "Additional motopot.",
   "141": "PID motopot.",
   "142": "RS PID ref.-unit",
   "143": "PID keyboard",
   "144": "Value A0",
   "145": "Value A1",
   "146": "Value A2",
   "147": "100%",
   "148": "RC Output",
   "149": "ABS rotations percent",
   "150": "Rotations percent",
   "151": "Frequency percent",
   "152": "Current percent",
   "153": "ABS torque percent",
   "154": "Torque percent",
   "155": "Power percent",
   "156": "Motor voltage percent",
   "157": "PID error",
   "158": "PID ref.-unit",
   "159": "Motor temperature",
   "160": "PID Input",
   "161": "FR ref.-unit",
   "162": "N of the process",
   "163": "Torque ref.-unit",
   "164": "Ref.-unit А",
   "165": "Ref.-unit В",
   "166": "Ref.-unit",
   "167": "ABS ref.-unit",
   "168": "Fconst 1",
   "169": "Fconst 2",
   "170": "Fconst 3",
   "171": "Fconst 4",
   "172": "Fconst 5",
   "173": "Fconst 6",
   "174": "Fconst 7",
   "175": "Freq Last",
   "176": "f Ramp ABS percent",
   "177": "Lrot",
   "178": "UR1",
   "179": "UR2",
   "180": "UR3",
   "181": "UR4",
   "182": "fzA_percent",
   "183": "fzB_percent",
   "184": "fz_percent",
   "185": "f",
   "186": "fz%(1)",
   "187": "Fz%(2)",
   "188": "Fmin of the ref.-unit",
   "189": "Fmax of the ref.-unit",
   "190": "RTCmin",
   "191": "RTCdoy",
   "192": "RTCdom",
   "193": "pump",
   "194": "motor",
   "195": "motor windings drying",
   "198": "r.n%",
   "199": "|z n%|",
   "206": "f.code",
   "207": "w.code",
   "218": "d wind",
   "222": "f InC3",
   "223": "f InC4",
   "224": "f InC5",
   "225": "f InC6",
   "228": "outPIn",
   "229": "T ref",
   "238": "ENCpos",
   "239": "ENCref",
   "240": "ENCdif",
   "256": "UNIT number 1",
   "257": "UNIT number 2",
   "304": "SEQUENSER",
   "305": "SEQUENSER",
   "312": "SEQUENSER",
   "313": "MULTIPLEXER 1",
   "314": "MULTIPLEXER 2",
   "315": "Output CSU",
   "320": "CONST. 1",
   "321": "CONST. 2"
  }
 },
 "pl": {
  "edition": "8.1",
  "file": "dtr-mfc710-op11-pl.pdf",
  "pages": {
   "26": [
    25
   ],
   "27": [
    26
   ],
   "61": [
    55
   ],
   "64": [
    57
   ],
   "65": [
    58
   ],
   "66": [
    58,
    59
   ],
   "67": [
    59
   ],
   "73": [
    63
   ],
   "74": [
    64
   ],
   "75": [
    65
   ],
   "76": [
    66
   ],
   "77": [
    67
   ],
   "78": [
    68
   ],
   "79": [
    69
   ],
   "80": [
    70
   ],
   "81": [
    71
   ],
   "91": [
    78
   ],
   "105": [
    87
   ],
   "107": [
    88,
    89
   ],
   "108": [
    89,
    90
   ],
   "109": [
    90
   ]
  },
  "pch": {
   "0": "Wylacz",
   "1": "We.C1",
   "2": "We.C2",
   "3": "We.C3",
   "4": "We.C4",
   "5": "We.C5",
   "6": "We.C6",
   "7": "Włącz",
   "8": "F1",
   "9": "F2",
   "10": "F3",
   "20": "Awaria We.A0",
   "21": "Awaria We.A1",
   "22": "Awaria We.A2",
   "30": "Start zdalny",
   "31": "Start lokalny",
   "32": "Start RS",
   "33": "Rewers zdalny",
   "34": "Rewers lokalny",
   "35": "Znak zadajnika",
   "36": "Poniżej f_stop",
   "37": "START",
   "38": "Rewers",
   "39": "Sterowanie AB",
   "40": "Enable RS",
   "41": "Zezwolenie pracy",
   "42": "Aktywne Fstale",
   "59": "POMPA 6",
   "60": "K_ZERO",
   "61": "PRACA",
   "62": "GOTOWY",
   "63": "AWARIA",
   "64": "",
   "65": "OSTRZEŻENIE",
   "66": "",
   "67": "Stan suszenia",
   "68": "Próg 1",
   "69": "Próg 2",
   "70": "Jest F zadana",
   "71": "Próg temperatury",
   "72": "Ostrzeżenie brak",
   "73": "BLOKADA",
   "74": "Ogranicz. prądu",
   "75": "Hamulec",
   "76": "POMPA 1",
   "77": "POMPA 2",
   "78": "POMPA 3",
   "79": "POMPA 4",
   "80": "POMPA 5",
   "81": "Przekaźnik 1",
   "82": "Przekaźnik 2",
   "83": "Przekaźnik 3",
   "84": "Przekaźnik 4",
   "90": "Zegar 50ms",
   "91": "Zegar 1s",
   "92": "Zegar 1min",
   "93": "Zegar 1h",
   "125": "RSTout",
   "126": "ZERO",
   "127": "NIE ZERO",
   "133": "Zadajnik Klawiatury",
   "134": "Wejście A0",
   "135": "Wejście A1",
   "136": "Wejście A2",
   "137": "Wyjście PID",
   "138": "Motopotencjometr",
   "139": "Zadajnik RS",
   "140": "Dodatk. motopot",
   "141": "Motopot. PID",
   "142": "Zadajnik PID RS",
   "143": "Klawiatura PID",
   "144": "Zad.A0",
   "145": "Zad.A1",
   "146": "Zad.A2",
   "147": "STO PROCENT",
   "148": "Wyjście KN",
   "149": "Obroty procent ABS",
   "150": "Obroty procent",
   "151": "Freq procent",
   "152": "Prąd procent",
   "153": "Moment procent ABS",
   "154": "Moment procent",
   "155": "Moc procent",
   "156": "U silnika procent",
   "157": "Uchyb PID",
   "158": "Zadajnik PID",
   "159": "Temperatura silnika",
   "160": "Wejście PID",
   "161": "Zadajnik SP",
   "162": "N Procesu",
   "163": "Zadajnik momentu",
   "164": "Zadajnik A",
   "165": "Zadajnik B",
   "166": "Zadajnik",
   "167": "Zadajnik ABS",
   "168": "F stała 1",
   "169": "F stała 2",
   "170": "F stała 3",
   "171": "F stała 4",
   "172": "F stała 5",
   "173": "F stała 6",
   "174": "F stała 7",
   "175": "Freq Last",
   "176": "F po Ramp procent",
   "177": "Lobr",
   "178": "ZU1",
   "179": "ZU2",
   "180": "ZU3",
   "181": "ZU4",
   "182": "fzA_procent",
   "183": "fzB_procent",
   "184": "fz_procent",
   "185": "F po Ramp",
   "186": "fz% (1)",
   "187": "fz% (2)",
   "188": "F min. zadajnika",
   "189": "F max zadajnika",
   "190": "RTCmin",
   "191": "RTCdzr",
   "192": "RTCdzm",
   "193": "Pompa",
   "194": "Silnik",
   "195": "Czas do końca",
   "198": "z n%",
   "199": "|z n%|",
   "206": "kod aw",
   "207": "kod os",
   "218": "d naw",
   "222": "f WeC3",
   "223": "f WeC4",
   "224": "f WeC5",
   "225": "f WeC6",
   "228": "reg. n",
   "229": "m ref",
   "238": "ENCpoz",
   "239": "ENCodn",
   "240": "ENCuch",
   "256": "BLOK nr 1",
   "257": "BLOK nr 2",
   "304": "SEKW. STAN 1",
   "305": "SEKW. STAN 2",
   "312": "SEKW NUMER SEQ",
   "313": "MULTIPLEXER 1",
   "314": "MULTIPLEXER 2",
   "315": "Wyjście BKK",
   "320": "STAŁA 1",
   "321": "STAŁA 2"
  }
 }
};
