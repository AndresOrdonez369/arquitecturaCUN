(function () {
  const raizCS = `// LISTA DE CHEQUEO DE ARQUITECTURA (una pregunta por semana del curso)
// 1. ¿El movimiento usa dt y la simulación avanza con paso fijo?
// 2. ¿Puedo cambiar una pieza sin abrir las demás? ¿Compongo en vez de heredar?
// 3. ¿Los estados son una máquina y las acciones son comandos, no bools sueltos?
// 4. ¿Agregar un enemigo es agregar DATOS, sin tocar código que ya funciona?
// 5. ¿Medí antes de optimizar? ¿Reutilizo objetos en vez de crearlos por frame?
// 6. ¿Todas las flechas apuntan al núcleo? ¿Cero ciclos entre módulos?
// 7. ¿Las reglas tienen pruebas y puedo repetir una partida con su semilla?
// 8. ¿Puedo defender cada decisión delante de mi equipo, con una cifra?

// Program.cs de Turno Nocturno, ya rescatado. De 232 líneas a estas.
// Composición raíz: el ÚNICO lugar que conoce todas las piezas y las conecta.
var bus      = new BusDeEventos();
var azar     = new AzarConSemilla(Environment.TickCount);   // la semilla se registra
var catalogo = CatalogoDeBichos.Cargar("datos/bichos.json");
var partida  = new Partida(new AudioConsola(), azar, bus, catalogo);

var guardado = new GuardadoEnArchivo(bus, "puntaje.txt");    // oye PartidaTermino
var pantalla = new PantallaConsola();
var teclado  = new TecladoConsola();
var reloj    = new RelojDeSistema();

const float Paso = 1f / 60f;
float acumulado = 0f;
while (!partida.Terminada)
{
    acumulado += reloj.SegundosDesdeElUltimoFrame();
    foreach (var comando in teclado.Comandos()) comando.Ejecutar(partida);
    while (acumulado >= Paso) { partida.Avanzar(Paso); acumulado -= Paso; }
    pantalla.Dibujar(partida);                               // solo lee, no cambia nada
}`;
  const raizUnity = `using UnityEngine;

// Composición raíz en Unity: un solo objeto en la escena arma el juego.
// Las 8 preguntas de la lista de chequeo son las mismas; cambia el aparato.
[DefaultExecutionOrder(-100)]                    // corre antes que los demás scripts
public class Arranque : MonoBehaviour
{
    [SerializeField] CatalogoDeBichosSO catalogo;   // ScriptableObject (semana 4)
    [SerializeField] AudioUnity audioUnity;         // adaptador de IAudio (semana 6)
    [SerializeField] VistaDePartida vista;          // dibuja; no decide nada
    [SerializeField] int semilla = 1234;            // se muestra en pantalla al perder

    Partida partida;                                // el núcleo: C# puro, sin UnityEngine

    void Awake()
    {
        var bus  = new BusDeEventos();
        var azar = new AzarConSemilla(semilla);
        partida  = new Partida(audioUnity, azar, bus, catalogo.ComoDatos());
        vista.Conectar(partida, bus);
    }

    void FixedUpdate()                              // paso fijo: lo pone Unity
    {
        if (!partida.Terminada) partida.Avanzar(Time.fixedDeltaTime);
    }
}`;

  // ---- versiones cortas para las slides
  const raizCorto = `var bus      = new BusDeEventos();
var azar     = new AzarConSemilla(Environment.TickCount);
var catalogo = CatalogoDeBichos.Cargar("datos/bichos.json");
var audio    = new AudioConsola();
var partida  = new Partida(audio, azar, bus, catalogo);
var guardado = new GuardadoEnArchivo(bus, "puntaje.txt");
var pantalla = new PantallaConsola();
var teclado  = new TecladoConsola();
var reloj    = new RelojDeSistema();
const float Paso = 1f / 60f; float acumulado = 0f;
while (!partida.Terminada)
{
    acumulado += reloj.SegundosDesdeElUltimoFrame();
    foreach (var c in teclado.Comandos()) c.Ejecutar(partida);
    while (acumulado >= Paso)
        { partida.Avanzar(Paso); acumulado -= Paso; }
    pantalla.Dibujar(partida);
}`;
  const raizUnityCorto = `[DefaultExecutionOrder(-100)]          // antes que los demás
public class Arranque : MonoBehaviour
{
    [SerializeField] CatalogoDeBichosSO catalogo;
    [SerializeField] AudioUnity audioUnity; // adaptador IAudio
    [SerializeField] VistaDePartida vista;  // dibuja, no decide
    [SerializeField] int semilla = 1234;
    Partida partida;                          // C# puro
    void Awake()
    {
        var bus = new BusDeEventos();
        partida = new Partida(audioUnity,
        new AzarConSemilla(semilla), bus, catalogo.ComoDatos());
        vista.Conectar(partida, bus);
    }
    void FixedUpdate() =>
        partida.Avanzar(Time.fixedDeltaTime);
}`;

  // ---- repaso por fases
  const composicionCS = `// Cada capacidad es una pieza. El bicho las junta.
interface IHabilidad { void Actuar(Bicho b, float dt); }

class Bicho
{
    readonly List<IHabilidad> partes = new();
    public float X, Y;
    public Bicho Con(IHabilidad h)
        { partes.Add(h); return this; }
    public void Avanzar(float dt)
        { foreach (var p in partes) p.Actuar(this, dt); }
}

class Volar : IHabilidad        // sube 2 por segundo
    { public void Actuar(Bicho b, float dt) => b.Y -= 2f * dt; }

// Uso: new Bicho().Con(new Volar()).Con(new Disparar());`;
  const composicionUnity = `using UnityEngine;

// En Unity el GameObject ya es composición:
// bicho raro = GameObject + Volar + Disparar + Dividirse
public class Volar : MonoBehaviour
{
    [SerializeField] float velocidad = 2f;   // dato, no código

    void Update()
    {
        var paso = velocidad * Time.deltaTime;  // dt: semana 1
        transform.Translate(Vector3.up * paso);
    }
}`;
  const poolCS = `public class Pool<T> where T : new()
{
    readonly Stack<T> libres = new();
    readonly Action<T> limpiar;
    public Pool(Action<T> limpiar) => this.limpiar = limpiar;

    // Reutiliza si hay; crea solo si la pila está vacía
    public T Pedir() =>
        libres.Count > 0 ? libres.Pop() : new T();

    public void Devolver(T obj)
    {
        limpiar(obj);          // borra el estado viejo
        libres.Push(obj);
    }
}
// Uso: var chispas = new Pool<Chispa>(c => c.Reiniciar());`;
  const puertoCS = `// Núcleo: declara el enchufe. No sabe de consola ni de Unity.
public interface IAudio { void Sonar(string nombre); }

public class Partida
{
    readonly IAudio audio;
    public Partida(IAudio audio) { this.audio = audio; }
    public int Puntos { get; private set; }

    public void BichoEliminado(int valor)
    {
        Puntos += valor;
        audio.Sonar("bicho_muere");
    }
}
// Afuera: el aparato. La flecha apunta hacia el núcleo.
public class AudioConsola : IAudio
    { public void Sonar(string nombre) => Console.Beep(); }`;
  const pruebaCS = `public class PruebasDePartida
{
    [Fact]
    public void BichoEliminado_SumaPuntosYSuenaUnaVez()
    {
        // Preparar: el núcleo con un audio de mentiras
        var espia = new AudioEspia();
        var partida = new Partida(espia);

        // Actuar: una sola cosa
        partida.BichoEliminado(valor: 10);

        // Afirmar: lo esperado contra lo obtenido
        Assert.Equal(10, partida.Puntos);
        Assert.Equal(1, espia.Llamadas);
    }
}`;

  // ---- cuándo NO usar un patrón
  const sobreCS = `interface IBicho { void Avanzar(float dt); }
interface IFabricaDeBichos { IBicho Crear(string t); }

class FabricaDeBichos : IFabricaDeBichos
{
    public IBicho Crear(string t) => t switch
    {
        "basico" => new BichoBasico(),
        _ => throw new ArgumentException(t)
    };
}

class BichoBasico : IBicho
{
    public float Y;
    public void Avanzar(float dt) => Y += 2f * dt;
}
// Uso: Servicios.Get<IFabricaDeBichos>().Crear("basico");`;
  const justoCS = `class Bicho
{
    public float Y;
    public float Velocidad = 2f;
    public void Avanzar(float dt) => Y += Velocidad * dt;
}

// Uso: var b = new Bicho();

// ¿Llega un segundo tipo con otro movimiento?
// Ahí sí: Strategy para el movimiento.
// ¿Llegan doce? Datos en JSON y una Factory.
// El cambio sale barato porque Bicho es pequeño
// y nadie más conoce sus tripas.`;

  window.CLASE = {
    n: 8,
    titulo: 'Socialización y cierre',
    objetivos: [
      'Repasar el curso en cuatro fases y comprobar con una pregunta por fase qué quedó firme.',
      'Presentar en 5 minutos las decisiones de arquitectura de tu rescate y sostenerlas con una cifra medida.',
      'Hacer un post-mortem sin culpables: qué salió bien, qué salió mal y qué regla te llevas.',
      'Distinguir cuándo un patrón paga y cuándo es sobreingeniería, y llevar la lista de chequeo a tu proyecto de grado.'
    ],
    analogia: 'Los buenos jugadores miran la repetición de la partida. No para lamentarse ni para celebrar: para ver con calma qué decisión tomaron en cada momento y cuál repetirían. Hoy miramos la repetición del curso y la de cada rescate.',
    agenda: [
      ['0:00', 'Apertura y mapa del curso'],
      ['0:05', 'Repaso en cuatro fases, con una pregunta por fase'],
      ['0:17', 'Cómo presentar: la demo de 5 minutos y un ejemplo'],
      ['0:22', 'Demos de los equipos: 5 minutos cada uno, más 2 de retroalimentación'],
      ['1:17', 'Post-mortem por equipos y puesta en común'],
      ['1:30', 'Casos reales y cuándo no usar un patrón'],
      ['1:40', 'El rescate final y la lista de chequeo para tu proyecto de grado'],
      ['1:45', 'El quiz de conceptos previos, otra vez'],
      ['1:53', 'Auto y coevaluación, qué sigue y cierre']
    ],
    conceptos: [
      { t: 'Costo del cambio', d: 'La arquitectura se mide por lo que cuesta cambiar algo sin romper otra cosa. No por los fps ni por la cantidad de patrones.', ej: 'En el Turno Nocturno original, un bicho nuevo tocaba cuatro lugares del Program.cs. Tras el rescate, es una fila en <code>bichos.json</code>.' },
      { t: 'Acoplamiento y cohesión', d: 'Acoplamiento: cuánto sabe una pieza de otra. Cohesión: qué tan relacionadas están las cosas dentro de una pieza. Se busca poco de lo primero y mucho de lo segundo.', ej: 'Un <code>Bicho</code> que llama al HUD, al audio y a los logros está acoplado a tres sistemas. Si solo avisa <code>BichoMurio</code>, no sabe quién escucha.' },
      { t: 'Composición sobre herencia', d: 'Armar objetos con piezas que se combinan («tiene un») en lugar de ramas de herencia («es un») para cada combinación.', ej: 'Un bicho que vuela, dispara y se divide es un GameObject con tres componentes, no la clase <code>BichoVoladorQueDisparaYSeDivide</code>.' },
      { t: 'State, Observer y Command', d: 'State: un solo estado activo con transiciones explícitas. Observer: quien emite no conoce a quien escucha. Command: una acción convertida en objeto.', ej: 'Pausa y Game Over ya no se pisan (State), el puntaje oye la muerte del bicho (Observer) y la partida se graba y se repite (Command).' },
      { t: 'Diseño dirigido por datos', d: 'Lo que cambia a diario (balance, contenido, oleadas) vive fuera del código: JSON, Lua o ScriptableObject. Una Factory lo convierte en objetos.', ej: 'La diseñadora prueba veinte valores de vida del tanque en una tarde, sin recompilar ni pedirle nada a un programador.' },
      { t: 'Medir, luego Object Pool', d: 'Los tirones suelen venir de crear y botar objetos por frame. Primero se mide con el Profiler; si la basura es la causa, se reutilizan objetos.', ej: 'Las chispas se piden y se devuelven a un pool. Antes y después se mira la columna de memoria asignada por frame en el Profiler.' },
      { t: 'Dependencias hacia el núcleo', d: 'Las reglas del juego no dependen de la consola, del disco ni del motor. Declaran interfaces (puertos) y los detalles las implementan afuera.', ej: '<code>Partida</code> recibe un <code>IAudio</code>. La consola, Unity y las pruebas le enchufan aparatos distintos sin tocar las reglas.' },
      { t: 'Pruebas y determinismo', d: 'Una prueba unitaria comprueba una regla sin pantalla ni disco. Con semilla, paso fijo y comandos grabados, una partida se repite idéntica.', ej: 'El bug de una de cada veinte partidas se reproduce con su semilla, se atrapa con una prueba en rojo y queda protegido cuando pasa a verde.' }
    ],
    industria: [
      { j: 'Game Developer (antes Gamasutra)', t: 'Su sección de post-mortems, que viene de la revista impresa Game Developer, organiza cada proyecto en dos listas: lo que salió bien («What Went Right») y lo que salió mal («What Went Wrong»). Equipos reales, por escrito.', src: 'Archivo de post-mortems en gamedeveloper.com; columna Postmortem de la revista Game Developer' },
      { j: 'GDC Vault', t: 'La Game Developers Conference publica charlas de post-mortem, entre ellas la serie «Classic Game Postmortem», donde los autores de juegos clásicos repasan decisiones de diseño y de producción.', src: 'gdcvault.com, búsqueda «postmortem» y serie «Classic Game Postmortem»' },
      { j: 'Celeste', t: 'Sus creadores publicaron en GitHub la clase <code>Player</code>: un solo archivo de miles de líneas, organizado alrededor de una máquina de estados (normal, trepar, dash, entre otros). Un juego excelente no exige código «de manual»: exige decisiones que sirvan a su contexto.', src: 'Repositorio NoelFB/Celeste en GitHub (archivo Player.cs)' },
      { j: 'Overwatch', t: 'Blizzard explicó que la jugabilidad de Overwatch usa una arquitectura ECS (entidades, componentes de datos y sistemas) y la presentó junto con su netcode. Es un ejemplo de patrón que paga a gran escala.', src: 'GDC 2017, «Overwatch Gameplay Architecture and Netcode», Timothy Ford (GDC Vault)' },
      { j: 'Retrospectivas ágiles', t: 'Norman Kerth propuso abrir cada retrospectiva con una «directiva primaria»: asumir que cada persona hizo lo mejor que pudo con lo que sabía y tenía. Es la base del post-mortem sin culpables.', src: 'Kerth, N. (2001). Project Retrospectives: A Handbook for Team Reviews. Dorset House' }
    ],
    errores: [
      { mito: 'Más patrones es mejor arquitectura.', real: 'Cada patrón agrega piezas e indirección. Se justifica cuando quita un dolor que ya existe o que viene con seguridad, como el bicho número doce.' },
      { mito: 'Una decisión se defiende con autoridad: «así lo hacen los AAA».', real: 'Se defiende con contexto, razón y cifra: qué dolía, qué cambió y cuánto se midió. Overwatch usa ECS por su escala; Turno Nocturno no la tiene.' },
      { mito: 'Si dejo todo listo para cualquier cambio futuro, me ahorro trabajo.', real: 'YAGNI («no lo vas a necesitar»): muchas abstracciones por si acaso nunca se usan y estorban. Deja el código fácil de cambiar, no preparado para todo.' },
      { mito: 'El post-mortem sirve para encontrar al culpable.', real: 'Se analizan decisiones y procesos, no personas. Donde hay castigo, la gente esconde los errores y el equipo deja de aprender.' },
      { mito: 'Decir qué cambiarías debilita tu presentación.', real: 'Muestra criterio. «Cambiaríamos el bus por llamadas directas en dos módulos, porque medimos que nadie más los escucha» convence más que un rescate perfecto.' }
    ],
    codigoIntro: 'Para cerrar: la lista de chequeo de arquitectura del curso, el Program.cs de Turno Nocturno ya rescatado y un ejemplo de cuándo un patrón sobra. Todo lo que antes vivía en 232 líneas ahora se arma en la composición raíz y vive en otra parte.',
    codigo: [
      { titulo: 'Lista de chequeo y composición raíz', desc: 'El único archivo que conoce todas las piezas: crea el núcleo, le conecta los adaptadores y el bus, y hace latir el bucle. En Unity ese papel lo hace un <code>Arranque</code> en la escena.',
        tabs: [{ lang: 'C#', label: 'Program.cs', src: raizCS }, { lang: 'Unity', label: 'Unity (Arranque.cs)', src: raizUnity }] },
      { titulo: 'Cuándo no usar un patrón', desc: 'El mismo bicho de una game jam, dos veces. A la izquierda, interfaces, fábrica y localizador para un solo tipo. A la derecha, una clase pequeña que se deja cambiar cuando llegue el segundo tipo.',
        tabs: [{ lang: 'C#', label: 'C# (por si acaso)', src: sobreCS }, { lang: 'C#', label: 'C# (lo justo hoy)', src: justoCS }] },
      { titulo: 'El curso en tres piezas de código', desc: 'Composición (semana 2), un pool que no deja basura (semana 5), un puerto hacia el núcleo (semana 6) y la prueba que ese puerto permite (semana 7).',
        tabs: [{ lang: 'C#', label: 'Composición', src: composicionCS }, { lang: 'Unity', label: 'Unity (componente)', src: composicionUnity }, { lang: 'C#', label: 'Pool', src: poolCS }, { lang: 'C#', label: 'Puerto IAudio', src: puertoCS }, { lang: 'C#', label: 'Prueba xUnit', src: pruebaCS }] }
    ],
    tarea: [
      'Si no lo hiciste en clase, diligencia hoy la autoevaluación y la coevaluación (4 % + 4 %).',
      'Repite el <a href="quiz.html?s=diag">quiz de conceptos previos</a> y compara tu resultado con el de la semana 1.',
      'Escribe el post-mortem de tu equipo en una página: tres cosas que salieron bien, tres que salieron mal y tres reglas.',
      'Guarda la lista de chequeo de 8 preguntas: úsala en la primera reunión técnica de tu proyecto de grado.',
      'Deja tu rescate de Turno Nocturno en un repositorio con un README que cuente problema, decisión y cifra. Es una buena pieza de portafolio.'
    ],
    lecturas: [
      'Nystrom, R. (2014). <i>Game Programming Patterns</i>. Genever Benning. Gratis en gameprogrammingpatterns.com. Léelo completo: ya conoces la mitad.',
      'Gregory, J. (2018). <i>Game Engine Architecture</i> (3.ª ed.). CRC Press. El libro de consulta para bajar a los pisos del motor.',
      'Unity Technologies. <i>Create modular game architecture in Unity with ScriptableObjects</i> (libro electrónico gratuito).',
      'Los post-mortems de Game Developer (gamedeveloper.com) y las charlas de GDC Vault: equipos reales contando qué salió bien y qué salió mal.',
      'Fowler, M. «Yagni» y «DesignStaminaHypothesis», artículos cortos en martinfowler.com sobre cuándo vale la pena invertir en diseño.',
      'Derby, E. y Larsen, D. (2006). <i>Agile Retrospectives: Making Good Teams Great</i>. Pragmatic Bookshelf. Formatos para retrospectivas útiles.'
    ],

    slides: [
      { kind: 'portada', title: 'Socialización y cierre',
        lead: 'Semana 8 · Arquitectura de Videojuegos',
        full: [
          { ul: ['Repaso del curso en cuatro fases, con una pregunta por fase.', 'Cada equipo muestra su rescate de Turno Nocturno.', 'Post-mortem, cuándo no usar un patrón y tu proyecto de grado.'] },
          { pie: 'Hoy no hay teoría nueva: miramos la repetición de la partida · <span class="kbd">N</span> notas del docente' }
        ],
        nota: '3 minutos. Antes de empezar: confirma el orden de los equipos y que todos puedan compartir pantalla. Cuenta los equipos: con más de 8, baja cada demo a 4 minutos (el cronómetro de la slide 7 tiene esa opción). Pregunta de arranque: «¿qué decisión de tu rescate defenderías hoy delante de un líder técnico?». No la respondan todavía: la retomamos en las demos.' },

      { kind: 'reto', title: 'Fase 1 · Fundamentos: semanas 1 y 2',
        lead: 'Arquitectura es lo que cuesta cambiar. Piezas que saben poco unas de otras.',
        izq: 46,
        left: [
          { check: { q: 'Te preguntan si tu rescate quedó bien armado. ¿Qué evidencia responde mejor?', opts: ['Corre a 60 fps en mi computador', 'Usa seis patrones de diseño', 'Antes, un bicho nuevo tocaba cuatro lugares; ahora, una fila de datos', 'Tiene menos líneas que el original'], ok: 2, why: 'La arquitectura se mide por el costo del cambio. Los fps son desempeño, los patrones son herramientas y las líneas no dicen cuánto cuesta cambiar.' } }
        ],
        right: [{ code: [{ lang: 'C#', label: 'C# (composición)', src: composicionCS }, { lang: 'Unity', label: 'Unity (componente)', src: composicionUnity }] }],
        nota: '3 minutos. Que respondan en el chat antes de revelar. Respuesta esperada: la C, porque es una medida del costo del cambio. Si alguien elige la A, pregunta: «¿y si mañana piden un bicho nuevo, los fps te dicen cuánto cuesta?». Señala en el código que <code>Bicho</code> no sabe qué piezas tiene, y en la pestaña Unity que el GameObject ya es composición y que la velocidad usa <code>Time.deltaTime</code>.' },

      { kind: 'reto', title: 'Fase 2 · Patrones: semanas 3 y 4',
        lead: 'Primero el dolor, después la receta. Un patrón sin síntoma es decoración.',
        izq: 44,
        left: [
          { check: { q: 'Un HUD se suscribe en <code>OnEnable</code> con <code>bus.BichoMurio += Pintar;</code>. Al volver al menú, cada bicho que muere lanza <code>MissingReferenceException</code>. ¿Qué falta?', opts: ['Un Singleton para el HUD', 'Desuscribirse en <code>OnDisable</code> con <code>-=</code>', 'Cambiar el evento por un <code>if</code> en Bicho', 'Un Object Pool de HUD'], ok: 1, why: 'El emisor guarda una referencia al oyente. Si el HUD se destruye sin desuscribirse, el evento llama a un objeto que ya no existe. Se suscribe en OnEnable y se desuscribe en OnDisable.' } }
        ],
        right: [
          { tabla: { head: ['Síntoma', 'Receta', 'Sem.'], rows: [['Bools que se pisan: pausa y game over a la vez', 'State', '3'], ['Una clase que llama a cuatro sistemas', 'Observer', '3'], ['Deshacer, repetición o teclas reasignables', 'Command', '3'], ['Un <code>if</code> por tipo de bicho en cuatro lugares', 'Factory y datos', '4'], ['Comportamientos que se intercambian', 'Strategy', '4']] }, pasos: true }
        ],
        nota: '3 minutos. Pregunta primero, tabla después. Respuesta esperada: la B. Es el error más común del ACA 2 con Observer: suscribir y olvidar desuscribir. Luego revela la tabla fila por fila y pide a alguien que diga el síntoma antes de que aparezca la receta. Remata: si no ves el síntoma en tu código, no necesitas el patrón.' },

      { kind: 'reto', title: 'Fase 3 · Rendimiento y escala: semanas 5 y 6',
        lead: 'Medir antes de optimizar. Las flechas apuntan hacia las reglas.',
        izq: 44,
        left: [
          { check: { q: 'Pusiste un Object Pool a los bichos y el tirón sigue igual. ¿Qué paso del método te saltaste?', opts: ['Medir antes con el Profiler: el pico podía venir de otra parte', 'Usar un ECS', 'Hacer el pool más grande', 'Pasar el pool a C++'], ok: 0, why: 'Sin medir, el pool es una apuesta. El Profiler dice dónde se va el tiempo o la memoria, por ejemplo un texto del HUD que se arma en cada frame, y después confirma si la mejora existe.' } }
        ],
        right: [{ code: [{ lang: 'C#', label: 'Pool (semana 5)', src: poolCS }, { lang: 'C#', label: 'Puerto IAudio (semana 6)', src: puertoCS }], marca: [
          { l: [7, 8, 9], t: 'Pedir reutiliza. Solo crea cuando no queda ninguno libre: cero basura en el ciclo normal.' },
          { l: [11, 12, 13, 14, 15], t: 'Devolver limpia el estado. Si no, la chispa reaparece con la posición y la vida de antes.' }
        ] }],
        nota: '3 minutos. Respuesta esperada: la A. Cuenta la anécdota típica: un equipo optimizó el dibujo y el tirón era un string del HUD armado en cada frame. Recorre las dos marcas del pool. Luego abre la pestaña del puerto: <code>Partida</code> recibe un <code>IAudio</code>, y eso es lo que permite la prueba de la siguiente slide. Pregunta: ¿hacia dónde apunta la flecha entre AudioConsola y Partida? Hacia el núcleo.' },

      { kind: 'reto', title: 'Fase 4 · Calidad: semana 7',
        lead: 'Lo que se deja probar está bien armado. Depurar es un método.',
        izq: 44,
        left: [
          { check: { q: 'Arreglaste el bug del puntaje doble. ¿Cómo te aseguras de que no vuelva?', opts: ['Lo anotas en el README', 'Juegas tres partidas completas antes de cada entrega', 'Le pones un comentario <code>// TODO</code> al método', 'Escribes una prueba que reproduce el bug: la ves en rojo, arreglas y la ves en verde'], ok: 3, why: 'Una prueba que primero falla demuestra que atrapa el bug. Después corre en cada cambio, en milisegundos. Jugar a mano no se sostiene y un comentario no avisa nada.' } }
        ],
        right: [{ code: [{ lang: 'C#', label: 'xUnit', src: pruebaCS }], marca: [
          { l: [6, 7, 8], t: 'Preparar: Partida acepta un espía porque recibe un IAudio (fase 3).' },
          { l: [10, 11], t: 'Actuar: una sola cosa. Si falla, sabes cuál fue.' },
          { l: [13, 14, 15], t: 'Afirmar: suma 10 y suena una vez, sin parlantes ni consola.' }
        ] }],
        nota: '3 minutos. Respuesta esperada: la D. Pregunta de seguimiento: ¿por qué hay que verla en rojo primero? Porque una prueba que nunca falló puede no estar probando nada. Recorre las marcas y conecta con la fase 3: esta prueba existe porque el núcleo no depende de la consola. Cierra el repaso: las cuatro fases son una sola idea vista desde cuatro lados.' },

      { kind: 'idea', title: 'Tu demo: cinco minutos, cinco paradas',
        lead: 'Problema, antes, decisión, después con cifra y qué cambiarías.',
        izq: 62,
        left: [{ fig: 'demoReloj' }],
        right: [
          { h: 'Mientras otro equipo presenta' },
          { ul: ['<b>Estrella 1:</b> algo concreto que hicieron bien.', '<b>Estrella 2:</b> otra, de un tema distinto.', '<b>Un deseo:</b> una mejora, dicha como pregunta.'], pasos: true },
          { clave: 'Sin cifra no hay «después».', paso: true }
        ],
        nota: '3 minutos para explicar; luego vuelve a esta slide y úsala como cronómetro durante las demos (botón Iniciar, opción 4 minutos si hay más de 8 equipos). Dos estrellas y un deseo van al chat. «Me gustó» no cuenta; «agregar un bicho es una fila de JSON» sí. Un deseo bien dicho: «¿qué pasaría si el audio escuchara el bus?». Si un equipo no tiene cifra, pregunta cuál habría medido y cómo. Se critica el código, no a la persona.' },

      { kind: 'demo', title: 'Así se cuenta un rescate',
        lead: 'Un dibujo de antes y después, y una cifra. Toca «Agregar un bicho» en cada modo.',
        top: true,
        full: [{ fig: 'antesDespues' }],
        nota: '2 minutos. Es un modelo de presentación, no la respuesta de un equipo: las cifras están rotuladas como ejemplo y cada equipo usa las que midió. Pregunta: ¿cuál de las cuatro cifras convence más a un líder técnico? Respuesta esperada: «bicho nuevo», porque mide directamente el costo del cambio. Después de esta slide arrancan las demos: unos 55 minutos. Tras cada equipo, lee en voz alta una estrella y un deseo del chat.' },

      { kind: 'actividad', title: 'Post-mortem: la repetición de la partida',
        lead: 'Formato de la industria, sin culpables y por escrito. 10 minutos en salas.',
        izq: 40,
        left: [
          { ol: ['<b>Cronología:</b> qué pasó, semana a semana, en hechos.', '<b>Salió bien:</b> tres decisiones que repetirían.', '<b>Salió mal:</b> tres hechos, sin nombres propios.', '<b>Aprendimos:</b> cada lección como regla, con una acción.'], pasos: true }
        ],
        right: [{ fig: 'postmortem' }],
        nota: '13 minutos: 2 para practicar con la figura en grupo, 8 en salas, 3 de puesta en común (un vocero por equipo lee una frase de cada columna). Practica con las dos primeras frases: «Juan nunca hizo nada» se reescribe, «empezamos las pruebas el último día» es un hecho. Lo que más se repite en «salió mal»: pruebas al final y refactorizar todo de un golpe. Kerth llama directiva primaria a asumir que cada quien hizo lo mejor que pudo con lo que sabía. Léela antes de abrir las salas.' },

      { kind: 'industria', title: 'Así lo hacen los equipos reales',
        lead: 'Post-mortems publicados y código de juegos que conoces.',
        top: true,
        full: [
          { juegos: [
            { j: 'Game Developer', t: 'Sus post-mortems, que vienen de la revista impresa, tienen dos listas: lo que salió bien y lo que salió mal. Equipos reales, por escrito.', src: 'Archivo de post-mortems en gamedeveloper.com (antes Gamasutra)' },
            { j: 'Celeste', t: 'Sus creadores publicaron la clase <code>Player</code>: miles de líneas en un archivo, alrededor de una máquina de estados. Excelente juego, código poco «de manual».', src: 'GitHub, repositorio NoelFB/Celeste, Player.cs' },
            { j: 'Overwatch', t: 'Blizzard contó que su jugabilidad usa ECS, presentado junto con su netcode. A esa escala, el patrón paga.', src: 'GDC 2017, «Overwatch Gameplay Architecture and Netcode», Timothy Ford' }
          ], pasos: true },
          { clave: 'Ninguno es «la arquitectura correcta»: cada uno sirve a su contexto.', paso: true }
        ],
        nota: '4 minutos. Pregunta: si Celeste tiene una clase de miles de líneas, ¿por qué no es un Turno Nocturno? Respuesta esperada: porque adentro hay una máquina de estados, el equipo era pequeño y el código sirvió a un solo personaje muy pulido; además, la lista de chequeo no pide clases cortas, pide que el cambio sea barato. Sobre Overwatch: el ECS se justifica por la cantidad de entidades, héroes y reglas de red; en Turno Nocturno sería sobreingeniería. Invita a leer un post-mortem de Game Developer esta semana.' },

      { kind: 'antipatron', title: 'Cuándo NO usar un patrón',
        lead: 'Game jam de 48 horas, un solo tipo de bicho. ¿Cuál defiendes?',
        top: true,
        full: [
          { compare: { a: { label: 'Por si acaso: cuatro piezas para un bicho', lang: 'C#', src: sobreCS }, b: { label: 'Lo justo hoy: una clase que se deja cambiar', lang: 'C#', src: justoCS } } },
          { clave: 'YAGNI («no lo vas a necesitar»): abstrae cuando el cambio llegue, no por si acaso.', paso: true }
        ],
        nota: '3 minutos. Pregunta: ¿cuántos archivos hay que leer para entender cómo se mueve el bicho en cada lado? Izquierda: tres piezas y un localizador; derecha: una línea. Respuesta esperada para la game jam: la derecha. Pero ojo con el extremo contrario: en Turno Nocturno, con doce bichos, la Factory y los datos sí pagaron. La pregunta no es «¿patrón o no?», es «¿qué dolor quita hoy?».' },

      { kind: 'demo', title: 'Cuándo paga una abstracción',
        lead: 'Un patrón cobra entrada al principio y ahorra en cada cambio después.',
        izq: 62,
        left: [{ fig: 'curvaDiseno' }],
        right: [
          { ul: ['<b>YAGNI:</b> no construyas lo que nadie ha pedido.', '<b>Regla de tres:</b> a la tercera repetición, abstrae.', '<b>Pero</b> si ya duele (doce bichos, mods), el patrón paga.'], pasos: true }
        ],
        nota: '3 minutos. Mueve el deslizador desde 2 hasta 20 y toca los tres escenarios. Aclara que las curvas son un modelo ilustrativo, no datos medidos: la idea viene de la «hipótesis de la resistencia del diseño» de Martin Fowler. La regla de tres aparece en el libro <i>Refactoring</i> de Fowler. Pregunta: ¿en qué punto de la curva estaba Turno Nocturno al empezar el curso? Respuesta esperada: a la derecha del cruce, porque ya pedían bichos, oleadas y un port a Unity.' },

      { kind: 'codigo', title: 'Turno Nocturno, rescatado',
        izq: 32,
        left: [
          { big: 'El Program.cs final no sabe de bichos ni de puntajes.' },
          { clave: 'Composición raíz: el único lugar que conoce todas las piezas.', paso: true }
        ],
        right: [{ code: [{ lang: 'C#', label: 'Program.cs', src: raizCorto }, { lang: 'Unity', label: 'Unity (Arranque.cs)', src: raizUnityCorto }], marca: [
          { l: [1, 2, 3, 4, 5, 6, 7, 8, 9], t: 'Crea las piezas y las conecta. Nada más.' },
          { l: [4, 5], t: 'El aparato de audio se enchufa al núcleo (semana 6).' },
          { l: [6], t: 'Guardado oye el bus: la partida no sabe que existe un disco.' },
          { l: [10, 13, 14, 15, 16, 17], t: 'El latido de la semana 1: comandos, paso fijo y un dibujo que solo lee.' }
        ] }],
        nota: '2 minutos. Es una versión posible, no la única: muéstrala después de las demos para no condicionar a los equipos. Compara con el espagueti de la semana 1: mismo juego, mismas reglas, 232 líneas convertidas en piezas. Pregunta: ¿qué cambiarían para una versión sin sonido? Respuesta esperada: una línea, otro adaptador de <code>IAudio</code> que no haga nada. Eso es arquitectura medida por el costo del cambio.' },

      { kind: 'demo', title: 'Ocho preguntas para tu proyecto de grado',
        lead: 'Turno Nocturno era la excusa. Estas preguntas sirven igual en Unity, Unreal o Godot.',
        top: true,
        full: [{ fig: 'checklistArq' }],
        nota: '3 minutos. Que cada uno marque pensando en su proyecto de grado y escriba en el chat la pregunta que hoy responde peor. Respuesta frecuente: la 7 (pruebas) o la 5 (medir). Traducciones: ScriptableObject en Unity, Data Asset en Unreal, Resource en Godot; eventos de C# en Unity, delegados en Unreal, señales en Godot. Las ideas son las mismas, cambian los nombres.' },

      { kind: 'reto', title: 'El mismo quiz de la semana 1',
        lead: 'Mismas preguntas, otra persona respondiendo. No es nota: es tu termómetro.',
        izq: 50,
        left: [
          { mapa: [['3 · Tener un motor', 'S2: bichos con componentes'], ['7 · Máquina de estados', 'S3: pausa sin bools'], ['8 · Valor y referencia', 'S5: el pool y la basura'], ['10 · Reproducir el fallo', 'S7: depurar como detective']], de: 'Pregunta del quiz', a: 'Dónde la usaste', pasos: true }
        ],
        right: [
          { big: '<a href="quiz.html?s=diag">Abrir el quiz de conceptos previos</a>' },
          { check: { q: 'Antes de abrirlo, predice: ¿en qué notarás más tu avance?', opts: ['En que respondo más rápido', 'En que puedo explicar por qué las otras opciones están mal', 'En que me aprendí las respuestas', 'En nada: las preguntas son las mismas'], ok: 1, why: 'Reconocer la opción correcta es el primer nivel. Explicar por qué las demás fallan significa que el concepto ya es tuyo.' } }
        ],
        nota: '8 minutos. Pide que escriban en el chat su puntaje de la semana 1 y el de hoy, sin nombres si prefieren. El mapa muestra dónde se usó cada concepto previo durante el curso. Comenta la pregunta en la que más mejoró el grupo. Si alguien bajó, casi siempre es porque ahora duda con criterio: díselo. Pide que justifiquen en voz alta un distractor: «¿por qué la B de la pregunta 8 está mal?».' },

      { kind: 'idea', title: 'Auto y coevaluación: 4 % + 4 %',
        lead: 'Dos formularios cortos. Solo sirven si son honestos.',
        izq: 38,
        left: [
          { panel: [{ ul: ['¿Qué puedes hacer hoy que no podías en la semana 1?', '¿Cuánto aportaste, con un ejemplo?'] }], h: 'Autoevaluación' },
          { clave: 'Cada nota, con un ejemplo concreto.', paso: true }
        ],
        right: [
          { tabla: { head: ['Coevaluación', 'Nivel bajo', 'Nivel alto'], rows: [['Aporte técnico', 'Poco código, o solo al final', 'Piezas propias que sabe explicar'], ['Cumplimiento', 'Tarde y sin avisar', 'A tiempo, o avisa y renegocia'], ['Comunicación', 'Desaparece días', 'Avisa bloqueos y pide ayuda'], ['Trato', 'Descalifica o impone', 'Critica el código, no a la persona']] }, pasos: true }
        ],
        nota: '4 minutos si la diligencian en clase; si no, queda de tarea para hoy. Comparte los enlaces en el chat. La tabla es un resumen orientativo: si la consigna oficial trae otros criterios, mandan esos. La coevaluación es confidencial y una nota muy alta o muy baja sin justificación se revisa. Quien trabajó solo responde únicamente la autoevaluación, según la consigna.' },

      { kind: 'idea', title: 'Qué sigue: tu proyecto de grado',
        top: true,
        full: [
          { tabla: { head: ['Para', 'Lee o haz'], rows: [['Tu proyecto de grado', 'Primera reunión: las 8 preguntas y un diagrama de módulos'], ['Patrones', 'Nystrom, <i>Game Programming Patterns</i>, gratis en línea'], ['El motor por dentro', 'Gregory, <i>Game Engine Architecture</i>, de consulta'], ['Unity', 'Libro gratuito de Unity sobre arquitectura con ScriptableObjects'], ['Aprender de otros', 'Post-mortems de Game Developer y charlas de GDC Vault']] }, pasos: true },
          { clave: 'El mejor ejercicio: hazle la caza de olores a un proyecto tuyo de hace un año.', paso: true }
        ],
        nota: '3 minutos. Pregunta: ¿quién ya tiene tema de proyecto de grado y en qué motor? Si trabaja en Unreal o Godot, que busque los equivalentes en la documentación oficial: Data Assets y subsistemas, o Resources y señales. Sugiere subir el rescate a un repositorio con un README de problema, decisión y cifra: es portafolio.' },

      { kind: 'cierre', title: 'Lo que te llevas del curso',
        full: [
          { ol: ['<b>La arquitectura se mide por el costo de cambiar.</b>', '<b>Los patrones son herramientas, no medallas.</b> Se usan cuando algo duele.', '<b>Medir y probar es parte de diseñar:</b> una razón y una cifra.'], pasos: true },
          { p: 'Para repasar: <a href="quiz.html?s=8">quiz integrador</a>. Hoy: auto y coevaluación, y el <a href="quiz.html?s=diag">quiz de conceptos previos</a>. Gracias por estas ocho semanas.', paso: true }
        ],
        nota: '2 minutos. Cierra con una ronda de una frase por persona en el chat: «lo que voy a hacer distinto en mi próximo juego es...». Recuerda que auto y coevaluación deben quedar hoy, y que el quiz integrador sirve para repasar antes del proyecto de grado.' }
    ],

    quiz: [
      { tema: 'Semana 1 · Delta time',
        q: 'En un monitor de 144 Hz este bicho baja más del doble de rápido que en uno de 60 Hz. ¿Qué cambio lo corrige?',
        code: { lang: 'Unity', src: 'void Update()\n{\n    // baja 3 unidades en cada frame\n    transform.position += Vector3.down * 3f;\n}' },
        opts: ['Fijar <code>Application.targetFrameRate = 30</code> para todos', 'Mover la línea a <code>LateUpdate</code>', 'Multiplicar por <code>Time.deltaTime</code>, para que sean 3 unidades por segundo', 'Cambiar <code>Vector3.down</code> por <code>-Vector3.up</code>'],
        ok: 2, why: 'Sin dt, el movimiento depende de cuántos frames corren por segundo: 144 contra 60. Con <code>Time.deltaTime</code> son 3 unidades por segundo en cualquier monitor. Fijar los fps esconde el problema, y LateUpdate también corre una vez por frame.' },
      { tema: 'Semana 2 · Acoplamiento',
        q: '¿Cuál es el problema principal de arquitectura en este método?',
        code: { lang: 'Unity', src: 'public class Bicho : MonoBehaviour\n{\n    public void Morir()\n    {\n        GameObject.Find("HUD").GetComponent<Hud>().SumarPuntos(10);\n        GameObject.Find("Sonido").GetComponent<Sonido>().Tocar("muere");\n        GameObject.Find("Logros").GetComponent<Logros>().Contar();\n        Destroy(gameObject);\n    }\n}' },
        opts: ['Que <code>GameObject.Find</code> no compila dentro de un MonoBehaviour', 'Bicho está acoplado a tres sistemas que no son su tarea: cada sistema nuevo obliga a editarlo', 'Que Bicho debería ser un Singleton', 'Que debería heredar: <code>BichoConPuntos : Bicho</code>'],
        ok: 1, why: 'Bicho conoce nombres de objetos de la escena y tres clases ajenas. Con un evento <code>BichoMurio</code>, cada sistema se suscribe y Bicho no cambia cuando llega uno nuevo. <code>Find</code> sí compila; es lento, pero ese es un problema menor.' },
      { tema: 'Semana 3 · State',
        q: 'En Turno Nocturno el jugador pausa justo cuando pierde la última vida, y la pantalla muestra Pausa y Game Over encima. El juego usa <code>bool menu, pausa, gameOver</code>. ¿Qué lo resuelve de raíz?',
        opts: ['Agregar <code>if (pausa && gameOver) pausa = false;</code>', 'Revisar <code>gameOver</code> antes que <code>pausa</code> en el bucle', 'Un Observer que avise cuando cambian las vidas', 'Una máquina de estados: un solo estado activo y transiciones explícitas'],
        ok: 3, why: 'Tres bools permiten ocho combinaciones y solo unas pocas tienen sentido. Un parche de if tapa una combinación y deja las demás. Con State hay un único estado activo y cada estado decide a cuál puede pasar.' },
      { tema: 'Semana 3 · Command',
        q: 'Con este diseño, ¿qué se vuelve fácil sin tocar <code>Partida</code>?',
        code: { lang: 'C#', src: 'public interface IComando\n{\n    void Ejecutar(Partida p);\n    void Deshacer(Partida p);\n}\n\npublic class MoverIzquierda : IComando\n{\n    public void Ejecutar(Partida p) => p.MoverJugador(-1);\n    public void Deshacer(Partida p) => p.MoverJugador(+1);\n}\n\n// en el bucle: historial.Add(c); c.Ejecutar(partida);' },
        opts: ['Grabar la partida, repetirla y deshacer movimientos', 'Reducir la basura por frame', 'Cargar los bichos desde JSON', 'Que el juego corra a más fps'],
        ok: 0, why: 'Cada acción es un objeto: se guarda en una lista (repetición), se recorre al revés llamando a Deshacer y se asocia a cualquier tecla. Command no trata la memoria ni el contenido.' },
      { tema: 'Semana 4 · Factory y datos',
        q: 'Una Factory crea bichos leyendo este archivo y cada <code>cerebro</code> es una Strategy. La diseñadora agrega <code>{ "tipo": "kamikaze", "vida": 1, "velocidad": 4.0, "cerebro": "recto" }</code>. ¿Qué código hay que cambiar?',
        code: { lang: 'JSON', src: '[\n  { "tipo": "basico", "vida": 1, "velocidad": 2.0, "cerebro": "recto" },\n  { "tipo": "tanque", "vida": 3, "velocidad": 1.0, "cerebro": "recto" },\n  { "tipo": "zigzag", "vida": 1, "velocidad": 2.5, "cerebro": "zigzag" }\n]' },
        opts: ['La clase Bicho y la Factory', 'Ninguno: es una fila de datos con un cerebro que ya existe', 'El game loop', 'Todos los if que preguntan por el tipo'],
        ok: 1, why: 'Agregar contenido es agregar datos. Solo haría falta código si pidiera un cerebro nuevo, y sería una Strategy más, sin tocar las que existen.' },
      { tema: 'Semana 5 · Memoria',
        q: 'El Profiler muestra picos del recolector de basura mientras el jugador dispara, y el juego da tirones. Mediste y el pico sale de aquí. ¿Qué haces?',
        code: { lang: 'Unity', src: 'void Update()\n{\n    if (Input.GetKey(KeyCode.Space))\n    {\n        var chispa = Instantiate(prefabChispa, transform.position, Quaternion.identity);\n        Destroy(chispa, 0.5f);\n    }\n}' },
        opts: ['Llamar a <code>System.GC.Collect()</code> en cada frame para que la basura no se acumule', 'Cambiar <code>Update</code> por <code>FixedUpdate</code>', 'Un Object Pool: crear las chispas al inicio, activarlas y desactivarlas, y medir otra vez', 'Pasar todo el juego a un ECS'],
        ok: 2, why: 'Crear y destruir objetos en cada frame genera basura y trabajo del motor. El pool los reutiliza. Llamar al recolector en cada frame provoca la pausa a propósito, y reescribir todo en ECS es un cambio enorme para un problema local. Después se mide para comprobar.' },
      { tema: 'Semana 6 · Dependencias',
        q: 'Quieres correr las reglas en una prueba de xUnit y en un servidor sin Unity. ¿Qué hay que corregir?',
        code: { lang: 'C#', src: '// Proyecto TurnoNocturno.Nucleo\nusing UnityEngine;\n\npublic class Partida\n{\n    public int Puntos { get; private set; }\n\n    public void BichoEliminado(int valor)\n    {\n        Puntos += valor;\n        GameObject.Find("Audio").GetComponent<AudioSource>().Play();\n    }\n}' },
        opts: ['Nada: <code>using UnityEngine</code> funciona en cualquier proyecto de C#', 'Convertir <code>Partida</code> en un MonoBehaviour', 'Usar un Singleton de audio dentro de Partida', 'Que el núcleo declare <code>IAudio</code> y reciba la implementación por el constructor; el adaptador de Unity vive afuera'],
        ok: 3, why: 'La flecha apuntaba del núcleo al motor. Con un puerto <code>IAudio</code> la dependencia se invierte: el núcleo no sabe de Unity, el adaptador de Unity lo implementa y la prueba le pasa un AudioEspia.' },
      { tema: 'Semana 6 · Bus de eventos',
        q: 'El juego creció y 40 sistemas se avisan por un bus de eventos. Un día el puntaje suma doble y nadie sabe quién publica qué. ¿Qué riesgo del bus apareció y qué ayuda?',
        opts: ['El bus es lento: hay que quitarlo y volver a llamadas directas', 'Flujo invisible y suscripciones duplicadas: registrar cada publicación con su emisor, y desuscribir en el mismo lugar donde se suscribe', 'Faltan Singletons para cada sistema', 'Hay que pasar los sistemas a herencia'],
        ok: 1, why: 'El bus desacopla, pero esconde quién habla con quién. Un registro de publicaciones lo vuelve visible, y suscribir y desuscribir en pares evita los oyentes repetidos que suman doble.' },
      { tema: 'Semana 7 · Pruebas',
        q: '¿Por qué esta prueba da el mismo resultado aunque la corras mil veces?',
        code: { lang: 'C#', src: '[Fact]\npublic void Tanque_MuereAlTercerGolpe()\n{\n    var tanque = new Bicho { Tipo = "tanque", Vida = 3 };\n    var azar = new AzarFijo(99);\n\n    for (int i = 0; i < 3; i++)\n        Reglas.Golpear(tanque, azar, hora: 10);\n\n    Assert.False(tanque.Vivo);\n}' },
        opts: ['Porque xUnit repite sola las pruebas que fallan', 'Porque el tanque tiene exactamente 3 de vida', 'Porque el azar y la hora entran como parámetros: adentro no hay reloj, disco ni azar real', 'Porque usa <code>Assert.False</code> en lugar de <code>Assert.True</code>'],
        ok: 2, why: 'Determinismo: la regla recibe todo lo que varía. Con AzarFijo y una hora fija, cada ejecución es idéntica. Si <code>Golpear</code> llamara por dentro a <code>Random</code> o a <code>DateTime.Now</code>, la prueba podría fallar unas veces sí y otras no.' },
      { tema: 'Semana 8 · Sobreingeniería',
        q: 'En una game jam de 48 horas, tu compañero propone, para el único tipo de enemigo, una interfaz, una Factory, un Service Locator y un archivo JSON. ¿Qué respondes con criterio de arquitectura?',
        opts: ['Empezar con una clase simple y extraer Factory y datos cuando aparezcan más tipos de enemigo', 'Sí: más patrones siempre es mejor arquitectura', 'Nunca usar patrones en una game jam', 'Usar un ECS desde el principio por si el juego crece'],
        ok: 0, why: 'YAGNI: cada patrón cobra entrada en piezas e indirección y solo paga cuando hay cambios que lo usan. Con un solo enemigo y 48 horas, lo justo es una clase pequeña que se deje cambiar. «Nunca» también es un error: si llegan doce enemigos, la Factory paga.' }
    ]
  };
})();
