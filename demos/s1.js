/* Figuras de la semana 1. Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   Las figuras nuevas usan FIG (assets/fig.js) para compartir aspecto. */
window.DEMOS = window.DEMOS || {};

/* 1 · El costo de cada cambio: espagueti contra modular (curvas ilustrativas) */
window.DEMOS.costo = function (el) {
  const f = FIG.lienzo(el, 900, 470), X0 = 90, Y0 = 400, AW = 760, AH = 330, N = 20, MAX = 20;
  const spag = i => .5 * Math.pow(1.2, i), mod = i => .5 + .05 * i;
  const px = i => X0 + AW * i / N, py = v => Y0 - AH * Math.min(v, MAX) / MAX;
  f.linea(X0, Y0, X0 + AW, Y0, { color: 'rgba(255,255,255,.5)', grosor: 3 }); f.linea(X0, Y0, X0, Y0 - AH, { color: 'rgba(255,255,255,.5)', grosor: 3 });
  f.texto(X0 + AW / 2, 444, 'cambios que ya le pidieron al juego', { tam: 23 });
  f.texto(34, Y0 - AH / 2, 'días', { tam: 23 }); f.texto(34, Y0 - AH / 2 + 26, 'por cambio', { tam: 20 });
  [5, 10, 15, 20].forEach(v => { f.linea(X0, py(v), X0 + AW, py(v), { puntos: true }); f.texto(X0 - 22, py(v), String(v), { tam: 21 }); });
  const pa = f.trazo('', { tono: 'coral', grosor: 6 }), pb = f.trazo('', { tono: 'yellow', grosor: 6 });
  const da = f.circulo(0, 0, 11, { tono: 'coral', borde: '#fff' }), db = f.circulo(0, 0, 11, { tono: 'yellow', borde: '#fff' });
  const la = f.texto(0, 0, '', { tam: 23, tono: 'white', ancla: 'end', peso: 700 }), lb = f.texto(0, 0, '', { tam: 23, tono: 'white', ancla: 'end', peso: 700 });
  const di = FIG.dice(el);
  function pinta(n) {
    const camino = fn => Array.from({ length: n + 1 }, (_, i) => (i ? 'L' : 'M') + px(i) + ' ' + py(fn(i))).join('');
    pa.setAttribute('d', camino(spag)); pb.setAttribute('d', camino(mod));
    da.mover(px(n), py(spag(n))); db.mover(px(n), py(mod(n)));
    la.t.setAttribute('x', px(n) - 18); la.t.setAttribute('y', py(spag(n)) - 20); la.pon('espagueti');
    lb.t.setAttribute('x', px(n) - 18); lb.t.setAttribute('y', py(mod(n)) + 24); lb.pon('modular');
    const a = spag(n), b = mod(n), fmt = v => v < 1.5 ? 'unas ' + Math.round(v * 8) + ' horas' : Math.round(v) + ' días';
    di(n === 0 ? 'Al principio las dos formas cuestan lo mismo. Por eso el espagueti parece buena idea.'
      : `Cambio número ${n}: en espagueti toma <b>${fmt(a)}</b>, en modular <b>${fmt(b)}</b>.`, a > b * 3 ? 'bad' : '');
  }
  FIG.controles(el).deslizador('Cambios pedidos', 0, N, 0, 1, pinta);
  pinta(0);
};

/* 2 · La cocina: una olla contra estaciones */
window.DEMOS.cocina = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const olla = f.caja(190, 150, 520, 200, 'Un cocinero, una olla', { tam: 30, sub: 'parrilla + fríos + salsas + postres' });
  const pedO = f.caja(330, 30, 240, 70, 'Pedidos', { tono: 'paper' }), flO = f.flecha(pedO, olla);
  const mos = f.caja(250, 30, 400, 70, 'Mostrador de pedidos', { tono: 'paper' });
  const est = ['Parrilla', 'Fríos', 'Salsas', 'Postres'].map((n, i) => f.caja(40 + i * 212, 220, 184, 130, n, { tam: 26 }));
  const fls = est.map(e => f.flecha(mos, e));
  let modo = 0;
  const di = FIG.dice(el);
  function base() {
    olla.ver(!modo).tono('base'); pedO.ver(!modo); flO.ver(!modo).tono('base');
    mos.ver(!!modo); est.forEach(e => e.ver(!!modo).tono('base')); fls.forEach(x => x.ver(!!modo).tono('base'));
    di(modo ? 'Cada estación hace una sola cosa y recibe pedidos por el mostrador. Prueba los tres botones.' : 'Un cocinero hace todo en la misma olla. Prueba los tres botones.');
  }
  const c = FIG.controles(el);
  c.opciones(['Una olla', 'Estaciones'], i => { modo = i; base(); });
  c.boton('Cambiar la salsa', () => { base(); if (!modo) { olla.tono('bad'); di('Para cambiar la salsa hay que meter la mano en la única olla. Todo el menú queda en riesgo.', 'bad'); } else { est[2].tono('on'); fls[2].tono('on'); di('Solo cambia la estación de salsas. Las otras tres ni se enteran.', 'ok'); } });
  c.boton('Llegan 40 pedidos', () => { base(); if (!modo) { olla.tono('bad'); flO.tono('bad'); di('Un cocinero no da abasto: la cola crece y todos los platos se atrasan.', 'bad'); } else { est.forEach(e => e.tono('on')); fls.forEach(x => x.tono('on')); di('Las estaciones trabajan a la vez. Si hace falta, se suma otra parrilla sin tocar postres.', 'ok'); } });
  c.boton('Se enferma un cocinero', () => { base(); if (!modo) { olla.tono('off'); flO.tono('bad'); di('Nadie más sabe cómo funciona la olla. El restaurante cierra.', 'bad'); } else { est[3].tono('off'); fls[3].tono('off'); di('Postres se detiene. Parrilla, fríos y salsas siguen sirviendo.', 'ok'); } });
  base();
};

/* 3 · El latido: entrada, actualización, dibujo */
window.DEMOS.latido = function (el) {
  const f = FIG.lienzo(el, 900, 400);
  const F = [f.caja(50, 150, 230, 110, 'Entrada', { tam: 28, sub: '¿qué quiere el jugador?' }), f.caja(335, 150, 230, 110, 'Actualizar', { tam: 28, sub: 'el mundo avanza dt' }), f.caja(620, 150, 230, 110, 'Dibujar', { tam: 28, sub: 'se muestra el resultado' })];
  const A = [f.flecha(F[0], F[1]), f.flecha(F[1], F[2])];
  f.trazo('M735 270 V340 H165 V274', { color: 'rgba(255,255,255,.55)', grosor: 3 });
  f.trazo('M155 288 L165 270 L175 288', { color: 'rgba(255,255,255,.55)', grosor: 3 });
  const cont = f.texto(450, 70, 'frame 0', { tam: 34, tono: 'white', peso: 800 });
  f.texto(450, 366, 'y vuelve a empezar, decenas de veces por segundo', { tam: 22 });
  const T = ['<b>Entrada.</b> El mesero toma el pedido: se leen las teclas. Todavía no se mueve nada.', '<b>Actualizar.</b> La cocina prepara: bichos, chispas y puntaje avanzan un poquito.', '<b>Dibujar.</b> Se sirve el plato: se pinta lo que hay. Dibujar no cambia nada.'];
  const di = FIG.dice(el);
  let i = -1, n = 0, ms = 900, timer = 0, corre = true;
  function paso() { i = (i + 1) % 3; if (i === 0) cont.pon('frame ' + (++n)); F.forEach((b, j) => b.tono(j === i ? 'on' : 'base')); A.forEach((a, j) => a.tono(j === i - 1 ? 'on' : 'base')); di(T[i]); }
  function arma() { clearInterval(timer); if (corre) timer = setInterval(paso, ms); }
  const c = FIG.controles(el);
  const b = c.boton('Pausar', () => { corre = !corre; b.textContent = corre ? 'Pausar' : 'Seguir'; arma(); }, true);
  c.boton('Un paso', () => { corre = false; b.textContent = 'Seguir'; arma(); paso(); });
  c.deslizador('Velocidad', 1, 10, 2, 1, v => { ms = 1800 / v; arma(); }, v => v + 'x');
  paso(); arma();
  return () => clearInterval(timer);
};

/* 4 · Píxeles por frame contra píxeles por segundo */
window.DEMOS.gameloop = function (el) {
  el.insertAdjacentHTML('beforeend', '<canvas width="1300" height="300" aria-label="Dos bolas: una se mueve por frame y otra por segundo"></canvas>');
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), W = cv.width, H = cv.height;
  let fps = 60, a = 0, b = 0, acc = 0, t = 0, last = performance.now(), raf = 0, alive = true;
  const reset = () => { a = b = acc = t = 0; };
  const c = FIG.controles(el);
  c.deslizador('Cuadros por segundo', 10, 144, 60, 1, v => { fps = v; reset(); }, v => v + ' fps');
  c.boton('Reiniciar', reset, true);
  const sal = c.salida();
  function ball(x, y, color, label) {
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 3; g.beginPath(); g.moveTo(30, y); g.lineTo(W - 30, y); g.stroke();
    g.fillStyle = color; g.beginPath(); g.arc(30 + (x % (W - 60)), y, 22, 0, 7); g.fill();
    g.fillStyle = '#b9b9bd'; g.font = '600 24px "Atkinson Hyperlegible Next", sans-serif'; g.fillText(label, 30, y - 40);
  }
  function frame(now) {
    if (!alive) return;
    const real = Math.min(.1, (now - last) / 1000); last = now; acc += real; t += real;
    const paso = 1 / fps;
    while (acc >= paso) { a += 5; b += 300 * paso; acc -= paso; }
    g.clearRect(0, 0, W, H);
    ball(a, 100, '#e2a54a', 'x += 5             píxeles por frame');
    ball(b, 235, '#ffffff', 'x += 300 * dt      píxeles por segundo');
    sal(t.toFixed(1) + ' s · amarilla ' + Math.round(a) + ' px · blanca ' + Math.round(b) + ' px');
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return () => { alive = false; cancelAnimationFrame(raf); };
};

/* 5 · Paso fijo: el vaso (tiempo acumulado) y los tragos (pasos de física) */
window.DEMOS.vaso = function (el) {
  const f = FIG.lienzo(el, 700, 430), TRAGO = 16.7, TOPE = 120, VX = 90, VY = 50, VW = 170, VH = 320;
  const y = ms => VY + VH - VH * Math.min(ms, TOPE) / TOPE;
  const agua = f.nodo('rect', { x: VX, y: VY + VH, width: VW, height: 0, fill: FIG.C.cobalt });
  f.nodo('path', { d: `M${VX} ${VY} V${VY + VH} H${VX + VW} V${VY}`, fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linejoin': 'round' });
  f.linea(VX - 16, y(TRAGO), VX + VW + 16, y(TRAGO), { tono: 'yellow', grosor: 3, puntos: true });
  f.texto(VX + VW + 26, y(TRAGO), 'un trago = 16,7 ms', { ancla: 'start', tam: 24, tono: 'yellow' });
  f.texto(VX + VW / 2, VY + VH + 34, 'tiempo acumulado', { tam: 24 });
  f.texto(480, 80, 'pasos de física en este frame', { tam: 24 });
  const cuad = Array.from({ length: 7 }, (_, i) => f.caja(330 + i * 46, 110, 38, 38, '', { rx: 8, tono: 'off' }));
  const total = f.texto(480, 230, 'física: 0 pasos en total', { tam: 28, tono: 'white', peso: 700 });
  const fr = f.texto(480, 275, 'frames dibujados: 0', { tam: 24 });
  const di = FIG.dice(el, 'Cada frame echa su <b>dt</b> al vaso. La física solo bebe tragos del mismo tamaño.');
  let ac = 0, pasos = 0, frames = 0;
  function echa(dt) {
    ac += dt; let n = 0; while (ac >= TRAGO) { ac -= TRAGO; n++; }
    pasos += n; frames++;
    agua.setAttribute('y', y(ac)); agua.setAttribute('height', VY + VH - y(ac));
    cuad.forEach((c, i) => c.tono(i < n ? 'on' : 'off'));
    total.pon('física: ' + pasos + ' pasos en total'); fr.pon('frames dibujados: ' + frames);
    di(`Este frame duró <b>${Math.round(dt)} ms</b>. La física dio <b>${n} ${n === 1 ? 'paso' : 'pasos'}</b> y sobran ${ac.toFixed(1)} ms para el siguiente.`, n > 3 ? 'bad' : '');
  }
  const c = FIG.controles(el);
  c.boton('Frame rápido (8 ms)', () => echa(8));
  c.boton('Frame normal (17 ms)', () => echa(17));
  c.boton('Tirón (100 ms)', () => echa(100));
};

/* 6 · El motor por pisos: ¿quién puede usar a quién? */
window.DEMOS.capas = function (el) {
  const f = FIG.lienzo(el, 900, 470);
  const P = [['Tu juego', 'reglas, niveles, enemigos'], ['Bases de gameplay', 'entidades, eventos, estados'], ['Sistemas', 'render, física, audio'], ['Recursos', 'texturas, sonidos, niveles'], ['Núcleo', 'memoria, matemáticas'], ['Plataforma', 'sistema operativo, hardware']];
  const di = FIG.dice(el, 'Toca un piso y luego otro: el primero quiere usar al segundo.');
  let de = -1, fl = null;
  const cajas = P.map((p, i) => f.caja(40, 14 + i * 75, 560, 64, (6 - i) + ' · ' + p[0], { tam: 25, sub: p[1], clic: () => toca(i) }));
  f.texto(760, 30, 'arriba: lo específico', { tam: 21 }); f.texto(760, 440, 'abajo: lo reutilizable', { tam: 21 });
  function toca(i) {
    if (fl) { fl.ln.remove(); fl = null; }
    if (de < 0 || de === i) { cajas.forEach(c => c.tono('base')); de = de === i ? -1 : i; if (de >= 0) { cajas[i].tono('on'); di(`<b>${P[i][0]}</b> quiere usar a... toca otro piso.`); } else di('Toca un piso y luego otro: el primero quiere usar al segundo.'); return; }
    const baja = i > de;
    cajas.forEach(c => c.tono('base')); cajas[de].tono('on'); cajas[i].tono(baja ? 'ok' : 'bad');
    fl = f.flecha([680, cajas[de].cy], [680, cajas[i].cy], { tono: baja ? 'ok' : 'bad', grosor: 6 });
    di(baja ? `Permitido. <b>${P[de][0]}</b> se apoya en <b>${P[i][0]}</b>: hacia abajo siempre se puede.`
      : `Prohibido. <b>${P[de][0]}</b> no puede saber que existe <b>${P[i][0]}</b>. Si lo conoce, ya no sirve para otro juego.`, baja ? 'ok' : 'bad');
    de = -1;
  }
};

/* 7 · Turno Nocturno jugándose solo, para conocer al paciente */
window.DEMOS.turno = function (el) {
  el.insertAdjacentHTML('beforeend', '<canvas width="640" height="420" aria-label="Turno Nocturno: un robot dispara chispas a bichos que bajan"></canvas>');
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), CW = 16, CH = 20, COLS = 40, ROWS = 20;
  let rx = 20, bichos = [], chispas = [], t = 0, pts = 0;
  function tick() {
    t++;
    if (t % 9 === 0) { const r = Math.random(); bichos.push({ x: 1 + Math.floor(Math.random() * 38), y: 1, c: r > .85 ? 'M' : r > .55 ? 'B' : 'b', hp: r > .85 ? 3 : 1 }); }
    bichos.forEach(b => { const cada = b.c === 'B' ? 2 : b.c === 'M' ? 6 : 4; if (t % cada === 0) b.y++; });
    const obj = bichos.slice().sort((a, b) => b.y - a.y)[0];
    if (obj) { if (obj.x > rx) rx++; else if (obj.x < rx) rx--; else if (t % 2 === 0) chispas.push({ x: rx, y: 17 }); }
    chispas.forEach(c => c.y--);
    chispas = chispas.filter(c => { const b = bichos.find(q => q.x === c.x && (q.y === c.y || q.y === c.y + 1)); if (b) { if (--b.hp <= 0) { bichos.splice(bichos.indexOf(b), 1); pts += b.c === 'M' ? 50 : b.c === 'B' ? 20 : 10; } return false; } return c.y > 0; });
    bichos = bichos.filter(b => b.y < 19);
    g.fillStyle = '#0d0d0e'; g.fillRect(0, 0, cv.width, cv.height);
    g.font = '600 18px "JetBrains Mono", monospace'; g.textBaseline = 'top';
    const put = (x, y, ch, col) => { g.fillStyle = col; g.fillText(ch, x * CW, y * CH + 20); };
    g.fillStyle = '#b9b9bd'; g.fillText('TURNO NOCTURNO   Puntos: ' + pts, 0, 0);
    for (let x = 0; x < COLS; x++) { put(x, 0, '=', '#3a3a40'); put(x, ROWS - 1, '=', '#3a3a40'); }
    for (let y = 1; y < ROWS - 1; y++) { put(0, y, '|', '#3a3a40'); put(COLS - 1, y, '|', '#3a3a40'); }
    bichos.forEach(b => put(b.x, b.y, b.c, b.c === 'M' ? '#e0706a' : '#eb9a94'));
    chispas.forEach(c => put(c.x, c.y, '*', '#e2a54a'));
    put(rx, 18, '@', '#ffffff');
  }
  const timer = setInterval(tick, 110); tick();
  return () => clearInterval(timer);
};

/* 8 · Dos juegos idénticos: lo que ve el jugador contra lo que ve el programador */
window.DEMOS.pantallas = function (el) {
  const f = FIG.lienzo(el, 900, 400), capas = [];
  [0, 1].forEach(j => {
    const x0 = 40 + j * 440;
    f.nodo('rect', { x: x0, y: 40, width: 380, height: 270, rx: 14, fill: '#1b1b1e', stroke: 'rgba(255,255,255,.4)', 'stroke-width': 3 });
    f.texto(x0 + 190, 345, j ? 'Equipo B' : 'Equipo A', { tam: 26, peso: 800, color: '#fff' });
    const jugador = [], dentro = [];
    /* pantalla del juego: robot, bichos y chispas */
    jugador.push(f.texto(x0 + 190, 270, '@', { tam: 44, peso: 800, tono: 'yellow' }));
    [[90, 90], [190, 120], [290, 80], [140, 170], [250, 190]].forEach(p => jugador.push(f.texto(x0 + p[0], p[1], 'ж', { tam: 34, peso: 700, tono: 'coral' })));
    [[190, 225], [190, 205]].forEach(p => jugador.push(f.texto(x0 + p[0], p[1], '·', { tam: 40, peso: 800, tono: 'yellow' })));
    jugador.push(f.texto(x0 + 70, 62, 'Vidas 3   Puntos 120', { tam: 18, ancla: 'start', tono: 'soft' }));
    /* por dentro */
    const nombres = ['Entrada', 'Reglas', 'Bichos', 'Dibujo', 'Sonido', 'Guardado'];
    const pos = j ? [[70, 80], [250, 70], [160, 150], [60, 230], [270, 230], [170, 260]] : [[30, 70], [140, 70], [250, 70], [30, 200], [140, 200], [250, 200]];
    const cajas = nombres.map((n, i) => { const c = f.caja(x0 + pos[i][0], pos[i][1], 100, 56, n, { tam: 19 }); dentro.push(c); return c; });
    const pares = j ? [[0, 1], [0, 2], [0, 4], [1, 2], [1, 3], [1, 5], [2, 3], [2, 4], [2, 5], [3, 1], [4, 5], [5, 0], [3, 4], [5, 2]] : [[0, 1], [1, 2], [1, 4], [1, 5], [2, 3]];
    pares.forEach(p => dentro.push(f.flecha(cajas[p[0]], cajas[p[1]], { tono: j ? 'bad' : 'base', desvio: j ? (p[0] * 7 % 23) - 11 : 0 })));
    capas.push({ jugador, dentro, n: pares.length });
  });
  const di = FIG.dice(el);
  function modo(m) {
    capas.forEach(c => { c.jugador.forEach(x => x.ver(m === 0)); c.dentro.forEach(x => x.ver(m === 1)); });
    di(m === 0 ? 'Para el jugador son el mismo juego: mismo arte, mismos controles, mismos fps.'
      : `Por dentro: A tiene <b>${capas[0].n}</b> conexiones ordenadas; B tiene <b>${capas[1].n}</b> y todo toca a todo. Eso no se ve en pantalla, se paga al cambiar.`, m ? 'bad' : '');
  }
  FIG.controles(el).opciones(['Lo que ve el jugador', 'Lo que ve el programador'], modo);
  modo(0);
};

/* 9 · Las cuatro preguntas del curso: cambiar, rendir, crecer, probar */
window.DEMOS.cuatro = function (el) {
  const CU = window.CURSO, f = FIG.lienzo(el, 900, 400);
  const sint = [
    'Agregar un bicho que vuela tarda dos semanas y rompe el menú de pausa.',
    'Cuando explotan 200 chispas el juego da un tirón de medio segundo.',
    'Con 30 tipos de bicho y 4 personas, cada cambio pisa el trabajo de otro.',
    'El bug del puntaje vuelve en cada versión y nadie sabe por qué.'
  ];
  const Q = CU.cualidades.map((q, i) => ({ v: q[0], n: q[1], p: q[2], s: q[3], sin: sint[i] }));
  const cajas = Q.map((q, i) => f.caja(40 + (i % 2) * 420, 30 + Math.floor(i / 2) * 190, 400, 160, q.v, { tam: 40, sub: q.n, clic: () => elegir(i) }));
  const di = FIG.dice(el);
  function elegir(i) {
    cajas.forEach((c, j) => c.tono(j === i ? 'on' : 'base'));
    const q = Q[i];
    di(`<b>${q.p}</b> Cuando falla se nota así: «${q.sin}» Lo trabajamos en la semana ${q.s.join(', ').replace(/, (\d)$/, ' y $1')}.`, '');
  }
  elegir(0);
};

/* 10 · Una analogía por semana: voltea las cartas */
window.DEMOS.analogias = function (el) {
  const A = [
    ['Cocina', 'Arquitectura', 'Estaciones con una tarea cada una, contra un cocinero con una olla.'],
    ['Enchufe', 'Interfaz', 'Cualquier aparato funciona porque todos respetan la misma forma.'],
    ['Semáforo', 'State', 'Está en un solo estado a la vez y sabe a cuál pasa.'],
    ['Carta', 'Datos', 'Se cambia el menú sin reconstruir la cocina.'],
    ['Bolera', 'Object Pool', 'Los zapatos se prestan, se devuelven y se vuelven a usar.'],
    ['Ciudad', 'Módulos', 'Barrios conectados por avenidas, no por los patios.'],
    ['Piloto', 'Pruebas', 'La lista de chequeo antes de despegar, siempre igual.'],
    ['Repetición', 'Post-mortem', 'Los buenos jugadores miran la repetición de la partida.']
  ];
  const f = FIG.lienzo(el, 900, 420), vis = new Set();
  const cartas = A.map((a, i) => f.caja(30 + (i % 4) * 214, 24 + Math.floor(i / 4) * 196, 196, 176, a[0], { tam: 30, sub: 'Semana ' + (i + 1), clic: () => voltear(i) }));
  const di = FIG.dice(el), c = FIG.controles(el), sal = c.salida();
  function voltear(i) {
    vis.add(i);
    cartas.forEach((k, j) => { if (vis.has(j)) k.rotulo(A[j][1]).sub(A[j][0]).tono(j === i ? 'on' : 'ok'); });
    di(`<b>Semana ${i + 1} · ${A[i][0]} → ${A[i][1]}.</b> ${A[i][2]}`, '');
    sal(`volteadas ${vis.size} de 8`);
  }
  c.boton('Voltear todas', () => A.forEach((_, i) => voltear(i)), true);
  di('Toca una carta: cada semana tiene una escena cotidiana que explica el concepto.', '');
  sal('volteadas 0 de 8');
};

/* 11 · Así funciona cada clase */
window.DEMOS.ritual = function (el) {
  const P = [
    ['Pregunta', 'Abrimos con un problema real de un juego. Tú predices antes de ver la respuesta.'],
    ['Analogía', 'Una escena cotidiana que ya entiendes y que se parece al concepto.'],
    ['Concepto', 'El nombre técnico, la regla y por qué existe.'],
    ['Código', 'El concepto en C#, con su versión en Unity. A veces en C++ o Lua.'],
    ['Explora', 'Una figura que puedes mover: rompe cosas a propósito y mira qué pasa.'],
    ['Predice', 'Preguntas con opciones dentro de la slide. Equivocarse aquí es gratis.'],
    ['Practica', 'Lo aplicas a Turno Nocturno. Eso alimenta los ACA.']
  ];
  const f = FIG.lienzo(el, 900, 170);
  const cajas = P.map((p, i) => f.caja(14 + i * 126, 16 + (i % 2) * 64, 112, 74, p[0], { tam: 20, rx: 14, clic: () => elegir(i) }));
  for (let i = 0; i < P.length - 1; i++) f.flecha(cajas[i], cajas[i + 1]);
  const di = FIG.dice(el);
  function elegir(i) { cajas.forEach((c, j) => c.tono(j === i ? 'on' : j < i ? 'ok' : 'base')); di(`<b>${i + 1}. ${P[i][0]}.</b> ${P[i][1]}`); }
  elegir(0);
};
