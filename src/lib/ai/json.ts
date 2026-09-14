// Extracción de JSON desde una respuesta del modelo, con reparación de truncado.
//
// Un modelo corta la respuesta al llegar al techo de tokens y deja un JSON
// inválido a mitad de camino. Reintentar completo es caro y suele volver a
// cortar; conviene salvar lo que llegó.
//
// Las capas van de la más barata a la más cara: parseo directo, bloque voraz,
// reparación. Si todas fallan, quien llama traduce el error mirando por qué
// terminó la respuesta.

/**
 * Cierra un JSON truncado: termina el string abierto, saca la coma colgante y
 * balancea la pila de llaves y corchetes pendientes.
 */
export function repararJson(s: string): string {
  let out = ""
  let enString = false
  let escapado = false
  const pila: string[] = []

  for (const ch of s) {
    if (escapado) {
      out += ch
      escapado = false
      continue
    }
    if (ch === "\\") {
      out += ch
      escapado = true
      continue
    }
    if (ch === '"') {
      enString = !enString
      out += ch
      continue
    }
    if (!enString) {
      if (ch === "{" || ch === "[") pila.push(ch)
      else if (ch === "}" && pila[pila.length - 1] === "{") pila.pop()
      else if (ch === "]" && pila[pila.length - 1] === "[") pila.pop()
    }
    out += ch
  }

  if (enString) out += '"'
  out = out.replace(/,\s*$/, "")
  while (pila.length) out += pila.pop() === "{" ? "}" : "]"
  return out
}

export function extraerJson<T = Record<string, unknown>>(texto: string): T {
  if (!texto?.trim()) throw new Error("El modelo devolvió una respuesta vacía.")

  let limpio = texto.trim()
  const fence = limpio.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) limpio = fence[1].trim()

  const inicio = limpio.search(/[{[]/)
  if (inicio === -1) throw new Error("El modelo no devolvió JSON.")
  const candidato = limpio.slice(inicio)

  const voraz = candidato.match(/[{[][\s\S]*[}\]]/)
  if (voraz) {
    try {
      return JSON.parse(voraz[0]) as T
    } catch {
      // sigue a la reparación
    }
  }

  try {
    return JSON.parse(repararJson(candidato)) as T
  } catch {
    throw new Error("El modelo devolvió un JSON incompleto que no se pudo reparar.")
  }
}
