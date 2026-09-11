// Fuente única de identidad de marca.
//
// Todo lo de marca vive ACÁ: posicionamiento, servicios, personas y —lo más
// importante— las dos estructuras que le dan DIENTES a la calidad:
//
//   1. El registro de pruebas: el allowlist de lo que la marca puede afirmar.
//   2. El `yaSabe` de cada persona: contra qué se mide que algo no sea obvio.
//
// Sin (1), "sin humo" es una aspiración que depende de que alguien se acuerde.
// Sin (2), "aportá un ángulo no obvio" se cumple de palabra y no de hecho: el
// modelo no puede evitar decirle al lector algo que el lector ya sabe si nunca
// se le dijo qué sabe.
//
// El bloque que se inyecta en los prompts, el crítico que aprueba o bloquea, y
// la página del manual in-app se derivan todos de este archivo.

export type Registro = "voseo" | "neutro"
export type PersonaId = "p1_dueno" | "p2_marketing"

/** Una prueba verificable. El crítico solo deja afirmar lo que está acá. */
export interface Prueba {
  id: string
  /** La afirmación, tal como puede enunciarse públicamente. */
  afirmacion: string
  /** De dónde sale. Si no se puede señalar, no es una prueba. */
  respaldo: string
  publicable: boolean
}

export interface Servicio {
  id: string
  nombre: string
  /** El problema de negocio que resuelve, en el lenguaje del cliente. */
  resuelve: string
}

export interface Persona {
  id: PersonaId
  nombre: string
  rol: string
  /** Por qué es target: tiene que ser quien firma, no quien ejecuta. */
  porQueEsTarget: string
  perfil: string
  /** Qué administra. Define en qué unidades piensa. */
  maneja: string
  /** Los dolores que una pieza puede tocar. Concretos, no categorías. */
  dolores: string[]
  /** PROHIBIDO repetírselo. Es su piso: decírselo no le enseña nada. */
  yaSabe: string[]
  /** Lo que teme. Es la palanca emocional real. */
  loDesvela: string
  /** Cómo se lo gana una pieza. */
  comoLoGanamos: string
}

export const BRAND = {
  // TODO: reemplazar por el nombre definitivo. Se propaga solo a todo el sistema.
  name: "NOMBRE_PENDIENTE",

  registro: "voseo" as Registro,
  mercados: ["Argentina"],

  posicionamiento: {
    tesis:
      "Una agencia de publicidad digital cuyo costo operativo es estructuralmente más bajo porque la operación corre sobre sistemas automatizados, no sobre horas de gente. El precio es la consecuencia de esa arquitectura.",

    mecanismo:
      "En una agencia tradicional el costo es headcount: horas de personas armando campañas, cruzando datos y escribiendo reportes. Acá esas tres cosas las ejecutan agentes. Queda gente para lo que decide: la estrategia y el criterio sobre qué hacer con el número.",

    prueba_viva:
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
  ] satisfies Servicio[],

  pruebas: [] as Prueba[],
} as const

// ── PERSONAS ────────────────────────────────────────────────────────────────
// Las dos son quien FIRMA. El que ejecuta (el community, el freelance, el
// analista) es lector, nunca target: ya sabe la táctica y no decide el gasto.
//
// REGLA DURA: cada pieza le habla a UNA sola. Mezclarlas es el "para todos =
// para nadie", que es la causa raíz de que el contenido salga básico.

export const PERSONAS: Record<PersonaId, Persona> = {
  p1_dueno: {
    id: "p1_dueno",
    nombre: "El dueño que paga la agencia",
    rol: "Fundador / dueño de una pyme con venta online o generación de leads",
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

  p2_marketing: {
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
}

/** Default para piezas de publicidad y performance. */
export const PERSONA_DEFAULT: PersonaId = "p1_dueno"

// ── LA VARA: QUE SE LLEVE ALGO ──────────────────────────────────────────────
// Una pieza pasa solo si el lector no podría haberla escrito él mismo.

export const APRENDIZAJES_VALIDOS = [
  "Un criterio para una decisión que el lector enfrenta y no tiene resuelta.",
  "Un trade-off no obvio: ganás A, cuesta B, y así lo juzgás.",
  "Cómo juzgar a su proveedor: la pregunta concreta que expone si lo que le reportan es real.",
  "Una consecuencia de negocio que la táctica no resuelve.",
  "Un mecanismo o caso límite con sustancia: no 'hacé X', sino por qué X está fallando de una forma que no se ve.",
] as const

// El piso del rubro. Puede ir como PREMISA; nunca como el hallazgo de la pieza.
export const PROHIBIDO_COMO_APRENDIZAJE = [
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
] as const

// ── Derivaciones ────────────────────────────────────────────────────────────

export function pruebasPublicables(): Prueba[] {
  return BRAND.pruebas.filter((p) => p.publicable)
}

/** Bloque de la persona a la que apunta ESTA pieza. Una sola, nunca dos. */
export function bloquePersona(id: PersonaId = PERSONA_DEFAULT): string {
  const p = PERSONAS[id]
  return `## A quién le habla ESTA pieza (una sola persona, nunca dos)
${p.nombre} — ${p.rol}.
Perfil: ${p.perfil}
Qué maneja: ${p.maneja}

Dolores que la pieza puede tocar:
${p.dolores.map((d) => `- ${d}`).join("\n")}

## QUÉ YA SABE — PROHIBIDO DECÍRSELO COMO HALLAZGO
Esto es su piso. Si el aprendizaje de la pieza es una de estas cosas, la pieza no sirve:
${p.yaSabe.map((s) => `- ${s}`).join("\n")}

Qué lo desvela: ${p.loDesvela}
Cómo se lo gana la pieza: ${p.comoLoGanamos}`
}

/** La vara de no-obviedad, con su lista negra. */
export function bloqueVara(): string {
  return `## La vara: que se lleve algo
La pieza pasa SOLO si el lector no podría haberla escrito él mismo. El aprendizaje tiene que ser al menos uno de:
${APRENDIZAJES_VALIDOS.map((a) => `- ${a}`).join("\n")}

PROHIBIDO COMO APRENDIZAJE — es el piso del rubro, no el techo:
${PROHIBIDO_COMO_APRENDIZAJE.map((p) => `- ${p}`).join(" · ")}
Pueden aparecer como PREMISA; nunca como el hallazgo de la pieza.

TEST DE SALIDA: si al terminar de leerla el lector puede decir "esto ya lo sé", la pieza no sale.`
}

/** Bloque de identidad que encabeza todos los prompts de generación. */
export function bloqueIdentidad(persona: PersonaId = PERSONA_DEFAULT): string {
  const servicios = BRAND.servicios.map((s) => `- ${s.nombre}: ${s.resuelve}`).join("\n")

  const pruebas = pruebasPublicables()
  const bloquePruebas = pruebas.length
    ? `## Afirmaciones permitidas (las ÚNICAS)
Son las únicas afirmaciones de resultado que podés hacer. Cualquier otra cifra, porcentaje o logro está PROHIBIDO, incluso si suena razonable:
${pruebas.map((p) => `- ${p.afirmacion}`).join("\n")}`
    : `## Afirmaciones permitidas: NINGUNA
El registro de pruebas está vacío. NO afirmes ningún resultado, cifra, porcentaje, mejora ni logro — ni propio ni de un cliente. Podés explicar el método, el criterio y cómo funciona el sistema. Todo lo que sea "conseguimos X" o "mejoramos Y" está prohibido sin excepción.`

  return `## Marca
${BRAND.name} — agencia de publicidad digital. Mercado: ${BRAND.mercados.join(", ")}.

Tesis: ${BRAND.posicionamiento.tesis}

Mecanismo (esto es lo que se muestra; la conclusión la saca el lector): ${BRAND.posicionamiento.mecanismo}

## Servicios
${servicios}

${bloquePersona(persona)}

${bloqueVara()}

${bloquePruebas}`
}
