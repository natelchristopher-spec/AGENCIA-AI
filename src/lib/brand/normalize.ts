// Capa determinística sobre la generación. Agnóstica de marca.
//
// Reparte el trabajo así: lo que se puede corregir sin ambigüedad se corrige
// solo y en silencio; lo que se puede DETECTAR sin ambigüedad pero no arreglar
// se reporta y bloquea; todo lo que requiere criterio queda para el crítico.
//
// Saber dónde termina el determinismo es la mitad del patrón: una sustitución
// que puede dar un falso positivo hace más daño que la regla que aplica.

import type { BrandProfile } from "./types"

function conservarMayuscula(original: string, reemplazo: string): string {
  const primera = original[0]
  const esMayuscula = primera === primera.toUpperCase() && primera !== primera.toLowerCase()
  return esMayuscula ? reemplazo[0].toUpperCase() + reemplazo.slice(1) : reemplazo
}

/** Aplica las correcciones inequívocas del perfil. Siempre, antes de revisar. */
export function normalizar(profile: BrandProfile, texto: string): string {
  if (!texto) return texto
  let out = texto
  for (const { re, to } of profile.voz.correcciones) {
    out = out.replace(re, (match) => conservarMayuscula(match, to))
  }
  return out
}

export interface Hallazgo {
  termino: string
  motivo: string
}

/** Prohibiciones encontradas. Vacío = pasa. */
export function detectarProhibiciones(profile: BrandProfile, texto: string): Hallazgo[] {
  const hallazgos: Hallazgo[] = []
  for (const { re, motivo } of profile.voz.prohibiciones) {
    // Los regex del perfil son globales y conservan lastIndex entre llamadas.
    const encontrados = texto.match(new RegExp(re.source, re.flags))
    if (!encontrados) continue
    for (const termino of new Set(encontrados.map((m) => m.trim()))) {
      hallazgos.push({ termino, motivo })
    }
  }
  return hallazgos
}

/**
 * Chequeo determinístico completo: corrige lo corregible y reporta lo que
 * bloquea. Lo que requiere criterio no se evalúa acá.
 */
export function revisionDeterministica(
  profile: BrandProfile,
  texto: string,
): { texto: string; bloqueos: Hallazgo[] } {
  const corregido = normalizar(profile, texto)
  return { texto: corregido, bloqueos: detectarProhibiciones(profile, corregido) }
}
