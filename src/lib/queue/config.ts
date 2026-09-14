// Configuración de la operación autónoma.
//
// Vive en la base y no en el código a propósito: frenar un sistema que publica
// solo no puede depender de un deploy. `activo` arranca en false — la operación
// se enciende a mano, una vez, cuando la medición dice que está lista.

import { createClient } from "@supabase/supabase-js"

export interface OperacionConfig {
  perfilId: string
  /** Freno de emergencia. En false no se genera ni se publica nada. */
  activo: boolean
  /** Piezas por semana que dispara el cron. */
  cadencia: number
  /** Horas entre que una pieza se aprueba y se publica. 0 = sin ventana. */
  ventanaVeto: number
}

const DEFAULTS: Omit<OperacionConfig, "perfilId"> = {
  activo: false,
  cadencia: 3,
  ventanaVeto: 24,
}

function cliente() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Lee la config de un perfil. Sin base de datos o ante cualquier error
 * devuelve los defaults, que tienen `activo: false`: si no se puede confirmar
 * que la operación está encendida, se la trata como apagada.
 */
export async function leerConfig(perfilId: string): Promise<OperacionConfig> {
  const db = cliente()
  if (!db) return { perfilId, ...DEFAULTS }

  try {
    const { data, error } = await db
      .from("operacion_config")
      .select()
      .eq("perfil_id", perfilId)
      .maybeSingle()
    if (error || !data) return { perfilId, ...DEFAULTS }
    return {
      perfilId,
      activo: Boolean(data.activo),
      cadencia: Number(data.cadencia ?? DEFAULTS.cadencia),
      ventanaVeto: Number(data.ventana_veto ?? DEFAULTS.ventanaVeto),
    }
  } catch {
    return { perfilId, ...DEFAULTS }
  }
}
