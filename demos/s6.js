/* Figuras de la semana 6: crecer, ciudad, nucleo, dependencias, radio, bus, mods, hojaCalculo,
   fuga, motorOScript y ecsEscala.
   Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   Las figuras nuevas usan FIG (assets/fig.js). Las cifras que muestran son ilustrativas. */
window.DEMOS = window.DEMOS || {};

/* 1 · crecer: el equipo y el contenido crecen sobre un archivo o sobre módulos */
window.DEMOS.crecer = function (el) {
  const f = FIG.lienzo(el, 900, 400);
  const GENTE = ['Ana', 'Beto', 'Caro', 'Dani', 'Eli'], MOD = ['Nucleo', 'Consola', 'Audio', 'Datos', 'Pruebas'];
  const px = i => 130 + i * 160;
  const unico = f.caja(250, 150, 400, 100, 'Program.cs', { tam: 32 });
  const mods = MOD.map((m, i) => f.caja(px(i) - 74, 158, 148, 88, m, { tam: 24 }));
  const aUnico = GENTE.map((_, i) => f.flecha([px(i), 86], unico));
  const aMods = GENTE.map((_, i) => f.flecha([px(i), 86], mods[i]));
  const gente = GENTE.map((n, i) => ({ c: f.circulo(px(i), 46, 36, { tono: 'yellow', borde: '#fff' }), t: f.texto(px(i), 46, n, { tam: 22, color: FIG.C.ink, peso: 800 }) }));
  const t1 = f.texto(450, 296, '', { tam: 24, tono: 'white', peso: 700 });
  const t2 = f.texto(450, 334, '', { tam: 24, tono: 'white', peso: 700 });
  f.texto(450, 378, 'cifras ilustrativas', { tam: 22 });
  const di = FIG.dice(el);
  let modo = 0, n = 1, tipos = 3;
  function pinta() {
    const pares = n * (n - 1) / 2, grave = pares >= 3 || tipos > 12;
    gente.forEach((g, i) => { g.c.ver(i < n); g.t.ver(i < n); });
    unico.ver(!modo).tono(grave ? 'bad' : 'base');
    mods.forEach(m => m.ver(!!modo).tono('base'));
    aUnico.forEach((a, i) => a.ver(!modo && i < n).tono(pares >= 3 ? 'bad' : 'base'));
    aMods.forEach((a, i) => a.ver(!!modo && i < n).tono('ok'));
    if (!modo) {
      t1.pon('parejas que se pueden pisar: ' + pares);
      t2.pon('ramas de if por tipo de bicho: ' + tipos * 4);
      if (pares >= 3) di(n + ' personas editan el mismo archivo: ' + pares + ' parejas que se pueden pisar. Primero se rompe el equipo, no el computador.', 'bad');
      else if (tipos > 12) di(tipos + ' tipos de bicho por 4 lugares con if son ' + tipos * 4 + ' ramas que alguien debe recordar. Un olvido es un bug.', 'bad');
      else if (n === 2) di('Dos personas en un archivo ya chocan de vez en cuando. Sigue subiendo el equipo.');
      else di('Una persona y pocos bichos: el espagueti aguanta. Por eso nadie lo ordena a tiempo. Sube el equipo o los bichos.');
    } else {
      mods[3].tono(tipos > 3 ? 'on' : 'base');
      t1.pon('cada persona en su módulo');
      t2.pon('un bicho nuevo es una fila en Datos');
      di('Con ' + n + (n === 1 ? ' persona' : ' personas') + ' y ' + tipos + ' tipos de bicho, cada quien trabaja en su módulo y un bicho nuevo no toca código que ya funciona.', 'ok');
    }
  }
  const c = FIG.controles(el);
  c.opciones(['Un solo archivo', 'Por módulos'], i => { modo = i; pinta(); });
  c.deslizador('Equipo', 1, 5, 1, 1, v => { n = v; pinta(); });
  c.deslizador('Tipos de bicho', 3, 40, 3, 1, v => { tipos = v; pinta(); });
  pinta();
};

/* 2 · ciudad: atajos por los patios contra avenidas */
window.DEMOS.ciudad = function (el) {
  const f = FIG.lienzo(el, 900, 430), N = ['Reglas', 'Pantalla', 'Sonido', 'Datos', 'Entrada', 'Pruebas'];
  const P = N.map((_, i) => { const a = (i * 60 - 90) * Math.PI / 180; return [450 + 310 * Math.cos(a), 215 + 160 * Math.sin(a)]; });
  const atajos = [];
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) atajos.push({ i, j, ln: f.linea(P[i][0], P[i][1], P[j][0], P[j][1], { tono: 'coral', grosor: 4 }) });
  const vias = P.map(p => f.linea(p[0], p[1], 450, 215, { tono: 'yellow', grosor: 7 }));
  const av = f.caja(340, 182, 220, 66, 'Avenida', { tono: 'on', tam: 28 });
  const barrios = N.map((n, i) => f.caja(P[i][0] - 85, P[i][1] - 30, 170, 60, n, { tam: 25 }));
  const cuenta = f.texto(24, 30, '', { ancla: 'start', tam: 24, tono: 'white', peso: 800 });
  const di = FIG.dice(el);
  let modo = 0, n = 3;
  const ver = (ln, v) => { ln.style.display = v ? '' : 'none'; };
  function pinta() {
    const c = modo ? n : n * (n - 1) / 2;
    atajos.forEach(a => ver(a.ln, !modo && a.i < n && a.j < n));
    vias.forEach((v, i) => ver(v, !!modo && i < n));
    av.ver(!!modo); barrios.forEach((b, i) => b.ver(i < n));
    cuenta.pon('conexiones: ' + c);
    if (modo) di(n + ' barrios, ' + n + ' conexiones. El próximo barrio trae una sola: su salida a la avenida.', 'ok');
    else if (n <= 3) di(n + ' barrios y ' + c + (c === 1 ? ' atajo' : ' atajos') + ' por los patios. Todavía se ve manejable. Suma barrios.');
    else di(n + ' barrios, ' + c + ' atajos. El próximo barrio trae ' + n + ' más: a cada casa nueva hay que abrirle paso por todos los patios.', 'bad');
  }
  const c = FIG.controles(el);
  c.opciones(['Por los patios', 'Por avenidas'], i => { modo = i; pinta(); });
  c.deslizador('Barrios', 2, 6, 3, 1, v => { n = v; pinta(); });
  pinta();
};

/* 3 · nucleo: reglas al centro, adaptadores afuera, flechas hacia adentro */
window.DEMOS.nucleo = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  f.nodo('ellipse', { cx: 450, cy: 215, rx: 436, ry: 206, fill: 'rgba(255,255,255,.05)', stroke: 'rgba(255,255,255,.4)', 'stroke-width': 3, 'stroke-dasharray': '10 9' });
  f.nodo('ellipse', { cx: 450, cy: 215, rx: 200, ry: 92, fill: 'rgba(255,210,31,.16)', stroke: FIG.C.yellow, 'stroke-width': 3 });
  f.texto(150, 120, 'afuera: aparatos', { tam: 22 });
  const nuc = f.caja(345, 175, 210, 80, 'Núcleo', { tono: 'on', tam: 30 });
  const pant = f.caja(24, 180, 236, 70, 'PantallaConsola', { tam: 24 });
  const aud = f.caja(640, 180, 236, 70, 'AudioConsola', { tam: 24 });
  const gua = f.caja(332, 20, 236, 64, 'GuardadoArchivo', { tam: 24 });
  const pru = f.caja(332, 346, 236, 64, 'Pruebas', { tam: 24 });
  const hacia = [f.flecha(pant, nuc), f.flecha(aud, nuc, { desvio: 15 }), f.flecha(gua, nuc), f.flecha(pru, nuc)];
  const mala = f.flecha(nuc, aud, { desvio: 15, tono: 'bad', grosor: 5 });
  const malaT = f.texto(720, 290, 'new AudioConsola()', { tam: 22, color: '#eb9a94', peso: 700 });
  const linea = f.texto(170, 320, '', { tam: 22, tono: 'white', peso: 700 });
  const di = FIG.dice(el);
  let unity = 0, atajo = false;
  function pinta() {
    pant.rotulo(unity ? 'VistaUnity' : 'PantallaConsola').tono(unity ? 'ok' : 'base');
    aud.rotulo(unity ? 'AudioUnity' : 'AudioConsola').tono(unity ? 'ok' : 'base');
    gua.rotulo(unity ? 'GuardadoUnity' : 'GuardadoArchivo').tono(unity ? 'ok' : 'base');
    hacia.forEach(h => h.tono('base'));
    mala.ver(atajo); malaT.ver(atajo);
    nuc.tono(atajo && unity ? 'bad' : 'on');
    linea.pon(atajo && unity ? 'no compila' : atajo ? '' : 'núcleo: 0 cambios');
    if (!atajo && !unity) di('Todas las flechas apuntan hacia adentro. El núcleo no sabe quién está conectado a sus enchufes.');
    else if (!atajo) di('Cambiaste tres aparatos de afuera. Líneas tocadas en el núcleo: cero. Las reglas viajaron intactas a Unity.', 'ok');
    else if (!unity) di('Una flecha sale del núcleo: las reglas crean un AudioConsola y ya conocen la consola. Funciona, por ahora. Cambia a Unity.', 'bad');
    else di('En Unity no existe AudioConsola: el núcleo no compila y toca abrirlo. Un atajo de una línea amarró las reglas a la consola.', 'bad');
  }
  const c = FIG.controles(el);
  c.opciones(['Consola', 'Unity'], i => { unity = i; pinta(); });
  c.casilla('Atajo: el núcleo crea un AudioConsola', v => { atajo = v; pinta(); });
  pinta();
};

/* 4 · dependencias: flechas "depende de", ciclos y flechas que salen del núcleo */
window.DEMOS.dependencias = function (el) {
  el.innerHTML = '<canvas width="900" height="430" aria-label="Mapa de cinco módulos con flechas de dependencia que puedes activar y desactivar"></canvas>' +
    '<div class="ctl"><button data-a="sano">Ejemplo sano</button><button class="sec" data-a="nudo">Enredado</button><button class="sec" data-a="borrar">Borrar</button><span class="out sel"></span></div>' +
    '<div class="log" role="status"></div>';
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), W = cv.width, H = cv.height;
  const log = el.querySelector('.log'), selOut = el.querySelector('.sel');
  const N = [
    { id: 'Nucleo', sub: 'reglas del juego', x: 450, y: 215 },
    { id: 'Consola', sub: 'teclado y pantalla', x: 150, y: 75 },
    { id: 'Audio', sub: 'sonidos', x: 750, y: 75 },
    { id: 'Datos', sub: 'JSON y disco', x: 150, y: 355 },
    { id: 'Pruebas', sub: 'xUnit', x: 750, y: 355 }
  ];
  const BW = 240, BH = 92;
  const PRE = {
    inicio: ['0>1', '0>2', '0>3', '4>0'],
    sano: ['1>0', '2>0', '3>0', '4>0', '1>2', '1>3'],
    nudo: ['1>0', '0>2', '2>3', '3>1', '4>0'],
    borrar: []
  };
  let E = new Set(PRE.inicio), sel = -1;

  const has = (a, b) => E.has(a + '>' + b);
  function camino(a, b) {            // camino de a hasta b siguiendo flechas, o null
    const prev = { [a]: -1 }, cola = [a];
    while (cola.length) {
      const u = cola.shift();
      if (u === b) { const p = []; for (let x = b; x !== -1; x = prev[x]) p.unshift(x); return p; }
      for (let v = 0; v < N.length; v++) if (has(u, v) && !(v in prev)) { prev[v] = u; cola.push(v); }
    }
    return null;
  }
  function borde(c, ux, uy) {        // punto donde la recta sale de la caja
    const t = Math.min(ux ? (BW / 2 + 6) / Math.abs(ux) : 1e9, uy ? (BH / 2 + 6) / Math.abs(uy) : 1e9);
    return [c.x + ux * t, c.y + uy * t];
  }
  function flecha(a, b, mala) {
    const A = N[a], B = N[b];
    let dx = B.x - A.x, dy = B.y - A.y; const d = Math.hypot(dx, dy); dx /= d; dy /= d;
    const off = has(b, a) ? 13 : 0, ox = -dy * off, oy = dx * off;
    const p = borde(A, dx, dy), q = borde(B, -dx, -dy);
    const x1 = p[0] + ox, y1 = p[1] + oy, x2 = q[0] + ox, y2 = q[1] + oy;
    g.strokeStyle = g.fillStyle = mala ? '#e0706a' : '#ffffff'; g.lineWidth = mala ? 6 : 4;
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2 - dx * 10, y2 - dy * 10); g.stroke();
    g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - dx * 22 - dy * 11, y2 - dy * 22 + dx * 11); g.lineTo(x2 - dx * 22 + dy * 11, y2 - dy * 22 - dx * 11); g.closePath(); g.fill();
  }
  function caja(n, i) {
    const x = n.x - BW / 2, y = n.y - BH / 2;
    g.fillStyle = i === 0 ? '#e2a54a' : '#2b2b30';
    g.strokeStyle = sel === i ? '#e2a54a' : '#ffffff'; g.lineWidth = sel === i ? 6 : 2;
    g.beginPath(); g.rect(x, y, BW, BH); g.fill(); g.stroke();
    if (sel === i && i === 0) { g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.strokeRect(x - 6, y - 6, BW + 12, BH + 12); }
    g.fillStyle = i === 0 ? '#0d0d0e' : '#ffffff'; g.textAlign = 'center';
    g.font = '700 28px "Atkinson Hyperlegible Next", sans-serif'; g.fillText(n.id, n.x, n.y - 6);
    g.font = '500 24px "Atkinson Hyperlegible Next", sans-serif'; g.fillText(n.sub, n.x, n.y + 26);
  }
  function pintar() {
    const lineas = [], vistos = new Set(), malas = new Set();
    E.forEach(k => {
      const [a, b] = k.split('>').map(Number);
      if (a === 0) { malas.add(k); lineas.push('Nucleo depende de ' + N[b].id + ': las reglas conocen un detalle. Voltea la flecha: que Nucleo declare la interfaz y ' + N[b].id + ' la implemente.'); }
      const p = camino(b, a);
      if (p) {
        malas.add(k);
        const clave = p.slice().sort().join(',');
        if (!vistos.has(clave)) { vistos.add(clave); lineas.push('Ciclo: ' + p.concat(p[0]).map(i => N[i].id).join(' → ') + '. Ninguno se puede compilar ni probar sin los otros.'); }
      }
      if (b === 4) lineas.push(N[a].id + ' depende de Pruebas: el juego no debería necesitar sus pruebas para funcionar.');
    });
    g.clearRect(0, 0, W, H);
    E.forEach(k => { const [a, b] = k.split('>').map(Number); flecha(a, b, malas.has(k)); });
    N.forEach(caja);
    g.textAlign = 'left';
    let txt;
    if (!E.size) txt = 'Sin flechas nadie usa a nadie: no hay juego. Toca un módulo y luego otro para crear una dependencia.';
    else if (lineas.length) txt = 'Hay ' + malas.size + (malas.size === 1 ? ' flecha en coral.\n' : ' flechas en coral.\n') + lineas.join('\n');
    else {
      txt = 'Sano: ninguna flecha sale del núcleo y no hay ciclos. Puedes cambiar Consola por Unity sin abrir Nucleo.';
      if (!has(4, 0)) txt += '\nOjo: Pruebas no depende de Nucleo, así que nadie está probando las reglas.';
      if (![1, 2, 3].some(i => has(i, 0))) txt += '\nOjo: ningún detalle se conecta al núcleo todavía.';
    }
    log.textContent = txt;
    selOut.textContent = sel < 0 ? '' : N[sel].id + ' depende de...';
  }
  function clic(e) {
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
    const i = N.findIndex(n => Math.abs(x - n.x) <= BW / 2 + 8 && Math.abs(y - n.y) <= BH / 2 + 8);
    if (i < 0) sel = -1;
    else if (sel < 0) sel = i;
    else if (sel === i) sel = -1;
    else { const k = sel + '>' + i; if (E.has(k)) E.delete(k); else E.add(k); sel = -1; }
    pintar();
  }
  cv.addEventListener('click', clic);
  cv.style.cursor = 'pointer';
  el.querySelectorAll('button[data-a]').forEach(b => { b.onclick = () => { E = new Set(PRE[b.dataset.a]); sel = -1; pintar(); }; });
  pintar();
  return () => { cv.removeEventListener('click', clic); };
};

/* 5 · radio: la emisora contra llamar por teléfono a cada oyente */
window.DEMOS.radio = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const loc = f.caja(20, 172, 190, 86, 'Locutor', { tam: 28 });
  const emi = f.caja(330, 165, 190, 100, 'Emisora', { tam: 28, tono: 'paper' });
  const OY = ['Puntaje', 'Audio', 'Efectos', 'Logros'].map((n, i) => {
    const o = { n, on: true, veces: 0 };
    o.caja = f.caja(628, 20 + i * 100, 252, 86, n + ' · 0', { tam: 26, clic: () => toca(o) });
    return o;
  });
  const fLoc = f.flecha(loc, emi, { rotulo: 'BichoMurio', tam: 22, ry: -8 });
  const fOy = OY.map(o => f.flecha(emi, o.caja));
  const directas = OY.map(o => f.flecha(loc, o.caja));
  const di = FIG.dice(el);
  let modo = 0, timers = [];
  const luego = (ms, fn) => timers.push(setTimeout(fn, ms));
  function pinta() {
    timers.forEach(clearTimeout); timers = [];
    loc.tono('base'); emi.ver(!modo).tono('paper'); fLoc.ver(!modo).tono('base');
    OY.forEach((o, i) => {
      o.caja.tono(o.on ? 'base' : 'off').rotulo(o.n + ' · ' + (o.on ? o.veces : 'apagado'));
      fOy[i].ver(!modo && o.on).tono('base');
      directas[i].ver(!!modo).tono(o.on ? 'base' : 'off');
    });
  }
  function toca(o) {
    o.on = !o.on; pinta();
    di(o.on ? o.n + ' volvió a sintonizar. Transmite otra vez.' : o.n + ' apagó su radio. Transmite otra vez y fíjate en el locutor.');
  }
  function transmitir() {
    pinta(); loc.tono('on');
    const oyen = OY.filter(o => o.on), faltan = OY.filter(o => !o.on);
    if (!modo) {
      luego(250, () => { fLoc.tono('on'); emi.tono('on'); });
      luego(600, () => {
        OY.forEach((o, i) => { if (o.on) { o.veces++; o.caja.tono('ok').rotulo(o.n + ' · ' + o.veces); fOy[i].tono('ok'); } });
        if (!oyen.length) di('Nadie sintonizado. El locutor transmitió igual y no falló: ni se entera de quién lo oye.');
        else di('Lo oyeron ' + oyen.length + ' de 4. El locutor no conoce a ninguno: apaga o suma oyentes y él no cambia una línea.', 'ok');
      });
    } else {
      luego(300, () => {
        OY.forEach((o, i) => { if (o.on) { o.veces++; o.caja.tono('ok').rotulo(o.n + ' · ' + o.veces); directas[i].tono('ok'); } else directas[i].tono('bad'); });
        if (faltan.length) di('El locutor llamó a ' + faltan.map(o => o.n).join(' y a ') + ' y nadie contestó. Como conoce a cada oyente, cuando uno falta el que falla es él.', 'bad');
        else di('Funciona, pero el locutor tuvo que aprenderse cuatro números. Cada oyente nuevo obliga a editar al locutor.');
      });
    }
  }
  const c = FIG.controles(el);
  c.boton('Transmitir BichoMurio', transmitir);
  c.opciones(['Con emisora', 'Sin emisora'], i => { modo = i; pinta(); di(i ? 'Sin emisora, el locutor llama a cada oyente por teléfono. Apaga uno y transmite.' : 'Con emisora, el locutor solo conoce la emisora. Toca un oyente para apagarlo.'); });
  pinta(); di('Transmite. Luego toca un oyente para apagar su radio y vuelve a transmitir.');
  return () => { timers.forEach(clearTimeout); timers = []; };
};

/* 6 · bus: emisores, emisora y oyentes que se pueden apagar */
window.DEMOS.bus = function (el) {
  el.innerHTML = '<canvas width="900" height="420" aria-label="Tres emisores publican eventos en un bus y cuatro oyentes los reciben"></canvas>' +
    '<div class="ctl"><span class="out">Publicar:</span><button data-e="0">BichoMurio</button><button data-e="1">OleadaTermino</button><button data-e="2">RobotHerido</button><button class="sec" data-e="x">Limpiar</button></div>' +
    '<div class="log" role="status">Publica un evento. Toca un oyente para apagarlo o encenderlo.</div>';
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), W = cv.width, H = cv.height, log = el.querySelector('.log');
  const EV = [
    { n: 'BichoMurio', c: '#e2a54a' },
    { n: 'OleadaTermino', c: '#ffffff' },
    { n: 'RobotHerido', c: '#eb9a94' }
  ];
  const EM = [{ n: 'Bicho', y: 90 }, { n: 'Oleadas', y: 210 }, { n: 'Robot', y: 330 }];
  const OY = [
    { n: 'Puntaje', oye: [0, 1], y: 62 },
    { n: 'Audio', oye: [0, 2], y: 161 },
    { n: 'Efectos', oye: [0, 2], y: 260 },
    { n: 'Guardado', oye: [1], y: 359 }
  ];
  OY.forEach(o => { o.on = true; o.cuenta = 0; o.flash = 0; });
  const EX = 130, EWd = 240, BX = 420, OX = 740, OW = 300, OH = 84;
  let msgs = [], lineas = [], raf = 0, alive = true, last = performance.now();

  function publicar(i) {
    const quien = OY.filter(o => o.on && o.oye.includes(i));
    msgs.push({ ev: i, x0: EX + EWd / 2, y0: EM[i].y, x1: BX, y1: EM[i].y, t: 0, dur: .45, next: quien });
    const texto = EM[i].n + ' publicó ' + EV[i].n + ' → ' + (quien.length ? 'lo oyeron: ' + quien.map(o => o.n).join(', ') + '.' : 'nadie escuchaba. El emisor no se entera y sigue funcionando.');
    lineas.push(texto); if (lineas.length > 5) lineas.shift();
    log.textContent = lineas.join('\n'); log.scrollTop = log.scrollHeight;
  }
  function caja(x, y, w, h, relleno, borde, grosor) {
    g.fillStyle = relleno; g.strokeStyle = borde; g.lineWidth = grosor;
    g.beginPath(); g.rect(x - w / 2, y - h / 2, w, h); g.fill(); g.stroke();
  }
  function frame(now) {
    if (!alive) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const nuevos = [];
    msgs.forEach(m => {
      m.t += dt / m.dur;
      if (m.t < 1) return;
      if (m.next) m.next.forEach(o => nuevos.push({ ev: m.ev, x0: BX, y0: m.y1, x1: OX - OW / 2, y1: o.y, t: 0, dur: .55, dest: o }));
      else if (m.dest) { m.dest.cuenta++; m.dest.flash = 1; }
    });
    msgs = msgs.filter(m => m.t < 1).concat(nuevos);
    OY.forEach(o => { o.flash = Math.max(0, o.flash - dt * 2.2); });

    g.clearRect(0, 0, W, H);
    g.textAlign = 'center';
    g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 2;        // cables
    EM.forEach(e => { g.beginPath(); g.moveTo(EX + EWd / 2, e.y); g.lineTo(BX, e.y); g.stroke(); });
    OY.forEach(o => { if (!o.on) return; o.oye.forEach(i => { g.beginPath(); g.moveTo(BX, EM[i].y); g.lineTo(OX - OW / 2, o.y); g.stroke(); }); });
    caja(BX, H / 2, 74, H - 50, '#2b2b30', '#ffffff', 2);            // la emisora
    g.fillStyle = '#ffffff'; g.font = '700 25px "Atkinson Hyperlegible Next", sans-serif';
    g.save(); g.translate(BX + 8, H / 2); g.rotate(-Math.PI / 2); g.fillText('BUS DE EVENTOS', 0, 0); g.restore();
    EM.forEach((e, i) => {                                           // emisores
      caja(EX, e.y, EWd, 80, '#0d0d0e', EV[i].c, 3);
      g.fillStyle = '#ffffff'; g.font = '700 26px "Atkinson Hyperlegible Next", sans-serif'; g.fillText(e.n, EX, e.y - 6);
      g.fillStyle = EV[i].c; g.font = '600 24px "Atkinson Hyperlegible Next", sans-serif'; g.fillText(EV[i].n, EX, e.y + 24);
    });
    OY.forEach(o => {                                                // oyentes
      const f = o.flash;
      caja(OX, o.y, OW, OH, o.on ? (f > 0 ? 'rgba(15,122,85,' + (.35 + f * .65) + ')' : '#2e7653') : '#0d0d0e', o.on ? '#ffffff' : 'rgba(255,255,255,.4)', o.on ? 2 + f * 3 : 2);
      g.fillStyle = o.on ? '#ffffff' : 'rgba(255,255,255,.6)';
      g.font = '700 26px "Atkinson Hyperlegible Next", sans-serif'; g.fillText(o.n + (o.on ? '   ' + o.cuenta : '   (apagado)'), OX, o.y - 6);
      g.font = '500 24px "Atkinson Hyperlegible Next", sans-serif'; g.fillText('oye a ' + o.oye.map(i => EM[i].n).join(' y '), OX, o.y + 24);
    });
    msgs.forEach(m => {                                              // mensajes viajando
      const k = m.t * m.t * (3 - 2 * m.t), x = m.x0 + (m.x1 - m.x0) * k, y = m.y0 + (m.y1 - m.y0) * k;
      g.fillStyle = EV[m.ev].c; g.strokeStyle = '#0d0d0e'; g.lineWidth = 3;
      g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill(); g.stroke();
    });
    g.textAlign = 'left';
    raf = requestAnimationFrame(frame);
  }
  function clic(e) {
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
    const o = OY.find(q => Math.abs(x - OX) <= OW / 2 + 6 && Math.abs(y - q.y) <= OH / 2 + 6);
    if (!o) return;
    o.on = !o.on;
    lineas.push(o.n + (o.on ? ' volvió a sintonizar.' : ' se apagó. Los emisores no cambian ni una línea.')); if (lineas.length > 5) lineas.shift();
    log.textContent = lineas.join('\n'); log.scrollTop = log.scrollHeight;
  }
  cv.addEventListener('click', clic);
  cv.style.cursor = 'pointer';
  el.querySelectorAll('button[data-e]').forEach(b => {
    b.onclick = () => {
      if (b.dataset.e === 'x') { msgs = []; lineas = []; OY.forEach(o => { o.cuenta = 0; o.flash = 0; o.on = true; }); log.textContent = 'Publica un evento. Toca un oyente para apagarlo o encenderlo.'; }
      else publicar(+b.dataset.e);
    };
  });
  raf = requestAnimationFrame(frame);
  return () => { alive = false; cancelAnimationFrame(raf); cv.removeEventListener('click', clic); };
};

/* 7 · mods: el motor queda fijo y el script de Lua decide cómo se mueve el bicho */
window.DEMOS.mods = function (el) {
  const f = FIG.lienzo(el, 900, 430), X0 = 180, Y0 = 84, ALTO = 296;
  f.nodo('rect', { x: 30, y: 24, width: 300, height: 382, rx: 14, fill: 'rgba(255,255,255,.06)', stroke: 'rgba(255,255,255,.5)', 'stroke-width': 3 });
  f.texto(180, 50, 'el juego', { tam: 22 });
  const rastro = f.trazo('', { color: 'rgba(255,210,31,.5)', grosor: 4 });
  const bicho = f.texto(X0, Y0, 'B', { tam: 40, tono: 'yellow', peso: 900 });
  const motor = f.caja(380, 24, 490, 84, 'Motor en C# (compilado)', { tam: 28 });
  f.flecha([420, 116], [420, 188], { tono: 'on', rotulo: '¿cuánto me muevo?', tam: 22, rx: 120, ry: 12 });
  f.caja(380, 196, 490, 222, '', { tono: 'paper' });
  const nombre = f.texto(400, 222, '', { tam: 22, color: FIG.C.cobalt, ancla: 'start', peso: 800 });
  const L = [0, 1, 2, 3, 4].map(i => { const t = f.texto(396, 258 + i * 31, '', { tam: 22, color: FIG.C.ink, ancla: 'start', peso: 500 }); t.t.style.fontFamily = '"JetBrains Mono", monospace'; return t; });
  const tri = v => { const k = ((v % 1) + 1) % 1; return k < .5 ? 4 * k - 1 : 3 - 4 * k; };
  const S = [
    { n: 'recto.lua', src: ['function mover(b, dt)', '  return 0, 3 * dt', 'end'], pos: u => [X0, Y0 + ALTO * u], d: 'baja derecho' },
    { n: 'zigzag.lua', src: ['function mover(b, dt)', '  local dx = lado(b.y)', '  return dx * 6 * dt, 3 * dt', 'end'], pos: u => [X0 + 100 * tri(u * 4), Y0 + ALTO * u], d: 'baja en zigzag' },
    { n: 'saltos.lua', src: ['function mover(b, dt)', '  if espera(b) then', '    return 0, 0 end', '  return 0, 9 * dt', 'end'], pos: u => { const k = u * 6, e = Math.floor(k); return [X0, Y0 + ALTO * (e + Math.min(1, (k - e) * 3)) / 6]; }, d: 'avanza a saltos y espera' }
  ];
  const di = FIG.dice(el, 'El motor pregunta y el script responde. Cambia de script y mira al bicho.');
  let s = 0, u = 0, pts = [];
  function carga(i) {
    s = i; u = 0; pts = []; motor.tono('base');
    nombre.pon('mods/' + S[i].n);
    L.forEach((t, j) => t.pon((S[i].src[j] || '').replace(/ /g, ' ')));
  }
  function tick() {
    u += .012; if (u >= 1) { u = 0; pts = []; }
    const p = S[s].pos(u); pts.push(p);
    bicho.t.setAttribute('x', p[0]); bicho.t.setAttribute('y', p[1]);
    rastro.setAttribute('d', pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(''));
  }
  const c = FIG.controles(el);
  c.opciones(S.map(x => x.n), i => { carga(i); di('Cargaste ' + S[i].n + ': el bicho ahora ' + S[i].d + '. Recompilaciones del motor: cero. Es el mismo ejecutable.', 'ok'); });
  c.boton('Hacer ese cambio en C#', () => { motor.tono('bad'); di('Dentro del motor, el mismo cambio pide abrir el código, recompilar y repartir otro ejecutable. Diseño espera a un programador.', 'bad'); }, true);
  carga(0); tick();
  const timer = setInterval(tick, 50);
  return () => clearInterval(timer);
};

/* 8 · hojaCalculo: filas = entidades, columnas = componentes, sistemas = fórmulas */
window.DEMOS.hojaCalculo = function (el) {
  const f = FIG.lienzo(el, 900, 430), COL = ['pos', 'vel', 'vida'], CX = [270, 480, 690], CW = 190;
  const INI = [
    { n: '0 · lento b', pos: [12, 3], vel: 2, vida: 1 },
    { n: '1 · tanque M', pos: [20, 1], vel: 1, vida: 3 },
    { n: '2 · rápido B', pos: [31, 6], vel: 5, vida: 1 },
    { n: '3 · chispa *', pos: [20, 15], vel: -4, vida: null },
    { n: '4 · batería +', pos: [8, 10], vel: null, vida: null }
  ];
  const SIS = [
    { n: 'Movimiento', usa: ['pos', 'vel'], haz: r => { r.pos = [r.pos[0], r.pos[1] + r.vel]; } },
    { n: 'Golpe', usa: ['vida'], haz: r => { r.vida = Math.max(0, r.vida - 1); } },
    { n: 'Dibujo', usa: ['pos'], haz: () => {} }
  ];
  let F;
  const cab = COL.map((c, i) => f.caja(CX[i], 14, CW, 50, c, { tono: 'paper', tam: 25, rx: 8 }));
  f.texto(140, 39, 'entidad', { tam: 22 });
  const nom = INI.map((r, i) => f.caja(30, 76 + i * 70, 220, 58, r.n, { tam: 23, rx: 8, tono: 'off' }));
  const cel = INI.map((r, i) => COL.map((c, j) => f.caja(CX[j], 76 + i * 70, CW, 58, '', { tam: 25, rx: 8 })));
  const valor = (r, c) => r[c] === null ? '·' : c === 'pos' ? r.pos[0] + ', ' + r.pos[1] : String(r[c]);
  const di = FIG.dice(el);
  function pinta(s) {
    let filas = 0;
    cab.forEach((h, j) => h.tono(s && s.usa.includes(COL[j]) ? 'on' : 'paper'));
    F.forEach((r, i) => {
      const tiene = !!s && s.usa.every(c => r[c] !== null);
      if (tiene) filas++;
      nom[i].tono(tiene ? 'ok' : 'off');
      COL.forEach((c, j) => cel[i][j].rotulo(valor(r, c)).tono(r[c] === null ? 'off' : tiene && s.usa.includes(c) ? 'on' : 'base'));
    });
    return filas;
  }
  function corre(s) {
    F.forEach(r => { if (s.usa.every(c => r[c] !== null)) s.haz(r); });
    const k = pinta(s);
    di(s.n + ' recorrió ' + k + ' de 5 filas y solo miró ' + s.usa.join(' y ') + '. Nunca preguntó si era tanque o chispa: le basta con que la fila tenga esas columnas.', 'ok');
  }
  function reinicia() { F = INI.map(r => ({ n: r.n, pos: r.pos.slice(), vel: r.vel, vida: r.vida })); pinta(null); di('Cada fila es una entidad y cada columna un componente. Ejecuta un sistema y mira qué filas recorre.'); }
  const c = FIG.controles(el);
  c.boton('Movimiento (pos, vel)', () => corre(SIS[0]));
  c.boton('Golpe (vida)', () => corre(SIS[1]));
  c.boton('Dibujo (pos)', () => corre(SIS[2]));
  c.boton('Reiniciar', reinicia, true);
  reinicia();
};

/* 9 · fuga: abrir y cerrar la pantalla de puntajes con y sin desuscribirse */
window.DEMOS.fuga = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const bicho = f.caja(20, 120, 170, 84, 'Bicho', { tam: 28 });
  const bus = f.caja(290, 100, 170, 124, 'Bus', { tam: 30, tono: 'paper' });
  const marc = f.caja(600, 40, 280, 76, 'Marcador · 0', { tam: 25, tono: 'ok' });
  const pant = f.caja(600, 196, 280, 76, 'Pantalla: cerrada', { tam: 25, tono: 'off' });
  f.flecha(bicho, bus, { rotulo: 'BichoMurio', tam: 22, ry: -6 });
  const aM = f.flecha(bus, marc), aP = f.flecha(bus, pant);
  f.texto(30, 312, 'lista de oyentes que guarda el bus:', { tam: 22, ancla: 'start' });
  const SL = [0, 1, 2, 3, 4].map(i => f.caja(20 + i * 176, 340, 166, 66, '', { tam: 22, rx: 10 }));
  const di = FIG.dice(el);
  let limpia = true, abierta = false, nPant = 0, puntos = 0, subs = [];
  function pinta() {
    marc.rotulo('Marcador · ' + puntos);
    pant.rotulo(abierta ? 'Pantalla #' + nPant + ' abierta' : 'Pantalla: cerrada').tono(abierta ? 'base' : 'off');
    aP.tono(subs.length ? (subs.some(s => !(abierta && s.id === nPant)) ? 'bad' : 'base') : 'off');
    const L = [{ n: 'Marcador', ok: true }].concat(subs.map(s => ({ n: 'Pantalla #' + s.id, ok: abierta && s.id === nPant })));
    SL.forEach((c, i) => { const s = L[i]; c.ver(!!s); if (s) c.rotulo(s.n + (s.ok ? '' : ' (fantasma)')).tono(s.ok ? 'ok' : 'bad'); });
  }
  function abrir() {
    if (abierta) { di('La pantalla ya está abierta. Ciérrala primero.'); return; }
    if (subs.length >= 4) { di('Ya hay cuatro pantallas en la lista y solo una existe. Cambia de opción para reiniciar.', 'bad'); return; }
    nPant++; abierta = true; subs.push({ id: nPant }); pinta();
    const viejas = subs.length - 1;
    di(viejas ? 'Abriste la pantalla #' + nPant + ': OnEnable la suscribió. La lista ya guarda ' + viejas + (viejas === 1 ? ' pantalla vieja' : ' pantallas viejas') + ' que nadie quitó.' : 'Abriste la pantalla: en OnEnable se suscribió al bus.', viejas ? 'bad' : '');
  }
  function cerrar() {
    if (!abierta) { di('No hay pantalla abierta.'); return; }
    abierta = false;
    if (limpia) subs = subs.filter(s => s.id !== nPant);
    pinta();
    di(limpia ? 'Cerraste la pantalla y OnDisable la quitó de la lista. El bus ya no la conoce.' : 'Cerraste la pantalla, pero nadie la quitó de la lista. El bus todavía guarda una referencia a ella.', limpia ? 'ok' : 'bad');
  }
  function morir() {
    puntos += 10; aM.tono('ok');
    const viejas = subs.filter(s => !(abierta && s.id === nPant)).length;
    pinta();
    if (viejas) di('Murió un bicho. El bus llamó a ' + viejas + (viejas === 1 ? ' pantalla que ya no existe' : ' pantallas que ya no existen') + '. En Unity sale MissingReferenceException; en C# puro esa memoria no se libera y el trabajo se repite.', 'bad');
    else di('Murió un bicho. Cada oyente vivo recibió el aviso una sola vez.', 'ok');
  }
  const c = FIG.controles(el);
  c.opciones(['Con OnDisable', 'Sin OnDisable'], i => { limpia = !i; subs = abierta ? subs.filter(s => s.id === nPant) : []; pinta(); di(i ? 'Ahora la pantalla se suscribe al abrir y nunca se desuscribe. Abre, cierra, vuelve a abrir y haz morir un bicho.' : 'Quien se suscribe en OnEnable se desuscribe en OnDisable.'); });
  c.boton('Abrir pantalla', abrir);
  c.boton('Cerrar pantalla', cerrar);
  c.boton('Muere un bicho', morir, true);
  pinta(); di('Abre la pantalla de puntajes, ciérrala y haz morir un bicho. Luego repite sin OnDisable.');
};

/* 10 · motorOScript: clasificar tareas entre el motor compilado y los scripts */
window.DEMOS.motorOScript = function (el) {
  const f = FIG.lienzo(el, 900, 460);
  const T = [
    { n: 'Colisiones', l: 0, w: 'Corren cientos de veces por frame y casi nunca cambian: motor, rápido y probado.' },
    { n: 'Oleada 3', l: 1, w: 'Cuántos bichos y cada cuánto: diseño la ajusta a diario. Va en el script o en datos.' },
    { n: 'Pool de chispas', l: 0, w: 'Gestión de memoria (semana 5). Si falla, todo el juego da tirones. Motor.' },
    { n: 'Zigzag nuevo', l: 1, w: 'Un patrón de movimiento nuevo es justo lo que un mod quiere inventar. Script.' },
    { n: 'Paso fijo', l: 0, w: 'El bucle principal es el corazón del motor. Si un mod lo toca, nada vuelve a ser determinista.' },
    { n: 'Diálogo del jefe', l: 1, w: 'Texto y ramas que cambian en cada versión y cada idioma. Script o datos.' },
    { n: 'Dibujar bichos', l: 0, w: 'Pintar es trabajo pesado y de bajo nivel. El script dice qué; el motor dibuja.' },
    { n: 'Precio de mejoras', l: 1, w: 'Un número de balance. Diseño lo cambia sin pedirle nada a programación.' }
  ];
  f.caja(16, 12, 270, 52, 'Motor en C#', { tam: 25, tono: 'paper' });
  f.caja(614, 12, 270, 52, 'Script en Lua', { tam: 25, tono: 'paper' });
  const carta = f.caja(318, 140, 264, 120, '', { tam: 28, tono: 'on', sub: '¿motor o script?' });
  const cuenta = f.texto(450, 300, '', { tam: 22, tono: 'white', peso: 700 });
  const ranura = T.map(() => f.caja(0, 0, 270, 42, '', { tam: 22, rx: 10 }).ver(false));
  const di = FIG.dice(el);
  let k = 0, bien = 0, col = [0, 0];
  function muestra() {
    carta.ver(k < T.length);
    if (k < T.length) carta.rotulo(T[k].n);
    cuenta.pon(k < T.length ? 'tarjeta ' + (k + 1) + ' de ' + T.length : bien + ' de ' + T.length + ' bien ubicadas');
  }
  function elige(lado) {
    if (k >= T.length) return;
    const t = T[k], ok = t.l === lado, x = lado ? 614 : 16, y = 76 + col[lado] * 47;
    col[lado]++; if (ok) bien++;
    ranura[k].mover(x, y).rotulo(t.n).tono(ok ? 'ok' : 'bad').ver(true);
    di((ok ? '<b>Bien.</b> ' : '<b>Mejor en el ' + (t.l ? 'script' : 'motor') + '.</b> ') + t.w, ok ? 'ok' : 'bad');
    k++; muestra();
    if (k === T.length) di('Terminaste: ' + bien + ' de ' + T.length + '. La regla: en el motor lo que corre en cada frame y casi no cambia; en el script lo que cambia a diario y edita diseño.', bien >= 6 ? 'ok' : 'bad');
  }
  function reinicia() { k = 0; bien = 0; col = [0, 0]; ranura.forEach(r => r.ver(false)); muestra(); di('Lee la tarjeta y decide: ¿va en el motor compilado o en un script que diseño puede editar?'); }
  const c = FIG.controles(el);
  c.boton('← Motor en C#', () => elige(0));
  c.boton('Script en Lua →', () => elige(1));
  c.boton('Reiniciar', reinicia, true);
  reinicia();
};

/* 11 · ecsEscala: objetos contra columnas en memoria, y cuándo se nota */
window.DEMOS.ecsEscala = function (el) {
  const f = FIG.lienzo(el, 900, 460), CW = 46, X0 = 40;
  const OBJ = 'pvhn'.repeat(4).split(''), COL = 'ppppvvvvhhhhnnnn'.split('');
  const NOM = { p: 'pos', v: 'vel', h: 'vida', n: 'nom' };
  const SIS = [{ n: 'Movimiento', usa: 'pv' }, { n: 'Golpe', usa: 'h' }];
  const N = [60, 600, 6000, 60000, 200000], NS = 40;   /* nanosegundos por bloque traído: ilustrativo */
  const X = i => X0 + i * (CW + 4) + Math.floor(i / 4) * 12;
  f.texto(X0, 22, 'Objetos: cada bicho lleva todos sus datos juntos', { tam: 22, ancla: 'start' });
  f.texto(X0, 130, 'Columnas (ECS): cada dato junto a los de su tipo', { tam: 22, ancla: 'start' });
  const fila = (arr, y) => arr.map((t, i) => f.caja(X(i), y, CW, 52, '', { tam: 22, rx: 6 }));
  const A = fila(OBJ, 42), B = fila(COL, 150);
  const tA = f.texto(X0, 228, '', { tam: 22, ancla: 'start', tono: 'white', peso: 700 });
  const tB = f.texto(X0, 260, '', { tam: 22, ancla: 'start', tono: 'white', peso: 700 });
  const BX = 190, BW = 620, presu = 16.6;
  f.texto(X0, 300, 'tiempo del sistema en un frame (cifras ilustrativas)', { tam: 22, ancla: 'start' });
  const barA = f.nodo('rect', { x: BX, y: 320, height: 34, rx: 6, fill: FIG.C.coral });
  const barB = f.nodo('rect', { x: BX, y: 364, height: 34, rx: 6, fill: '#66bb87' });
  f.texto(X0, 337, 'objetos', { tam: 22, ancla: 'start' }); f.texto(X0, 381, 'columnas', { tam: 22, ancla: 'start' });
  f.linea(BX + BW, 312, BX + BW, 406, { tono: 'yellow', grosor: 3, puntos: true });
  f.texto(BX + BW, 430, '16,6 ms: un frame a 60 fps', { tam: 22, ancla: 'end', tono: 'yellow' });
  const vA = f.texto(BX + 10, 337, '', { tam: 22, ancla: 'start', tono: 'white', peso: 800 });
  const vB = f.texto(BX + 10, 381, '', { tam: 22, ancla: 'start', tono: 'white', peso: 800 });
  const di = FIG.dice(el);
  let s = 0, ni = 0;
  const trae = (arr, b, u) => arr.slice(b * 4, b * 4 + 4).some(t => u.includes(t));
  const bloques = (arr, u) => [0, 1, 2, 3].filter(b => trae(arr, b, u)).length;
  const fmt = ms => (ms < 0.01 ? (ms * 1000).toFixed(1) + ' µs' : ms.toFixed(2) + ' ms').replace('.', ',');
  function pinta() {
    const u = SIS[s].usa, ba = bloques(OBJ, u), bb = bloques(COL, u), util = OBJ.filter(t => u.includes(t)).length;
    [[A, OBJ], [B, COL]].forEach(([cs, arr]) => cs.forEach((c, i) => c.rotulo(NOM[arr[i]]).tono(u.includes(arr[i]) ? 'on' : trae(arr, Math.floor(i / 4), u) ? 'bad' : 'off')));
    tA.pon('objetos: trae ' + ba + ' bloques de memoria y usa ' + util + ' de ' + ba * 4 + ' casillas');
    tB.pon('columnas: trae ' + bb + ' bloques y usa ' + util + ' de ' + bb * 4 + ' casillas');
    const n = N[ni], msA = n / 4 * ba * NS / 1e6, msB = n / 4 * bb * NS / 1e6, w = ms => Math.max(4, Math.min(BW, ms / presu * BW));
    barA.setAttribute('width', w(msA)); barB.setAttribute('width', w(msB));
    vA.pon(fmt(msA)); vB.pon(fmt(msB));
    vA.t.setAttribute('x', BX + 10 + Math.min(BW - 130, w(msA))); vB.t.setAttribute('x', BX + 10 + Math.min(BW - 130, w(msB)));
    const nn = n.toLocaleString('es-CO');
    if (msA < 0.5) di('Con ' + nn + ' entidades, ' + SIS[s].n + ' tarda ' + fmt(msA) + ' o ' + fmt(msB) + '. En pantalla no se nota: gana el código más claro. Sube las entidades.', 'ok');
    else if (msA < 4) di(nn + ' entidades: la diferencia ya se mide, pero cabe de sobra en el frame. Decide con el Profiler, no con la intuición.');
    else di(nn + ' entidades: los objetos se comen ' + fmt(msA) + ' de 16,6. Coral es memoria traída y no usada. Aquí las columnas sí pagan su complejidad.', 'bad');
  }
  const c = FIG.controles(el);
  c.opciones(SIS.map(x => x.n + ' (' + x.usa.split('').map(t => NOM[t]).join(', ') + ')'), i => { s = i; pinta(); });
  c.deslizador('Entidades', 0, N.length - 1, 0, 1, v => { ni = v; pinta(); }, v => N[v].toLocaleString('es-CO'));
  pinta();
};
