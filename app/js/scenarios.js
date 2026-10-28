/* Escenarios generados para "Torre en vivo".
   Cada escenario es una familia de situaciones paramétricas (aeródromo, pista, viento,
   tipos de aeronave, distancias…). En cada partida se eligen MAX_STEPS situaciones
   distintas de la familia, todas sobre el mismo aeródromo y configuración.
   Los cálculos de separación salen de rules.js. */
(function (root) {
  'use strict';
  const R = (typeof module !== 'undefined' && module.exports) ? require('./rules.js') : root.ADC_RULES;
  const MAX_STEPS = 5;

  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  const randint = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
  function shuffle(rng, arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const pad = (n, w) => String(n).padStart(w, '0');
  const fmtMin = m => String(m).replace('.', ',') + ' min';
  const tt = n => (n < 0 ? 'M' : '') + pad(Math.abs(n), 2); // temperatura METAR
  const plural = (n, s, p) => n + ' ' + (n === 1 ? s : p);

  // ---------- Aeródromos ----------
  const APTS = [
    { icao: 'LEMD', city: 'Madrid', rwys: ['32L', '32R', '36L', '36R', '18L', '18R', '14L', '14R'] },
    { icao: 'LEBL', city: 'Barcelona', rwys: ['24R', '24L', '06L', '06R', '02', '20'] },
    { icao: 'LEPA', city: 'Palma', rwys: ['24L', '24R', '06L', '06R'] },
    { icao: 'LEMG', city: 'Málaga', rwys: ['13', '31', '12', '30'] },
    { icao: 'GCLP', city: 'Gran Canaria', rwys: ['03L', '03R', '21L', '21R'] },
    { icao: 'GCXO', city: 'Tenerife Norte', rwys: ['12', '30'] },
    { icao: 'GCRR', city: 'Lanzarote', rwys: ['03', '21'] },
    { icao: 'LEBB', city: 'Bilbao', rwys: ['30', '12'] },
    { icao: 'LEVC', city: 'Valencia', rwys: ['30', '12'] },
    { icao: 'LEAL', city: 'Alicante', rwys: ['10', '28'] },
    { icao: 'LEZL', city: 'Sevilla', rwys: ['27', '09'] },
    { icao: 'LEST', city: 'Santiago', rwys: ['17', '35'] },
    { icao: 'LEVX', city: 'Vigo', rwys: ['01', '19'] },
    { icao: 'LEZG', city: 'Zaragoza', rwys: ['30L', '30R', '12L', '12R'] },
    { icao: 'LEBZ', city: 'Badajoz', rwys: ['31', '13'] },
    { icao: 'LEIB', city: 'Ibiza', rwys: ['24', '06'] },
    { icao: 'LEGE', city: 'Girona', rwys: ['20', '02'] },
    { icao: 'LERS', city: 'Reus', rwys: ['25', '07'] },
    { icao: 'LEMH', city: 'Menorca', rwys: ['01', '19'] },
    { icao: 'LEJR', city: 'Jerez', rwys: ['20', '02'] },
    { icao: 'LESO', city: 'San Sebastián', rwys: ['04', '22'] },
    { icao: 'LEGR', city: 'Granada', rwys: ['09', '27'] }
  ];
  const AIRLINES = ['IBE', 'VLG', 'AEA', 'RYR', 'BAW', 'DLH', 'AFR', 'IBS', 'ANE', 'BTI', 'KLM', 'EZY', 'TAP', 'SWR', 'TOM', 'EWG', 'NAX', 'BEL'];
  const VFR_POINTS = ['N', 'S', 'E', 'W'];
  const CIRCUIT_LEGS = { dw: 'viento en cola', base: 'base', crosswind: 'viento cruzado', final: 'final' };

  const AC = t => R.AIRCRAFT.find(a => a.t === t);
  const LIGHT_VFR = ['C172', 'P28A', 'SR22', 'DA42', 'TB20'].map(AC);
  const AIRLINERS = R.AIRCRAFT.filter(a => a.wake !== 'L' && a.speed !== 'muyrapida' && a.t !== 'C130' && a.t !== 'A400');
  const IFR_POOL = R.AIRCRAFT.filter(a => a.speed !== 'muyrapida' && a.kind !== 'helicóptero');
  const MEDIUM_JETS = R.AIRCRAFT.filter(a => a.wake === 'M' && a.speed === 'rapida');
  const HEAVIES = R.AIRCRAFT.filter(a => a.wake === 'H' || a.wake === 'J');

  // ---------- Contexto de partida ----------
  // Un contexto = aeródromo + pista + viento + QNH. Lleva un registro de indicativos
  // para no repetirlos y para poder "normalizar" las situaciones al contarlas.
  function makeCtx(rng, opts) {
    opts = opts || {};
    const apt = opts.apt || pick(rng, APTS);
    const rwy = opts.rwy || pick(rng, apt.rwys);
    const hdg = (+rwy.replace(/[LCR]/, '')) * 10;
    let dir = Math.round((hdg + randint(rng, -40, 40)) / 10) * 10; dir = ((dir % 360) + 360) % 360 || 360;
    const spd = randint(rng, 3, 17); const gust = spd >= 8 && rng() < 0.25 ? spd + randint(rng, 9, 14) : null;
    const qnh = randint(rng, 996, 1032);
    const used = new Set();
    const c = {
      rng, apt, rwy, hdg, wind: { dir, spd, gust }, qnh, used,
      twr: apt.city + ' Torre',
      app: apt.city + ' Aproximación',
      // indicativos
      cs(kind) {
        let s;
        do {
          if (kind === 'vfr') s = 'EC' + String.fromCharCode(65 + randint(rng, 0, 25), 65 + randint(rng, 0, 25), 65 + randint(rng, 0, 25));
          else s = pick(rng, AIRLINES) + (rng() < 0.75 ? randint(rng, 100, 9899) : randint(rng, 1, 99) + String.fromCharCode(65 + randint(rng, 0, 25), 65 + randint(rng, 0, 25)));
        } while (used.has(s));
        used.add(s); return s;
      },
      csFor(a) { return this.cs(a.wake === 'L' && a.kind !== 'turbohélice' ? 'vfr' : 'ifr'); },
      windStr(w) {
        w = w || this.wind;
        if (w.spd < 3) return 'viento calma';
        return `viento ${pad(w.dir, 3)} grados ${w.spd} nudos${w.gust ? ' rachas ' + w.gust : ''}`;
      },
      metarWind(w) { w = w || this.wind; return `${pad(w.dir, 3)}${pad(w.spd, 2)}${w.gust ? 'G' + w.gust : ''}KT`; },
      tko(cs, r) { return `${cs}, ${this.windStr()}, pista ${r || this.rwy} autorizado a despegar`; },
      ldg(cs, r) { return `${cs}, ${this.windStr()}, pista ${r || this.rwy} autorizado a aterrizar`; }
    };
    const t = randint(rng, 8, 28);
    c.metar = opts.metar || `${apt.icao} ${pad(randint(rng, 1, 28), 2)}${pad(randint(rng, 6, 20), 2)}00Z ${c.metarWind()} 9999 ${pick(rng, ['FEW025', 'SCT030', 'FEW040', 'SCT035', 'NSC'])} ${tt(t)}/${tt(t - randint(rng, 3, 12))} Q${pad(c.qnh, 4)}`;
    return c;
  }
  const recip = r => { const m = /^(\d+)([LCR]?)$/.exec(r); const n = (+m[1] + 18 - 1) % 36 + 1; return pad(n, 2) + ({ L: 'R', R: 'L', C: 'C', '': '' })[m[2]]; };

  // ---------- Construcción de pasos ----------
  const P = (cs, ac, pos, st) => { const o = { cs, ac: ac.t || ac, pos }; if (st) o.st = st; return o; };
  // respuesta única: correcta + hasta 3 distractores distintos
  function step(scene, sit, q, correct, wrongs, e, sev, extra) {
    const o = [correct];
    for (const w of wrongs) if (w != null && !o.includes(w) && o.length < 4) o.push(w);
    return Object.assign({ scene, sit, q, o, a: [0], e, sev: sev || 'minor' }, extra || {});
  }
  // respuesta múltiple
  function multi(scene, sit, q, rights, wrongs, e, sev, extra) {
    const o = rights.slice(); for (const w of wrongs) if (!o.includes(w) && o.length < 5) o.push(w);
    return Object.assign({ scene, sit, q, o, a: rights.map((_, i) => i), m: true, e, sev: sev || 'minor' }, extra || {});
  }
  const lbl = a => `${a.t}`;
  const full = a => `${a.name}`;

  // ---------- Separación entre salidas (igual que el puzzle de secuencia) ----------
  const SUJETA_PEN = 3;
  function depGap(a, b, inter) {
    const w = R.depWake(a, b, !!inter) || 0; const s = R.successive(a, b);
    if (s.sujeta) return { min: Math.max(w, SUJETA_PEN), w, suj: true };
    return { min: Math.max(w, s.min), w, s: s.min };
  }
  const gapWhy = g => g.suj ? `sujeta${g.w ? ' (y estela ' + fmtMin(g.w) + ')' : ''}` : `estela ${g.w ? fmtMin(g.w) : 'no aplica'}, sucesivas ${fmtMin(g.s)} → ${fmtMin(g.min)}`;

  // =====================================================================
  //  FAMILIAS
  // =====================================================================
  const F = [];
  const fam = (id, title, cat, diff, desc, setup, sits) => F.push({ id, title, cat, diff, desc, setup, sits });

  // ---------------------------------------------------------------------
  fam('g-salidas', 'Hora punta: salidas IFR', 'Separaciones', 1,
    'Orden de salidas, estela, intersecciones, alineaciones con llegadas en final y fraseología de despegue.',
    c => ({ notes: 'APP radar conectado. Separación genérica en tiempo. Salidas sueltas salvo aviso.' }), {
      orden(c) {
        const rng = c.rng; let p, x, y;
        do { p = pick(rng, IFR_POOL); x = pick(rng, IFR_POOL); y = pick(rng, IFR_POOL); } while (x.t === y.t || x.wake === 'L' && y.wake === 'L');
        const pc = c.csFor(p), xc = c.csFor(x), yc = c.csFor(y);
        const gx1 = depGap(p, x), gx2 = depGap(x, y), gy1 = depGap(p, y), gy2 = depGap(y, x);
        const ns = (g, h) => (g.suj ? 1 : 0) + (h.suj ? 1 : 0);
        const A = { suj: ns(gx1, gx2), t: gx1.min + gx2.min }, B = { suj: ns(gy1, gy2), t: gy1.min + gy2.min };
        const better = A.suj !== B.suj ? (A.suj < B.suj ? 'x' : 'y') : (A.t === B.t ? 'eq' : (A.t < B.t ? 'x' : 'y'));
        const ox = `${xc} primero y luego ${yc}`, oy = `${yc} primero y luego ${xc}`, eq = 'Da igual el orden';
        const correct = better === 'x' ? ox : better === 'y' ? oy : eq;
        const e = `Tras ${p.t}: ${x.t} (${gapWhy(gx1)}), luego ${y.t} (${gapWhy(gx2)}) = ${fmtMin(A.t)}${A.suj ? ', con salida sujeta' : ''}. ` +
          `Al revés: ${y.t} (${gapWhy(gy1)}), luego ${x.t} (${gapWhy(gy2)}) = ${fmtMin(B.t)}${B.suj ? ', con salida sujeta' : ''}. Una salida sujeta cuenta como peor opción.`;
        return step([P(pc, p, 'rwy:0.9', 'air'), P(xc, x, 'hp'), P(yc, y, 'hp2')],
          `${pc} (${p.t}) acaba de despegar desde cabecera. En el punto de espera esperan ${xc} (${full(x)}) y ${yc} (${full(y)}), ambos IFR por la misma SID.`,
          '¿Qué orden de salida minimiza la demora sin dejar salidas sujetas innecesariamente?', correct, [ox, oy, eq], e, 'minor');
      },
      espera(c) {
        const rng = c.rng; let p, x, w;
        do { p = pick(rng, IFR_POOL); x = pick(rng, IFR_POOL); w = R.depWake(p, x, false); } while (p.t === x.t);
        const s = R.successive(p, x); const pc = c.csFor(p), xc = c.csFor(x);
        const SUJ = 'Queda sujeta: pido la suelta a APP';
        let correct, e;
        if (s.sujeta) { correct = SUJ; e = `${R.SPEED_NAME[x.speed]} detrás de ${R.SPEED_NAME[p.speed].toLowerCase()}: la tabla de sucesivas la deja sujeta${w ? ` (y además hay ${fmtMin(w)} de estela)` : ''}.`; }
        else { const v = Math.max(w, s.min); correct = fmtMin(v); e = `Estela: ${w ? fmtMin(w) : 'no aplica'} (${R.WAKE_NAME[x.wake]} tras ${R.WAKE_NAME[R.leadingWake(p)].toLowerCase()}). Sucesivas: ${fmtMin(s.min)} (${R.SPEED_NAME[x.speed].toLowerCase()} tras ${R.SPEED_NAME[p.speed].toLowerCase()}). Se aplica la más restrictiva.`; }
        return step([P(pc, p, 'rwy:1.0', 'air'), P(xc, x, 'rwy:0.05')],
          `${pc} (${full(p)}) acaba de iniciar la carrera de despegue desde cabecera. ${xc} (${full(x)}), IFR por la misma SID, está alineado detrás también desde cabecera.`,
          `¿Cuánto tiempo, como mínimo, debe pasar antes de autorizar el despegue de ${xc}?`, correct, shuffle(rng, ['1,5 min', '2 min', '3 min', '4 min', SUJ]), e, 'loss');
      },
      frase(c) {
        const a = pick(c.rng, IFR_POOL), cs = c.csFor(a);
        return step([P(cs, a, 'rwy:0.05')], `${cs} (${a.t}) está alineado en la pista ${c.rwy}; la separación con la salida anterior ya se cumple y la autorización de salida está colacionada.`,
          '¿Qué le transmites?', c.tko(cs),
          shuffle(c.rng, [`${cs}, autorizado a despegar`, `${cs}, pista ${c.rwy} despegue aprobado`, `${cs}, despegue a discreción, ${c.windStr()}`, `${cs}, ${c.windStr()}, pista ${c.rwy} listo para despegar`]),
          'Autorización de despegue: designador de pista y SIEMPRE el viento en superficie. "Aprobado" o "a discreción" no son autorizaciones de pista.');
      },
      interseccion(c) {
        const rng = c.rng; let p, x, v;
        do { p = pick(rng, IFR_POOL.filter(a => a.wake !== 'L')); x = pick(rng, IFR_POOL); v = R.depWake(p, x, true); } while (v === null || p.t === x.t);
        const pc = c.csFor(p), xc = c.csFor(x);
        const correct = v === 0 ? 'No aplica separación por estela' : fmtMin(v);
        const e = v === 0 ? `${R.WAKE_NAME[x.wake]} detrás de ${R.WAKE_NAME[R.leadingWake(p)].toLowerCase()}: la segunda no es de menor categoría, no hay estela.` :
          `${R.WAKE_NAME[x.wake]} tras ${R.WAKE_NAME[R.leadingWake(p)].toLowerCase()}${p.heavyWhenLeading ? ' (el B757 cuenta como pesado cuando va delante)' : ''}: ${fmtMin(v - 1)} desde pista completa, +1 min por salir de una intersección más adelantada = ${fmtMin(v)}.`;
        return step([P(pc, p, 'rwy:0.95', 'air'), P(xc, x, 'hp3')],
          `${pc} (${full(p)}) acaba de despegar desde cabecera. ${xc} (${full(x)}) pide salir desde una intersección más adelantada; conoces su TORA y le basta.`,
          `¿Qué separación por estela aplicas a ${xc}?`, correct, shuffle(rng, ['No aplica separación por estela', '2 min', '3 min', '4 min']), e, 'loss');
      },
      tora(c) {
        const a = pick(c.rng, IFR_POOL), cs = c.csFor(a); const who = c.rng() < 0.5;
        if (who) return step([P(cs, a, 'hp3')], `Hay cola en cabecera. Quieres proponer a ${cs} (${a.t}) que salga desde una intersección para agilizar.`,
          '¿Cómo debes hacerlo?', 'Proponérselo informando de la TORA desde esa intersección; el piloto decide si le basta',
          ['Ordenárselo: la intersección la decide el controlador', 'Autorizarle directamente desde la intersección sin más datos', 'Pedir permiso a APP antes de proponerlo'],
          'El ATC puede proponer una intersección informando de la TORA, pero no imponerla (salvo por seguridad) ni autorizar sin conocer las distancias declaradas.');
        return step([P(cs, a, 'hp3')], `${cs} (${a.t}) pide salir desde una intersección para ahorrar rodaje.`,
          'Antes de autorizarle desde allí necesitas…', 'Conocer la TORA (distancias declaradas) desde esa intersección', ['Permiso de APP', 'Que el viento esté en calma', 'Nada especial: lo ha pedido el piloto'],
          'Nunca se autoriza un despegue desde intersección sin conocer su TORA, TODA y ASDA.');
      },
      alinear(c) {
        const rng = c.rng; const arr = pick(rng, AIRLINERS), dep = pick(rng, IFR_POOL); const ac = c.csFor(arr), dc = c.csFor(dep);
        const d = pick(rng, [2, 3, 4, 5, 8, 9, 10, 12, 14]); const cleared = d >= 8 && rng() < 0.35;
        const ok = d >= 8 && !cleared;
        const yes = `Sí: "${dc}, alinee y mantenga pista ${c.rwy}"`;
        const no = cleared ? 'No: ya hay una autorización de aterrizaje emitida; como mucho, alineación condicional detrás de la llegada' : 'No: la llegada está demasiado cerca; la salida espera en el punto de espera';
        const e = cleared ? 'Con una autorización de aterrizaje emitida no se alinea a nadie en esa pista (se puede usar la condicional "detrás").' :
          ok ? `Con el IFR a ${d} NM y sin autorización de aterrizaje emitida, se puede alinear (y despegar si la separación lo permite).` : `Con un IFR a ${d} NM (menos de 5–6 NM) no se alinea a una salida.`;
        return step([P(ac, arr, 'final:' + d, 'air'), P(dc, dep, 'hp')],
          `${ac} (${arr.t}) está establecido en final a ${d} NM${cleared ? ' y ya le has autorizado a aterrizar' : ''}. ${dc} (${dep.t}) notifica listo en el punto de espera.`,
          `¿Puedes alinear a ${dc}?`, ok ? yes : no, [ok ? no : yes, 'Sí, alineado y autorizado a despegar en cuanto esté en pista', 'Solo si APP lo aprueba'], e, 'loss');
      },
      condicional(c) {
        const rng = c.rng; const arr = pick(rng, AIRLINERS), dep = pick(rng, IFR_POOL); const ac = c.csFor(arr), dc = c.csFor(dep);
        const r = c.rwy;
        return step([P(ac, arr, 'final:2', 'air'), P(dc, dep, 'hp')],
          `${ac} (${arr.t}) está en corta final y autorizado a aterrizar. ${dc} está listo en el punto de espera y tiene la llegada a la vista.`,
          'Quieres ganar tiempo con una alineación condicional. ¿Cuál es la fraseología correcta?',
          `${dc}, detrás del ${arr.t} en final, entre y mantenga pista ${r}, detrás`,
          [`${dc}, entre y mantenga pista ${r} detrás del ${arr.t}`, `${dc}, detrás del ${arr.t} en final, autorizado a despegar, detrás`, `${dc}, alinee y mantenga pista ${r}, el ${arr.t} está en final`],
          'Condicional = condición + instrucción + reiteración de la condición ("detrás"). Nunca se condiciona una autorización de despegue.');
      },
      cancelar(c) {
        const rng = c.rng; const a = pick(rng, IFR_POOL), cs = c.csFor(a); const rolling = rng() < 0.5;
        const why = pick(rng, ['un vehículo de mantenimiento entra en la pista sin autorización', 'una aeronave rebasa la barra de parada de un punto de espera intermedio', 'un perro cruza la pista a mitad de su longitud']);
        const cancel = `${cs}, mantenga posición, cancele despegue, repito, cancele despegue`;
        const abort = `${cs}, aborte despegue, ${cs}, aborte despegue`;
        return step([P(cs, a, rolling ? 'rwy:0.3' : 'rwy:0.05', rolling ? 'roll' : null)],
          `Has autorizado a despegar a ${cs} (${a.t}) ${rolling ? 'y acaba de iniciar la carrera a baja velocidad' : 'pero aún no ha iniciado la carrera'}. De repente ${why}.`,
          '¿Qué transmites?', rolling ? abort : cancel, [rolling ? cancel : abort, `${cs}, motor y al aire`, `${cs}, precaución, obstáculo en pista, continúe`],
          rolling ? 'Ya en carrera: "ABORTE DESPEGUE" dos veces, con el indicativo (STOP IMMEDIATELY).' : 'Sin iniciar la carrera: "MANTENGA POSICIÓN, CANCELE DESPEGUE, REPITO, CANCELE DESPEGUE" (y luego el motivo).', 'loss');
      }
    });

  // ---------------------------------------------------------------------
  fam('g-llegadas', 'Llegadas, estela y pista ocupada', 'Separaciones', 2,
    'Estela en llegada (radar y convencional), autorizaciones tardías, frustradas e intercalar VFR.',
    c => ({ notes: c.rng() < 0.5 ? 'APP con vigilancia radar.' : 'APP convencional (sin radar).' }), {
      estela(c) {
        const rng = c.rng; const radar = rng() < 0.5; let a, b, v;
        do { a = pick(rng, IFR_POOL); b = pick(rng, IFR_POOL); v = R.arrWake(a, b, radar); } while (a.t === b.t || (v === 0 && rng() < 0.6));
        const ac = c.csFor(a), bc = c.csFor(b); const u = radar ? ' NM' : ' min';
        const correct = v === 0 ? 'No aplica separación por estela' : v + u;
        const pool = radar ? ['4 NM', '5 NM', '6 NM', '7 NM', '8 NM'] : ['2 min', '3 min', '4 min', '5 min'];
        return step([P(ac, a, 'final:3', 'air'), P(bc, b, 'final:9', 'air')],
          `Dos llegadas IFR a la pista ${c.rwy}: ${ac} (${full(a)}) y detrás ${bc} (${full(b)}). APP presta servicio ${radar ? 'con vigilancia radar' : 'convencional (sin radar)'}.`,
          `¿Separación mínima por estela entre ${ac} y ${bc}?`, correct, shuffle(rng, pool.concat(['No aplica separación por estela'])),
          `Primera ${R.WAKE_NAME[R.leadingWake(a)].toLowerCase()}${a.heavyWhenLeading ? ' (B757 delante = pesado)' : ''}, segunda ${R.WAKE_NAME[b.wake].toLowerCase()}. ${radar ? 'Radar → distancia.' : 'Convencional → tiempo.'}${v === 0 ? ' La segunda no es menor (pesada tras pesada solo aplica en distancia: 4 NM).' : ''}`, 'loss');
      },
      local(c) {
        const rng = c.rng; let a, b, v;
        do { a = pick(rng, AIRLINERS); b = pick(rng, AIRLINERS); v = R.arrWake(a, b, true); } while (a.t === b.t);
        const loc = pick(rng, [3, 4, 5, 6, 8]); const res = Math.max(v, loc);
        return step([P(c.csFor(a), a, 'final:4', 'air'), P(c.csFor(b), b, 'final:10', 'air')],
          `Procedimiento local de llegadas sucesivas: ${loc} NM. APP radar te entrega un ${full(a)} seguido de un ${full(b)} a la misma pista.`,
          '¿Qué separación mínima debe haber entre ambos?', res + ' NM', shuffle(rng, ['3 NM', '4 NM', '5 NM', '6 NM', '7 NM', '8 NM']),
          `Estela: ${v ? v + ' NM' : 'no aplica'}. Local: ${loc} NM. Se aplica la mayor de las dos.`);
      },
      frase(c) {
        const a = pick(c.rng, AIRLINERS), cs = c.csFor(a); const d = randint(c.rng, 3, 6);
        return step([P(cs, a, 'final:' + d, 'air')], `${cs}: "${c.twr}, ${cs}, establecido ILS pista ${c.rwy}, ${d} millas". La pista está libre.`,
          '¿Qué le respondes?', c.ldg(cs), shuffle(c.rng, [`${cs}, autorizado a aterrizar`, `${cs}, pista ${c.rwy}, aterrizaje aprobado`, `${cs}, continúe aproximación, ${c.windStr()}`, `${cs}, aterrice a discreción, pista ${c.rwy}`]),
          'Autorización de aterrizaje con designador de pista y viento en superficie.');
      },
      ocupada(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a); const b = pick(rng, IFR_POOL), bc = c.csFor(b);
        const blk = pick(rng, [
          [`${bc} (${b.t}) está en carrera de despegue`, 'tránsito saliendo', P(bc, b, 'rwy:0.4', 'roll')],
          [`${bc} (${b.t}) aterrizó y aún rueda por la pista para salir por la última calle`, 'tránsito en pista', P(bc, b, 'rwy:0.7')],
          [`${bc} (${b.t}) está cruzando la pista por la calle central`, 'tránsito cruzando la pista', P(bc, b, 'rwy:0.5')]]);
        const d = randint(rng, 3, 5);
        return step([P(cs, a, 'final:' + d, 'air'), blk[2]], `${blk[0]}. ${cs} (${a.t}) llama en final a ${d} NM.`, '¿Qué le respondes?',
          `${cs}, continúe aproximación, número uno, ${blk[1]}, prevea autorización tardía, ${c.windStr()}`,
          [c.ldg(cs), `${cs}, motor y al aire`, `${cs}, orbite a la derecha`],
          'Pista ocupada: "continúe aproximación". La autorización llega en cuanto la pista quede libre; si se prevé tardía, se da el viento. Si no se libera a tiempo: motor y al aire.', 'loss');
      },
      segunda(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), b = pick(rng, AIRLINERS); const ac = c.csFor(a), bc = c.csFor(b);
        return step([P(ac, a, 'final:1', 'air'), P(bc, b, 'final:5', 'air')],
          `${ac} (${a.t}) está autorizado a aterrizar y en corta final. ${bc} (${b.t}) llama en final a 5 NM.`, `¿Qué le dices a ${bc}?`,
          `${bc}, continúe aproximación, número dos, tránsito ${a.t} en corta final`,
          [c.ldg(bc), `${bc}, detrás del ${a.t} en corta final, autorizado a aterrizar`, `${bc}, motor y al aire`],
          'No se autoriza a la siguiente hasta que la anterior haya aterrizado y librado la pista (la autorización anticipada "detrás de…" solo existe donde el RCA la permite).', 'loss');
      },
      incursion(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a); const d = randint(rng, 1, 3);
        const what = pick(rng, ['un vehículo de bomberos entra en la pista sin autorización', 'una aeronave en rodaje rebasa la barra de parada y entra en la pista', 'te informan de restos de neumático en la zona de toma']);
        return step([P(cs, a, 'final:' + d, 'air')], `${cs} (${a.t}) está autorizado a aterrizar a ${d} NM. ${what[0].toUpperCase() + what.slice(1)}.`, '¿Qué haces?',
          `${cs}, motor y al aire (y le das instrucciones de frustrada e informas a APP)`,
          [`${cs}, continúe, prevea pista libre`, `${cs}, aterrice con precaución`, 'Nada: ya está autorizado y la responsabilidad es del piloto'],
          'Si con un aterrizaje autorizado TWR sabe de una incursión u obstrucción en la pista, debe ordenar MOTOR Y AL AIRE.', 'loss');
      },
      vfr(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS.filter(x => x.wake !== 'L')), v = pick(rng, LIGHT_VFR); const ac = c.csFor(a), vc = c.cs('vfr');
        const cat = { M: 'media', H: 'pesada', J: 'super' }[R.leadingWake(a)];
        return step([P(ac, a, 'final:3', 'air'), P(vc, v, 'base', 'air')],
          `Quieres meter a ${vc} (${v.t}, VFR) detrás de ${ac} (${full(a)}) en final. ${vc} tiene el tránsito a la vista.`, `¿Qué le transmites a ${vc}?`,
          `${vc}, número dos, siga al ${a.t} en final pista ${c.rwy}, precaución estela turbulenta ${cat}`,
          [`${vc}, número dos, mantenga ${R.arrWake(a, v, true) || 5} NM detrás del ${a.t}`, `${vc}, detrás del ${a.t}, autorizado a aterrizar`, `${vc}, orbite hasta que el ${a.t} haya aterrizado`],
          'A los VFR que aterrizan detrás de una media o pesada no se les da separación por estela: número en la secuencia + a quién sigue + "precaución estela turbulenta". El piloto es responsable.');
      },
      pesada(c) {
        const rng = c.rng; const heavy = rng() < 0.5; const a = heavy ? pick(rng, HEAVIES) : pick(rng, LIGHT_VFR); const cs = c.csFor(a);
        return step([P(cs, a, 'final:4', 'air')], `Hay una salida esperando y quieres agilizar. ${cs} (${full(a)}) está en final a una pista larga.`,
          `¿Puedes pedir a ${cs} que aterrice más allá de la zona de toma de contacto?`,
          heavy ? 'No: nunca se pide a una pesada aterrizar más allá de la zona de toma' : 'Sí, se le puede pedir (el piloto acepta o no)',
          [heavy ? 'Sí, se le puede pedir (el piloto acepta o no)' : 'No: nunca se pide a una pesada aterrizar más allá de la zona de toma', 'Solo con autorización de APP', 'Sí, y es obligatorio que lo acepte'],
          'Para agilizar se puede pedir aterrizar más allá de la zona de toma (p. ej. a un VFR en pista larga), pero NUNCA a una aeronave pesada.');
      }
    });

  // ---------------------------------------------------------------------
  fam('g-sujeta', 'Sujeta y suelta', 'Sujeta/suelta', 2,
    'Cuándo una salida queda sujeta, cómo pedir la suelta, sueltas condicionales y aeródromos sin APP.',
    c => ({ notes: `${c.app} conectado. Coordinación: salidas sueltas salvo aviso.` }), {
      frustrada(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), d = pick(rng, IFR_POOL); const ac = c.csFor(a), dc = c.csFor(d);
        return step([P(ac, a, 'final:1', 'air'), P(dc, d, 'hp')], `${ac} (${a.t}), en corta final: "Motor y al aire, ${ac}". ${dc} (${d.t}) está en el punto de espera listo para salir.`,
          `¿Qué pasa con ${dc}?`, 'Queda sujeta automáticamente: pido la suelta a APP antes de autorizarla',
          ['La autorizo a despegar: estaba suelta', 'La alineo y despega a los 2 min de la frustrada', 'Vuelve a plataforma hasta que aterrice la frustrada'],
          'Tras una aproximación frustrada, la siguiente salida IFR queda sujeta aunque la coordinación fuera "sueltas salvo aviso".', 'loss');
      },
      tabla(c) {
        const rng = c.rng; let p, x;
        do { p = pick(rng, R.AIRCRAFT.filter(a => a.kind !== 'helicóptero')); x = pick(rng, R.AIRCRAFT.filter(a => a.kind !== 'helicóptero')); } while (p.t === x.t || (!R.successive(p, x).sujeta && rng() < 0.4));
        const s = R.successive(p, x), pc = c.csFor(p), xc = c.csFor(x);
        const suj = 'Sujeta: hay que pedir la suelta a APP';
        const correct = s.sujeta ? suj : `Suelta: basta con aplicar ${fmtMin(s.min)} / ${s.nm} NM (y la estela)`;
        const e = s.sujeta ? (x.speed === 'muyrapida' ? 'Una segunda muy rápida queda siempre sujeta.' : p.speed === 'lenta' ? 'Detrás de una lenta, la salida siguiente queda sujeta.' : 'La segunda es más rápida que la primera: la alcanzaría, queda sujeta.')
          : `${R.SPEED_NAME[x.speed]} tras ${R.SPEED_NAME[p.speed].toLowerCase()}: ${fmtMin(s.min)} / ${s.nm} NM según la tabla genérica.`;
        const wrongs = [suj, 'Suelta: basta con aplicar 1,5 min / 2 NM (y la estela)', 'Suelta: basta con aplicar 2 min / 4 NM (y la estela)', 'Suelta: basta con aplicar 2 min / 3 NM (y la estela)', 'Suelta: basta con aplicar 1,5 min / 3 NM (y la estela)'];
        return step([P(pc, p, 'climb', 'air'), P(xc, x, 'hp')], `Aeródromo sin procedimiento local. ${pc} (${full(p)}, ${R.SPEED_NAME[p.speed].toLowerCase()}) acaba de despegar. ${xc} (${full(x)}, ${R.SPEED_NAME[x.speed].toLowerCase()}) es la siguiente salida IFR por la misma SID.`,
          `Según la tabla de salidas sucesivas, ${xc}…`, correct, shuffle(rng, wrongs), e, 'loss');
      },
      sinApp(c) {
        const rng = c.rng; const p = pick(rng, IFR_POOL.filter(a => a.speed !== 'rapida')); const x = pick(rng, MEDIUM_JETS); const t = randint(rng, 2, 7);
        const pc = c.csFor(p), xc = c.csFor(x); const ok = t >= 5;
        return step([P(pc, p, 'climb', 'air'), P(xc, x, 'hp')], `No hay APP conectado. ${pc} (${p.t}, ${R.SPEED_NAME[p.speed].toLowerCase()}) despegó hace ${plural(t, 'minuto', 'minutos')}. ${xc} (${x.t}, rápida) está listo por la misma SID.`,
          `¿Puedes autorizar ya el despegue de ${xc}?`, ok ? 'Sí: sin APP, la salida sujeta se considera suelta a los 5 minutos' : `No: sin APP, la salida sujeta se considera suelta a los 5 minutos; faltan ${plural(5 - t, 'minuto', 'minutos')}`,
          [ok ? 'No: sin APP no puede salir nunca' : 'Sí: sin APP nadie puede sujetarla', 'Sí, tras 2 minutos como en la tabla rápida-rápida', 'Solo si el piloto acepta la responsabilidad'],
          'Rápida tras media o lenta: sujeta. Si no hay APP conectado, una salida sujeta según la tabla se considera suelta a los 5 minutos.', 'loss');
      },
      condicional(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a); const kind = rng() < 0.5;
        const alt = pick(rng, [3000, 4000, 5000, 6000, 7000]); const hdg = pick(rng, [90, 120, 150, 180, 210, 240, 270, 300, 330, 360]);
        const instr = kind ? `ascenso inicial altitud ${alt} pies` : `después de la salida vire ${pick(rng, ['derecha', 'izquierda'])} rumbo ${pad(hdg, 3)}`;
        return step([P(cs, a, 'hp')], `APP te da la suelta de ${cs} (${a.t}) con una condición: "${cs} suelto, ${instr} en lugar de lo publicado".`, `¿Qué haces antes de autorizar el despegue de ${cs}?`,
          `Le reautorizo ("${cs}, enmiende autorización de salida, ${instr}") y espero su colación`,
          ['Nada: el cambio va implícito en la autorización de despegue', `Le autorizo a despegar y le digo "${instr}" cuando esté en el aire`, 'Se lo dirá APP cuando contacte'],
          'Suelta condicional: TWR debe reautorizar la salida y obtener la colación ANTES de emitir el despegue.');
      },
      todas(c) {
        const rng = c.rng; const p = pick(rng, AIRLINERS), x = pick(rng, IFR_POOL); const pc = c.csFor(p), xc = c.csFor(x);
        return step([P(pc, p, 'climb', 'air'), P(xc, x, 'hp')], `La coordinación con APP hoy es "todas sujetas". ${pc} (${p.t}) acaba de despegar y APP da la suelta de ${xc} (${x.t}).`,
          'Una vez suelta, ¿aplicas la tabla de salidas sucesivas?', 'No: APP ya la ha tenido en cuenta al dar la suelta; autorizo el despegue',
          ['Sí, además de la suelta hay que aplicar la tabla', 'Espero 5 minutos por seguridad', 'Pido una segunda suelta tras aplicar la tabla'],
          'Con "todas sujetas", TWR pide la suelta de cada una; una vez dada, despega sin aplicar la tabla de sucesivas.');
      },
      intercalada(c) {
        const rng = c.rng; const p = pick(rng, AIRLINERS.filter(a => a.speed === 'media')); const x = pick(rng, MEDIUM_JETS); const l = pick(rng, AIRLINERS);
        if (!p) return null;
        const pc = c.csFor(p), xc = c.csFor(x), lc = c.csFor(l);
        return step([P(lc, l, 'rwy:0.6'), P(xc, x, 'hp'), P(pc, p, 'climb', 'air')], `${pc} (${p.t}, turbohélice) despegó, después aterrizó ${lc} (${l.t}) y ahora ${xc} (${x.t}, reactor) está listo por la misma SID que el ${p.t}.`,
          `¿Sigue aplicando la tabla de sucesivas entre ${pc} y ${xc}?`, `Sí: aunque se intercale una llegada, ${xc} queda sujeta respecto a ${pc}`,
          ['No: la llegada intercalada "reinicia" la secuencia', 'No: solo aplica entre salidas consecutivas en pista', 'Solo si APP lo pide expresamente'],
          'La separación entre salidas sucesivas se aplica aunque se intercale una llegada. Rápida tras media: sujeta.', 'loss');
      },
      contraria(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a); const r2 = recip(c.rwy);
        return multi([P(cs, a, 'apron')], `${cs} (${a.t}, IFR) pide salir por la pista ${r2} (sentido contrario a la ${c.rwy} en uso) para ahorrar rodaje.`,
          '¿Qué debes hacer antes de aprobarlo? (marca todas)', ['Analizar la demora que causaría al resto del tráfico', 'Coordinar con APP y pedir la suelta', `Tener en cuenta las llegadas a la ${c.rwy} y una posible frustrada en sentido contrario`],
          shuffle(rng, ['Nada: es decisión del piloto', 'Cambiar el ATIS a la pista ' + r2, 'Pedir permiso al supervisor de IVAO']),
          'Pista contraria: análisis de impacto, coordinación y suelta de APP para IFR, información de la demora y vigilancia del tráfico cercano.');
      }
    });

  // ---------------------------------------------------------------------
  const EMERG = [
    { k: 'fuego en el motor izquierdo', c: 'MAYDAY', fire: true },
    { k: 'fuego en el motor derecho', c: 'MAYDAY', fire: true },
    { k: 'fallo de motor', c: 'MAYDAY' },
    { k: 'humo en cabina', c: 'MAYDAY', fire: true },
    { k: 'fuego en la APU', c: 'MAYDAY', fire: true },
    { k: 'pasajero indispuesto, necesita atención médica', c: 'PAN PAN' },
    { k: 'tripulante indispuesto', c: 'PAN PAN' },
    { k: 'pérdida parcial de potencia en un motor', c: 'PAN PAN' },
    { k: 'presión de aceite anormal en el motor 2', c: 'PAN PAN' },
    { k: 'parámetros de motor anormales', c: 'PAN PAN' }
  ];
  const ASSIST = [
    ['Acusar recibo y entender la naturaleza de la emergencia', 'A – Acknowledge'],
    ['Obtener el código de transpondedor de la aeronave', 'A – Acknowledge'],
    ['Apartar al resto del tráfico y darle espacio para maniobrar', 'S – Separate'],
    ['Imponer silencio en la frecuencia si hace falta', 'S – Silence'],
    ['Avisar a APP, a los adyacentes y a los servicios de emergencia', 'I – Inform'],
    ['Ofrecer información, alternativas y aeródromos cercanos a la tripulación', 'S – Support'],
    ['No acosar a la tripulación con preguntas: dejarle trabajar', 'T – Time']
  ];
  fam('g-emergencias', 'Emergencias en vuelo', 'Emergencias', 2,
    'MAYDAY y PAN PAN con aeronaves y fases distintas: ASSIST, tráfico afectado, preguntas y autorizaciones.',
    c => ({ notes: `${c.app} conectado. Servicios de emergencia del aeródromo disponibles.` }), {
      tipo(c) {
        const rng = c.rng; const em = pick(rng, EMERG), a = pick(rng, AIRLINERS), cs = c.csFor(a);
        return step([P(cs, a, pick(rng, ['climb', 'final:12', 'dw']), 'air')], `${cs} (${a.t}) te informa: "${cs}, ${em.k}". No ha usado ninguna palabra de urgencia ni de socorro.`,
          '¿Qué tipo de situación es, según el temario?', em.c === 'MAYDAY' ? 'Emergencia (MAYDAY): necesita aterrizar de inmediato' : 'Urgencia (PAN PAN): sin peligro inminente, pero requiere medidas urgentes',
          [em.c === 'MAYDAY' ? 'Urgencia (PAN PAN): sin peligro inminente, pero requiere medidas urgentes' : 'Emergencia (MAYDAY): necesita aterrizar de inmediato', 'Ninguna: es una situación normal', 'Combustible mínimo'],
          'MAYDAY: fallo o fuego de motor, humo en cabina, falta de combustible. PAN PAN: pasajero o tripulante indispuesto, pérdida parcial de potencia, parámetros anormales. Ambas tienen prioridad.');
      },
      primero(c) {
        const rng = c.rng; const em = pick(rng, EMERG), a = pick(rng, AIRLINERS), cs = c.csFor(a);
        const call = em.c === 'MAYDAY' ? 'MAYDAY MAYDAY MAYDAY' : 'PAN PAN, PAN PAN, PAN PAN';
        return step([P(cs, a, 'climb', 'air')], `${cs}, recién despegado: "${call}, ${c.twr}, ${cs}, ${em.k}, solicitamos regresar a la pista ${c.rwy}".`,
          'Según ASSIST, ¿qué es lo primero?', 'Acusar recibo y asegurarte de que entiendes la emergencia',
          ['Preguntar personas a bordo y mercancías peligrosas', `Transferirlo a ${c.app}`, 'Imponer silencio a todas las estaciones'],
          'A de Acknowledge: acusar recibo y comprender la naturaleza del problema (y el código de transpondedor). Luego Separate, Silence, Inform, Support, Time.');
      },
      assist(c) {
        const rng = c.rng; const it = pick(rng, ASSIST);
        return step([], 'Repasas mentalmente el protocolo ASSIST mientras gestionas una emergencia.', `«${it[0]}» corresponde a…`, it[1],
          shuffle(rng, ['A – Acknowledge', 'S – Separate', 'S – Silence', 'I – Inform', 'S – Support', 'T – Time']), 'ASSIST: Acknowledge, Separate, Silence, Inform, Support, Time.');
      },
      trafico(c) {
        const rng = c.rng; const em = pick(rng, EMERG.filter(e => e.c === 'MAYDAY')), a = pick(rng, AIRLINERS), cs = c.csFor(a);
        const v = pick(rng, LIGHT_VFR), vc = c.cs('vfr'), b = pick(rng, AIRLINERS), bc = c.csFor(b), d = pick(rng, IFR_POOL), dc = c.csFor(d); const n = randint(rng, 5, 9);
        return step([P(cs, a, 'dw', 'air'), P(vc, v, 'base', 'air'), P(bc, b, 'final:' + n, 'air'), P(dc, d, 'hp')],
          `${cs} (${a.t}) regresa en emergencia (${em.k}). Tienes a ${vc} (${v.t}) en base, ${bc} (${b.t}) en final a ${n} NM y ${dc} (${d.t}) listo en el punto de espera.`,
          '¿Qué haces con el resto del tráfico?',
          `${vc}: orbitar o apartarse del circuito; ${bc}: coordinar con APP frustrada o espera; ${dc}: retenido. Pista libre para la emergencia`,
          [`Que aterricen ${vc} y ${bc} y salga ${dc} antes de la emergencia`, 'Mantener la secuencia normal y dar a la emergencia el número 3', 'Cerrar el aeródromo y pasar a todos a UNICOM'],
          'Separate: darle espacio y prioridad, pista libre de salidas y llegadas, coordinar con APP las llegadas afectadas.', 'loss');
      },
      preguntas(c) {
        const rng = c.rng; const em = pick(rng, EMERG.filter(e => e.fire)), a = pick(rng, AIRLINERS), cs = c.csFor(a);
        return multi([P(cs, a, 'base', 'air')], `${cs} (${a.t}) regresa con ${em.k}. La tripulación ya ha estabilizado la situación y puedes pedir datos.`,
          '¿Qué preguntas son pertinentes? (marca todas)', ['Personas a bordo', 'Mercancías peligrosas a bordo', 'Combustible remanente (autonomía)'],
          shuffle(rng, ['Número de vuelo de regreso', 'Hora prevista de llegada a destino', 'Puesto de estacionamiento preferido', 'Motivo de la demora en la salida']),
          'POB, mercancías peligrosas y autonomía ayudan a los servicios de emergencia. Sin acosar: T de Time.');
      },
      silencio(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a);
        return step([P(cs, a, 'final:8', 'air')], `${cs} declara MAYDAY y otras estaciones siguen transmitiendo peticiones rutinarias que bloquean la frecuencia.`,
          '¿Cómo impones silencio?', 'A todas las estaciones, cesen de transmitir, MAYDAY',
          ['Silencio en frecuencia, por favor', 'A todas las estaciones, mantengan escucha', 'Break break, todos fuera de frecuencia'],
          'Fraseología: "A TODAS LAS ESTACIONES, CESEN DE TRANSMITIR, MAYDAY" (ALL STATIONS, STOP TRANSMITTING, MAYDAY).');
      },
      frecuencia(c) {
        const rng = c.rng; const em = pick(rng, EMERG), a = pick(rng, AIRLINERS), cs = c.csFor(a);
        return step([P(cs, a, 'climb', 'air')], `${cs} (${a.t}), con ${em.k}, decide desviarse a otro aeródromo y va a salir de tu zona en pocos minutos.`,
          '¿Lo transfieres a APP en cuanto sale de tu zona?', 'Evito cambios de frecuencia mientras sea posible y coordino con APP', ['Sí, en cuanto cruce el límite', 'Sí, y cuanto antes mejor para descargar la frecuencia', 'Le paso a UNICOM'],
          'Pautas en emergencia: mantener la comunicación con la tripulación, evitar cambios de frecuencia aunque salga del área y mantener el contacto radar.');
      },
      pista(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a); const n = pick(rng, [5, 10, 15, 20, 25, 30]);
        return step([P(cs, a, 'final:' + Math.min(n, 9), 'air')], `${cs} (${a.t}) regresa con fuego en motor. Ahora está a ${n} NM de final.`,
          '¿Cuándo debes tener la pista despejada, como tarde?', 'Cuando esté a 20 NM de final', ['Cuando esté a 2 NM', 'Cuando declare final', 'Cuando lo pida la tripulación'],
          'Fuego en motor o APU: despejar la pista cuando esté a 20 NM de final y, si hay aterrizaje de emergencia, anotar última posición y hora.');
      },
      aterrizaje(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a);
        return step([P(cs, a, 'final:4', 'air')], `${cs} (${a.t}), en emergencia, está en final a 4 NM. La pista está libre y los servicios de emergencia, en posición.`,
          '¿Qué le transmites?', c.ldg(cs), [`${cs}, número uno, continúe`, `${cs}, aterrice a discreción`, `${cs}, notifique final`],
          'Con la pista libre, autorización de aterrizaje normal: viento y designador de pista.');
      }
    });

  // ---------------------------------------------------------------------
  const PRIO = [
    { k: 'con un motor parado (MAYDAY)', r: 1 }, { k: 'con MAYDAY FUEL', r: 1 }, { k: 'en urgencia por parámetros anormales (PAN PAN)', r: 1 },
    { k: 'vuelo hospital (STS/HOSP)', r: 2 }, { k: 'con un pasajero que necesita atención médica urgente', r: 2 },
    { k: 'de búsqueda y salvamento (SAR)', r: 3 }, { k: 'de extinción de incendios', r: 4 }, { k: 'de policía en misión', r: 4 },
    { k: 'regular sin incidencias', r: 5 }, { k: 'privado VFR sin incidencias', r: 5 }, { k: 'de escuela en vuelo de entrenamiento', r: 5 }
  ];
  fam('g-combustible', 'Combustible y prioridades', 'Emergencias', 1,
    'MINIMUM FUEL frente a MAYDAY FUEL y orden de prioridad para aterrizar o atender mensajes.',
    c => ({ notes: 'Secuencia de llegadas cargada. APP radar conectado.' }), {
      minimo(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), b = pick(rng, AIRLINERS); const ac = c.csFor(a), bc = c.csFor(b); const n = randint(rng, 2, 4);
        return step([P(bc, b, 'final:5', 'air'), P(ac, a, 'final:9', 'air')], `${ac} (${a.t}), número ${n} de la secuencia: "${c.twr}, ${ac}, combustible mínimo".`, '¿Cómo actúas?',
          'Acuso recibo e informo de la demora prevista; no tiene prioridad',
          [`Le doy prioridad y le adelanto a número uno`, 'Lo trato como emergencia y activo los servicios de emergencia', 'Le ordeno desviarse a su alternativo'],
          'COMBUSTIBLE MÍNIMO / MINIMUM FUEL no es emergencia ni da prioridad: solo se informa de la demora prevista.');
      },
      mayday(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), ac = c.csFor(a);
        return step([P(ac, a, 'final:' + randint(rng, 6, 9), 'air')], `Un rato después de avisar de combustible mínimo: "MAYDAY MAYDAY MAYDAY FUEL, ${ac}".`, 'Ahora…',
          'Es una emergencia: prioridad, pista libre y evitar cualquier motor y al aire', ['Sigue siendo combustible mínimo', 'Le pides que espere 10 minutos más', 'Lo transfieres a APP para que lo gestione'],
          'MAYDAY FUEL = emergencia (prevé aterrizar con menos de la reserva final): prioridad, mantenerla alta mientras se pueda y evitar una frustrada por falta de anticipación.', 'loss');
      },
      acciones(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), ac = c.csFor(a);
        return multi([P(ac, a, 'final:15', 'air')], `${ac} (${a.t}) ha declarado MAYDAY FUEL a 25 NM.`, '¿Qué acciones son correctas? (marca todas)',
          ['Mantenerla alta mientras se pueda', 'Despejar la pista con antelación para evitar un motor y al aire', 'Preguntar personas a bordo y mercancías peligrosas'],
          shuffle(rng, ['Hacerla esperar para ordenar la secuencia', 'Bajarla cuanto antes a 2 000 ft', 'Darle número dos detrás de la llegada que ya está en final']),
          'Combustible: ASSIST, mantenerla alta (ahorra combustible), POB y mercancías peligrosas, evitar frustradas, pista libre.');
      },
      orden(c) {
        const rng = c.rng; let s;
        do { s = shuffle(rng, PRIO).slice(0, 3); } while (new Set(s.map(x => x.r)).size < 3);
        const cs = s.map(x => c.cs(x.k.includes('VFR') || x.k.includes('escuela') ? 'vfr' : 'ifr'));
        const best = s.reduce((m, x, i) => x.r < s[m].r ? i : m, 0);
        const opts = s.map((x, i) => `${cs[i]} (${x.k})`);
        return step(s.map((x, i) => P(cs[i], pick(rng, AIRLINERS), 'final:' + (4 + 3 * i), 'air')),
          `Tres aeronaves piden aterrizar a la vez: ${opts.join('; ')}.`, '¿A cuál das prioridad para aterrizar?', opts[best], opts.filter((_, i) => i !== best).concat(['Por orden de llamada, sin excepciones']),
          'Orden: 1) factores de seguridad (emergencias, urgencias, poco combustible); 2) hospital o atención médica urgente; 3) búsqueda y salvamento; 4) otras misiones operacionales; 5) resto.');
      },
      mensajes(c) {
        const rng = c.rng; const M = [['un MAYDAY', 1], ['un PAN PAN', 2], ['un vuelo MEDEVAC que llama', 2], ['una petición de autorización de rodaje', 3], ['una petición de información meteorológica', 4], ['una petición de un servicio de combustible en plataforma', 5]];
        let p; do { p = shuffle(rng, M).slice(0, 2); } while (p[0][1] === p[1][1]);
        const [x, y] = p; const first = x[1] < y[1] ? x : y;
        const ox = `Primero ${x[0]}`, oy = `Primero ${y[0]}`;
        return step([], `Recibes dos mensajes casi simultáneos: ${x[0]} y ${y[0]}.`, '¿Cuál atiendes primero?', first === x ? ox : oy, [first === x ? oy : ox, 'El que haya llegado primero, siempre'],
          'Categorías: 1 socorro (MAYDAY); 2 urgencia (PAN PAN, sanitarios); 3 seguridad de los vuelos (autorizaciones e instrucciones); 4 meteorológicos; 5 regularidad. Dentro de la misma categoría, por orden de recepción.');
      },
      llegadaSalida(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), d = pick(rng, IFR_POOL); const ac = c.csFor(a), dc = c.csFor(d); const n = randint(rng, 2, 4);
        return step([P(ac, a, 'final:' + n, 'air'), P(dc, d, 'hp')], `${dc} (${d.t}) lleva un rato esperando en el punto de espera. ${ac} (${a.t}) está en final a ${n} NM. No da tiempo a sacar la salida.`,
          '¿Quién tiene prioridad?', `${ac}: una aeronave en las fases finales de la aproximación tiene prioridad sobre una que quiere salir`,
          [`${dc}: lleva más tiempo esperando`, 'La que antes llamó a la torre', `${dc}, si es un vuelo regular con slot`],
          'En general, una aeronave aterrizando o en las fases finales de la aproximación tiene prioridad sobre una que quiere salir.');
      },
      ambiguo(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), ac = c.csFor(a);
        const ph = pick(rng, ['"vamos un poco justos de combustible"', '"el combustible empieza a preocuparnos"', '"no podemos esperar mucho más"']);
        return step([P(ac, a, 'final:12', 'air')], `${ac} (${a.t}) en espera dice: ${ph}.`, '¿Qué haces?', 'Verificar su estado real: si declara combustible mínimo o MAYDAY FUEL',
          ['Tratarlo directamente como MAYDAY', 'Ignorarlo: no es fraseología estándar', 'Darle prioridad sin preguntar'],
          'Ante fraseología ambigua sobre combustible hay que verificar el estado real de la aeronave.');
      }
    });

  // ---------------------------------------------------------------------
  fam('g-pista', 'Problemas en pista', 'Emergencias', 2,
    'Despegue abortado, tren de aterrizaje, frenos, impacto con ave y pasadas bajas.',
    c => ({ notes: 'Pista única. Servicios de emergencia del aeródromo disponibles.' }), {
      abortado(c) {
        const rng = c.rng; const d = pick(rng, IFR_POOL), a = pick(rng, AIRLINERS); const dc = c.csFor(d), ac = c.csFor(a); const n = randint(rng, 3, 6);
        return step([P(dc, d, 'rwy:0.4', 'roll'), P(ac, a, 'final:' + n, 'air')], `${dc} (${d.t}): "Abortando despegue, ${dc}". ${ac} (${a.t}) está en final a ${n} NM.`, '¿Qué haces primero?',
          `Retener la pista: ${ac} continúa aproximación (o motor y al aire si la pista no se libera a tiempo)`,
          [`Autorizar a aterrizar a ${ac}`, `Pedir a ${dc} que intente despegar de nuevo`, `Transferir ${dc} a GND`],
          'Despegue abortado: retener despegues y aterrizajes en esa pista hasta que esté libre.', 'loss');
      },
      despuesAbortado(c) {
        const rng = c.rng; const d = pick(rng, IFR_POOL), dc = c.csFor(d);
        return step([P(dc, d, 'rwy:0.7')], `${dc} (${d.t}) ha abortado el despegue y se ha detenido en la pista.`, '¿Y después?',
          'Darle instrucciones para librar la pista y preguntar intenciones', ['Autorizarle de nuevo a despegar', 'Pedirle que no se mueva hasta nuevo aviso, sin más', 'Cerrar el aeródromo'],
          'Puede querer volver al punto de espera, esperar fuera para comprobaciones o volver a plataforma. Prever frenos calientes o neumáticos dañados.');
      },
      tren(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a);
        return step([P(cs, a, 'final:6', 'air')], `${cs}: "PAN PAN, PAN PAN, PAN PAN, ${c.twr}, ${cs}, indicación insegura del tren ${pick(rng, ['principal', 'de morro', 'principal izquierdo', 'principal derecho'])}, solicitamos pasada baja para inspección visual".`,
          '¿Qué haces?', 'Acusar recibo, despejar la pista y autorizar la pasada baja', ['Denegar la pasada baja: no está en el procedimiento', 'Pedirle que aterrice y lo compruebe en tierra', 'Transferirlo a GND para la inspección'],
          'Problemas de tren: prepararse para una pasada baja, despejar la pista y preguntar si quieren seguir volando con el tren fuera.');
      },
      pasada(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a);
        return step([P(cs, a, 'rwy:0.5', 'air')], `${cs} (${a.t}) va a efectuar la pasada baja sobre la pista ${c.rwy} para que veas el tren.`, 'La fraseología correcta para autorizarla es…',
          `${cs}, ${c.windStr()}, pista ${c.rwy} autorizado a pasada baja`, [`${cs}, pasada baja aprobada`, `${cs}, haga una pasada sobre la torre a discreción`, `${cs}, autorizado a aproximación frustrada`],
          'CLEARED LOW PASS es una autorización de pista: designador de pista y viento en superficie.');
      },
      observado(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a);
        return step([P(cs, a, 'climb', 'air')], `Durante la pasada baja de ${cs} ves que ${pick(rng, ['el tren principal izquierdo no está desplegado del todo', 'el tren de morro sigue recogido', 'una de las patas del tren principal está torcida'])}.`, '¿Qué haces a continuación?',
          'Informarle de lo observado, preguntar intenciones y avisar a los servicios de emergencia y a APP', ['No decirle nada para no alarmarle', 'Autorizarle a aterrizar inmediatamente', 'Pedirle que repita la pasada baja sin más'],
          'Inform y Support: lo que ves desde la torre es información crítica para la tripulación.');
      },
      frenos(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), b = pick(rng, LIGHT_VFR); const cs = c.csFor(a), bc = c.cs('vfr');
        return multi([P(cs, a, 'final:10', 'air'), P(bc, b, 'dw', 'air')], `${cs} (${a.t}) avisa antes de iniciar la aproximación de un problema de frenos. ${bc} (${b.t}) está en el circuito.`,
          '¿Qué haces? (marca todas)', ['Informar de la pista más larga y ancha disponible', `No secuenciar a ${bc} muy corto detrás de ${cs}`, 'Avisar a los servicios de emergencia y preparar la pista libre'],
          shuffle(rng, [`Autorizar una toma y despegue a ${bc} justo detrás`, 'Pedirle que aterrice más allá de la zona de toma', 'Asignarle la salida rápida más cercana obligatoriamente']),
          'Frenos: pista más larga, prever rebasamiento o pista bloqueada, nadie muy corto detrás, servicios de emergencia; posibilidad de esperar para quemar combustible o desviarse.');
      },
      ave(c) {
        const rng = c.rng; const a = pick(rng, IFR_POOL.filter(x => x.wake !== 'L')), cs = c.csFor(a);
        return step([P(cs, a, 'climb', 'air')], `${cs} (${a.t}) tras despegar: "PAN PAN, PAN PAN, PAN PAN, impacto con ave, ${pick(rng, ['vibración en motor derecho', 'parabrisas agrietado', 'vibración en motor izquierdo', 'olor a quemado'])}, solicitamos regresar".`,
          '¿Primera pregunta clave cuando la situación lo permita?', '¿Puede controlar la aeronave? ¿Intenciones?', ['¿Qué especie de ave era?', '¿Cuál es su hora prevista en destino?', '¿Ha leído el NOTAM de aves?'],
          'Impacto con ave: ASSIST, preguntar si controla la aeronave, permitir final larga si la pide, pista libre y datos del alternativo cuanto antes.');
      },
      aveSalida(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), d = pick(rng, IFR_POOL.concat(LIGHT_VFR)); const cs = c.csFor(a), dc = c.csFor(d);
        return step([P(cs, a, 'dw', 'air'), P(dc, d, 'hp')], `${cs} regresa tras un impacto con ave. ${dc} (${d.t}) está listo para salir y dice que "saldría rápido".`, `¿Qué haces con ${dc}?`,
          'Retenerlo: la pista activa queda libre de salidas y llegadas para la aeronave afectada', ['Que salga rápido antes de que llegue', 'Que salga desde una intersección', 'Que despegue por la pista contraria'],
          'Prioridad para aterrizar a la aeronave afectada y pista activa libre de salidas y llegadas.', 'loss');
      },
      finalLarga(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a);
        return step([P(cs, a, 'final:9', 'air')], `${cs}, que regresa tras impacto con ave, pide una final larga a la pista ${c.rwy}.`, '¿Se la permites?',
          'Sí, si la pide', ['No, debe hacer el circuito estándar', 'Solo con permiso de APP', 'Solo si declara MAYDAY'], 'Tras un impacto con ave se permite la final larga si la solicitan.');
      }
    });

  // ---------------------------------------------------------------------
  const CLOCK = [12, 1, 2, 3, 9, 10, 11];
  fam('g-circuito', 'Circuito VFR', 'VFR', 2,
    'Integración en el circuito, circuito lleno, tomas y despegues, información de tránsito y orden de aterrizaje.',
    c => { c.side = c.rng() < 0.5 ? 'izquierda' : 'derecha'; c.calt = pick(c.rng, [1000, 1000, 1500, 800]); return { notes: `Circuito por la ${c.side} de la ${c.rwy} a ${c.calt} ft. Puntos de entrada ${VFR_POINTS.join(', ')}.` }; }, {
      lleno(c) {
        const rng = c.rng; const n = randint(rng, 2, 5); const pt = pick(rng, VFR_POINTS); const legs = ['dw', 'base', 'crosswind', 'final:1.5', 'dw2'];
        const sc = []; for (let i = 0; i < n; i++) sc.push(P(c.cs('vfr'), pick(rng, LIGHT_VFR), legs[i], 'air'));
        const nc = c.cs('vfr'); sc.push(P(nc, pick(rng, LIGHT_VFR), 'point:' + pt, 'air'));
        const full = n >= 4;
        const orb = `Orbitar sobre ${pt} (con altitud si hace falta) e informarle de que el circuito está completo`;
        const join = `Entrar en viento en cola ${c.side} pista ${c.rwy}, con información del tránsito`;
        return step(sc, `Tienes ${plural(n, 'aeronave', 'aeronaves')} en el circuito. ${nc} llama a 2 minutos de ${pt} pidiendo instrucciones para aterrizar.`, '¿Qué le indicas?',
          full ? orb : join, [full ? join : orb, 'Aproximación directa a final, número uno', 'Que aterrice detrás del primero que vea'],
          `El circuito se considera lleno con 4 aeronaves y las que ya están tienen prioridad. ${full ? 'Lleno: órbita sobre un punto VFR.' : 'Hay hueco: integración por defecto en viento en cola.'}`);
      },
      tomaYDespegue(c) {
        const rng = c.rng; const a = pick(rng, LIGHT_VFR), b = pick(rng, LIGHT_VFR); const ac = c.cs('vfr'), bc = c.cs('vfr');
        return step([P(ac, a, 'rwy:0.3'), P(bc, b, 'final:1', 'air')], `${ac} (${a.t}) está haciendo una toma y despegue y aún rueda por la pista. ${bc} (${b.t}) está en corta final.`, `¿Qué le dices a ${bc}?`,
          `${bc}, continúe aproximación, número dos, tránsito en toma y despegue`, [`${bc}, pista ${c.rwy} autorizado a aterrizar`, `${bc}, aterrice detrás, autorizado`, `${bc}, orbite en final`],
          'No se autoriza a aterrizar con la pista ocupada. Si no se libera a tiempo, motor y al aire.', 'loss');
      },
      transito(c) {
        const rng = c.rng; const a = pick(rng, LIGHT_VFR), b = pick(rng, LIGHT_VFR.concat([AC('PC12'), AC('BE20')])); const ac = c.cs('vfr'), bc = c.cs('vfr');
        const leg = pick(rng, ['dw', 'base', 'crosswind']); const h = pick(rng, CLOCK); const d = pick(rng, [1, 2, 3]); const rel = pick(rng, ['misma altitud', '500 pies por debajo', '500 pies por encima']);
        const legTxt = CIRCUIT_LEGS[leg] + ' ' + c.side;
        return step([P(ac, a, 'dw', 'air'), P(bc, b, leg === 'dw' ? 'dw2' : leg, 'air')], `${ac} entra en el circuito y no ha visto a ${bc} (${full(b)}), que está en ${legTxt}, a sus ${h}, ${plural(d, 'milla', 'millas')}, ${rel}.`,
          '¿Cuál es la información de tránsito correcta?', `${ac}, tránsito, ${full(b)} en ${legTxt} a sus ${h}, ${plural(d, 'milla', 'millas')}, ${rel}, notifique a la vista`,
          [`${ac}, cuidado con el de delante`, `${ac}, tráfico ${full(b)} cerca de usted, notifique a la vista`, `${ac}, tránsito a sus ${(h + 6 - 1) % 12 + 1}, ${plural(d, 'milla', 'millas')}, siga`],
          'Información de tránsito: "tránsito" (no "tráfico"), tipo, posición horaria, distancia y altura relativa, y pedir que notifique a la vista.');
      },
      saturado(c) {
        const rng = c.rng; const n = randint(rng, 5, 6); const t = randint(rng, 2, 4);
        return step([P(c.cs('vfr'), pick(rng, LIGHT_VFR), 'dw', 'air'), P(c.cs('vfr'), pick(rng, LIGHT_VFR), 'base', 'air'), P(c.cs('vfr'), pick(rng, LIGHT_VFR), 'crosswind', 'air')],
          `Hay ${n} aeronaves en el circuito y ${t} de ellas hacen tomas y despegues de entrenamiento.`, '¿Qué técnica es más útil?',
          'Retener las tomas y despegues y priorizar los aterrizajes con parada completa', ['Autorizar más tomas y despegues para vaciar antes el circuito', 'Mandar a todos a orbitar sobre el campo a la misma altitud', 'Cambiar la pista en uso'],
          'Con más de 4 en el circuito: primero las tomas finales y luego el entrenamiento.');
      },
      integracion(c) {
        const rng = c.rng; const k = pick(rng, [['por defecto', 'Al principio o a mitad del viento en cola'], ['como alternativa (si acorta)', 'En base'], ['como última opción (si llega dentro de ±30° del eje)', 'Directa a final']]);
        const pt = pick(rng, VFR_POINTS), cs = c.cs('vfr');
        return step([P(cs, pick(rng, LIGHT_VFR), 'point:' + pt, 'air')], `${cs} llama a 2 minutos de ${pt} para aterrizar en la ${c.rwy}. El circuito está tranquilo.`, `¿Dónde se integra una llegada VFR ${k[0]}?`, k[1],
          ['Al principio o a mitad del viento en cola', 'En base', 'Directa a final', 'En viento cruzado'], 'Llegadas VFR: por defecto en viento en cola; alternativa en base si acorta; última, directa a final si viene dentro de ±30° del eje.');
      },
      entre(c) {
        const rng = c.rng; const cs = c.cs('vfr'); const pt = pick(rng, VFR_POINTS);
        return step([P(cs, pick(rng, LIGHT_VFR), 'point:' + pt, 'air')], `${cs} está sobre ${pt} y le vas a integrar en el circuito.`, '¿Qué instrucción es correcta?',
          `${cs}, entre en viento en cola ${c.side} pista ${c.rwy}, notifique en base`, [`${cs}, autorizado viento en cola ${c.side} pista ${c.rwy}`, `${cs}, autorizado a entrar en el circuito`, `${cs}, proceda al viento en cola, copiado`],
          '"Autorizado" se reserva para autorizaciones de pista: para el circuito se usa ENTRE EN (tramo). Y "recibido", no "copiado".');
      },
      contacto(c) {
        const rng = c.rng; const a = pick(rng, LIGHT_VFR), cs = c.cs('vfr'); const b = pick(rng, AIRLINERS), bc = c.csFor(b);
        return step([P(cs, a, 'dw', 'air'), P(bc, b, 'final:4', 'air')], `Le has dado a ${cs} información de un ${b.t} en final y responde "contacto negativo".`, '¿Qué haces?',
          'Darle más información (posición horaria, distancia, altura) o hacerle esperar (órbita)', ['Darle número dos igualmente: ya lo verá', 'Autorizarle a aterrizar antes que el ' + b.t, 'Repetirle exactamente la misma información'],
          'Si el piloto no tiene el tránsito a la vista, se le da más información o se le hace esperar (órbita).');
      },
      aterriza(c) {
        const rng = c.rng; const cs = c.cs('vfr');
        return step([P(cs, pick(rng, LIGHT_VFR), 'final:1', 'air')], `${cs}: "En final pista ${c.rwy}, ${cs}". La pista está libre.`, '¿Qué le respondes?',
          `${cs}, ${c.windStr()}, pista ${c.rwy} autorizado para aterrizar`, [`${cs}, aterrice`, `${cs}, número uno, continúe`, `${cs}, pista ${c.rwy}, aterrizaje aprobado`],
          'Autorización de aterrizaje, también para VFR: viento y designador de pista.');
      }
    });

  // ---------------------------------------------------------------------
  fam('g-ctr', 'VFR en el CTR', 'VFR', 2,
    'Tránsitos VFR con IFR en final, clases de espacio aéreo, salidas al espacio no controlado.',
    c => { c.cls = pick(c.rng, ['C', 'D', 'D', 'E']); c.calt = pick(c.rng, [1000, 1000, 1500]); return { notes: `CTR clase ${c.cls}. Circuito a ${c.calt} ft. Puntos VFR ${VFR_POINTS.join(', ')}.` }; }, {
      cruce(c) {
        const rng = c.rng; const [p1, p2] = shuffle(rng, VFR_POINTS).slice(0, 2); const v = pick(rng, LIGHT_VFR), vc = c.cs('vfr'); const a = pick(rng, AIRLINERS), ac = c.csFor(a); const n = randint(rng, 5, 9);
        const alt = c.calt + pick(rng, [500, 1000]);
        return step([P(vc, v, 'point:' + p1, 'air'), P(ac, a, 'final:' + n, 'air')], `${vc} (${v.t}) a 2 minutos de ${p1} pide cruzar el CTR hacia ${p2}. ${ac} (${a.t}) está en final a ${n} NM.`, '¿Qué autorización le das?',
          `Tránsito ${p1}, sobre el campo y ${p2}, altitud ${alt} pies, notifique sobre el campo; información de tránsito del ${a.t}`,
          [`Tránsito por el eje de la pista a ${c.calt - 500} pies`, `Tránsito directo a ${p2} a la altitud del circuito`, 'No se puede cruzar con un IFR en final'],
          'VFR en tránsito: altitud por encima del circuito (500–1 000 ft), evitar que cruce el eje a baja altura e información de tránsito mutua.');
      },
      quien(c) {
        const rng = c.rng; const cls = pick(rng, ['C', 'D', 'E']); const pair = pick(rng, [['VFR', 'IFR'], ['VFR', 'VFR'], ['IFR', 'IFR']]);
        const atc = R.separatedByATC(cls, pair[0], pair[1]);
        return step([], `En un espacio aéreo de clase ${cls}, un ${pair[0]} y un ${pair[1]} convergen cerca del aeródromo.`, '¿Quién es responsable de separarlos?',
          atc ? 'El controlador' : 'Los pilotos, con la información de tránsito del ATC', [atc ? 'Los pilotos, con la información de tránsito del ATC' : 'El controlador', 'APP, nunca la torre', 'Nadie: es espacio de aeródromo'],
          { C: 'Clase C: el ATC separa IFR de IFR y de VFR; VFR entre sí, información.', D: 'Clase D: el ATC solo separa IFR de IFR; el resto recibe información de tránsito.', E: 'Clase E: el ATC solo separa IFR de IFR.' }[cls], 'loss');
      },
      frustrada(c) {
        const rng = c.rng; const v = pick(rng, LIGHT_VFR), vc = c.cs('vfr'); const a = pick(rng, AIRLINERS), ac = c.csFor(a); const n = randint(rng, 1, 3);
        return step([P(vc, v, 'cross', 'air'), P(ac, a, 'final:' + n, 'air')], `${vc} (VFR) está a punto de cruzar la prolongación del eje de la pista ${c.rwy}. ${ac} (${a.t}) está en final a ${n} NM.`, '¿Qué debes prever?',
          `Una posible frustrada del ${a.t}: acelerar el cruce o mantener al VFR apartado hasta que cruce detrás`, ['Nada: el VFR va por encima del circuito', 'Un despegue abortado', 'Que el VFR quiera aterrizar'],
          'Una frustrada subiría hacia el VFR: acelerar el cruce del eje o hacerle esperar hasta que tenga al IFR a la vista y cruce detrás o tras el aterrizaje.');
      },
      altitud(c) {
        const rng = c.rng; const vc = c.cs('vfr'); const [p1, p2] = shuffle(rng, VFR_POINTS).slice(0, 2);
        const ok = c.calt + pick(rng, [500, 1000]);
        return step([P(vc, pick(rng, LIGHT_VFR), 'point:' + p1, 'air'), P(c.cs('vfr'), pick(rng, LIGHT_VFR), 'dw', 'air')], `${vc} cruza de ${p1} a ${p2} y hay dos VFR en el circuito a ${c.calt} ft.`, '¿Qué altitud le impones al tránsito?',
          `${ok} pies`, [`${c.calt} pies`, `${c.calt - 500} pies`, `${c.calt + 100} pies`], 'VFR en tránsito frente a VFR en circuito: por encima del circuito, idealmente 500–1 000 ft de diferencia, e información a ambos.');
      },
      salida(c) {
        const rng = c.rng; const vc = c.cs('vfr'); const pt = pick(rng, VFR_POINTS);
        return step([P(vc, pick(rng, LIGHT_VFR), 'point:' + pt, 'air')], `${vc} notifica en ${pt}, abandonando el CTR hacia espacio aéreo no controlado.`, '¿Qué le indicas?',
          `${vc}, responda 7000, puede pasar a UNICOM 122.800`, [`${vc}, responda 7600 y UNICOM 122.800`, `${vc}, mantenga el código y llame a ${c.app}`, `${vc}, transpondedor en espera, frecuencia libre`],
          'Al salir a espacio no controlado: código 7000 y UNICOM 122.800 (e informar si hay ATC que preste información por encima).');
      },
      llamada(c) {
        const rng = c.rng; const vc = c.cs('vfr'); const pt = pick(rng, VFR_POINTS); const from = rng() < 0.5;
        return step([P(vc, pick(rng, LIGHT_VFR), 'point:' + pt, 'air')], from ? `${vc} viene de espacio aéreo no controlado hacia el punto ${pt}.` : `Un controlador adyacente va a transferirte a ${vc}, que entrará por ${pt}.`,
          from ? '¿Cuándo debe llamarte?' : '¿Cuándo debe transferírtelo?', from ? 'Entre 1 y 2 minutos antes de entrar' : '2 minutos antes de entrar en la zona',
          [from ? '2 minutos antes de entrar en la zona' : 'Entre 1 y 2 minutos antes de entrar', 'Al cruzar el límite del CTR', '10 minutos antes'],
          'El adyacente transfiere al VFR 2 minutos antes; un VFR que viene de espacio no controlado llama entre 1 y 2 minutos antes.');
      },
      dosVfr(c) {
        const rng = c.rng; const a = c.cs('vfr'), b = c.cs('vfr'); const [p1, p2] = shuffle(rng, VFR_POINTS).slice(0, 2);
        return step([P(a, pick(rng, LIGHT_VFR), 'point:' + p1, 'air'), P(b, pick(rng, LIGHT_VFR), 'point:' + p2, 'air')], `${a} cruza de ${p1} a ${p2} y ${b} de ${p2} a ${p1}, a altitudes parecidas. CTR clase D.`, '¿Qué haces?',
          'Información de tránsito a ambos; cada piloto se separa (rumbo, altitud, visual)', ['Les separo con 1 000 ft obligatoriamente', 'Solo aviso al que llamó primero', 'Nada: entre VFR no hay que informar'],
          'Dos VFR en tránsito: información de tránsito a ambos y cada piloto se separa.');
      },
      salidaPunto(c) {
        const rng = c.rng; const vc = c.cs('vfr'); const pt = pick(rng, VFR_POINTS);
        return step([P(vc, pick(rng, LIGHT_VFR), 'rwy:0.05')], `${vc} (VFR) está alineado en la ${c.rwy} para salir del CTR por ${pt}.`, '¿Qué le transmites?',
          `${vc}, abandone el CTR por ${pt}, ${c.windStr()}, pista ${c.rwy} autorizado a despegar`, [`${vc}, autorizado a ${pt}, despegue`, `${vc}, despegue a discreción y notifique ${pt}`, `${vc}, autorizado a abandonar el CTR, pista ${c.rwy}`],
          'Salida VFR clásica: punto de salida + viento + pista + "autorizado a despegar".');
      }
    });

  // ---------------------------------------------------------------------
  function wxCtx(rng, c, mode) {
    // genera visibilidad/techo coherentes según lo que se quiera preguntar
    const vis = pick(rng, mode === 'imc' ? [800, 1200, 1500, 2000, 3000, 4000] : [1200, 1500, 2000, 3000, 4000, 4500, 5000, 6000, 8000, 9999]);
    const ceil = pick(rng, [400, 500, 600, 700, 800, 1000, 1200, 1400, 1500, 2000, 2500]);
    const wx = vis < 5000 ? pick(rng, ['BR', '-RA', 'RA', '-DZ', 'HZ']) + ' ' : '';
    const t = randint(rng, 4, 18);
    const metar = `${c.apt.icao} ${pad(randint(rng, 1, 28), 2)}${pad(randint(rng, 6, 18), 2)}00Z ${c.metarWind()} ${pad(vis, 4)} ${wx}BKN${pad(ceil / 100, 3)} ${pad(t, 2)}/${pad(t - randint(rng, 0, 2), 2)} Q${pad(c.qnh, 4)}`;
    return { vis, ceil, metar, vmc: R.aerodromeVMC(vis === 9999 ? 10000 : vis, ceil), svfr: R.svfrPossible(vis === 9999 ? 10000 : vis, ceil, false) };
  }
  fam('g-meteo', 'Tiempo empeorando: VMC y VFR especial', 'Meteorología', 2,
    'METAR cambiantes: decidir si hay VMC, qué decir al VFR, cuándo cabe el SVFR y quién separa.',
    c => ({ notes: `De día. CTR clase D. ${c.app} conectado.` }), {
      vmc(c) {
        const rng = c.rng; const w = wxCtx(rng, c); const cs = c.cs('vfr');
        const correct = w.vmc ? 'Sí: visibilidad ≥ 5 000 m y techo ≥ 1 500 ft' : `No: ${w.vis < 5000 ? 'visibilidad < 5 000 m' : ''}${w.vis < 5000 && w.ceil < 1500 ? ' y ' : ''}${w.ceil < 1500 ? 'techo < 1 500 ft' : ''}`;
        return step([P(cs, pick(rng, LIGHT_VFR), 'apron')], `${cs} (VFR) pide rodaje para salir. METAR: ${w.metar}`, '¿Hay VMC en el aeródromo?', correct,
          ['Sí: visibilidad ≥ 5 000 m y techo ≥ 1 500 ft', 'No: visibilidad < 5 000 m', 'No: techo < 1 500 ft', 'No: visibilidad < 5 000 m y techo < 1 500 ft', 'Sí: basta con visibilidad ≥ 1 500 m'].filter(x => x !== correct).slice(0, 3),
          `VMC en aeródromo: visibilidad ≥ 5 000 m y techo ≥ 1 500 ft. Aquí: ${w.vis === 9999 ? '≥ 10 km' : w.vis + ' m'} y techo ${w.ceil} ft.`, 'minor', { metar: w.metar });
      },
      actuar(c) {
        const rng = c.rng; const w = wxCtx(rng, c, 'imc'); const cs = c.cs('vfr');
        return step([P(cs, pick(rng, LIGHT_VFR), 'apron')], `${cs} (VFR) pide salir. METAR: ${w.metar} (sin VMC).`, '¿Qué le dices?',
          'Le informo de que no hay VMC (visibilidad y techo) y le pregunto intenciones', ['Le sugiero que pida un VFR especial', 'Le autorizo VFR igualmente: es responsabilidad suya', 'Le digo que es imposible volar hoy'],
          'Nunca se sugiere el SVFR: se informa de las condiciones y se pregunta intenciones.', 'minor', { metar: w.metar });
      },
      svfr(c) {
        const rng = c.rng; const w = wxCtx(rng, c, 'imc'); const night = rng() < 0.25; const cs = c.cs('vfr');
        const ok = !night && w.svfr;
        return step([P(cs, pick(rng, LIGHT_VFR), 'hp')], `${night ? 'Es de noche. ' : ''}${cs} solicita salida en VFR especial. METAR: ${w.metar}`, '¿Se puede autorizar y quién lo hace?',
          ok ? 'Sí: TWR lo pide a APP y transmite la autorización' : `No: ${night ? 'de noche no hay SVFR' : 'no se cumplen los mínimos SVFR (visibilidad ≥ 1 500 m y techo ≥ 600 ft)'}`,
          [ok ? 'No: no se cumplen los mínimos SVFR (visibilidad ≥ 1 500 m y techo ≥ 600 ft)' : 'Sí: TWR lo pide a APP y transmite la autorización', 'Sí, lo autoriza TWR sin coordinar', 'Solo si es helicóptero'],
          'SVFR: solo de día, visibilidad ≥ 1 500 m y techo ≥ 600 ft. Lo autoriza APP; TWR lo solicita y lo transmite.', 'minor', { metar: w.metar });
      },
      separa(c) {
        const rng = c.rng; const v = c.cs('vfr'), a = pick(rng, AIRLINERS), ac = c.csFor(a); const n = randint(rng, 5, 10);
        return step([P(v, pick(rng, LIGHT_VFR), 'climb', 'air'), P(ac, a, 'final:' + n, 'air')], `${v} despega en VFR especial. ${ac} (${a.t}, IFR) está en final a ${n} NM.`, `¿Quién es responsable de separar a ${v} del IFR?`,
          'El controlador', ['Los pilotos, con información de tránsito', 'Nadie: es clase D', 'Solo APP'], 'Con SVFR, la separación con el resto pasa a ser responsabilidad del controlador. Los SVFR se autorizan uno a uno.', 'loss');
      },
      unoAUno(c) {
        const rng = c.rng; const a = c.cs('vfr'), b = c.cs('vfr');
        return step([P(a, pick(rng, LIGHT_VFR), 'climb', 'air'), P(b, pick(rng, LIGHT_VFR), 'hp')], `${a} acaba de salir en SVFR y ${b} pide también salir en SVFR por el mismo sector.`, '¿Cómo los gestionas?',
          `Uno a uno: ${b} espera hasta que ${a} haya abandonado el CTR (o esté separado)`, ['Los dos a la vez: son VFR', `${b} sale detrás manteniendo separación visual propia`, 'Le vectorizo para separarlo'],
          'Los SVFR (con aprobación de APP) se autorizan uno a uno y no se vectorizan salvo emergencia.', 'loss');
      },
      imc(c) {
        const rng = c.rng; const w = wxCtx(rng, c, 'imc'); const n = randint(rng, 2, 4);
        return multi([P(c.cs('vfr'), pick(rng, LIGHT_VFR), 'dw', 'air'), P(c.cs('vfr'), pick(rng, LIGHT_VFR), 'base', 'air')], `El nuevo METAR deja el aeródromo sin VMC (${w.metar}) y tienes ${n} VFR en el circuito.`, '¿Qué haces? (marca todas)',
          ['Suspender el VFR y retener las salidas VFR', 'Avisar a todos: los VFR deben aterrizar o abandonar el ATZ/CTR', 'Avisar a APP'],
          shuffle(rng, ['Sugerir a cada VFR que pida SVFR', 'Nada hasta que algún piloto lo pregunte', 'Autorizar más tomas y despegues mientras dure']),
          'Sin VMC el controlador debe suspender el VFR: retener salidas VFR, hacer volver a los locales o aprobar SVFR, avisar a APP/ACC e informar del motivo.', 'minor', { metar: w.metar });
      },
      windshear(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), b = pick(rng, AIRLINERS); const ac = c.csFor(a), bc = c.csFor(b); const h = pick(rng, [300, 500, 800]);
        return multi([P(ac, a, 'rwy:0.5'), P(bc, b, 'final:6', 'air')], `${ac} (${a.t}), tras aterrizar, notifica cizalladura moderada a ${h} ft en final. ${bc} viene detrás.`, '¿Qué haces? (marca todas)',
          [`Informar a ${bc} indicando el tipo que lo notificó (${a.t})`, 'Avisar a APP', 'Pedir nuevos informes a las siguientes que aterricen'],
          shuffle(rng, ['Cerrar la pista', 'No decir nada para no alarmar', `Ordenar a ${bc} motor y al aire`]),
          'Windshear: recabar intensidad, lugar, tipo y hora; informar a las siguientes (con el tipo), avisar a APP y actualizar con nuevos informes. Prever frustradas.');
      }
    });

  // ---------------------------------------------------------------------
  fam('g-lvp', 'Niebla: procedimientos LVP', 'Meteorología', 3,
    'Activar LVP con RVR, techo y visibilidad generados; autorizaciones en CAT II/III y rodaje en baja visibilidad.',
    c => ({ notes: `ILS CAT III en la ${c.rwy}.` }), {
      activar(c) {
        const rng = c.rng; const rvr = pick(rng, [null, 300, 450, 550, 700, 800, 900, 1200, 1500]); const ceil = pick(rng, [100, 200, 250, 300, 400, 600]); const vis = pick(rng, [300, 400, 500, 600, 800, 1500]);
        const on = R.lvpStart(rvr, ceil, vis);
        const metar = `${c.apt.icao} ${pad(randint(rng, 1, 28), 2)}0600Z VRB02KT ${pad(vis, 4)} ${rvr ? `R${c.rwy}/${pad(rvr, 4)}N ` : ''}${vis < 1000 ? 'FG' : 'BR'} ${ceil <= 200 ? 'VV' + pad(ceil / 100, 3) : 'OVC' + pad(ceil / 100, 3)} 04/04 Q${pad(c.qnh, 4)}`;
        const why = []; if (rvr != null && rvr <= 800) why.push(`RVR ${rvr} m ≤ 800`); if (ceil <= 250) why.push(`techo ${ceil} ft ≤ 250`); if (vis <= 500) why.push(`visibilidad ${vis} m ≤ 500`);
        return step([P(c.csFor(AC('B738')), 'B738', 'final:8', 'air')], `Llega un METAR nuevo: ${metar}`, '¿Hay que aplicar LVP?', on ? 'Sí' : 'No', ['Sí', 'No', 'Solo de noche', 'Lo decide el piloto'],
          `Se activan si RVR ≤ 800 m, techo ≤ 250 ft o visibilidad ≤ 500 m (basta una). ${on ? 'Aquí: ' + why.join(', ') + '.' : 'Aquí no se cumple ninguna.'}`, 'minor', { metar });
      },
      dosMillas(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), ac = c.csFor(a); const b = pick(rng, AIRLINERS), bc = c.csFor(b);
        return step([P(ac, a, 'final:3', 'air'), P(bc, b, 'twy')], `LVP en vigor. ${ac} (${a.t}) en ILS CAT III a 3 NM. ${bc} rueda cerca del punto de espera CAT III.`, `¿Cuándo, como tarde, debe recibir ${ac} la autorización de aterrizaje?`,
          'A 2 NM de la zona de toma, con las áreas sensibles (LSA) libres', ['En el umbral', 'A 4 NM obligatoriamente', 'Cuando la pida'],
          'En LVP, si a 2 NM no está autorizada, frustrada. Y solo una aeronave establecida en la aproximación final.', 'loss');
      },
      libre(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), ac = c.csFor(a);
        return step([P(ac, a, 'rwy:0.6')], `LVP en vigor. ${ac} (${a.t}) ha aterrizado y va a abandonar la pista.`, '¿Qué debe notificar el piloto?',
          'Pista libre, área sensible (LSA) libre y la salida utilizada', ['Solo "en tierra"', 'Nada: se ve en el radar', 'Su número de puesto de estacionamiento'],
          'En LVP: abandonar solo por salidas con luces de eje encendidas y notificar pista libre, LSA libre y salida usada.');
      },
      rodaje(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), b = pick(rng, AIRLINERS); const ac = c.csFor(a), bc = c.csFor(b); const rvr = pick(rng, [200, 300, 350, 400, 450]);
        return step([P(ac, a, 'twy'), P(bc, b, 'apron')], `RVR ${rvr} m. ${ac} (${a.t}) rueda hacia el punto de espera y ${bc} (${b.t}) pide rodaje.`, 'Normalmente…',
          `Solo una aeronave rodando a la vez en el área de movimiento: ${bc} espera`, [`Pueden rodar ambos con precaución`, `${bc} sigue a ${ac} a la vista`, 'Se cierra el aeropuerto'],
          'Con RVR o visibilidad por debajo de 500 m, normalmente un único rodaje a la vez.');
      },
      unaEnFinal(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), b = pick(rng, AIRLINERS); const ac = c.csFor(a), bc = c.csFor(b);
        return step([P(ac, a, 'final:4', 'air'), P(bc, b, 'final:12', 'air')], `LVP en vigor con operaciones CAT III. ${ac} está establecido en el ILS a 4 NM y APP quiere meter a ${bc} en la final detrás.`, '¿Qué le dices a APP?',
          `Que ${bc} no se establezca hasta que ${ac} haya aterrizado: solo una aeronave establecida en la aproximación`, ['Que lo meta a 3 NM detrás', 'Que lo meta con la separación de estela normal', 'Nada: es asunto de APP'],
          'En LVP solo una aeronave puede estar establecida en la aproximación final.', 'loss');
      },
      quien(c) {
        const rng = c.rng; const end = rng() < 0.5;
        return step([], end ? 'El RVR mejora a 1 500 m y el techo sube a 800 ft de forma estable.' : 'El RVR baja a 600 m.', end ? '¿Quién da por terminadas las LVP y qué hace?' : '¿Quién inicia las LVP y qué hace?',
          end ? 'TWR, que avisa a APP del fin de las operaciones CAT II/III y actualiza el ATIS' : 'TWR, que avisa a APP del inicio de las operaciones CAT II/III y lo publica en el ATIS',
          ['APP, que avisa a TWR', 'Los pilotos al notificarlo', 'El supervisor de IVAO'], 'Las LVP las inicia y termina TWR, que avisa a APP cuando empiezan y terminan las operaciones CAT II/III (ATIS: "LVP in progress").');
      },
      ruido(c) {
        const rng = c.rng; const vis = pick(rng, [800, 1200, 1500, 1800]);
        return step([], `Visibilidad ${vis} m. La configuración preferente por ruido haría despegar por una pista sin ILS en el sentido contrario.`, '¿Puede el ruido decidir la pista?',
          'No: con visibilidad < 1 900 m el ruido no decide la pista', ['Sí, el ruido manda siempre', 'Solo de noche', 'Sí, si el viento está en calma'],
          'El ruido no decide la pista, entre otros, con despegue o aterrizaje IMC con visibilidad < 1 900 m, techo < 500 ft, cruzado > 15 kt o cola > 5 kt.');
      }
    });

  // ---------------------------------------------------------------------
  fam('g-altimetria', 'Altimetría y colaciones', 'Altimetría', 1,
    'Niveles de transición según QNH y TA, reglaje del altímetro y corrección de colaciones erróneas.',
    c => ({ notes: 'Prepara el ATIS y vigila las colaciones.' }), {
      tl(c) {
        const rng = c.rng; const place = pick(rng, R.TA_PLACES.filter(p => R.TRL_TABLE[p.ta])); const qnh = randint(rng, 972, 1040); const v = R.trl(qnh, place.ta);
        const band = R.TRL_BANDS.find(b => qnh >= b[0] && qnh <= b[1]);
        return step([], `Controlas ${place.name} (TA ${place.ta.toLocaleString('es-ES')} ft). El QNH es ${qnh}.`, '¿Qué nivel de transición publicas en el ATIS?', 'FL' + v,
          shuffle(rng, [v - 10, v - 5, v + 5, v + 10].map(x => 'FL' + x)), `Tabla para TA ${place.ta.toLocaleString('es-ES')} ft: QNH ${band[0]}–${band[1]} → FL${v}. A más QNH, menor nivel de transición.`);
      },
      qnh(c) {
        const rng = c.rng; const a = pick(rng, IFR_POOL), cs = c.csFor(a); const q = c.qnh;
        const s = String(q); const i = s.length === 4 ? pick(rng, [2, 3]) : pick(rng, [1, 2]); const nd = String((+s[i] + pick(rng, [1, 9])) % 10); const wrong = s.slice(0, i) + nd + s.slice(i + 1);
        return step([P(cs, a, pick(rng, ['apron', 'hp']))], `Le has dado QNH ${q} a ${cs} y colaciona "QNH ${wrong}".`, 'Respondes…',
          `${cs}, negativo, repito QNH ${q}`, [`${cs}, recibido`, `${cs}, corrección, QNH ${wrong}`, `${cs}, colación correcta`],
          'Una colación incorrecta se corrige en el acto: NEGATIVO, REPITO (mensaje correcto).', 'loss');
      },
      decir(c) {
        const rng = c.rng; const q = pick(rng, [998, 1000, 1003, 1009, 1012, 1013, 1017, 1020, 1024, 1031, c.qnh]);
        const s = R.sayQNH(q);
        return step([], `Vas a transmitir el QNH ${q}.`, '¿Cómo se dice?', s,
          ['QNH ' + (q >= 1000 ? 'mil ' + (q - 1000 || '') : 'novecientos ' + (q - 900)).trim(), 'QNH ' + R.digits(q).split(' ').slice(1).join(' '), q === 1000 ? 'QNH uno cero cero cero' : 'QNH ' + q.toLocaleString('es-ES') + ' hectopascales'],
          'Cifra a cifra; 1000 se dice "mil". Nunca "mil veinticuatro".');
      },
      reglaje(c) {
        const rng = c.rng; const place = pick(rng, R.TA_PLACES.filter(p => R.TRL_TABLE[p.ta])); const qnh = randint(rng, 975, 1040); const tl = R.trl(qnh, place.ta);
        const climbing = rng() < 0.5; const zone = pick(rng, ['below', 'layer', 'above']);
        const alt = zone === 'below' ? place.ta - randint(rng, 2, 10) * 100 : zone === 'layer' ? place.ta + Math.max(1, Math.floor((tl * 100 - place.ta) / 200)) * 100 : tl * 100 + randint(rng, 5, 30) * 100;
        if (zone === 'layer' && !(alt > place.ta && alt < tl * 100)) return null;
        const a = pick(rng, AIRLINERS), cs = c.csFor(a);
        const correct = zone === 'below' ? 'Altitud (QNH)' : zone === 'above' ? 'Nivel de vuelo (1013)' : (climbing ? 'Nivel de vuelo (1013)' : 'Altitud (QNH)');
        return step([P(cs, a, climbing ? 'climb' : 'final:9', 'air')], `${place.name}: TA ${place.ta.toLocaleString('es-ES')} ft, TL FL${tl}. ${cs} ${climbing ? 'en ascenso' : 'en descenso'} pasa por ${alt.toLocaleString('es-ES')} ft${zone === 'layer' ? ' (dentro de la capa de transición)' : ''}.`,
          '¿En qué términos expresa su posición vertical?', correct, ['Altitud (QNH)', 'Nivel de vuelo (1013)', 'Altura (QFE)'],
          'A o por debajo de la TA: altitud (QNH). A o por encima del TL: nivel de vuelo. En la capa: en ascenso en FL, en descenso en altitud.');
      },
      squawk(c) {
        const rng = c.rng; const a = pick(rng, IFR_POOL), cs = c.csFor(a); const code = pad(randint(rng, 1, 7), 1) + pad(randint(rng, 0, 7), 1) + pad(randint(rng, 0, 7), 1) + pad(randint(rng, 1, 7), 1);
        const sw = code.slice(0, 2) + code[3] + code[2]; if (sw === code) return null;
        return step([P(cs, a, 'apron')], `Has asignado el código ${code} a ${cs} y colaciona "responda ${sw}".`, 'Respondes…', `${cs}, negativo, repito responda ${R.saySquawk(code)}`,
          [`${cs}, colación correcta`, `${cs}, recibido`, `${cs}, recicle transpondedor`], 'Los códigos de transpondedor siempre se colacionan; una colación errónea se corrige con NEGATIVO, REPITO.');
      },
      ta(c) {
        const rng = c.rng; const place = pick(rng, R.TA_PLACES);
        return step([], `Vas a controlar ${place.name}.`, '¿Cuál es su altitud de transición?', place.ta.toLocaleString('es-ES') + ' ft',
          shuffle(rng, [6000, 7000, 8000, 13000].filter(x => x !== place.ta).map(x => x.toLocaleString('es-ES') + ' ft')), 'TA habituales en España: 6 000 ft (mayoría), 13 000 ft en Málaga y TMA de Madrid, 7 000 ft en Granada, 8 000 ft en La Seu d\'Urgell.');
      }
    });

  // ---------------------------------------------------------------------
  function components(rwyHdg, w, useGust) {
    const s = useGust && w.gust ? w.gust : w.spd; const ang = (w.dir - rwyHdg) * Math.PI / 180;
    return { head: Math.round(s * Math.cos(ang)), cross: Math.round(Math.abs(s * Math.sin(ang))) };
  }
  fam('g-pistaEnUso', 'Pista en uso, viento y ruido', 'Gestión', 2,
    'Elegir configuración con viento cambiante, cuándo pesa el ruido y cómo se cambia de pista.',
    c => ({ notes: `Configuración preferente por ruido: pista ${c.rwy}.` }), {
      ruido(c) {
        const rng = c.rng; let w, k;
        do {
          const dir = ((Math.round((c.hdg + randint(rng, -180, 180)) / 10) * 10) % 360 + 360) % 360 || 360; const spd = randint(rng, 4, 20); const gust = rng() < 0.35 ? spd + randint(rng, 6, 12) : null;
          w = { dir, spd, gust }; k = components(c.hdg, w, true);
        } while ([5, 6].includes(-k.head) || [15, 16].includes(k.cross));
        const tail = Math.max(0, -k.head); const no = tail > 5 || k.cross > 15;
        const metar = `${c.apt.icao} ${pad(randint(rng, 1, 28), 2)}1200Z ${c.metarWind(w)} 9999 FEW030 20/10 Q${pad(c.qnh, 4)}`;
        return step([P(c.csFor(AC('A320')), 'A320', 'final:8', 'air')], `El viento pasa a ser ${pad(w.dir, 3)}/${w.spd}${w.gust ? ' con rachas de ' + w.gust : ''} kt. En la pista ${c.rwy} eso supone ${tail ? 'unos ' + tail + ' kt de cola' : 'viento de cara'} y unos ${k.cross} kt de cruzado (con rachas).`,
          `¿Puede seguir decidiendo el ruido que se use la pista ${c.rwy}?`, no ? `No: ${tail > 5 ? 'cola > 5 kt' : 'cruzado > 15 kt'} (rachas incluidas) anula el criterio de ruido` : 'Sí: ni la cola supera 5 kt ni el cruzado 15 kt',
          [no ? 'Sí: ni la cola supera 5 kt ni el cruzado 15 kt' : 'No: cola > 5 kt (rachas incluidas) anula el criterio de ruido', 'Sí: el ruido manda siempre', 'Solo de noche'],
          'El ruido no decide la pista con viento cruzado > 15 kt o de cola > 5 kt (con rachas), ni con superficie contaminada, windshear, tormentas o baja visibilidad.', 'minor', { metar });
      },
      calma(c) {
        const rng = c.rng; const s = randint(rng, 1, 5);
        return step([], `Viento ${s < 3 ? 'en calma' : pad(randint(rng, 1, 36) * 10, 3) + '/' + s + ' kt'}. Vas a elegir la configuración para la sesión.`, '¿Qué pesa más en la elección?',
          'Otros factores: aproximación de precisión, meteorología prevista (TAF), ruido, restricciones nocturnas', ['Siempre el viento, aunque sea de 2 kt', 'La pista más cercana a la terminal', 'La que pida el primer piloto'],
          'Con viento flojo (< 6 kt, a veces hasta 8–10) pesan más otros factores. Analizar el TAF para no cambiar de configuración durante la sesión.');
      },
      cambio(c) {
        const r2 = recip(c.rwy);
        return step([], `Decides cambiar de la ${c.rwy} a la ${r2}.`, '¿Qué haces?', 'Avisar a los controladores adyacentes y actualizar el ATIS',
          ['Solo cambiar el ATIS', 'Esperar a que lo pidan los pilotos', 'Pedir permiso al supervisor'], 'Al cambiar de pista: coordinar con los adyacentes y nuevo ATIS.');
      },
      peticion(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a); const r2 = recip(c.rwy);
        return step([P(cs, a, 'apron')], `${cs} (${a.t}) pide despegar por la ${r2} por motivos de performance (peso y temperatura), aunque la preferente por ruido es la ${c.rwy}.`, '¿Qué prevalece?',
          'La seguridad prevalece sobre el ruido: se analiza y, si el tráfico lo permite, se aprueba (coordinando con APP)', ['El ruido: se deniega siempre', 'Lo decide el piloto sin coordinar', 'Se le obliga a esperar a que cambie el viento'],
          'Si una tripulación pide otra pista, la seguridad prevalece sobre el ruido. En IFR, pista contraria = coordinar con APP y pedir la suelta.');
      },
      reducida(c) {
        const rng = c.rng; const k = pick(rng, [
          ['entre una salida y una llegada', false, 'Nunca entre una salida y una llegada.'],
          ['con visibilidad 4 000 m', false, 'Requiere visibilidad ≥ 5 000 m.'],
          ['con techo 800 ft', false, 'Requiere techo ≥ 1 000 ft.'],
          ['con 7 kt de cola', false, 'Requiere cola ≤ 5 kt.'],
          ['entre dos llegadas, con visibilidad 8 km, techo 2 000 ft, viento de cara, radar e información de tránsito, publicada en el procedimiento local', true, 'Se cumplen todas las condiciones (y la estela se aplica siempre).'],
          ['sin que esté publicada en los procedimientos locales', false, 'Solo si está publicada en los procedimientos locales de la división.']]);
        return step([], `Te planteas aplicar separación reducida en la misma pista ${k[0]}.`, '¿Es posible?', k[1] ? 'Sí' : 'No', ['Sí', 'No'],
          k[2] + ' Condiciones: procedimiento local, estela, vis ≥ 5 000 m, techo ≥ 1 000 ft, cola ≤ 5 kt, radar, información de tránsito y frenado no afectado.');
      },
      categoria(c) {
        const rng = c.rng; const k = pick(rng, [
          ['cat. 1 (C172)', 'cat. 1', '600 m'], ['cat. 2 (DA42)', 'cat. 1', '600 m'], ['cat. 1 (C172)', 'cat. 2', '1 500 m'], ['cat. 2 (BE20)', 'cat. 2', '1 500 m'], ['cat. 3 (A320)', 'cat. 1', '2 400 m'], ['cat. 3 (B738)', 'cat. 3', '2 400 m']]);
        return step([], `Separación reducida publicada y todas las condiciones se cumplen. El precedente es ${k[0]} y el siguiente, ${k[1]}.`, '¿Qué distancia mínima debe haber recorrido el precedente?', k[2],
          ['600 m', '1 500 m', '2 400 m', '3 000 m'], 'Cat. 1 o 2 → siguiente cat. 1: 600 m; → cat. 2: 1 500 m. Precedente cat. 3: 2 400 m.');
      }
    });

  // ---------------------------------------------------------------------
  const TWYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'Y'];
  fam('g-rodaje', 'Rodaje y cruces de pista', 'Gestión', 1,
    'Instrucciones de rodaje, cruces de pista, conflictos en intersecciones, puesta en marcha y retroceso.',
    c => ({ notes: 'Estás en TWR + GND (no hay GND conectado).' }), {
      interseccion(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), b = pick(rng, AIRLINERS); const ac = c.csFor(a), bc = c.csFor(b); const [t1, t2] = shuffle(rng, TWYS).slice(0, 2);
        return step([P(ac, a, 'twy'), P(bc, b, 'twy2')], `${ac} rueda por ${t1} y ${bc} por ${t2}; van a coincidir en la intersección ${t1}/${t2}.`, '¿Qué haces?',
          `A uno le ordenas mantener corto de ${t1}/${t2} o ceder el paso al otro, con información de tránsito`, ['Nada: que se vean', 'Les das la misma ruta para que se sigan', 'Detienes a ambos hasta nuevo aviso sin explicar'],
          'Evitar que coincidan en una intersección: MANTENGA CORTO o CEDA EL PASO, siempre con información de tránsito (obligatoria en rodadura).');
      },
      cruce(c) {
        const rng = c.rng; const st = pick(rng, ['activa', 'cerrada', 'inactiva']); const a = pick(rng, AIRLINERS), cs = c.csFor(a); const r2 = pick(rng, ['02', '13', '18', '27', '31']);
        const ans = st === 'activa' ? 'Sí, siempre: la autoriza TWR, que pide "pista libre" tras el cruce' : st === 'cerrada' ? 'Sí: cruzar cualquier pista requiere autorización (si está cerrada, puede gestionarlo GND)' : 'Sí: cruzar cualquier pista requiere autorización aunque no esté en uso';
        return step([P(cs, a, 'twy')], `${cs} (${a.t}) tiene que cruzar la pista ${r2}, que está ${st}, para llegar a la ${c.rwy}.`, '¿Necesita autorización para cruzarla?', ans,
          ['No: solo las pistas en uso necesitan autorización', 'Solo de noche', 'Solo si es IFR'], 'Cruzar una pista requiere autorización siempre, aunque no esté en uso. Pista activa: lo autoriza TWR; pista cerrada: puede gestionarlo GND.');
      },
      ruta(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a); const t = shuffle(rng, TWYS).slice(0, 5); const hp = t[1] + randint(rng, 1, 4);
        return step([P(cs, a, 'apron')], `${cs} (${a.t}) pide rodaje para salir por la ${c.rwy}.`, '¿Cuál es la instrucción más adecuada?',
          `${cs}, ruede a punto de espera ${hp} pista ${c.rwy} vía ${t[0]}, ${t[1]}`,
          [`${cs}, autorizado a rodar a la pista ${c.rwy}`, `${cs}, ruede vía ${t.join(', ')} a la ${c.rwy}`, `${cs}, rodaje aprobado al punto de espera ${hp}`],
          'Incluir siempre la pista, como mucho ~3 calles por instrucción y el imperativo RUEDE ("autorizado" se reserva para las autorizaciones de pista).');
      },
      retroceso(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a); const dir = pick(rng, ['norte', 'sur', 'este', 'oeste']);
        return step([P(cs, a, 'apron')], `${cs} (${a.t}) solicita retroceso. Nadie rueda por detrás.`, '¿Qué le transmites?', `${cs}, retroceso aprobado, encarando al ${dir}`,
          [`${cs}, autorizado a retroceso, encarando al ${dir}`, `${cs}, retroceso a su propio riesgo`, `${cs}, ruede hacia atrás al ${dir}`], 'El retroceso se APRUEBA, nunca se "autoriza".');
      },
      jetBlast(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS.filter(x => x.kind === 'reactor')), cs = c.csFor(a); const l = pick(rng, LIGHT_VFR.concat([AC('EC35')])); const lc = c.cs('vfr');
        if (!a) return null;
        return step([P(cs, a, 'apron'), P(lc, l, 'twy')], `${cs} (${a.t}) pide puesta en marcha. ${lc} (${full(l)}) va a pasar rodando justo por detrás.`, '¿Qué haces?',
          `Retrasar la puesta en marcha de ${cs} hasta que ${lc} haya pasado`, ['Aprobarla: el chorro no afecta en rodaje', `Aprobarla y decir a ${lc} "precaución chorro de reactor"`, `Pedir a ${lc} que pase más rápido`],
          'Jet blast: no aprobar la puesta en marcha de un reactor si un ligero o un helicóptero va a pasar por detrás.');
      },
      puesta(c) {
        const rng = c.rng; const k = pick(rng, [[AC('C172'), 'VFR', false], [AC('P28A'), 'VFR', false], [AC('EC35'), 'VFR', true], [AC('A320'), 'IFR', true], [AC('B738'), 'IFR', true], [AC('AT72'), 'IFR', true]]);
        const cs = c.csFor(k[0]);
        return step([P(cs, k[0], 'apron')], `${cs} (${full(k[0])}, ${k[1]}) va a poner en marcha en plataforma.`, '¿Necesita aprobación de la puesta en marcha?',
          k[2] ? 'Sí' : 'No: los VFR ligeros de pistón están exentos', [k[2] ? 'No: los VFR ligeros de pistón están exentos' : 'Sí', 'Solo de noche', 'Solo si hay GND conectado'],
          'Requieren aprobación las aeronaves cuya puesta en marcha afecta al área de movimiento y TODOS los helicópteros; están exentos los VFR ligeros de pistón (C172, PA28…).');
      },
      librada(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a);
        return step([P(cs, a, 'rwy:0.85')], `${cs} (${a.t}) ha aterrizado y sale por una calle rápida. Otra llegada viene en final.`, '¿Cuándo se considera que ha librado la pista?',
          'Cuando toda la aeronave ha rebasado el punto de espera de la calle de salida', ['Cuando el morro entra en la calle de rodaje', 'Cuando reduce a velocidad de rodaje', 'Cuando contacta con GND'],
          'Una aeronave que aterriza ha librado la pista cuando toda ella ha rebasado el punto de espera (barra de parada).');
      },
      transferencia(c) {
        const rng = c.rng; const dep = rng() < 0.5; const a = pick(rng, AIRLINERS), cs = c.csFor(a);
        return step([P(cs, a, dep ? 'twy' : 'rwy:0.8')], dep ? `Ahora sí hay GND conectado. ${cs} rueda hacia el punto de espera de la ${c.rwy}.` : `Ahora sí hay GND conectado. ${cs} acaba de aterrizar en la ${c.rwy}.`,
          dep ? '¿Cuándo debe pasar GND a ' + cs + ' a TWR?' : `¿Cuándo pasas a ${cs} a GND?`,
          dep ? 'Al acercarse al punto de espera' : 'Cuando ha abandonado la pista (o se prevé que lo hará sin bloquearla)',
          [dep ? 'Ya alineado en pista' : 'Cuando se detenga en plataforma', 'Al poner en marcha', 'Nunca: TWR lo lleva hasta el final'], 'Salidas: a TWR al acercarse al punto de espera. Llegadas: a GND cuando han abandonado la pista. No hace falta esperar a que se detengan.');
      }
    });

  // ---------------------------------------------------------------------
  fam('g-radio', 'Fallo de comunicaciones y códigos', 'Emergencias', 1,
    'Aeronaves en 7600, comprobaciones de recepción, códigos especiales y gestión del tráfico alrededor.',
    c => ({ notes: '' }), {
      codigo(c) {
        const rng = c.rng; const k = pick(rng, [['7600', 'Fallo de comunicaciones'], ['7700', 'Emergencia'], ['7500', 'Interferencia ilícita'], ['7000', 'VFR en espacio no controlado (código de conspicuidad)']]); const a = pick(rng, LIGHT_VFR.concat(AIRLINERS)), cs = c.csFor(a); const pt = pick(rng, VFR_POINTS);
        return step([P(cs, a, 'point:' + pt, 'air')], `${cs} (${a.t}) aparece en pantalla cerca de ${pt}, ${pick(rng, ['a 2 000 ft', 'a 1 500 ft', 'descendiendo', 'en dirección al campo'])}, con código ${k[0]}.`, `¿Qué indica el ${k[0]}?`, k[1],
          ['Fallo de comunicaciones', 'Emergencia', 'Interferencia ilícita', 'VFR en espacio no controlado (código de conspicuidad)'], '7500 interferencia ilícita, 7600 fallo de comunicaciones, 7700 emergencia; 7000 VFR no controlado.');
      },
      recibe(c) {
        const rng = c.rng; const a = pick(rng, LIGHT_VFR), cs = c.cs('vfr'); const pt = pick(rng, VFR_POINTS);
        return multi([P(cs, a, 'point:' + pt, 'air')], `${cs} (${a.t}) aparece en ${pt} con 7600 y no contesta. Quieres saber si al menos te recibe.`, '¿Qué puedes hacer? (marca todas)',
          [`"${cs}, si me recibe, haga un 360 por su derecha"`, 'Pedirle SQUAWK IDENT', 'En IVAO, probar por texto'], shuffle(rng, ['Enviar un .WALLOP de inmediato', 'Ordenarle que abandone el CTR', 'Pedirle que cambie a 7700']),
          'SQUAWK IDENT, maniobra de confirmación (VFR), otra aeronave como relé y, en IVAO, texto (descarta un piloto ausente).');
      },
      trafico(c) {
        const rng = c.rng; const cs = c.cs('vfr'), o = c.cs('vfr'); const a = pick(rng, LIGHT_VFR), b = pick(rng, LIGHT_VFR); const leg = pick(rng, ['base', 'crosswind', 'final:1.5']);
        return step([P(cs, a, 'dw', 'air'), P(o, b, leg, 'air')], `${cs} (${a.t}, 7600) se incorpora al viento en cola sin hablar. ${o} (${b.t}) está en ${leg === 'crosswind' ? 'viento cruzado' : leg === 'base' ? 'base' : 'final'}.`, '¿Qué haces con el resto?',
          'Informar a las aeronaves cercanas y apartar a las que puedan estar en su trayectoria', ['Nada: ya se verán', `Ordenar a ${cs} que se vaya`, 'Cerrar el circuito sin informar'],
          'Apartar a las aeronaves cercanas de la posible trayectoria del que tiene fallo de radio e informarles.');
      },
      rele(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a); const b = pick(rng, AIRLINERS), bc = c.csFor(b);
        return step([P(cs, a, 'final:12', 'air'), P(bc, b, 'final:6', 'air')], `${cs} parece recibirte (hace lo que le dices) pero no le oyes. ${bc}, más cerca, sí le oye.`, '¿Qué recurso puedes usar?',
          `Usar a ${bc} como relé`, ['Ignorar a ' + cs + ' hasta que se arregle', 'Pedirle que cambie a 7500', 'Mandarle a orbitar hasta que funcione la radio'], 'Fallo en un sentido: otra aeronave puede hacer de relé.');
      },
      luces(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a); const n = randint(rng, 6, 15);
        return step([P(cs, a, 'final:' + Math.min(n, 9), 'air')], `${cs} (${a.t}, IFR) tiene fallo de comunicaciones en aproximación a ${n} NM de la pista ${c.rwy}.`, '¿Qué debes vigilar?', 'El circuito de fallo de comunicaciones publicado y el código 7600',
          ['Que cambie a 7500', 'Que aterrice en otro aeródromo obligatoriamente', 'Nada especial: seguirá su plan'], 'Fallo de comunicaciones: vigilar el procedimiento publicado y el 7600; esperar falta de colaciones, órbitas y maniobras inesperadas.');
      },
      despega(c) {
        const rng = c.rng; const a = pick(rng, IFR_POOL), cs = c.csFor(a);
        return step([P(cs, a, 'rwy:0.4', 'roll')], `${cs} (${a.t}) despega por la ${c.rwy} sin autorización y no contesta a la radio.`, '¿Qué haces en IVAO?',
          'Enviarle un FORCE ACT y, si sigue sin responder, chat privado, avisar a los demás controladores y .WALLOP', ['Nada: ya está en el aire', 'Pedir a otro piloto que le hable', 'Desconectarte'],
          'Pilotos que no responden: FORCE ACT → (1 min) otro FORCE ACT + chat privado → coordinación → .WALLOP <motivo en inglés>.');
      }
    });

  // ---------------------------------------------------------------------
  fam('g-ivao', 'Torre en IVAO', 'IVAO', 1,
    'Pilotos que no contactan, FORCE ACT, transpondedor y particularidades de la red.',
    c => ({ notes: 'Sesión en red IVAO.' }), {
      forceAct(c) {
        const rng = c.rng; const a = pick(rng, IFR_POOL), cs = c.csFor(a); const where = pick(rng, ['directamente en la pista activa', 'en plataforma, ya rodando', 'en el punto de espera, sin haber pedido nada']);
        return step([P(cs, a, where.includes('pista') ? 'rwy:0.1' : where.includes('espera') ? 'hp' : 'apron')], `${cs} (${a.t}) se conecta ${where} y no contacta.`, '¿Primera acción?',
          'Enviarle un FORCE ACT invitándole a contactar', ['Llamar a un supervisor con .WALLOP', 'Autorizarle a despegar para que se vaya', 'Ignorarle'],
          'FORCE ACT; si en 1 minuto no contacta, no sintoniza el ATIS o sigue moviéndose, otro FORCE ACT + chat privado.');
      },
      escalar(c) {
        const rng = c.rng; const a = pick(rng, IFR_POOL), cs = c.csFor(a);
        return step([P(cs, a, 'rwy:0.3', 'roll')], `Has enviado un FORCE ACT a ${cs} hace más de un minuto, sigue sin responder y empieza a rodar por la pista.`, '¿Qué haces?',
          'Nuevo FORCE ACT + chat privado (con educación), aviso a los demás controladores y, si sigue sin respuesta, .WALLOP con el motivo en inglés', ['Nada más', 'Pedir a otro piloto que le hable', 'Cerrar tu posición'],
          'Escalado: FORCE ACT → FORCE ACT + chat → coordinación → .WALLOP <motivo en inglés>.');
      },
      tx(c) {
        const rng = c.rng; const a = pick(rng, IFR_POOL), cs = c.csFor(a); const q = pick(rng, [['poner el transpondedor en TX', 'Al entrar en la pista activa (se tolera en el punto de espera)'], ['volver a STANDBY', 'Al desalojar la pista (se tolera nada más aterrizar)']]);
        return step([P(cs, a, 'hp')], `${cs} (${a.t}), ${pick(rng, ['nuevo en la red', 'en su primer vuelo controlado', 'que viene de otra división'])}, pregunta por el uso del transpondedor en IVAO.`, `¿Cuándo debe ${q[0]}?`, q[1],
          shuffle(rng, ['En plataforma, al poner en marcha', 'Al pasar 1 000 ft', 'Al recibir la autorización IFR', 'Al entrar en la pista activa (se tolera en el punto de espera)', 'Al desalojar la pista (se tolera nada más aterrizar)']),
          'TX al entrar en la pista activa y STANDBY al desalojarla.');
      },
      unicom(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a); const n = pick(rng, [6, 8, 10, 11, 15, 20]); const onAxis = rng() < 0.6;
        const ok = onAxis && n < 12;
        return step([P(cs, a, 'final:' + Math.min(n, 9), 'air')], `${cs} (IFR) está ${onAxis ? 'en el eje de final' : 'en aproximación, fuera del eje de final'} a ${n} NM y sigue en UNICOM.`, '¿Le envías un FORCE ACT?',
          ok ? 'Sí: piloto a menos de 12 NM en UNICOM' : (onAxis ? 'No todavía: está a más de 12 NM' : 'No: no se usa con IFR en aproximación fuera del eje de final'),
          ['Sí: piloto a menos de 12 NM en UNICOM', 'No todavía: está a más de 12 NM', 'No: no se usa con IFR en aproximación fuera del eje de final', 'Sí, siempre que no hable'].filter(x => x !== (ok ? 'Sí: piloto a menos de 12 NM en UNICOM' : (onAxis ? 'No todavía: está a más de 12 NM' : 'No: no se usa con IFR en aproximación fuera del eje de final'))),
          'No se usa FORCE ACT con IFR en aproximación fuera del eje de final; sí con un piloto a menos de 12 NM que siga en UNICOM.');
      },
      radioayudas(c) {
        const rng = c.rng; const a = pick(rng, AIRLINERS), cs = c.csFor(a);
        return step([P(cs, a, 'final:10', 'air')], `${cs} (${a.t}) dice que el ILS de la pista ${c.rwy} "no funciona" y te pregunta si hay un fallo de la radioayuda.`, '¿Qué sabes?',
          'Los fallos de radioayudas no se simulan en IVAO: el problema es de su simulador', ['Hay que publicar un NOTAM y cerrar el ILS', 'Hay que cambiar de pista', 'APP debe declarar el ILS inoperativo'], 'IVAO: los fallos de radioayudas no se simulan.');
      },
      zonaNC(c) {
        const rng = c.rng; const cs = c.cs('vfr'); const m = pick(rng, [1, 2, 3, 5]);
        return step([P(cs, pick(rng, LIGHT_VFR), 'point:' + pick(rng, VFR_POINTS), 'air')], `${cs} vuela en zona no controlada hacia tu CTR, a ${plural(m, 'minuto', 'minutos')} de entrar, sin haber llamado.`, '¿Qué puedes hacer?',
          'Asignarle código y enviarle un FORCE ACT 2–3 minutos antes de entrar', ['Nada hasta que entre', 'Un .WALLOP inmediato', 'Denegarle la entrada por chat'], 'Zona no controlada: tras asignarle código, FORCE ACT 2–3 minutos antes de entrar.');
      }
    });

  // =====================================================================
  //  Partida: contexto + MAX_STEPS situaciones distintas
  // =====================================================================
  function build(f, rng) {
    rng = rng || Math.random;
    const c = makeCtx(rng);
    const extraNotes = f.setup(c) || {};
    const names = shuffle(rng, Object.keys(f.sits));
    const steps = [];
    for (const n of names) {
      if (steps.length >= MAX_STEPS) break;
      let st = null; for (let k = 0; k < 6 && !st; k++) st = f.sits[n](c);
      if (st) { st.gen = n; steps.push(st); }
    }
    return { id: f.id, title: f.title, cat: f.cat, diff: f.diff, gen: true, setup: { apt: c.apt.icao + '_TWR', rwy: c.rwy, metar: c.metar, notes: extraNotes.notes || '' }, steps };
  }

  // Cuenta situaciones distintas por muestreo: firma = generador + texto, sin indicativos.
  function countSituations(f, samples) {
    const seen = new Set(); const rng = G.mulberry32(12345 + f.id.length);
    for (let i = 0; i < (samples || 1500); i++) {
      const c = makeCtx(rng); f.setup(c);
      const n = pick(rng, Object.keys(f.sits)); const st = f.sits[n](c); if (!st) continue;
      let sig = n + '|' + st.sit + '|' + st.q + '|' + st.a.map(k => st.o[k]).join('/');
      for (const cs of c.used) sig = sig.split(cs).join('#');
      seen.add(sig);
    }
    return seen.size;
  }
  const G = { mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; } };

  // Una situación suelta convertida en pregunta de test (tema según la categoría del escenario)
  const CAT_TOPIC = { Separaciones: 'separaciones', 'Sujeta/suelta': 'separaciones', Emergencias: 'emergencias', VFR: 'gestion-transito', 'Meteorología': 'meteorologia', 'Altimetría': 'altimetria', 'Gestión': 'gestion-transito', IVAO: 'introduccion' };
  function question(rng, topics) {
    const fams = F.filter(f => !topics || topics.includes(CAT_TOPIC[f.cat]));
    if (!fams.length) return null;
    for (let k = 0; k < 10; k++) {
      const f = pick(rng, fams); const c = makeCtx(rng); const setup = f.setup(c) || {};
      const st = f.sits[pick(rng, Object.keys(f.sits))](c); if (!st) continue;
      const order = shuffle(rng, st.o.map((_, i) => i));
      const ctxTxt = `${c.apt.icao} (${c.apt.city}), pista ${c.rwy}${setup.notes ? '. ' + setup.notes : ''}`;
      return { t: CAT_TOPIC[f.cat], q: `${ctxTxt}\n${st.sit}${st.metar ? '\nMETAR: ' + st.metar : ''}\n${st.q}`, o: order.map(i => st.o[i]), a: st.a.map(i => order.indexOf(i)), m: !!st.m, e: st.e, g: 'Torre: ' + f.title, gen: true };
    }
    return null;
  }

  const API = { FAMILIES: F, MAX_STEPS, build, countSituations, makeCtx, depGap, APTS, question, CAT_TOPIC, mulberry32: G.mulberry32 };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.ADC_SCEN = API;
})(typeof window !== 'undefined' ? window : globalThis);
