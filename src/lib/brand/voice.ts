// Manual de voz — escrito para ser EJECUTADO, no leído.
//
// En una operación autónoma el manual deja de ser documentación y pasa a ser la
// especificación que el crítico aplica antes de publicar. Por eso cada regla
// está clasificada por cómo se hace cumplir, y una regla que no entra en
// ninguna de las tres primeras categorías no bloquea nada:
//
//   CORRECCIONES  regex → reemplazo. Se aplica sola, en silencio.
//   PROHIBICIONES regex → detectada. BLOQUEA. No hay arreglo automático seguro.
//   VERIFICABLES  criterio explícito que evalúa el crítico. BLOQUEA.
//   GUIA          criterio de gusto. Va al prompt, nunca bloquea.
//
// La prueba de fuego para meter una regla acá: si no podés decir cómo se
// verifica, es GUIA. "Sin humo" es GUIA. "Toda afirmación de resultado mapea a
// una prueba del registro" es VERIFICABLE.

import { BRAND, bloqueIdentidad, PERSONA_DEFAULT, type PersonaId } from "./identity"

export const TONO = [
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
] as const

export const REGISTRO =
  BRAND.registro === "voseo"
    ? `Español rioplatense, VOSEO consistente. "tenés, podés, querés, sabés"; imperativos "mirá, fijate, probá, escribinos". Es una marca argentina hablándole a un mercado argentino: sonar neutro-corporativo es perder la diferencia. Lo que NO se hace es mezclar: nunca voseo y tuteo en la misma pieza.`
    : `Español neutro de LATAM, forma "tú". Sin modismos regionales. Cuidado con los imperativos, que es donde más se cuela el voseo: "inscribite" → "inscríbete", "mirá" → "mira".`

// ── CORRECCIONES ────────────────────────────────────────────────────────────
// Solo sustituciones inequívocas a nivel palabra. Si una corrección puede dar
// un falso positivo, no va acá: va a VERIFICABLES y la juzga el crítico.
const CORRECCIONES: { re: RegExp; to: string }[] = [
  // Jerga redundante del rubro: no hay pauta sin pagarla.
  { re: /\bpauta\s+paga\b/gi, to: "publicidad" },
  { re: /\bpautas\b/gi, to: "publicidad" },
  { re: /\bpauta\b/gi, to: "publicidad" },
  { re: /\bpautar\b/gi, to: "invertir en publicidad" },
  // Anglicismos con equivalente natural en español.
  { re: /\brankear\b/gi, to: "posicionar" },
  { re: /\brankea\b/gi, to: "posiciona" },
  { re: /\branking\b/gi, to: "posicionamiento" },
  { re: /\bparsear\b/gi, to: "procesar" },
]

// ── PROHIBICIONES ───────────────────────────────────────────────────────────
// Detectables por regex, pero sin reemplazo seguro: hay que reescribir la
// frase. Bloquean la publicación.
//
// Nota sobre "disruptivo": el posicionamiento SÍ es disruptivo. Decirlo es lo
// que lo arruina. Una marca tech creíble muestra el mecanismo y deja que el
// lector saque la conclusión.
export const PROHIBICIONES: { re: RegExp; motivo: string }[] = [
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
]

// ── VERIFICABLES ────────────────────────────────────────────────────────────
// Cada una trae el criterio con el que se evalúa. El crítico las aplica una por
// una sobre la pieza y devuelve las que no pasan. Bloquean la publicación.
export const VERIFICABLES: { id: string; regla: string; criterio: string }[] = [
  {
    id: "no_obvio",
    regla:
      "El aprendizaje de la pieza no puede ser algo que la persona a la que le habla ya sabe, ni estar en la lista de prohibidos como aprendizaje.",
    criterio:
      "Tomá el campo 'aprendizaje' de la ficha y compará contra el `yaSabe` de esa persona y contra PROHIBIDO_COMO_APRENDIZAJE. Si coincide con alguno, o si es una reformulación de alguno, falla. Preguntá también: ¿esta persona podría haber escrito esto sola? Si sí, falla.",
  },
  {
    id: "una_sola_persona",
    regla: "La pieza le habla a una sola persona, no a dos a la vez.",
    criterio:
      "¿Hay pasajes dirigidos a un perfil distinto del declarado en la ficha (por ejemplo, detalle táctico para el que ejecuta mezclado con argumento de presupuesto para el que firma)? Si los hay, falla.",
  },
  {
    id: "afirmaciones_respaldadas",
    regla:
      "Toda afirmación de resultado (una mejora, un logro, una cifra de performance) tiene que corresponder a una entrada del registro de pruebas.",
    criterio:
      "Por cada afirmación de resultado en la pieza, ¿se puede señalar la entrada exacta del registro que la respalda? Si el registro está vacío, cualquier afirmación de resultado falla.",
  },
  {
    id: "cifras_de_la_fuente",
    regla:
      "Ningún número, porcentaje, precio o medida que no venga de la fuente entregada o del registro de pruebas.",
    criterio:
      "Listá cada cifra que aparece en la pieza y señalá de dónde sale. Una cifra sin origen rastreable falla.",
  },
  {
    id: "negativos_evitados",
    regla:
      "Prohibido afirmar un mal que no ocurrió ('cero errores', 'sin perder una venta', 'sin fricción') salvo que la fuente lo diga con esas mismas palabras.",
    criterio:
      "¿Hay alguna construcción del tipo 'sin/cero + algo malo'? Si la fuente no la afirma literalmente, falla. Describir lo que SÍ pasó siempre pasa.",
  },
  {
    id: "anclaje_a_servicio",
    regla: "La pieza ancla a un servicio concreto y deja claro que es algo que la agencia ejecuta.",
    criterio:
      "¿Se puede nombrar a cuál de los servicios corresponde esta pieza? Si se leería igual en el blog de cualquier consultora genérica, falla.",
  },
  {
    id: "marca_una_vez",
    regla:
      "La marca se nombra una sola vez, cerca del cierre. El resto describe el problema y el método de forma objetiva.",
    criterio:
      "Contá las menciones de la marca. Más de una en piezas cortas, o más de dos en artículos largos, falla.",
  },
  {
    id: "registro_consistente",
    regla: `Registro consistente en toda la pieza: ${BRAND.registro === "voseo" ? "voseo" : 'forma "tú"'}, sin mezclar.`,
    criterio:
      "Revisá todo verbo en segunda persona del singular. Una sola forma mezclada en la pieza falla.",
  },
  {
    id: "cierre_no_pide",
    regla: "El cierre condensa una idea. No pide interacción ni hace una pregunta retórica.",
    criterio: "Mirá la última línea. Si pide algo al lector en vez de afirmar algo, falla.",
  },
]

// ── GUIA ────────────────────────────────────────────────────────────────────
// Criterio de gusto: mejora la pieza, nunca la bloquea.
export const GUIA = [
  "Frases cortas y afirmativas. Voz activa siempre.",
  "El mecanismo sobre la etiqueta: en vez de 'es más eficiente', explicá qué deja de costar plata.",
  "Números concretos antes que adjetivos.",
  "Variá el ritmo. La cadencia de frases secas cortas pega una vez; repetida en la misma pieza suena a fórmula.",
  "Cerrá con una sola línea que condense la idea.",
  "Emojis: máximo uno o dos, y solo si ayudan a escanear.",
  "La raya (—) con moderación. Nada de signos múltiples.",
]

/** Corrector determinístico. Se aplica siempre, antes de cualquier revisión. */
export function normalizeVoice(input: string): string {
  if (!input) return input
  let out = input
  for (const { re, to } of CORRECCIONES) {
    out = out.replace(re, (match) => {
      const first = match[0]
      const esMayuscula = first === first.toUpperCase() && first !== first.toLowerCase()
      return esMayuscula ? to[0].toUpperCase() + to.slice(1) : to
    })
  }
  return out
}

/** Prohibiciones encontradas en un texto. Vacío = pasa. */
export function detectarProhibiciones(texto: string): { termino: string; motivo: string }[] {
  const hallazgos: { termino: string; motivo: string }[] = []
  for (const { re, motivo } of PROHIBICIONES) {
    const matches = texto.match(re)
    if (matches) {
      for (const m of new Set(matches.map((x) => x.trim()))) {
        hallazgos.push({ termino: m, motivo })
      }
    }
  }
  return hallazgos
}

// ── FICHA ───────────────────────────────────────────────────────────────────
// Contrato de salida obligatorio. Toda pieza generada declara a quién le habla,
// qué se lleva el lector y por qué eso no es obvio PARA ESA PERSONA.
//
// La ficha no es metadata para que un humano apruebe de un vistazo: es la
// compuerta. Obligar al sistema a justificar por qué el aprendizaje no es obvio
// lo fuerza a tener uno. Si no puede completar los tres campos contra el
// `yaSabe` de la persona, la pieza no avanza — y eso lo puede evaluar el
// crítico sin leer la pieza entera.

export interface Ficha {
  buyer: PersonaId
  /** En una línea: qué se lleva el lector. El hallazgo, no el tema. */
  aprendizaje: string
  /** Por qué ese aprendizaje no es obvio para ESA persona, contra su `yaSabe`. */
  por_que_avanzo: string
}

export const BLOQUE_FICHA = `## Ficha (obligatoria — se genera junto con la pieza)
Antes de dar la pieza por cerrada, completá estos tres campos. Si no podés completarlos con algo que pase el test de salida, la pieza NO avanza: volvé a buscar el ángulo.
- "buyer": el id de la persona a la que le habla (una sola).
- "aprendizaje": en UNA línea, el hallazgo concreto que se lleva el lector. El hallazgo, no el tema. Mal: "hablamos de atribución". Bien: "la conversión que te reporta la plataforma y la que ves en tu sistema no son la misma, y cuál mirar depende de quién te pregunta".
- "por_que_avanzo": por qué ese aprendizaje NO es obvio para esa persona, argumentado contra lo que YA SABE. Si el argumento es débil, el aprendizaje es obvio y hay que cambiarlo.`

/** Bloque de voz que se inyecta en los prompts de generación. */
export function bloqueVoz(persona: PersonaId = PERSONA_DEFAULT): string {
  const tono = TONO.map((t) => `- ${t.pilar}: ${t.detalle}`).join("\n")
  const prohibidas = PROHIBICIONES.map((p) => `- ${p.motivo}`).join("\n")
  const verificables = VERIFICABLES.map((v) => `- ${v.regla}`).join("\n")
  const guia = GUIA.map((g) => `- ${g}`).join("\n")

  return `${bloqueIdentidad(persona)}

## Tono
${tono}

## Registro
${REGISTRO}

## Reglas que bloquean publicación (NUNCA violar)
${prohibidas}
${verificables}

## Criterio de estilo
${guia}

${BLOQUE_FICHA}`
}
