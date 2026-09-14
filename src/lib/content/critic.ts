// El crítico: el control de calidad que reemplaza al humano que aprueba.
//
// Es la generalización a TEXTO del patrón de verificación de imágenes: generar,
// que un modelo LEA la salida y liste las violaciones, regenerar nombrándolas,
// quedarse con la mejor. Con dos diferencias deliberadas:
//
// 1. FALLA CERRADO. El verificador de imágenes devuelve "sin problemas" si se
//    cae, porque ahí bloquear la generación es peor que dejar pasar una placa.
//    Acá no: si el crítico falla, la pieza NO se publica, va a revisión humana.
//    La diferencia entre autonomía con cable de seguridad y autonomía a ciegas.
//
// 2. EXIGE CITA TEXTUAL. Cada violación tiene que citar el fragmento exacto de
//    la pieza que la comete. Un crítico que puede describir una violación en
//    abstracto inventa violaciones y también deja pasar las reales; obligarlo a
//    anclarse en texto verbatim lo mantiene honesto en las dos direcciones.
//
// El crítico no reescribe. Diagnostica, y quien generó vuelve a intentar
// sabiendo exactamente qué se coló.

import Anthropic from "@anthropic-ai/sdk"
import { parsearRespuesta } from "@/lib/ai/json"
import { revisionDeterministica } from "@/lib/brand/normalize"
import { bloqueVara, bloquePersona, bloquePruebas } from "@/lib/brand/prompt"
import { personaDe, type BrandProfile } from "@/lib/brand/types"

const MODEL = "claude-sonnet-5"
const MAX_REESCRITURAS = 2

export interface Ficha {
  buyer: string
  aprendizaje: string
  por_que_avanzo: string
  creencia?: string
}

export interface PiezaRevisable {
  /** El texto completo tal como se publicaría, ya ensamblado. */
  texto: string
  ficha: Ficha
  /** Material de origen. Sirve para verificar que las cifras se rastreen. */
  fuente?: string
}

export interface Violacion {
  regla: string
  /** Fragmento textual de la pieza que comete la violación. Obligatorio. */
  cita: string
  por_que: string
  severidad: "bloquea" | "menor"
}

export type EstadoVeredicto = "aprobado" | "reescribir" | "revision_humana"

export interface Veredicto {
  estado: EstadoVeredicto
  violaciones: Violacion[]
  /** Por qué escaló a revisión humana, cuando corresponde. */
  motivo?: string
}

function systemPrompt(profile: BrandProfile, personaId: string): string {
  const reglas = profile.voz.verificables
    .map((v) => `### ${v.id}\nREGLA: ${v.regla}\nCÓMO SE COMPRUEBA: ${v.criterio}`)
    .join("\n\n")

  return `Sos el control de calidad editorial de ${profile.name}. Tu trabajo es encontrar violaciones, no mejorar la pieza ni felicitarla. No reescribís nada.

${bloquePersona(profile, personaId)}

${bloqueVara(profile)}

${bloquePruebas(profile)}

${profile.confidencialidad}

## Reglas a verificar, una por una
${reglas}

## Cómo trabajás
- Evaluá CADA regla por separado, en orden. No agrupes ni saltees.
- Por cada violación tenés que CITAR el fragmento textual exacto de la pieza que la comete, copiado verbatim. Si no podés citar el texto que viola la regla, esa violación NO existe: no la reportes.
- No inventes violaciones para parecer riguroso, y no dejes pasar una violación real porque la pieza en general está bien escrita. Las dos cosas son fallas tuyas.
- "severidad": "bloquea" si la regla está en la lista de arriba; "menor" si es una observación de estilo que no la incumple.
- Si la pieza no viola ninguna regla, devolvé "violaciones": []. Está permitido y es lo esperable en una pieza buena.

RESPONDÉ EXCLUSIVAMENTE con JSON válido (sin markdown):
{ "violaciones": [ { "regla": "id_de_la_regla", "cita": "fragmento verbatim de la pieza", "por_que": "por qué incumple, contra el criterio", "severidad": "bloquea" } ] }`
}

function userMessage(pieza: PiezaRevisable): string {
  return `Revisá esta pieza.

## Ficha declarada
- Persona: ${pieza.ficha.buyer}
- Aprendizaje: ${pieza.ficha.aprendizaje}
- Por qué avanzó: ${pieza.ficha.por_que_avanzo}
${pieza.ficha.creencia ? `- Creencia que discute: ${pieza.ficha.creencia}` : ""}

## Pieza
${pieza.texto}
${pieza.fuente ? `\n## Material de origen (para verificar que las cifras se rastreen)\n${pieza.fuente}` : "\n## Material de origen\n(no se entregó fuente: cualquier cifra de la pieza que no salga del registro de pruebas falla)"}

Devolvé el JSON de violaciones.`
}

/**
 * Revisa una pieza. Falla cerrado: ante cualquier error devuelve
 * revision_humana, nunca aprobado.
 */
export async function revisar(profile: BrandProfile, pieza: PiezaRevisable): Promise<Veredicto> {
  // Capa determinística primero: es gratis y atrapa lo que no requiere criterio.
  const { bloqueos } = revisionDeterministica(profile, pieza.texto)
  const deterministicas: Violacion[] = bloqueos.map((b) => ({
    regla: "prohibicion",
    cita: b.termino,
    por_que: b.motivo,
    severidad: "bloquea",
  }))

  // La ficha tiene que apuntar a una persona real del perfil.
  try {
    personaDe(profile, pieza.ficha.buyer)
  } catch {
    return {
      estado: "revision_humana",
      violaciones: deterministicas,
      motivo: `La ficha declara la persona "${pieza.ficha.buyer}", que no existe en el perfil.`,
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      estado: "revision_humana",
      violaciones: deterministicas,
      motivo: "ANTHROPIC_API_KEY no configurada: no se pudo correr la revisión de criterio.",
    }
  }

  let porCriterio: Violacion[]
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: systemPrompt(profile, pieza.ficha.buyer),
      messages: [{ role: "user", content: userMessage(pieza) }],
    })
    const parsed = parsearRespuesta<{ violaciones?: unknown }>(res)
    porCriterio = normalizarViolaciones(parsed.violaciones, pieza.texto)
  } catch (err) {
    // Falla cerrado: sin revisión de criterio no hay aprobación posible.
    return {
      estado: "revision_humana",
      violaciones: deterministicas,
      motivo: `El crítico falló: ${err instanceof Error ? err.message : "error desconocido"}`,
    }
  }

  const violaciones = [...deterministicas, ...porCriterio]
  const bloqueantes = violaciones.filter((v) => v.severidad === "bloquea")
  return { estado: bloqueantes.length ? "reescribir" : "aprobado", violaciones }
}

/**
 * Descarta violaciones cuya cita no aparece en la pieza. Es la contracara de
 * exigir cita textual: si el crítico no pudo anclarse en el texto real, se la
 * inventó.
 */
function normalizarViolaciones(raw: unknown, texto: string): Violacion[] {
  if (!Array.isArray(raw)) return []
  const normalizado = texto.toLowerCase()
  return raw
    .map((v) => {
      const o = (v ?? {}) as Record<string, unknown>
      return {
        regla: String(o.regla ?? "").trim(),
        cita: String(o.cita ?? "").trim(),
        por_que: String(o.por_que ?? "").trim(),
        severidad: o.severidad === "menor" ? ("menor" as const) : ("bloquea" as const),
      }
    })
    .filter((v) => v.regla && v.cita && normalizado.includes(v.cita.toLowerCase()))
}

export interface ResultadoCiclo<T> {
  pieza: T
  veredicto: Veredicto
  /** Cuántas reescrituras hicieron falta. 0 = salió bien de una. */
  rondas: number
}

/**
 * Ciclo de calidad: generar, revisar, regenerar nombrando lo que se coló.
 *
 * `generar` recibe las violaciones de la ronda anterior (vacío en la primera) y
 * devuelve la pieza. `aRevisable` la convierte al formato que lee el crítico.
 *
 * Se queda con el intento de MENOS violaciones bloqueantes, no con el último:
 * una reescritura puede empeorar, y asumir que el reintento mejora es el error
 * clásico de este patrón.
 */
export async function cicloDeCalidad<T>(
  profile: BrandProfile,
  generar: (violaciones: Violacion[]) => Promise<T>,
  aRevisable: (pieza: T) => PiezaRevisable,
  /**
   * Chequeos sobre otros ejes además de la voz (repetición, por ejemplo). Lo
   * que devuelva se suma a las violaciones y alimenta la regeneración igual
   * que las del crítico.
   */
  verificacionExtra?: (pieza: T) => Promise<Violacion[]>,
): Promise<ResultadoCiclo<T>> {
  let mejor: { pieza: T; veredicto: Veredicto } | null = null

  for (let ronda = 0; ronda <= MAX_REESCRITURAS; ronda++) {
    const violacionesPrevias = mejor?.veredicto.violaciones ?? []
    const pieza = await generar(violacionesPrevias)

    const base = await revisar(profile, aRevisable(pieza))
    const extra = verificacionExtra ? await verificacionExtra(pieza) : []
    const violaciones = [...base.violaciones, ...extra]
    const veredicto: Veredicto =
      base.estado === "revision_humana"
        ? { ...base, violaciones }
        : {
            estado: violaciones.some((v) => v.severidad === "bloquea") ? "reescribir" : "aprobado",
            violaciones,
          }

    if (veredicto.estado === "aprobado") return { pieza, veredicto, rondas: ronda }

    const bloqueantes = veredicto.violaciones.filter((v) => v.severidad === "bloquea").length
    const mejorHasta = mejor
      ? mejor.veredicto.violaciones.filter((v) => v.severidad === "bloquea").length
      : Infinity
    if (bloqueantes < mejorHasta) mejor = { pieza, veredicto }

    // Si el crítico no pudo opinar, reintentar no arregla nada.
    if (veredicto.estado === "revision_humana") break
  }

  const final = mejor!
  return {
    pieza: final.pieza,
    veredicto: {
      ...final.veredicto,
      estado: "revision_humana",
      motivo:
        final.veredicto.motivo ??
        `Quedaron violaciones después de ${MAX_REESCRITURAS} reescrituras.`,
    },
    rondas: MAX_REESCRITURAS,
  }
}

/** Bloque para inyectar en el regenerado, nombrando lo que se coló. */
export function bloqueCorreccion(violaciones: Violacion[]): string {
  if (!violaciones.length) return ""
  const lista = violaciones
    .map((v) => `- [${v.regla}] En "${v.cita}": ${v.por_que}`)
    .join("\n")
  return `## El intento anterior falló la revisión
Corregí EXACTAMENTE esto y nada más; no reescribas de cero lo que ya estaba bien:
${lista}`
}
