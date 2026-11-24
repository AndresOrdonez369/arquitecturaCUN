(function () {
  const noProbable = `// Al estilo de Program.cs, con dos reglas nuevas que pidió diseño:
// bono nocturno y batería al morir. Para ejecutar este método necesitas
// una consola con parlante, un disco, que sean más de las 10 p. m. y suerte.
static void GolpearBicho(int i)
{
    enemHp[i]--;
    if (enemHp[i] <= 0)
    {
        Console.Beep();
        if (new Random().Next(100) < 20)                 // 20 %: suelta batería
            SoltarBateria(enemX[i], enemY[i]);
        int bono = DateTime.Now.Hour >= 22 ? 2 : 1;      // bono nocturno
        puntos += Valor(enemTipo[i]) * bono;             // lento 10, rápido 20, tanque 50
        File.WriteAllText("puntaje.txt", puntos.ToString());
    }
}`;
  const probable = `public class Bicho
{
    public string Tipo = "lento";
    public int Vida = 1;
    public int Valor = 10;          // puntos: lento 10, rápido 20, tanque 50
}

public readonly struct Resultado
{
    public readonly bool Murio; public readonly int Puntos; public readonly bool SueltaBateria;
    public Resultado(bool murio, int puntos, bool bateria)
    { Murio = murio; Puntos = puntos; SueltaBateria = bateria; }
}

public static class Reglas
{
    // Todo lo que necesita ENTRA por parámetros.
    // Todo lo que decide SALE en el resultado. No suena, no guarda, no mira el reloj.
    public static Resultado Golpear(Bicho bicho, IAzar azar, int hora)
    {
        bicho.Vida--;
        if (bicho.Vida > 0) return new Resultado(false, 0, false);

        int bono = hora >= 22 ? 2 : 1;                    // bono nocturno
        bool bateria = azar.Siguiente(100) < 20;          // 20 %: suelta batería
        return new Resultado(true, bicho.Valor * bono, bateria);
    }
}`;
  const probableUnity = `using UnityEngine;

// "Objeto humilde": el MonoBehaviour no decide nada. Recibe el choque,
// le pregunta a las reglas y ejecuta lo que ellas respondan.
// Reglas, Bicho, Resultado e IAzar son los mismos archivos del núcleo.
public class BichoVista : MonoBehaviour
{
    [SerializeField] AudioSource sonidoMuerte;
    [SerializeField] GameObject bateriaPrefab;
    [SerializeField] Puntaje puntaje;

    readonly Bicho bicho = new Bicho { Tipo = "tanque", Vida = 3, Valor = 50 };
    IAzar azar;

    // Lo llama el spawner con el azar de la partida (una sola semilla para todos).
    public void Configurar(IAzar azarDeLaPartida) => azar = azarDeLaPartida;

    void OnTriggerEnter2D(Collider2D otro)
    {
        if (!otro.CompareTag("Chispa")) return;

        // El reloj se lee aquí, en el borde. Las reglas reciben la hora como dato.
        Resultado r = Reglas.Golpear(bicho, azar, System.DateTime.Now.Hour);
        if (!r.Murio) return;

        puntaje.Sumar(r.Puntos);
        sonidoMuerte.Play();
        if (r.SueltaBateria)
            Instantiate(bateriaPrefab, transform.position, Quaternion.identity);
        gameObject.SetActive(false);                 // vuelve al pool
    }
}`;
  const xunit = `using Xunit;      // proyecto TurnoNocturno.Pruebas: dotnet new xunit, luego dotnet test

public class PruebasDeReglas
{
    [Fact]
    public void Tanque_MuereAlTercerGolpe()
    {
        // Preparar
        var tanque = new Bicho { Tipo = "tanque", Vida = 3, Valor = 50 };
        var azar = new AzarFijo(99);                 // 99: nunca suelta batería

        // Actuar
        Reglas.Golpear(tanque, azar, hora: 10);
        Reglas.Golpear(tanque, azar, hora: 10);
        Resultado tercero = Reglas.Golpear(tanque, azar, hora: 10);

        // Afirmar: Assert.Equal(esperado, real), en ese orden
        Assert.True(tercero.Murio);
        Assert.Equal(50, tercero.Puntos);
    }

    [Fact]
    public void Tanque_SigueVivoAlSegundoGolpe()
    {
        var tanque = new Bicho { Tipo = "tanque", Vida = 3, Valor = 50 };
        Reglas.Golpear(tanque, new AzarFijo(99), hora: 10);
        Resultado segundo = Reglas.Golpear(tanque, new AzarFijo(99), hora: 10);
        Assert.False(segundo.Murio);
    }

    // Una prueba, muchos casos: cada InlineData es una fila de la tabla.
    [Theory]
    [InlineData(21, 10)]      // 9 p. m.: todavía sin bono
    [InlineData(22, 20)]      // 10 p. m.: justo en el borde
    [InlineData(23, 20)]
    public void Lento_ValeDobleDesdeLas22(int hora, int esperado)
    {
        var lento = new Bicho { Tipo = "lento", Vida = 1, Valor = 10 };

        Resultado r = Reglas.Golpear(lento, new AzarFijo(99), hora);

        Assert.Equal(esperado, r.Puntos);
    }
}`;
  const xunitMas = `public class PruebasDePoolYEstados
{
    [Fact]
    public void Chispa_QueSaleDelTablero_VuelveAlPool()
    {
        var pool = new PoolDeChispas(capacidad: 8);
        Chispa chispa = pool.Pedir(x: 5, y: 0);      // fila de arriba

        chispa.Avanzar();                            // sube a y = -1: fuera
        pool.RecogerLasQueSalieron();

        Assert.Equal(8, pool.Libres);
    }

    [Fact]
    public void GameOver_NoPasaAPausa()
    {
        var fsm = new MaquinaDeJuego(Estado.GameOver);

        fsm.Manejar(Tecla.P);                        // P es la tecla de pausa

        Assert.Equal(Estado.GameOver, fsm.Actual);
    }
}`;
  const nunitEdit = `using NUnit.Framework;

// Assets/Pruebas/EditMode/PruebasDeReglas.cs
// Edit Mode: corre sin abrir escena, en milisegundos. Aquí va casi todo.
// Se ejecutan en Window > General > Test Runner.
public class PruebasDeReglas
{
    [Test]
    public void Tanque_MuereAlTercerGolpe()
    {
        // Preparar
        var tanque = new Bicho { Tipo = "tanque", Vida = 3, Valor = 50 };
        var azar = new AzarFijo(99);

        // Actuar
        Reglas.Golpear(tanque, azar, 10);
        Reglas.Golpear(tanque, azar, 10);
        Resultado tercero = Reglas.Golpear(tanque, azar, 10);

        // Afirmar (NUnit también acepta Assert.That(tercero.Puntos, Is.EqualTo(50)))
        Assert.IsTrue(tercero.Murio);
        Assert.AreEqual(50, tercero.Puntos);
    }

    // El equivalente de [Theory] + [InlineData] en NUnit es [TestCase].
    [TestCase(21, 10)]
    [TestCase(22, 20)]
    public void Lento_ValeDobleDesdeLas22(int hora, int esperado)
    {
        var lento = new Bicho { Tipo = "lento", Vida = 1, Valor = 10 };
        Assert.AreEqual(esperado, Reglas.Golpear(lento, new AzarFijo(99), hora).Puntos);
    }
}`;
  const nunitPlay = `using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

// Assets/Pruebas/PlayMode/PruebasDeChispa.cs
// Play Mode: arranca el motor (física, frames). Es más lenta: úsala poco.
public class PruebasDeChispa
{
    [UnityTest]
    public IEnumerator Chispa_SubeConLaFisica()
    {
        // Preparar
        var objeto = new GameObject("chispa");
        var rb = objeto.AddComponent<Rigidbody2D>();
        rb.gravityScale = 0f;

        // Actuar: velocidad hacia arriba y esperar medio segundo de juego
        rb.linearVelocity = Vector2.up * 5f;          // Unity 6 (antes: velocity)
        yield return new WaitForSeconds(0.5f);

        // Afirmar: unas 2,5 unidades; se deja margen por los pasos de física
        float y = objeto.transform.position.y;
        Object.Destroy(objeto);
        Assert.Greater(y, 2f);
    }
}`;
  const azarCS = `using System;

public interface IAzar { int Siguiente(int maximo); }     // de 0 a maximo - 1

// En el juego: azar de verdad, con una semilla que se anota al empezar.
// Ojo: .NET no garantiza la misma secuencia de Random entre versiones del runtime.
// Para repeticiones que deban sobrevivir actualizaciones, usa un generador propio.
public class AzarConSemilla : IAzar
{
    readonly Random random;
    public int Semilla { get; }
    public AzarConSemilla(int semilla) { Semilla = semilla; random = new Random(semilla); }
    public int Siguiente(int maximo) => random.Next(maximo);
}

// En las pruebas: un "azar" que responde siempre lo que le pedimos.
public class AzarFijo : IAzar
{
    readonly int valor;
    public AzarFijo(int valor) { this.valor = valor; }
    public int Siguiente(int maximo) => valor;
}

// Doble de prueba: un audio que no suena, solo anota. Es el objeto nulo
// de la semana 4 con una libreta en la mano.
public class AudioEspia : IAudio
{
    public int Llamadas { get; private set; }
    public string Ultimo { get; private set; } = "";
    public void Sonar(string nombre) { Llamadas++; Ultimo = nombre; }
}`;
  const espiaTest = `using Xunit;

public class PruebasDePartida
{
    [Fact]
    public void BichoEliminado_SumaPuntosYSuenaUnaVez()
    {
        // Preparar: la Partida de la semana 6 con un audio de mentiras
        var espia = new AudioEspia();
        var partida = new Partida(espia);

        // Actuar
        partida.BichoEliminado(valor: 10);

        // Afirmar
        Assert.Equal(10, partida.Puntos);
        Assert.Equal(1, espia.Llamadas);
        Assert.Equal("bicho_muere", espia.Ultimo);
    }

    [Fact]
    public void Lento_ConAzarFavorable_SueltaBateria()
    {
        var lento = new Bicho { Tipo = "lento", Vida = 1, Valor = 10 };
        Resultado r = Reglas.Golpear(lento, new AzarFijo(5), hora: 10);   // 5 < 20
        Assert.True(r.SueltaBateria);
    }
}`;
  const espiaUnity = `using NUnit.Framework;

// Edit Mode. Las mismas clases: Partida, AudioEspia y AzarFijo no saben
// que están dentro de Unity porque viven en el assembly del núcleo.
public class PruebasDePartida
{
    [Test]
    public void BichoEliminado_SumaPuntosYSuenaUnaVez()
    {
        var espia = new AudioEspia();
        var partida = new Partida(espia);

        partida.BichoEliminado(10);

        Assert.AreEqual(10, partida.Puntos);
        Assert.AreEqual(1, espia.Llamadas);
        Assert.AreEqual("bicho_muere", espia.Ultimo);
    }
}

// La carpeta de pruebas se crea con Create > Testing > Tests Assembly Folder:
// Unity arma el .asmdef con NUnit y el Test Runner. Agrégale una referencia
// a TurnoNocturno.Nucleo.`;
  const registroCS = `using System;
using System.Collections.Generic;
using System.Diagnostics;

public enum Nivel { Detalle, Info, Aviso, Error }

// El enchufe vive en el núcleo. El aparato, en la consola.
public interface IRegistro { void Escribir(Nivel nivel, string modulo, string mensaje); }

public class RegistroConsola : IRegistro
{
    public Nivel Minimo = Nivel.Info;                 // mientras depuras: Nivel.Detalle

    public void Escribir(Nivel nivel, string modulo, string mensaje)
    {
        if (nivel < Minimo) return;                   // el ruido se apaga sin borrar código
        Console.Error.WriteLine("[" + nivel + "] [" + modulo + "] " + mensaje);
    }
}

// Objeto nulo (semana 4): para pruebas y para quien no quiere registro.
public class RegistroNulo : IRegistro { public void Escribir(Nivel n, string m, string t) { } }

public class PoolDeChispas
{
    readonly Stack<Chispa> libres = new();
    readonly int capacidad;
    readonly IRegistro registro;

    public PoolDeChispas(int capacidad, IRegistro registro = null)
    {
        this.capacidad = capacidad;
        this.registro = registro ?? new RegistroNulo();
        for (int i = 0; i < capacidad; i++) libres.Push(new Chispa());
    }

    public void Devolver(Chispa chispa)
    {
        libres.Push(chispa);
        registro.Escribir(Nivel.Detalle, "Pool", "chispa devuelta, libres = " + libres.Count);

        // Una suposición escrita. Solo existe en compilación Debug: si falla,
        // el programa se detiene AQUÍ y no tres frames después.
        Debug.Assert(libres.Count <= capacidad, "El pool recibió más chispas de las que prestó");
    }
}`;
  const registroUnity = `using UnityEngine;

public class Oleadas : MonoBehaviour
{
    [SerializeField] bool registrarDetalle;          // se apaga desde el Inspector

    public void IniciarOleada(int numero, int bichos)
    {
        // Tres niveles que la consola de Unity sabe filtrar.
        // El if va ANTES de armar el texto: concatenar crea basura aunque nadie lo lea.
        if (registrarDetalle)
            Debug.Log("[Oleadas] inicia la " + numero + " con " + bichos + " bichos", this);

        if (bichos == 0)
            Debug.LogWarning("[Oleadas] la oleada " + numero + " está vacía", this);

        if (numero < 1)
            Debug.LogError("[Oleadas] número de oleada inválido: " + numero, this);

        // Una suposición escrita. Solo se evalúa en el editor y en builds de desarrollo.
        Debug.Assert(numero <= 3, "Turno Nocturno solo tiene 3 oleadas");
    }
}

// El segundo parámetro (this) hace que al hacer clic en el mensaje
// Unity te señale el objeto que lo escribió.`;
  const repeticion = `// Misma semilla + mismos comandos + mismo paso = misma partida, en la misma build.
var azar = new AzarConSemilla(semilla: 1234);        // la semilla se anota al empezar
var simulacion = new Simulacion(azar);

for (int frame = 0; frame < grabacion.Frames; frame++)
{
    foreach (var comando in grabacion.ComandosDelFrame(frame))   // los Command de la semana 3
        comando.Ejecutar(simulacion);
    simulacion.Avanzar(1f / 60f);                    // el paso fijo de la semana 1
}

// Si el bug apareció en la partida 1234, aquí vuelve a aparecer. Las veces que quieras.
// Entre plataformas distintas, el punto flotante puede variar: si la repetición
// tiene que viajar entre PC y consola, usa enteros o punto fijo en la simulación.`;
  const parches = `// "A veces el tanque no muere." Probemos...
if (bicho.Vida <= 0 || bicho.Vida == 1) // ¿será?
    Eliminar(bicho);
// Thread.Sleep(10);         // por si acaso
// bicho.Vida = 0;           // tampoco
if (bicho.Tipo == "tanque")
    bicho.Vida--;            // ahora muere antes
// Ya no sé qué arreglé ni qué dañé.`;
  const atrapado = `[Fact]   // 1. Reproduce el bug: falla SIEMPRE
public void Tanque_ConDosChispasJuntas_PierdeDos()
{
    var tanque = new Bicho { Vida = 3 };
    colisiones.Resolver(tanque, chispaA, chispaB);
    Assert.Equal(1, tanque.Vida);   // daba 2
}
// 2. Causa: un break salía del bucle tras
//    la primera chispa. 3. Se quita. Verde.`;
  const bisect = `// Bisección automática con git, desde la terminal:
//
//   git bisect start
//   git bisect bad                  el commit actual falla
//   git bisect good v0.3            esta versión funcionaba
//   git bisect run dotnet test      git prueba por mitades, solo
//   git bisect reset                vuelve a donde estabas
//
// git bisect run usa el código de salida del comando:
//   0 = bueno · de 1 a 127, salvo 125 = malo · 125 = no se puede probar, sáltalo.
// dotnet test sale con 1 si alguna prueba falla. Por eso conviene escribir
// PRIMERO la prueba que reproduce el bug: es el detector que git necesita.
// Si el commit ni compila, dotnet test también sale con 1: en historias con
// commits rotos, envuélvelo en un script que devuelva 125 cuando no compile.`;
  const cronometro = `using System;
using System.Diagnostics;

// Medir un tramo sospechoso: 1000 frames de la oleada 3, misma semilla.
var simulacion = new Simulacion(new AzarConSemilla(1234));
var cronometro = Stopwatch.StartNew();
long basuraAntes = GC.CollectionCount(0);

for (int frame = 0; frame < 1000; frame++)
    simulacion.Avanzar(1f / 60f);

cronometro.Stop();
Console.WriteLine("ms por frame: " + cronometro.Elapsed.TotalMilliseconds / 1000);
Console.WriteLine("recolecciones: " + (GC.CollectionCount(0) - basuraAntes));

// Desde otra terminal, con el juego corriendo:
//   dotnet-counters monitor --process-id 12345
// muestra en vivo memoria, recolecciones y uso de CPU.`;
  const cronometroUnity = `using Unity.Profiling;
using UnityEngine;

public class Oleadas : MonoBehaviour
{
    // Un marcador con nombre: aparece como una barra propia en el Profiler.
    static readonly ProfilerMarker marcador = new ProfilerMarker("Oleadas.MoverBichos");

    void Update()
    {
        using (marcador.Auto())          // mide lo que pase dentro de las llaves
        {
            MoverBichos(Time.deltaTime);
        }
    }

    void MoverBichos(float dt) { /* ... */ }
}

// Window > Analysis > Profiler. Mira dos cosas:
//   CPU Usage  -> qué método se lleva los milisegundos del frame
//   GC Alloc   -> quién crea basura en cada frame (debería ser 0 B)`;

  // ---- versiones cortas para las slides
  const noProbableCorto = `static void GolpearBicho(int i)
{
    enemHp[i]--;
    if (enemHp[i] <= 0)
    {
        Console.Beep();
        if (new Random().Next(100) < 20)
            SoltarBateria(enemX[i], enemY[i]);
        int bono = DateTime.Now.Hour >= 22 ? 2 : 1;
        puntos += Valor(enemTipo[i]) * bono;
        File.WriteAllText("puntaje.txt",
            puntos.ToString());
    }
}`;
  const probableCorto = `public static Resultado Golpear(
    Bicho bicho, IAzar azar, int hora)
{
    bicho.Vida--;
    if (bicho.Vida > 0)
        return new Resultado(false, 0, false);

    int bono = hora >= 22 ? 2 : 1;
    bool bateria = azar.Siguiente(100) < 20;
    return new Resultado(true, bicho.Valor * bono, bateria);
}
// No suena, no guarda, no mira el reloj:
// quien llama hace eso mirando el Resultado.`;
  const xunitCorto = `[Fact]
public void Tanque_MuereAlTercerGolpe()
{
    // Preparar
    var tanque = new Bicho { Vida = 3, Valor = 50 };
    var azar = new AzarFijo(99);   // nunca suelta batería

    // Actuar
    Reglas.Golpear(tanque, azar, hora: 10);
    Reglas.Golpear(tanque, azar, hora: 10);
    var tercero = Reglas.Golpear(tanque, azar, hora: 10);

    // Afirmar: Assert.Equal(esperado, real)
    Assert.True(tercero.Murio);
    Assert.Equal(50, tercero.Puntos);
}`;
  const teoriaCorto = `// Una prueba, muchos casos: cada InlineData es una fila
[Theory]
[InlineData(21, 10)]   // 9 p. m.: sin bono
[InlineData(22, 20)]   // 10 p. m.: justo en el borde
[InlineData(23, 20)]
public void Lento_ValeDobleDesdeLas22(int hora, int esperado)
{
    var lento = new Bicho { Vida = 1, Valor = 10 };

    var r = Reglas.Golpear(lento, new AzarFijo(99), hora);

    Assert.Equal(esperado, r.Puntos);
}`;
  const nunitCorto = `using NUnit.Framework;

// Assets/Pruebas/EditMode: corre sin abrir escena.
// Window > General > Test Runner
public class PruebasDeReglas
{
    [Test]
    public void Tanque_MuereAlTercerGolpe()
    {
        var tanque = new Bicho { Vida = 3, Valor = 50 };
        var azar = new AzarFijo(99);
        Reglas.Golpear(tanque, azar, 10);
        Reglas.Golpear(tanque, azar, 10);
        var tercero = Reglas.Golpear(tanque, azar, 10);
        Assert.IsTrue(tercero.Murio);
        Assert.AreEqual(50, tercero.Puntos);
    }
}`;
  const estadoCorto = `[Fact]
public void GameOver_NoPasaAPausa()
{
    var fsm = new MaquinaDeJuego(Estado.GameOver);

    fsm.Manejar(Tecla.P);          // P es la tecla de pausa

    Assert.Equal(Estado.GameOver, fsm.Actual);
}`;
  const doblesCorto = `public interface IAzar { int Siguiente(int maximo); }

// En las pruebas: responde siempre lo que le pedimos
public class AzarFijo : IAzar
{
    readonly int valor;
    public AzarFijo(int valor) { this.valor = valor; }
    public int Siguiente(int maximo) => valor;
}

// No suena: anota cuántas veces lo llamaron y con qué
public class AudioEspia : IAudio
{
    public int Llamadas { get; private set; }
    public string Ultimo { get; private set; } = "";
    public void Sonar(string n) { Llamadas++; Ultimo = n; }
}`;
  const espiaCorto = `[Fact]
public void BichoEliminado_SumaPuntosYSuenaUnaVez()
{
    var espia = new AudioEspia();
    var partida = new Partida(espia);   // la de la semana 6

    partida.BichoEliminado(valor: 10);

    Assert.Equal(10, partida.Puntos);
    Assert.Equal(1, espia.Llamadas);
    Assert.Equal("bicho_muere", espia.Ultimo);
}`;
  const repeticionCorta = `// Misma semilla + mismos comandos + mismo paso = misma partida
var azar = new AzarConSemilla(semilla: 1234);   // se anota
var sim = new Simulacion(azar);

for (int frame = 0; frame < grabacion.Frames; frame++)
{
    foreach (var c in grabacion.De(frame)) // Command, sem. 3
        c.Ejecutar(sim);
    sim.Avanzar(1f / 60f);                 // paso fijo, sem. 1
}
// Misma build: el bug de la partida 1234 vuelve a salir.`;

  window.CLASE = {
    n: 7,
    titulo: 'Testing y depuración',
    objetivos: [
      'Escribir pruebas unitarias con la estructura Preparar, Actuar, Afirmar, incluidas pruebas parametrizadas, para las reglas de tu juego.',
      'Reconocer qué hace que un método no se pueda probar (reloj, azar, disco, consola) y separarlo en lógica pura y efectos.',
      'Hacer reproducible una partida con paso fijo, semilla y comandos grabados, y explicar los límites del punto flotante.',
      'Depurar un bug con método: reproducir, acotar (incluida la bisección), formular una hipótesis, probarla y dejarlo atrapado con una prueba.'
    ],
    analogia: 'Un piloto con 20 000 horas de vuelo repasa su lista de chequeo antes de cada despegue. No porque no sepa volar, sino porque olvidar una sola cosa sale carísimo. Las pruebas automáticas son esa lista. Y cuando algo falla a pesar de todo, toca trabajar como detective: primero la evidencia, después la hipótesis.',
    agenda: [
      ['0:00', 'Apertura: fechas del ACA 2 y la regresión de la demo'],
      ['0:10', 'La lista de chequeo y la pirámide de pruebas'],
      ['0:22', 'Código que se deja probar: reloj, azar y efectos'],
      ['0:35', 'Anatomía de una prueba en xUnit y Unity, con demo'],
      ['0:55', 'Dobles de prueba, semilla y punto flotante'],
      ['1:12', 'Depurar como detective: método y bisección'],
      ['1:30', 'Registro, Assert y Profiler'],
      ['1:38', 'Actividad: plan de pruebas del ACA 2'],
      ['1:55', 'Cierre y quiz de la clase']
    ],
    conceptos: [
      { t: 'Prueba unitaria', d: 'Código que ejecuta una sola regla del juego, sin pantalla, disco ni espera, y compara el resultado con lo esperado. Corre en milisegundos y avisa de una regresión en cuanto ocurre.', ej: '<code>Tanque_MuereAlTercerGolpe</code>: un tanque con vida 3 recibe tres golpes y la prueba afirma que murió y valió 50 puntos.' },
      { t: 'Preparar, Actuar, Afirmar', d: 'Estructura de toda prueba: preparar la situación mínima, ejecutar una sola cosa y comparar lo esperado con lo obtenido. En xUnit, <code>Assert.Equal(esperado, real)</code>, en ese orden.', ej: 'Preparar un tanque y un <code>AzarFijo(99)</code>; actuar con tres golpes; afirmar que <code>Murio</code> es verdadero.' },
      { t: 'Prueba parametrizada', d: 'Una misma prueba que corre con varias filas de datos: <code>[Theory]</code> con <code>[InlineData]</code> en xUnit, <code>[TestCase]</code> en NUnit. Ideal para probar los bordes de una regla.', ej: '<code>Lento_ValeDobleDesdeLas22</code> con las horas 21, 22 y 23: justo antes, en y después del borde del bono nocturno.' },
      { t: 'Doble de prueba', d: 'Objeto que ocupa el lugar de una dependencia real durante la prueba. Un doble fijo responde lo que le pidas; un espía además anota cómo lo llamaron.', ej: '<code>AzarFijo(99)</code> para que nunca caiga batería; <code>AudioEspia</code> para contar cuántas veces sonó bicho_muere sin que suene nada.' },
      { t: 'Determinismo', d: 'Propiedad de una simulación que, con las mismas entradas, produce siempre el mismo resultado. En juegos se logra con semilla, comandos grabados y paso fijo, en la misma build.', ej: 'Reproducir la partida 1234 frame a frame hasta el 412, donde el tanque sobrevive, todas las veces que haga falta.' },
      { t: 'Prueba intermitente', d: 'Prueba que pasa o falla sin que cambie el código, porque depende de algo que no controla: la hora real, el azar sin semilla, el orden de ejecución o el tiempo de espera.', ej: 'Una prueba del bono que lee <code>DateTime.Now</code> pasa de día y falla en el servidor de integración a las 23:00.' },
      { t: 'Bisección', d: 'Búsqueda por mitades del cambio que introdujo un bug: se prueba el punto medio entre una versión buena y una mala y se descarta la mitad. Con N sospechosos bastan unas log₂ N pruebas.', ej: 'El commit 1 funciona y el 64 falla: con <code>git bisect</code> bastan unas 6 pruebas en lugar de hasta 63.' },
      { t: 'Registro con niveles', d: 'Mensajes clasificados por gravedad (Detalle, Info, Aviso, Error) y por módulo, que se filtran desde afuera sin borrar código.', ej: 'Mínimo en Aviso y solo el módulo Pool en Detalle para ver «devolvieron 9 chispas y solo hay 8» sin el ruido de 40 bichos.' }
    ],
    industria: [
      { j: 'Sea of Thieves (Rare)', t: 'Rare montó pruebas automáticas de gameplay, no solo del motor, que corren en su sistema de integración para sostener actualizaciones frecuentes de un juego en línea.', src: 'Rare, charla «Automated Testing of Gameplay Features in Sea of Thieves», GDC 2019.' },
      { j: 'Age of Empires', t: 'Para jugar con cientos de unidades por módem, cada máquina simula la partida completa y por la red solo viajan los comandos (lockstep). Todo eso exige una simulación determinista.', src: 'Bettner, P. y Terrano, M. «1500 Archers on a 28.8: Network Programming in Age of Empires and Beyond», Gamasutra, 2001.' },
      { j: 'Factorio', t: 'El multijugador también es lockstep determinista: todos simulan el mismo mundo. Cuando una máquina se separa hay un desync, y el equipo lo trata como un bug que se reproduce y se corrige.', src: 'Factorio Friday Facts, blog oficial de Wube Software (entradas sobre multijugador y desyncs).' },
      { j: 'Unity Test Framework', t: 'Integra NUnit al editor: pruebas en Edit Mode, sin escena, y en Play Mode, con el motor corriendo y <code>[UnityTest]</code> como corrutina. Se corren desde la ventana Test Runner o por línea de comandos.', src: 'Documentación oficial de Unity: Unity Test Framework.' },
      { j: 'Git', t: '<code>git bisect</code> automatiza la búsqueda por mitades: marcas un commit bueno y uno malo, y <code>git bisect run</code> ejecuta tu prueba en cada paso hasta señalar al culpable.', src: 'Documentación oficial de Git: git-bisect.' }
    ],
    errores: [
      { mito: 'Las pruebas son para quien no sabe programar.', real: 'Las regresiones casi siempre vienen de un cambio en otra parte, hecho por otra persona o por ti hace un mes. Se nota cuando el bug aparece en la demo y nadie tocó ese código.' },
      { mito: 'Si todas las pruebas pasan, el juego no tiene bugs.', real: 'Las pruebas solo cuidan las reglas que escribiste. Por eso cada bug arreglado deja una prueba nueva, y por eso importa elegir bien qué probar.' },
      { mito: 'Con la misma semilla, la partida se repite en cualquier computador.', real: 'Se repite en la misma build. Entre plataformas o compiladores el punto flotante puede variar en el último decimal, y .NET no garantiza la misma secuencia de <code>Random</code> entre versiones. En Unity, <code>UnityEngine.Random</code> es global: cualquier sistema que pida un número corre la secuencia de todos.' },
      { mito: 'Mientras más Debug.Log, mejor se depura.', real: 'Miles de líneas por segundo esconden el error y cuestan: armar cada texto crea basura (semana 5). Usa niveles, filtra por módulo y apaga el detalle con un interruptor que se revisa antes de armar el texto.' },
      { mito: 'En Unity toda prueba tiene que correr en Play Mode.', real: 'Play Mode arranca el motor y es lento. Las reglas del núcleo se prueban en Edit Mode en milisegundos; Play Mode queda para física, frames y escenas.' }
    ],
    codigoIntro: 'Seis piezas: un método que no se deja probar y su versión que sí, pruebas en xUnit (incluida una parametrizada) y en Unity Test Framework, el azar con semilla y un audio espía, un registro con niveles y Assert, la bisección con git y un cronómetro para medir.',
    codigo: [
      { titulo: 'Del método imposible al método probable', desc: 'El original necesita consola, disco, reloj y suerte. La versión probable recibe todo por parámetros y devuelve lo que decidió. En Unity, el MonoBehaviour queda como un mensajero que lee el reloj en el borde y ejecuta los efectos.',
        tabs: [{ lang: 'C#', label: 'C# (no probable)', src: noProbable }, { lang: 'C#', label: 'C# (probable)', src: probable }, { lang: 'Unity', src: probableUnity }] },
      { titulo: 'Pruebas: xUnit y Unity Test Framework', desc: 'La misma estructura en los dos mundos: Preparar, Actuar, Afirmar. <code>[Theory]</code> con <code>[InlineData]</code> (o <code>[TestCase]</code> en NUnit) prueba los bordes de una regla. En Unity, Edit Mode para la lógica y Play Mode solo cuando necesitas el motor encendido.',
        tabs: [{ lang: 'C#', label: 'xUnit (reglas)', src: xunit }, { lang: 'C#', label: 'xUnit (pool y estados)', src: xunitMas }, { lang: 'Unity', label: 'Unity (Edit Mode)', src: nunitEdit }, { lang: 'Unity', label: 'Unity (Play Mode)', src: nunitPlay }] },
      { titulo: 'Azar con semilla y un audio espía', desc: 'Dos enchufes del núcleo con aparatos de mentiras para las pruebas: un azar que responde lo que le pidas y un audio que cuenta cuántas veces lo llamaron.',
        tabs: [{ lang: 'C#', label: 'C# (dobles)', src: azarCS }, { lang: 'C#', label: 'C# (pruebas)', src: espiaTest }, { lang: 'Unity', src: espiaUnity }] },
      { titulo: 'Repetir una partida y atrapar el bug', desc: 'Semilla, comandos por frame y paso fijo para reproducir. Luego, la prueba que falla siempre, y git bisect usando esa prueba como detector.',
        tabs: [{ lang: 'C#', label: 'C# (repetición)', src: repeticion }, { lang: 'C#', label: 'C# (prueba del bug)', src: atrapado }, { lang: 'C#', label: 'git bisect (terminal)', src: bisect }] },
      { titulo: 'Registro con niveles y Assert', desc: 'Un registro que se puede subir y bajar de volumen, y suposiciones escritas que detienen el programa en el lugar exacto donde dejan de cumplirse.',
        tabs: [{ lang: 'C#', src: registroCS }, { lang: 'Unity', src: registroUnity }] },
      { titulo: 'Medir un tramo', desc: 'Repaso de la semana 5: antes de optimizar, una cifra. Con Stopwatch en C# puro y con un marcador del Profiler en Unity. La misma semilla hace justa la comparación antes y después.',
        tabs: [{ lang: 'C#', src: cronometro }, { lang: 'Unity', label: 'Unity (Profiler)', src: cronometroUnity }] }
    ],
    tarea: [
      'Entrega el <a href="docs/aca2.html">ACA 2</a> (32 %) antes del domingo 10 de enero de 2027 a las 23:59. Incluye las 8 pruebas en verde y el informe del bug.',
      'Convierte los 8 nombres de la actividad de hoy en 8 pruebas reales. Empieza por la más fácil: una regla sin azar ni tiempo. Al menos una debe ser un <code>[Theory]</code> sobre un borde.',
      'Diligencia esta semana la autoevaluación y la coevaluación (4 % + 4 %). Son cortas y se cierran con el curso.',
      'Prepara la socialización de la semana 8: 5 minutos por equipo, con una cifra medida antes y después.'
    ],
    lecturas: [
      'Documentación de Microsoft: "Pruebas unitarias de C# en .NET con dotnet test y xUnit".',
      'Documentación de Unity: "Unity Test Framework" (Edit Mode y Play Mode) y "Profiler overview".',
      'Documentación de Git: "git-bisect".',
      'Gregory, J. (2018). <i>Game Engine Architecture</i> (3.ª ed.), cap. 10 (herramientas de depuración y desarrollo).',
      'Agans, D. (2002). <i>Debugging: The 9 Indispensable Rules</i>. Corto y útil para toda la vida.',
      'Bettner, P. y Terrano, M. (2001). "1500 Archers on a 28.8: Network Programming in Age of Empires and Beyond". Gamasutra.'
    ],

    slides: [
      { kind: 'portada', title: 'Testing y depuración',
        lead: 'Semana 7 · Arquitectura de Videojuegos',
        full: [
          { ul: ['Cómo saber que tu juego funciona hoy y seguirá funcionando mañana.', 'Qué hacer, con método, cuando no funciona.', 'Son los dos últimos puntos del <b>ACA 2</b>: las 8 pruebas y el informe del bug.'] },
          { pie: 'El ACA 2 cierra el domingo 10 de enero de 2027 · <span class="kbd">N</span> notas del docente' }
        ],
        nota: '2 minutos. Abre con las fechas: ACA 2 hasta el domingo 10 de enero, y auto y coevaluación esta misma semana. Pregunta: ¿cuántos equipos ya tienen los tres proyectos compilando? Respuesta esperada: pocos. Si son menos de la mitad, acorta el bloque de herramientas y dale tiempo a la actividad.' },

      { kind: 'reto', title: 'Arreglaste el disparo. Se rompió el puntaje.',
        lead: 'El lunes arreglas un detalle del disparo. El jueves, en plena demo, el puntaje se queda en cero. Nadie lo tocó.',
        izq: 38,
        left: [
          { check: { q: '¿Qué te habría avisado el mismo lunes?', opts: ['Jugar una partida completa después de cada cambio', 'Una prueba automática del puntaje que corre en segundos', 'Programar con más cuidado', 'Un computador más rápido'], ok: 1, why: 'Jugar a mano tras cada cambio no se sostiene: toma minutos y siempre olvidas un caso. Una prueba automática revisa lo mismo en milisegundos, todas las veces.' } }
        ],
        right: [{ fig: 'regresion', paso: true }],
        nota: '6 minutos. Pregunta: ¿qué te habría avisado el lunes? Respuesta esperada: B. Pregunta quién vivió algo así y dale nombre: regresión. Luego avanza a la figura: «Sin pruebas», avanza día por día hasta el jueves (15 sospechosos); cambia a «Con pruebas» (1 sospechoso, el lunes). Mensaje: el costo de un bug crece con el tiempo que tardas en enterarte. Los 15 sospechosos se retoman en la bisección.' },

      { kind: 'analogia', title: 'La lista de chequeo del piloto',
        lead: 'Un piloto con 20 000 horas la repasa antes de cada despegue. No porque no sepa volar.',
        izq: 60,
        left: [{ fig: 'checklist' }],
        right: [
          { mapa: [['Un renglón de la lista', 'Una prueba automática'], ['Repasarla siempre', 'Correr la suite en cada cambio'], ['Un renglón nacido de un susto', 'La prueba de un bug viejo']], de: 'En la cabina', a: 'En el código', pasos: true }
        ],
        nota: '4 minutos. Deja un renglón sin marcar y despega. Luego cambia a «Suite de pruebas» y usa «Revisar todo solo». Desarma el prejuicio de que las pruebas son para quien no sabe programar. Pregunta: ¿cuál sería el primer renglón de Turno Nocturno? Respuesta esperada: «el tanque aguanta tres golpes» o «la pausa no avanza el juego». Anótalos para la actividad.' },

      { kind: 'idea', title: 'La pirámide: muchas chiquitas, pocas grandes',
        izq: 40,
        left: [
          { big: 'Prueba unitaria: una sola regla, sin pantalla, sin disco y sin esperar.' },
          { clave: 'Si es divertido, lo decide una persona. Si el tanque muere al tercer golpe, una máquina.', paso: true }
        ],
        right: [{ fig: 'piramide' }],
        nota: '5 minutos. Toca cada piso y luego «Cono de helado». Pregunta: ¿por qué nadie corre la suite del cono después de cada cambio? Respuesta esperada: porque una ronda toma media hora. El ACA 2 pide 8 unitarias, todas de la base. Error esperado: querer probar que el juego se vea bien. Se prueban reglas: cuentas, estados, colisiones, el pool.' },

      { kind: 'idea', title: 'Todo lo anterior era para esto',
        lead: 'Solo se puede probar lo que se puede ejecutar solo.',
        top: true,
        full: [
          { tabla: { head: ['Lo que hicimos', 'Lo que permite probar'], rows: [['Interfaces y composición (semana 2)', 'Cambiar una pieza real por una de mentiras'], ['State y Command (semana 3)', 'Verificar transiciones y repetir acciones'], ['Datos externos (semana 4)', 'Probar con una oleada mínima hecha a mano'], ['Núcleo sin consola (semana 6)', 'Ejecutar las reglas sin teclado ni pantalla']] }, pasos: true },
          { clave: 'Faltan dos enchufes: el reloj (<code>IReloj</code>) y el azar (<code>IAzar</code>).', paso: true }
        ],
        nota: '3 minutos. La slide que amarra el curso: buena arquitectura y código probable son la misma cosa vista desde dos lados. Pregunta: ¿por qué no se podía probar el Program.cs original? Respuesta esperada: todo es static, todo toca la consola y usa un Random sin semilla.' },

      { kind: 'reto', title: 'Predice: el bono nocturno',
        lead: '<code>GolpearBicho</code> mira el reloj, tira el azar, suena y guarda en disco, todo adentro.',
        izq: 38,
        left: [
          { check: { q: 'Quieres comprobar que un lento eliminado después de las 10 p. m. vale doble. ¿Cómo lo haces?', opts: ['Con una prueba normal de una línea', 'Trasnochando o cambiando la hora del computador, y revisando a ojo', 'No hace falta probarlo', 'Con un breakpoint basta'], ok: 1, why: 'El método pregunta la hora por su cuenta. Si la hora entra como parámetro, le pasas 23 y verificas que el resultado traiga 20 puntos.' } }
        ],
        right: [{ fig: 'reloj', paso: true }],
        nota: '5 minutos. Respuesta esperada del check: B. Avanza a la figura: mueve la hora de 15 a 23 y luego usa «Servidor nocturno». Pregunta: ¿qué hace el equipo con una prueba que falla solo de noche? Respuesta esperada: deja de creerle y la ignora. Eso es una prueba intermitente. La B nunca falla porque la hora es un dato. La siguiente slide muestra el código.' },

      { kind: 'antipatron', title: 'El método imposible y el probable',
        lead: 'Los dos golpean un bicho, suman puntos y a veces sueltan una batería.',
        top: true,
        full: [{ compare: { a: { label: 'Necesita consola, disco, reloj y suerte', lang: 'C#', src: noProbableCorto }, b: { label: 'Todo entra por parámetros y sale en el resultado', lang: 'C#', src: probableCorto } } }],
        nota: '6 minutos. Pregunta: ¿cuántas cosas externas toca la izquierda? Respuesta esperada: cinco, Console, Random, DateTime, File y las listas static. En la derecha: cero. El sonido y el guardado no desaparecen: los hace quien llama, mirando el Resultado. En Unity, el MonoBehaviour queda como mensajero y lee el reloj en el borde (pestaña Unity en la página de la clase).' },

      { kind: 'idea', title: 'Anatomía de una prueba',
        izq: 62,
        left: [{ fig: 'aaa' }],
        right: [
          { ol: ['<b>Preparar:</b> la situación más pequeña posible.', '<b>Actuar:</b> ejecutar <b>una</b> cosa.', '<b>Afirmar:</b> comparar lo esperado con lo obtenido.'], pasos: true }
        ],
        nota: '4 minutos. Recorre la figura con «Un paso». Luego marca el bug y ejecuta: la afirmación falla y dice qué regla se rompió. Pregunta: ¿qué pasa si Actuar hace cinco cosas y la prueba falla? Respuesta esperada: no sabes cuál de las cinco fue.' },

      { kind: 'codigo', title: 'La misma prueba en xUnit y en Unity',
        izq: 32,
        left: [
          { big: 'Tres párrafos, siempre en el mismo orden.' },
          { pie: 'Nombre: <code>Sujeto_Situacion_Resultado</code>. Varias filas: <code>[Theory]</code>. En Unity: <code>[Test]</code> y <code>Assert.AreEqual</code>.', paso: true }
        ],
        right: [{ code: [{ lang: 'C#', label: 'xUnit', src: xunitCorto }, { lang: 'C#', label: 'xUnit [Theory]', src: teoriaCorto }, { lang: 'Unity', label: 'Unity (Edit Mode)', src: nunitCorto }], marca: [
          { l: [2], t: 'El nombre cuenta la regla. Si falla, es el mensaje de error.' },
          { l: [4, 5, 6], t: '<b>Preparar:</b> un tanque y un azar que nunca suelta batería.' },
          { l: [8, 9, 10, 11], t: '<b>Actuar:</b> tres golpes, nada más.' },
          { l: [13, 14, 15], t: '<b>Afirmar:</b> murió y valió 50. Primero lo esperado, luego lo real: así el mensaje de error se lee bien.' }
        ] }],
        nota: '8 minutos. En vivo: dotnet new xunit, dotnet add reference al núcleo, dotnet test. Que vean el verde. Abre la pestaña [Theory]. Pregunta: ¿por qué probar 21, 22 y 23 y no 10, 15 y 20? Respuesta esperada: los bugs viven en los bordes, como un >= cambiado por >. Edit Mode para lógica; Play Mode solo si necesitas física o frames (ejemplo en la página de la clase).' },

      { kind: 'reto', title: 'Predice: ¿qué prueba se pone roja?',
        lead: 'Un compañero «mejora» la máquina de estados: ahora P pausa en cualquier estado.',
        izq: 50,
        left: [{ code: [{ lang: 'C#', label: 'xUnit', src: estadoCorto }] }],
        right: [{ check: { q: 'Corres las pruebas después de su cambio. ¿Qué pasa?', opts: ['Todas pasan: es una mejora', 'Falla la prueba del pool de chispas', 'Falla GameOver_NoPasaAPausa: quedó en Pausa y se esperaba GameOver', 'No compila'], ok: 2, why: 'La prueba guardaba una regla del diseño. El cambio la rompió y la prueba lo dijo en segundos, con el nombre exacto de la regla.' } }],
        nota: '4 minutos. Respuesta esperada: C. El nombre de la prueba es el mensaje de error. Pregunta: ¿y si de verdad el diseño cambió y ahora se puede pausar en Game Over? Respuesta esperada: se cambia la prueba a propósito, con el diseño en la mano, no por accidente.' },

      { kind: 'demo', title: 'Mete un bug y mira qué prueba lo atrapa',
        top: true,
        full: [
          { fig: 'pruebas' },
          { clave: 'Cada bug lo atrapa una sola prueba. Sin ella, las otras seguirían en verde.', paso: true }
        ],
        nota: '6 minutos. Primero sin bug: todo verde. Luego el bug A: pregunta cuál fallará antes de ejecutar. Respuesta esperada: Tanque_SigueVivoAlSegundoGolpe, porque con vida 1 ya lo da por muerto. Luego el B: solo DanioNegativo lo atrapa. Las pruebas no demuestran que no hay bugs: cuidan las reglas que escribiste. Por eso importa elegir bien los 8 nombres.' },

      { kind: 'codigo', title: 'Dobles de prueba: el doble de riesgo',
        izq: 34,
        left: [
          { mapa: [['La estrella', '<code>AudioConsola</code>, <code>Random</code>'], ['El doble', '<code>AudioEspia</code>, <code>AzarFijo</code>'], ['El guion', 'La interfaz del núcleo']], de: 'En el cine', a: 'En las pruebas', pasos: true }
        ],
        right: [{ code: [{ lang: 'C#', label: 'Los dobles', src: doblesCorto }, { lang: 'C#', label: 'La prueba', src: espiaCorto }], marca: [
          { l: [1], t: 'El enchufe del azar vive en el núcleo.' },
          { l: [4, 5, 6, 7, 8, 9], t: '<b>AzarFijo</b> responde siempre lo mismo: tú decides si hay batería.' },
          { l: [12, 13, 14, 15, 16, 17], t: '<b>AudioEspia</b> no suena: toma nota. Es el objeto nulo de la semana 4 con una libreta.' }
        ] }],
        nota: '5 minutos. Muestra la pestaña de la prueba: verifica que el audio sonó una vez sin que suene nada. Pregunta: ¿qué doble necesitan para probar el guardado? Respuesta esperada: un GuardadoEnMemoria que guarda en una variable. Para este juego no hace falta una librería de mocks: bastan clases de 5 líneas.' },

      { kind: 'reto', title: 'El bug que sale una vez de cada veinte',
        izq: 40,
        left: [
          { check: { q: 'El juego usa <code>new Random()</code> sin semilla. ¿Cuál es el primer paso?', opts: ['Jugar muchas veces hasta que vuelva a salir', 'Reescribir las oleadas por si acaso', 'Registrar semilla y comandos de cada partida para repetir la que falló', 'Subirle los fps'], ok: 2, why: 'Un bug que no puedes repetir no lo puedes estudiar. Con semilla y comandos, el bug de «a veces» se vuelve de «siempre que reproduzco la partida 1234».' } }
        ],
        right: [{ fig: 'semilla', paso: true }],
        nota: '5 minutos. Respuesta esperada del check: C. Luego avanza a la figura: dos partidas sin semilla, después semilla 1234 y «Repetir la última». Pregunta: ¿con semilla el juego deja de ser aleatorio? Respuesta esperada: no; la semilla cambia en cada partida, solo que queda anotada para repetirla.' },

      { kind: 'codigo', title: 'Determinismo: tres ingredientes',
        lead: 'Una receta con medidas exactas sale igual cada vez.',
        izq: 34,
        left: [{ ul: ['<b>Semilla</b>', '<b>Comandos grabados</b> (semana 3)', '<b>Paso fijo</b> (semana 1)'], pasos: true }],
        right: [{ code: [{ lang: 'C#', src: repeticionCorta }], marca: [
          { l: [2], t: '<b>Semilla:</b> el azar arranca siempre del mismo punto.' },
          { l: [5, 7, 8], t: '<b>Comandos:</b> lo que hizo el jugador en cada frame, también en los frames sin teclas.' },
          { l: [9], t: '<b>Paso fijo:</b> el tiempo avanza en tragos iguales, sin importar los fps.' },
          { l: [11], t: 'Mismas entradas, mismo resultado, en la misma build.' }
        ] }],
        nota: '5 minutos. Pregunta: ¿por qué el bucle recorre frames y no solo comandos? Respuesta esperada: porque el mundo avanza aunque el jugador no toque nada. Conecta con las repeticiones de los juegos de estrategia y de pelea: guardan entradas y semilla, no video. El determinismo también hace justa la medición del pool del ACA 2: misma oleada, misma semilla, mismos 1000 frames.' },

      { kind: 'idea', title: 'Ojo: el punto flotante no siempre repite',
        izq: 36,
        left: [
          { big: 'La misma semilla no basta entre máquinas distintas.' },
          { ul: ['<b>Misma build y máquina:</b> se repite.', '<b>Otra CPU o compilador:</b> puede cambiar el último decimal.', '<b>Un if lo amplifica:</b> el bicho llega un frame antes.'], pasos: true }
        ],
        right: [{ fig: 'flotante' }],
        nota: '5 minutos. Corre los tres experimentos; en «Dos máquinas» mueve el frame de 498 a 502. Pregunta: ¿por qué 0,1 sumado diez veces no da 1? Respuesta esperada: 0,1 no tiene representación exacta en binario. Pregunta 2: ¿qué usarían en un juego en red por lockstep? Respuesta esperada: enteros o punto fijo para la simulación, y nunca == entre floats. Para Turno Nocturno, que es de un jugador, basta la misma build.' },

      { kind: 'industria', title: 'En juegos reales: repetir y verificar',
        full: [
          { juegos: [
            { j: 'Age of Empires', t: 'Cada máquina simula la partida completa y por la red solo viajan los comandos. Exige simulación determinista.', src: 'Bettner y Terrano, «1500 Archers on a 28.8», Gamasutra, 2001' },
            { j: 'Factorio', t: 'Multijugador lockstep: si una máquina se separa hay un desync, y se trata como un bug que se reproduce y se corrige.', src: 'Factorio Friday Facts, blog oficial de Wube Software' },
            { j: 'Sea of Thieves', t: 'Rare automatizó pruebas de gameplay que corren en cada cambio para sostener un juego en línea que se actualiza seguido.', src: 'Rare, GDC 2019: «Automated Testing of Gameplay Features in Sea of Thieves»' }
          ], pasos: true },
          { clave: 'Semilla, comandos y pruebas automáticas sostienen juegos reales, no solo tareas de curso.', paso: true }
        ],
        nota: '3 minutos. Pregunta: ¿qué ingrediente de hoy necesita cada caso? Respuesta esperada: Age of Empires y Factorio, determinismo (semilla, comandos, paso fijo); Sea of Thieves, la pirámide de pruebas automáticas. No des cifras de memoria: si alguien quiere detalles, que vea la charla o el artículo citado.' },

      { kind: 'analogia', title: 'Depurar como detective',
        lead: 'Primero la evidencia, después la hipótesis.',
        izq: 62,
        left: [{ fig: 'detectivePasos' }],
        right: [
          { mapa: [['Asegurar la escena', 'Reproducir'], ['Descartar sospechosos', 'Acotar'], ['Teoría del caso', 'Hipótesis'], ['Prueba de laboratorio', 'Experimento']], de: 'Detective', a: 'Depuración', pasos: true }
        ],
        nota: '6 minutos. Avanza en orden y luego reinicia e intenta saltar a «Experimento». El quinto paso, atrapar, es arreglar y dejar una prueba. Es la estructura del informe de bug del ACA 2: un párrafo por paso. Pregunta: ¿qué hace buena a una hipótesis? Respuesta esperada: que se pueda desmentir con un experimento. Pide a alguien que cuente el bug que trajo con los cinco pasos.' },

      { kind: 'demo', title: 'Acotar: encuentra el commit culpable',
        izq: 36,
        left: [
          { check: { q: 'Funcionaba hace 16 commits. Si pruebas siempre el del medio, ¿cuántos necesitas como máximo?', opts: ['16', '8', '4', '1'], ok: 2, why: 'Cada prueba descarta la mitad: 16, 8, 4, 2, 1. Con 1000 commits serían 10. Es lo que automatiza git bisect.' } },
          { pie: 'En tu proyecto: <code>git bisect start</code>, <code>bad</code>, <code>good v0.3</code> y <code>git bisect run dotnet test</code>.', paso: true }
        ],
        right: [{ fig: 'detective' }],
        nota: '6 minutos. Respuesta esperada del check: C. Primera ronda libre: muchos irán uno por uno. Segunda: siempre el del medio de la zona amarilla. Compara intentos. Pregunta: ¿qué necesita git bisect run para funcionar solo? Respuesta esperada: una prueba que falle con el bug, y commits pequeños que compilen. Los comandos completos están en la página de la clase.' },

      { kind: 'antipatron', title: 'Cambiar cosas al azar hasta que funcione',
        lead: 'Cuando por fin funciona, no sabes por qué ni qué más dañaste.',
        top: true,
        full: [
          { compare: { a: { label: 'Parches a ciegas', lang: 'C#', src: parches }, b: { label: 'Reproducir, entender, arreglar', lang: 'C#', src: atrapado } } },
          { clave: 'Un cambio a la vez. Si no ayudó, se deshace antes de probar el siguiente.', paso: true }
        ],
        nota: '4 minutos. Todos lo hemos hecho; dilo con humor. Pregunta: en la izquierda, ¿cuál de los cambios arregló el bug? Respuesta esperada: nadie sabe, y ese es el problema. En la derecha el orden: primero la prueba en rojo que reproduce el bug, después el arreglo. Esa prueba cuenta dentro de las 8 del ACA 2.' },

      { kind: 'demo', title: 'La lupa y la libreta del detective',
        izq: 42,
        left: [
          { tabla: { head: ['Herramienta', 'Imagen'], rows: [['Breakpoint', 'Congelar la escena'], ['Breakpoint condicional', 'Avísame si entra el sospechoso'], ['Assert', 'La alarma de la puerta'], ['Profiler', 'El cronómetro']] }, pasos: true }
        ],
        right: [{ fig: 'registro' }],
        nota: '6 minutos. Muestra en vivo un breakpoint condicional: clic derecho sobre el punto rojo, condición bicho.Tipo == "tanque". Es lo que menos conocen y más tiempo ahorra. En la figura, el registro es la libreta: los niveles bajan el ruido sin borrar líneas. Pregunta: ¿qué nivel dejas encendido en la build que juega el público? Respuesta esperada: Aviso y Error. Profiler y Stopwatch son repaso de la semana 5; el código está en la página de la clase.' },

      { kind: 'actividad', title: 'Plan de pruebas del ACA 2 · 12 min',
        lead: 'En parejas, escriban los nombres de 8 pruebas. Solo los nombres.',
        izq: 58,
        left: [{ ol: ['Formato <code>Sujeto_Situacion_Resultado</code>.', 'Cubran bichos, pool, estados, oleadas y puntaje.', 'Marquen cuáles necesitan un doble y cuál será un <code>[Theory]</code>.', 'Encierren la que atraparía su peor bug.'] }],
        right: [{ panel: [{ clave: 'Si el nombre no se puede escribir, la regla no está clara.' }, 'Ejemplo: <code>Tanque_MuereAlTercerGolpe</code>'], h: 'Regla' }],
        nota: '12 minutos más 5 de puesta en común. Salas de 2 o 3. Mínimo: 2 de bichos, 2 del pool, 2 de la máquina de estados, 1 de oleadas o datos y 1 de puntaje o baterías. Al volver, cada pareja lee su mejor nombre. Pregunta a cada una: ¿qué doble necesita esa prueba? Errores esperados: nombres vagos (Prueba1) y pruebas de pantalla («se dibuja la M»).' },

      { kind: 'cierre', title: 'Lo que te llevas hoy',
        full: [
          { ol: ['<b>Las pruebas son tu lista de chequeo:</b> Preparar, Actuar, Afirmar. Muchas unitarias, con los bordes en un <code>[Theory]</code>.', '<b>Lo probable está bien armado:</b> reloj, azar y audio entran por enchufes. Semilla, comandos y paso fijo repiten la partida.', '<b>Depurar es un método:</b> reproducir, acotar, hipótesis, experimento y una prueba.'], pasos: true },
          { p: 'Ahora: <a href="quiz.html?s=7">quiz de la clase</a>. Esta semana: entrega del <a href="docs/aca2.html">ACA 2</a> (domingo 10 de enero de 2027), autoevaluación y coevaluación.', paso: true }
        ],
        nota: '3 minutos. Pregunta de salida: ¿cuál es la primera prueba que vas a escribir esta noche? Respuesta esperada: una regla sin azar ni tiempo, como el tanque. Repite las dos fechas y pregunta si alguien tiene un bloqueo para entregar. La semana 8 no trae teoría nueva: cada equipo muestra su rescate en 5 minutos con una cifra medida. Ofrece asesoría antes del domingo si el calendario lo permite.' }
    ],

    quiz: [
      { tema: 'Pirámide', q: 'Tienes tiempo para escribir 10 pruebas de Turno Nocturno. ¿Cómo las repartes?', opts: ['10 pruebas manuales jugando la partida completa', '5 de pantalla y 5 de sonido', 'La mayoría unitarias de reglas (vida, pool, estados) y una o dos de integración', '10 pruebas que arrancan el juego entero'], ok: 2, why: 'La base de la pirámide son pruebas unitarias: rápidas, baratas y precisas. Las de integración y las manuales existen, pero son pocas porque son lentas.' },
      { tema: 'Código probable', q: '¿Qué hace que esta línea sea difícil de probar? <code>int bono = DateTime.Now.Hour >= 22 ? 2 : 1;</code>', opts: ['Usa un operador ternario', 'Consulta el reloj real por su cuenta: el resultado depende de la hora a la que corras la prueba', 'Los números deberían ser constantes', 'Le falta un comentario'], ok: 1, why: 'Una dependencia escondida (el reloj) hace que la misma prueba dé resultados distintos. Si la hora entra como parámetro o por un IReloj, la prueba decide qué hora es.' },
      { tema: 'AAA', q: 'En una prueba con la estructura Preparar, Actuar, Afirmar, ¿qué va en "Actuar"?', opts: ['La llamada a la regla que quieres verificar, idealmente una sola', 'La creación de los objetos y los dobles', 'Las comparaciones con <code>Assert</code>', 'La impresión del resultado en consola'], ok: 0, why: 'Preparar arma la situación, Actuar ejecuta una cosa y Afirmar compara lo esperado con lo obtenido. Si Actuar hace varias cosas, cuando falla no sabes cuál fue.' },
      { tema: 'Dobles', q: 'Quieres verificar que al morir un bicho el juego pide reproducir un sonido, sin que suene nada durante las pruebas. ¿Qué usas?', opts: ['<code>Console.Beep</code> con volumen bajo', 'Un <code>Thread.Sleep</code> para esperar el sonido', 'Una prueba manual con audífonos', 'Un <code>AudioEspia</code> que implementa <code>IAudio</code> y cuenta las llamadas'], ok: 3, why: 'Un doble de prueba ocupa el lugar del audio real. Como el núcleo solo conoce la interfaz, no nota la diferencia, y la prueba puede preguntar cuántas veces lo llamaron.' },
      { tema: 'Determinismo', q: '¿Qué combinación permite repetir exactamente una partida para reproducir un bug en la misma build?', opts: ['Más fps y mejor tarjeta gráfica', 'Un video de la pantalla', 'Paso fijo, semilla del azar y la lista de comandos del jugador por frame', 'Guardar el puntaje final'], ok: 2, why: 'Con el tiempo en pasos iguales, el azar arrancando del mismo punto y las mismas entradas, la simulación produce el mismo resultado todas las veces.' },
      { tema: 'Depuración', q: 'El juego funcionaba en el commit 1 y falla en el commit 64. ¿Cuál es la forma más rápida de hallar el commit que lo dañó?', opts: ['Revisar los 64 en orden', 'Probar el del medio y descartar la mitad cada vez: unas 6 pruebas', 'Reescribir el módulo sospechoso', 'Borrar el historial y empezar de nuevo'], ok: 1, why: 'Es la búsqueda por mitades, lo que automatiza git bisect. Quedan 63 sospechosos y cada prueba parte el grupo: seis pruebas en lugar de hasta 63.' },
      { tema: 'Depuración', q: 'Encontraste y corregiste el bug. ¿Qué falta para cerrar el caso?', opts: ['Nada, ya funciona', 'Borrar todos los mensajes de registro', 'Cambiar otras cosas parecidas por si acaso', 'Dejar una prueba automática que falle si el bug vuelve'], ok: 3, why: 'El quinto paso del método: arreglo más prueba. Sin la prueba, el mismo bug puede regresar en un mes y nadie se entera hasta la demo.' },
      { tema: 'Pruebas parametrizadas', q: 'Diseño dice que a las 2 a. m. también es turno nocturno. Agregas <code>[InlineData(2, 20)]</code> a <code>Lento_ValeDobleDesdeLas22</code>, cuya regla es <code>hora >= 22 ? 2 : 1</code>. ¿Qué pasa al correr las pruebas?', opts: ['Esa fila falla: la regla no cubre la madrugada, y la prueba destapó una pregunta de diseño', 'Pasa, porque 2 es menor que 22', 'No compila: InlineData solo acepta un valor', 'xUnit se salta las filas repetidas'], ok: 0, why: 'Con hora 2 la regla da bono 1, o sea 10 puntos, y la fila esperaba 20. La prueba en rojo no es un error de la prueba: muestra que «de noche» no estaba bien definido.' },
      { tema: 'Pruebas intermitentes', q: 'La prueba <code>Lento_Vale10Puntos</code> pasa en tu portátil, pero el servidor de integración, que corre a las 23:00, la marca en rojo cada noche. Nadie cambió el código. ¿Cuál es la causa más probable?', opts: ['El servidor es más lento', 'La regla lee <code>DateTime.Now</code>: el resultado depende de la hora real a la que corre la prueba', 'xUnit falla de noche', 'Faltan más pruebas'], ok: 1, why: 'Es una prueba intermitente: depende de algo que no controla. Se arregla pasando la hora como parámetro o por un IReloj, para que la prueba decida qué hora es.' },
      { tema: 'Punto flotante', q: 'Dos jugadores en red por lockstep, uno en PC y otro en consola, usan la misma semilla y los mismos comandos. En el frame 500, en una máquina el bicho tocó el cable y en la otra no. ¿Qué es lo más probable?', opts: ['Una diferencia de punto flotante entre plataformas que un <code>if</code> convirtió en decisiones distintas', 'La semilla se perdió por la red', 'Uno de los dos tiene menos fps', 'El bus de eventos entregó los avisos en otro orden'], ok: 0, why: 'Con paso fijo, los fps no cambian la simulación, y la semilla viaja una sola vez. Pero entre CPU y compiladores distintos el último decimal puede variar, y una comparación lo convierte en un desync. Por eso el lockstep usa enteros o punto fijo.' }
    ]
  };
})();
