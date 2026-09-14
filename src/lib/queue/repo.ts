// Acceso a la cola. Dos implementaciones tras la misma interfaz: Supabase para
// producción y memoria para correr el sistema sin base de datos.
//
// El repositorio implementa también `Historial`, así anti-redundancia lee del
// mismo lugar donde vive la verdad de lo publicado, sin una copia aparte que
// pueda quedar desfasada.

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Historial, PiezaHistorica } from "@/lib/content/redundancy"
import {
  puedeTransicionar,
  TransicionInvalida,
  type Canal,
  type DecisionHumana,
  type EstadoPieza,
  type ItemCola,
} from "./types"

export interface NuevaPieza {
  perfilId: string
  canal: Canal
  personaId: string
  creenciaId?: string
  objetivo: string
  tematica?: string
  fuente?: string
}

export interface ColaRepo extends Historial {
  crear(pieza: NuevaPieza): Promise<ItemCola>
  obtener(id: string): Promise<ItemCola | null>
  listar(perfilId: string, estados?: EstadoPieza[]): Promise<ItemCola[]>
  actualizar(id: string, cambios: Partial<ItemCola>): Promise<ItemCola>
  /** Cambia de estado validando la transición. */
  transicionar(id: string, hacia: EstadoPieza, cambios?: Partial<ItemCola>): Promise<ItemCola>
  /** Lo que toca publicar: programadas cuya fecha ya pasó. */
  pendientesDePublicar(ahora?: Date): Promise<ItemCola[]>
}

function ahoraISO(): string {
  return new Date().toISOString()
}

// ── Memoria ─────────────────────────────────────────────────────────────────

export class ColaMemoria implements ColaRepo {
  private items = new Map<string, ItemCola>()

  async crear(pieza: NuevaPieza): Promise<ItemCola> {
    const ahora = ahoraISO()
    const item: ItemCola = {
      id: crypto.randomUUID(),
      estado: "propuesta",
      ...pieza,
      creadoEn: ahora,
      actualizadoEn: ahora,
    }
    this.items.set(item.id, item)
    return item
  }

  async obtener(id: string): Promise<ItemCola | null> {
    return this.items.get(id) ?? null
  }

  async listar(perfilId: string, estados?: EstadoPieza[]): Promise<ItemCola[]> {
    return [...this.items.values()]
      .filter((i) => i.perfilId === perfilId && (!estados || estados.includes(i.estado)))
      .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))
  }

  async actualizar(id: string, cambios: Partial<ItemCola>): Promise<ItemCola> {
    const actual = this.items.get(id)
    if (!actual) throw new Error(`Pieza ${id} no existe`)
    const nuevo = { ...actual, ...cambios, actualizadoEn: ahoraISO() }
    this.items.set(id, nuevo)
    return nuevo
  }

  async transicionar(id: string, hacia: EstadoPieza, cambios: Partial<ItemCola> = {}) {
    const actual = this.items.get(id)
    if (!actual) throw new Error(`Pieza ${id} no existe`)
    if (!puedeTransicionar(actual.estado, hacia)) throw new TransicionInvalida(actual.estado, hacia)
    return this.actualizar(id, { ...cambios, estado: hacia })
  }

  async pendientesDePublicar(ahora = new Date()): Promise<ItemCola[]> {
    const t = ahora.toISOString()
    return [...this.items.values()].filter(
      (i) => i.estado === "programada" && !!i.programadaPara && i.programadaPara <= t,
    )
  }

  async recientes(limite: number): Promise<PiezaHistorica[]> {
    return [...this.items.values()]
      .filter((i) => i.estado === "publicada" && i.aprendizaje)
      .sort((a, b) => (b.publicadaEn ?? "").localeCompare(a.publicadaEn ?? ""))
      .slice(0, limite)
      .map(aHistorica)
  }
}

// ── Supabase ────────────────────────────────────────────────────────────────

type Fila = Record<string, unknown>

function aItem(f: Fila): ItemCola {
  const humano: DecisionHumana | undefined = f.humano_decision
    ? {
        decision: f.humano_decision as DecisionHumana["decision"],
        motivo: (f.humano_motivo as string) ?? undefined,
        fecha: f.humano_fecha as string,
      }
    : undefined

  return {
    id: f.id as string,
    perfilId: f.perfil_id as string,
    estado: f.estado as EstadoPieza,
    canal: f.canal as Canal,
    personaId: f.persona_id as string,
    creenciaId: (f.creencia_id as string) ?? undefined,
    objetivo: f.objetivo as string,
    tematica: (f.tematica as string) ?? undefined,
    fuente: (f.fuente as string) ?? undefined,
    contenido: f.contenido ?? undefined,
    aprendizaje: (f.aprendizaje as string) ?? undefined,
    veredicto: (f.veredicto as ItemCola["veredicto"]) ?? undefined,
    violaciones: f.violaciones ?? undefined,
    rondas: (f.rondas as number) ?? undefined,
    humano,
    programadaPara: (f.programada_para as string) ?? undefined,
    publicadaEn: (f.publicada_en as string) ?? undefined,
    urlPublicada: (f.url_publicada as string) ?? undefined,
    error: (f.error as string) ?? undefined,
    creadoEn: f.creado_en as string,
    actualizadoEn: f.actualizado_en as string,
  }
}

function aFila(c: Partial<ItemCola>): Fila {
  const f: Fila = {}
  if (c.estado !== undefined) f.estado = c.estado
  if (c.contenido !== undefined) f.contenido = c.contenido
  if (c.aprendizaje !== undefined) f.aprendizaje = c.aprendizaje
  if (c.veredicto !== undefined) f.veredicto = c.veredicto
  if (c.violaciones !== undefined) f.violaciones = c.violaciones
  if (c.rondas !== undefined) f.rondas = c.rondas
  if (c.programadaPara !== undefined) f.programada_para = c.programadaPara
  if (c.publicadaEn !== undefined) f.publicada_en = c.publicadaEn
  if (c.urlPublicada !== undefined) f.url_publicada = c.urlPublicada
  if (c.error !== undefined) f.error = c.error
  if (c.humano !== undefined) {
    f.humano_decision = c.humano.decision
    f.humano_motivo = c.humano.motivo ?? null
    f.humano_fecha = c.humano.fecha
  }
  f.actualizado_en = ahoraISO()
  return f
}

function aHistorica(i: ItemCola): PiezaHistorica {
  return {
    id: i.id,
    fecha: i.publicadaEn ?? i.creadoEn,
    aprendizaje: i.aprendizaje ?? "",
    tema: i.tematica ?? "",
    personaId: i.personaId,
    creenciaId: i.creenciaId,
  }
}

const TABLA = "cola_contenido"

export class ColaSupabase implements ColaRepo {
  constructor(private db: SupabaseClient) {}

  async crear(pieza: NuevaPieza): Promise<ItemCola> {
    const { data, error } = await this.db
      .from(TABLA)
      .insert({
        perfil_id: pieza.perfilId,
        canal: pieza.canal,
        persona_id: pieza.personaId,
        creencia_id: pieza.creenciaId ?? null,
        objetivo: pieza.objetivo,
        tematica: pieza.tematica ?? null,
        fuente: pieza.fuente ?? null,
      })
      .select()
      .single()
    if (error) throw new Error(`No se pudo crear la pieza: ${error.message}`)
    return aItem(data)
  }

  async obtener(id: string): Promise<ItemCola | null> {
    const { data, error } = await this.db.from(TABLA).select().eq("id", id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? aItem(data) : null
  }

  async listar(perfilId: string, estados?: EstadoPieza[]): Promise<ItemCola[]> {
    let q = this.db.from(TABLA).select().eq("perfil_id", perfilId)
    if (estados?.length) q = q.in("estado", estados)
    const { data, error } = await q.order("creado_en", { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(aItem)
  }

  async actualizar(id: string, cambios: Partial<ItemCola>): Promise<ItemCola> {
    const { data, error } = await this.db
      .from(TABLA)
      .update(aFila(cambios))
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return aItem(data)
  }

  async transicionar(id: string, hacia: EstadoPieza, cambios: Partial<ItemCola> = {}) {
    const actual = await this.obtener(id)
    if (!actual) throw new Error(`Pieza ${id} no existe`)
    if (!puedeTransicionar(actual.estado, hacia)) throw new TransicionInvalida(actual.estado, hacia)
    return this.actualizar(id, { ...cambios, estado: hacia })
  }

  async pendientesDePublicar(ahora = new Date()): Promise<ItemCola[]> {
    const { data, error } = await this.db
      .from(TABLA)
      .select()
      .eq("estado", "programada")
      .lte("programada_para", ahora.toISOString())
      .order("programada_para", { ascending: true })
    if (error) throw new Error(error.message)
    return (data ?? []).map(aItem)
  }

  async recientes(limite: number): Promise<PiezaHistorica[]> {
    const { data, error } = await this.db
      .from(TABLA)
      .select()
      .eq("estado", "publicada")
      .not("aprendizaje", "is", null)
      .order("publicada_en", { ascending: false })
      .limit(limite)
    if (error) throw new Error(error.message)
    return (data ?? []).map(aItem).map(aHistorica)
  }
}

/**
 * Devuelve el repo de Supabase si hay credenciales, y uno en memoria si no.
 *
 * Cae a memoria a propósito: deja correr el sistema entero sin base de datos
 * para probar el ciclo, y en ese modo lo generado simplemente no persiste.
 */
export function crearRepo(): ColaRepo {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return new ColaMemoria()
  return new ColaSupabase(createClient(url, key, { auth: { persistSession: false } }))
}
