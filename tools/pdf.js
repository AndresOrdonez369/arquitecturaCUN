// Genera los PDF de entregables/ con Edge sin ventana. Requiere el servidor local (node tools/serve.js).
// Uso: node tools/pdf.js [filtro]
const { execFileSync } = require('child_process'), path = require('path'), fs = require('fs'), os = require('os');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
const BASE = 'http://localhost:4174/', OUT = path.join(__dirname, '..', 'entregables');
const LISTA = [
  ['ACA1-Diagnostico-y-plano-de-rescate.pdf', 'docs/aca1.html'],
  ['ACA2-Rescate-implementado.pdf', 'docs/aca2.html'],
  ['Quiz-diagnostico-estudiante.pdf', 'docs/quiz-diagnostico.html'],
  ['Quiz-diagnostico-con-respuestas.pdf', 'docs/quiz-diagnostico.html?clave=1'],
  ['Banco-de-preguntas-con-respuestas.pdf', 'docs/banco-preguntas.html'],
  ['Banco-de-preguntas-estudiante.pdf', 'docs/banco-preguntas.html?estudiante=1'],
  ['Plan-del-curso.pdf', 'plan.html']
];
fs.mkdirSync(OUT, { recursive: true });
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-pdf-'));
for (const [f, u] of LISTA) {
  if (process.argv[2] && !f.includes(process.argv[2])) continue;
  const dest = path.join(OUT, f);
  if (fs.existsSync(dest)) fs.unlinkSync(dest);
  execFileSync(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', '--user-data-dir=' + perfil, '--no-pdf-header-footer',
    '--virtual-time-budget=15000', '--run-all-compositor-stages-before-draw', '--print-to-pdf=' + dest, BASE + u], { stdio: 'ignore', timeout: 90000 });
  /* en Windows Edge vuelve antes de escribir el archivo: espera a que exista y deje de crecer */
  let t = 0, prev = -1;
  while (t < 90) { const sz = fs.existsSync(dest) ? fs.statSync(dest).size : -1; if (sz > 0 && sz === prev) break; prev = sz; t++; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000); }
  console.log(f, fs.existsSync(dest) ? Math.round(fs.statSync(dest).size / 1024) + ' KB' : 'FALLÓ');
}
