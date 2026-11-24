/* Figuras de la semana 5. Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   Las figuras de analogía usan FIG (assets/fig.js). basura y pool son demos de canvas.
   Son simulaciones didácticas: milisegundos, pasos y conteos son ilustrativos, no mediciones reales.
   tiron (la evidencia del misterio), focos (basura escondida) y layout (líneas de caché) se agregaron en la revisión final. */
(function () {
  window.DEMOS = window.DEMOS || {};

  /* 1 · Stack y heap: la mesa se limpia sola, la bodega no */
  window.DEMOS.mesaBodega = function (el) {
    const f = FIG.lienzo(el, 640, 400);
    f.texto(130, 30, 'Mesa: stack', { tam: 26, tono: 'white', peso: 800 });
    f.texto(470, 30, 'Bodega: heap', { tam: 26, tono: 'white', peso: 800 });
    f.linea(275, 10, 275, 390, { puntos: true });
    const mesa = [0, 1, 2, 3].map(i => f.caja(20, 318 - i * 76, 220, 64, '', { tam: 24 }).ver(false));
    const bod = [0, 1, 2, 3, 4, 5].map(i => f.caja(310 + (i % 2) * 165, 66 + Math.floor(i / 2) * 110, 150, 84, 'Chispa', { tam: 24 }).ver(false));
    let M = [], B = [], fl = [];          // M: {txt, obj}; B: estado 0 libre, 1 con dueño, 2 basura
    const di = FIG.dice(el, 'Llama a una función: pon una variable local o crea una chispa con <code>new</code>.');
    function pinta() {
      fl.forEach(a => a.ln.remove()); fl = [];
      mesa.forEach((c, i) => { const m = M[i]; c.ver(!!m); if (m) c.rotulo(m.txt).tono(m.obj >= 0 ? 'on' : 'base'); });
      bod.forEach((c, i) => { c.ver(!!B[i]); if (B[i]) c.tono(B[i] === 2 ? 'bad' : 'base').rotulo(B[i] === 2 ? 'basura' : 'Chispa'); });
      M.forEach((m, i) => { if (m.obj >= 0) fl.push(f.flecha(mesa[i], bod[m.obj], { tono: 'on' })); });
    }
    const c = FIG.controles(el);
    c.boton('int vidas = 3', () => {
      if (M.length >= 4) return di('La mesa es pequeña: ya no cabe nada. Termina la función.', 'bad');
      M.push({ txt: 'int vidas = 3', obj: -1 }); pinta(); di('Una variable local: va a la <b>mesa</b>. Poner y quitar es inmediato.');
    });
    c.boton('new Chispa()', () => {
      const j = B.findIndex(x => !x);
      if (M.length >= 4) return di('La mesa es pequeña: ya no cabe nada. Termina la función.', 'bad');
      if (j < 0 && B.length >= 6) return di('La bodega está llena de basura. Alguien tiene que limpiarla: eso lo vemos con el aseador.', 'bad');
      const k = j < 0 ? B.length : j; B[k] = 1; M.push({ txt: 'Chispa c', obj: k }); pinta();
      di('El objeto va a la <b>bodega</b>. En la mesa solo queda un papelito con su dirección: una <b>referencia</b>.');
    });
    c.boton('La función termina', () => {
      if (!M.length) return di('La mesa ya está vacía. Llama otra vez a la función.');
      M.forEach(m => { if (m.obj >= 0) B[m.obj] = 2; }); M = []; pinta();
      di(B.some(x => x === 2) ? 'La mesa <b>se limpió sola</b>. Pero las chispas siguen en la bodega sin dueño: son <b>basura</b>.' : 'La mesa <b>se limpió sola</b>. No quedó nada en la bodega.', B.some(x => x === 2) ? 'bad' : 'ok');
    }, true);
  };

  /* 2 · Struct contra class: copiar un valor o copiar una dirección */
  window.DEMOS.copia = function (el) {
    const f = FIG.lienzo(el, 640, 400);
    const a = f.caja(30, 60, 230, 100, '', { tam: 28 }), b = f.caja(30, 240, 230, 100, '', { tam: 28 });
    const obj = f.caja(390, 150, 220, 100, '', { tam: 28, tono: 'on' });
    const etq = f.texto(500, 110, 'en la bodega', { tam: 22 });
    const fa = f.flecha(a, obj, { tono: 'on' }), fb = f.flecha(b, obj, { tono: 'on' });
    let tipo = 0, copiado = false, ax = 1, bx = 1;
    const di = FIG.dice(el);
    function pinta() {
      const s = tipo === 0;
      if (s) { a.rotulo('a.X = ' + ax); b.rotulo(copiado ? 'b.X = ' + bx : 'b = ?'); }
      else { a.rotulo('a →'); b.rotulo(copiado ? 'b →' : 'b = null'); obj.rotulo('X = ' + ax); }
      a.tono(s ? 'base' : 'paper'); b.tono(s ? 'base' : 'paper');
      obj.ver(!s); etq.ver(!s); fa.ver(!s); fb.ver(!s && copiado);
    }
    function reset() { copiado = false; ax = 1; bx = 1; pinta(); di(tipo ? '<code>class</code>: en la mesa solo hay papelitos con direcciones. Prueba <b>b = a</b>.' : '<code>struct</code>: el dato completo vive en la variable. Prueba <b>b = a</b>.'); }
    const c = FIG.controles(el);
    c.opciones(['struct', 'class'], i => { tipo = i; reset(); });
    c.boton('b = a', () => {
      copiado = true; bx = ax; pinta();
      di(tipo ? 'Se copió el <b>papelito</b>: dos nombres, un solo objeto en la bodega.' : 'Se copió el <b>valor</b>: ahora hay dos puntos independientes.');
    });
    c.boton('b.X = 99', () => {
      if (!copiado) return di('Primero haz <b>b = a</b>.');
      if (tipo) { ax = 99; pinta(); di('¡<b>a.X también vale 99</b>! a y b apuntan al mismo objeto.', 'bad'); }
      else { bx = 99; pinta(); di('<b>a.X sigue en 1.</b> b era una copia: cambiarla no toca el original.', 'ok'); }
    });
    c.boton('Reiniciar', reset, true);
    reset();
  };

  /* 3 · El recolector: la fiesta se detiene mientras barren */
  window.DEMOS.aseador = function (el) {
    const f = FIG.lienzo(el, 900, 430), X0 = 60, AW = 780, SEG = 10, CAP = 3600;
    const tit = f.texto(450, 40, '', { tam: 28, tono: 'white', peso: 800 });
    const fiesta = f.caja(250, 80, 400, 100, 'Fiesta: el juego corre', { tam: 26, tono: 'ok' });
    f.nodo('rect', { x: X0, y: 240, width: AW, height: 50, rx: 10, fill: '#1b1b1e', stroke: 'rgba(255,255,255,.4)', 'stroke-width': 2 });
    for (let s = 0; s <= SEG; s += 2) f.texto(X0 + AW * s / SEG, 316, s + ' s', { tam: 22 });
    const marcas = f.nodo('g', {});
    const cursor = f.nodo('line', { x1: X0, y1: 228, x2: X0, y2: 302, stroke: FIG.C.yellow, 'stroke-width': 6, 'stroke-linecap': 'round' });
    const res = f.texto(450, 372, '', { tam: 28, tono: 'white', peso: 700 });
    f.texto(450, 410, 'simulación ilustrativa a 60 fps', { tam: 22 });
    let b = 20, pausas = [], t = 0, timer = 0;
    const di = FIG.dice(el);
    function calcula() {
      pausas = []; if (b > 0) { const cada = CAP / b / 60; for (let s = cada; s < SEG; s += cada) pausas.push(s); }
      marcas.innerHTML = '';
      pausas.forEach(s => f.nodo('rect', { x: X0 + AW * s / SEG - 6, y: 242, width: 12, height: 46, fill: FIG.C.coral }, marcas));
      tit.pon('Basura por frame: ' + b + ' objetos');
      res.pon(pausas.length + (pausas.length === 1 ? ' pausa' : ' pausas') + ' en 10 segundos').color(pausas.length ? 'coral' : 'white');
      di(b === 0 ? 'Sin basura, el aseador <b>no tiene nada que barrer</b>: la fiesta nunca se detiene.'
        : `Cada <b>${(CAP / b / 60).toFixed(1)} s</b> la bodega se llena y el aseador detiene la fiesta. Más basura por frame: pausas más seguidas.`, b === 0 ? 'ok' : b > 30 ? 'bad' : '');
    }
    function tick() {
      t = (t + .05) % SEG;
      cursor.setAttribute('x1', X0 + AW * t / SEG); cursor.setAttribute('x2', X0 + AW * t / SEG);
      const barre = pausas.some(s => t >= s && t < s + .35);
      fiesta.tono(barre ? 'bad' : 'ok').rotulo(barre ? 'Barriendo: todos quietos' : 'Fiesta: el juego corre');
    }
    const c = FIG.controles(el);
    c.deslizador('Basura por frame', 0, 60, 20, 5, v => { b = v; calcula(); });
    calcula(); timer = setInterval(tick, 50);
    return () => clearInterval(timer);
  };

  /* 4 · C++: quien alquila, devuelve. unique_ptr devuelve la llave solo */
  window.DEMOS.llave = function (el) {
    const f = FIG.lienzo(el, 640, 400);
    f.texto(320, 30, 'Hotel: la memoria', { tam: 26, tono: 'white', peso: 800 });
    const H = [0, 1, 2, 3].map(i => f.caja(20 + i * 155, 64, 135, 110, 'Hab. ' + (i + 1), { tam: 26 }));
    const llave = f.texto(320, 230, '', { tam: 26, tono: 'yellow', peso: 700 });
    const per = f.texto(320, 300, '', { tam: 28, tono: 'white', peso: 800 });
    const modoT = f.texto(320, 360, '', { tam: 24 });
    let st, cur, perdidas, modo = 0;
    const di = FIG.dice(el);
    function pinta() {
      H.forEach((h, i) => h.tono(st[i] === 1 ? 'on' : st[i] === 2 ? 'bad' : 'base').rotulo(st[i] === 2 ? 'perdida' : 'Hab. ' + (i + 1)));
      llave.pon(cur >= 0 ? 'tienes la llave de la habitación ' + (cur + 1) : 'no tienes llave');
      per.pon('habitaciones perdidas: ' + perdidas).color(perdidas ? 'coral' : 'white');
      modoT.pon(modo ? 'auto fondo = std::make_unique<Textura>()' : 'Textura* fondo = new Textura()');
    }
    function reset() { st = [0, 0, 0, 0]; cur = -1; perdidas = 0; pinta(); di(modo ? 'Con <code>unique_ptr</code> la llave tiene dueño. Alquila y sal como quieras.' : 'Con <code>new</code> a mano tú devuelves la llave. Alquila una habitación.'); }
    const c = FIG.controles(el);
    c.opciones(['new y delete', 'unique_ptr'], i => { modo = i; reset(); });
    c.boton('Alquilar', () => {
      if (cur >= 0) return di('Ya tienes una habitación. Sal de la función primero.');
      const i = st.indexOf(0);
      if (i < 0) return di('<b>No quedan habitaciones.</b> Las fugas se comieron la memoria: el juego se cae.', 'bad');
      st[i] = 1; cur = i; pinta(); di('Alquilaste la habitación ' + (i + 1) + '. Ahora sal de la función.');
    });
    c.boton('Salir normal', () => {
      if (cur < 0) return di('Primero alquila una habitación.');
      st[cur] = 0; cur = -1; pinta();
      di(modo ? 'La llave <b>se devolvió sola</b> al salir del bloque. Nadie escribió <code>delete</code>.' : 'Llegaste al <code>delete</code> y devolviste la llave. Esta vez te acordaste.', 'ok');
    });
    c.boton('Salir por un return temprano', () => {
      if (cur < 0) return di('Primero alquila una habitación.');
      if (modo) { st[cur] = 0; cur = -1; pinta(); di('Aun saliendo por el <code>return</code>, <b>unique_ptr devolvió la llave</b>. RAII: la devolución va amarrada a la salida del bloque.', 'ok'); }
      else { st[cur] = 2; cur = -1; perdidas++; pinta(); di('El <code>return</code> saltó el <code>delete</code>: <b>fuga</b>. Nadie tiene la dirección; esa habitación se perdió hasta que el programa termine.', 'bad'); }
    }, true);
    reset();
  };

  /* 5 · Object Pool: los zapatos de la bolera */
  window.DEMOS.bolera = function (el) {
    const f = FIG.lienzo(el, 900, 430);
    f.texto(450, 30, 'El estante de zapatos', { tam: 26, tono: 'white', peso: 800 });
    const par = [0, 1, 2, 3, 4, 5].map(i => f.caja(30 + i * 143, 58, 125, 84, 'Par ' + (i + 1), { tam: 26 }));
    const pista = f.caja(30, 190, 400, 110, 'Pista vacía', { tam: 26, tono: 'off' });
    const bas = f.caja(470, 190, 400, 110, 'Basura: 0 pares', { tam: 26, tono: 'off' });
    const fl = f.flecha(pista, bas, { tono: 'bad' });
    const fab = f.texto(450, 350, '', { tam: 28, tono: 'white', peso: 800 });
    const cli = f.texto(450, 396, '', { tam: 24 });
    let modo = 0, sucio = false, fabricados, basura, clientes, k;
    const di = FIG.dice(el);
    function pinta() {
      par.forEach(p => p.ver(!!modo).tono('base')); fl.ver(!modo);
      bas.rotulo('Basura: ' + basura + ' pares').tono(basura ? 'bad' : 'off');
      fab.pon('pares fabricados: ' + fabricados).color(modo ? 'white' : 'coral');
      cli.pon('clientes atendidos: ' + clientes);
    }
    function reset() {
      fabricados = modo ? 6 : 0; basura = 0; clientes = 0; k = -1; pista.rotulo('Pista vacía').tono('off'); pinta();
      di(modo ? 'Al abrir se compraron 6 pares, una sola vez. Que llegue un cliente.' : 'Sin estante: cada cliente recibe un par recién fabricado. Que llegue un cliente.');
    }
    function llega(n) {
      for (let j = 0; j < n; j++) { clientes++; if (modo) k = (k + 1) % 6; else { fabricados++; basura++; } }
      pinta();
      if (modo) {
        par[k].tono(sucio ? 'bad' : 'on'); pista.tono(sucio ? 'bad' : 'ok').rotulo('Cliente ' + clientes + ' con el par ' + (k + 1));
        if (sucio) di('El par ' + (k + 1) + ' salió <b>sin desinfectar</b>: trae lo del cliente anterior. En código: posición y vida de su vida pasada.', 'bad');
        else di('Préstamo y devolución: <b>' + fabricados + ' pares</b> para ' + clientes + ' clientes. Nada va a la basura.', 'ok');
      } else {
        pista.tono('bad').rotulo('Cliente ' + clientes + ' con par nuevo');
        di('Par nuevo por cliente y a la basura al salir: <b>' + fabricados + ' fabricados</b>, ' + basura + ' botados. Eso es un <code>new</code> por objeto.', 'bad');
      }
    }
    const c = FIG.controles(el);
    c.opciones(['Fabricar y botar', 'Prestar y devolver'], i => { modo = i; reset(); });
    c.boton('Llega un cliente', () => llega(1));
    c.boton('Llegan 10', () => llega(10));
    c.casilla('Olvidar desinfectar', v => { sucio = v; });
    reset();
  };

  /* 6 · Localidad de datos: el mercado por pasillos */
  window.DEMOS.pasillos = function (el) {
    const f = FIG.lienzo(el, 900, 430), PX = [150, 350, 550, 750], E = [450, 400];
    PX.forEach((x, i) => { f.nodo('rect', { x: x - 70, y: 40, width: 140, height: 290, rx: 12, fill: '#1b1b1e', stroke: 'rgba(255,255,255,.3)', 'stroke-width': 2 }); f.texto(x, 66, 'Pasillo ' + (i + 1), { tam: 22 }); });
    const IT = []; PX.forEach(x => { IT.push([x, 150]); IT.push([x, 260]); });
    const ORD = [[0, 1, 2, 3, 4, 5, 6, 7], [0, 7, 2, 5, 1, 6, 3, 4]];
    const pts = IT.map(p => f.circulo(p[0], p[1], 20, { tono: 'yellow' }));
    const num = IT.map(p => f.texto(p[0], p[1], '', { tam: 22, color: FIG.C.ink, peso: 800 }));
    f.texto(E[0], E[1], 'entrada', { tam: 22, tono: 'white' });
    const ruta = f.nodo('path', { d: '', fill: 'none', stroke: FIG.C.coral, 'stroke-width': 5, 'stroke-linejoin': 'round' });
    const yo = f.circulo(E[0], E[1] - 30, 14, { tono: 'white' });
    const cnt = f.texto(800, 400, '', { tam: 26, tono: 'white', peso: 800 });
    let modo = 1, camino = [], i = 0, timer = 0, pasos = 0;
    const di = FIG.dice(el);
    function prepara() {
      clearInterval(timer);
      const o = ORD[modo === 1 ? 1 : 0];
      o.forEach((k, n) => num[k].pon(String(n + 1)));
      const P = [[E[0], E[1] - 30]].concat(o.map(k => IT[k]));
      ruta.setAttribute('d', ''); camino = P; i = 0; pasos = 0; yo.mover(P[0][0], P[0][1]); cnt.pon('pasos: 0');
      di(modo ? 'Lista revuelta: cada producto está en otro pasillo. Haz el mercado.' : 'Lista por pasillos: los productos vecinos se recogen seguidos. Haz el mercado.');
    }
    function anda() {
      clearInterval(timer); let d = 'M' + camino[0].join(' '); i = 0; pasos = 0;
      timer = setInterval(() => {
        i++; if (i >= camino.length) { clearInterval(timer); return fin(); }
        pasos += Math.round(Math.hypot(camino[i][0] - camino[i - 1][0], camino[i][1] - camino[i - 1][1]) / 20);
        d += ' L' + camino[i].join(' '); ruta.setAttribute('d', d); yo.mover(camino[i][0], camino[i][1]); cnt.pon('pasos: ' + pasos);
      }, 380);
    }
    function fin() {
      di(modo ? `<b>${pasos} pasos</b> yendo y viniendo. Así recorre la CPU una lista de objetos regados por el heap.`
        : `<b>${pasos} pasos</b> en una sola pasada. Así recorre la CPU un arreglo de structs: el vecino ya está a la mano, en la caché.`, modo ? 'bad' : 'ok');
    }
    const c = FIG.controles(el);
    c.opciones(['Lista revuelta', 'Lista por pasillos'], k => { modo = k === 0 ? 1 : 0; prepara(); });
    c.boton('Hacer el mercado', anda);
    prepara();
    return () => clearInterval(timer);
  };

  /* 7 · El presupuesto del frame: 16,7 ms para todo */
  window.DEMOS.presupuesto = function (el) {
    const f = FIG.lienzo(el, 900, 430), X0 = 50, PX = 25, Y = 150, AL = 90, META = 16.7;
    f.nodo('rect', { x: X0, y: Y, width: 800, height: AL, rx: 8, fill: '#1b1b1e' });
    const seg = ['cobalt', 'paper', 'coral'].map(k => f.nodo('rect', { x: X0, y: Y, height: AL, width: 0, fill: FIG.C[k], stroke: FIG.C.ink, 'stroke-width': 2 }));
    const lab = [0, 1, 2].map(i => f.texto(0, Y + AL / 2, '', { tam: 24, peso: 800, color: i === 1 ? FIG.C.ink : '#fff' }));
    const xm = X0 + META * PX;
    f.nodo('line', { x1: xm, y1: Y - 50, x2: xm, y2: Y + AL + 30, stroke: FIG.C.yellow, 'stroke-width': 5 });
    f.texto(xm, Y - 70, 'presupuesto: 16,7 ms (60 fps)', { tam: 24, tono: 'yellow', peso: 700 });
    const tot = f.texto(450, 320, '', { tam: 30, tono: 'white', peso: 800 });
    f.texto(450, 390, 'lógica: azul · dibujo: blanco · recolector: coral · cifras ilustrativas', { tam: 22 });
    let v = [3, 8, 0];
    const di = FIG.dice(el);
    function pinta() {
      let x = X0;
      v.forEach((ms, i) => { const w = ms * PX; seg[i].setAttribute('x', x); seg[i].setAttribute('width', w); lab[i].t.setAttribute('x', x + w / 2); lab[i].pon(ms >= 2 ? ms + ' ms' : ''); x += w; });
      const t = v[0] + v[1] + v[2], fps = Math.min(60, Math.round(1000 / Math.max(t, META)));
      tot.pon('frame: ' + t.toFixed(1).replace('.', ',') + ' ms · ' + (t > META ? 'se pasó: ' + fps + ' fps o un tirón' : 'cabe: 60 fps')).color(t > META ? 'coral' : 'white');
      di(t > META ? (v[2] && v[0] + v[1] <= META ? 'El recolector solo, <b>sin cambiar nada más</b>, empuja el frame fuera del presupuesto. Eso es el tirón.' : 'Te pasaste del presupuesto. ¿Cuál de las dos barras conviene atacar primero? <b>La más larga.</b>')
        : `Sobran <b>${(META - t).toFixed(1).replace('.', ',')} ms</b>. Todo lo que pase en el frame comparte esta barra.`, t > META ? 'bad' : 'ok');
    }
    const c = FIG.controles(el);
    c.deslizador('Lógica', 1, 10, 3, 1, x => { v[0] = x; pinta(); }, x => x + ' ms');
    c.deslizador('Dibujo', 1, 14, 8, 1, x => { v[1] = x; pinta(); }, x => x + ' ms');
    c.casilla('Pasa el recolector (+8 ms)', on => { v[2] = on ? 8 : 0; pinta(); });
    pinta();
  };

  /* 8 · Basura por frame, recolector y tiempo de frame (canvas) */
  window.DEMOS.basura = function (el) {
    el.insertAdjacentHTML('beforeend', '<canvas width="900" height="400" aria-label="Barra de memoria que se llena de basura y gráfica de tiempo de frame con picos cuando pasa el recolector"></canvas>');
    const cv = el.querySelector('canvas'), g = cv.getContext('2d'), W = cv.width, H = cv.height;
    const CAP = 3600, N = 220, PRESU = 16.7, TOPE = 44;       // basura que cabe antes de que pase el recolector (simulada), frames visibles, presupuesto, techo de la gráfica (ms)
    const GX = 70, GY = 150, GW = W - 90, GH = 220;
    let porFrame = 20, pool = false, heap = 0, ms = [], gcs = 0, peor = 0, barrido = 0, acc = 0, last = performance.now(), raf = 0, alive = true;
    const reset = () => { heap = 0; ms = []; gcs = 0; peor = 0; barrido = 0; };
    const c = FIG.controles(el);
    c.deslizador('Objetos nuevos por frame', 0, 120, 20, 1, v => { porFrame = v; });
    c.casilla('Usar pool', v => { pool = v; });
    c.boton('Reiniciar', reset, true);
    const res = c.salida();

    function paso() {                                  // un frame simulado del juego
      const nuevos = pool ? 0 : porFrame;              // con pool no se pide memoria: se reutiliza
      let t = 6 + Math.random() * 1.2 + nuevos * .015; // lógica + dibujo + un poco por cada asignación
      heap += nuevos;
      if (heap >= CAP) { t += 20 + Math.random() * 6; heap = 0; gcs++; barrido = 14; }   // pasa el aseador
      if (barrido > 0) barrido--;
      ms.push(t); if (ms.length > N) ms.shift();
      peor = Math.max(peor, t);
    }
    function dibujar() {
      g.clearRect(0, 0, W, H);
      g.font = '600 24px "Atkinson Hyperlegible Next", sans-serif'; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
      g.fillStyle = '#b9b9bd'; g.fillText(pool ? 'Memoria nueva: con pool no se pide nada' : 'Memoria nueva: se llena de basura', 20, 32);
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.strokeRect(20, 46, W - 40, 44);
      const f = heap / CAP;
      g.fillStyle = barrido > 0 ? '#ffffff' : f > .85 ? '#e0706a' : '#2b2b30';
      g.fillRect(22, 48, (W - 44) * (barrido > 0 ? 1 : f), 40);
      if (barrido > 0) { g.fillStyle = '#0d0d0e'; g.textAlign = 'center'; g.font = '800 24px "Atkinson Hyperlegible Next", sans-serif'; g.fillText('RECOLECTOR BARRIENDO: el juego espera', W / 2, 77); g.textAlign = 'left'; g.font = '600 24px "Atkinson Hyperlegible Next", sans-serif'; }
      g.fillStyle = '#b9b9bd'; g.fillText('Tiempo de cada frame (ms)', 20, GY - 16);
      g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1; g.strokeRect(GX, GY, GW, GH);
      const yDe = v => GY + GH - Math.min(v, TOPE) / TOPE * GH, bw = GW / N;
      for (let i = 0; i < ms.length; i++) {
        const v = ms[i], y = yDe(v);
        g.fillStyle = v > PRESU ? '#e0706a' : '#ffffff';
        g.fillRect(GX + i * bw, y, Math.max(1, bw - 1), GY + GH - y);
      }
      const yp = yDe(PRESU);
      g.strokeStyle = '#e2a54a'; g.lineWidth = 3; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(GX, yp); g.lineTo(GX + GW, yp); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#e2a54a'; g.fillText('16,7 ms: presupuesto a 60 fps', GX + 12, yp - 10);
      g.fillStyle = '#b9b9bd'; g.textAlign = 'right'; g.fillText('0', GX - 10, GY + GH); g.fillText(String(TOPE), GX - 10, GY + 20); g.textAlign = 'left';
      res('recolector: ' + gcs + ' · peor frame: ' + peor.toFixed(1) + ' ms · ' +
        (pool || porFrame === 0 ? 'sin tirones' : 'un tirón cada ' + (CAP / porFrame / 60).toFixed(1) + ' s') + ' (simulación)');
    }
    function frame(now) {
      if (!alive) return;
      acc += Math.min(.1, (now - last) / 1000); last = now;
      while (acc >= 1 / 60) { paso(); acc -= 1 / 60; }
      dibujar();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => { alive = false; cancelAnimationFrame(raf); };
  };

  /* 9 · Object Pool: crear contra reutilizar (canvas) */
  window.DEMOS.pool = function (el) {
    el.insertAdjacentHTML('beforeend', '<canvas width="900" height="400" style="touch-action:none;cursor:pointer" aria-label="Chispas disparadas por el robot y casillas de memoria: libres, en uso o basura"></canvas>');
    const cv = el.querySelector('canvas'), g = cv.getContext('2d'), W = cv.width, H = cv.height;
    const N = 24, COLS = 6, LADO = 46, GAP = 8, GX0 = 540, GY0 = 96, RX = 250, RY = H - 40, CADENCIA = .09;
    const c = FIG.controles(el);
    const bt = c.boton('Disparar (mantén presionado)', () => {});
    bt.style.touchAction = 'none'; bt.style.userSelect = 'none'; bt.style.webkitUserSelect = 'none';
    c.casilla('Usar pool', v => { usarPool = v; reset(); });
    c.boton('Reiniciar', () => reset(), true);
    const res = c.salida();
    // Cada casilla: 0 = libre o vacía, 1 = en uso, 2 = basura (solo sin pool)
    let usarPool = false, casillas, chispas, creados, reusados, basura, gcs, sinCupo, disparando = false, enfria = 0, destello = 0, last = performance.now(), raf = 0, alive = true;
    function reset() {
      casillas = new Array(N).fill(0); chispas = []; reusados = 0; basura = 0; gcs = 0; sinCupo = 0; destello = 0;
      creados = usarPool ? N : 0;                      // con pool, los 24 se crean una vez al cargar
    }
    function disparar() {
      let i = casillas.indexOf(0);
      if (i < 0 && !usarPool) {                        // la memoria se llenó de basura: pasa el recolector
        for (let k = 0; k < N; k++) if (casillas[k] === 2) casillas[k] = 0;
        gcs++; destello = .35; i = casillas.indexOf(0);
      }
      if (i < 0) { sinCupo++; return; }
      casillas[i] = 1;
      if (usarPool) reusados++; else creados++;        // Tomar() contra new Chispa()
      chispas.push({ i, x: RX + (Math.random() - .5) * 26, y: RY - 24, vx: (Math.random() - .5) * 90 });
    }
    function soltar(ch) {
      if (usarPool) casillas[ch.i] = 0;                // Devolver(): la casilla queda libre
      else { casillas[ch.i] = 2; basura++; }           // se suelta: basura hasta que pase el recolector
    }
    const on = e => { disparando = true; enfria = 0; if (e && e.preventDefault) e.preventDefault(); };
    const off = () => { disparando = false; };
    bt.addEventListener('pointerdown', on); cv.addEventListener('pointerdown', on);
    bt.addEventListener('contextmenu', e => e.preventDefault());
    bt.addEventListener('click', e => { if (e.detail === 0) disparar(); });       // teclado: Enter o Espacio
    window.addEventListener('pointerup', off); window.addEventListener('pointercancel', off); window.addEventListener('blur', off);
    reset();

    function frame(now) {
      if (!alive) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      destello = Math.max(0, destello - dt); enfria -= dt;
      if (disparando && enfria <= 0) { disparar(); enfria = CADENCIA; }
      for (let k = chispas.length - 1; k >= 0; k--) {
        const ch = chispas[k]; ch.y -= 250 * dt; ch.x += ch.vx * dt;
        if (ch.y < 20) { soltar(ch); chispas.splice(k, 1); }
      }
      g.clearRect(0, 0, W, H);
      g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 1; g.beginPath(); g.moveTo(505, 16); g.lineTo(505, H - 16); g.stroke();
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#e2a54a'; g.font = '700 32px ui-monospace, Consolas, monospace';
      for (const ch of chispas) g.fillText('*', ch.x, ch.y);
      g.fillStyle = '#ffffff'; g.font = '700 44px ui-monospace, Consolas, monospace'; g.fillText('@', RX, RY);
      g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = '600 24px "Atkinson Hyperlegible Next", sans-serif'; g.fillStyle = '#b9b9bd';
      g.fillText(usarPool ? 'Pool: 24 creadas al cargar' : 'Heap: un new por disparo', GX0, 40);
      g.fillText(usarPool ? 'amarillo en uso, borde libre' : 'amarillo viva, coral basura', GX0, 72);
      for (let k = 0; k < N; k++) {
        const x = GX0 + (k % COLS) * (LADO + GAP), y = GY0 + Math.floor(k / COLS) * (LADO + GAP), s = casillas[k];
        if (s === 1) { g.fillStyle = '#e2a54a'; g.fillRect(x, y, LADO, LADO); }
        else if (s === 2) { g.fillStyle = '#e0706a'; g.fillRect(x, y, LADO, LADO); }
        else { g.strokeStyle = usarPool ? '#86a0dc' : 'rgba(255,255,255,.2)'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, LADO - 2, LADO - 2); }
      }
      if (destello > 0) {
        g.fillStyle = 'rgba(255,255,255,' + (destello * 1.6).toFixed(2) + ')'; g.fillRect(GX0 - 8, GY0 - 8, COLS * (LADO + GAP) + 8, 4 * (LADO + GAP) + 8);
        g.fillStyle = '#0d0d0e'; g.font = '800 26px "Atkinson Hyperlegible Next", sans-serif'; g.textAlign = 'center'; g.fillText('RECOLECTOR', GX0 + (COLS * (LADO + GAP) - GAP) / 2, GY0 + 2 * (LADO + GAP)); g.textAlign = 'left';
      }
      g.fillStyle = '#ffffff'; g.font = '700 24px "Atkinson Hyperlegible Next", sans-serif';
      g.fillText('new ejecutados: ' + creados, GX0, GY0 + 4 * (LADO + GAP) + 32);
      g.fillText('reutilizados: ' + reusados, GX0, GY0 + 4 * (LADO + GAP) + 64);
      res(usarPool
        ? 'Con pool · basura: 0 · recolector: 0' + (sinCupo ? ' · disparos sin casilla: ' + sinCupo : '')
        : 'Sin pool · basura creada: ' + basura + ' · pasadas del recolector: ' + gcs);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false; cancelAnimationFrame(raf);
      window.removeEventListener('pointerup', off); window.removeEventListener('pointercancel', off); window.removeEventListener('blur', off);
    };
  };

  /* 10 · La evidencia del misterio: el tiempo de frame durante 10 segundos */
  window.DEMOS.tiron = function (el) {
    const f = FIG.lienzo(el, 900, 430), X0 = 70, Y0 = 350, PXMS = 7, N = 100, META = 16.7;
    f.texto(450, 28, 'Peor frame de cada décima de segundo · 10 s de juego', { tam: 22, tono: 'white', peso: 700 });
    f.linea(X0, Y0, X0 + 800, Y0, { color: 'rgba(255,255,255,.5)', grosor: 2 });
    const yP = Y0 - META * PXMS;
    f.linea(X0, yP, X0 + 800, yP, { tono: 'yellow', grosor: 3, puntos: true });
    f.texto(X0 + 800, yP - 18, '16,7 ms: presupuesto', { tam: 22, tono: 'yellow', ancla: 'end', peso: 700 });
    f.texto(X0 - 12, Y0, '0', { tam: 20, ancla: 'end' }); f.texto(X0 - 12, Y0 - 30 * PXMS, '30 ms', { tam: 20, ancla: 'end' });
    for (let s = 0; s <= 10; s += 2) f.texto(X0 + s * 80, Y0 + 24, s + ' s', { tam: 22 });
    const barras = Array.from({ length: N }, (_, i) => f.nodo('rect', { x: X0 + i * 8 + 1, y: Y0, width: 6, height: 0, rx: 1 }));
    const res = f.texto(450, 410, '', { tam: 24, tono: 'white', peso: 700 });
    const BASE = [9, 12, 5];
    let modo = 0, i = 0, timer = 0;
    const di = FIG.dice(el);
    // Valores fijos (no aleatorios) para que la evidencia sea la misma cada vez.
    const ms = k => (k === 29 || k === 59 || k === 89) ? 30 + (k % 7) * .4 : BASE[modo] + ((k * 37) % 10) / 10;
    function barra(k) {
      const v = ms(k), h = v * PXMS;
      barras[k].setAttribute('y', Y0 - h); barras[k].setAttribute('height', h);
      barras[k].setAttribute('fill', v > META ? FIG.C.coral : FIG.C.soft);
    }
    function jugar() {
      clearInterval(timer); i = 0; res.pon('');
      barras.forEach(b => b.setAttribute('height', 0));
      di('Jugando 10 segundos...');
      timer = setInterval(() => {
        for (let r = 0; r < 4 && i < N; r++) barra(i++);
        if (i >= N) {
          clearInterval(timer);
          res.pon('3 frames de unos 30 ms: a los 3, 6 y 9 segundos').color('coral');
          di(modo === 2 ? 'Sin bichos el frame normal baja a unos 5 ms, pero <b>los picos siguen ahí, cada 3 s</b>. El culpable no depende de lo que hay en pantalla.'
            : `Con ${modo ? 60 : 30} bichos el frame normal ronda ${BASE[modo]} ms y cabe en el presupuesto. Pero cada 3 s un frame tarda casi el doble: <b>eso es el tirón</b>. Prueba sin bichos.`, 'bad');
        }
      }, 30);
    }
    const c = FIG.controles(el);
    c.opciones(['30 bichos', '60 bichos', 'Sin bichos'], k => { modo = k; jugar(); });
    c.boton('Jugar otra vez', jugar, true);
    jugar();
    return () => clearInterval(timer);
  };

  /* 11 · Basura escondida: siete líneas de Update, ¿cuáles piden memoria? */
  window.DEMOS.focos = function (el) {
    const L = [
      { c: 'Vector3 paso = new Vector3(0, -1, 0) * dt;', a: false, w: '<code>Vector3</code> es un struct: este <code>new</code> no va al heap. Cero basura.' },
      { c: 'string hud = "Puntos: " + puntos;', a: true, w: 'Los string son <b>inmutables</b>: cada <code>+</code> crea un texto nuevo en el heap, 60 veces por segundo. Arreglo: rearmarlo solo cuando cambian los puntos.' },
      { c: 'object caja = vidas;', a: true, w: '<b>Boxing:</b> un <code>int</code> guardado como <code>object</code> se copia a una caja nueva en el heap.' },
      { c: 'foreach (var b in bichos) b.Mover(dt);', a: false, w: 'Sobre un <code>List&lt;Bicho&gt;</code>, <code>foreach</code> usa un enumerador que es struct: no pide memoria. Si lo recorres como <code>IEnumerable&lt;Bicho&gt;</code>, sí.' },
      { c: 'bichos.ForEach(b => b.Vida -= dano);', a: true, w: 'La lambda <b>captura</b> la variable local <code>dano</code>: C# crea un objeto para guardarla y un delegado nuevo en cada llamada.' },
      { c: 'int vivos = bichos.Where(b => b.Vida > 0).Count();', a: true, w: '<code>Where</code> crea un objeto iterador en cada llamada. Un <code>for</code> con un contador hace lo mismo sin basura.' },
      { c: 'pantalla[i] = simbolo;', a: false, w: 'Escribir en un arreglo que ya existe no pide memoria. Es el patrón del «después».' }
    ];
    const f = FIG.lienzo(el, 900, 430), TOT = L.filter(x => x.a).length;
    const vista = new Array(L.length).fill(false);
    const filas = L.map((x, i) => {
      const y = 12 + i * 58;
      const caja = f.caja(20, y, 860, 50, '', { rx: 10, tono: 'paper', clic: () => revelar(i, true) });
      f.texto(44, y + 25, (i + 1) + '', { tam: 22, color: FIG.C.grey, peso: 800 }).t.style.pointerEvents = 'none';
      const cod = f.texto(72, y + 25, x.c, { tam: 22, ancla: 'start', color: FIG.C.ink, peso: 700 });
      cod.t.setAttribute('font-family', 'ui-monospace, Consolas, monospace'); cod.t.style.pointerEvents = 'none';
      const tag = f.texto(864, y + 25, '', { tam: 22, ancla: 'end', color: '#fff', peso: 800 });
      tag.t.style.pointerEvents = 'none';
      return { caja, cod, tag };
    });
    const di = FIG.dice(el, 'Toca una línea. ¿Pide memoria nueva en el heap cada vez que corre?');
    const c = FIG.controles(el), out = c.salida();
    function cuenta() {
      const hall = L.filter((x, i) => x.a && vista[i]).length, rev = vista.filter(Boolean).length;
      out('basura encontrada: ' + hall + ' de ' + TOT + ' · líneas revisadas: ' + rev + ' de ' + L.length);
    }
    function revelar(i, decir) {
      const x = L[i], r = filas[i]; vista[i] = true;
      r.caja.tono(x.a ? 'bad' : 'ok'); r.cod.color('#fff'); r.tag.pon(x.a ? 'asigna' : 'no asigna');
      if (decir) di(`<b>Línea ${i + 1}: ${x.a ? 'asigna' : 'no asigna'}.</b> ${x.w}`, x.a ? 'bad' : 'ok');
      cuenta();
    }
    function reset() {
      vista.fill(false);
      filas.forEach(r => { r.caja.tono('paper'); r.cod.color(FIG.C.ink); r.tag.pon(''); });
      di('Toca una línea. ¿Pide memoria nueva en el heap cada vez que corre?'); cuenta();
    }
    c.boton('Mostrar todas', () => { L.forEach((x, i) => revelar(i, false)); di('Cuatro de siete asignan: el texto, el boxing, la lambda que captura y el iterador de LINQ. Ninguna dice <code>new</code> de una clase, y aun así ensucian.', 'bad'); });
    c.boton('Reiniciar', reset, true);
    reset();
  };

  /* 12 · Localidad en la memoria real: líneas de caché de 64 bytes (caché de juguete de 2 líneas) */
  window.DEMOS.layout = function (el) {
    const f = FIG.lienzo(el, 900, 430), X0 = 110, CW = 48, RH = 44, Y0 = 56, PASO = 52, FILAS = 6, COLS = 16, NB = 10;
    f.texto(450, 22, 'Memoria en líneas de 64 bytes · cada casilla: 4 bytes', { tam: 22, tono: 'white', peso: 700 });
    const marcos = [], celdas = [];
    for (let r = 0; r < FILAS; r++) {
      const y = Y0 + r * PASO;
      f.texto(56, y + RH / 2, 'línea ' + (r + 1), { tam: 20 });
      marcos.push(f.nodo('rect', { x: X0 - 5, y: y - 4, width: COLS * CW + 6, height: RH + 8, rx: 9, fill: 'none', stroke: 'rgba(255,255,255,.15)', 'stroke-width': 2 }));
      for (let k = 0; k < COLS; k++) {
        const rc = f.nodo('rect', { x: X0 + k * CW, y, width: CW - 4, height: RH, rx: 6 });
        const tx = f.texto(X0 + k * CW + (CW - 4) / 2, y + RH / 2, '', { tam: 18, peso: 800, color: '#fff' });
        celdas.push({ rc, tx });
      }
    }
    // Lista de objetos: cada bicho en otro rincón del heap (fila, columna)
    const REGADOS = [[2, 1], [5, 9], [0, 6], [4, 2], [1, 11], [3, 5], [5, 1], [2, 10], [0, 12], [4, 12]];
    const cnt = f.texto(450, 404, '', { tam: 24, tono: 'white', peso: 700 });
    let modo = 0, timer = 0, cache = [], traidas = 0, aciertos = 0;
    const di = FIG.dice(el);
    const casillas = b => [0, 1, 2].map(j => modo === 0 ? b * 3 + j : REGADOS[b][0] * COLS + REGADOS[b][1] + j);
    function pinta(activo) {
      celdas.forEach(c => { c.rc.setAttribute('fill', modo === 1 ? '#2c2c31' : '#1b1b1e'); c.tx.pon(''); });
      for (let b = 0; b < NB; b++) casillas(b).forEach((k, j) => {
        celdas[k].rc.setAttribute('fill', b === activo ? FIG.C.yellow : FIG.C.cobalt);
        celdas[k].tx.pon('xyv'[j] + b).color(b === activo ? FIG.C.ink : '#fff');
      });
      marcos.forEach((m, r) => { const on = cache.includes(r); m.setAttribute('stroke', on ? FIG.C.yellow : 'rgba(255,255,255,.15)'); m.setAttribute('stroke-width', on ? 4 : 2); });
      cnt.pon('líneas traídas de la RAM: ' + traidas + ' · ya estaban en caché: ' + aciertos).color(traidas > 4 ? 'coral' : 'white');
    }
    function reset() {
      clearInterval(timer); cache = []; traidas = 0; aciertos = 0; pinta(-1);
      di(modo === 0 ? 'Arreglo de structs: 10 bichos de 12 bytes, uno tras otro (x, y, vida). Dale <b>Recorrer</b> y cuenta los viajes a la RAM.'
        : 'Lista de objetos: cada bicho vive en otro rincón del heap, entre otros datos (gris). Dale <b>Recorrer</b>.');
    }
    function recorrer() {
      reset(); let b = 0;
      timer = setInterval(() => {
        if (b >= NB) {
          clearInterval(timer); pinta(-1);
          di(modo === 0 ? `<b>${traidas} viajes a la RAM</b> para 10 bichos: cada línea trajo varios bichos de regalo. Así se recorre un arreglo de structs.`
            : `<b>${traidas} viajes a la RAM</b> para 10 bichos: casi cada uno vive en otra línea. Y antes, la CPU tuvo que leer la lista de direcciones.`, modo === 0 ? 'ok' : 'bad');
          return;
        }
        [...new Set(casillas(b).map(k => Math.floor(k / COLS)))].forEach(r => {
          const at = cache.indexOf(r);
          if (at >= 0) { aciertos++; cache.splice(at, 1); }
          else { traidas++; if (cache.length >= 2) cache.shift(); }
          cache.push(r);                                  // la más reciente queda al final
        });
        pinta(b); b++;
      }, 420);
    }
    const c = FIG.controles(el);
    c.opciones(['Arreglo de structs', 'Lista de objetos (class)'], i => { modo = i; reset(); });
    c.boton('Recorrer los 10 bichos', recorrer);
    reset();
    return () => clearInterval(timer);
  };
})();
