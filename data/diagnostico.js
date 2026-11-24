/* Quiz de conceptos previos · Semana 1 (se repite en la semana 8) · 10 preguntas, opción múltiple A-D, sin nota.
   Fuente única: lo usan quiz.html?s=diag (interactivo) y docs/quiz-diagnostico.html (imprimible). */
window.DIAGNOSTICO = {
  "titulo": "Quiz de conceptos previos",
  "quiz": [
    {
      "tema": "POO",
      "q": "En programación orientada a objetos, ¿cuál es la diferencia entre una clase y un objeto?",
      "opts": [
        "Son lo mismo con distinto nombre",
        "La clase es el molde y el objeto es una pieza concreta hecha con ese molde",
        "El objeto es el molde y la clase es la pieza",
        "La clase guarda los datos y el objeto guarda solo las funciones"
      ],
      "ok": 1,
      "why": "La clase describe qué datos y comportamientos tendrá algo; cada objeto es una instancia con sus propios valores. Un molde de galletas y cada galleta. En Lua no hay clases nativas: se imitan con tablas y metatablas, pero la idea es la misma.",
      "usa": "Semana 2"
    },
    {
      "tema": "Encapsulación",
      "q": "Una clase <code>Jugador</code> tiene el campo <code>vida</code>. ¿Qué opción respeta mejor la encapsulación?",
      "opts": [
        "Cualquier clase hace <code>jugador.vida = -50</code> cuando quiera",
        "Declarar <code>vida</code> como variable global",
        "<code>vida</code> es privada y solo cambia mediante <code>RecibirDanio(cantidad)</code>, que valida el valor",
        "Copiar <code>vida</code> en todas las clases que la necesiten"
      ],
      "ok": 2,
      "why": "Encapsular es que cada dato tenga un solo dueño que protege sus reglas. Nadie más puede dejar la vida en un valor imposible.",
      "usa": "Semana 2"
    },
    {
      "tema": "Herencia y composición",
      "q": "¿Qué frase describe una relación de composición y no de herencia?",
      "opts": [
        "Un <code>Jefe</code> es un <code>Enemigo</code>",
        "Una <code>Nave</code> tiene un <code>Motor</code>",
        "Un <code>Perro</code> es un <code>Animal</code>",
        "Un <code>Circulo</code> es una <code>Figura</code>"
      ],
      "ok": 1,
      "why": "Herencia responde \"es un\". Composición responde \"tiene un\": la nave está armada con piezas que se pueden cambiar.",
      "usa": "Semana 2"
    },
    {
      "tema": "Polimorfismo",
      "q": "En tu Breakout, cada tipo de ladrillo reacciona distinto al golpe. ¿Qué diseño usa polimorfismo?",
      "opts": [
        "Un <code>if</code> por cada tipo de ladrillo dentro del bucle de colisiones",
        "Una función global <code>golpear(tipo)</code> con un <code>switch</code> gigante",
        "Guardar el tipo en un texto y compararlo con <code>==</code> en cada golpe",
        "Cada subtipo de ladrillo define su propio <code>onHit()</code> y el bucle solo llama <code>ladrillo:onHit()</code>"
      ],
      "ok": 3,
      "why": "Con polimorfismo quien llama no pregunta de qué tipo es el objeto: cada objeto sabe responder. Agregar un tipo nuevo no toca el bucle.",
      "usa": "Semanas 2 y 4"
    },
    {
      "tema": "Game loop",
      "q": "Dentro de una vuelta del game loop (un frame), ¿cuál es el orden habitual del trabajo?",
      "opts": [
        "Leer entrada, actualizar el mundo, dibujar",
        "Leer entrada, dibujar, actualizar el mundo",
        "Actualizar el mundo, dibujar, y leer la entrada solo al cerrar el juego",
        "Actualizar y dibujar únicamente cuando el jugador presiona una tecla"
      ],
      "ok": 0,
      "why": "Primero se lee qué quiere el jugador, luego avanza la simulación y al final se muestra el resultado. Si se dibuja antes de actualizar, la pantalla va un frame atrasada. En LÖVE, cada vuelta procesa los eventos de teclado, llama a <code>love.update(dt)</code> y luego a <code>love.draw()</code>. Y el bucle corre siempre, haya o no teclas.",
      "usa": "Semana 1"
    },
    {
      "tema": "Delta time",
      "q": "¿Para qué se multiplica la velocidad por <code>dt</code> (delta time)?",
      "opts": [
        "Para que el juego corra a más fps",
        "Para ahorrar memoria",
        "Para que las colisiones sean más precisas en el dibujo",
        "Para que el movimiento sea igual en computadores rápidos y lentos"
      ],
      "ok": 3,
      "why": "<code>dt</code> es el tiempo que duró el frame. Velocidad × tiempo = distancia, así el objeto avanza lo mismo por segundo sin importar los fps.",
      "usa": "Semana 1"
    },
    {
      "tema": "Máquina de estados",
      "q": "Tu juego tiene las pantallas Título, Jugando, Pausa y Game Over. ¿Qué describe mejor una máquina de estados?",
      "opts": [
        "Cuatro variables booleanas independientes que se prenden y apagan",
        "Un bucle que dibuja las cuatro pantallas a la vez, una encima de otra",
        "Una lista con el historial de teclas presionadas",
        "Un conjunto de estados donde solo uno está activo y se pasa de uno a otro por transiciones definidas"
      ],
      "ok": 3,
      "why": "Solo un estado activo a la vez y transiciones con nombre. Con booleanos sueltos aparecen combinaciones imposibles, como estar en pausa y en Game Over.",
      "usa": "Semana 3"
    },
    {
      "tema": "Valor y referencia",
      "q": "<code>Enemigo</code> es una <code>class</code> en C# (o una tabla en Lua). Haces <code>b = a</code>, donde <code>a</code> es un enemigo, y luego <code>b.vida = 0</code>. ¿Qué pasa con <code>a.vida</code>?",
      "opts": [
        "También queda en 0: <code>a</code> y <code>b</code> apuntan al mismo objeto",
        "No cambia: <code>b</code> es una copia independiente",
        "Da error de compilación",
        "Queda en un valor aleatorio"
      ],
      "ok": 0,
      "why": "Las variables de objetos guardan una referencia (la dirección), no el objeto. Dos nombres, un solo enemigo. Ojo: si <code>Enemigo</code> fuera un <code>struct</code> de C#, sí se copiaría. De aquí salen muchos bugs y es la base de la clase de memoria.",
      "usa": "Semana 5"
    },
    {
      "tema": "UML",
      "q": "En un diagrama de clases UML, ¿qué significa una línea continua con un triángulo vacío en la punta, que va de <code>Jefe</code> a <code>Enemigo</code>?",
      "opts": [
        "<code>Enemigo</code> contiene muchos <code>Jefe</code>",
        "<code>Jefe</code> destruye a <code>Enemigo</code>",
        "<code>Jefe</code> hereda de <code>Enemigo</code>",
        "Las dos clases están en el mismo archivo"
      ],
      "ok": 2,
      "why": "El triángulo vacío apunta a la clase padre: es generalización, o sea herencia. Con línea punteada significaría que implementa una interfaz. El rombo relleno indica composición.",
      "usa": "ACA 1"
    },
    {
      "tema": "Depuración",
      "q": "El juego se cierra solo \"a veces\". ¿Cuál es el mejor primer paso?",
      "opts": [
        "Encontrar los pasos exactos que reproducen el cierre",
        "Reescribir el archivo más grande",
        "Cambiar cosas al azar hasta que deje de pasar",
        "Reinstalar el motor"
      ],
      "ok": 0,
      "why": "Sin poder reproducir el fallo no hay forma de saber si lo arreglaste. Primero la evidencia, después la hipótesis. Cambiar cosas al azar puede esconder el bug sin corregirlo.",
      "usa": "Semana 7"
    }
  ]
};
