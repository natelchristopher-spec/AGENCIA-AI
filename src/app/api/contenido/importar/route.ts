import { NextResponse } from "next/server"
import { verificarAcceso } from "@/lib/acceso"
import { leerUrl } from "@/lib/sourcing/scrape"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: Request) {
  const denegado = verificarAcceso(req)
  if (denegado) return denegado

  let body: { url?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const url = (body.url ?? "").trim()
  if (!url) return NextResponse.json({ error: "Falta la URL" }, { status: 400 })

  const r = await leerUrl(url)
  if (!r) {
    return NextResponse.json(
      { error: "No se pudo leer esa URL. Puede estar caída, bloquear lectores, o no ser pública." },
      { status: 422 },
    )
  }

  return NextResponse.json({ titulo: r.titulo, texto: r.texto })
}
