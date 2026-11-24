(function () {
  /* Los puntajes, vidas y símbolos son los de proyecto/TurnoNocturno/Program.cs:
     lento 'b' (10 puntos), rápido 'B' (20), tanque 'M' (3 de vida, 50 puntos). */
  const regado = `// Al crear la oleada
if (tipo == "tanque") { enemX.Add(x); enemY.Add(1); enemTipo.Add("tanque"); enemHp.Add(3); }
else                  { enemX.Add(x); enemY.Add(1); enemTipo.Add(tipo);     enemHp.Add(1); }

// Al mover
if (enemTipo[i] == "rapido") enemY[i] += 2; else enemY[i] += 1;

// Al dibujar
if (enemTipo[i] == "rapido") Console.Write('B');
else if (enemTipo[i] == "tanque") Console.Write('M');
else Console.Write('b');

// Al sumar puntos
if (enemTipo[i] == "lento")  puntos += 10;
if (enemTipo[i] == "rapido") puntos += 20;
if (enemTipo[i] == "tanque") puntos += 50;`;

  const factoryAntes = `// Crear: el new y el if viven aquí...
if (tipo == "rapido") {
    enemX.Add(x); enemY.Add(1);
    enemTipo.Add("rapido"); enemHp.Add(1);
}
else if (tipo == "tanque") {
    enemX.Add(x); enemY.Add(1);
    enemTipo.Add("tanque"); enemHp.Add(3);
}

// ...y también aquí, 80 líneas abajo
if (enemTipo[i] == "rapido") enemY[i] += 2;

// ...y aquí, 120 líneas abajo
if (enemTipo[i] == "tanque") Console.Write('M');`;

  const factoryDespues = `// Un solo lugar sabe fabricar bichos
bichos.Add(FabricaDeBichos.Crear("tanque", x));

// Mover: ya no pregunta el tipo
foreach (var b in bichos)
    b.Y += b.Velocidad * dt;

// Dibujar: tampoco
foreach (var b in bichos)
    Pintar(b.X, b.Y, b.Simbolo);

// Bicho nuevo = una línea en la fábrica.
// Este código no se vuelve a abrir.`;

  const factoryCS = `using System;
using System.Collections.Generic;

class Bicho
{
    public char Simbolo;         // un carácter: 'b', 'B', 'M'
    public int Vida;
    public float Velocidad;      // casillas por segundo
    public float X, Y;

    public Bicho(char simbolo, int vida, float vel)
    {
        Simbolo = simbolo; Vida = vida; Velocidad = vel;
    }
}

static class FabricaDeBichos
{
    // Los moldes: una receta por tipo. Bicho nuevo = una línea nueva.
    static readonly Dictionary<string, Func<Bicho>> moldes = new()
    {
        ["lento"]  = () => new Bicho('b', vida: 1, vel: 2f),
        ["rapido"] = () => new Bicho('B', vida: 1, vel: 4f),
        ["tanque"] = () => new Bicho('M', vida: 3, vel: 1f),
    };

    public static Bicho Crear(string tipo, float x)
    {
        if (!moldes.TryGetValue(tipo, out var molde))
            throw new ArgumentException("No existe el bicho: " + tipo);
        Bicho b = molde();       // el único new de bichos de todo el juego
        b.X = x; b.Y = 0f;
        return b;
    }
}`;

  const factoryUnity = `using UnityEngine;

public class FabricaDeBichos : MonoBehaviour
{
    [System.Serializable]
    public struct Molde { public string tipo; public GameObject prefab; }

    [SerializeField] Molde[] moldes;     // se llenan en el Inspector, sin tocar código

    public GameObject Crear(string tipo, Vector3 posicion)
    {
        foreach (var m in moldes)
            if (m.tipo == tipo)
                return Instantiate(m.prefab, posicion, Quaternion.identity);

        Debug.LogError("No existe el bicho: " + tipo);
        return null;
    }
}`;

  const strategyCS = `using System;

interface IMovimiento            // el contrato: "sé mover un bicho"
{
    void Mover(Bicho b, float dt, float jugadorX);
}

class Recto : IMovimiento
{
    public void Mover(Bicho b, float dt, float jugadorX) => b.Y += b.Velocidad * dt;
}

class ZigZag : IMovimiento
{
    float t;                     // estado propio: un ZigZag por bicho, no se comparte
    public void Mover(Bicho b, float dt, float jugadorX)
    {
        t += dt;
        b.Y += b.Velocidad * dt;
        b.X += MathF.Cos(t * 4f) * 6f * dt;
    }
}

class Perseguir : IMovimiento
{
    public void Mover(Bicho b, float dt, float jugadorX)
    {
        b.Y += b.Velocidad * dt;
        b.X += MathF.Sign(jugadorX - b.X) * 3f * dt;
    }
}`;

  const strategyBicho = `class Bicho
{
    public char Simbolo;
    public int Vida;
    public float Velocidad;
    public float X, Y;
    public IMovimiento Cerebro = new Recto();   // la punta del destornillador

    public Bicho(char simbolo, int vida, float vel)
    {
        Simbolo = simbolo; Vida = vida; Velocidad = vel;
    }

    public void Actualizar(float dt, float jugadorX)
    {
        Cerebro.Mover(this, dt, jugadorX);      // el cuerpo delega, no pregunta
    }
}

// La fábrica ahora también elige el cerebro (constructor + inicializador):
// ["rapido"] = () => new Bicho('B', vida: 1, vel: 4f) { Cerebro = new ZigZag() },`;

  const strategyUnity = `using UnityEngine;

// En Unity cada clase va en su propio archivo con el mismo nombre.
// La estrategia es un asset: se crea desde el menú y se arrastra al bicho.
// Como el asset lo comparten todos los bichos, NO guarda estado: recibe el tiempo.
public abstract class Movimiento : ScriptableObject
{
    public abstract Vector2 Direccion(Transform yo, Transform jugador, float t);
}

[CreateAssetMenu(menuName = "Turno Nocturno/Movimiento/ZigZag")]
public class MovimientoZigZag : Movimiento
{
    public float amplitud = 1.5f;

    public override Vector2 Direccion(Transform yo, Transform jugador, float t)
        => new Vector2(Mathf.Cos(t * 4f) * amplitud, -1f);
}

public class Bicho : MonoBehaviour
{
    [SerializeField] Movimiento cerebro;     // cambias el asset, cambia la conducta
    [SerializeField] Transform jugador;
    [SerializeField] float velocidad = 2f;
    Rigidbody2D rb;

    void Awake() { rb = GetComponent<Rigidbody2D>(); }

    void FixedUpdate()
    {
        rb.linearVelocity = cerebro.Direccion(transform, jugador, Time.time) * velocidad;
    }
}`;

  const singleton = `using System;

class Audio
{
    public static readonly Audio Instancia = new Audio();   // uno solo, visible desde todas partes

    Audio() { }                                             // constructor privado: nadie crea otro

    public void Reproducir(string sonido) => Console.Beep(800, 20);   // Console.Beep: solo Windows
}

// En las colisiones:
Audio.Instancia.Reproducir("golpe");
// En el disparo:
Audio.Instancia.Reproducir("chispa");
// En el menú, en las oleadas, en el puntaje...
Audio.Instancia.Reproducir("clic");`;

  const locator = `using System;

interface IAudio { void Reproducir(string sonido); }

class AudioConsola : IAudio
{
    public void Reproducir(string sonido) => Console.Beep(sonido == "golpe" ? 300 : 800, 20);
}

class AudioNulo : IAudio          // Null Object: cumple el contrato y no hace nada
{
    public void Reproducir(string sonido) { }
}

static class Servicios            // la recepción del hotel
{
    static IAudio audio = new AudioNulo();        // nunca es null

    public static IAudio Audio => audio;

    public static void Registrar(IAudio servicio) => audio = servicio ?? new AudioNulo();
}

// Al arrancar el juego:     Servicios.Registrar(new AudioConsola());
// Al arrancar las pruebas:  nada. Queda de turno el audio mudo.
// En cualquier parte:       Servicios.Audio.Reproducir("golpe");`;

  const inyeccion = `// La opción más simple: quien necesita audio lo recibe al nacer.
class Disparo
{
    readonly IAudio audio;

    public Disparo(IAudio audio) { this.audio = audio; }

    public void Disparar()
    {
        // ... crear la chispa ...
        audio.Reproducir("chispa");
    }
}

// En el juego:      var disparo = new Disparo(new AudioConsola());
// En una prueba:    var disparo = new Disparo(new AudioNulo());
// La dependencia queda a la vista en la firma: nadie la esconde.`;

  const datosAntes = `// Para balancear hay que abrir Program.cs,
// cambiar un número y recompilar.
if (oleada == 1) { CrearBichos("lento", 6); }
if (oleada == 2) { CrearBichos("lento", 4);
                   CrearBichos("rapido", 4); }
if (oleada == 3) { CrearBichos("rapido", 6);
                   CrearBichos("tanque", 2); }

if (enemTipo[i] == "tanque") enemHp[i] = 3;
if (enemTipo[i] == "rapido") enemY[i] += 2;`;

  const datosDespues = `// El código no sabe cuántos ni cuáles: lo lee.
DatosJuego datos = Cargador.Leer("datos/juego.json");
FabricaDeBichos.Cargar(datos);

var receta = datos.Oleadas[oleada - 1].Bichos;     // oleada empieza en 1, la lista en 0
foreach (var (tipo, cantidad) in receta)
    for (int i = 0; i < cantidad; i++)
    {
        float x = ColumnaLibre();
        bichos.Add(FabricaDeBichos.Crear(tipo, x));
    }

// Oleada 4, bicho 13, tanque con 5 de vida:
// se edita el archivo de datos. Nada más.`;

  const datosJSON = `{
  "bichos": [
    { "id": "lento",  "simbolo": "b", "vida": 1, "velocidad": 2.0, "movimiento": "recto" },
    { "id": "rapido", "simbolo": "B", "vida": 1, "velocidad": 4.0, "movimiento": "zigzag" },
    { "id": "tanque", "simbolo": "M", "vida": 3, "velocidad": 1.0, "movimiento": "perseguir" }
  ],
  "oleadas": [
    { "bichos": { "lento": 6 },               "pausaEntreBichos": 1.0 },
    { "bichos": { "lento": 4, "rapido": 4 },  "pausaEntreBichos": 0.7 },
    { "bichos": { "rapido": 6, "tanque": 2 }, "pausaEntreBichos": 0.5 }
  ]
}`;

  const datosCS = `using System.Collections.Generic;

class DatosBicho
{
    public string Id { get; set; } = "";
    public string Simbolo { get; set; } = "?";       // en JSON no hay char: llega un texto de 1 letra
    public int Vida { get; set; } = 1;               // valor por defecto si el JSON no lo trae
    public float Velocidad { get; set; } = 2f;
    public string Movimiento { get; set; } = "recto";
}

class DatosOleada
{
    public Dictionary<string, int> Bichos { get; set; } = new();
    public float PausaEntreBichos { get; set; } = 1f;
}

class DatosJuego
{
    public List<DatosBicho> Bichos { get; set; } = new();
    public List<DatosOleada> Oleadas { get; set; } = new();
}`;

  const datosCargar = `using System.IO;
using System.Linq;
using System.Text.Json;

static class Cargador
{
    public static DatosJuego Leer(string ruta)
    {
        var opciones = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var datos = JsonSerializer.Deserialize<DatosJuego>(File.ReadAllText(ruta), opciones)
                    ?? throw new InvalidDataException("Archivo vacío: " + ruta);

        foreach (var b in datos.Bichos)              // validar al cargar, no en pleno juego
        {
            if (b.Vida <= 0 || b.Velocidad <= 0)
                throw new InvalidDataException(
                    $"{ruta}: el bicho '{b.Id}' necesita vida y velocidad mayores que cero.");
            if (b.Simbolo.Length != 1)
                throw new InvalidDataException($"{ruta}: el símbolo de '{b.Id}' debe ser una sola letra.");
        }

        var ids = datos.Bichos.Select(b => b.Id).ToHashSet();   // corre una vez, al cargar
        foreach (var o in datos.Oleadas)
            foreach (var tipo in o.Bichos.Keys)
                if (!ids.Contains(tipo))
                    throw new InvalidDataException($"{ruta}: una oleada pide '{tipo}', que no existe.");
        return datos;
    }
}`;

  const fabricaDatos = `using System;
using System.Collections.Generic;

// Todo junto: la fábrica (Factory) arma sus moldes desde la receta (datos)
// y cada molde elige el cerebro del bicho (Strategy).
static class FabricaDeBichos
{
    static readonly Dictionary<string, Func<Bicho>> moldes = new();

    public static void Cargar(DatosJuego datos)
    {
        moldes.Clear();
        foreach (var d in datos.Bichos)
            moldes[d.Id] = () => new Bicho(d.Simbolo[0], d.Vida, d.Velocidad)
            {
                Cerebro = Cerebros.Crear(d.Movimiento)   // un cerebro nuevo por bicho
            };
    }

    public static Bicho Crear(string tipo, float x)
    {
        if (!moldes.TryGetValue(tipo, out var molde))
            throw new ArgumentException("No existe el bicho: " + tipo);
        Bicho b = molde();
        b.X = x; b.Y = 0f;
        return b;
    }
}`;

  const cerebros = `using System.IO;

// Una fábrica pequeñita de estrategias: del texto del JSON a un objeto.
static class Cerebros
{
    public static IMovimiento Crear(string nombre) => nombre switch
    {
        "recto"     => new Recto(),
        "zigzag"    => new ZigZag(),
        "perseguir" => new Perseguir(),
        _ => throw new InvalidDataException("Movimiento desconocido: " + nombre)
    };
}`;

  const datosLua = `-- datos/juego.lua : en Lua, la tabla ES el archivo de datos
return {
  bichos = {
    lento  = { simbolo = "b", vida = 1, velocidad = 2.0, movimiento = "recto" },
    rapido = { simbolo = "B", vida = 1, velocidad = 4.0, movimiento = "zigzag" },
    tanque = { simbolo = "M", vida = 3, velocidad = 1.0, movimiento = "perseguir",
               -- una tabla también puede traer comportamiento: eso ya es scripting
               alMorir = function(juego) juego.soltarBateria() end },
  },
  oleadas = {
    { bichos = { lento = 6 },              pausaEntreBichos = 1.0 },
    { bichos = { lento = 4, rapido = 4 },  pausaEntreBichos = 0.7 },
    { bichos = { rapido = 6, tanque = 2 }, pausaEntreBichos = 0.5 },
  },
}

-- Quien lo usa:
-- local datos = require("datos.juego")
-- print(datos.bichos.tanque.vida)   --> 3`;

  const datosUnity = `using UnityEngine;

// Clic derecho en Project > Create > Turno Nocturno > Bicho: nace un asset editable.
[CreateAssetMenu(fileName = "NuevoBicho", menuName = "Turno Nocturno/Bicho")]
public class DatosBicho : ScriptableObject
{
    public string id = "lento";
    public Sprite sprite;
    [Min(1)] public int vida = 1;                    // el Inspector no deja poner 0
    [Range(0.5f, 10f)] public float velocidad = 2f;  // ni una velocidad absurda
    public Movimiento movimiento;                    // la estrategia también es un dato
}

// En otro archivo: Bicho.cs
public class Bicho : MonoBehaviour
{
    [SerializeField] DatosBicho datos;   // arrastra el asset en el Inspector
    int vidaActual;                      // lo que cambia al jugar vive en el bicho

    void OnEnable() { vidaActual = datos.vida; }   // el asset es la receta: no se modifica al jugar
}`;

  /* ---------- Versiones recortadas para las slides (las completas están arriba, en la página de la clase) ---------- */
  const sRegado = `// Al crear la oleada
if (tipo == "tanque") enemHp.Add(3);
else enemHp.Add(1);

// Al mover
if (enemTipo[i] == "rapido") enemY[i] += 2;
else enemY[i] += 1;

// Al dibujar
if (enemTipo[i] == "rapido") Console.Write('B');
else if (enemTipo[i] == "tanque") Console.Write('M');
else Console.Write('b');

// Al sumar puntos
if (enemTipo[i] == "lento")  puntos += 10;
if (enemTipo[i] == "rapido") puntos += 20;
if (enemTipo[i] == "tanque") puntos += 50;`;

  const sFabrica = `static class FabricaDeBichos
{
    static Dictionary<string, Func<Bicho>> moldes = new()
    {
        ["lento"]  = () => new Bicho('b', vida: 1, vel: 2f),
        ["rapido"] = () => new Bicho('B', vida: 1, vel: 4f),
        ["tanque"] = () => new Bicho('M', vida: 3, vel: 1f),
    };

    public static Bicho Crear(string tipo, float x)
    {
        if (!moldes.TryGetValue(tipo, out var molde))
            throw new ArgumentException("No existe: " + tipo);
        Bicho b = molde();        // el único new de bichos
        b.X = x;
        return b;
    }
}`;

  const sFabricaUnity = `public class FabricaDeBichos : MonoBehaviour
{
    [System.Serializable] public struct Molde
    { public string tipo; public GameObject prefab; }

    [SerializeField] Molde[] moldes;   // en el Inspector
    public GameObject Crear(string tipo, Vector3 p)
    {
        foreach (var m in moldes)
        {
            if (m.tipo != tipo) continue;
            var giro = Quaternion.identity;
            return Instantiate(m.prefab, p, giro);
        }
        Debug.LogError("No existe el bicho: " + tipo);
        return null;
    }
}`;

  const sEstrategia = `interface IMovimiento                 // el encaje
{
    void Mover(Bicho b, float dt, float jugadorX);
}
class Recto : IMovimiento             // una punta
{
    public void Mover(Bicho b, float dt, float jugadorX)
        => b.Y += b.Velocidad * dt;
}

class Bicho                           // el mango
{
    public float X, Y, Velocidad; public int Vida;
    public IMovimiento Cerebro = new Recto();

    public void Actualizar(float dt, float jugadorX)
        => Cerebro.Mover(this, dt, jugadorX);
}`;

  const sZigZag = `class ZigZag : IMovimiento            // otra punta
{
    float t;                     // estado: uno por bicho
    public void Mover(Bicho b, float dt, float jugadorX)
    {
        t += dt;
        b.Y += b.Velocidad * dt;
        b.X += MathF.Cos(t * 4f) * 6f * dt;
    }
}

// Cambiar de cerebro en pleno juego: una asignación.
tanque.Cerebro = new ZigZag();`;

  const sEstrategiaUnity = `public abstract class Movimiento : ScriptableObject
{
    public abstract Vector2 Direccion(Transform yo,
        Transform jugador, float t);
}
// Sin estado propio: el asset lo comparten todos los bichos.
[CreateAssetMenu(menuName = "Turno Nocturno/Movimiento/ZigZag")]
public class MovimientoZigZag : Movimiento
{
    public float amplitud = 1.5f;
    public override Vector2 Direccion(Transform yo,
        Transform jugador, float t)
        => new Vector2(Mathf.Cos(t * 4f) * amplitud, -1f);
}

// En Bicho.cs, FixedUpdate: rb.linearVelocity = velocidad
//     * cerebro.Direccion(transform, jugador, Time.time);`;

  const sSingleton = `class Audio
{
    public static readonly Audio Instancia = new Audio();
    Audio() { }                    // nadie más crea otro
    public void Reproducir(string s) => Console.Beep(800, 20);
}

// En las colisiones:
Audio.Instancia.Reproducir("golpe");
// En el disparo:
Audio.Instancia.Reproducir("chispa");
// En el menú, en las oleadas, en el puntaje...
Audio.Instancia.Reproducir("clic");`;

  const sLocator = `interface IAudio { void Reproducir(string sonido); }

class AudioConsola : IAudio
{
    public void Reproducir(string s) => Console.Beep(800, 20);
}
class AudioNulo : IAudio             // cumple y no hace nada
{
    public void Reproducir(string s) { }
}

static class Servicios               // la recepción
{
    static IAudio audio = new AudioNulo();   // nunca es null
    public static IAudio Audio => audio;
    public static void Registrar(IAudio a)
        => audio = a ?? new AudioNulo();
}`;

  const sConstructor = `class Disparo
{
    readonly IAudio audio;
    public Disparo(IAudio audio) { this.audio = audio; }

    public void Disparar() => audio.Reproducir("chispa");
}

// En el juego:   new Disparo(new AudioConsola());
// En una prueba: new Disparo(new AudioNulo());
// La dependencia se ve en la firma: nadie la esconde.`;

  const sDatosDespues = `// El código no sabe cuántos ni cuáles: lo lee.
DatosJuego datos = Cargador.Leer("datos/juego.json");
FabricaDeBichos.Cargar(datos);

var receta = datos.Oleadas[oleada - 1].Bichos;
foreach (var (tipo, cantidad) in receta)
    for (int i = 0; i < cantidad; i++)
    {
        float x = ColumnaLibre();
        bichos.Add(FabricaDeBichos.Crear(tipo, x));
    }

// Oleada 4, bicho 13, tanque con 5 de vida:
// se edita el archivo de datos. Nada más.`;

  const sDatosLua = `-- datos/juego.lua: en Lua, la tabla ES el archivo de datos
return {
  bichos = {
    lento  = { simbolo = "b", vida = 1, velocidad = 2.0, movimiento = "recto" },
    rapido = { simbolo = "B", vida = 1, velocidad = 4.0, movimiento = "zigzag" },
    tanque = { simbolo = "M", vida = 3, velocidad = 1.0, movimiento = "perseguir",
               -- una tabla también puede traer comportamiento: eso ya es scripting
               alMorir = function(juego) juego.soltarBateria() end },
  },
  oleadas = {
    { bichos = { lento = 6 },              pausaEntreBichos = 1.0 },
    { bichos = { lento = 4, rapido = 4 },  pausaEntreBichos = 0.7 },
    { bichos = { rapido = 6, tanque = 2 }, pausaEntreBichos = 0.5 },
  },
}`;

  const sDatosUnity = `// Clic derecho en Project > Create > Turno Nocturno > Bicho: nace un asset editable.
[CreateAssetMenu(fileName = "NuevoBicho", menuName = "Turno Nocturno/Bicho")]
public class DatosBicho : ScriptableObject
{
    public string id = "lento";
    public Sprite sprite;
    [Min(1)] public int vida = 1;                    // el Inspector no deja poner 0
    [Range(0.5f, 10f)] public float velocidad = 2f;  // ni una velocidad absurda
    public Movimiento movimiento;                    // la estrategia también es un dato
}

// En Bicho.cs:  [SerializeField] DatosBicho datos;   int vidaActual = datos.vida al nacer.
// El asset es la receta compartida: lo que cambia al jugar vive en el bicho, no en el asset.`;

  const sFabricaDatos = `// Todo junto: la fábrica arma sus moldes al leer la receta.
static class FabricaDeBichos
{
    static readonly Dictionary<string, Func<Bicho>> moldes = new();

    public static void Cargar(DatosJuego datos)
    {
        foreach (var d in datos.Bichos)
            moldes[d.Id] = () => new Bicho(d.Simbolo[0], d.Vida, d.Velocidad)
            {
                Cerebro = Cerebros.Crear(d.Movimiento)   // Strategy elegida por el dato
            };
    }
    // Crear(tipo, x) no cambia: sigue siendo el único new de bichos.
}`;

  window.CLASE = {
    n: 4,
    titulo: 'Patrones II: fabricar y configurar',
    objetivos: [
      'Centralizar la creación de enemigos en una fábrica para que agregar un tipo nuevo sea tocar un solo lugar.',
      'Cambiar el comportamiento de un objeto en pleno juego con Strategy, sin tocar su clase, y distinguirlo de State.',
      'Explicar por qué un Singleton acopla y cómo un Service Locator con un objeto nulo permite probar sin sonido ni disco.',
      'Sacar los números del código y escribir el contrato de datos de un bicho y una oleada en JSON, Lua o ScriptableObject, validado al cargar.'
    ],
    analogia: 'La carta del restaurante: se cambia el menú sin reconstruir la cocina. La fábrica es la cocina que sabe preparar cualquier plato de la carta, la estrategia es la punta intercambiable del destornillador y los datos son la receta escrita en un papel, no guardada en la cabeza del cocinero.',
    agenda: [
      ['0:00', 'Repaso relámpago de State, Observer y Command. El reto de los 12 bichos'],
      ['0:10', 'Factory: un solo lugar sabe fabricar'],
      ['0:28', 'Strategy: cambiar de cerebro sin cambiar de cuerpo. Strategy o State'],
      ['0:50', 'Singleton frente a Service Locator y el audio mudo'],
      ['1:03', 'Diseño dirigido por datos: JSON, Lua y ScriptableObject. Casos reales'],
      ['1:20', 'Validar al cargar y la demo de datos en vivo'],
      ['1:27', 'Actividad: el contrato de datos de un bicho y una oleada'],
      ['1:37', 'Tabla del síntoma al patrón y cierre'],
      ['1:40', 'Asesoría del ACA 1: revisión de borradores de diagramas (20 min)']
    ],
    codigoIntro: 'Cuatro piezas para dejar de tocar el código que ya funciona: una fábrica, una estrategia, un localizador de servicios y los datos por fuera. Al final, las cuatro juntas: la fábrica lee la receta y cada bicho recibe su cerebro desde el archivo. Primero C# sin motor, luego la misma idea en Unity y en Lua.',
    codigo: [
      { titulo: 'Factory: la fábrica de bichos', desc: 'El único lugar del juego que hace <code>new Bicho</code>. En C# los moldes son un diccionario de funciones; en Unity son prefabs que se llenan en el Inspector.',
        tabs: [{ lang: 'C#', src: factoryCS }, { lang: 'Unity', src: factoryUnity }] },
      { titulo: 'Strategy: cerebros intercambiables', desc: 'El bicho no sabe cómo se mueve: se lo pregunta a su estrategia. Cambiar la estrategia es asignar un campo. Ojo: una estrategia con estado (como <code>ZigZag</code> con su <code>t</code>) va una por bicho; la de Unity es un asset compartido y por eso no guarda estado.',
        tabs: [{ lang: 'C#', label: 'C# (estrategias)', src: strategyCS }, { lang: 'C#', label: 'C# (el bicho)', src: strategyBicho }, { lang: 'Unity', src: strategyUnity }] },
      { titulo: 'Singleton y Service Locator con audio mudo', desc: 'El Singleton deja a todo el juego amarrado a una clase. La recepción te conecta con el servicio que esté de turno; si nadie se registró, atiende <code>AudioNulo</code>. La tercera pestaña muestra la alternativa más simple: pasar el servicio por el constructor.',
        tabs: [{ lang: 'C#', label: 'C# (Singleton)', src: singleton }, { lang: 'C#', label: 'C# (Service Locator)', src: locator }, { lang: 'C#', label: 'C# (por constructor)', src: inyeccion }] },
      { titulo: 'Datos por fuera del código', desc: 'Los mismos bichos y oleadas en tres formatos. El cargador valida al arrancar: vida, velocidad, símbolo y que cada oleada pida bichos que existen. Si algo falla, avisa con archivo, bicho y campo.',
        tabs: [{ lang: 'JSON', label: 'juego.json', src: datosJSON }, { lang: 'C#', label: 'C# (las clases)', src: datosCS }, { lang: 'C#', label: 'C# (cargar y validar)', src: datosCargar }, { lang: 'Lua', label: 'Lua (tabla)', src: datosLua }, { lang: 'Unity', label: 'Unity (ScriptableObject)', src: datosUnity }] },
      { titulo: 'Todo junto: la fábrica lee la receta', desc: 'Factory, Strategy y datos en un solo lugar. La fábrica ya no trae los moldes escritos: los arma al cargar el JSON, y cada molde le pide a <code>Cerebros</code> la estrategia que dice el archivo. Agregar un bicho es editar <code>juego.json</code>.',
        tabs: [{ lang: 'C#', label: 'C# (fábrica desde datos)', src: fabricaDatos }, { lang: 'C#', label: 'C# (fábrica de cerebros)', src: cerebros }, { lang: 'C#', label: 'C# (usarla en la oleada)', src: datosDespues }] }
    ],
    tarea: [
      'Avanza el ACA 1 (diagnóstico y plano de rescate). Cierra el domingo 27 de diciembre. Incorpora lo que salió hoy en la asesoría.',
      'Agrega al plano de rescate el contrato de datos que escribiste en clase: campos, tipos, rangos y valores por defecto de un bicho y una oleada.',
      'En tu plano, marca con color cada <code>if (enemTipo[i] == ...)</code> de <code>Program.cs</code> y escribe al lado qué patrón lo reemplaza: fábrica, estrategia o datos.',
      'Opcional: juega con la demo de datos y diseña un bicho que sea difícil pero justo. Trae su JSON a la próxima clase.'
    ],
    lecturas: [
      'Nystrom, R. (2014). <i>Game Programming Patterns</i>, capítulos "Singleton", "Service Locator" y "Type Object" (gratis en gameprogrammingpatterns.com).',
      'Gamma, E., Helm, R., Johnson, R. y Vlissides, J. (1994). <i>Design Patterns</i>: Factory Method, Strategy y State.',
      'Gregory, J. (2018). <i>Game Engine Architecture</i> (3.ª ed.), secciones sobre motores dirigidos por datos y sistemas de scripting.',
      'Hipple, R. (2017). "Game Architecture with Scriptable Objects", charla en Unite Austin 2017.',
      'Manual de Unity: "ScriptableObject" y la clase <code>CreateAssetMenuAttribute</code>.'
    ],

    conceptos: [
      { t: 'Factory (fábrica)', d: 'Un solo lugar que sabe construir objetos de una familia; el resto del código los pide por nombre o por tipo, sin hacer <code>new</code> ni saber cómo se arman.', ej: '<code>FabricaDeBichos.Crear("tanque", x)</code> en Turno Nocturno: agregar el bicho «blindado» es una línea en la fábrica, y oleadas, jefe y tutorial no se abren.' },
      { t: 'Strategy (estrategia)', d: 'Una familia de algoritmos que cumplen la misma interfaz y se intercambian en un objeto sin cambiar su clase. Alguien de afuera elige cuál usar.', ej: 'El cerebro del bicho: <code>Recto</code>, <code>ZigZag</code> o <code>Perseguir</code>. La oleada 3 le asigna <code>Perseguir</code> a los tanques y conservan su vida y su posición.' },
      { t: 'State frente a Strategy', d: 'Se escriben igual (una interfaz, varias clases). En State el propio estado decide a cuál pasar; en Strategy la elección viene de afuera y la estrategia no sabe de las otras.', ej: 'El jefe final pasa solo de Patrullar a Furia al bajar de la mitad de vida (State). El diseñador de la oleada elige que los rápidos hagan zigzag (Strategy).' },
      { t: 'Singleton', d: 'Una clase con una sola instancia accesible desde todas partes. En la práctica es una variable global: cómoda, pero amarra todo el código a esa clase concreta.', ej: '<code>Audio.Instancia.Reproducir("golpe")</code> regado en colisión, disparo y menú: no hay forma de apagar el sonido en una prueba sin editar cada llamada.' },
      { t: 'Service Locator', d: 'Un registro central donde el código pide un servicio por su contrato (una interfaz) y obtiene la implementación que se registró al arrancar.', ej: '<code>Servicios.Audio</code> entrega <code>AudioConsola</code> en el juego y <code>AudioNulo</code> en las pruebas, sin tocar la colisión.' },
      { t: 'Null Object (objeto nulo)', d: 'Una implementación del contrato que no hace nada. Evita preguntar «¿es null?» en cada llamada y permite correr el juego sin ese servicio.', ej: '<code>AudioNulo</code> deja correr 1.000 colisiones de prueba en silencio, en un servidor sin parlantes.' },
      { t: 'Diseño dirigido por datos', d: 'El código define cómo funcionan las cosas; archivos externos dicen qué hay y cuánto. Se balancea y se agrega contenido sin recompilar, y los datos se validan al cargar.', ej: 'Las oleadas de Turno Nocturno en <code>juego.json</code>: el diseñador sube la vida del tanque a 5 y prueba al instante.' },
      { t: 'Type Object', d: 'En vez de una subclase por cada tipo, una sola clase de objeto que apunta a un objeto «tipo» con los datos compartidos (Nystrom lo llama así).', ej: 'Un solo <code>Bicho</code> más un <code>DatosBicho</code> por especie (lento, rápido, tanque), en lugar de <code>BichoLento</code>, <code>BichoRapido</code> y <code>BichoTanque</code>.' }
    ],
    industria: [
      { j: 'Unity · ScriptableObject', t: 'Assets de datos que se crean desde el menú y se editan en el Inspector. Ryan Hipple (Schell Games) mostró cómo usarlos para datos de diseño, variables compartidas y eventos, y así desacoplar sistemas.', src: 'Charla «Game Architecture with Scriptable Objects», Unite Austin 2017; Manual de Unity, «ScriptableObject».' },
      { j: 'Unreal Engine · DataTables y Data Assets', t: 'Tablas de filas con un tipo de estructura definido en código, que se importan desde CSV o JSON, y assets de datos para configurar objetos del juego sin tocar C++.', src: 'Documentación oficial de Unreal Engine: «Data Driven Gameplay Elements» y «Data Assets».' },
      { j: 'World of Warcraft · interfaz en Lua', t: 'La interfaz del juego y los addons de los jugadores se escriben en Lua (con XML para los marcos). El motor expone funciones y eventos; el contenido de la UI vive fuera del ejecutable.', src: 'Whitehead, J. y Roe, R., <i>World of Warcraft Programming</i> (Wiley).' },
      { j: 'Unreal Engine · Subsystems', t: 'Clases cuya vida la administra el motor (por ejemplo, un subsistema de la instancia del juego) y que se piden por tipo. Dan un punto de acceso tipo servicio sin escribir un Singleton a mano.', src: 'Documentación oficial de Unreal Engine: «Programming Subsystems».' },
      { j: 'Game Programming Patterns · Type Object', t: 'Nystrom define las razas de monstruos como objetos de datos cargados desde un archivo, en lugar de una subclase por raza. Es la idea detrás de <code>DatosBicho</code>.', src: 'Nystrom, R. (2014), <i>Game Programming Patterns</i>, capítulo «Type Object».' }
    ],
    errores: [
      { mito: 'Usar más patrones hace el código mejor.', real: 'Un patrón es un remedio para un síntoma. Una fábrica para un juego con un solo enemigo solo agrega archivos. Se nota cuando nadie sabe explicar qué problema resuelve una clase.' },
      { mito: 'Strategy y State son lo mismo porque el código se ve igual.', real: 'Cambia quién decide. Si el objeto cambia solo según lo que le pasa, es State; si alguien de afuera le asigna la conducta, es Strategy. Confundirlos lleva a estados que se eligen desde afuera y se saltan transiciones.' },
      { mito: 'El Service Locator elimina el acoplamiento del Singleton.', real: 'Lo reduce: ahora dependes de un contrato y no de una clase. Pero sigue siendo un acceso global y la dependencia no aparece en la firma. Si puedes pasar el servicio por el constructor, es más claro.' },
      { mito: 'Si los datos están en JSON, ya no hay errores de datos.', real: 'Los errores se mudan del compilador al cargador. Sin validación, un <code>"velocidad": -3</code> hace que el bicho suba y nadie sabe por qué. Se valida una vez, al cargar, con archivo, bicho y campo.' },
      { mito: 'Un ScriptableObject se puede modificar al jugar como si fuera de cada bicho.', real: 'Es un asset compartido. Si el bicho hace <code>datos.vida -= 1</code>, todos los bichos con ese asset lo ven, y en el Editor el valor sigue cambiado al salir de Play. Lo que cambia al jugar va en el bicho.' }
    ],

    slides: [
      { kind: 'portada', title: 'Patrones II: fabricar y configurar',
        lead: 'Semana 4 · Arquitectura de Videojuegos',
        full: [
          { ul: ['Agregar bichos sin abrir el código que ya funciona.', 'Cambiar conductas como se cambia la punta de un destornillador.', 'Sacar los números del código a un archivo de datos.'] },
          { pie: 'Los últimos 20 minutos: asesoría del ACA 1. Ten a la mano el borrador de tus diagramas.' }
        ],
        nota: '2 minutos. Repaso relámpago en el chat: una palabra para State, una para Observer, una para Command. Respuesta esperada: semáforo, campana, comanda. Avisa desde ya que la asesoría empieza a la 1:40 en punto.' },

      { kind: 'reto', title: 'El diseñador quiere 12 bichos para el viernes',
        izq: 44,
        left: [{ check: { q: 'Para agregar UN bicho nuevo, ¿cuántos lugares hay que tocar?', opts: ['Uno: donde se crea', 'Dos: crear y dibujar', 'Todos los que preguntan por el tipo: crear, mover, dibujar, puntuar', 'Ninguno: basta con agregar el nombre a una lista'], ok: 2, why: 'Cada <code>if (enemTipo[i] == ...)</code> es un lugar que hay que recordar. Basta olvidar uno para tener un bicho invisible o que no da puntos.' } }],
        right: [{ code: [{ lang: 'C#', label: 'Program.cs (cuatro lugares)', src: sRegado }], marca: [
          { l: [2, 3], t: '<b>Crear.</b> Un <code>if</code> por tipo.' },
          { l: [6, 7], t: '<b>Mover.</b> Otra vez preguntando el tipo.' },
          { l: [10, 11, 12], t: '<b>Dibujar.</b> Y otra vez.' },
          { l: [15, 16, 17], t: '<b>Puntuar.</b> Cuatro lugares por cada bicho nuevo.' }
        ] }],
        nota: '5 minutos. Pregunta: «¿cuántos lugares toco para agregar el bicho blindado?». Pide que cuenten los if antes de votar. Respuesta esperada: cuatro (crear, mover, dibujar, puntuar). Error típico: «solo donde se crea». Recorre las cuatro marcas. Los puntajes (10, 20, 50) son los de Program.cs. Conecta con la O de SOLID de la semana 2: abierto a extender, cerrado a modificar.' },

      { kind: 'demo', title: 'Doce bichos en espagueti',
        izq: 34,
        left: [
          { big: 'Cada tipo nuevo multiplica los <code>if</code> por todos los lugares que preguntan.' },
          { clave: 'Meta de hoy: un bicho nuevo debe ser una ficha nueva, no una cacería de <code>if</code>.', paso: true },
          { pie: 'Conteo ilustrativo.' }
        ],
        right: [{ fig: 'ifs' }],
        nota: '3 minutos. Sube el deslizador hasta 12 en modo espagueti: 48 ramas. Pregunta: «¿cuántas ramas con 20 tipos?». Respuesta: 80, y cada una es un sitio donde equivocarse. Cambia a «Fábrica + datos»: lo que vamos a construir es justo esa caja verde, la fábrica (primera parte) y los datos (última parte).' },

      { kind: 'analogia', title: 'La ventanilla que entrega bichos armados',
        izq: 58,
        left: [{ fig: 'fabrica' }],
        right: [
          { mapa: [['Pides «bandeja paisa» en la carta', 'Pides <code>Crear("tanque")</code>'], ['Solo la cocina sabe la receta', 'Solo la fábrica hace <code>new</code>'], ['Plato nuevo: un renglón en la carta', 'Bicho nuevo: un molde nuevo']], de: 'En el restaurante', a: 'En el juego', pasos: true },
          { clave: 'Eso es Factory: un solo lugar sabe construir; los demás piden por nombre.', paso: true }
        ],
        nota: '3 minutos. Primero «Sin fábrica» y pide un tanque; luego «Con fábrica». Remata con «Bicho nuevo: blindado» en los dos modos. Pregunta: «¿quién hace los new en su último proyecto?». Respuesta típica: todo el mundo, en cualquier parte. Ese es el síntoma.' },

      { kind: 'antipatron', title: 'Factory: de regado a un solo lugar',
        lead: 'La misma oleada. A la izquierda cada parte del juego sabe de tipos. A la derecha, solo la fábrica.',
        top: true,
        full: [{ compare: { a: { label: 'Antes: new e if por todas partes', lang: 'C#', src: factoryAntes }, b: { label: 'Después: se pide por nombre', lang: 'C#', src: factoryDespues } } }],
        nota: '5 minutos. Señala que a la derecha desaparecieron las listas paralelas: ahora hay una lista de Bicho y cada bicho carga sus propios datos (cohesión, semana 2). Pregunta: «¿dónde quedaron los if?». Respuesta esperada: en ninguna parte; se volvieron datos del bicho (velocidad, símbolo).' },

      { kind: 'codigo', title: 'La fábrica por dentro',
        izq: 38,
        left: [{ check: { q: 'Quieres un bicho «blindado» con 5 de vida. ¿Qué cambias?', opts: ['Una línea nueva en el diccionario de moldes', 'Un if nuevo en Mover, Dibujar y Puntuar', 'La clase Bicho completa', 'El bucle principal'], ok: 0, why: '<code>["blindado"] = () =&gt; new Bicho(\'H\', vida: 5, vel: 1f)</code>. Nadie más se entera.' } }],
        right: [{ code: [{ lang: 'C#', src: sFabrica }, { lang: 'Unity', src: sFabricaUnity }], marca: [
          { l: [3, 5, 6, 7], t: '<b>Los moldes:</b> una función por tipo. <code>\'b\'</code> va entre comillas simples porque <code>Simbolo</code> es un <code>char</code>.' },
          { l: [12, 13], t: 'Si piden algo que no existe, un <b>error con nombre</b>, no un bicho fantasma.' },
          { l: [14], t: 'El <b>único</b> <code>new</code> de bichos de todo el juego.' }
        ] }],
        nota: '6 minutos. Que voten antes de recorrer las marcas. Respuesta esperada: una línea en el diccionario. <code>Func&lt;Bicho&gt;</code> es «una función que devuelve un Bicho»: compáralo con guardar una función en una tabla de Lua. El constructor <code>Bicho(char simbolo, int vida, float vel)</code> está en la página de la clase. En la pestaña Unity los moldes son prefabs del Inspector.' },

      { kind: 'analogia', title: 'Strategy: el destornillador de puntas',
        izq: 52,
        left: [{ fig: 'destornillador' }],
        right: [
          { mapa: [['El mango', 'El bicho<small>posición, vida, símbolo</small>'], ['La punta', 'Su forma de moverse<small>Recto, ZigZag, Perseguir</small>'], ['El encaje', 'La interfaz <code>IMovimiento</code>']], de: 'Herramienta', a: 'Juego', pasos: true },
          { clave: 'El bicho <i>tiene</i> un movimiento; no <i>es</i> un tipo de movimiento.', paso: true }
        ],
        nota: '4 minutos. Dale un chispazo, cambia la punta y muestra que la vida se conserva. Luego marca «Con herencia». Pregunta: «¿qué pasa con la herencia cuando el tanque debe empezar a perseguir?». Respuesta: hay que destruirlo y crear un BichoPerseguidor; pierde vida y posición. Es la composición de la semana 2 con nombre propio.' },

      { kind: 'codigo', title: 'Tres cerebros, un solo cuerpo',
        izq: 38,
        left: [{ check: { q: 'Un tanque con 2 de vida baja recto. El juego ejecuta <code>tanque.Cerebro = new Perseguir();</code> ¿Qué pasa?', opts: ['Hay que destruirlo y fabricar otro tanque', 'Es el mismo tanque, con su posición y sus 2 de vida, pero ahora persigue', 'Error: un objeto no puede cambiar de tipo', 'Vuelve a tener 3 de vida'], ok: 1, why: 'Solo cambió la punta. El cuerpo sigue intacto. Con herencia sería imposible: un objeto no cambia de clase mientras vive.' } }],
        right: [{ code: [{ lang: 'C#', label: 'C# (contrato y cuerpo)', src: sEstrategia }, { lang: 'C#', label: 'C# (ZigZag)', src: sZigZag }, { lang: 'Unity', src: sEstrategiaUnity }], marca: [
          { l: [1, 2, 3, 4], t: '<b>El encaje:</b> toda punta cumple este contrato.' },
          { l: [5, 6, 7, 8, 9], t: '<b>Una punta:</b> una clase pequeña, una sola conducta.' },
          { l: [14], t: 'El bicho <b>tiene</b> un cerebro. Cambiarlo es asignar este campo.' },
          { l: [16, 17], t: 'El cuerpo delega. <b>Ningún if</b> pregunta qué tipo de bicho es.' }
        ] }],
        nota: '7 minutos. Votan, luego las marcas. Respuesta esperada: es el mismo tanque. En la pestaña ZigZag, señala el campo t: es estado propio, así que va un ZigZag por bicho. En Unity la estrategia es un ScriptableObject compartido, por eso no guarda estado y recibe el tiempo. Pregunta para cerrar: «¿qué pasa si 20 bichos comparten un solo ZigZag?». Respuesta: el t corre 20 veces más rápido.' },

      { kind: 'demo', title: 'Cámbiale el cerebro al bicho',
        lead: 'Cada botón ejecuta una sola línea: <code>bicho.Cerebro = new ...</code>. Mueve el puntero sobre el recuadro: el robot te sigue.',
        top: true,
        full: [{ fig: 'estrategia' }, { pie: 'Fíjate en el contador: los cambios de cerebro suben, los bichos creados no.', paso: true }],
        nota: '5 minutos. Deja que ellos lo manejen. Cambia de estrategia a mitad de pantalla y pregunta: «¿saltó de posición?». Respuesta: no. Segunda pregunta: «¿qué haría falta para agregar Huir?». Respuesta: una clase nueva que cumpla IMovimiento y un botón; el bicho no se toca.' },

      { kind: 'reto', title: 'Strategy o State: ¿quién cambia la pieza?',
        izq: 48,
        left: [
          { check: { q: 'El jefe pasa solo de Patrullar a Furia al bajar de la mitad de vida. ¿Qué patrón es?', opts: ['Strategy: alguien de afuera le cambia el cerebro', 'State: cada estado decide a cuál pasar', 'Factory: se fabrica un jefe nuevo', 'Service Locator: lo pide a recepción'], ok: 1, why: 'Las transiciones viven dentro de los estados: Patrullar sabe que con poca vida toca Furia. En Strategy la estrategia no conoce a las otras: la elige alguien de afuera.' } },
          { clave: 'El código se ve igual: una interfaz y varias clases. Cambia <b>quién decide</b>.', paso: true }
        ],
        right: [{ fig: 'stateStrategy' }],
        nota: '5 minutos. Primero votan. Luego en la figura: modo State, golpea al jefe hasta que cambie solo. Modo Strategy, golpea al bicho: no cambia de cerebro; solo cambia cuando la oleada elige otra punta. Pregunta: «¿el semáforo de la semana 3 es State o Strategy?». Respuesta: State, porque el verde sabe que sigue el amarillo.' },

      { kind: 'antipatron', title: 'Singleton: el amigo al que todos llaman',
        lead: 'Contesta a cualquier hora. Comodísimo, hasta que todo tu grupo depende de él.',
        izq: 40,
        left: [{ check: { q: 'Quieres una prueba que ejecute la colisión 1.000 veces. ¿Qué pasa?', opts: ['Nada especial: corre en silencio', 'No compila porque Audio es static', 'El compilador apaga el sonido en las pruebas', 'Suena 1.000 veces y no hay cómo evitarlo sin editar la colisión'], ok: 3, why: 'La colisión quedó amarrada a UNA clase concreta. No se puede cambiar, ni apagar, ni probar en un servidor sin parlante.' } }],
        right: [{ code: [{ lang: 'C#', src: sSingleton }], marca: [
          { l: [3, 4], t: 'Una sola instancia, <b>visible desde todas partes</b>, y un constructor privado para que nadie cree otra: una variable global con buen marketing.' },
          { l: [9, 11, 13], t: 'Todo el juego conoce la <b>clase concreta</b>. Cambiarla es tocar cada llamada.' }
        ] }],
        nota: '6 minutos. No satanices: el Singleton no es «malo», es una global. Pregunta: «¿cuántos archivos conocen la palabra Audio?». Respuesta esperada: todos los que hacen ruido. Recuerda la D de SOLID: depender de contratos, no de clases concretas. Console.Beep(frecuencia, duración) solo existe en Windows: otra razón para no amarrarse a él.' },

      { kind: 'analogia', title: 'Service Locator: la recepción del hotel',
        izq: 58,
        left: [{ fig: 'recepcion' }],
        right: [
          { mapa: [['Marcas a recepción y pides audio', 'Pides el contrato <code>IAudio</code>'], ['Te atiende quien esté de turno', 'La clase que se registró al arrancar'], ['De noche contesta un mudo', '<code>AudioNulo</code><small>objeto nulo: cumple y no hace nada</small>']], de: 'Hotel', a: 'Juego', pasos: true }
        ],
        nota: '5 minutos. Primero Singleton y «Probar 1.000 colisiones». Luego Service Locator, turno mudo y repetir. Pregunta: «¿qué cambió en el código de la colisión?». Respuesta: nada; solo quién atiende. Aclara: el localizador sigue siendo un acceso global, solo que a un contrato y no a una clase. Mejora el Singleton, no es magia.' },

      { kind: 'codigo', title: 'La recepción, línea por línea',
        izq: 46,
        left: [
          { check: { q: 'En las pruebas no quieres sonido. ¿Qué haces?', opts: ['No llamas a <code>Registrar</code>: atiende <code>AudioNulo</code>', 'Comentas cada <code>Reproducir</code> del juego', 'Borras la clase <code>AudioConsola</code>', 'Pones un <code>if (enPruebas)</code> en la colisión'], ok: 0, why: 'La recepción arranca con el mudo de turno. Las pruebas no registran nada y la colisión no se toca.' } },
          { clave: 'Si puedes pasar el servicio por el constructor, hazlo. Deja la recepción para lo que usa casi todo el juego.', paso: true }
        ],
        right: [{ code: [{ lang: 'C#', label: 'C# (Service Locator)', src: sLocator }, { lang: 'C#', label: 'C# (por constructor)', src: sConstructor }], marca: [
          { l: [1], t: '<b>El contrato.</b> Lo único que conoce el resto del juego.' },
          { l: [7, 8, 9, 10], t: '<b>El mudo:</b> cumple el contrato y no hace nada. Ideal para pruebas.' },
          { l: [14], t: 'Si nadie se registró, atiende el mudo. <b>Nunca es null</b>.' },
          { l: [16, 17], t: 'Al arrancar: <code>Servicios.Registrar(new AudioConsola())</code>. Si llega null, vuelve el mudo.' }
        ] }],
        nota: '7 minutos. Votan y luego las marcas. Respuesta esperada: no registrar nada. Pasa a la pestaña del constructor: la dependencia queda a la vista en la firma. Pregunta: «¿cómo sacarían File.WriteAllText de la colisión con esta misma idea?». Respuesta: un contrato IGuardado, un GuardadoArchivo para el juego y un GuardadoNulo para las pruebas.' },

      { kind: 'analogia', title: 'Cambiar la carta sin reconstruir la cocina',
        izq: 58,
        left: [{ fig: 'carta' }],
        right: [
          { mapa: [['La receta en la cabeza del cocinero', 'Números dentro de <code>Program.cs</code>'], ['La receta en un papel', 'Un archivo de datos<small>JSON, tabla Lua, ScriptableObject</small>'], ['Cambiar la carta', 'Balancear sin recompilar']], de: 'Cocina', a: 'Juego', pasos: true },
          { clave: 'El código sabe <i>cómo</i>. Los datos dicen <i>qué</i> y <i>cuánto</i>.', paso: true }
        ],
        nota: '4 minutos. En «En el código» cambia la vida y recompila dos veces: que sientan la espera. Luego «En la carta». Pregunta: «¿quién balancea un juego, el programador o el diseñador?». Respuesta esperada: el diseñador; si cada número pasa por el programador, él se vuelve el cuello de botella.' },

      { kind: 'antipatron', title: 'Los números en el código contra la receta',
        lead: 'A la derecha el código solo sabe leer la receta. Y usa la fábrica de hace un rato.',
        top: true,
        full: [{ compare: { a: { label: 'Antes: recompilar para balancear', lang: 'C#', src: datosAntes }, b: { label: 'Después: el código lee la receta', lang: 'C#', src: sDatosDespues } } }],
        nota: '4 minutos. Señala el <code>oleada - 1</code>: en Program.cs la oleada empieza en 1 y la lista en 0, un error clásico al pasar a datos. Pregunta: «¿qué hay que tocar para una oleada 4?». Respuesta: solo el archivo. Datos y fábrica se apoyan: la fábrica se carga con la receta.' },

      { kind: 'codigo', title: 'La misma receta en tres papeles',
        top: true,
        full: [{ code: [{ lang: 'JSON', label: 'juego.json', src: datosJSON }, { lang: 'Lua', label: 'Lua (tabla)', src: sDatosLua }, { lang: 'Unity', label: 'Unity (ScriptableObject)', src: sDatosUnity }, { lang: 'C#', label: 'C# (la fábrica lee la receta)', src: sFabricaDatos }], marca: [
          { l: [3, 4, 5], t: '<b>Los bichos:</b> cada campo es un número que antes vivía en un <code>if</code>. Hasta el movimiento: el texto <code>"zigzag"</code> elige la estrategia.' },
          { l: [8, 9, 10], t: '<b>Las oleadas:</b> qué bichos y cuántos. Oleada nueva, renglón nuevo.' }
        ] }],
        nota: '8 minutos. Recorre JSON y cambia a Lua: casi el mismo dibujo, y en LÖVE ya escribían tablas así. En Lua señala alMorir: si el dato trae una función, ya es scripting (semana 6). En Unity, [Min] y [Range] son validación gratis. Última pestaña: la fábrica arma sus moldes desde el archivo y pide el cerebro por nombre. Pregunta: «¿dónde viven ahora Factory, Strategy y los datos?». Respuesta: en esas 15 líneas.' },

      { kind: 'industria', title: 'En juegos reales: los datos mandan',
        full: [
          { juegos: [
            { j: 'Unity', t: 'ScriptableObject: assets de datos que el equipo edita en el Inspector. Ryan Hipple los usó para datos, variables compartidas y eventos.', src: 'Unite Austin 2017, «Game Architecture with Scriptable Objects».' },
            { j: 'Unreal Engine', t: 'DataTables que se importan desde CSV o JSON, y Data Assets para configurar sin tocar C++.', src: 'Documentación de Unreal: «Data Driven Gameplay Elements».' },
            { j: 'World of Warcraft', t: 'La interfaz y los addons de los jugadores se escriben en Lua, fuera del ejecutable.', src: 'Whitehead y Roe, <i>World of Warcraft Programming</i> (Wiley).' }
          ], pasos: true },
          { clave: 'En los tres, quien diseña cambia el juego sin esperar una compilación.', paso: true }
        ],
        nota: '3 minutos. Revela un caso a la vez. Pregunta: «¿cuál de los tres se parece más a lo que harían en Turno Nocturno?». Respuesta esperada: el JSON se parece a las DataTables; la tabla Lua, a los addons; y si migran a Unity, ScriptableObject. Recomienda la charla de Hipple como lectura de la semana.' },

      { kind: 'reto', title: 'Predice: el diseñador se equivoca de tecla',
        lead: 'Viernes, 5:50 p. m. Alguien guarda en <code>juego.json</code> un bicho con <code>"velocidad": -3</code>.',
        izq: 36,
        left: [{ check: { q: '¿Qué debería hacer un juego bien armado con ese dato?', opts: ['Avisar al cargar, con archivo, bicho y campo, y no arrancar con datos rotos', 'Cargar igual: el bicho sube en vez de bajar y alguien lo notará', 'Cerrarse sin decir nada', 'Corregirlo en silencio a un valor cualquiera'], ok: 0, why: 'Los datos los escribe gente, y la gente se equivoca. Se validan una vez, al cargar, con un mensaje claro. Nunca en silencio y nunca en pleno frame.' } }],
        right: [{ fig: 'tuberia' }],
        nota: '4 minutos. Votan. Luego en la figura carga «velocidad -3» con y sin validar: sin validar, el error llega hasta el juego. Prueba «falta vida» y «coma de más». Error esperado: «corregir en silencio». Es peligroso: el diseñador cree que su cambio funcionó. Pregunta: «¿en qué caja debe morir un error de datos?». Respuesta: en el cargador.' },

      { kind: 'demo', title: 'Edita el bicho sin recompilar',
        lead: 'El recuadro es el archivo de datos. Cambia un valor y mira al bicho. Luego rómpelo: borra una comilla o pon <code>"vida": 0</code>.',
        top: true,
        full: [{ fig: 'datos' }],
        nota: '7 minutos. Reto rápido: «hagan un bicho injusto y luego uno justo». Luego que lo rompan. Pregunta: «¿qué hizo el juego cuando el dato estaba roto?». Respuesta: explicó el error en lenguaje humano, siguió con los últimos datos válidos y usó valores por defecto si faltaba un campo. Esas tres conductas se piden en el ACA 2.' },

      { kind: 'idea', title: 'Del síntoma al patrón',
        full: [
          { tabla: { head: ['Si en tu código ves...', 'Prueba con...', 'Analogía'], rows: [['<code>new</code> e <code>if (tipo == ...)</code> regados', '<b>Factory</b>', 'La ventanilla'], ['Un <code>if</code> por cada forma de moverse', '<b>Strategy</b>', 'El destornillador'], ['Todos llaman a <code>Algo.Instancia</code>', '<b>Service Locator</b> o constructor', 'La recepción'], ['Recompilar para balancear', '<b>Datos por fuera</b>', 'La carta'], ['Bools sueltos: <code>pausa</code>, <code>menu</code>', '<b>State</b> (semana 3)', 'El semáforo']] }, pasos: true },
          { clave: 'Un patrón es un remedio. Sin síntoma, no se receta.', paso: true }
        ],
        nota: '4 minutos. Esta tabla es la chuleta del ACA 1: cada fila del diagnóstico debería terminar en una de estas recetas. Pregunta: «¿qué patrón recetan para el File.WriteAllText dentro de la colisión?». Respuesta: un servicio de guardado por contrato (o un evento de Observer, semana 3). Advierte del exceso: no hace falta una fábrica para un juego con un solo enemigo.' },

      { kind: 'actividad', title: 'Contrato de datos · 12 minutos',
        lead: 'En parejas: el contrato de datos de un <b>bicho</b> y de una <b>oleada</b> de Turno Nocturno.',
        izq: 56,
        left: [{ ol: ['<b>Campos:</b> ¿qué necesita saber el juego?', '<b>Tipos y rangos:</b> texto, entero, decimal, lista.', '<b>Valores por defecto</b> si falta un campo.', 'Un ejemplo en JSON o Lua: el tanque y la oleada 3.'], pasos: true }],
        right: [{ panel: ['¿Su contrato aguanta un bicho que da 50 puntos y suelta una batería al morir?'], h: 'Prueba de fuego' }],
        nota: '12 minutos en salas de 2 o 3. Al volver, dos parejas comparten pantalla 1 minuto. Pregunta de revisión: «¿qué campo les faltó?». Errores esperados: olvidar los puntos y lo que suelta al morir; no definir valores por defecto; meter en los datos cosas que son código (la fórmula de colisión). Este contrato va al plano del ACA 1.' },

      { kind: 'cierre', title: 'Lo que te llevas hoy',
        full: [
          { ol: ['<b>Fabricar en un solo lugar.</b> Bicho nuevo, línea nueva en la fábrica.', '<b>Conductas como piezas.</b> Strategy cambia el cerebro; los servicios se piden por contrato.', '<b>Los números viven afuera</b> y se validan al cargar.'], pasos: true },
          { p: 'Ahora: <a href="quiz.html?s=4">quiz de la clase</a> y asesoría del ACA 1. Tarea: agrega al plano tu contrato de datos. El ACA 1 cierra el domingo 27 de diciembre.', paso: true }
        ],
        nota: 'Cierre en 3 minutos y pasa a la asesoría (20 min). Pregunta de salida: «¿qué if de Program.cs van a borrar primero y con qué patrón?». Cada equipo muestra un diagrama 2 minutos; tú preguntas «¿qué síntoma resuelve esta caja?» usando la tabla. Los que no alcancen, que dejen el borrador en el foro. La próxima semana: memoria.' }
    ],

    quiz: [
      { tema: 'Factory', q: '¿Qué problema resuelve principalmente una fábrica como <code>FabricaDeBichos.Crear("tanque")</code>?', opts: ['Hace que el juego corra más rápido', 'Centraliza la creación: un solo lugar sabe cómo se construye cada tipo', 'Evita usar clases', 'Guarda la partida automáticamente'], ok: 1, why: 'El resto del juego pide por nombre y no sabe cómo se arma un bicho. Agregar un tipo nuevo es tocar solo la fábrica.' },
      { tema: 'Factory', q: 'Después de introducir la fábrica, ¿dónde debería aparecer <code>new Bicho</code>?', opts: ['En el bucle principal', 'En cada lugar que necesite un bicho', 'En el código de dibujo', 'Solo dentro de la fábrica'], ok: 3, why: 'Si hay new Bicho por fuera de la fábrica, volvió el problema: otra vez hay varios lugares que saben construir bichos.' },
      { tema: 'Strategy', q: 'Un bicho debe pasar de moverse recto a perseguir al jugador en mitad de la partida. Con Strategy, ¿qué se hace?', opts: ['Se le asigna otro objeto que cumple <code>IMovimiento</code>', 'Se destruye y se crea un bicho de otra clase', 'Se agrega un <code>if</code> más en <code>Actualizar</code>', 'Se reinicia la oleada'], ok: 0, why: 'El bicho tiene un movimiento (composición). Cambiarlo es asignar un campo: el cuerpo, la vida y la posición no se tocan.' },
      { tema: 'State o Strategy', q: 'El jefe final tiene los estados Patrullar, Furia y Huir. Cuando su vida baja de la mitad, el estado Patrullar decide pasar a Furia. ¿Qué patrón describe esto?', opts: ['State: las transiciones las deciden los propios estados', 'Strategy: alguien de afuera elige la conducta', 'Factory: se fabrica un jefe nuevo en cada fase', 'Singleton: hay un solo jefe'], ok: 0, why: 'En State cada estado sabe a cuál pasar según lo que ocurre. En Strategy la estrategia no conoce a las demás y la elige alguien externo, como la oleada o el diseñador.' },
      { tema: 'Strategy', q: 'La fábrica hace <code>static readonly ZigZag compartido = new();</code> y le asigna <code>Cerebro = compartido</code> a los 20 bichos rápidos. <code>ZigZag</code> guarda su propio campo <code>t</code> y le suma <code>dt</code> en cada <code>Mover</code>. ¿Qué se ve en el juego?', opts: ['Nada raro: cada bicho tiene su propio t', 'No compila: una estrategia no se puede compartir', 'Los 20 adelantan el mismo t en cada frame: el zigzag se acelera según cuántos bichos haya', 'Los bichos dejan de moverse'], ok: 2, why: 'Una estrategia con estado no se comparte. Cada Mover suma dt al mismo t, así que con 20 bichos el reloj corre 20 veces más rápido. Una estrategia sin estado, como el ScriptableObject que recibe Time.time, sí se puede compartir.' },
      { tema: 'Singleton', q: '¿Cuál es el costo real de usar <code>Audio.Instancia</code> por todo el juego?', opts: ['Usa demasiada memoria', 'No compila en .NET 8', 'Todo el código queda amarrado a una clase concreta que no se puede reemplazar ni apagar en las pruebas', 'El sonido se oye con retraso'], ok: 2, why: 'Es acoplamiento global. Cualquier archivo depende de esa clase exacta, así que no puedes cambiarla por otra ni probar sin ella.' },
      { tema: 'Service Locator', q: '¿Para qué sirve <code>AudioNulo</code>?', opts: ['Para reproducir sonidos más rápido', 'Para que siempre haya alguien que cumpla el contrato <code>IAudio</code>, aunque no haga nada, por ejemplo en las pruebas', 'Para lanzar un error si no hay audio', 'Para borrar los sonidos de la memoria'], ok: 1, why: 'Es un objeto nulo: evita preguntar "¿hay audio?" en cada llamada y permite correr el juego o las pruebas en silencio.' },
      { tema: 'Datos', q: '¿Cuál es la mejor señal de que un juego está dirigido por datos?', opts: ['Tiene muchos archivos .cs', 'Usa una base de datos SQL', 'Todas las variables son públicas', 'Se puede agregar un enemigo o rebalancear una oleada editando un archivo, sin recompilar'], ok: 3, why: 'El código define cómo funcionan las cosas; los datos definen qué hay y cuánto. Quien diseña no necesita al programador para cada número.' },
      { tema: 'Datos', q: 'El archivo de datos trae <code>"vida": 0</code> para un bicho. ¿Cuándo y cómo conviene detectarlo?', opts: ['Nunca: el juego se adapta solo', 'Cuando el jugador se queje', 'Al cargar el archivo, con un mensaje que diga qué bicho y qué campo están mal', 'En cada frame, dentro de la colisión'], ok: 2, why: 'Los datos se validan una vez, en la frontera, al cargarlos. Un mensaje claro ahorra horas; validar en cada frame cuesta rendimiento y llega tarde.' },
      { tema: 'ScriptableObject', q: 'En Unity, el script <code>Bicho</code> hace <code>datos.vida -= 1;</code> sobre su <code>DatosBicho</code> (un ScriptableObject) cada vez que recibe un chispazo. ¿Qué pasa?', opts: ['Solo ese bicho pierde vida', 'Unity crea una copia del asset para cada bicho', 'Se lanza una excepción porque los assets son de solo lectura', 'Cambia la receta compartida: todos los bichos con ese asset la ven y, en el Editor, el valor sigue cambiado al salir de Play'], ok: 3, why: 'El ScriptableObject es un asset que comparten todos los que lo referencian. Lo que cambia al jugar (la vida actual) debe vivir en el bicho: <code>vidaActual = datos.vida</code> al nacer.' }
    ]
  };
})();
