(function () {
  const loopCS = `using System.Diagnostics;

class Juego
{
    bool jugando = true;
    float x = 0f;
    const float Velocidad = 120f;            // unidades por SEGUNDO, no por frame

    public void Correr()
    {
        var reloj = Stopwatch.StartNew();
        double anterior = reloj.Elapsed.TotalSeconds;

        while (jugando)
        {
            double ahora = reloj.Elapsed.TotalSeconds;
            float dt = (float)(ahora - anterior);   // segundos desde el frame anterior
            anterior = ahora;

            ProcesarEntrada();   // 1. ¿qué quiere el jugador?
            Actualizar(dt);      // 2. el mundo avanza dt segundos
            Dibujar();           // 3. mostramos el resultado
        }
    }

    void ProcesarEntrada() { /* leer teclado, sin mover nada todavía */ }
    void Actualizar(float dt) { x += Velocidad * dt; }
    void Dibujar() { /* solo lee el estado, nunca lo cambia */ }
}`;
  const loopUnity = `using UnityEngine;

// En Unity el bucle ya existe: tú solo llenas los huecos.
public class Nave : MonoBehaviour
{
    [SerializeField] float velocidad = 5f;   // unidades por segundo
    float direccion;

    void Update()                            // una vez por frame
    {
        direccion = Input.GetAxisRaw("Horizontal");               // 1. entrada
        transform.Translate(direccion * velocidad * Time.deltaTime, 0f, 0f); // 2. actualizar
    }                                        // 3. dibujar: lo hace el motor
}`;
  const loopLua = `-- Lo que ya conoces de LÖVE: el mismo bucle con otros nombres.
local x, velocidad = 0, 120

function love.update(dt)          -- 1 y 2: entrada y actualización
    if love.keyboard.isDown("right") then
        x = x + velocidad * dt
    end
end

function love.draw()              -- 3: dibujar, sin cambiar estado
    love.graphics.rectangle("fill", x, 100, 32, 32)
end`;
  const fixedCS = `const float Paso = 1f / 60f;     // la física SIEMPRE avanza de a 1/60 s
float acumulado = 0f;

while (jugando)
{
    float dt = MedirTiempoDelFrame();
    acumulado += dt;                         // llenamos el vaso

    ProcesarEntrada();

    while (acumulado >= Paso)                // lo vaciamos de a tragos iguales
    {
        ActualizarFisica(Paso);
        acumulado -= Paso;
    }

    Dibujar();
}`;
  const fixedUnity = `using UnityEngine;

public class Bola : MonoBehaviour
{
    Rigidbody2D rb;
    float direccion;

    void Awake() { rb = GetComponent<Rigidbody2D>(); }

    void Update()        // ritmo variable: aquí va la entrada
    {
        direccion = Input.GetAxisRaw("Horizontal");
    }

    void FixedUpdate()   // ritmo fijo (0.02 s por defecto): aquí va la física
    {
        rb.linearVelocity = new Vector2(direccion * 6f, rb.linearVelocity.y);
    }
}`;
  const espagueti = `static void Main()
{
    while (true)
    {
        if (Console.KeyAvailable) {
            var k = Console.ReadKey(true).Key;
            if (k == ConsoleKey.Spacebar && !pausa && !menu && vidas > 0) {
                balasX.Add(jx); balasY.Add(jy - 1);
                Console.Beep();
            }
        }
        for (int i = 0; i < enemX.Count; i++) {
            if (enemTipo[i] == "rapido") enemY[i] += 2; else enemY[i] += 1;
            if (enemX[i] == jx && enemY[i] == jy) {
                vidas--;
                File.WriteAllText("puntaje.txt", puntos.ToString());
                if (vidas == 0) { gameOver = true; }
            }
        }
        // ... 150 líneas más en el mismo método
        Thread.Sleep(50);
    }
}`;

  const malDibujo = `void Dibujar()
{
    foreach (var b in bichos)
    {
        b.Y += 1;                 // mover dentro del dibujo
        Pintar(b.X, b.Y, 'b');
    }
}`;
  const bienDibujo = `void Actualizar(float dt)
{
    foreach (var b in bichos)
        b.Y += b.Velocidad * dt;  // el mundo cambia aquí
}

void Dibujar()
{
    foreach (var b in bichos)
        Pintar(b.X, b.Y, 'b');    // aquí solo se mira
}`;

  window.CLASE = {
    n: 1,
    titulo: 'Qué es la arquitectura de un juego',
    objetivos: [
      'Explicar con tus palabras qué es arquitectura de software y por qué se mide con el costo de cambiar algo.',
      'Escribir un game loop con delta time y decir qué va en entrada, actualización y dibujo.',
      'Ubicar una pieza de código en la capa del motor que le corresponde.',
      'Reconocer al menos tres "olores" de mala arquitectura en un juego que funciona.'
    ],
    analogia: 'Una cocina de restaurante funciona porque tiene estaciones: parrilla, fríos, postres. Cada una hace una cosa y se pasan los platos por un mostrador. Un juego mal arquitecturado es un solo cocinero haciendo todo en una olla: sirve para 4 comensales, colapsa con 40.',
    agenda: [
      ['0:00', 'Bienvenida: de una casa a un edificio'],
      ['0:05', 'Mapa del curso, las cuatro preguntas y las analogías'],
      ['0:15', 'Cómo funciona cada clase, evaluación, Turno Nocturno y herramientas'],
      ['0:25', 'Quiz de conceptos previos (10 preguntas, sin nota)'],
      ['0:40', 'Dos juegos idénticos: qué es arquitectura'],
      ['0:55', 'El game loop y el delta time, con demo y casos reales'],
      ['1:20', 'Paso fijo y las capas de un motor'],
      ['1:35', 'Actividad: caza de olores en Turno Nocturno'],
      ['1:52', 'Cierre, quiz de la clase y lo que viene']
    ],
    codigoIntro: 'Tres piezas: el bucle con delta time, el bucle de paso fijo y un pedazo del juego espagueti para entrenar el olfato.',
    codigo: [
      { titulo: 'El game loop con delta time', desc: 'El mismo bucle en tres mundos. En C# puro lo escribes tú; en Unity y en LÖVE ya existe y tú llenas los huecos.',
        tabs: [{ lang: 'C#', src: loopCS }, { lang: 'Unity', src: loopUnity }, { lang: 'Lua', label: 'Lua (LÖVE)', src: loopLua }] },
      { titulo: 'Paso fijo para la física', desc: 'Cuando el resultado debe ser idéntico en todas las máquinas (física, repeticiones, red), la simulación avanza en pasos del mismo tamaño.',
        tabs: [{ lang: 'C#', src: fixedCS }, { lang: 'Unity', src: fixedUnity }] },
      { titulo: 'Un bocado de espagueti', desc: 'Así empieza "Turno Nocturno". Funciona. Cuenta cuántos temas distintos se mezclan en estas líneas.',
        tabs: [{ lang: 'C#', label: 'Program.cs (fragmento)', src: espagueti }] }
    ],
    tarea: [
      'Descarga y ejecuta <a href="proyecto/TurnoNocturno/README.html">Turno Nocturno</a>. Juega hasta perder.',
      'Anota tres cosas del código que te harían difícil agregar un enemigo nuevo. Las usamos al empezar la semana 2.',
      'Opcional: lee el capítulo 1 de Gregory, <i>Game Engine Architecture</i> (la sección de capas del motor).'
    ],
    conceptos: [
      { t: 'Arquitectura de software', d: 'Las decisiones sobre en qué piezas se divide un programa y cómo se comunican. Se juzga por lo que cuesta cambiarlo.', ej: 'Decidir que los bichos no conocen la consola: así se pueden dibujar en Unity sin tocar sus reglas.' },
      { t: 'Game loop', d: 'El bucle que repite entrada, actualización y dibujo mientras el juego corre.', ej: 'En LÖVE: love.update(dt) y love.draw(). En Unity: Update() y el render del motor.' },
      { t: 'Delta time (dt)', d: 'Los segundos que duró el cuadro anterior. Multiplicar velocidades por dt hace que el juego avance igual con cualquier cantidad de fps.', ej: 'x += 300 * dt mueve la nave 300 unidades por segundo a 30 o a 144 fps.' },
      { t: 'Paso fijo', d: 'Avanzar la simulación en intervalos de tiempo siempre iguales, acumulando el tiempo real que va llegando.', ej: 'FixedUpdate de Unity corre cada 0,02 s para que la física salte igual en todas las máquinas.' },
      { t: 'Capas del motor', d: 'Organización por pisos donde cada capa usa las de abajo y no conoce las de arriba.', ej: 'La librería de matemáticas no sabe que existe un puntaje; el juego sí usa las matemáticas.' },
      { t: 'Olor de código', d: 'Señal en el código que suele indicar un problema de diseño, aunque el programa funcione.', ej: 'Un if por cada tipo de bicho dentro del bucle principal.' },
      { t: 'Deuda técnica', d: 'El costo futuro de un atajo de hoy: cada cambio posterior paga intereses.', ej: 'Guardar el puntaje desde la colisión fue rápido, pero ahora no se puede probar la colisión sin un archivo.' }
    ],
    industria: [
      { j: 'Space Invaders (1978)', t: 'Los invasores se aceleran al quedar pocos porque el hardware tarda menos en dibujarlos: la velocidad quedó amarrada al trabajo por cuadro.', src: 'Tomohiro Nishikado, entrevistas sobre el desarrollo del juego' },
      { j: 'Doom (1993)', t: 'La simulación avanza a 35 tics fijos por segundo, separada de cuántos cuadros dibuja el computador.', src: 'Código fuente de Doom publicado por id Software (1997), constante TICRATE' },
      { j: 'Unity', t: 'Separa Update (una vez por cuadro, con Time.deltaTime) de FixedUpdate (paso fijo, 0,02 s por defecto) para la física.', src: 'Manual de Unity: Order of execution for event functions' },
      { j: 'Game Engine Architecture', t: 'Describe un motor como capas: plataforma, núcleo, recursos, render, física, gameplay. Base de la figura del edificio.', src: 'Gregory, J. (2018). Game Engine Architecture, 3.ª ed., cap. 1' }
    ],
    errores: [
      { mito: 'Si el juego funciona, la arquitectura está bien.', real: 'Funcionar es el mínimo. La arquitectura se nota el día que hay que cambiar algo y todo se rompe.' },
      { mito: 'Arquitectura es usar muchos patrones de diseño.', real: 'Los patrones son herramientas. Ponerlos donde no hay problema agrega piezas y vuelve el código más difícil.' },
      { mito: 'Mover cosas en el dibujo da igual.', real: 'Si el estado cambia en Dibujar, el juego corre distinto según los fps y no se puede probar sin pantalla.' },
      { mito: 'Thread.Sleep(50) asegura una velocidad constante.', real: 'Solo agrega una pausa: si el cuadro tarda más, el juego se vuelve lento. La velocidad debe depender de dt.' },
      { mito: 'Unity ya trae la arquitectura hecha.', real: 'Unity trae los pisos de abajo. Cómo se organizan tus scripts y quién habla con quién sigue siendo tu decisión.' }
    ],
    lecturas: [
      'Gregory, J. (2018). <i>Game Engine Architecture</i> (3.ª ed.), cap. 1 y cap. 8 (el game loop).',
      'Nystrom, R. <i>Game Programming Patterns</i>, capítulo "Game Loop" (gratis en gameprogrammingpatterns.com).'
    ],

    sinRuta: true,
    slides: [
      { kind: 'portada', title: 'Arquitectura de Videojuegos',
        lead: 'Bienvenida · Semana 1 de 8 · Qué es la arquitectura de un juego',
        full: [
          { ul: ['Ya sabes hacer que un juego funcione.', 'Aquí aprendes a construirlo para que se deje <b>cambiar, crecer, medir y probar</b>.'] },
          { pie: 'Flecha derecha: avanza paso a paso · <span class="kbd">F</span> pantalla completa · <span class="kbd">N</span> notas del docente' }
        ],
        nota: 'Preséntate en un minuto: quién eres y un juego en el que el código te hizo sufrir. Pide a tres personas que digan en una frase qué juego hicieron en Programación de Videojuegos. Total: 5 minutos.' },

      { kind: 'analogia', title: 'De una casa a un edificio',
        lead: 'Breakout era una casa de un piso. Un juego comercial es un edificio de veinte pisos con decenas de obreros.',
        izq: 52,
        left: [{ svg: `<svg viewBox="0 0 900 420" role="img" aria-label="Una casa pequeña junto a un edificio de muchos pisos con su plano"><rect width="900" height="420" rx="14" fill="#0d0d0e"/><line x1="30" y1="360" x2="870" y2="360" stroke="rgba(255,255,255,.45)" stroke-width="3"/><path d="M90 360V260h150v100z" fill="#2b2b30" stroke="#fff" stroke-width="3"/><path d="M75 262l90-70 90 70z" fill="#e0706a" stroke="#fff" stroke-width="3"/><rect x="150" y="300" width="36" height="60" fill="#e2a54a"/><text x="165" y="398" text-anchor="middle" font-size="24" font-weight="700" fill="#b9b9bd">Breakout</text><rect x="430" y="70" width="190" height="290" fill="#2b2b30" stroke="#fff" stroke-width="3"/><g fill="#e2a54a">${Array.from({ length: 6 }, (_, f) => Array.from({ length: 4 }, (_, c) => `<rect x="${448 + c * 44}" y="${88 + f * 44}" width="26" height="26"/>`).join('')).join('')}</g><text x="525" y="398" text-anchor="middle" font-size="24" font-weight="700" fill="#b9b9bd">Juego con equipo</text><rect x="660" y="90" width="200" height="250" rx="10" fill="#e4e4e6" stroke="#fff" stroke-width="3"/><g stroke="#2b2b30" stroke-width="3" fill="none"><rect x="690" y="120" width="60" height="44"/><rect x="770" y="120" width="60" height="44"/><rect x="730" y="200" width="60" height="44"/><path d="M720 164l30 36M800 164l-30 36"/><rect x="690" y="270" width="140" height="40"/><path d="M760 244v26"/></g><text x="760" y="76" text-anchor="middle" font-size="24" font-weight="800" fill="#e2a54a">el plano</text></svg>` }],
        right: [
          { mapa: [['Una persona, un fin de semana', 'Un equipo, meses o años'], ['El plano vive en tu cabeza', 'El plano está escrito y se discute'], ['Se arregla tumbando una pared', 'Cada cambio tiene que caber en el plano']], de: 'Casa de un piso', a: 'Edificio', pasos: true },
          { clave: 'Arquitectura de software es ese plano: qué piezas hay y cómo se conectan.', paso: true }
        ],
        nota: 'Pregunta: ¿qué pasa si a una casa de un piso le pones diez pisos encima sin cambiar los cimientos? Respuesta esperada: se cae o hay que tumbarla. Eso le pasa a un juego que crece sin arquitectura. 3 minutos.' },

      { kind: 'mapa', title: 'El mapa del curso: 8 semanas, 5 fases',
        full: [{ ruta: 1 }],
        nota: 'Toca cada semana y lee solo la pregunta guía. Que noten las tres entregas en coral (30, 30 y 32 %) y el 8 % final. Las semanas 5 y 6 (24 y 31 de diciembre) se mueven de día: confirma la fecha con el grupo. 4 minutos.' },

      { kind: 'idea', title: 'Cuatro preguntas guían todo el curso',
        lead: 'Un juego bien construido responde «sí» a estas cuatro. Cada semana ataca una o dos.',
        izq: 56,
        left: [{ fig: 'cuatro' }],
        right: [
          { tabla: { head: ['Pregunta', 'Semanas'], rows: [['<b>Cambiar</b>: ¿sin abrir las otras piezas?', '2, 3 y 4'], ['<b>Rendir</b>: ¿sin tirones?', '1 y 5'], ['<b>Crecer</b>: ¿con 10 veces más?', '4 y 6'], ['<b>Probar</b>: ¿puedo demostrarlo?', '7']] }, pasos: true },
          { clave: 'No hay arquitectura perfecta: hay la que hace baratos los cambios que tu juego va a necesitar.', paso: true }
        ],
        nota: 'Toca cada cuadro y lee el síntoma en voz alta. Pregunta: ¿cuál de los cuatro síntomas ya les pasó? Casi siempre es el primero. Salen de la competencia del syllabus: modularidad, escalabilidad, desempeño, testing y depuración. 3 minutos.' },

      { kind: 'analogia', title: 'Una analogía por semana',
        lead: 'Cada concepto llega primero como una escena que ya conoces. Voltea las cartas.',
        top: true,
        full: [{ fig: 'analogias' }],
        nota: 'Voltea dos o tres y pregunta antes: ¿qué concepto de programación creen que explica la bolera? Respuesta: reutilizar objetos en lugar de crearlos. No expliques los conceptos hoy, solo genera curiosidad. 3 minutos.' },

      { kind: 'idea', title: 'Así funciona cada clase: siempre igual',
        top: true,
        full: [
          { fig: 'ritual' },
          { clave: '<b>Antes:</b> lee la pregunta de la semana. <b>En clase:</b> slides y actividad en parejas. <b>Después:</b> quiz corto, no es nota.', paso: true }
        ],
        nota: 'Muestra dónde está todo en el sitio: semana, slides, código, quiz. Insiste en que las preguntas de predicción no restan: equivocarse antes de la explicación es como mejor se aprende. 2 minutos.' },

      { kind: 'idea', title: 'Cómo se evalúa',
        izq: 54,
        left: [
          { tabla: { head: ['Corte', 'Qué', 'Cuándo', 'Peso'], rows: [['I', 'Quiz-parcial', 'Semana 2', '30 %'], ['II', 'ACA 1: diagnóstico y plano', 'Cierra 27 dic', '30 %'], ['III', 'ACA 2: rescate implementado', 'Cierra 10 ene', '32 %'], ['III', 'Autoevaluación y coevaluación', 'Semana 8', '8 %']] }, pasos: true }
        ],
        right: [
          { panel: [{ p: 'Los dos ACA son <b>un solo proyecto</b> en dos tiempos: primero el plano, después la obra.' }, { p: 'El quiz-parcial sale de los quices de las clases 1 y 2.' }], h: 'Lo importante' },
          { pie: 'Las consignas completas y las rúbricas están en Documentos, también en PDF.' }
        ],
        nota: 'Muestra el PDF del ACA 1 desde la página de documentos. Aclara la política de entregas tardías del reglamento. 3 minutos.' },

      { kind: 'idea', title: 'El paciente del curso: Turno Nocturno',
        izq: 46,
        left: [{ fig: 'turno' }],
        right: [
          { ul: ['Eres <code>@</code>, un robot que espanta bichos a chispazos.', 'Funciona. Todo vive en <b>un archivo</b> y casi todo en <b>un método</b>.', '<b>ACA 1:</b> lo diagnosticas y dibujas el plano.', '<b>ACA 2:</b> lo rescatas, lo mides y lo pruebas.'], pasos: true },
          { clave: 'Se aprende más arquitectura arreglando un juego enredado que empezando uno en blanco.', paso: true }
        ],
        nota: 'La figura es una simulación que se juega sola. Luego muestra el juego real un minuto (dotnet run) y abre Program.cs haciendo scroll sin leer: que vean el tamaño. 3 minutos.' },

      { kind: 'idea', title: 'Las herramientas del curso',
        full: [
          { tabla: { head: ['Herramienta', 'Para qué la usamos', 'Nivel que se espera'], rows: [['<b>C# con .NET 8</b>', 'Turno Nocturno y casi todos los ejemplos. Sin motor, la idea se ve desnuda.', 'Escribir y refactorizar'], ['<b>Unity 6</b>', 'La misma idea dentro de un motor: MonoBehaviour, ScriptableObject, Test Framework.', 'Leer y adaptar'], ['<b>C++</b>', 'Memoria sin recolector: RAII y punteros inteligentes, como en Unreal.', 'Leer y entender'], ['<b>Lua</b>', 'Lo que ya conoces de LÖVE, ahora como lenguaje de datos y mods.', 'Leer y escribir scripts cortos']] }, pasos: true },
          { pie: 'Instala el SDK de .NET 8 y Visual Studio Code o Rider antes de la semana 2.' }
        ],
        nota: 'Pregunta quién ya tiene .NET instalado. Quien entregue en Unity tiene las mismas exigencias de arquitectura. 2 minutos. Después de esta slide va el quiz de conceptos previos (15 minutos, quiz.html?s=diag).' },

      { kind: 'reto', title: 'Dos juegos idénticos en pantalla',
        lead: 'Mismo arte, mismos 60 fps. Piden «un enemigo que vuela». El equipo A lo entrega en una hora; el B tarda dos semanas y rompe la pausa.',
        izq: 56,
        left: [{ fig: 'pantallas' }],
        right: [{ check: { q: '¿Qué tenía diferente el juego del equipo B?', opts: ['La forma en que estaban organizadas y conectadas sus piezas', 'Peores gráficos', 'Un lenguaje más lento', 'Menos programadores'], ok: 0, why: 'Eso es la arquitectura: no se ve en pantalla, se siente el día que hay que cambiar algo.' } }],
        nota: 'Primero que respondan; después cambia la figura a «Lo que ve el programador». La idea que debe quedar: la arquitectura es invisible para el jugador y carísima para el equipo. 3 minutos.' },

      { kind: 'demo', title: 'Arquitectura es el costo de cambiar',
        izq: 36,
        left: [
          { big: 'Las decisiones sobre cómo se dividen las piezas y cómo se hablan entre sí.' },
          { clave: 'Buena arquitectura: el cambio número 20 cuesta casi lo mismo que el primero.', paso: true },
          { pie: 'Mueve el deslizador. Las curvas son ilustrativas, no mediciones.' }
        ],
        right: [{ fig: 'costo' }],
        nota: 'Arrastra despacio de 0 a 20 y pregunta en qué punto el equipo empieza a decir «mejor no toquemos eso». Dos minutos.' },

      { kind: 'analogia', title: 'Una cocina, no una olla',
        izq: 58,
        left: [{ fig: 'cocina' }],
        right: [
          { mapa: [['Estación', 'Módulo<small>hace una sola cosa</small>'], ['Mostrador de pedidos', 'Interfaz<small>por dónde se hablan</small>'], ['Quién le pasa qué a quién', 'Arquitectura']], de: 'En la cocina', a: 'En el juego', pasos: true }
        ],
        nota: 'Primero juega con la figura en modo «Una olla» y los tres botones; luego cambia a «Estaciones». Después revela el mapa fila por fila. Pregunta: ¿tu último proyecto se parecía a la cocina o a la olla?' },

      { kind: 'idea', title: 'Tres preguntas para cualquier código',
        izq: 58,
        right: [{ svg: `<svg viewBox="0 0 700 460" role="img" aria-label="Tres piezas: un dato con un dueño, pocas flechas entre piezas y una pieza que se cambia sin romper otras"><rect width="700" height="460" rx="14" fill="#0d0d0e"/><g font-family="'Atkinson Hyperlegible Next', sans-serif" font-weight="700" text-anchor="middle"><rect x="40" y="40" width="180" height="90" rx="14" fill="#2b2b30" stroke="#fff" stroke-width="3"/><text x="130" y="94" font-size="26" fill="#fff">Jugador</text><rect x="70" y="150" width="120" height="50" rx="10" fill="#e2a54a"/><text x="130" y="183" font-size="22" fill="#0d0d0e">vidas</text><text x="130" y="240" font-size="22" fill="#b9b9bd">1 · un dueño</text><rect x="260" y="40" width="180" height="90" rx="14" fill="#2b2b30" stroke="#fff" stroke-width="3"/><text x="350" y="94" font-size="26" fill="#fff">Reglas</text><rect x="260" y="160" width="180" height="90" rx="14" fill="#2b2b30" stroke="#fff" stroke-width="3"/><text x="350" y="214" font-size="26" fill="#fff">Sonido</text><line x1="350" y1="134" x2="350" y2="152" stroke="#e2a54a" stroke-width="4"/><path d="M342 146l8 10 8-10" fill="#e2a54a"/><text x="350" y="290" font-size="22" fill="#b9b9bd">2 · pocas flechas</text><rect x="480" y="40" width="180" height="90" rx="14" fill="#2e7653" stroke="#fff" stroke-width="3"/><text x="570" y="94" font-size="26" fill="#fff">Bicho v2</text><rect x="480" y="160" width="180" height="90" rx="14" fill="#2b2b30" stroke="#fff" stroke-width="3"/><text x="570" y="214" font-size="26" fill="#fff">Dibujo</text><text x="570" y="290" font-size="22" fill="#b9b9bd">3 · cambio sin sustos</text></g><text x="350" y="400" text-anchor="middle" font-size="26" font-weight="800" fill="#e2a54a">Si respondes «no sé», hay deuda de arquitectura</text></svg>` }],
        left: [
          { ol: ['<b>¿Quién sabe qué?</b> Cada dato tiene un solo dueño.', '<b>¿Quién le habla a quién?</b> Menos flechas, menos sorpresas.', '<b>¿Qué se rompe si cambio esto?</b>'], pasos: true },
          { clave: 'Si la respuesta a la tercera es «no sé», hay un problema de arquitectura.', paso: true }
        ],
        nota: 'Estas tres preguntas se repiten todo el curso. Pide que las copien: las van a usar en el ACA 1.' },

      { kind: 'antipatron', title: 'El espagueti funciona. Ese es el problema.',
        izq: 40,
        left: [
          'Fragmento real del juego que vamos a rescatar. Compila, corre y se deja jugar.',
          { check: { q: '¿Cuántos temas distintos mezcla este método?', opts: ['Uno: el juego', 'Dos: entrada y enemigos', 'Al menos cinco', 'Ninguno, está bien así'], ok: 2, why: 'Teclado, sonido, movimiento, colisiones, disco y hasta el ritmo del juego. Avanza para verlos uno por uno.' } }
        ],
        right: [{ code: [{ lang: 'C#', label: 'Program.cs · Main()', src: `while (true)
{
    if (Console.KeyAvailable) {
        var k = Console.ReadKey(true).Key;
        if (k == ConsoleKey.Spacebar && !pausa) {
            balasX.Add(jx); balasY.Add(jy - 1);
            Console.Beep();
        }
    }
    for (int i = 0; i < enemX.Count; i++) {
        if (enemTipo[i] == "rapido") enemY[i] += 2;
        if (enemX[i] == jx && enemY[i] == jy) {
            vidas--;
            File.WriteAllText("puntaje.txt", puntos.ToString());
        }
    }
    Thread.Sleep(50);
}` }], marca: [
          { l: [3, 4, 5], t: '<b>Teclado.</b>&nbsp;Leer la entrada.' },
          { l: [7], t: '<b>Sonido.</b>&nbsp;En medio de la lógica de disparo.' },
          { l: [11], t: '<b>Reglas de movimiento.</b>&nbsp;Con un <code>if</code> por tipo de bicho.' },
          { l: [12, 13], t: '<b>Colisiones y vidas.</b>' },
          { l: [14], t: '<b>Disco.</b>&nbsp;Guardar un archivo en pleno frame.' },
          { l: [17], t: '<b>El ritmo del juego.</b>&nbsp;La velocidad depende de este número.' }
        ] }],
        nota: 'Que respondan primero. Luego recorre las seis marcas con la flecha. La del disco vuelve en la semana 5 (tirones) y en la 7 (no se puede probar).' },

      { kind: 'analogia', title: 'El juego late',
        lead: 'Un juego no espera a que hagas clic. Repite los mismos tres pasos decenas de veces por segundo.',
        izq: 60,
        left: [{ fig: 'latido' }],
        right: [
          { mapa: [['El mesero toma el pedido', 'Entrada'], ['La cocina prepara', 'Actualizar'], ['Se sirve el plato', 'Dibujar']], de: 'Restaurante', a: 'Game loop' },
          { clave: 'Servir no cambia la receta: dibujar nunca modifica el estado.', paso: true }
        ],
        nota: 'Conecta con love.update y love.draw del curso anterior: ya lo usaron, ahora le ponemos nombre y reglas. Usa «Un paso» para ir despacio.' },

      { kind: 'codigo', title: 'El mismo latido en tres mundos',
        izq: 34,
        left: [
          { ul: ['En <b>C# puro</b> el bucle lo escribes tú.', 'En <b>Unity</b> y <b>LÖVE</b> ya existe: tú llenas los huecos.', 'En los tres, el movimiento se multiplica por <code>dt</code>.'], pasos: true }
        ],
        right: [{ code: [
          { lang: 'C#', src: `while (jugando)
{
    double ahora = reloj.Elapsed.TotalSeconds;
    float dt = (float)(ahora - anterior);
    anterior = ahora;

    ProcesarEntrada();   // 1. ¿qué quiere el jugador?
    Actualizar(dt);      // 2. el mundo avanza dt segundos
    Dibujar();           // 3. mostramos el resultado
}

void Actualizar(float dt) { x += Velocidad * dt; }` },
          { lang: 'Unity', src: `public class Nave : MonoBehaviour
{
    [SerializeField] float velocidad = 5f;

    void Update()        // Unity llama esto una vez por frame
    {
        float dir = Input.GetAxisRaw("Horizontal");     // 1
        transform.Translate(
            dir * velocidad * Time.deltaTime, 0f, 0f);  // 2
    }                    // 3. dibujar: lo hace el motor
}` },
          { lang: 'Lua', label: 'Lua (LÖVE)', src: `local x, velocidad = 0, 120

function love.update(dt)          -- 1 y 2
    if love.keyboard.isDown("right") then
        x = x + velocidad * dt
    end
end

function love.draw()              -- 3
    love.graphics.rectangle("fill", x, 100, 32, 32)
end` }
        ], marca: [
          { l: [3, 4, 5], t: '<b>dt</b>&nbsp;es cuánto duró el frame anterior, en segundos.' },
          { l: [7, 8, 9], t: 'Los tres pasos, siempre en este orden.' },
          { l: [12], t: 'Velocidad por tiempo: avanza lo mismo en cualquier computador.' }
        ] }],
        nota: 'Recorre las marcas en C# y luego cambia de pestaña: pide que ubiquen entrada, actualización y dibujo en Unity y en Lua. El código completo está en la página de la clase.' },

      { kind: 'antipatron', title: 'Dibujar que mueve cosas',
        lead: 'Si el movimiento vive en el dibujo, el juego corre más rápido en la pantalla que más cuadros pinta.',
        top: true,
        full: [{ compare: { a: { label: 'Mover dentro del dibujo', lang: 'C#', src: malDibujo }, b: { label: 'Actualizar cambia, dibujar mira', lang: 'C#', src: bienDibujo } } }],
        nota: 'Pregunta antes de mostrar la versión buena: ¿qué pasa si el dibujo se llama 144 veces por segundo? Un minuto.' },

      { kind: 'reto', title: 'Predice: 30 fps contra 120 fps',
        lead: 'Una nave se mueve con esta línea dentro del bucle. Tu amigo juega a 30 fps y tú a 120.',
        izq: 40,
        left: [{ code: [{ lang: 'C#', src: 'x += 5;   // 5 píxeles por frame' }] }, { big: 'Después de un segundo, ¿qué pasa?' }],
        right: [{ check: { q: '', opts: ['Las dos naves avanzan lo mismo', 'Tu nave avanza 4 veces más: 600 px contra 150 px', 'La de tu amigo avanza más', 'Depende del monitor'], ok: 1, why: '5 px × 120 frames = 600. 5 px × 30 frames = 150. La velocidad quedó amarrada al computador. La solución: multiplicar por dt.' } }],
        nota: 'Es el bug clásico de los juegos viejos que corren aceleradísimos en máquinas modernas.' },

      { kind: 'demo', title: 'Píxeles por frame contra píxeles por segundo',
        lead: 'Mueve los fps. La amarilla usa <code>x += 5</code>. La blanca usa <code>x += 300 * dt</code>.',
        top: true,
        full: [{ fig: 'gameloop' }, { clave: 'La blanca recorre lo mismo a 15 fps que a 144. Todo movimiento se multiplica por dt.', paso: true }],
        nota: 'Baja a 15 fps y sube a 144. Pregunta: ¿cuál de las dos es justa en un juego competitivo?' },

      { kind: 'industria', title: 'En juegos reales: el reloj del juego',
        lead: 'Amarrar el juego a la velocidad de la máquina es un error tan viejo como los videojuegos.',
        full: [
          { juegos: [
            { j: 'Space Invaders (1978)', t: 'Los invasores aceleran al quedar pocos porque el hardware tarda menos en dibujarlos. Fue un accidente que se volvió mecánica.', src: 'Tomohiro Nishikado, entrevistas sobre el desarrollo' },
            { j: 'Doom (1993)', t: 'La simulación avanza a 35 «tics» fijos por segundo, sin importar cuántos cuadros dibuje el PC.', src: 'Código fuente publicado por id Software (1997): TICRATE = 35' },
            { j: 'Unity', t: 'Update corre una vez por cuadro con Time.deltaTime; FixedUpdate corre a paso fijo (0,02 s) para la física.', src: 'Manual de Unity: Order of execution for event functions' }
          ], pasos: true },
          { clave: 'Velocidad por dt en lo visual; paso fijo en la física y en todo lo que deba repetirse igual.', paso: true }
        ],
        nota: 'Cuenta la historia de Space Invaders: el «bug» se volvió la curva de dificultad. Pregunta: ¿por qué un juego de red o con repeticiones necesita paso fijo? Respuesta esperada: para que dos máquinas calculen exactamente lo mismo. 3 minutos.' },

      { kind: 'analogia', title: 'Paso fijo: el vaso y los tragos',
        lead: 'El tiempo real llega en chorros irregulares. La física lo quiere en tragos iguales.',
        izq: 50,
        left: [{ fig: 'vaso' }],
        right: [{ code: [
          { lang: 'C#', src: `const float Paso = 1f / 60f;
float acumulado = 0f;

while (jugando)
{
    acumulado += MedirTiempoDelFrame();
    ProcesarEntrada();

    while (acumulado >= Paso)
    {
        ActualizarFisica(Paso);
        acumulado -= Paso;
    }
    Dibujar();
}` },
          { lang: 'Unity', src: `void Update()        // ritmo variable: entrada
{
    direccion = Input.GetAxisRaw("Horizontal");
}

void FixedUpdate()   // ritmo fijo: física
{
    rb.linearVelocity =
        new Vector2(direccion * 6f, rb.linearVelocity.y);
}` }
        ], marca: [
          { l: [6], t: 'Cada frame echa su tiempo al vaso.' },
          { l: [9, 10, 11, 12, 13], t: 'Mientras haya un trago completo, la física da un paso.' }
        ] }],
        nota: 'No hace falta dominarlo hoy. Presiona «Tirón» para que vean varios pasos de física en un solo frame. En Unity eso es Update contra FixedUpdate.' },

      { kind: 'idea', title: 'Un motor es un edificio por pisos',
        izq: 60,
        left: [{ fig: 'capas' }],
        right: [
          { clave: 'Cada piso se apoya en los de abajo y no sabe nada de los de arriba.' },
          { p: 'Unity y Unreal te regalan los pisos 1 a 5. Este curso trata de construir bien el piso 6.', paso: true }
        ],
        nota: 'Simplificación de la figura de capas de Gregory (cap. 1). Pide a dos estudiantes que propongan un par de pisos y predigan el veredicto antes de tocar.' },

      { kind: 'reto', title: '¿Quién puede llamar a quién?',
        izq: 44,
        left: [{ panel: ['«Que el sistema de render revise si el enemigo está muerto y le sume los puntos al jugador.»'], h: 'Alguien propone' }],
        right: [{ check: { q: '¿Qué regla rompe?', opts: ['Ninguna, es eficiente', 'Usa demasiada memoria', 'El render no puede leer datos', 'Un piso de abajo decide cosas de un piso de arriba'], ok: 3, why: 'El render dibuja lo que le dicen. Si decide puntajes, ya no puedes cambiar las reglas sin tocar el render ni reutilizarlo en otro juego.' } }],
        nota: 'Conecta con la regla del loop: dibujar no cambia estado.' },

      { kind: 'actividad', title: 'Caza de olores · 15 minutos',
        lead: 'En parejas, abran <code>Program.cs</code> de Turno Nocturno.',
        izq: 56,
        left: [{ ol: ['Encuentren <b>tres</b> lugares que harían difícil agregar un bicho que vuela en zigzag.', 'Para cada uno: línea, qué mezcla y qué se podría romper.', 'Elijan el peor y cuéntenlo en 30 segundos.'] }],
        right: [{ panel: [{ ul: ['Busquen <code>if (enemTipo[i] == ...</code>', 'Variables <code>static</code> que todos tocan', 'Cualquier cosa que no sea juego dentro del bucle'] }], h: 'Pistas' }],
        nota: 'Salas de 2 o 3. Al volver, 30 segundos por pareja. Anota los olores en una lista compartida: es el insumo del ACA 1.' },

      { kind: 'cierre', title: 'Lo que te llevas hoy',
        full: [
          { ol: ['<b>Arquitectura es el costo de cambiar.</b> No se ve, se siente.', '<b>El juego late:</b> entrada, actualización, dibujo. Todo movimiento se multiplica por <code>dt</code>.', '<b>El motor es un edificio:</b> los pisos de abajo no conocen a los de arriba.'], pasos: true },
          { p: 'Ahora: <a href="quiz.html?s=1">quiz de la clase</a>. Para el jueves: corre Turno Nocturno y trae tres olores anotados. La próxima semana hay quiz-parcial del Corte I (30 %).', paso: true }
        ],
        nota: 'Recuerda el parcial de la semana 2: el banco de preguntas son los quices de las clases 1 y 2.' }
    ],

    quiz: [
      { tema: 'Arquitectura', q: '¿Cuál es la mejor señal de que un juego tiene buena arquitectura?', opts: ['Agregar o cambiar una función toca pocos archivos y no rompe otras', 'Corre a 60 fps', 'Usa muchos patrones de diseño', 'Tiene pocas líneas de código'], ok: 0, why: 'La arquitectura se mide por el costo del cambio. Los fps son desempeño; los patrones son herramientas, no la meta.' },
      { tema: 'Game loop', q: '¿En qué orden trabaja un game loop clásico?', opts: ['Dibujar, entrada, actualizar', 'Actualizar, dibujar, entrada', 'Entrada, actualizar, dibujar', 'Entrada, dibujar, actualizar'], ok: 2, why: 'Primero se lee qué quiere el jugador, luego avanza el mundo y al final se muestra el resultado.' },
      { tema: 'Delta time', q: 'Una nave debe moverse a 200 unidades por segundo en cualquier computador. ¿Qué línea es correcta?', opts: ['<code>x += 200;</code>', '<code>x += 200 / dt;</code>', '<code>x += 200 * fps;</code>', '<code>x += 200 * dt;</code>'], ok: 3, why: 'Velocidad por tiempo es distancia. Con dt en segundos, sumar 200 × dt cada frame da 200 unidades por segundo sin importar los fps.' },
      { tema: 'Game loop', q: '¿Qué NO debería pasar dentro de la función de dibujo?', opts: ['Leer la posición del jugador', 'Restarle vida al jugador', 'Pintar el fondo', 'Dibujar el puntaje'], ok: 1, why: 'Dibujar solo lee el estado. Si lo modifica, el juego se comporta distinto según cuántos frames se dibujen.' },
      { tema: 'Capas', q: 'En un motor por capas, ¿cuál dependencia es incorrecta?', opts: ['El juego usa el sistema de física', 'La física usa la librería de matemáticas', 'La librería de matemáticas consulta el puntaje del jugador', 'El audio usa el sistema de recursos'], ok: 2, why: 'Las capas de abajo no conocen a las de arriba. Las matemáticas no pueden saber que existe un puntaje.' },
      { tema: 'Paso fijo', q: '¿Para qué sirve actualizar la física con un paso fijo?', opts: ['Para que la simulación dé el mismo resultado sin importar los fps', 'Para que el juego se vea más bonito', 'Para usar menos memoria', 'Para no tener que dibujar'], ok: 0, why: 'Con pasos del mismo tamaño la física es estable y repetible. En Unity eso es FixedUpdate.' },
      { tema: 'Arquitectura', q: 'El equipo A y el equipo B tienen juegos idénticos en pantalla. Agregar un enemigo tarda una hora en A y dos semanas en B. ¿Qué es lo más probable?', opts: ['B usa un motor más lento', 'En B las piezas están tan conectadas que cambiar una obliga a revisar muchas otras', 'B tiene peores artistas', 'A escribió más líneas de código'], ok: 1, why: 'La diferencia no está en lo que se ve sino en cómo están divididas y conectadas las piezas: eso es arquitectura.' },
      { tema: 'Delta time', q: 'Con <code>x += 5</code> por cuadro, ¿cuántos píxeles avanza la nave en un segundo a 60 fps y a 144 fps?', opts: ['5 y 5', '60 y 144', '300 y 720', '300 y 300'], ok: 2, why: '5 × 60 = 300 y 5 × 144 = 720. Sin dt la velocidad depende de los fps del computador.' },
      { tema: 'Unity', q: 'En Unity, ¿dónde va el código que aplica fuerzas a un Rigidbody?', opts: ['En FixedUpdate, que corre a paso fijo', 'En Update, porque corre más seguido', 'En Start, una sola vez', 'En OnGUI'], ok: 0, why: 'La física de Unity avanza en pasos fijos; aplicar fuerzas en FixedUpdate mantiene el resultado estable. La entrada se lee en Update.' },
      { tema: 'Olores', q: 'Dentro del código de colisiones aparece <code>File.WriteAllText("puntaje.txt", ...)</code>. ¿Cuál es el problema de arquitectura?', opts: ['Ninguno', 'El archivo debería ser .json', 'Falta un comentario', 'Mezcla reglas del juego con acceso a disco: es lento en pleno frame y no se puede probar la colisión sin tocar archivos'], ok: 3, why: 'Dos responsabilidades en un mismo lugar. Además el disco es lento: guardar en medio del frame produce tirones.' }
    ]
  };
})();
