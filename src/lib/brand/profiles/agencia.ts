// Perfil de marca: la agencia propia.
//
// Es una INSTANCIA de BrandProfile, no un caso especial. Para automatizar la
// cuenta de un cliente se escribe otro archivo como éste; la maquinaria
// (prompt.ts, normalize.ts, el crítico y los agentes) no se toca.
//
// Ver docs/nueva-marca.md para qué completar y en qué orden.

import type { BrandProfile } from "../types"

const PALETA = {
  ink: "#0A0A0A",
  paper: "#F4F4F0",
  accent: "#D9FF00",
  rule: "#0A0A0A",
} as const

const FUENTES = {
  display: "Archivo Black",
  body: "Archivo",
  mono: "JetBrains Mono",
} as const

// El styleCore se DERIVA de la paleta: cambiar un token lo reescribe, así el
// manual visual y lo que genera la IA no se pueden desincronizar.
const styleCore =
  `Brutalist graphic design. Stark, high-contrast, functional — it must read like a measuring instrument, NOT like an advertisement. ` +
  `Palette strictly limited to three flat colors: near-black ${PALETA.ink}, off-white ${PALETA.paper}, and acid lime ${PALETA.accent} used sparingly as the single accent. ` +
  `Typography is the main element: very large, tight, heavy grotesque headlines (like ${FUENTES.display}); all numbers, figures and labels set in a monospace face (like ${FUENTES.mono}). ` +
  `Hard 90-degree edges. Visible black rules and dividing lines. Asymmetric, grid-driven layout with generous empty space. ` +
  `ABSOLUTELY NO: gradients, glows, drop shadows, bevels, rounded corners, 3D effects, lens flares, glossy reflections, neon, textures, stock-photo backgrounds, or decorative icons. Flat color fills only.`

export const AGENCIA: BrandProfile = {
  id: "agencia",
  // TODO: nombre definitivo. Se propaga solo a todo el sistema.
  name: "NOMBRE_PENDIENTE",
  descriptor: "agencia de publicidad digital",
  registro: "voseo",
  mercados: ["Argentina"],

  posicionamiento: {
    tesis:
      "Una agencia de publicidad digital cuyo costo operativo es estructuralmente más bajo porque la operación corre sobre sistemas automatizados, no sobre horas de gente. El precio es la consecuencia de esa arquitectura.",

    nuevaOportunidad:
      "No es una agencia más barata: es otra forma de comprar el servicio. La agencia tradicional vende horas de gente y factura en proporción a cuánta gente te asigna. Acá se compra una operación corriendo, y el costo no escala con la dedicación. Eso cambia qué se puede pedir y a qué precio, no solo cuánto sale.",

    mecanismo:
      "En una agencia tradicional el costo es headcount: horas de personas armando campañas, cruzando datos y escribiendo reportes. Acá esas tres cosas las ejecutan agentes. Queda gente para lo que decide: la estrategia y el criterio sobre qué hacer con el número.",

    pruebaViva:
      "La cuenta propia es la demo del producto. El contenido que publica esta marca lo produce el mismo sistema que se le vende al cliente: si el sistema no sirve, se nota en el feed antes que en una propuesta.",
  },

  servicios: [
    {
      id: "campanas",
      nombre: "Campañas de publicidad digital",
      resuelve: "Estás invirtiendo en anuncios sin saber cuál de todos te trae plata.",
    },
    {
      id: "analytics",
      nombre: "Medición y analytics",
      resuelve: "Tenés datos en cinco tableros distintos y ninguno te dice qué hacer el lunes.",
    },
    {
      id: "creativos",
      nombre: "Producción de creativos",
      resuelve: "Producir variantes suficientes para testear en serio te sale más caro que la publicidad.",
    },
  ],

  // Arranca vacío a propósito: con el registro vacío el sistema puede explicar
  // el método pero no puede afirmar un solo resultado.
  pruebas: [],

  personas: [
    {
      id: "p1_dueno",
      nombre: "El dueño que paga la agencia",
      rol: "Fundador o dueño de una pyme con venta online o generación de leads",
      porQueEsTarget:
        "Firma el cheque de la agencia todos los meses y es el único que puede decidir cambiarla.",
      perfil:
        "30-50 años. Dueño o socio de una pyme que factura lo suficiente para invertir en publicidad de forma sostenida. No tiene equipo de marketing propio, o tiene una persona que hace de todo. Terceriza la publicidad en una agencia o un freelance.",
      maneja:
        "La plata de la empresa. Piensa en cuánto puso, cuánto volvió y cuánto tardó en volver. No piensa en CTR ni en CPM.",
      dolores: [
        "Paga un fee mensual y no tiene forma de saber si el trabajo que recibe lo justifica.",
        "La agencia le manda un reporte lleno de métricas que no le dicen si ganó o perdió plata.",
        "Cuando pregunta algo técnico recibe una respuesta que no entiende, y no sabe si es porque es complejo o porque lo están tapando.",
        "Le dijeron que hay que invertir más para que funcione, y no sabe si es verdad o si le están pidiendo más presupuesto.",
        "Cambió de agencia una o dos veces y el resultado fue parecido: sospecha que el problema es otro pero no sabe cuál.",
      ],
      yaSabe: [
        "Que hay que estar en Meta y Google.",
        "Que hay que medir y que existe el ROAS.",
        "Que hay que probar varios anuncios.",
        "Que la página tiene que cargar rápido y verse bien en el celular.",
        "Que el remarketing existe y sirve.",
      ],
      loDesvela:
        "Estar tirando plata todos los meses sin darse cuenta, y que la persona que le tendría que avisar sea justamente la que cobra por que eso siga pasando.",
      comoLoGanamos:
        "Dándole una pregunta concreta que pueda hacerle a su agencia actual y que revele si le están rindiendo bien. Criterio para auditar, no táctica para ejecutar.",
    },
    {
      id: "p2_marketing",
      nombre: "El responsable de marketing",
      rol: "Jefe o gerente de marketing en una empresa mediana",
      porQueEsTarget:
        "Es dueño del presupuesto de medios y elige proveedores, pero tiene que defender el gasto ante dirección.",
      perfil:
        "30-45 años. Maneja el presupuesto de marketing en una empresa donde ya hay estructura. Trabaja con una agencia o varias, y tiene que coordinarlas. Le reporta a un director o al dueño.",
      maneja:
        "El presupuesto de medios y el mix. Piensa en costo de adquisición, en cuánto vale un cliente en el tiempo y en si la venta que le atribuyen es realmente incremental.",
      dolores: [
        "Tiene que defender el presupuesto como inversión ante finanzas, y las métricas de marketing no alcanzan para eso.",
        "No sabe si la venta que le atribuye la plataforma se iba a dar igual sin haber pagado por ella.",
        "Cada proveedor se cuelga la medalla de la misma conversión.",
        "Un canal que venía funcionando se cae por un cambio de reglas de la plataforma y se entera tarde.",
      ],
      yaSabe: [
        "Embudo, segmentación, remarketing, atribución como concepto.",
        "Que las plataformas sobre-atribuyen.",
        "Que hay que mirar más allá del último clic.",
        "Cómo se lee un reporte de performance.",
      ],
      loDesvela:
        "Que le recorten el presupuesto por no poder probar el retorno, y quedar sin argumento frente a un director que solo mira la línea de abajo.",
      comoLoGanamos:
        "Dándole el argumento y la forma de construir la prueba: cómo demostrar incrementalidad con lo que ya tiene, sin comprarse una herramienta nueva.",
    },
  ],

  personaDefault: "p1_dueno",

  vara: {
    aprendizajesValidos: [
      "Un criterio para una decisión que el lector enfrenta y no tiene resuelta.",
      "Un trade-off no obvio: ganás A, cuesta B, y así lo juzgás.",
      "Cómo juzgar a su proveedor: la pregunta concreta que expone si lo que le reportan es real.",
      "Una consecuencia de negocio que la táctica no resuelve.",
      "Un mecanismo o caso límite con sustancia: no 'hacé X', sino por qué X está fallando de una forma que no se ve.",
    ],
    prohibidoComoAprendizaje: [
      "segmentá bien tu audiencia",
      "probá varios creativos / hacé A/B testing",
      "instalá el píxel / configurá el seguimiento",
      "mirá el ROAS",
      "hacé remarketing",
      "el video rinde más que la imagen",
      "optimizá para conversiones y no para clics",
      "no le pongas presupuesto bajo a una campaña",
      "usá las campañas automáticas de la plataforma",
      "la landing tiene que cargar rápido",
      "probá con influencers",
      "el copy tiene que tener un llamado a la acción",
    ],
  },

  creencias: [
    {
      id: "barato_es_peor",
      tipo: "vehiculo",
      dice: "Si sale bastante menos que una agencia normal, algo tiene que estar peor.",
      porQueLaCree:
        "En servicios profesionales el precio suele ser proxy de dedicación, y casi siempre acierta. Es una heurística razonable, no un prejuicio.",
      seDerribaCon:
        "Mostrar de dónde sale la diferencia. En una agencia el costo es headcount: horas de gente armando campañas y escribiendo reportes. Si esas horas no existen, el precio baja sin que baje el trabajo. Mostrar el mecanismo, no jurar que la calidad se mantiene.",
    },
    {
      id: "mi_negocio_es_distinto",
      tipo: "vehiculo",
      dice: "Un sistema automático no puede entender mi negocio, que tiene sus particularidades.",
      porQueLaCree:
        "Tiene razón en que su negocio tiene particularidades, y en que las automatizaciones de las plataformas las ignoran alegremente.",
      seDerribaCon:
        "Precisar qué se automatiza y qué no. La ejecución y la medición se automatizan porque son idénticas en todos lados; el criterio sobre qué hacer con el número no. Mostrar dónde está el límite es lo que hace creíble el resto.",
    },
    {
      id: "no_puedo_evaluar",
      tipo: "interna",
      dice: "Yo no sé lo suficiente de esto como para saber si me están trabajando bien.",
      porQueLaCree:
        "Es literalmente cierto, y es la razón por la que sigue con la agencia que tiene. Negarlo lo insulta.",
      seDerribaCon:
        "Darle la pregunta concreta que puede hacer sin saber nada técnico, y que revela si le están rindiendo. Es el contenido de mayor valor para esta persona: criterio para auditar, no táctica para ejecutar.",
    },
    {
      id: "cambiar_es_arrancar_de_cero",
      tipo: "interna",
      dice: "Si cambio pierdo el histórico, el aprendizaje de las campañas y arranco de nuevo.",
      porQueLaCree: "Le pasó, o se lo dijeron. Y en parte es verdad: hay aprendizaje que vive en la cuenta.",
      seDerribaCon:
        "Explicar qué se conserva de verdad (la cuenta, el histórico, el píxel, las conversiones) y qué se pierde (poco). Reconocer la parte cierta antes de acotarla.",
    },
    {
      id: "ya_probe_todas",
      tipo: "externa",
      dice: "Ya cambié de agencia dos veces y terminó igual. El problema debe ser otro.",
      porQueLaCree: "Porque probablemente el problema SÍ era otro, y ninguna de las dos se lo dijo.",
      seDerribaCon:
        "Nombrar las causas que no son la agencia y que ninguna agencia le va a señalar porque la deja mal parada. Es el contenido que más confianza construye, y el que ningún competidor va a escribir.",
    },
    {
      id: "la_publicidad_ya_no_rinde",
      tipo: "externa",
      dice: "Está todo más caro y saturado. Ya no rinde como antes, no es cuestión de quién lo maneje.",
      porQueLaCree: "Los costos por impresión efectivamente subieron. La premisa es correcta; la conclusión no se sigue.",
      seDerribaCon:
        "Aceptar el dato y mostrar qué cambia de la decisión cuando el costo sube: qué deja de tener sentido y qué empieza a tenerlo. El trade-off concreto, no un discurso de optimismo.",
    },
  ],

  voz: {
    tono: [
      {
        pilar: "El número manda",
        detalle:
          "Se vende publicidad: todo termina en plata invertida y plata devuelta. Cuando hay un dato, va el dato. Cuando no lo hay, se describe el mecanismo y se dice que no hay dato todavía. Nunca un adjetivo ocupando el lugar de una medición.",
      },
      {
        pilar: "El proceso a la vista",
        detalle:
          "Cómo funciona la operación se muestra, no se insinúa. Qué automatiza un agente, qué decide una persona, dónde está el límite. La transparencia es la ventaja competitiva: un competidor no puede copiar un proceso que tendría que explicar.",
      },
      {
        pilar: "Sin teatro de agencia",
        detalle:
          "Nada de épica creativa, premios, ni la liturgia del rubro. El cliente no compra creatividad, compra retorno. Se habla como alguien que administra el presupuesto de otro y tiene que rendir cuentas.",
      },
      {
        pilar: "Ambición sobre el método",
        detalle:
          "La parte aspiracional va sobre a dónde llega el método, no sobre resultados que no se pueden probar. 'Una pyme operando su publicidad como una empresa grande' es ambicioso y verificable. 'Resultados extraordinarios' es humo.",
      },
    ],

    registroDetalle: `Español rioplatense, VOSEO consistente. "tenés, podés, querés, sabés"; imperativos "mirá, fijate, probá, escribinos". Es una marca argentina hablándole a un mercado argentino: sonar neutro-corporativo es perder la diferencia. Lo que NO se hace es mezclar: nunca voseo y tuteo en la misma pieza.`,

    correcciones: [
      { re: /\bpauta\s+paga\b/gi, to: "publicidad" },
      { re: /\bpautas\b/gi, to: "publicidad" },
      { re: /\bpauta\b/gi, to: "publicidad" },
      { re: /\bpautar\b/gi, to: "invertir en publicidad" },
      { re: /\brankear\b/gi, to: "posicionar" },
      { re: /\brankea\b/gi, to: "posiciona" },
      { re: /\branking\b/gi, to: "posicionamiento" },
      { re: /\bparsear\b/gi, to: "procesar" },
    ],

    prohibiciones: [
      {
        re: /\b(revolucionari[oa]|disruptiv[oa]|game\s?changer|innovador[a]?|sin precedentes|de vanguardia|best[- ]in[- ]class|de clase mundial|líder indiscutid[oa])\b/gi,
        motivo: "Adjetivo de hype que se auto-adjudica. Mostrá el mecanismo en vez de calificarlo.",
      },
      {
        re: /\b(potenciar|empoderar|sinergia|holístic[oa]|maximizar el potencial)\b/gi,
        motivo: "Jerga de consultora. Decí la acción concreta.",
      },
      {
        re: /\b(llevar al siguiente nivel|marcar la diferencia|la clave está en|el secreto (es|está)|esto lo cambia todo)\b/gi,
        motivo: "Muletilla vacía que promete sin decir nada.",
      },
      {
        re: /\bno (es|se trata de)\b[^.!?]{2,60}\b(,\s*(es|sino)|:\s*es)\b/gi,
        motivo: "Construcción 'no es X, es Y': el cliché de IA más detectable. Reescribí en afirmativo.",
      },
      {
        re: /\b(en un mundo cada vez más|hoy en día|en la era de|en el mundo actual)\b/gi,
        motivo: "Apertura genérica. Arrancá por el dato o la situación concreta.",
      },
      {
        re: /\b(spoiler:|y acá está lo interesante|lo que (descubrí|pasó) te va a sorprender)\b/gi,
        motivo: "Falsa intriga.",
      },
      {
        re: /(¿(coincidís|coincides|qué opinás|qué opinas)\?|etiquetá a|comentá abajo|guardá este (post|posteo))/gi,
        motivo: "Pedido de engagement barato. El cierre es una idea, no un pedido de interacción.",
      },
      {
        re: /\b(últimos? (lugares|cupos)|no te lo pierdas|oferta por tiempo limitado|solo por hoy|antes de que sea tarde)\b/gi,
        motivo:
          "Urgencia fabricada. Con un comprador que ya viene escéptico, la presión confirma su sospecha de que le están vendiendo.",
      },
    ],

    verificables: [
      {
        id: "no_obvio",
        regla:
          "El aprendizaje de la pieza no puede ser algo que la persona a la que le habla ya sabe, ni estar en la lista de prohibidos como aprendizaje.",
        criterio:
          "Tomá el campo 'aprendizaje' de la ficha y compará contra el yaSabe de esa persona y contra la lista de prohibidos. Si coincide con alguno, o es una reformulación de alguno, falla. Preguntá también: ¿esta persona podría haber escrito esto sola? Si sí, falla.",
      },
      {
        id: "una_sola_persona",
        regla: "La pieza le habla a una sola persona, no a dos a la vez.",
        criterio:
          "¿Hay pasajes dirigidos a un perfil distinto del declarado en la ficha? Si los hay, falla.",
      },
      {
        id: "afirmaciones_respaldadas",
        regla:
          "Toda afirmación de resultado tiene que corresponder a una entrada del registro de pruebas.",
        criterio:
          "Por cada afirmación de resultado, ¿se puede señalar la entrada exacta del registro que la respalda? Si el registro está vacío, cualquier afirmación de resultado falla.",
      },
      {
        id: "cifras_de_la_fuente",
        regla: "Ningún número, porcentaje, precio o medida que no venga de la fuente o del registro de pruebas.",
        criterio: "Listá cada cifra y señalá de dónde sale. Una cifra sin origen rastreable falla.",
      },
      {
        id: "negativos_evitados",
        regla:
          "Prohibido afirmar un mal que no ocurrió ('cero errores', 'sin perder una venta') salvo que la fuente lo diga con esas mismas palabras.",
        criterio:
          "¿Hay alguna construcción del tipo 'sin/cero + algo malo'? Si la fuente no la afirma literalmente, falla.",
      },
      {
        id: "creencia_atacada",
        regla:
          "Si la ficha declara una creencia, la pieza tiene que reconocer la parte cierta de esa creencia antes de discutirla, y desarmarla con un mecanismo o un criterio.",
        criterio:
          "¿La pieza reconoce por qué el lector cree eso? ¿Lo desarma mostrando cómo funciona algo, o solo lo contradice con una promesa? Contradecir sin mecanismo falla.",
      },
      {
        id: "anclaje_a_servicio",
        regla: "La pieza ancla a un servicio concreto y deja claro que es algo que la agencia ejecuta.",
        criterio:
          "¿Se puede nombrar a cuál servicio corresponde? Si se leería igual en el blog de cualquier consultora genérica, falla.",
      },
      {
        id: "marca_una_vez",
        regla: "La marca se nombra una sola vez, cerca del cierre.",
        criterio:
          "Contá las menciones. Más de una en piezas cortas, o más de dos en artículos largos, falla.",
      },
      {
        id: "registro_consistente",
        regla: "Voseo consistente en toda la pieza, sin mezclar con tuteo.",
        criterio: "Revisá todo verbo en segunda persona del singular. Una sola forma mezclada falla.",
      },
      {
        id: "cierre_no_pide",
        regla: "El cierre condensa una idea. No pide interacción ni hace una pregunta retórica.",
        criterio: "Mirá la última línea. Si pide algo al lector en vez de afirmar algo, falla.",
      },
    ],

    guia: [
      "Frases cortas y afirmativas. Voz activa siempre.",
      "El mecanismo sobre la etiqueta: en vez de 'es más eficiente', explicá qué deja de costar plata.",
      "Números concretos antes que adjetivos.",
      "Variá el ritmo. La cadencia de frases secas cortas pega una vez; repetida en la misma pieza suena a fórmula.",
      "Cerrá con una sola línea que condense la idea.",
      "Emojis: máximo uno o dos, y solo si ayudan a escanear.",
      "La raya (—) con moderación. Nada de signos múltiples.",
    ],

    firmas: {
      // TODO: completar nombre y cargo definitivos.
      fundador: `## Voz personal — el fundador

Primera persona del singular. Quien habla es el que construyó el sistema, y esa es toda su autoridad: no opina sobre publicidad digital desde afuera, muestra lo que encontró construyendo y operando.

- El protagonista del post es el HALLAZGO o el ERROR, nunca la persona. Se cuenta lo que pasó, no lo bien que salió.
- Mostrar el trabajo a medio hacer está permitido y es lo que más rinde: qué se probó, qué falló, qué se cambió.
- Cero épica de emprendedor. Ninguna historia de superación, ningún "hace un año renuncié a", ninguna lección de vida. Es alguien técnico contando algo técnico con consecuencia de negocio.
- El crédito va al dato o a quien lo señaló. Nunca "yo lo vi antes que nadie".
- Se puede discrepar con una práctica instalada del rubro, siempre con el mecanismo a la vista y sin nombrar a nadie.
- Cuando se cuenta el origen (por qué se construyó esto), se cuenta el problema concreto que lo disparó y qué se probó antes que no funcionó. El valor está en el problema y en los intentos fallidos, no en el desenlace.
- Aplican TODAS las reglas de la voz de marca. Lo único que cambia es la persona gramatical.`,
    },
  },

  diseno: {
    paleta: PALETA,
    fuentes: FUENTES,
    styleCore,
    layoutMotifs: [
      "a single oversized headline filling most of the frame, flush left, with a thin black rule underneath and one small mono label in a corner",
      "a large mono NUMERAL dominating the composition, with the headline set small beside or below it",
      "the frame split by a hard horizontal rule into two unequal blocks, one filled flat with the accent color, the other empty",
      "a strict left-aligned grid of short mono lines, like a readout or a table, with one line highlighted in the accent color",
      "an inverted block: solid near-black field with the headline knocked out in off-white and a single accent underline",
    ],
    designRules: `## Reglas de diseño (NUNCA violar)
- CONTRASTE: texto negro sobre lima o sobre blanco roto; texto blanco roto sobre negro. NUNCA texto blanco sobre lima (ilegible), nunca lima sobre blanco.
- El acento lima se usa en UN solo elemento por placa. Si está en todos lados, no destaca nada.
- Plano siempre: ningún degradado, brillo, sombra ni volumen. Si parece tridimensional, está mal.
- Ninguna esquina redondeada. Ningún ícono decorativo.
- El número, si lo hay, es el elemento más grande y va en monoespaciada.
- Nada de fotos de stock, personas sonriendo ni escenas de oficina.
- El logo no se repite: si la placa lo lleva, el nombre de la marca no se escribe además en el texto.`,
    jerarquia: [
      "Si hay un dato, el dato es lo más grande de la pieza, en mono.",
      "El titular es segundo en tamaño, en display.",
      "El cuerpo es chico y corto. Si necesita ser largo, la pieza está mal pensada.",
      "Las etiquetas van en mono chico, en caja alta, como rótulos de instrumento.",
    ],
  },

  confidencialidad: `## Confidencialidad (bloquea publicación)
- El cliente NO se nombra. Se lo describe por rubro o perfil ("un ecommerce de indumentaria", "una empresa de servicios B2B"). El nombre solo puede aparecer si hay autorización explícita registrada.
- PROHIBIDOS los valores absolutos que revelen la escala financiera del cliente: facturación, ingresos, monto invertido, ticket promedio, cantidad de transacciones o de sesiones. Se muestran porcentajes, variaciones relativas y descripciones cualitativas.
- Excepción: las cifras de la PROPIA operación (tiempo de producción, volumen de piezas, variantes testeadas) sí se pueden mostrar. Son nuestras y son la demostración del método.
- Nada de competidores con nombre. Nada de datos internos de un cliente que el cliente no haya hecho públicos.`,
}
