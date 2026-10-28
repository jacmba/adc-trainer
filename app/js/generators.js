/* Generadores paramétricos de preguntas. Cada uno devuelve
   {t, q, o, a, m?, e, gen} con las opciones ya barajadas. */
(function (root) {
  'use strict';
  const R = (typeof module !== 'undefined' && module.exports) ? require('./rules.js') : root.ADC_RULES;

  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  const randint = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
  function shuffle(rng, arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // construye pregunta de respuesta única: correct + distractores (únicos)
  function single(rng, t, q, correct, distractors, e, extra) {
    const opts = [correct];
    for (const d of distractors) if (!opts.includes(d) && opts.length < 4) opts.push(d);
    const sh = shuffle(rng, opts);
    return Object.assign({ t, q, o: sh, a: [sh.indexOf(correct)], e, gen: true }, extra || {});
  }
  const fmtMin = m => (m === 1.5 ? '1,5' : String(m)) + ' min';
  const acLabel = ac => `${ac.t} (${ac.name})`;
  const CALLS = ['IBE', 'VLG', 'AEA', 'RYR', 'BAW', 'DLH', 'AFR', 'IBS', 'ANE', 'BTI', 'KLM', 'EZY', 'TAP', 'SWR'];
  const callsign = rng => pick(rng, CALLS) + randint(rng, 100, 9899);

  const G = {};

  // 1. Estela en salida
  G.depWake = function (rng) {
    let a, b, inter, v;
    do {
      a = pick(rng, R.AIRCRAFT); b = pick(rng, R.AIRCRAFT); inter = rng() < 0.4;
      v = R.depWake(a, b, inter);
    } while (v === null || a === b);
    const where = inter ? 'desde una intersección más adelantada' : 'desde la cabecera (pista completa)';
    const q = `Separación por estela turbulenta: un ${acLabel(b)} despega ${where} detrás de un ${acLabel(a)} que ha salido desde la cabecera. ¿Qué separación mínima por estela aplicas?`;
    const correct = v === 0 ? 'No aplica separación por estela' : fmtMin(v);
    const lw = R.leadingWake(a);
    let e = `Primera: ${R.WAKE_NAME[lw]}${a.heavyWhenLeading ? ' (B757 cuenta como pesado cuando va delante)' : ''}. Segunda: ${R.WAKE_NAME[b.wake]}. `;
    e += v === 0 ? 'La segunda no es de menor categoría que la primera.' : `Tabla de salida${inter ? ' + 1 min por intersección' : ''}.`;
    return single(rng, 'separaciones', q, correct, shuffle(rng, ['No aplica separación por estela', '2 min', '3 min', '4 min', '1 min']), e, { g: 'Estela en salida' });
  };

  // 2. Salidas IFR sucesivas (tabla genérica)
  G.successive = function (rng) {
    let a, b;
    do { a = pick(rng, R.AIRCRAFT); b = pick(rng, R.AIRCRAFT); } while (a.speed === 'muyrapida' && b.speed === 'muyrapida');
    const s = R.successive(a, b);
    const useNM = rng() < 0.5;
    const q = `Aeródromo sin procedimiento local: dos salidas IFR sucesivas por la misma SID. Primera: ${acLabel(a)} (${a.kind}). Segunda: ${acLabel(b)} (${b.kind}). Según la tabla genérica de salidas sucesivas (ignora la estela), ¿qué separación se aplica${useNM ? ' en distancia' : ' en tiempo'}?`;
    const correct = s.sujeta ? 'SUJETA: coordinar con APP' : (useNM ? s.nm + ' NM' : fmtMin(s.min));
    const pool = useNM ? ['2 NM', '3 NM', '4 NM', '5 NM'] : ['1,5 min', '2 min', '3 min', '1 min'];
    const e = `Primera: ${R.SPEED_NAME[a.speed]}. Segunda: ${R.SPEED_NAME[b.speed]}. ` + (s.sujeta ? 'La segunda alcanzaría a la primera (o es muy rápida, o la primera es lenta): queda sujeta.' : `Tabla: ${fmtMin(s.min)} / ${s.nm} NM.`);
    return single(rng, 'separaciones', q, correct, shuffle(rng, pool.concat(['SUJETA: coordinar con APP'])), e, { g: 'Salidas sucesivas' });
  };

  // 3. Separación combinada en salida (estela + sucesivas, lo más restrictivo)
  G.combinedDeparture = function (rng) {
    let a, b, w, s;
    do {
      a = pick(rng, R.AIRCRAFT.filter(x => x.speed !== 'muyrapida'));
      b = pick(rng, R.AIRCRAFT.filter(x => x.speed !== 'muyrapida'));
      w = R.depWake(a, b, false); s = R.successive(a, b);
    } while (a === b || w === null);
    const q = `Dos salidas IFR desde cabecera, en un aeródromo con separación genérica en TIEMPO. Primera: ${acLabel(a)}. Segunda: ${acLabel(b)}. ¿Cuánto debes esperar como mínimo antes de autorizar el despegue de la segunda?`;
    let correct, e;
    if (s.sujeta) { correct = 'Queda sujeta: pedir la suelta a APP'; e = 'La tabla de sucesivas la deja sujeta' + (w ? ` (y además hay ${w} min de estela)` : '') + '.'; }
    else { const v = Math.max(w, s.min); correct = fmtMin(v); e = `Estela: ${w ? fmtMin(w) : 'no aplica'}. Sucesivas: ${fmtMin(s.min)}. Se aplica la más restrictiva.`; }
    return single(rng, 'separaciones', q, correct, shuffle(rng, ['1,5 min', '2 min', '3 min', 'Queda sujeta: pedir la suelta a APP', '4 min']), e, { g: 'Separación combinada' });
  };

  // 4. Estela en llegada
  G.arrWake = function (rng) {
    let a, b, v; const radar = rng() < 0.5;
    do { a = pick(rng, R.AIRCRAFT.filter(x => x.speed !== 'muyrapida')); b = pick(rng, R.AIRCRAFT.filter(x => x.speed !== 'muyrapida')); v = R.arrWake(a, b, radar); } while (a === b);
    const q = `Dos llegadas IFR sucesivas a la misma pista. APP presta servicio ${radar ? 'con vigilancia radar' : 'convencional (sin radar)'}. Primera: ${acLabel(a)}. Segunda: ${acLabel(b)}. ¿Separación mínima por estela turbulenta?`;
    const unit = radar ? ' NM' : ' min';
    const correct = v === 0 ? 'No aplica separación por estela' : v + unit;
    const pool = radar ? ['4 NM', '5 NM', '6 NM', '7 NM', '8 NM', '3 NM'] : ['2 min', '3 min', '4 min', '5 min'];
    const e = `Primera ${R.WAKE_NAME[R.leadingWake(a)]}, segunda ${R.WAKE_NAME[b.wake]}. ${radar ? 'Radar → distancia.' : 'Convencional → tiempo.'}` + (v === 0 ? ' La segunda no es menor (salvo pesada tras pesada en distancia, 4 NM).' : '');
    return single(rng, 'separaciones', q, correct, shuffle(rng, pool.concat(['No aplica separación por estela'])), e, { g: 'Estela en llegada' });
  };

  // 5. Nivel de transición
  G.trl = function (rng) {
    const place = pick(rng, R.TA_PLACES.filter(p => R.TRL_TABLE[p.ta])); const qnh = randint(rng, 970, 1045);
    const v = R.trl(qnh, place.ta);
    const q = `Controlas ${place.name} (TA ${place.ta.toLocaleString('es-ES')} ft). El QNH es ${qnh}. ¿Qué nivel de transición publicas en el ATIS?`;
    const correct = 'FL' + v;
    const opts = [v - 10, v - 5, v + 5, v + 10].map(x => 'FL' + x);
    const e = `Tabla SOP para TA ${place.ta} ft: QNH ${qnh} cae en el tramo ${R.TRL_BANDS.find(b => qnh >= b[0] && qnh <= b[1]).join('–')} → FL${v}.`;
    return single(rng, 'altimetria', q, correct, shuffle(rng, opts), e, { g: 'Nivel de transición' });
  };

  // 6. VMC en aeródromo
  G.vmc = function (rng) {
    const vis = pick(rng, [800, 1200, 1500, 2000, 3000, 4000, 4900, 5000, 6000, 8000, 9999]);
    const cloud = pick(rng, [[null, 'CAVOK-like sin techo'], [400, ''], [500, ''], [600, ''], [800, ''], [1000, ''], [1200, ''], [1400, ''], [1500, ''], [1800, ''], [2500, '']]);
    const cf = cloud[0];
    const night = rng() < 0.2;
    const layer = cf == null ? 'SCT035' : 'BKN' + String(cf / 100).padStart(3, '0');
    const q = `METAR de tu CTR (${night ? 'de noche' : 'de día'}): visibilidad ${vis === 9999 ? '9999' : String(vis).padStart(4, '0')}, nubes ${layer}. Un VFR pide salir. ¿Qué haces?`;
    const vmc = R.aerodromeVMC(vis === 9999 ? 10000 : vis, cf);
    const sv = R.svfrPossible(vis === 9999 ? 10000 : vis, cf, night);
    let correct, e;
    if (vmc) { correct = 'Hay VMC: puede salir VFR'; e = 'Visibilidad ≥ 5 000 m y techo ≥ 1 500 ft (o sin techo).'; }
    else if (sv) { correct = 'No hay VMC: informo de las condiciones y pregunto intenciones (podría pedir SVFR)'; e = 'No hay VMC, pero se cumplen los mínimos SVFR (día, vis ≥ 1 500 m, techo ≥ 600 ft). El ATC no sugiere el SVFR.'; }
    else { correct = 'No hay VMC ni mínimos de SVFR: no puede salir en VFR'; e = night ? 'De noche no se permite el SVFR.' : 'Visibilidad < 1 500 m o techo < 600 ft.'; }
    return single(rng, 'meteorologia', q, correct, ['Hay VMC: puede salir VFR', 'No hay VMC: informo de las condiciones y pregunto intenciones (podría pedir SVFR)', 'No hay VMC ni mínimos de SVFR: no puede salir en VFR', 'Le sugiero que pida VFR especial'], e, { g: 'VMC / SVFR' });
  };

  // 7. LVP
  G.lvp = function (rng) {
    const rvr = pick(rng, [null, 550, 700, 800, 900, 1200, 1500, 1800]);
    const ceil = pick(rng, [200, 250, 300, 400, 500, 800, 1500]);
    const vis = pick(rng, [400, 500, 600, 800, 1500, 3000]);
    const on = R.lvpStart(rvr, ceil, vis);
    const q = `Según el esquema genérico de LVP: ${rvr ? 'RVR ' + rvr + ' m, ' : 'sin RVR disponible, '}techo ${ceil} ft, visibilidad ${vis} m. ¿Deben activarse los procedimientos de visibilidad reducida?`;
    const correct = on ? 'Sí' : 'No';
    const e = 'Se activan si RVR ≤ 800 m, techo ≤ 250 ft o visibilidad ≤ 500 m (basta una).';
    return single(rng, 'meteorologia', q, correct, ['Sí', 'No'], e, { g: 'LVP' });
  };

  // 8. Fraseología numérica
  G.numbers = function (rng) {
    const kind = pick(rng, ['fl', 'alt', 'qnh', 'sq', 'hdg', 'rwy']);
    let q, correct, wrong, e;
    if (kind === 'fl') {
      const fl = pick(rng, [50, 60, 70, 75, 80, 85, 90, 100, 110, 120, 145, 150, 195, 200, 230, 300, 310, 350, 370, 400]);
      q = `¿Cómo se transmite FL${fl}?`; correct = R.sayFL(fl);
      wrong = ['nivel de vuelo ' + R.digits(String(fl).padStart(3, '0')), 'nivel de vuelo ' + (fl * 100).toLocaleString('es-ES'), R.sayAltitude(fl * 100)];
      e = 'Niveles cifra a cifra sin cero delante; centenas enteras: cien, doscientos…';
    } else if (kind === 'alt') {
      const ft = pick(rng, [1500, 2000, 2500, 3000, 3500, 4000, 6000, 6300, 7000, 8500, 10000, 11500, 13000]);
      q = `¿Cómo se transmite una altitud de ${ft.toLocaleString('es-ES')} ft?`; correct = R.sayAltitude(ft);
      wrong = [R.digits(ft) + ' pies', 'nivel de vuelo ' + R.digits(ft / 100), (ft >= 10000 ? (Math.floor(ft / 1000) === 10 ? 'diez' : Math.floor(ft / 1000) === 11 ? 'once' : 'trece') + ' mil' + (ft % 1000 ? ' quinientos' : '') + ' pies' : 'altitud ' + R.digits(ft / 100))];
      e = 'Altitudes: miles y cientos (10 000 → \"uno cero mil\").';
    } else if (kind === 'qnh') {
      const qnh = pick(rng, [993, 998, 1000, 1003, 1010, 1012, 1013, 1020, 1024, 1031]);
      q = `¿Cómo se transmite QNH ${qnh}?`; correct = R.sayQNH(qnh);
      wrong = ['QNH ' + (qnh >= 1000 ? 'mil ' + (qnh - 1000 || '') : 'novecientos ' + (qnh - 900)).trim(), 'QNH ' + R.digits(qnh).split(' ').slice(1).join(' '), qnh === 1000 ? 'QNH uno cero cero cero' : 'QNH ' + R.digits(qnh) + ' hectopascales mil'];
      e = 'Cifra a cifra; 1000 se dice \"mil\". Nunca \"mil veinticuatro\".';
    } else if (kind === 'sq') {
      const c = pick(rng, ['7000', '2000', '1000', '0242', '7232', '4501', '6000', '3662', '2501', '5000']);
      q = `¿Cómo se transmite el código de transpondedor ${c}?`; correct = 'responda ' + R.saySquawk(c);
      wrong = ['responda ' + R.digits(c), 'responda ' + (+c).toLocaleString('es-ES'), 'responda ' + R.digits(c).split(' ').reverse().join(' ')];
      e = 'Cifra a cifra, salvo millares enteros (\"dos mil\").';
    } else if (kind === 'hdg') {
      const h = pick(rng, [5, 35, 90, 120, 150, 180, 230, 270, 300, 355]);
      q = `¿Cómo se transmite el rumbo ${String(h).padStart(3, '0')}?`; correct = R.sayHeading(h);
      wrong = ['rumbo ' + R.digits(h), 'rumbo ' + h, 'rumbo ' + (h === 90 ? 'este' : h === 180 ? 'sur' : h === 270 ? 'oeste' : R.digits(String(h).padStart(3, '0')) + ' grados magnéticos sur')];
      e = 'Tres cifras con cero delante; nunca \"rumbo norte\".';
    } else {
      const r = pick(rng, ['06', '09', '13', '18L', '18R', '25', '27', '31', '36L', '36R', '03', '14C', '32L']);
      q = `¿Cómo se transmite la pista ${r}?`; correct = R.sayRunway(r);
      const n = r.replace(/[LCR]/, ''); const side = r.slice(n.length);
      const fon = { L: ' lima', C: ' charlie', R: ' romeo' }[side] || '';
      wrong = ['pista ' + R.digits(+n) + ({ L: ' izquierda', C: ' centro', R: ' derecha' }[side] || ''), 'pista ' + R.digits(n) + (fon || ' cero'), 'pista ' + (+n) + ({ L: ' left', C: ' center', R: ' right' }[side] || ' grados')];
      e = 'Dos cifras (con cero delante) y paralelas como izquierda/centro/derecha.';
    }
    return single(rng, 'comunicaciones', q, correct, wrong, e, { g: 'Números y fonética' });
  };

  // 9. Clase de espacio aéreo: ¿quién separa?
  G.airspace = function (rng) {
    const cls = pick(rng, ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    let pair = pick(rng, [['IFR', 'IFR'], ['IFR', 'VFR'], ['VFR', 'VFR']]);
    if (cls === 'A') pair = ['IFR', 'IFR'];
    const atc = R.separatedByATC(cls, pair[0], pair[1]);
    const q = `Espacio aéreo de clase ${cls}: un ${pair[0]} y un ${pair[1]} convergen. ¿Quién es responsable de separarlos?`;
    const correct = atc ? 'El controlador (ATC)' : 'Los pilotos (con la información disponible)';
    const e = { A: 'Clase A: solo IFR, todos separados.', B: 'Clase B: el ATC separa a todos.', C: 'Clase C: el ATC separa IFR de IFR y de VFR; VFR entre sí reciben información.', D: 'Clase D: el ATC solo separa IFR de IFR.', E: 'Clase E: el ATC solo separa IFR de IFR.', F: 'Clase F: no controlada (asesoramiento).', G: 'Clase G: no controlada.' }[cls];
    return single(rng, 'espacios-aereos', q, correct, ['El controlador (ATC)', 'Los pilotos (con la información disponible)'], e, { g: 'Clases de espacio aéreo' });
  };

  // 10. Fases de alerta
  G.alert = function (rng) {
    const c = pick(rng, R.ALERT_CASES);
    return single(rng, 'introduccion', `¿Qué fase del servicio de alerta corresponde? «${c[0]}».`, c[1], ['INCERFA', 'ALERFA', 'DETRESFA'], 'INCERFA: incertidumbre (30 min). ALERFA: alerta. DETRESFA: peligro.', { g: 'Fases de alerta' });
  };

  // 11. Decodificación de METAR
  G.metar = function (rng) {
    const icao = pick(rng, ['LEBB', 'LEMD', 'LEVC', 'GCLP', 'LEPA', 'LEZL', 'LEST', 'LEVX', 'LEMG', 'GCXO', 'LEAL', 'LEZG']);
    const day = randint(rng, 1, 28), hh = randint(rng, 0, 23), mm = pick(rng, ['00', '30']);
    const dir = randint(rng, 1, 36) * 10, spd = randint(rng, 2, 25), gust = rng() < 0.3 ? spd + randint(rng, 8, 15) : null;
    const vis = pick(rng, [9999, 8000, 6000, 5000, 4000, 3000, 2500, 1500]);
    const layersPool = ['FEW', 'SCT', 'BKN', 'OVC'];
    const nLayers = randint(rng, 1, 3); let h = randint(rng, 5, 20); const layers = [];
    for (let i = 0; i < nLayers; i++) { layers.push(pick(rng, layersPool) + String(h).padStart(3, '0')); h += randint(rng, 5, 20); }
    const t = randint(rng, -2, 30), td = t - randint(rng, 0, 12);
    const qnh = randint(rng, 990, 1035);
    const wx = vis < 5000 ? pick(rng, ['BR', '-RA', 'RA', 'HZ', '-DZ']) : '';
    const tt = n => (n < 0 ? 'M' : '') + String(Math.abs(n)).padStart(2, '0');
    const metar = `${icao} ${String(day).padStart(2, '0')}${String(hh).padStart(2, '0')}${mm}Z ${String(dir).padStart(3, '0')}${String(spd).padStart(2, '0')}${gust ? 'G' + gust : ''}KT ${vis} ${wx ? wx + ' ' : ''}${layers.join(' ')} ${tt(t)}/${tt(td)} Q${qnh}`;
    const ceilLayer = layers.find(l => /^(BKN|OVC)/.test(l));
    const ceil = ceilLayer ? +ceilLayer.slice(3) * 100 : null;
    const ask = pick(rng, ['ceil', 'wind', 'qnh', 'vmc', 'vis']);
    let q = `METAR: ${metar}\n`, correct, wrong, e;
    if (ask === 'ceil') {
      q += '¿Cuál es el techo de nubes?'; correct = ceil == null ? 'No hay techo' : ceil.toLocaleString('es-ES') + ' ft';
      wrong = layers.map(l => (+l.slice(3) * 100).toLocaleString('es-ES') + ' ft').concat(['No hay techo']);
      e = 'Techo = primera capa BKN u OVC.';
    } else if (ask === 'wind') {
      q += '¿Cuál es el viento?'; correct = `${String(dir).padStart(3, '0')}° a ${spd} kt${gust ? ', rachas de ' + gust : ''}`;
      wrong = [`${String(dir).padStart(3, '0')}° a ${gust || spd + 10} kt`, `${String((dir + 180) % 360 || 360).padStart(3, '0')}° a ${spd} kt${gust ? ', rachas de ' + gust : ''}`, `${String(spd).padStart(3, '0')}° a ${dir / 10} kt`];
      e = 'dddff(Gff)KT: dirección de donde viene + intensidad (+ rachas).';
    } else if (ask === 'qnh') {
      q += '¿Qué QNH colacionará el piloto?'; correct = String(qnh); wrong = [String(qnh - 10), String(qnh + 10), String(qnh + 1)];
      e = 'Q + 4 cifras en hPa. Ojo a las decenas al colacionar.';
    } else if (ask === 'vis') {
      q += '¿Cuál es la visibilidad?'; correct = vis === 9999 ? '10 km o más' : vis.toLocaleString('es-ES') + ' m'; wrong = ['10 km o más', '9 999 ft', '5 000 m', '1 500 m', '8 000 m'];
      e = 'Visibilidad en metros; 9999 = 10 km o más.';
    } else {
      const ok = R.aerodromeVMC(vis === 9999 ? 10000 : vis, ceil);
      q += '¿Hay condiciones VMC para operar VFR en el CTR?'; correct = ok ? 'Sí' : 'No'; wrong = ['Sí', 'No'];
      e = `VMC en aeródromo: vis ≥ 5 000 m y techo ≥ 1 500 ft. Aquí: vis ${vis === 9999 ? '≥ 10 km' : vis + ' m'}, techo ${ceil == null ? 'ninguno' : ceil + ' ft'}.`;
    }
    return single(rng, 'meteorologia', q, correct, shuffle(rng, wrong), e, { g: 'Decodificación METAR' });
  };

  // 12. Autorización de pista: ¿se puede dar?
  const RWY_CASES = [
    ['autorizar a despegar', 'la llegada anterior aún rueda por la pista a 60 kt', false, 'Pista ocupada.'],
    ['autorizar a despegar', 'la llegada anterior ha abandonado la pista por completo', true, 'Pista libre (aplicando además estela).'],
    ['autorizar a despegar', 'la salida anterior ha cruzado el extremo de la pista', true, 'Criterio de separación en pista cumplido (más estela).'],
    ['autorizar a despegar', 'la salida anterior está en el aire y ha iniciado un viraje', true, 'Criterio cumplido (más estela).'],
    ['autorizar a despegar', 'hay otra aeronave autorizada a aterrizar a 3 NM', false, 'Ya hay una autorización de aterrizaje.'],
    ['autorizar a despegar', 'otra aeronave está cruzando la pista', false, 'Aeronave cruzando la pista utilizable.'],
    ['autorizar a despegar', 'otra aeronave en un punto de espera ya está autorizada a despegar', false, 'Doble autorización de despegue.'],
    ['autorizar a aterrizar', 'una salida está alineada esperando', false, 'Pista ocupada.'],
    ['autorizar a aterrizar', 'la aeronave anterior que aterrizó ha rebasado el punto de espera de la calle de salida', true, 'Pista libre.'],
    ['autorizar a aterrizar', 'la salida anterior está en carrera de despegue', false, 'Aún no ha cruzado el final de pista; puede usarse \"continúe aproximación\" y autorizar cuando proceda.'],
    ['autorizar a aterrizar', 'otra aeronave ya está autorizada a aterrizar y aún no ha tomado', false, 'No se autoriza al siguiente hasta que el anterior haya aterrizado (y librado).'],
    ['autorizar a alinear a una salida', 'un IFR está establecido en final a 4 NM', false, 'Con un IFR a menos de 5–6 NM no se alinea.'],
    ['autorizar a alinear a una salida', 'un IFR está establecido en final a 12 NM y no hay autorización de aterrizaje emitida', true, 'Lejos y sin autorización de aterrizaje: se puede alinear.'],
    ['autorizar a alinear a una salida', 'ya has autorizado a aterrizar a una aeronave que está a 8 NM', false, 'Con cualquier autorización de aterrizaje emitida no se alinea (usar condicional \"detrás\").'],
    ['autorizar a cruzar la pista a una aeronave en rodaje', 'una aeronave ha sido autorizada a despegar y está en carrera', false, 'La pista está en uso por el despegue.']
  ];
  G.runway = function (rng) {
    const c = pick(rng, RWY_CASES);
    return single(rng, 'introduccion', `¿Puedes ${c[0]} si ${c[1]}?`, c[2] ? 'Sí' : 'No', ['Sí', 'No'], c[3], { g: 'Autorizaciones de pista' });
  };

  // 13. QFE → QNH
  G.qnh = function (rng) {
    const elev = pick(rng, [27, 54, 108, 135, 270, 405, 540, 675, 810, 1350, 2160]);
    const qfe = randint(rng, 960, 1015);
    const qnh = qfe + Math.round(elev / 27);
    const q = `Aeródromo con elevación ${elev} ft y QFE ${qfe} hPa. Usando 1 hPa ≈ 27 ft, ¿cuál es el QNH aproximado?`;
    return single(rng, 'altimetria', q, String(qnh), shuffle(rng, [String(qfe - Math.round(elev / 27)), String(qnh + 10), String(qnh - 1), String(qfe)]), `${elev}/27 ≈ ${Math.round(elev / 27)} hPa; QNH = QFE + diferencia.`, { g: 'Cálculo de QNH' });
  };

  // 14. Plan de vuelo: casilla 15
  G.fpl = function (rng) {
    const k = pick(rng, ['N', 'M', 'F', 'A', 'rules', 'wake']);
    if (k === 'N') { const v = randint(rng, 8, 50) * 10; return single(rng, 'plan-de-vuelo', `En la casilla 15, \"N${String(v).padStart(4, '0')}\" significa…`, `${v} kt de velocidad verdadera`, [`Mach ${v / 1000}`, `${v} km/h`, `Nivel ${v}`], 'N + 4 cifras = TAS en nudos.', { g: 'Plan de vuelo' }); }
    if (k === 'M') { const v = randint(rng, 70, 89); return single(rng, 'plan-de-vuelo', `En la casilla 15, \"M0${v}\" significa…`, `Mach 0,${v}`, [`${v} kt`, `Altitud ${v * 100} m`, `FL${v}`], 'M + 3 cifras = Mach.', { g: 'Plan de vuelo' }); }
    if (k === 'F') { const v = randint(rng, 4, 41) * 10 + (rng() < 0.3 ? 5 : 0); return single(rng, 'plan-de-vuelo', `En la casilla 15, \"F${String(v).padStart(3, '0')}\" significa…`, `FL${v}`, [`${v * 100} ft de altitud`, `${v} kt`, `${v * 10} m`], 'F + 3 cifras = nivel de vuelo.', { g: 'Plan de vuelo' }); }
    if (k === 'A') { const v = randint(rng, 15, 90); return single(rng, 'plan-de-vuelo', `En la casilla 15, \"A${String(v).padStart(3, '0')}\" significa…`, `Altitud de ${(v * 100).toLocaleString('es-ES')} ft`, [`FL${v}`, `${v} kt`, `${v * 10} m`], 'A + 3 cifras = altitud en cientos de pies.', { g: 'Plan de vuelo' }); }
    if (k === 'rules') { const r = pick(rng, [['V', 'Todo el vuelo VFR'], ['I', 'Todo el vuelo IFR'], ['Y', 'Empieza IFR y cambia a VFR'], ['Z', 'Empieza VFR y cambia a IFR']]); return single(rng, 'plan-de-vuelo', `Reglas de vuelo \"${r[0]}\" en la casilla 8 significa…`, r[1], ['Todo el vuelo VFR', 'Todo el vuelo IFR', 'Empieza IFR y cambia a VFR', 'Empieza VFR y cambia a IFR'], 'V, I, Y (IFR→VFR), Z (VFR→IFR).', { g: 'Plan de vuelo' }); }
    const ac = pick(rng, R.AIRCRAFT.filter(a => a.speed !== 'muyrapida'));
    const map = { L: 'L – Ligera', M: 'M – Media', H: 'H – Pesada', J: 'J – Super' };
    return single(rng, 'plan-de-vuelo', `¿Qué categoría de estela corresponde a un ${acLabel(ac)} en la casilla 9?`, map[ac.wake], Object.values(map), 'L ≤ 7 t · M < 136 t · H ≥ 136 t · Super = A380.' + (ac.heavyWhenLeading ? ' (Ojo: el B757 es M, pero se trata como pesado cuando va delante.)' : ''), { g: 'Plan de vuelo' });
  };

  // 15. Reglaje del altímetro
  G.setting = function (rng) {
    const place = pick(rng, R.TA_PLACES.filter(p => p.ta !== 7000));
    const qnh = randint(rng, 975, 1040); const tl = R.trl(qnh, place.ta);
    const climbing = rng() < 0.5;
    const alt = climbing ? place.ta + randint(rng, 2, 8) * 100 : tl * 100 - randint(rng, 2, 8) * 100;
    const inLayer = alt > place.ta && alt < tl * 100;
    const q = `${place.name}: TA ${place.ta} ft, TL FL${tl}. Una aeronave ${climbing ? 'en ascenso' : 'en descenso'} pasa por ${alt.toLocaleString('es-ES')} ft${inLayer ? ' (dentro de la capa de transición)' : ''}. ¿En qué términos notifica su posición vertical?`;
    let correct, e;
    if (inLayer) { correct = climbing ? 'Nivel de vuelo (1013)' : 'Altitud (QNH)'; e = 'Atravesando la capa: en ascenso en FL, en descenso en altitud.'; }
    else if (alt <= place.ta) { correct = 'Altitud (QNH)'; e = 'A o por debajo de la TA se usa QNH.'; }
    else { correct = 'Nivel de vuelo (1013)'; e = 'A o por encima del TL se usa 1013.'; }
    return single(rng, 'altimetria', q, correct, ['Altitud (QNH)', 'Nivel de vuelo (1013)', 'Altura (QFE)'], e, { g: 'Reglaje de altímetro' });
  };

  // 16. Indicativos: abreviación
  G.callsign = function (rng) {
    const cases = [
      () => { const r = 'EC' + String.fromCharCode(65 + randint(rng, 0, 25), 65 + randint(rng, 0, 25), 65 + randint(rng, 0, 25)); return [`¿Cuál es una abreviación válida de ${r} (si el controlador la inicia y no hay confusión)?`, r[0] + r.slice(-2), [r.slice(0, 3), r.slice(2), r.slice(-1)], 'Primera letra + al menos las dos últimas.']; },
      () => { const c = callsign(rng); return [`¿Se puede abreviar el indicativo ${c}?`, 'No, nunca', ['Sí, a las tres últimas cifras', 'Sí, si lo inicia el piloto', 'Sí, al designador de la compañía'], 'Operador + identificación de vuelo: no se abrevia.']; },
      () => [`El controlador ha empezado a abreviar tu indicativo. Cambias de frecuencia. ¿Qué indicativo usas en la nueva?`, 'El completo', ['El abreviado', 'El que diga el piloto', 'Solo la matrícula'], 'En cada frecuencia nueva se vuelve al completo.']
    ];
    const c = pick(rng, cases)();
    return single(rng, 'comunicaciones', c[0], c[1], c[2], c[3], { g: 'Indicativos' });
  };

  // ---------- generadores añadidos ----------
  const pad = (n, w) => String(n).padStart(w, '0');
  const RWYS = ['03', '06', '09', '12', '13', '17', '20', '21', '24', '25', '27', '30', '31', '35', '36', '03L', '21R', '06R', '24L', '32R', '36L', '18R', '14L'];
  const rwyHdg = r => (+r.replace(/[LCR]/, '')) * 10;
  const windOf = (rng, hdg, spread) => { let d = Math.round((hdg + randint(rng, -spread, spread)) / 10) * 10; d = ((d % 360) + 360) % 360 || 360; return d; };
  const windStr = (d, s, g) => s < 3 ? 'viento calma' : `viento ${pad(d, 3)} grados ${s} nudos${g ? ' rachas ' + g : ''}`;
  const TEL = { IBE: 'Iberia', VLG: 'Vueling', AEA: 'Europa', RYR: 'Ryanair', BAW: 'Speedbird', DLH: 'Lufthansa', AFR: 'Airfrans', IBS: 'Iberexpress', ANE: 'Air Nostrum', EZY: 'Easy', SWR: 'Swiss', KLM: 'KLM' };
  const PHON = { A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Eco', F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu' };
  const spellCs = s => s.split('').map(ch => /\d/.test(ch) ? R.digits(ch) : PHON[ch]).join(' ');

  // 17. Componentes de viento y criterio de ruido
  G.wind = function (rng) {
    let r, d, s, gst, head, cross, tail;
    do {
      r = pick(rng, RWYS); const h = rwyHdg(r); d = windOf(rng, h, 180); s = randint(rng, 3, 22); gst = rng() < 0.35 ? s + randint(rng, 6, 12) : null;
      const sp = gst || s, ang = (d - h) * Math.PI / 180; head = Math.round(sp * Math.cos(ang)); cross = Math.round(Math.abs(sp * Math.sin(ang))); tail = Math.max(0, -head);
    } while ([5, 6].includes(tail) || [15, 16].includes(cross));
    const no = tail > 5 || cross > 15;
    const q = `Pista ${r} (rumbo ${pad(rwyHdg(r), 3)}). Viento ${pad(d, 3)}/${s}${gst ? 'G' + gst : ''} kt. Con las rachas, eso son unos ${tail ? tail + ' kt de cola' : (head > 0 ? head + ' kt de cara' : 'nada de cara')} y ${cross} kt de cruzado. ¿Puede el criterio de ruido decidir que se use esta pista?`;
    return single(rng, 'gestion-transito', q, no ? `No: ${tail > 5 ? 'cola > 5 kt' : 'cruzado > 15 kt'}` : 'Sí: ni la cola supera 5 kt ni el cruzado 15 kt',
      ['Sí: ni la cola supera 5 kt ni el cruzado 15 kt', 'No: cola > 5 kt', 'No: cruzado > 15 kt', 'Sí: el ruido decide siempre'], 'El ruido no decide la pista con viento cruzado > 15 kt o de cola > 5 kt (rachas incluidas).', { g: 'Viento y ruido' });
  };
  // 18. Tiempo y distancia (como la línea QDM del radar)
  G.timeDistance = function (rng) {
    const kt = pick(rng, [60, 80, 90, 100, 120, 140, 150, 160, 180, 200, 240]); const nm = pick(rng, [2, 3, 4, 5, 6, 8, 10, 12, 15]);
    const sec = Math.round(nm / kt * 3600); const mm = s => Math.floor(s / 60) + ':' + pad(s % 60, 2);
    const q = `Una aeronave vuela a ${kt} kt respecto al suelo y está a ${nm} NM del umbral. ¿Cuánto tarda, aproximadamente, en llegar?`;
    return single(rng, 'separaciones', q, mm(sec) + ' min', shuffle(rng, [mm(Math.round(sec * 0.5)), mm(Math.round(sec * 1.5)), mm(Math.round(sec * 2)), mm(Math.round(nm / kt * 60) * 10)].map(x => x + ' min')),
      `Tiempo = distancia / velocidad: ${nm} / ${kt} h = ${(nm / kt * 60).toFixed(1).replace('.', ',')} min. Atajo: a ${kt} kt se recorren ${(kt / 60).toFixed(1).replace('.', ',')} NM por minuto.`, { g: 'Tiempo y distancia' });
  };
  // 19. Autorizaciones de pista con viento
  G.rwyPhrase = function (rng) {
    const r = pick(rng, RWYS); const d = windOf(rng, rwyHdg(r), 40), s = randint(rng, 2, 18), gst = s >= 8 && rng() < 0.3 ? s + randint(rng, 8, 12) : null;
    const cs = callsign(rng); const what = pick(rng, [['despegar', 'despegue'], ['aterrizar', 'aterrizaje'], ['toma y despegue', 'toma y despegue'], ['pasada baja', 'pasada baja']]);
    const verb = what[0] === 'despegar' || what[0] === 'aterrizar' ? `autorizado a ${what[0]}` : `autorizado ${what[0]}`;
    const ok = `${cs}, ${windStr(d, s, gst)}, pista ${r} ${verb}`;
    return single(rng, 'comunicaciones', `Vas a autorizar ${what[1] === 'despegue' ? 'el despegue' : what[1] === 'aterrizaje' ? 'el aterrizaje' : 'una ' + what[1]} de ${cs} en la pista ${r} con viento ${pad(d, 3)}/${s}${gst ? 'G' + gst : ''} kt. ¿Qué transmites?`, ok,
      [`${cs}, pista ${r} ${verb}`, `${cs}, ${verb}, ${windStr(d, s, gst)}`, `${cs}, ${windStr(d, s, gst)}, pista ${r}, ${what[1]} aprobado`, `${cs}, ${windStr(d, s, gst)}, ${what[1]} a discreción`],
      'Autorizaciones de pista: viento en superficie (con rachas) + designador de pista + "autorizado". Nunca "aprobado" ni "a discreción".', { g: 'Autorizaciones de pista' });
  };
  // 20. Alineación condicional
  G.conditional = function (rng) {
    const cs = callsign(rng), r = pick(rng, RWYS), ty = pick(rng, R.AIRCRAFT.filter(a => a.speed !== 'muyrapida' && a.kind !== 'helicóptero')).t; const where = pick(rng, [['en final', 'aterrizando'], ['despegando', 'despegando']]);
    const ok = `${cs}, detrás del ${ty} ${where[0]}, alinee y mantenga pista ${r}, detrás`;
    return single(rng, 'comunicaciones', `Quieres alinear a ${cs} en la pista ${r} detrás de un ${ty} ${where[1] === 'aterrizando' ? 'que está en final' : 'que está en carrera de despegue'}. ¿Cuál es la autorización condicional correcta?`, ok,
      [`${cs}, alinee y mantenga pista ${r} detrás del ${ty}`, `${cs}, detrás del ${ty} ${where[0]}, autorizado a despegar, detrás`, `${cs}, cuando pase el ${ty}, alinee`, `${cs}, alinee pista ${r}, el ${ty} está ${where[0]}`],
      'Condicional = condición + instrucción + reiteración de la condición ("detrás"). El piloto debe tener a la vista el tránsito. Nunca se condiciona un despegue.', { g: 'Autorizaciones condicionales' });
  };
  // 21. Códigos de transpondedor especiales
  G.squawkCodes = function (rng) {
    const C = [['7500', 'Interferencia ilícita'], ['7600', 'Fallo de comunicaciones'], ['7700', 'Emergencia'], ['7000', 'VFR en espacio no controlado (conspicuidad)'], ['2000', 'Aeronave que entra en el área sin código asignado (IFR)']];
    const c = pick(rng, C); const inv = rng() < 0.4;
    return inv ? single(rng, 'emergencias', `¿Qué código selecciona una aeronave en situación de «${c[1].toLowerCase()}»?`, c[0], shuffle(rng, C.map(x => x[0])), '7500 interferencia ilícita, 7600 fallo de comunicaciones, 7700 emergencia; 7000 VFR no controlado.', { g: 'Códigos especiales' })
      : single(rng, 'emergencias', `Una aeronave aparece con código ${c[0]}. ¿Qué indica?`, c[1], shuffle(rng, C.map(x => x[1])), '7500 interferencia ilícita, 7600 fallo de comunicaciones, 7700 emergencia; 7000 VFR no controlado.', { g: 'Códigos especiales' });
  };
  // 22. Integración VFR en el circuito
  G.vfrJoin = function (rng) {
    const n = randint(rng, 0, 5); const ang = pick(rng, [5, 10, 20, 25, 40, 60, 90, 120, 150, 170]); const nearBase = rng() < 0.5;
    const cs = 'EC' + String.fromCharCode(65 + randint(rng, 0, 25), 65 + randint(rng, 0, 25), 65 + randint(rng, 0, 25));
    const ask = pick(rng, ['defecto', 'directa', 'lleno']);
    if (ask === 'lleno' || n >= 4) return single(rng, 'gestion-transito', `${cs} llama para aterrizar y en el circuito hay ${n >= 4 ? n : 4} aeronaves. ¿Qué haces?`, 'Le hago orbitar sobre un punto VFR e informo de que el circuito está completo',
      ['Lo integro en viento en cola detrás del último', 'Le doy aproximación directa para no molestar', 'Le pido que se quede fuera del CTR sin más'], 'Con 4 aeronaves el circuito está lleno y las que ya están tienen prioridad: órbita sobre un punto VFR.', { g: 'Integración VFR' });
    if (ask === 'directa') {
      const ok = ang <= 30;
      return single(rng, 'gestion-transito', `${cs} llega con una derrota que forma ${ang}° con el eje de la pista en uso y el circuito tiene ${n} aeronaves. ¿Le puedes dar aproximación directa a final?`,
        ok ? 'Sí: viene dentro de ±30° del eje (es la última opción, si no molesta al circuito)' : 'No: solo si viene dentro de ±30° del eje', ['Sí: viene dentro de ±30° del eje (es la última opción, si no molesta al circuito)', 'No: solo si viene dentro de ±30° del eje', 'Sí, siempre que la pida', 'No, a los VFR nunca'],
        'Integración VFR: por defecto viento en cola; alternativa, base (semidirecta) si acorta; última, directa a final si viene dentro de ±30° del eje.', { g: 'Integración VFR' });
    }
    return single(rng, 'gestion-transito', `${cs} llega ${nearBase ? 'por el lado de la final, cerca del punto donde empezaría la base' : 'por el lado contrario a la final'}; circuito con ${n} aeronaves. ¿Qué integración es la más adecuada?`,
      nearBase ? 'Semidirecta a base (acorta y no interfiere)' : 'Viento en cola (la opción por defecto)', ['Semidirecta a base (acorta y no interfiere)', 'Viento en cola (la opción por defecto)', 'Directa a final', 'Barlovento sobre la pista en uso'],
      'Por defecto, al principio o a mitad del viento en cola; en base si acorta; directa a final solo dentro de ±30° del eje. La entrada por barlovento cruza el campo y se usa cuando conviene incorporarse por el tramo opuesto.', { g: 'Integración VFR' });
  };
  // 23. Prioridad para aterrizar
  const PRIO = [['un MAYDAY por fallo de motor', 1], ['una urgencia (PAN PAN) por pasajero indispuesto', 1], ['un MAYDAY FUEL', 1], ['un vuelo hospital (STS/HOSP)', 2], ['un vuelo de búsqueda y salvamento', 3], ['un avión de extinción de incendios', 4], ['un vuelo de policía en misión', 4], ['un vuelo regular sin incidencias', 5], ['un VFR privado', 5], ['una aeronave con combustible mínimo (MINIMUM FUEL)', 5]];
  G.priority = function (rng) {
    let a, b; do { a = pick(rng, PRIO); b = pick(rng, PRIO); } while (a[1] === b[1]);
    const first = a[1] < b[1] ? a : b;
    return single(rng, 'emergencias', `Dos aeronaves quieren aterrizar a la vez: ${a[0]} y ${b[0]}. ¿Cuál tiene prioridad?`, first[0][0].toUpperCase() + first[0].slice(1), [a[0], b[0]].map(x => x[0].toUpperCase() + x.slice(1)).concat(['La que llamó antes']),
      'Orden: 1) seguridad (emergencias, urgencias, MAYDAY FUEL); 2) hospital; 3) SAR; 4) otras misiones operacionales; 5) resto. MINIMUM FUEL no da prioridad.', { g: 'Prioridades' });
  };
  // 24. Pronunciación de indicativos
  G.sayCallsign = function (rng) {
    if (rng() < 0.5) {
      const al = pick(rng, Object.keys(TEL)); const id = String(randint(rng, 1, 9899)); const cs = al + id;
      return single(rng, 'comunicaciones', `¿Cómo se pronuncia el indicativo ${cs}?`, `${TEL[al]} ${R.digits(id)}`, shuffle(rng, [`${spellCs(al)} ${R.digits(id)}`, `${TEL[al]} ${(+id).toLocaleString('es-ES')}`, `${TEL[al]} ${R.digits(id).split(' ').reverse().join(' ')}`]),
        'Designador telefónico del operador + identificación del vuelo cifra a cifra.', { g: 'Indicativos' });
    }
    const reg = 'EC' + String.fromCharCode(65 + randint(rng, 0, 25), 65 + randint(rng, 0, 25), 65 + randint(rng, 0, 25));
    return single(rng, 'comunicaciones', `¿Cómo se pronuncia la matrícula ${reg}?`, spellCs(reg), [spellCs(reg).split(' ').reverse().join(' '), reg.split('').join(' '), spellCs(reg.slice(0, 2)) + ' ' + reg.slice(2)], 'Las matrículas se deletrean con el alfabeto fonético OACI.', { g: 'Indicativos' });
  };
  // 25. Corregir colaciones
  G.readback = function (rng) {
    const cs = callsign(rng); const k = pick(rng, ['qnh', 'sq', 'rwy']);
    let given, heard, label;
    if (k === 'qnh') { const q = randint(rng, 995, 1035); given = 'QNH ' + q; heard = 'QNH ' + (q + pick(rng, [-10, 10, 1, -1])); label = 'el QNH'; }
    else if (k === 'sq') { const c = pad(randint(rng, 1, 7), 1) + pad(randint(rng, 0, 7), 1) + pad(randint(rng, 0, 7), 1) + pad(randint(rng, 1, 7), 1); given = 'responda ' + c; heard = 'responda ' + c.slice(0, 2) + c[3] + c[2]; label = 'el código'; if (heard === given) heard = 'responda ' + c.slice(0, 3) + ((+c[3] % 7) + 1); }
    else { const r = pick(rng, ['24L', '06R', '18R', '36L', '03L', '21R']); given = 'pista ' + r; heard = 'pista ' + r.replace(/[LR]/, m => m === 'L' ? 'R' : 'L'); label = 'la pista'; }
    return single(rng, 'comunicaciones', `Has transmitido ${given} a ${cs} y colaciona "${heard}". ¿Qué respondes?`, `${cs}, negativo, repito ${given}`, [`${cs}, colación correcta`, `${cs}, recibido`, `${cs}, corrección, ${heard}`],
      `Una colación incorrecta se corrige en el acto con NEGATIVO, REPITO y ${label} correcto${label === 'la pista' ? 'a' : ''}.`, { g: 'Colaciones' });
  };
  // 26. Tiempo presente en METAR
  const WX = [['BR', 'Neblina'], ['FG', 'Niebla'], ['HZ', 'Calima'], ['FU', 'Humo'], ['RA', 'Lluvia'], ['-RA', 'Lluvia débil'], ['+RA', 'Lluvia fuerte'], ['DZ', 'Llovizna'], ['SHRA', 'Chubascos de lluvia'], ['TSRA', 'Tormenta con lluvia'], ['TS', 'Tormenta'], ['SN', 'Nieve'], ['GR', 'Granizo'], ['FZFG', 'Niebla engelante'], ['BCFG', 'Bancos de niebla'], ['VCSH', 'Chubascos en las proximidades'], ['DU', 'Polvo'], ['SA', 'Arena']];
  G.metarWx = function (rng) {
    const w = pick(rng, WX); const inv = rng() < 0.3;
    const others = shuffle(rng, WX.filter(x => x !== w)).slice(0, 3);
    return inv ? single(rng, 'meteorologia', `¿Qué grupo de tiempo presente del METAR corresponde a «${w[1].toLowerCase()}»?`, w[0], others.map(x => x[0]), 'Intensidad (- débil, + fuerte), descriptor (SH chubasco, TS tormenta, FZ engelante, BC bancos, VC proximidades) y fenómeno.', { g: 'Tiempo presente' })
      : single(rng, 'meteorologia', `En un METAR aparece «${w[0]}». ¿Qué significa?`, w[1], others.map(x => x[1]), 'Intensidad (- débil, + fuerte), descriptor (SH chubasco, TS tormenta, FZ engelante, BC bancos, VC proximidades) y fenómeno.', { g: 'Tiempo presente' });
  };
  // 27. Separación reducida en la misma pista
  G.reducedSep = function (rng) {
    const C = { 1: 'cat. 1 (monomotor de hélice ≤ 2 000 kg)', 2: 'cat. 2 (monomotor 2 000–7 000 kg o bimotor de hélice < 7 000 kg)', 3: 'cat. 3 (resto)' };
    const a = randint(rng, 1, 3), b = a === 3 ? randint(rng, 1, 3) : randint(rng, 1, 2); const d = a === 3 ? '2 400 m' : b === 1 ? '600 m' : '1 500 m';
    return single(rng, 'gestion-transito', `Separación reducida publicada y con todas sus condiciones cumplidas. Precedente ${C[a]}, siguiente ${C[b]}. ¿Distancia mínima recorrida por el precedente?`, d, ['600 m', '1 500 m', '2 400 m', '3 000 m'],
      'Cat. 1 o 2 → siguiente cat. 1: 600 m; → cat. 2: 1 500 m. Precedente cat. 3: 2 400 m. Nunca entre una salida y una llegada.', { g: 'Separación reducida' });
  };
  // 28. Transferencias y tramos
  G.transfers = function (rng) {
    const c = pick(rng, [
      ['¿Cuándo pasa GND una salida a TWR?', 'Al acercarse al punto de espera', ['Al poner en marcha', 'Ya alineada en pista', 'Tras el despegue']],
      ['¿Cuándo pasa TWR una llegada a GND?', 'Cuando ha abandonado la pista (o se prevé que lo hará sin bloquearla)', ['Al tomar tierra', 'Cuando se detiene en plataforma', 'A 4 NM en final']],
      ['¿Con cuánta antelación transfiere el adyacente un VFR a TWR?', '2 minutos antes de entrar en la zona', ['30 segundos antes', '10 minutos antes', 'Al cruzar el límite del CTR']],
      ['Un VFR sale a espacio no controlado. ¿Qué código y frecuencia le das?', '7000 y UNICOM 122.800', ['7600 y UNICOM 122.800', '2000 y APP', '7000 y la frecuencia de TWR']],
      ['¿Cuándo pone el piloto el transpondedor en TX en IVAO?', 'Al entrar en la pista activa (tolerado en el punto de espera)', ['En plataforma', 'Al pasar 1 000 ft', 'Al recibir la autorización IFR']]
    ]);
    return single(rng, 'gestion-transito', c[0], c[1], c[2], 'Transferencias: salidas a TWR cerca del punto de espera; llegadas a GND al librar; VFR 2 min antes; a espacio no controlado 7000 y UNICOM.', { g: 'Transferencias' });
  };

  G.list = Object.keys(G).filter(k => typeof G[k] === 'function' && k !== 'list');
  // estimación conservadora de combinaciones distintas de cada generador
  G.combos = function () {
    const n = R.AIRCRAFT.length;
    return {
      depWake: n * n * 2, successive: n * n * 2, combinedDeparture: (n - 2) * (n - 2), arrWake: (n - 2) * (n - 2) * 2,
      trl: R.TA_PLACES.length * 76, vmc: 11 * 11 * 2, lvp: 8 * 7 * 6, numbers: 20 + 13 + 10 + 10 + 10 + 13, airspace: 19,
      alert: R.ALERT_CASES.length, metar: 100000, runway: RWY_CASES.length, qnh: 11 * 56, fpl: 300, setting: 2000, callsign: 17600,
      wind: 23 * 36 * 20 * 2, timeDistance: 11 * 9, rwyPhrase: 23 * 9 * 17 * 4 * 2, conditional: (n - 2) * 23 * 2, squawkCodes: 10, vfrJoin: 6 * 10 * 3,
      priority: 80, sayCallsign: 12 * 9899 + 17576, readback: 3000, metarWx: WX.length * 2, reducedSep: 7, transfers: 5
    };
  };
  G.generate = function (rng, name) { return G[name || pick(rng, G.list)](rng); };
  G.mulberry32 = function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

  if (typeof module !== 'undefined' && module.exports) module.exports = G;
  else root.ADC_GEN = G;
})(typeof window !== 'undefined' ? window : globalThis);
