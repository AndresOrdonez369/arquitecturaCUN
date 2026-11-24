(function () {
  const parcheCS = `// Program.cs, líneas 146 a 188 (resumido)
for (int j = enemX.Count - 1; j >= 0; j--)
{
    if ((enemX[j] == jx && enemY[j] == jy) || enemY[j] >= 19)
    {
        vidas--;
        // ... se borra el bicho de las cuatro listas
        if (vidas <= 0) gameOver = true;
    }
}

// ¿se acabó la oleada? Sin "&& !gameOver", perder la última vida
// con el último bicho también encendía gano: GAME OVER y AMANECIO a la vez.
if (porSalir == 0 && enemX.Count == 0 && !gameOver)
{
    oleada++;
    if (oleada > 3) gano = true;
}`;
  const boolsCS = `static bool menu = true, pausa = false;
static bool gameOver = false, gano = false;

// En el bucle, cada bloque pregunta por todos los demás
if (k == ConsoleKey.Spacebar && !pausa && !menu
    && !gameOver && !gano)
    Disparar();

if (k == ConsoleKey.P && !menu && !gameOver)
    pausa = !pausa;

if (vidas == 0)
    gameOver = true;          // ¿y si pausa seguía en true?

if (!menu && !pausa && !gameOver && !gano)
    MoverBichos();`;
  const enumCS = `enum Estado { Menu, Jugando, Pausa, GameOver, Victoria }

Estado estado = Estado.Menu;   // un solo valor: imposible estar en dos

switch (estado)
{
    case Estado.Menu:
        if (k == ConsoleKey.Enter) estado = Estado.Jugando;
        break;

    case Estado.Jugando:
        if (k == ConsoleKey.P) { estado = Estado.Pausa; break; }
        if (k == ConsoleKey.Spacebar) Disparar();
        MoverBichos();
        // una sola salida por frame: imposible ganar y perder a la vez
        if (vidas == 0) estado = Estado.GameOver;
        else if (oleada > 3) estado = Estado.Victoria;
        break;

    case Estado.Pausa:
        if (k == ConsoleKey.P) estado = Estado.Jugando;
        break;

    case Estado.GameOver:
    case Estado.Victoria:
        if (k == ConsoleKey.Enter) estado = Estado.Menu;
        break;
}`;
  const estadosCS = `interface IEstado
{
    void Entrar();                 // una vez, al llegar
    void Actualizar(float dt);     // cada frame mientras esté activo
    void Salir();                  // una vez, al irse
}

class MaquinaDeEstados
{
    IEstado? actual;

    public void CambiarA(IEstado nuevo)
    {
        actual?.Salir();
        actual = nuevo;
        actual.Entrar();
    }

    public void Actualizar(float dt) { actual?.Actualizar(dt); }
}`;
  const pausaCS = `// Cada estado es una clase pequeña que solo sabe de sí misma.
// "Juego" es la clase que guarda la máquina y los estados ya creados.
class EstadoPausa : IEstado
{
    readonly Juego juego;
    public EstadoPausa(Juego juego) { this.juego = juego; }

    public void Entrar() { juego.MostrarLetrero("PAUSA"); }

    public void Actualizar(float dt)
    {
        // Aquí Espacio no dispara: en Pausa ese evento no existe
        if (juego.Tecla == ConsoleKey.P)
            juego.Maquina.CambiarA(juego.Jugando);
    }

    public void Salir() { juego.MostrarLetrero(""); }
}`;
  const fsmUnity = `using UnityEngine;

public enum Estado { Menu, Jugando, Pausa, GameOver, Victoria }

public class ControlDeJuego : MonoBehaviour
{
    [SerializeField] GameObject panelPausa;
    public Estado Actual { get; private set; } = Estado.Menu;

    void Update()
    {
        // Update sigue corriendo con timeScale = 0: por eso aquí se lee la P
        bool enter = Input.GetKeyDown(KeyCode.Return);
        bool p = Input.GetKeyDown(KeyCode.P);

        if (Actual == Estado.Menu && enter) CambiarA(Estado.Jugando);
        else if (Actual == Estado.Jugando && p) CambiarA(Estado.Pausa);
        else if (Actual == Estado.Pausa && p) CambiarA(Estado.Jugando);
    }

    public void CambiarA(Estado nuevo)
    {
        if (Actual == Estado.Pausa)                       // salir de Pausa
        { panelPausa.SetActive(false); Time.timeScale = 1f; }

        Actual = nuevo;

        if (nuevo == Estado.Pausa)                        // entrar a Pausa
        { panelPausa.SetActive(true); Time.timeScale = 0f; }
    }
}`;
  const fsmLua = `-- La misma máquina con tablas, como en LÖVE
local estados = {}
local actual

local function cambiarA(nombre)
    if actual and actual.salir then actual.salir() end
    actual = estados[nombre]
    if actual.entrar then actual.entrar() end
end

estados.menu = {
    tecla = function(k) if k == "return" then cambiarA("jugando") end end
}
estados.jugando = {
    actualizar = function(dt)
        -- mover bichos y chispas
    end,
    tecla = function(k) if k == "p" then cambiarA("pausa") end end
}
estados.pausa = {
    entrar = function() print("PAUSA") end,
    tecla = function(k) if k == "p" then cambiarA("jugando") end end
}

function love.load() cambiarA("menu") end
function love.update(dt) if actual.actualizar then actual.actualizar(dt) end end
function love.keypressed(k) if actual.tecla then actual.tecla(k) end end`;
  const directoCS = `// Program.cs, chispa contra bicho (líneas 125 a 138)
enemHp[j]--;
balasX.RemoveAt(i); balasY.RemoveAt(i);
if (enemHp[j] <= 0)
{
    if (enemTipo[j] == "lento") puntos += 10;    // puntaje
    if (enemTipo[j] == "rapido") puntos += 20;
    if (enemTipo[j] == "tanque") puntos += 50;
    enemX.RemoveAt(j); enemY.RemoveAt(j);
    enemTipo.RemoveAt(j); enemHp.RemoveAt(j);
    Console.Beep();                              // sonido
    if (puntos > record)
    {
        record = puntos;                         // disco
        File.WriteAllText("puntaje.txt", record.ToString());
    }
}`;
  const eventoCS = `class Bicho
{
    public event Action<Bicho>? AlMorir;      // la campana
    public int Valor { get; }
    int vida;

    public Bicho(int vida, int valor) { this.vida = vida; Valor = valor; }

    public void RecibirDanio(int cantidad)
    {
        if (vida <= 0) return;                 // ya estaba muerto
        vida -= cantidad;
        if (vida <= 0) AlMorir?.Invoke(this);  // suena, sin saber quién oye
    }
}

class Puntaje
{
    public int Puntos { get; private set; }

    public void Escuchar(Bicho b) { b.AlMorir += Sumar; }
    public void Dejar(Bicho b)    { b.AlMorir -= Sumar; }

    public void Sumar(Bicho b) { Puntos += b.Valor; }
}`;
  const eventoUsoCS = `var puntaje = new Puntaje();
var tanque = new Bicho(vida: 3, valor: 30);

puntaje.Escuchar(tanque);                       // se suscribe

Action<Bicho> pitar = b => Console.Beep();      // la lambda se guarda...
tanque.AlMorir += pitar;

tanque.RecibirDanio(3);                         // suena la campana

Console.WriteLine(puntaje.Puntos);              // 30
puntaje.Dejar(tanque);                          // se desuscribe al terminar
tanque.AlMorir -= pitar;                        // ...para poder quitarla`;
  const canalUnity = `using System;
using UnityEngine;

// CanalBicho.cs: un asset que hace de campana compartida
[CreateAssetMenu(menuName = "Eventos/Canal de bicho")]
public class CanalBicho : ScriptableObject
{
    public event Action<Bicho> AlMorir;
    public void Avisar(Bicho b) { AlMorir?.Invoke(b); }
}

// Bicho.cs
public class Bicho : MonoBehaviour
{
    [SerializeField] CanalBicho canal;
    public int valor = 10;

    public void Morir() { canal.Avisar(this); Destroy(gameObject); }
}

// Marcador.cs
public class Marcador : MonoBehaviour
{
    [SerializeField] CanalBicho canal;
    int puntos;

    void OnEnable()  { canal.AlMorir += Sumar; }
    void OnDisable() { canal.AlMorir -= Sumar; }   // sin esta línea hay fuga
    void Sumar(Bicho b) { puntos += b.valor; }
}`;
  const unityEvent = `using UnityEngine;
using UnityEngine.Events;

// Vida.cs: la versión más simple, se conecta arrastrando en el Inspector
public class Vida : MonoBehaviour
{
    [SerializeField] int puntos = 3;
    public UnityEvent alMorir;

    public void RecibirDanio(int cantidad)
    {
        if (puntos <= 0) return;
        puntos -= cantidad;
        if (puntos <= 0)
        {
            alMorir.Invoke();          // sonido, partículas, marcador...
            Destroy(gameObject);
        }
    }
}`;
  const comandoCS = `interface IComando
{
    void Ejecutar();
    void Deshacer();
}

class Robot { public int X, Y; }

class MoverComando : IComando
{
    readonly Robot robot;
    readonly int dx, dy;

    public MoverComando(Robot robot, int dx, int dy)
    {
        this.robot = robot; this.dx = dx; this.dy = dy;
    }

    public void Ejecutar() { robot.X += dx; robot.Y += dy; }
    public void Deshacer() { robot.X -= dx; robot.Y -= dy; }
}

class Historial
{
    readonly Stack<IComando> hechos = new();

    public void Hacer(IComando c) { c.Ejecutar(); hechos.Push(c); }
    public void Deshacer() { if (hechos.Count > 0) hechos.Pop().Deshacer(); }
}`;
  const comandoUsoCS = `var robot = new Robot();
var historial = new Historial();

// Reasignar teclas es cambiar una línea de este diccionario
var teclas = new Dictionary<ConsoleKey, Func<IComando>>
{
    [ConsoleKey.LeftArrow]  = () => new MoverComando(robot, -1, 0),
    [ConsoleKey.RightArrow] = () => new MoverComando(robot, 1, 0),
    [ConsoleKey.UpArrow]    = () => new MoverComando(robot, 0, -1),
    [ConsoleKey.DownArrow]  = () => new MoverComando(robot, 0, 1),
};

var k = Console.ReadKey(true).Key;

if (k == ConsoleKey.Z)
    historial.Deshacer();
else if (teclas.TryGetValue(k, out var crear))
    historial.Hacer(crear());          // la comanda queda guardada`;
  const teclasMal = `// La tecla y la acción están soldadas
if (k == ConsoleKey.LeftArrow)  jx--;
if (k == ConsoleKey.RightArrow) jx++;
if (k == ConsoleKey.UpArrow)    jy--;
if (k == ConsoleKey.DownArrow)  jy++;

// ¿Deshacer el último movimiento?
// ¿Que el jugador elija WASD?
// ¿Grabar la partida para repetirla?
// Nada de eso: no quedó registro.`;

  // Versiones recortadas para las slides (las completas viven en `codigo`)
  const enumCorto = `enum Estado { Menu, Jugando, Pausa, GameOver, Victoria }
Estado estado = Estado.Menu;   // un solo valor a la vez

switch (estado)
{
    case Estado.Menu:
        if (k == ConsoleKey.Enter)
            estado = Estado.Jugando;
        break;
    case Estado.Jugando:
        if (k == ConsoleKey.P) estado = Estado.Pausa;
        else if (vidas == 0) estado = Estado.GameOver;
        else MoverBichos();
        break;
    case Estado.Pausa:
        if (k == ConsoleKey.P) estado = Estado.Jugando;
        break;
}`;
  const maquinaCorta = `interface IEstado
{
    void Entrar();                 // una vez, al llegar
    void Actualizar(float dt);     // cada frame
    void Salir();                  // una vez, al irse
}

class MaquinaDeEstados
{
    IEstado? actual;
    public void CambiarA(IEstado nuevo)
    {
        actual?.Salir();
        actual = nuevo;
        actual.Entrar();
    }
    public void Actualizar(float dt) => actual?.Actualizar(dt);
}`;
  const pausaCorta = `class EstadoPausa : IEstado
{
    readonly Juego juego;
    public EstadoPausa(Juego j) { juego = j; }

    public void Entrar() => juego.MostrarLetrero("PAUSA");

    public void Actualizar(float dt)
    {
        // Espacio no dispara: aquí ese evento no existe
        if (juego.Tecla == ConsoleKey.P)
            juego.Maquina.CambiarA(juego.Jugando);
    }

    public void Salir() => juego.MostrarLetrero("");
}`;
  const fsmUnityCorto = `public enum Estado { Menu, Jugando, Pausa, GameOver, Victoria }

public class ControlDeJuego : MonoBehaviour
{
    [SerializeField] GameObject panelPausa;
    public Estado Actual { get; private set; } = Estado.Menu;

    public void CambiarA(Estado nuevo)
    {
        if (Actual == Estado.Pausa)          // salir de Pausa
        { panelPausa.SetActive(false); Time.timeScale = 1f; }
        Actual = nuevo;
        if (nuevo == Estado.Pausa)           // entrar a Pausa
        { panelPausa.SetActive(true); Time.timeScale = 0f; }
    }
}`;
  const eventoCorto = `class Bicho
{
    public event Action<Bicho>? AlMorir;     // la campana
    public int Valor { get; } = 10;
    int vida = 3;

    public void RecibirDanio(int cantidad)
    {
        if (vida <= 0) return;
        vida -= cantidad;
        if (vida <= 0) AlMorir?.Invoke(this);   // suena
    }
}

// Cada interesado se suscribe por su cuenta
bicho.AlMorir += puntaje.Sumar;
bicho.AlMorir += sonido.Pitar;
bicho.AlMorir += logros.Contar;`;
  const canalCorto = `[CreateAssetMenu(menuName = "Eventos/Canal de bicho")]
public class CanalBicho : ScriptableObject
{
    public event Action<Bicho> AlMorir;
    public void Avisar(Bicho b) => AlMorir?.Invoke(b);
}

public class Marcador : MonoBehaviour
{
    [SerializeField] CanalBicho canal;
    int puntos;

    void OnEnable()  { canal.AlMorir += Sumar; }
    void OnDisable() { canal.AlMorir -= Sumar; }  // o fuga
    void Sumar(Bicho b) { puntos += b.valor; }
}`;
  const fugaCorta = `class Hud
{
    public Hud(Bicho b) { b.AlMorir += Pintar; }  // se suscribe

    void Pintar(Bicho b) { Console.Write("Puntos: ..."); }
}                           // ...y nunca se desuscribe

var hud = new Hud(jefe);
hud = null;                 // "cerramos" el HUD
jefe.RecibirDanio(99);      // ¿qué pasa aquí?`;
  const comandoCorto = `interface IComando { void Ejecutar(); void Deshacer(); }
class MoverComando : IComando
{
    readonly Robot robot; readonly int dx, dy;
    public MoverComando(Robot r, int dx, int dy)
    { robot = r; this.dx = dx; this.dy = dy; }
    public void Ejecutar() { robot.X += dx; robot.Y += dy; }
    public void Deshacer() { robot.X -= dx; robot.Y -= dy; }
}

class Historial
{
    readonly Stack<IComando> hechos = new();
    public void Hacer(IComando c)
    { c.Ejecutar(); hechos.Push(c); }
    public void Deshacer()
    { if (hechos.Count > 0) hechos.Pop().Deshacer(); }
}`;
  const trazaCS = `var robot = new Robot { X = 5 };
var historial = new Historial();

historial.Hacer(new MoverComando(robot, +1, 0));
historial.Hacer(new MoverComando(robot, +1, 0));
historial.Hacer(new MoverComando(robot, -1, 0));

historial.Deshacer();
historial.Deshacer();`;

  /* Ilustración estática para la actividad: la notación de una máquina de estados */
  const svgEstados = `<svg viewBox="0 0 900 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ejemplo de notación: dos estados, flechas con su evento, acciones al entrar y salir y un evento rechazado">
<defs>
<marker id="s3act" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#b9b9bd"/></marker>
<marker id="s3no" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#e0706a"/></marker>
</defs>
<rect width="900" height="360" rx="18" fill="#0d0d0e"/>
<rect x="40" y="40" width="250" height="100" rx="50" fill="#2b2b30" stroke="#fff" stroke-width="3"/>
<text x="165" y="99" text-anchor="middle" font-size="30" font-weight="800" fill="#fff">Jugando</text>
<rect x="610" y="40" width="250" height="100" rx="50" fill="#e2a54a"/>
<text x="735" y="99" text-anchor="middle" font-size="30" font-weight="800" fill="#0d0d0e">Pausa</text>
<line x1="296" y1="72" x2="602" y2="72" stroke="#b9b9bd" stroke-width="4" marker-end="url(#s3act)"/>
<line x1="604" y1="112" x2="298" y2="112" stroke="#b9b9bd" stroke-width="4" marker-end="url(#s3act)"/>
<text x="450" y="58" text-anchor="middle" font-size="24" font-weight="800" fill="#e2a54a">P</text>
<text x="450" y="146" text-anchor="middle" font-size="24" font-weight="800" fill="#e2a54a">P</text>
<text x="735" y="192" text-anchor="middle" font-size="22" font-weight="600" fill="#b9b9bd">entrar: letrero PAUSA</text>
<text x="735" y="228" text-anchor="middle" font-size="22" font-weight="600" fill="#b9b9bd">salir: quitar letrero</text>
<line x1="430" y1="262" x2="624" y2="152" stroke="#e0706a" stroke-width="4" stroke-dasharray="8 8" marker-end="url(#s3no)"/>
<text x="300" y="282" text-anchor="middle" font-size="24" font-weight="800" fill="#eb9a94">Espacio: rechazado</text>
<text x="450" y="336" text-anchor="middle" font-size="22" font-weight="600" fill="#b9b9bd">Cada flecha lleva su evento. Lo que no tiene flecha, se rechaza.</text>
</svg>`;

  window.CLASE = {
    n: 3,
    titulo: 'Patrones I: el juego que reacciona',
    objetivos: [
      'Explicar qué es un patrón de diseño y reconocer cuándo usar uno sería sobreingeniería.',
      'Reemplazar bools sueltos por una máquina de estados, primero con <code>enum</code> y luego con clases de estado.',
      'Avisar que algo pasó con un evento (<code>AlMorir</code>) y desuscribirse a tiempo para evitar fugas.',
      'Convertir una acción en un objeto comando para reasignar teclas, deshacer y repetir.'
    ],
    analogia: 'Tres objetos de todos los días. El semáforo: está en un solo color a la vez y solo cambia en cierto orden (State). La campana de la cocina: el cocinero la toca cuando el plato está listo y no sabe qué mesero viene (Observer). La comanda del mesero: el pedido escrito en un papel se puede encolar, cancelar o repetir (Command).',
    agenda: [
      ['0:00', 'Devolución del parcial y el parche de la línea 175'],
      ['0:12', 'Qué es un patrón y cuándo sobra'],
      ['0:16', 'State: semáforo, bools, enum y máquina de estados, con demos'],
      ['0:44', 'Observer: la campana de la cocina, con demo'],
      ['1:03', 'Command: la comanda del mesero'],
      ['1:14', 'Juegos reales y cuándo no usar patrones'],
      ['1:22', 'Actividad: la máquina de estados de Turno Nocturno'],
      ['1:33', 'Presentación de la consigna del ACA 1'],
      ['1:43', 'Cierre y quiz de la clase'],
      ['2:00', 'Fin de la sesión']
    ],
    conceptos: [
      { t: 'Patrón de diseño', d: 'Una solución conocida y con nombre para un problema que se repite. Trae también cuándo no usarla.', ej: '«Eso es un State» le dice al equipo cómo está hecho el menú, la pausa y la IA del guardia, sin explicar más.' },
      { t: 'Máquina de estados finitos', d: 'El sistema está en exactamente un estado de un conjunto finito y solo cambia por transiciones definidas ante eventos.', ej: 'Turno Nocturno: Menú, Jugando, Pausa, GameOver y Victoria, con un solo valor activo a la vez.' },
      { t: 'Transición', d: 'El paso de un estado a otro que dispara un evento. Si el par estado y evento no está en la tabla, no ocurre nada.', ej: 'Pausa + P lleva a Jugando; Pausa + Espacio no hace nada, sin escribir <code>!pausa</code> en ningún lado.' },
      { t: 'Entrar, Actualizar y Salir', d: 'Entrar y Salir corren una sola vez por transición; Actualizar corre cada frame mientras el estado está activo.', ej: 'Entrar a Pausa: <code>Time.timeScale = 0</code> y mostrar el panel. Salir: devolverlo a 1 y ocultarlo.' },
      { t: 'Observer (evento)', d: 'Un emisor avisa que algo pasó a una lista de suscriptores que no conoce; cada uno decide cómo reaccionar.', ej: '<code>Bicho.AlMorir</code>: sonido, puntaje, HUD y logros se suscriben sin que el bicho los nombre.' },
      { t: 'Suscribir, desuscribir y fuga', d: 'Con <code>+=</code> el emisor guarda una referencia al oyente. Si nunca se hace <code>-=</code>, el oyente no se libera y sigue reaccionando.', ej: 'Un HUD cerrado que sigue pintando cada vez que muere el jefe.' },
      { t: 'Command', d: 'Una acción convertida en objeto con Ejecutar (y a menudo Deshacer) que se puede guardar, encolar, deshacer o repetir.', ej: '<code>MoverComando</code> en una pila: Z deshace el último paso del robot; la lista completa es una repetición.' },
      { t: 'Sobreingeniería', d: 'Aplicar un patrón cuando el problema que resuelve no existe: agrega piezas que leer, probar y mantener sin beneficio.', ej: 'Dos clases de estado y un canal de eventos para un minijuego que se resuelve con un solo bool.' }
    ],
    industria: [
      { j: 'Celeste (Maddy Thorson y Noel Berry)', t: 'El Player.cs publicado maneja al personaje con una StateMachine de estados numerados (normal, trepar, dash...). Cada estado registra funciones de inicio, actualización y fin: Entrar, Actualizar y Salir.', src: 'Repositorio NoelFB/Celeste en GitHub (2018), archivo Player.cs.' },
      { j: 'Hollow Knight (Team Cherry)', t: 'Hecho en Unity; enemigos y jefes se programaron con máquinas de estado visuales de PlayMaker. State hecho herramienta de diseño.', src: 'PlayMaker de Hutong Games (Unity Asset Store); las FSM del juego son las que edita la comunidad de mods.' },
      { j: 'World of Warcraft', t: 'La interfaz se programa en Lua: un marco se suscribe con <code>RegisterEvent("PLAYER_LEVEL_UP")</code> y reacciona en su manejador <code>OnEvent</code>. Observer puro.', src: 'API de interfaz de WoW: Frame:RegisterEvent y el script OnEvent (warcraft.wiki.gg).' },
      { j: 'Doom (id Software, 1993)', t: 'Cada tic, 35 por segundo, la entrada del jugador se empaqueta en un <code>ticcmd_t</code>. Las demos grabadas son la secuencia de esos comandos, y al reproducirlas el juego simula lo mismo.', src: 'Código fuente publicado por id Software (1997): d_ticcmd.h y g_game.c.' },
      { j: 'Age of Empires (Ensemble Studios)', t: 'Su multijugador en lockstep envía las órdenes de los jugadores, no el estado del mundo: cada máquina ejecuta los mismos comandos y obtiene la misma partida.', src: 'Paul Bettner y Mark Terrano, «1500 Archers on a 28.8: Network Programming in Age of Empires and Beyond», GDC 2001.' }
    ],
    errores: [
      { mito: 'Más patrones es mejor arquitectura.', real: 'Cada patrón cuesta piezas extra. Sin el síntoma es sobreingeniería, y se nota cuando para entender un clic hay que abrir cinco archivos.' },
      { mito: 'Una máquina de estados exige una clase por estado.', real: 'Un <code>enum</code> con un <code>switch</code> ya es una máquina de estados. Pasa a clases cuando cada <code>case</code> crece o Entrar y Salir tienen mucha lógica.' },
      { mito: 'El recolector de basura limpia los oyentes que olvidé.', real: 'Mientras el emisor viva, su lista de suscriptores mantiene vivo al oyente y el GC no puede liberarlo. Se nota en HUD fantasmas y, en Unity, en <code>MissingReferenceException</code> al tocar objetos destruidos.' },
      { mito: 'Una lambda se quita escribiendo la misma lambda con <code>-=</code>.', real: 'Cada lambda escrita aparte es un delegado distinto, así que ese <code>-=</code> no quita nada. Usa un método con nombre o guarda la lambda en una variable.' },
      { mito: 'Deshacer solo se logra copiando todo el juego antes de cada acción.', real: 'Es posible (Memento), pero caro. Con Command cada acción guarda solo lo que necesita para revertirse: la posición anterior o el bicho que eliminó.' }
    ],
    codigoIntro: 'Tres recetas con nombre. Cada una empieza por el problema en el espagueti y termina con la versión que se deja cambiar.',
    codigo: [
      { titulo: 'State: de los bools a la máquina de estados', desc: 'Antes: bools sueltos y parches como el de la línea 175. Primer paso: un <code>enum</code> y un <code>switch</code>. Segundo paso, cuando cada estado crece: una clase por estado con Entrar, Actualizar y Salir.',
        tabs: [{ lang: 'C#', label: 'Antes: el parche', src: parcheCS }, { lang: 'C#', label: 'Paso 1: enum + switch', src: enumCS }, { lang: 'C#', label: 'Paso 2: la máquina', src: estadosCS }, { lang: 'C#', label: 'Paso 2: un estado', src: pausaCS }, { lang: 'Unity', src: fsmUnity }, { lang: 'Lua', label: 'Lua (LÖVE)', src: fsmLua }] },
      { titulo: 'Observer: el evento AlMorir', desc: 'El bicho avisa que murió y no sabe quién escucha. Sonido, puntaje y HUD se suscriben por su cuenta. Quien se suscribe, se desuscribe; si usas lambda, guárdala para poder quitarla.',
        tabs: [{ lang: 'C#', label: 'Antes: Program.cs', src: directoCS }, { lang: 'C#', label: 'C# (el evento)', src: eventoCS }, { lang: 'C#', label: 'C# (uso)', src: eventoUsoCS }, { lang: 'Unity', label: 'Unity (canal ScriptableObject)', src: canalUnity }, { lang: 'Unity', label: 'Unity (UnityEvent)', src: unityEvent }] },
      { titulo: 'Command: acciones que se pueden deshacer', desc: 'Cada movimiento es un objeto con Ejecutar y Deshacer. Guardarlos en una pila da deshacer. Guardarlos en una lista da repetición.',
        tabs: [{ lang: 'C#', label: 'Antes: teclas soldadas', src: teclasMal }, { lang: 'C#', label: 'C# (comando e historial)', src: comandoCS }, { lang: 'C#', label: 'C# (teclas y deshacer)', src: comandoUsoCS }] }
    ],
    tarea: [
      'Lee completa la <a href="docs/aca1.html">consigna del ACA 1</a> y arma tu equipo. La entrega cierra el 27 de diciembre.',
      'Pasa en limpio la máquina de estados que dibujaste hoy: 5 estados, cada flecha con su evento. Es un entregable del ACA 1.',
      'En <a href="proyecto/TurnoNocturno/README.html">Turno Nocturno</a>, marca todos los lugares donde aparecen <code>Console.Beep</code> y <code>File.WriteAllText</code>. Para cada uno escribe qué evento lo reemplazaría.',
      'Haz el <a href="quiz.html?s=3">quiz de la clase</a>.'
    ],
    lecturas: [
      'Nystrom, R. (2014). <i>Game Programming Patterns</i>, capítulos «State», «Observer» y «Command» (gratis en gameprogrammingpatterns.com).',
      'Gamma, E., Helm, R., Johnson, R. y Vlissides, J. (1994). <i>Design Patterns</i>. Solo la introducción y las fichas de State, Observer y Command.',
      'Unity Technologies. <i>Level up your code with game programming patterns</i> (libro electrónico gratuito, incluye canales de eventos con ScriptableObject).',
      'Repositorio NoelFB/Celeste en GitHub: lee <code>Player.cs</code> buscando <code>StateMachine</code>.'
    ],

    slides: [
      { kind: 'portada', title: 'Patrones I: el juego que reacciona',
        lead: 'Semana 3 · Arquitectura de Videojuegos',
        full: [
          { ul: ['<b>State:</b> un semáforo.', '<b>Observer:</b> una campana.', '<b>Command:</b> una comanda.'] },
          { pie: 'Al final abre el ACA 1 · <span class="kbd">N</span> notas del docente' }
        ],
        nota: 'Antes de esta slide: devolución rápida del parcial, las dos preguntas con más errores. 5 minutos como máximo.' },

      { kind: 'reto', title: 'El parche de la línea 175',
        izq: 58,
        left: [{ fig: 'parche' }],
        right: [
          { p: 'En <code>Program.cs</code> la oleada termina con <code>porSalir == 0 &amp;&amp; enemX.Count == 0 &amp;&amp; !gameOver</code>.' },
          { check: { q: 'Sin el <code>!gameOver</code>, ¿qué pasa si el último bicho de la oleada 3 llega al fondo con tu última vida?', opts: ['Nada raro: sale GAME OVER', 'El juego se cierra con un error', 'Quedan gameOver y gano en true: la pantalla dice AMANECIO con 0 vidas', 'El bicho no se borra'], ok: 2, why: 'Ese bicho quita la vida (gameOver) y deja la sala vacía, así que también se cumple «se acabó la oleada» (gano). El mensaje de victoria se escribe después y gana. El parche tapa un caso; los bools permiten más.' } }
        ],
        nota: 'Pide los números de la tarea: en cuántas líneas aparecían los cuatro bools (suelen ser más de 15). Que voten y luego recorran la figura paso a paso, primero «Sin el parche» y luego «Con». Error esperado: A. Pregunta de cierre: ¿cuántos parches así habría que escribir? Respuesta: uno por cada combinación absurda. 6 minutos.' },

      { kind: 'analogia', title: 'Un patrón es una receta con nombre',
        izq: 58,
        left: [{ fig: 'receta' }],
        right: [
          { mapa: [['«Hazme un sofrito»', 'El nombre del patrón'], ['La receta probada', 'Solución conocida'], ['«No lleva ajo si...»', 'Cuándo no usarlo']], de: 'En la cocina', a: 'En el código', pasos: true },
          { clave: 'Primero el problema, después el patrón.', paso: true }
        ],
        nota: 'Agrega los tres juegos, ponle nombre y por último «Usarla sin el problema». Pregunta: ¿qué patrones conocen por nombre? Respuesta típica: Singleton. Recuerda que ya usaron uno la semana pasada: Componente. 4 minutos.' },

      { kind: 'analogia', title: 'State: el semáforo',
        izq: 58,
        left: [{ fig: 'semaforo' }],
        right: [
          { mapa: [['Un color a la vez', 'Estado actual<small>un solo valor</small>'], ['Pasó el tiempo, botón', 'Eventos'], ['Verde a amarillo sí, a rojo no', 'Tabla de transiciones']], de: 'En la calle', a: 'En el juego', pasos: true },
          { clave: 'Lo que no está en la tabla, no puede pasar.', paso: true }
        ],
        nota: 'Prueba «Saltar a rojo» desde verde y «Encender dos luces». Pregunta: ¿qué otros objetos de un juego son semáforos? Respuestas esperadas: Mario (pequeño, grande, fuego), una puerta, la IA de un guardia (patrulla, sospecha, persigue). 4 minutos.' },

      { kind: 'antipatron', title: 'Cuatro bools, dieciséis combinaciones',
        izq: 58,
        left: [{ fig: 'bools' }],
        right: [
          { check: { q: 'Con 4 bools, ¿cuántas combinaciones puede guardar el programa y cuántas tienen sentido?', opts: ['4 posibles, 4 con sentido', '8 posibles, 5 con sentido', '16 posibles, solo 5 con sentido', '5 posibles, 5 con sentido'], ok: 2, why: '2 × 2 × 2 × 2 = 16. El juego solo tiene 5 situaciones: menú, jugando, pausa, derrota y victoria. Las otras 11 son bugs esperando turno, como el de la línea 175.' } },
          { clave: 'Un <code>enum</code> guarda un solo valor: las 11 absurdas no se pueden escribir.', paso: true }
        ],
        nota: 'Que voten primero. Error esperado: 8. Luego en la figura enciende gameOver y gano a la vez: es exactamente el caso del parche. Cambia a «Un enum» y repite. 4 minutos.' },

      { kind: 'antipatron', title: 'Cuatro bools o un solo estado',
        lead: 'Mismo comportamiento. A la izquierda cada bloque debe acordarse de todos los bools.',
        top: true,
        full: [{ compare: { a: { label: 'Bools sueltos', lang: 'C#', src: boolsCS }, b: { label: 'Un enum y un switch', lang: 'C#', src: enumCorto } } }],
        nota: 'Señala la línea «gameOver = true»: nadie apagó pausa. Pregunta: ¿cuántos bools revisa el if de MoverBichos y cuántos el case Jugando? Respuesta: cuatro contra ninguno, porque el switch ya sabe dónde está. Este primer paso basta para muchos juegos pequeños. 4 minutos.' },

      { kind: 'codigo', title: 'Cuando el switch crece: una clase por estado',
        izq: 32,
        left: [
          { big: 'Si cada <code>case</code> tiene 40 líneas, cada estado se muda a su clase.' },
          { clave: '<code>IEstado</code> es otro enchufe: un estado nuevo es una clase nueva.', paso: true }
        ],
        right: [{ code: [
          { lang: 'C#', label: 'La máquina', src: maquinaCorta },
          { lang: 'C#', label: 'Un estado: Pausa', src: pausaCorta },
          { lang: 'Unity', src: fsmUnityCorto }
        ], marca: [
          { l: [1, 2, 3, 4, 5, 6], t: '<b>Entrar</b> y <b>Salir</b>: lo que pasa una sola vez. <b>Actualizar</b>: cada frame.' },
          { l: [11, 13, 14, 15], t: 'Cambiar de estado: sale el viejo, entra el nuevo. Siempre en ese orden.' },
          { l: [17], t: 'La máquina solo delega en el estado actual.' }
        ] }],
        nota: 'Conecta con la semana 2: agregar un estado es agregar una clase (la O de SOLID). Pregunta: ¿dónde va <code>Time.timeScale = 0</code>, en Entrar o en Actualizar? Respuesta: en Entrar de Pausa, una sola vez; y se devuelve a 1 en Salir. En la pestaña Unity basta el enum para 5 estados; Entrar y Salir quedan en CambiarA. 6 minutos.' },

      { kind: 'reto', title: 'Predice: Espacio durante la pausa',
        izq: 60,
        left: [{ fig: 'transiciones' }],
        right: [
          { p: 'El juego está en <b>Pausa</b>. El jugador presiona <b>Espacio</b>.' },
          { check: { q: 'Con la tabla de transiciones, ¿qué pasa?', opts: ['Se dispara una chispa', 'Nada: en Pausa ese evento no tiene transición ni acción', 'El juego vuelve al menú', 'El programa lanza un error'], ok: 1, why: 'Cada estado decide a qué eventos responde. Pausa solo conoce la tecla P. Con bools había que acordarse de escribir <code>!pausa</code> en cada <code>if</code>.' } }
        ],
        nota: 'Que voten sin tocar la figura. Luego toca la celda Pausa + Espacio, y después «Contar celdas vacías»: 17 de 25 combinaciones se ignoran solas. Pregunta: ¿qué celda reemplaza el parche de la línea 175? Respuesta: GameOver no tiene flecha hacia Victoria. 4 minutos.' },

      { kind: 'demo', title: 'La máquina de estados de Turno Nocturno',
        izq: 28, top: true,
        left: [
          { p: 'El estado actual está en amarillo.' },
          { p: 'Dispara eventos. Prueba los que no deberían servir.' },
          { clave: 'Cada rechazo protege al juego de una situación imposible.', paso: true }
        ],
        right: [{ fig: 'fsm' }],
        nota: 'Recorrido: Enter, P, Espacio (rechazado), P, Espacio (dispara sin cambiar de estado), Sin vidas, P (rechazado), Enter. Pregunta: ¿se puede llegar de Pausa a GameOver? Respuesta: no hay flecha; en Pausa la lógica no corre. 6 minutos.' },

      { kind: 'analogia', title: 'Observer: la campana de la cocina',
        izq: 58,
        left: [{ fig: 'campana' }],
        right: [
          { mapa: [['El cocinero toca', 'El bicho avisa<small>AlMorir</small>'], ['Quienes oyen la campana', 'Suscriptores'], ['Contratar otro mesero', '<code>+=</code> sin tocar al cocinero']], de: 'En la cocina', a: 'En el juego', pasos: true },
          { clave: 'Quien avisa no conoce a quien escucha.', paso: true }
        ],
        nota: 'Suscribe y desuscribe meseros tocando las cajas. Pregunta: cuando muere un bicho en Turno Nocturno, ¿a quién le interesa? Respuesta esperada: sonido, puntaje, HUD, oleadas, logros y guardado. 3 minutos.' },

      { kind: 'reto', title: 'Predice: la colisión que llama a todos',
        izq: 52,
        left: [{ code: [{ lang: 'C#', label: 'Program.cs · colisiones', src: directoCS }], marca: [
          { l: [6, 7, 8], t: '<b>Puntaje</b> dentro de la colisión.' },
          { l: [11], t: '<b>Sonido</b> dentro de la colisión.' },
          { l: [12, 13, 14, 15, 16], t: '<b>Disco</b> dentro de la colisión.' }
        ] }],
        right: [{ check: { q: 'Diseño pide un logro: «elimina 10 bichos». ¿Qué hay que tocar?', opts: ['Abrir y editar esta colisión otra vez', 'Solo crear una clase nueva', 'Nada', 'Solo el HUD'], ok: 0, why: 'La colisión conoce a todos por su nombre. Cada interesado nuevo es otra edición sobre código que ya funcionaba.' } }],
        nota: 'Que voten antes de recorrer las marcas. Respuesta: A. Recalca que es el código real de Program.cs. La siguiente slide muestra la versión con evento. 3 minutos.' },

      { kind: 'codigo', title: 'El bicho solo toca la campana',
        izq: 32,
        left: [
          { big: 'El logro nuevo es <b>una línea más</b> de suscripción.' },
          { clave: 'Agregar un oyente no toca al que avisa.', paso: true }
        ],
        right: [{ code: [
          { lang: 'C#', src: eventoCorto },
          { lang: 'Unity', label: 'Unity (canal)', src: canalCorto }
        ], marca: [
          { l: [3], t: '<code>event</code>: la campana.' },
          { l: [11], t: '<code>Invoke</code>: suena. El <code>?.</code> evita el error si nadie escucha.' },
          { l: [15, 16, 17, 18], t: '<code>+=</code>: cada interesado se suscribe con un método con nombre, que luego se puede quitar con <code>-=</code>.' }
        ] }],
        nota: 'Pregunta: ¿por qué métodos con nombre y no lambdas? Respuesta: porque con <code>-=</code> solo se quita el mismo delegado; una lambda escrita de nuevo es otra. Pestaña Unity: un canal ScriptableObject sirve cuando el que avisa y el que escucha no se conocen ni están en la misma escena; mira el par OnEnable y OnDisable. UnityEvent está en la página de la clase. 5 minutos.' },

      { kind: 'reto', title: 'Predice: el HUD que nunca se fue',
        lead: 'El HUD se suscribe a <code>AlMorir</code> del jefe. Nadie escribió el <code>-=</code>.',
        izq: 50,
        left: [{ code: [{ lang: 'C#', src: fugaCorta }] }],
        right: [{ check: { q: 'Cuando el jefe muere, ¿qué pasa?', opts: ['Nada, el HUD ya no existe', 'El programa no compila', 'El evento se borra solo', '<code>Pintar</code> del HUD viejo se ejecuta igual'], ok: 3, why: 'La lista de suscriptores del jefe guarda una referencia al HUD. El GC no lo libera mientras el jefe viva, y sigue reaccionando: una fuga. Cada <code>+=</code> tiene su <code>-=</code>.' } }],
        nota: 'Error esperado: la opción A. En Unity, si el emisor sobrevive al cambio de escena (un canal ScriptableObject o un objeto que no se destruye) y el oyente destruido toca su transform, aparece MissingReferenceException. Lo retomamos en la semana 5 con el recolector de basura. 4 minutos.' },

      { kind: 'demo', title: 'Suscribe, desuscribe y mata un bicho',
        izq: 28, top: true,
        left: [
          { p: 'El bicho nunca cambia. Solo cambia <b>la lista de quién escucha</b>.' },
          { clave: 'Cierra el HUD sin desuscribirlo y mata otro bicho.', paso: true }
        ],
        right: [{ fig: 'observer' }],
        nota: 'Primero con todos suscritos. Luego quita Sonido y repite: el resto sigue igual. Al final el botón de la fuga. Pregunta: ¿qué línea de código cambió en Bicho para agregar Logros? Respuesta: ninguna. 4 minutos.' },

      { kind: 'analogia', title: 'Command: la comanda del mesero',
        izq: 58,
        left: [{ fig: 'comanda' }],
        right: [
          { mapa: [['El pedido escrito', 'Comando<small>Ejecutar()</small>'], ['Tachar el último', 'Deshacer()'], ['El talonario del día', 'Repetición'], ['Mesero, domicilio o app', 'Teclas reasignables']], de: 'En el restaurante', a: 'En el juego', pasos: true }
        ],
        nota: 'Mueve, dispara, deshace dos veces y luego «Repetir». Pregunta: ¿quién más podría escribir comandas además del teclado? Respuesta esperada: la IA, un control, una grabación o la red. Otra imagen: el control remoto, el botón no sabe qué aparato enciende. 4 minutos.' },

      { kind: 'codigo', title: 'Una acción convertida en objeto',
        top: true,
        full: [{ compare: { a: { label: 'Tecla y acción soldadas', lang: 'C#', src: teclasMal }, b: { label: 'Comando con deshacer', lang: 'C#', src: comandoCorto } } }],
        nota: 'Recorre la derecha: el comando guarda lo que necesita para revertirse (dx, dy). Tres usos: reasignar teclas, deshacer y repeticiones. Pregunta: ¿qué guardaría un comando Disparar para poder deshacerse? Respuesta: la chispa creada o el bicho que eliminó. El diccionario de teclas está en la página de la clase. 4 minutos.' },

      { kind: 'reto', title: 'Predice: tres pasos y dos deshacer',
        izq: 50,
        left: [{ code: [{ lang: 'C#', src: trazaCS }] }],
        right: [{ check: { q: '¿Dónde queda el robot?', opts: ['X = 5', 'X = 6', 'X = 4', 'X = 7'], ok: 1, why: 'Tras los tres comandos está en 6. La pila devuelve primero el último: deshacer «-1» lo lleva a 7 y deshacer «+1» lo regresa a 6.' } }],
        nota: 'Haz la traza en voz alta: 5, 6, 7, 6; deshacer: 7, 6. Error esperado: X = 5, por pensar que deshacer dos veces anula todo. 3 minutos.' },

      { kind: 'industria', title: 'En juegos reales: los tres patrones',
        full: [
          { juegos: [
            { j: 'Celeste · State', t: 'El Player.cs publicado usa una StateMachine: normal, trepar, dash... Cada estado registra funciones de inicio, actualización y fin.', src: 'Repositorio NoelFB/Celeste en GitHub (2018), Player.cs' },
            { j: 'World of Warcraft · Observer', t: 'La interfaz es Lua: un marco se suscribe con RegisterEvent("PLAYER_LEVEL_UP") y reacciona en OnEvent.', src: 'API de interfaz de WoW: Frame:RegisterEvent y OnEvent' },
            { j: 'Doom · Command', t: 'Cada tic (35 por segundo) la entrada se empaqueta en un ticcmd_t. Una demo grabada es la lista de esos comandos.', src: 'Código fuente de id Software (1997): d_ticcmd.h y g_game.c' }
          ], pasos: true },
          { clave: 'Entrar y Salir, suscribirse, grabar comandos: lo mismo que hicimos hoy.', paso: true }
        ],
        nota: 'Revela un caso a la vez y pide que nombren el patrón antes de leer la etiqueta. Pregunta con Doom: ¿por qué grabar comandos y no posiciones? Respuesta: pesan poco y, si la simulación es determinista, reproducen la misma partida. La página de la clase trae Hollow Knight (PlayMaker) y Age of Empires (lockstep). 4 minutos.' },

      { kind: 'idea', title: 'Cuándo sí y cuándo no',
        izq: 40,
        left: [{ check: { q: 'Un juego de adivinar tiene un solo <code>bool termino</code>. ¿Qué haces?', opts: ['Lo dejas: un bool para dos situaciones está bien', 'Creas 2 clases de estado', 'Montas un canal de eventos', 'Un comando por intento'], ok: 0, why: 'Un patrón resuelve un problema. Si el problema no existe, solo agrega piezas que alguien tendrá que leer.' } }],
        right: [{ tabla: { head: ['Síntoma', 'Prueba'], rows: [['Bools que nunca deberían estar encendidos a la vez', '<b>State</b>'], ['Una función que llama a sonido, UI, puntaje y disco', '<b>Observer</b>'], ['Deshacer, repetir o reasignar acciones', '<b>Command</b>']] }, pasos: true }],
        nota: 'Costo escondido de los eventos: ya no ves en una línea quién reacciona a qué. Por eso se nombran bien y se usan con medida. Pregunta: ¿qué síntoma de la tabla tiene Turno Nocturno? Respuesta: los tres. Este criterio se califica en el ACA 1: cada patrón con el síntoma que lo justifica. 4 minutos.' },

      { kind: 'actividad', title: 'Dibuja la máquina de estados · 11 min',
        lead: 'En equipos: la máquina de estados de Turno Nocturno.',
        izq: 50,
        left: [
          { ol: ['Cinco estados: <b>Menú, Jugando, Pausa, GameOver, Victoria</b>.', 'Cada flecha con su <b>evento</b>.', 'Qué hace cada estado al <b>entrar</b> y al <b>salir</b>.', 'Dos eventos que la máquina debe <b>rechazar</b>.'], pasos: true },
          { pie: 'Pregunta extra: ¿en qué transición se guarda el puntaje en disco? Guarden el dibujo: es un entregable del ACA 1.' }
        ],
        right: [{ svg: svgEstados }],
        nota: 'Salas de 2 o 3, ojalá los equipos del ACA. 8 minutos de trabajo y 3 para que un equipo muestre. El dibujo es solo la notación. Errores esperados: flechas sin evento y olvidar cómo se sale de GameOver y Victoria. Respuesta a la pregunta extra: al entrar a GameOver o Victoria, no dentro de la colisión.' },

      { kind: 'cierre', title: 'Lo que te llevas hoy y el ACA 1',
        full: [
          { ol: ['<b>State:</b> un solo estado y una tabla de transiciones.', '<b>Observer:</b> quien avisa no conoce a quien escucha. Cada <code>+=</code> con su <code>-=</code>.', '<b>Command:</b> una acción hecha objeto se guarda, se deshace y se repite.'], pasos: true },
          { p: '<b>Abre el ACA 1 (30 %)</b>, cierra el 27 de diciembre: <a href="docs/aca1.html">consigna</a>. Ahora: <a href="quiz.html?s=3">quiz de la clase</a>. Tarea: pasa en limpio tu máquina de estados.', paso: true }
        ],
        nota: 'Reserva 10 minutos antes de esta slide para abrir docs/aca1.html: entregables, rúbrica y fecha. En el ACA 1 no se pide código: se pide diagnóstico y plano. La máquina de hoy y la lista de módulos de la semana 2 ya son parte de la entrega. Pregunta final: ¿qué patrón resolvería el parche de la línea 175? Respuesta: State. 3 minutos.' }
    ],

    quiz: [
      { tema: 'Patrones', q: '¿Qué es un patrón de diseño?', opts: ['Una librería que se instala en el proyecto', 'Una regla obligatoria del lenguaje C#', 'Una solución conocida y con nombre para un problema que se repite', 'Un tipo de diagrama'], ok: 2, why: 'Es una receta con nombre. Sirve para resolver un problema frecuente y para que el equipo se entienda con una sola palabra. No se instala ni lo exige el lenguaje.' },
      { tema: 'State', q: 'Un juego usa los bools <code>menu</code>, <code>pausa</code> y <code>gameOver</code>. ¿Cuál es el riesgo principal?', opts: ['Que queden encendidos dos a la vez y el juego entre en una situación que no debería existir', 'Que los bools ocupan mucha memoria', 'Que C# no permite más de dos bools', 'Que el juego corra más lento'], ok: 0, why: 'Tres bools permiten 8 combinaciones y el juego solo necesita unas pocas. Un <code>enum</code> guarda un único valor y elimina las combinaciones imposibles.' },
      { tema: 'State', q: 'En una clase de estado, ¿para qué sirve el método <code>Entrar()</code>?', opts: ['Para leer el teclado en cada frame', 'Para dibujar el estado', 'Para destruir el estado anterior', 'Para lo que debe pasar una sola vez al llegar a ese estado, como mostrar el letrero de pausa'], ok: 3, why: 'Entrar y Salir se ejecutan una vez por transición. Actualizar se ejecuta cada frame mientras el estado esté activo.' },
      { tema: 'Observer', q: 'Con el evento <code>AlMorir</code>, ¿qué sabe el bicho sobre quién lo escucha?', opts: ['Conoce al sonido y al puntaje por nombre', 'Nada: solo avisa que murió y cada suscriptor decide qué hacer', 'Sabe cuántos puntos sumar', 'Sabe en qué archivo se guarda el puntaje'], ok: 1, why: 'Esa es la ventaja: se pueden agregar o quitar oyentes sin tocar la clase que avisa.' },
      { tema: 'Observer', q: 'En Unity, un objeto se suscribe a un evento en <code>OnEnable</code>. ¿Qué debe hacer en <code>OnDisable</code>?', opts: ['Nada, Unity lo limpia solo', 'Volver a suscribirse', 'Desuscribirse con <code>-=</code>', 'Destruir el evento'], ok: 2, why: 'Si no se desuscribe, quien avisa conserva una referencia al objeto: no se libera de la memoria y puede seguir reaccionando después de desactivado o destruido.' },
      { tema: 'Command', q: '¿Qué permite convertir una acción en un objeto con <code>Ejecutar()</code> y <code>Deshacer()</code>?', opts: ['Que el juego use menos memoria', 'Guardarla en una pila para deshacerla, repetirla después o asignarla a otra tecla', 'Que no haga falta leer el teclado', 'Que los bichos se muevan solos'], ok: 1, why: 'Una acción que es un objeto se puede guardar, encolar, deshacer y volver a ejecutar. Eso da deshacer, repeticiones y teclas reasignables.' },
      { tema: 'Criterio', q: 'Un minijuego tiene dos situaciones: jugando y terminado. Un compañero propone 2 clases de estado, un canal de eventos y comandos. ¿Qué respondes?', opts: ['Perfecto, mientras más patrones mejor', 'Faltan patrones: hay que agregar una fábrica', 'Los patrones nunca se usan en juegos pequeños', 'Es sobreingeniería: un bool resuelve hoy el problema, y los patrones se agregan cuando aparezca el síntoma'], ok: 3, why: 'Primero el problema, después el patrón. Cada pieza extra es algo más que leer, probar y mantener.' },
      { tema: 'Command', q: 'El robot está en <code>X = 2</code>. Se ejecutan <code>Hacer(+1)</code>, <code>Hacer(+1)</code>, <code>Deshacer()</code> y <code>Hacer(-1)</code>, con comandos que mueven en X. ¿Dónde queda?', opts: ['X = 2', 'X = 3', 'X = 4', 'X = 1'], ok: 0, why: '2, 3, 4; deshacer saca el último +1 y vuelve a 3; el -1 lo deja en 2. La pila solo guarda lo que no se ha deshecho.' },
      { tema: 'Observer', q: 'El HUD se suscribe con <code>jefe.AlMorir += b =&gt; Pintar();</code> y al cerrarse escribe <code>jefe.AlMorir -= b =&gt; Pintar();</code>. ¿Qué pasa?', opts: ['Se desuscribe bien', 'No compila', 'No se desuscribe: son dos lambdas distintas y el HUD sigue escuchando', 'Lanza una excepción al cerrar'], ok: 2, why: '<code>-=</code> busca un delegado igual al que se agregó, y dos lambdas escritas por separado no lo son. Usa un método con nombre (<code>+= Pintar</code> y <code>-= Pintar</code>) o guarda la lambda en una variable.' },
      { tema: 'State', q: 'En <code>Program.cs</code> la oleada termina con <code>porSalir == 0 &amp;&amp; enemX.Count == 0 &amp;&amp; !gameOver</code>. ¿Qué evita el <code>!gameOver</code>?', opts: ['Que el último bicho, al quitar la última vida, también active la victoria', 'Que el juego corra lento', 'Que el puntaje se guarde dos veces', 'Que la pausa se active sola'], ok: 0, why: 'Ese bicho deja vidas en 0 y la sala vacía en el mismo frame, así que sin el parche quedaban gameOver y gano en true. Con una máquina de estados, GameOver simplemente no tiene flecha hacia Victoria.' }
    ]
  };
})();
