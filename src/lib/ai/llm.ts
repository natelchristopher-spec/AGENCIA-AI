// Única puerta de salida hacia el modelo.
//
// Todo el sistema pasa por acá: cambiar de proveedor o de modelo se hace en
// este archivo y en ningún otro. Antes cada módulo creaba su propio cliente, y
// mover de Anthropic a OpenAI tocó cinco archivos — no va a volver a pasar.
//
// Los roles usan modelos DISTINTOS a propósito. Un modelo juzgando su propia
// salida tiende a darse la razón: que el crítico corra sobre otro modelo que el
// generador recupera parte de la independencia del juicio.

import OpenAI from "openai"
import { extraerJson } from "./json"

export type Rol = "generar" | "criticar" | "proponer"

const MODELO_POR_ROL: Record<Rol, string> = {
  generar: process.env.OPENAI_MODEL_GENERAR || "gpt-4o",
  criticar: process.env.OPENAI_MODEL_CRITICAR || "gpt-4o-mini",
  proponer: process.env.OPENAI_MODEL_PROPONER || "gpt-4o",
}

export function modeloDe(rol: Rol): string {
  return MODELO_POR_ROL[rol]
}

export function hayClave(): boolean {
  return Boolean(process.env.OPENAI_API_KEY)
}

function cliente(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY no configurada")
  return new OpenAI({ apiKey })
}

export interface OpcionesLlm {
  rol: Rol
  system: string
  user: string
  maxTokens: number
  /** Menor = más previsible. El crítico va bajo: queremos consistencia. */
  temperature?: number
}

/**
 * Pide una respuesta JSON y la devuelve parseada.
 *
 * Usa el modo JSON del proveedor, que garantiza sintaxis válida, pero igual
 * pasa por el reparador: el modo JSON no protege contra el corte por longitud,
 * que es el caso que de verdad rompe.
 */
export async function completarJson<T = Record<string, unknown>>(opts: OpcionesLlm): Promise<T> {
  const res = await cliente().chat.completions.create({
    model: modeloDe(opts.rol),
    max_tokens: opts.maxTokens,
    temperature: opts.temperature ?? (opts.rol === "criticar" ? 0.2 : 0.8),
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  })

  const eleccion = res.choices[0]
  const texto = eleccion?.message?.content ?? ""

  try {
    return extraerJson<T>(texto)
  } catch (err) {
    if (eleccion?.finish_reason === "length") {
      throw new Error("La respuesta se cortó por longitud. Reintentá con menos contenido.")
    }
    throw err
  }
}
