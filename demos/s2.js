/* Figuras de la semana 2. Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   enchufe, cajones, listas, navaja, solid, herencia y heredar usan FIG (assets/fig.js). acoplamiento y composicion son canvas. */
window.DEMOS = window.DEMOS || {};

/* 1 · Cables soldados contra toma estándar */
window.DEMOS.enchufe = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const pared = f.caja(30, 90, 190, 250, 'Pared', { tam: 30 });
  const toma = f.caja(365, 165, 180, 100, 'Toma', { tam: 30, tono: 'on' });
  const N = ['Licuadora', 'Lámpara', 'Cargador'];
  const ap = N.map((n, i) => f.caja(670, 30 + i * 135, 200, 100, n, { tam: 26 }));
  const sold = ap.map(a => f.flecha(pared, a, { grosor: 5 }));
  const aToma = f.flecha(pared, toma), conecta = ap.map(a => f.flecha(a, toma));
  const letrero = f.texto(445, 405, '', { tam: 22 });
  const di = FIG.dice(el);
  let modo = 0;
  function base() {
    pared.tono('base'); toma.ver(!!modo).tono('on'); ap.forEach(a => a.tono('base'));
    sold.forEach(x => x.ver(!modo).tono('base')); aToma.ver(!!modo).tono('base'); conecta.forEach(x => x.ver(!!modo).tono('base'));
    letrero.pon(modo ? 'todos conocen la toma, nadie se conoce entre sí' : 'cada cable va soldado a la pared');
  }
  function inicio() { base(); di(modo ? 'Pared y aparatos solo conocen <b>la forma de la toma</b>. Prueba los tres cambios.' : 'Cada aparato está soldado a la pared. Prueba los tres cambios.'); }
  const c = FIG.controles(el);
  c.opciones(['Cables soldados', 'Toma estándar'], i => { modo = i; inicio(); });
  c.boton('Cambiar la licuadora', () => {
    base(); ap[0].tono('on');
    if (!modo) { pared.tono('bad'); sold[0].tono('bad'); di('Hay que <b>romper la pared</b> y soldar de nuevo. Cambió un aparato y la pared tuvo que enterarse.', 'bad'); }
    else { conecta[0].tono('ok'); di('Desconectas una y conectas otra. <b>La pared ni se entera.</b>', 'ok'); }
  });
  c.boton('Remodelar la pared', () => {
    base(); pared.tono('on');
    if (!modo) { ap.forEach(a => a.tono('bad')); sold.forEach(x => x.tono('bad')); di('Los <b>tres aparatos</b> quedan sin corriente hasta que alguien vuelva a soldarlos.', 'bad'); }
    else { aToma.tono('ok'); di('Mientras la toma conserve su forma, <b>ningún aparato nota el cambio</b>.', 'ok'); }
  });
  c.boton('Cambiar la forma de la toma', () => {
    base();
    if (!modo) { di('Aquí no hay toma: cada cable es un caso especial. Pasa a «Toma estándar» y repite.'); return; }
    toma.tono('bad'); pared.tono('bad'); ap.forEach(a => a.tono('bad')); conecta.forEach(x => x.tono('bad')); aToma.tono('bad');
    di('El acuerdo sí es delicado: si cambia, <b>todos cambian</b>. Por eso una interfaz es pequeña y estable.', 'bad');
  });
  inicio();
};

/* 2 · Seis módulos de Turno Nocturno: toca uno y mira qué se rompe (canvas) */
window.DEMOS.acoplamiento = function (el) {
  const INK = '#0d0d0e', COB = '#2b2b30', YEL = '#e2a54a', COR = '#e0706a', GRE = '#2e7653';
  const N = ['Entrada', 'Robot', 'Chispas', 'Bichos', 'Puntaje', 'Sonido'];
  const POS = [[130, 70], [450, 60], [770, 70], [770, 350], [450, 360], [130, 350]];
  // [quién conoce, a quién, pasa por enchufe]
  const ESPAGUETI = [[0, 1], [0, 2], [0, 5], [1, 3], [1, 5], [1, 4], [3, 1], [3, 4], [3, 5], [2, 3], [2, 5], [2, 4], [4, 3], [4, 5]].map(e => [e[0], e[1], false]);
  const LIMPIO = [[0, 1, false], [1, 2, false], [2, 3, true], [5, 3, true], [4, 3, true]];
  const BW = 190, BH = 78;

  el.insertAdjacentHTML('beforeend', '<canvas width="900" height="420" tabindex="0" aria-label="Grafo de seis módulos de Turno Nocturno y sus dependencias. Toca un módulo para cambiarlo."></canvas>');
  const cv = el.querySelector('canvas'), g = cv.getContext('2d');
  const c = FIG.controles(el);
  let limpio = false, sel = -1;
  c.casilla('Con interfaces y eventos', v => { limpio = v; draw(); });
  c.boton('Siguiente módulo', () => { sel = (sel + 1) % N.length; draw(); }, true);
  const sal = c.salida(), di = FIG.dice(el);
  const edges = () => (limpio ? LIMPIO : ESPAGUETI);

  function borde(a, b) {           // punto donde la recta a->b sale de la caja de a
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.min((BW / 2 + 6) / Math.abs(dx || 1e-6), (BH / 2 + 6) / Math.abs(dy || 1e-6));
    return [a[0] + dx * t, a[1] + dy * t];
  }
  function flecha(a, b, color, dash, w) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const ox = -dy / L * 9, oy = dx / L * 9;                 // separa las flechas de ida y vuelta
    const p = borde(a, b), q = borde(b, a);
    const x1 = p[0] + ox, y1 = p[1] + oy, x2 = q[0] + ox, y2 = q[1] + oy, an = Math.atan2(y2 - y1, x2 - x1);
    g.strokeStyle = color; g.fillStyle = color; g.lineWidth = w; g.setLineDash(dash ? [10, 8] : []);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.moveTo(x2, y2);
    g.lineTo(x2 - 16 * Math.cos(an - .42), y2 - 16 * Math.sin(an - .42));
    g.lineTo(x2 - 16 * Math.cos(an + .42), y2 - 16 * Math.sin(an + .42)); g.closePath(); g.fill();
    if (dash) { g.fillStyle = YEL; g.fillRect(x2 - 8 + 11 * Math.cos(an), y2 - 8 + 11 * Math.sin(an), 16, 16); }   // el enchufe
  }
  function caja(i, fill, stroke, txt, sub) {
    const x = POS[i][0] - BW / 2, y = POS[i][1] - BH / 2;
    g.fillStyle = fill; g.strokeStyle = stroke; g.lineWidth = 3;
    g.beginPath();
    if (g.roundRect) g.roundRect(x, y, BW, BH, 14); else g.rect(x, y, BW, BH);
    g.fill(); g.stroke();
    g.fillStyle = txt; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 ' + (sub ? 25 : 28) + 'px "Atkinson Hyperlegible Next", sans-serif'; g.fillText(N[i], POS[i][0], POS[i][1] - (sub ? 15 : 0));
    if (sub) { g.font = '600 24px "Atkinson Hyperlegible Next", sans-serif'; g.fillText(sub, POS[i][0], POS[i][1] + 16); }
  }
  function draw() {
    const E = edges(), rotos = [], prot = [];
    if (sel >= 0) E.forEach(e => { if (e[1] === sel) (e[2] ? prot : rotos).push(e[0]); });
    g.clearRect(0, 0, cv.width, cv.height);
    E.forEach(e => {
      const hit = e[1] === sel;
      flecha(POS[e[0]], POS[e[1]], hit ? (e[2] ? '#8fd3ab' : COR) : 'rgba(255,255,255,.4)', e[2], hit ? 5 : 2.5);
    });
    N.forEach((_, i) => {
      if (i === sel) caja(i, YEL, '#fff', INK, 'cambia');
      else if (rotos.indexOf(i) >= 0) caja(i, COR, '#fff', '#fff', 'se rompe');
      else if (prot.indexOf(i) >= 0) caja(i, GRE, '#fff', '#fff', 'protegido');
      else caja(i, COB, 'rgba(255,255,255,.55)', '#fff', '');
    });
    sal(E.length + ' flechas');
    if (sel < 0) { di('Una flecha de A hacia B significa «A conoce a B». <b>Toca el módulo que vas a cambiar.</b>'); return; }
    let t = 'Cambias <b>' + N[sel] + '</b> por dentro. ';
    t += rotos.length ? (rotos.length === 1 ? 'Se rompe 1: ' : 'Se rompen ' + rotos.length + ': ') + rotos.map(i => N[i]).join(', ') + '.' : 'No se rompe ningún otro módulo.';
    if (prot.length) t += ' Protegidos por el enchufe: ' + prot.map(i => N[i]).join(', ') + '.';
    di(t, rotos.length ? 'bad' : 'ok');
  }
  cv.style.cursor = 'pointer';
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height;
    for (let i = 0; i < N.length; i++) if (Math.abs(x - POS[i][0]) <= BW / 2 && Math.abs(y - POS[i][1]) <= BH / 2) { sel = i === sel ? -1 : i; draw(); return; }
  });
  draw();
  let alive = true;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (alive) draw(); });
  return () => { alive = false; };
};

/* 3 · Cohesión: el cajón de cubiertos y el cajón de sastre */
window.DEMOS.cajones = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const NOM = [['Tenedor', 'Cuchara', 'Cuchillo', 'Martillo', 'Alicate', 'Tornillos'], ['enemX', 'enemY', 'enemHp', 'Beep()', 'volumen', 'Silenciar()']];
  const BUENO = [['Cubiertos', 'Herramientas'], ['class Bicho', 'class Sonido']], MALO = ['Varios', 'class Utilidades'];
  const DX = [20, 460], cat = [0, 0, 0, 1, 1, 1], donde = [0, 0, 0, 0, 0, 0];
  const marco = DX.map(x => f.nodo('rect', { x, y: 70, width: 420, height: 345, rx: 18, fill: '#1b1b1e', 'stroke-width': 5 }));
  const tit = DX.map(x => f.texto(x + 210, 36, '', { tam: 28, peso: 800 }));
  const it = cat.map((_, i) => f.caja(0, 0, 190, 70, '', { tam: 24, clic: () => { donde[i] = 1 - donde[i]; pinta(); } }));
  const di = FIG.dice(el);
  let modo = 0;
  function pinta() {
    const estado = [0, 1].map(d => {
      const mios = cat.map((_, i) => i).filter(i => donde[i] === d);
      mios.forEach((i, k) => it[i].mover(DX[d] + 13 + (k % 2) * 204, 92 + Math.floor(k / 2) * 106).rotulo(NOM[modo][i]));
      const cats = new Set(mios.map(i => cat[i]));
      const e = !mios.length ? 'vacio' : cats.size > 1 ? 'mezcla' : 'bien';
      tit[d].pon(e === 'vacio' ? '(vacío)' : e === 'mezcla' ? MALO[modo] : BUENO[modo][[...cats][0]]).color(e === 'mezcla' ? '#eb9a94' : e === 'bien' ? '#8fd3ab' : 'soft');
      marco[d].setAttribute('stroke', e === 'mezcla' ? FIG.C.coral : e === 'bien' ? '#66bb87' : 'rgba(255,255,255,.3)');
      mios.forEach(i => it[i].tono(e === 'mezcla' ? 'base' : 'ok'));
      return e;
    });
    if (estado[0] === 'bien' && estado[1] === 'bien') di(modo ? '<b>Alta cohesión.</b> Cada clase se describe en una frase sin usar «y».' : '<b>Alta cohesión.</b> Cada cajón tiene nombre obvio y sabes qué hay antes de abrirlo.', 'ok');
    else di(modo ? 'Una clase que solo se puede llamar <b>Utilidades</b> es un cajón de sastre. Toca una pieza para pasarla a la otra clase.' : 'Un cajón que solo se puede llamar <b>Varios</b>. Toca un objeto para pasarlo al otro cajón.', 'bad');
  }
  const c = FIG.controles(el);
  c.opciones(['En la cocina', 'En el código'], i => { modo = i; pinta(); });
  c.boton('Revolver todo', () => { donde.fill(0); pinta(); }, true);
  pinta();
};

/* 3b · Listas paralelas: olvidar un RemoveAt descuadra a todos los bichos siguientes */
window.DEMOS.listas = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const COL = ['enemX', 'enemY', 'enemTipo', 'enemHp'], X0 = 120, CW = 192, Y0 = 76, RH = 64;
  const INI = [[4, 2, 'lento', 1], [9, 5, 'tanque', 3], [15, 3, 'rapido', 1], [22, 7, 'tanque', 3], [30, 4, 'lento', 1]];
  const head = COL.map((c, j) => f.texto(X0 + j * CW + (CW - 12) / 2, 38, c, { tam: 24, tono: 'white', peso: 800 }));
  const tObj = f.texto(X0 + (4 * CW - 12) / 2, 38, 'List<Bicho> bichos', { tam: 24, tono: 'white', peso: 800 });
  const idx = INI.map((_, i) => f.texto(58, Y0 + i * RH + 26, 'i = ' + i, { tam: 22 }));
  const celda = INI.map((_, i) => COL.map((_, j) => f.caja(X0 + j * CW, Y0 + i * RH, CW - 12, 52, '', { tam: 22, rx: 10 })));
  const fila = INI.map((_, i) => f.caja(X0, Y0 + i * RH, 4 * CW - 12, 52, '', { tam: 22, rx: 10 }));
  const di = FIG.dice(el);
  let modo = 0, cols, objs, borrados = 0;
  const cuadra = (t, hp) => t !== undefined && (t === 'tanque') === (hp === 3);
  function reset() { cols = [0, 1, 2, 3].map(j => INI.map(r => r[j])); objs = INI.map(r => r.slice()); borrados = 0; }
  function pinta() {
    head.forEach(h => h.ver(!modo)); tObj.ver(!!modo);
    const n = modo ? objs.length : cols[3].length;
    idx.forEach((t, i) => t.ver(i < n));
    const malas = [];
    celda.forEach((r, i) => {
      const ok = cuadra(cols[2][i], cols[3][i]);
      if (!modo && i < cols[3].length && !ok) malas.push(i);
      r.forEach((c, j) => { const v = cols[j][i]; c.ver(!modo && v !== undefined); if (v !== undefined) c.rotulo(String(v)).tono(ok ? 'base' : 'bad'); });
    });
    fila.forEach((c, i) => { const o = objs[i]; c.ver(!!modo && !!o); if (o) c.rotulo(`Bicho   x = ${o[0]}   y = ${o[1]}   ${o[2]}   vida ${o[3]}`).tono('ok'); });
    if (modo) {
      di(borrados ? `Se fue el bicho <b>entero</b>. Quedan ${objs.length} y todos cuadran: <b>ese descuido no se puede escribir</b>.` : 'Una sola lista de objetos: cada bicho lleva sus datos juntos. Borra uno y mira.', borrados ? 'ok' : '');
      return;
    }
    if (!borrados) { di('Cuatro listas, un bicho por posición <b>i</b>. Presiona «Borrar el bicho i = 1» con el descuido.'); return; }
    const casos = malas.filter(i => cols[2][i] !== undefined).slice(0, 2).map(i => cols[2][i] === 'tanque' ? `el tanque de i = ${i} muere de un golpe` : `el ${cols[2][i]} de i = ${i} aguanta 3 golpes`);
    di(`Compila y corre. Pero ${malas.length} ${malas.length === 1 ? 'fila quedó descuadrada' : 'filas quedaron descuadradas'}${casos.length ? ': ' + casos.join(' y ') : ''}. <b>Nadie ve un error: el juego solo se siente raro.</b>`, 'bad');
  }
  const c = FIG.controles(el);
  c.opciones(['Cuatro listas', 'List<Bicho>'], i => { modo = i; reset(); pinta(); });
  c.boton('Borrar el bicho i = 1', () => {
    if (modo) { if (objs.length > 1) { objs.splice(1, 1); borrados++; } }
    else if (cols[0].length > 1) { [0, 1, 2].forEach(j => cols[j].splice(1, 1)); borrados++; }   // olvida enemHp
    pinta();
  });
  c.boton('Reiniciar', () => { reset(); pinta(); }, true);
  reset(); pinta();
};

/* 4 · La navaja suiza: una clase que acumula razones para cambiar */
window.DEMOS.navaja = function (el) {
  const f = FIG.lienzo(el, 900, 430), CX = 450, CY = 215;
  const R = ['Teclado', 'Movimiento', 'Colisiones', 'Sonido', 'Puntaje', 'Disco', 'Dibujo', 'Oleadas'];
  const P = [[130, 30], [350, 30], [570, 30], [680, 187], [570, 344], [350, 344], [130, 344], [20, 187]];
  const lin = P.map(p => f.linea(CX, CY, p[0] + 100, p[1] + 28, { color: 'rgba(255,255,255,.6)', grosor: 4 }));
  const chip = R.map((r, i) => f.caja(P[i][0], P[i][1], 200, 56, r, { tam: 24 }));
  const centro = f.caja(290, 165, 320, 100, '', { tam: 28 });
  const di = FIG.dice(el);
  let n = 1, partida = false;
  function pinta() {
    chip.forEach((ch, i) => ch.ver(i < n).tono(partida ? 'ok' : 'on'));
    lin.forEach((l, i) => { l.style.display = i < n && !partida ? '' : 'none'; });
    if (partida) {
      centro.rotulo('Program: coordina').tono('base');
      di(`<b>${n} ${n === 1 ? 'clase' : 'clases'}, una razón para cambiar cada una.</b> Si cambia el sonido, solo se abre Sonido.`, 'ok');
    } else {
      centro.rotulo('Program: ' + n + (n === 1 ? ' razón' : ' razones')).tono(n >= 3 ? 'bad' : 'base');
      di(n === 1 ? 'Una clase con una sola tarea. Hasta aquí todo bien: agrega responsabilidades.'
        : `<b>${n} razones para cambiar</b> la misma clase: ${R.slice(0, n).join(', ').toLowerCase()}. Cada cambio pone en riesgo a los demás.`, n >= 3 ? 'bad' : '');
    }
  }
  const c = FIG.controles(el);
  c.boton('Agregar responsabilidad', () => { if (n < R.length) n++; pinta(); });
  const op = c.opciones(['Una sola clase', 'Clases separadas'], i => { partida = !!i; pinta(); });
  c.boton('Reiniciar', () => { n = 1; op.elegir(0); }, true);
  pinta();
};

/* 5 · S, O y D: un mini caso por letra, sin aplicar y aplicada */
window.DEMOS.solid = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const L = ['S · una razón', 'O · sin editar', 'D · el enchufe'];
  let letra = 0, bien = 0;
  const carta = L.map((t, i) => f.caja(30 + i * 290, 15, 260, 80, t, { tam: 26, clic: () => { letra = i; pinta(); } }));
  const G = [[[], []], [[], []], [[], []]];   // G[letra][modo] = piezas de esa escena
  const en = (l, m, ...x) => { G[l][m].push(...x); return x[0]; };
  // S
  en(0, 0, f.caja(250, 215, 400, 120, 'Program', { tam: 32, tono: 'bad' }), f.texto(450, 170, 'mueve + suena + guarda', { tam: 24, tono: 'white' }));
  ['Bicho', 'Sonido', 'Guardado'].forEach((t, i) => en(0, 1, f.caja(40 + i * 285, 215, 250, 110, t, { tam: 28, tono: 'ok' })));
  // O
  en(1, 0, f.caja(180, 215, 540, 120, 'Bucle con un if por tipo', { tam: 30, tono: 'bad' }), f.texto(450, 170, 'bicho nuevo = editar el bucle', { tam: 24, tono: 'white' }));
  const bu = en(1, 1, f.caja(30, 225, 200, 90, 'Bucle', { tam: 28 })), ia = en(1, 1, f.caja(310, 225, 270, 90, 'IActualizable', { tam: 26, tono: 'on' }));
  const tq = en(1, 1, f.caja(660, 150, 210, 84, 'Tanque', { tam: 26 })), zz = en(1, 1, f.caja(660, 290, 210, 84, 'Zigzag', { tam: 26, tono: 'ok' }));
  en(1, 1, f.flecha(bu, ia), f.flecha(tq, ia), f.flecha(zz, ia, { tono: 'ok' }), f.texto(765, 400, 'clase nueva', { tam: 22 }));
  // D
  const co = en(2, 0, f.caja(60, 225, 260, 90, 'Colisión', { tam: 28 })), be = en(2, 0, f.caja(560, 225, 290, 90, 'Console.Beep', { tam: 26, tono: 'bad' }));
  en(2, 0, f.flecha(co, be, { tono: 'bad', rotulo: 'lo nombra', tam: 22 }));
  const co2 = en(2, 1, f.caja(30, 225, 220, 90, 'Colisión', { tam: 28 })), is = en(2, 1, f.caja(330, 225, 230, 90, 'ISonido', { tam: 26, tono: 'on' }));
  const cs = en(2, 1, f.caja(660, 150, 210, 84, 'Consola', { tam: 26 })), un = en(2, 1, f.caja(660, 290, 210, 84, 'Unity', { tam: 26 }));
  en(2, 1, f.flecha(co2, is), f.flecha(cs, is), f.flecha(un, is));
  const T = [
    ['Sonido, diseño y guardado piden cambios <b>en la misma clase</b>. Tres razones para abrirla.', '<b>S:</b> cada pieza tiene una sola razón para cambiar. ¿Quién me pediría cambiar esta clase?'],
    ['Cada bicho nuevo obliga a <b>editar código que ya funcionaba</b>.', '<b>O:</b> un bicho nuevo es un archivo nuevo. El bucle no se toca.'],
    ['La lógica nombra al aparato. Sin consola no hay juego, ni pruebas.', '<b>D:</b> la lógica depende del enchufe. Consola, Unity o un sonido falso se conectan después.']
  ];
  const di = FIG.dice(el);
  function pinta() {
    carta.forEach((k, i) => k.tono(i === letra ? 'paper' : 'base'));
    G.forEach((g, l) => g.forEach((lista, m) => lista.forEach(x => x.ver(l === letra && m === bien))));
    di(T[letra][bien], bien ? 'ok' : 'bad');
  }
  FIG.controles(el).opciones(['Sin aplicar', 'Aplicada'], i => { bien = i; pinta(); });
  pinta();
};

/* 6 · El árbol de herencia que explota: cada habilidad duplica las clases */
window.DEMOS.herencia = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const H = ['Camina', 'Vuela', 'Nada', 'Dispara', 'Invisible'], CL = ['Caminante', 'Volador', 'Nadador', 'QueDispara', 'Invisible'];
  const th = f.texto(278, 36, '', { tam: 28, tono: 'white', peso: 800 }), tc = f.texto(730, 36, '', { tam: 28, tono: 'white', peso: 800 });
  f.linea(563, 20, 563, 410, { puntos: true });
  const cuad = Array.from({ length: 32 }, (_, i) => f.caja(30 + (i % 8) * 62, 80 + Math.floor(i / 8) * 62, 54, 54, '', { rx: 10, tono: 'bad' }));
  f.texto(278, 372, 'cada cuadro es una clase', { tam: 22 });
  const pieza = H.map((h, i) => f.caja(600, 72 + i * 68, 260, 56, h, { tam: 24, tono: 'on' }));
  const di = FIG.dice(el);
  let n = 1;
  function pinta() {
    const clases = Math.pow(2, n);
    cuad.forEach((q, i) => q.ver(i < clases)); pieza.forEach((p, i) => p.ver(i < n));
    th.pon('Herencia: ' + clases + ' clases'); tc.pon('Piezas: ' + n);
    di(n === 1 ? 'Una habilidad: 2 clases, con y sin ella. Todavía parece buena idea.'
      : `<b>${clases} clases contra ${n} piezas.</b> Una sería Enemigo${CL.slice(0, n).join('')}. Cada habilidad nueva duplica el árbol.`, n >= 3 ? 'bad' : '');
  }
  const c = FIG.controles(el);
  c.boton('Diseño pide otra habilidad', () => { if (n < H.length) n++; pinta(); });
  c.boton('Reiniciar', () => { n = 1; pinta(); }, true);
  pinta();
};

/* 7 · Arma tu bicho con piezas (canvas) */
window.DEMOS.composicion = function (el) {
  const INK = '#0d0d0e', COB = '#2b2b30', YEL = '#e2a54a', COR = '#e0706a', GRE = '#2e7653';
  const C = [
    { k: 'camina', comp: 'Camina', hace: 'va por el piso', clase: 'Caminante' },
    { k: 'vuela', comp: 'Vuela', hace: 'pasa por encima', clase: 'Volador' },
    { k: 'nada', comp: 'Nada', hace: 'cruza el agua', clase: 'Nadador' },
    { k: 'dispara', comp: 'Dispara', hace: 'lanza chispas', clase: 'QueDispara' },
    { k: 'vida', comp: 'TieneVida', hace: 'aguanta 3 golpes', clase: 'ConVida' }
  ];
  const on = { camina: true, vuela: false, nada: false, dispara: false, vida: true };

  el.insertAdjacentHTML('beforeend', '<canvas width="900" height="300" aria-label="Bicho armado con los componentes activos"></canvas>');
  const cv = el.querySelector('canvas'), g = cv.getContext('2d');
  const ctl = FIG.controles(el);
  C.forEach(c => ctl.casilla(c.comp, v => { on[c.k] = v; texto(); }, on[c.k]));
  const di = FIG.dice(el);
  let t = 0, raf = 0, alive = true, last = performance.now();

  function texto() {
    const act = C.filter(c => on[c.k]);
    if (!act.length) { di('Sin piezas, la entidad es una bolsa vacía: no hace nada.'); return; }
    di(`Con piezas: <b>${act.length} de 5</b>, ninguna clase nueva. Con herencia: <b>class Enemigo${act.map(c => c.clase).join('')}</b>, una de 32.`, 'ok');
  }
  function draw() {
    const cx = 170, vuela = on.vuela;
    const cy = (vuela ? 125 : 160) + (vuela ? Math.sin(t * 4) * 8 : 0);
    g.clearRect(0, 0, cv.width, cv.height);
    // piso o agua
    if (on.nada) { g.fillStyle = 'rgba(20,55,200,.75)'; g.fillRect(0, 222, 340, 78); g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= 340; x += 10) g.lineTo(x, 222 + Math.sin(x / 18 + t * 3) * 4); g.stroke(); }
    else { g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(20, 232); g.lineTo(320, 232); g.stroke(); }
    // alas
    if (vuela) { const a = Math.sin(t * 14) * 14; g.fillStyle = '#fff'; [-1, 1].forEach(s => { g.beginPath(); g.moveTo(cx + s * 40, cy - 6); g.lineTo(cx + s * 112, cy - 34 + a); g.lineTo(cx + s * 96, cy + 12); g.closePath(); g.fill(); }); }
    // aleta
    if (on.nada) { g.fillStyle = GRE; g.beginPath(); g.moveTo(cx - 14, cy - 44); g.lineTo(cx + 6, cy - 80); g.lineTo(cx + 22, cy - 42); g.closePath(); g.fill(); }
    // patas
    if (on.camina) { g.strokeStyle = YEL; g.lineWidth = 7; g.lineCap = 'round'; const base = vuela ? cy + 66 : 230; [-26, 0, 26].forEach((dx, i) => { const k = vuela ? 0 : Math.sin(t * 9 + i * 2) * 9; g.beginPath(); g.moveTo(cx + dx, cy + 38); g.lineTo(cx + dx + k, base); g.stroke(); }); }
    // cañón
    if (on.dispara) { g.fillStyle = COR; g.fillRect(cx + 40, cy - 9, 58, 18); const p = (t * 1.2) % 1; g.fillStyle = YEL; g.font = '700 30px "Atkinson Hyperlegible Next", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('*', cx + 108 + p * 80, cy + 5); }
    // cuerpo
    g.fillStyle = COB; g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, 52, 44, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(cx - 16, cy - 8, 9, 0, 7); g.arc(cx + 16, cy - 8, 9, 0, 7); g.fill();
    g.fillStyle = INK; g.beginPath(); g.arc(cx - 14, cy - 7, 4, 0, 7); g.arc(cx + 18, cy - 7, 4, 0, 7); g.fill();
    // vida
    if (on.vida) { g.fillStyle = COR; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx - 26 + i * 26, cy - 64 - (on.nada ? 26 : 0), 9, 0, 7); g.fill(); } }
    // la bolsa y sus piezas
    g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = '700 24px "Atkinson Hyperlegible Next", sans-serif'; g.fillStyle = '#b9b9bd';
    g.fillText('Entidad (la bolsa)', 400, 26);
    C.forEach((c, i) => {
      const y = 72 + i * 49, a = on[c.k];
      g.fillStyle = a ? YEL : 'rgba(255,255,255,.1)'; g.strokeStyle = a ? YEL : 'rgba(255,255,255,.35)'; g.lineWidth = 2;
      g.beginPath(); if (g.roundRect) g.roundRect(400, y - 20, 200, 40, 10); else g.rect(400, y - 20, 200, 40); g.fill(); g.stroke();
      g.fillStyle = a ? INK : 'rgba(255,255,255,.6)'; g.font = '700 24px "Atkinson Hyperlegible Next", sans-serif'; g.fillText((a ? '+ ' : '   ') + c.comp, 412, y + 1);
      if (a) { g.fillStyle = '#e7e9ee'; g.font = '500 24px "Atkinson Hyperlegible Next", sans-serif'; g.fillText(c.hace, 618, y + 1); }
    });
  }
  function frame(now) {
    if (!alive) return;
    t += Math.min(.1, (now - last) / 1000); last = now;
    draw();
    raf = requestAnimationFrame(frame);
  }
  texto();
  raf = requestAnimationFrame(frame);
  return () => { alive = false; cancelAnimationFrame(raf); };
};

/* 8 · ¿Heredar, componer o es solo un dato? Seis pedidos de diseño para decidir */
window.DEMOS.heredar = function (el) {
  const f = FIG.lienzo(el, 900, 400);
  const CASOS = [
    ['Bicho debe poder ponerse', 'en un GameObject de Unity.', 0, 'Unity exige que <b>Bicho sea un MonoBehaviour</b>. Es un «es un» estable y de un solo eje: aquí heredar está bien.'],
    ['Diseño quiere un bicho que vuela', 'y otro que vuela y nada.', 1, 'Habilidades que se mezclan: <b>piezas Vuela y Nada</b>. Con herencia el árbol explota.'],
    ['El tanque es igual a los demás,', 'pero aguanta 3 golpes.', 2, 'Solo cambia un número. <b>Es un dato</b> (vida = 3), no una clase hija.'],
    ['El robot cambia de arma en plena', 'partida: chispa, rayo, escudo.', 1, 'La clase de un objeto no cambia en ejecución. El robot <b>tiene un</b> arma y se la cambias.'],
    ['Pausa, Menú y Jugando deben', 'entrar en la misma máquina.', 0, 'Cada uno <b>es un</b> IEstado. Implementar una interfaz es la relación «es un» más sana: promete, no arrastra código.'],
    ['Un bicho se vuelve invisible', '5 segundos al tomar una poción.', 1, 'Se agrega una pieza Invisible y se quita al terminar. <b>Componer</b> permite cambios en pleno juego.']
  ];
  const OP = ['Heredar (es un)', 'Componer (tiene un)', 'Solo un dato'];
  f.nodo('rect', { x: 30, y: 20, width: 840, height: 150, rx: 18, fill: FIG.C.paper });
  const l1 = f.texto(450, 70, '', { tam: 30, color: FIG.C.ink, peso: 700 }), l2 = f.texto(450, 118, '', { tam: 30, color: FIG.C.ink, peso: 700 });
  const caja = OP.map((o, i) => f.caja(30 + i * 285, 205, 270, 90, o, { tam: 26, clic: () => elegir(i) }));
  const prog = f.texto(450, 350, '', { tam: 22 });
  const di = FIG.dice(el);
  let k = 0, aciertos = 0, resp = false;
  const marcador = () => prog.pon(`Pedido ${k + 1} de ${CASOS.length} · aciertos: ${aciertos}`);
  function pinta() {
    l1.pon(CASOS[k][0]); l2.pon(CASOS[k][1]);
    caja.forEach(c => c.tono('base'));
    marcador();
    di('Lee el pedido y toca una opción: ¿heredar, componer o es solo un dato?');
  }
  function elegir(i) {
    if (resp) return;
    resp = true;
    const ok = CASOS[k][2];
    if (i === ok) aciertos++;
    caja.forEach((c, j) => c.tono(j === ok ? 'ok' : j === i ? 'bad' : 'off'));
    marcador();
    di((i === ok ? '<b>Bien.</b> ' : `<b>Mejor: ${OP[ok].toLowerCase()}.</b> `) + CASOS[k][3], i === ok ? 'ok' : 'bad');
  }
  const c = FIG.controles(el);
  c.boton('Siguiente pedido', () => { k = (k + 1) % CASOS.length; if (k === 0) aciertos = 0; resp = false; pinta(); });
  c.boton('Empezar de nuevo', () => { k = 0; aciertos = 0; resp = false; pinta(); }, true);
  pinta();
};
