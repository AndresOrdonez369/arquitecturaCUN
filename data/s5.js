(function () {
  const structClass = `using System;

PuntoS a = new PuntoS { X = 1 };
PuntoS b = a;              // copia el VALOR: ahora hay dos puntos
b.X = 99;
Console.WriteLine(a.X);    // ?

PuntoC c = new PuntoC { X = 1 };
PuntoC d = c;              // copia la REFERENCIA: dos nombres, un solo punto
d.X = 99;
Console.WriteLine(c.X);    // ?

// En un programa de instrucciones de nivel superior, los tipos van al final.
struct PuntoS { public int X; }   // tipo por valor: vive donde vive la variable que lo contiene
class  PuntoC { public int X; }   // tipo por referencia: el objeto vive en el heap`;

  const structUnity = `using UnityEngine;

public class Mover : MonoBehaviour
{
    void Update()
    {
        // transform.position.x = 5f;     // no compila (CS1612): position entrega una COPIA
        //                                // porque Vector3 es un struct

        Vector3 p = transform.position;   // copia local: cero basura
        p.x = 5f;
        transform.position = p;           // se devuelve el valor completo

        // new Vector3(...) NO genera basura: es un struct.
        // new List<int>() o new Enemigo() SÍ: son clases y van al heap.
    }
}`;

  const basuraAntes = `static void Dibujar()
{
    var lineas = new List<string>();     // 1: lista nueva
    for (int y = 0; y < 20; y++)
    {
        string linea = "";
        for (int x = 0; x < 40; x++)
            linea += CaracterEn(x, y);   // 2: string nuevo
        lineas.Add(linea);               //    en cada +=
    }
    int vivos = enemHp.Where(h => h > 0)
                      .Count();          // 3: LINQ
    Console.SetCursorPosition(0, 0);
    foreach (var l in lineas)
        Console.WriteLine(l);
    Console.WriteLine("Bichos: " + vivos); // 4
}`;

  const basuraDespues = `static readonly char[] pantalla =
    new char[40 * 20];                   // se pide UNA vez

static void Dibujar()
{
    for (int y = 0; y < 20; y++)
        for (int x = 0; x < 40; x++)
            pantalla[y * 40 + x] = CaracterEn(x, y);

    int vivos = 0;                       // un for no crea nada
    for (int i = 0; i < enemHp.Count; i++)
        if (enemHp[i] > 0) vivos++;

    for (int y = 0; y < 20; y++)
    {
        Console.SetCursorPosition(0, y);
        Console.Out.Write(pantalla, y * 40, 40);
    }
    // El HUD: arma el texto solo cuando cambian los puntos, no en cada frame.
}`;

  const cppMal = `void cargarNivel() {
    // alquilo
    Textura* fondo = new Textura("sala.png");

    if (!fondo->valida())
        return;            // salgo sin devolver

    dibujar(*fondo);
    delete fondo;          // devuelvo

    int w = fondo->ancho(); // y la sigo usando
}`;

  const cppBien = `#include <memory>

void cargarNivel() {
    // dueño único: la llave del hotel
    auto fondo = std::make_unique<Textura>("sala.png");

    if (!fondo->valida())
        return;            // se libera sola

    dibujar(*fondo);
}                          // y aquí también
                           // sin delete, sin fugas`;

  const cppRAII = `#include <memory>
#include <vector>

// Textura: una clase que carga una imagen; dibujar recibe const Textura&.
struct Bicho { float x = 0, y = 0; int vida = 1; };

void cargarNivel() {
    auto fondo = std::make_unique<Textura>("sala.png");   // dueño único
    if (!fondo->valida()) return;        // se libera sola al salir del bloque
    dibujar(*fondo);
}                                        // y aquí también: nadie escribe delete

void prepararOleada() {
    std::vector<Bicho> bichos;           // el vector es dueño de sus bichos
    bichos.reserve(64);                  // UNA reserva: 64 puestos contiguos
    for (int i = 0; i < 64; ++i)
        bichos.emplace_back();           // se construyen en su puesto, sin pedir más memoria
}                                        // al salir, el vector devuelve todo`;

  const cppManual = `// Sin red: lo que NO queremos escribir.
void cargarNivel() {
    Textura* fondo = new Textura("sala.png");   // alquilo memoria

    if (!fondo->valida())
        return;                 // FUGA: salí sin devolver. Nadie más tiene la dirección.

    dibujar(*fondo);
    delete fondo;               // devuelvo

    int w = fondo->ancho();     // PUNTERO COLGANTE: uso algo que ya devolví.
}                               // Comportamiento indefinido: puede funcionar hoy
                                // y estallar el día de la entrega.`;

  const cppMover = `#include <memory>
#include <utility>
#include <vector>

struct Jefe { int vida = 100; };

std::unique_ptr<Jefe> crearJefe() {
    return std::make_unique<Jefe>();       // la llave sale de la función: se mueve, no se copia
}

void oleadaFinal() {
    auto jefe = crearJefe();
    // auto copia = jefe;                  // NO compila: una llave, un dueño
    std::vector<std::unique_ptr<Jefe>> jefes;
    jefes.push_back(std::move(jefe));      // el dueño ahora es el vector; jefe queda vacío
    // Para compartir de verdad existe std::shared_ptr (cuenta dueños), con su costo.
}                                          // se destruye el vector y libera al jefe`;

  const csEquivalente = `// Lo mismo en C#: pides y te olvidas.
void CargarNivel()
{
    var fondo = new Textura("sala.png");   // pido memoria en el heap
    if (!fondo.Valida) return;             // no devuelvo nada...
    Dibujar(fondo);
}                                          // ...el recolector la barrerá "algún día".
                                           // Cómodo y seguro. El precio: tú no decides cuándo.`;

  const poolCS = `using System;
using System.Collections.Generic;

class Pool<T> where T : class
{
    readonly Stack<T> libres = new();        // el estante de zapatos
    readonly Func<T> crear;

    public int Creados { get; private set; }

    public Pool(Func<T> crear, int inicial)
    {
        this.crear = crear;
        for (int i = 0; i < inicial; i++) { libres.Push(crear()); Creados++; }
    }

    public T Tomar()
    {
        if (libres.Count > 0) return libres.Pop();   // presta uno que ya existe
        Creados++;
        return crear();                              // solo si el estante quedó vacío
    }

    // Ojo: devolver dos veces el mismo objeto lo presta a dos dueños a la vez.
    public void Devolver(T objeto) => libres.Push(objeto);
}`;

  const poolUnity = `using UnityEngine;
using UnityEngine.InputSystem;   // paquete Input System
using UnityEngine.Pool;

public class Canon : MonoBehaviour
{
    [SerializeField] Chispa prefab;
    ObjectPool<Chispa> pool;

    void Awake()
    {
        pool = new ObjectPool<Chispa>(
            createFunc:      () => Instantiate(prefab),
            actionOnGet:     c => c.gameObject.SetActive(true),
            actionOnRelease: c => c.gameObject.SetActive(false),
            actionOnDestroy: c => Destroy(c.gameObject),
            collectionCheck: true,                  // en el Editor avisa si devuelves dos veces
            defaultCapacity: 32, maxSize: 128);
    }

    void Update()
    {
        // Con el Input Manager antiguo sería: Input.GetKeyDown(KeyCode.Space)
        var teclado = Keyboard.current;
        if (teclado != null && teclado.spaceKey.wasPressedThisFrame)
        {
            Chispa c = pool.Get();                  // en vez de Instantiate
            c.Lanzar(transform.position, pool);
        }
    }
}`;

  const poolUnityChispa = `using UnityEngine;
using UnityEngine.Pool;

public class Chispa : MonoBehaviour
{
    IObjectPool<Chispa> origen;
    Rigidbody2D rb;

    void Awake() { rb = GetComponent<Rigidbody2D>(); }

    public void Lanzar(Vector3 desde, IObjectPool<Chispa> pool)
    {
        origen = pool;
        transform.position = desde;                 // reiniciar SIEMPRE al salir del pool
        rb.linearVelocity = Vector2.up * 12f;
    }

    void Update()
    {
        if (transform.position.y > 6f)
            origen.Release(this);                   // en vez de Destroy
    }
}`;

  const poolCpp = `#include <cstddef>
#include <vector>

struct Chispa { float x = 0, y = 0; bool activa = false; };

class PoolChispas {
    std::vector<Chispa> casillas;          // todas juntas, contiguas en memoria
    std::vector<std::size_t> libres;       // índices de las casillas sin usar
public:
    explicit PoolChispas(std::size_t n) : casillas(n) {
        libres.reserve(n);
        for (std::size_t i = 0; i < n; ++i) libres.push_back(n - 1 - i);
    }

    Chispa* tomar() {
        if (libres.empty()) return nullptr;        // pool lleno: esta vez no hay chispa
        std::size_t i = libres.back();
        libres.pop_back();
        casillas[i] = Chispa{};                    // reinicia la casilla
        casillas[i].activa = true;
        return &casillas[i];
    }

    void devolver(Chispa* c) {
        c->activa = false;
        libres.push_back(static_cast<std::size_t>(c - casillas.data()));
    }
};
// El vector nunca crece después del constructor: los punteros a casillas no se invalidan.`;

  const chispasAntes = `// Disparar
if (tecla == ConsoleKey.Spacebar)
    chispas.Add(new Chispa { X = jx, Y = jy - 1 });

// Actualizar
for (int i = chispas.Count - 1; i >= 0; i--)
{
    chispas[i].Y -= 20f * dt;
    if (chispas[i].Y < 0)
        chispas.RemoveAt(i);   // queda suelta:
}                              // basura futura`;

  const chispasDespues = `static readonly Pool<Chispa> pool =
    new(() => new Chispa(), 32);

// Disparar
if (tecla == ConsoleKey.Spacebar)
{
    Chispa c = pool.Tomar();   // prestada
    c.X = jx; c.Y = jy - 1;    // se reinicia
    chispas.Add(c);
}

// Actualizar
for (int i = chispas.Count - 1; i >= 0; i--)
{
    chispas[i].Y -= 20f * dt;
    if (chispas[i].Y < 0)
    {
        pool.Devolver(chispas[i]);
        chispas.RemoveAt(i);
    }
}`;

  const localidad = `using System.Collections.Generic;

float vel = 2f, dt = 1f / 60f;

// Regado: la lista guarda direcciones; cada bicho vive en otro rincón del heap
List<BichoC> regados = new();

// Contiguo: un solo bloque con todos los bichos pegados (12 bytes cada uno)
BichoS[] juntos = new BichoS[256];

// El mismo recorrido. La CPU lee el segundo de corrido, sin saltar.
for (int i = 0; i < regados.Count; i++) regados[i].Y += vel * dt;
for (int i = 0; i < juntos.Length; i++) juntos[i].Y  += vel * dt;   // el arreglo entrega el elemento mismo

// Con List<BichoS>, "lista[i].Y += ..." no compila (CS1612): el indexador de List entrega una copia.

class  BichoC { public float X, Y; public int Vida; }
struct BichoS { public float X, Y; public int Vida; }`;

  const medirCS = `using System;
using System.Diagnostics;

const int Frames = 1000;

long bytesAntes = GC.GetTotalAllocatedBytes(true);   // bytes pedidos desde que arrancó
int  gen0Antes  = GC.CollectionCount(0);             // veces que pasó el recolector (gen 0)
var  reloj      = Stopwatch.StartNew();

for (int f = 0; f < Frames; f++)
{
    Juego.Actualizar(1f / 60f);
    Juego.Dibujar();
}

reloj.Stop();
long bytes = GC.GetTotalAllocatedBytes(true) - bytesAntes;
int  gen0  = GC.CollectionCount(0) - gen0Antes;

Console.WriteLine($"ms por frame:    {reloj.Elapsed.TotalMilliseconds / Frames:F3}");
Console.WriteLine($"bytes por frame: {bytes / Frames}");
Console.WriteLine($"recolecciones:   {gen0}");`;

  const medirUnity = `using Unity.Profiling;
using UnityEngine;

// Window > Analysis > Profiler. Módulo CPU, columna "GC Alloc".
// La meta en pleno juego: GC Alloc = 0 B por frame.
public class Oleadas : MonoBehaviour
{
    static readonly ProfilerMarker marca = new ProfilerMarker("Oleadas.Actualizar");

    void Update()
    {
        using (marca.Auto())         // este tramo aparece con nombre propio en el Profiler
        {
            ActualizarBichos();
        }
    }

    void ActualizarBichos() { /* la lógica de la oleada */ }
}`;

  /* ---------- Versiones recortadas para las slides (las completas están arriba, en la página de la clase) ---------- */
  const sBasuraDespues = `static readonly char[] pantalla =
    new char[40 * 20];             // se pide UNA vez

static void Dibujar()
{
    for (int y = 0; y < 20; y++)
        for (int x = 0; x < 40; x++)
            pantalla[y * 40 + x] = CaracterEn(x, y);
    int vivos = 0;                 // un for no crea nada
    for (int i = 0; i < enemHp.Count; i++)
        if (enemHp[i] > 0) vivos++;
    for (int y = 0; y < 20; y++)
    {
        Console.SetCursorPosition(0, y);
        Console.Out.Write(pantalla, y * 40, 40);
    }
}`;

  const sStruct = `PuntoS a = new PuntoS { X = 1 };
PuntoS b = a;
b.X = 99;
Console.WriteLine(a.X);   // ?

PuntoC c = new PuntoC { X = 1 };
PuntoC d = c;
d.X = 99;
Console.WriteLine(c.X);   // ?

struct PuntoS { public int X; }   // tipo por valor
class  PuntoC { public int X; }   // tipo por referencia`;

  const sStructUnity = `void Update()
{
    // transform.position.x = 5f;   // no compila: es una COPIA

    Vector3 p = transform.position;   // copia local
    p.x = 5f;
    transform.position = p;           // se devuelve completo

    // new Vector3(...) no ensucia: es un struct.
    // new List<int>() sí: es una clase y va al heap.
}`;

  const sCppMal = `void cargarNivel() {
    Textura* fondo = new Textura("sala.png");

    if (!fondo->valida())
        return;

    dibujar(*fondo);
    delete fondo;

    int w = fondo->ancho();
}`;

  const sCppMover = `std::unique_ptr<Jefe> crearJefe() {
    return std::make_unique<Jefe>();   // la llave sale
}

void oleadaFinal() {
    auto jefe = crearJefe();
    // auto copia = jefe;   // no compila: un dueño
    std::vector<std::unique_ptr<Jefe>> jefes;
    jefes.push_back(std::move(jefe));  // pasa la llave
    // jefe ahora está vacío (nullptr)
}   // se destruye el vector y libera al jefe`;

  const sPool = `class Pool<T> where T : class
{
    readonly Stack<T> libres = new();   // el estante
    readonly Func<T> crear;

    public Pool(Func<T> crear, int inicial)
    {
        this.crear = crear;
        for (int i = 0; i < inicial; i++) libres.Push(crear());
    }

    public T Tomar() =>
        libres.Count > 0 ? libres.Pop() : crear();

    public void Devolver(T obj) => libres.Push(obj);
}`;

  const sPoolUnity = `ObjectPool<Chispa> pool;     // UnityEngine.Pool

void Awake()
{
    pool = new ObjectPool<Chispa>(
        createFunc:      () => Instantiate(prefab),
        actionOnGet:     c => c.gameObject.SetActive(true),
        actionOnRelease: c => c.gameObject.SetActive(false),
        actionOnDestroy: c => Destroy(c.gameObject),
        defaultCapacity: 32, maxSize: 128);
}

// Disparar: Chispa c = pool.Get();   en vez de Instantiate
// Al morir: pool.Release(c);         en vez de Destroy`;

  const sPoolCpp = `struct Chispa { float x = 0, y = 0; bool activa = false; };

class PoolChispas {
    std::vector<Chispa> casillas;      // contiguas en memoria
    std::vector<std::size_t> libres;   // índices sin usar
public:
    explicit PoolChispas(std::size_t n) : casillas(n) {
        for (std::size_t i = 0; i < n; ++i)
            libres.push_back(i);
    }
    Chispa* tomar() {
        if (libres.empty()) return nullptr;   // pool lleno
        std::size_t i = libres.back(); libres.pop_back();
        casillas[i] = Chispa{};               // reinicia
        casillas[i].activa = true;
        return &casillas[i];
    }
};`;

  const sChispasDespues = `static readonly Pool<Chispa> pool =
    new(() => new Chispa(), 32);

// Disparar
if (tecla == ConsoleKey.Spacebar)
{
    Chispa c = pool.Tomar();   // prestada
    c.X = jx; c.Y = jy - 1;    // se reinicia
    chispas.Add(c);
}
// Actualizar
for (int i = chispas.Count - 1; i >= 0; i--)
{
    chispas[i].Y -= 20f * dt;
    if (chispas[i].Y >= 0) continue;
    pool.Devolver(chispas[i]);
    chispas.RemoveAt(i);
}`;

  const sLocalidad = `float vel = 2f, dt = 1f / 60f;
List<BichoC> regados = new();        // direcciones
BichoS[] juntos = new BichoS[256];   // un bloque de 256 x 12 B

for (int i = 0; i < regados.Count; i++)
    regados[i].Y += vel * dt;        // salta por el heap
for (int i = 0; i < juntos.Length; i++)
    juntos[i].Y += vel * dt;         // el vecino ya llegó

// Con List<BichoS>, lista[i].Y += ... no compila:
// el indexador entrega una copia, como position.

class  BichoC { public float X, Y; public int Vida; }
struct BichoS { public float X, Y; public int Vida; }`;

  const sMedir = `long bytes0 = GC.GetTotalAllocatedBytes(true);
int  gc0    = GC.CollectionCount(0);
var  reloj  = Stopwatch.StartNew();

for (int f = 0; f < 1000; f++)
{
    Juego.Actualizar(1f / 60f);
    Juego.Dibujar();
}

long bytes = GC.GetTotalAllocatedBytes(true) - bytes0;
int  gcs   = GC.CollectionCount(0) - gc0;
double ms  = reloj.Elapsed.TotalMilliseconds / 1000;
Console.WriteLine($"ms por frame:    {ms:F3}");
Console.WriteLine($"bytes por frame: {bytes / 1000}");
Console.WriteLine($"recolecciones:   {gcs}");`;

  const sMedirUnity = `using Unity.Profiling;

// Window > Analysis > Profiler, módulo CPU, columna GC Alloc.
// Meta en pleno juego: GC Alloc = 0 B por frame.
public class Oleadas : MonoBehaviour
{
    static readonly ProfilerMarker marca =
        new ProfilerMarker("Oleadas.Actualizar");

    void Update()
    {
        using (marca.Auto())   // con nombre en el Profiler
            ActualizarBichos();
    }

    void ActualizarBichos() { /* la lógica de la oleada */ }
}`;

  window.CLASE = {
    n: 5,
    titulo: 'Gestión de memoria y optimización',
    objetivos: [
      'Explicar la diferencia entre stack y heap y predecir qué pasa al copiar un struct y al copiar una referencia.',
      'Encontrar asignaciones de memoria por frame en un juego en C#, incluidas las escondidas (boxing, closures, LINQ), y explicar por qué producen tirones.',
      'Implementar un Object Pool y decir cuándo vale la pena, en C#, en Unity y en C++, y explicar la propiedad con RAII y unique_ptr.',
      'Medir tiempo de frame y asignaciones antes de optimizar, con un presupuesto de 16,7 ms a 60 fps.'
    ],
    analogia: 'Los zapatos de la bolera: nadie fabrica un par por cliente ni los bota al salir. Se prestan, se devuelven y se vuelven a usar. La memoria de un juego funciona mejor igual: se pide una vez al cargar y se recicla mientras se juega.',
    agenda: [
      ['0:00', 'El misterio del tirón cada 3 segundos'],
      ['0:08', 'Stack y heap: la mesa y la bodega. Valor contra referencia'],
      ['0:23', 'El recolector de basura, la basura por frame y la basura escondida'],
      ['0:45', 'C++ sin red: quien alquila, devuelve. RAII y unique_ptr'],
      ['0:58', 'Object Pool: los zapatos de la bolera, con demo. Casos reales'],
      ['1:22', 'Localidad de datos: del mercado a la memoria de verdad'],
      ['1:32', 'Medir antes de optimizar: el presupuesto de 16,7 ms'],
      ['1:42', 'Actividad: caza de basura en Turno Nocturno'],
      ['1:55', 'Cierre y recordatorio: el ACA 1 cierra el domingo 27 de diciembre']
    ],
    codigoIntro: 'Cinco piezas: valor contra referencia, un pool en tres lenguajes, la memoria en C++ con y sin red, la localidad de datos y cómo medir asignaciones antes de tocar nada. Aquí aparece C++ para ver la memoria sin recolector.',
    codigo: [
      { titulo: 'Struct contra class: valor y referencia', desc: 'Copiar un struct duplica el dato. Copiar una variable de clase duplica la dirección: los dos nombres apuntan al mismo objeto. En Unity lo vives a diario con <code>Vector3</code>.',
        tabs: [{ lang: 'C#', src: structClass }, { lang: 'Unity', src: structUnity }] },
      { titulo: 'Object Pool en tres lenguajes', desc: 'Prestar y devolver en vez de crear y botar. En C# es una pila de objetos libres, Unity ya trae <code>ObjectPool&lt;T&gt;</code> (en <code>UnityEngine.Pool</code>) y en C++ es un vector reservado una sola vez con una lista de casillas libres.',
        tabs: [{ lang: 'C#', src: poolCS }, { lang: 'Unity', label: 'Unity (el cañón)', src: poolUnity }, { lang: 'Unity', label: 'Unity (la chispa)', src: poolUnityChispa }, { lang: 'C++', src: poolCpp }] },
      { titulo: 'C++: quien alquila, devuelve', desc: 'Sin recolector, cada <code>new</code> necesita su <code>delete</code>. RAII amarra la devolución a la salida del bloque: <code>std::unique_ptr</code> y <code>std::vector</code> devuelven solos. Un <code>unique_ptr</code> no se copia: la propiedad se mueve con <code>std::move</code>.',
        tabs: [{ lang: 'C++', label: 'C++ (new y delete a mano)', src: cppManual }, { lang: 'C++', label: 'C++ (RAII)', src: cppRAII }, { lang: 'C++', label: 'C++ (mover la propiedad)', src: cppMover }, { lang: 'C#', label: 'C# (para comparar)', src: csEquivalente }] },
      { titulo: 'Localidad de datos', desc: 'El mismo recorrido sobre una lista de objetos regados por el heap y sobre un arreglo de structs contiguos. Con muchos elementos, el segundo aprovecha mejor la caché de la CPU.',
        tabs: [{ lang: 'C#', src: localidad }] },
      { titulo: 'Medir antes de optimizar', desc: 'Mil frames, tres números: milisegundos por frame, bytes pedidos por frame y cuántas veces pasó el recolector. <code>GC.GetTotalAllocatedBytes</code> existe desde .NET Core 3.0. En Unity, el Profiler muestra lo mismo en la columna GC Alloc.',
        tabs: [{ lang: 'C#', src: medirCS }, { lang: 'Unity', label: 'Unity (Profiler)', src: medirUnity }] }
    ],
    tarea: [
      'Entrega el ACA 1 (diagnóstico y plano de rescate). Cierra el <b>domingo 27 de diciembre</b>.',
      'Agrega al plano una sección "Memoria": las tres asignaciones por frame que encontraste hoy y cómo piensas eliminarlas.',
      'Copia el medidor de la sección de código en un proyecto de consola y mide <code>Dibujar</code> de Turno Nocturno. Guarda los tres números: son el "antes" del ACA 2.',
      'Opcional: lee los capítulos "Object Pool" y "Data Locality" de Nystrom.'
    ],
    lecturas: [
      'Nystrom, R. (2014). <i>Game Programming Patterns</i>, capítulos "Object Pool" y "Data Locality" (gratis en gameprogrammingpatterns.com).',
      'Gregory, J. (2018). <i>Game Engine Architecture</i> (3.ª ed.), sección de gestión de memoria (asignadores de pila y de pool).',
      'Documentación de .NET: "Fundamentals of garbage collection".',
      'Manual de Unity: "Garbage collector overview", "Incremental garbage collection" y <code>UnityEngine.Pool.ObjectPool&lt;T&gt;</code>.',
      'Acton, M. (2014). "Data-Oriented Design and C++", charla en CppCon 2014.'
    ],

    conceptos: [
      { t: 'Stack y heap', d: 'El stack guarda las variables locales de cada llamada y se libera solo al retornar. El heap guarda objetos que viven más allá de una función; alguien tiene que liberarlos: el recolector en C#, tú (o RAII) en C++.', ej: 'En <code>Dibujar()</code>, el <code>int y</code> del bucle va al stack; la <code>new List&lt;string&gt;()</code> va al heap y queda como basura al terminar el frame.' },
      { t: 'Valor y referencia', d: 'Un <code>struct</code> se copia completo al asignarlo; una variable de <code>class</code> guarda una dirección, y copiarla da dos nombres para el mismo objeto. Un struct vive donde vive su contenedor: local en el stack, dentro de un objeto o arreglo en el heap.', ej: '<code>Vector3 p = transform.position;</code> es una copia: cambiar <code>p.x</code> no mueve al robot hasta que haces <code>transform.position = p</code>.' },
      { t: 'Recolector de basura (GC)', d: 'Busca los objetos del heap a los que ya nadie apunta y recupera su memoria, consumiendo tiempo de CPU. El de .NET es generacional (gen 0, 1 y 2); Unity usa Boehm, no generacional, con un modo incremental que reparte el trabajo en varios frames.', ej: 'Si Turno Nocturno crea cientos de textos por frame, el recolector corre cada pocos segundos y ese frame se pasa del presupuesto: el tirón.' },
      { t: 'Basura escondida', d: 'Asignaciones que no se ven como <code>new</code>: concatenar strings (son inmutables), boxing (un valor guardado como <code>object</code>), lambdas que capturan variables locales y LINQ.', ej: '<code>"Puntos: " + puntos</code> en cada <code>Update</code> crea un string nuevo 60 veces por segundo, aunque los puntos no hayan cambiado.' },
      { t: 'RAII y unique_ptr', d: 'En C++, la liberación se amarra a la vida de un objeto dueño: cuando sale del bloque, su destructor devuelve el recurso. <code>std::unique_ptr</code> es un dueño único que no se copia, solo se mueve.', ej: 'La textura del nivel con <code>std::make_unique</code> se libera aunque la función salga por un <code>return</code> temprano.' },
      { t: 'Object Pool', d: 'Un conjunto de objetos creados por adelantado que se prestan y se devuelven en vez de crearse y destruirse. Cada objeto prestado debe reiniciarse.', ej: 'Las chispas del robot: 32 creadas al cargar el nivel, prestadas al disparar y devueltas al salir de la pantalla.' },
      { t: 'Localidad de datos', d: 'La CPU trae la memoria en líneas (típicamente de 64 bytes) a su caché. Datos que se usan juntos y están contiguos se recorren más rápido que datos regados.', ej: 'Un arreglo de 10.000 partículas como structs se actualiza de corrido; una lista de 10.000 objetos de clase obliga a saltar por el heap.' },
      { t: 'Presupuesto de frame', d: 'A 60 fps cada frame tiene unos 16,7 ms para entrada, lógica, dibujo y limpieza. Si algo lo excede, se pierde un frame o se nota un tirón. Se mide antes de optimizar.', ej: 'Lógica 3 ms + dibujo 8 ms caben; si en ese frame pasa el recolector con 8 ms más, el frame dura 19 ms y se nota.' }
    ],
    industria: [
      { j: 'Unity · ObjectPool&lt;T&gt;', t: 'Desde Unity 2021, el motor trae pools listos en <code>UnityEngine.Pool</code> (<code>ObjectPool&lt;T&gt;</code>, <code>ListPool&lt;T&gt;</code> y otros). Recibe funciones para crear, prestar, devolver y destruir.', src: 'Scripting API de Unity: «UnityEngine.Pool.ObjectPool&lt;T&gt;».' },
      { j: 'Unity · recolector Boehm incremental', t: 'Unity usa el recolector Boehm-Demers-Weiser, que no es generacional. Su modo incremental reparte el trabajo de marcado en varios frames para evitar un pico grande; no reduce el trabajo total.', src: 'Manual de Unity: «Garbage collector overview» e «Incremental garbage collection».' },
      { j: '.NET · GC generacional', t: 'El recolector de .NET separa los objetos por edad: gen 0 (recién creados), gen 1 y gen 2. Como la mayoría muere joven, barrer gen 0 es barato y frecuente; gen 2 es lo caro.', src: 'Microsoft Learn: «Fundamentals of garbage collection».' },
      { j: 'Insomniac Games · Mike Acton', t: 'Defendió diseñar alrededor de los datos y de cómo los recorre el hardware: transformar arreglos contiguos en vez de objetos sueltos. Es la base del ECS de la semana 6.', src: 'Charla «Data-Oriented Design and C++», CppCon 2014.' },
      { j: 'Unreal Engine · UObject y punteros inteligentes', t: 'Los <code>UObject</code> los administra un recolector de basura propio del motor; el resto del C++ usa la Smart Pointer Library (<code>TUniquePtr</code>, <code>TSharedPtr</code>, <code>TWeakPtr</code>).', src: 'Documentación oficial de Unreal Engine: «Unreal Object Handling» y «Smart Pointer Library».' }
    ],
    errores: [
      { mito: 'Los struct siempre viven en el stack.', real: 'Viven donde vive su contenedor. Un struct local va en el stack; como campo de una clase o elemento de un arreglo, va en el heap dentro de ese objeto. Un <code>BichoS[]</code> está en el heap, pero en un solo bloque contiguo.' },
      { mito: 'Con recolector de basura no hay fugas de memoria.', real: 'Si algo sigue apuntando a un objeto (una lista estática, un evento sin desuscribir), nunca se libera. Se nota en la memoria que sube partida tras partida.' },
      { mito: '<code>foreach</code> siempre genera basura.', real: 'Sobre un arreglo o un <code>List&lt;T&gt;</code> usa un enumerador struct y no asigna. Sí asigna si recorres la colección como <code>IEnumerable&lt;T&gt;</code> o con LINQ. El Profiler lo confirma: GC Alloc 0 B.' },
      { mito: 'Un pool siempre hace más rápido el juego.', real: 'Si los objetos son pocos o viven toda la partida, el pool solo agrega código y errores de estado viejo (la chispa que reaparece donde murió). Se mide primero.' },
      { mito: 'Llamar <code>GC.Collect()</code> seguido evita el tirón.', real: 'En .NET fuerza una recolección completa, de todas las generaciones: el tirón queda garantizado. Si se usa, es en momentos controlados, como una pantalla de carga.' }
    ],

    slides: [
      { kind: 'portada', title: 'Gestión de memoria y optimización',
        lead: 'Semana 5 · Arquitectura de Videojuegos',
        full: [
          { ul: ['Dónde vive cada dato y quién lo limpia.', 'Por qué un juego que «está bien» da tirones.', 'Prestar y devolver en vez de crear y botar.'] },
          { pie: 'Recuerda: el ACA 1 cierra el domingo 27 de diciembre.' }
        ],
        nota: '2 minutos. La sesión se movió de día por Navidad: confirma que todos tienen la grabación disponible. Pregunta rápida: «¿a alguien le ha dado tirones un juego propio sin saber por qué?». Respuesta esperada: sí, y casi siempre lo atribuyen a la máquina.' },

      { kind: 'reto', title: 'El misterio del tirón cada 3 segundos',
        lead: 'Turno Nocturno ya en Unity, a 60 fps. Cada 3 segundos, más o menos, se congela un instante.',
        izq: 38,
        left: [{ check: { q: '¿Quién es el sospechoso principal?', opts: ['La tarjeta gráfica', 'El recolector de basura, limpiando lo que el juego crea en cada frame', 'El teclado', 'Los bichos tipo tanque'], ok: 1, why: 'Un tirón periódico que no depende de lo que pasa en pantalla huele a memoria: objetos pequeños en cada frame que alguien tiene que parar a limpiar.' } }],
        right: [{ fig: 'tiron' }],
        nota: '4 minutos. Primero la figura: cambia entre 30, 60 y sin bichos. Pregunta: «¿qué cambia y qué no?». Respuesta esperada: el frame normal baja, pero los picos siguen cada 3 s. Luego votan. Casi nadie elige el recolector la primera vez. No expliques aún: al final lo demuestran con números. En la versión de consola hay otro culpable: Console.Beep() bloquea el hilo unos 200 ms.' },

      { kind: 'analogia', title: 'La mesa de trabajo y la bodega',
        izq: 52,
        left: [{ fig: 'mesaBodega' }],
        right: [
          { mapa: [['La mesa', 'Stack<small>variables locales, también los struct locales</small>'], ['Se limpia sola al terminar la tarea', 'Se libera al retornar la función'], ['La bodega', 'Heap<small>objetos de class, arreglos y lo que vive dentro de ellos</small>'], ['El papelito con el estante', 'Una referencia']], de: 'Taller', a: 'Memoria', pasos: true }
        ],
        nota: '5 minutos. Crea dos chispas y una variable, luego «La función termina»: la mesa queda limpia y las chispas quedan como basura. Pregunta: «¿dónde viven enemX y balasX de Program.cs?». Respuesta: son listas, así que en la bodega; la variable estática solo guarda el papelito. Precisión: un struct dentro de un objeto o arreglo vive en el heap con su dueño.' },

      { kind: 'reto', title: 'Predice: copiar un valor o una dirección',
        izq: 40,
        left: [{ check: { q: '¿Qué imprimen las dos líneas marcadas con «?»?', opts: ['1 y 1', '99 y 99', '1 y 99', '99 y 1'], ok: 2, why: 'Copiar un struct copia el dato: a sigue en 1. Copiar una variable de clase copia el papelito: c y d apuntan al mismo objeto, que ahora vale 99.' } }],
        right: [{ code: [{ lang: 'C#', src: sStruct }], marca: [
          { l: [11, 12], t: 'Dos tipos casi idénticos. Solo cambia <code>struct</code> por <code>class</code>.' },
          { l: [2, 3, 4], t: '<b>b es otra copia.</b> Cambiarla no toca a: imprime 1.' },
          { l: [7, 8, 9], t: '<b>d y c son dos papelitos</b> con la misma dirección: imprime 99.' }
        ] }],
        nota: '5 minutos. Que escriban la respuesta en el chat antes del clic. Respuesta: 1 y 99. Error esperado: «99 y 99». Luego recorre las marcas. Detalle de C#: en un programa con instrucciones de nivel superior, los tipos van al final del archivo, por eso están abajo.' },

      { kind: 'demo', title: 'Copia el valor, copia la dirección',
        izq: 50,
        left: [{ fig: 'copia' }],
        right: [{ code: [{ lang: 'Unity', label: 'Unity: Vector3 es un struct', src: sStructUnity }], marca: [
          { l: [3], t: '<code>position</code> entrega una <b>copia</b>: cambiarle la x no cambiaría nada, por eso no compila.' },
          { l: [5, 6, 7], t: 'Copia, cambia y <b>devuelve</b> el valor completo.' },
          { l: [9, 10], t: '<code>new</code> de un struct <b>no ensucia</b> el heap; <code>new</code> de una class sí.' }
        ] }],
        nota: '4 minutos. En la figura: struct, b = a, b.X = 99. Luego class y lo mismo. Pregunta: «¿por qué transform.position.x = 5 no compila?». Respuesta esperada: position devuelve una copia de un struct; cambiarla se perdería, y C# lo prohíbe (error CS1612).' },

      { kind: 'analogia', title: 'El aseador que detiene la fiesta',
        izq: 58,
        left: [{ fig: 'aseador' }],
        right: [
          { mapa: [['El aseador', 'El recolector de basura'], ['Todos quietos mientras barre', 'El tirón: un frame larguísimo'], ['Ensuciar en cada ronda', '<code>new</code>, textos con <code>+</code> o LINQ en el bucle']], de: 'Fiesta', a: 'Juego', pasos: true },
          { clave: 'El recolector no es el problema. Darle trabajo 60 veces por segundo, sí.', paso: true }
        ],
        nota: '6 minutos. Con 20 objetos por frame: una pausa cada 3 segundos, el misterio del inicio. Sube a 60: las pausas se acercan. Baja a 0. Pregunta: «¿qué es mejor, un aseador más rápido o no ensuciar?». Respuesta: no ensuciar. Precisión: .NET es generacional (barrer lo recién creado es barato); Unity usa Boehm, no generacional, y su modo incremental reparte el barrido en varios frames, pero no lo elimina.' },

      { kind: 'antipatron', title: 'Dibujar ensuciando: antes y después',
        top: true,
        full: [
          { compare: { a: { label: 'Antes: más de 800 objetos por frame', lang: 'C#', src: basuraAntes }, b: { label: 'Después: nada nuevo por frame', lang: 'C#', src: sBasuraDespues } } }
        ],
        nota: '6 minutos. Que encuentren los cuatro focos de la izquierda antes de leer los comentarios. Pregunta: «¿de dónde sale el 800?». Respuesta: 40 columnas por 20 filas, y cada += crea un string nuevo. Es un conteo de asignaciones, no una medición. La idea: pedir una vez afuera del bucle, reutilizar adentro. El HUD se arregla igual: rearmar el texto solo cuando cambian los puntos.' },

      { kind: 'reto', title: 'Basura escondida: ¿qué línea asigna?',
        lead: 'Siete líneas dentro de <code>Update</code>, 60 veces por segundo. Toca las que crees que piden memoria nueva.',
        top: true,
        full: [{ fig: 'focos' }],
        nota: '6 minutos. Pide que primero voten en el chat con números (por ejemplo 2, 3, 5, 6) y luego toquen línea por línea. Respuesta: asignan la 2 (string), la 3 (boxing), la 5 (closure que captura dano) y la 6 (iterador de Where). Sorpresa típica: el foreach sobre List&lt;T&gt; no asigna. Pregunta de cierre: «¿cómo arreglarían la 2?». Respuesta: rearmar el texto solo cuando cambian los puntos.' },

      { kind: 'demo', title: 'Míralo pasar: basura, aseador y tirones',
        lead: 'Arriba, la memoria que se llena. Abajo, el tiempo de cada frame contra el presupuesto de 16,7 ms.',
        top: true,
        full: [{ fig: 'basura' }],
        nota: 'Simulación: los milisegundos son ilustrativos; la forma de la curva, picos periódicos que desaparecen al dejar de asignar, es la real. 7 minutos. 1) Con 20 objetos por frame, cuenten cada cuánto hay pico. 2) Suban el deslizador. Pregunta: «¿los picos se hacen más altos o más seguidos?». Respuesta: más seguidos. 3) Activen «Usar pool»: curva plana.' },

      { kind: 'analogia', title: 'C++: quien alquila, devuelve',
        izq: 52,
        left: [{ fig: 'llave' }],
        right: [
          { mapa: [['Alquilar la habitación', '<code>new</code>'], ['Devolver la llave', '<code>delete</code>'], ['Irse sin devolver', 'Fuga de memoria'], ['La llave que vuelve sola', '<code>std::unique_ptr</code>']], de: 'Hotel', a: 'C++', pasos: true }
        ],
        nota: '5 minutos. Primero «new y delete»: alquila y sal por el return temprano tres o cuatro veces hasta llenar el hotel. Luego «unique_ptr» y lo mismo. Pregunta: «¿qué gana C++ al no tener aseador?». Respuesta: ninguna pausa que tú no decidas; a cambio, la responsabilidad es tuya. Por ese control, el núcleo de motores como Unity y Unreal está en C++.' },

      { kind: 'reto', title: 'Predice: errores que compilan',
        izq: 40,
        left: [{ check: { q: '¿Cuántos errores de memoria tiene esta función?', opts: ['Ninguno: compila', 'Uno: falta un delete', 'Dos: una fuga en el return y un uso después del delete', 'Tres: además new es ilegal en C++ moderno'], ok: 2, why: 'El return temprano se va sin devolver (fuga). La última línea usa la textura después del delete (puntero colgante, comportamiento indefinido). Las dos compilan sin quejarse.' } }],
        right: [{ code: [{ lang: 'C++', label: 'C++ (a mano)', src: sCppMal }, { lang: 'C++', label: 'C++ (unique_ptr)', src: cppBien }, { lang: 'C++', label: 'C++ (mover la llave)', src: sCppMover }], marca: [
          { l: [2], t: '<b>Alquila</b> una habitación en la bodega.' },
          { l: [4, 5], t: '<b>Fuga:</b> sale sin devolver. Nadie más tiene la dirección.' },
          { l: [8, 10], t: '<b>Puntero colgante:</b> devuelve y sigue usando la dirección.' }
        ] }],
        nota: '6 minutos. Votan, luego marcas, luego la pestaña unique_ptr: ninguno de los dos errores se puede escribir por accidente. Tercera pestaña: un unique_ptr no se copia, se mueve con std::move. Pregunta: «¿qué pasa si hago auto copia = jefe?». Respuesta: no compila; una llave, un dueño. Vocabulario: -> es «el punto» de los punteros y *fondo es «lo que hay en esa dirección».' },

      { kind: 'analogia', title: 'Object Pool: los zapatos de la bolera',
        izq: 58,
        left: [{ fig: 'bolera' }],
        right: [
          { mapa: [['Comprar los pares al abrir', 'Crear los objetos al cargar'], ['Prestar un par', '<code>Tomar()</code>'], ['Devolverlo al estante', '<code>Devolver()</code>'], ['Desinfectar antes de prestar', 'Reiniciar el objeto']], de: 'Bolera', a: 'Juego', pasos: true }
        ],
        nota: '4 minutos. Primero «Fabricar y botar» con «Llegan 10». Luego «Prestar y devolver»: 6 pares para cualquier cantidad de clientes. Marca «Olvidar desinfectar». Pregunta: «¿qué objetos de Turno Nocturno nacen y mueren todo el tiempo?». Respuesta: chispas, bichos y baterías. «¿Y cuál no vale la pena?». El robot: hay uno y vive toda la partida.' },

      { kind: 'codigo', title: 'Un pool en 16 líneas',
        izq: 38,
        left: [{ check: { q: 'Tomas una chispa del pool y olvidas reiniciar su posición. ¿Qué pasa?', opts: ['Nada: el pool la reinicia solo', 'Aparece donde murió la vez anterior, arriba de la pantalla', 'Error de compilación', 'El pool crea una chispa nueva'], ok: 1, why: 'Un objeto del pool llega con los datos de su vida anterior. Es el error clásico: olvidar desinfectar los zapatos.' } }],
        right: [{ code: [{ lang: 'C#', src: sPool }, { lang: 'Unity', src: sPoolUnity }, { lang: 'C++', src: sPoolCpp }], marca: [
          { l: [3], t: '<b>El estante:</b> una pila de objetos libres.' },
          { l: [9], t: 'Los pares <b>se compran al abrir</b>, al cargar el nivel.' },
          { l: [12, 13], t: '<b>Tomar:</b> presta uno; solo crea si el estante quedó vacío.' },
          { l: [15], t: '<b>Devolver:</b> vuelve al estante. Nada va a la basura.' }
        ] }],
        nota: '8 minutos. Votan: respuesta, aparece donde murió. En Unity no hay que escribirlo: ObjectPool&lt;T&gt; pide cuatro funciones y, en el Editor, avisa si devuelves dos veces. En C++ no hay objetos sueltos: un vector reservado una vez y una lista de índices libres. Pregunta: «¿dónde vive el pool de bichos?». Respuesta: dentro de la fábrica de la semana 4; quien pide un bicho no se entera.' },

      { kind: 'antipatron', title: 'Las chispas, antes y después del pool',
        top: true,
        full: [{ compare: { a: { label: 'Antes: un new por disparo', lang: 'C#', src: chispasAntes }, b: { label: 'Después: prestar y devolver', lang: 'C#', src: sChispasDespues } } }],
        nota: '4 minutos. Ojo: el Program.cs original usa listas de int para las chispas y eso no crea objetos por disparo; el new aparece cuando el rescate pasa a objetos Chispa. El pool permite tener objetos sin pagar basura. Pregunta: «¿qué pasa si devuelvo la misma chispa dos veces?». Respuesta: el pool la presta a dos dueños a la vez.' },

      { kind: 'demo', title: 'Dispara y cuenta: crear contra reutilizar',
        lead: 'Mantén presionado «Disparar» o toca el recuadro. Compara los contadores con el pool apagado y encendido.',
        top: true,
        full: [{ fig: 'pool' }],
        nota: '6 minutos. Primero sin pool: crece «new» y la basura en coral hasta que pasa el recolector. Luego con pool: las 24 casillas se encienden y apagan, pero nunca se crean más. Pregunta: «¿qué pasa si el pool se queda sin casillas?». Respuesta: es decisión de diseño; crecer, no disparar o reciclar la más vieja.' },

      { kind: 'industria', title: 'En juegos reales: memoria bajo control',
        full: [
          { juegos: [
            { j: 'Unity', t: 'Desde 2021 trae <code>ObjectPool&lt;T&gt;</code> en <code>UnityEngine.Pool</code>: el pool de hoy, ya hecho.', src: 'Scripting API de Unity: «UnityEngine.Pool».' },
            { j: 'Unity', t: 'Recolector Boehm con modo incremental: reparte el barrido en varios frames para bajar el pico.', src: 'Manual de Unity: «Incremental garbage collection».' },
            { j: 'Insomniac Games', t: 'Mike Acton: diseñar alrededor de los datos y de cómo los recorre el hardware.', src: 'CppCon 2014, «Data-Oriented Design and C++».' }
          ], pasos: true },
          { clave: 'Los motores ya traen las herramientas. Saber cuándo usarlas sigue siendo tu trabajo.', paso: true }
        ],
        nota: '3 minutos. Revela un caso a la vez. Pregunta: «¿el modo incremental hace que la basura sea gratis?». Respuesta esperada: no; reparte el mismo trabajo para que no caiga en un solo frame. El tercer caso abre el siguiente tema: la localidad de datos.' },

      { kind: 'analogia', title: 'Localidad: el mercado por pasillos',
        izq: 58,
        left: [{ fig: 'pasillos' }],
        right: [
          { mapa: [['La tienda', 'La memoria'], ['Lista revuelta', 'Lista de objetos de clase<small>direcciones regadas por el heap</small>'], ['Lista por pasillos', 'Arreglo de structs<small>un solo bloque, uno tras otro</small>'], ['Lo que ya tienes en el carrito', 'La caché de la CPU']], de: 'Mercado', a: 'CPU', pasos: true }
        ],
        nota: '4 minutos. Haz el mercado con las dos listas y compara los pasos (ilustrativos). Pregunta: «¿por qué la lista por pasillos gana?». Respuesta: lo que necesitas después está al lado de lo que ya recogiste. Advierte: solo importa con muchos objetos; para 20 bichos da igual. La siguiente slide lo muestra en la memoria de verdad.' },

      { kind: 'codigo', title: 'Localidad en la memoria de verdad',
        izq: 54,
        left: [{ fig: 'layout' }],
        right: [{ code: [{ lang: 'C#', src: sLocalidad }], marca: [
          { l: [2, 5, 6], t: '<b>Lista de clases:</b> guarda direcciones. Cada <code>Y</code> está en otro rincón del heap.' },
          { l: [3, 7, 8], t: '<b>Arreglo de structs:</b> 12 bytes por bicho, uno tras otro. Una línea de caché trae cinco.' },
          { l: [10, 11], t: '<b>La trampa:</b> con <code>List&lt;BichoS&gt;</code> el indexador entrega una copia y no compila.' }
        ] }],
        nota: '6 minutos. En la figura, recorre con el arreglo de structs y luego con la lista de objetos: compara las líneas traídas de la RAM. Caché de juguete de 2 líneas; una real guarda miles, pero la comparte todo el juego. Pregunta: «¿por qué juntos[i].Y += ... sí compila?». Respuesta: el arreglo entrega el elemento mismo, no una copia. Es la puerta al ECS de la semana 6.' },

      { kind: 'idea', title: '16,7 ms para todo',
        izq: 58,
        left: [{ fig: 'presupuesto' }],
        right: [{ check: { q: 'Mides: lógica 2 ms, dibujo 11 ms, sonido 0,3 ms. ¿Qué optimizas primero?', opts: ['El sonido: Console.Beep se ve feo', 'La lógica: es lo más importante', 'Todo a la vez', 'El dibujo: se lleva casi todo el presupuesto'], ok: 3, why: 'Se ataca lo que más pesa según la medición. Mejorar mucho algo de 0,3 ms no se nota; mejorar un poco lo de 11 ms, sí.' } }],
        nota: '5 minutos. A 60 fps cada frame tiene 1000 / 60 = 16,7 ms para entrada, lógica, dibujo y limpieza. En la figura sube el dibujo hasta pasarte y luego activa el recolector con todo dentro del presupuesto: él solo produce el tirón. Votan: respuesta, el dibujo. Las cifras son ilustrativas.' },

      { kind: 'codigo', title: 'Medir antes de optimizar',
        izq: 34,
        left: [
          { big: 'Primero el examen, después la receta.' },
          { clave: 'Medir, cambiar <b>una</b> cosa, volver a medir.', paso: true }
        ],
        right: [{ code: [{ lang: 'C#', src: sMedir }, { lang: 'Unity', label: 'Unity (Profiler)', src: sMedirUnity }], marca: [
          { l: [1, 2, 3], t: '<b>Foto del antes:</b> bytes pedidos, pasadas del recolector y un cronómetro.' },
          { l: [5, 6, 7, 8, 9], t: '<b>Mil frames</b> del juego, sin la consola de por medio.' },
          { l: [11, 12, 13], t: '<b>La diferencia</b> es lo que costaron esos mil frames.' },
          { l: [14, 15, 16], t: '<b>Tres números</b>: el «antes» de tu ACA 2.' }
        ] }],
        nota: '7 minutos. GC.GetTotalAllocatedBytes existe desde .NET Core 3.0; el argumento true pide el dato preciso. En Unity: Profiler, módulo CPU, columna GC Alloc; meta de 0 B por frame en pleno juego. Pregunta: «¿por qué cambiar una sola cosa entre mediciones?». Respuesta: para saber cuál cambio produjo la mejora.' },

      { kind: 'actividad', title: 'Caza de basura · 12 minutos',
        lead: 'En parejas, abran <code>Program.cs</code> y busquen <b>tres</b> asignaciones que ocurren en cada frame.',
        izq: 56,
        left: [{ ol: ['Anoten línea, qué se crea y cuántas veces por frame.', 'Propongan cómo eliminarla: sacar del bucle, arreglo fijo, pool o <code>for</code> en vez de LINQ.', 'Ordénenlas: ¿cuál atacan primero y con qué medición?'], pasos: true }],
        right: [{ panel: [{ ul: ['<code>new</code> dentro del <code>while</code>', '<code>+</code> entre textos', 'El texto del HUD'] }], h: 'Pistas' }],
        nota: '12 minutos en salas de 2 o 3. Respuestas esperadas: la new List&lt;string&gt; del dibujo, la concatenación fila + c en cada casilla (800 por frame) y el texto del HUD rearmado cada frame. Al volver, cada pareja dice su número uno en 30 segundos. Es insumo del ACA 2 y puede entrar como sección de memoria en el ACA 1.' },

      { kind: 'cierre', title: 'Lo que te llevas hoy',
        full: [
          { ol: ['<b>Cada <code>new</code> en el bucle es basura futura.</b> En C# la pagas con tirones; en C++, con fugas.', '<b>Prestar y devolver.</b> Un pool pide la memoria una vez; los datos juntos se recorren más rápido.', '<b>Primero el examen.</b> 16,7 ms por frame, y se optimiza lo que la medición señala.'], pasos: true },
          { p: 'Ahora: <a href="quiz.html?s=5">quiz de la clase</a>. Tarea: agrega al plano la sección «Memoria» y mide <code>Dibujar</code>. El ACA 1 cierra el domingo 27 de diciembre.', paso: true }
        ],
        nota: '3 minutos. Pregunta de salida: «¿cuál es la primera asignación por frame que vas a quitar de Turno Nocturno?». Repite la fecha del ACA 1 y deja el enlace de entrega en el chat. Las mediciones de hoy son el «antes» del ACA 2. Felices fiestas: la próxima sesión también se mueve de día.' }
    ],

    quiz: [
      { tema: 'Stack y heap', q: 'En C#, ¿dónde vive el objeto creado con <code>new Enemigo()</code> si <code>Enemigo</code> es una <code>class</code>?', opts: ['En el heap, y la variable guarda una referencia a él', 'En el stack, junto a la variable', 'En el disco duro', 'En la caché de la CPU'], ok: 0, why: 'Los objetos de clase viven en el heap. La variable solo guarda la dirección. Por eso copiar la variable no copia el objeto.' },
      { tema: 'Valor y referencia', q: '<code>Punto</code> es un <code>struct</code>. Después de <code>var b = a; b.X = 99;</code>, ¿qué vale <code>a.X</code>?', opts: ['99', 'Da error de compilación', 'Lo que valía antes: b es una copia independiente', 'Cero'], ok: 2, why: 'Asignar un struct copia el valor completo. Cambiar la copia no afecta al original.' },
      { tema: 'Recolector', q: '¿Por qué un juego en C# puede dar un tirón periódico aunque su lógica sea correcta?', opts: ['Porque C# es un lenguaje interpretado', 'Porque crea objetos en cada frame y el recolector de basura tiene que parar a limpiarlos', 'Porque el delta time es muy pequeño', 'Porque usa demasiadas interfaces'], ok: 1, why: 'Las asignaciones por frame se acumulan como basura. Cuando el recolector corre, consume tiempo del frame. La solución de fondo es no generar basura durante el juego.' },
      { tema: 'Basura por frame', q: '¿Cuál de estas líneas, dentro del bucle del juego, NO genera basura para el recolector?', opts: ['<code>var lista = new List&lt;int&gt;();</code>', '<code>string t = "Puntos: " + puntos;</code>', '<code>var vivos = bichos.Where(b =&gt; b.Vida &gt; 0).ToList();</code>', '<code>pantalla[i] = simbolo;</code> sobre un arreglo creado una vez antes del bucle'], ok: 3, why: 'Escribir en un arreglo que ya existe no pide memoria nueva. Las otras tres crean objetos en el heap en cada frame.' },
      { tema: 'Basura escondida', q: '<code>bichos</code> es un <code>List&lt;Bicho&gt;</code>. ¿Cuál de estos recorridos, ejecutado en cada <code>Update</code>, NO pide memoria nueva?', opts: ['<code>foreach (var b in (IEnumerable&lt;Bicho&gt;)bichos) b.Mover(dt);</code>', '<code>foreach (var b in bichos) b.Mover(dt);</code>', '<code>bichos.Where(b =&gt; b.Vida &gt; 0).ToList().ForEach(b =&gt; b.Mover(dt));</code>', '<code>foreach (var b in bichos.ToArray()) b.Mover(dt);</code>'], ok: 1, why: 'Sobre un List&lt;T&gt;, foreach usa List&lt;T&gt;.Enumerator, que es un struct: no va al heap. Recorrerlo como IEnumerable&lt;T&gt; encajona el enumerador, y Where, ToList y ToArray crean objetos nuevos.' },
      { tema: 'C++ y RAII', q: '¿Qué ventaja da <code>std::unique_ptr</code> frente a usar <code>new</code> y <code>delete</code> a mano?', opts: ['Hace el programa más lento pero más corto', 'Activa un recolector de basura en C++', 'Libera la memoria automáticamente cuando su dueño sale del bloque, incluso si hay un return temprano', 'Permite que varios dueños borren el mismo objeto'], ok: 2, why: 'Es RAII: la devolución queda amarrada a la vida del objeto dueño. No hay delete que olvidar ni return que lo salte. Y no hay recolector: se libera en un momento exacto y conocido.' },
      { tema: 'C++ y RAII', q: 'Tienes <code>auto jefe = std::make_unique&lt;Jefe&gt;();</code> y quieres guardarlo en <code>std::vector&lt;std::unique_ptr&lt;Jefe&gt;&gt; jefes</code>. ¿Qué pasa con <code>jefes.push_back(jefe);</code>?', opts: ['No compila: un unique_ptr no se copia; hay que escribir <code>jefes.push_back(std::move(jefe));</code>', 'Compila y ahora hay dos dueños del jefe', 'Compila, pero el jefe se borra al instante', 'Compila y el vector hace una copia del jefe'], ok: 0, why: 'unique_ptr tiene un solo dueño, así que su copia está prohibida. std::move pasa la llave al vector y jefe queda vacío (nullptr). Si de verdad necesitas varios dueños, existe std::shared_ptr.' },
      { tema: 'Object Pool', q: 'En un pool de chispas, ¿qué debe hacerse siempre al tomar una chispa?', opts: ['Reiniciar su estado (posición, velocidad, activa), porque viene con los datos de su uso anterior', 'Crear una copia con <code>new</code>', 'Llamar al recolector de basura', 'Nada: el pool la entrega como recién creada'], ok: 0, why: 'El objeto se reutiliza tal como quedó. Olvidar reiniciarlo es el error más común de los pools.' },
      { tema: 'Localidad', q: 'Debes actualizar 10.000 partículas por frame. ¿Qué organización suele recorrerse más rápido y por qué?', opts: ['Un <code>List&lt;Particula&gt;</code> de objetos de clase, porque el recolector los ordena', 'Un arreglo de structs <code>Particula[]</code>, porque están contiguas y cada línea de caché trae varias vecinas', 'Da igual: la CPU lee toda la memoria a la misma velocidad', 'Un <code>Dictionary&lt;int, Particula&gt;</code>, porque busca por clave'], ok: 1, why: 'La CPU trae la memoria en líneas a su caché. Con datos contiguos, al leer una partícula ya llegaron las siguientes. Con objetos regados por el heap, casi cada lectura es un viaje a la RAM.' },
      { tema: 'Medir', q: 'Sospechas que el juego va lento por la física. ¿Cuál es el primer paso correcto?', opts: ['Reescribir la física en C++', 'Meter todo en un pool', 'Bajar la resolución', 'Medir con un cronómetro o un profiler dónde se va el tiempo del frame'], ok: 3, why: 'Primero el examen, luego la receta. Sin medir puedes pasar una semana optimizando algo que pesaba 0,3 ms.' }
    ]
  };
})();
