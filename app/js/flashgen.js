/* Flashcards generadas a partir de las reglas (rules.js) y de los datos del simulador.
   Cada generador devuelve { topic, front, back, g }. Se usan en el modo "Generadas" de Flashcards,
   que no pasa por las cajas Leitner: se registran aciertos por tipo de tarjeta. */
(function (root) {
  'use strict';
  const R = (typeof module !== 'undefined' && module.exports) ? require('./rules.js') : root.ADC_RULES;
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  const randint = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
  const pad = (n, w) => String(n).padStart(w, '0');
  const fmtMin = m => String(m).replace('.', ',') + ' min';
  const AC = R.AIRCRAFT.filter(a => a.kind !== 'helicóptero');
  const lbl = a => `${a.t} (${a.name})`;
  const WN = w => R.WAKE_NAME[w].toLowerCase();
  const F = {};

  F.depWake = rng => {
    let a, b, inter, v; do { a = pick(rng, AC); b = pick(rng, AC); inter = rng() < 0.35; v = R.depWake(a, b, inter); } while (v === null || a === b);
    return { topic: 'separaciones', g: 'Estela en salida', front: `Estela en SALIDA\n${lbl(b)} despega detrás de ${lbl(a)}${inter ? '\ndesde una intersección más adelantada' : '\ndesde la cabecera'}`,
      back: v ? `${fmtMin(v)}\n${R.WAKE_NAME[b.wake]} tras ${WN(R.leadingWake(a))}${a.heavyWhenLeading ? ' (B757 delante = pesado)' : ''}${inter ? ' (+1 min por intersección)' : ''}` : `No aplica\nLa segunda (${WN(b.wake)}) no es menor que la primera (${WN(R.leadingWake(a))})` };
  };
  F.arrWake = rng => {
    let a, b; do { a = pick(rng, AC.filter(x => x.speed !== 'muyrapida')); b = pick(rng, AC.filter(x => x.speed !== 'muyrapida')); } while (a === b);
    const radar = rng() < 0.5; const v = R.arrWake(a, b, radar);
    return { topic: 'separaciones', g: 'Estela en llegada', front: `Estela en LLEGADA (${radar ? 'radar' : 'convencional'})\n${lbl(b)} detrás de ${lbl(a)}`,
      back: v ? `${v} ${radar ? 'NM' : 'min'}\n${R.WAKE_NAME[b.wake]} tras ${WN(R.leadingWake(a))}` : 'No aplica\nLa segunda no es menor que la primera (pesada tras pesada solo aplica con radar: 4 NM)' };
  };
  F.successive = rng => {
    const a = pick(rng, AC), b = pick(rng, AC); const s = R.successive(a, b);
    return { topic: 'separaciones', g: 'Salidas sucesivas', front: `Salidas IFR sucesivas, misma SID (tabla genérica)\n1.ª ${lbl(a)} – ${R.SPEED_NAME[a.speed].toLowerCase()}\n2.ª ${lbl(b)} – ${R.SPEED_NAME[b.speed].toLowerCase()}`,
      back: s.sujeta ? 'SUJETA: pedir la suelta a APP\n(la 2.ª alcanzaría a la 1.ª, la 1.ª es lenta o la 2.ª muy rápida)' : `${fmtMin(s.min)} / ${s.nm} NM` };
  };
  F.trl = rng => {
    const p = pick(rng, R.TA_PLACES.filter(x => R.TRL_TABLE[x.ta])); const q = randint(rng, 960, 1045); const v = R.trl(q, p.ta);
    return { topic: 'altimetria', g: 'Nivel de transición', front: `${p.name}\nTA ${p.ta.toLocaleString('es-ES')} ft · QNH ${q}\n¿Nivel de transición?`, back: `FL${v}` };
  };
  F.ta = rng => { const p = pick(rng, R.TA_PLACES); return { topic: 'altimetria', g: 'Altitud de transición', front: `Altitud de transición de\n${p.name}`, back: `${p.ta.toLocaleString('es-ES')} ft` }; };
  F.vmc = rng => {
    const vis = pick(rng, [800, 1200, 1500, 2000, 3000, 4000, 5000, 6000, 8000, 10000]); const ceil = pick(rng, [null, 400, 500, 600, 800, 1000, 1200, 1500, 2000]); const night = rng() < 0.25;
    const vmc = R.aerodromeVMC(vis, ceil), sv = R.svfrPossible(vis, ceil, night);
    return { topic: 'meteorologia', g: 'VMC / SVFR', front: `${night ? 'De noche' : 'De día'} · visibilidad ${vis >= 10000 ? '≥ 10 km' : vis.toLocaleString('es-ES') + ' m'} · techo ${ceil == null ? 'sin techo' : ceil.toLocaleString('es-ES') + ' ft'}\n¿VFR en el aeródromo?`,
      back: vmc ? 'VMC: puede operar VFR\n(vis ≥ 5 000 m y techo ≥ 1 500 ft)' : sv ? 'Sin VMC; caben mínimos de VFR especial\n(de día, vis ≥ 1 500 m, techo ≥ 600 ft). El ATC no lo sugiere.' : `Sin VMC ni SVFR${night ? '\n(de noche no hay SVFR)' : '\n(vis < 1 500 m o techo < 600 ft)'}` };
  };
  F.lvp = rng => {
    const rvr = pick(rng, [null, 350, 550, 700, 800, 900, 1200]); const ceil = pick(rng, [150, 200, 250, 300, 500, 800]); const vis = pick(rng, [300, 500, 600, 800, 1500]);
    const on = R.lvpStart(rvr, ceil, vis);
    return { topic: 'meteorologia', g: 'LVP', front: `${rvr ? 'RVR ' + rvr + ' m' : 'Sin RVR'} · techo ${ceil} ft · visibilidad ${vis} m\n¿LVP?`, back: `${on ? 'Sí' : 'No'}\n(RVR ≤ 800 m, techo ≤ 250 ft o visibilidad ≤ 500 m: basta una)` };
  };
  const ALPHA = ['Alfa', 'Bravo', 'Charlie', 'Delta', 'Eco', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliett', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'X-ray', 'Yankee', 'Zulu'];
  F.phonetic = rng => {
    const reg = 'EC' + [0, 0, 0].map(() => String.fromCharCode(65 + randint(rng, 0, 25))).join('');
    return { topic: 'comunicaciones', g: 'Alfabeto', front: `Deletrea la matrícula\n${reg}`, back: reg.split('').map(c => ALPHA[c.charCodeAt(0) - 65]).join(' ') + `\nAbreviada (si la inicia el ATC): ${reg[0]}${reg.slice(-2)}` };
  };
  F.numbers = rng => {
    const k = pick(rng, ['fl', 'alt', 'qnh', 'sq', 'hdg', 'rwy']);
    if (k === 'fl') { const f = pick(rng, [45, 50, 70, 80, 95, 100, 110, 140, 150, 180, 200, 245, 300, 330, 350, 390]); return { topic: 'comunicaciones', g: 'Números', front: `Di en fraseología\nFL${f}`, back: R.sayFL(f) }; }
    if (k === 'alt') { const a = pick(rng, [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8500, 10000, 11000, 13000]); return { topic: 'comunicaciones', g: 'Números', front: `Di en fraseología\naltitud ${a.toLocaleString('es-ES')} ft`, back: R.sayAltitude(a) }; }
    if (k === 'qnh') { const q = randint(rng, 985, 1035); return { topic: 'comunicaciones', g: 'Números', front: `Di en fraseología\nQNH ${q}`, back: R.sayQNH(q) }; }
    if (k === 'sq') { const c = rng() < 0.3 ? pick(rng, ['7000', '2000', '1000', '5000', '6000']) : [0, 0, 0, 0].map(() => randint(rng, 0, 7)).join(''); return { topic: 'comunicaciones', g: 'Números', front: `Di en fraseología\ncódigo ${c}`, back: 'responda ' + R.saySquawk(c) }; }
    if (k === 'hdg') { const h = randint(rng, 1, 36) * 10; return { topic: 'comunicaciones', g: 'Números', front: `Di en fraseología\nrumbo ${pad(h, 3)}`, back: R.sayHeading(h) }; }
    const r = pick(rng, ['03L', '03R', '06', '12', '13', '18L', '18R', '21', '24L', '24R', '25', '27', '30', '31', '32L', '32R', '35', '36L', '36R', '14C']);
    return { topic: 'comunicaciones', g: 'Números', front: `Di en fraseología\npista ${r}`, back: R.sayRunway(r) };
  };
  F.airspace = rng => {
    const cls = pick(rng, ['A', 'B', 'C', 'D', 'E', 'F', 'G']); const p = cls === 'A' ? ['IFR', 'IFR'] : pick(rng, [['IFR', 'IFR'], ['IFR', 'VFR'], ['VFR', 'VFR']]);
    const atc = R.separatedByATC(cls, p[0], p[1]);
    return { topic: 'espacios-aereos', g: 'Espacios aéreos', front: `Clase ${cls}: ${p[0]} con ${p[1]}\n¿Quién separa?`, back: atc ? 'El ATC' : 'Los pilotos (con información de tránsito si la hay)' };
  };
  F.alert = rng => { const c = pick(rng, R.ALERT_CASES); return { topic: 'introduccion', g: 'Fases de alerta', front: `¿Qué fase de alerta?\n${c[0]}`, back: c[1] }; };
  F.wakeCat = rng => { const a = pick(rng, AC.filter(x => x.speed !== 'muyrapida')); return { topic: 'plan-de-vuelo', g: 'Categoría de estela', front: `Casilla 9: categoría de estela de\n${lbl(a)}`, back: `${a.wake} – ${R.WAKE_NAME[a.wake]}${a.heavyWhenLeading ? '\n(pero cuenta como pesado cuando va delante)' : ''}` }; };
  F.fpl15 = rng => {
    const k = pick(rng, ['N', 'M', 'F', 'A', 'K']);
    if (k === 'N') { const v = randint(rng, 9, 50) * 10; return { topic: 'plan-de-vuelo', g: 'Plan de vuelo', front: `Casilla 15\nN${pad(v, 4)}`, back: `${v} kt de velocidad verdadera (TAS)` }; }
    if (k === 'K') { const v = randint(rng, 15, 90) * 10; return { topic: 'plan-de-vuelo', g: 'Plan de vuelo', front: `Casilla 15\nK${pad(v, 4)}`, back: `${v} km/h de velocidad verdadera` }; }
    if (k === 'M') { const v = randint(rng, 70, 89); return { topic: 'plan-de-vuelo', g: 'Plan de vuelo', front: `Casilla 15\nM0${v}`, back: `Mach 0,${v}` }; }
    if (k === 'F') { const v = randint(rng, 4, 41) * 10; return { topic: 'plan-de-vuelo', g: 'Plan de vuelo', front: `Casilla 15\nF${pad(v, 3)}`, back: `Nivel de vuelo ${v}` }; }
    const v = randint(rng, 15, 95); return { topic: 'plan-de-vuelo', g: 'Plan de vuelo', front: `Casilla 15\nA${pad(v, 3)}`, back: `Altitud ${(v * 100).toLocaleString('es-ES')} ft` };
  };
  F.metar = rng => {
    const g = pick(rng, ['wind', 'vis', 'cloud', 'rvr', 'temp', 'cavok']);
    if (g === 'wind') { const d = randint(rng, 1, 36) * 10, s = randint(rng, 2, 30), gu = rng() < 0.3 ? s + randint(rng, 8, 15) : null; const vrb = rng() < 0.1;
      return { topic: 'meteorologia', g: 'METAR', front: `Grupo METAR\n${vrb ? 'VRB0' + randint(rng, 1, 3) : pad(d, 3) + pad(s, 2) + (gu ? 'G' + gu : '')}KT`, back: vrb ? 'Viento variable y flojo' : `Viento de ${pad(d, 3)}° a ${s} kt${gu ? ', rachas de ' + gu + ' kt' : ''}` }; }
    if (g === 'vis') { const v = pick(rng, [9999, 8000, 5000, 3000, 1500, 800, 400, 200]); return { topic: 'meteorologia', g: 'METAR', front: `Grupo METAR\n${pad(v, 4)}`, back: v === 9999 ? 'Visibilidad de 10 km o más' : `Visibilidad ${v.toLocaleString('es-ES')} m` }; }
    if (g === 'cloud') { const c = pick(rng, [['FEW', 'Escasas (1–2 octas)'], ['SCT', 'Dispersas (3–4 octas)'], ['BKN', 'Muy nubosas (5–7 octas)'], ['OVC', 'Cubierto (8 octas)']]); const h = randint(rng, 2, 60);
      return { topic: 'meteorologia', g: 'METAR', front: `Grupo METAR\n${c[0]}${pad(h, 3)}${rng() < 0.2 ? 'CB' : ''}`, back: `${c[1]} a ${(h * 100).toLocaleString('es-ES')} ft${c[0] === 'BKN' || c[0] === 'OVC' ? '\n(cuenta como techo)' : ''}` }; }
    if (g === 'rvr') { const r = pick(rng, ['24L', '32R', '03', '30', '12']), v = pick(rng, [175, 300, 450, 550, 800, 1200]), t = pick(rng, [['U', 'aumentando'], ['D', 'disminuyendo'], ['N', 'sin cambios']]);
      return { topic: 'meteorologia', g: 'METAR', front: `Grupo METAR\nR${r}/${pad(v, 4)}${t[0]}`, back: `RVR de la pista ${r}: ${v} m, ${t[1]}` }; }
    if (g === 'temp') { const t = randint(rng, -5, 30), d = t - randint(rng, 0, 10); const f = n => (n < 0 ? 'M' : '') + pad(Math.abs(n), 2);
      return { topic: 'meteorologia', g: 'METAR', front: `Grupo METAR\n${f(t)}/${f(d)}`, back: `Temperatura ${t} °C, punto de rocío ${d} °C${t - d <= 2 ? '\n(diferencia pequeña: riesgo de niebla)' : ''}` }; }
    return { topic: 'meteorologia', g: 'METAR', front: 'Grupo METAR\nCAVOK', back: 'Visibilidad ≥ 10 km, sin nubes por debajo de 5 000 ft (o de la altitud mínima de sector), sin CB/TCU ni tiempo significativo' };
  };
  const PHRASES = [
    ['MOTOR Y AL AIRE', 'GO AROUND'], ['ALINEE Y MANTENGA', 'LINE UP AND WAIT'], ['AUTORIZADO A DESPEGAR', 'CLEARED FOR TAKE-OFF'], ['AUTORIZADO A ATERRIZAR', 'CLEARED TO LAND'],
    ['MANTENGA CORTO DE', 'HOLD SHORT OF'], ['MANTENGA POSICIÓN', 'HOLD POSITION'], ['CEDA EL PASO A', 'GIVE WAY TO'], ['ABORTE DESPEGUE', 'STOP IMMEDIATELY'],
    ['CANCELE DESPEGUE', 'CANCEL TAKE-OFF'], ['CONTINÚE APROXIMACIÓN', 'CONTINUE APPROACH'], ['ORBITE', 'ORBIT'], ['ENTRE EN VIENTO EN COLA', 'JOIN DOWNWIND'],
    ['EFECTÚE APROXIMACIÓN DIRECTA', 'MAKE STRAIGHT-IN APPROACH'], ['AUTORIZADO TOMA Y DESPEGUE', 'CLEARED TOUCH AND GO'], ['AUTORIZADO PASADA BAJA', 'CLEARED LOW PASS'], ['EFECTÚE ATERRIZAJE COMPLETO', 'MAKE FULL STOP'],
    ['RETROCESO APROBADO', 'PUSHBACK APPROVED'], ['PUESTA EN MARCHA APROBADA', 'START UP APPROVED'], ['RUEDE A PUNTO DE ESPERA', 'TAXI TO HOLDING POINT'], ['CRUCE PISTA', 'CROSS RUNWAY'],
    ['ABANDONE PISTA', 'VACATE RUNWAY'], ['NOTIFIQUE PISTA LIBRE', 'REPORT RUNWAY VACATED'], ['PRECAUCIÓN ESTELA TURBULENTA', 'CAUTION WAKE TURBULENCE'], ['PRECAUCIÓN CHORRO DE REACTOR', 'CAUTION JET BLAST'],
    ['NEGATIVO, REPITO', 'NEGATIVE, I SAY AGAIN'], ['ESPERE', 'STANDBY'], ['RECIBIDO', 'ROGER'], ['AFIRMO', 'AFFIRM'], ['COLACIONE', 'READ BACK'],
    ['A TODAS LAS ESTACIONES, CESEN DE TRANSMITIR, MAYDAY', 'ALL STATIONS, STOP TRANSMITTING, MAYDAY'], ['RESPONDA', 'SQUAWK'], ['RECICLE TRANSPONDER', 'RESET SQUAWK'],
    ['DESPEGUE INMEDIATO O ABANDONE PISTA', 'TAKE OFF IMMEDIATELY OR VACATE RUNWAY'], ['MANTENGA TRAYECTORIA DE PISTA', 'TRACK EXTENDED CENTRE LINE'], ['SUBA DIRECTO', 'CLIMB STRAIGHT AHEAD'],
    ['REGRESO POR PISTA APROBADO', 'BACKTRACK APPROVED'], ['RUEDE A ZONA DE ESPERA', 'TAXI INTO HOLDING BAY'], ['ACELERE ABANDONO DE PISTA', 'EXPEDITE VACATING']
  ];
  F.phrase = rng => { const p = pick(rng, PHRASES); const es = rng() < 0.5; return { topic: 'comunicaciones', g: 'Fraseología ES ↔ EN', front: `${es ? 'En inglés' : 'En español'}:\n${es ? p[0] : p[1]}`, back: es ? p[1] : p[0] }; };
  F.airport = rng => {
    const A = (root.ADC_SCEN && root.ADC_SCEN.APTS) || [{ icao: 'LEMD', city: 'Madrid' }, { icao: 'LEBL', city: 'Barcelona' }];
    const a = pick(rng, A); const inv = rng() < 0.5;
    return { topic: 'introduccion', g: 'Indicadores OACI', front: inv ? `Indicador OACI de\n${a.city}` : `¿Qué aeródromo es\n${a.icao}?`, back: inv ? a.icao : `${a.city}${a.rwys ? '\nPistas: ' + a.rwys.join(', ') : ''}` };
  };
  F.squawk = rng => { const c = pick(rng, [['7500', 'Interferencia ilícita'], ['7600', 'Fallo de comunicaciones'], ['7700', 'Emergencia'], ['7000', 'VFR en espacio no controlado']]); return rng() < 0.5 ? { topic: 'emergencias', g: 'Códigos especiales', front: `Código\n${c[0]}`, back: c[1] } : { topic: 'emergencias', g: 'Códigos especiales', front: `Código para\n${c[1].toLowerCase()}`, back: c[0] }; };
  F.timeDist = rng => {
    const kt = pick(rng, [60, 90, 120, 140, 150, 180, 240]), nm = pick(rng, [2, 3, 4, 5, 6, 8, 10, 12]); const s = Math.round(nm / kt * 3600);
    return { topic: 'separaciones', g: 'Tiempo y distancia', front: `${nm} NM a ${kt} kt\n¿Cuánto tiempo?`, back: `${Math.floor(s / 60)}:${pad(s % 60, 2)} min\n(${(kt / 60).toFixed(1).replace('.', ',')} NM por minuto)` };
  };

  const list = Object.keys(F);
  // combinaciones aproximadas de cada tipo de tarjeta
  const n = AC.length;
  const combos = { depWake: n * n * 2, arrWake: n * n * 2, successive: n * n, trl: R.TA_PLACES.length * 86, ta: R.TA_PLACES.length, vmc: 10 * 9 * 2, lvp: 7 * 6 * 5, phonetic: 17576, numbers: 16 + 14 + 51 + 4096 + 36 + 20,
    airspace: 19, alert: R.ALERT_CASES.length, wakeCat: n, fpl15: 42 + 76 + 20 + 38 + 81, metar: 36 * 29 * 2 + 8 + 4 * 59 + 5 * 6 * 3 + 36 * 11 + 1, phrase: PHRASES.length * 2, airport: 44, squawk: 8, timeDist: 56 };
  function generate(rng, topics) {
    rng = rng || Math.random;
    for (let k = 0; k < 30; k++) { const c = F[pick(rng, list)](rng); if (!topics || topics.includes(c.topic)) return c; }
    return null;
  }
  const API = { F, list, generate, combos, PHRASES };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.ADC_FLASH = API;
})(typeof window !== 'undefined' ? window : globalThis);
