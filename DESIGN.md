---
name: Arquitectura de Videojuegos
description: El curso como grafo de nodos de un motor; cada idea es un nodo, cada dependencia un cable tipado.
colors:
  graphite-floor: "#121213"
  graphite-deep: "#0d0d0e"
  slate-node: "#19191b"
  slate-node-head: "#212123"
  slate-node-raised: "#2b2b2e"
  edge: "#323235"
  edge-strong: "#4a4a4f"
  text: "#ececec"
  text-muted: "#b9b9bd"
  text-faint: "#909095"
  signal-amber: "#e2a54a"
  signal-amber-hover: "#edb662"
  amber-ink: "#17120a"
  data-teal: "#4db5a4"
  call-slate: "#86a0dc"
  fault-rose: "#e0706a"
  pass-green: "#66bb87"
  pattern-violet: "#a690e2"
  link: "#a9bfef"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(2.3rem, 4.6vw, 4.6rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 118"
  headline:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)"
    fontWeight: 750
    lineHeight: 1.08
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "1.18rem"
    fontWeight: 750
    lineHeight: 1.08
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 106"
  body:
    fontFamily: "Atkinson Hyperlegible Next, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "JetBrains Mono, ui-monospace, Consolas, monospace"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.04em"
  code:
    fontFamily: "JetBrains Mono, ui-monospace, Consolas, monospace"
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.65
  slide-title:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "60px"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.022em"
    fontVariation: "'wdth' 112"
  slide-body:
    fontFamily: "Atkinson Hyperlegible Next, Segoe UI, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.42
rounded:
  inline: "5px"
  chip: "6px"
  control: "8px"
  node: "10px"
  slide-block: "14px"
  slide-node: "16px"
  pin: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.7rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "3rem"
  section: "4.5rem"
  grid-minor: "24px"
  grid-major: "120px"
  slide-pad: "54px 72px 46px"
components:
  button-primary:
    backgroundColor: "{colors.signal-amber}"
    textColor: "{colors.amber-ink}"
    rounded: "{rounded.control}"
    padding: "0.8rem 1.15rem"
  button-primary-hover:
    backgroundColor: "{colors.signal-amber-hover}"
    textColor: "{colors.amber-ink}"
  button-secondary:
    backgroundColor: "{colors.slate-node-head}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "0.8rem 1.15rem"
  button-secondary-hover:
    backgroundColor: "{colors.slate-node-raised}"
    textColor: "#ffffff"
  node:
    backgroundColor: "{colors.slate-node}"
    textColor: "{colors.text}"
    rounded: "{rounded.node}"
    padding: "1rem 1.15rem 1.15rem"
  node-header:
    backgroundColor: "{colors.slate-node-head}"
    textColor: "{colors.call-slate}"
    typography: "{typography.label}"
    padding: "0.6rem 1rem"
  tag:
    backgroundColor: "{colors.slate-node}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.chip}"
    padding: "0.38rem 0.55rem"
  tag-current:
    backgroundColor: "{colors.slate-node}"
    textColor: "{colors.signal-amber}"
    rounded: "{rounded.chip}"
  code-box:
    backgroundColor: "{colors.graphite-deep}"
    textColor: "#dfe3ea"
    typography: "{typography.code}"
    rounded: "{rounded.node}"
    padding: "0.95rem 1.2rem"
  quiz-option:
    backgroundColor: "{colors.slate-node-head}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "0.7rem 0.9rem"
  quiz-option-hover:
    backgroundColor: "{colors.slate-node-raised}"
  week-rail-item:
    backgroundColor: "{colors.graphite-deep}"
    textColor: "{colors.text-muted}"
    padding: "0.65rem 0.7rem 0.7rem"
  week-rail-item-current:
    backgroundColor: "{colors.graphite-deep}"
    textColor: "#ffffff"
---

# Design System: Arquitectura de Videojuegos

## Overview

**Creative North Star: "El grafo del motor"**

El sitio se lee como el lienzo de un editor de nodos (Blueprints, Shader Graph): un suelo grafito casi negro con rejilla doble, sobre el que flotan nodos de pizarra con encabezado de color por tipo, pines circulares en los bordes y cables tipados que llevan datos, eventos o llamadas. La arquitectura del curso se ve, no se describe: el hub dibuja las ocho semanas como un grafo cableado por fases, y cada clase abre con su grafo de temas que se arma solo, nodo por nodo.

Es oscuro y sobrio, pero no el tema genérico de editor: el color es escaso y siempre significa algo. El ámbar marca acción y "aquí"; el teal, datos y lo ya hecho; el azul pizarra, llamadas y lo neutro; el rojo apagado, solo antipatrones y errores. La densidad es de herramienta de lectura: columnas de 70ch, cuerpo en Atkinson Hyperlegible Next a 17px con interlineado amplio, títulos en Archivo ensanchado. El movimiento es marcado pero con propósito: los nodos llegan, los cables se dibujan, un pulso recorre cada cable; todo se apaga con prefers-reduced-motion.

El mazo de slides es el mismo mundo en un lienzo fijo de 1600×900 escalado a la pantalla; en celular deja de escalar y se lee en columna. La impresión invierte el mundo a papel blanco y tinta negra.

**Key Characteristics:**
- Suelo grafito con rejilla de 24px y 120px como única textura.
- Nodo de pizarra con encabezado tintado por tipo, en mono mayúscula, y pines circulares.
- Cables con color semántico fijo: teal datos, ámbar eventos, pizarra llamadas.
- El pin (círculo con borde; relleno = activo/conectado) es la firma en viñetas, marcas, etiquetas y estado.
- Estado como marca además de color: relleno del pin, tachado, texto "correcta", "aquí quedaste".
- Lo ya visto se atenúa (opacidad .5) y lo nuevo llega nítido.

## Colors

Neutros grafito casi sin croma, más cinco señales apagadas de luminancia parecida, cada una con un significado fijo.

### Primary
- **Ámbar de señal** (signal-amber): acción y "aquí". Botón principal, semana actual (pin relleno, borde inferior en el riel, nodo de la ruta con "· hoy"), foco de teclado, selección de texto, barra de progreso del mazo, línea resaltada del código, enlaces dentro de slides, cables de evento. Su tinta es **Tinta ámbar** (amber-ink), nunca blanco. Hover a **Ámbar encendido** (signal-amber-hover).

### Secondary
- **Teal de datos** (data-teal): cables de datos, semanas ya cursadas en riel y ruta, nodos de tipo código, viñetas de lista en prosa, pestaña activa en el código del mazo, botones de figura presionados (con tinta #08110f).
- **Azul pizarra de llamada** (call-slate): cables de llamada ("se apoya en"), tipo por defecto de nodo y de slide (idea, industria), semanas futuras.

### Tertiary
- **Rojo apagado** (fault-rose): solo antipatrones, código "malo", respuestas equivocadas y avisos. Nunca decorativo.
- **Verde de acierto** (pass-green): código "bueno", respuesta correcta, clave de respuestas en documentos.
- **Violeta de patrón** (pattern-violet): nodos de tipo patrón y slides de reto. No aparece en el contrato de dirección; el build lo usa como quinto tipo y se registra como tal.

### Neutral
- **Suelo grafito** (graphite-floor): fondo de página y del lienzo de slides.
- **Grafito profundo** (graphite-deep): cabecera con rejilla, pie, riel, fondo de código y de figuras SVG, relleno de pines vacíos.
- **Pizarra de nodo** (slate-node), **Encabezado de nodo** (slate-node-head), **Nodo elevado** (slate-node-raised): tres pasos tonales de superficie; el tercero solo para hover.
- **Arista** (edge) y **Arista fuerte** (edge-strong): bordes de 1px de nodos y divisores; la fuerte en controles y conectores verticales.
- **Texto** (text), **Texto secundario** (text-muted), **Texto tenue** (text-faint): tres niveles. Títulos y negritas en blanco puro.
- **Enlace** (link): azul claro en prosa; en hover pasa a blanco con subrayado de 2px.

### Named Rules
**The Typed Wire Rule.** Cada señal tiene un significado y solo uno: teal datos, ámbar eventos/acción/aquí, pizarra llamadas, rojo apagado error/antipatrón, verde acierto, violeta patrón. Si un elemento no lleva ese significado, va en neutro.

**The Soft Tint Rule.** Los fondos de color son siempre la señal al 13 % de opacidad sobre pizarra (p. ej. rgba(226,165,74,.13)); los bordes tintados, la señal al 50–60 %. Nunca un relleno saturado de superficie salvo el botón principal, el toggle presionado en teal, la semana "hoy" y los tonos de estado de los nodos de figura (encendido ámbar, falla #a9473f, acierto #2e7653).

**The Paper Inversion Rule.** En impresión el mundo pasa a blanco con tinta #111318, ámbar #9a5f00, teal #1d6e62, verde #1f6b3e, rojo #a3332c; se ocultan cabecera, riel, pie y grafos.

## Typography

**Display Font:** Archivo (con Arial Narrow), eje de ancho 106–118 %
**Body Font:** Atkinson Hyperlegible Next (con Segoe UI, system-ui)
**Label/Mono Font:** JetBrains Mono (con ui-monospace, Consolas)

**Character:** Archivo ensanchado y pesado da títulos de rótulo técnico; Atkinson garantiza lectura cómoda para estudiar solo; JetBrains Mono es la voz del motor: código, pines, números de semana, encabezados de nodo.

### Hierarchy
- **Display** (800, clamp(2.3rem, 4.6vw, 4.6rem), 0.98, ancho 118 %): solo el título del hub; en páginas de clase 800 a clamp(2rem, 4.6vw, 3.6rem), ancho 116 %.
- **Headline** (750, clamp(1.6rem, 2.8vw, 2.2rem), 1.08, ancho 112 %): secciones; 4.5rem de aire arriba.
- **Title** (750, 1.18rem, ancho 106 %): títulos de nodo, de semana y de tarjeta.
- **Body** (400, 1.0625rem, 1.65): prosa a 70ch máximo; ledes en text-muted a 1.15–1.18rem y 46–62ch.
- **Label** (JetBrains Mono 700, 0.78rem, 0.04em, mayúsculas): encabezado de nodo y de panel; números de semana en mono 600–700.
- **Code** (JetBrains Mono 400, 0.88rem, 1.65): bloques de código; código en línea a .86em en crema #f1d9ae sobre pizarra.
- **Slide** (Archivo 800 60px / Atkinson 30px en el lienzo de 1600px; portada 100px ancho 118 %; lead 34px; h2 27px; mínimo 17px en la barra de figura).

### Named Rules
**The Mono Is Machinery Rule.** JetBrains Mono aparece solo donde habla el motor: código, pines, contadores, números, encabezados de nodo. Nunca en prosa ni en títulos.

**The Wide Title Rule.** Los títulos usan Archivo con font-stretch entre 104 % y 118 % y tracking negativo; más ancho cuanto más grande.

## Layout

Contenedor central `min(1180px, 100% - 2.5rem)`. El hub abre con una cabecera-lienzo (rejilla sobre grafito profundo) que lleva título y lede a la izquierda (1.45fr) y el nodo ámbar "Esta semana" a la derecha (1fr); debajo, la ruta de 8 semanas como grafo en un marco de 1500×330. Sigue un riel pegajoso de 8 columnas iguales con blur, la tira de 4 pasos de la semana unidos por cables teal→ámbar, la lista de semanas en filas de 4 columnas y una rejilla auto-fit de documentos (mín. 260px). Clase y documentos usan prosa + columna lateral pegajosa de 320px.

Ritmo: 1rem como unidad; 0.6–1.15rem dentro de nodos, 1–1.5rem entre piezas, 3rem entre columnas, 4.5rem entre secciones. Las slides usan padding 54/72/46px, gap de 26px entre bloques y 48px entre columnas, con la proporción de columnas por variable (44/56 por defecto).

Responsive: a 1120px el hero pasa a una columna; a 900px la columna lateral baja, la tira pasa a 2, el riel hace scroll y pierde los títulos; bajo 640px de ancho de contenedor el grafo y la ruta se convierten en lista de nodos con conector vertical; a 560px todo va a una columna. El mazo bajo cierto ancho entra en modo flujo: sin escala, a 17px, y todo lo revelado por pasos se muestra.

## Elevation & Depth

Mundo plano con capas tonales: suelo, pizarra, encabezado, elevado. La profundidad la dan la rejilla y unas pocas sombras ambientales largas y negras que despegan los nodos del suelo, nunca sombras duras ni de color.

### Shadow Vocabulary
- **Nodo flotante** (`box-shadow: 0 18px 40px -22px rgba(0,0,0,.8)`): nodos del hub.
- **Panel emergente** (`box-shadow: 0 24px 50px -20px rgba(0,0,0,.9)`): notas del docente en el mazo.
- **Lienzo de ruta** (`box-shadow: 0 30px 60px -30px rgba(0,0,0,.9)`): marco del grafo de 8 semanas.
- **Filo de señal** (`box-shadow: inset 0 3px 0 <señal>` / `inset 0 -2px 0 <ámbar>`): borde interior de 2–3px que marca tipo (nodos del mapa de analogía) o la semana actual en el riel.

### Named Rules
**The Long Dark Shadow Rule.** Las sombras son difusas, negras y con spread negativo; solo separan nodo de suelo. El color nunca está en la sombra.

## Shapes

Rectángulos de esquinas suaves y círculos. Radio de nodo 10px en el sitio (12px en los nodos SVG, 14–16px en el lienzo de slides); controles 8px; etiquetas 6px; código en línea 5px. Bordes de 1px (1.5px en el lienzo) en arista. El círculo es la forma de la conexión: pines de 7px de radio en los bordes del nodo SVG, pin de .62em en el texto, viñetas de 13px, números de 46px en anillo. Los cables del grafo son curvas Bézier horizontales de 3px con extremos redondeados; las flechas de figura llevan punta triangular. En la vista de lista, el tipo se marca con un cuadrado de 0.55rem y radio 2px.

## Components

### Buttons
Directos y táctiles.
- **Shape:** esquinas suaves (8px; 9px en figuras del mazo).
- **Primary:** ámbar con tinta ámbar, Atkinson 700 .98rem, padding .8rem 1.15rem, icono SVG de trazo 2px a 1.15em.
- **Hover / Focus:** sube 1px (2px en figuras) con la curva `cubic-bezier(.16,1,.3,1)` y pasa al ámbar encendido; foco con contorno ámbar de 2px y 3px de separación.
- **Secondary:** pizarra de encabezado con arista fuerte; hover a nodo elevado y borde en texto tenue. Deshabilitado a opacidad .4.
- **Toggle de figura:** presionado en teal con tinta #08110f; los grupos excluyentes van como segmento unido de 10px.

### Chips
- **Style:** Atkinson 700 .78rem, radio 6px, borde arista fuerte, con un pin hueco de .45rem delante.
- **State:** entrega actual en ámbar con fondo ámbar suave y pin relleno; fecha de semana en teal.

### Cards / Containers
- **Nodo:** pizarra, borde arista, radio 10px, sombra de nodo flotante. Encabezado en mono mayúscula tintado con la señal del tipo al 13 % sobre pizarra de encabezado, con pin (relleno si es el activo). Cuerpo 1rem 1.15rem.
- **Nota:** pizarra con borde arista; variante clave en ámbar suave, variante aviso en rojo suave.
- **Tarjeta de documento:** pizarra con pin teal hueco (ámbar relleno para PDFs); hover sube 2px y el borde pasa a ámbar.
- **Concepto:** encabezado con título Archivo y pin teal, cuerpo en text-muted, ejemplo en text-faint con negrita teal.

### Inputs / Fields
- **Opción de quiz:** botón de bloque en pizarra de encabezado, letra en anillo mono de 1.75rem. Hover desliza 3px a la derecha con borde ámbar.
- **Correcta / Incorrecta:** verde suave con anillo relleno y la palabra "correcta"; rojo suave con tachado. La explicación entra con "rise" en ámbar suave.
- **Controles de figura:** deslizadores y casillas con accent-color ámbar; salida numérica en mono ámbar.

### Navigation
- **Barra superior:** marca "ARQ·VJ" con anillo ámbar, enlaces en text-muted que pasan a blanco con subrayado ámbar de 1px; página actual igual.
- **Riel de semanas:** 8 celdas separadas por arista, número mono con pin; hecha = pin teal, actual = pin ámbar con fondo ámbar suave y filo inferior ámbar, última visitada = etiqueta "aquí quedaste" (punto ámbar en móvil).
- **Barra del mazo:** grafito profundo, chip del tipo de slide en su color, contador mono, botones de 2.3rem que pasan a ámbar en hover, puntos de pasos y barra de progreso ámbar de 3px.

### Code Box
Grafito profundo, borde arista, pestañas mono con subrayado ámbar (teal en el mazo) y botón copiar a la derecha. Leyenda superior en mono; variante mala en rojo y buena en verde. En el mazo, las líneas se resaltan por pasos: el resto baja a .38, la activa lleva fondo ámbar al 12 % y un pin ámbar, y un callout ámbar con pin explica la línea.

### Grafo de temas y ruta del curso (firma)
Nodos SVG pizarra #1c1c1f con arista #3c3c41, encabezado tintado al 30 % por tipo (idea pizarra, patrón violeta, código teal, práctica ámbar, riesgo rojo), cuadrado de tipo, título blanco 25px y subtítulo #c4c4c8. Se ordenan por capas de izquierda a derecha; los nodos llegan por capa cada 380ms, luego los cables se dibujan en .7s y un pulso de 4.5px corre por cada uno. Al elegir un nodo, su borde pasa a ámbar, los vecinos quedan plenos y el resto baja a .55; la ficha inferior dice de qué se apoya y a qué alimenta. La ruta agrupa semanas en cajas de comentario por fase, marca la actual con fondo #2a2417, borde ámbar y "· hoy".

### Slide
Cada slide lleva el color de su tipo en un pin de 14px y un cable vertical que baja desde el título. Título entra con "enfoca" (desenfoque a nítido, .7s), los bloques llegan escalonados .08s. El revelado por pasos conserva el espacio, lo nuevo llega nítido y lo visto baja a .5. Idea clave: nodo ámbar suave con pin en el borde izquierdo. Analogía: dos nodos unidos por un cable ámbar→teal que se dibuja.

## Do's and Don'ts

### Do:
- **Do** asignar cada color por su significado de cable (The Typed Wire Rule); lo que no tiene significado va en neutro.
- **Do** construir contenedores nuevos como nodos: pizarra, arista de 1px, radio 10px, encabezado tintado en mono mayúscula cuando el contenedor tiene tipo.
- **Do** marcar estado con forma además de color: pin relleno o hueco, tachado, palabra explícita.
- **Do** dibujar figuras nuevas con FIG (lienzo, caja, flecha, grafo, ruta) para heredar nodos, pines y cables.
- **Do** atenuar lo ya visto a .5 y dejar que lo nuevo llegue nítido; respetar prefers-reduced-motion y el modo sin animación.
- **Do** usar iconos SVG en línea de trazo 2px.
- **Do** mantener la prosa a 70ch y el cuerpo a 1.0625rem/1.65.

### Don't:
- **Don't** usar rojo apagado fuera de antipatrones, errores y avisos.
- **Don't** usar rellenos saturados de superficie salvo el botón principal, el toggle presionado en teal, la semana actual y los tonos de estado de los nodos de figura.
- **Don't** volver a los colores chillones y arcade del sitio anterior ni al tema oscuro genérico de editor.
- **Don't** usar el verde institucional de la CUN.
- **Don't** usar sombras duras, desplazadas o de color.
- **Don't** usar JetBrains Mono para prosa o títulos.
