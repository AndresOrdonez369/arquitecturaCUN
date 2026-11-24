/* Grafo de temas de cada clase: se muestra al abrir la clase y otra vez antes del cierre.
   nodo: [id, título, subtítulo, tipo, resumen]  ·  tipo: idea | patron | codigo | practica | riesgo
   cable: [desde, hasta, 'datos' | 'evento' | 'llamada']  (va de lo que se necesita primero a lo que se construye encima) */
window.TEMARIOS = {
  1: {
    titulo: 'Hoy armamos este grafo', lead: 'Siete temas. Un cable va de lo que necesitas primero a lo que se construye encima.',
    nodos: [
      ['costo', 'Costo del cambio', 'qué mide la arquitectura', 'idea', 'Un juego bien armado se mide por lo que cuesta cambiarlo: el cambio número 20 debería costar casi lo mismo que el primero.'],
      ['piezas', 'Piezas y conexiones', 'la cocina por estaciones', 'idea', 'Arquitectura es decidir en qué piezas se divide el juego y por dónde se hablan. Estaciones con una tarea, no una olla.'],
      ['loop', 'Game loop', 'entrada · actualizar · dibujar', 'codigo', 'El latido del juego: decenas de veces por segundo lee la entrada, avanza el mundo y dibuja. Dibujar nunca cambia el estado.'],
      ['dt', 'Delta time', 'velocidad × dt', 'codigo', 'Multiplicar el movimiento por los segundos del último frame hace que el juego avance igual a 30 o a 144 fps.'],
      ['fijo', 'Paso fijo', 'el vaso y los tragos', 'codigo', 'La física avanza en pasos iguales acumulando el tiempo real. En Unity: FixedUpdate.'],
      ['capas', 'Capas del motor', 'el edificio por pisos', 'idea', 'Cada capa usa las de abajo y no conoce las de arriba. Unity y Unreal te dan los pisos bajos; tu juego es el último.'],
      ['olores', 'Caza de olores', 'Turno Nocturno', 'practica', 'En parejas encuentran tres lugares de Program.cs que harían caro agregar un bicho nuevo. Es el insumo del ACA 1.']
    ],
    cables: [['costo', 'piezas', 'llamada'], ['piezas', 'capas', 'llamada'], ['loop', 'dt', 'datos'], ['dt', 'fijo', 'datos'], ['loop', 'capas', 'llamada'], ['capas', 'olores', 'llamada'], ['fijo', 'olores', 'datos']]
  },
  2: {
    lead: 'De medir el enredo a partir el juego en piezas que se cambian solas.',
    nodos: [
      ['acop', 'Acoplamiento', 'el enchufe de pared', 'idea', 'Cuánto sabe una pieza de las otras. Poco acoplamiento: cambias una sin abrir las demás.'],
      ['cohe', 'Cohesión', 'cajones ordenados', 'idea', 'Qué tan relacionado está lo que vive junto. Alta cohesión: cada clase tiene una sola razón para cambiar.'],
      ['inter', 'Interfaces', 'contratos entre piezas', 'codigo', 'La forma del enchufe: quien usa la pieza depende del contrato, no de la clase concreta.'],
      ['solid', 'SOLID: S, O y D', 'una razón · abierto · invertir', 'patron', 'Una responsabilidad por clase, extender sin modificar y depender de abstracciones.'],
      ['her', 'Herencia que explota', 'árboles de clases', 'riesgo', 'Cada combinación nueva pide una subclase: BichoVoladorRápidoQueDispara. El árbol crece sin control.'],
      ['comp', 'Composición', 'el patrón Componente', 'patron', 'El objeto tiene piezas (movimiento, vida, ataque) en lugar de ser un tipo. Así arma Unity sus GameObject.'],
      ['partir', 'Partir Turno Nocturno', 'lista de módulos', 'practica', 'Se propone en qué módulos se divide el juego y qué contrato hay entre ellos. Prepara el quiz-parcial y el ACA 1.']
    ],
    cables: [['acop', 'inter', 'llamada'], ['cohe', 'solid', 'llamada'], ['inter', 'solid', 'datos'], ['her', 'comp', 'evento'], ['inter', 'comp', 'datos'], ['solid', 'partir', 'llamada'], ['comp', 'partir', 'llamada']]
  },
  3: {
    lead: 'Tres patrones para que el juego cambie de comportamiento y avise lo que pasa sin cadenas de if.',
    nodos: [
      ['bools', 'Booleanos sueltos', '4 banderas, 16 combinaciones', 'riesgo', 'pausa, menu, gameOver, gano: cuatro booleanos permiten 16 combinaciones y solo 5 tienen sentido.'],
      ['state', 'State', 'el semáforo', 'patron', 'El objeto está en un solo estado a la vez y cada estado decide a cuál pasa.'],
      ['observer', 'Observer', 'la campana de la cocina', 'patron', 'Quien produce el evento avisa; quienes escuchan reaccionan sin que el emisor los conozca.'],
      ['command', 'Command', 'la comanda del mesero', 'patron', 'La acción se vuelve un objeto: se guarda, se encola, se deshace y se repite.'],
      ['undo', 'Deshacer y repetir', 'grabar comandos', 'codigo', 'Con comandos guardados se puede deshacer, reproducir una partida y probar con la misma secuencia.'],
      ['fsm', 'Estados de Turno Nocturno', 'Menú · Jugando · Pausa · Fin', 'practica', 'Se dibuja la máquina de estados del juego con el evento que dispara cada transición. Va al ACA 1.']
    ],
    cables: [['bools', 'state', 'evento'], ['state', 'observer', 'evento'], ['state', 'fsm', 'llamada'], ['observer', 'fsm', 'evento'], ['command', 'undo', 'datos'], ['undo', 'fsm', 'llamada']]
  },
  4: {
    lead: 'Agregar contenido sin tocar el código que ya funciona: fabricar, intercambiar y leer datos.',
    nodos: [
      ['ifs', 'Un if por tipo', 'el código que crece', 'riesgo', 'Cada bicho nuevo agrega un if en cinco lugares: nacer, mover, puntuar, dibujar y morir.'],
      ['fab', 'Factory', 'el único que hace new', 'patron', 'Un solo lugar sabe construir bichos; el resto los pide por nombre.'],
      ['strat', 'Strategy', 'puntas de destornillador', 'patron', 'El comportamiento se intercambia sin cambiar la clase. Alguien de afuera elige la punta.'],
      ['svs', 'State o Strategy', '¿quién decide el cambio?', 'idea', 'Se escriben igual. En State decide el propio estado; en Strategy decide alguien de afuera.'],
      ['single', 'Singleton', 'una variable global', 'riesgo', 'Cómodo y peligroso: todo el juego queda amarrado a una clase concreta.'],
      ['loc', 'Service Locator', 'la recepción del hotel', 'patron', 'Pides el servicio por su contrato; si nadie se registró, atiende un objeto mudo.'],
      ['datos', 'Datos externos', 'JSON · Lua · ScriptableObject', 'codigo', 'Los números y los tipos salen del código a un archivo: se balancea sin recompilar.'],
      ['contrato', 'Contrato de datos', 'validar al cargar', 'practica', 'Se define qué campos tiene un bicho y una oleada, con rangos y valores por defecto. Va al ACA 1.']
    ],
    cables: [['ifs', 'fab', 'evento'], ['ifs', 'strat', 'evento'], ['strat', 'svs', 'llamada'], ['single', 'loc', 'evento'], ['fab', 'datos', 'datos'], ['datos', 'contrato', 'datos'], ['loc', 'contrato', 'llamada'], ['svs', 'contrato', 'llamada']]
  },
  5: {
    lead: 'Por qué un juego da tirones aunque el código esté bien, y cómo se arregla midiendo.',
    nodos: [
      ['tiron', 'El tirón', 'picos en el frame', 'riesgo', 'El juego corre fluido y cada tantos segundos se congela un instante. Casi siempre es memoria.'],
      ['medir', 'Medir primero', 'Profiler y cifras', 'idea', 'Sin el número del antes no hay mejora que demostrar. Se mide, se cambia y se vuelve a medir.'],
      ['pila', 'Stack y heap', 'la mesa y la bodega', 'idea', 'Lo local y corto vive en la pila; los objetos con new viven en el montón y alguien debe limpiarlos.'],
      ['valor', 'Valor y referencia', 'struct contra class', 'codigo', 'Copiar un struct copia los datos; copiar una referencia comparte el mismo objeto.'],
      ['gc', 'Recolector de basura', 'el aseador', 'idea', 'C# libera solo lo que nadie usa, pero lo hace cuando quiere, y eso puede caer en pleno frame.'],
      ['raii', 'RAII en C++', 'la llave que se devuelve', 'codigo', 'Sin recolector: el objeto libera su recurso al salir de su ámbito. unique_ptr dice quién es el dueño.'],
      ['pool', 'Object Pool', 'los zapatos de la bolera', 'patron', 'En lugar de crear y botar chispas, se prestan, se devuelven y se vuelven a usar.'],
      ['local', 'Localidad de datos', 'pasillos de la bodega', 'idea', 'Datos juntos en memoria se leen más rápido: arreglos de structs antes que listas de objetos sueltos.'],
      ['presu', 'Presupuesto de frame', '16,7 ms a 60 fps', 'practica', 'Se buscan las asignaciones por frame de Turno Nocturno y se reparte el presupuesto de tiempo.']
    ],
    cables: [['tiron', 'medir', 'evento'], ['pila', 'valor', 'datos'], ['valor', 'gc', 'datos'], ['pila', 'raii', 'llamada'], ['gc', 'pool', 'evento'], ['medir', 'pool', 'llamada'], ['valor', 'local', 'datos'], ['pool', 'presu', 'llamada'], ['local', 'presu', 'datos']]
  },
  6: {
    lead: 'Cómo crece un juego de 5 clases a 500 sin volverse un nudo.',
    nodos: [
      ['nudo', 'El nudo', 'todo depende de todo', 'riesgo', 'Con más contenido y más personas, cada cambio pisa el trabajo de otro.'],
      ['mod', 'Módulos', 'la ciudad por barrios', 'idea', 'Cada barrio resuelve lo suyo y se conecta con los demás por avenidas, no por los patios.'],
      ['dir', 'Dependencias al núcleo', 'las reglas en el centro', 'idea', 'Las flechas apuntan hacia las reglas del juego. Consola, disco y audio dependen del núcleo, no al revés.'],
      ['puertos', 'Puertos', 'interfaces en el borde', 'codigo', 'El núcleo declara lo que necesita (IAudio, IGuardado) y afuera se enchufa la implementación.'],
      ['bus', 'Bus de eventos', 'la radio del barrio', 'patron', 'Los módulos se avisan por un canal común sin conocerse. Ojo con las suscripciones que no se quitan.'],
      ['lua', 'Lua para mods', 'motor abajo, script arriba', 'codigo', 'El contenido que cambia a diario vive en scripts; el motor expone una API segura.'],
      ['ecs', 'ECS', 'la hoja de cálculo', 'patron', 'Entidades como filas, componentes como columnas y sistemas que recorren columnas. Paga con miles de entidades.'],
      ['nucleo', 'Separar el núcleo', 'Turno Nocturno sin Console', 'practica', 'Las reglas pasan a un proyecto que no conoce la consola. Es el arranque del ACA 2.']
    ],
    cables: [['nudo', 'mod', 'evento'], ['mod', 'dir', 'llamada'], ['dir', 'puertos', 'datos'], ['mod', 'bus', 'evento'], ['puertos', 'nucleo', 'llamada'], ['bus', 'nucleo', 'evento'], ['dir', 'lua', 'llamada'], ['mod', 'ecs', 'datos']]
  },
  7: {
    lead: 'Saber que el juego funciona hoy, que seguirá funcionando mañana, y qué hacer cuando no.',
    nodos: [
      ['regre', 'El bug que vuelve', 'regresiones', 'riesgo', 'Se arregla el puntaje doble y a la semana vuelve. Sin pruebas, nadie se entera hasta que lo ve un jugador.'],
      ['piram', 'Pirámide de pruebas', 'muchas unitarias, pocas lentas', 'idea', 'La base son pruebas pequeñas y rápidas de la lógica; arriba, pocas pruebas del juego completo.'],
      ['aaa', 'Prueba unitaria', 'Preparar · Actuar · Afirmar', 'codigo', 'Una prueba arma la escena, ejecuta una sola acción y comprueba el resultado. xUnit o Unity Test Framework.'],
      ['probable', 'Código que se deja probar', 'reloj y azar inyectados', 'idea', 'Si la lógica pide el reloj o el azar por constructor, la prueba le pasa unos falsos y controla todo.'],
      ['semilla', 'Determinismo', 'misma semilla, misma partida', 'codigo', 'Con la semilla y los comandos grabados la partida se repite igual en la misma build.'],
      ['flot', 'Punto flotante', 'no siempre repite', 'riesgo', 'Distinto compilador o CPU puede cambiar el último decimal y desviar una partida en red.'],
      ['detect', 'Depurar con método', 'el detective', 'idea', 'Reproducir, acotar, formular una hipótesis, probarla y dejar una prueba que vigile el arreglo.'],
      ['bisec', 'Bisección y registro', 'git bisect · logs · Profiler', 'codigo', 'Buscar por mitades el commit que rompió algo y registrar con niveles en lugar de adivinar.'],
      ['plan', 'Plan de pruebas', 'ocho pruebas para el ACA 2', 'practica', 'Se eligen las pruebas de estados, daño y pool que pide el ACA 2 y se escribe el informe de un bug.']
    ],
    cables: [['regre', 'piram', 'evento'], ['piram', 'aaa', 'llamada'], ['piram', 'probable', 'llamada'], ['aaa', 'plan', 'datos'], ['probable', 'semilla', 'datos'], ['semilla', 'flot', 'evento'], ['regre', 'detect', 'evento'], ['detect', 'bisec', 'llamada'], ['probable', 'plan', 'llamada'], ['bisec', 'plan', 'llamada']]
  },
  8: {
    titulo: 'Hoy cerramos el grafo', lead: 'Cuatro fases del curso, una demo y lo que te llevas al proyecto de grado.',
    nodos: [
      ['fund', 'Fundamentos', 'costo del cambio · composición', 'idea', 'Semanas 1 y 2: arquitectura es lo que cuesta cambiar; piezas con poco acoplamiento y mucha cohesión.'],
      ['patr', 'Patrones', 'State · Observer · Factory…', 'patron', 'Semanas 3 y 4: cada patrón responde a un síntoma concreto, no se pone por adorno.'],
      ['rend', 'Rendimiento y escala', 'pool medido · núcleo', 'codigo', 'Semanas 5 y 6: se mide antes de optimizar y las dependencias apuntan hacia las reglas.'],
      ['cal', 'Calidad', 'pruebas · depuración', 'codigo', 'Semana 7: lo que se deja probar está bien armado; depurar es un método.'],
      ['demo', 'Tu demo', 'cinco minutos, cinco paradas', 'practica', 'Problema, antes, decisión, después con una cifra y qué cambiarías.'],
      ['pm', 'Post-mortem', 'la repetición de la partida', 'idea', 'Qué salió bien, qué salió mal y qué harías distinto, sin culpables.'],
      ['yagni', 'Cuándo no usar un patrón', 'YAGNI', 'riesgo', 'Abstrae cuando el cambio llegue, no por si acaso: la sobreingeniería también cuesta.'],
      ['grado', 'Proyecto de grado', 'lista de chequeo', 'practica', 'Las ocho preguntas de arquitectura que te llevas para tu próximo juego.']
    ],
    cables: [['fund', 'patr', 'llamada'], ['fund', 'rend', 'llamada'], ['patr', 'cal', 'llamada'], ['rend', 'cal', 'llamada'], ['patr', 'yagni', 'evento'], ['cal', 'demo', 'datos'], ['cal', 'pm', 'evento'], ['demo', 'grado', 'llamada'], ['pm', 'grado', 'llamada'], ['yagni', 'grado', 'llamada']]
  }
};
