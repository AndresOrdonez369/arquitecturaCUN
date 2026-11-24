/* Figuras de la semana 3. Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   parche, receta, semaforo, bools, transiciones, campana y comanda usan FIG (assets/fig.js). fsm y observer son canvas. */
window.DEMOS = window.DEMOS || {};

/* 0 · El parche de la línea 175 de Program.cs: un frame en el que se gana y se pierde a la vez */
window.DEMOS.parche = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const PASOS = ['Oleada 3 · queda 1 bicho · vidas = 1', 'El último bicho llega al fondo', 'vidas-- (queda 0) · gameOver = true', '¿se acabó la oleada? enemX.Count == 0', 'Dibujo: msg según los bools'];
  const paso = PASOS.map((p, i) => f.caja(20, 20 + i * 76, 540, 62, p, { tam: 22, rx: 12 }));
  const B = ['menu', 'pausa', 'gameOver', 'gano'];
  const bool = B.map((b, i) => f.caja(600 + (i % 2) * 145, 20 + Math.floor(i / 2) * 66, 135, 56, b, { tam: 22, rx: 12 }));
  const cont = f.texto(740, 168, '', { tam: 22, tono: 'white' });
  f.nodo('rect', { x: 600, y: 196, width: 280, height: 170, rx: 14, fill: '#0d0d0e', stroke: 'rgba(255,255,255,.5)', 'stroke-width': 3 });
  f.texto(740, 222, 'Pantalla', { tam: 22, peso: 800 });
  const m1 = f.texto(740, 264, '', { tam: 22, tono: 'white' }), m2 = f.texto(740, 304, '', { tam: 22 }), m3 = f.texto(740, 340, '', { tam: 22 });
  f.texto(290, 408, 'Program.cs, líneas 146 a 188', { tam: 22 });
  const di = FIG.dice(el);
  let k = 0, parche = false;
  function pinta() {
    const s = { vidas: k >= 2 ? 0 : 1, bichos: k >= 1 ? 0 : 1, oleada: k >= 3 && !parche ? 4 : 3, gameOver: k >= 2, gano: k >= 3 && !parche };
    const choque = s.gameOver && s.gano;
    paso.forEach((p, i) => p.tono(i === k ? (choque && i >= 3 ? 'bad' : 'on') : i < k ? 'base' : 'off'));
    paso[3].rotulo(k >= 3 ? (parche ? '&& !gameOver es falso: no entra' : 'oleada++ (4) · gano = true') : PASOS[3]);
    bool.forEach((b, i) => { const v = B[i] === 'gameOver' ? s.gameOver : B[i] === 'gano' ? s.gano : false; b.tono(v ? (choque ? 'bad' : 'on') : 'off'); });
    cont.pon('bichos en la sala: ' + s.bichos);
    m1.pon(`Vidas: ${s.vidas}   Oleada: ${s.oleada}/3`);
    if (k < 4) { m2.pon('Flechas: mover').color('soft'); m3.pon('Espacio: chispa').color('soft'); }
    else if (parche) { m2.pon('GAME OVER.').color('#eb9a94'); m3.pon('ENTER para reintentar.').color('soft'); }
    else { m2.pon('AMANECIO. Sobreviviste').color('yellow'); m3.pon('al turno. ¿Con 0 vidas?').color('#eb9a94'); }
    const T = [
      ['Última oleada, último bicho y una sola vida. Avanza <b>paso a paso</b>.', ''],
      ['El bicho toca el fondo y se borra de las listas. La sala queda <b>vacía</b>.', ''],
      ['Se pierde la última vida: <b>gameOver = true</b>. Pero la lógica de este frame sigue corriendo.', ''],
      parche ? ['El parche <code>&& !gameOver</code> evita este caso. Funciona, pero cada bloque nuevo tendrá que acordarse de él.', 'ok'] : ['<b>También se cumple «se acabó la oleada»</b>: gano = true. Dos bools que nunca deberían convivir.', 'bad'],
      parche ? ['Sale GAME OVER. Un parche por cada combinación absurda: con bools nunca se sabe cuántos faltan.', 'ok'] : ['El mensaje de victoria se asigna después y <b>gana</b>: «AMANECIO» con 0 vidas y oleada 4 de 3.', 'bad']
    ];
    di(T[k][0], T[k][1]);
  }
  const c = FIG.controles(el);
  c.opciones(['Sin el parche', 'Con && !gameOver'], i => { parche = !!i; pinta(); });
  c.boton('Siguiente paso', () => { if (k < 4) k++; pinta(); });
  c.boton('Reiniciar', () => { k = 0; pinta(); }, true);
  pinta();
};

/* 1 · Qué es un patrón: el mismo problema en varios juegos y una receta con nombre */
window.DEMOS.receta = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const P = ['Mario: chico o grande', 'Puerta: abierta o cerrada', 'Guardia: patrulla o persigue', 'Adivinar: ¿terminó?'];
  const card = P.map((p, i) => f.caja(20, 20 + i * 102, 390, 80, p, { tam: 24 }));
  const mano = [0, 1, 2].map(i => f.caja(600, 20 + i * 102, 280, 80, 'resuelto a mano', { tam: 24, tono: 'off' }));
  const flMano = [0, 1, 2].map(i => f.flecha(card[i], mano[i]));
  const receta = f.caja(590, 110, 290, 140, 'Receta: State', { tam: 30, tono: 'on' });
  const flRec = [0, 1, 2, 3].map(i => f.flecha(card[i], receta));
  const di = FIG.dice(el);
  let n = 1, nombrada = false, abuso = false;
  function pinta() {
    card.forEach((c, i) => c.ver(i < n || (i === 3 && abuso)).tono(i === 3 ? 'bad' : 'base'));
    mano.forEach((m, i) => m.ver(!nombrada && i < n)); flMano.forEach((x, i) => x.ver(!nombrada && i < n));
    receta.ver(nombrada); flRec.forEach((x, i) => x.ver(nombrada && (i < n || (i === 3 && abuso))).tono(i === 3 ? 'bad' : 'on'));
    if (abuso) di('Un juego con <b>un solo bool</b> no tiene el problema. Usar la receta ahí es <b>sobreingeniería</b>: más piezas a cambio de nada.', 'bad');
    else if (nombrada) di(`<b>Un nombre para ${n} problemas iguales.</b> Decir «eso es un State» reemplaza diez minutos de explicación.`, 'ok');
    else di(n === 1 ? 'Un juego necesita cambiar de comportamiento según su situación. Lo resuelves a mano.' : `<b>${n} veces</b> el mismo problema, resuelto a mano cada vez. ¿Le ponemos nombre?`, n >= 2 ? 'bad' : '');
  }
  const c = FIG.controles(el);
  c.boton('Otro juego, mismo problema', () => { if (n < 3) n++; abuso = false; pinta(); });
  c.boton('Ponerle nombre', () => { nombrada = true; abuso = false; pinta(); });
  c.boton('Usarla sin el problema', () => { nombrada = true; abuso = true; pinta(); }, true);
  c.boton('Reiniciar', () => { n = 1; nombrada = abuso = false; pinta(); }, true);
  pinta();
};

/* 2 · State: el semáforo solo está en un color y solo cambia en cierto orden */
window.DEMOS.semaforo = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  f.nodo('rect', { x: 50, y: 20, width: 190, height: 390, rx: 40, fill: '#0d0d0e', stroke: '#fff', 'stroke-width': 4 });
  const COL = ['#66bb87', '#e2a54a', '#e0706a'], N = ['Verde', 'Amarillo', 'Rojo'];
  const luz = [340, 215, 90].map(y => f.circulo(145, y, 52, { color: '#1b1b1e', borde: 'rgba(255,255,255,.3)' }));
  const caja = [f.caja(320, 50, 220, 84, 'Verde', { tam: 28 }), f.caja(650, 50, 220, 84, 'Amarillo', { tam: 28 }), f.caja(485, 290, 220, 84, 'Rojo', { tam: 28 })];
  const fl = [f.flecha(caja[0], caja[1]), f.flecha(caja[1], caja[2]), f.flecha(caja[2], caja[0])];
  const prohibida = f.flecha(caja[0], caja[2], { tono: 'bad', puntos: true, desvio: -26 });
  const di = FIG.dice(el);
  let e = 0, timer = 0;
  function pinta(dos) {
    luz.forEach((l, i) => l.color(i === e || (dos && i === (e + 2) % 3) ? COL[i] : '#1b1b1e'));
    caja.forEach((c, i) => c.tono(i === e ? 'on' : 'base'));
  }
  function ir(nuevo, i) { e = nuevo; fl.forEach((x, j) => x.tono(j === i ? 'on' : 'base')); prohibida.ver(false); pinta(); }
  function rechaza(msg, dos) {
    clearTimeout(timer); prohibida.ver(!dos); caja[e].tono('bad'); pinta(dos); caja[e].tono('bad'); di(msg, 'bad');
    timer = setTimeout(() => { prohibida.ver(false); pinta(); }, 1200);
  }
  const c = FIG.controles(el);
  c.boton('Pasó el tiempo', () => { const a = N[e]; ir((e + 1) % 3, e); di(`<b>${a} a ${N[e]}.</b> Es una transición de la tabla: se permite.`, 'ok'); });
  c.boton('Botón peatonal', () => {
    if (e === 0) { ir(1, 0); di('En verde, el botón peatonal <b>adelanta el amarillo</b>. Transición permitida.', 'ok'); }
    else di(`En ${N[e].toLowerCase()} el botón peatonal <b>no tiene transición</b>: se ignora sin romper nada.`);
  });
  c.boton('Saltar a rojo', () => {
    if (e === 1) { ir(2, 1); di('De amarillo a rojo sí está en la tabla.', 'ok'); return; }
    if (e === 2) { di('Ya está en rojo.'); return; }
    rechaza('<b>Rechazado.</b> De verde a rojo de golpe no hay flecha. Lo que no está en la tabla, no puede pasar.', false);
  }, true);
  c.boton('Encender dos luces', () => rechaza('<b>Imposible.</b> El semáforo guarda <b>un solo estado</b>: no existe «verde y rojo a la vez».', true), true);
  ir(0, -1); di('Un semáforo está en un solo color a la vez. Prueba cambios permitidos y prohibidos.');
  return () => clearTimeout(timer);
};

/* 3 · Antipatrón: 4 bools sueltos dan 16 combinaciones y solo 5 tienen sentido */
window.DEMOS.bools = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const SENT = { 0: 'Jugando', 8: 'Menú', 4: 'Pausa', 2: 'Perdió', 1: 'Ganó' };
  const celda = Array.from({ length: 16 }, (_, i) => f.caja(20 + (i % 4) * 108, 20 + Math.floor(i / 4) * 102, 100, 88, SENT[i] || 'absurdo', { tam: 22, rx: 12 }));
  const tit = f.texto(670, 60, '', { tam: 28, tono: 'white', peso: 800 });
  const sig = f.texto(670, 120, '', { tam: 26, tono: 'yellow', peso: 700 });
  const c1 = f.texto(670, 250, '', { tam: 24 }), c2 = f.texto(670, 300, '', { tam: 24, tono: 'white' }), c3 = f.texto(670, 350, '', { tam: 24, color: '#eb9a94' });
  const B = ['menu', 'pausa', 'gameOver', 'gano'], v = [true, false, false, false], cas = [];
  const di = FIG.dice(el);
  let conEnum = false;
  const idx = () => v.reduce((a, x, i) => a + (x ? 8 >> i : 0), 0);
  function pinta() {
    const k = idx(), ok = SENT[k] !== undefined;
    celda.forEach((c, i) => c.ver(!conEnum || SENT[i] !== undefined).tono(i === k ? 'on' : SENT[i] ? 'ok' : 'bad'));
    tit.pon(conEnum ? 'Con un enum' : 'Con 4 bools'); sig.pon(ok ? 'Ahora: ' + SENT[k] : 'Ahora: absurdo');
    c1.pon('combinaciones: ' + (conEnum ? 5 : 16)); c2.pon('con sentido: 5'); c3.pon('absurdas: ' + (conEnum ? 0 : 11));
    if (conEnum) di('Con un <b>enum</b> la variable guarda un solo valor: encender uno apaga los demás. Las 11 absurdas <b>ya no se pueden escribir</b>.', 'ok');
    else if (ok) di(`Esta combinación significa <b>${SENT[k]}</b>. Enciende otra casilla sin apagar esta.`);
    else di(`<b>${B.filter((_, i) => v[i]).join(' y ')}</b> a la vez: el programa lo permite, el juego no lo entiende. Así nació el bug de la pausa.`, 'bad');
  }
  const c = FIG.controles(el);
  B.forEach((b, i) => cas.push(c.casilla(b, x => {
    if (conEnum) { v.fill(false); cas.forEach((q, j) => { q.checked = j === i && x; }); v[i] = x; }
    else v[i] = x;
    pinta();
  }, v[i])));
  c.opciones(['4 bools', 'Un enum'], i => {
    conEnum = !!i;
    if (conEnum && !SENT[idx()] && idx() !== 0) { v.fill(false); cas.forEach(q => { q.checked = false; }); }
    pinta();
  });
  pinta();
};

/* 3b · La tabla de transiciones: cada celda responde «estoy en X y llega Y, ¿qué pasa?» */
window.DEMOS.transiciones = function (el) {
  const f = FIG.lienzo(el, 900, 395);
  const EST = ['Menú', 'Jugando', 'Pausa', 'GameOver', 'Victoria'], EV = ['Enter', 'P', 'Espacio', 'Sin vidas', 'Sala vacía'];
  // destino: índice de estado, 's' = acción sin cambiar de estado, null = sin transición
  const T = [
    [1, null, null, null, null],
    [null, 2, 's', 3, 4],
    [null, 1, null, null, null],
    [0, null, null, null, null],
    [0, null, null, null, null]
  ];
  const X0 = 20, W0 = 170, CW = 136, Y0 = 20, RH = 62, XC = X0 + W0 + 8;
  EV.forEach((e, j) => f.caja(XC + j * CW, Y0, CW - 8, 52, e, { tam: 22, tono: 'paper', rx: 10 }));
  const fila = EST.map((s, i) => f.caja(X0, Y0 + 64 + i * RH, W0, 52, s, { tam: 24, rx: 10 }));
  const tono = d => (d === null ? 'off' : d === 's' ? 'ok' : 'base');
  const celda = T.map((r, i) => r.map((d, j) => f.caja(XC + j * CW, Y0 + 64 + i * RH, CW - 8, 52, d === null ? '·' : d === 's' ? 'dispara' : EST[d], { tam: 22, rx: 10, tono: tono(d), clic: () => elegir(i, j) })));
  const di = FIG.dice(el);
  function limpiar() { celda.forEach((r, i) => r.forEach((c, j) => c.tono(tono(T[i][j])))); fila.forEach(x => x.tono('base')); }
  function elegir(i, j) {
    limpiar(); celda[i][j].tono('on'); fila[i].tono('on');
    const d = T[i][j], par = `${EST[i]} + ${EV[j]}`;
    if (d === null) di(`<b>${par}: no hay transición.</b> El evento se ignora y nada se rompe. Con bools, aquí hacía falta un <code>if</code> que se acordara.`);
    else if (d === 's') di(`<b>${par}: no cambia de estado.</b> Jugando atiende la tecla y dispara una chispa.`, 'ok');
    else di(`<b>${par}: pasa a ${EST[d]}.</b> Corre ${EST[i]}.Salir() y luego ${EST[d]}.Entrar().`, 'ok');
  }
  const c = FIG.controles(el);
  c.boton('Pausa + Espacio', () => elegir(2, 2));
  c.boton('Contar celdas vacías', () => {
    limpiar();
    const vacias = T.reduce((a, r) => a + r.filter(d => d === null).length, 0);
    celda.forEach((r, i) => r.forEach((x, j) => { if (T[i][j] === null) x.tono('bad'); }));
    di(`<b>${vacias} de 25</b> combinaciones no tienen flecha: la máquina las ignora sola. GameOver no tiene flecha hacia Victoria, así que el caso del parche no se puede escribir.`, 'ok');
  }, true);
  limpiar(); di('Toca una celda: «estoy en este estado y llega este evento, ¿qué pasa?».');
};

/* 4 · La máquina de estados de Turno Nocturno (canvas) */
window.DEMOS.fsm = function (el) {
  const INK = '#0d0d0e', COB = '#2b2b30', YEL = '#e2a54a', COR = '#e0706a';
  const S = [
    { n: 'Menú', x: 140, y: 70 }, { n: 'Jugando', x: 450, y: 215 }, { n: 'Pausa', x: 450, y: 370 },
    { n: 'GameOver', x: 760, y: 70 }, { n: 'Victoria', x: 140, y: 360 }
  ];
  const EV = { enter: 'Enter', p: 'P', espacio: 'Espacio', vida: 'Sin vidas', bicho: 'Sala vacía' };
  const T = [
    { de: 0, a: 1, ev: 'enter', t: 'Enter' }, { de: 1, a: 2, ev: 'p', t: 'P' }, { de: 2, a: 1, ev: 'p', t: 'P' },
    { de: 1, a: 3, ev: 'vida', t: 'sin vidas' }, { de: 1, a: 4, ev: 'bicho', t: 'sala vacía' },
    { de: 3, a: 0, ev: 'enter', t: 'Enter' }, { de: 4, a: 0, ev: 'enter', t: 'Enter' }
  ];
  const BW = 190, BH = 70;
  el.insertAdjacentHTML('beforeend', '<canvas width="900" height="420" aria-label="Diagrama de estados de Turno Nocturno"></canvas>');
  const cv = el.querySelector('canvas'), g = cv.getContext('2d');
  const c = FIG.controles(el);
  Object.keys(EV).forEach(k => c.boton(EV[k], () => evento(k)));
  c.boton('Reiniciar', () => evento('reset'), true);
  const di = FIG.dice(el);
  let cur = 0, lastT = -1, flash = false, timer = 0, ok = 0, no = 0, alive = true;

  function punta(x, y, an, color) {
    g.fillStyle = color; g.beginPath(); g.moveTo(x, y);
    g.lineTo(x - 17 * Math.cos(an - .42), y - 17 * Math.sin(an - .42));
    g.lineTo(x - 17 * Math.cos(an + .42), y - 17 * Math.sin(an + .42)); g.closePath(); g.fill();
  }
  function rotulo(txt, x, y, color) {
    g.font = '700 24px "Atkinson Hyperlegible Next", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 7; g.strokeStyle = INK; g.lineJoin = 'round'; g.strokeText(txt, x, y);
    g.fillStyle = color; g.fillText(txt, x, y);
  }
  function borde(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const t = Math.min((BW / 2 + 5) / Math.abs(dx || 1e-6), (BH / 2 + 5) / Math.abs(dy || 1e-6));
    return [a.x + dx * t, a.y + dy * t];
  }
  function draw() {
    g.clearRect(0, 0, cv.width, cv.height);
    T.forEach((tr, i) => {
      const hot = i === lastT, color = hot ? YEL : 'rgba(255,255,255,.5)';
      const a = S[tr.de], b = S[tr.a], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      const ox = -dy / L * 12, oy = dx / L * 12, p = borde(a, b), q = borde(b, a);
      const x1 = p[0] + ox, y1 = p[1] + oy, x2 = q[0] + ox, y2 = q[1] + oy;
      g.strokeStyle = color; g.lineWidth = hot ? 5 : 2.5;
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      punta(x2, y2, Math.atan2(y2 - y1, x2 - x1), color);
      rotulo(tr.t, (x1 + x2) / 2 + ox * 2.6, (y1 + y2) / 2 + oy * 2, hot ? YEL : '#b9b9bd');
    });
    S.forEach((s, i) => {
      const on = i === cur;
      g.fillStyle = on ? YEL : COB; g.strokeStyle = on && flash ? COR : on ? '#fff' : 'rgba(255,255,255,.55)'; g.lineWidth = on && flash ? 8 : 3;
      g.beginPath();
      if (g.roundRect) g.roundRect(s.x - BW / 2, s.y - BH / 2, BW, BH, 35); else g.rect(s.x - BW / 2, s.y - BH / 2, BW, BH);
      g.fill(); g.stroke();
      g.fillStyle = on ? INK : '#fff'; g.font = '700 28px "Atkinson Hyperlegible Next", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(s.n, s.x, s.y + 1);
    });
  }
  const cuenta = () => ` <b>Transiciones: ${ok} · rechazados: ${no}.</b>`;
  function evento(ev) {
    if (ev === 'reset') { cur = 0; lastT = -1; ok = no = 0; flash = false; di('Empieza en <b>Menú</b>. Dispara eventos y prueba algunos que no deberían servir.'); draw(); return; }
    const i = T.findIndex(t => t.de === cur && t.ev === ev);
    if (i >= 0) {
      const de = S[cur].n, a = S[T[i].a].n;
      cur = T[i].a; lastT = i; ok++; flash = false;
      di(`${EV[ev]}: <b>${de} a ${a}</b>. Se ejecuta ${de}.Salir() y luego ${a}.Entrar().` + cuenta(), 'ok');
    } else if (cur === 1 && ev === 'espacio') {
      lastT = -1; flash = false;
      di('Espacio en Jugando: no cambia de estado. <b>El estado lo atiende y dispara una chispa.</b>' + cuenta());
    } else {
      no++; lastT = -1; flash = true;
      const porque = cur === 2 ? 'Pausa solo atiende la tecla P.' : 'ese evento no tiene flecha desde aquí.';
      di(`<b>Rechazado:</b> ${EV[ev]} en ${S[cur].n}, porque ${porque}` + cuenta(), 'bad');
      clearTimeout(timer); timer = setTimeout(() => { flash = false; if (alive) draw(); }, 600);
    }
    draw();
  }
  evento('reset');
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (alive) draw(); });
  return () => { alive = false; clearTimeout(timer); };
};

/* 5 · Observer: suena la campana y solo reaccionan los suscritos */
window.DEMOS.campana = function (el) {
  const f = FIG.lienzo(el, 900, 430);
  const coc = f.caja(20, 165, 200, 100, 'Cocinero', { tam: 28 });
  const cam = f.caja(290, 170, 180, 90, 'Campana', { tam: 28, tono: 'paper' });
  f.flecha(coc, cam, { rotulo: 'toca', tam: 22 });
  const O = [['Mesero 1', 'lleva el plato'], ['Mesero 2', 'lleva el plato'], ['Caja', 'suma a la cuenta'], ['Lavaplatos', 'alista loza']];
  const sus = [true, false, true, false];
  const oy = O.map((o, i) => f.caja(560, 15 + i * 104, 320, 86, o[0], { tam: 24, clic: () => { sus[i] = !sus[i]; reposo(); di(`${o[0]} ${sus[i] ? 'se suscribe (+=)' : 'se desuscribe (-=)'}. Al cocinero nadie le avisó.`); } }));
  const fl = oy.map(o => f.flecha(cam, o));
  const di = FIG.dice(el);
  let timer = 0;
  function reposo() {
    cam.tono('paper');
    oy.forEach((o, i) => o.tono(sus[i] ? 'base' : 'off').rotulo(O[i][0] + (sus[i] ? '' : ': no escucha')));
    fl.forEach((x, i) => x.ver(sus[i]).tono('base'));
  }
  const c = FIG.controles(el);
  c.boton('Tocar la campana', () => {
    clearTimeout(timer); reposo(); cam.tono('on');
    const n = sus.filter(Boolean).length;
    oy.forEach((o, i) => { if (sus[i]) o.tono('on').rotulo(O[i][0] + ': ' + O[i][1]); });
    fl.forEach((x, i) => { if (sus[i]) x.tono('on'); });
    di(n ? `Sonó una vez y <b>reaccionaron ${n}</b>. El cocinero no sabe quiénes ni cuántos.` : 'Nadie escucha. La campana suena igual y <b>nada se rompe</b>.', n ? 'ok' : '');
    timer = setTimeout(reposo, 1800);
  });
  reposo(); di('Toca una caja de la derecha para suscribirla o desuscribirla. Luego toca la campana.');
  return () => clearTimeout(timer);
};

/* 6 · Observer en Turno Nocturno: el evento AlMorir y sus suscriptores (canvas) */
window.DEMOS.observer = function (el) {
  const INK = '#0d0d0e', COB = '#2b2b30', YEL = '#e2a54a', COR = '#e0706a', GRE = '#2e7653';
  const O = [
    { k: 'sonido', n: 'Sonido', y: 50 }, { k: 'puntaje', n: 'Puntaje', y: 130 },
    { k: 'hud', n: 'HUD', y: 210 }, { k: 'logros', n: 'Logros', y: 290 }
  ];
  const sus = { sonido: true, puntaje: true, hud: true, logros: false };
  const BIC = [100, 190], CAM = [330, 170], BX = 570, BW = 310, BH = 70;

  el.insertAdjacentHTML('beforeend', '<canvas width="900" height="340" aria-label="Un bicho avisa su muerte por el evento AlMorir a los suscriptores"></canvas>');
  const cv = el.querySelector('canvas'), g = cv.getContext('2d');
  const c = FIG.controles(el);
  c.boton('Muere un bicho', morir);
  O.forEach(o => c.casilla(o.n, v => { sus[o.k] = v; linea(o.n + (v ? ' se suscribe:   bicho.AlMorir += ...' : ' se desuscribe:   bicho.AlMorir -= ...')); draw(); }, sus[o.k]));
  const fuga = c.boton('Cerrar el HUD sin desuscribirlo', () => {
    hudCerrado = !hudCerrado;
    fuga.textContent = hudCerrado ? 'Volver a abrir el HUD' : 'Cerrar el HUD sin desuscribirlo';
    linea(hudCerrado ? 'Se cierra el HUD' + (sus.hud ? ', pero nadie escribió  bicho.AlMorir -= Pintar' : ' (ya estaba desuscrito: sin fuga)') : 'Se abre el HUD de nuevo.');
    draw();
  }, true);
  const cta = c.salida();
  const linea = FIG.registro(el);
  let puntos = 0, muertes = 0, cuentaLogros = 0, hudCerrado = false;
  let anim = -1, raf = 0, last = 0, alive = true, quien = [], texto = {};

  function caja(x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
  function draw() {
    g.clearRect(0, 0, cv.width, cv.height);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(BIC[0] + 50, BIC[1]); g.lineTo(CAM[0] - 75, CAM[1]); g.stroke();
    const muriendo = anim >= 0 && anim < .9;
    g.fillStyle = muriendo ? COR : COB; g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(BIC[0], BIC[1], 48, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#fff'; g.font = '700 40px ui-monospace, Consolas, monospace'; g.fillText(muriendo ? 'x' : 'M', BIC[0], BIC[1] + 2);
    g.font = '600 24px "Atkinson Hyperlegible Next", sans-serif'; g.fillStyle = '#b9b9bd'; g.fillText('Bicho', BIC[0], BIC[1] + 78);
    g.fillText('no sabe quién escucha', 230, 40);
    const suena = anim >= .3 && anim < 1.2;
    g.fillStyle = suena ? YEL : INK; g.strokeStyle = YEL; g.lineWidth = 3; caja(CAM[0] - 75, CAM[1] - 34, 150, 68, 12); g.fill(); g.stroke();
    g.fillStyle = suena ? INK : YEL; g.font = '700 26px ui-monospace, Consolas, monospace'; g.fillText('AlMorir', CAM[0], CAM[1] + 1);
    O.forEach(o => {
      const s = sus[o.k], fantasma = o.k === 'hud' && hudCerrado, reac = anim >= .7 && quien.indexOf(o.k) >= 0;
      if (s) {
        g.strokeStyle = fantasma ? COR : reac ? YEL : 'rgba(255,255,255,.6)'; g.lineWidth = reac ? 4 : 2;
        g.beginPath(); g.moveTo(CAM[0] + 77, CAM[1]); g.lineTo(BX - 4, o.y); g.stroke();
      }
      g.setLineDash(fantasma ? [8, 6] : []);
      g.fillStyle = fantasma ? 'rgba(232,69,44,.25)' : reac ? YEL : s ? GRE : 'rgba(255,255,255,.08)';
      g.strokeStyle = fantasma ? COR : s ? '#fff' : 'rgba(255,255,255,.35)'; g.lineWidth = 2;
      caja(BX, o.y - BH / 2, BW, BH, 10); g.fill(); g.stroke(); g.setLineDash([]);
      const tinta = reac && !fantasma ? INK : s || fantasma ? '#fff' : 'rgba(255,255,255,.6)';
      g.textAlign = 'left'; g.fillStyle = tinta; g.font = '700 24px "Atkinson Hyperlegible Next", sans-serif'; g.fillText(o.n, BX + 14, o.y - 15);
      g.font = '500 22px "Atkinson Hyperlegible Next", sans-serif';
      g.fillText(reac ? texto[o.k] : fantasma ? (s ? 'cerrado, sigue suscrito' : 'cerrado y desuscrito') : s ? 'suscrito (+=)' : 'no escucha', BX + 14, o.y + 15);
      g.textAlign = 'center';
    });
    if (anim >= 0 && anim < .7) {
      g.fillStyle = YEL;
      if (anim < .3) { const p = anim / .3; g.beginPath(); g.arc(BIC[0] + 50 + (CAM[0] - 75 - BIC[0] - 50) * p, BIC[1] + (CAM[1] - BIC[1]) * p, 10, 0, 7); g.fill(); }
      else { const p = (anim - .3) / .4; quien.forEach(k => { const o = O.find(x => x.k === k); g.beginPath(); g.arc(CAM[0] + 77 + (BX - 4 - CAM[0] - 77) * p, CAM[1] + (o.y - CAM[1]) * p, 10, 0, 7); g.fill(); }); }
    }
    cta('eliminados: ' + muertes + ' · puntos: ' + puntos);
  }
  function frame(now) {
    if (!alive) return;
    anim += Math.min(.1, (now - last) / 1000); last = now;
    if (anim >= 1.9) { anim = -1; draw(); return; }
    draw();
    raf = requestAnimationFrame(frame);
  }
  function morir() {
    muertes++;
    quien = O.filter(o => sus[o.k]).map(o => o.k); texto = {};
    linea('Bicho #' + muertes + ' muere: AlMorir?.Invoke(this)  ->  ' + quien.length + ' suscriptor' + (quien.length === 1 ? '' : 'es'));
    if (!quien.length) linea('   Nadie escucha. El bicho muere igual y nada se rompe.');
    quien.forEach(k => {
      if (k === 'sonido') { texto[k] = 'bip'; linea('   Sonido: Console.Beep()'); }
      else if (k === 'puntaje') { puntos += 10; texto[k] = '+10, van ' + puntos; linea('   Puntaje: suma 10, van ' + puntos); }
      else if (k === 'hud') {
        if (hudCerrado) { texto[k] = 'pinta en pantalla cerrada'; linea('   HUD (cerrado): reacciona igual. Fuga: faltó el  -='); }
        else { texto[k] = 'pinta «Puntos: ' + puntos + '»'; linea('   HUD: pinta "Puntos: ' + puntos + '"'); }
      } else if (k === 'logros') {
        cuentaLogros++;
        if (cuentaLogros % 3 === 0) { texto[k] = 'logro: ' + cuentaLogros + ' bichos'; linea('   Logros: desbloqueado "' + cuentaLogros + ' bichos eliminados"'); }
        else { texto[k] = 'lleva ' + (cuentaLogros % 3) + ' de 3'; linea('   Logros: lleva ' + (cuentaLogros % 3) + ' de 3'); }
      }
    });
    cancelAnimationFrame(raf); anim = 0; last = performance.now(); raf = requestAnimationFrame(frame);
  }
  linea('Sonido, Puntaje y HUD están suscritos. Presiona "Muere un bicho".');
  draw();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (alive && anim < 0) draw(); });
  return () => { alive = false; cancelAnimationFrame(raf); };
};

/* 7 · Command: cada acción es una comanda en una pila que se deshace y se repite */
window.DEMOS.comanda = function (el) {
  const f = FIG.lienzo(el, 900, 430), COLS = 6, CW = 80, X0 = 20, Y0 = 30;
  for (let r = 0; r < 4; r++) for (let k = 0; k < COLS; k++) f.nodo('rect', { x: X0 + k * CW, y: Y0 + r * CW, width: CW - 4, height: CW - 4, rx: 8, fill: '#1b1b1e' });
  const INI = [1, 3, 4], cx = k => X0 + k * CW + (CW - 4) / 2;
  const bt = Array.from({ length: COLS }, (_, k) => f.texto(cx(k), Y0 + 38, 'b', { tam: 40, color: '#eb9a94', peso: 800 }));
  const rayo = f.linea(0, Y0 + 70, 0, Y0 + 260, { tono: 'yellow', grosor: 6 });
  const rob = f.texto(cx(0), Y0 + 3 * CW + 38, '@', { tam: 44, tono: 'white', peso: 800 });
  f.texto(710, 26, 'Pila de comandos', { tam: 24, tono: 'white', peso: 800 });
  const pila = Array.from({ length: 6 }, (_, i) => f.caja(560, 360 - i * 56, 300, 48, '', { tam: 22, rx: 10 }));
  const di = FIG.dice(el);
  let x = 0, bichos = new Set(INI), hechos = [], timers = [], ocupado = false;
  const MOV = { nombre: 'Mover →', ejecutar() { this.antes = x; x = (x + 1) % COLS; }, deshacer() { x = this.antes; } };
  const DIS = { nombre: 'Disparar', ejecutar() { this.col = x; this.mato = bichos.delete(x); }, deshacer() { if (this.mato) bichos.add(this.col); } };
  const nuevo = p => Object.assign(Object.create(p), {});
  function pinta(destello) {
    bt.forEach((b, k) => b.ver(bichos.has(k)));
    rob.t.setAttribute('x', cx(x));
    rayo.setAttribute('x1', cx(x)); rayo.setAttribute('x2', cx(x)); rayo.style.display = destello ? '' : 'none';
    const vis = hechos.slice(-6);
    pila.forEach((p, i) => { p.ver(i < vis.length); if (vis[i]) p.rotulo((hechos.length - vis.length + i + 1) + '. ' + vis[i].nombre).tono(i === vis.length - 1 ? 'on' : 'base'); });
  }
  function limpiar() { timers.forEach(clearTimeout); timers = []; }
  function hacer(p) {
    if (ocupado) return;
    const cmd = nuevo(p); cmd.ejecutar(); hechos.push(cmd); pinta(p === DIS);
    if (p === DIS) timers.push(setTimeout(() => pinta(), 350));
    di(`Se ejecutó <b>${cmd.nombre}</b> y quedó guardado en la pila: ${hechos.length} ${hechos.length === 1 ? 'comando' : 'comandos'}.`);
  }
  const c = FIG.controles(el);
  c.boton('Mover →', () => hacer(MOV));
  c.boton('Disparar', () => hacer(DIS));
  c.boton('Deshacer', () => {
    if (ocupado) return;
    const cmd = hechos.pop();
    if (!cmd) { di('La pila está vacía: no hay nada que deshacer.'); return; }
    cmd.deshacer(); pinta();
    di(`<b>Deshacer</b> saca el último de la pila (${cmd.nombre}) y lo revierte${cmd.mato ? ': el bicho vuelve' : ''}.`, 'ok');
  }, true);
  c.boton('Repetir', () => {
    if (ocupado || !hechos.length) { if (!hechos.length) di('Primero da algunas órdenes.'); return; }
    ocupado = true; x = 0; bichos = new Set(INI); const lista = hechos; hechos = []; pinta();
    di('<b>Repetición:</b> desde el inicio se vuelven a ejecutar los mismos comandos, en orden.', 'ok');
    lista.forEach((cmd, i) => timers.push(setTimeout(() => {
      cmd.ejecutar(); hechos.push(cmd); pinta(cmd.nombre === 'Disparar');
      if (i === lista.length - 1) { ocupado = false; di(`Repetición terminada: <b>${lista.length} comandos</b>, mismo resultado. Así se graba una partida.`, 'ok'); }
    }, 500 * (i + 1))));
  }, true);
  pinta(); di('Da órdenes al robot. Cada una se escribe como una comanda y se guarda en la pila.');
  return limpiar;
};
