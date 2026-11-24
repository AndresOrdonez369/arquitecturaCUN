// Genera docs/aca1.html y docs/aca2.html. Uso: node tools/build-docs.js
const fs = require('fs'), path = require('path');
const head = t => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,500..800&family=Atkinson+Hyperlegible+Next:wght@400..700&family=JetBrains+Mono:wght@400..700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/style.css">
<title>${t} · Arquitectura de Videojuegos</title>
</head>`;
const tools = pdf => `<div class="doctools"><a class="btn" href="../entregables/${pdf}" download>Descargar PDF</a><button class="btn alt" onclick="print()">Imprimir</button><a class="btn alt" href="../proyecto/TurnoNocturno/README.html">Ver Turno Nocturno</a></div>`;
const lista = items => `<h2>Lista de chequeo antes de entregar</h2><table class="tbl lista"><tbody>${items.map(x => `<tr><td class="box"></td><td>${x}</td></tr>`).join('')}</tbody></table>`;
const foot = `<div id="foot"></div>
<script src="../data/curso.js"></script>
<script src="../assets/app.js"></script>
</body>
</html>`;
const rub = (t, peso, d) => `<table class="tbl"><thead><tr><th class="g" colspan="2">${t} · Peso: ${peso}</th></tr></thead><tbody>
${d.map((x, i) => `<tr><td class="pct">${5 - i}.0</td><td>${x}</td></tr>`).join('\n')}
</tbody></table>`;
const ficha = rows => `<table class="tbl ficha"><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table>`;
const ras = a => `<table class="tbl"><tbody>${a.map((x, i) => `<tr><td><b>RA${i + 1}</b></td><td>${x}</td></tr>`).join('')}</tbody></table>`;
const cun = '<p>Corporación Unificada Nacional de Educación Superior, CUN · Especialización en Diseño y Desarrollo de Videojuegos</p>';
const comp = '"Categoriza la arquitectura de software, en el contexto de patrones de diseño, buenas prácticas, técnicas de optimización de memoria y estrategias de testing y depuración, para garantizar la modularidad, la escalabilidad y el desempeño en contextos reales y simulados para videojuegos."';

const aca1 = `${head('ACA 1 · Diagnóstico y plano de rescate')}
<body data-page="docs" data-base="../">
<header class="mast" id="mast" data-meta="Actividad de Construcción Aplicada N.º 1 · Corte II · 30 %" data-h1="ACA 1: diagnóstico y plano de rescate" data-q="Antes de tocar una línea de Turno Nocturno, demuestra que entiendes por qué está enredado y dibuja cómo debería quedar."></header>
<main class="wrap">
${tools('ACA1-Diagnostico-y-plano-de-rescate.pdf')}
<article class="doc">
<h1>Actividad de Construcción Aplicada (ACA) 1</h1>
${cun}
${ficha([
  ['Asignatura', 'Arquitectura de Videojuegos', 'Docente / facilitador', 'Andrés Ordóñez-Bolaños'],
  ['Periodo / bloque / corte', 'Bloque 26ES6 · Bloque 1 · Corte II (semanas 3 a 5)', 'ACA N.º', '1'],
  ['Fecha de apertura (C Digital)', '07 / 12 / 2026', 'Fecha de cierre (C Digital)', '27 / 12 / 2026'],
  ['Ponderación', '30 % de la nota final', 'Modalidad', 'Individual o en parejas']
])}

<h2>Objetivo del ACA</h2>
<p>Diagnosticar la arquitectura del videojuego "Turno Nocturno" (C#, consola) y diseñar su arquitectura objetivo, categorizando sus problemas de acoplamiento y cohesión y proponiendo módulos, patrones de diseño y un plan de refactorización por pasos, con el fin de evidenciar criterio de arquitectura antes de implementar el rescate completo en el ACA 2.</p>

<h2>Pregunta orientadora o situación problema</h2>
<p>El estudio heredó un juego que funciona, pero cada cambio rompe otra cosa. ¿Cómo se puede categorizar la arquitectura de un videojuego existente y rediseñarla con patrones de diseño y buenas prácticas, para que sea modular, pueda crecer y se pueda probar, sin reescribirlo desde cero?</p>
<p><i>Se alinea con la competencia del curso: ${comp}</i></p>

<h2>Resultados de aprendizaje esperados</h2>
<p>Al finalizar esta actividad, el estudiante estará en capacidad de:</p>
${ras([
  'Analizar un código de juego existente e identificar, con evidencia, sus problemas de acoplamiento, cohesión y mezcla de responsabilidades.',
  'Diseñar una arquitectura objetivo por módulos (diagrama de clases UML y dependencias) que aplique de forma justificada al menos tres patrones de diseño vistos en clase.',
  'Modelar el flujo del juego como una máquina de estados con transiciones por evento.',
  'Planear una refactorización en pasos pequeños y verificables, y ejecutar el primero dejando el juego funcionando.'
])}

<h2>Descripción de la actividad</h2>
<p>Recibes "Turno Nocturno": un juego de consola donde un robot vigilante espanta bichos a chispazos en una sala de servidores. Corre, se puede ganar y perder, y todo su código vive en un solo archivo. Tu trabajo en este ACA es de <b>arquitecto</b>: entender, diagnosticar y dibujar el plano. El rescate completo se implementa en el ACA 2.</p>
<p><b>Regla de oro:</b> no se reescribe desde cero. Un rescate conserva el comportamiento del juego y cambia su estructura.</p>
<h3>Ventana de trabajo: 3 semanas, una entrega interna por semana</h3>
<ul>
<li><b>Semana 3 (07/12 a 13/12) · Diagnóstico.</b> Ejecuta el juego y lee <code>Program.cs</code>. Dibuja el mapa de dependencias actual (quién toca a quién) y levanta la lista de olores con número de línea. Dibuja la máquina de estados del juego tal como debería ser. <i>Meta: sabes explicar por qué agregar un bicho nuevo hoy es caro.</i></li>
<li><b>Semana 4 (14/12 a 20/12) · Plano.</b> Diseña la arquitectura objetivo: módulos, clases y patrones. La sesión de esta semana incluye asesoría: trae tu borrador de diagrama para afinarlo. <i>Meta: un diagrama que otra persona podría implementar.</i></li>
<li><b>Semana 5 (21/12 a 27/12) · Primer corte y entrega.</b> Ordena el plan de refactor, ejecuta el paso 1 en código, redacta el PDF y sube todo a C Digital antes del 27/12. <i>Meta: el juego sigue funcionando igual y ya tiene su primera pieza limpia.</i></li>
</ul>

<h2>Producto(s) final(es) a entregar</h2>
<p>Los productos se entregan exclusivamente en C Digital, en los formatos solicitados.</p>
<h3>Producto principal: documento de arquitectura (PDF, máximo 6 páginas de contenido, sin contar portada ni referencias)</h3>
<p>Estructura obligatoria:</p>
<ol>
<li><b>Diagnóstico.</b> Mapa de dependencias del código actual y tabla de al menos <b>5 olores</b>: línea o fragmento, qué responsabilidades mezcla, qué cambio futuro encarece.</li>
<li><b>Arquitectura objetivo.</b> Diagrama de módulos con la dirección de sus dependencias y diagrama de clases UML (mínimo 7 clases o interfaces) con relaciones explícitas.</li>
<li><b>Patrones.</b> Tabla de al menos <b>3 patrones</b> (State es obligatorio; elige los otros entre Observer, Command, Factory, Strategy, Componente y Service Locator): qué problema concreto de Turno Nocturno resuelve cada uno y qué pasaría si no se usara.</li>
<li><b>Máquina de estados del juego.</b> Mínimo 5 estados (Menú, Jugando, Pausa, Game Over, Victoria) con el evento que dispara cada transición.</li>
<li><b>Plan de refactorización.</b> De 6 a 10 pasos pequeños, ordenados, cada uno con su criterio de "sigue funcionando" (cómo compruebas que no rompiste nada).</li>
<li><b>Mini RAE (media página).</b> Resumen analítico de una fuente sobre arquitectura de juegos o motores (sugeridas: Gregory, 2018, cap. 1; Ullmann et al., 2023 o 2024; un capítulo de Nystrom, <i>Game Programming Patterns</i>): idea central, cómo la usaste en tu diseño y cita en APA 7.</li>
<li><b>Reflexión final (media página).</b> Qué fue lo más difícil de entender del código ajeno, qué decisión te costó más y de cuál dudas todavía.</li>
</ol>
<h3>Producto complementario: primer corte del refactor (repositorio Git o ZIP)</h3>
<ul>
<li>El proyecto compila y ejecuta con <code>dotnet run</code> y se juega igual que el original.</li>
<li>El bucle principal quedó separado en entrada, actualización y dibujo, y el movimiento usa delta time en lugar de depender de <code>Thread.Sleep</code>.</li>
<li>Al menos <b>una</b> entidad salió de las listas paralelas a una clase propia en su archivo (por ejemplo <code>Bicho</code> o <code>Chispa</code>).</li>
<li>Historial de commits que muestre los pasos (mínimo 3 commits con mensajes claros).</li>
</ul>
<p><b>Entregar en Unity (opcional):</b> quien prefiera puede portar el juego a Unity. Las exigencias de arquitectura son las mismas y el documento es idéntico.</p>

<h2>Pistas y errores comunes</h2>
<ul>
<li>Un olor no es "el código es feo". Es una frase del tipo: "para cambiar X tengo que abrir Y y Z".</li>
<li>No pongas patrones para lucirlos. Cada patrón debe responder a un olor de tu tabla de diagnóstico.</li>
<li>En el diagrama de módulos, las flechas van de quien usa hacia lo usado. Si dos módulos se apuntan entre sí, hay un ciclo: rómpelo con una interfaz.</li>
<li>Las reglas del juego no deberían conocer <code>Console</code>, archivos ni sonido. Esa separación es la que permite probar en el ACA 2.</li>
<li>Pasos pequeños: si un paso del plan toma más de una tarde, pártelo.</li>
</ul>

<h2>Formato de entrega</h2>
<ul>
<li>Un PDF con nombre <code>ACA1_Apellido_Nombre.pdf</code> (en parejas: <code>ACA1_Apellido1_Apellido2.pdf</code>), letra de 11 o 12 puntos, diagramas legibles exportados como imagen (draw.io, PlantUML, Mermaid o a mano escaneado con buena luz).</li>
<li>El enlace al repositorio va en la portada del PDF. Si entregas ZIP, súbelo junto al PDF sin carpetas <code>bin</code> ni <code>obj</code>.</li>
<li>Referencias y citas en APA 7.</li>
</ul>
${lista([
  'El mapa de dependencias muestra quién toca a quién en el código actual.',
  'La tabla tiene al menos 5 olores con línea, responsabilidades mezcladas y cambio que encarecen.',
  'El diagrama de módulos no tiene ciclos y las flechas van de quien usa hacia lo usado.',
  'El UML tiene 7 o más clases o interfaces con relaciones explícitas.',
  'Cada uno de los 3 patrones responde a un olor concreto de la tabla.',
  'La máquina de estados tiene 5 estados y cada transición dice qué evento la dispara.',
  'Cada paso del plan dice cómo compruebo que el juego sigue funcionando.',
  'El código compila con <code>dotnet run</code>, se juega igual y tiene 3 o más commits.',
  'El RAE cita en APA 7 y conecta la fuente con una decisión mía.'
])}

<h2>Criterios y rúbrica de evaluación</h2>
<p>Cada criterio se califica de 1.0 a 5.0 según el descriptor alcanzado.</p>
${rub('Criterio 1 · Diagnóstico del código actual', '25 %', [
  'Mapa de dependencias claro y al menos 5 olores con evidencia (línea o fragmento), responsabilidades mezcladas y el cambio futuro que encarecen. Usa con precisión acoplamiento y cohesión.',
  'Diagnóstico completo con 5 olores; uno o dos sin evidencia precisa o sin consecuencia.',
  'Identifica 3 o 4 olores reales pero descritos de forma general. Mapa de dependencias incompleto.',
  'Lista quejas de estilo (nombres, formato) sin llegar a problemas de arquitectura.',
  'No entrega diagnóstico o no se relaciona con el código.'])}
${rub('Criterio 2 · Arquitectura objetivo y patrones', '30 %', [
  'Módulos con dependencias en una sola dirección y sin ciclos. UML correcto con 7 o más clases o interfaces. Tres o más patrones, cada uno ligado a un olor del diagnóstico y con su justificación.',
  'Arquitectura sólida con leves imprecisiones de notación, o un patrón justificado de forma genérica.',
  'Diseño razonable pero con una dependencia circular, un objeto que sigue haciendo demasiado o patrones nombrados sin problema que resolver.',
  'Diagrama que solo reparte el código en archivos sin cambiar responsabilidades. Patrones mal aplicados.',
  'No entrega diseño o no es reconocible como arquitectura.'])}
${rub('Criterio 3 · Máquina de estados', '15 %', [
  'Cinco o más estados, todas las transiciones con su evento, casos borde cubiertos (perder la última vida, terminar la última oleada, pausar).',
  'Cinco estados y la mayoría de transiciones; uno o dos eventos sin etiqueta.',
  'Estados básicos con transiciones ambiguas.',
  'Solo enumera estados, sin transiciones.',
  'No entrega máquina de estados.'])}
${rub('Criterio 4 · Plan y primer corte en código', '20 %', [
  'Plan de 6 a 10 pasos pequeños con criterio de verificación. El primer corte compila, se juega igual, separa entrada, actualización y dibujo con delta time y extrae una entidad a su clase. Commits claros.',
  'Plan correcto y primer corte funcional con una omisión menor (por ejemplo, sin delta time o sin historial de commits).',
  'Plan con pasos demasiado grandes o sin verificación. El código compila pero el cambio es cosmético.',
  'El código no compila por errores corregibles, o el plan es una lista de deseos.',
  'No entrega código ni plan.'])}
${rub('Criterio 5 · Mini RAE y reflexión', '10 %', [
  'RAE que conecta la fuente con una decisión propia de diseño, cita APA 7 correcta. Reflexión autocrítica y concreta.',
  'RAE y reflexión presentes, algo descriptivas.',
  'RAE que solo resume la fuente. Reflexión superficial.',
  'RAE o reflexión muy breves o sin cita.',
  'No entrega RAE ni reflexión.'])}
<p><b>Nota final ACA 1</b> = (C1 × 0.25) + (C2 × 0.30) + (C3 × 0.15) + (C4 × 0.20) + (C5 × 0.10)</p>
<h2>Observaciones generales</h2>
<ul>
<li>El trabajo en parejas entrega un solo documento y un solo repositorio, e indica qué hizo cada integrante.</li>
<li>Se puede usar asistencia de IA para leer o explicar código, pero el diagnóstico y las decisiones de diseño deben poder sustentarse en la asesoría de la semana 4 y en la socialización.</li>
<li>Las entregas fuera de la fecha de cierre se rigen por el reglamento estudiantil.</li>
</ul>
</article>
</main>
${foot}`;

const aca2 = `${head('ACA 2 · El rescate implementado')}
<body data-page="docs" data-base="../">
<header class="mast" id="mast" data-meta="Actividad de Construcción Aplicada N.º 2 (final) · Corte III · 32 %" data-h1="ACA 2: el rescate, medido y probado" data-q="Lleva tu plano del ACA 1 a código: patrones funcionando, memoria bajo control, contenido en datos y pruebas que lo demuestran."></header>
<main class="wrap">
${tools('ACA2-Rescate-implementado.pdf')}
<article class="doc">
<h1>Actividad de Construcción Aplicada (ACA) 2</h1>
${cun}
${ficha([
  ['Asignatura', 'Arquitectura de Videojuegos', 'Docente / facilitador', 'Andrés Ordóñez-Bolaños'],
  ['Periodo / bloque / corte', 'Bloque 26ES6 · Bloque 1 · Corte III (semanas 6 y 7)', 'ACA N.º', '2 (final)'],
  ['Fecha de apertura (C Digital)', '28 / 12 / 2026', 'Fecha de cierre (C Digital)', '10 / 01 / 2027'],
  ['Ponderación', '32 % de la nota final', 'Sesión de asesoría', 'Semana 6 (trae tu núcleo ya separado)']
])}

<h2>Objetivo del ACA</h2>
<p>Implementar la arquitectura diseñada en el ACA 1 sobre el videojuego "Turno Nocturno", aplicando patrones de diseño, gestión de memoria con object pool medida antes y después, contenido dirigido por datos y pruebas unitarias de la lógica, con el fin de evidenciar el tránsito de un código acoplado a una solución modular, escalable, eficiente y verificable.</p>

<h2>Pregunta orientadora o situación problema</h2>
<p>¿Cómo se convierte un diseño de arquitectura en un juego que se deja cambiar, que no desperdicia memoria y cuya lógica se puede probar de forma automática, y cómo se demuestra con datos que el rescate mejoró el juego?</p>
<p><i>Cierra el ciclo abierto en el ACA 1 y se alinea con la competencia del curso: ${comp}</i></p>

<h2>Resultados de aprendizaje esperados</h2>
<p>Al finalizar esta actividad, el estudiante estará en capacidad de:</p>
${ras([
  'Implementar una arquitectura por módulos donde las reglas del juego no dependen de la consola, el disco ni el sonido, aplicando al menos tres patrones de diseño.',
  'Aplicar gestión de memoria con object pool y eliminar asignaciones por frame, demostrando la mejora con mediciones antes y después.',
  'Construir contenido dirigido por datos, de modo que agregar un bicho o una oleada no requiera modificar el código del núcleo.',
  'Escribir pruebas unitarias de la lógica del juego y documentar la depuración de un defecto con método.',
  'Evaluar críticamente la propia arquitectura, documentando las diferencias entre el plano del ACA 1 y la implementación final.'
])}

<h2>Del ACA 1 al ACA 2: qué reutilizas y qué sube de nivel</h2>
<table class="tbl"><thead><tr><th class="g">En el ACA 1 (el plano)</th><th class="g">En el ACA 2 (la obra)</th></tr></thead><tbody>
<tr><td>Diagrama de módulos y clases.</td><td>Proyectos y clases reales, con dependencias en una sola dirección.</td></tr>
<tr><td>Máquina de estados dibujada.</td><td>Máquina de estados como código, sin booleanos sueltos.</td></tr>
<tr><td>Patrones justificados en una tabla.</td><td>Patrones funcionando: State y al menos dos más.</td></tr>
<tr><td>Un bicho extraído a su clase.</td><td>Bichos y oleadas definidos en datos (JSON o Lua) y creados por una fábrica.</td></tr>
<tr><td>Plan de refactor.</td><td>Refactor ejecutado, con pruebas que lo protegen y cifras que lo respaldan.</td></tr>
</tbody></table>

<h2>Descripción de la actividad</h2>
<p>Este es el ACA final del curso. El juego debe verse y jugarse igual o mejor que el original; lo que cambia es todo lo que hay debajo. El proyecto debe cumplir, como mínimo:</p>
<ul>
<li><b>Núcleo separado.</b> Las reglas viven en un proyecto o carpeta de núcleo que no usa <code>Console</code>, <code>File</code>, <code>Thread.Sleep</code> ni <code>Console.Beep</code>. La consola, el audio y el guardado entran por interfaces.</li>
<li><b>Patrones.</b> State para el flujo del juego (Menú, Jugando, Pausa, Game Over, Victoria), más al menos dos entre Observer o bus de eventos, Command, Factory, Strategy, Componente y Service Locator.</li>
<li><b>Sin preguntar por el tipo.</b> No queda ningún <code>if (tipo == "rapido")</code>: el comportamiento de cada bicho sale de su estrategia o de sus datos.</li>
<li><b>Datos externos.</b> Tipos de bicho y oleadas se cargan desde JSON o desde un script Lua. Incluye un <b>cuarto tipo de bicho</b> agregado solo con datos (y, si hace falta, una estrategia nueva) para demostrarlo.</li>
<li><b>Object pool.</b> Chispas y bichos se reutilizan. El dibujo no crea listas ni concatena cadenas en cada frame.</li>
<li><b>Medición.</b> Tabla antes y después con, al menos, bytes asignados y número de recolecciones de basura en 60 segundos de juego (<code>GC.GetTotalAllocatedBytes</code>, <code>GC.CollectionCount</code>) y tiempo medio de frame.</li>
<li><b>Pruebas.</b> Mínimo <b>8 pruebas unitarias</b> de la lógica que pasan con <code>dotnet test</code>, incluidas pruebas de la máquina de estados, del daño y del pool. El azar usa semilla para que el resultado sea repetible.</li>
</ul>
<p><b>Para aspirar al 5.0:</b> una repetición determinista (grabar los comandos de una partida y reproducirla con el mismo resultado) o comportamiento de bichos programado en Lua, y un cuarto de página que explique qué permitiría escalar el juego a 10 veces más contenido.</p>
<h3>Ventana de trabajo: 2 semanas, 2 entregas internas</h3>
<ul>
<li><b>Semana 6 (28/12 a 03/01) · Estructura y patrones.</b> Separa el núcleo, implementa la máquina de estados, los eventos y la fábrica con datos externos. La sesión de esta semana incluye asesoría: trae el núcleo compilando. <i>Meta: el juego corre sobre la arquitectura nueva.</i></li>
<li><b>Semana 7 (04/01 a 10/01) · Memoria, pruebas y entrega.</b> Mide, aplica el pool, vuelve a medir. Escribe las pruebas, documenta un bug depurado con método, redacta el PDF y sube todo a C Digital antes del 10/01. <i>Meta: puedes demostrar con cifras y pruebas que el rescate funcionó.</i></li>
</ul>

<h2>Pistas técnicas y errores comunes</h2>
<ul>
<li>Mide <b>antes</b> de optimizar. Sin la cifra del "antes" no hay comparación que entregar.</li>
<li>Si una prueba necesita <code>Console</code> o esperar tiempo real, la lógica todavía está pegada a los detalles: inyecta un reloj y un azar falsos.</li>
<li>Un objeto devuelto al pool debe reiniciar su estado. El bug clásico es la chispa que reaparece con la posición vieja.</li>
<li>Desuscribe los eventos cuando un objeto vuelve al pool o termina el estado: si no, reacciona dos veces.</li>
<li>Un Singleton para todo vuelve a pegar las piezas. Prefiere pasar dependencias por constructor.</li>
<li>Nombres de prueba que cuentan una historia: <code>Tanque_MuereAlTercerGolpe</code>, <code>Pausa_NoAvanzaLosBichos</code>.</li>
<li>Commits pequeños. Si algo se rompe, se puede volver atrás o buscar por mitades cuál commit lo dañó.</li>
</ul>

<h2>Producto(s) final(es) a entregar</h2>
<p>Los productos se entregan exclusivamente en C Digital.</p>
<h3>Producto principal: proyecto rescatado (repositorio Git, preferiblemente GitHub, o ZIP)</h3>
<ul>
<li>Compila y se juega con <code>dotnet run</code>; las pruebas pasan con <code>dotnet test</code>. Si se entrega en Unity: proyecto que abre sin errores y pruebas en Unity Test Framework.</li>
<li>Estructura ordenada: núcleo, consola o presentación, datos y pruebas.</li>
<li>Se puede ganar y perder. Incluye el cuarto tipo de bicho definido por datos.</li>
<li>Un archivo <code>README</code> con cómo ejecutar, cómo correr las pruebas y cómo agregar un bicho nuevo.</li>
</ul>
<h3>Producto complementario: documento técnico (PDF, máximo 6 páginas de contenido)</h3>
<ol>
<li>Diagrama de módulos y de clases <b>final</b>, marcando el delta respecto al ACA 1: qué se agregó, qué se quitó y por qué.</li>
<li>Patrones aplicados: dónde están, con fragmentos breves de código.</li>
<li>Memoria y desempeño: tabla antes y después, cómo se midió y qué se cambió.</li>
<li>Datos: cómo se define un bicho y una oleada, con un ejemplo.</li>
<li>Pruebas y depuración: lista de pruebas y la historia de un bug real (cómo se reprodujo, hipótesis, experimento, arreglo y la prueba que ahora lo vigila).</li>
<li>Reflexión final (media a una página): qué cambió del plano, qué fue lo más difícil, qué refactorizarías con dos semanas más.</li>
</ol>
<p><b>Socialización (semana 8):</b> demo de 5 minutos por equipo. No tiene nota propia; alimenta la coevaluación (4 %) y la autoevaluación (4 %).</p>

<h2>Plantilla de medición (cópiala en tu documento)</h2>
<table class="tbl"><thead><tr><th class="g">Métrica (60 s de juego, misma semilla)</th><th class="g">Antes</th><th class="g">Después</th><th class="g">Cómo se midió</th></tr></thead><tbody>
<tr><td>Bytes asignados (<code>GC.GetTotalAllocatedBytes(true)</code> al final menos al inicio)</td><td></td><td></td><td></td></tr>
<tr><td>Recolecciones gen 0 (<code>GC.CollectionCount(0)</code>)</td><td></td><td></td><td></td></tr>
<tr><td>Tiempo medio de frame en ms (<code>Stopwatch</code>)</td><td></td><td></td><td></td></tr>
<tr><td>Peor frame en ms</td><td></td><td></td><td></td></tr>
</tbody></table>
<p>Mide en modo <code>Release</code> (<code>dotnet run -c Release</code>), con la misma semilla y la misma secuencia de entrada en ambos casos. Repite tres veces y reporta el promedio.</p>
<h2>Formato de entrega</h2>
<ul>
<li>PDF con nombre <code>ACA2_Apellido_Nombre.pdf</code> (en parejas: <code>ACA2_Apellido1_Apellido2.pdf</code>) y enlace al repositorio en la portada.</li>
<li>Si entregas ZIP: sin carpetas <code>bin</code>, <code>obj</code> ni <code>Library</code> (Unity).</li>
<li>Referencias y citas en APA 7.</li>
</ul>
${lista([
  'El núcleo no usa <code>Console</code>, <code>File</code>, <code>Thread.Sleep</code> ni <code>Console.Beep</code>.',
  'State funciona como código, más al menos dos patrones con su fragmento en el documento.',
  'No queda ningún <code>if</code> que pregunte por el tipo de bicho.',
  'El cuarto bicho existe solo en datos (JSON o Lua) y aparece en el juego.',
  'La tabla antes y después tiene cifras reales medidas con el mismo método.',
  '<code>dotnet test</code> pasa con 8 o más pruebas con nombres que cuentan una historia.',
  'El informe del bug tiene reproducción, hipótesis, experimento, arreglo y prueba de regresión.',
  'El README explica cómo ejecutar, cómo probar y cómo agregar un bicho.',
  'El documento marca qué cambió frente al plano del ACA 1 y por qué.'
])}

<h2>Rúbrica de evaluación</h2>
<p>Cada criterio se califica de 1.0 a 5.0 según el descriptor alcanzado; la nota final es el promedio ponderado.</p>
${rub('C1 · Arquitectura y patrones', '25 %', [
  'Núcleo sin dependencias de consola, disco ni audio; dependencias en una sola dirección. State como código más dos patrones bien aplicados. Ningún if por tipo. Una clase por archivo, sin lógica duplicada.',
  'Arquitectura sólida con una fuga menor (una llamada a consola en el núcleo, un patrón aplicado a medias).',
  'Código repartido en clases pero con acoplamiento alto, estados con banderas o condicionales por tipo que sobreviven.',
  'Código procedimental disfrazado de clases, o un objeto que concentra todo.',
  'No hay arquitectura reconocible o no compila.'])}
${rub('C2 · Memoria y optimización', '20 %', [
  'Pool correcto para chispas y bichos, con reinicio de estado. Sin asignaciones evitables por frame. Tabla antes y después con método de medición claro y mejora evidente.',
  'Pool funcional y medición presente, con un defecto menor (queda una asignación por frame o falta una de las métricas).',
  'Hay pool pero sin medir, o se mide pero no se corrige lo medido.',
  'Optimización por intuición, sin cifras. Pool con errores (objetos que reaparecen con estado viejo).',
  'No hay gestión de memoria ni medición.'])}
${rub('C3 · Contenido dirigido por datos y escalabilidad', '15 %', [
  'Bichos y oleadas en JSON o Lua, creados por una fábrica. El cuarto bicho se agregó sin tocar el núcleo. Los datos inválidos producen un mensaje claro.',
  'Datos externos funcionando; agregar el cuarto bicho exigió un cambio pequeño en el núcleo.',
  'Algunos valores salen de datos pero los tipos siguen cableados en el código.',
  'Los datos existen pero el juego no los usa de verdad.',
  'Todo el contenido sigue en el código.'])}
${rub('C4 · Pruebas y depuración', '25 %', [
  'Ocho o más pruebas unitarias con buenos nombres que pasan, cubren estados, daño y pool, y usan reloj y azar controlados. Informe de un bug con reproducción, hipótesis, experimento, arreglo y prueba de regresión.',
  'Ocho pruebas que pasan con cobertura desigual, o informe de depuración algo descriptivo.',
  'Entre 4 y 7 pruebas, o pruebas triviales que no atraparían un error real. Depuración narrada sin método.',
  'Menos de 4 pruebas o pruebas que no pasan.',
  'Sin pruebas ni informe de depuración.'])}
${rub('C5 · Documentación técnica y reflexión', '15 %', [
  'PDF con el delta frente al ACA 1 justificado, evidencia de patrones, cifras y pruebas. README que permite ejecutar y extender. Reflexión profunda y autocrítica.',
  'Documentación completa; reflexión algo descriptiva.',
  'Documentación parcial: falta el delta o las cifras. Reflexión superficial.',
  'Documentación mínima.',
  'No entrega documentación.'])}
<p><b>Nota final ACA 2</b> = (C1 × 0.25) + (C2 × 0.20) + (C3 × 0.15) + (C4 × 0.25) + (C5 × 0.15)</p>
<h2>Observaciones generales</h2>
<ul>
<li>Se conserva el equipo del ACA 1. Cada integrante indica en el README qué implementó.</li>
<li>Quien no entregó el ACA 1 puede partir del juego original; el documento debe incluir entonces un plano breve (una página) antes del delta.</li>
<li>La autoevaluación y la coevaluación se diligencian en C Digital entre el 28/12/2026 y el 10/01/2027.</li>
</ul>
</article>
</main>
${foot}`;

const out = path.join(__dirname, '..', 'docs');
fs.writeFileSync(path.join(out, 'aca1.html'), aca1);
fs.writeFileSync(path.join(out, 'aca2.html'), aca2);
console.log('docs/aca1.html', aca1.length, 'docs/aca2.html', aca2.length);
