import dns from "node:dns/promises"
import net from "node:net"

// Guardia anti-SSRF para cualquier fetch del lado del servidor hacia una URL
// que no controlamos. Sin esto, una fuente de tendencias apuntando a una IP
// interna deja leer la red privada o el endpoint de metadata del proveedor.

function esIpPrivada(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number)
    if (a === 0 || a === 10 || a === 127) return true
    if (a === 169 && b === 254) return true // link-local / metadata de la nube
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
    return false
  }
  if (net.isIPv6(ip)) {
    const l = ip.toLowerCase()
    if (l === "::1" || l === "::") return true
    if (l.startsWith("fe80")) return true // link-local
    if (l.startsWith("fc") || l.startsWith("fd")) return true // unique-local
    const mapeada = l.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (mapeada) return esIpPrivada(mapeada[1])
    return false
  }
  return false
}

/** Lanza si la URL no es http(s) pública. Resuelve el DNS y valida cada IP. */
export async function assertUrlPublica(raw: string): Promise<void> {
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error("URL inválida")
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Sólo se permiten URLs http(s)")
  }

  const host = parsed.hostname.toLowerCase()
  if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("Host no permitido")
  }

  const direcciones = net.isIP(host)
    ? [host]
    : (await dns.lookup(host, { all: true })).map((r) => r.address)

  if (direcciones.length === 0) throw new Error("No se pudo resolver el host")
  for (const addr of direcciones) {
    if (esIpPrivada(addr)) throw new Error("La URL apunta a una dirección interna")
  }
}
