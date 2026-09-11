// Generador de carruseles. Produce la pieza en la forma que sirve para los dos
// destinos: en LinkedIn se publica como documento deslizable (el formato de
// mejor rendimiento) y en Instagram como carrusel.
//
// No renderiza imágenes: produce el TEXTO de cada slide más la dirección visual.
// Así la calidad de la voz se puede validar sin gastar en generación de imagen,
// que es la parte cara y la que conviene enchufar una vez que el texto afina.

import Anthropic from "@anthropic-ai/sdk"
import { parsearRespuesta } from "@/lib/ai/json"
import { normalizar } from "@/lib/brand/normalize"
import { bloqueVoz } from "@/lib/brand/prompt"
import type { BrandProfile } from "@/lib/brand/types"
import {
  bloqueCorreccion,
  cicloDeCalidad,
  type Ficha,
  type PiezaRevisable,
  type ResultadoCiclo,
  type Violacion,
} from "./critic"
import { bloqueObjetivo, type Objetivo } from "./objectives"

const MODEL = "claude-sonnet-5"

export interface Slide {
  numero: number
  titulo: string
  cuerpo: string
  /** Qué debería mostrar el diseño. Alimenta después la generación de imagen. */
  sugerencia_visual: string
}

export interface Carrusel {
  /** Referencia corta para la cola. No se publica. */
  titulo_interno: string
  /** El texto que acompaña al carrusel. */
  copy_post: string
  slides: Slide[]
  ficha: Ficha
}

export interface EntradaCarrusel {
  /** Material de referencia. No se inventa nada fuera de esto. */
  fuente: string
  objetivo: Objetivo
  /** El ángulo puntual a desarrollar, si ya está elegido. */
  tematica?: string
  personaId?: string
  creenciaId?: string
  firmaId?: string
  /** URL para el CTA, cuando el objetivo la pide. */
  url?: string
  contextoExtra?: string
}

const REGLAS_FORMATO = `## Reglas del formato carrusel
1. TODAS las slides llevan texto real. El ÚLTIMO slide es el CIERRE: una sola línea que condensa la tesis, máximo ~110 caracteres. Prohibido dejar una slide vacía o agregar una slide extra de logo, marca o contacto al final — la última slide con texto ES el cierre.
2. Estructura: gancho (el problema o la tensión) → qué está pasando de verdad → qué se hace con eso → cierre. La slide 1 frena el scroll.
3. La slide 1 es UNA sola oración que se entiende sola. Prohibido el título hecho de fragmentos cortados, tanto con comas como con puntos: se lee entrecortado y no engancha. Elegí el ángulo más fuerte y escribí una oración que fluya.
4. Cada slide lleva "sugerencia_visual": qué mostrar (un dato en grande, un diagrama simple, una captura). Maquetación plana.
5. Ninguna URL ni dato de contacto DENTRO de una slide. El CTA vive en el copy_post.
6. "copy_post": corto y concreto, 2 o 3 líneas. En mobile el CTA tiene que verse sin hacer "ver más". Prohibido desarrollar acá lo que ya está en las slides: si el copy repite las slides, está mal.
7. "titulo_interno": una referencia corta para la cola de aprobación. No se publica.`

function systemPrompt(profile: BrandProfile, entrada: EntradaCarrusel): string {
  return `Sos el redactor de contenido de ${profile.name}. Generás carruseles que enseñan algo con criterio propio.

${bloqueObjetivo(entrada.objetivo)}

${bloqueVoz(profile, {
  personaId: entrada.personaId,
  creenciaId: entrada.creenciaId,
  firmaId: entrada.firmaId,
})}

${REGLAS_FORMATO}

RESPONDÉ EXCLUSIVAMENTE con JSON válido (sin markdown):
{
  "titulo_interno": "...",
  "copy_post": "...",
  "slides": [{ "numero": 1, "titulo": "...", "cuerpo": "...", "sugerencia_visual": "..." }],
  "ficha": { "buyer": "...", "aprendizaje": "...", "por_que_avanzo": "...", "creencia": "" }
}`
}

function userMessage(entrada: EntradaCarrusel, violaciones: Violacion[]): string {
  const correccion = bloqueCorreccion(violaciones)
  return `Generá el carrusel.

${entrada.tematica?.trim() ? `TEMÁTICA (enfocá TODA la pieza solo en esto): ${entrada.tematica}\n` : ""}
FUENTE (material de referencia; no inventes nada fuera de esto):
${entrada.fuente}
${entrada.contextoExtra?.trim() ? `\nCONTEXTO ADICIONAL:\n${entrada.contextoExtra}` : ""}
${entrada.url?.trim() ? `\nURL para el CTA del copy_post (copiala literal, sin acortadores ni placeholders): ${entrada.url}` : ""}
${correccion ? `\n${correccion}` : ""}

Devolvé el JSON completo, con la ficha.`
}

function normalizarSalida(profile: BrandProfile, raw: Record<string, unknown>): Carrusel {
  // Descarta slides vacías y renumera: el modelo a veces agrega una slide de
  // cierre en blanco, y si no se limpia queda una placa vacía en el render.
  const slidesRaw = Array.isArray(raw.slides) ? (raw.slides as Record<string, unknown>[]) : []
  const slides: Slide[] = slidesRaw
    .map((s) => ({
      numero: 0,
      titulo: normalizar(profile, String(s.titulo ?? "").trim()),
      cuerpo: normalizar(profile, String(s.cuerpo ?? "").trim()),
      sugerencia_visual: String(s.sugerencia_visual ?? "").trim(),
    }))
    .filter((s) => (s.titulo + s.cuerpo).trim().length > 0)
    .map((s, i) => ({ ...s, numero: i + 1 }))

  const fichaRaw = (raw.ficha ?? {}) as Record<string, unknown>
  const creencia = String(fichaRaw.creencia ?? "").trim()

  return {
    titulo_interno: String(raw.titulo_interno ?? "Sin título").trim(),
    copy_post: normalizar(profile, String(raw.copy_post ?? "").trim()),
    slides,
    ficha: {
      buyer: String(fichaRaw.buyer ?? profile.personaDefault).trim(),
      aprendizaje: String(fichaRaw.aprendizaje ?? "").trim(),
      por_que_avanzo: String(fichaRaw.por_que_avanzo ?? "").trim(),
      ...(creencia ? { creencia } : {}),
    },
  }
}

/** Ensambla la pieza como la lee el crítico: todo el texto publicable junto. */
export function aRevisable(carrusel: Carrusel, fuente?: string): PiezaRevisable {
  const slides = carrusel.slides
    .map((s) => `[Slide ${s.numero}] ${s.titulo}${s.cuerpo ? `\n${s.cuerpo}` : ""}`)
    .join("\n\n")
  return {
    texto: `COPY DEL POST:\n${carrusel.copy_post}\n\nSLIDES:\n${slides}`,
    ficha: carrusel.ficha,
    fuente,
  }
}

async function generarUna(
  profile: BrandProfile,
  entrada: EntradaCarrusel,
  violaciones: Violacion[],
): Promise<Carrusel> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY no configurada")

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 3072,
    system: systemPrompt(profile, entrada),
    messages: [{ role: "user", content: userMessage(entrada, violaciones) }],
  })

  return normalizarSalida(profile, parsearRespuesta(res))
}

/**
 * Genera un carrusel y lo pasa por el ciclo de calidad: si el crítico encuentra
 * violaciones, se regenera nombrándolas, hasta dos veces. Lo que no cierra
 * queda en revision_humana con el detalle de qué falló.
 */
export async function generarCarrusel(
  profile: BrandProfile,
  entrada: EntradaCarrusel,
): Promise<ResultadoCiclo<Carrusel>> {
  return cicloDeCalidad(
    profile,
    (violaciones) => generarUna(profile, entrada, violaciones),
    (carrusel) => aRevisable(carrusel, entrada.fuente),
  )
}
