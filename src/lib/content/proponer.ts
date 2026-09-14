// Propone temas a partir del barrido de tendencias.
//
// Es el paso que convierte material crudo en ángulos con criterio, y el que
// decide la calidad de todo lo que viene después: un buen generador sobre un
// tema obvio produce una pieza obvia bien escrita.
//
// El filtro que importa es contra el `yaSabe` de la persona. Una novedad de
// plataforma no es material por ser novedad: si el lector ya la conoce, o si
// la consecuencia es la que cualquiera deduciría, es ruido. Por eso cada tema
// propuesto tiene que declarar POR QUÉ no es obvio, igual que la ficha de una
// pieza — y un tema que no puede justificarlo se descarta acá, antes de gastar
// una generación entera en él.

import { completarJson, hayClave } from "@/lib/ai/llm"
import { bloquePersona, bloqueVara } from "@/lib/brand/prompt"
import { personaDe, type BrandProfile } from "@/lib/brand/types"

export interface TemaPropuesto {
  /** Id del servicio al que ancla, copiado del rótulo de la fuente. */
  servicioId: string
  fuente: string
  /** El tema, en una línea. */
  tematica: string
  /** El ángulo concreto: qué se diría sobre esto. */
  angulo: string
  /** Por qué no es obvio PARA ESA PERSONA, contra su `yaSabe`. */
  porQueNoEsObvio: string
}

export interface Propuesta {
  temas: TemaPropuesto[]
  /** Temas que se miraron y se descartaron, con el motivo. Sirve para calibrar. */
  descartados: { tematica: string; motivo: string }[]
}

function systemPrompt(profile: BrandProfile, personaId: string): string {
  const servicios = profile.servicios.map((s) => `- ${s.id}: ${s.nombre} — ${s.resuelve}`).join("\n")

  return `Sos el editor de contenido de ${profile.name}, ${profile.descriptor}. Recibís material en bruto de fuentes del rubro y proponés qué vale la pena escribir.

Tu trabajo NO es resumir las novedades. Es encontrar, entre todo el ruido, las pocas que tienen una consecuencia de negocio que el lector no vería solo.

${bloquePersona(profile, personaId)}

${bloqueVara(profile)}

## Servicios a los que puede anclar un tema
${servicios}

## Cómo elegís
- Una novedad NO es material por ser novedad. La pregunta es qué cambia de una DECISIÓN que esta persona toma.
- Descartá sin culpa: de veinte novedades, sirven dos o tres. Proponer de más es peor que proponer de menos, porque cada tema flojo se convierte en una pieza floja.
- Si la consecuencia de la novedad es la que cualquiera del rubro deduciría en diez segundos, es obvia. Descartala.
- El "servicioId" se copia EXACTO del rótulo SERVICIO del material. No lo inventes ni lo traduzcas.
- Un tema puede combinar dos novedades si juntas dicen algo que por separado no dicen.

## Qué devolvés
Para cada tema propuesto:
- "tematica": el tema en una línea.
- "angulo": qué se diría concretamente. No el título: la tesis.
- "porQueNoEsObvio": el argumento contra lo que la persona YA SABE. Si el argumento es débil, el tema es obvio y va a "descartados" en vez de a "temas".

También devolvé "descartados": los temas que miraste y dejaste afuera, con el motivo en pocas palabras. Sirve para saber si el filtro está bien puesto.

RESPONDÉ EXCLUSIVAMENTE con JSON válido (sin markdown):
{
  "temas": [{ "servicioId": "...", "fuente": "...", "tematica": "...", "angulo": "...", "porQueNoEsObvio": "..." }],
  "descartados": [{ "tematica": "...", "motivo": "..." }]
}`
}

export async function proponerTemas(
  profile: BrandProfile,
  material: string,
  opts: { personaId?: string; yaCubiertas?: string[]; maximo?: number } = {},
): Promise<Propuesta> {
  if (!hayClave()) throw new Error("OPENAI_API_KEY no configurada")
  if (!material.trim()) return { temas: [], descartados: [] }

  const personaId = opts.personaId ?? profile.personaDefault
  personaDe(profile, personaId) // valida que exista antes de gastar la llamada

  const maximo = opts.maximo ?? 5
  const cubiertas = opts.yaCubiertas?.length
    ? `\n\nYA ESCRIBIMOS SOBRE ESTO — no lo vuelvas a proponer:\n${opts.yaCubiertas.slice(0, 60).map((t) => `- ${t}`).join("\n")}`
    : ""

  const hoy = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })

  const parsed = await completarJson<{ temas?: unknown; descartados?: unknown }>({
    rol: "proponer",
    maxTokens: 3072,
    system: systemPrompt(profile, personaId),
    user: `Hoy es ${hoy}. Proponé como máximo ${maximo} temas a partir de este material.${cubiertas}

MATERIAL EN BRUTO:
${material}`,
  })

  const temas: TemaPropuesto[] = Array.isArray(parsed.temas)
    ? (parsed.temas as Record<string, unknown>[])
        .map((t) => ({
          servicioId: String(t.servicioId ?? "").trim(),
          fuente: String(t.fuente ?? "").trim(),
          tematica: String(t.tematica ?? "").trim(),
          angulo: String(t.angulo ?? "").trim(),
          porQueNoEsObvio: String(t.porQueNoEsObvio ?? "").trim(),
        }))
        // Un tema sin justificación de no-obviedad no pasa: es exactamente el
        // caso que produce contenido correcto y olvidable.
        .filter((t) => t.tematica && t.angulo && t.porQueNoEsObvio)
        .filter((t) => profile.servicios.some((s) => s.id === t.servicioId))
        .slice(0, maximo)
    : []

  const descartados = Array.isArray(parsed.descartados)
    ? (parsed.descartados as Record<string, unknown>[])
        .map((d) => ({
          tematica: String(d.tematica ?? "").trim(),
          motivo: String(d.motivo ?? "").trim(),
        }))
        .filter((d) => d.tematica)
        .slice(0, 20)
    : []

  return { temas, descartados }
}
