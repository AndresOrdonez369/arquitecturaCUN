/* FIG · piezas para construir figuras interactivas con el mismo aspecto en todo el curso: un grafo de nodos de motor.
   Uso dentro de demos/sN.js:

   window.DEMOS.miFigura = function (el) {
     const f = FIG.lienzo(el, 900, 460);                 // lienzo oscuro con rejilla que se adapta al espacio
     const a = f.caja(60, 80, 220, 90, 'Entrada');       // nodo con rótulo; a.tono('on'|'base'|'bad'|'ok'|'off'|'paper'), a.rotulo('x')
     const b = f.caja(420, 80, 220, 90, 'Juego');
     const fl = f.flecha(a, b, { rotulo: 'pide' });      // cable entre nodos (o puntos [x,y]); fl.tono('bad'), fl.ver(false)
     f.texto(450, 300, 'hola', { tam: 22, tono: 'soft' });
     const c = FIG.controles(el);                        // barra de controles bajo el dibujo
     c.boton('Probar', () => {...});  c.opciones(['A','B'], i => {...});  c.deslizador('fps', 10, 144, 60, 1, v => {...});
     const di = FIG.dice(el);                            // frase de veredicto: di('texto', 'ok'|'bad'|'')
     return () => {};                                    // detener timers
   };
   FIG.grafo(el, { nodos, cables }) dibuja un grafo de temas que se arma solo; FIG.ruta(el, { actual }) dibuja el curso. */
(function () {
  /* los nombres viejos (cobalt, yellow, coral) se conservan para no romper las figuras; sus valores son la paleta nueva */
  const C = { ink: '#0d0d0e', cobalt: '#2b2b30', yellow: '#e2a54a', coral: '#e0706a', ok: '#66bb87', white: '#eef0f4', soft: '#b9b9bd', grey: '#76767c', paper: '#e4e4e6',
    amber: '#e2a54a', teal: '#4db5a4', slate: '#86a0dc', rose: '#e0706a', green: '#66bb87', violet: '#a690e2', node: '#19191b', edge: '#3c3c41', text: '#ececec' };
  const TONO = {
    base: { f: '#252528', s: '#4d4d53', t: C.text, p: C.slate }, on: { f: C.amber, s: '#f3c983', t: '#17120a', p: '#f3c983' },
    bad: { f: '#a9473f', s: C.rose, t: '#fff', p: C.rose }, ok: { f: '#2e7653', s: C.green, t: '#fff', p: C.green },
    off: { f: '#161618', s: '#2c2c31', t: '#77777d', p: '#2c2c31' }, paper: { f: C.paper, s: '#f4f6f9', t: '#14161b', p: '#9aa3b3' }
  };
  const LINEA = { base: 'rgba(205,205,210,.55)', on: C.amber, bad: C.rose, ok: C.green, off: 'rgba(255,255,255,.12)', teal: C.teal, slate: C.slate };
  const NS = 'http://www.w3.org/2000/svg';
  const quieto = () => document.documentElement.classList.contains('sin-anim') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  let uid = 0;
  function nodo(tag, at, padre) { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (padre) padre.appendChild(e); return e; }

  function lienzo(el, w, h) {
    const svg = nodo('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', preserveAspectRatio: 'xMidYMid meet' }, el);
    svg.style.aspectRatio = w + ' / ' + h;
    const id = 'fg' + (++uid), defs = nodo('defs', {}, svg);
    Object.keys(LINEA).forEach(t => { const m = nodo('marker', { id: `${id}-${t}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6.5, markerHeight: 6.5, orient: 'auto-start-reverse' }, defs); nodo('path', { d: 'M0 0L10 5L0 10z', fill: LINEA[t] }, m); });
    const capaL = nodo('g', {}, svg), capaC = nodo('g', {}, svg);
    const api = {
      svg, w, h, nodo: (t, a, p) => nodo(t, a, p || capaC),
      caja(x, y, bw, bh, txt, o) {
        o = o || {};
        const g = nodo('g', { class: 'fg-nodo', style: 'cursor:' + (o.clic ? 'pointer' : 'default') }, capaC);
        const rx = o.rx === undefined ? 12 : o.rx, redondo = rx * 2 >= Math.min(bw, bh);
        const r = nodo('rect', { x, y, width: bw, height: bh, rx, 'stroke-width': 2 }, g);
        /* franja superior de color: el encabezado del nodo */
        const franja = redondo ? null : nodo('rect', { x: x + 1, y: y + 1, width: bw - 2, height: Math.min(8, bh / 6), rx: Math.min(rx, 6) }, g);
        const pins = redondo || bh < 40 ? [] : [nodo('circle', { cx: x, cy: y + bh / 2, r: 5.5, 'stroke-width': 2 }, g), nodo('circle', { cx: x + bw, cy: y + bh / 2, r: 5.5, 'stroke-width': 2 }, g)];
        const t = nodo('text', { x: x + bw / 2, y: y + bh / 2 + (franja ? 2 : 0), 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': o.tam || 24, 'font-weight': 700 }, g);
        const sub = o.sub ? nodo('text', { x: x + bw / 2, y: y + bh / 2 + (o.tam || 24) * .95, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': (o.tam || 24) * .72 }, g) : null;
        if (sub) { t.setAttribute('y', y + bh / 2 - (o.tam || 24) * .4 + 2); sub.textContent = o.sub; }
        t.textContent = txt;
        const c = { g, x, y, w: bw, h: bh, cx: x + bw / 2, cy: y + bh / 2,
          tono(n) { const k = TONO[n] || TONO.base; r.setAttribute('fill', k.f); r.setAttribute('stroke', k.s); t.setAttribute('fill', k.t); if (sub) { sub.setAttribute('fill', k.t); sub.setAttribute('opacity', .85); } if (franja) { franja.setAttribute('fill', k.p); franja.setAttribute('opacity', n === 'on' || n === 'paper' ? .0 : .9); } pins.forEach(p => { p.setAttribute('fill', '#0d0d0e'); p.setAttribute('stroke', k.p); }); c._t = n; return c; },
          rotulo(s) { t.textContent = s; return c; }, sub(s) { if (sub) sub.textContent = s; return c; },
          ver(v) { g.style.display = v ? '' : 'none'; return c; },
          mover(nx, ny) { g.setAttribute('transform', `translate(${nx - x} ${ny - y})`); c.cx = nx + bw / 2; c.cy = ny + bh / 2; return c; },
          clic(fn) { g.style.cursor = 'pointer'; g.setAttribute('tabindex', 0); g.setAttribute('role', 'button'); g.addEventListener('click', fn); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); fn(e); } }); return c; } };
        if (o.clic) c.clic(o.clic);
        return c.tono(o.tono || 'base');
      },
      /* a y b: cajas o puntos [x, y]. El cable sale y llega al borde de cada caja y se dibuja al aparecer. */
      flecha(a, b, o) {
        o = o || {};
        const pa = Array.isArray(a) ? { cx: a[0], cy: a[1], w: 0, h: 0 } : a, pb = Array.isArray(b) ? { cx: b[0], cy: b[1], w: 0, h: 0 } : b;
        const dx = pb.cx - pa.cx, dy = pb.cy - pa.cy, L = Math.hypot(dx, dy) || 1;
        const corte = (p, s) => { if (!p.w) return [p.cx, p.cy]; const t = Math.min((p.w / 2 + 8) / Math.abs(dx || 1e-6), (p.h / 2 + 8) / Math.abs(dy || 1e-6)); return [p.cx + dx * t * s, p.cy + dy * t * s]; };
        const d = o.desvio || 0, ox = -dy / L * d, oy = dx / L * d;
        const p1 = corte(pa, 1), p2 = corte(pb, -1);
        const ln = nodo('line', { x1: p1[0] + ox, y1: p1[1] + oy, x2: p2[0] + ox, y2: p2[1] + oy, 'stroke-width': o.grosor || 3, 'stroke-linecap': 'round' }, capaL);
        if (o.puntos) ln.setAttribute('stroke-dasharray', '8 8');
        else if (!quieto()) { ln.setAttribute('pathLength', 1); ln.classList.add('fg-dibuja'); }
        let tx = null;
        if (o.rotulo) { tx = nodo('text', { x: (p1[0] + p2[0]) / 2 + ox + (o.rx || 0), y: (p1[1] + p2[1]) / 2 + oy - 12 + (o.ry || 0), 'text-anchor': 'middle', 'font-size': o.tam || 21, 'font-weight': 600, 'paint-order': 'stroke', stroke: C.ink, 'stroke-width': 6, 'stroke-linejoin': 'round' }, capaL); tx.textContent = o.rotulo; }
        const f = { ln,
          tono(n) { const k = LINEA[n] ? n : 'base'; ln.setAttribute('stroke', LINEA[k]); ln.setAttribute('marker-end', `url(#${id}-${k})`); if (tx) tx.setAttribute('fill', k === 'base' ? C.soft : LINEA[k]); return f; },
          ver(v) { ln.style.display = v ? '' : 'none'; if (tx) tx.style.display = v ? '' : 'none'; return f; },
          rotulo(s) { if (tx) tx.textContent = s; return f; } };
        return f.tono(o.tono || 'base');
      },
      texto(x, y, s, o) {
        o = o || {};
        const t = nodo('text', { x, y, 'text-anchor': o.ancla || 'middle', 'dominant-baseline': 'central', 'font-size': o.tam || 22, 'font-weight': o.peso || 600, fill: C[o.tono] || o.color || C.soft }, capaC);
        t.textContent = s;
        return { t, pon(v) { t.textContent = v; return this; }, color(c) { t.setAttribute('fill', C[c] || c); return this; }, ver(v) { t.style.display = v ? '' : 'none'; return this; } };
      },
      circulo(x, y, r, o) { o = o || {}; const c = nodo('circle', { cx: x, cy: y, r, fill: C[o.tono] || o.color || C.yellow, stroke: o.borde || 'none', 'stroke-width': 3 }, capaC); return { c, mover(nx, ny) { c.setAttribute('cx', nx); c.setAttribute('cy', ny); return this; }, color(k) { c.setAttribute('fill', C[k] || k); return this; }, ver(v) { c.style.display = v ? '' : 'none'; return this; } }; },
      linea(x1, y1, x2, y2, o) { o = o || {}; return nodo('line', { x1, y1, x2, y2, stroke: C[o.tono] || o.color || 'rgba(255,255,255,.18)', 'stroke-width': o.grosor || 2, 'stroke-dasharray': o.puntos ? '6 8' : '' }, capaL); },
      trazo(d, o) { o = o || {}; return nodo('path', { d, fill: 'none', stroke: C[o.tono] || o.color || C.yellow, 'stroke-width': o.grosor || 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, capaL); }
    };
    return api;
  }

  function controles(el) {
    const bar = document.createElement('div'); bar.className = 'ctl'; el.appendChild(bar);
    return {
      el: bar,
      boton(txt, fn, sec) { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; if (sec) b.className = 'sec'; b.onclick = fn; bar.appendChild(b); return b; },
      /* grupo de opciones excluyentes; fn(indice) */
      opciones(lista, fn, inicial) {
        const g = document.createElement('div'); g.className = 'seg'; g.setAttribute('role', 'group'); bar.appendChild(g);
        const bs = lista.map((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.setAttribute('aria-pressed', i === (inicial || 0)); b.onclick = () => { bs.forEach(x => x.setAttribute('aria-pressed', x === b)); fn(i); }; g.appendChild(b); return b; });
        return { elegir(i) { bs[i].click(); } };
      },
      deslizador(txt, min, max, val, paso, fn, fmt) {
        const l = document.createElement('label'), inp = document.createElement('input'), o = document.createElement('span');
        inp.type = 'range'; inp.min = min; inp.max = max; inp.value = val; inp.step = paso || 1; o.className = 'out';
        const pinta = () => { o.textContent = fmt ? fmt(+inp.value) : inp.value; };
        inp.oninput = () => { pinta(); fn(+inp.value); }; pinta();
        l.append(txt + ' ', inp, o); bar.appendChild(l); return inp;
      },
      casilla(txt, fn, marcada) { const l = document.createElement('label'), inp = document.createElement('input'); inp.type = 'checkbox'; inp.checked = !!marcada; inp.onchange = () => fn(inp.checked); l.append(inp, ' ' + txt); bar.appendChild(l); return inp; },
      salida() { const o = document.createElement('span'); o.className = 'out'; bar.appendChild(o); return s => { o.textContent = s; }; }
    };
  }
  /* frase de veredicto bajo la figura */
  function dice(el, inicial) { const d = document.createElement('div'); d.className = 'dice'; d.setAttribute('aria-live', 'polite'); d.innerHTML = inicial || ''; el.appendChild(d); return (s, tono) => { d.innerHTML = s; d.className = 'dice ' + (tono || ''); }; }
  function registro(el) { const d = document.createElement('div'); d.className = 'log'; d.setAttribute('role', 'log'); el.appendChild(d); return s => { d.textContent += (d.textContent ? '\n' : '') + s; d.scrollTop = d.scrollHeight; }; }

  /* ---------- grafo de temas ----------
     o = { nodos: [{ id, t, s?, tipo?, d? }], cables: [[desde, hasta, 'datos'|'evento'|'llamada']], ficha?: true, animar?: true, todos?: false, alElegir?: fn }
     tipo de nodo: idea · patron · codigo · practica · riesgo · semana. Se acomoda solo por capas, de izquierda a derecha. */
  const TIPO = { idea: [C.slate, 'Idea'], patron: [C.violet, 'Patrón'], codigo: [C.teal, 'Código'], practica: [C.amber, 'Práctica'], riesgo: [C.rose, 'Riesgo'], semana: ['#8a8a90', 'Semana'] };
  const CABLE = { datos: C.teal, evento: C.amber, llamada: C.slate };
  /* parte un texto en tspans de hasta 'lineas' renglones dentro de maxW; si no cabe, baja la letra hasta 'min' */
  function envolver(t, texto, x, cy, maxW, lineas, tam, min, alto) {
    for (let f = tam; f >= min; f--) {
      t.textContent = ''; t.setAttribute('font-size', f);
      const pal = texto.split(' '), filas = []; let cur = '';
      const mide = s2 => { t.textContent = s2; const w = t.getComputedTextLength ? t.getComputedTextLength() : s2.length * f * .55; t.textContent = ''; return w; };
      pal.forEach(p => { const prueba = cur ? cur + ' ' + p : p; if (mide(prueba) <= maxW || !cur) cur = prueba; else { filas.push(cur); cur = p; } });
      if (cur) filas.push(cur);
      if ((filas.length <= lineas && filas.every(r => mide(r) <= maxW)) || f === min) {
        const lh = f * (alto || 1.12), y0 = cy - (filas.length - 1) * lh / 2;
        filas.slice(0, lineas).forEach((r, k) => { const ts = nodo('tspan', { x, y: y0 + k * lh }, t); ts.textContent = k === lineas - 1 && filas.length > lineas ? r + '…' : r; });
        return;
      }
    }
  }
  /* en pantallas angostas el grafo se vuelve una lista de nodos en orden, legible con la letra normal */
  function listaGrafo(el, N, byId) {
    el.classList.add('grafo', 'glista');
    const ol = document.createElement('ol'); ol.className = 'gl';
    ol.innerHTML = N.slice().sort((a, b) => a.capa - b.capa).map(n => `<li class="gl-${n.tipo || 'idea'}"><b>${n.t}</b><span>${n.s || ''}</span>${n.d ? `<p>${n.d}</p>` : ''}${n.ent.length ? `<small>Se apoya en: ${n.ent.map(c => byId[c[0]].t).join(' · ')}</small>` : ''}</li>`).join('');
    el.appendChild(ol);
    return () => {};
  }
  function grafo(el, o) {
    const N = o.nodos, E = o.cables || [], byId = {};
    N.forEach(n => { byId[n.id] = n; n.capa = 0; n.ent = []; n.sal = []; });
    E.forEach(c => { if (byId[c[0]] && byId[c[1]]) { byId[c[0]].sal.push(c); byId[c[1]].ent.push(c); } });
    for (let it = 0; it < N.length; it++) E.forEach(c => { const a = byId[c[0]], b = byId[c[1]]; if (a && b && b.capa < a.capa + 1) b.capa = a.capa + 1; });
    const capas = []; N.forEach(n => (capas[n.capa] = capas[n.capa] || []).push(n));
    if (el.clientWidth && el.clientWidth < 640) return listaGrafo(el, N, byId);
    const MX = 34, MY = 30, NH = 132, PY = 99, GAPY = 34, Wt = o.ancho || 1500, NW = o.nw || Math.min(300, Math.floor((Wt - MX * 2 - (capas.length - 1) * 58) / capas.length));
    const filas = Math.max(...capas.map(c => c.length));
    const W = o.ancho || 1500, H = Math.max(o.alto || 0, MY * 2 + filas * NH + (filas - 1) * GAPY);
    const paso = capas.length > 1 ? (W - MX * 2 - NW) / (capas.length - 1) : 0;
    capas.forEach((c, i) => { const alto = c.length * NH + (c.length - 1) * GAPY, y0 = (H - alto) / 2; c.forEach((n, j) => { n.x = MX + i * paso; n.y = y0 + j * (NH + GAPY); }); });
    el.classList.add('grafo');
    const svg = nodo('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet' }, el);
    svg.style.aspectRatio = W + ' / ' + H;
    svg.setAttribute('aria-label', 'Mapa de temas: ' + N.map(n => n.t).join(', '));
    const gC = nodo('g', {}, svg), gN = nodo('g', {}, svg), gP = nodo('g', {}, svg);
    const timers = [], anim = o.animar !== false && !quieto();
    const cab = E.map(c => {
      const a = byId[c[0]], b = byId[c[1]]; if (!a || !b) return null;
      const x1 = a.x + NW, y1 = a.y + PY, x2 = b.x, y2 = b.y + PY, m = Math.max(60, (x2 - x1) / 2);
      const d = `M${x1} ${y1} C${x1 + m} ${y1} ${x2 - m} ${y2} ${x2} ${y2}`;
      const p = nodo('path', { d, fill: 'none', stroke: CABLE[c[2]] || C.slate, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .85 }, gC);
      if (anim) { p.setAttribute('pathLength', 1); p.style.strokeDasharray = 1; p.style.strokeDashoffset = 1; }
      return { c, p, d, a, b };
    }).filter(Boolean);
    const caja = N.map(n => {
      const col = (TIPO[n.tipo] || TIPO.idea)[0];
      const g = nodo('g', { class: 'gnodo', tabindex: 0, role: 'button', style: 'cursor:pointer' }, gN);
      nodo('rect', { x: n.x, y: n.y, width: NW, height: NH, rx: 12, fill: C.node, stroke: C.edge, 'stroke-width': 2 }, g);
      nodo('path', { d: `M${n.x + 1} ${n.y + 12}a11 11 0 0 1 11 -11h${NW - 24}a11 11 0 0 1 11 11v54h-${NW - 2}z`, fill: col, opacity: .3 }, g);
      nodo('rect', { x: n.x + 1, y: n.y + 66, width: NW - 2, height: 2, fill: col, opacity: .7 }, g);
      nodo('rect', { x: n.x + 14, y: n.y + 27, width: 9, height: 9, rx: 2, fill: col }, g);
      const t = nodo('text', { 'dominant-baseline': 'central', 'font-weight': 700, fill: '#fff' }, g);
      envolver(t, n.t, n.x + 32, n.y + 33, NW - 46, 2, 25, 22, 1.08);
      const s = nodo('text', { 'dominant-baseline': 'central', fill: '#c4c4c8' }, g);
      envolver(s, n.s || (TIPO[n.tipo] || TIPO.idea)[1], n.x + 16, n.y + PY, NW - 32, 2, 21, 20, 1.15);
      const pinIn = nodo('circle', { cx: n.x, cy: n.y + PY, r: 7, fill: '#0d0d0e', stroke: col, 'stroke-width': 2.5 }, g);
      const pinOut = nodo('circle', { cx: n.x + NW, cy: n.y + PY, r: 7, fill: n.sal.length ? col : '#0d0d0e', stroke: col, 'stroke-width': 2.5 }, g);
      if (!n.ent.length) pinIn.style.display = 'none';
      if (!n.sal.length) pinOut.style.display = 'none';
      const elige = () => elegir(n.id);
      g.addEventListener('click', elige); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); elige(); } });
      if (anim) { g.style.opacity = 0; g.style.transform = 'translateX(-14px)'; g.style.transition = 'opacity .5s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1)'; }
      return { n, g };
    });
    /* se arma por capas: aparecen los nodos y después se dibujan sus cables; luego corre un pulso por cada cable */
    const T = 380;
    if (anim) {
      caja.forEach(k => timers.push(setTimeout(() => { k.g.style.opacity = 1; k.g.style.transform = 'none'; }, 150 + k.n.capa * T + k.n.y / 8)));
      cab.forEach(k => timers.push(setTimeout(() => { k.p.style.transition = 'stroke-dashoffset .7s cubic-bezier(.65,0,.35,1)'; k.p.style.strokeDashoffset = 0; }, 150 + k.b.capa * T - 120)));
      timers.push(setTimeout(pulsos, 150 + capas.length * T + 500));
    } else pulsos();
    function pulsos() {
      if (quieto()) return;
      cab.forEach((k, i) => { const dot = nodo('circle', { r: 4.5, fill: CABLE[k.c[2]] || C.slate }, gP); const am = nodo('animateMotion', { dur: (2.2 + (i % 3) * .4) + 's', repeatCount: 'indefinite', path: k.d, begin: (i * .23) + 's' }, dot); am.beginElement && setTimeout(() => { try { am.beginElement(); } catch (e) { /* sin SMIL */ } }, 0); });
    }
    let ficha = null;
    if (o.ficha !== false) { ficha = document.createElement('div'); ficha.className = 'grafo-ficha'; ficha.setAttribute('aria-live', 'polite'); el.appendChild(ficha); }
    function elegir(id) {
      const n = byId[id];
      caja.forEach(k => { const sel = k.n.id === id, vec = n.ent.some(c => c[0] === k.n.id) || n.sal.some(c => c[1] === k.n.id); k.g.querySelector('rect').setAttribute('stroke', sel ? C.amber : C.edge); k.g.style.opacity = sel || vec ? 1 : .55; });
      cab.forEach(k => { k.p.setAttribute('opacity', k.a.id === id || k.b.id === id ? 1 : .3); k.p.setAttribute('stroke-width', k.a.id === id || k.b.id === id ? 4 : 3); });
      if (ficha) {
        const ant = n.ent.map(c => byId[c[0]].t), sig = n.sal.map(c => byId[c[1]].t);
        ficha.innerHTML = `<div><b>${n.t}</b><span class="rf-s">${(TIPO[n.tipo] || TIPO.idea)[1]}</span><p>${n.d || n.s || ''}</p></div><div>${ant.length ? `<span class="rf-k">Se apoya en</span><p>${ant.join(' · ')}</p>` : ''}${sig.length ? `<span class="rf-k">Alimenta a</span><p>${sig.join(' · ')}</p>` : ''}${!ant.length && !sig.length ? '<p>Toca otro nodo para ver cómo se conecta.</p>' : ''}</div>`;
      }
      if (o.alElegir) o.alElegir(id);
    }
    function reset() { caja.forEach(k => { k.g.querySelector('rect').setAttribute('stroke', C.edge); if (!anim || k.g.style.opacity !== '0') k.g.style.opacity = 1; }); cab.forEach(k => { k.p.setAttribute('opacity', .85); k.p.setAttribute('stroke-width', 3); }); }
    if (ficha) ficha.innerHTML = `<div><p>Cada nodo es un tema. Un cable va de lo que necesitas saber primero a lo que se construye encima. Toca un nodo para ver su resumen y de qué depende.</p></div><div><p class="leyenda"><span style="color:${C.teal}"><i class="dot"></i>datos</span> <span style="color:${C.amber}"><i class="dot"></i>eventos</span> <span style="color:${C.slate}"><i class="dot"></i>se apoya en</span></p></div>`;
    if (o.sel) timers.push(setTimeout(() => elegir(o.sel), anim ? 150 + capas.length * T + 300 : 0));
    return () => { timers.forEach(clearTimeout); reset; };
  }

  /* ---------- ruta del curso: las 8 semanas como nodos agrupados por fase ---------- */
  function ruta(el, o) {
    o = o || {};
    const CU = window.CURSO; if (!CU) { el.textContent = 'Falta data/curso.js'; return () => {}; }
    const S = CU.semanas, act = o.actual || 0;
    el.classList.add('ruta');
    if (el.clientWidth && el.clientWidth < 640) {
      el.classList.add('glista');
      const ol = document.createElement('ol'); ol.className = 'gl';
      ol.innerHTML = S.map(s2 => `<li class="gl-${s2.n === act ? 'practica' : act && s2.n < act ? 'codigo' : 'idea'}"><b>Semana ${s2.n} · ${s2.corto}</b><span>${s2.fase} · ${s2.fechaTxt}${s2.peso ? ' · entrega ' + s2.peso : ''}</span>${s2.n === act ? `<p>${s2.pregunta}</p>` : ''}</li>`).join('');
      el.appendChild(ol); return () => {};
    }
    const W = 1500, H = 330, NW = 158, NH = 128, X = i => 34 + i * ((W - 68 - NW) / 7), Y = i => (i % 2 ? 166 : 120);
    const f = lienzo(el, W, H), anim = !quieto(), timers = [];
    const fases = CU.fases.map(fa => { const ns = S.filter(s => s.fase === fa[0]).map(s => s.n - 1); return { t: fa[0], a: Math.min(...ns), b: Math.max(...ns) }; });
    /* cajas de comentario, como en un editor de nodos */
    fases.forEach((fa, j) => {
      const x1 = X(fa.a) - 14, x2 = X(fa.b) + NW + 14;
      f.nodo('rect', { x: x1, y: 18, width: x2 - x1, height: H - 30, rx: 14, fill: 'rgba(255,255,255,.025)', stroke: 'rgba(255,255,255,.10)', 'stroke-width': 1.5 });
      f.texto(x1 + 16, 42, fa.t, { tam: fa.b > fa.a ? 20 : 17, peso: 700, color: '#97979c', ancla: 'start' });
    });
    for (let i = 0; i < S.length - 1; i++) {
      const x1 = X(i) + NW, y1 = Y(i) + NH / 2 + 10, x2 = X(i + 1), y2 = Y(i + 1) + NH / 2 + 10, m = (x2 - x1) / 2 + 14;
      const p = f.trazo(`M${x1} ${y1} C${x1 + m} ${y1} ${x2 - m} ${y2} ${x2} ${y2}`, { color: act && i + 1 < act ? C.teal : 'rgba(190,200,220,.45)', grosor: 3.5 });
      if (anim) { p.setAttribute('pathLength', 1); p.style.strokeDasharray = 1; p.style.strokeDashoffset = 1; timers.push(setTimeout(() => { p.style.transition = 'stroke-dashoffset .5s ease'; p.style.strokeDashoffset = 0; }, 200 + i * 110)); }
    }
    const gs = S.map((s, i) => {
      const x = X(i), y = Y(i), hoy = s.n === act, hecha = act && s.n < act, col = hoy ? C.amber : hecha ? C.teal : C.slate;
      const g = f.nodo('g', { tabindex: 0, role: 'button', style: 'cursor:pointer' });
      f.nodo('rect', { x, y, width: NW, height: NH, rx: 12, fill: hoy ? '#2a2417' : C.node, stroke: hoy ? C.amber : C.edge, 'stroke-width': hoy ? 2.5 : 2 }, g);
      f.nodo('path', { d: `M${x + 1} ${y + 12}a11 11 0 0 1 11 -11h${NW - 24}a11 11 0 0 1 11 11v24h-${NW - 2}z`, fill: col, opacity: hoy ? .4 : .2 }, g);
      const t1 = f.nodo('text', { x: x + 14, y: y + 19, 'dominant-baseline': 'central', 'font-size': 17, 'font-weight': 700, fill: col, 'font-family': 'JetBrains Mono, monospace' }, g); t1.textContent = 'S' + s.n + (hoy ? ' · hoy' : '');
      /* el nombre corto cabe en una línea o se parte en dos por el espacio más cercano al centro */
      const t2 = f.nodo('text', { x: x + 14, y: y + 62, 'dominant-baseline': 'central', 'font-size': 20, 'font-weight': 700, fill: '#fff' }, g); t2.textContent = s.corto;
      if (t2.getComputedTextLength && t2.getComputedTextLength() > NW - 26 && s.corto.includes(' ')) {
        const sp = [...s.corto].map((ch, k) => ch === ' ' ? k : -1).filter(k => k > 0).sort((a, b) => Math.abs(a - s.corto.length / 2) - Math.abs(b - s.corto.length / 2))[0];
        t2.textContent = ''; [s.corto.slice(0, sp), s.corto.slice(sp + 1)].forEach((ln, k) => { const ts = f.nodo('tspan', { x: x + 14, dy: k ? 23 : -11 }, t2); ts.textContent = ln; });
      }
      while (t2.getComputedTextLength && t2.getComputedTextLength() > (t2.childNodes.length > 1 ? 2 : 1) * (NW - 26) && +t2.getAttribute('font-size') > 15) t2.setAttribute('font-size', +t2.getAttribute('font-size') - 1);
      const t3 = f.nodo('text', { x: x + 14, y: y + 96, 'dominant-baseline': 'central', 'font-size': 15, fill: s.peso ? C.amber : '#97979c', 'font-family': 'JetBrains Mono, monospace' }, g); t3.textContent = s.peso ? 'entrega ' + s.peso : s.fechaTxt.replace('Jueves ', 'jue ').replace('Semana ', '');
      if (i > 0) f.nodo('circle', { cx: x, cy: y + NH / 2 + 10, r: 6, fill: '#0d0d0e', stroke: col, 'stroke-width': 2.5 }, g);
      if (i < S.length - 1) f.nodo('circle', { cx: x + NW, cy: y + NH / 2 + 10, r: 6, fill: hecha || hoy ? col : '#0d0d0e', stroke: col, 'stroke-width': 2.5 }, g);
      g.addEventListener('click', () => elegir(s.n)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(s.n); } });
      if (anim) { g.style.opacity = 0; g.style.transform = 'translateY(10px)'; g.style.transition = 'opacity .45s ease, transform .55s cubic-bezier(.16,1,.3,1)'; timers.push(setTimeout(() => { g.style.opacity = 1; g.style.transform = 'none'; }, 80 + i * 110)); }
      return g;
    });
    f.svg.setAttribute('aria-label', 'Ruta del curso: ocho semanas en cinco fases. Toca una semana para ver su pregunta y su analogía.');
    let ficha = null;
    if (o.ficha !== false) { ficha = document.createElement('div'); ficha.className = 'ruta-ficha'; ficha.setAttribute('aria-live', 'polite'); el.appendChild(ficha); }
    function elegir(n) {
      const s = S[n - 1];
      gs.forEach((g, i) => g.querySelector('rect').setAttribute('stroke-dasharray', i === n - 1 && n !== act ? '6 5' : ''));
      gs.forEach((g, i) => { if (i === n - 1 && n !== act) g.querySelector('rect').setAttribute('stroke', C.text); else if (i + 1 !== act) g.querySelector('rect').setAttribute('stroke', C.edge); });
      const ant = S[n - 2], sig = S[n], dep = `${ant ? `Se apoya en la semana ${ant.n}: ${ant.titulo.charAt(0).toLowerCase() + ant.titulo.slice(1)}.` : 'Es el punto de partida del curso.'} ${sig ? `Habilita la semana ${sig.n}: ${sig.titulo.charAt(0).toLowerCase() + sig.titulo.slice(1)}.` : 'Cierra el curso.'}`;
      if (ficha) ficha.innerHTML = `<div><b>${s.titulo}</b><span class="rf-s">Semana ${s.n} · ${s.fase} · ${s.fechaTxt}${s.n === act ? ' · esta semana' : ''}</span><p>${n === act ? dep : s.pregunta}</p></div>` +
        `<div><span class="rf-k">Analogía</span><p>${s.analogia.charAt(0).toUpperCase() + s.analogia.slice(1)}</p><span class="rf-k">Herramientas</span><p>${s.herramientas}</p>${s.entrega ? `<span class="rf-k">Entrega</span><p>${s.entrega}</p>` : ''}</div>`;
      if (o.alElegir) o.alElegir(n);
    }
    elegir(o.sel || act || 1);
    return () => timers.forEach(clearTimeout);
  }

  window.FIG = { C, lienzo, controles, dice, registro, ruta, grafo };
})();
