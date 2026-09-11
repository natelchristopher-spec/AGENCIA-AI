// Maquinaria de armado de prompts. Agnóstica de marca: trabaja contra
// BrandProfile y no sabe de qué cliente se trata.
//
// Para automatizar una marca nueva no se toca este archivo.

import {
  type BrandProfile,
  type Creencia,
  creenciaDe,
  personaDe,
  pruebasPublicables,
} from "./types"

export function bloquePersona(profile: BrandProfile, personaId?: string): string {
  const p = personaDe(profile, personaId)
  return `## A quién le habla ESTA pieza (una sola persona, nunca dos)
${p.nombre} — ${p.rol}.
Perfil: ${p.perfil}
Qué maneja: ${p.maneja}

Dolores que la pieza puede tocar:
${p.dolores.map((d) => `- ${d}`).join("\n")}

## QUÉ YA SABE — PROHIBIDO DECÍRSELO COMO HALLAZGO
Es su piso. Si el aprendizaje de la pieza es una de estas cosas, la pieza no sirve:
${p.yaSabe.map((s) => `- ${s}`).join("\n")}

Qué lo desvela: ${p.loDesvela}
Cómo se lo gana la pieza: ${p.comoLoGanamos}`
}

export function bloqueVara(profile: BrandProfile): string {
  const { aprendizajesValidos, prohibidoComoAprendizaje } = profile.vara
  return `## La vara: que se lleve algo
La pieza pasa SOLO si el lector no podría haberla escrito él mismo. El aprendizaje tiene que ser al menos uno de:
${aprendizajesValidos.map((a) => `- ${a}`).join("\n")}

PROHIBIDO COMO APRENDIZAJE — es el piso del rubro, no el techo:
${prohibidoComoAprendizaje.join(" · ")}
Pueden aparecer como PREMISA; nunca como el hallazgo de la pieza.

TEST DE SALIDA: si al terminar de leerla el lector puede decir "esto ya lo sé", la pieza no sale.`
}

export function bloquePruebas(profile: BrandProfile): string {
  const pruebas = pruebasPublicables(profile)
  if (!pruebas.length) {
    return `## Afirmaciones permitidas: NINGUNA
El registro de pruebas está vacío. NO afirmes ningún resultado, cifra, porcentaje, mejora ni logro — ni propio ni de un cliente. Podés explicar el método, el criterio y cómo funciona el sistema. Todo lo que sea "conseguimos X" o "mejoramos Y" está prohibido sin excepción.`
  }
  return `## Afirmaciones permitidas (las ÚNICAS)
Son las únicas afirmaciones de resultado que podés hacer. Cualquier otra cifra, porcentaje o logro está PROHIBIDO, incluso si suena razonable:
${pruebas.map((p) => `- ${p.afirmacion}`).join("\n")}`
}

export function bloqueCreencia(profile: BrandProfile, creenciaId?: string): string {
  if (!creenciaId) return ""
  const c: Creencia | undefined = creenciaDe(profile, creenciaId)
  if (!c) return ""
  return `## Creencia que esta pieza discute
El lector piensa: "${c.dice}"
Por qué lo piensa (RECONOCÉ la parte que es cierta antes de discutirla; negarla de entrada lo pone a la defensiva): ${c.porQueLaCree}
Con qué se desarma: ${c.seDerribaCon}

REGLA: la creencia se derriba mostrando un mecanismo o dando un criterio, NUNCA con una promesa, un testimonio ni una apelación emocional. La emoción tiene que salir de que el lector reconozca su problema descrito con precisión.`
}

export const BLOQUE_FICHA = `## Ficha (obligatoria — se genera junto con la pieza)
Antes de dar la pieza por cerrada, completá estos campos. Si no podés completarlos con algo que pase el test de salida, la pieza NO avanza: volvé a buscar el ángulo.
- "buyer": el id de la persona a la que le habla (una sola).
- "aprendizaje": en UNA línea, el hallazgo concreto que se lleva el lector. El hallazgo, no el tema.
- "por_que_avanzo": por qué ese aprendizaje NO es obvio para esa persona, argumentado contra lo que YA SABE. Si el argumento es débil, el aprendizaje es obvio y hay que cambiarlo.
- "creencia": el id de la creencia que discute, o vacío si no discute ninguna.`

export function bloqueIdentidad(profile: BrandProfile, personaId?: string): string {
  const servicios = profile.servicios.map((s) => `- ${s.nombre}: ${s.resuelve}`).join("\n")
  const { posicionamiento: pos } = profile

  return `## Marca
${profile.name} — ${profile.descriptor}. Mercado: ${profile.mercados.join(", ")}.

Tesis: ${pos.tesis}

Qué reemplaza (no es una versión mejor de lo que ya existe; es otra cosa): ${pos.nuevaOportunidad}

Mecanismo (esto es lo que se muestra; la conclusión la saca el lector): ${pos.mecanismo}

## Servicios
${servicios}

${bloquePersona(profile, personaId)}

${bloqueVara(profile)}

${bloquePruebas(profile)}

${profile.confidencialidad}`
}

export interface OpcionesVoz {
  personaId?: string
  creenciaId?: string
  /** Id del firmante para piezas en primera persona. */
  firmaId?: string
}

/** Bloque completo que encabeza cualquier generador de contenido. */
export function bloqueVoz(profile: BrandProfile, opts: OpcionesVoz = {}): string {
  const { voz } = profile
  const tono = voz.tono.map((t) => `- ${t.pilar}: ${t.detalle}`).join("\n")
  const prohibidas = voz.prohibiciones.map((p) => `- ${p.motivo}`).join("\n")
  const verificables = voz.verificables.map((v) => `- ${v.regla}`).join("\n")
  const guia = voz.guia.map((g) => `- ${g}`).join("\n")

  const firma = opts.firmaId ? `\n\n${voz.firmas[opts.firmaId] ?? ""}` : ""
  const creencia = bloqueCreencia(profile, opts.creenciaId)

  return `${bloqueIdentidad(profile, opts.personaId)}
${creencia ? `\n${creencia}\n` : ""}
## Tono
${tono}

## Registro
${voz.registroDetalle}

## Reglas que bloquean publicación (NUNCA violar)
${prohibidas}
${verificables}

## Criterio de estilo
${guia}${firma}

${BLOQUE_FICHA}`
}

/** Bloque de diseño para los prompts de generación de imagen. */
export function bloqueDiseno(profile: BrandProfile, slideIndex = 1): string {
  const { diseno } = profile
  const i = Math.max(0, slideIndex - 1)
  const motif = diseno.layoutMotifs[i % diseno.layoutMotifs.length]
  return `${diseno.styleCore}

LAYOUT FOR THIS SLIDE (slide ${slideIndex}) — keep the same brand system but give this slide its own architecture so the feed has rhythm: ${motif}

${diseno.designRules}`
}
