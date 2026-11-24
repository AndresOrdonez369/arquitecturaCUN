(function () {
  const puertoCS = `// Solución con tres proyectos. Las flechas van SIEMPRE hacia el núcleo.
//   TurnoNocturno.Nucleo    (class library)   no referencia a nadie
//   TurnoNocturno.Consola   (ejecutable)      referencia a Nucleo
//   TurnoNocturno.Pruebas   (xUnit)           referencia a Nucleo
//
//   dotnet new classlib -n TurnoNocturno.Nucleo
//   dotnet new console  -n TurnoNocturno.Consola
//   dotnet add TurnoNocturno.Consola reference TurnoNocturno.Nucleo

// ---- Archivo: Nucleo/Puertos.cs  (el enchufe lo define quien lo necesita)
public interface IAudio { void Sonar(string nombre); }
public interface IReloj { float SegundosDesdeElUltimoFrame(); }

// ---- Archivo: Nucleo/Partida.cs
public class Partida
{
    readonly IAudio audio;
    public int Puntos { get; private set; }

    public Partida(IAudio audio) { this.audio = audio; }

    public void BichoEliminado(int valor)
    {
        Puntos += valor;
        audio.Sonar("bicho_muere");    // no sabe si es Beep, Unity o silencio
    }
}

// ---- Archivo: Consola/AudioConsola.cs  (el aparato que se conecta)
using System;

public class AudioConsola : IAudio
{
    // Beep con frecuencia y duración solo existe en Windows.
    // En Linux o macOS usa Console.Beep() sin parámetros.
    public void Sonar(string nombre) =>
        Console.Beep(nombre == "bicho_muere" ? 400 : 800, 30);
}

// ---- Archivo: Consola/Program.cs  (el único que conoce a todos)
var partida = new Partida(new AudioConsola());`;
  const puertoUnity = `// En Unity, cada carpeta con un archivo .asmdef es un módulo (un assembly).
//   Assets/Nucleo/TurnoNocturno.Nucleo.asmdef
//       "references": []   y   "noEngineReferences": true   (ni ve UnityEngine)
//   Assets/Juego/TurnoNocturno.Juego.asmdef
//       "references": ["TurnoNocturno.Nucleo"]
//   Assets/Pruebas/TurnoNocturno.Pruebas.asmdef
//       "references": ["TurnoNocturno.Nucleo"]
// Si Nucleo intenta usar algo de Juego, NO compila. La regla la cuida Unity.
// Bonus: al cambiar un archivo de Juego, Unity no recompila Nucleo.

using UnityEngine;

// Adaptador: vive en Juego y conecta el enchufe IAudio con el audio de Unity.
// Partida, IAudio e IReloj son los MISMOS archivos del proyecto de consola.
public class AudioUnity : MonoBehaviour, IAudio
{
    [SerializeField] AudioSource fuente;
    [SerializeField] AudioClip bichoMuere;
    [SerializeField] AudioClip disparo;

    public void Sonar(string nombre)
    {
        fuente.PlayOneShot(nombre == "bicho_muere" ? bichoMuere : disparo);
    }
}`;
  const busCS = `using System;
using System.Collections.Generic;

// Eventos: nombres en pasado, porque ya ocurrieron. Solo llevan datos.
// (En Unity usa struct o class en lugar de record, o agrega IsExternalInit.)
public record BichoMurio(string Tipo, int X, int Y);
public record OleadaTermino(int Numero);

public class BusDeEventos
{
    readonly Dictionary<Type, List<Delegate>> oyentes = new();

    public void Suscribir<T>(Action<T> oyente)
    {
        if (!oyentes.TryGetValue(typeof(T), out var lista))
            oyentes[typeof(T)] = lista = new List<Delegate>();
        lista.Add(oyente);
    }

    // Ojo: hay que pasar EL MISMO delegado que se suscribió.
    // Escribir otra vez la misma lambda crea otro delegado y no se quita nada.
    public void Desuscribir<T>(Action<T> oyente)
    {
        if (oyentes.TryGetValue(typeof(T), out var lista)) lista.Remove(oyente);
    }

    public void Publicar<T>(T evento)
    {
        if (!oyentes.TryGetValue(typeof(T), out var lista)) return;   // nadie oye: no pasa nada
        // ToArray: una copia, para que un oyente pueda desuscribirse mientras se avisa.
        foreach (var oyente in lista.ToArray()) ((Action<T>)oyente)(evento);
    }
}`;
  const busUsoCS = `using System;

var bus = new BusDeEventos();
int puntos = 0;

// Los oyentes sintonizan la emisora. No conocen al bicho.
// Puntos de Turno Nocturno: lento 10, rápido 20, tanque 50.
Action<BichoMurio> sumar = e => puntos += e.Tipo == "tanque" ? 50 : e.Tipo == "rapido" ? 20 : 10;
bus.Suscribir(sumar);
bus.Suscribir<BichoMurio>(e => Console.Beep());
bus.Suscribir<OleadaTermino>(e => Console.WriteLine("Oleada " + e.Numero + " superada"));

// El emisor transmite. No sabe quién escucha ni cuántos son.
bus.Publicar(new BichoMurio("tanque", 12, 7));
bus.Publicar(new OleadaTermino(1));
Console.WriteLine(puntos);   // 50

// Para desuscribir se usa la MISMA referencia guardada.
bus.Desuscribir(sumar);
bus.Publicar(new BichoMurio("lento", 3, 2));
Console.WriteLine(puntos);   // sigue en 50`;
  const busUnity = `using System;
using UnityEngine;

// El canal es un asset: se crea en el proyecto y se arrastra en el Inspector
// a quien publica y a quien escucha. (Cada clase va en su propio archivo.)
[CreateAssetMenu(menuName = "Turno Nocturno/Canal Bicho Murio")]
public class CanalBichoMurio : ScriptableObject
{
    public event Action<string, Vector2> AlPublicar;
    public void Publicar(string tipo, Vector2 pos) => AlPublicar?.Invoke(tipo, pos);
}

public class Bicho : MonoBehaviour
{
    [SerializeField] CanalBichoMurio canal;
    [SerializeField] string tipo = "lento";

    public void Morir()
    {
        canal.Publicar(tipo, transform.position);
        gameObject.SetActive(false);              // vuelve al pool (semana 5)
    }
}

public class Marcador : MonoBehaviour
{
    [SerializeField] CanalBichoMurio canal;
    int puntos;

    // El asset del canal sobrevive a la escena: si no te desuscribes,
    // guarda referencias a marcadores que ya fueron destruidos.
    void OnEnable()  { canal.AlPublicar += Sumar; }
    void OnDisable() { canal.AlPublicar -= Sumar; }
    void Sumar(string tipo, Vector2 pos) { puntos += tipo == "tanque" ? 50 : 10; }
}`;
  const luaOleada = `-- mods/oleada3.lua
-- Lo edita diseño con un bloc de notas. No hay que recompilar el juego.
oleada = {
    nombre = "Hora pico",
    bichos = {
        { tipo = "lento",  cantidad = 6, cada = 1.0 },
        { tipo = "rapido", cantidad = 4, cada = 0.6 },
        { tipo = "tanque", cantidad = 1, cada = 5.0 },
    }
}

-- Comportamiento: el motor pregunta "¿cuánto se mueve este bicho?"
-- y el script responde. El motor sigue siendo el que mueve.
function mover_zigzag(bicho, dt)
    local dx = -1
    if math.floor(bicho.y) % 4 < 2 then dx = 1 end
    return dx * 6 * dt, 3 * dt      -- avance en x, avance en y
end

-- Un mod también puede pedirle cosas al motor por la API que este expone:
-- juego.Aparecer("tanque", 12)`;
  const luaCS = `using System;
using System.IO;
using MoonSharp.Interpreter;      // paquete NuGet "MoonSharp" (intérprete de Lua escrito en C#)

var script = new Script();
script.DoString(File.ReadAllText("mods/oleada3.lua"));

// 1. Leer DATOS: la tabla "oleada"
Table oleada = script.Globals.Get("oleada").Table;
Console.WriteLine(oleada.Get("nombre").String);            // Hora pico

foreach (DynValue fila in oleada.Get("bichos").Table.Values)
{
    string tipo  = fila.Table.Get("tipo").String;
    int cantidad = (int)fila.Table.Get("cantidad").Number;  // Lua solo tiene double
    fabrica.Programar(tipo, cantidad);                      // la Factory de la semana 4
}

// 2. Llamar COMPORTAMIENTO: la función "mover_zigzag"
var bicho = new Table(script);
bicho["y"] = 7.5;
DynValue r = script.Call(script.Globals.Get("mover_zigzag"), bicho, 0.016);
float dx = (float)r.Tuple[0].Number;                        // dos valores de retorno: Tuple
float dy = (float)r.Tuple[1].Number;`;
  const luaApiCS = `using System;
using System.IO;
using MoonSharp.Interpreter;

// 1. Caja de arena: sin io, sin os.execute, sin load ni dofile.
//    El mod no puede borrar archivos ni leer el disco del jugador.
var script = new Script(CoreModules.Preset_SoftSandbox);

// 2. La avenida: el mod solo ve lo que expone ApiMod, nada más del motor.
UserData.RegisterType<ApiMod>();
script.Globals["juego"] = new ApiMod(fabrica);

// 3. Un mod roto no tumba el juego: se registra el error y se sigue.
try
{
    script.DoString(File.ReadAllText("mods/oleada3.lua"));
}
catch (InterpreterException e)          // errores de sintaxis y de ejecución
{
    Console.Error.WriteLine("[Mods] " + e.DecoratedMessage);   // archivo, línea y causa
}

public class ApiMod
{
    readonly FabricaDeBichos fabrica;
    public ApiMod(FabricaDeBichos fabrica) { this.fabrica = fabrica; }

    // En Lua:  juego.Aparecer("tanque", 12)
    public void Aparecer(string tipo, int x) => fabrica.Crear(tipo, x);
}`;
  const ecsCS = `// Mini ECS ilustrativo: una "hoja de cálculo" hecha con arrays.
const int Max = 10_000;

// Columnas = componentes. La fila i es la entidad i (un simple número).
float[] posX = new float[Max], posY = new float[Max];
float[] velY = new float[Max];
int[]   vida = new int[Max];
bool[]  viva = new bool[Max];
int cantidad = 0;

int Crear(float x, float y, float vy, int hp)
{
    int id = cantidad++;
    posX[id] = x; posY[id] = y; velY[id] = vy; vida[id] = hp; viva[id] = true;
    return id;
}

// Fórmulas = sistemas. Cada uno recorre SOLO las columnas que necesita,
// de corrido en memoria (localidad de datos, semana 5).
void SistemaMovimiento(float dt)
{
    for (int i = 0; i < cantidad; i++)
        if (viva[i]) posY[i] += velY[i] * dt;
}

void SistemaMuerte()
{
    for (int i = 0; i < cantidad; i++)
        if (viva[i] && vida[i] <= 0) viva[i] = false;
}

Crear(12, 0, 2f, 1);       // un bicho lento
Crear(20, 0, 1f, 3);       // un tanque: mismas columnas, otros valores
SistemaMovimiento(0.016f);
SistemaMuerte();`;
  const ecsUnity = `// Unity Entities (paquete oficial de ECS, parte de DOTS). Las mismas tres piezas:
//   Entidad     un identificador. No tiene código ni datos propios.
//   Componente  un struct con datos y nada más (IComponentData).
//   Sistema     código que recorre las entidades que tengan ciertos componentes.
using Unity.Burst;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;

// Componente: una columna.
public struct Velocidad : IComponentData { public float3 Valor; }

// Sistema: una fórmula. Recorre solo las filas con LocalTransform y Velocidad.
[BurstCompile]
public partial struct SistemaMovimiento : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        float dt = SystemAPI.Time.DeltaTime;
        foreach (var (t, v) in SystemAPI.Query<RefRW<LocalTransform>, RefRO<Velocidad>>())
            t.ValueRW.Position += v.ValueRO.Valor * dt;
    }
}

// Cuándo mirarlo: miles de entidades parecidas (balas, enjambres, tráfico).
// Cuándo no: 40 bichos en una sala de servidores. Ahí pesa más la claridad.`;

  const malPuerto = `// Nucleo/Partida.cs
public class Partida
{
    public int Puntos;

    public void BichoEliminado(int valor)
    {
        Puntos += valor;
        Console.Beep();
        File.WriteAllText("puntaje.txt",
            Puntos.ToString());
    }
}`;
  const bienPuerto = `// Nucleo/Partida.cs
public class Partida
{
    readonly IAudio audio;        // enchufes
    readonly IGuardado guardado;  // llegan por constructor
    public int Puntos;

    public void BichoEliminado(int valor)
    {
        Puntos += valor;
        audio.Sonar("bicho_muere");
        guardado.Guardar(Puntos);
    }
}`;
  const obsDirecto = `// Audio tiene que CONOCER a cada emisor
foreach (var bicho in bichos)
    bicho.AlMorir += audio.SonarMuerte;

jefe.AlMorir       += audio.SonarMuerte;
robot.AlSerHerido  += audio.SonarGolpe;
oleadas.AlTerminar += audio.SonarFanfarria;
// ...y lo mismo Puntaje, Efectos, Logros`;
  const obsBus = `// Audio solo conoce el bus y los eventos
bus.Suscribir<BichoMurio>(e => Sonar("muerte"));
bus.Suscribir<RobotHerido>(e => Sonar("golpe"));

// El bicho solo conoce el bus
bus.Publicar(new BichoMurio(tipo, x, y));`;

  // ---- versiones cortas para las slides
  const puertoCorto = `// Nucleo: no referencia a nadie
public interface IAudio { void Sonar(string nombre); }
public class Partida
{
    readonly IAudio audio;
    public int Puntos { get; private set; }
    public Partida(IAudio audio) { this.audio = audio; }
    public void BichoEliminado(int valor)
    {
        Puntos += valor;
        audio.Sonar("bicho_muere");
    }
}
// Consola: referencia a Nucleo
public class AudioConsola : IAudio
{
    public void Sonar(string nombre) => Console.Beep();
}`;
  const puertoUnityCorto = `// Assets/Nucleo/TurnoNocturno.Nucleo.asmdef
//   "references": [], "noEngineReferences": true
// Assets/Juego/TurnoNocturno.Juego.asmdef
//   "references": ["TurnoNocturno.Nucleo"]
// Si Nucleo usa algo de Juego, no compila.

using UnityEngine;

public class AudioUnity : MonoBehaviour, IAudio
{
    [SerializeField] AudioSource fuente;
    [SerializeField] AudioClip bichoMuere;

    public void Sonar(string nombre) =>
        fuente.PlayOneShot(bichoMuere);
}`;
  const busCorto = `public record BichoMurio(string Tipo, int X, int Y);
public class BusDeEventos
{
    readonly Dictionary<Type, List<Delegate>> oyentes = new();

    public void Suscribir<T>(Action<T> oyente)
    {
        if (!oyentes.TryGetValue(typeof(T), out var lista))
            oyentes[typeof(T)] = lista = new List<Delegate>();
        lista.Add(oyente);
    }

    public void Publicar<T>(T evento)
    {
        if (!oyentes.TryGetValue(typeof(T), out var l)) return;
        foreach (var o in l.ToArray()) ((Action<T>)o)(evento);
    }
}`;
  const busUnityCorto = `[CreateAssetMenu(menuName = "Turno/Canal Bicho Murio")]
public class CanalBichoMurio : ScriptableObject
{
    public event Action<string, Vector2> AlPublicar;
    public void Publicar(string tipo, Vector2 pos) =>
        AlPublicar?.Invoke(tipo, pos);
}

public class Marcador : MonoBehaviour
{
    [SerializeField] CanalBichoMurio canal;
    int puntos;

    void OnEnable()  { canal.AlPublicar += Sumar; }
    void OnDisable() { canal.AlPublicar -= Sumar; } // sin fugas
    void Sumar(string tipo, Vector2 pos) => puntos += 10;
}`;
  const luaCorto = `-- mods/oleada3.lua: lo edita diseño, sin recompilar
oleada = {
    nombre = "Hora pico",
    bichos = {
        { tipo = "lento",  cantidad = 6, cada = 1.0 },
        { tipo = "rapido", cantidad = 4, cada = 0.6 },
        { tipo = "tanque", cantidad = 1, cada = 5.0 },
    }
}

-- El motor pregunta cuánto se mueve; el script responde
function mover_zigzag(bicho, dt)
    local dx = -1
    if math.floor(bicho.y) % 4 < 2 then dx = 1 end
    return dx * 6 * dt, 3 * dt
end`;
  const luaCSCorto = `using MoonSharp.Interpreter;   // NuGet "MoonSharp"

var script = new Script();
script.DoString(File.ReadAllText("mods/oleada3.lua"));

// 1. Leer datos
Table oleada = script.Globals.Get("oleada").Table;
foreach (DynValue fila in oleada.Get("bichos").Table.Values)
    fabrica.Programar(fila.Table.Get("tipo").String,
        (int)fila.Table.Get("cantidad").Number);

// 2. Llamar comportamiento
var bicho = new Table(script);
bicho["y"] = 7.5;
DynValue r = script.Call(
    script.Globals.Get("mover_zigzag"), bicho, 0.016);
float dx = (float)r.Tuple[0].Number;`;
  const luaApiCorto = `// Caja de arena: sin io, sin os.execute, sin load
var script = new Script(CoreModules.Preset_SoftSandbox);

// La avenida: el mod solo ve lo que expone ApiMod
UserData.RegisterType<ApiMod>();
script.Globals["juego"] = new ApiMod(fabrica);

try { script.DoString(File.ReadAllText(ruta)); }
catch (InterpreterException e)     // mod roto: se avisa
{ Console.Error.WriteLine("[Mods] " + e.DecoratedMessage); }

public class ApiMod      // en Lua: juego.Aparecer("tanque", 12)
{
    readonly FabricaDeBichos f;
    public ApiMod(FabricaDeBichos f) { this.f = f; }
    public void Aparecer(string t, int x) => f.Crear(t, x);
}`;

  window.CLASE = {
    n: 6,
    titulo: 'Escalabilidad y modularidad',
    objetivos: [
      'Dividir un juego en módulos y dibujar sus dependencias de modo que todas apunten hacia las reglas del juego.',
      'Explicar qué es un bus de eventos, en qué se diferencia del Observer directo y qué riesgos trae.',
      'Decidir qué parte de un juego va en el motor (C# o C++) y qué parte en scripts de Lua o en datos, y cómo aislar un mod.',
      'Describir un ECS con la imagen de una hoja de cálculo y decir cuándo vale la pena y cuándo no.'
    ],
    analogia: 'Una ciudad funciona porque está hecha de barrios: cada uno resuelve lo suyo (su panadería, su parque) y se conectan por avenidas, no por los patios de las casas. Un juego que crece igual: módulos con una tarea clara, conectados por pocas vías anchas y con sentido único hacia el centro.',
    agenda: [
      ['0:00', 'Apertura: el juego crece de 1 a 5 programadores'],
      ['0:10', 'Módulos y dirección de las dependencias, con demo'],
      ['0:35', 'Bus de eventos: la emisora, sus riesgos y las fugas'],
      ['0:55', 'Lua como capa de mods: datos, comportamiento y caja de arena'],
      ['1:15', 'ECS: la hoja de cálculo y cuándo se nota'],
      ['1:28', 'Abre el ACA 2: lectura de la consigna'],
      ['1:38', 'Actividad: mapa de módulos de tu rescate'],
      ['1:55', 'Cierre y quiz de la clase']
    ],
    conceptos: [
      { t: 'Módulo', d: 'Grupo de clases que cambian juntas por la misma razón y que el resto usa por una interfaz pequeña. En .NET suele ser un proyecto; en Unity, una carpeta con su archivo .asmdef.', ej: 'En Turno Nocturno rescatado, Nucleo guarda las reglas de bichos, oleadas y puntaje; Consola guarda teclado y pantalla.' },
      { t: 'Dirección de dependencias', d: 'Regla de que las flechas de «depende de» apuntan hacia las reglas del juego y nunca hacia los detalles técnicos: consola, motor, disco o audio.', ej: 'Consola referencia a Nucleo para dibujar la partida; Nucleo no sabe que existe una consola, por eso viaja a Unity sin tocarse.' },
      { t: 'Puerto y adaptador', d: 'El puerto es una interfaz que declara el núcleo según lo que necesita. El adaptador es la clase de afuera que la implementa con una tecnología concreta.', ej: '<code>IAudio</code> vive en el núcleo; <code>AudioConsola</code> (Console.Beep) y <code>AudioUnity</code> (AudioSource) son dos adaptadores del mismo puerto.' },
      { t: 'Dependencia circular', d: 'Dos o más módulos que se necesitan mutuamente, directa o indirectamente. En la práctica son un solo módulo grande: no se compilan, prueban ni reutilizan por separado.', ej: 'Datos usa Audio, Audio usa Consola y Consola usa Datos: no puedes llevar Datos a otro juego sin arrastrar los otros dos.' },
      { t: 'Bus de eventos', d: 'Intermediario donde los emisores publican hechos ya ocurridos y los oyentes se suscriben por tipo de evento, sin conocerse entre sí.', ej: 'Un bicho publica <code>BichoMurio</code>; Puntaje, Audio, Efectos y Logros lo oyen sin que el bicho sepa que existen.' },
      { t: 'Fuga de suscripción', d: 'Oyente que se suscribió y nunca se desuscribió. El bus sigue guardando la referencia: el objeto no se libera y lo siguen llamando aunque ya no esté en el juego.', ej: 'Cierras la pantalla de puntajes y, al morir un bicho, salta un <code>MissingReferenceException</code> dentro de ella.' },
      { t: 'Capa de scripting y caja de arena', d: 'Código en un lenguaje embebido (Lua, Luau) que el motor carga sin recompilarse. Decide contenido; el motor ejecuta lo pesado. La caja de arena limita qué puede tocar el script.', ej: '<code>mods/oleada3.lua</code> define la oleada y el zigzag; MoonSharp lo carga con <code>Preset_SoftSandbox</code>, sin acceso al disco del jugador.' },
      { t: 'ECS (Entidad, Componente, Sistema)', d: 'Arquitectura donde la entidad es solo un identificador, los componentes son datos sin código y los sistemas recorren las entidades que tienen ciertos componentes, con datos del mismo tipo seguidos en memoria.', ej: 'Un simulador con 50 000 peatones: el sistema Movimiento recorre de corrido todas las posiciones y velocidades.' }
    ],
    industria: [
      { j: 'World of Warcraft', t: 'La interfaz del juego está escrita en Lua y XML, y los addons de los jugadores usan la misma API: se registran a eventos del juego y reemplazan piezas de la interfaz sin tocar el motor.', src: 'Whitehead, J. y Roe, R. <i>World of Warcraft Programming</i>, 2.ª ed., Wiley, 2010.' },
      { j: 'Roblox', t: 'Toda la lógica que escriben los creadores va en Luau, un lenguaje derivado de Lua 5.1 con tipado gradual. El motor queda fijo y el contenido vive en scripts.', src: 'Documentación oficial: luau.org y create.roblox.com/docs/luau' },
      { j: 'Factorio', t: 'Los mods son scripts de Lua que el juego carga al arrancar. Se suscriben a eventos del motor, por ejemplo <code>on_entity_died</code>: un bus de eventos abierto a la comunidad.', src: 'Factorio Lua API, documentación oficial (lua-api.factorio.com)' },
      { j: 'Overwatch (Blizzard)', t: 'El gameplay se organizó como ECS: entidades como identificadores, componentes solo con datos y sistemas con la lógica. La charla explica cómo esa separación ordenó también el código de red.', src: 'Ford, T. «Overwatch Gameplay Architecture and Netcode», GDC 2017.' },
      { j: 'Unity Entities (DOTS)', t: 'El ECS oficial de Unity: <code>IComponentData</code> para los datos, <code>ISystem</code> para la lógica y consultas que recorren solo las entidades con ciertos componentes, agrupadas por arquetipo en memoria.', src: 'Documentación oficial de Unity: manual del paquete Entities.' }
    ],
    errores: [
      { mito: 'Separar el código en carpetas ya es modularizar.', real: 'Una carpeta no impone nada: si una clase del núcleo usa <code>PantallaConsola</code>, compila igual. Se nota el día que llevas el juego a Unity y toca abrir el núcleo. Con proyectos separados o <code>.asmdef</code>, el compilador cuida la regla.' },
      { mito: 'Si el núcleo llama al audio, entonces depende del audio.', real: 'Depender es conocer el tipo. El núcleo llama a <code>IAudio</code>, que es suya; la flecha de compilación va desde el adaptador hacia el núcleo. Por eso puedes probar el núcleo con un audio de mentiras.' },
      { mito: 'Con un bus de eventos ya no hay acoplamiento.', real: 'El acoplamiento se vuelve invisible. Si cambias los campos de <code>BichoMurio</code> rompes oyentes que no ves, y si el evento se llama <code>ReproducirSonido</code> es una orden disfrazada. Se nota cuando nadie sabe quién reacciona a qué.' },
      { mito: 'Para desuscribir basta con escribir otra vez la misma lambda.', real: 'Cada lambda es un delegado distinto: <code>Remove</code> no la encuentra y el oyente sigue vivo. Guarda la referencia en una variable o usa un método con nombre, como <code>Sumar</code> en <code>OnEnable</code> y <code>OnDisable</code>.' },
      { mito: 'ECS siempre es más rápido, así que es mejor arquitectura.', real: 'Gana con miles de entidades parecidas y cuando el Profiler dice que el cuello es recorrer objetos. Con 60 entidades la diferencia son microsegundos y lo que crece es la complejidad.' }
    ],
    codigoIntro: 'Cuatro piezas para que el juego crezca sin enredarse: un enchufe definido en el núcleo, una emisora de eventos, un script de Lua que el juego lee al arrancar (con su caja de arena) y una hoja de cálculo hecha con arrays.',
    codigo: [
      { titulo: 'Proyectos y un puerto', desc: 'Tres proyectos y una regla: el núcleo no referencia a nadie. La interfaz <code>IAudio</code> vive en el núcleo; quien sabe de consola o de Unity la implementa por fuera. El <code>Program.cs</code> de Consola es el único que conoce a todos y los conecta.',
        tabs: [{ lang: 'C#', src: puertoCS }, { lang: 'Unity', label: 'Unity (.asmdef)', src: puertoUnity }] },
      { titulo: 'Bus de eventos', desc: 'Una emisora: quien publica no sabe quién escucha. Fíjate en dos detalles: la copia con <code>ToArray</code> y que para desuscribir hace falta la misma referencia. En Unity la misma idea se hace con un ScriptableObject que sirve de canal.',
        tabs: [{ lang: 'C#', label: 'C# (el bus)', src: busCS }, { lang: 'C#', label: 'C# (uso)', src: busUsoCS }, { lang: 'Unity', label: 'Unity (canal)', src: busUnity }] },
      { titulo: 'Lua como capa de mods', desc: 'El script lo escribe diseño. El motor lo carga al arrancar: lee la tabla de la oleada y llama a la función de movimiento. La tercera pestaña aísla el mod: caja de arena, una API pequeña y errores que no tumban el juego. Usa MoonSharp, un intérprete de Lua escrito en C#.',
        tabs: [{ lang: 'Lua', label: 'oleada3.lua', src: luaOleada }, { lang: 'C#', label: 'C# (MoonSharp)', src: luaCS }, { lang: 'C#', label: 'C# (API y caja de arena)', src: luaApiCS }] },
      { titulo: 'Mini ECS con arrays', desc: 'Entidades como números de fila, componentes como columnas y sistemas como fórmulas. No es un ECS real: es la idea desnuda. La pestaña de Unity muestra las mismas piezas con la API del paquete Entities.',
        tabs: [{ lang: 'C#', src: ecsCS }, { lang: 'Unity', label: 'Unity (Entities)', src: ecsUnity }] }
    ],
    tarea: [
      'Lee completa la consigna del <a href="docs/aca2.html">ACA 2</a> (32 %). Abre el 28 de diciembre de 2026 y cierra el domingo 10 de enero de 2027.',
      'Termina el mapa de módulos de tu rescate: cajas, flechas de dependencia y ningún ciclo. Va como primera figura de tu entrega.',
      'Crea la solución con tres proyectos (<code>Nucleo</code>, <code>Consola</code>, <code>Pruebas</code>) y mueve al núcleo una sola clase que no use <code>Console</code>. Que compile.',
      'Trae a la semana 7 un bug real de tu rescate, aunque ya lo hayas arreglado. Lo usamos para practicar el método de depuración.'
    ],
    lecturas: [
      'Nystrom, R. <i>Game Programming Patterns</i>, capítulos "Event Queue" y "Component" (gratis en gameprogrammingpatterns.com).',
      'Gregory, J. (2018). <i>Game Engine Architecture</i> (3.ª ed.), cap. 16 (sistemas de gameplay, eventos y scripting).',
      'Documentación de Unity: "Assembly definitions", "Create modular game architecture in Unity with ScriptableObjects" y el manual del paquete Entities.',
      'Ford, T. (2017). "Overwatch Gameplay Architecture and Netcode". GDC 2017 (video en GDC Vault).',
      'Ierusalimschy, R. <i>Programming in Lua</i>, parte IV (la relación entre Lua y el programa anfitrión).'
    ],

    slides: [
      { kind: 'portada', title: 'Escalabilidad y modularidad',
        lead: 'Semana 6 · Arquitectura de Videojuegos',
        full: [
          { ul: ['Cómo crece un juego sin volverse un nudo.', 'Una ciudad por barrios, una emisora de radio, un tablero con reglas de la casa y una hoja de cálculo.', 'Hoy abre el <b>ACA 2</b>: al final leemos la consigna.'] },
          { pie: 'Flecha derecha: avanza paso a paso · <span class="kbd">F</span> pantalla completa · <span class="kbd">N</span> notas del docente' }
        ],
        nota: '2 minutos. La sesión se movió de día por fin de año: confirma asistencia y recuerda que queda grabada. Anuncia que hay 10 minutos reservados para el ACA 2 al final, así no preguntan a mitad de clase. Pregunta de calentamiento: ¿qué es lo más grande que han programado y cuántos eran? Espera respuestas de 1 a 3 personas: hoy imaginamos 5.' },

      { kind: 'reto', title: 'Turno Nocturno tuvo éxito',
        lead: 'Pasa de 1 a 5 programadores y de 3 a 40 tipos de bicho. Todos sobre el mismo Program.cs.',
        izq: 40,
        left: [
          { check: { q: '¿Qué se rompe primero?', opts: ['El computador: 40 bichos son demasiados', 'El equipo: cinco personas en un archivo se pisan', 'El lenguaje: C# no sirve para juegos grandes', 'Nada, solo hay que escribir más rápido'], ok: 1, why: 'Cuarenta bichos no le hacen cosquillas al procesador. Lo que colapsa es la gente: conflictos al mezclar cambios y miedo a tocar.' } }
        ],
        right: [{ fig: 'crecer', paso: true }],
        nota: '5 minutos. Pregunta: ¿qué se rompe primero? Que voten en el chat antes de revelar. Respuesta esperada: el equipo (B); muchos dirán el computador. Avanza para mostrar la figura: sube el equipo a 5 en «Un solo archivo», luego los bichos a 40, y cambia a «Por módulos». Pregunta quién ha perdido una tarde por un conflicto de mezcla en Git. Cierre: un juego crece en contenido, código y equipo a la vez.' },

      { kind: 'analogia', title: 'Una ciudad por barrios',
        lead: 'Suma barrios y cuenta las conexiones.',
        izq: 56,
        left: [{ fig: 'ciudad' }],
        right: [
          { mapa: [['Barrio', 'Módulo<small>clases que cambian juntas</small>'], ['Avenida', 'Interfaz pública<small>pocas, anchas y con nombre</small>'], ['Atajo por el patio', 'Dependencia que nadie planeó'], ['Plano de la ciudad', 'Mapa de módulos']], de: 'En la ciudad', a: 'En el juego', pasos: true }
        ],
        nota: '5 minutos. Primero «Por los patios» y sube a 6 barrios: 15 atajos (n por n menos 1, sobre 2). Luego «Por avenidas»: 6. Conecta con la cocina de la semana 1: una estación era una clase; un barrio es un grupo de clases. Pregunta: ¿cuáles serían los barrios de Turno Nocturno? Respuesta esperada: reglas, pantalla, sonido, datos, entrada. Anótalos: los usa la demo de dependencias.' },

      { kind: 'reto', title: 'Predice: Turno Nocturno se va a Unity',
        izq: 44,
        left: [
          { panel: ['<code>Partida</code> llama a <code>Console.Beep</code> y a <code>File.WriteAllText</code>.'], h: 'Versión A' },
          { panel: ['<code>Partida</code> recibe <code>IAudio</code> e <code>IGuardado</code> por el constructor.'], h: 'Versión B' }
        ],
        right: [{ check: { q: '¿Qué pasa con la clase Partida en cada versión?', opts: ['En las dos hay que reescribirla', 'A queda amarrada a la consola; B no se toca: solo escribes aparatos nuevos', 'B es más lenta y hay que optimizarla', 'Ninguna se puede llevar a Unity'], ok: 1, why: 'A está amarrada a Console y a File: en Unity hay que abrirla y reescribirla. B solo conoce sus enchufes: escribes AudioUnity y GuardadoUnity, y las reglas viajan intactas.' } }],
        nota: '3 minutos. Pregunta: ¿cuál de las dos versiones sobrevive al viaje a Unity sin abrirse? Respuesta esperada: B. Que respondan antes de pasar; no expliques todavía por qué. La siguiente slide lo muestra con la figura y la de después con el código.' },

      { kind: 'idea', title: 'Las flechas apuntan hacia las reglas',
        izq: 58,
        left: [{ fig: 'nucleo' }],
        right: [
          { clave: 'El núcleo no conoce consola, Unity, disco ni audio. Los detalles dependen de él.' },
          { ul: ['<b>Núcleo:</b> cambia cuando cambia el diseño.', '<b>Detalles:</b> cambian cuando cambia la tecnología.', 'El enchufe lo define quien lo necesita.'], pasos: true }
        ],
        nota: '6 minutos. Cambia a Unity sin atajo: cero cambios en el núcleo. Luego marca el atajo y vuelve a Unity: no compila. En los libros esto se llama puertos y adaptadores: el puerto es el enchufe, el adaptador es el aparato. Es la D de SOLID de la semana 2 subida de clase a módulo. Pregunta: si el núcleo llama a Sonar, ¿depende del audio? Respuesta esperada: no, depende de IAudio, que es suya. Error común: creer que depender es llamar.' },

      { kind: 'antipatron', title: 'El mismo método, dos direcciones',
        lead: 'Hacen lo mismo en pantalla. Mira qué conoce cada una.',
        top: true,
        full: [{ compare: { a: { label: 'El núcleo conoce los detalles', lang: 'C#', src: malPuerto }, b: { label: 'Los detalles se enchufan al núcleo', lang: 'C#', src: bienPuerto } } }],
        nota: '4 minutos. Pregunta: ¿cuántas tecnologías conoce cada versión? Respuesta esperada: la izquierda dos (consola y disco), la derecha cero. El código de la derecha no es más largo: solo cambió quién sabe qué. Además se puede probar con un audio de mentiras (semana 7). Si preguntan quién crea el AudioConsola: el Program.cs de Consola, el único que conoce a todos.' },

      { kind: 'codigo', title: 'Tres proyectos y un enchufe',
        izq: 34,
        left: [
          { big: 'La regla deja de ser promesa cuando la cuida el compilador.' },
          { pie: 'Nucleo no referencia a Consola: no puede usar <code>PantallaConsola</code> ni <code>AudioConsola</code> ni queriendo.', paso: true }
        ],
        right: [{ code: [{ lang: 'C#', label: 'C# (dos proyectos)', src: puertoCorto }, { lang: 'Unity', label: 'Unity (.asmdef)', src: puertoUnityCorto }], marca: [
          { l: [2], t: '<b>El enchufe</b> vive en el núcleo: lo define quien lo necesita.' },
          { l: [5, 7], t: 'El aparato llega por el constructor. Partida no sabe cuál es.' },
          { l: [11], t: 'Suena sin saber si es Beep, Unity o silencio.' },
          { l: [14, 15, 16, 17, 18], t: '<b>El aparato</b> vive afuera y apunta hacia adentro.' }
        ] }],
        nota: '6 minutos. Muestra en vivo: dotnet new classlib, dotnet new console, dotnet add reference (los comandos están en la página de la clase). Pregunta: ¿qué pasa si escribes new AudioConsola() dentro de Nucleo? Respuesta esperada: no compila, Nucleo no ve ese proyecto. Ojo: Console.Beep sí compilaría, porque Console es de la biblioteca base de .NET; eso se cuida con revisión. En Unity, noEngineReferences va más lejos: Nucleo ni siquiera ve UnityEngine.' },

      { kind: 'demo', title: 'Arma el mapa de dependencias',
        lead: 'Toca el módulo que depende y luego aquel del que depende. Coral: ciclos y flechas que salen del núcleo.',
        izq: 36, top: true,
        left: [
          { check: { q: 'Nucleo y Consola están en proyectos separados y se referencian entre sí. ¿Qué pasa?', opts: ['Compila normal, solo es feo', 'El compilador se niega: no puede construir ninguno primero', 'Corre más lento', 'Solo falla en Unity'], ok: 1, why: 'Separar en proyectos convierte el ciclo en error de compilación, lo mejor que te puede pasar. En un solo proyecto el ciclo es silencioso y las clases quedan soldadas.' } }
        ],
        right: [{ fig: 'dependencias' }],
        nota: '8 minutos. Pregunta el check primero; respuesta esperada: B. Estado inicial de la figura: el núcleo conoce todo, como el espagueti. Pide a un estudiante que dicte cómo voltear cada flecha. Luego «Enredado» para ver un ciclo de tres. Pregunta: ¿con qué se rompe un ciclo? Respuesta esperada: una interfaz del lado del núcleo o un evento. Consola es el ejecutable: el único que puede conocerlos a todos.' },

      { kind: 'analogia', title: 'El bus de eventos es una emisora',
        lead: 'El locutor transmite sin saber quién lo oye.',
        izq: 58,
        left: [{ fig: 'radio' }],
        right: [
          { mapa: [['Locutor', 'Quien publica'], ['Emisora', 'Bus de eventos'], ['Sintonizar', 'Suscribirse'], ['Radio apagado', 'Oyente que se desuscribió']], de: 'En la radio', a: 'En el juego', pasos: true }
        ],
        nota: '4 minutos. Transmite con emisora, apaga dos oyentes y transmite: el locutor ni se entera. Luego «Sin emisora» con un oyente apagado: falla el locutor. Pregunta: ¿qué patrón de la semana 3 se parece a «Sin emisora»? Respuesta esperada: Observer directo, donde cada oyente se suscribe al objeto concreto.' },

      { kind: 'idea', title: 'Observer directo contra bus',
        lead: 'Con 40 tipos de bicho, cada oyente tendría que conocer a los 40 emisores.',
        top: true,
        full: [
          { compare: { a: { label: 'El oyente conoce a cada emisor', lang: 'C#', src: obsDirecto }, b: { label: 'Todos conocen solo la emisora', lang: 'C#', src: obsBus } } },
          { clave: 'Observer sigue sirviendo de uno a uno. El bus es para avisos que le interesan a muchos módulos.', paso: true }
        ],
        nota: '4 minutos. Pregunta: ¿qué módulos quieren enterarse cuando muere un bicho? Respuesta esperada: puntaje, audio, efectos, logros, guardado. Con Observer directo cada uno conoce a cada emisor; con el bus, cada uno conoce un tipo de evento. Aclara que no se botan los eventos de C#: el botón de la pantalla de pausa puede seguir avisando directo a quien lo contiene.' },

      { kind: 'codigo', title: 'Una emisora en 18 líneas',
        izq: 30,
        left: [
          { big: 'Un diccionario: tipo de evento, lista de oyentes.' },
          { pie: 'En Unity la misma idea es un ScriptableObject que sirve de canal.', paso: true }
        ],
        right: [{ code: [{ lang: 'C#', label: 'C# (el bus)', src: busCorto }, { lang: 'Unity', label: 'Unity (canal)', src: busUnityCorto }], marca: [
          { l: [1], t: '<b>El evento:</b> nombre en pasado y solo datos.' },
          { l: [4], t: 'Una lista de oyentes por cada tipo de evento.' },
          { l: [6, 7, 8, 9, 10, 11], t: '<b>Suscribir</b> es sintonizar la emisora.' },
          { l: [15], t: 'Si nadie oye, no pasa nada. El emisor no falla.' },
          { l: [16], t: 'Avisa a cada oyente sobre una copia (<code>ToArray</code>): así uno puede desuscribirse en medio del aviso.' }
        ] }],
        nota: '6 minutos. Pregunta: ¿por qué ToArray y no recorrer la lista directo? Respuesta esperada: si un oyente se desuscribe mientras se avisa, la lista cambia y el foreach lanza InvalidOperationException. En Unity: record necesita IsExternalInit, usa struct o class. En la pestaña de Unity señala OnEnable y OnDisable: quien se suscribe se desuscribe. El uso completo, con Desuscribir, está en la página de la clase.' },

      { kind: 'demo', title: 'Publica un evento y apaga un oyente',
        izq: 36,
        left: [
          { check: { q: 'Apagas Audio y muere un bicho. ¿Se suma el puntaje?', opts: ['No: el bus se detiene', 'Sí: Puntaje sigue sintonizado y no depende de Audio', 'Solo si Audio vuelve a encender', 'El bicho lanza un error'], ok: 1, why: 'Cada oyente es independiente. El bus avisa a los que estén sintonizados y el emisor ni se entera de los demás.' } }
        ],
        right: [{ fig: 'bus' }],
        nota: '5 minutos. Respuesta esperada del check: B. Que predigan antes de cada clic. Luego apaga los cuatro oyentes y publica: el emisor no falla. Pregunta incómoda para la siguiente slide: si nadie oyó OleadaTermino, ¿cómo te das cuenta? Respuesta esperada: no te das cuenta; por eso los eventos se documentan y se registran.' },

      { kind: 'antipatron', title: 'La emisora pirata: riesgos del bus',
        izq: 40,
        left: [
          { tabla: { head: ['Riesgo', 'Regla'], rows: [['<b>Eventos invisibles</b>', 'Pocos, en un archivo y documentados'], ['<b>Orden</b>', 'Ningún oyente depende de que otro oyó primero'], ['<b>Fugas</b>', 'Quien se suscribe se desuscribe'], ['<b>Órdenes disfrazadas</b>', 'Nombres en pasado: <code>BichoMurio</code>']] }, pasos: true }
        ],
        right: [{ fig: 'fuga', paso: true }],
        nota: '7 minutos. Recorre la tabla. Luego avanza a la figura: abre, cierra y haz morir un bicho «Con OnDisable»; repite «Sin OnDisable» abriendo dos veces. Pregunta: ¿por qué el bus llama a una pantalla cerrada? Respuesta esperada: porque su lista todavía guarda la referencia. Si un evento se llama ReproducirSonido es una orden y el acoplamiento sigue ahí. Criterio para el ACA 2: entre 4 y 8 eventos; si llevan 30, usan el bus para todo.' },

      { kind: 'analogia', title: 'El tablero y las reglas de la casa',
        lead: 'El tablero no cambia. Las reglas de la casa, sí: cada grupo las ajusta sin fabricar otro tablero.',
        izq: 58,
        left: [{ fig: 'mods' }],
        right: [
          { mapa: [['Tablero y fichas', 'Motor en C#<small>bucle, colisiones, pool</small>'], ['Reglas de la casa', 'Scripts de Lua<small>oleadas, movimiento, balance</small>'], ['El grupo de amigos', 'Diseño y quienes hacen mods']], de: 'Juego de mesa', a: 'Turno Nocturno', pasos: true }
        ],
        nota: '4 minutos. Cambia entre los tres scripts: el bicho cambia y el motor no se recompila. Luego «Hacer ese cambio en C#». Ya conocen Lua por LÖVE: allá Lua era todo el juego, aquí es solo la capa de encima. Pregunta: ¿qué pasa si las reglas de la casa permiten mover el tablero? Respuesta esperada: el juego deja de ser confiable; por eso el script decide y el motor ejecuta.' },

      { kind: 'codigo', title: 'Lua: datos, comportamiento y límites',
        izq: 36,
        left: [
          { check: { q: 'Diseño quiere la oleada 3 con dos tanques y un zigzag más ancho. ¿Quién cambia qué?', opts: ['Un programador edita Program.cs y recompila', 'Diseño edita el .lua y vuelve a abrir el juego', 'Hay que reinstalar el juego', 'No se puede sin Unity'], ok: 1, why: 'Los números y el comportamiento viven fuera del ejecutable. Es la carta del restaurante de la semana 4, ahora con lógica además de datos.' } }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'oleada3.lua', src: luaCorto }, { lang: 'C#', label: 'C# (MoonSharp)', src: luaCSCorto }, { lang: 'C#', label: 'C# (caja de arena)', src: luaApiCorto }], marca: [
          { l: [1], t: 'Un archivo de texto fuera del ejecutable.' },
          { l: [5, 6, 7], t: '<b>Datos:</b> la composición de la oleada.' },
          { l: [12, 13, 14, 15, 16], t: '<b>Comportamiento:</b> el script responde cuánto moverse; el motor mueve.' }
        ] }],
        nota: '10 minutos. Respuesta esperada del check: B. Recorre las tres pestañas: en C# hay dos usos (leer una tabla y llamar una función) y luego los límites. Pregunta: ¿qué pasaría si un mod descargado de internet ejecuta os.remove? Respuesta esperada: con Preset_SoftSandbox esa función no existe; el error se captura con InterpreterException y el juego sigue. MoonSharp es ilustrativo; para el ACA 2 vale JSON o Lua.' },

      { kind: 'demo', title: '¿Motor o script? Reparte el trabajo',
        izq: 34,
        left: [
          { big: '¿Corre en cada frame o cambia cada semana?' },
          { ul: ['<b>Motor:</b> rápido, estable y probado.', '<b>Script:</b> lo que diseño ajusta a diario.', '<b>Entre los dos:</b> una API pequeña, como una avenida.'], pasos: true }
        ],
        right: [{ fig: 'motorOScript' }],
        nota: '5 minutos. Que el grupo dicte cada tarjeta antes de que hagas clic. Respuesta esperada: motor para colisiones, pool, paso fijo y dibujo; script para oleada, zigzag, diálogo y precios. Discusión que vale la pena: el diálogo del jefe podría ser solo datos (JSON) si no tiene lógica. Pregunta de cierre: ¿qué haría tu rescate con un bicho nuevo? Respuesta esperada: una fila en datos o un script, cero líneas en el núcleo.' },

      { kind: 'industria', title: 'En juegos reales: motor abajo, Lua arriba',
        full: [
          { juegos: [
            { j: 'World of Warcraft', t: 'La interfaz está escrita en Lua y XML. Los addons de los jugadores usan la misma API y reaccionan a eventos del juego.', src: 'Whitehead y Roe, <i>World of Warcraft Programming</i>, Wiley, 2010' },
            { j: 'Roblox', t: 'La lógica de cada experiencia se escribe en Luau, derivado de Lua 5.1 con tipos graduales. El motor no cambia.', src: 'Documentación oficial: luau.org y create.roblox.com' },
            { j: 'Factorio', t: 'Los mods son scripts de Lua que se suscriben a eventos del motor, como <code>on_entity_died</code>.', src: 'Factorio Lua API (lua-api.factorio.com)' }
          ], pasos: true },
          { clave: 'El corte de hoy: lo pesado compilado, lo que cambia en scripts y eventos entre los dos.', paso: true }
        ],
        nota: '3 minutos. Pregunta: ¿qué tienen en común los tres? Respuesta esperada: un motor fijo, una API pequeña hacia afuera y eventos a los que el script se suscribe. Factorio es el bus de hoy abierto a miles de modders. Si alguien juega WoW o Roblox, que cuente un addon o una experiencia que conozca.' },

      { kind: 'analogia', title: 'ECS: el juego como hoja de cálculo',
        izq: 60,
        left: [{ fig: 'hojaCalculo' }],
        right: [
          { mapa: [['Fila', 'Entidad<small>solo un número</small>'], ['Columna', 'Componente<small>solo datos, sin código</small>'], ['Fórmula', 'Sistema<small>recorre las filas con sus columnas</small>']], de: 'Hoja de cálculo', a: 'ECS', pasos: true },
          { pie: 'ECS: Entidad, Componente, Sistema. Lo usan Overwatch (GDC 2017) y Unity Entities.', paso: true }
        ],
        nota: '5 minutos. Ejecuta Movimiento: solo filas con pos y vel; la batería no. Golpe: solo filas con vida. Pregunta: ¿en qué se diferencia del patrón Componente de la semana 2? Respuesta esperada: allá cada objeto cargaba datos y código; aquí los datos van por columnas y el código vive en los sistemas. Un tanque es una fila con vida 3, no una clase. El código de Unity Entities está en la página de la clase.' },

      { kind: 'reto', title: '¿Cuándo vale la pena un ECS?',
        izq: 40,
        left: [
          { check: { q: 'Turno Nocturno tiene máximo 40 bichos y 20 chispas. ¿Lo pasas a ECS para el ACA 2?', opts: ['Sí, siempre es más rápido', 'Sí, Unity lo recomienda para todo', 'No: con 60 entidades el problema es de claridad, no de velocidad', 'No, ECS solo existe en C++'], ok: 2, why: 'Medir antes de optimizar (semana 5). Con 60 entidades, un ECS agrega complejidad y no quita ningún tirón. Con miles de entidades parecidas, y si el Profiler lo confirma, sí vale.' } },
          { clave: 'ECS es una herramienta para un problema concreto, no un nivel superior.', paso: true }
        ],
        right: [{ fig: 'ecsEscala', paso: true }],
        nota: '6 minutos. Pregunta el check; respuesta esperada: C. Luego avanza a la figura: en Movimiento con 60 entidades, la diferencia es de microsegundos; sube a 200 000 y se come medio frame. Cambia a Golpe: los objetos traen 4 bloques para usar 4 casillas. Las cifras son ilustrativas: muestran el orden de magnitud. Si alguien quiere ECS en el ACA 2, que lo justifique con una medición.' },

      { kind: 'idea', title: 'Abre el ACA 2: el rescate',
        lead: 'Ya diagnosticaste a Turno Nocturno. Ahora lo operas. Vale 32 % y cierra el domingo 10 de enero de 2027.',
        top: true,
        full: [
          { tabla: { head: ['Pide', 'Lo ves en'], rows: [['Refactor con los patrones de tu plano', 'Semanas 2 a 4 y hoy'], ['Object pool medido: antes y después', 'Semana 5'], ['Bichos y oleadas en JSON o Lua', 'Semana 4 y hoy'], ['Al menos 8 pruebas unitarias', 'Semana 7'], ['Informe de un bug depurado con método', 'Semana 7']] }, pasos: true },
          { pie: 'Consigna y rúbrica: <a href="docs/aca2.html">docs/aca2.html</a>', paso: true }
        ],
        nota: '10 minutos. Abre docs/aca2.html y léela con ellos. Preguntas esperadas: ¿puede ser en Unity? ¿es en equipo? ¿sirve el plano del ACA 1 aunque haya salido flojo? Responde según la consigna. Pregunta de control: ¿qué parte de hoy les facilita las 8 pruebas? Respuesta esperada: el núcleo sin Console en su propio proyecto.' },

      { kind: 'actividad', title: 'Mapa de módulos de tu rescate · 12 min',
        lead: 'Con tu equipo del ACA, dibujen el mapa de su Turno Nocturno rescatado.',
        izq: 58,
        left: [{ ol: ['Entre 4 y 6 cajas, cada una con <b>una frase</b>.', 'Flechas de «depende de». Marquen el núcleo.', '¿Sale alguna flecha del núcleo? ¿Hay ciclos?', 'Anoten 4 eventos del bus, en pasado.'] }],
        right: [{ panel: ['Papel y foto, o cualquier pizarra en línea.', { clave: 'Este dibujo es la primera figura de su entrega.' }], h: 'Formato' }],
        nota: '12 minutos más 5 de puesta en común. Salas por equipos de ACA. Al volver, dos equipos muestran su mapa en 1 minuto. Pregunta a cada uno: ¿qué módulo cambiaría si mañana pasan a Unity? Respuesta esperada: solo Consola. Errores esperados: una caja Utilidades o Manager que depende de todos, y el núcleo conociendo la pantalla. Usa la demo de dependencias para replicar el mapa de algún equipo.' },

      { kind: 'cierre', title: 'Lo que te llevas hoy',
        full: [
          { ol: ['<b>Las flechas apuntan al núcleo.</b> El enchufe lo define quien lo necesita.', '<b>El bus es una emisora:</b> pocos eventos, en pasado. Quien se suscribe se desuscribe.', '<b>Lo que cambia a diario va afuera:</b> datos y scripts en caja de arena. ECS, solo cuando hay miles de filas.'], pasos: true },
          { p: 'Ahora: <a href="quiz.html?s=6">quiz de la clase</a>. Para la próxima: lee el <a href="docs/aca2.html">ACA 2</a>, crea los tres proyectos y trae un bug real.', paso: true }
        ],
        nota: '3 minutos. Pregunta de salida: en una frase, ¿qué va en el núcleo y qué afuera? Respuesta esperada: adentro las reglas; afuera consola, motor, disco, audio y scripts. Recuerda: el ACA 2 cierra el domingo 10 de enero de 2027 y la semana 7 es pruebas y depuración, la mitad que falta del ACA 2. Pide que traigan el mapa de módulos terminado.' }
    ],

    quiz: [
      { tema: 'Módulos', q: 'En Turno Nocturno rescatado, ¿cuál dependencia es correcta?', opts: ['Nucleo referencia a Consola para poder dibujar', 'Consola referencia a Nucleo y le entrega un adaptador de audio', 'Nucleo referencia a Pruebas para verificarse', 'Nucleo y Consola se referencian entre sí'], ok: 1, why: 'Los detalles dependen del núcleo. El ejecutable de consola conoce al núcleo y le conecta los aparatos; el núcleo no sabe que la consola existe.' },
      { tema: 'Puertos', q: 'El núcleo necesita reproducir sonidos. ¿Dónde se declara la interfaz <code>IAudio</code>?', opts: ['En el núcleo, porque es quien la necesita', 'En el proyecto de consola, junto a <code>Console.Beep</code>', 'En el proyecto de pruebas', 'En un proyecto aparte llamado Utilidades'], ok: 0, why: 'El enchufe lo define quien lo necesita. Si la interfaz viviera en la consola, el núcleo tendría que referenciar a la consola y la flecha quedaría al revés.' },
      { tema: 'Ciclos', q: 'El módulo Datos usa a Audio, Audio usa a Consola y Consola usa a Datos. ¿Cuál es la consecuencia principal?', opts: ['El juego usa más memoria', 'Los eventos llegan en desorden', 'Hay que usar Lua', 'Ninguno de los tres se puede compilar, probar ni reutilizar sin los otros dos'], ok: 3, why: 'Es una dependencia circular: en la práctica los tres son un solo módulo grande disfrazado de tres. Se rompe con una interfaz del lado de quien la necesita o con un evento.' },
      { tema: 'Bus de eventos', q: '¿Qué diferencia a un bus de eventos del Observer directo de la semana 3?', opts: ['El bus es más rápido', 'El bus solo funciona en Unity', 'Con el bus, quien publica y quien escucha no se conocen: ambos conocen solo al bus y al tipo de evento', 'Con el bus no hace falta desuscribirse'], ok: 2, why: 'En Observer el oyente se suscribe al objeto concreto. El bus pone una emisora en medio, y por eso sirve para avisos que interesan a muchos módulos.' },
      { tema: 'Bus de eventos', q: '¿Cuál de estos nombres de evento sigue la regla de la clase?', opts: ['<code>ReproducirSonidoDeMuerte</code>', '<code>BichoMurio</code>', '<code>ActualizarPuntaje</code>', '<code>HacerTodo</code>'], ok: 1, why: 'Un evento cuenta algo que ya pasó, en pasado. Los otros son órdenes: quien publica ya está decidiendo qué deben hacer los demás, y eso es acoplamiento disfrazado.' },
      { tema: 'Scripting', q: 'Vas a repartir el trabajo entre el motor en C# y scripts de Lua. ¿Qué va en Lua?', opts: ['La detección de colisiones', 'El object pool de chispas', 'El bucle principal con paso fijo', 'La composición de cada oleada y el patrón de movimiento de un bicho nuevo'], ok: 3, why: 'En el script va lo que cambia a diario y edita diseño. En el motor va lo que corre en cada frame y debe ser rápido: bucle, colisiones, memoria.' },
      { tema: 'ECS', q: '¿En cuál de estos juegos se justifica más pasar a un ECS?', opts: ['Un simulador de ciudad con 50 000 peatones que se mueven igual', 'Turno Nocturno con 40 bichos', 'Una aventura de texto', 'Un juego de cartas por turnos'], ok: 0, why: 'ECS brilla con miles de entidades parecidas: columnas de datos seguidos que los sistemas recorren de corrido. Con decenas de entidades solo agrega complejidad.' },
      { tema: 'Fugas', q: 'Al pausar, el juego oculta el marcador con <code>SetActive(false)</code> y al reanudar lo muestra otra vez. El marcador tiene <code>void OnEnable() { canal.AlPublicar += Sumar; }</code> y no tiene <code>OnDisable</code>. Desde la primera pausa, cada bicho suma doble. ¿Por qué?', opts: ['El canal publica dos veces cada evento', 'Unity llama dos veces a Update después de una pausa', 'OnEnable volvió a suscribir el mismo Sumar y nada lo quitó: el canal lo llama dos veces', 'Falta <code>[SerializeField]</code> en la variable puntos'], ok: 2, why: 'Cada vez que el objeto se activa corre OnEnable y suma otra suscripción. Sin OnDisable que haga -=, el delegado queda dos veces en el evento. Quien se suscribe en OnEnable se desuscribe en OnDisable.' },
      { tema: 'Mods', q: 'El motor carga los mods con <code>new Script(CoreModules.Preset_SoftSandbox)</code> dentro de un <code>try/catch (InterpreterException)</code>. Un mod descargado intenta <code>os.remove("puntaje.txt")</code>. ¿Qué pasa?', opts: ['Se borra el archivo: Lua puede todo', 'La llamada falla porque esa función no existe en la caja de arena; el error se registra y el juego sigue', 'El juego se cierra sin mensaje', 'MoonSharp pide permiso al jugador'], ok: 1, why: 'La caja de arena suave deja por fuera io, os.execute, os.remove y las funciones de carga. Llamar algo que no existe es un error de ejecución que el catch convierte en una línea de registro.' },
      { tema: 'Bus de eventos', q: 'Con el bus de la clase ejecutas <code>bus.Suscribir&lt;BichoMurio&gt;(e =&gt; puntos += 10);</code>, luego <code>bus.Desuscribir&lt;BichoMurio&gt;(e =&gt; puntos += 10);</code> y luego publicas un <code>BichoMurio</code>. Si puntos empezaba en 0, ¿cuánto vale?', opts: ['10: la segunda lambda es otro delegado y Remove no encontró nada que quitar', '0: se desuscribió bien', '20: se sumó dos veces', 'No compila'], ok: 0, why: 'Dos lambdas escritas igual son dos delegados distintos. Para desuscribir hay que guardar la referencia en una variable, o usar un método con nombre.' }
    ]
  };
})();
