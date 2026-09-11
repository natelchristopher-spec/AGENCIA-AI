// Capa de OBJETIVOS de publicación.
//
// El objetivo es lo PRIMERO que estructura un prompt: de él se derivan la
// densidad de texto de la pieza, los drivers de copy a activar y el CTA. Vive
// acá una sola vez para que no quede implícito y triplicado en cada generador.
//
// El objetivo NO lo infiere un modelo: se deriva determinísticamente del tipo
// de pieza y su modo, que ya se eligieron al generar (ver objetivoDePieza).

export type Objetivo = "lead" | "autoridad" | "nutricion" | "prueba"
export type Densidad = "gancho" | "lectura"

export interface ObjetivoSpec {
  label: string
  /** Qué persigue la pieza — el norte que ordena todo lo demás. */
  meta: string
  densidad: Densidad
  /** Palancas de copy a activar, en orden de prioridad. */
  drivers: string[]
  cta: string
}

const REGLA_DENSIDAD: Record<Densidad, string> = {
  gancho:
    "GANCHO — el TÍTULO es el protagonista; el cuerpo es una línea corta (máx ~70 caracteres) o vacío. 3-4 slides. Si bajás toda la idea, no queda motivo para el clic.",
  lectura:
    "LECTURA — título + cuerpo de hasta ~150 caracteres, escaneable para que la tipografía entre grande. 4-5 slides. La pieza se basta sola.",
}

export const OBJETIVOS: Record<Objetivo, ObjetivoSpec> = {
  lead: {
    label: "Generar consulta",
    meta: "Que el lector pida una conversación. Es persuasión: el argumento se arma dentro de la pieza, sin mandarlo a ningún lado.",
    densidad: "lectura",
    drivers: [
      "Un problema de plata que el lector reconoce como propio, descrito con la precisión de quien ya lo vio muchas veces.",
      "La consecuencia de no resolverlo, dimensionada sin exagerar.",
      "El criterio práctico de cómo se resuelve: qué se mira, qué se decide. Que se note que es algo que ejecutás, no un consejo.",
      "Costo visible: por qué esto sale menos de lo que el lector supone. El mecanismo, nunca el adjetivo 'barato'.",
    ],
    cta: "CTA directo al final del copy, en su propia línea. Nunca dentro de un slide.",
  },

  autoridad: {
    label: "Autoridad / criterio",
    meta: "Que consuman la pieza completa y validen que sabés de qué hablás. No hay destino más valioso que la pieza misma.",
    densidad: "lectura",
    drivers: [
      "Un criterio propio sobre una decisión que el lector enfrenta y no tiene resuelta.",
      "Especificidad técnica traducida a consecuencia de plata.",
      "El caso límite o el mecanismo que no se ve a simple vista.",
      "Cierre con una tesis que se sostenga sola.",
    ],
    cta: "Sin CTA ni link. La última línea cierra con la tesis.",
  },

  nutricion: {
    label: "Llevar a contenido propio",
    meta: "Llevar el clic a algo más profundo (una nota, un análisis, una herramienta). La pieza es el gancho; lo valioso vive en el destino.",
    densidad: "gancho",
    drivers: [
      "Brecha de curiosidad: dejá el desenlace —el cómo, el número, el método— para el destino.",
      "Un gancho que valga por sí mismo aunque nadie haga clic.",
      "Señalá que la prueba o el detalle está en el destino, sin spoilearlo.",
      "Cero venta de servicio: acá se invita a leer, no se vende.",
    ],
    cta: "CTA de lectura con la URL literal. SIN CTA de servicio.",
  },

  // Objetivo propio de esta marca: la cuenta es la demo del producto. Mostrar
  // la operación funcionando prueba la tesis mejor que cualquier argumento.
  prueba: {
    label: "Mostrar el sistema funcionando",
    meta: "Demostrar la tesis en vez de afirmarla: mostrar la operación por dentro. Es el contenido que hace creíble el precio.",
    densidad: "lectura",
    drivers: [
      "Mostrá el mecanismo real: qué hace un agente, con qué dato, en cuánto tiempo.",
      "Mostrá también dónde decide una persona y por qué ahí no se automatiza. El límite es lo que da credibilidad.",
      "Números del propio proceso (tiempo, volumen, costo), que no requieren resultado de cliente para ser ciertos.",
      "Nada de épica. Es una demostración técnica, no un anuncio.",
    ],
    cta: "Cierre con el mecanismo, no con una invitación. Si el sistema impresiona, la consulta llega sola.",
  },
}

/**
 * Bloque que ENCABEZA cada generador: el objetivo va primero y manda sobre
 * todo lo demás. En formato "articulo" se omite la densidad, que es de carrusel.
 */
export function bloqueObjetivo(
  objetivo: Objetivo,
  formato: "carrusel" | "articulo" = "carrusel",
): string {
  const o = OBJETIVOS[objetivo]
  const drivers = o.drivers.map((d, i) => `  ${i + 1}. ${d}`).join("\n")
  const densidad =
    formato === "carrusel" ? `\nDENSIDAD DE TEXTO impuesta por el objetivo: ${REGLA_DENSIDAD[o.densidad]}` : ""
  return `## OBJETIVO DE ESTA PUBLICACIÓN (manda sobre todo lo demás)
Objetivo: ${o.label}. ${o.meta}
DRIVERS a activar, en orden de prioridad:
${drivers}${densidad}
CTA / DESTINO: ${o.cta}
Si algo más abajo contradice este objetivo, gana el objetivo.`
}

/** Deriva el objetivo de una pieza desde su tipo + modo. Determinístico. */
export function objetivoDePieza(tipo: string, modo?: string): Objetivo {
  if (tipo === "caso") return "nutricion"
  if (tipo === "blog") return "autoridad"
  if (tipo === "ebook") return "lead"
  if (tipo === "detras_de_escena") return "prueba"
  if (tipo === "educativo") {
    switch (modo) {
      case "servicio":
        return "lead"
      case "nota":
        return "nutricion"
      case "sistema":
        return "prueba"
      default:
        return "autoridad"
    }
  }
  return "autoridad"
}
