/* Torre ADC — app de estudio. Vanilla JS, sin dependencias. */
(function () {
  'use strict';
  const D = window.ADC_DATA, R = window.ADC_RULES, G = window.ADC_GEN, SC = window.ADC_SCEN;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const rnd = Math.random;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const topicById = Object.fromEntries(D.topics.map(t => [t.id, t]));
  const topicName = id => (topicById[id] || {}).title || id;
  const VIEW = $('#view');

  // ---------- almacenamiento local (opcional) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('adc.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('adc.' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };

  // ---------- markdown mínimo ----------
  function inline(t) {
    t = esc(t);
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^\w/])_([^_]+?)_(?!\w)/g, '$1<em>$2</em>');
    t = t.replace(/\\\*/g, '*');
    return t;
  }
  const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  function md(src) {
    const L = src.split('\n'); let i = 0, out = '', para = [];
    const flush = () => { if (para.length) { out += '<p>' + inline(para.join(' ')) + '</p>'; para = []; } };
    while (i < L.length) {
      const ln = L[i].replace(/\s+$/, '');
      if (!ln.trim()) { flush(); i++; continue; }
      if (ln.startsWith('## ')) { flush(); const t = ln.slice(3); out += `<h2 id="${slug(t)}">${inline(t)}</h2>`; i++; continue; }
      if (ln.startsWith('### ')) { flush(); out += `<h3>${inline(ln.slice(4))}</h3>`; i++; continue; }
      if (ln.startsWith('|')) {
        flush(); const rows = [];
        while (i < L.length && L[i].startsWith('|')) { const c = L[i].trim().replace(/^\||\|$/g, '').split('|').map(x => x.trim()); if (!c.every(x => /^:?-{3,}:?$/.test(x))) rows.push(c); i++; }
        out += '<div class="tbl"><table><thead><tr>' + rows[0].map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' +
          rows.slice(1).map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>';
        continue;
      }
      let m = /^!\[(fig|wiki):([^|\]]+)\|?([^\]]*)\]/.exec(ln);
      if (m) {
        flush();
        if (m[1] === 'fig' && D.diagrams[m[2]]) out += `<figure class="fig"><div class="svg">${D.diagrams[m[2]]}</div><figcaption>${esc(m[3])}</figcaption></figure>`;
        else if (m[1] === 'wiki') out += `<a class="wikiimg" href="${esc(m[2])}" target="_blank" rel="noopener">Ver imagen en la wiki ↗ <span class="muted">${esc(m[3])}</span></a>`;
        i++; continue;
      }
      if (ln.startsWith('> [!')) {
        flush(); const kind = /> \[!(\w+)\]/.exec(ln)[1]; const buf = [ln.replace(/^> \[!\w+\]\s*/, '')]; i++;
        while (i < L.length && L[i].startsWith('>') && !L[i].startsWith('> [!')) { buf.push(L[i].slice(1).trim()); i++; }
        out += `<div class="call ${kind}"><span class="lbl">${kind === 'ivao' ? 'IVAO' : 'CLAVE'}</span>${buf.filter(Boolean).map(inline).join('<br>')}</div>`;
        continue;
      }
      if (ln.startsWith('>')) {
        flush(); const buf = [];
        while (i < L.length && L[i].startsWith('>')) { const s = L[i].slice(1).trim(); if (s) buf.push(`<div>${inline(s)}</div>`); i++; }
        out += `<div class="radio">${buf.join('')}</div>`; continue;
      }
      m = /^(\s*)([-*]|\d+\.)\s+(.*)/.exec(ln);
      if (m) {
        flush(); const ordered = /\d/.test(m[2]); const items = [];
        while (i < L.length) { const mm = /^(\s*)([-*]|\d+\.)\s+(.*)/.exec(L[i]); if (!mm) break; items.push(mm[3]); i++; }
        out += (ordered ? '<ol>' : '<ul>') + items.map(x => `<li>${inline(x)}</li>`).join('') + (ordered ? '</ol>' : '</ul>');
        continue;
      }
      para.push(ln.trim()); i++;
    }
    flush(); return out;
  }

  // ---------- estadísticas ----------
  const stats = store.get('stats', {}); // {topic: {ok, n}}
  function recordAnswer(topic, ok) { const s = stats[topic] || (stats[topic] = { ok: 0, n: 0 }); s.n++; if (ok) s.ok++; store.set('stats', stats); }

  // ---------- navegación ----------
  let state = { view: 'temario', topic: null };
  function go(view, extra) {
    state = Object.assign({ view }, extra || {});
    $$('#nav button').forEach(b => b.setAttribute('aria-current', b.dataset.view === view ? 'page' : 'false'));
    store.set('view', view);
    VIEW.classList.toggle('wide', view === 'simulador');
    document.body.classList.remove('simmode');
    ({ temario: viewTemario, resumenes: viewResumenes, flashcards: viewFlash, test: viewTest, torre: viewTorre, simulador: viewSim, chuleta: viewChuleta })[view]();
    window.scrollTo(0, 0);
  }
  $$('#nav button').forEach(b => b.addEventListener('click', () => go(b.dataset.view)));

  // ---------- TEMARIO ----------
  function viewTemario() {
    if (state.topic) return viewTopic(state.topic);
    const tiles = D.topics.map(t => {
      const s = stats[t.id]; const pct = s && s.n ? Math.round(100 * s.ok / s.n) : null;
      const nQ = D.questions.filter(q => q.t === t.id).length, nF = D.flashcards.filter(f => f.topic === t.id).length;
      return `<button class="tile" data-topic="${t.id}"><span class="n">${t.num}</span><span><span class="t">${esc(t.title)}</span>
        <span class="m">${nQ} preguntas · ${nF} flashcards${pct != null ? ` · aciertos ${pct}% (${s.n})` : ''}</span>
        ${pct != null ? `<span class="progress"><i style="width:${pct}%"></i></span>` : ''}</span></button>`;
    }).join('');
    VIEW.innerHTML = `<div class="view-head"><div><div class="eyebrow">Libro ADC · 10 capítulos</div><h1>Temario</h1>
      <p>Todo el temario teórico del ADC organizado por temas, con diagramas, tablas y los puntos clave destacados. Los aciertos del test se reflejan en cada tema.</p></div></div>
      <div class="grid cols-3">${tiles}</div>`;
    $$('.tile', VIEW).forEach(b => b.addEventListener('click', () => go('temario', { topic: b.dataset.topic })));
  }
  function viewTopic(id) {
    const t = topicById[id], idx = D.topics.indexOf(t);
    const prev = D.topics[idx - 1], next = D.topics[idx + 1];
    const heads = (t.md.match(/^## .+$/gm) || []).map(h => h.slice(3));
    VIEW.innerHTML = `<div class="view-head"><div><div class="eyebrow">Tema ${t.num} de ${D.topics.length}</div><h1>${esc(t.title)}</h1>
      <p><a href="${esc(t.wiki)}" target="_blank" rel="noopener">Fuente en la wiki ↗</a></p></div>
      <div class="row"><button class="btn ghost" id="back">← Todos los temas</button><button class="btn" id="tq">Test de este tema</button><button class="btn" id="tf">Flashcards</button></div></div>
      <div class="reader"><article class="doc">${md(t.md)}
        ${D.summaries[id] ? `<section class="essential"><h3>Lo esencial</h3>${md(D.summaries[id])}</section>` : ''}
        <div class="pager">${prev ? `<button class="btn" data-go="${prev.id}">← ${esc(prev.title)}</button>` : '<span></span>'}${next ? `<button class="btn primary" data-go="${next.id}">${esc(next.title)} →</button>` : ''}</div>
      </article><nav class="toc" aria-label="En este tema">${heads.map(h => `<a href="#${slug(h)}" data-anchor="${slug(h)}">${esc(h)}</a>`).join('')}<a href="#" data-anchor="esencial">Lo esencial</a></nav></div>`;
    $('#back').onclick = () => go('temario');
    $('#tq').onclick = () => { testCfg.topics = [id]; go('test', { autostart: true }); };
    $('#tf').onclick = () => { flashCfg.topics = [id]; go('flashcards'); };
    $$('[data-go]', VIEW).forEach(b => b.onclick = () => go('temario', { topic: b.dataset.go }));
    $$('.toc a', VIEW).forEach(a => a.onclick = e => { e.preventDefault(); const el = a.dataset.anchor === 'esencial' ? $('.essential', VIEW) : document.getElementById(a.dataset.anchor); if (el) el.scrollIntoView({ behavior: 'smooth' }); });
  }

  // ---------- RESÚMENES ----------
  function viewResumenes() {
    const sel = state.topic || 'all';
    const list = sel === 'all' ? D.topics : [topicById[sel]];
    VIEW.innerHTML = `<div class="view-head"><div><div class="eyebrow">Repaso rápido</div><h1>Resúmenes</h1>
      <p>Lo imprescindible de cada tema en una sola pantalla. Ideal la noche antes del examen.</p></div></div>
      <div class="row" style="margin-bottom:14px"><span class="chip ${sel === 'all' ? 'on' : ''}"><button style="all:unset;cursor:pointer" data-s="all">Todos</button></span>
      ${D.topics.map(t => `<span class="chip ${sel === t.id ? 'on' : ''}"><button style="all:unset;cursor:pointer" data-s="${t.id}">${t.num}. ${esc(t.title)}</button></span>`).join('')}</div>
      <div class="grid">${list.map(t => `<article class="doc"><div class="eyebrow">Tema ${t.num}</div><h2 style="margin-top:4px;border:0;padding:0">${esc(t.title)}</h2>${md(D.summaries[t.id] || '')}
        <div class="row"><button class="btn" data-open="${t.id}">Leer el tema completo →</button></div></article>`).join('')}</div>`;
    $$('[data-s]', VIEW).forEach(b => b.onclick = () => go('resumenes', { topic: b.dataset.s === 'all' ? null : b.dataset.s }));
    $$('[data-open]', VIEW).forEach(b => b.onclick = () => go('temario', { topic: b.dataset.open }));
  }

  // ---------- FLASHCARDS (Leitner 1–5) ----------
  const flashCfg = { topics: null };
  const boxes = store.get('boxes', {}); // id -> box
  const fcId = c => slug(c.topic + '-' + c.front).slice(0, 80);
  function viewFlash() {
    const topics = flashCfg.topics;
    const pool = D.flashcards.filter(c => !topics || topics.includes(c.topic));
    const boxOf = c => boxes[fcId(c)] || 1;
    let queue = shuffle(pool).sort((a, b) => boxOf(a) - boxOf(b));
    let cur = 0, flipped = false, seen = 0, known = 0;
    function counts() { const n = [0, 0, 0, 0, 0]; pool.forEach(c => n[boxOf(c) - 1]++); return n; }
    function render() {
      const c = queue[cur]; const n = counts();
      VIEW.innerHTML = `<div class="view-head"><div><div class="eyebrow">Repetición espaciada · ${pool.length} tarjetas</div><h1>Flashcards</h1>
        <p>Toca la tarjeta (o pulsa espacio) para darle la vuelta. Las que no sabes vuelven a la caja 1 y salen antes; las que sabes suben de caja.</p></div></div>
        <div class="row" style="margin-bottom:12px"><span class="chip ${!topics ? 'on' : ''}"><button style="all:unset;cursor:pointer" data-t="all">Todos</button></span>
        ${D.topics.map(t => `<span class="chip ${topics && topics.includes(t.id) ? 'on' : ''}"><button style="all:unset;cursor:pointer" data-t="${t.id}">${esc(t.title)}</button></span>`).join('')}</div>
        <div class="box-row" style="margin-bottom:14px">${n.map((x, i) => `<div><b class="tabular">${x}</b><span>Caja ${i + 1}</span></div>`).join('')}</div>
        ${c ? `<div class="card-stage"><div class="fcard ${flipped ? 'flip' : ''}" id="fc" role="button" tabindex="0" aria-label="Dar la vuelta a la tarjeta">
          <div class="fface"><span class="lab">${esc(topicName(c.topic))} · caja ${boxOf(c)}</span><div class="txt">${esc(c.front)}</div><span class="lab">toca para ver la respuesta</span></div>
          <div class="fface back"><span class="lab">Respuesta</span><div class="txt">${esc(c.back)}</div></div></div></div>
          <div class="qbar"><span class="muted small tabular">Tarjeta ${cur + 1} de ${queue.length} · sesión: ${known}/${seen} sabidas</span>
          <div class="row"><button class="btn" id="no" ${flipped ? '' : 'disabled'}>No la sabía (1)</button><button class="btn primary" id="yes" ${flipped ? '' : 'disabled'}>La sabía (2)</button></div></div>`
          : `<div class="panel empty">Sesión terminada: ${known} de ${seen} sabidas. <button class="btn primary" id="again">Otra ronda</button></div>`}`;
      $$('[data-t]', VIEW).forEach(b => b.onclick = () => {
        const t = b.dataset.t;
        if (t === 'all') flashCfg.topics = null;
        else { const s = new Set(flashCfg.topics || []); s.has(t) ? s.delete(t) : s.add(t); flashCfg.topics = s.size ? [...s] : null; }
        viewFlash();
      });
      if (!c) { $('#again').onclick = viewFlash; return; }
      const flip = () => { flipped = !flipped; $('#fc').classList.toggle('flip', flipped); $('#no').disabled = $('#yes').disabled = !flipped; };
      $('#fc').onclick = flip;
      const answer = ok => { const id = fcId(c); boxes[id] = ok ? Math.min(5, boxOf(c) + 1) : 1; store.set('boxes', boxes); seen++; if (ok) known++; cur++; flipped = false; render(); };
      $('#no').onclick = () => answer(false); $('#yes').onclick = () => answer(true);
      keyHandler = e => { if (e.target.closest('input,textarea')) return; if (e.key === ' ') { e.preventDefault(); flip(); } else if (flipped && e.key === '1') answer(false); else if (flipped && e.key === '2') answer(true); };
    }
    render();
  }
  let keyHandler = null;
  document.addEventListener('keydown', e => { if (keyHandler && (state.view === 'flashcards' || state.view === 'test' || state.view === 'torre')) keyHandler(e); });

  // ---------- TEST ----------
  const testCfg = { topics: null, source: 'mix', count: 20, mode: 'practice' };
  function buildQuestions() {
    const t = testCfg.topics;
    const fixed = D.questions.filter(q => !t || t.includes(q.t)).map(q => {
      const order = shuffle(q.o.map((_, i) => i));
      return { t: q.t, q: q.q, o: order.map(i => q.o[i]), a: q.a.map(i => order.indexOf(i)), m: !!q.m, e: q.e, g: 'Banco' };
    });
    const gens = G.list.filter(n => { const sample = G[n](Math.random); return !t || t.includes(sample.t); });
    const out = [];
    const n = testCfg.count;
    let nGen = testCfg.source === 'fixed' ? 0 : testCfg.source === 'gen' ? n : Math.round(n * 0.4);
    if (!gens.length) nGen = 0;
    const fx = shuffle(fixed).slice(0, n - nGen);
    for (let k = 0; k < n - fx.length && gens.length; k++) out.push(G[gens[k % gens.length]](Math.random));
    return shuffle(fx.concat(out)).slice(0, n);
  }
  function viewTest() {
    if (state.autostart) { state.autostart = false; return runTest(buildQuestions()); }
    const t = testCfg.topics;
    const nFixed = D.questions.filter(q => !t || t.includes(q.t)).length;
    const total = Object.values(G.combos()).reduce((a, b) => a + b, 0);
    const best = store.get('best', null);
    VIEW.innerHTML = `<div class="view-head"><div><div class="eyebrow">${D.questions.length} preguntas fijas + ${G.list.length} generadores</div><h1>Test</h1>
      <p>Preguntas de respuesta única y múltiple. Los generadores crean casos nuevos cada vez (estela, salidas sucesivas, nivel de transición, METAR, VMC/SVFR, LVP, fraseología numérica…): más de ${Math.floor(total / 1000) * 1000} combinaciones.</p></div></div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin-bottom:16px">
        <div class="panel stat"><b class="tabular">${nFixed}</b><span>preguntas fijas en la selección</span></div>
        <div class="panel stat"><b class="tabular">${Object.values(stats).reduce((a, s) => a + s.n, 0)}</b><span>respondidas en este navegador</span></div>
        <div class="panel stat"><b class="tabular">${best != null ? best + '%' : '—'}</b><span>mejor examen simulado</span></div>
      </div>
      <div class="panel" style="padding:18px;display:grid;gap:16px">
        <div><div class="eyebrow" style="margin-bottom:6px">Temas</div><div class="row">
          <label class="chip ${!t ? 'on' : ''}"><input type="checkbox" id="t-all" ${!t ? 'checked' : ''}> Todos</label>
          ${D.topics.map(x => `<label class="chip ${t && t.includes(x.id) ? 'on' : ''}"><input type="checkbox" id="t-${x.id}" data-id="${x.id}" ${t && t.includes(x.id) ? 'checked' : ''}> ${esc(x.title)}</label>`).join('')}</div></div>
        <div class="row" style="gap:22px">
          <div><div class="eyebrow" style="margin-bottom:6px">Origen</div><div class="seg" id="src">
            ${[['mix', 'Mezcla'], ['fixed', 'Solo banco'], ['gen', 'Solo generadas']].map(([k, l]) => `<button aria-pressed="${testCfg.source === k}" data-k="${k}">${l}</button>`).join('')}</div></div>
          <div><div class="eyebrow" style="margin-bottom:6px">Preguntas</div><div class="seg" id="cnt">
            ${[10, 20, 40, 80].map(k => `<button aria-pressed="${testCfg.count === k}" data-k="${k}">${k}</button>`).join('')}</div></div>
          <div><div class="eyebrow" style="margin-bottom:6px">Modo</div><div class="seg" id="mode">
            ${[['practice', 'Práctica'], ['exam', 'Examen']].map(([k, l]) => `<button aria-pressed="${testCfg.mode === k}" data-k="${k}">${l}</button>`).join('')}</div></div>
        </div>
        <p class="small muted" style="margin:0">Práctica: corrección y explicación tras cada pregunta. Examen: sin ayudas, nota y revisión al final.</p>
        <div><button class="btn primary" id="start">Empezar</button></div>
      </div>`;
    $('#t-all').onchange = () => { testCfg.topics = null; viewTest(); };
    $$('[data-id]', VIEW).forEach(c => c.onchange = () => { const s = new Set(testCfg.topics || []); c.checked ? s.add(c.dataset.id) : s.delete(c.dataset.id); testCfg.topics = s.size ? [...s] : null; viewTest(); });
    $$('#src button').forEach(b => b.onclick = () => { testCfg.source = b.dataset.k; viewTest(); });
    $$('#cnt button').forEach(b => b.onclick = () => { testCfg.count = +b.dataset.k; viewTest(); });
    $$('#mode button').forEach(b => b.onclick = () => { testCfg.mode = b.dataset.k; viewTest(); });
    $('#start').onclick = () => runTest(buildQuestions());
  }
  function runTest(qs) {
    let cur = 0; const answers = qs.map(() => null); const exam = testCfg.mode === 'exam';
    function isRight(q, sel) { return sel && sel.length === q.a.length && sel.every(x => q.a.includes(x)); }
    function render() {
      const q = qs[cur]; const ans = answers[cur]; const shown = ans && ans.done;
      const meter = qs.map((x, i) => { const a = answers[i]; const c = a && a.done ? (exam ? 'ok' : (isRight(x, a.sel) ? 'ok' : 'bad')) : ''; return `<i class="${c} ${i === cur ? 'cur' : ''}"></i>`; }).join('');
      const sel = ans ? ans.sel : [];
      const qhtml = esc(q.q).replace(/^METAR: (.+)$/m, '<span class="metar">METAR $1</span>');
      VIEW.innerHTML = `<div class="view-head"><div><div class="eyebrow">${exam ? 'Examen' : 'Práctica'} · pregunta ${cur + 1} de ${qs.length}</div><h1>Test</h1></div>
        <button class="btn ghost" id="quit">Salir</button></div>
        <div class="strip ${shown && !exam ? (isRight(q, sel) ? 'ok' : 'bad') : ''}"><div class="body">
          <div class="strip-meta"><span>${esc(topicName(q.t))}</span><span>${esc(q.g || '')}</span><span>${q.m || q.a.length > 1 ? 'Respuesta múltiple: marca todas las correctas' : 'Respuesta única'}</span></div>
          <p class="qtext">${qhtml}</p>
          <div class="opts">${q.o.map((o, i) => {
            let cls = sel.includes(i) ? 'sel' : '';
            if (shown && !exam) cls = q.a.includes(i) ? 'right' : (sel.includes(i) ? 'wrong' : '');
            return `<button class="opt ${cls}" data-i="${i}" ${shown ? 'disabled' : ''}><span class="k">${'ABCDEFG'[i]}</span><span>${esc(o)}</span></button>`;
          }).join('')}</div>
          ${shown && !exam ? `<div class="feedback ${isRight(q, sel) ? 'ok' : 'bad'}"><b>${isRight(q, sel) ? 'Correcto.' : 'Incorrecto.'}</b>${esc(q.e || '')}</div>` : ''}
          <div class="qbar"><div class="meter">${meter}</div><div class="row">
            ${!shown ? `<button class="btn primary" id="check" ${sel.length ? '' : 'disabled'}>${exam ? 'Responder' : 'Comprobar'}</button>` : `<button class="btn primary" id="next">${cur === qs.length - 1 ? 'Ver resultado' : 'Siguiente →'}</button>`}
          </div></div></div></div>`;
      $('#quit').onclick = () => viewTest();
      const multi = q.m || q.a.length > 1;
      $$('.opt', VIEW).forEach(b => b.onclick = () => {
        const i = +b.dataset.i; let s = (answers[cur] && answers[cur].sel) || [];
        s = multi ? (s.includes(i) ? s.filter(x => x !== i) : s.concat(i)) : [i];
        answers[cur] = { sel: s, done: false };
        if (!multi && exam) { answers[cur].done = true; recordAnswer(q.t, isRight(q, [i])); return next(); }
        render();
      });
      const check = () => { if (!sel.length) return; answers[cur].done = true; recordAnswer(q.t, isRight(q, sel)); exam ? next() : render(); };
      const next = () => { if (cur < qs.length - 1) { cur++; render(); } else finish(); };
      if ($('#check')) $('#check').onclick = check;
      if ($('#next')) $('#next').onclick = next;
            keyHandler = e => {
        const k = e.key.toUpperCase(); const idx = 'ABCDEFG'.indexOf(k);
        if (!shown && idx >= 0 && idx < q.o.length) { $$('.opt', VIEW)[idx].click(); }
        else if (e.key === 'Enter') { const b = $('#check') || $('#next'); if (b && !b.disabled) b.click(); }
      };
      if (exam && answers[cur] && answers[cur].done && !multi) { /* recorded at next */ }
    }
    function finish() {
      if (exam) qs.forEach((q, i) => { const a = answers[i]; if (a && a.done && !a.rec) { a.rec = true; } });
      const ok = qs.filter((q, i) => answers[i] && isRight(q, answers[i].sel)).length;
      const pct = Math.round(100 * ok / qs.length);
      if (exam) { const b = store.get('best', null); if (b == null || pct > b) store.set('best', pct); }
      const wrong = qs.map((q, i) => ({ q, a: answers[i] })).filter(x => !x.a || !isRight(x.q, x.a.sel));
      keyHandler = null;
      VIEW.innerHTML = `<div class="view-head"><div><div class="eyebrow">Resultado</div><h1>${ok} / ${qs.length} · ${pct}%</h1>
        <p>${pct >= 90 ? 'Listo para la frecuencia.' : pct >= 75 ? 'Buen nivel: repasa los fallos.' : 'Toca repasar: revisa las explicaciones y vuelve al temario.'}</p></div>
        <div class="row"><button class="btn primary" id="again">Otro test</button><button class="btn" id="cfg">Cambiar ajustes</button></div></div>
        ${wrong.length ? `<div class="grid">${wrong.map(({ q, a }) => `<div class="strip bad"><div class="body"><div class="strip-meta"><span>${esc(topicName(q.t))}</span><span>${esc(q.g || '')}</span></div>
          <p class="qtext" style="font-size:15.5px">${esc(q.q)}</p>
          <div class="small"><b>Tu respuesta:</b> ${a && a.sel.length ? a.sel.map(i => esc(q.o[i])).join(' · ') : '—'}<br><b>Correcta:</b> ${q.a.map(i => esc(q.o[i])).join(' · ')}</div>
          <div class="feedback bad" style="margin-top:8px">${esc(q.e || '')}</div></div></div>`).join('')}</div>` : '<div class="panel empty">Sin fallos.</div>'}`;
      $('#again').onclick = () => runTest(buildQuestions());
      $('#cfg').onclick = () => viewTest();
    }
    // en modo examen registramos al finalizar respuesta (check ya llama recordAnswer)
    render();
  }

  // ---------- TORRE EN VIVO ----------
  const POS = {
    hp: [438, 236], hp2: [462, 250], hp3: [330, 236], apron: [250, 300], twy: [300, 268], twy2: [370, 282],
    climb: [96, 150], crosswind: [70, 118], dw: [300, 84], dw2: [370, 84], base: [528, 138], cross: [300, 150],
    'point:W': [40, 255], 'point:N': [300, 30], 'point:S': [300, 322], 'point:E': [575, 60]
  };
  function place(p) {
    let m;
    if ((m = /^final:([\d.]+)/.exec(p))) return [Math.min(588, 420 + (+m[1]) * 17), 200];
    if ((m = /^rwy:([\d.]+)/.exec(p))) return [420 - (+m[1]) * 260, 200];
    return POS[p] || [300, 300];
  }
  function scope(scene, setup) {
    const ac = (scene || []).map(s => {
      const [x, y] = place(s.pos); const air = s.st === 'air' || /^(final|climb|crosswind|dw|base|cross|point)/.test(s.pos);
      const ly = y - 14 < 14 ? y + 22 : y - 12;
      return `<g><rect x="${x - 5}" y="${y - 5}" width="10" height="10" transform="rotate(45 ${x} ${y})" fill="${air ? 'var(--radar-fg)' : 'none'}" stroke="var(--radar-fg)" stroke-width="1.6"/>
        <text x="${x + 9}" y="${ly}" font-family="var(--mono)" font-size="11.5" fill="var(--radar-fg)">${esc(s.cs)}</text>
        <text x="${x + 9}" y="${ly + 12}" font-family="var(--mono)" font-size="10" fill="var(--radar-rwy)">${esc(s.ac)}${s.st === 'roll' ? ' ▸' : ''}</text></g>`;
    }).join('');
    return `<div class="scope"><svg viewBox="0 0 600 340" role="img" aria-label="Situación del tráfico en el aeródromo">
      <rect width="600" height="340" fill="var(--radar-bg)"/>
      ${[60, 120, 180, 240].map(r => `<circle cx="290" cy="200" r="${r}" fill="none" stroke="var(--radar-line)" stroke-width="1"/>`).join('')}
      <line x1="420" y1="200" x2="600" y2="200" stroke="var(--radar-line)" stroke-dasharray="6 6"/>
      <rect x="66" y="58" width="470" height="180" rx="30" fill="none" stroke="var(--radar-line)" stroke-dasharray="3 5"/>
      <rect x="160" y="195" width="260" height="10" fill="var(--radar-rwy)" rx="1"/>
      <path d="M420 205 L438 232 M250 205 L250 300 M330 205 L330 236" stroke="var(--radar-line)" stroke-width="3" fill="none"/>
      <text x="398" y="190" font-family="var(--mono)" font-size="11" fill="var(--radar-rwy)">${esc((setup && setup.rwy) || '')}</text>
      <text x="548" y="196" font-family="var(--mono)" font-size="10" fill="var(--radar-rwy)">FINAL</text>
      ${ac}</svg>
      <div class="hud"><span>${esc(setup.apt)}</span><span>RWY ${esc(setup.rwy)}</span></div></div>`;
  }
  const done = store.get('scen', {});
  let situationCounts = null; // se calcula por muestreo la primera vez que se abre la lista
  const catHead = c => `<h3 style="font-family:var(--display);text-transform:uppercase;letter-spacing:.05em;font-size:20px;margin:18px 0 8px">${esc(c)}</h3>`;
  function viewTorre() {
    const tab = state.tab || 'esc';
    VIEW.innerHTML = `<div class="view-head"><div><div class="eyebrow">Mini-juego</div><h1>Torre en vivo</h1>
      <p>Escenarios de torre paso a paso: decide qué haces y qué transmites. Cada partida saca hasta ${SC.MAX_STEPS} situaciones al azar (aeródromo, pista, viento, aeronaves y tránsitos cambian cada vez). Las decisiones que provocarían una pérdida de separación cuentan aparte, como en el examen.</p></div>
      <div class="seg"><button aria-pressed="${tab === 'esc'}" data-tab="esc">Escenarios</button><button aria-pressed="${tab === 'guia'}" data-tab="guia">Casos guiados</button><button aria-pressed="${tab === 'seq'}" data-tab="seq">Secuencia de salidas</button></div></div>
      <div id="torre"></div>`;
    $$('[data-tab]', VIEW).forEach(b => b.onclick = () => go('torre', { tab: b.dataset.tab }));
    const box = $('#torre');
    if (tab === 'seq') return seqGame(box);
    if (tab === 'guia') {
      const cats = [...new Set(D.scenarios.map(s => s.cat))];
      box.innerHTML = `<p class="small muted">Casos fijos con una historia continua de principio a fin.</p>` + cats.map(c => catHead(c) +
        `<div class="grid cols-3">${D.scenarios.filter(s => s.cat === c).map(s => `<button class="scen ${done[s.id] ? 'done' : ''}" data-s="${s.id}"><span class="body">
        <span class="cs"><span>${esc(s.setup.apt)}</span><span>RWY ${esc(s.setup.rwy)}</span><span>${'●'.repeat(s.diff)}${'○'.repeat(3 - s.diff)}</span></span>
        <span class="tt" style="display:block">${esc(s.title)}</span>
        <span class="small muted">${s.steps.length} decisiones${done[s.id] ? ` · mejor ${done[s.id]}%` : ''}</span></span></button>`).join('')}</div>`).join('');
      $$('[data-s]', box).forEach(b => b.onclick = () => playScenario(D.scenarios.find(s => s.id === b.dataset.s)));
      return;
    }
    if (!situationCounts) situationCounts = Object.fromEntries(SC.FAMILIES.map(f => [f.id, SC.countSituations(f, 2000)]));
    const cats = [...new Set(SC.FAMILIES.map(f => f.cat))];
    box.innerHTML = cats.map(c => catHead(c) +
      `<div class="grid cols-3">${SC.FAMILIES.filter(f => f.cat === c).map(f => `<button class="scen ${done[f.id] ? 'done' : ''}" data-f="${f.id}"><span class="body">
        <span class="cs"><span>Aeródromo al azar</span><span>${Object.keys(f.sits).length} tipos de situación</span><span>${'●'.repeat(f.diff)}${'○'.repeat(3 - f.diff)}</span></span>
        <span class="tt" style="display:block">${esc(f.title)}</span>
        <span class="small" style="display:block;margin:4px 0">${esc(f.desc)}</span>
        <span class="small muted">${Math.min(SC.MAX_STEPS, Object.keys(f.sits).length)} decisiones · más de ${(Math.floor(situationCounts[f.id] / 100) * 100 || situationCounts[f.id]).toLocaleString('es-ES')} situaciones${done[f.id] ? ` · mejor ${done[f.id]}%` : ''}</span></span></button>`).join('')}</div>`).join('');
    $$('[data-f]', box).forEach(b => b.onclick = () => playFamily(SC.FAMILIES.find(f => f.id === b.dataset.f)));
  }
  // Escenario generado: cada partida (y cada "nueva ronda") es una tirada distinta
  function playFamily(f) { playScenario(SC.build(f), () => playFamily(f)); }
  function playScenario(sc, again) {
    let step = 0, points = 0, losses = 0; const log = [];
    const steps = sc.steps.slice(0, SC.MAX_STEPS).map(st => { const order = shuffle(st.o.map((_, i) => i)); return Object.assign({}, st, { o: order.map(i => st.o[i]), a: st.a.map(i => order.indexOf(i)) }); });
    function render(sel, shown) {
      const st = steps[step]; sel = sel || [];
      const multi = st.m || st.a.length > 1;
      const right = shown && sel.length === st.a.length && sel.every(x => st.a.includes(x));
      VIEW.innerHTML = `<div class="view-head"><div><div class="eyebrow">${esc(sc.cat)} · decisión ${step + 1} de ${steps.length}</div><h1>${esc(sc.title)}</h1></div>
        <button class="btn ghost" id="exit">← Escenarios</button></div>
        <div class="scorebar"><div class="panel"><b class="tabular">${points}</b><span>puntos</span></div><div class="panel"><b class="tabular">${step}/${steps.length}</b><span>decisiones</span></div><div class="panel"><b class="tabular" style="color:${losses ? 'var(--bad)' : 'inherit'}">${losses}</b><span>pérdidas de separación</span></div></div>
        <div class="game"><div>${scope(st.scene, sc.setup)}<div class="atis"><b>ATIS</b> · ${esc(st.metar || sc.setup.metar)}${sc.setup.notes ? '<br>' + esc(sc.setup.notes) : ''}</div></div>
        <div><div class="sit">${esc(st.sit)}</div>
          <div class="strip arr ${shown ? (right ? 'ok' : 'bad') : ''}"><div class="body"><div class="strip-meta"><span>${multi ? 'Marca todas las correctas' : 'Elige una'}</span>${st.sev === 'loss' ? '<span style="color:var(--bad)">Crítica para la separación</span>' : ''}</div>
          <p class="qtext" style="font-size:16px">${esc(st.q)}</p>
          <div class="opts">${st.o.map((o, i) => { let c = sel.includes(i) ? 'sel' : ''; if (shown) c = st.a.includes(i) ? 'right' : (sel.includes(i) ? 'wrong' : ''); return `<button class="opt ${c}" data-i="${i}" ${shown ? 'disabled' : ''}><span class="k">${'ABCDE'[i]}</span><span>${esc(o)}</span></button>`; }).join('')}</div>
          ${shown ? `<div class="feedback ${right ? 'ok' : 'bad'}"><b>${right ? 'Bien gestionado.' : (st.sev === 'loss' ? 'Esto habría sido una pérdida de separación (suspenso en examen).' : 'No es lo correcto.')}</b>${esc(st.e)}</div>` : ''}
          <div class="qbar"><span></span>${shown ? `<button class="btn primary" id="nx">${step === steps.length - 1 ? 'Terminar' : 'Siguiente situación →'}</button>` : `<button class="btn primary" id="ck" ${sel.length ? '' : 'disabled'}>Transmitir</button>`}</div>
          </div></div></div></div>`;
      $('#exit').onclick = () => go('torre', { tab: sc.gen ? 'esc' : 'guia' });
      $$('.opt', VIEW).forEach(b => b.onclick = () => { const i = +b.dataset.i; const s = multi ? (sel.includes(i) ? sel.filter(x => x !== i) : sel.concat(i)) : [i]; render(s, false); });
      if ($('#ck')) $('#ck').onclick = () => { const ok = sel.length === st.a.length && sel.every(x => st.a.includes(x)); if (ok) points += st.sev === 'loss' ? 20 : 10; else if (st.sev === 'loss') losses++; log.push(ok); render(sel, true); };
      if ($('#nx')) $('#nx').onclick = () => { if (step < steps.length - 1) { step++; render(); } else finish(); };
      keyHandler = e => { const idx = 'ABCDE'.indexOf(e.key.toUpperCase()); if (!shown && idx >= 0 && idx < st.o.length) $$('.opt', VIEW)[idx].click(); else if (e.key === 'Enter') { const b = $('#ck') || $('#nx'); if (b && !b.disabled) b.click(); } };
    }
    function finish() {
      const max = steps.reduce((a, s) => a + (s.sev === 'loss' ? 20 : 10), 0); const pct = Math.round(100 * points / max);
      if (!done[sc.id] || pct > done[sc.id]) { done[sc.id] = pct; store.set('scen', done); }
      keyHandler = null;
      VIEW.innerHTML = `<div class="view-head"><div><div class="eyebrow">Fin del escenario</div><h1>${esc(sc.title)}</h1>
        <p>${points} de ${max} puntos (${pct}%). ${losses ? `${losses} ${losses > 1 ? 'decisiones habrían' : 'decisión habría'} supuesto pérdida de separación.` : 'Sin pérdidas de separación.'}</p></div>
        <div class="row"><button class="btn primary" id="rep">${again ? 'Nueva ronda' : 'Repetir'}</button><button class="btn" id="lst">Otros escenarios</button></div></div>
        <div class="grid">${steps.map((s, i) => `<div class="strip ${log[i] ? 'ok' : 'bad'}"><div class="body"><div class="strip-meta"><span>Decisión ${i + 1}</span><span>${log[i] ? 'Correcta' : 'Fallada'}</span></div>
          <div class="small"><b>${esc(s.q)}</b><br>${s.a.map(k => esc(s.o[k])).join(' · ')}</div><div class="small muted" style="margin-top:4px">${esc(s.e)}</div></div></div>`).join('')}</div>`;
      $('#rep').onclick = () => again ? again() : playScenario(sc); $('#lst').onclick = () => go('torre', { tab: sc.gen ? 'esc' : 'guia' });
    }
    render();
  }

  // Puzzle: secuencia óptima de salidas IFR
  const SUJETA_PEN = 3; // minutos estimados de coordinación con APP (supuesto del juego)
  function gap(a, b) {
    const w = R.depWake(a, b, false) || 0; const s = R.successive(a, b);
    if (s.sujeta) return { min: Math.max(w, SUJETA_PEN), why: `sujeta (+${SUJETA_PEN} min coord.)${w ? ', estela ' + w : ''}`, suj: true };
    const v = Math.max(w, s.min); return { min: v, why: `estela ${w || '—'} · sucesivas ${String(s.min).replace('.', ',')}` };
  }
  function cost(order) { let t = 0; for (let i = 1; i < order.length; i++) t += gap(order[i - 1], order[i]).min; return t; }
  function perms(a) { if (a.length <= 1) return [a]; return a.flatMap((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).map(p => [x].concat(p))); }
  function seqGame(box) {
    const pool = R.AIRCRAFT.filter(a => a.speed !== 'muyrapida' && a.kind !== 'helicóptero');
    let ac; do { ac = shuffle(pool).slice(0, 4); } while (new Set(ac.map(a => a.t)).size < 4);
    const cs = ac.map(a => ({ a, cs: (a.wake === 'L' ? 'EC' + String.fromCharCode(65 + Math.floor(rnd() * 26), 65 + Math.floor(rnd() * 26), 65 + Math.floor(rnd() * 26)) : ['IBE', 'VLG', 'AEA', 'RYR', 'BAW', 'DLH', 'ANE', 'BTI'][Math.floor(rnd() * 8)] + (100 + Math.floor(rnd() * 8900))) }));
    let picked = [];
    function render(result) {
      box.innerHTML = `<div class="game"><div>
        <div class="sit">Cuatro salidas <b>IFR</b> por la misma SID esperan en el punto de espera de cabecera. Aeródromo sin procedimiento local: tabla genérica en tiempo. Elige el orden de despegue que deje salir a las cuatro en el menor tiempo total.</div>
        <div class="seq-list">${cs.map((x, i) => { const pos = picked.indexOf(i); return `<button class="seq-item" data-i="${i}" ${result ? 'disabled' : ''}><span class="ord">${pos >= 0 ? pos + 1 : '·'}</span><span><span class="cs">${esc(x.cs)}</span> <span class="muted small">${esc(x.a.name)}</span></span>
          <span class="tags"><span class="tag">${R.WAKE_NAME[R.leadingWake(x.a)]}${x.a.heavyWhenLeading ? '*' : ''}</span><span class="tag">${R.SPEED_NAME[x.a.speed]}</span></span></button>`; }).join('')}</div>
        <div class="qbar"><button class="btn ghost" id="rs">Reiniciar orden</button><div class="row"><button class="btn" id="nw">Otro caso</button><button class="btn primary" id="ev" ${picked.length === 4 && !result ? '' : 'disabled'}>Evaluar secuencia</button></div></div>
        <details class="help" style="margin-top:10px"><summary>Cómo se puntúa</summary><p class="small">Entre cada par se aplica lo más restrictivo entre estela turbulenta y la tabla de salidas sucesivas. Una salida que queda <b>sujeta</b> no puede despegar sin la suelta de APP; en el juego eso cuesta ${SUJETA_PEN} minutos (supuesto para poder comparar órdenes). * El B757 cuenta como pesado cuando va delante.</p></details>
        </div><div>${result || '<div class="panel empty">Toca las aeronaves en el orden en que las harías despegar.</div>'}</div></div>`;
      $$('.seq-item', box).forEach(b => b.onclick = () => { const i = +b.dataset.i; picked = picked.includes(i) ? picked.filter(x => x !== i) : picked.concat(i); render(); });
      $('#rs').onclick = () => { picked = []; render(); };
      $('#nw').onclick = () => seqGame(box);
      $('#ev').onclick = () => {
        const mine = picked.map(i => cs[i]); const myCost = cost(mine.map(x => x.a));
        const all = perms(cs).map(p => ({ p, c: cost(p.map(x => x.a)) })).sort((a, b) => a.c - b.c); const best = all[0];
        const line = order => order.map((x, i) => i === 0 ? `<div>T+0 · ${esc(x.cs)} (${esc(x.a.t)})</div>` : (() => { const g = gap(order[i - 1].a, x.a); return `<div>+${String(g.min).replace('.', ',')} min · ${esc(x.cs)} (${esc(x.a.t)}) <span class="muted">— ${g.why}</span></div>`; })()).join('');
        const ok = myCost <= best.c;
        render(`<div class="strip ${ok ? 'ok' : 'bad'}"><div class="body"><div class="strip-meta"><span>Tu secuencia</span><span>${String(myCost).replace('.', ',')} min</span></div><div class="timeline">${line(mine)}</div>
          <div class="feedback ${ok ? 'ok' : 'bad'}"><b>${ok ? 'Secuencia óptima.' : `Se podía hacer en ${String(best.c).replace('.', ',')} min.`}</b>${ok ? 'Has minimizado la demora sin dejar salidas sujetas innecesariamente.' : 'Regla práctica: deja salir antes a los más rápidos y a los de mayor estela, y a los lentos y ligeros al final o intercalados con cuidado.'}</div>
          ${ok ? '' : `<div class="strip-meta" style="margin-top:12px"><span>Orden óptimo</span></div><div class="timeline">${line(best.p)}</div>`}</div></div>`);
      };
    }
    render();
  }

  // ---------- SIMULADOR ----------
  function viewSim() { window.ADC_SIM.mount(VIEW, { store }); }

  // ---------- CHULETA ----------
  function viewChuleta() {
    VIEW.innerHTML = `<div class="view-head"><div><div class="eyebrow">Tablas de bolsillo</div><h1>Chuleta</h1>
      <p>Todos los números que hay que tener en la cabeza, en una sola página.</p></div></div><article class="doc">${md(D.cheatsheet)}</article>`;
  }

  // ---------- arranque ----------
  const tokens = ['temario', 'resumenes', 'flashcards', 'test', 'torre', 'simulador', 'chuleta'];
  const h = (location.hash || '').slice(1);
  if (tokens.includes(h)) go(h);
  else if (h.startsWith('t-') && topicById[h.slice(2)]) go('temario', { topic: h.slice(2) });
  else go(tokens.includes(store.get('view', '')) ? store.get('view', 'temario') : 'temario');
})();
