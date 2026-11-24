/* Figuras de la semana 4. Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   Las figuras de analogía usan FIG (assets/fig.js). estrategia y datos son demos de canvas. Los conteos son ilustrativos.
   stateStrategy contrasta quién decide el cambio; tuberia muestra en qué caja muere un error de datos. */
(function () {
  window.DEMOS = window.DEMOS || {};

  /* 1 · El gancho: cuántos if hay que tocar por cada tipo de bicho */
  window.DEMOS.ifs = function (el) {
    const f = FIG.lienzo(el, 900, 430), L = ['Crear', 'Mover', 'Dibujar', 'Puntuar'];
    const tit = f.texto(450, 44, '', { tam: 30, tono: 'white', peso: 800 });
    const cajas = L.map((n, i) => f.caja(24 + i * 218, 96, 200, 120, n, { tam: 30, sub: ' ' }));
    const fab = f.caja(200, 290, 500, 110, 'Fábrica + datos', { tam: 30, sub: ' ', tono: 'ok' });
    const fls = cajas.map(c => f.flecha(c, fab, { tono: 'ok' }));
    const nota = f.texto(450, 300, 'una rama if por tipo, en cada lugar', { tam: 24 });
    let n = 3, modo = 0;
    const di = FIG.dice(el);
    function pinta() {
      const spag = !modo;
      cajas.forEach(c => c.tono(spag ? (n > 6 ? 'bad' : 'base') : 'off').sub(spag ? n + ' ramas if' : 'sin if'));
      fab.ver(!spag).sub(n + ' fichas, una por bicho'); fls.forEach(x => x.ver(!spag)); nota.ver(spag);
      tit.pon(spag ? `${n} tipos de bicho: ${4 * n} ramas if` : `${n} tipos de bicho: ${n} fichas en un lugar`);
      di(spag ? `Para el bicho número ${n + 1} hay que abrir <b>4 lugares</b> y no olvidar ninguno. Si olvidas uno, aparece un bicho invisible o que no da puntos.`
        : `Para el bicho número ${n + 1} se agrega <b>una ficha</b>. Crear, mover, dibujar y puntuar no se vuelven a abrir.`, spag ? 'bad' : 'ok');
    }
    const c = FIG.controles(el);
    c.deslizador('Tipos de bicho', 3, 12, 3, 1, v => { n = v; pinta(); });
    c.opciones(['Espagueti', 'Fábrica + datos'], i => { modo = i; pinta(); });
    pinta();
  };

  /* 2 · Factory: la ventanilla que entrega bichos armados */
  window.DEMOS.fabrica = function (el) {
    const f = FIG.lienzo(el, 900, 430);
    const T = { tanque: ['M', 'vida 3'], rapido: ['B', 'vida 1'], blindado: ['H', 'vida 5'] };
    const N = ['Oleadas', 'Jefe final', 'Tutorial'];
    const cli = N.map((n, i) => f.caja(24, 30 + i * 112, 220, 84, n, { tam: 28 }));
    const ven = f.caja(350, 110, 230, 130, 'Fábrica', { tam: 30, tono: 'on' });
    const sal = f.caja(690, 86, 186, 180, '', { tono: 'off' });
    const sim = f.texto(783, 150, '?', { tam: 80, tono: 'yellow', peso: 800 });
    const fic = f.texto(783, 234, '', { tam: 24, tono: 'white' });
    const aV = cli.map(c => f.flecha(c, ven)), vS = f.flecha(ven, sal, { rotulo: 'new', tam: 22 });
    const aD = cli.map((c, i) => f.flecha(c, sal, { rotulo: i === 1 ? 'new' : '', tam: 22 }));
    const cnt = f.texto(450, 396, '', { tam: 26, tono: 'white', peso: 700 });
    let modo = 0, k = -1;
    const di = FIG.dice(el);
    function base() {
      ven.ver(!!modo).tono('on'); vS.ver(!!modo).tono('base');
      aV.forEach(a => a.ver(!!modo).tono('base')); aD.forEach(a => a.ver(!modo).tono('base'));
      cli.forEach(c => c.tono('base'));
      cnt.pon('lugares que hacen new Bicho: ' + (modo ? 1 : 3)).color(modo ? 'white' : 'coral');
    }
    function muestra(t) { sim.pon(T[t][0]); fic.pon(T[t][1]); }
    function pedir(t) {
      base(); k = (k + 1) % 3; muestra(t);
      if (modo) { cli[k].tono('on'); aV[k].tono('on'); vS.tono('on'); di(`<b>${N[k]}</b> pidió «${t}» en la ventanilla y recibió el bicho armado. No sabe cuánta vida tiene ni cómo se construye.`, 'ok'); }
      else { cli[k].tono('bad'); aD[k].tono('bad'); di(`<b>${N[k]}</b> arma el «${t}» por su cuenta, con su propio <code>new</code> y su propio <code>if</code>. Los otros dos lugares repiten lo mismo.`, 'bad'); }
    }
    const c = FIG.controles(el);
    c.opciones(['Sin fábrica', 'Con fábrica'], i => { modo = i; base(); sim.pon('?'); fic.pon(''); di(modo ? 'Ahora solo la fábrica sabe construir bichos. Pide uno.' : 'Cada lugar del código construye sus bichos. Pide uno.'); });
    c.boton('Pedir tanque', () => pedir('tanque'));
    c.boton('Pedir rápido', () => pedir('rapido'));
    c.boton('Bicho nuevo: blindado', () => {
      base(); muestra('blindado');
      if (modo) { ven.tono('ok'); di('Bicho «blindado»: <b>una línea nueva</b> en la fábrica. Oleadas, Jefe final y Tutorial no se abren.', 'ok'); }
      else { cli.forEach(x => x.tono('bad')); aD.forEach(a => a.tono('bad')); di('Bicho «blindado»: hay que editar <b>los 3 lugares</b>. Si olvidas uno, ahí el blindado no existe.', 'bad'); }
    }, true);
    base(); di('Cada lugar del código construye sus bichos. Pide uno y luego cambia a «Con fábrica».');
  };

  /* 3 · Strategy: un mango, muchas puntas */
  window.DEMOS.destornillador = function (el) {
    const f = FIG.lienzo(el, 640, 400);
    const P = [['Recto', 'M545 80 V320'], ['ZigZag', 'M545 80 L590 128 L500 176 L590 224 L500 272 L545 320'], ['Perseguir', 'M545 80 Q549 250 493 316']];
    f.texto(115, 40, 'el mango', { tam: 24 }); f.texto(340, 40, 'la punta', { tam: 24 }); f.texto(545, 40, 'se mueve', { tam: 24 });
    const mango = f.caja(20, 110, 190, 150, '');
    const nom = f.texto(115, 160, 'Bicho', { tam: 28, tono: 'white', peso: 800 });
    const vid = f.texto(115, 212, '', { tam: 24, tono: 'white' });
    const enc = f.caja(210, 160, 50, 50, '', { rx: 4, tono: 'paper' });
    const punta = f.caja(260, 140, 160, 90, 'Recto', { tam: 28, tono: 'on', rx: 8 });
    f.texto(320, 290, 'encaje: IMovimiento', { tam: 24 });
    f.linea(450, 70, 450, 380, { puntos: true });
    const tr = f.trazo(P[0][1], { tono: 'yellow', grosor: 5 });
    const arroba = f.texto(490, 350, '@', { tam: 34, tono: 'white', peso: 800 }).ver(false);
    const cre = f.texto(225, 360, '', { tam: 26, tono: 'white', peso: 700 });
    let vida = 3, creados = 1, her = false, cur = 0;
    const di = FIG.dice(el, 'Dale un chispazo y luego cambia la punta. Mira la vida y el contador.');
    function pinta() { vid.pon('vida ' + vida + ' de 3'); cre.pon('bichos creados: ' + creados).color(creados > 1 ? 'coral' : 'white'); }
    function elegir(i) {
      if (i === cur) return;
      cur = i; punta.rotulo(P[i][0]); tr.setAttribute('d', P[i][1]); arroba.ver(i === 2);
      if (her) { creados++; vida = 3; mango.tono('bad'); nom.pon('Bicho' + P[i][0]).t.setAttribute('font-size', 24); di(`Con herencia un objeto no cambia de clase: se destruye el bicho y se crea un <b>Bicho${P[i][0]}</b>. Perdió su vida y su posición.`, 'bad'); }
      else { mango.tono('base'); di(`Solo cambió la punta: <code>bicho.Cerebro = new ${P[i][0]}()</code>. Es el mismo bicho, con sus ${vida} de vida.`, 'ok'); }
      pinta();
    }
    const c = FIG.controles(el);
    c.opciones(['Recto', 'ZigZag', 'Perseguir'], elegir);
    c.boton('Chispazo', () => { if (vida > 1) vida--; pinta(); di(`Le quedan ${vida} de vida. Ahora cámbiale la punta: ¿la vida se conserva?`); }, true);
    c.casilla('Con herencia', v => {
      her = v; enc.tono(v ? 'off' : 'paper'); punta.tono(v ? 'off' : 'on'); mango.tono('base');
      nom.pon(v ? 'Bicho' + P[cur][0] : 'Bicho').t.setAttribute('font-size', v ? 24 : 28);
      di(v ? 'Sin puntas: cada forma de moverse es una clase distinta de bicho. Cambia el movimiento y mira el contador.' : 'Con Strategy el movimiento es una pieza que se quita y se pone.');
    });
    mango.tono('base'); pinta();
  };

  /* 4 · Singleton contra Service Locator: la recepción del hotel */
  window.DEMOS.recepcion = function (el) {
    const f = FIG.lienzo(el, 900, 430);
    const L = ['Colisión', 'Disparo', 'Menú'].map((n, i) => f.caja(24, 30 + i * 112, 190, 84, n, { tam: 28 }));
    const rec = f.caja(320, 110, 240, 130, 'Recepción', { tam: 30, tono: 'on' });
    const con = f.caja(660, 40, 220, 100, 'AudioConsola', { tam: 26 });
    const nul = f.caja(660, 212, 220, 100, 'AudioNulo', { tam: 26 });
    const aR = L.map(c => f.flecha(c, rec)), rC = f.flecha(rec, con), rN = f.flecha(rec, nul);
    const aD = L.map((c, i) => f.flecha(c, con, { rotulo: i === 2 ? 'Audio.Instancia' : '', tam: 22, ry: 30 }));
    const cnt = f.texto(450, 396, '', { tam: 26, tono: 'white', peso: 700 });
    let modo = 0, turno = 0;
    const di = FIG.dice(el);
    function base() {
      rec.ver(!!modo); aR.forEach(a => a.ver(!!modo).tono('base')); aD.forEach(a => a.ver(!modo).tono('base'));
      rC.ver(!!modo).tono(turno ? 'off' : 'on'); rN.ver(!!modo).tono(turno ? 'on' : 'off');
      con.tono(!modo || !turno ? 'base' : 'off').rotulo(modo ? 'AudioConsola' : 'Audio');
      nul.ver(!!modo).tono(turno ? 'ok' : 'off'); L.forEach(c => c.tono('base'));
      cnt.pon('lugares amarrados a la clase de audio: ' + (modo ? '1, el arranque' : '3')).color(modo ? 'white' : 'coral');
    }
    const c = FIG.controles(el);
    c.opciones(['Singleton', 'Service Locator'], i => {
      modo = i; base();
      di(modo ? 'Nadie llama a la clase: todos piden «audio» en recepción y los atiende quien esté de turno.' : 'Los tres llaman directo a <code>Audio.Instancia</code>. Cómodo. Ahora intenta probar la colisión.');
    });
    c.opciones(['Turno: consola', 'Turno: mudo'], i => {
      turno = i; base();
      if (!modo) di('Con Singleton no hay turno que cambiar. Para apagar el sonido habría que editar las tres llamadas.', 'bad');
      else di(turno ? 'Quedó de turno <b>AudioNulo</b>: cumple el contrato y no hace nada. Nadie más se enteró del cambio.' : 'De turno <b>AudioConsola</b>. Se registró una vez, al arrancar el juego.', 'ok');
    });
    c.boton('Probar 1.000 colisiones', () => {
      base(); L[0].tono('on');
      if (!modo) { aD[0].tono('bad'); con.tono('bad'); di('La prueba suena <b>1.000 veces</b>. La colisión está amarrada a la clase Audio y no hay cómo apagarla desde afuera.', 'bad'); }
      else if (!turno) { aR[0].tono('on'); con.tono('bad'); di('Suena 1.000 veces, pero aquí tiene arreglo: deja de turno al mudo y repite la prueba.', 'bad'); }
      else { aR[0].tono('on'); rN.tono('ok'); di('1.000 colisiones <b>en silencio</b>. El código de la colisión es el mismo: solo cambió quién atiende.', 'ok'); }
    });
    base(); di('Los tres llaman directo a <code>Audio.Instancia</code>. Cómodo. Ahora intenta probar la colisión.');
  };

  /* 5 · Datos externos: cambiar la carta sin reconstruir la cocina */
  window.DEMOS.carta = function (el) {
    const f = FIG.lienzo(el, 900, 430), INK = FIG.C.ink, lim = { vida: 5, vel: 6 };
    f.nodo('rect', { x: 24, y: 24, width: 420, height: 360, rx: 14, fill: FIG.C.paper, stroke: '#fff', 'stroke-width': 3 });
    const cab = f.texto(234, 66, '', { tam: 26, color: INK, peso: 800 });
    f.texto(50, 160, 'vida', { tam: 28, color: INK, ancla: 'start', peso: 700 }); f.texto(50, 256, 'velocidad', { tam: 28, color: INK, ancla: 'start', peso: 700 });
    const tx = { vida: f.texto(340, 160, '', { tam: 36, color: INK, peso: 800 }), vel: f.texto(340, 256, '', { tam: 36, color: INK, peso: 800 }) };
    const pend = f.texto(234, 344, '', { tam: 24, color: '#e0706a', peso: 700 });
    ['vida', 'vel'].forEach((k, j) => {
      f.caja(240, 130 + j * 96, 60, 60, '-', { tam: 34, rx: 12, clic: () => cambia(k, -1) });
      f.caja(380, 130 + j * 96, 60, 60, '+', { tam: 34, rx: 12, clic: () => cambia(k, 1) });
    });
    f.texto(680, 34, 'el juego corriendo', { tam: 24 });
    f.linea(500, 318, 860, 318, { color: 'rgba(255,255,255,.4)', grosor: 3 });
    const bi = f.texto(680, 90, 'M', { tam: 56, tono: 'yellow', peso: 800 });
    const barras = Array.from({ length: 5 }, () => f.nodo('rect', { width: 22, height: 9, rx: 2, fill: FIG.C.coral }));
    const info = f.texto(680, 352, '', { tam: 24, tono: 'white', peso: 700 }), trec = f.texto(680, 396, '', { tam: 24 });
    let ficha = { vida: 3, vel: 1 }, juego = { vida: 3, vel: 1 }, modo = 0, comp = 0, recomp = 0, y = 90;
    const di = FIG.dice(el, 'Cambia la vida o la velocidad con los botones <b>-</b> y <b>+</b> de la ficha, y mira al bicho.');
    const pendiente = () => ficha.vida !== juego.vida || ficha.vel !== juego.vel;
    function pinta() {
      cab.pon(modo ? 'juego.json: la carta' : 'Program.cs: el código');
      tx.vida.pon(ficha.vida); tx.vel.pon(ficha.vel);
      pend.pon(comp ? 'compilando...' : pendiente() ? 'falta recompilar' : '');
      info.pon('en el juego: vida ' + juego.vida + ', velocidad ' + juego.vel);
      trec.pon('recompilaciones: ' + recomp).color(recomp ? 'coral' : 'soft');
    }
    function cambia(k, d) {
      if (comp) return;
      const v = Math.max(1, Math.min(lim[k], ficha[k] + d)); if (v === ficha[k]) return;
      ficha[k] = v;
      if (modo) { juego = Object.assign({}, ficha); di('Guardaste la carta y el bicho cambió <b>al instante</b>. El código no se tocó.', 'ok'); }
      else di('Cambiaste el número en <code>Program.cs</code>, pero el juego que está corriendo no se entera. Falta recompilar.', 'bad');
      pinta();
    }
    function tick() {
      if (comp) { if (!--comp) { juego = Object.assign({}, ficha); recomp++; di(`Listo: van <b>${recomp}</b> ${recomp === 1 ? 'recompilación' : 'recompilaciones'} por cambiar números. Prueba ahora «En la carta».`); pinta(); } }
      else { y += juego.vel * 44 * .05; if (y > 290) y = 90; }
      bi.t.setAttribute('y', y); bi.color(comp ? '#97979c' : 'yellow');
      barras.forEach((r, i) => { r.setAttribute('x', 680 - juego.vida * 13 + i * 26 + 2); r.setAttribute('y', y - 46); r.style.display = i < juego.vida ? '' : 'none'; });
    }
    const c = FIG.controles(el);
    c.opciones(['En el código', 'En la carta'], i => {
      comp = 0; modo = i; if (modo) juego = Object.assign({}, ficha); pinta();
      di(modo ? 'Los números viven en un archivo de datos que el juego lee. Cambia un valor y mira.' : 'Los números viven dentro del código. Cambia un valor y mira qué hace falta.');
    });
    c.boton('Recompilar', () => {
      if (comp) return;
      if (modo) di('Nada que recompilar: el código no cambió. Solo cambió la carta.', 'ok');
      else if (!pendiente()) di('No hay cambios pendientes. Cambia primero un número de la ficha.');
      else { comp = 50; pinta(); di('Compilando... el juego está detenido. Y todo por cambiar un número.', 'bad'); }
    });
    pinta(); tick();
    const timer = setInterval(tick, 50);
    return () => clearInterval(timer);
  };

  /* 6 · Strategy en vivo: el mismo bicho, tres cerebros (canvas) */
  window.DEMOS.estrategia = function (el) {
    el.innerHTML = '<canvas width="900" height="380" style="touch-action:none" aria-label="Un bicho que cambia de estrategia de movimiento sin reiniciarse"></canvas>' +
      '<div class="ctl"><button data-e="Recto">Recto</button><button class="sec" data-e="ZigZag">ZigZag</button><button class="sec" data-e="Perseguir">Perseguir</button>' +
      '<span class="out"></span></div>';
    const cv = el.querySelector('canvas'), g = cv.getContext('2d'), W = cv.width, H = cv.height, out = el.querySelector('.out');
    const bicho = { x: W / 2, y: 60, vel: 120, vida: 3 }, robot = { x: W / 2, y: H - 45 };
    let t = 0, cambios = 0, atrapadas = 0, rastro = [], last = performance.now(), raf = 0, alive = true;

    // Las tres estrategias cumplen el mismo contrato: mover(bicho, dt).
    const ESTRATEGIAS = {
      Recto: (b, dt) => { b.y += b.vel * dt; },
      ZigZag: (b, dt) => { b.y += b.vel * dt; b.x += Math.cos(t * 4) * 260 * dt; },
      Perseguir: (b, dt) => {
        const dx = robot.x - b.x, dy = robot.y - b.y, d = Math.hypot(dx, dy) || 1;
        b.x += dx / d * b.vel * 1.4 * dt; b.y += dy / d * b.vel * 1.4 * dt;
      }
    };
    let nombre = 'Recto', cerebro = ESTRATEGIAS.Recto;

    el.querySelectorAll('button').forEach(bt => {
      bt.onclick = () => {
        nombre = bt.dataset.e; cerebro = ESTRATEGIAS[nombre]; cambios++;      // la única línea que cambia
        el.querySelectorAll('button').forEach(o => o.classList.toggle('sec', o !== bt));
      };
    });
    const mover = e => {
      const r = cv.getBoundingClientRect();
      robot.x = Math.max(24, Math.min(W - 24, (e.clientX - r.left) * W / r.width));
      robot.y = Math.max(80, Math.min(H - 24, (e.clientY - r.top) * H / r.height));
    };
    cv.addEventListener('pointermove', mover); cv.addEventListener('pointerdown', mover);

    function frame(now) {
      if (!alive) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
      cerebro(bicho, dt);
      bicho.x = Math.max(24, Math.min(W - 24, bicho.x));
      if (bicho.y > H + 24) { bicho.y = -20; rastro = []; }
      if (nombre === 'Perseguir' && Math.hypot(robot.x - bicho.x, robot.y - bicho.y) < 26) {
        atrapadas++; bicho.y = -20; bicho.x = 60 + Math.random() * (W - 120); rastro = [];
      }
      rastro.push([bicho.x, bicho.y]); if (rastro.length > 70) rastro.shift();

      g.clearRect(0, 0, W, H);
      rastro.forEach((p, i) => { g.fillStyle = 'rgba(255,210,31,' + (i / rastro.length * .55).toFixed(2) + ')'; g.beginPath(); g.arc(p[0], p[1], 5, 0, 7); g.fill(); });
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#ffffff'; g.font = '700 40px ui-monospace, Consolas, monospace'; g.fillText('@', robot.x, robot.y);
      g.fillStyle = '#e2a54a'; g.font = '700 44px ui-monospace, Consolas, monospace'; g.fillText('M', bicho.x, bicho.y);
      for (let i = 0; i < bicho.vida; i++) { g.fillStyle = '#e0706a'; g.fillRect(bicho.x - 24 + i * 18, bicho.y - 40, 13, 7); }
      g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      g.fillStyle = '#b9b9bd'; g.font = '600 24px ui-monospace, Consolas, monospace';
      g.fillText('bicho.Cerebro = new ' + nombre + '();', 22, 38);
      out.textContent = 'Cambios de cerebro: ' + cambios + ' · bichos creados: 1' + (atrapadas ? ' · te atrapó ' + atrapadas + (atrapadas === 1 ? ' vez' : ' veces') : '');
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => { alive = false; cancelAnimationFrame(raf); };
  };

  /* 7 · Diseño dirigido por datos: editar el bicho en vivo (canvas + archivo de texto) */
  window.DEMOS.datos = function (el) {
    const PRESETS = {
      lento: { simbolo: 'b', vida: 1, velocidad: 2, movimiento: 'recto' },
      rapido: { simbolo: 'B', vida: 1, velocidad: 4, movimiento: 'zigzag' },
      tanque: { simbolo: 'M', vida: 3, velocidad: 1, movimiento: 'perseguir' }
    };
    const DEFECTO = { simbolo: 'b', vida: 1, velocidad: 2, movimiento: 'recto' };
    const MOVS = ['recto', 'zigzag', 'perseguir'];
    const texto = o => JSON.stringify(o, null, 2);

    el.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:18px;align-items:stretch;min-height:0">' +
      '<div style="flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:12px">' +
      '<textarea spellcheck="false" aria-label="Datos del bicho en formato JSON" style="flex:1 1 auto;min-height:11.5em;font:600 .95em/1.4 ui-monospace,Consolas,monospace;padding:.5em .7em;border:3px solid #0d0d0e;border-radius:12px;resize:none;color:#0d0d0e;background:#fff"></textarea>' +
      '<div class="log" role="status"></div></div>' +
      '<canvas width="640" height="420" style="flex:none;margin:0" aria-label="Un bicho que se mueve según los datos del recuadro de texto"></canvas></div>' +
      '<div class="ctl"><button class="sec" data-p="lento">Lento</button><button class="sec" data-p="rapido">Rápido</button><button class="sec" data-p="tanque">Tanque</button><button data-hit>Dar chispazo</button></div>';
    const cv = el.querySelector('canvas'), g = cv.getContext('2d'), W = cv.width, H = cv.height;
    const ta = el.querySelector('textarea'), log = el.querySelector('.log');
    const CASILLA = 28;                       // píxeles por casilla
    let datos = Object.assign({}, DEFECTO), vida = 1, x = W / 2, y = 0, t = 0, flash = 0, last = performance.now(), raf = 0, alive = true;

    // Valida el texto. Devuelve { datos, avisos } o { error }.
    function leer(src) {
      let o;
      try { o = JSON.parse(src); }
      catch (e) { return { error: 'No pude leer el JSON. Revisa comas, llaves y comillas dobles.\nDetalle: ' + e.message }; }
      if (!o || typeof o !== 'object' || Array.isArray(o)) return { error: 'Espero un objeto entre llaves: { "simbolo": "b", ... }' };
      const d = {}, avisos = [];
      for (const k of Object.keys(o)) if (!(k in DEFECTO)) avisos.push('No conozco el campo "' + k + '". ¿Error de dedo? Lo ignoro.');
      for (const k of Object.keys(DEFECTO)) {
        if (o[k] === undefined) { d[k] = DEFECTO[k]; avisos.push('Falta "' + k + '": uso el valor por defecto ' + JSON.stringify(DEFECTO[k]) + '.'); }
        else d[k] = o[k];
      }
      if (typeof d.simbolo !== 'string' || Array.from(d.simbolo).length !== 1) return { error: '"simbolo" debe ser un solo carácter entre comillas, por ejemplo "M".' };
      if (!Number.isInteger(d.vida) || d.vida < 1 || d.vida > 9) return { error: '"vida" debe ser un número entero entre 1 y 9. Recibí: ' + JSON.stringify(d.vida) + '.' };
      if (typeof d.velocidad !== 'number' || !(d.velocidad > 0) || d.velocidad > 12) return { error: '"velocidad" va en casillas por segundo: un número mayor que 0 y hasta 12. Recibí: ' + JSON.stringify(d.velocidad) + '.' };
      if (!MOVS.includes(d.movimiento)) return { error: '"movimiento" debe ser uno de: "recto", "zigzag" o "perseguir". Recibí: ' + JSON.stringify(d.movimiento) + '.' };
      return { datos: d, avisos };
    }
    function aplicar() {
      const r = leer(ta.value);
      if (r.error) {
        ta.style.borderColor = '#e0706a';
        log.textContent = 'DATO INVÁLIDO\n' + r.error + '\nEl juego sigue con los últimos datos válidos.';
        return;
      }
      ta.style.borderColor = '#2e7653';
      datos = r.datos; vida = Math.min(vida, datos.vida) || datos.vida;
      log.textContent = 'Datos aplicados sin recompilar.\n' + (r.avisos.length ? 'Avisos:\n- ' + r.avisos.join('\n- ') : 'Sin avisos: todos los campos presentes y válidos.');
    }
    ta.oninput = aplicar;
    el.querySelectorAll('[data-p]').forEach(b => { b.onclick = () => { ta.value = texto(PRESETS[b.dataset.p]); aplicar(); vida = datos.vida; }; });
    el.querySelector('[data-hit]').onclick = () => { vida--; flash = .25; if (vida <= 0) { y = 0; x = 80 + Math.random() * (W - 160); vida = datos.vida; } };
    ta.value = texto(PRESETS.tanque); aplicar(); vida = datos.vida;

    function frame(now) {
      if (!alive) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; flash = Math.max(0, flash - dt);
      const rx = W / 2 + Math.sin(t * .7) * (W / 2 - 70), v = datos.velocidad * CASILLA;
      y += v * dt;
      if (datos.movimiento === 'zigzag') x += Math.cos(t * 4) * 6 * CASILLA * dt;
      else if (datos.movimiento === 'perseguir') { const dx = rx - x; x += Math.sign(dx) * Math.min(Math.abs(dx), 3 * CASILLA * dt); }
      x = Math.max(24, Math.min(W - 24, x));
      if (y > H - 30) { y = 30; vida = datos.vida; }

      g.clearRect(0, 0, W, H);
      g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1;
      for (let gy = CASILLA; gy < H; gy += CASILLA) { g.beginPath(); g.moveTo(0, gy); g.lineTo(W, gy); g.stroke(); }
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#ffffff'; g.font = '700 36px ui-monospace, Consolas, monospace'; g.fillText('@', rx, H - 26);
      g.fillStyle = flash > 0 ? '#ffffff' : '#e2a54a'; g.font = '700 42px ui-monospace, Consolas, monospace'; g.fillText(datos.simbolo, x, y + 30);
      for (let i = 0; i < vida; i++) { g.fillStyle = '#e0706a'; g.fillRect(x - (vida * 16) / 2 + i * 16, y + 2, 12, 7); }
      g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      g.fillStyle = '#b9b9bd'; g.font = '600 24px "Atkinson Hyperlegible Next", sans-serif';
      g.fillText(datos.movimiento + ' · ' + datos.velocidad + ' casillas/s · vida ' + vida + ' de ' + datos.vida, 18, 32);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => { alive = false; cancelAnimationFrame(raf); };
  };

  /* 8 · Strategy o State: el código se parece, cambia quién decide el cambio */
  window.DEMOS.stateStrategy = function (el) {
    const f = FIG.lienzo(el, 900, 430);
    const tit = f.texto(450, 34, '', { tam: 28, tono: 'white', peso: 800 });
    // State: el jefe y sus tres estados
    const E = ['Patrullar', 'Furia', 'Huir'];
    const est = E.map((n, i) => f.caja(30 + i * 300, 130, 240, 100, n, { tam: 28 }));
    const tr = [f.flecha(est[0], est[1], { rotulo: 'vida < 60 %', ry: -66 }), f.flecha(est[1], est[2], { rotulo: 'vida < 25 %', ry: -66 })];
    // Strategy: la oleada, el bicho y las puntas
    const ole = f.caja(30, 150, 220, 110, 'La oleada', { tam: 26, sub: 'elige desde afuera', tono: 'paper' });
    const bicho = f.caja(330, 150, 240, 110, 'Bicho', { tam: 28, sub: 'Cerebro: Recto' });
    const P = ['Recto', 'ZigZag', 'Perseguir'];
    const pun = P.map((n, i) => f.caja(660, 50 + i * 115, 210, 84, n, { tam: 26 }));
    const fOle = f.flecha(ole, bicho, { rotulo: 'asigna' });
    const fP = pun.map(p => f.flecha(p, bicho, { puntos: true }));
    const vidaT = f.texto(450, 310, '', { tam: 26, tono: 'white', peso: 700 });
    const quien = f.texto(450, 395, '', { tam: 24 });
    let modo = 0, vida, ei, cur;
    const di = FIG.dice(el);
    function pinta() {
      const st = modo === 0;
      est.forEach((c, i) => c.ver(st).tono(i === ei ? 'on' : i < ei ? 'off' : 'base'));
      tr.forEach((a, i) => a.ver(st).tono(i < ei ? 'on' : 'base'));
      [ole, bicho].concat(pun).forEach(c => c.ver(!st)); fOle.ver(!st); fP.forEach(a => a.ver(!st));
      if (!st) { bicho.sub('Cerebro: ' + P[cur]); pun.forEach((p, i) => p.tono(i === cur ? 'on' : 'base')); fP.forEach((a, i) => a.tono(i === cur ? 'on' : 'off')); }
      tit.pon(st ? 'State: el jefe cambia solo' : 'Strategy: alguien de afuera elige');
      vidaT.pon(st ? 'vida del jefe: ' + vida + ' de 10' : 'vida del bicho: ' + vida + ' de 3').color(vida <= (st ? 2 : 1) ? 'coral' : 'white');
      quien.pon(st ? 'las flechas viven dentro de los estados' : 'ninguna punta conoce a las otras');
    }
    function reset() {
      vida = modo === 0 ? 10 : 3; ei = 0; cur = 0; pinta();
      di(modo === 0 ? 'El jefe patrulla con vida llena. Golpéalo y mira <b>quién</b> decide el cambio de estado.' : 'El bicho baja recto. Golpéalo y luego deja que la oleada elija otra punta.');
    }
    const c = FIG.controles(el);
    c.opciones(['State: el jefe', 'Strategy: el bicho'], i => { modo = i; reset(); });
    c.boton('Golpear', () => {
      if (modo === 0) {
        if (vida === 0) return di('El jefe cayó. Reinicia para verlo otra vez.');
        vida = Math.max(0, vida - 2);
        const nuevo = vida >= 6 ? 0 : vida >= 3 ? 1 : 2, antes = ei; ei = nuevo; pinta();
        if (vida === 0) di('El jefe cayó.', 'ok');
        else if (nuevo !== antes) di(`El estado <b>${E[antes]}</b> vio vida ${vida} de 10 y decidió pasar a <b>${E[nuevo]}</b>. Nadie de afuera eligió: eso es <b>State</b>.`, 'ok');
        else di(`Vida ${vida} de 10. ${E[ei]} sigue al mando: todavía no se cumple su condición de salida.`);
      } else {
        vida = Math.max(1, vida - 1); pinta();
        di(`El bicho tiene ${vida} de vida y su cerebro sigue siendo <b>${P[cur]}</b>. Una estrategia no se cambia sola.`);
      }
    });
    c.boton('La oleada elige otra punta', () => {
      if (modo === 0) return di('En State nadie de afuera elige. Si la oleada pudiera poner al jefe en Huir con vida llena, se saltaría sus reglas.', 'bad');
      cur = (cur + 1) % 3; pinta();
      di(`La oleada ejecutó <code>bicho.Cerebro = new ${P[cur]}()</code>. Conserva su vida y <b>${P[cur]}</b> ni sabe que existen las otras: eso es <b>Strategy</b>.`, 'ok');
    });
    c.boton('Reiniciar', reset, true);
    reset();
  };

  /* 9 · Del archivo al bicho: dónde debe morir un error de datos */
  window.DEMOS.tuberia = function (el) {
    const f = FIG.lienzo(el, 900, 430);
    const CASOS = [
      { t: 'velocidad -3', linea: '{ "id": "rapido", "vida": 1, "velocidad": -3 }' },
      { t: 'falta vida', linea: '{ "id": "rapido", "velocidad": 4 }' },
      { t: 'coma de más', linea: '{ "id": "rapido", "vida": 1, "velocidad": 4, }' },
      { t: 'dato correcto', linea: '{ "id": "rapido", "vida": 1, "velocidad": 4 }' }
    ];
    f.nodo('rect', { x: 20, y: 20, width: 860, height: 92, rx: 14, fill: FIG.C.paper, stroke: '#fff', 'stroke-width': 3 });
    f.texto(450, 46, 'juego.json', { tam: 22, color: FIG.C.ink, peso: 800 });
    const lin = f.texto(450, 84, '', { tam: 24, color: FIG.C.ink, peso: 700 });
    lin.t.setAttribute('font-family', 'ui-monospace, Consolas, monospace');
    const N = ['Archivo', 'Cargador', 'Fábrica', 'Juego'];
    const caj = N.map((n, i) => f.caja(20 + i * 230, 160, 180, 104, n, { tam: 26, sub: ' ' }));
    const fl = [0, 1, 2].map(i => f.flecha(caj[i], caj[i + 1]));
    const res = f.texto(450, 320, '', { tam: 26, tono: 'white', peso: 700 });
    f.texto(450, 380, 'un error de datos debe morir en el cargador, no en pleno juego', { tam: 22 });
    let caso = 0, validar = true, timer = 0;
    const di = FIG.dice(el);
    function plan() {
      const v = validar;
      if (caso === 3) return { t: ['ok', 'ok', 'ok', 'ok'], s: ['bien escrito', v ? 'valida: todo bien' : 'no revisa', 'arma el bicho', 'baja normal'], r: 'llegó al juego, como debe ser', msg: v ? 'Los datos pasan por las cuatro cajas. El cargador revisó y no encontró nada raro.' : 'Los datos pasan por las cuatro cajas. Esta vez salió bien, pero nadie revisó: el próximo error llegará hasta el juego.', tono: v ? 'ok' : '' };
      if (caso === 0) return v
        ? { t: ['bad', 'bad', 'off', 'off'], s: ['velocidad -3', 'lo rechaza', '', ''], r: 'se detuvo en el cargador', msg: 'Mensaje al cargar: «juego.json, bicho rapido: la velocidad debe ser mayor que 0 y vale -3». El juego no arranca con datos rotos.', tono: 'ok' }
        : { t: ['bad', 'base', 'base', 'bad'], s: ['velocidad -3', 'no revisa', 'arma el bicho', 'sube al revés'], r: 'el error llegó hasta el juego', msg: 'El bicho rápido <b>sube</b> en vez de bajar y se pierde por arriba. Nadie sabe por qué: el error viajó por todas las cajas.', tono: 'bad' };
      if (caso === 1) return v
        ? { t: ['bad', 'on', 'ok', 'ok'], s: ['falta vida', 'avisa y usa 1', 'arma el bicho', 'normal'], r: 'aviso en el cargador, el juego sigue', msg: 'Aviso al cargar: «a rapido le falta vida; uso el valor por defecto 1». El juego sigue y el diseñador sabe qué pasó.', tono: 'ok' }
        : { t: ['bad', 'base', 'base', 'bad'], s: ['falta vida', 'no revisa', 'vida = 0', 'muere al nacer'], r: 'el error llegó hasta el juego', msg: 'Sin valor por defecto, un entero queda en 0: el bicho muere al aparecer, o nunca muere, según cómo esté escrito el <code>if</code>.', tono: 'bad' };
      return v
        ? { t: ['bad', 'bad', 'off', 'off'], s: ['coma de más', 'JSON inválido', '', ''], r: 'se detuvo en el cargador', msg: 'Mensaje al cargar: «juego.json no es JSON válido: sobra una coma antes de la llave». El error se ve antes de jugar, con archivo y causa.', tono: 'ok' }
        : { t: ['bad', 'bad', 'off', 'off'], s: ['coma de más', 'excepción', '', ''], r: 'se cayó sin explicar nada', msg: 'Sale una excepción sin contexto y el juego se cierra. O peor: alguien la atrapó con un <code>catch</code> vacío y la oleada sale sin bichos.', tono: 'bad' };
    }
    function prepara() {
      clearInterval(timer);
      lin.pon(CASOS[caso].linea);
      caj.forEach((c, i) => c.tono('base').sub(i === 1 ? (validar ? 'valida' : 'no revisa') : ' '));
      fl.forEach(a => a.tono('base')); res.pon('');
      di('Predice en qué caja se detiene este dato y luego dale <b>Cargar</b>.');
    }
    function cargar() {
      prepara(); const p = plan(); let i = -1;
      caj.forEach(c => c.tono('off').sub(' '));
      timer = setInterval(() => {
        i++;
        if (i > 3 || p.t[i] === 'off') { clearInterval(timer); res.pon(p.r).color(p.tono === 'bad' ? 'coral' : 'white'); di(p.msg, p.tono); return; }
        caj[i].tono(p.t[i]).sub(p.s[i]);
        if (i > 0) fl[i - 1].tono(p.t[i] === 'bad' && i === 3 ? 'bad' : 'on');
      }, 450);
    }
    const c = FIG.controles(el);
    c.opciones(CASOS.map(x => x.t), i => { caso = i; prepara(); });
    c.casilla('Cargador que valida', v => { validar = v; prepara(); }, true);
    c.boton('Cargar', cargar);
    prepara();
    return () => clearInterval(timer);
  };
})();
