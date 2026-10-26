/* Reglas de cálculo del temario ADC (IVAO España).
   Fuente única de verdad para generadores de preguntas y para el mini-juego. */
(function (root) {
  'use strict';

  // ---------- Aeronaves ----------
  // wake: L, M, H, J (Super). speed: lenta, media, rapida, muyrapida
  // heavyWhenLeading: B757 se trata como pesado cuando va delante
  const AIRCRAFT = [
    { t: 'C172', name: 'Cessna 172', wake: 'L', speed: 'lenta', kind: 'pistón' },
    { t: 'P28A', name: 'Piper PA-28', wake: 'L', speed: 'lenta', kind: 'pistón' },
    { t: 'SR22', name: 'Cirrus SR22', wake: 'L', speed: 'lenta', kind: 'pistón' },
    { t: 'DA42', name: 'Diamond DA42', wake: 'L', speed: 'lenta', kind: 'pistón bimotor' },
    { t: 'TB20', name: 'Socata TB20', wake: 'L', speed: 'lenta', kind: 'pistón' },
    { t: 'EC35', name: 'Airbus H135', wake: 'L', speed: 'lenta', kind: 'helicóptero' },
    { t: 'BE20', name: 'King Air 200', wake: 'L', speed: 'media', kind: 'turbohélice' },
    { t: 'PC12', name: 'Pilatus PC-12', wake: 'L', speed: 'media', kind: 'turbohélice' },
    { t: 'AT72', name: 'ATR 72', wake: 'M', speed: 'media', kind: 'turbohélice' },
    { t: 'AT76', name: 'ATR 72-600', wake: 'M', speed: 'media', kind: 'turbohélice' },
    { t: 'DH8D', name: 'Dash 8 Q400', wake: 'M', speed: 'media', kind: 'turbohélice' },
    { t: 'C130', name: 'C-130 Hercules', wake: 'M', speed: 'media', kind: 'turbohélice' },
    { t: 'CRJ9', name: 'CRJ-900', wake: 'M', speed: 'rapida', kind: 'reactor' },
    { t: 'E190', name: 'Embraer 190', wake: 'M', speed: 'rapida', kind: 'reactor' },
    { t: 'A320', name: 'Airbus A320', wake: 'M', speed: 'rapida', kind: 'reactor' },
    { t: 'A321', name: 'Airbus A321', wake: 'M', speed: 'rapida', kind: 'reactor' },
    { t: 'B738', name: 'Boeing 737-800', wake: 'M', speed: 'rapida', kind: 'reactor' },
    { t: 'B752', name: 'Boeing 757-200', wake: 'M', speed: 'rapida', kind: 'reactor', heavyWhenLeading: true },
    { t: 'A400', name: 'Airbus A400M', wake: 'H', speed: 'media', kind: 'turbohélice' },
    { t: 'B763', name: 'Boeing 767-300', wake: 'H', speed: 'rapida', kind: 'reactor' },
    { t: 'A332', name: 'Airbus A330-200', wake: 'H', speed: 'rapida', kind: 'reactor' },
    { t: 'A359', name: 'Airbus A350-900', wake: 'H', speed: 'rapida', kind: 'reactor' },
    { t: 'B788', name: 'Boeing 787-8', wake: 'H', speed: 'rapida', kind: 'reactor' },
    { t: 'B744', name: 'Boeing 747-400', wake: 'H', speed: 'rapida', kind: 'reactor' },
    { t: 'B77W', name: 'Boeing 777-300ER', wake: 'H', speed: 'rapida', kind: 'reactor' },
    { t: 'A388', name: 'Airbus A380', wake: 'J', speed: 'rapida', kind: 'reactor' },
    { t: 'EUFI', name: 'Eurofighter', wake: 'M', speed: 'muyrapida', kind: 'caza' },
    { t: 'F18', name: 'F/A-18 Hornet', wake: 'M', speed: 'muyrapida', kind: 'caza' }
  ];
  const WAKE_RANK = { L: 0, M: 1, H: 2, J: 3 };
  const WAKE_NAME = { L: 'Ligera', M: 'Media', H: 'Pesada', J: 'Super' };
  const SPEED_NAME = { lenta: 'Lenta', media: 'Media', rapida: 'Rápida', muyrapida: 'Muy rápida' };

  function leadingWake(ac) { return ac.heavyWhenLeading ? 'H' : ac.wake; }

  // ---------- Estela en salida ----------
  // devuelve minutos (0 = no aplica). Pesada tras pesada desde intersección: la wiki
  // indica que aplica pero no da valor -> se excluye de los generadores (null).
  const DEP_WAKE = { 'L>M': 2, 'L>H': 2, 'L>J': 3, 'M>H': 2, 'M>J': 3, 'H>J': 2 };
  function depWake(first, second, fromIntersection) {
    const f = leadingWake(first), s = second.wake;
    if (WAKE_RANK[s] >= WAKE_RANK[f]) {
      if (fromIntersection && s === 'H' && f === 'H') return null; // ambiguo en la fuente
      return 0;
    }
    const base = DEP_WAKE[s + '>' + f];
    return fromIntersection ? base + 1 : base;
  }

  // ---------- Salidas IFR sucesivas (tabla genérica IVAO-ES) ----------
  // devuelve {min, nm} o {sujeta:true}
  function successive(first, second) {
    const f = first.speed, s = second.speed;
    if (s === 'muyrapida') return { sujeta: true };
    if (f === 'muyrapida') return { min: 2, nm: 4 };
    if (f === 'rapida') {
      if (s === 'rapida') return { min: 2, nm: 4 };
      if (s === 'media') return { min: 1.5, nm: 3 };
      return { min: 1.5, nm: 2 };
    }
    if (f === 'media') {
      if (s === 'rapida') return { sujeta: true };
      if (s === 'media') return { min: 2, nm: 3 };
      return { min: 1.5, nm: 2 };
    }
    return { sujeta: true }; // tras lenta
  }

  // ---------- Estela en llegada ----------
  const ARR_WAKE = {
    'L>M': [3, 5], 'L>H': [3, 6], 'L>J': [4, 8],
    'M>H': [2, 5], 'M>J': [3, 7],
    'H>H': [null, 4], 'H>J': [null, 6]
  };
  // radar=true -> NM ; false -> minutos. 0 = no aplica
  function arrWake(first, second, radar) {
    const f = leadingWake(first), s = second.wake;
    const row = ARR_WAKE[s + '>' + f];
    if (!row) return 0;
    const v = radar ? row[1] : row[0];
    return v == null ? 0 : v;
  }

  // ---------- Nivel de transición ----------
  const TRL_BANDS = [[942, 959], [960, 977], [978, 995], [996, 1013], [1014, 1031], [1032, 1050]];
  const TRL_TABLE = { 6000: [90, 85, 80, 75, 70, 65], 8000: [110, 105, 100, 95, 90, 85], 13000: [160, 155, 150, 145, 140, 135] };
  function trl(qnh, ta) {
    const i = TRL_BANDS.findIndex(b => qnh >= b[0] && qnh <= b[1]);
    if (i < 0) return null;
    return TRL_TABLE[ta][i];
  }
  const TA_PLACES = [
    { name: 'Bilbao (LEBB)', ta: 6000 }, { name: 'Valencia (LEVC)', ta: 6000 }, { name: 'Gran Canaria (GCLP)', ta: 6000 },
    { name: 'Palma (LEPA)', ta: 6000 }, { name: 'Sevilla (LEZL)', ta: 6000 }, { name: 'Santiago (LEST)', ta: 6000 },
    { name: 'Málaga (LEMG)', ta: 13000 }, { name: 'Madrid-Barajas (LEMD), TMA Madrid', ta: 13000 },
    { name: 'Granada (LEGR)', ta: 7000 }, { name: 'La Seu d\'Urgell (LESU)', ta: 8000 }
  ];

  // ---------- VMC / SVFR / LVP ----------
  function aerodromeVMC(visM, ceilingFt) { return visM >= 5000 && (ceilingFt == null || ceilingFt >= 1500); }
  function svfrPossible(visM, ceilingFt, night) { return !night && visM >= 1500 && (ceilingFt == null || ceilingFt >= 600); }
  function lvpStart(rvr, ceilingFt, visM) {
    return (rvr != null && rvr <= 800) || (ceilingFt != null && ceilingFt <= 250) || (visM != null && visM <= 500);
  }

  // ---------- Fonética y números ----------
  const DIG = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const HUND = { 1: 'cien', 2: 'doscientos', 3: 'trescientos', 4: 'cuatrocientos', 5: 'quinientos', 6: 'seiscientos', 7: 'setecientos', 8: 'ochocientos', 9: 'novecientos' };
  const THOU = { 1: 'mil', 2: 'dos mil', 3: 'tres mil', 4: 'cuatro mil', 5: 'cinco mil', 6: 'seis mil', 7: 'siete mil', 8: 'ocho mil', 9: 'nueve mil' };
  const digits = s => String(s).split('').map(d => DIG[+d]).join(' ');
  function sayFL(fl) {
    if (fl % 100 === 0) return 'nivel de vuelo ' + HUND[fl / 100];
    return 'nivel de vuelo ' + digits(fl);
  }
  function sayAltitude(ft) {
    const th = Math.floor(ft / 1000), h = Math.floor((ft % 1000) / 100);
    let s = th >= 10 ? digits(th) + ' mil' : THOU[th];
    if (h) s += ' ' + HUND[h].replace('cien', 'cien');
    return s + ' pies';
  }
  function sayQNH(q) { return q === 1000 ? 'QNH mil' : 'QNH ' + digits(q); }
  function saySquawk(c) {
    const s = String(c).padStart(4, '0');
    if (/^[1-7]000$/.test(s)) return THOU[+s[0]];
    return digits(s);
  }
  function sayHeading(h) { return 'rumbo ' + digits(String(h).padStart(3, '0')); }
  function sayRunway(r) {
    const m = /^(\d{1,2})([LCR]?)$/.exec(r); const n = m[1].padStart(2, '0');
    const side = { L: ' izquierda', C: ' centro', R: ' derecha', '': '' }[m[2]];
    return 'pista ' + digits(n) + side;
  }

  // ---------- Clases de espacio aéreo ----------
  // ¿Quién proporciona separación entre a y b ('IFR'|'VFR') en la clase?
  function separatedByATC(cls, a, b) {
    const pair = [a, b].sort().join('-');
    switch (cls) {
      case 'A': return pair === 'IFR-IFR';
      case 'B': return true;
      case 'C': return pair !== 'VFR-VFR';
      case 'D': case 'E': return pair === 'IFR-IFR';
      default: return false;
    }
  }

  // ---------- Alerta ----------
  const ALERT_CASES = [
    ['No hay comunicación en los 30 minutos siguientes a la hora en que debía recibirse', 'INCERFA'],
    ['La aeronave no llega en los 30 minutos siguientes a su hora prevista de llegada', 'INCERFA'],
    ['Autorizada a aterrizar, no aterriza en los 5 minutos siguientes a la hora prevista y no responde', 'ALERFA'],
    ['Se sospecha que la aeronave es objeto de interferencia ilícita', 'ALERFA'],
    ['Informes de funcionamiento anormal, sin que sea probable un aterrizaje forzoso', 'ALERFA'],
    ['Tras la incertidumbre, las averiguaciones no dan noticias de la aeronave', 'ALERFA'],
    ['Se considera que el combustible se ha agotado', 'DETRESFA'],
    ['Funcionamiento tan anormal que es probable un aterrizaje forzoso', 'DETRESFA'],
    ['Se sabe que la aeronave ha efectuado un aterrizaje forzoso', 'DETRESFA'],
    ['Tras la fase de alerta, las nuevas tentativas de comunicación siguen siendo infructuosas', 'DETRESFA']
  ];

  const API = {
    AIRCRAFT, WAKE_RANK, WAKE_NAME, SPEED_NAME, leadingWake,
    depWake, successive, arrWake, trl, TRL_BANDS, TRL_TABLE, TA_PLACES,
    aerodromeVMC, svfrPossible, lvpStart,
    digits, sayFL, sayAltitude, sayQNH, saySquawk, sayHeading, sayRunway,
    separatedByATC, ALERT_CASES
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.ADC_RULES = API;
})(typeof window !== 'undefined' ? window : globalThis);
