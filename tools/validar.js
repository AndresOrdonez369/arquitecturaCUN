// Valida los archivos de clase (esquema v2 del mazo): node tools/validar.js [n]
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
const KINDS = ['portada', 'analogia', 'idea', 'codigo', 'demo', 'reto', 'antipatron', 'actividad', 'cierre', 'industria', 'mapa'];
const LANGS = ['C#', 'Unity', 'C++', 'Lua', 'JSON'];
const BLOQUES = ['big', 'p', 'h', 'pie', 'clave', 'ul', 'ol', 'mapa', 'tabla', 'panel', 'fig', 'svg', 'code', 'compare', 'check', 'ruta', 'juegos'];
const solo = +process.argv[2] || 0;
let fallos = 0;
const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : stub()), apply: () => stub(), construct: () => stub() });
for (let n = 1; n <= 8; n++) {
  if (solo && n !== solo) continue;
  const f = path.join(root, 'data', `s${n}.js`);
  if (!fs.existsSync(f)) { console.log(`S${n}: (sin archivo)`); continue; }
  const err = m => { fallos++; console.log('  FALLA: ' + m); }, avisos = [];
  const win = { DEMOS: {} };
  try { new Function('window', fs.readFileSync(f, 'utf8'))(win); } catch (e) { err(`s${n}.js no carga: ${e.message}`); continue; }
  const K = win.CLASE, d = path.join(root, 'demos', `s${n}.js`);
  if (fs.existsSync(d)) { try { new Function('window', 'document', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame', 'FIG', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout', fs.readFileSync(d, 'utf8'))(win, stub(), { now: () => 0 }, () => 0, () => {}, stub(), () => 0, () => {}, () => 0, () => {}); } catch (e) { err(`demos/s${n}.js no carga: ${e.message}`); } }
  const demos = Object.keys(win.DEMOS);
  if (K.n !== n) err('n incorrecto');
  for (const k of ['titulo', 'objetivos', 'analogia', 'agenda', 'codigo', 'tarea', 'slides', 'quiz', 'conceptos', 'industria', 'errores']) if (!K[k]) err('falta ' + k);
  (K.conceptos || []).forEach((c, i) => { if (!c.t || !c.d || !c.ej) err(`concepto ${i + 1}: requiere t, d y ej`); });
  if ((K.conceptos || []).length < 5) err('menos de 5 conceptos clave');
  (K.industria || []).forEach((c, i) => { if (!c.j || !c.t || !c.src) err(`caso real ${i + 1}: requiere j, t y src`); });
  if ((K.industria || []).length < 3) err('menos de 3 casos de juegos reales');
  (K.errores || []).forEach((c, i) => { if (!c.mito || !c.real) err(`error común ${i + 1}: requiere mito y real`); });
  if ((K.errores || []).length < 3) err('menos de 3 errores comunes');
  if (!K.slides.some(s => s.kind === 'industria')) err('ninguna slide de juegos reales (kind industria)');
  const tabs = (t, w, ancho) => (t || []).forEach(x => {
    if (!LANGS.includes(x.lang)) err(`${w}: lang inválido ${x.lang}`); if (!x.src) return err(`${w}: tab sin src`);
    if (!ancho) return;
    const ls = x.src.replace(/\s+$/, '').split('\n');
    if (ls.length > 18) err(`${w}: código de ${ls.length} líneas (máx. 18 en slides)`);
    const mx = Math.max(...ls.map(l => l.length)); if (mx > ancho) err(`${w}: línea de código de ${mx} caracteres (máx. ${ancho})`);
  });
  const mc = (c, w) => { if (!c.opts || c.opts.length !== 4) err(w + ': no tiene 4 opciones'); if (!(c.ok >= 0 && c.ok <= 3)) err(w + ': ok fuera de rango'); if (!c.why) err(w + ': sin explicación'); };
  const quita = s => String(s).replace(/<[^>]+>/g, ' ');
  let figs = new Set(), conPasos = 0, marcas = 0, checks = 0, compares = 0, viejas = 0;
  K.slides.forEach((s, i) => {
    const w = `slide ${i + 1}`;
    if (!KINDS.includes(s.kind)) err(w + ' kind ' + s.kind);
    if (!s.title) err(w + ' sin título'); else if (quita(s.title).length > 52) err(`${w} título de ${quita(s.title).length} caracteres (máx. 52): ${s.title}`);
    if (!s.nota) err(w + ' sin nota');
    if (s.lead && quita(s.lead).length > 150) err(`${w} lead de ${quita(s.lead).length} caracteres (máx. 150)`);
    if (/—/.test(JSON.stringify(s))) err(w + ' usa raya larga');
    if (s.html || s.demo || s.after || (s.code && !Array.isArray(s.left))) { viejas++; err(w + ' usa el esquema anterior (html/code/demo/check sueltos): pásala a bloques left/right/full'); return; }
    if (s.full && (s.left || s.right)) err(w + ' mezcla full con left/right');
    let palabras = 0, pasos = false;
    const walk = (list, ancho) => (list || []).forEach(b => {
      if (typeof b === 'string') { palabras += quita(b).split(/\s+/).filter(Boolean).length; return; }
      const tipo = BLOQUES.filter(k => b[k] !== undefined && !(b.panel && k === 'h'));
      if (tipo.length !== 1) err(`${w}: bloque con tipos ${JSON.stringify(Object.keys(b))}`);
      if (b.paso || b.pasos || b.marca) pasos = true;
      for (const k of ['big', 'p', 'h', 'pie', 'clave']) if (b[k]) palabras += quita(b[k]).split(/\s+/).filter(Boolean).length;
      (b.ul || b.ol || []).forEach(x => { palabras += quita(x).split(/\s+/).filter(Boolean).length; });
      if ((b.ul || b.ol || []).length > 4) err(`${w}: lista de ${(b.ul || b.ol).length} ítems (máx. 4)`);
      (b.juegos || []).forEach(x => { palabras += quita(x.j + " " + x.t).split(/\s+/).filter(Boolean).length; if (!x.src) err(`${w}: caso de juego real sin fuente (${x.j})`); });
      if (b.juegos && b.juegos.length > 3) err(`${w}: más de 3 casos de juegos en una slide`);
      (b.mapa || []).forEach(r => { palabras += quita(r.join(' ')).split(/\s+/).filter(Boolean).length; });
      if (b.mapa && b.mapa.length > 4) err(`${w}: mapa de ${b.mapa.length} filas (máx. 4)`);
      if (b.tabla) { b.tabla.rows.forEach(r => { palabras += quita(r.join(' ')).split(/\s+/).filter(Boolean).length; }); if (b.tabla.rows.length > 5) err(`${w}: tabla de ${b.tabla.rows.length} filas (máx. 5)`); }
      if (b.panel) walk(b.panel, ancho);
      if (b.fig) { figs.add(b.fig); if (!demos.includes(b.fig)) err(`${w}: figura inexistente ${b.fig}`); }
      if (b.code) { tabs(b.code, w, ancho); if (b.marca) { marcas++; const nl = b.code[0].src.replace(/\s+$/, '').split('\n').length; b.marca.forEach(m => { if (!m.t || !Array.isArray(m.l) || m.l.some(x => x < 1 || x > nl)) err(`${w}: marca fuera de rango o sin texto`); }); } }
      if (b.compare) { compares++; tabs([b.compare.a, b.compare.b], w, 60); if (!b.compare.a.label || !b.compare.b.label) err(w + ': compare sin label'); }
      if (b.check) { checks++; mc(b.check, w); }
    });
    walk(s.full, 104); walk(s.left, 64); walk(s.right, 64);
    if (pasos) conPasos++;
    if (palabras > 90) err(`${w}: ${palabras} palabras (máx. 90). Parte la slide o pasa texto a la nota`);
    else if (palabras > 70) avisos.push(`${w}: ${palabras} palabras`);
  });
  K.quiz.forEach((q, i) => mc(q, `quiz ${i + 1}`));
  K.codigo.forEach(c => tabs(c.tabs, 'codigo'));
  const dist = [0, 0, 0, 0]; K.quiz.forEach(q => dist[q.ok]++);
  if (Math.max(...dist) > K.quiz.length * .5) err('respuestas correctas mal repartidas: ' + dist);
  const min = n === 8 ? { figs: 2, pasos: 4, marcas: 0, checks: 1, compares: 0 } : { figs: 5, pasos: 8, marcas: 2, checks: 4, compares: n === 1 ? 1 : 2 };
  if (!viejas) {
    if (figs.size < min.figs) err(`solo ${figs.size} figuras interactivas (mín. ${min.figs})`);
    if (conPasos < min.pasos) err(`solo ${conPasos} slides con revelado por pasos (mín. ${min.pasos})`);
    if (marcas < min.marcas) err(`solo ${marcas} códigos con marca (mín. ${min.marcas})`);
    if (checks < min.checks) err(`solo ${checks} preguntas (mín. ${min.checks})`);
    if (compares < min.compares) err(`solo ${compares} antes/después (mín. ${min.compares})`);
  }
  console.log(`S${n}: ${K.slides.length} slides, ${K.quiz.length} preguntas de quiz, figuras [${[...figs].join(', ')}], pasos ${conPasos}, marcas ${marcas}, checks ${checks}, compare ${compares}${viejas ? `, ${viejas} slides en esquema anterior` : ''}`);
  if (avisos.length) console.log('  aviso (texto algo largo): ' + avisos.join(' · '));
}
console.log(fallos ? `\n${fallos} fallas` : '\nTodo en orden');
process.exit(fallos ? 1 : 0);
