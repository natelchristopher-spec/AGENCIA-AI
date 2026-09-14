"use server"

import { revalidatePath } from "next/cache"
import { crearRepo } from "@/lib/queue/repo"

/**
 * Registra la decisión humana sobre una pieza.
 *
 * Guarda la decisión SIEMPRE, incluso cuando coincide con el crítico. El valor
 * no está en el veredicto suelto sino en el par: veredicto del crítico contra
 * decisión humana es lo que da la tasa de coincidencia, y sin las coincidencias
 * el denominador no existe.
 */
export async function decidir(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const accion = String(formData.get("accion") ?? "")
  const motivo = String(formData.get("motivo") ?? "").trim()

  if (!id || (accion !== "aprobar" && accion !== "rechazar")) return

  const repo = crearRepo()
  await repo.transicionar(id, accion === "aprobar" ? "aprobada" : "rechazada", {
    humano: {
      decision: accion === "aprobar" ? "aprobo" : "rechazo",
      motivo: motivo || undefined,
      fecha: new Date().toISOString(),
    },
  })

  revalidatePath("/cola")
}
