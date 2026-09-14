// Cola de contenido: la máquina de estados que sostiene la operación autónoma.
//
// Existe por tres razones, y la tercera es la que importa para poder soltar el
// sistema:
//
// 1. Desacopla generar de publicar. Se genera cuando hay material y se publica
//    cuando toca, que no es el mismo momento.
// 2. Da dónde caer. Una pieza que el crítico no aprueba tiene que ir a algún
//    lado que no sea el vacío ni el feed.
// 3. Da la MEDICIÓN. Comparar el veredicto del crítico contra lo que decidió
//    el humano es el dato que dice si el sistema está listo para publicar solo.
//    Sin esa tasa, pasar a autonomía es una corazonada.

export type EstadoPieza =
  | "propuesta" // existe el ángulo, todavía no se generó
  | "generada" // generada y aprobada por el crítico, esperando decisión humana
  | "revision" // el crítico no pudo aprobarla: necesita ojo humano
  | "aprobada" // lista para programar
  | "rechazada" // descartada por el humano
  | "programada" // con fecha de publicación
  | "publicada"
  | "fallida" // falló la generación o la publicación

export type Canal = "linkedin" | "instagram"

export interface DecisionHumana {
  /** Qué hizo el humano con una pieza que el crítico había aprobado. */
  decision: "aprobo" | "rechazo" | "edito"
  motivo?: string
  fecha: string
}

export interface ItemCola {
  id: string
  perfilId: string
  estado: EstadoPieza
  canal: Canal

  /** Qué ángulo cubre. Se define al proponer, antes de generar. */
  personaId: string
  creenciaId?: string
  objetivo: string
  tematica?: string
  fuente?: string

  /** La pieza generada, serializada. Null mientras es propuesta. */
  contenido?: unknown

  /** Ficha declarada. Es la clave semántica para anti-redundancia. */
  aprendizaje?: string

  /** Qué dijo el crítico. Se guarda aunque haya aprobado: es la mitad de la medición. */
  veredicto?: "aprobado" | "reescribir" | "revision_humana"
  violaciones?: unknown
  rondas?: number

  /** Qué dijo el humano. La otra mitad. */
  humano?: DecisionHumana

  programadaPara?: string
  publicadaEn?: string
  urlPublicada?: string
  error?: string

  creadoEn: string
  actualizadoEn: string
}

// Transiciones válidas. Tenerlas explícitas evita que un bug mande algo de
// "revision" directo a "publicada" sin que nadie lo haya mirado.
const TRANSICIONES: Record<EstadoPieza, EstadoPieza[]> = {
  propuesta: ["generada", "revision", "fallida"],
  generada: ["aprobada", "rechazada", "revision"],
  revision: ["aprobada", "rechazada"],
  aprobada: ["programada", "rechazada"],
  rechazada: [],
  programada: ["publicada", "fallida", "aprobada"],
  publicada: [],
  fallida: ["propuesta", "rechazada"],
}

export function puedeTransicionar(desde: EstadoPieza, hacia: EstadoPieza): boolean {
  return TRANSICIONES[desde].includes(hacia)
}

export class TransicionInvalida extends Error {
  constructor(desde: EstadoPieza, hacia: EstadoPieza) {
    super(`Transición inválida: ${desde} → ${hacia}`)
    this.name = "TransicionInvalida"
  }
}

/**
 * Tasa de coincidencia entre el crítico y el humano.
 *
 * Es el número que decide si el sistema puede publicar sin supervisión. Mide
 * solo las piezas donde el humano se pronunció sobre algo que el crítico había
 * aprobado: si ahí coinciden, el crítico está calibrado.
 *
 * Los falsos positivos —el crítico aprueba algo que el humano rechaza— son los
 * caros: son los que se publicarían solos y no deberían.
 */
export function tasaDeCoincidencia(items: ItemCola[]): {
  evaluadas: number
  coincidencias: number
  falsosPositivos: number
  tasa: number
} {
  const evaluables = items.filter((i) => i.veredicto === "aprobado" && i.humano)
  const falsosPositivos = evaluables.filter((i) => i.humano!.decision === "rechazo").length
  const coincidencias = evaluables.length - falsosPositivos
  return {
    evaluadas: evaluables.length,
    coincidencias,
    falsosPositivos,
    tasa: evaluables.length ? coincidencias / evaluables.length : 0,
  }
}
