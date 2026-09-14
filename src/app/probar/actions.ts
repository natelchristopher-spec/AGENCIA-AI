"use server"

import { AGENCIA } from "@/lib/brand/profiles/agencia"
import { aRevisable, generarUnaVez, type Carrusel } from "@/lib/content/carousel"
import { revisar, type Veredicto } from "@/lib/content/critic"
import type { Objetivo } from "@/lib/content/objectives"

export interface ResultadoPrueba {
  ok: boolean
  error?: string
  pieza?: Carrusel
  veredicto?: Veredicto
  segundos?: string
}

/**
 * Una sola pasada: generar y criticar, sin ciclo de reescritura.
 *
 * Es lo que sirve para calibrar —el veredicto sobre el primer intento dice si
 * la vara está bien puesta— y además entra cómodo en el límite de tiempo de
 * una función serverless, que el ciclo completo con dos reescrituras no.
 */
export async function probarPieza(
  _prev: ResultadoPrueba | null,
  formData: FormData,
): Promise<ResultadoPrueba> {
  const fuente = String(formData.get("fuente") ?? "").trim()
  if (!fuente) return { ok: false, error: "Falta la fuente: el sistema no inventa nada fuera de ella." }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      ok: false,
      error:
        "Falta ANTHROPIC_API_KEY en las variables de entorno de Vercel. Settings → Environment Variables, y volvé a desplegar.",
    }
  }

  const personaId = String(formData.get("persona") ?? AGENCIA.personaDefault)
  const creenciaId = String(formData.get("creencia") ?? "")
  const objetivo = String(formData.get("objetivo") ?? "autoridad") as Objetivo

  const inicio = Date.now()
  try {
    const pieza = await generarUnaVez(AGENCIA, {
      fuente,
      objetivo,
      personaId,
      creenciaId: creenciaId || undefined,
    })
    const veredicto = await revisar(AGENCIA, aRevisable(pieza, fuente))
    return {
      ok: true,
      pieza,
      veredicto,
      segundos: ((Date.now() - inicio) / 1000).toFixed(1),
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error desconocido" }
  }
}
