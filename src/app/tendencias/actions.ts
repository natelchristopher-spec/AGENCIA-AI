"use server"

import { AGENCIA } from "@/lib/brand/profiles/agencia"
import { proponerTemas, type Propuesta } from "@/lib/content/proponer"
import { barrerTendencias, combinarBloques } from "@/lib/sourcing/trends"

export interface ResultadoBarrido {
  ok: boolean
  error?: string
  propuesta?: Propuesta
  /** Fuentes que no respondieron. Se informan a propósito. */
  fallidas?: string[]
  leidas?: number
  segundos?: string
}

export async function barrer(
  _prev: ResultadoBarrido | null,
  formData: FormData,
): Promise<ResultadoBarrido> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "Falta ANTHROPIC_API_KEY en las variables de entorno de Vercel." }
  }

  const personaId = String(formData.get("persona") ?? AGENCIA.personaDefault)
  const servicio = String(formData.get("servicio") ?? "")
  const inicio = Date.now()

  try {
    const { bloques, fallidas } = await barrerTendencias(
      AGENCIA,
      servicio ? [servicio] : undefined,
    )

    if (bloques.length === 0) {
      return {
        ok: false,
        error: "No respondió ninguna fuente. Puede ser un corte temporal o feeds que cambiaron de URL.",
        fallidas,
      }
    }

    const propuesta = await proponerTemas(AGENCIA, combinarBloques(bloques), { personaId })

    return {
      ok: true,
      propuesta,
      fallidas,
      leidas: bloques.length,
      segundos: ((Date.now() - inicio) / 1000).toFixed(1),
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error desconocido" }
  }
}
