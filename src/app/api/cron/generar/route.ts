// Cron de generación: propone un ángulo, lo escribe y lo deja en cola.
//
// No publica nada. Su única salida es una fila en la cola esperando decisión,
// que es lo que corresponde en la fase donde todavía se está midiendo si el
// crítico coincide con el criterio humano.
//
// Nota sobre de dónde sale el material: con el registro de pruebas vacío el
// sistema tiene prohibido afirmar resultados, así que lo único que puede
// escribir es criterio y mecanismo — y para eso la creencia que discute ES el
// insumo. Cuando haya sourcing real, entra por `fuente` sin cambiar el resto.

import { NextResponse } from "next/server"
import { AGENCIA } from "@/lib/brand/profiles/agencia"
import { generarCarrusel } from "@/lib/content/carousel"
import { anguloMenosUsado } from "@/lib/content/redundancy"
import { leerConfig } from "@/lib/queue/config"
import { crearRepo } from "@/lib/queue/repo"
import { creenciaDe } from "@/lib/brand/types"

export const maxDuration = 300

function autorizado(req: Request): boolean {
  const secreto = process.env.CRON_SECRET
  // Sin secreto configurado el endpoint queda cerrado: un cron abierto es una
  // forma de que cualquiera te gaste la cuota de la API.
  if (!secreto) return false
  return req.headers.get("authorization") === `Bearer ${secreto}`
}

export async function GET(req: Request) {
  if (!autorizado(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const perfil = AGENCIA
  const config = await leerConfig(perfil.id)
  if (!config.activo) {
    return NextResponse.json({ ok: true, salteado: "operación desactivada" })
  }

  const repo = crearRepo()

  try {
    const recientes = await repo.recientes(20)
    const { personaId, creenciaId } = anguloMenosUsado(perfil, recientes)
    const creencia = creenciaDe(perfil, creenciaId)

    const item = await repo.crear({
      perfilId: perfil.id,
      canal: "linkedin",
      personaId,
      creenciaId,
      objetivo: "autoridad",
      tematica: creencia?.dice,
    })

    const { pieza, veredicto, rondas } = await generarCarrusel(perfil, {
      fuente: creencia
        ? `OBJECIÓN A DISCUTIR: "${creencia.dice}"\n\nPor qué el lector la cree: ${creencia.porQueLaCree}\n\nCon qué se desarma: ${creencia.seDerribaCon}`
        : "",
      objetivo: "autoridad",
      personaId,
      creenciaId,
      historial: repo,
    })

    // El crítico decide dónde cae: aprobada espera decisión humana, lo demás
    // necesita ojo antes de cualquier cosa.
    const estado = veredicto.estado === "aprobado" ? "generada" : "revision"
    const guardada = await repo.transicionar(item.id, estado, {
      contenido: pieza,
      aprendizaje: pieza.ficha.aprendizaje,
      veredicto: veredicto.estado,
      violaciones: veredicto.violaciones,
      rondas,
    })

    return NextResponse.json({
      ok: true,
      id: guardada.id,
      estado,
      veredicto: veredicto.estado,
      rondas,
      aprendizaje: pieza.ficha.aprendizaje,
    })
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "error desconocido"
    return NextResponse.json({ ok: false, error: mensaje }, { status: 500 })
  }
}
