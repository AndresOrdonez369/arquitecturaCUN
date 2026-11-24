/* Figuras de la semana 8: cronómetro de la demo, antes y después del rescate, post-mortem,
   cuándo paga una abstracción y lista de chequeo de arquitectura.
   Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   Las cifras que muestran son ilustrativas. El mapa del curso lo dibuja FIG.ruta (bloque {ruta: 8}). */
window.DEMOS = window.DEMOS || {};

/* 1 · demoReloj: la demo de 5 minutos en cinco paradas, con cronómetro para usar en clase */
window.DEMOS.demoReloj = function (el) {
  const P = [
    ['Problema', 45, 'Qué dolía en el Program.cs original, en una frase y con una línea de código: «agregar un bicho tocaba cuatro lugares».'],
    ['Antes', 60, 'El código o el diagrama original. Señala el acoplamiento con el dedo; no lo leas entero.'],
    ['Decisión', 75, 'Qué patrón o estructura eligieron, por qué esa, y qué alternativa descartaron.'],
    ['Después', 75, 'El juego corriendo y una cifra medida: ms por frame, KB de basura por frame, lugares que toca un bicho nuevo, pruebas en verde.'],
    ['Cambiaría', 45, 'Qué harían distinto si empezaran mañana. Es la parada que más criterio demuestra: no la sacrifiquen.']
  ];
  const T = P.reduce((s, p) => s + p[1], 0), X0 = 30, AN = 840, Y = 140, AL = 96;
  const f = FIG.lienzo(el, 900, 300);
  const mmss = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const reloj = f.texto(450, 52, '5:00', { tam: 64, peso: 800, color: '#ffffff' });
  const etapa = f.texto(450, 108, '', { tam: 24, tono: 'soft' });
  let x = X0;
  const ini = [], cajas = P.map((p, i) => {
    const w = AN * p[1] / T; ini.push(x);
    const c = f.caja(x + 3, Y, w - 6, AL, p[0], { tam: 22, clic: () => saltar(i) });
    x += w; return c;
  });
  const tiempos = P.map((p, i) => f.texto(ini[i] + AN * p[1] / T / 2, Y + AL + 30, '', { tam: 22, tono: 'soft' }));
  const cursor = f.linea(X0, Y - 12, X0, Y + AL + 12, { tono: 'yellow', grosor: 5 });
  const c = FIG.controles(el), di = FIG.dice(el);
  let escala = 1, corriendo = false, t0 = 0, va = 0, previa = -1, id = null;
  const total = () => T * escala;
  function parada(seg) { let acc = 0; for (let i = 0; i < P.length; i++) { acc += P[i][1] * escala; if (seg < acc) return i; } return P.length; }
  function pinta() {
    const resta = total() - va, i = parada(va);
    reloj.pon(resta >= 0 ? mmss(resta) : '+' + mmss(-resta)).color(resta >= 0 ? '#ffffff' : 'coral');
    cajas.forEach((cj, j) => cj.tono(j < i ? 'ok' : j === i ? 'on' : 'base'));
    tiempos.forEach((t, j) => t.pon(mmss(P[j][1] * escala)));
    const cx = X0 + AN * Math.min(1, va / total());
    cursor.setAttribute('x1', cx); cursor.setAttribute('x2', cx);
    if (i >= P.length) { etapa.pon('Tiempo cumplido'); if (previa !== i) di('Tiempo. Cierren con la cifra y con lo que cambiarían. La retroalimentación va aparte.', 'bad'); }
    else { etapa.pon('Parada ' + (i + 1) + ' de 5 · ' + P[i][0]); if (previa !== i) di('<b>' + P[i][0] + ' (' + mmss(P[i][1] * escala) + ').</b> ' + P[i][2], i === 3 ? 'ok' : ''); }
    previa = i;
  }
  function tic() { if (corriendo) { va = (performance.now() - t0) / 1000; pinta(); } }
  function saltar(i) { let acc = 0; for (let j = 0; j < i; j++) acc += P[j][1] * escala; va = acc; t0 = performance.now() - va * 1000; previa = -1; pinta(); }
  const bIni = c.boton('Iniciar', () => {
    corriendo = !corriendo;
    if (corriendo) { t0 = performance.now() - va * 1000; bIni.textContent = 'Pausar'; } else bIni.textContent = 'Seguir';
  });
  function reiniciar() { corriendo = false; va = 0; previa = -1; bIni.textContent = 'Iniciar'; pinta(); }
  c.boton('Reiniciar', reiniciar, true);
  c.opciones(['5 minutos', '4 minutos'], i => { escala = i ? 0.8 : 1; reiniciar(); });
  id = setInterval(tic, 200);
  pinta();
  di('Cronómetro para las demos. Toca una parada para saltar a ella y ver qué mostrar.');
  return () => clearInterval(id);
};

/* 2 · antesDespues: Turno Nocturno antes y después del rescate (cifras de ejemplo) */
window.DEMOS.antesDespues = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const bloque = f.caja(30, 110, 500, 210, 'Program.cs', { tam: 34, tono: 'bad' });
  const nuc = f.caja(185, 172, 190, 84, 'Núcleo', { tam: 28, tono: 'on' });
  const M = [['Consola', 20, 30], ['Audio', 370, 30], ['Datos', 20, 316], ['Pruebas', 370, 316]].map(m => f.caja(m[1], m[2], 170, 76, m[0], { tam: 25 }));
  const fl = M.map(m => f.flecha(m, nuc));
  const S = [['Program.cs', '232 líneas', '20 líneas'], ['Bicho nuevo', '4 lugares', '1 fila'], ['Pruebas', '0', '8 en verde'], ['Basura/frame', '3 KB', '0 KB']];
  f.texto(725, 26, 'cifras de ejemplo', { tam: 22, tono: 'yellow', peso: 800 });
  const st = S.map((s, i) => f.caja(570, 52 + i * 92, 310, 80, '', { tam: 24, tono: 'paper' }));
  const di = FIG.dice(el);
  let modo = 0;
  function pinta() {
    bloque.ver(!modo).tono('bad'); nuc.ver(!!modo).tono('on');
    M.forEach(m => m.ver(!!modo).tono('base')); fl.forEach(a => a.ver(!!modo).tono('base'));
    st.forEach((c, i) => c.rotulo(S[i][0] + ': ' + S[i][modo ? 2 : 1]).tono(modo ? 'ok' : 'paper'));
  }
  const c = FIG.controles(el);
  c.opciones(['Antes', 'Después'], i => { modo = i; pinta(); di(i ? 'Cinco módulos y todas las flechas hacia el núcleo. Así se cuenta un rescate: un dibujo y una cifra.' : 'Un solo bloque que sabe de todo. Funciona, pero cada cambio toca todo.', i ? 'ok' : 'bad'); });
  c.boton('Agregar un bicho', () => {
    pinta();
    if (!modo) { bloque.tono('bad'); di('Antes: cuatro <b>if</b> en cuatro lugares del mismo archivo, y rezar.', 'bad'); }
    else { M[2].tono('on'); fl[2].tono('on'); di('Después: una fila nueva en <b>Datos</b>. Ningún otro módulo se abre.', 'ok'); }
  });
  pinta(); di('Las cifras son un ejemplo de cómo presentar. En tu demo, usa las que mediste.');
};

/* 3 · postmortem: clasifica frases de un post-mortem y aprende a reescribir las que no sirven */
window.DEMOS.postmortem = function (el) {
  const F = [
    ['Juan nunca hizo nada.', 2, 'Culpa a una persona y no dice qué pasó. Mejor: «las tareas no tenían dueño ni fecha». Regla: cada tarea del tablero lleva un nombre.'],
    ['Empezamos las pruebas el último día.', 1, 'Es un hecho concreto, sin culpables. Regla: la primera prueba se escribe el mismo día que nace la regla del juego.'],
    ['Pasar los bichos a JSON volvió cada bicho nuevo una fila.', 0, 'Decisión concreta con un efecto visible. Se repite: lo que cambia a diario vive en datos.'],
    ['Todo salió mal con el bus de eventos.', 2, 'Demasiado vago. Mejor: «el HUD se suscribía dos veces y el puntaje sumaba doble». Regla: desuscribir en el mismo lugar donde se suscribe.'],
    ['Medimos con el Profiler antes de poner el pool.', 0, 'Evidencia antes del cambio. Se repite: primero la cifra, después la optimización.'],
    ['Refactorizamos todo en un solo commit y no supimos qué rompió el puntaje.', 1, 'Hecho concreto con su consecuencia. Regla: cambios pequeños, uno por commit, con las pruebas en verde.']
  ];
  const COL = ['Salió bien', 'Salió mal', 'Reescribir'];
  const f = FIG.lienzo(el, 900, 300);
  f.caja(30, 18, 840, 164, '', { tono: 'paper' });
  const L = [f.texto(450, 70, '', { tam: 30, peso: 700, color: '#0d0d0e' }), f.texto(450, 112, '', { tam: 30, peso: 700, color: '#0d0d0e' })];
  const num = f.texto(450, 156, '', { tam: 22, peso: 600, color: '#76767c' });
  const cajas = COL.map((t, i) => f.caja(30 + i * 285, 204, 270, 76, t, { tam: 24, tono: 'off' }));
  const di = FIG.dice(el), c = FIG.controles(el);
  let k = 0, listo = false, aciertos = 0, hechas = 0;
  function partir(s) {
    const pal = s.split(' '), out = ['']; pal.forEach(p => { const u = out.length - 1; if ((out[u] + ' ' + p).trim().length > 40 && out[u]) out.push(p); else out[u] = (out[u] + ' ' + p).trim(); });
    return out;
  }
  function pinta() {
    const ls = partir('«' + F[k][0] + '»');
    L[0].pon(ls[0]); L[1].pon(ls[1] || '');
    L[0].t.setAttribute('y', ls.length > 1 ? 66 : 90); L[1].ver(ls.length > 1);
    num.pon('Frase ' + (k + 1) + ' de ' + F.length + ' · aciertos ' + aciertos + ' de ' + hechas);
    cajas.forEach((cj, i) => cj.tono(listo ? (i === F[k][1] ? 'on' : 'off') : 'base'));
  }
  function responder(i) {
    if (listo) return;
    listo = true; hechas++;
    const ok = i === F[k][1]; if (ok) aciertos++;
    pinta();
    di((ok ? '<b>Bien.</b> ' : '<b>Va en «' + COL[F[k][1]] + '».</b> ') + F[k][2], ok ? 'ok' : 'bad');
  }
  COL.forEach((t, i) => c.boton(t, () => responder(i)));
  c.boton('Siguiente frase', () => { k = (k + 1) % F.length; if (k === 0) { aciertos = 0; hechas = 0; } listo = false; pinta(); di('¿Salió bien, salió mal, o hay que reescribirla porque culpa a alguien o es vaga?'); }, true);
  pinta();
  di('¿Salió bien, salió mal, o hay que reescribirla porque culpa a alguien o es vaga?');
};

/* 4 · curvaDiseno: cuándo paga una abstracción (modelo ilustrativo, no datos medidos) */
window.DEMOS.curvaDiseno = function (el) {
  const f = FIG.lienzo(el, 900, 440);
  const X = k => 90 + k * 37.5, Y = v => 360 - v * 6.2;
  const directo = k => 1 + 0.6 * k + 0.09 * k * k, patron = k => 8 + 0.7 * k;
  const corte = (0.1 + Math.sqrt(0.01 + 4 * 0.09 * 7)) / (2 * 0.09);
  f.linea(90, 360, 860, 360, { color: 'rgba(255,255,255,.5)', grosor: 3 });
  f.linea(90, 360, 90, 44, { color: 'rgba(255,255,255,.5)', grosor: 3 });
  [0, 5, 10, 15, 20].forEach(k => { f.texto(X(k), 384, String(k), { tam: 22 }); if (k) f.linea(X(k), 60, X(k), 360, { color: 'rgba(255,255,255,.08)' }); });
  f.texto(475, 418, 'cambios que de verdad te piden', { tam: 22 });
  f.texto(100, 26, 'costo acumulado (esfuerzo)', { tam: 22, ancla: 'start' });
  f.texto(860, 26, 'modelo ilustrativo', { tam: 22, tono: 'yellow', peso: 800, ancla: 'end' });
  const camino = fn => { const p = []; for (let k = 0; k <= 20; k += 0.5) p.push(X(k).toFixed(1) + ' ' + Y(fn(k)).toFixed(1)); return 'M' + p.join(' L'); };
  f.trazo(camino(directo), { tono: 'coral', grosor: 5 });
  f.trazo(camino(patron), { color: '#66bb87', grosor: 5 });
  f.texto(X(15.2), Y(directo(15.2)) - 6, 'Atajo directo', { tam: 24, peso: 800, tono: 'coral', ancla: 'end' });
  f.texto(X(20), Y(patron(20)) + 34, 'Con patrón', { tam: 24, peso: 800, color: '#66bb87', ancla: 'end' });
  f.circulo(X(corte), Y(patron(corte)), 8, { tono: 'white' });
  f.texto(X(corte) + 14, Y(patron(corte)) + 30, 'se cruzan', { tam: 22, ancla: 'start' });
  const marca = f.linea(X(2), 60, X(2), 360, { tono: 'yellow', grosor: 3, puntos: true });
  const pd = f.circulo(X(2), Y(directo(2)), 11, { tono: 'coral', borde: '#ffffff' });
  const pp = f.circulo(X(2), Y(patron(2)), 11, { color: '#66bb87', borde: '#ffffff' });
  const di = FIG.dice(el), c = FIG.controles(el);
  let inp = null;
  function pinta(k) {
    const a = Math.round(directo(k)), b = Math.round(patron(k));
    marca.setAttribute('x1', X(k)); marca.setAttribute('x2', X(k));
    pd.mover(X(k), Y(directo(k))); pp.mover(X(k), Y(patron(k)));
    if (k < corte) di('Con ' + k + ' cambios, el atajo cuesta ' + a + ' y el patrón ' + b + '. Todavía no paga: <b>YAGNI</b>, no lo vas a necesitar.', 'bad');
    else di('Con ' + k + ' cambios, el patrón ya pagó su entrada: ' + b + ' contra ' + a + '. Aquí la abstracción se defiende con cifras.', 'ok');
  }
  c.opciones(['Game jam: 2', 'Turno Nocturno: 12', 'Con mods: 20'], i => { const v = [2, 12, 20][i]; if (inp) inp.value = v; pinta(v); });
  inp = c.deslizador('Cambios', 0, 20, 2, 1, v => pinta(v));
  pinta(2);
};

/* 5 · checklistArq: las 8 preguntas para el proyecto de grado */
window.DEMOS.checklistArq = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const Q = [
    ['¿El movimiento usa dt y paso fijo?', 1], ['¿Cambio una pieza sin abrir las demás?', 2],
    ['¿Los estados son una máquina, no bools?', 3], ['¿Un enemigo nuevo es solo datos?', 4],
    ['¿Medí antes de optimizar?', 5], ['¿Las flechas apuntan al núcleo?', 6],
    ['¿Las reglas tienen pruebas?', 7], ['¿Defiendo cada decisión con una cifra?', 8]
  ];
  const si = Q.map(() => false);
  const filas = Q.map((q, i) => ({
    m: f.caja(16, 10 + i * 52, 44, 44, '', { rx: 8, tam: 22, clic: () => toca(i) }),
    t: f.caja(70, 10 + i * 52, 590, 44, q[0], { rx: 8, tam: 22, tono: 'paper', clic: () => toca(i) })
  }));
  filas.forEach(r => { const t = r.t.g.querySelector('text'); t.setAttribute('text-anchor', 'start'); t.setAttribute('x', 86); });
  const pts = f.caja(690, 120, 190, 130, '0 / 8', { tam: 40 });
  f.texto(785, 280, 'puntaje', { tam: 22 });
  const di = FIG.dice(el);
  function toca(i) { si[i] = !si[i]; pinta(); }
  function pinta() {
    const n = si.filter(Boolean).length, falta = si.indexOf(false);
    filas.forEach((r, i) => { r.m.rotulo(si[i] ? 'sí' : '').tono(si[i] ? 'ok' : 'off'); });
    pts.rotulo(n + ' / 8').tono(n >= 7 ? 'ok' : n >= 4 ? 'on' : 'bad');
    if (n === 8) di('Ocho de ocho. Ahora defiéndelo con cifras en tu primera reunión técnica.', 'ok');
    else if (n >= 7) di('Casi listo. Te falta la pregunta ' + (falta + 1) + ': repasa la semana ' + Q[falta][1] + '.', 'ok');
    else if (n >= 4) di(n + ' de 8: buena base. Empieza por la pregunta ' + (falta + 1) + ' (semana ' + Q[falta][1] + ') antes de sumar contenido.');
    else di(n + ' de 8: tu proyecto se parece al Turno Nocturno original. Antes de agregar niveles, arregla la pregunta ' + (falta + 1) + ' (semana ' + Q[falta][1] + ').', 'bad');
  }
  const c = FIG.controles(el);
  c.boton('Borrar', () => { si.fill(false); pinta(); }, true);
  pinta(); di('Piensa en tu proyecto de grado y marca las preguntas que hoy respondes con un sí.');
};
