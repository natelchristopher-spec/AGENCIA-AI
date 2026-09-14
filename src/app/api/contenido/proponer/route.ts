import { NextResponse } from "next/server"
import { verificarAcceso } from "@/lib/acceso"
import { AGENCIA } from "@/lib/brand/profiles/agencia"
import { proponerTemas } from "@/lib/content/proponer"
import { barrerTendencias, combinarBloques } from "@/lib/sourcing/trends"

export const runtime = "nodejs"
export const maxDuration = 300

const MINIMO_FUENTE = 80

export async function POST(req: Request) {
  const denegado = verificarAcceso(req)
  if (denegado) return denegado

  let body: { modo?: string; servicios?: string[]; fuente?: string; persona?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const personaId = body.persona || AGENCIA.personaDefault

  try {
    let material = (body.fuente ?? "").trim()
    let fallidas: string[] = []

    if (body.modo === "tendencia") {
      // Para tendencias el material lo trae el sistema: no se pega nada.
      const servicios = Array.isArray(body.servicios)
        ? body.servicios.filter((s) => typeof s === "string")
        : undefined
      const barrido = await barrerTendencias(AGENCIA, servicios)
      fallidas = barrido.fallidas
      if (barrido.bloques.length === 0) {
        return NextResponse.json(
          { error: "No respondió ninguna fuente en este momento.", fallidas },
          { status: 422 },
        )
      }
      material = combinarBloques(barrido.bloques)
    } else if (material.length < MINIMO_FUENTE) {
      return NextResponse.json(
        { error: `Pegá o importá la fuente (mínimo ${MINIMO_FUENTE} caracteres).` },
        { status: 400 },
      )
    }

    const propuesta = await proponerTemas(AGENCIA, material, { personaId })
    return NextResponse.json({ ...propuesta, fallidas, material })
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error proponiendo temas"
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
