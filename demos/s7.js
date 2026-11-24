/* Figuras de la semana 7: checklist, piramide, aaa, pruebas, semilla, detectivePasos, detective, registro,
   regresion, reloj y flotante.
   Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   Las figuras nuevas usan FIG (assets/fig.js). Las cifras que muestran son ilustrativas. */
window.DEMOS = window.DEMOS || {};

/* 1 · checklist: la lista del piloto y la suite de pruebas que corre sola */
window.DEMOS.checklist = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const PIL = ['Tren de aterrizaje abajo', 'Flaps en posición', 'Combustible suficiente', 'Puertas cerradas', 'Frenos sueltos'];
  const SUI = ['Tanque_MuereAlTercerGolpe', 'Pool_DevuelveLasChispas', 'GameOver_NoPasaAPausa', 'Oleada3_TieneSeisLentos', 'Bicho_SumaDiezPuntos'];
  const marcado = [false, false, false, false, false];
  const caj = PIL.map((_, i) => ({
    m: f.caja(30, 22 + i * 78, 60, 60, '', { rx: 10, tam: 30, clic: () => toca(i) }),
    t: f.caja(104, 22 + i * 78, 520, 60, '', { tam: 24, tono: 'paper', rx: 10, clic: () => toca(i) })
  }));
  const est = f.caja(660, 120, 210, 150, '', { tam: 28 });
  const est2 = f.texto(765, 300, '', { tam: 22 });
  const di = FIG.dice(el);
  let modo = 0, timers = [];
  const L = () => (modo ? SUI : PIL);
  function pinta() {
    caj.forEach((c, i) => { c.m.rotulo(marcado[i] ? 'sí' : '').tono(marcado[i] ? 'ok' : 'off'); c.t.rotulo(L()[i]); });
    const faltan = marcado.filter(x => !x).length;
    est.rotulo(faltan ? 'faltan ' + faltan : 'listo').tono(faltan ? 'base' : 'ok');
    est2.pon(modo ? 'pruebas en verde' : 'renglones revisados');
  }
  function toca(i) { marcado[i] = !marcado[i]; pinta(); }
  function despegar() {
    const olvido = marcado.findIndex(x => !x);
    if (olvido < 0) { di(modo ? 'Cinco de cinco en verde: subes el cambio tranquilo.' : 'Lista completa: despegue normal.', 'ok'); return; }
    caj[olvido].t.tono('bad');
    di(modo ? 'Subiste el cambio sin correr <b>' + SUI[olvido] + '</b>. Si esa regla se rompió, te enteras el jueves en plena demo.'
      : 'Despegaste sin revisar <b>' + PIL[olvido].toLowerCase() + '</b>. Un solo renglón olvidado sale carísimo.', 'bad');
  }
  function auto() {
    timers.forEach(clearTimeout); timers = [];
    marcado.fill(false); pinta();
    marcado.forEach((_, i) => timers.push(setTimeout(() => { marcado[i] = true; pinta(); if (i === 4) di('La máquina revisó los cinco renglones en un instante, y lo hará igual cada vez que guardes.', 'ok'); }, 180 * (i + 1))));
  }
  const c = FIG.controles(el);
  c.opciones(['Lista del piloto', 'Suite de pruebas'], i => { modo = i; marcado.fill(false); pinta(); di(i ? 'Cada renglón ahora es una prueba automática. Pruébalo igual: olvida una.' : 'Marca los renglones tocándolos. Deja uno sin marcar y despega.'); });
  c.boton('Despegar / subir cambio', despegar);
  c.boton('Revisar todo solo', auto, true);
  pinta(); di('Marca los renglones tocándolos. Deja uno sin marcar y despega.');
  return () => { timers.forEach(clearTimeout); timers = []; };
};

/* 2 · piramide: muchas unitarias rápidas, pocas de integración, mínimas manuales */
window.DEMOS.piramide = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const N = [
    { n: 'Manuales', cu: 300, d: 'Una persona juega y mira. Minutos cada una. Decide si es divertido, no si el tanque muere al tercer golpe.' },
    { n: 'Integración', cu: 2, d: 'Varias piezas juntas: cargar el JSON y crear la oleada. Segundos cada una.' },
    { n: 'Unitarias', cu: 0.01, d: 'Una regla sola, sin pantalla ni disco. Milisegundos cada una: por eso pueden ser cientos.' }
  ];
  const CANT = [[1, 15, 120], [20, 15, 5]];
  const ANCHO = [[240, 440, 640], [640, 440, 240]];
  const bx = N.map((n, i) => f.caja(0, 0, 10, 92, '', { tam: 26, clic: () => toca(i) }));
  const tt = f.texto(450, 352, '', { tam: 24, tono: 'white', peso: 800 });
  f.texto(450, 396, 'tiempos ilustrativos', { tam: 22 });
  const di = FIG.dice(el);
  let modo = 0;
  function pinta() {
    let seg = 0;
    N.forEach((n, i) => {
      const w = ANCHO[modo][i], k = CANT[modo][i];
      seg += k * n.cu;
      const r = bx[i].g.querySelector('rect');
      r.setAttribute('x', 450 - w / 2); r.setAttribute('width', w); r.setAttribute('y', 20 + i * 100);
      const t = bx[i].g.querySelector('text'); t.setAttribute('x', 450); t.setAttribute('y', 66 + i * 100);
      bx[i].rotulo(n.n + ' · ' + k).tono(modo && i === 0 ? 'bad' : 'base');
    });
    const min = Math.round(seg / 60);
    tt.pon('una ronda completa: unos ' + min + ' min');
    return min;
  }
  function toca(i) { pinta(); bx[i].tono('on'); di('<b>' + N[i].n + '.</b> ' + N[i].d); }
  const c = FIG.controles(el);
  c.opciones(['Pirámide', 'Cono de helado'], i => {
    modo = i; const m = pinta();
    di(i ? 'Al revés: casi todo se revisa jugando. Una ronda toma unos ' + m + ' minutos, así que nadie la corre después de cada cambio.' : 'Muchas unitarias, pocas de integración, mínimas manuales. Una ronda toma unos ' + m + ' minutos, casi todos de la única prueba manual.', i ? 'bad' : 'ok');
  });
  pinta(); di('Toca un piso para ver qué revisa. Luego voltea la pirámide.');
};

/* 3 · aaa: Preparar, Actuar, Afirmar sobre el tanque que muere al tercer golpe */
window.DEMOS.aaa = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const P = [
    f.caja(30, 24, 450, 110, 'Preparar', { tam: 28 }),
    f.caja(30, 160, 450, 110, 'Actuar', { tam: 28 }),
    f.caja(30, 296, 450, 110, 'Afirmar', { tam: 28 })
  ];
  const D = ['tanque con vida 3', 'golpear 3 veces', '¿murió? se espera: sí'];
  const sub = D.map((d, i) => f.texto(255, 104 + i * 136, d, { tam: 22, tono: 'white' }));
  P.forEach((p, i) => { const t = p.g.querySelector('text'); t.setAttribute('y', 62 + i * 136); });
  const tanque = f.texto(690, 110, 'M', { tam: 96, tono: 'coral', peso: 900 });
  const vida = [0, 1, 2].map(i => f.circulo(630 + i * 60, 210, 20, { tono: 'coral', borde: '#fff' }));
  const res = f.caja(560, 290, 280, 100, 'sin ejecutar', { tam: 26, tono: 'off' });
  const di = FIG.dice(el);
  let bug = false, paso = -1, v = 3, timers = [];
  const muerto = x => (bug ? x < 0 : x <= 0);
  function pinta() {
    P.forEach((p, i) => p.tono(i === paso ? 'on' : 'base'));
    sub.forEach((s, i) => s.color(i === paso ? 'ink' : 'white'));
    vida.forEach((c, i) => c.color(i < v ? 'coral' : 'grey'));
    tanque.color(v > 0 ? 'coral' : 'grey');
  }
  function avanzar() {
    paso = (paso + 1) % 3;
    if (paso === 0) { v = 3; res.rotulo('sin ejecutar').tono('off'); di('<b>Preparar:</b> la situación más pequeña posible. Un tanque con vida 3, nada más.'); }
    if (paso === 1) { v = 0; di('<b>Actuar:</b> una sola cosa. Tres golpes y nada de pantalla, sonido ni disco.'); }
    if (paso === 2) {
      const ok = muerto(v);
      res.rotulo(ok ? 'Murio: sí · pasó' : 'Murio: no · FALLÓ').tono(ok ? 'ok' : 'bad');
      di(ok ? '<b>Afirmar:</b> esperaba que muriera y murió. Verde.' : '<b>Afirmar:</b> esperaba que muriera y sigue vivo con vida 0. La prueba señala la regla exacta que se rompió.', ok ? 'ok' : 'bad');
    }
    pinta();
  }
  function ejecutar() { timers.forEach(clearTimeout); timers = []; paso = -1; [0, 1, 2].forEach(i => timers.push(setTimeout(avanzar, 650 * i))); }
  const c = FIG.controles(el);
  c.boton('Un paso', avanzar);
  c.boton('Ejecutar la prueba', ejecutar, true);
  c.casilla('Meter un bug: muere si vida < 0', x => { bug = x; paso = -1; v = 3; res.rotulo('sin ejecutar').tono('off'); pinta(); di(x ? 'Alguien cambió <b>&lt;=</b> por <b>&lt;</b>. Ejecuta la prueba.' : 'Código sano otra vez. Ejecuta la prueba.'); });
  pinta(); di('Avanza un paso a la vez: Preparar, Actuar, Afirmar.');
  return () => { timers.forEach(clearTimeout); timers = []; };
};

/* 4 · semilla: misma semilla, misma secuencia de bichos */
window.DEMOS.semilla = function (el) {
  const f = FIG.lienzo(el, 900, 430), K = 10;
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const tipo = r => (r > .85 ? 'M' : r > .55 ? 'B' : 'b');
  f.texto(100, 110, 'anterior', { tam: 24 }); f.texto(100, 250, 'esta', { tam: 24, tono: 'white', peso: 800 });
  const A = Array.from({ length: K }, (_, i) => f.caja(196 + i * 69, 78, 60, 64, '', { tam: 30, rx: 10, tono: 'off' }));
  const B = Array.from({ length: K }, (_, i) => f.caja(196 + i * 69, 218, 60, 64, '', { tam: 30, rx: 10, tono: 'off' }));
  const lema = f.texto(450, 30, 'los próximos 10 bichos que aparecen', { tam: 22 });
  const sem = f.texto(450, 340, '', { tam: 26, tono: 'yellow', peso: 800 });
  const igual = f.texto(450, 390, '', { tam: 24, tono: 'white', peso: 700 });
  const di = FIG.dice(el);
  let conSemilla = false, prev = null, ultima = null, n = 0;
  function jugar(semilla) {
    const r = rng(semilla), seq = Array.from({ length: K }, () => tipo(r()));
    prev = ultima; ultima = { seq, semilla }; n++;
    B.forEach((c, i) => c.rotulo(seq[i]).tono(seq[i] === 'M' ? 'bad' : 'base'));
    A.forEach((c, i) => c.rotulo(prev ? prev.seq[i] : '').tono(prev ? 'paper' : 'off'));
    sem.pon('partida ' + n + ' · semilla ' + semilla);
    if (!prev) { igual.pon(''); di('Primera partida. Juega otra o repítela.'); return; }
    const dif = seq.filter((x, i) => x !== prev.seq[i]).length;
    B.forEach((c, i) => { if (seq[i] !== prev.seq[i]) c.tono('on'); });
    igual.pon(dif ? dif + ' de 10 bichos distintos' : 'idéntica a la anterior');
    return dif;
  }
  const nueva = () => (conSemilla ? 1234 : Math.floor(Math.random() * 1e6));
  const c = FIG.controles(el);
  c.opciones(['Sin semilla', 'Semilla 1234'], i => { conSemilla = !!i; });
  c.boton('Jugar partida', () => { const d = jugar(nueva()); if (prev) di(d ? 'Otra partida, otros bichos. Si el bug salió en la anterior, ya no la puedes volver a ver.' : 'Misma semilla, mismos bichos. El bug de «a veces» se vuelve de «siempre».', d ? 'bad' : 'ok'); });
  c.boton('Repetir la última', () => { if (!ultima) return; jugar(ultima.semilla); di('Usaste la semilla anotada de la partida que falló: <b>' + ultima.semilla + '</b>. Salió idéntica. Ahora sí puedes estudiar el bug.', 'ok'); }, true);
  di('Juega dos partidas sin semilla y compara. Luego anota la semilla y repite.');
};

/* 5 · detectivePasos: el método con un caso real de Turno Nocturno */
window.DEMOS.detectivePasos = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const PASO = ['Reproducir', 'Acotar', 'Hipótesis', 'Experimento', 'Atrapar'];
  const CASO = [
    ['Con la semilla 1234 y la grabación 7,', 'el tanque sobrevive en el frame 412. Siempre.'],
    ['Movimiento está bien. Falla en colisiones:', 'dos chispas tocan al tanque en el mismo frame.'],
    ['Una frase que se pueda desmentir:', '«la segunda chispa del frame no hace daño».'],
    ['Breakpoint condicional en Resolver:', 'un break sale del bucle tras la primera chispa.'],
    ['Prueba Tanque_ConDosChispasJuntas_PierdeDos', 'en rojo. Se quita el break. Verde, para siempre.']
  ];
  const cj = PASO.map((p, i) => f.caja(14 + i * 176, 24, 166, 76, p, { tam: 23, clic: () => ir(i) }));
  const fl = PASO.slice(1).map((_, i) => f.flecha(cj[i], cj[i + 1]));
  f.caja(14, 136, 872, 200, '', { tono: 'paper', rx: 18 });
  f.texto(40, 168, 'Caso: «a veces el tanque no muere»', { tam: 22, ancla: 'start', color: FIG.C.cobalt, peso: 800 });
  const l1 = f.texto(40, 236, '', { tam: 26, ancla: 'start', color: FIG.C.ink, peso: 700 });
  const l2 = f.texto(40, 286, '', { tam: 26, ancla: 'start', color: FIG.C.ink, peso: 700 });
  const pista = f.texto(450, 380, '', { tam: 22 });
  const di = FIG.dice(el);
  let hecho = -1;
  function pinta(i) {
    cj.forEach((c, j) => c.tono(j === i ? 'on' : j <= hecho ? 'ok' : 'base'));
    fl.forEach((a, j) => a.tono(j < hecho ? 'ok' : 'base'));
    l1.pon(i < 0 ? 'Toca «Siguiente paso».' : CASO[i][0]); l2.pon(i < 0 ? '' : CASO[i][1]);
    pista.pon(i < 0 ? '' : 'paso ' + (i + 1) + ' de 5');
  }
  function ir(i) {
    if (i > hecho + 1) {
      cj.forEach(c => c.tono('base')); cj[i].tono('bad');
      di('Saltaste a <b>' + PASO[i] + '</b> sin ' + PASO[hecho + 1].toLowerCase() + '. Eso es adivinar: cada cambio sin evidencia es una moneda al aire.', 'bad');
      return;
    }
    hecho = Math.max(hecho, i); pinta(i);
    di(i === 4 ? 'Caso cerrado: el bug quedó atrapado en una prueba. Si vuelve, la suite avisa en segundos.' : 'Paso ' + (i + 1) + ' hecho. Cada paso usa la evidencia del anterior.', i === 4 ? 'ok' : '');
  }
  const c = FIG.controles(el);
  c.boton('Siguiente paso', () => ir(Math.min(4, hecho + 1)));
  c.boton('Reiniciar', () => { hecho = -1; pinta(-1); di('Un caso real de Turno Nocturno. Avanza en orden o intenta saltarte pasos.'); }, true);
  pinta(-1); di('Un caso real de Turno Nocturno. Avanza en orden o intenta saltarte pasos.');
};

/* 6 · registro: niveles de log como un filtro de volumen */
window.DEMOS.registro = function (el) {
  const f = FIG.lienzo(el, 900, 430), NIV = ['Detalle', 'Info', 'Aviso', 'Error'];
  const TONO = ['off', 'base', 'on', 'bad'];
  const M = [
    [0, 'Pool', 'chispa prestada, libres = 7'],
    [1, 'Oleadas', 'inicia la oleada 2 con 8 bichos'],
    [0, 'Pool', 'chispa devuelta, libres = 8'],
    [0, 'Bichos', 'tanque baja a y = 6'],
    [2, 'Oleadas', 'la oleada 3 está vacía'],
    [0, 'Pool', 'chispa prestada, libres = 7'],
    [3, 'Pool', 'devolvieron 9 chispas y solo hay 8'],
    [1, 'Partida', 'puntaje guardado: 340']
  ];
  const filas = M.map((m, i) => ({
    tag: f.caja(16, 14 + i * 51, 150, 42, NIV[m[0]], { tam: 22, rx: 8, tono: TONO[m[0]] }),
    txt: f.texto(184, 35 + i * 51, '[' + m[1] + '] ' + m[2], { tam: 23, ancla: 'start', tono: 'white', peso: 600 })
  }));
  const di = FIG.dice(el);
  let min = 0, soloPool = false;
  function pinta() {
    let n = 0, err = false;
    M.forEach((m, i) => {
      const ve = m[0] >= min && (!soloPool || m[1] === 'Pool');
      filas[i].tag.ver(ve); filas[i].txt.ver(ve);
      if (ve) { n++; if (m[0] === 3) err = true; }
    });
    if (soloPool && min === 0) di('Solo el módulo Pool en Detalle: ' + n + ' líneas y el error salta a la vista. Así se depura un módulo sin ahogarse.', 'ok');
    else if (min === 0) di('Nivel Detalle: ' + n + ' líneas. Con 40 bichos serían miles por segundo y el error se pierde en el ruido.', 'bad');
    else if (min === 3) di('Solo errores: 1 línea. Sabes qué falló, pero no qué venía pasando antes.');
    else di('Mínimo ' + NIV[min] + ': ' + n + (n === 1 ? ' línea' : ' líneas') + (err ? '. El error está a la vista sin borrar código.' : '.'), err ? 'ok' : '');
  }
  const c = FIG.controles(el);
  c.opciones(NIV, i => { min = i; pinta(); });
  c.casilla('Solo módulo Pool', v => { soloPool = v; pinta(); });
  pinta();
};

/* ---------- pruebas: tres versiones del código, cinco pruebas de verdad ---------- */
window.DEMOS.pruebas = function (el) {
  const VERSIONES = {
    ok: {
      golpe: (v, d) => { if (d < 0) d = 0; v -= d; return v < 0 ? 0 : v; },
      muerto: v => v <= 0,
      src: 'int RecibirGolpe(int vida, int danio)\n{\n    if (danio < 0) danio = 0;\n    vida -= danio;\n    return vida < 0 ? 0 : vida;\n}\n\nbool EstaMuerto(int vida) => vida <= 0;'
    },
    a: {
      golpe: (v, d) => { if (d < 0) d = 0; v -= d; return v < 0 ? 0 : v; },
      muerto: v => v <= 1,
      src: 'int RecibirGolpe(int vida, int danio)\n{\n    if (danio < 0) danio = 0;\n    vida -= danio;\n    return vida < 0 ? 0 : vida;\n}\n\nbool EstaMuerto(int vida) => vida <= 1;     // <-- BUG A: era <= 0'
    },
    b: {
      golpe: (v, d) => { v -= d; return v < 0 ? 0 : v; },
      muerto: v => v <= 0,
      src: 'int RecibirGolpe(int vida, int danio)\n{\n                                            // <-- BUG B: se borró el if (danio < 0)\n    vida -= danio;\n    return vida < 0 ? 0 : vida;\n}\n\nbool EstaMuerto(int vida) => vida <= 0;'
    }
  };
  const golpes = (c, vida, n) => { for (let i = 0; i < n; i++) vida = c.golpe(vida, 1); return vida; };
  const PRUEBAS = [
    { n: 'Lento_MuereAlPrimerGolpe', f: c => [true, c.muerto(golpes(c, 1, 1))] },
    { n: 'Tanque_SobreviveAlPrimerGolpe', f: c => [false, c.muerto(golpes(c, 3, 1))] },
    { n: 'Tanque_SigueVivoAlSegundoGolpe', f: c => [false, c.muerto(golpes(c, 3, 2))] },
    { n: 'Tanque_MuereAlTercerGolpe', f: c => [true, c.muerto(golpes(c, 3, 3))] },
    { n: 'DanioNegativo_NoSubeLaVida', f: c => [2, c.golpe(2, -5)] }
  ];
  const fila = 'display:flex;justify-content:space-between;flex-wrap:wrap;gap:.2em 1em;padding:.4em .7em;margin-top:.35em;border:2px solid #0d0d0e;border-radius:8px;';
  el.innerHTML = '<div class="ctl" style="margin-top:0"><label>Versión del código <select style="font:inherit;padding:.35em .5em;border:2px solid #0d0d0e;border-radius:8px;background:#fff;color:#0d0d0e">' +
    '<option value="ok">Sin bug</option><option value="a">Bug A: comparación equivocada</option><option value="b">Bug B: se borró una validación</option></select></label>' +
    '<button>Ejecutar pruebas</button><span class="out res"></span></div>' +
    '<div style="display:flex;gap:1em;align-items:stretch;min-height:0"><div class="log codigo" style="flex:1 1 0;max-height:none;margin:0"></div>' +
    '<div class="lista" role="status" style="flex:1.1 1 0">' + PRUEBAS.map(p => '<div class="out t" style="' + fila + '"><b>' + p.n + '</b><span class="r">sin ejecutar</span></div>').join('') + '</div></div>';
  const sel = el.querySelector('select'), btn = el.querySelector('button'), res = el.querySelector('.res');
  const cod = el.querySelector('.codigo'), filas = Array.from(el.querySelectorAll('.t'));
  const decir = v => v === true ? 'verdadero' : v === false ? 'falso' : String(v);
  let timers = [];
  function limpiar() {
    timers.forEach(clearTimeout); timers = [];
    filas.forEach(f => { f.style.background = '#fff'; f.style.color = '#0d0d0e'; f.querySelector('.r').textContent = 'sin ejecutar'; });
    res.textContent = ''; btn.disabled = false;
    cod.textContent = VERSIONES[sel.value].src;
  }
  function ejecutar() {
    limpiar(); btn.disabled = true;
    const c = VERSIONES[sel.value]; let bien = 0; const rojas = [];
    PRUEBAS.forEach((p, i) => {
      timers.push(setTimeout(() => {
        const [esperado, obtenido] = p.f(c), ok = esperado === obtenido;
        if (ok) bien++; else rojas.push(p.n);
        filas[i].style.background = ok ? '#2e7653' : '#e0706a'; filas[i].style.color = '#fff';
        filas[i].querySelector('.r').textContent = ok ? 'pasó' : 'FALLÓ: esperaba ' + decir(esperado) + ', obtuvo ' + decir(obtenido);
        if (i === PRUEBAS.length - 1) {
          btn.disabled = false;
          res.textContent = rojas.length
            ? bien + ' de 5 en verde. ' + rojas.join(', ') + ' atrapó el bug en un segundo.'
            : '5 de 5 en verde. Puedes seguir cambiando código con tranquilidad.';
        }
      }, 380 * (i + 1)));
    });
  }
  sel.onchange = limpiar;
  btn.onclick = ejecutar;
  limpiar();
  return () => { timers.forEach(clearTimeout); timers = []; };
};

/* ---------- detective: 16 commits, uno introdujo el bug; por mitades bastan 4 ---------- */
window.DEMOS.detective = function (el) {
  const base = 'min-width:2.4em;padding:.45em 0;border-radius:8px;border:2px solid #0d0d0e;font-weight:700;font-size:1.05em;';
  el.innerHTML = '<div class="out" style="margin-bottom:.6em">Verde: probado y bueno · Coral: probado y malo · Amarillo: sospechosos que quedan</div>' +
    '<div class="fila" style="display:flex;flex-wrap:wrap;gap:.4em"></div>' +
    '<div class="ctl"><button class="sec nuevo">Nuevo caso</button><span class="out cuenta"></span></div>' +
    '<div class="log" role="status"></div>';
  const cont = el.querySelector('.fila'), log = el.querySelector('.log'), cuenta = el.querySelector('.cuenta');
  let culpable, estado, intentos, bueno, malo, historia, resuelto;

  function nuevo() {
    culpable = 1 + Math.floor(Math.random() * 16);       // el primer commit malo, de 1 a 16
    estado = new Array(17).fill(0);                      // 0 sin probar, 1 bueno, 2 malo
    estado[0] = 1; estado[16] = 2;                       // lo que ya se sabe
    intentos = 0; bueno = 0; malo = 16; historia = []; resuelto = false;
    pintar();
  }
  function probar(i) {
    if (resuelto || estado[i]) return;
    intentos++;
    const esMalo = i >= culpable;
    estado[i] = esMalo ? 2 : 1;
    if (esMalo) malo = Math.min(malo, i); else bueno = Math.max(bueno, i);
    const util = esMalo ? i === malo : i === bueno;
    historia.push('Prueba ' + intentos + ': commit ' + i + ' → ' + (esMalo ? 'MALO' : 'bueno') + (util ? '' : '  (ya se sabía: estaba fuera de la zona amarilla)'));
    if (malo === bueno + 1) resuelto = true;
    pintar();
  }
  function pintar() {
    cont.innerHTML = '';
    for (let i = 0; i <= 16; i++) {
      const b = document.createElement('button');
      const sospechoso = !estado[i] && i > bueno && i < malo;
      let fondo = '#fff', color = '#0d0d0e', extra = '';
      if (estado[i] === 1) { fondo = '#2e7653'; color = '#fff'; }
      else if (estado[i] === 2) { fondo = '#e0706a'; color = '#fff'; }
      else if (sospechoso) fondo = '#e2a54a';
      else extra = 'opacity:.45;';
      if (resuelto && i === malo) extra += 'outline:5px solid #e2a54a;outline-offset:2px;';
      b.style.cssText = base + 'background:' + fondo + ';color:' + color + ';' + extra;
      b.textContent = i === 0 ? 'v0' : String(i);
      b.setAttribute('aria-label', (i === 0 ? 'Versión anterior' : 'Commit ' + i) + (estado[i] === 1 ? ', bueno' : estado[i] === 2 ? ', malo' : ', sin probar'));
      if (i === 0 || i === 16 || estado[i] || resuelto) b.disabled = true;
      b.onclick = () => probar(i);
      cont.appendChild(b);
    }
    cuenta.textContent = 'Pruebas hechas: ' + intentos;
    let txt;
    if (resuelto) {
      txt = 'Culpable: el commit ' + malo + '. El ' + bueno + (bueno === 0 ? ' (v0)' : '') + ' está bueno y el ' + malo + ' ya está malo.\nLo acotaste con ' + intentos + (intentos === 1 ? ' prueba. ' : ' pruebas. ');
      if (intentos < 4) txt += 'Tuviste suerte. Por mitades, 4 pruebas lo garantizan siempre, sin depender de la suerte.';
      else if (intentos === 4) txt += 'Justo lo que garantiza ir por mitades: 16 → 8 → 4 → 2 → 1.';
      else txt += 'Probando siempre el del medio de la zona amarilla bastan 4: 16 → 8 → 4 → 2 → 1. Dale a "Nuevo caso" e inténtalo.';
      txt += '\n\n' + historia.join('\n');
    } else {
      txt = 'Se sabe que v0 funcionaba y que el commit 16 falla. El culpable está entre el ' + (bueno + 1) + ' y el ' + malo + ': quedan ' + (malo - bueno) + ' sospechosos.';
      if (historia.length) txt += '\n\n' + historia.join('\n');
    }
    log.textContent = txt; log.scrollTop = 0;
  }
  el.querySelector('.nuevo').onclick = nuevo;
  nuevo();
  return () => { cont.innerHTML = ''; };
};

/* 9 · regresion: el mismo bug descubierto el lunes con pruebas o el jueves en la demo */
window.DEMOS.regresion = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves'], POR = [4, 5, 4, 3], BUG = 1;   /* el 2.º commit del lunes rompe el puntaje */
  const RECUERDO = ['fresco', 'borroso', 'vago', 'casi nada'];
  const col = d => 20 + d * 220;
  const cab = DIAS.map((n, d) => f.caja(col(d), 16, 200, 48, n, { tam: 24, tono: 'off', rx: 10 }));
  const cm = [];
  DIAS.forEach((_, d) => { for (let j = 0; j < POR[d]; j++) cm.push({ d, j, c: f.caja(col(d) + 8 + (j % 4) * 48, 80 + Math.floor(j / 4) * 48, 40, 40, '', { tam: 22, rx: 8 }).ver(false) }); });
  const t1 = f.texto(30, 210, '', { tam: 24, ancla: 'start', tono: 'white', peso: 700 });
  const t2 = f.texto(30, 248, '', { tam: 24, ancla: 'start', tono: 'white', peso: 700 });
  const est = f.caja(30, 290, 840, 110, '', { tam: 28, rx: 16 });
  f.texto(450, 418, 'cifras ilustrativas', { tam: 22 });
  const di = FIG.dice(el);
  let conPruebas = false, dia = 0;
  function pinta() {
    const hechos = cm.filter(x => x.d <= dia && !(conPruebas && x.d === 0 && x.j > BUG));
    cab.forEach((c, d) => c.tono(d === dia ? 'on' : d < dia ? 'base' : 'off'));
    cm.forEach(x => x.c.ver(hechos.includes(x)).rotulo('').tono('base'));
    const bug = cm[BUG], encima = hechos.length - BUG;
    if (conPruebas) {
      bug.c.tono('ok').rotulo('✓');
      t1.pon('sospechosos cuando la suite se puso roja: 1');
      t2.pon('lo que recordabas del cambio: fresco');
      est.rotulo(dia === 0 ? 'Lunes 10:02 · suite en rojo: Puntaje_SumaAlMorirUnBicho' : DIAS[dia] + ' · suite en verde · la demo del jueves está a salvo').tono(dia === 0 ? 'bad' : 'ok');
      di(dia === 0 ? 'La prueba del puntaje falló dos minutos después del commit culpable. Un solo sospechoso y lo tienes fresco: lo arreglas antes del almuerzo.' : 'El bug se arregló el lunes y la prueba lo vigila desde entonces. Cada día corres la suite en segundos.', 'ok');
    } else {
      const demo = dia === 3;
      bug.c.tono(demo ? 'bad' : 'base');
      t1.pon('commits sospechosos, del culpable en adelante: ' + encima);
      t2.pon('lo que recuerdas del cambio del lunes: ' + RECUERDO[dia]);
      est.rotulo(demo ? 'Jueves, en plena demo: el puntaje se queda en 0' : DIAS[dia] + ' · todo se ve bien · nadie corre nada').tono(demo ? 'bad' : 'base');
      if (demo) di('El bug nació el lunes y apareció el jueves: ' + encima + ' commits sospechosos y casi nada en la memoria. Toca buscar por mitades (lo vemos hoy).', 'bad');
      else di(DIAS[dia] + ': el bug ya está ahí, escondido. Cada commit nuevo es un sospechoso más. Avanza un día.');
    }
  }
  const c = FIG.controles(el);
  c.opciones(['Sin pruebas', 'Con pruebas automáticas'], i => { conPruebas = !!i; dia = 0; pinta(); });
  c.boton('Avanzar un día', () => { dia = Math.min(3, dia + 1); pinta(); });
  c.boton('Reiniciar', () => { dia = 0; pinta(); }, true);
  pinta();
};

/* 10 · reloj: una prueba que depende de la hora real pasa de día y falla de noche */
window.DEMOS.reloj = function (el) {
  const f = FIG.lienzo(el, 900, 430), X0 = 30, P = 35, CW = 33;
  f.texto(X0, 26, 'A · Golpear lee DateTime.Now; la prueba espera 10 puntos', { tam: 22, ancla: 'start', tono: 'white', peso: 700 });
  f.texto(X0, 166, 'B · Golpear recibe la hora; la prueba le pasa hora: 10', { tam: 22, ancla: 'start', tono: 'white', peso: 700 });
  const A = [], B = [];
  for (let h = 0; h < 24; h++) {
    A.push(f.caja(X0 + h * P, 46, CW, 50, '', { rx: 6, tam: 22 }).tono(h >= 22 ? 'bad' : 'ok'));
    B.push(f.caja(X0 + h * P, 186, CW, 50, '', { rx: 6, tam: 22 }).tono('ok'));
  }
  [0, 6, 12, 18, 23].forEach(h => { f.texto(X0 + h * P + CW / 2, 116, h + ' h', { tam: 22 }); f.texto(X0 + h * P + CW / 2, 256, h + ' h', { tam: 22 }); });
  const marca = f.nodo('rect', { y: 38, width: CW + 10, height: 206, rx: 8, fill: 'none', stroke: FIG.C.yellow, 'stroke-width': 4 });
  const rA = f.caja(X0, 290, 410, 100, '', { tam: 26 }), rB = f.caja(X0 + 430, 290, 410, 100, '', { tam: 26 });
  const di = FIG.dice(el);
  let hora = 15;
  function pinta() {
    marca.setAttribute('x', X0 + hora * P - 5);
    const pasaA = hora < 22;
    rA.rotulo('Prueba A: ' + (pasaA ? 'pasó' : 'FALLÓ (dio 20)')).tono(pasaA ? 'ok' : 'bad');
    rB.rotulo('Prueba B: pasó').tono('ok');
    if (pasaA) di('Son las ' + hora + ':00. Las dos pruebas pasan. La A parece sana, pero su resultado depende de la hora a la que la corras.', '');
    else di('Son las ' + hora + ':00 y la prueba A falla sin que nadie haya tocado el código. Es una prueba intermitente: mañana a las 9 vuelve a pasar y el equipo deja de creerle. La B pasa siempre: la hora es un dato de la prueba.', 'bad');
  }
  const c = FIG.controles(el);
  const inp = c.deslizador('Hora en que corres la prueba', 0, 23, hora, 1, v => { hora = v; pinta(); }, v => v + ':00');
  c.boton('Servidor nocturno (23:00)', () => { hora = 23; inp.value = 23; inp.oninput(); });
  pinta();
};

/* 11 · flotante: el mismo cálculo con otro orden u otra precisión da otro resultado */
window.DEMOS.flotante = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const sim = (n, corto) => { let y = 0; for (let i = 0; i < n; i++) y = corto ? Math.fround(y + Math.fround(0.1)) : y + 0.1; return y; };
  const t1 = f.texto(225, 34, '', { tam: 22, tono: 'soft' }), t2 = f.texto(675, 34, '', { tam: 22, tono: 'soft' });
  const A = f.caja(20, 56, 410, 120, '', { tam: 26, sub: ' ' }), B = f.caja(470, 56, 410, 120, '', { tam: 26, sub: ' ' });
  [A, B].forEach(b => { b.g.querySelector('text').style.fontFamily = '"JetBrains Mono", monospace'; });
  const ver = f.caja(170, 210, 560, 76, '', { tam: 28 });
  const pista = f.texto(450, 330, '', { tam: 22, tono: 'white', peso: 600 });
  const pista2 = f.texto(450, 366, '', { tam: 22, tono: 'white', peso: 600 });
  f.texto(450, 410, 'valores calculados en vivo con double (64 bits) y float (32 bits)', { tam: 22 });
  const di = FIG.dice(el);
  let ex = 0, frame = 500;
  function pinta() {
    let a, b, la, lb, sa, sb, iguales;
    if (ex === 0) {
      let s = 0; for (let i = 0; i < 10; i++) s += 0.1;
      la = 'sumar 0,1 diez veces'; lb = 'escribir 1,0'; a = s; b = 1; sa = 'double'; sb = 'double';
      iguales = a === b;
      pista.pon('0,1 no tiene representación exacta en binario,'); pista2.pon('igual que 1/3 no la tiene en decimal.');
      di('Diez sumas de 0,1 dan ' + String(a) + '. Un <code>if (x == 1.0)</code> nunca se cumple. Compara con una tolerancia o usa enteros: puntos, vidas y casillas no necesitan decimales.', 'bad');
    } else if (ex === 1) {
      la = '(0,1 + 0,2) + 0,3'; lb = '0,1 + (0,2 + 0,3)'; a = (0.1 + 0.2) + 0.3; b = 0.1 + (0.2 + 0.3); sa = 'double'; sb = 'double';
      iguales = a === b;
      pista.pon('En matemáticas la suma es asociativa.'); pista2.pon('En punto flotante, no: el orden cambia el redondeo.');
      di('Mismos números, otro orden, otro resultado. Si un compilador o una CPU reordena operaciones, dos máquinas pueden no coincidir en el último decimal.', 'bad');
    } else {
      la = 'máquina A · frame ' + frame; lb = 'máquina B · frame ' + frame; a = sim(frame, false); b = sim(frame, true); sa = 'intermedios en double'; sb = 'intermedios en float';
      iguales = (a >= 50) === (b >= 50);
      pista.pon('El bicho baja 0,1 por frame. En la fila 50 toca el cable.'); pista2.pon('Ambas máquinas reciben la misma semilla y los mismos comandos.');
      if (iguales) di('Frame ' + frame + ': las posiciones difieren en decimales lejanos, pero las dos máquinas toman la misma decisión. Mueve el frame hacia 500.', 'ok');
      else di('Frame ' + frame + ': en A el bicho ya tocó el cable y quita una vida; en B todavía no. Desde aquí las partidas se separan: es un desync. Por eso el lockstep cuida el punto flotante o usa enteros y punto fijo.', 'bad');
    }
    t1.pon(la); t2.pon(lb);
    A.rotulo(String(a)).sub(sa); B.rotulo(String(b)).sub(sb);
    ver.rotulo(ex === 2 ? (iguales ? 'misma decisión: ' + (a >= 50 ? 'tocó el cable' : 'aún no llega') : 'decisiones distintas: desync') : (iguales ? 'iguales' : '¿iguales? false')).tono(iguales ? 'ok' : 'bad');
  }
  const c = FIG.controles(el);
  const op = c.opciones(['Sumar 0,1 diez veces', 'Cambiar el orden', 'Dos máquinas'], i => { ex = i; pinta(); });
  c.deslizador('Frame', 490, 510, frame, 1, v => { frame = v; if (ex !== 2) op.elegir(2); else pinta(); });
  pinta();
};
