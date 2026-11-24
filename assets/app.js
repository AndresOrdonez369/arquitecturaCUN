/* Arquitectura de Videojuegos · motor del sitio (hub, clase, slides, quiz) */
(function () {
  'use strict';
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const B = () => document.body.dataset.base || '';
  const param = k => new URLSearchParams(location.search).get(k);
  const store = {
    get(k, d) { try { const v = localStorage.getItem('arqvj.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('arqvj.' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: el sitio sigue funcionando */ } }
  };
  const ICON = {
    right: '<path d="M5 12h14M13 6l6 6-6 6"/>', left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    play: '<path d="M7 5l12 7-12 7z"/>', code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
    doc: '<path d="M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5"/>', home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
    full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', note: '<path d="M5 5h14v10H10l-5 4z"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', ok: '<path d="M5 12l5 5 9-10"/>', print: '<path d="M7 8V4h10v4M7 17H4V9h16v8h-3M7 14h10v6H7z"/>'
  };
  const icon = n => `<svg class="svg" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
  const loadScript = src => new Promise(res => { const s = document.createElement('script'); s.src = src; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s); });

  /* ---------- resaltado de código ---------- */
  const KW = {
    'C#': 'abstract as base bool break case catch class const continue default delegate do else enum event false finally float double int long string void for foreach if in interface internal is namespace new null object out override private protected public readonly ref return sealed static struct switch this throw true try typeof using var virtual while char byte yield get set record',
    'C++': 'auto bool break case catch class const constexpr continue default delete do double else enum explicit false float for if include inline int long namespace new nullptr operator override private protected public return size_t static struct switch template this throw true try typedef typename using virtual void while unsigned char std',
    'Lua': 'and break do else elseif end false for function if in local nil not or repeat return then true until while',
    'JSON': 'true false null'
  };
  KW['Unity'] = KW['C#'];
  function highlight(src, lang) {
    const kw = new Set((KW[lang] || KW['C#']).split(' '));
    const lua = lang === 'Lua';
    const re = lua
      ? /(--\[\[[\s\S]*?\]\]|--[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g
      : /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#\w+[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])')|(\b\d+(?:\.\d+)?[fFuUlLdDmM]?\b)|([A-Za-z_]\w*)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      const t = esc(m[0]);
      if (m[1]) out += `<span class="tk-c">${t}</span>`;
      else if (m[2]) out += `<span class="tk-s">${t}</span>`;
      else if (m[3]) out += `<span class="tk-n">${t}</span>`;
      else if (kw.has(m[4])) out += `<span class="tk-k">${t}</span>`;
      else if (/^[A-Z]/.test(m[4]) && !lua) out += `<span class="tk-t">${t}</span>`;
      else out += t;
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }
  let uid = 0;
  /* tabs: [{lang, label?, src}] ; opts: {cap, tone:'bad'|'good'} */
  function codeBox(tabs, opts) {
    opts = opts || {};
    const id = 'cb' + (++uid);
    const head = opts.cap
      ? `<div class="cap">${opts.tone === 'bad' ? icon('x') : opts.tone === 'good' ? icon('ok') : icon('code')}${esc(opts.cap)}</div>` : '';
    const bar = tabs.length > 1 || !opts.cap
      ? `<div class="tabs" role="tablist">${tabs.map((t, i) => `<button role="tab" aria-selected="${i === 0}" data-i="${i}">${esc(t.label || t.lang)}</button>`).join('')}<button class="copy" data-copy title="Copiar código">copiar</button></div>` : '';
    return `<div class="codebox ${opts.tone || ''}" id="${id}" data-tabs='${esc(JSON.stringify(tabs)).replace(/'/g, '&#39;')}'>${head}${bar}<pre tabindex="0"><code>${highlight(tabs[0].src, tabs[0].lang)}</code></pre></div>`;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('.codebox .tabs button');
    if (!b) return;
    const box = b.closest('.codebox'), tabs = JSON.parse(box.dataset.tabs);
    if (b.hasAttribute('data-copy')) {
      const i = +($('[aria-selected="true"]', box) || { dataset: { i: 0 } }).dataset.i;
      navigator.clipboard && navigator.clipboard.writeText(tabs[i].src).then(() => { b.textContent = 'copiado'; setTimeout(() => b.textContent = 'copiar', 1400); });
      return;
    }
    box.querySelectorAll('[role=tab]').forEach(x => x.setAttribute('aria-selected', x === b));
    const t = tabs[+b.dataset.i];
    $('code', box).innerHTML = highlight(t.src, t.lang);
  });

  /* ---------- pregunta de opción múltiple (en slides y quiz) ---------- */
  const L = 'ABCD';
  function checkHTML(c, two) {
    return `<div class="check"><p class="q">${c.q}</p><div class="opts ${two ? 'two' : ''}">${c.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="l">${L[i]}</span><span>${o}</span></button>`).join('')}</div><div class="why" role="status">${c.why || ''}</div></div>`;
  }
  function wireCheck(el, c, done) {
    el.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i;
      el.querySelectorAll('.opt').forEach((x, j) => { x.disabled = true; if (j === c.ok) x.classList.add('ok'); else if (j === i) x.classList.add('no'); });
      $('.why', el).classList.add('on');
      if (done) done(i === c.ok, i);
    }));
  }

  /* ---------- fechas ---------- */
  function semanaActual() {
    const hoy = new Date(), S = window.CURSO.semanas;
    for (const s of S) if (hoy <= new Date(s.fin + 'T23:59:59')) return s.n;
    return S.length;
  }

  /* ---------- cabecera y riel compartidos ---------- */
  function topbar(here) {
    const l = (h, t, k) => `<a href="${B()}${h}" ${here === k ? 'aria-current="page"' : ''}>${t}</a>`;
    return `<div class="wrap topbar"><a class="mark" href="${B()}index.html"><i></i>ARQ·VJ</a><nav aria-label="Principal">${l('index.html', 'Curso', 'hub')}${l('plan.html', 'Plan', 'plan')}${l('index.html#evaluacion', 'Evaluación', 'eval')}${l('index.html#documentos', 'Documentos', 'docs')}</nav></div>`;
  }
  function rail(activa, href) {
    const act = semanaActual(), last = store.get('last', null);
    return `<nav class="rail" aria-label="Semanas"><ol class="wrap">${window.CURSO.semanas.map(s => {
      const cls = [s.n < act ? 'done' : '', last && last.s === s.n && s.n !== activa ? 'here' : ''].join(' ');
      return `<li><a class="${cls}" href="${href(s.n)}" data-s="${s.n}" ${s.n === activa ? 'aria-current="true"' : ''}><span class="n">${s.n}</span><span class="t">${esc(s.corto)}</span></a></li>`;
    }).join('')}</ol></nav>`;
  }
  const foot = () => `<footer class="foot"><div class="wrap">Arquitectura de Videojuegos · Especialización en Diseño y Desarrollo de Videojuegos · CUN · Bloque 26ES6-1 · Docente: Andrés Ordóñez-Bolaños. Los ejemplos y el juego "Turno Nocturno" se crearon solo para este curso.</div></footer>`;

  /* ---------- HUB ---------- */
  function hub() {
    const C = window.CURSO, act = semanaActual();
    let sel = act;
    const sa = C.semanas[act - 1];
    $('#mast').innerHTML = topbar('hub') + `<div class="wrap hero"><div><h1>Arquitectura de Videojuegos</h1><p class="lede">${C.lema}</p><p class="facts">${C.datos}</p></div>
      <aside class="now node amber"><div class="nh"><span class="pin on"></span>Esta semana</div><div class="nb"><h2>${sa.titulo}</h2><p class="when">Semana ${sa.n} de 8 · ${sa.fechaTxt}</p><p>${sa.pregunta}</p><a class="btn" href="clase.html?s=${sa.n}">Abrir la clase ${icon('right')}</a></div></aside></div><div class="wrap rutahub"><div class="figura ruta" id="ruta"></div></div>`;
    const draw = () => {
      const s = C.semanas[sel - 1];
      $('#rail').innerHTML = rail(sel, n => '#semana-' + n);
      const pre = s.antes || { t: 'Calienta', p: 'Lee la analogía de la semana y llega con una pregunta.', h: `clase.html?s=${s.n}`, a: 'Ver la clase' };
      const step = (n, when, t, p, h, a, tono) => `<li><div class="node ${tono}"><div class="nh"><span class="pin"></span>${when}</div><div class="nb"><h3>${t}</h3><p>${p}</p>${h ? `<a href="${h}">${a} ${icon('right')}</a>` : ''}</div></div></li>`;
      $('#semana').innerHTML = `<div class="weekhead"><div><h2>Semana ${s.n}: ${s.titulo}</h2><p class="q">${s.pregunta}</p></div><span class="tag q">${s.fechaTxt}</span></div>
        <ol class="strip">${step(1, 'Antes de clase', pre.t, pre.p, pre.h, pre.a, '')}${step(2, 'En clase · 2 horas', 'Slides interactivas', s.slidesTxt || 'El grafo de temas, analogías, código y demos que puedes mover tú mismo.', `slides.html?s=${s.n}`, 'Abrir slides', 'amber')}${step(3, 'En clase y en casa', 'Código', s.codigoTxt || 'Los ejemplos de la clase en C#, con su versión en Unity.', `clase.html?s=${s.n}#codigo`, 'Ver el código', 'teal')}${step(4, 'Al cerrar', 'Quiz de la clase', 'Preguntas cortas con explicación. No es nota: es tu termómetro.', `quiz.html?s=${s.n}`, 'Jugar el quiz', 'violet')}</ol>`;
    };
    draw();
    $('#rail').addEventListener('click', e => { const a = e.target.closest('a[data-s]'); if (!a) return; e.preventDefault(); sel = +a.dataset.s; draw(); $('#semana').scrollIntoView({ block: 'nearest' }); });
    $('#plays').innerHTML = C.semanas.map(s => `<li><span class="n">${s.n}</span><div><h3><a href="clase.html?s=${s.n}">${s.titulo}</a></h3><span class="date">${s.fechaTxt}${s.movida ? ' · día por confirmar' : ''}</span></div><div><p>${s.temas}</p><p class="ana">Analogía: ${s.analogia}</p></div><div>${s.entrega ? `<span class="tag ${s.entregaTipo || ''}">${s.entrega}</span>` : ''}</div></li>`).join('');
    if ($('#ruta') && window.FIG) window.FIG.ruta($('#ruta'), { actual: act });
    $('#foot').outerHTML = foot();
  }

  /* ---------- CLASE ---------- */
  async function clase() {
    const n = +param('s') || semanaActual(), s = window.CURSO.semanas[n - 1];
    await loadScript(`data/s${n}.js`);
    await loadScript('data/temarios.js');
    const K = window.CLASE;
    document.title = `Semana ${n}: ${s.titulo} · Arquitectura de Videojuegos`;
    $('#mast').innerHTML = topbar('') + `<div class="wrap pagehead"><h1>${s.titulo}</h1><p class="meta">Semana ${n} de 8 · ${s.fase} · ${s.fechaTxt}${s.movida ? ' (día por confirmar)' : ''}</p><p class="q">${s.pregunta}</p>
      <div class="acts"><a class="btn go" href="slides.html?s=${n}">${icon('play')} Abrir slides</a><a class="btn alt" href="#codigo">${icon('code')} Código</a><a class="btn alt" href="quiz.html?s=${n}">${icon('quiz')} Quiz</a></div></div>`;
    $('#rail').innerHTML = rail(n, x => 'clase.html?s=' + x);
    if (!K) { $('#main').innerHTML = '<p class="note warn">El material de esta semana todavía no está publicado.</p>'; return; }
    const li = a => a.map(x => `<li>${x}</li>`).join('');
    const T = (window.TEMARIOS || {})[n];
    $('#main').innerHTML = `${T ? `<section class="mapaclase"><h2 id="mapa">Mapa de la clase</h2><p>${T.lead || ''} Toca un nodo para ver su resumen.</p><div class="grafo-wrap"><div class="figura" id="grafo"></div></div></section>` : ''}<div class="cols"><div class="prose">
      <h2>Al terminar podrás</h2><ul>${li(K.objetivos)}</ul>
      <div class="note key"><p><b>La analogía de hoy.</b> ${K.analogia}</p></div>
      ${K.conceptos ? `<h2 id="conceptos">Conceptos clave</h2><dl class="conceptos">${K.conceptos.map(c => `<div><dt>${c.t}</dt><dd>${c.d}</dd><dd class="ej"><b>En un juego:</b> ${c.ej}</dd></div>`).join('')}</dl>` : ''}
      ${K.industria ? `<h2 id="industria">En juegos reales</h2><ul class="casos">${K.industria.map(c => `<li><b>${c.j}</b><span>${c.t}</span><small>${c.src}</small></li>`).join('')}</ul>` : ''}
      ${K.errores ? `<h2 id="errores">Errores comunes</h2><table class="tbl mitos"><thead><tr><th>Lo que se suele creer</th><th>Lo que pasa en realidad</th></tr></thead><tbody>${K.errores.map(e => `<tr><td>${e.mito}</td><td>${e.real}</td></tr>`).join('')}</tbody></table>` : ''}
      <h2 id="codigo">Código de la clase</h2><p>${K.codigoIntro || 'Primero C# sin motor, para ver la idea desnuda. Las otras pestañas muestran la misma idea en otros lenguajes o dentro de Unity.'}</p>
      ${K.codigo.map(c => `<h3>${c.titulo}</h3><p>${c.desc}</p>${codeBox(c.tabs)}`).join('')}
      <h2>Para la próxima</h2><ul>${li(K.tarea)}</ul>
      ${K.lecturas ? `<h2>Para profundizar</h2><ul>${li(K.lecturas)}</ul>` : ''}
      <div class="pager">${n > 1 ? `<a class="btn alt" href="clase.html?s=${n - 1}">${icon('left')} Semana ${n - 1}</a>` : '<span></span>'}${n < 8 ? `<a class="btn" href="clase.html?s=${n + 1}">Semana ${n + 1} ${icon('right')}</a>` : ''}</div>
      </div><aside class="side"><h3>Las 2 horas, minuto a minuto</h3><ol class="agenda">${K.agenda.map(a => `<li><b>${a[0]}</b><span>${a[1]}</span></li>`).join('')}</ol>${s.entrega ? `<p style="margin:1rem 0 0"><span class="tag ${s.entregaTipo || ''}">${s.entrega}</span></p>` : ''}</aside></div>`;
    if (T && window.FIG && $('#grafo')) window.FIG.grafo($('#grafo'), { nodos: T.nodos.map(x => ({ id: x[0], t: x[1], s: x[2], tipo: x[3], d: x[4] })), cables: T.cables });
    $('#foot').outerHTML = foot();
    store.set('last', { s: n, k: (store.get('last', {}) || {}).s === n ? store.get('last').k : 0 });
  }

  /* ---------- SLIDES ---------- */
  const KIND = { portada: 'Inicio', analogia: 'Analogía', idea: 'Idea', codigo: 'Código', demo: 'Demo', reto: 'Predice', antipatron: 'Antipatrón', actividad: 'Actividad', cierre: 'Cierre' };
  async function slides() {
    const n = +param('s') || 1;
    await loadScript(`data/s${n}.js`);
    await loadScript(`demos/s${n}.js`);
    const K = window.CLASE, stage = $('#stage');
    if (!K) { stage.innerHTML = '<section class="slide"><h1>Slides en preparación</h1><p><a href="index.html">Volver al curso</a></p></section>'; return; }
    document.title = `Slides S${n} · ${K.titulo}`;
    const S = K.slides;
    let k = Math.min(S.length - 1, Math.max(0, (+location.hash.slice(1) || 1) - 1)), stop = null;
    function show() {
      if (stop) { try { stop(); } catch (e) { /* demo ya detenida */ } stop = null; }
      const s = S[k];
      let h = `<section class="slide k-${s.kind || 'idea'}"><h1>${s.title}</h1>`;
      const body = s.html ? `<div class="body ${s.wide ? 'wide' : ''}">${s.html}</div>` : '';
      const after = s.after ? `<div class="body">${s.after}</div>` : '';
      if (s.code && !s.compare && !s.demo && (s.check || s.html)) {
        /* texto y pregunta a la izquierda, código a la derecha: cabe en una pantalla proyectada */
        h += `<div class="split"><div class="s-t">${body}${after}</div><div class="s-c">${codeBox(s.code)}</div>${s.check ? `<div class="s-k">${checkHTML(s.check)}</div>` : ''}</div>`;
      } else {
        h += body;
        if (s.compare) h += `<div class="compare">${codeBox([s.compare.a], { cap: s.compare.a.label, tone: 'bad' })}${codeBox([s.compare.b], { cap: s.compare.b.label, tone: 'good' })}</div>`;
        if (s.code) h += codeBox(s.code);
        if (s.demo) h += `<div class="demo" id="demo"></div>`;
        if (s.check) h += checkHTML(s.check);
        h += after;
      }
      stage.innerHTML = h + '</section>';
      stage.scrollTop = 0;
      if (s.check) wireCheck($('.check', stage), s.check);
      if (s.demo) { const f = (window.DEMOS || {})[s.demo]; if (f) stop = f($('#demo')) || null; else $('#demo').textContent = 'Demo no disponible.'; }
      fit();
      $('#kind').textContent = KIND[s.kind || 'idea'];
      $('#ttl').textContent = `S${n} · ${K.titulo}`;
      $('#cnt').textContent = `${k + 1} / ${S.length}`;
      $('#prev').disabled = k === 0; $('#next').disabled = k === S.length - 1;
      $('#prog').style.width = ((k + 1) / S.length * 100) + '%';
      $('#notes').innerHTML = `<b>Nota docente.</b> ${s.nota || 'Sin nota para esta slide.'}`;
      history.replaceState(null, '', '#' + (k + 1));
      store.set('last', { s: n, k });
    }
    /* si la slide no cabe en pantalla, baja la letra por pasos hasta un mínimo legible */
    function fit() {
      stage.style.fontSize = '';
      if (innerWidth < 900) return;
      const base = parseFloat(getComputedStyle(stage).fontSize);
      for (let f = .94; f >= .76 && stage.scrollHeight > stage.clientHeight + 2; f -= .06) stage.style.fontSize = (base * f) + 'px';
    }
    addEventListener('resize', fit);
    const go = d => { const j = Math.min(S.length - 1, Math.max(0, k + d)); if (j !== k) { k = j; show(); } };
    $('#prev').onclick = () => go(-1); $('#next').onclick = () => go(1);
    $('#full').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    $('#nbtn').onclick = () => $('#notes').classList.toggle('on');
    $('#back').href = `clase.html?s=${n}`;
    document.addEventListener('keydown', e => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { go(1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { go(-1); e.preventDefault(); }
      else if (e.key === 'Home') { k = 0; show(); } else if (e.key === 'End') { k = S.length - 1; show(); }
      else if (e.key === 'f' || e.key === 'F') $('#full').click();
      else if (e.key === 'n' || e.key === 'N') $('#nbtn').click();
    });
    addEventListener('hashchange', () => { const j = Math.min(S.length - 1, Math.max(0, (+location.hash.slice(1) || 1) - 1)); if (j !== k) { k = j; show(); } });
    let x0 = null;
    stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 70) go(d < 0 ? 1 : -1); x0 = null; });
    show();
  }

  /* ---------- QUIZ ---------- */
  async function quiz() {
    const id = param('s') || '1', diag = id === 'diag';
    await loadScript(diag ? 'data/diagnostico.js' : `data/s${id}.js`);
    const K = diag ? window.DIAGNOSTICO : window.CLASE, el = $('#main');
    const titulo = diag ? 'Quiz de conceptos previos' : `Quiz · Semana ${id}`;
    document.title = titulo + ' · Arquitectura de Videojuegos';
    $('#mast').innerHTML = topbar('') + `<div class="wrap pagehead"><h1>${titulo}</h1><p class="meta">${diag ? 'Semana 1 · antes de empezar' : esc(K ? K.titulo : '')}</p><p class="q">${diag ? 'Diez preguntas sobre lo que ya traes. No es nota: es el punto de partida para medir cuánto avanzas.' : 'Preguntas cortas con explicación inmediata. No es nota: te dice qué repasar.'}</p></div>`;
    $('#foot').outerHTML = foot();
    if (!K || !K.quiz) { el.innerHTML = '<p class="note warn">Este quiz todavía no está publicado.</p>'; return; }
    const Q = K.quiz, res = [];
    let i = 0;
    const bar = () => `<div class="bar" aria-hidden="true">${Q.map((_, j) => `<i class="${j < res.length ? (res[j].ok ? 'ok' : 'no') : j === i ? 'cur' : ''}"></i>`).join('')}</div>`;
    function ask() {
      const q = Q[i];
      el.innerHTML = `<div class="quiz">${bar()}<h2>${q.q}</h2><p class="count">Pregunta ${i + 1} de ${Q.length}${q.tema ? ' · ' + esc(q.tema) : ''}</p>${q.code ? codeBox([q.code], { cap: q.code.lang }) : ''}${checkHTML({ q: '', opts: q.opts, ok: q.ok, why: q.why })}<div class="next"><button class="btn" id="nx" disabled>${i === Q.length - 1 ? 'Ver resultado' : 'Siguiente'} ${icon('right')}</button></div></div>`;
      $('.check .q', el).remove();
      wireCheck($('.check', el), q, (ok, pick) => { res.push({ ok, pick }); $('.bar', el).outerHTML = bar(); const b = $('#nx'); b.disabled = false; b.focus(); });
      $('#nx').onclick = () => { i++; i < Q.length ? ask() : end(); };
    }
    function end() {
      const ok = res.filter(r => r.ok).length, prev = store.get('quiz.' + id, null);
      store.set('quiz.' + id, { ok, total: Q.length, fecha: new Date().toISOString().slice(0, 10) });
      const msg = ok === Q.length ? 'Jugada perfecta.' : ok >= Q.length * .7 ? 'Vas bien. Repasa las que fallaste.' : diag ? 'Perfecto: ahora sabemos por dónde empezar.' : 'Vuelve a las slides y reintenta: las explicaciones están abajo.';
      const fallos = Q.map((q, j) => ({ q, j })).filter(x => !res[x.j].ok);
      el.innerHTML = `<div class="quiz"><div class="score"><div class="big">${ok}/${Q.length}</div><p style="margin:1rem auto">${msg}${prev ? ` Tu intento anterior: ${prev.ok}/${prev.total}.` : ''}</p><div class="doctools" style="justify-content:center"><button class="btn" id="again">Reintentar</button><a class="btn alt" href="${diag ? 'index.html' : 'clase.html?s=' + id}">Volver ${diag ? 'al curso' : 'a la clase'}</a></div></div>
        ${fallos.length ? `<div class="review"><h3>Para repasar</h3><ol>${fallos.map(x => `<li value="${x.j + 1}"><b>${x.q.q}</b><br>Correcta: ${L[x.q.ok]}. ${x.q.opts[x.q.ok]}<br><span style="color:var(--ink-2)">${x.q.why}</span></li>`).join('')}</ol></div>` : ''}</div>`;
      $('#again').onclick = () => { res.length = 0; i = 0; ask(); };
    }
    ask();
  }

  /* ---------- páginas estáticas (plan, documentos) ---------- */
  function estatica(k) {
    const m = $('#mast'), t = m.dataset;
    m.innerHTML = topbar(k) + `<div class="wrap pagehead"><h1>${t.h1}</h1>${t.meta ? `<p class="meta">${t.meta}</p>` : ''}${t.q ? `<p class="q">${t.q}</p>` : ''}</div>`;
    const f = $('#foot'); if (f) f.outerHTML = foot();
    document.querySelectorAll('pre[data-lang]').forEach(p => { p.outerHTML = codeBox([{ lang: p.dataset.lang, src: p.textContent.replace(/^\n/, '') }], { cap: p.dataset.cap || p.dataset.lang }); });
  }

  /* en el visor de claude.ai las descargas pasan por el permiso "downloads"; en un servidor normal el enlace funciona solo */
  let DL = null;
  if (window.claude && window.claude.use) window.claude.use('downloads').then(d => { DL = d; }).catch(() => {});
  document.addEventListener('click', e => {
    const a = e.target.closest('a[download]');
    if (!a || !DL) return;
    e.preventDefault();
    const nombre = a.getAttribute('href').split('/').pop();
    fetch(a.href).then(r => { if (!r.ok) throw new Error('no se pudo leer'); return r.blob(); })
      .then(b => DL.save({ filename: nombre, data: b }))
      .catch(err => { if (err && err.code === 'declined') return; if (err && (err.code === 'unavailable' || err.code === 'not_granted')) { window.open(a.href, '_blank'); } });
  });

  window.ARQ = { codeBox, highlight, icon, store, esc, $, param, loadScript, checkHTML, wireCheck };
  window.DEMOS = window.DEMOS || {};
  document.addEventListener('DOMContentLoaded', () => {
    const p = document.body.dataset.page;
    if (p === 'deck') return window.DECK(window.ARQ);
    ({ hub, clase, slides, quiz }[p] || (() => estatica(p)))();
  });
})();
