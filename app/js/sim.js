/* Simulador de torre: escenario continuo en tiempo real.
   Radar de aproximación + vista de aeródromo, etiquetas arrastrables, fichas de progresión
   y una línea de comandos por la que se transmite (fraseología en español o alias cortos).
   Las decisiones se puntúan con las reglas de rules.js (estela, salidas sucesivas, sujeta/suelta…).
   Coordenadas en NM: umbral de la pista en uso en (0,0); la pista va hacia x negativas
   (dirección de aterrizaje y despegue) y la final se extiende hacia x positivas. */
(function (root) {
  'use strict';
  const R = root.ADC_RULES, SC = root.ADC_SCEN;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const pad = (n, w) => String(n).padStart(w, '0');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtMin = m => String(m).replace('.', ',') + ' min';
  const mmss = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + pad(s % 60, 2); };

  // ---------- Geometría del aeródromo ----------
  const RWY_LEN = 1.6;                 // NM
  const HP = { x: 0.1, y: 0.1 };       // punto de espera junto al umbral
  const TWY_Y = 0.15, APRON_Y = 0.42;
  const EXITS = [-0.6, -1.1, -1.35];   // calles de salida (x)
  const STANDS = [-1.35, -1.2, -1.05, -0.9, -0.75, -0.6, -0.45, -0.3];
  const VFR_PTS = { N: { x: -0.8, y: -4.6 }, S: { x: -0.8, y: 4.6 }, W: { x: -6, y: -1.6 }, E: { x: 5.5, y: -3.4 } };
  const DEP_EXIT = [{ x: -8, y: -4, sid: 'N' }, { x: -9, y: 0, sid: 'W' }, { x: -8, y: 4, sid: 'S' }];
  const CIRCUIT_ALT = 1000;

  // ---------- Puntuación (al estilo de GAME_EVENTS de openscope) ----------
  const PTS = {
    TAXI: 2, LINEUP: 2, LINEUP_COND: 5, TAKEOFF: 10, LANDING_CLR: 10, LANDED: 5, PHRASE: 2, WAKE_CAUTION: 3,
    TRANSFER: 5, TAXI_IN: 3, CONTINUE: 3, GA_JUSTIFIED: 10, READBACK_FIX: 10, ACK: 5, EMERG_OK: 15, JOIN: 3, ORBIT_OK: 2, RELEASE_REQ: 3,
    RWY_OCCUPIED: -50, TWO_LANDING: -30, LINEUP_WITH_LANDING: -30, LINEUP_CLOSE: -10, LINEUP_ROLLOUT: -15, ARR_TOO_CLOSE: -20,
    NO_RELEASE: -30, WAKE: -40, SUCCESSIVE: -25, EMERG_PRIORITY: -30, EMERG_NOACK: -10, NO_LANDING_CLR: -20, LOSS_RWY: -50,
    GA_UNJUSTIFIED: -15, LATE_TRANSFER: -10, EARLY_TRANSFER: -5, READBACK_MISSED: -15, NEEDLESS_FIX: -3, CIRCUIT_FULL: -10,
    AIRPROX: -40, DELAY_HP: -5, DELAY_EXIT: -5, DELAY_ORBIT: -5
  };

  // ---------- Aeronaves ----------
  const AC = t => R.AIRCRAFT.find(a => a.t === t);
  const LIGHT = ['C172', 'P28A', 'SR22', 'DA42', 'TB20'].map(AC);
  const IFR_TYPES = R.AIRCRAFT.filter(a => a.speed !== 'muyrapida' && a.kind !== 'helicóptero' && a.kind !== 'pistón' && a.t !== 'C130' && a.t !== 'A400');
  const FIGHTERS = R.AIRCRAFT.filter(a => a.speed === 'muyrapida');
  const apprSpeed = a => a.wake === 'L' && a.speed === 'lenta' ? 80 : a.speed === 'media' ? 125 : (a.wake === 'H' || a.wake === 'J') ? 150 : 140;
  const rollTime = a => a.wake === 'L' ? 22 : a.speed === 'media' ? 28 : (a.wake === 'H' || a.wake === 'J') ? 42 : a.speed === 'muyrapida' ? 18 : 35;
  const climbSpeed = a => a.speed === 'lenta' ? 85 : a.speed === 'media' ? 160 : a.speed === 'muyrapida' ? 300 : 190;
  const wakeCat = a => ({ L: 'L', M: 'M', H: 'H', J: 'J' })[a.wake];

  // ---------- Escenarios ----------
  // traffic: lista de [t (s), 'dep'|'arr', 'IFR'|'VFR', tipo opcional]
  function mkTraffic(rng, spec) {
    const out = []; const pick = arr => arr[Math.floor(rng() * arr.length)];
    let tDep = spec.depStart || 0;
    // mezcla salidas IFR/VFR y repártelas en el tiempo
    const deps = []; for (let i = 0; i < (spec.depIFR || 0); i++) deps.push('IFR'); for (let i = 0; i < (spec.depVFR || 0); i++) deps.push('VFR');
    deps.sort(() => rng() - 0.5).forEach((r, i) => { out.push({ t: tDep, kind: 'dep', rules: r, type: r === 'VFR' ? pick(LIGHT) : (spec.fighter && i === 2 ? pick(FIGHTERS) : pick(IFR_TYPES)) }); tDep += spec.depGap[0] + rng() * (spec.depGap[1] - spec.depGap[0]); });
    let tArr = spec.arrStart || 40;
    for (let i = 0; i < (spec.arrIFR || 0); i++) { out.push({ t: tArr, kind: 'arr', rules: 'IFR', type: pick(IFR_TYPES) }); tArr += spec.arrGap[0] + rng() * (spec.arrGap[1] - spec.arrGap[0]); }
    let tV = spec.vfrStart || 20;
    for (let i = 0; i < (spec.arrVFR || 0); i++) { out.push({ t: tV, kind: 'arr', rules: 'VFR', type: pick(LIGHT), pt: pick(Object.keys(VFR_PTS)) }); tV += 50 + rng() * 80; }
    return out.sort((a, b) => a.t - b.t);
  }
  const SCENARIOS = [
    { id: 'salidas', title: 'Hora punta de salidas', diff: 1, desc: 'Muchas salidas IFR de tipos variados y pocas llegadas: ordenar la secuencia, estela, salidas sucesivas y suelta de APP.',
      notes: 'Separación genérica en tiempo. Salidas sueltas salvo aviso. Sin GND: llevas también la rodadura.', readback: 0.3,
      traffic: rng => mkTraffic(rng, { depIFR: 7, depGap: [25, 55], arrIFR: 2, arrStart: 200, arrGap: [260, 360], fighter: true }), events: [] },
    { id: 'mixto', title: 'Tráfico mixto IFR', diff: 2, desc: 'Llegadas y salidas IFR intercaladas en pista única: huecos entre llegadas, autorizaciones tardías y una frustrada.',
      notes: 'APP radar. Salidas sueltas salvo aviso. Sin GND: llevas también la rodadura.', readback: 0.25,
      traffic: rng => mkTraffic(rng, { depIFR: 6, depGap: [60, 110], arrIFR: 6, arrStart: 30, arrGap: [150, 230] }), events: [{ t: 420, type: 'goaround' }] },
    { id: 'vfr', title: 'Circuito VFR', diff: 2, desc: 'Llegadas VFR por los puntos de notificación, circuito lleno, órbitas y algún IFR en final.',
      notes: 'Circuito a 1 000 ft. Puntos VFR N, S, E, W. Sin GND: llevas también la rodadura.', readback: 0.2,
      traffic: rng => mkTraffic(rng, { depIFR: 1, depVFR: 3, depGap: [90, 160], depStart: 60, arrIFR: 2, arrStart: 150, arrGap: [300, 400], arrVFR: 6, vfrStart: 5 }), events: [] },
    { id: 'emergencias', title: 'Emergencias', diff: 3, desc: 'Tráfico mixto con un MAYDAY, un aviso de combustible mínimo y una frustrada por cizalladura.',
      notes: 'APP radar. Servicios de emergencia disponibles. Sin GND: llevas también la rodadura.', readback: 0.2,
      traffic: rng => mkTraffic(rng, { depIFR: 5, depGap: [70, 120], arrIFR: 6, arrStart: 20, arrGap: [160, 230] }),
      events: [{ t: 150, type: 'minfuel' }, { t: 330, type: 'mayday' }, { t: 700, type: 'goaround' }] },
    { id: 'sujetas', title: 'Coordinación: todas sujetas', diff: 2, desc: 'APP ha pasado a "todas sujetas": cada salida IFR necesita su suelta antes del despegue.',
      notes: 'Coordinación con APP: TODAS LAS SALIDAS SUJETAS. Pide la suelta con "suelta <indicativo>".', readback: 0.25, allHeld: true,
      traffic: rng => mkTraffic(rng, { depIFR: 6, depGap: [40, 80], arrIFR: 3, arrStart: 180, arrGap: [240, 320] }), events: [] },
    { id: 'libre', title: 'Sesión libre', diff: 2, desc: 'Tráfico continuo IFR y VFR con eventos al azar. Termina cuando quieras.',
      notes: 'APP radar. Salidas sueltas salvo aviso. Sin GND: llevas también la rodadura.', readback: 0.25, endless: true,
      traffic: () => [], events: [] }
  ];

  // ---------- Comandos ----------
  const HELP = [
    ['ruede · taxi', 'IBE123 ruede a punto de espera pista 27 (salidas) / ruede a plataforma (llegadas)'],
    ['alinee · lu', 'IBE123 alinee y mantenga pista 27 · condicional: detrás del A320 en final, entre y mantenga pista 27, detrás'],
    ['despegue · to', 'IBE123 viento 270 grados 8 nudos, pista 27 autorizado a despegar'],
    ['aterrizar · cl', 'IBE123 viento 270 grados 8 nudos, pista 27 autorizado a aterrizar'],
    ['continúe · ca', 'IBE123 continúe aproximación'],
    ['motor y al aire · ga', 'IBE123 motor y al aire'],
    ['mantenga posición · hp', 'IBE123 mantenga posición, cancele despegue'],
    ['contacte · app', 'IBE123 contacte con aproximación (salidas en el aire, frustradas)'],
    ['viento en cola · dw', 'ECABC entre en viento en cola (VFR)'],
    ['orbite · orb', 'ECABC orbite sobre su posición (VFR)'],
    ['negativo', 'IBE123 negativo, QNH 1018 (corregir una colación)'],
    ['recibido · ack', 'IBE123 recibido (acusar recibo de una emergencia o aviso)'],
    ['suelta', 'suelta IBE123 (pedir la suelta de una salida a APP)']
  ];

  function mount(rootEl, opts) {
    opts = opts || {};
    const store = opts.store || { get: (k, d) => d, set() {} };
    rootEl.innerHTML = '';
    const best = store.get('simBest', {});
    rootEl.innerHTML = `<div class="view-head"><div><div class="eyebrow">Juego</div><h1>Simulador de torre</h1>
      <p>Un turno de torre continuo en tiempo real. Escribe tus transmisiones en la línea de comandos (fraseología en español o alias cortos), mueve las etiquetas del radar y ordena las fichas. Cada decisión suma o resta puntos.</p></div></div>
      <div class="grid cols-3">${SCENARIOS.map(s => `<button class="scen ${best[s.id] != null ? 'done' : ''}" data-sim="${s.id}"><span class="body">
        <span class="cs"><span>Aeródromo al azar</span><span>${'●'.repeat(s.diff)}${'○'.repeat(3 - s.diff)}</span></span>
        <span class="tt" style="display:block">${esc(s.title)}</span>
        <span class="small" style="display:block;margin:4px 0">${esc(s.desc)}</span>
        <span class="small muted">${s.endless ? 'Sin final' : 'Termina al despachar todo el tráfico'}${best[s.id] != null ? ` · mejor ${best[s.id]} puntos` : ''}</span></span></button>`).join('')}</div>
      <details class="help" style="margin-top:16px"><summary>Comandos y puntuación</summary>${helpHtml()}</details>`;
    rootEl.querySelectorAll('[data-sim]').forEach(b => b.onclick = () => start(rootEl, SCENARIOS.find(s => s.id === b.dataset.sim), store));
  }
  function helpHtml() {
    return `<div class="tbl"><table><thead><tr><th>Orden</th><th>Ejemplo</th></tr></thead><tbody>${HELP.map(h => `<tr><td><code>${esc(h[0])}</code></td><td>${esc(h[1])}</td></tr>`).join('')}</tbody></table></div>
      <p class="small muted">El indicativo puede ir en cualquier parte del mensaje y vale con sus últimas cifras si no hay duda. Si no escribes indicativo, la orden va a la aeronave seleccionada (clic en su ficha o etiqueta). Tab completa indicativos; ↑/↓ recorren el historial.</p>
      <div class="tbl"><table><thead><tr><th>Acierto</th><th>Puntos</th><th>Error</th><th>Puntos</th></tr></thead><tbody>
      ${[['Despegue bien separado', PTS.TAKEOFF, 'Pista ocupada', PTS.RWY_OCCUPIED], ['Autorización de aterrizaje correcta', PTS.LANDING_CLR, 'Dos autorizaciones de aterrizaje', PTS.TWO_LANDING], ['Fraseología completa (pista + viento)', PTS.PHRASE, 'Estela en salida', PTS.WAKE], ['Corregir una colación errónea', PTS.READBACK_FIX, 'Salidas sucesivas', PTS.SUCCESSIVE], ['Transferencia a APP', PTS.TRANSFER, 'Despegue sin suelta', PTS.NO_RELEASE], ['Frustrada justificada', PTS.GA_JUSTIFIED, 'Prioridad de la emergencia', PTS.EMERG_PRIORITY], ['Emergencia gestionada', PTS.EMERG_OK, 'Proximidad en el aire', PTS.AIRPROX], ['Alineación condicional', PTS.LINEUP_COND, 'Llegada sin autorización (frustrada)', PTS.NO_LANDING_CLR]].map(r => `<tr><td>${r[0]}</td><td class="tabular">+${r[1]}</td><td>${r[2]}</td><td class="tabular">${r[3]}</td></tr>`).join('')}
      </tbody></table></div>`;
  }

  // =====================================================================
  function start(rootEl, scen, store) {
    const rng = Math.random;
    const ctx = SC.makeCtx(rng);
    const side = rng() < 0.5 ? 1 : -1; // 1: circuito por la izquierda (lado +y)
    const S = {
      t: 0, speed: 1, paused: false, scen, ctx, side, ac: [], score: 0, nGood: 0, nBad: 0, penalties: {}, lastDep: null, gaHold: false,
      queue: scen.traffic(rng), events: scen.events.slice(), sel: null, help: true, voice: false, ended: false, nextId: 1,
      pending: [], transcript: [], hist: [], hi: -1, order: { dep: [], arr: [] }, lastTip: -999, airprox: {}, endless: !!scen.endless, nextSpawn: 0
    };
    const clock0 = 9 * 3600 + Math.floor(rng() * 8) * 3600;
    const rwy = ctx.rwy;
    rootEl.innerHTML = `<div class="sim">
      <div class="sim-bar">
        <div><b>${esc(scen.title)}</b> <span class="muted">· ${esc(ctx.apt.icao)} ${esc(ctx.apt.city)} · pista ${esc(rwy)}</span></div>
        <div class="row">
          <span class="sim-clock tabular" id="sClock"></span>
          <div class="seg" id="sSpeed">${[0, 1, 2, 4].map(v => `<button data-v="${v}" aria-pressed="${v === 1}">${v ? v + '×' : '❚❚'}</button>`).join('')}</div>
          <label class="chip"><input type="checkbox" id="sHelp" checked> Ayudas</label>
          <label class="chip"><input type="checkbox" id="sVoice"> Voz</label>
          <span class="sim-score tabular" id="sScore">0</span>
          <button class="btn" id="sEnd">Terminar</button>
        </div>
      </div>
      <div class="atis"><b>ATIS</b> · ${esc(ctx.metar)} · Pista ${esc(rwy)} · Circuito por la ${side > 0 ? 'izquierda' : 'derecha'} · ${esc(scen.notes)}</div>
      <div class="sim-grid">
        <div class="sim-left">
          <div class="scope sim-radar"><svg id="sRadar" viewBox="-7.2 -5.6 20.4 11.2" role="img" aria-label="Radar de aproximación"></svg></div>
          <div class="scope sim-ground"><svg id="sGround" viewBox="-1.75 -0.12 2.05 0.66" role="img" aria-label="Vista del aeródromo"></svg></div>
        </div>
        <div class="sim-strips">
          <div class="bay"><div class="bay-h">Salidas</div><div id="bayDep" class="bay-list"></div></div>
          <div class="bay"><div class="bay-h">Llegadas</div><div id="bayArr" class="bay-list"></div></div>
        </div>
      </div>
      <div class="sim-comms">
        <div class="sim-log" id="sLog" aria-live="polite"></div>
        <form class="sim-input" id="sForm" autocomplete="off"><span class="mono">TWR&gt;</span><input id="sCmd" spellcheck="false" placeholder="p. ej. IBE123 ruede a punto de espera pista ${esc(rwy)}"><button class="btn primary">Transmitir</button></form>
      </div>
      <details class="help"><summary>Comandos y puntuación</summary>${helpHtml()}</details>
    </div>`;
    const $ = id => rootEl.querySelector('#' + id);
    const radar = $('sRadar'), ground = $('sGround'), logEl = $('sLog'), cmd = $('sCmd');

    // ---------- registro y voz ----------
    const clockStr = () => { const s = clock0 + Math.floor(S.t); return `${pad(Math.floor(s / 3600) % 24, 2)}:${pad(Math.floor(s / 60) % 60, 2)}:${pad(s % 60, 2)}Z`; };
    function log(who, text, cls) {
      S.transcript.push(`${clockStr()} ${who}: ${text}`);
      const d = document.createElement('div'); d.className = 'msg ' + (cls || '');
      d.innerHTML = `<span class="tm">${clockStr().slice(0, 5)}</span><span class="who">${esc(who)}</span><span class="tx">${esc(text)}</span>`;
      logEl.appendChild(d); logEl.scrollTop = logEl.scrollHeight;
    }
    function speak(text) {
      if (!S.voice || !root.speechSynthesis) return;
      try { const u = new SpeechSynthesisUtterance(text); u.lang = 'es-ES'; u.rate = 1.15; root.speechSynthesis.speak(u); } catch (e) { /* sin voz */ }
    }
    // respuesta de una estación con un pequeño retardo
    function reply(who, text, delay, cb) { S.pending.push({ t: S.t + (delay == null ? 1.5 + Math.random() * 1.5 : delay), who, text, cb }); }
    function award(key, why, cs) {
      const p = PTS[key]; S.score += p; if (p > 0) S.nGood++; else { S.nBad++; S.penalties[why] = (S.penalties[why] || 0) + p; }
      log(p > 0 ? `+${p}` : String(p), (cs ? cs + ': ' : '') + why, p > 0 ? 'good' : 'bad');
      $('sScore').textContent = S.score; $('sScore').classList.toggle('neg', S.score < 0);
    }
    function tip(text) { if (S.t - S.lastTip > 45) { S.lastTip = S.t; log('Instructor', text, 'tip'); } }

    // ---------- aeronaves ----------
    function spawn(q) {
      const type = q.type || AC('A320');
      const a = { id: S.nextId++, cs: q.rules === 'VFR' ? ctx.cs('vfr') : ctx.cs('ifr'), type, rules: q.rules, kind: q.kind, x: 0, y: 0, alt: 0, spd: 0,
        tag: { dx: 0.35, dy: -0.55 }, gtag: { dx: 0.03, dy: -0.07 }, t0: S.t, cl: {}, flags: {} };
      if (q.again) Object.assign(a, { cs: q.again.cs, type: q.again.type });
      if (a.kind === 'dep') {
        const free = STANDS.filter(x => !S.ac.some(o => o.stand === x)); a.stand = free.length ? free[Math.floor(Math.random() * free.length)] : STANDS[0];
        a.state = 'stand'; a.x = a.stand; a.y = APRON_Y; a.sid = DEP_EXIT[Math.floor(Math.random() * DEP_EXIT.length)];
        a.needsRelease = a.rules === 'IFR' && !!scen.allHeld;
        reply(a.cs, `${ctx.twr}, ${a.cs}, ${a.type.t}, en plataforma, ${a.rules === 'VFR' ? 'VFR local, ' : ''}solicito rodaje`, 0.5);
      } else if (a.rules === 'IFR') {
        a.state = 'final'; a.x = q.dist || 10; a.y = 0; a.spd = apprSpeed(type); a.alt = a.x * 318;
        reply(a.cs, `${ctx.twr}, ${a.cs}${type.wake === 'H' || type.wake === 'J' ? ' pesado' : ''}, establecido ILS pista ${rwy}, ${Math.round(a.x)} millas`, 0.5);
      } else {
        const p = VFR_PTS[q.pt]; a.pt = q.pt; a.state = 'hold'; a.x = p.x; a.y = p.y; a.cx = p.x; a.cy = p.y; a.ang = 0; a.spd = 90; a.alt = 2000;
        reply(a.cs, `${ctx.twr}, ${a.cs}, ${type.name}, sobre ${q.pt}, 2 000 pies, instrucciones para aterrizar`, 0.5);
      }
      S.ac.push(a); S.order[a.kind].push(a.id);
      return a;
    }
    const remove = a => { S.ac = S.ac.filter(o => o !== a); S.order[a.kind] = S.order[a.kind].filter(i => i !== a.id); if (S.sel === a.id) S.sel = null; };
    const onRunway = a => ['lineup', 'lined', 'roll', 'landroll'].includes(a.state) || a.state === 'abort';
    const occupants = ex => S.ac.filter(o => o !== ex && onRunway(o));
    const landingCleared = ex => S.ac.filter(o => o !== ex && o.cl.land && (o.state === 'final' || o.state === 'circuit'));
    const finals = () => S.ac.filter(o => o.state === 'final' || (o.state === 'circuit' && o.leg >= 2)).sort((p, q) => distThr(p) - distThr(q));
    const distThr = o => Math.hypot(o.x, o.y);
    const emergencyActive = ex => S.ac.find(o => o !== ex && o.emer === 'MAYDAY' && (o.state === 'final' || o.state === 'circuit' || o.state === 'landroll'));
    function inCircuit() { return S.ac.filter(o => o.rules === 'VFR' && o.kind === 'arr' && o.state === 'circuit').length; }
    function circuitPath(fromGa) {
      const s = side, yd = s * 1.3;
      // leg = tramo que empieza al alcanzar el punto: 1 viento en cola, 2 base, 3 final
      const p = fromGa ? [{ x: -1.9, y: 0 }, { x: -1.9, y: yd, leg: 1 }] : [{ x: -1.2, y: yd, leg: 1 }];
      return p.concat([{ x: 1.9, y: yd, leg: 2 }, { x: 1.9, y: 0, leg: 3 }, { x: 0, y: 0 }]);
    }
    const legName = a => a.state === 'hold' ? `orbitando ${a.pt || ''}` : a.state === 'orbit' ? 'orbitando' : (['entrando', 'viento en cola', 'base', 'final'][a.leg || 0]);

    // separación requerida respecto a la salida anterior (para ayudas y para puntuar)
    function depCheck(a) {
      const res = { wake: 0, succ: 0, sujeta: false, elapsed: Infinity };
      if (a.rules === 'IFR' && (a.needsRelease || S.gaHold)) res.sujeta = true;
      const p = S.lastDep; if (!p) return res;
      res.elapsed = S.t - p.t; if (res.elapsed > 400) return res;
      res.wake = (R.depWake(p.type, a.type, false) || 0) * 60;
      if (a.rules === 'IFR' && p.rules === 'IFR') { const s = R.successive(p.type, a.type); if (s.sujeta) res.sujeta = true; else res.succ = s.min * 60; }
      res.prev = p; return res;
    }
    const arrTime = o => o.state === 'final' ? o.x / (o.spd / 3600) : distThr(o) / (o.spd / 3600);

    // ---------- parser ----------
    // indicativo completo en cualquier parte, o abreviado (últimos caracteres) al principio del mensaje
    function findAc(text) {
      const toks = text.toUpperCase().replace(/-/g, '').split(/[^A-Z0-9ÑÁÉÍÓÚ]+/).filter(Boolean);
      for (const t of toks) { const a = S.ac.find(o => o.cs === t); if (a) return a; }
      const t = toks[0] || ''; if (t.length < 2) return null;
      const m = S.ac.filter(o => o.cs.endsWith(t));
      return m.length === 1 ? m[0] : null;
    }
    const has = (n, ...ks) => ks.some(k => k instanceof RegExp ? k.test(n) : n.includes(k));
    function intent(n) {
      if (has(n, /\bsuelta\b/, /\brelease\b/)) return 'release';
      if (has(n, 'negativo', /\bneg\b/)) return 'negative';
      if (has(n, 'motor y al aire', /\bga\b/, 'go around')) return 'goaround';
      if (has(n, 'cancele', 'aborte', 'mantenga posicion', /\bhp\b/, 'hold position')) return 'hold';
      if (has(n, 'alinee', 'entre y mantenga', /\blu\b/, 'line up')) return 'lineup';
      if (has(n, 'despeg', /\bc?to\b/, 'takeoff')) return 'takeoff';
      if (has(n, 'aterriz', /\bcl\b/, /\bland\b/)) return 'land';
      if (has(n, 'viento en cola', /\bdw\b/, 'downwind', 'entre en')) return 'join';
      if (has(n, 'orbite', /\borb\b/, 'orbit')) return 'orbit';
      if (has(n, 'contin', /\bca\b/)) return 'continue';
      if (has(n, 'ruede', 'rodar', 'rodaje', /\btaxi\b/, /\bt\b/)) return 'taxi';
      if (has(n, 'contacte', 'llame', 'escucha', /\bapp\b/, 'aproximacion', /\bct\b/)) return 'transfer';
      if (has(n, 'recibido', /\back\b/, 'enterado')) return 'ack';
      return null;
    }
    const phraseOk = n => n.includes(norm(rwy)) && (n.includes('viento') || n.includes('calma'));

    function transmit(raw) {
      const text = raw.trim(); if (!text) return;
      log('TWR', text, 'atc');
      const n = norm(text); const it = intent(n);
      let a = findAc(text); if (!a && S.sel) a = S.ac.find(o => o.id === S.sel);
      if (!it) { log('Sistema', 'No reconozco la orden. Abre "Comandos y puntuación" para ver ejemplos.', 'sys'); return; }
      if (!a) { log('Sistema', 'No encuentro el indicativo. Escríbelo o selecciona una aeronave.', 'sys'); return; }
      S.sel = a.id;
      if (a.flags.ackDue && it !== 'ack') { a.flags.ackDue = null; award('ACK', 'acuse de recibo implícito de la emergencia', a.cs); }
      ({ release, negative, goaround, hold, lineup, takeoff, land, join, orbit, continue: cont, taxi, transfer, ack })[it](a, n);
    }
    const unable = (a, why) => reply(a.cs, `${why}, ${a.cs}`);

    function release(a) {
      if (a.kind !== 'dep' || a.rules !== 'IFR' || !['stand', 'taxi', 'hp', 'lined', 'lineup'].includes(a.state)) { log('APP', `${a.cs} no es una salida IFR pendiente.`, 'sys'); return; }
      if (a.released) { reply('APP', `${a.cs} ya está suelto`, 2); return; }
      const need = depCheck(a).sujeta; if (need) award('RELEASE_REQ', 'suelta solicitada a APP', a.cs);
      // APP suelta cuando la salida anterior lleva ventaja suficiente (a veces tarda más)
      const ahead = S.lastDep ? Math.max(0, 100 - (S.t - S.lastDep.t)) : 0;
      const wait = Math.max(ahead, Math.random() < 0.2 ? 45 + Math.random() * 30 : 6 + Math.random() * 10);
      if (wait > 30) reply('APP', `${a.cs} todavía no, te aviso en un minuto`, 4);
      reply('APP', `${a.cs} suelto`, wait, () => { a.released = true; });
    }
    function negative(a, n) {
      const e = a.flags.rbErr;
      if (!e) { award('NEEDLESS_FIX', 'corrección innecesaria: la colación era correcta', a.cs); return; }
      const num = (n.match(/\b(\d{3,4})\b/) || [])[1];
      if (num && +num === ctx.qnh) { a.flags.rbErr = null; award('READBACK_FIX', 'colación errónea corregida a tiempo', a.cs); reply(a.cs, `QNH ${ctx.qnh}, ${a.cs}`); }
      else reply(a.cs, `Repita el QNH, ${a.cs}`);
    }
    function goaround(a) {
      if (!(a.state === 'final' || a.state === 'circuit')) return unable(a, 'Negativo, no estamos en aproximación');
      const justified = occupants(a).length || landingCleared(a).some(o => distThr(o) < distThr(a)) || emergencyActive(a);
      if (justified) award('GA_JUSTIFIED', 'motor y al aire justificado (pista no disponible)', a.cs); else award('GA_UNJUSTIFIED', 'motor y al aire innecesario: la pista estaba libre', a.cs);
      doGoAround(a, false); reply(a.cs, `Motor y al aire, ${a.cs}`);
    }
    function doGoAround(a, pilot) {
      a.cl.land = false;
      if (a.rules === 'VFR') { a.state = 'circuit'; a.path = circuitPath(true); a.leg = 0; return; }
      a.state = 'ga'; a.flags.gaT = S.t; S.gaHold = true;
    }
    function hold(a) {
      if (a.state === 'lined' || a.state === 'lineup') { a.cl.to = false; reply(a.cs, `Mantengo posición, ${a.cs}`); return; }
      if (a.state === 'roll' && a.x > -0.5) { a.state = 'abort'; a.tA = S.t; a.ax = a.x; reply(a.cs, `Abortando despegue, ${a.cs}`); return; }
      if (a.state === 'taxi') { a.flags.held = true; reply(a.cs, `Mantengo posición, ${a.cs}`); return; }
      unable(a, 'Negativo, no podemos detenernos');
    }
    function lineup(a, n) {
      if (a.kind !== 'dep' || !(a.state === 'hp' || a.state === 'taxi')) return unable(a, a.state === 'stand' ? 'Negativo, aún en plataforma' : 'Negativo');
      if (a.state === 'taxi') return unable(a, 'Aún rodando, le llamo en el punto de espera');
      const lnd = landingCleared(a);
      if (n.includes('detras')) {
        const f = finals().find(o => o.cl.land) || finals()[0];
        if (!f || distThr(f) > 6) return unable(a, 'Negativo, no veo tránsito en final');
        a.cond = f.id; award('LINEUP_COND', 'alineación condicional detrás de la llegada', a.cs);
        reply(a.cs, `Detrás del ${f.type.t} en final, alineo y mantengo pista ${rwy}, detrás, ${a.cs}`); a.state = 'hpcond'; return;
      }
      if (lnd.length) award('LINEUP_WITH_LANDING', `alineado con ${lnd[0].cs} autorizado a aterrizar`, a.cs);
      else if (occupants(a).some(o => o.state === 'landroll')) award('LINEUP_ROLLOUT', 'alineado con una llegada aún rodando en pista (usa la condicional)', a.cs);
      else if (occupants(a).some(o => o.state === 'lined' || o.state === 'lineup')) award('RWY_OCCUPIED', 'ya hay otra aeronave alineada', a.cs);
      else { const f = finals()[0]; if (f && distThr(f) < 4) award('LINEUP_CLOSE', `alineado con ${f.cs} a ${distThr(f).toFixed(1).replace('.', ',')} NM en final`, a.cs); else award('LINEUP', 'alineación correcta', a.cs); }
      a.state = 'lineup'; a.tL = S.t; reply(a.cs, `Alineo y mantengo pista ${rwy}, ${a.cs}`);
    }
    function takeoff(a, n) {
      if (a.kind !== 'dep' || !['hp', 'lined', 'lineup', 'hpcond'].includes(a.state)) return unable(a, a.state === 'taxi' ? 'Negativo, aún rodando' : 'Negativo');
      const occ = occupants(a);
      if (occ.length) { award('RWY_OCCUPIED', `autorización de despegue con ${occ[0].cs} en pista`, a.cs); return unable(a, 'Negativo, hay tránsito en pista'); }
      const lnd = landingCleared(a); let bad = false;
      if (lnd.length) { award('LINEUP_WITH_LANDING', `despegue con ${lnd[0].cs} ya autorizado a aterrizar`, a.cs); bad = true; }
      const em = emergencyActive(a); if (em && distThr(em) < 10) { award('EMERG_PRIORITY', `despegue con ${em.cs} en emergencia aproximando`, a.cs); bad = true; }
      const need = (a.state === 'lined' ? 0 : 15) + rollTime(a.type) + 20;
      const f = finals().find(o => !o.cl.land); if (!bad && f && arrTime(f) < need) { award('ARR_TOO_CLOSE', `${f.cs} demasiado cerca en final (${distThr(f).toFixed(1).replace('.', ',')} NM)`, a.cs); bad = true; }
      const d = depCheck(a);
      if (d.sujeta && !a.released) { award('NO_RELEASE', `despegue sin suelta de APP${S.gaHold ? ' (tras una frustrada la siguiente salida queda sujeta)' : ''}`, a.cs); bad = true; }
      else {
        if (d.wake && d.elapsed < d.wake - 5) { award('WAKE', `estela tras ${d.prev.cs} (${d.prev.type.t}): ${fmtMin(d.wake / 60)}, solo ${mmss(d.elapsed)}`, a.cs); bad = true; }
        if (!a.released && d.succ && d.elapsed < d.succ - 5) { award('SUCCESSIVE', `salidas sucesivas tras ${d.prev.cs}: ${fmtMin(d.succ / 60)}, solo ${mmss(d.elapsed)}`, a.cs); bad = true; }
      }
      if (!bad) award('TAKEOFF', 'despegue bien separado', a.cs);
      if (phraseOk(n)) award('PHRASE', 'fraseología completa (pista y viento)', a.cs); else tip('En las autorizaciones de pista incluye siempre la pista y el viento en superficie.');
      a.cl.to = true; if (a.state === 'hp' || a.state === 'hpcond') { a.state = 'lineup'; a.tL = S.t; a.immediate = true; }
      reply(a.cs, `Autorizado a despegar pista ${rwy}, ${a.cs}`);
    }
    function land(a, n) {
      const ok = a.kind === 'arr' && (a.state === 'final' || (a.state === 'circuit' && a.leg >= 1));
      if (!ok) return unable(a, a.state === 'hold' || a.state === 'orbit' ? 'Negativo, aún no estamos en el circuito' : 'Negativo');
      if (a.cl.land) return reply(a.cs, `Ya autorizados, ${a.cs}`);
      let bad = false; const lnd = landingCleared(a);
      if (lnd.length) { award('TWO_LANDING', `${lnd[0].cs} ya estaba autorizado a aterrizar`, a.cs); bad = true; }
      const occ = occupants(a); if (occ.length) { award('RWY_OCCUPIED', `autorización de aterrizaje con ${occ[0].cs} en pista`, a.cs); bad = true; }
      if (!bad) award('LANDING_CLR', 'autorización de aterrizaje correcta', a.cs);
      if (phraseOk(n)) award('PHRASE', 'fraseología completa (pista y viento)', a.cs); else tip('En las autorizaciones de pista incluye siempre la pista y el viento en superficie.');
      const prevHeavy = S.lastLanded && S.t - S.lastLanded.t < 150 && R.WAKE_RANK[R.leadingWake(S.lastLanded.type)] > R.WAKE_RANK[a.type.wake];
      if (a.rules === 'VFR' && prevHeavy && n.includes('estela')) award('WAKE_CAUTION', '"precaución estela turbulenta" tras una aeronave mayor', a.cs);
      a.cl.land = true; reply(a.cs, `Autorizado a aterrizar pista ${rwy}, ${a.cs}`);
    }
    function join(a) {
      if (!(a.rules === 'VFR' && a.kind === 'arr' && (a.state === 'hold' || a.state === 'orbit'))) return unable(a, 'Negativo');
      if (inCircuit() >= 4) award('CIRCUIT_FULL', 'circuito lleno (4 aeronaves): debía orbitar', a.cs); else award('JOIN', 'integración en el circuito', a.cs);
      a.state = 'circuit'; a.path = circuitPath(false); a.leg = 0;
      reply(a.cs, `Entro en viento en cola ${side > 0 ? 'izquierda' : 'derecha'} pista ${rwy}, ${a.cs}`);
    }
    function orbit(a) {
      if (!(a.rules === 'VFR' && a.kind === 'arr' && ['hold', 'circuit'].includes(a.state))) return unable(a, 'Negativo');
      if (a.state === 'hold') { if (inCircuit() >= 4) award('ORBIT_OK', 'órbita con el circuito lleno', a.cs); a.flags.orbT = a.flags.orbT || S.t; reply(a.cs, `Orbito sobre ${a.pt}, ${a.cs}`); return; }
      a.state = 'orbit'; a.cx = a.x; a.cy = a.y + 0.35 * side; a.ang = Math.atan2(a.y - a.cy, a.x - a.cx); a.flags.orbT = S.t; a.resume = a.path; a.resumeLeg = a.leg;
      reply(a.cs, `Orbito, ${a.cs}`);
    }
    function cont(a) {
      if (a.state === 'orbit') { a.state = 'circuit'; a.path = a.resume; a.leg = a.resumeLeg; return reply(a.cs, `Continúo, ${a.cs}`); }
      if (!(a.state === 'final' || (a.state === 'circuit' && a.leg >= 1))) return unable(a, 'Negativo');
      if (!a.cl.land && (occupants(a).length || landingCleared(a).length)) award('CONTINUE', 'continúe aproximación con la pista aún no disponible', a.cs);
      else if (!a.cl.land) tip('La pista estaba libre: podías autorizar el aterrizaje directamente.');
      reply(a.cs, `Continúo aproximación, ${a.cs}`);
    }
    function taxi(a) {
      if (a.kind === 'dep' && a.state === 'stand') {
        award('TAXI', 'rodaje al punto de espera', a.cs); a.state = 'taxi'; a.path = [{ x: a.stand, y: TWY_Y }, { x: HP.x - 0.08, y: TWY_Y }]; a.spd = 0.012;
        let q = ctx.qnh;
        if (Math.random() < scen.readback) { const s = String(q), i = s.length - 1 - Math.floor(Math.random() * 2); q = +(s.slice(0, i) + ((+s[i] + 1 + Math.floor(Math.random() * 8)) % 10) + s.slice(i + 1)); a.flags.rbErr = { t: S.t }; }
        reply(a.cs, `Ruedo a punto de espera pista ${rwy}, QNH ${q}, ${a.cs}`);
        return;
      }
      if (a.kind === 'dep' && a.state === 'taxi' && a.flags.held) { a.flags.held = false; return reply(a.cs, `Continúo rodaje, ${a.cs}`); }
      if (a.kind === 'arr' && a.state === 'exit') {
        if (!a.flags.taxiIn) { award('TAXI_IN', 'rodaje a plataforma tras librar la pista', a.cs); a.flags.taxiIn = true; }
        const free = STANDS.filter(x => !S.ac.some(o => o.stand === x)); a.stand = free.length ? free[0] : STANDS[STANDS.length - 1];
        a.state = 'taxiin'; a.path = [{ x: a.x, y: TWY_Y }, { x: a.stand, y: TWY_Y }, { x: a.stand, y: APRON_Y }]; a.spd = 0.012;
        return reply(a.cs, `Ruedo a plataforma, ${a.cs}`);
      }
      if (a.kind === 'arr' && a.state === 'landroll') { a.flags.taxiIn = true; award('TAXI_IN', 'instrucciones de rodaje anticipadas', a.cs); return reply(a.cs, `Al librar, ruedo a plataforma, ${a.cs}`); }
      unable(a, 'Negativo');
    }
    function transfer(a, n) {
      const toGnd = has(n, 'rodadura', /\bgnd\b/, 'tierra');
      if ((a.state === 'climb' || a.state === 'ga') && !toGnd) {
        if (a.flags.xfer) return;
        a.flags.xfer = true;
        if (a.state === 'ga' || a.rules === 'IFR') award('TRANSFER', a.state === 'ga' ? 'frustrada transferida a APP' : 'transferencia a APP', a.cs);
        return reply(a.cs, `Con aproximación, ${a.cs}, hasta luego`);
      }
      if (a.kind === 'dep' && ['taxi', 'hp', 'lined', 'lineup', 'roll'].includes(a.state) && !toGnd) { award('EARLY_TRANSFER', 'transferencia antes de despegar', a.cs); return unable(a, 'Negativo, aún en tierra'); }
      if (a.kind === 'arr' && ['exit', 'landroll', 'taxiin'].includes(a.state)) { tip('No hay GND conectado: tras librar la pista dale tú el rodaje ("ruede a plataforma").'); return unable(a, 'Negativo, no hay rodadura en frecuencia'); }
      unable(a, 'Repita');
    }
    function ack(a) {
      if (a.flags.ackDue) { a.flags.ackDue = null; award('ACK', a.emer === 'MAYDAY' ? 'acuse de recibo de la emergencia' : 'acuse de recibo', a.cs); return; }
      reply(a.cs, a.cs, 1);
    }

    // ---------- eventos ----------
    function fireEvent(ev) {
      const fin = S.ac.filter(o => o.kind === 'arr' && o.rules === 'IFR' && o.state === 'final');
      if (ev.type === 'mayday' || ev.type === 'minfuel') {
        const a = fin.filter(o => o.x > 5 && !o.emer).sort((p, q) => q.x - p.x)[0]; if (!a) return false;
        if (ev.type === 'mayday') { a.emer = 'MAYDAY'; a.flags.ackDue = S.t + 25; reply(a.cs, `MAYDAY MAYDAY MAYDAY, ${ctx.twr}, ${a.cs}, ${['fallo de motor', 'humo en cabina', 'fuego en motor izquierdo'][Math.floor(Math.random() * 3)]}, continuamos ILS pista ${rwy}, solicitamos servicios de emergencia`, 0.5); }
        else { a.emer = 'FUEL'; a.flags.ackDue = S.t + 30; reply(a.cs, `${a.cs}, combustible mínimo`, 0.5); }
        return true;
      }
      if (ev.type === 'goaround') {
        const a = fin.find(o => o.cl.land && o.x < 3 && o.x > 1 && !o.emer); if (!a) return false;
        doGoAround(a, true); reply(a.cs, `Motor y al aire, ${a.cs}, cizalladura en final`, 0.3); return true;
      }
      return true;
    }

    // ---------- física ----------
    function moveAlong(a, dist) {
      while (dist > 0 && a.path && a.path.length) {
        const w = a.path[0]; const dx = w.x - a.x, dy = w.y - a.y, d = Math.hypot(dx, dy);
        if (d <= dist) { a.x = w.x; a.y = w.y; dist -= d; if (w.leg != null) a.leg = w.leg; a.path.shift(); }
        else { a.x += dx / d * dist; a.y += dy / d * dist; a.hdg = Math.atan2(dy, dx); dist = 0; }
      }
      return !a.path || !a.path.length;
    }
    function step(dt) {
      S.t += dt;
      // cola de tráfico
      while (S.queue.length && S.queue[0].t <= S.t) {
        const q = S.queue[0];
        // APP entrega las llegadas IFR con al menos 5 NM entre ellas
        if (q.kind === 'arr' && q.rules === 'IFR' && S.ac.some(o => o.state === 'final' && o.x > 5)) { q.t = S.t + 15; S.queue.sort((p, r) => p.t - r.t); break; }
        spawn(S.queue.shift());
      }
      if (S.endless && S.t >= S.nextSpawn) {
        const r = Math.random(); const last = S.ac.filter(o => o.state === 'final').sort((p, q) => q.x - p.x)[0];
        if (r < 0.4) { if (!last || last.x < 4.5) spawn({ kind: 'arr', rules: 'IFR', type: IFR_TYPES[Math.floor(Math.random() * IFR_TYPES.length)] }); }
        else if (r < 0.8) { const vfr = Math.random() < 0.2; spawn({ kind: 'dep', rules: vfr ? 'VFR' : 'IFR', type: vfr ? LIGHT[Math.floor(Math.random() * LIGHT.length)] : IFR_TYPES[Math.floor(Math.random() * IFR_TYPES.length)] }); }
        else if (inCircuit() < 5) spawn({ kind: 'arr', rules: 'VFR', type: LIGHT[Math.floor(Math.random() * LIGHT.length)], pt: Object.keys(VFR_PTS)[Math.floor(Math.random() * 4)] });
        if (Math.random() < 0.06) S.events.push({ t: S.t + 30, type: ['mayday', 'minfuel', 'goaround'][Math.floor(Math.random() * 3)] });
        S.nextSpawn = S.t + 55 + Math.random() * 60;
      }
      // un evento que no encuentra aeronave adecuada se reintenta cada 20 s durante 4 min
      S.events = S.events.filter(ev => {
        if (ev.t > S.t) return true;
        if (fireEvent(ev)) return false;
        ev.t0 = ev.t0 || ev.t; ev.t = S.t + 20; return S.t - ev.t0 < 240;
      });
      // mensajes pendientes
      S.pending.sort((p, q) => p.t - q.t);
      while (S.pending.length && S.pending[0].t <= S.t) { const m = S.pending.shift(); log(m.who, m.text, m.who === 'APP' ? 'app' : 'pilot'); speak(m.text); if (m.cb) m.cb(); }

      for (const a of S.ac.slice()) {
        const v = a.spd / 3600 * dt;
        switch (a.state) {
          case 'taxi': if (!a.flags.held && moveAlong(a, a.spd * dt)) { a.state = 'hp'; a.tHP = S.t; reply(a.cs, `${a.cs}, en punto de espera pista ${rwy}, listo para salir`, 0.5); } break;
          case 'hpcond': { const f = S.ac.find(o => o.id === a.cond); if (!f || (f.state === 'landroll' && f.x < -0.3) || f.state === 'exit' || f.state === 'taxiin' || f.state === 'ga') { a.state = 'lineup'; a.tL = S.t; } break; }
          case 'lineup': { if (a.lx == null) { a.lx = a.x; a.ly = a.y; } const k = clamp((S.t - a.tL) / 15, 0, 1); a.x = a.lx * (1 - k); a.y = a.ly * (1 - k); if (k >= 1) { a.state = 'lined'; if (a.cl.to) startRoll(a); } break; }
          case 'lined': if (a.cl.to) startRoll(a); break;
          case 'roll': { const T = rollTime(a.type), k = (S.t - a.tR) / T; a.x = -RWY_LEN * k * k; a.y = 0; if (k >= 1) { a.state = 'climb'; a.x = -RWY_LEN; a.alt = 50; a.spd = climbSpeed(a.type); a.hdg = Math.PI; } break; }
          case 'abort': { const k = clamp((S.t - a.tA) / 12, 0, 1); a.x = a.ax - 0.15 * (1 - (1 - k) * (1 - k)); if (k >= 1) { a.state = 'exit'; a.x = EXITS[0]; a.flags.abortBack = true; reply(a.cs, `${a.cs}, detenidos, libramos la pista, solicitamos volver al punto de espera`, 2); } break; }
          case 'climb': {
            a.alt = Math.min(a.alt + (a.type.speed === 'lenta' ? 700 : 2200) / 60 * dt, a.rules === 'VFR' ? 2000 : 6000);
            if (a.x > -2.6) { a.x -= v; a.hdg = Math.PI; } else { const dx = a.sid.x - a.x, dy = a.sid.y - a.y, d = Math.hypot(dx, dy) || 1; a.x += dx / d * v; a.y += dy / d * v; a.hdg = Math.atan2(dy, dx); }
            const far = distThr(a);
            if (a.rules === 'IFR' && !a.flags.xfer && far > 5.5 && !a.flags.late) { a.flags.late = true; award('LATE_TRANSFER', 'salida no transferida a APP a tiempo', a.cs); reply(a.cs, `${ctx.twr}, ${a.cs}, ¿cambiamos con aproximación?`); }
            if ((a.flags.xfer && far > 4) || far > 8.5 || (a.rules === 'VFR' && far > 4.5)) remove(a);
            break;
          }
          case 'final': {
            a.x -= v; a.alt = Math.max(0, a.x * 318); a.hdg = Math.PI;
            if (a.x < 0.6 && !a.cl.land) { award('NO_LANDING_CLR', 'llegada sin autorización de aterrizaje: motor y al aire', a.cs); doGoAround(a, true); reply(a.cs, `Motor y al aire, ${a.cs}, sin autorización de aterrizaje`, 0.3); break; }
            if (a.x < 0.4 && occupants(a).length) { award('LOSS_RWY', `pista ocupada por ${occupants(a)[0].cs} con ${a.cs} en corta final`, a.cs); doGoAround(a, true); reply(a.cs, `Motor y al aire, ${a.cs}, pista ocupada`, 0.3); break; }
            if (a.x <= 0) touchdown(a);
            break;
          }
          case 'circuit': {
            const tgtAlt = a.leg >= 3 ? Math.max(0, distThr(a) * 318) : a.leg >= 1 ? CIRCUIT_ALT : Math.max(CIRCUIT_ALT, a.alt - 400 / 60 * dt);
            a.alt += clamp(tgtAlt - a.alt, -600 / 60 * dt * 3, 600 / 60 * dt * 3);
            if (a.leg >= 3 && distThr(a) < 0.5 && !a.cl.land) { award('NO_LANDING_CLR', 'VFR en final sin autorización de aterrizaje: motor y al aire', a.cs); doGoAround(a, true); reply(a.cs, `Motor y al aire, ${a.cs}`, 0.3); break; }
            if (a.leg >= 3 && distThr(a) < 0.3 && occupants(a).length) { award('LOSS_RWY', `pista ocupada con ${a.cs} en corta final`, a.cs); doGoAround(a, true); reply(a.cs, `Motor y al aire, ${a.cs}, pista ocupada`, 0.3); break; }
            // los VFR se separan entre sí: si alcanzan al de delante en el circuito, reducen
            const rem = remaining(a); const ahead = S.ac.some(o => o !== a && o.rules === 'VFR' && o.state === 'circuit' && remaining(o) < rem && rem - remaining(o) < 1.3);
            if (moveAlong(a, ahead ? v * 0.35 : v)) touchdown(a);
            break;
          }
          case 'hold': case 'orbit': {
            a.ang += (a.spd / 3600 * dt) / 0.35; a.x = a.cx + 0.35 * Math.cos(a.ang); a.y = a.cy + 0.35 * Math.sin(a.ang); a.hdg = a.ang + Math.PI / 2;
            if (S.t - (a.flags.orbT || a.t0) > 300 && !a.flags.longOrb) { a.flags.longOrb = true; award('DELAY_ORBIT', 'VFR más de 5 minutos esperando', a.cs); }
            break;
          }
          case 'ga': {
            a.alt = Math.min(3000, a.alt + 1500 / 60 * dt); a.x -= v; a.hdg = Math.PI;
            if (a.x < -4.5) {
              if (!a.flags.xfer) award('LATE_TRANSFER', 'frustrada no transferida a APP', a.cs);
              const again = { cs: a.cs, type: a.type }; remove(a);
              S.queue.push({ t: S.t + 150, kind: 'arr', rules: 'IFR', type: again.type, again }); S.queue.sort((p, q) => p.t - q.t);
            }
            break;
          }
          case 'landroll': {
            const T = a.rules === 'VFR' ? 20 : 34, k = clamp((S.t - a.tT) / T, 0, 1); a.x = -a.exitX * (1 - (1 - k) * (1 - k)); a.y = 0;
            if (k >= 1) { a.state = 'exit'; a.tE = S.t; a.path = [{ x: a.x, y: TWY_Y * 0.7 }]; a.spd = 0.01; if (a.flags.taxiIn) { a.state = 'exit'; taxiAuto(a); } }
            break;
          }
          case 'exit': {
            moveAlong(a, 0.01 * dt);
            if (a.flags.abortBack) { a.state = 'taxi'; a.path = [{ x: a.x, y: TWY_Y }, { x: HP.x, y: TWY_Y }, { x: HP.x, y: HP.y }]; a.spd = 0.012; a.flags.abortBack = false; a.cl = {}; break; }
            if (S.t - a.tE > 50 && !a.flags.lateExit) { a.flags.lateExit = true; award('DELAY_EXIT', 'llegada parada en la calle de salida sin instrucciones de rodaje', a.cs); }
            break;
          }
          case 'taxiin': if (moveAlong(a, a.spd * dt)) remove(a); break;
        }
        if (a.state === 'hp' && a.tFirst && S.t - a.tFirst > 180 && !a.flags.longHP) { a.flags.longHP = true; award('DELAY_HP', 'primera de la cola más de 3 minutos esperando', a.cs); }
        if (a.flags.rbErr && S.t - a.flags.rbErr.t > 30) { a.flags.rbErr = null; award('READBACK_MISSED', 'colación errónea del QNH sin corregir', a.cs); }
        if (a.flags.ackDue && S.t > a.flags.ackDue) { a.flags.ackDue = null; award('EMERG_NOACK', 'aviso del piloto sin acuse de recibo', a.cs); }
      }
      // cola en el punto de espera: la primera en la barra, las demás detrás por la calle de rodaje
      S.ac.filter(o => o.state === 'hp' || o.state === 'hpcond').sort((p, q) => p.tHP - q.tHP).forEach((o, k) => {
        if (k === 0) o.tFirst = o.tFirst || S.t;
        const tx = k === 0 ? HP.x : HP.x - 0.08 * k, ty = k === 0 ? HP.y : TWY_Y;
        o.x += clamp(tx - o.x, -0.012 * dt, 0.012 * dt); o.y += clamp(ty - o.y, -0.012 * dt, 0.012 * dt);
      });
      // proximidad en el aire
      const air = S.ac.filter(o => ['climb', 'final', 'circuit', 'ga', 'hold', 'orbit'].includes(o.state) && o.alt > 150);
      for (let i = 0; i < air.length; i++) for (let j = i + 1; j < air.length; j++) {
        const p = air[i], q = air[j]; const k = p.id + '-' + q.id;
        if ((p.state === 'climb' && q.state === 'climb') || (p.rules === 'VFR' && q.rules === 'VFR')) continue; // APP separa las salidas; entre VFR se separan los pilotos
        if (Math.hypot(p.x - q.x, p.y - q.y) < 0.6 && Math.abs(p.alt - q.alt) < 400 && !(S.airprox[k] > S.t)) { S.airprox[k] = S.t + 90; award('AIRPROX', `proximidad entre ${p.cs} y ${q.cs}`); }
      }
      // fin del escenario
      if (!S.endless && !S.queue.length && !S.ac.length && S.t > 30 && !S.pending.length) end();
    }
    function remaining(a) { let d = 0, x = a.x, y = a.y; for (const w of a.path || []) { d += Math.hypot(w.x - x, w.y - y); x = w.x; y = w.y; } return d; }
    function startRoll(a) { a.lx = a.ly = null; a.state = 'roll'; a.tR = S.t; S.lastDep = { cs: a.cs, type: a.type, rules: a.rules, t: S.t }; if (a.rules === 'IFR') S.gaHold = false; a.stand = null; }
    function touchdown(a) {
      a.state = 'landroll'; a.tT = S.t; a.alt = 0; a.x = 0; a.y = 0; a.exitX = a.rules === 'VFR' ? -EXITS[0] : (a.type.wake === 'H' || a.type.wake === 'J') ? -EXITS[2] : -EXITS[1];
      award('LANDED', 'aterrizaje sin incidencias', a.cs); S.lastLanded = { type: a.type, t: S.t };
      if (a.emer === 'MAYDAY') award('EMERG_OK', 'emergencia en tierra con la pista libre', a.cs);
    }
    function taxiAuto(a) {
      const free = STANDS.filter(x => !S.ac.some(o => o.stand === x)); a.stand = free.length ? free[0] : STANDS[0];
      a.state = 'taxiin'; a.path = [{ x: a.x, y: TWY_Y }, { x: a.stand, y: TWY_Y }, { x: a.stand, y: APRON_Y }]; a.spd = 0.012;
    }

    // ---------- dibujo ----------
    const stateTxt = a => ({
      stand: 'plataforma · pide rodaje', taxi: a.flags.held ? 'rodando · detenido' : 'rodando', hp: 'punto de espera · listo', hpcond: 'condicional: alinea detrás', lineup: 'alineando', lined: 'alineado', roll: 'carrera de despegue',
      abort: 'abortando', climb: a.flags.xfer ? 'transferido' : 'en ascenso', final: `final ${a.x.toFixed(1).replace('.', ',')} NM`, circuit: legName(a), hold: `orbitando ${a.pt}`, orbit: 'orbitando', ga: 'motor y al aire',
      landroll: 'rodando en pista', exit: 'libró pista · espera rodaje', taxiin: 'rodando a plataforma'
    })[a.state] || a.state;
    function tagLines(a) {
      const l2 = `${a.type.t}/${wakeCat(a.type)} ${a.alt > 50 ? pad(Math.round(a.alt / 100), 3) : 'GND'}${a.spd > 1 ? ' ' + Math.round(a.spd) : ''}`;
      const fl = [a.cl.land ? 'ATE' : '', a.cl.to ? 'DES' : '', a.emer === 'MAYDAY' ? 'MAYDAY' : a.emer === 'FUEL' ? 'MINFUEL' : '', a.released ? 'SUELTA' : ''].filter(Boolean).join(' ');
      return [a.cs + (fl ? ' ' + fl : ''), l2];
    }
    function drawRadar() {
      const s = side; const out = [];
      out.push(`<rect x="-7.2" y="-5.6" width="20.4" height="11.2" fill="var(--radar-bg)"/>`);
      for (const r of [5, 10]) out.push(`<circle cx="-0.8" cy="0" r="${r}" fill="none" stroke="var(--radar-line)" stroke-width="0.03"/>`);
      out.push(`<line x1="0" y1="0" x2="13" y2="0" stroke="var(--radar-line)" stroke-width="0.03" stroke-dasharray="0.25 0.2"/>`);
      for (let i = 1; i <= 12; i++) out.push(`<line x1="${i}" y1="-0.1" x2="${i}" y2="0.1" stroke="var(--radar-line)" stroke-width="0.03"/>`);
      out.push(`<rect x="-1.9" y="${s > 0 ? 0 : -1.3}" width="3.8" height="1.3" fill="none" stroke="var(--radar-line)" stroke-width="0.025" stroke-dasharray="0.1 0.15" rx="0.3"/>`);
      out.push(`<rect x="${-RWY_LEN}" y="-0.05" width="${RWY_LEN}" height="0.1" fill="var(--radar-rwy)"/>`);
      out.push(`<text x="0.1" y="-0.2" font-size="0.32" fill="var(--radar-rwy)" font-family="var(--mono)">${esc(rwy)}</text>`);
      for (const [k, p] of Object.entries(VFR_PTS)) out.push(`<path d="M${p.x} ${p.y - 0.17} L${p.x + 0.15} ${p.y + 0.1} L${p.x - 0.15} ${p.y + 0.1} Z" fill="none" stroke="var(--radar-rwy)" stroke-width="0.03"/><text x="${p.x + 0.22}" y="${p.y + 0.1}" font-size="0.32" fill="var(--radar-rwy)" font-family="var(--mono)">${k}</text>`);
      for (const a of S.ac) {
        if (!['climb', 'final', 'circuit', 'hold', 'orbit', 'ga', 'roll', 'landroll'].includes(a.state)) continue;
        const sel = S.sel === a.id; const col = a.emer === 'MAYDAY' ? '#ff6b6b' : sel ? '#ffffff' : 'var(--radar-fg)';
        const tx = a.x + a.tag.dx, ty = a.y + a.tag.dy; const L = tagLines(a);
        const dx = Math.cos(a.hdg || Math.PI) * 0.5, dy = Math.sin(a.hdg || Math.PI) * 0.5;
        out.push(`<g class="tgt" data-id="${a.id}"><line x1="${a.x}" y1="${a.y}" x2="${a.x + dx}" y2="${a.y + dy}" stroke="${col}" stroke-width="0.03" opacity=".6"/>
          <rect x="${a.x - 0.09}" y="${a.y - 0.09}" width="0.18" height="0.18" transform="rotate(45 ${a.x} ${a.y})" fill="${a.rules === 'IFR' ? col : 'none'}" stroke="${col}" stroke-width="0.04"/>
          <line x1="${a.x}" y1="${a.y}" x2="${tx - 0.05}" y2="${ty + 0.05}" stroke="${col}" stroke-width="0.02" opacity=".7"/>
          <g class="tag" data-tag="${a.id}" data-k="tag" transform="translate(${tx} ${ty})"><rect x="-0.06" y="-0.34" width="${Math.max(L[0].length, L[1].length) * 0.2 + 0.1}" height="0.76" fill="${sel ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.001)'}" rx="0.05"/>
          <text font-family="var(--mono)" font-size="0.3" fill="${col}"><tspan x="0" y="0">${esc(L[0])}</tspan><tspan x="0" y="0.34" fill="var(--radar-rwy)">${esc(L[1])}</tspan></text></g></g>`);
      }
      radar.innerHTML = out.join('');
    }
    function drawGround() {
      const out = [];
      out.push(`<rect x="-1.75" y="-0.12" width="2.05" height="0.66" fill="var(--radar-bg)"/>`);
      out.push(`<rect x="-1.42" y="${APRON_Y - 0.05}" width="1.22" height="0.12" fill="none" stroke="var(--radar-line)" stroke-width="0.004"/>`);
      out.push(`<line x1="-1.45" y1="${TWY_Y}" x2="${HP.x}" y2="${TWY_Y}" stroke="var(--radar-line)" stroke-width="0.018"/>`);
      for (const ex of EXITS) out.push(`<line x1="${ex}" y1="0" x2="${ex}" y2="${TWY_Y}" stroke="var(--radar-line)" stroke-width="0.014"/>`);
      out.push(`<line x1="${HP.x}" y1="${TWY_Y}" x2="${HP.x}" y2="${HP.y}" stroke="var(--radar-line)" stroke-width="0.014"/><line x1="${HP.x}" y1="${HP.y}" x2="0" y2="0" stroke="var(--radar-line)" stroke-width="0.014"/>`);
      for (const st of STANDS) out.push(`<line x1="${st}" y1="${TWY_Y}" x2="${st}" y2="${APRON_Y}" stroke="var(--radar-line)" stroke-width="0.006"/>`);
      out.push(`<rect x="${-RWY_LEN}" y="-0.022" width="${RWY_LEN}" height="0.044" fill="var(--radar-rwy)" opacity=".85"/>`);
      out.push(`<line x1="${HP.x - 0.03}" y1="${HP.y}" x2="${HP.x + 0.03}" y2="${HP.y}" stroke="#e5b25e" stroke-width="0.008"/>`);
      out.push(`<text x="0.02" y="-0.05" font-size="0.04" fill="var(--radar-rwy)" font-family="var(--mono)">${esc(rwy)}</text><text x="-1.4" y="${APRON_Y + 0.11}" font-size="0.035" fill="var(--radar-rwy)" font-family="var(--mono)">PLATAFORMA</text><text x="${HP.x + 0.02}" y="${HP.y + 0.015}" font-size="0.03" fill="#e5b25e" font-family="var(--mono)">HP</text>`);
      for (const a of S.ac) {
        if (!['stand', 'taxi', 'hp', 'hpcond', 'lineup', 'lined', 'roll', 'landroll', 'exit', 'taxiin', 'abort'].includes(a.state)) continue;
        if (a.state === 'roll' && a.x < -RWY_LEN) continue;
        const sel = S.sel === a.id; const col = sel ? '#ffffff' : a.kind === 'dep' ? '#8cc4f5' : '#f0c06a';
        const tx = a.x + a.gtag.dx, ty = a.y + a.gtag.dy;
        out.push(`<g class="tgt" data-id="${a.id}"><circle cx="${a.x}" cy="${a.y}" r="0.014" fill="${col}"/>
          <line x1="${a.x}" y1="${a.y}" x2="${tx}" y2="${ty + 0.01}" stroke="${col}" stroke-width="0.003" opacity=".7"/>
          <g class="tag" data-tag="${a.id}" data-k="gtag" transform="translate(${tx} ${ty})"><rect x="-0.008" y="-0.04" width="${a.cs.length * 0.026 + 0.02}" height="0.085" fill="${sel ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.001)'}"/>
          <text font-family="var(--mono)" font-size="0.038" fill="${col}"><tspan x="0" y="0">${esc(a.cs)}</tspan><tspan x="0" y="0.038" fill="var(--radar-rwy)" font-size="0.03">${esc(a.type.t)}</tspan></text></g></g>`);
      }
      ground.innerHTML = out.join('');
    }
    // fichas: actualización por clave para no romper clics ni arrastre
    function drawStrips() {
      for (const kind of ['dep', 'arr']) {
        const bay = $(kind === 'dep' ? 'bayDep' : 'bayArr');
        const ids = S.order[kind];
        [...bay.children].forEach(el => { if (!ids.includes(+el.dataset.id)) el.remove(); });
        ids.forEach((id, i) => {
          const a = S.ac.find(o => o.id === id); if (!a) return;
          let el = bay.querySelector(`[data-id="${id}"]`);
          if (!el) { el = document.createElement('div'); el.className = 'fstrip ' + kind; el.dataset.id = id; el.draggable = true; bay.appendChild(el); }
          if (bay.children[i] !== el) bay.insertBefore(el, bay.children[i]);
          let help = '';
          if (S.help && a.kind === 'dep' && ['hp', 'lined', 'lineup', 'hpcond', 'taxi'].includes(a.state)) {
            const d = depCheck(a); const need = Math.max(d.wake, a.released ? 0 : d.succ) - (d.elapsed === Infinity ? 1e9 : d.elapsed);
            help = d.sujeta && !a.released ? '<span class="fl warn">SUJETA</span>' : need > 0 ? `<span class="fl warn">sep ${mmss(need)}</span>` : '<span class="fl ok">sep OK</span>';
          }
          if (S.help && a.kind === 'arr' && a.state === 'final' && !a.cl.land && (occupants(a).length || landingCleared(a).length)) help = '<span class="fl warn">pista no disponible</span>';
          const flags = [a.cl.land ? '<span class="fl">ATE</span>' : '', a.cl.to ? '<span class="fl">DES</span>' : '', a.released ? '<span class="fl ok">SUELTA</span>' : '',
            a.emer === 'MAYDAY' ? '<span class="fl bad">MAYDAY</span>' : a.emer === 'FUEL' ? '<span class="fl warn">MIN FUEL</span>' : '', a.flags.xfer ? '<span class="fl">APP</span>' : ''].join('');
          const html = `<div class="c1"><b>${esc(a.cs)}</b><span>${esc(a.type.t)}/${wakeCat(a.type)}</span></div>
            <div class="c2"><span>${a.rules}${a.kind === 'dep' ? (a.rules === 'IFR' ? ' · SID ' + a.sid.sid : ' · local') : (a.rules === 'IFR' ? ' · ILS ' + esc(rwy) : ' · ' + (a.pt || ''))}</span><span>${esc(R.SPEED_NAME[a.type.speed])}</span></div>
            <div class="c3">${esc(stateTxt(a))} ${flags}${help}</div>`;
          if (el.dataset.html !== html) { el.innerHTML = html; el.dataset.html = html; }
          el.classList.toggle('sel', S.sel === id);
        });
      }
    }

    // ---------- interacción ----------
    function select(id) { S.sel = id; const a = S.ac.find(o => o.id === id); if (a) { cmd.value = a.cs + ' '; cmd.focus(); } }
    function svgPoint(svg, e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
    function dragTags(svg) {
      let drag = null;
      svg.addEventListener('pointerdown', e => {
        const g = e.target.closest('[data-tag]'); const t = e.target.closest('.tgt'); if (!t) return;
        const a = S.ac.find(o => o.id === +t.dataset.id); if (!a) return;
        S.sel = a.id;
        if (g) { const k = g.dataset.k; const p = svgPoint(svg, e); drag = { a, k, ox: p.x - a[k].dx, oy: p.y - a[k].dy, moved: false }; svg.setPointerCapture(e.pointerId); e.preventDefault(); }
        else select(a.id);
      });
      svg.addEventListener('pointermove', e => { if (!drag) return; const p = svgPoint(svg, e); drag.a[drag.k].dx = p.x - drag.ox; drag.a[drag.k].dy = p.y - drag.oy; drag.moved = true; });
      svg.addEventListener('pointerup', () => { if (drag && !drag.moved) select(drag.a.id); drag = null; });
    }
    dragTags(radar); dragTags(ground);
    for (const bayId of ['bayDep', 'bayArr']) {
      const bay = $(bayId); let dragId = null;
      bay.addEventListener('click', e => { const el = e.target.closest('.fstrip'); if (el) select(+el.dataset.id); });
      bay.addEventListener('dragstart', e => { const el = e.target.closest('.fstrip'); if (!el) return; dragId = +el.dataset.id; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(dragId)); } catch (x) { /* */ } });
      bay.addEventListener('dragover', e => {
        if (dragId == null) return; e.preventDefault();
        const kind = bayId === 'bayDep' ? 'dep' : 'arr'; const over = e.target.closest('.fstrip'); if (!over || +over.dataset.id === dragId) return;
        const ord = S.order[kind].filter(i => i !== dragId); const r = over.getBoundingClientRect(); let idx = ord.indexOf(+over.dataset.id); if (e.clientY > r.top + r.height / 2) idx++;
        ord.splice(idx, 0, dragId); S.order[kind] = ord; drawStrips();
      });
      bay.addEventListener('dragend', () => { dragId = null; });
    }
    $('sForm').addEventListener('submit', e => { e.preventDefault(); const v = cmd.value; if (!v.trim()) return; S.hist.unshift(v); S.hi = -1; cmd.value = ''; transmit(v); });
    cmd.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp') { e.preventDefault(); S.hi = Math.min(S.hist.length - 1, S.hi + 1); if (S.hist[S.hi] != null) cmd.value = S.hist[S.hi]; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); S.hi = Math.max(-1, S.hi - 1); cmd.value = S.hi >= 0 ? S.hist[S.hi] : ''; }
      else if (e.key === 'Tab') {
        const m = /(\S*)$/.exec(cmd.value); const part = (m[1] || '').toUpperCase(); if (!part) return;
        const c = S.ac.filter(o => o.cs.startsWith(part) || o.cs.endsWith(part)); if (c.length) { e.preventDefault(); cmd.value = cmd.value.slice(0, cmd.value.length - m[1].length) + c[0].cs + ' '; S.sel = c[0].id; }
      }
    });
    $('sSpeed').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; S.speed = +b.dataset.v; $('sSpeed').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    $('sHelp').onchange = e => { S.help = e.target.checked; rootEl.querySelectorAll('.fstrip').forEach(x => { x.dataset.html = ''; }); };
    $('sVoice').onchange = e => { S.voice = e.target.checked; if (!S.voice && root.speechSynthesis) root.speechSynthesis.cancel(); };
    $('sEnd').onclick = () => end();

    function end() {
      if (S.ended) return; S.ended = true; if (root.speechSynthesis) root.speechSynthesis.cancel();
      const best = store.get('simBest', {}); const rec = best[scen.id] == null || S.score > best[scen.id]; if (rec) { best[scen.id] = S.score; store.set('simBest', best); }
      const pens = Object.entries(S.penalties).sort((p, q) => p[1] - q[1]);
      rootEl.innerHTML = `<div class="view-head"><div><div class="eyebrow">Fin del turno · ${esc(ctx.apt.icao)} pista ${esc(rwy)}</div><h1>${esc(scen.title)}</h1>
        <p>${S.score} puntos${rec ? ' (nuevo récord)' : ''} en ${mmss(S.t)} de turno. ${S.nGood} aciertos y ${S.nBad} errores.</p></div>
        <div class="row"><button class="btn primary" id="sAgain">Otro turno</button><button class="btn" id="sList">Escenarios</button></div></div>
        ${pens.length ? `<div class="panel" style="padding:14px 18px"><b>Dónde se perdieron puntos</b><ul class="small">${pens.map(p => `<li>${esc(p[0])}: <b class="tabular">${p[1]}</b></li>`).join('')}</ul></div>` : '<div class="panel empty">Turno sin errores.</div>'}`;
      rootEl.querySelector('#sAgain').onclick = () => start(rootEl, scen, store);
      rootEl.querySelector('#sList').onclick = () => mount(rootEl, { store });
    }

    // ---------- bucle ----------
    let last = performance.now(), acc = 0, frame = 0;
    const simEl = rootEl.querySelector('.sim');
    function loop(now) {
      if (S.ended || !document.body.contains(simEl)) { if (root.speechSynthesis && !S.ended) root.speechSynthesis.cancel(); return; }
      const dt = Math.min(0.25, (now - last) / 1000); last = now;
      if (S.speed) { acc += dt * S.speed; while (acc > 0.1) { step(0.1); acc -= 0.1; if (S.ended) return; } }
      if ((frame++ & 1) === 0) { drawRadar(); drawGround(); }
      if (frame % 10 === 0) drawStrips();
      $('sClock').textContent = clockStr();
      requestAnimationFrame(loop);
    }
    log('Sistema', `Turno en ${ctx.apt.city} (${ctx.apt.icao}), pista ${rwy}, QNH ${ctx.qnh}. ${scen.notes} Escribe tus transmisiones abajo; clic en una ficha o etiqueta para seleccionar.`, 'sys');
    drawStrips(); requestAnimationFrame(loop); cmd.focus();
    S._api = { step, transmit, S }; rootEl._sim = S._api; // para pruebas
  }

  root.ADC_SIM = { mount, SCENARIOS, PTS };
})(typeof window !== 'undefined' ? window : globalThis);
