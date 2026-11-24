(function () {
  const paralelasCS = `static List<int> enemX = new();
static List<int> enemY = new();
static List<string> enemTipo = new();
static List<int> enemHp = new();

// Un bicho vive repartido en cuatro listas
static void Golpear(int i)
{
    enemHp[i]--;
    if (enemHp[i] <= 0)
    {
        enemX.RemoveAt(i);
        enemY.RemoveAt(i);
        enemTipo.RemoveAt(i);
        // falta enemHp.RemoveAt(i)
    }
}`;
  const bichoCS = `class Bicho
{
    public int X { get; private set; }
    public int Y { get; private set; } = 1;    // nace arriba, como en Program.cs
    public string Tipo { get; }
    public bool Vivo => vida > 0;

    int vida;
    readonly int paso;                          // casillas que baja por turno

    public Bicho(int x, string tipo, int vida, int paso)
    {
        X = x; Tipo = tipo;
        this.vida = vida; this.paso = paso;
    }

    public void Bajar() { Y += paso; }
    public void RecibirDanio(int cantidad) { vida -= cantidad; }
}

class Sala
{
    readonly List<Bicho> bichos = new();

    public void Agregar(Bicho b) { bichos.Add(b); }
    public void Limpiar() { bichos.RemoveAll(b => !b.Vivo); }   // se va entero
}

// Un tanque: new Bicho(x: 12, tipo: "tanque", vida: 3, paso: 1)`;
  const bichoUnity = `using UnityEngine;

// Bicho.cs: sus datos y lo que sabe hacer viven juntos
public class Bicho : MonoBehaviour
{
    [SerializeField] int vida = 1;
    [SerializeField] float velocidad = 2f;    // unidades por segundo

    void Update()
    {
        transform.Translate(Vector3.down * velocidad * Time.deltaTime);
    }

    public void RecibirDanio(int cantidad)
    {
        vida -= cantidad;
        if (vida <= 0) Destroy(gameObject);    // se va entero, sin listas que cuadrar
    }
}`;
  const chispaMal = `// Antes: la colisión conoce a cada tipo de bicho por su nombre
static void GolpearCon(int bala)
{
    for (int i = 0; i < enemX.Count; i++)
    {
        if (enemX[i] != balasX[bala]) continue;
        if (enemY[i] != balasY[bala]) continue;

        enemHp[i]--;
        if (enemHp[i] <= 0)
        {
            if (enemTipo[i] == "lento") puntos += 10;
            if (enemTipo[i] == "rapido") puntos += 20;
            if (enemTipo[i] == "tanque") puntos += 50;
        }
    }
    // ¿y si mañana las chispas también dañan servidores?
}`;
  const idaniableCS = `interface IDaniable
{
    void RecibirDanio(int cantidad);
}

class Bicho : IDaniable
{
    int vida = 3;
    public void RecibirDanio(int cantidad) { vida -= cantidad; }
}

class Servidor : IDaniable           // mañana: los servidores también se dañan
{
    int integridad = 10;
    public void RecibirDanio(int cantidad) { integridad -= cantidad; }
}

class Chispa
{
    // La chispa conoce el enchufe, no el aparato
    public void Golpear(IDaniable objetivo)
    {
        objetivo.RecibirDanio(1);
    }
}`;
  const idaniableUnity = `using UnityEngine;

// IDaniable.cs
public interface IDaniable
{
    void RecibirDanio(int cantidad);
}

// Vida.cs: el componente que cumple el enchufe
public class Vida : MonoBehaviour, IDaniable
{
    [SerializeField] int puntos = 3;

    public void RecibirDanio(int cantidad)
    {
        puntos -= cantidad;
        if (puntos <= 0) Destroy(gameObject);
    }
}

// Chispa.cs: no pregunta "¿eres un bicho?", pregunta "¿te puedo dañar?"
[RequireComponent(typeof(Rigidbody2D))]
public class Chispa : MonoBehaviour
{
    [SerializeField] float velocidad = 8f;

    void Start()
    {
        GetComponent<Rigidbody2D>().linearVelocity = Vector2.up * velocidad;
    }

    void OnTriggerEnter2D(Collider2D otro)
    {
        if (otro.TryGetComponent<IDaniable>(out var objetivo))
        {
            objetivo.RecibirDanio(1);
            Destroy(gameObject);
        }
    }
}`;
  const sonidoCS = `// La D de SOLID: la lógica depende del enchufe, no del aparato
interface ISonido
{
    void Golpe();
}

class SonidoConsola : ISonido
{
    public void Golpe() { Console.Beep(); }
}

class SonidoFalso : ISonido          // para pruebas: no suena, solo cuenta
{
    public int Veces { get; private set; }
    public void Golpe() { Veces++; }
}

class Colisiones
{
    readonly ISonido sonido;

    // Le pasan el sonido desde afuera: inyección por constructor
    public Colisiones(ISonido sonido) { this.sonido = sonido; }

    public void BichoEliminado() { sonido.Golpe(); }
}

// En el juego:     var colisiones = new Colisiones(new SonidoConsola());
// En una prueba:   var falso = new SonidoFalso();
//                  new Colisiones(falso).BichoEliminado();   // falso.Veces == 1`;
  const sonidoUnity = `using UnityEngine;

// SonidoUnity.cs: otra implementación del mismo enchufe
public class SonidoUnity : MonoBehaviour, ISonido
{
    [SerializeField] AudioSource fuente;
    [SerializeField] AudioClip golpe;

    public void Golpe() { fuente.PlayOneShot(golpe); }
}

// Colisiones no cambia: recibe un ISonido y lo usa.`;
  const abiertoMal = `// Cada bicho nuevo obliga a editar este bucle
// (y el de nacer, el de puntuar y el de dibujar)
for (int i = 0; i < enemX.Count; i++)
{
    if (enemTipo[i] == "rapido")
        enemY[i] += 2;
    else if (enemTipo[i] == "tanque")
        enemY[i] += 1;
    else if (enemTipo[i] == "zigzag")
    {
        enemY[i] += 1;
        enemX[i] += zig;
    }
    else
        enemY[i] += 1;
}`;
  const abiertoBien = `// El bucle queda igual cuando llega un bicho nuevo
foreach (IActualizable cosa in cosas)
    cosa.Actualizar(dt);

interface IActualizable
{
    void Actualizar(float dt);
}

// Agregar es escribir una clase nueva, sin abrir las otras
class BichoZigzag : IActualizable
{
    float x, y, tiempo;

    public void Actualizar(float dt)
    {
        tiempo += dt;
        y += 4f * dt;
        x += MathF.Sin(tiempo * 6f) * 8f * dt;
    }
}`;
  const herencia = `class Enemigo { /* vida y posición */ }

class EnemigoVolador : Enemigo { /* vuela */ }

class EnemigoVoladorQueDispara : EnemigoVolador { /* vuela y dispara */ }

// Diseño pide ahora: uno que nada y dispara, pero no vuela.
class EnemigoNadadorQueDispara : Enemigo
{
    // ¿Copio y pego el código de disparar que está en el volador?
    // ¿Subo "disparar" a Enemigo y que todos lo carguen aunque no lo usen?
}`;
  const compCS = `interface IComponente { void Actualizar(Entidad e, float dt); }

class Entidad
{
    public float X, Y;
    readonly List<IComponente> piezas = new();

    public Entidad Con(IComponente pieza) { piezas.Add(pieza); return this; }

    public void Actualizar(float dt)
    {
        foreach (var pieza in piezas) pieza.Actualizar(this, dt);
    }
}

class Baja : IComponente
{
    readonly float velocidad;
    public Baja(float velocidad) { this.velocidad = velocidad; }
    public void Actualizar(Entidad e, float dt) { e.Y += velocidad * dt; }
}

class Zigzag : IComponente
{
    float tiempo;
    public void Actualizar(Entidad e, float dt)
    {
        tiempo += dt;
        e.X += MathF.Sin(tiempo * 6f) * 8f * dt;
    }
}`;
  const compUsoCS = `// Armar un bicho es elegir piezas. Ninguna clase nueva.
var lento   = new Entidad().Con(new Baja(4f));
var rapido  = new Entidad().Con(new Baja(8f));
var mareado = new Entidad().Con(new Baja(4f)).Con(new Zigzag());

var bichos = new List<Entidad> { lento, rapido, mareado };

foreach (var bicho in bichos)
    bicho.Actualizar(0.05f);         // el bucle no sabe de qué está hecho cada uno`;
  const compUnity = `using UnityEngine;

// Baja.cs: una pieza, una tarea. Se arrastra a cualquier GameObject.
public class Baja : MonoBehaviour
{
    [SerializeField] float velocidad = 2f;

    void Update()
    {
        transform.Translate(Vector3.down * velocidad * Time.deltaTime);
    }
}

// Zigzag.cs
public class Zigzag : MonoBehaviour
{
    [SerializeField] float amplitud = 1.5f;
    [SerializeField] float frecuencia = 6f;

    void Update()
    {
        float dx = Mathf.Sin(Time.time * frecuencia) * amplitud * Time.deltaTime;
        transform.Translate(dx, 0f, 0f);
    }
}

// Tanque  = GameObject + Baja + Vida (3 puntos)
// Mareado = GameObject + Baja + Zigzag + Vida (1 punto)
// Vida es el componente que implementa IDaniable.`;
  const compLua = `-- Un componente es una tabla con una función "actualizar"
local function Baja(velocidad)
    return { actualizar = function(self, e, dt)
        e.y = e.y + velocidad * dt
    end }
end

local function Zigzag()
    local tiempo = 0
    return { actualizar = function(self, e, dt)
        tiempo = tiempo + dt
        e.x = e.x + math.sin(tiempo * 6) * 8 * dt
    end }
end

local function nuevaEntidad(x, y, piezas)
    return { x = x, y = y, piezas = piezas }
end

local function actualizar(e, dt)
    for _, pieza in ipairs(e.piezas) do
        pieza:actualizar(e, dt)
    end
end

local mareado = nuevaEntidad(12, 0, { Baja(4), Zigzag() })
actualizar(mareado, 0.05)`;

  // Versiones recortadas para las slides (las completas viven en `codigo`)
  const zigzagCorto = `for (int i = 0; i < enemX.Count; i++)
{
    if (enemTipo[i] == "lento")
        { if (frame % 6 == 0) enemY[i]++; }
    if (enemTipo[i] == "rapido")
        { if (frame % 3 == 0) enemY[i]++; }
    if (enemTipo[i] == "tanque")
        { if (frame % 9 == 0) enemY[i]++; }
}
// el mismo if por tipo vuelve al nacer,
// al puntuar y al dibujar`;
  const bichoCorto = `class Bicho
{
    public int X { get; private set; }
    public int Y { get; private set; } = 1;
    public string Tipo { get; }
    public bool Vivo => vida > 0;
    int vida;
    readonly int paso;

    public Bicho(int x, string tipo, int vida, int paso)
    {
        X = x; Tipo = tipo;
        this.vida = vida; this.paso = paso;
    }
    public void Bajar() { Y += paso; }
    public void RecibirDanio(int n) { vida -= n; }
}
bichos.RemoveAll(b => !b.Vivo);   // se va entero`;
  const idaniableCorto = `interface IDaniable
{
    void RecibirDanio(int cantidad);
}

class Bicho : IDaniable
{
    int vida = 3;
    public void RecibirDanio(int cantidad) { vida -= cantidad; }
}

class Chispa
{
    // conoce el enchufe, no el aparato
    public void Golpear(IDaniable objetivo)
        => objetivo.RecibirDanio(1);
}`;
  const idaniableUnityCorto = `public interface IDaniable { void RecibirDanio(int cantidad); }

public class Chispa : MonoBehaviour
{
    void OnTriggerEnter2D(Collider2D otro)
    {
        // no pregunta «¿eres un bicho?»
        // pregunta «¿te puedo dañar?»
        if (otro.TryGetComponent<IDaniable>(out var objetivo))
        {
            objetivo.RecibirDanio(1);
            Destroy(gameObject);
        }
    }
}`;
  const servidorCS = `class Servidor : IDaniable
{
    int integridad = 10;
    public void RecibirDanio(int n) { integridad -= n; }
}`;
  const abiertoBienCorto = `// El bucle no cambia cuando llega un bicho
foreach (IActualizable cosa in cosas)
    cosa.Actualizar(dt);

interface IActualizable { void Actualizar(float dt); }

// Agregar es escribir una clase nueva
class BichoZigzag : IActualizable
{
    float x, y, tiempo;
    public void Actualizar(float dt)
    {
        tiempo += dt;
        y += 4f * dt;
        x += MathF.Sin(tiempo * 6f) * 8f * dt;
    }
}`;
  const herenciaCorta = `class Enemigo { /* vida y posición */ }

class Volador : Enemigo { /* vuela */ }

class VoladorQueDispara : Volador { /* dispara */ }

// Diseño pide: nada y dispara, pero no vuela
class NadadorQueDispara : Enemigo
{
    // ¿copio y pego «disparar» del volador?
    // ¿subo «disparar» a Enemigo para todos?
}`;
  const compCorto = `interface IComponente { void Actualizar(Entidad e, float dt); }
class Entidad                       // la bolsa
{
    public float X, Y;
    readonly List<IComponente> piezas = new();
    public Entidad Con(IComponente p)
    { piezas.Add(p); return this; }
    public void Actualizar(float dt)
    { foreach (var p in piezas) p.Actualizar(this, dt); }
}

class Baja : IComponente             // una pieza, una tarea
{
    readonly float v;
    public Baja(float v) { this.v = v; }
    public void Actualizar(Entidad e, float dt)
        => e.Y += v * dt;
}`;
  const compArmarCorto = `// Armar un bicho es elegir piezas. Ninguna clase nueva.
var lento   = new Entidad().Con(new Baja(4f));
var rapido  = new Entidad().Con(new Baja(8f));
var mareado = new Entidad().Con(new Baja(4f))
                           .Con(new Zigzag());

var bichos = new List<Entidad> { lento, rapido, mareado };
foreach (var b in bichos)
    b.Actualizar(dt);    // no sabe de qué está hecho`;
  const compUnityCorto = `// Baja.cs: una pieza, se arrastra a cualquier GameObject
public class Baja : MonoBehaviour
{
    [SerializeField] float velocidad = 2f;

    void Update()
    {
        float dy = velocidad * Time.deltaTime;
        transform.Translate(Vector3.down * dy);
    }
}

// Tanque  = GameObject + Baja + Vida
// Mareado = GameObject + Baja + Zigzag + Vida`;
  const compLuaCorto = `local function Baja(v)
    return { actualizar = function(self, e, dt)
        e.y = e.y + v * dt
    end }
end
-- Zigzag() se escribe igual, con su propia tarea

local function actualizar(e, dt)
    for _, pieza in ipairs(e.piezas) do
        pieza:actualizar(e, dt)
    end
end

local m = { x = 12, y = 0, piezas = { Baja(4), Zigzag() } }`;

  /* Ilustración estática para la actividad: cómo se ve una buena lista de módulos */
  const svgModulos = `<svg viewBox="0 0 900 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ejemplo de notación: módulos con una frase cada uno y flechas que significan conoce a">
<defs><marker id="s2act" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#b9b9bd"/></marker></defs>
<rect width="900" height="380" rx="18" fill="#0d0d0e"/>
<g text-anchor="middle" font-weight="800">
<rect x="30" y="30" width="250" height="100" rx="16" fill="#2b2b30" stroke="#fff" stroke-width="3"/><text x="155" y="70" font-size="28" fill="#fff">Chispas</text><text x="155" y="106" font-size="22" font-weight="600" fill="#b9b9bd">suben por la sala</text>
<rect x="335" y="40" width="230" height="80" rx="16" fill="#e2a54a"/><text x="450" y="89" font-size="28" fill="#0d0d0e">IDaniable</text>
<rect x="620" y="30" width="250" height="100" rx="16" fill="#2b2b30" stroke="#fff" stroke-width="3"/><text x="745" y="70" font-size="28" fill="#fff">Bichos</text><text x="745" y="106" font-size="22" font-weight="600" fill="#b9b9bd">bajan por oleadas</text>
<rect x="30" y="200" width="250" height="100" rx="16" fill="#2b2b30" stroke="#fff" stroke-width="3"/><text x="155" y="240" font-size="28" fill="#fff">Entrada</text><text x="155" y="276" font-size="22" font-weight="600" fill="#b9b9bd">lee el teclado</text>
<rect x="335" y="200" width="230" height="100" rx="16" fill="#2b2b30" stroke="#fff" stroke-width="3"/><text x="450" y="240" font-size="28" fill="#fff">Robot</text><text x="450" y="276" font-size="22" font-weight="600" fill="#b9b9bd">se mueve</text>
<rect x="620" y="200" width="250" height="100" rx="16" fill="#e0706a" stroke="#fff" stroke-width="3"/><text x="745" y="240" font-size="28" fill="#fff">Manager</text><text x="745" y="276" font-size="22" font-weight="600" fill="#fff">¿hace de todo?</text>
</g>
<line x1="284" y1="80" x2="328" y2="80" stroke="#b9b9bd" stroke-width="4" marker-end="url(#s2act)"/>
<line x1="616" y1="80" x2="572" y2="80" stroke="#b9b9bd" stroke-width="4" marker-end="url(#s2act)"/>
<line x1="284" y1="250" x2="328" y2="250" stroke="#b9b9bd" stroke-width="4" marker-end="url(#s2act)"/>
<text x="450" y="350" text-anchor="middle" font-size="22" font-weight="600" fill="#b9b9bd">Flecha = «conoce a». Una frase por módulo, sin «y».</text>
</svg>`;

  window.CLASE = {
    n: 2,
    titulo: 'Acoplamiento, cohesión y composición',
    objetivos: [
      'Decir qué tan acoplado está un módulo contando cuántas piezas se rompen cuando él cambia.',
      'Reconocer una pieza con baja cohesión y partirla en piezas con una sola tarea.',
      'Escribir una interfaz pequeña (como <code>IDaniable</code>) y programar contra ella en C# y en Unity.',
      'Armar un enemigo con componentes en lugar de una cadena de herencia, y explicar cuándo sí conviene heredar.'
    ],
    analogia: 'El enchufe de pared. La licuadora, el cargador y la lámpara funcionan en cualquier toma porque todos respetan la misma forma. La pared no sabe qué le conectaron y el aparato no sabe de dónde viene la corriente. Lo contrario son los audífonos enredados en el bolsillo: halas una punta y se mueve todo el nudo.',
    agenda: [
      ['0:00', 'Los olores que trajeron de Turno Nocturno'],
      ['0:09', 'Acoplamiento: el enchufe y el grafo de módulos, con demo'],
      ['0:26', 'Cohesión: de las listas paralelas a la clase Bicho'],
      ['0:40', 'Interfaces y las tres letras de SOLID que sí usamos'],
      ['0:57', 'Composición sobre herencia y el patrón Componente'],
      ['1:14', 'Juegos reales y actividad: los módulos de Turno Nocturno'],
      ['1:30', 'Cierre y reglas del parcial'],
      ['1:35', 'Quiz-parcial del Corte I (25 minutos)'],
      ['2:00', 'Fin de la sesión']
    ],
    conceptos: [
      { t: 'Acoplamiento', d: 'Cuánto necesita saber una pieza de otra para funcionar. Se mide contando cuántas piezas hay que abrir cuando una cambia.', ej: 'En Program.cs la colisión lee <code>enemHp[i]</code> directo: si cambia cómo se guarda la vida, hay que editar la colisión.' },
      { t: 'Cohesión', d: 'Qué tanto pertenece a una misma tarea lo que vive dentro de una pieza. Alta cohesión: la describes en una frase sin «y».', ej: 'Una clase <code>Bicho</code> con posición, vida y <code>Bajar()</code> es cohesiva; <code>Utilidades</code> con puntaje, sonido y colisiones no.' },
      { t: 'Interfaz', d: 'Un contrato que dice qué métodos ofrece una pieza sin decir cómo los hace. Quien la usa depende del contrato, no de la clase concreta.', ej: '<code>IDaniable</code>: la chispa daña bichos, servidores o cajas sin conocer a ninguno.' },
      { t: 'Responsabilidad única (S)', d: 'Cada clase tiene una sola razón para cambiar, es decir, una sola persona o área que le pediría cambios.', ej: 'Si el diseñador de audio y el de puntaje te piden cambios en la misma clase, en realidad son dos clases.' },
      { t: 'Abierto/cerrado (O)', d: 'El código queda abierto para agregar comportamiento y cerrado para editar lo que ya funciona.', ej: 'El bicho zigzag es una clase nueva que cumple <code>IActualizable</code>; el bucle principal no se toca.' },
      { t: 'Inversión de dependencias (D)', d: 'La lógica del juego depende de abstracciones y los detalles (consola, Unity, disco) las implementan.', ej: 'Las colisiones llaman <code>sonido.Golpe()</code> sobre un <code>ISonido</code>; en una prueba se conecta un <code>SonidoFalso</code> que solo cuenta.' },
      { t: 'Composición sobre herencia', d: 'Armar objetos juntando piezas que <b>tienen</b> comportamientos, en lugar de heredar de una cadena de clases que <b>son</b> algo.', ej: 'Bicho mareado = Baja + Zigzag + Vida, sin escribir <code>BichoMareadoQueBaja</code>.' },
      { t: 'Patrón Componente', d: 'Una entidad es un contenedor casi vacío; su comportamiento sale de componentes pequeños e independientes que se agregan o se quitan.', ej: 'En Unity, un GameObject con <code>Rigidbody2D</code>, <code>Collider2D</code> y tu script <code>Vida</code>.' }
    ],
    industria: [
      { j: 'Unity', t: 'Cada GameObject es una bolsa de componentes (Transform, Rigidbody2D, tus MonoBehaviour). Add Component es el patrón Componente hecho editor.', src: 'Manual de Unity: «GameObjects» e «Introduction to components» (docs.unity3d.com).' },
      { j: 'Unreal Engine', t: 'Hereda en un eje corto y estable (AActor, APawn, ACharacter) y compone el resto con UActorComponent: movimiento, colisión, audio. Usa las dos ideas, cada una donde sirve.', src: 'Documentación de Unreal Engine: «Components» y «Actors» (dev.epicgames.com/documentation).' },
      { j: 'Overwatch (Blizzard)', t: 'Su gameplay usa ECS: entidades sin lógica, componentes con datos y sistemas que los recorren. Es la composición llevada al extremo.', src: 'Timothy Ford, «Overwatch Gameplay Architecture and Netcode», GDC 2017.' },
      { j: 'Dungeon Siege (Gas Powered Games)', t: 'Uno de los primeros juegos comerciales que armó sus objetos con componentes definidos en datos, en lugar de una jerarquía de herencia.', src: 'Scott Bilas, «A Data-Driven Game Object System», GDC 2002.' },
      { j: 'Unity UI (EventSystems)', t: 'Un componente recibe clics si implementa <code>IPointerClickHandler</code>. El sistema de eventos programa contra la interfaz, no contra tus clases.', src: 'Unity Scripting API: UnityEngine.EventSystems.IPointerClickHandler.' }
    ],
    errores: [
      { mito: 'Partir Program.cs en muchos archivos ya baja el acoplamiento.', real: 'Si los archivos nuevos siguen leyendo las listas globales de los demás, es el mismo nudo repartido en más archivos. Cuenta flechas, no archivos.' },
      { mito: 'Acoplamiento bajo significa que las clases no se conocen.', real: 'Siempre hay dependencias. La meta es que sean pocas, explícitas y hacia piezas estables: que Entrada conozca al Robot está bien.' },
      { mito: 'Ponerle una interfaz a todo mejora el diseño.', real: 'Una interfaz con una sola implementación que nunca cambiará solo agrega un salto al leer. Úsala donde hay variación real o necesitas probar: sonido, entrada, guardado.' },
      { mito: 'Heredar siempre ahorra código.', real: 'Heredar para reutilizar ata al hijo a cada cambio del padre y explota con varios ejes de variación. Se nota cuando aparecen nombres como <code>VoladorQueDisparaYNada</code>.' },
      { mito: 'El tanque necesita su propia clase hija.', real: 'Si solo cambian números (vida 3, paso 1), es un dato, no una clase. Se nota cuando la clase hija solo trae un constructor distinto.' }
    ],
    codigoIntro: 'Cinco pasos del mismo rescate: juntar lo que va junto, poner un enchufe entre las piezas, depender de abstracciones, agregar sin editar y armar bichos con piezas intercambiables.',
    codigo: [
      { titulo: 'De las listas paralelas a una clase Bicho', desc: 'En el espagueti un bicho vive repartido en cuatro listas que hay que mantener cuadradas a mano. En la clase, sus datos y lo que sabe hacer viajan juntos.',
        tabs: [{ lang: 'C#', label: 'Antes: Program.cs', src: paralelasCS }, { lang: 'C#', label: 'Después: Bicho.cs', src: bichoCS }, { lang: 'Unity', src: bichoUnity }] },
      { titulo: 'La interfaz IDaniable: el enchufe', desc: 'La chispa solo necesita saber que algo se puede dañar. No le importa si es un bicho, un servidor o una caja.',
        tabs: [{ lang: 'C#', label: 'Antes: Program.cs', src: chispaMal }, { lang: 'C#', label: 'Después: IDaniable', src: idaniableCS }, { lang: 'Unity', src: idaniableUnity }] },
      { titulo: 'La D: depender de ISonido, no de Console.Beep', desc: 'La lógica recibe el sonido por el constructor. En el juego se conecta la consola o Unity; en una prueba, un sonido falso que cuenta llamadas.',
        tabs: [{ lang: 'C#', src: sonidoCS }, { lang: 'Unity', src: sonidoUnity }] },
      { titulo: 'La O: agregar un bicho sin editar el bucle', desc: 'A la izquierda, cada bicho nuevo es otra rama del <code>if</code>. A la derecha, es una clase nueva que cumple <code>IActualizable</code>.',
        tabs: [{ lang: 'C#', label: 'Antes: un if por tipo', src: abiertoMal }, { lang: 'C#', label: 'Después: IActualizable', src: abiertoBien }] },
      { titulo: 'Componentes: armar en lugar de heredar', desc: 'Cada comportamiento es una pieza pequeña. Un bicho nuevo es una combinación nueva de piezas que ya existen. En Unity esto es exactamente GameObject más componentes.',
        tabs: [{ lang: 'C#', label: 'Antes: el árbol', src: herencia }, { lang: 'C#', label: 'C# (las piezas)', src: compCS }, { lang: 'C#', label: 'C# (armar bichos)', src: compUsoCS }, { lang: 'Unity', src: compUnity }, { lang: 'Lua', label: 'Lua (tablas)', src: compLua }] }
    ],
    tarea: [
      'Pasa en limpio la lista de módulos que hiciste en la actividad: de 5 a 7 módulos, una frase de responsabilidad cada uno. Es la base del ACA 1, que abre la próxima semana.',
      'En <a href="proyecto/TurnoNocturno/README.html">Turno Nocturno</a>, busca las variables <code>menu</code>, <code>pausa</code>, <code>gameOver</code> y <code>gano</code>. Anota en cuántas líneas aparecen y mira con calma la línea 175. Con eso empezamos la semana 3.',
      'Opcional: repite el <a href="quiz.html?s=2">quiz de la clase</a> hasta que salga perfecto.'
    ],
    lecturas: [
      'Nystrom, R. (2014). <i>Game Programming Patterns</i>, capítulo «Component» (gratis en gameprogrammingpatterns.com).',
      'Martin, R. C. (2017). <i>Clean Architecture</i>, caps. 7, 8 y 11 (responsabilidad única, abierto/cerrado e inversión de dependencias).',
      'Gregory, J. (2018). <i>Game Engine Architecture</i> (3.ª ed.), capítulo sobre modelos de objetos de juego y arquitecturas basadas en componentes.',
      'Bilas, S. (2002). <i>A Data-Driven Game Object System</i>. GDC 2002 (el sistema de componentes de Dungeon Siege).'
    ],

    slides: [
      { kind: 'portada', title: 'Acoplamiento, cohesión y composición',
        lead: 'Semana 2 · Arquitectura de Videojuegos',
        full: [
          { ul: ['Medir el enredo: qué se rompe cuando algo cambia.', 'Poner enchufes entre las piezas.', 'Armar enemigos con piezas en vez de heredar.'] },
          { pie: 'Los últimos 25 minutos son el quiz-parcial del Corte I · <span class="kbd">N</span> notas del docente' }
        ],
        nota: 'Avisa desde el inicio: la clase dura 95 minutos y a la 1:35 empieza el parcial. Sale del banco de quices de las clases 1 y 2. 1 minuto.' },

      { kind: 'reto', title: 'Llegó el pedido: un bicho en zigzag',
        lead: 'La semana pasada cazaron olores en <code>Program.cs</code>. Escriban en el chat el peor que encontraron.',
        izq: 44,
        left: [{ code: [{ lang: 'C#', label: 'Program.cs · se mueven los bichos (resumido)', src: zigzagCorto }] }],
        right: [{ check: { q: 'Para agregar el bicho zigzag, ¿cuántos lugares del archivo hay que editar?', opts: ['Uno: donde nacen los bichos', 'Dos: nacer y dibujar', 'Cuatro o más: nacer, mover, puntuar, dibujar...', 'Ninguno, basta con un dato nuevo'], ok: 2, why: 'Cada <code>if (enemTipo[i] == ...)</code> conoce todos los tipos de bicho. Un cambio pequeño se riega por todo el archivo. Eso tiene nombre: acoplamiento.' } }],
        nota: '8 minutos. Lee 4 o 5 olores del chat y agrúpalos: «todo en un método», «listas paralelas», «if por tipo», «sonido y disco en la lógica». Hoy cada grupo recibe un nombre técnico. Luego la pregunta. Respuesta esperada: cuatro o más (en Program.cs el tipo aparece al nacer, al mover, al puntuar y al dibujar). Error típico: «uno».' },

      { kind: 'analogia', title: 'Cables soldados o toma de pared',
        izq: 58,
        left: [{ fig: 'enchufe' }],
        right: [
          { mapa: [['Cable soldado a la pared', 'Acoplamiento alto<small>A sabe cómo está hecho B</small>'], ['La toma estándar', 'Interfaz<small>un acuerdo de forma</small>'], ['Cambiar el aparato', 'Cambiar un módulo sin abrir otro']], de: 'En la casa', a: 'En el juego', pasos: true }
        ],
        nota: 'Primero «Cables soldados» y los tres botones; luego «Toma estándar» y repite. Pregunta: ¿qué pasa si cambia la forma de la toma? Respuesta esperada: cambian todos; por eso una interfaz es pequeña y estable. Después revela el mapa. 4 minutos.' },

      { kind: 'idea', title: 'Acoplamiento: cuánto sabe una pieza de otra',
        full: [
          { big: 'Dos piezas están acopladas cuando un cambio en una te obliga a abrir la otra.' },
          { tabla: { head: ['Nivel', 'A sabe de B...', 'En Turno Nocturno'], rows: [['<b>Alto</b>', 'cómo está hecha por dentro', 'La colisión lee <code>enemHp[i]</code> directo'], ['<b>Medio</b>', 'qué métodos tiene', '<code>bicho.RecibirDanio(1)</code>'], ['<b>Bajo</b>', 'solo la forma del enchufe', '<code>IDaniable.RecibirDanio(1)</code>']] }, pasos: true },
          { clave: 'Acoplamiento cero no existe. La meta: pocos puntos de contacto y bien definidos.', paso: true }
        ],
        nota: 'Conecta con la clase 1: «¿qué se rompe si cambio esto?». El acoplamiento es la forma de medirlo. Pregunta antes de revelar la tabla: ¿qué tan acoplada está la colisión a la forma de guardar la vida? Respuesta: alto, porque lee la lista por dentro. 4 minutos.' },

      { kind: 'demo', title: 'Toca un módulo y mira qué se rompe',
        izq: 45, top: true,
        left: [
          { check: { q: 'Cinco módulos llaman a <code>Console.Beep</code>. Cambias Sonido por audio de verdad. ¿Cuántos módulos abres?', opts: ['Ninguno', 'Uno: Sonido', 'Dos', 'Seis: Sonido y los cinco que lo conocen'], ok: 3, why: 'Cada flecha que llega a Sonido es un lugar que se rompe cuando Sonido cambia. Tócalo en la figura y luego enciende las interfaces.' } },
          { clave: 'El enchufe detiene la onda del cambio.', paso: true }
        ],
        right: [{ fig: 'acoplamiento' }],
        nota: 'Que voten antes de tocar la figura. Error esperado: «uno». Luego toca Sonido: sin interfaces se rompen 5; con «Con interfaces y eventos», 0, porque las flechas punteadas llegan a un enchufe. Pregunta: ¿por qué Entrada sigue dependiendo de Robot? Respuesta: alguna flecha directa siempre queda, y está bien si apunta a algo estable. 9 minutos.' },

      { kind: 'analogia', title: 'El cajón de cubiertos y el de sastre',
        izq: 58,
        left: [{ fig: 'cajones' }],
        right: [
          { mapa: [['Cajón de cubiertos', 'Alta cohesión<small>todo sirve para lo mismo</small>'], ['Cajón de sastre', 'Baja cohesión<small>su nombre honesto: Varios</small>'], ['¿Lo describo sin «y»?', 'Prueba de cohesión']], de: 'En la cocina', a: 'En el código', pasos: true }
        ],
        nota: 'Primero en modo cocina: que ordenen los cajones tocando los objetos. Luego «En el código»: las mismas piezas son campos y métodos. Pide que describan Program.cs en una frase sin «y». Respuesta esperada: no se puede, y esa es la prueba de baja cohesión. 4 minutos.' },

      { kind: 'antipatron', title: 'Un bicho repartido en cuatro listas',
        lead: 'A la izquierda un bicho es la posición <code>i</code> de cuatro listas. A la derecha es una sola cosa.',
        top: true,
        full: [{ compare: { a: { label: 'Antes: listas paralelas', lang: 'C#', src: paralelasCS }, b: { label: 'Después: una clase cohesiva', lang: 'C#', src: bichoCorto } } }],
        nota: 'No expliques todavía el comentario «falta enemHp.RemoveAt»: es la pregunta siguiente. Señala que en la derecha vida y paso son privados: nadie de afuera los puede descuadrar. Pregunta: ¿cuántas líneas hay que acordarse de escribir para borrar un bicho en cada versión? Respuesta: cuatro contra una. 3 minutos.' },

      { kind: 'reto', title: 'Predice: se olvidó una línea',
        izq: 58,
        left: [{ fig: 'listas' }],
        right: [
          { p: 'Alguien borra el bicho <code>i = 1</code> y olvida <code>enemHp.RemoveAt(i)</code>.' },
          { check: { q: '¿Qué pasa en el juego desde ese momento?', opts: ['El programa no compila', 'Nada, sobra un número', 'Cada bicho siguiente usa la vida de su vecino: tanques que mueren de un golpe', 'El juego se cierra con un error'], ok: 2, why: 'Las listas quedan corridas una posición. Compila y corre, pero los datos ya no cuadran: un bug silencioso. Con <code>List&lt;Bicho&gt;</code> ese error no se puede escribir.' } }
        ],
        nota: 'Que voten primero. Luego, en la figura, presiona «Borrar el bicho i = 1» en modo «Cuatro listas»: las filas se ponen rojas. Cambia a «List&lt;Bicho&gt;» y repite. Idea fuerte: una buena estructura hace imposibles ciertos errores. Unity usa la misma idea: un GameObject se destruye completo. 4 minutos.' },

      { kind: 'antipatron', title: 'La navaja suiza: el objeto dios',
        izq: 60,
        left: [{ fig: 'navaja' }],
        right: [
          { big: 'Hace de todo, pesa un kilo y nadie la quiere cargar.' },
          { clave: 'Cuenta las razones para cambiar una clase. Si son más de una, son dos clases.', paso: true }
        ],
        nota: 'Agrega responsabilidades hasta llegar a 8: eso es Program.cs hoy. Luego «Clases separadas». Pregunta: si cambia el formato del puntaje, ¿qué se abre en cada versión? Respuesta: todo Program.cs contra solo Puntaje. 3 minutos.' },

      { kind: 'codigo', title: 'IDaniable: el enchufe en código',
        izq: 34,
        left: [
          { big: 'Una interfaz dice <b>qué</b> promete una pieza, no <b>cómo</b>.' },
          { clave: 'Programa contra el enchufe, no contra el aparato.', paso: true }
        ],
        right: [{ code: [{ lang: 'C#', src: idaniableCorto }, { lang: 'Unity', src: idaniableUnityCorto }], marca: [
          { l: [1, 2, 3, 4], t: '<b>La forma de la toma.</b> Solo un método, sin cuerpo.' },
          { l: [6, 9], t: 'El bicho <b>cumple</b> el acuerdo a su manera.' },
          { l: [15, 16], t: 'La chispa pide un <code>IDaniable</code>, no un <code>Bicho</code>.' }
        ] }],
        nota: 'Por convención en C# las interfaces empiezan con I. En la pestaña Unity: TryGetComponent acepta interfaces. Pregunta: ¿qué devuelve si choca con una pared sin componente dañable? Respuesta: false, y la chispa la ignora sin error. En Lua hacían lo mismo sin declararlo: si la tabla tiene la función, sirve. 5 minutos.' },

      { kind: 'reto', title: 'Predice: ahora los servidores se dañan',
        lead: 'Diseño decide que las chispas perdidas también dañan los servidores de la sala.',
        izq: 44,
        left: [{ code: [{ lang: 'C#', label: 'Servidor.cs (nuevo)', src: servidorCS }] }],
        right: [{ check: { q: '¿Qué hay que cambiar en la clase <code>Chispa</code>?', opts: ['Nada: basta con que <code>Servidor</code> cumpla la interfaz', 'Agregar un <code>if</code> para servidores', 'Crear <code>ChispaParaServidores</code>', 'Reescribir <code>Golpear</code>'], ok: 0, why: 'La chispa solo conoce el enchufe. Cualquier cosa que cumpla <code>IDaniable</code> funciona sin tocarla. En el espagueti habría que abrir la colisión y sumar otro caso.' } }],
        nota: 'Error esperado: la opción B, por costumbre. Respuesta: nada. Anuncia que esto tiene letra en SOLID (la O). 3 minutos.' },

      { kind: 'demo', title: 'Tres letras de SOLID que sí usamos',
        izq: 58,
        left: [{ fig: 'solid' }],
        right: [
          { tabla: { head: ['Letra', 'Pregunta de prueba'], rows: [['<b>S</b>', '¿Quién me pediría cambiar esta clase?'], ['<b>O</b>', '¿Un bicho nuevo es un archivo nuevo o seis <code>if</code> más?'], ['<b>D</b>', '¿Mi lógica nombra a <code>Console.Beep</code> o a un <code>ISonido</code>?']] }, pasos: true }
        ],
        nota: 'Toca cada tarjeta y alterna «Sin aplicar» y «Aplicada». No recites definiciones: cada letra se evalúa con su pregunta. Pregunta para la D: ¿cómo pruebas que matar un bicho suena, sin parlantes? Respuesta: conectando un SonidoFalso que cuenta (está en la página de la clase). L (un hijo reemplaza al padre sin sorpresas) e I (interfaces pequeñas) aparecen solas. 5 minutos.' },

      { kind: 'codigo', title: 'La O en acción: agregar sin editar',
        lead: 'El mismo pedido del bicho zigzag, resuelto de dos maneras.',
        top: true,
        full: [{ compare: { a: { label: 'Hay que editar el bucle', lang: 'C#', src: abiertoMal }, b: { label: 'Se agrega una clase nueva', lang: 'C#', src: abiertoBienCorto } } }],
        nota: 'Pregunta: ¿cuál de los dos lados puede romper al tanque por accidente? Respuesta: el izquierdo, porque edita código que ya funcionaba. IActualizable es otro enchufe. Los fragmentos de la derecha van en archivos distintos. 4 minutos.' },

      { kind: 'reto', title: 'Predice: cuatro habilidades, ¿cuántas clases?',
        izq: 50,
        left: [{ code: [{ lang: 'C#', label: 'La herencia parece natural', src: herenciaCorta }], marca: [
          { l: [3, 5], t: 'Cada combinación pide su propia clase.' },
          { l: [7, 8, 9, 10, 11], t: 'La tercera petición ya no cabe en el árbol.' }
        ] }],
        right: [{ check: { q: 'Caminar, volar, nadar y disparar. ¿Cuántas clases cubren todas las combinaciones?', opts: ['4, una por habilidad', '8', '16, una por combinación', '5, contando la base'], ok: 2, why: 'Cada habilidad está o no está: 2 × 2 × 2 × 2 = 16. Con una quinta serían 32. Con piezas sueltas siguen siendo 4, y luego 5.' } }],
        nota: 'Que voten antes de recorrer las marcas. Error esperado: 4 u 8. Respuesta: 16. La herencia sirve cuando la relación «es un» es estable y de un solo eje; los enemigos varían en varios ejes a la vez. 3 minutos.' },

      { kind: 'antipatron', title: 'El árbol de herencia que explota',
        izq: 62,
        left: [{ fig: 'herencia' }],
        right: [
          { big: 'Cada habilidad nueva duplica las clases.' },
          { clave: 'Con piezas, cada habilidad nueva suma una sola.', paso: true }
        ],
        nota: 'Pide habilidades hasta llegar a 5. Pregunta: ¿cuántos cuadros y cuántas piezas? Respuesta: 32 contra 5. 2 minutos.' },

      { kind: 'analogia', title: 'El Señor Cara de Papa: tener, no ser',
        izq: 56,
        left: [{ fig: 'composicion' }],
        right: [
          { mapa: [['El muñeco', 'Entidad<small>la bolsa</small>'], ['Ojos, sombrero, brazos', 'Componentes'], ['Poner y quitar piezas', 'Cambiar en pleno juego'], ['Add Component en Unity', 'Composición']], de: 'El juguete', a: 'En el juego', pasos: true }
        ],
        nota: 'Pide que armen «el que nada y dispara pero no vuela». Pregunta: ¿cuántas clases nuevas escribimos? Respuesta: ninguna. Luego: ¿cuántas veces han heredado de una clase suya en Unity? Casi nunca. ¿Add Component? Siempre. 3 minutos.' },

      { kind: 'codigo', title: 'El patrón Componente en tres mundos',
        izq: 30,
        left: [
          { big: 'La entidad es solo la bolsa.' },
          { clave: 'En Unity la bolsa es el <code>GameObject</code> y las piezas son sus componentes.', paso: true }
        ],
        right: [{ code: [
          { lang: 'C#', label: 'C# (piezas)', src: compCorto },
          { lang: 'C#', label: 'C# (armar)', src: compArmarCorto },
          { lang: 'Unity', src: compUnityCorto },
          { lang: 'Lua', src: compLuaCorto }
        ], marca: [
          { l: [1], t: 'El enchufe de toda pieza: un método <code>Actualizar</code>.' },
          { l: [2, 5, 8, 9], t: 'La entidad guarda piezas y las actualiza <b>sin saber cuáles son</b>.' },
          { l: [12, 14, 15, 16, 17], t: 'Una pieza: una sola tarea, bajar.' }
        ] }],
        nota: 'Recorre las marcas y luego las pestañas. En Lua ni siquiera hacen falta metatablas: basta una lista de tablas. Pregunta: ¿qué pieza nueva escribirían para un bicho que se detiene a ratos? Respuesta esperada: un componente Pausado o Intermitente con su propio temporizador. 5 minutos.' },

      { kind: 'reto', title: '¿Heredar, componer o es solo un dato?',
        izq: 36,
        left: [
          { p: 'La herencia sí sirve cuando la relación <b>«es un»</b> es estable y de un solo eje.' },
          { p: 'Lo que varía, se mezcla o cambia en pleno juego va en <b>piezas</b>.' },
          { clave: 'Si solo cambia un número, no es una clase: es un dato.', paso: true }
        ],
        right: [{ fig: 'heredar' }],
        nota: 'Seis pedidos, votación a mano alzada antes de tocar. Errores esperados: el tanque como clase hija (es un dato) y el arma con herencia (la herencia no cambia en ejecución). Pregunta de cierre: ¿cuándo sí heredas? Respuesta: cuando el motor lo pide (MonoBehaviour) o la relación es estable y de un eje. 4 minutos.' },

      { kind: 'industria', title: 'En juegos reales: armar con piezas',
        full: [
          { juegos: [
            { j: 'Unity', t: 'Cada GameObject es una bolsa de componentes: Transform, Rigidbody2D y tus MonoBehaviour. Add Component es el patrón Componente.', src: 'Manual de Unity: «GameObjects» e «Introduction to components»' },
            { j: 'Unreal Engine', t: 'Hereda en un eje corto y estable (Actor, Pawn, Character) y compone el resto con UActorComponent: movimiento, colisión, audio.', src: 'Documentación de Unreal Engine: «Components»' },
            { j: 'Overwatch', t: 'Gameplay con ECS: entidades sin lógica, componentes con datos y sistemas que los recorren. La composición llevada al extremo.', src: 'Timothy Ford, «Overwatch Gameplay Architecture and Netcode», GDC 2017' }
          ], pasos: true },
          { clave: 'Herencia corta para lo estable, piezas para lo que varía.', paso: true }
        ],
        nota: 'Revela un caso a la vez. Pregunta con Unreal: ¿contradice lo que vimos? Respuesta esperada: no, hereda poco y en un eje estable, y compone el resto. ECS lo vemos en la semana 6. La página de la clase trae dos casos más (Dungeon Siege, Unity UI). 3 minutos.' },

      { kind: 'actividad', title: 'Los módulos de Turno Nocturno · 12 min',
        lead: 'En parejas, rediseñen el juego en una lista de 5 a 7 módulos.',
        izq: 50,
        left: [
          { ol: ['Nombre y <b>una frase</b> de responsabilidad, sin «y».', 'Flechas: quién conoce a quién. Menos es mejor.', 'Un enchufe en al menos una flecha.', '¿Dónde quedaron <code>Console.Beep</code> y <code>File.WriteAllText</code>?'], pasos: true },
          { pie: 'Guárdenlo: es el primer borrador del plano del ACA 1.' }
        ],
        right: [{ svg: svgModulos }, { p: 'Si un módulo se llama «Juego» o «Manager», revisa: ¿es una navaja suiza?' }],
        nota: 'Salas de 2 o 3: 8 minutos de trabajo y 4 para que dos parejas muestren. El dibujo de la derecha es solo la notación, no la solución. Pregunta a cada pareja: ¿qué módulo cambia si pasamos el juego a Unity? Respuesta esperada: solo los que tocan consola (entrada, dibujo, sonido). Error esperado: un módulo que lo hace todo. Corta puntual: el parcial empieza a la 1:35.' },

      { kind: 'cierre', title: 'Lo que te llevas hoy',
        full: [
          { ol: ['<b>Acoplamiento bajo, cohesión alta.</b> Pocas flechas entre piezas; dentro, solo lo que va junto.', '<b>Programa contra el enchufe.</b> <code>IDaniable</code> deja agregar sin editar.', '<b>Arma, no heredes.</b> Comportamientos como piezas, igual que en Unity.'], pasos: true },
          { p: 'Ahora: quiz-parcial del Corte I (30 %), 25 minutos. Después, para repasar: <a href="quiz.html?s=2">quiz de la clase</a>. Tarea: pasa en limpio tu lista de módulos y cuenta los bools de estado.', paso: true }
        ],
        nota: '3 minutos. Pregunta rápida antes del parcial: ¿qué une a las tres ideas? Respuesta: que un cambio toque la menor cantidad de piezas. Reglas del parcial: individual, 25 minutos, un intento. El quiz de la clase 2 queda abierto como repaso después de la sesión, no antes del parcial. La próxima semana abre el ACA 1.' }
    ],

    quiz: [
      { tema: 'Acoplamiento', q: '¿Cuál es la mejor señal de que dos módulos están muy acoplados?', opts: ['Están en el mismo archivo', 'Cambiar uno te obliga casi siempre a abrir y cambiar el otro', 'Los dos tienen muchas líneas', 'Uno de los dos usa una interfaz'], ok: 1, why: 'El acoplamiento se mide por cuánto sabe una pieza de la otra, y eso se nota el día que una cambia. Estar en el mismo archivo o ser largos no lo prueba.' },
      { tema: 'Cohesión', q: 'Una clase <code>Utilidades</code> guarda el puntaje, reproduce sonidos y calcula colisiones. ¿Qué problema tiene?', opts: ['Acoplamiento bajo', 'Demasiadas interfaces', 'Usa herencia', 'Baja cohesión: junta cosas que no pertenecen a la misma tarea'], ok: 3, why: 'Es el cajón de sastre. No se puede describir en una frase sin usar «y», y cualquier cambio del juego termina pasando por ella.' },
      { tema: 'Interfaces', q: 'La chispa recibe un <code>IDaniable</code> en lugar de un <code>Bicho</code>. ¿Qué gana el equipo?', opts: ['Que cualquier cosa nueva que cumpla la interfaz reciba daño sin tocar la chispa', 'Que el juego corra más rápido', 'Que el bicho tenga más vida', 'Que ya no haga falta la clase <code>Bicho</code>'], ok: 0, why: 'La chispa depende del enchufe y no del aparato. Servidores, cajas o jefes pueden conectarse después sin editarla.' },
      { tema: 'SOLID', q: 'Para agregar un bicho nuevo hay que sumar un <code>else if</code> en cuatro lugares del código. ¿Qué letra de SOLID se está incumpliendo de forma más directa?', opts: ['S: una sola responsabilidad', 'D: invertir la dependencia', 'O: abierto para agregar, cerrado para editar', 'Ninguna, así se hace'], ok: 2, why: 'La O pide poder extender el juego sin modificar el código que ya funciona. Cada <code>else if</code> nuevo es una edición sobre código probado.' },
      { tema: 'SOLID', q: 'Dentro de la lógica de colisiones aparece <code>Console.Beep()</code>. ¿Qué cambio aplica mejor la letra D?', opts: ['Cambiar el pitido por uno más largo', 'Que la lógica llame a un <code>ISonido</code> y que la consola sea solo una de sus implementaciones', 'Copiar el <code>Console.Beep</code> en un método aparte dentro de la misma clase', 'Borrar el sonido del juego'], ok: 1, why: 'Depender del enchufe permite cambiar la consola por Unity, o por un sonido falso en las pruebas, sin tocar las colisiones. Moverlo a un método aparte sigue nombrando al aparato.' },
      { tema: 'Composición', q: 'Diseño pide enemigos con cualquier mezcla de: caminar, volar, nadar y disparar. ¿Qué enfoque escala mejor?', opts: ['Una clase por cada combinación, heredando unas de otras', 'Una sola clase <code>Enemigo</code> con 4 bools y un <code>if</code> por cada uno en cada método', 'Copiar y pegar el código entre clases', 'Una entidad a la que se le agregan componentes, uno por habilidad'], ok: 3, why: 'Con herencia serían 16 clases. Con componentes son 4 piezas que se combinan al armar cada enemigo.' },
      { tema: 'Componentes', q: 'En Unity, ¿qué corresponde a «la bolsa» y qué a «las piezas» del patrón Componente?', opts: ['La escena y los prefabs', 'El GameObject y sus componentes (por ejemplo, los MonoBehaviour)', 'El MonoBehaviour y sus variables', 'El proyecto y sus carpetas'], ok: 1, why: 'Un GameObject casi no hace nada por sí solo. Su comportamiento sale de los componentes que le agregas.' },
      { tema: 'Interfaces', q: 'Una chispa en Unity hace <code>if (otro.TryGetComponent&lt;IDaniable&gt;(out var obj)) obj.RecibirDanio(1);</code>. Choca primero con una caja que tiene el componente <code>Vida</code> (implementa <code>IDaniable</code>) y luego con una pared que no lo tiene. ¿Qué pasa?', opts: ['Las dos reciben daño', 'Error en la pared porque <code>obj</code> es null', 'No compila: una interfaz no puede buscarse como componente', 'La caja recibe daño; la pared se ignora sin error'], ok: 3, why: '<code>TryGetComponent</code> acepta interfaces y devuelve false si no encuentra ninguna, así que el <code>if</code> no entra. La chispa daña lo que cumple el enchufe e ignora lo demás.' },
      { tema: 'SOLID', q: 'Quieres una prueba automática que verifique que eliminar un bicho suena exactamente una vez, sin parlantes. ¿Qué diseño lo permite?', opts: ['<code>Colisiones</code> recibe un <code>ISonido</code>; en la prueba le pasas un <code>SonidoFalso</code> que cuenta llamadas', 'Grabar el pitido con un micrófono durante la prueba', 'Comentar el <code>Console.Beep</code> mientras pruebas', 'Volver estático el método que suena'], ok: 0, why: 'Es la D en la práctica: como la lógica depende del enchufe, se puede conectar una implementación falsa que solo cuenta. Las otras opciones no prueban nada o lo hacen más difícil.' },
      { tema: 'Criterio', q: 'Diseño pide un «tanque rojo»: igual al tanque, pero con 5 de vida y otro color. Un compañero crea <code>class TanqueRojo : Tanque</code> que solo cambia el constructor. ¿Qué opinas?', opts: ['Bien: cada variante merece su clase', 'Mejor un componente nuevo <code>EsRojo</code>', 'Es un dato: el mismo bicho con vida = 5 y otro color', 'Hay que crear una interfaz <code>ITanque</code>'], ok: 2, why: 'Si solo cambian números o colores, no hay comportamiento nuevo que encapsular. Una clase por variante multiplica archivos sin ganar nada; en la semana 4 esos datos salen a un archivo.' }
    ]
  };
})();
