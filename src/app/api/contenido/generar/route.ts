import { NextResponse } from "next/server"
import { verificarAcceso } from "@/lib/acceso"
import { AGENCIA } from "@/lib/brand/profiles/agencia"
import { aRevisable, generarUnaVez } from "@/lib/content/carousel"
import { revisar } from "@/lib/content/critic"
import type { Objetivo } from "@/lib/content/objectives"

export const runtime = "nodejs"
export const maxDuration = 300

// Desarrolla UN tema. El front llama a esta ruta una vez por tema seleccionado,
// en serie: así puede mostrar progreso real y un tema que falle no se lleva
// puestos a los demás.
//
// Genera una sola vez y critica, sin ciclo de reescritura. En modo manual eso
// es lo que corresponde: el veredicto sobre el primer intento es el que te
// dice si la vara está bien puesta, y vos decidís si vale la pena reintentar.

export async function POST(req: Request) {
  const denegado = verificarAcceso(req)
  if (denegado) return denegado

  let body: {
    fuente?: string
    tematica?: string
    angulo?: string
    persona?: string
    objetivo?: string
    creencia?: string
    servicioId?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const fuente = (body.fuente ?? "").trim()
  if (!fuente) return NextResponse.json({ error: "Falta la fuente" }, { status: 400 })

  const servicio = AGENCIA.servicios.find((s) => s.id === body.servicioId)
  const tematica = [body.tematica, body.angulo].filter(Boolean).join(" — ")

  try {
    const pieza = await generarUnaVez(AGENCIA, {
      fuente,
      tematica: tematica || undefined,
      objetivo: (body.objetivo as Objetivo) || "autoridad",
      personaId: body.persona || AGENCIA.personaDefault,
      creenciaId: body.creencia || undefined,
      contextoExtra: servicio
        ? `Esta pieza ancla al servicio "${servicio.nombre}": ${servicio.resuelve}`
        : undefined,
    })

    const veredicto = await revisar(AGENCIA, aRevisable(pieza, fuente))
    return NextResponse.json({ pieza, veredicto })
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error generando"
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
