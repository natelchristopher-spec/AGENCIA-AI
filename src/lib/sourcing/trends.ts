// Barrido de fuentes de tendencia.
//
// Lee todas las fuentes en paralelo y devuelve las que respondieron MÁS la
// lista de las que fallaron. Devolver los fracasos es deliberado: una fuente
// que dejó de responder hace semanas empobrece el contenido en silencio, y
// nadie se entera si el barrido solo informa lo que salió bien.

import type { BrandProfile } from "@/lib/brand/types"
import { FUENTES } from "./fuentes"
import { leerUrl } from "./scrape"

export interface BloqueTendencia {
  servicioId: string
  servicioNombre: string
  fuente: string
  url: string
  titulo: string
  texto: string
}

export interface Barrido {
  bloques: BloqueTendencia[]
  fallidas: string[]
}

/** Lee las fuentes de los servicios indicados, o de todos si no se pasa ninguno. */
export async function barrerTendencias(
  profile: BrandProfile,
  servicioIds?: string[],
): Promise<Barrido> {
  const grupos = servicioIds?.length
    ? FUENTES.filter((f) => servicioIds.includes(f.servicioId))
    : FUENTES

  const tareas = grupos.flatMap((grupo) => {
    const servicio = profile.servicios.find((s) => s.id === grupo.servicioId)
    return grupo.fuentes.map(async (f) => {
      const r = await leerUrl(f.url)
      return {
        servicioId: grupo.servicioId,
        servicioNombre: servicio?.nombre ?? grupo.servicioId,
        fuente: f.nombre,
        url: f.url,
        titulo: r?.titulo ?? "",
        texto: r?.texto ?? "",
      }
    })
  })

  const resultados = await Promise.all(tareas)
  return {
    bloques: resultados.filter((r) => r.texto.length > 120),
    fallidas: resultados.filter((r) => r.texto.length <= 120).map((r) => r.fuente),
  }
}

/**
 * Junta los bloques en un solo texto rotulado. El rótulo lleva el id exacto del
 * servicio para que el modelo lo copie tal cual y no lo reinvente.
 */
export function combinarBloques(bloques: BloqueTendencia[], maxPorFuente = 2500): string {
  return bloques
    .map(
      (b) =>
        `### SERVICIO: ${b.servicioId} (${b.servicioNombre}) — FUENTE: ${b.fuente} (${b.url})\n${b.texto.slice(0, maxPorFuente)}`,
    )
    .join("\n\n")
}
