import { assertUrlPublica } from "./url-guard"

// Extracción de texto de una URL pública: feeds RSS, changelogs, notas.
// Sin dependencias de parseo: para lo que necesitamos —texto plano que va a
// leer un modelo— alcanza con limpiar etiquetas, y evita arrastrar un parser
// de HTML entero al bundle.

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-419,es;q=0.9",
}

const ENTIDADES: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  laquo: "«", raquo: "»", hellip: "…", mdash: "—", ndash: "–",
  ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", deg: "°",
}

export function decodificarEntidades(texto: string): string {
  return texto
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, nombre) => ENTIDADES[nombre.toLowerCase()] ?? m)
}

export function limpiarHtml(html: string): string {
  const texto = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    // En RSS el contenido viene envuelto en CDATA.
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<\/(p|h1|h2|h3|h4|li|div|item|title|description)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
  return decodificarEntidades(texto)
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim()
}

/**
 * Devuelve el texto de una URL, o null si no se pudo leer.
 *
 * Nunca lanza: una fuente caída no puede tumbar el barrido entero, y quien
 * llama necesita saber cuáles fallaron, no recibir una excepción.
 */
export async function leerUrl(raw: string): Promise<{ titulo: string; texto: string } | null> {
  if (!/^https?:\/\//i.test(raw)) return null
  try {
    await assertUrlPublica(raw)
  } catch {
    return null
  }

  try {
    const res = await fetch(raw, { headers: HEADERS, signal: AbortSignal.timeout(12_000) })
    if (!res.ok) return null
    const html = await res.text()

    const titulo =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
      ""

    // Preferimos el contenido principal; si no hay, el cuerpo sin navegación.
    const cuerpo =
      html.match(/<article[\s\S]*?<\/article>/i)?.[0] ||
      html.match(/<main[\s\S]*?<\/main>/i)?.[0] ||
      html
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[\s\S]*?<\/footer>/gi, "")
        .replace(/<header[\s\S]*?<\/header>/gi, "")

    const texto = limpiarHtml(cuerpo)
    if (texto.length < 120) return null
    return { titulo: decodificarEntidades(titulo), texto: texto.slice(0, 12_000) }
  } catch {
    return null
  }
}
