/* Voz para el simulador.
   - toCommand(): convierte lo que devuelve el reconocedor ("Iberia tres siete uno dos ruede a punto de espera
     pista dos siete") en texto que entiende el parser del simulador ("IBE3712 ruede a punto de espera pista 27").
   - spoken(): lo contrario para la síntesis de voz (IBE3712 → "Iberia 3 7 1 2").
   - ptt(): pulsar para hablar con la Web Speech API (Chrome, Edge, Safari). */
(function (root) {
  'use strict';
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // ---------- alfabeto, números y designadores telefónicos ----------
  const PHON = {
    alfa: 'A', alpha: 'A', bravo: 'B', charlie: 'C', charly: 'C', delta: 'D', eco: 'E', echo: 'E', foxtrot: 'F', fox: 'F', golf: 'G',
    hotel: 'H', india: 'I', juliet: 'J', juliett: 'J', julieta: 'J', kilo: 'K', lima: 'L', mike: 'M', maik: 'M', november: 'N',
    noviembre: 'N', oscar: 'O', papa: 'P', quebec: 'Q', kebec: 'Q', romeo: 'R', sierra: 'S', tango: 'T', uniform: 'U', victor: 'V',
    whiskey: 'W', whisky: 'W', wiski: 'W', xray: 'X', yankee: 'Y', yanqui: 'Y', zulu: 'Z'
  };
  const UNITS = { cero: 0, uno: 1, un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9 };
  const TEENS = { diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
    veinte: 20, veintiuno: 21, veintiun: 21, veintiuna: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29 };
  const TENS = { treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90 };
  const HUNDREDS = { cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900 };
  const DIGW = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  // tildes de la fraseología habitual, para que el registro se lea bien
  const ACCENTS = { numero: 'número', transito: 'tránsito', trafico: 'tráfico', aproximacion: 'aproximación', continue: 'continúe', detras: 'detrás',
    posicion: 'posición', rodadura: 'rodadura', despegue: 'despegue', informacion: 'información', autorizacion: 'autorización', orbite: 'orbite', mas: 'más' };
  const isNumWord = w => w in UNITS || w in TEENS || w in TENS || w in HUNDREDS || w === 'mil';
  // las de varias palabras van primero
  const TELEPHONY = [
    ['iberia express', 'IBS'], ['iberexpress', 'IBS'], ['iberia', 'IBE'], ['vueling', 'VLG'], ['air europa', 'AEA'], ['europa', 'AEA'],
    ['ryanair', 'RYR'], ['rayanair', 'RYR'], ['speedbird', 'BAW'], ['speed bird', 'BAW'], ['lufthansa', 'DLH'], ['air france', 'AFR'], ['airfrans', 'AFR'],
    ['air nostrum', 'ANE'], ['nostrum', 'ANE'], ['air baltic', 'BTI'], ['airbaltic', 'BTI'], ['klm', 'KLM'], ['easy', 'EZY'], ['easyjet', 'EZY'],
    ['air portugal', 'TAP'], ['swiss', 'SWR'], ['tomson', 'TOM'], ['eurowings', 'EWG'], ['nor shuttle', 'NAX'], ['norshuttle', 'NAX'], ['beeline', 'BEL']
  ];
  const NAME_OF = {}; for (const [w, c] of TELEPHONY) if (!NAME_OF[c]) NAME_OF[c] = w.replace(/\b\w/g, m => m.toUpperCase()).replace('Klm', 'KLM');
  NAME_OF.IBS = 'Iberexpress'; NAME_OF.AEA = 'Europa'; NAME_OF.AFR = 'Airfrans';

  // Número a partir de palabras: "uno cero uno ocho" → "1018" (cifra a cifra); "doscientos setenta" → "270"; "mil dieciocho" → "1018"
  function parseNumber(words) {
    if (words.length >= 2 && words.every(w => w in UNITS)) return words.map(w => UNITS[w]).join('');
    let total = 0, cur = 0;
    for (const w of words) {
      if (w === 'mil') { total += (cur || 1) * 1000; cur = 0; }
      else if (w in HUNDREDS) cur += HUNDREDS[w];
      else if (w in TENS) cur += TENS[w];
      else if (w in TEENS) cur += TEENS[w];
      else if (w in UNITS) cur += UNITS[w];
    }
    return String(total + cur);
  }
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  // ajusta un indicativo mal reconocido al más parecido de los que hay en frecuencia
  function snap(cs, known) {
    if (!known || !known.length || known.includes(cs)) return cs;
    let best = null, bd = 99, tie = false;
    for (const k of known) { const d = lev(cs, k); if (d < bd) { bd = d; best = k; tie = false; } else if (d === bd) tie = true; }
    const max = cs.length >= 6 ? 2 : 1;
    return best && bd <= max && !tie ? best : cs;
  }

  /* Convierte una transcripción en texto para el parser.
     opts.callsigns: indicativos en frecuencia (para corregir errores de reconocimiento)
     opts.types: designadores de tipo (A320, B738…) para "a trescientos veinte" → A320 */
  function toCommand(text, opts) {
    opts = opts || {};
    const known = (opts.callsigns || []).map(s => s.toUpperCase());
    const types = (opts.types || []).map(s => s.toUpperCase());
    let t = ' ' + norm(text).replace(/[,.;:!?¿¡"()]/g, ' ').replace(/-/g, ' ') + ' ';
    t = t.replace(/\b(x ray|equis ray|ex ray)\b/g, 'xray').replace(/\b(q n h|cu ene hache|cuneache)\b/g, 'qnh');
    for (const [w, c] of TELEPHONY) t = t.replace(new RegExp('\\b' + w + '\\b', 'g'), ' @' + c + ' ');
    const raw = t.trim().split(/\s+/).filter(Boolean);

    // 1) números: palabras y cifras sueltas consecutivas ("3 7 1 2") en un solo número
    const toks = [];
    for (let i = 0; i < raw.length;) {
      const w = raw[i];
      if (isNumWord(w) && !(w === 'un' || w === 'una') || (/^\d$/.test(w) && /^\d$/.test(raw[i + 1] || ''))) {
        const run = [];
        while (i < raw.length && (isNumWord(raw[i]) || /^\d$/.test(raw[i]) || (raw[i] === 'y' && raw[i - 1] in TENS && (raw[i + 1] || '') in UNITS))) {
          if (raw[i] !== 'y') run.push(/^\d$/.test(raw[i]) ? DIGW[+raw[i]] : raw[i]); i++;
        }
        toks.push({ num: parseNumber(run) });
      } else if (/^\d+$/.test(w)) { toks.push({ num: w }); i++; }
      else { toks.push({ w }); i++; }
    }
    // 2) indicativos: designador + cifras/letras fonéticas, o matrícula deletreada (≥3 letras fonéticas)
    const out = [];
    for (let i = 0; i < toks.length; i++) {
      const k = toks[i];
      if (k.w && k.w[0] === '@') {
        let cs = k.w.slice(1); let j = i + 1;
        while (j < toks.length && cs.length < 8 && (toks[j].num != null || PHON[toks[j].w] || /^[a-z0-9]{1,4}$/.test(toks[j].w || '') && /\d/.test(toks[j].w))) {
          cs += toks[j].num != null ? toks[j].num : PHON[toks[j].w] || toks[j].w.toUpperCase(); j++;
        }
        out.push(snap(cs, known)); i = j - 1; continue;
      }
      if (k.w && PHON[k.w] && toks[i + 1] && PHON[toks[i + 1].w] && toks[i + 2] && PHON[toks[i + 2].w]) {
        let cs = ''; let j = i;
        while (j < toks.length && PHON[toks[j].w]) { cs += PHON[toks[j].w]; j++; }
        out.push(snap(cs, known)); i = j - 1; continue;
      }
      if (k.w && /^[a-z]{2,3}\d[a-z0-9]{0,4}$|^ec[a-z]{3}$/.test(k.w)) { out.push(snap(k.w.toUpperCase(), known)); continue; }
      // 3) pista: "pista 03 izquierda" → "pista 03L"
      if (k.num != null && out.length && out[out.length - 1] === 'pista') {
        let r = k.num.padStart(2, '0'); const side = toks[i + 1] && { izquierda: 'L', derecha: 'R', centro: 'C', central: 'C' }[toks[i + 1].w];
        if (side) { r += side; i++; }
        out.push(r); continue;
      }
      // 4) tipos: "a 320" / "airbus 320" → A320, "boeing 737" → B73x
      if (k.w && (k.w === 'a' || k.w === 'airbus' || k.w === 'boeing' || k.w === 'b') && toks[i + 1] && toks[i + 1].num != null && toks[i + 1].num.length === 3) {
        const pre = k.w === 'boeing' || k.w === 'b' ? 'B' : 'A'; const n = toks[i + 1].num;
        const ty = types.find(x => x === pre + n) || types.find(x => x.startsWith(pre + n.slice(0, 2)) && x !== pre + n.slice(0, 2));
        if (ty || !types.length) { out.push(ty || pre + n); i++; continue; }
      }
      out.push(k.num != null ? k.num : ACCENTS[k.w] || k.w);
    }
    return out.join(' ').replace(/\s+/g, ' ').trim();
  }

  // ---------- síntesis: cómo se pronuncian los indicativos ----------
  const PHON_OUT = { A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Eco', F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu' };
  const DIG = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const spell = s => s.split('').map(ch => /\d/.test(ch) ? DIG[+ch] : PHON_OUT[ch] || ch).join(' ');
  function spoken(text) {
    return String(text)
      .replace(/\b([A-Z]{3})(\d[A-Z0-9]{0,4})\b/g, (m, a, id) => NAME_OF[a] ? NAME_OF[a] + ' ' + spell(id) : m)
      .replace(/\bEC([A-Z]{3})\b/g, (m, r) => spell('EC' + r))
      .replace(/\bQNH (\d{3,4})\b/g, (m, q) => 'QNH ' + (q === '1000' ? 'mil' : spell(q)))
      .replace(/\bpista (\d{2})([LRC]?)\b/g, (m, n, s) => 'pista ' + spell(n) + ({ L: ' izquierda', R: ' derecha', C: ' centro' }[s] || ''));
  }

  // ---------- pulsar para hablar (Web Speech API) ----------
  const Rec = root.SpeechRecognition || root.webkitSpeechRecognition;
  /* ptt({ lang, pick(alts), onStart, onInterim(text), onFinal(text | null si se canceló), onError(code) }) → { supported, start(), stop(), abort(), active } */
  function ptt(o) {
    if (!Rec) return { supported: false, start() {}, stop() {}, abort() {}, get active() { return false; } };
    let rec = null, finals = [], interim = '', active = false, wantStop = false, aborted = false;
    function start() {
      if (active) return;
      finals = []; interim = ''; wantStop = false; aborted = false; active = true;
      rec = new Rec(); rec.lang = o.lang || 'es-ES'; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 3;
      rec.onresult = e => {
        interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finals[i] = Array.from(r).map(x => x.transcript); else interim += r[0].transcript;
        }
        if (o.onInterim) o.onInterim(finals.filter(Boolean).map(a => a[0]).join(' ') + ' ' + interim);
      };
      rec.onerror = e => { if (o.onError && e.error !== 'aborted') o.onError(e.error); };
      rec.onend = () => {
        active = false;
        // alternativas: por cada tramo, la que mejor se convierte en indicativos conocidos
        const parts = finals.filter(Boolean).map(alts => o.pick ? o.pick(alts) : alts[0]);
        const text = (parts.join(' ') + ' ' + (wantStop ? interim : '')).trim();
        if (o.onFinal) o.onFinal(aborted ? null : text); // null = cancelado (no se transmite nada)
      };
      try { rec.start(); if (o.onStart) o.onStart(); } catch (e) { active = false; if (o.onError) o.onError('start'); }
    }
    return {
      supported: true, start,
      stop() { if (rec && active) { wantStop = true; rec.stop(); } },
      abort() { if (rec && active) { wantStop = false; aborted = true; finals = []; interim = ''; rec.abort(); } },
      get active() { return active; }
    };
  }

  const API = { toCommand, spoken, ptt, snap, supported: !!Rec };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.ADC_VOICE = API;
})(typeof window !== 'undefined' ? window : globalThis);
