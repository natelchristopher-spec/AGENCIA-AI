// Anti-redundancia: que el sistema no se repita a sí mismo.
//
// Es el problema que mata a los sistemas autónomos de contenido. El crítico
// verifica que un aprendizaje no sea obvio PARA LA PERSONA, pero no sabe nada
// de lo que ya se publicó: a las pocas semanas el agente está escribiendo la
// misma pieza con otras palabras y nadie lo frena.
//
// La unidad de comparación es el APRENDIZAJE de la ficha, no el texto. Dos
// piezas pueden compartir tema y ser distintas si el hallazgo difiere; dos
// piezas de temas distintos pueden traer el mismo hallazgo. El texto completo
// compara la forma; la ficha compara la sustancia.
//
// Dos capas, y la primera importa más: PREVENIR es más barato que RECHAZAR.
// Inyectar lo ya dicho en el prompt evita la repetición antes de que se genere;
// detectarla después obliga a una ronda entera de regeneración.

import Anthropic from "@anthropic-ai/sdk"
import { parsearRespuesta } from "@/lib/ai/json"
import type { BrandProfile } from "@/lib/brand/types"

const MODEL = "claude-sonnet-5"

/** Cuántas piezas hacia atrás se miran. Más allá, repetir un ángulo es legítimo. */
const VENTANA = 20

/** Solapamiento léxico a partir del cual se sospecha repetición literal. */
const UMBRAL_LEXICO = 0.55

export interface PiezaHistorica {
  id: string
  fecha: string
  /** El aprendizaje declarado en la ficha. La clave semántica de la pieza. */
  aprendizaje: string
  tema: string
  personaId: string
  creenciaId?: string
}

/** Fuente del historial. La implementa la cola cuando exista. */
export interface Historial {
  recientes(limite: number): Promise<PiezaHistorica[]>
}

/** Historial en memoria, para pruebas y para correr sin base de datos. */
export class HistorialMemoria implements Historial {
  constructor(private piezas: PiezaHistorica[] = []) {}

  async recientes(limite: number): Promise<PiezaHistorica[]> {
    return [...this.piezas]
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, limite)
  }

  agregar(pieza: PiezaHistorica): void {
    this.piezas.push(pieza)
  }
}

// ── Capa 1: prevención ──────────────────────────────────────────────────────

/**
 * Bloque para inyectar en la generación. Lo que ya se dijo entra como
 * restricción, no como inspiración.
 */
export function bloqueAntiRepeticion(recientes: PiezaHistorica[]): string {
  if (!recientes.length) return ""
  const lista = recientes.map((p) => `- ${p.aprendizaje}`).join("\n")
  return `## Lo que esta cuenta YA publicó (no lo repitas)
Estos son los aprendizajes de las piezas recientes. El aprendizaje de la pieza nueva tiene que ser DISTINTO de todos: no una reformulación, no el mismo hallazgo con otro ejemplo, no un subconjunto de uno de estos.
${lista}

Si el ángulo que ibas a tomar cae acá adentro, buscá otro antes de escribir. Repetir un tema está permitido; repetir el hallazgo no.`
}

/**
 * Elige la combinación persona + creencia menos usada en el historial reciente.
 *
 * Rotar deliberadamente es más barato que detectar repetición después: es el
 * mismo principio que rotar el motivo visual por slide para que el feed no
 * parezca un catálogo.
 */
export function anguloMenosUsado(
  profile: BrandProfile,
  recientes: PiezaHistorica[],
): { personaId: string; creenciaId: string } {
  const uso = new Map<string, number>()
  for (const persona of profile.personas) {
    for (const creencia of profile.creencias) {
      uso.set(`${persona.id}|${creencia.id}`, 0)
    }
  }

  // Las piezas más nuevas pesan más: un ángulo de hace quince piezas ya
  // descansó lo suficiente como para volver a usarse.
  recientes.forEach((p, i) => {
    if (!p.creenciaId) return
    const clave = `${p.personaId}|${p.creenciaId}`
    if (uso.has(clave)) uso.set(clave, (uso.get(clave) ?? 0) + (recientes.length - i))
  })

  let mejor = `${profile.personaDefault}|${profile.creencias[0]?.id ?? ""}`
  let menor = Infinity
  for (const [clave, peso] of uso) {
    if (peso < menor) {
      menor = peso
      mejor = clave
    }
  }

  const [personaId, creenciaId] = mejor.split("|")
  return { personaId, creenciaId }
}

// ── Capa 2: detección ───────────────────────────────────────────────────────

const VACIAS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "al", "a",
  "en", "y", "o", "que", "se", "su", "sus", "por", "para", "con", "sin", "es",
  "son", "lo", "le", "les", "como", "más", "pero", "si", "no", "te", "tu", "vos",
  "esto", "eso", "esta", "este", "ese", "esa", "hay", "ya", "cuando", "donde",
])

function significativas(texto: string): Set<string> {
  return new Set(
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !VACIAS.has(w)),
  )
}

/** Jaccard sobre palabras con contenido. Atrapa el calco, no la paráfrasis. */
export function similitudLexica(a: string, b: string): number {
  const A = significativas(a)
  const B = significativas(b)
  if (!A.size || !B.size) return 0
  let comunes = 0
  for (const w of A) if (B.has(w)) comunes++
  return comunes / (A.size + B.size - comunes)
}

export interface VeredictoRedundancia {
  esRedundante: boolean
  /** Id de la pieza con la que choca, si hay una. */
  chocaCon?: string
  motivo?: string
  /** "lexica" = calco literal; "semantica" = mismo hallazgo, otras palabras. */
  capa?: "lexica" | "semantica"
}

const SYSTEM_JUEZ = `Sos el control de repetición de una cuenta de contenido. Te doy el aprendizaje de una pieza NUEVA y los aprendizajes de las piezas YA PUBLICADAS.

Decidís una sola cosa: si alguien que sigue esta cuenta sentiría que ya leyó esto.

- Es REDUNDANTE si el hallazgo es el mismo aunque cambien el ejemplo, el tema o las palabras; o si es un caso particular de un hallazgo ya publicado.
- NO es redundante si comparte el tema pero el hallazgo es distinto. Tratar el mismo tema desde otro ángulo es legítimo y deseable.
- Ante la duda, NO es redundante: bloquear de más empobrece la cuenta más que una repetición ocasional.

RESPONDÉ EXCLUSIVAMENTE con JSON válido (sin markdown):
{ "redundante": true, "choca_con": "id de la pieza", "motivo": "por qué es el mismo hallazgo" }
o
{ "redundante": false }`

/**
 * Detecta redundancia en dos capas: primero el calco literal, que es gratis;
 * después el juicio semántico, solo si la primera no resolvió.
 *
 * Falla ABIERTO, al revés que el crítico de calidad: si el juez se cae, la
 * pieza pasa. Una repetición ocasional es un costo menor que frenar la
 * publicación, y la capa léxica ya atrapó lo más grosero.
 */
export async function detectarRedundancia(
  candidato: { aprendizaje: string },
  historial: PiezaHistorica[],
): Promise<VeredictoRedundancia> {
  if (!historial.length || !candidato.aprendizaje.trim()) return { esRedundante: false }

  for (const previa of historial) {
    if (similitudLexica(candidato.aprendizaje, previa.aprendizaje) >= UMBRAL_LEXICO) {
      return {
        esRedundante: true,
        chocaCon: previa.id,
        capa: "lexica",
        motivo: `Prácticamente el mismo texto que el aprendizaje de "${previa.id}".`,
      }
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) return { esRedundante: false }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM_JUEZ,
      messages: [
        {
          role: "user",
          content: `PIEZA NUEVA:
${candidato.aprendizaje}

YA PUBLICADAS:
${historial.map((p) => `[${p.id}] ${p.aprendizaje}`).join("\n")}`,
        },
      ],
    })
    const parsed = parsearRespuesta<{ redundante?: unknown; choca_con?: unknown; motivo?: unknown }>(res)
    if (parsed.redundante !== true) return { esRedundante: false }
    return {
      esRedundante: true,
      chocaCon: String(parsed.choca_con ?? "").trim() || undefined,
      motivo: String(parsed.motivo ?? "").trim() || undefined,
      capa: "semantica",
    }
  } catch {
    return { esRedundante: false }
  }
}

/** Trae la ventana de historial que consumen las dos capas. */
export async function ventanaReciente(historial?: Historial): Promise<PiezaHistorica[]> {
  if (!historial) return []
  try {
    return await historial.recientes(VENTANA)
  } catch {
    return []
  }
}
