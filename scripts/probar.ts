// Banco de pruebas manual. Genera piezas, las pasa por el ciclo completo y
// escribe un informe para leer con calma y marcar tu propio veredicto.
//
// El objetivo NO es ver si "funciona": es calibrar. Las dos preguntas son si
// el aprendizaje es de verdad no obvio para esa persona, y si el crítico
// rebota por las razones correctas. Por eso el informe deja una línea en blanco
// por pieza para tu veredicto: comparado con el del crítico, eso es la tasa de
// coincidencia, que es el dato que decide si el sistema puede publicar solo.
//
//   npx tsx scripts/probar.ts                      una pieza, ángulo por defecto
//   npx tsx scripts/probar.ts --n 6                seis piezas rotando ángulos
//   npx tsx scripts/probar.ts --fuente notas.txt   con material propio
//   npx tsx scripts/probar.ts --persona p2_marketing --creencia ya_probe_todas
//   npx tsx scripts/probar.ts --objetivo lead --out informe.md
//
// En modo --n las piezas comparten un historial en memoria, así cada una ve
// los aprendizajes de las anteriores: también prueba la anti-redundancia.

import { readFileSync, writeFileSync } from "node:fs"
import { AGENCIA } from "../src/lib/brand/profiles/agencia"
import { generarCarrusel, type Carrusel } from "../src/lib/content/carousel"
import type { Veredicto } from "../src/lib/content/critic"
import {
  anguloMenosUsado,
  HistorialMemoria,
  type PiezaHistorica,
} from "../src/lib/content/redundancy"
import type { Objetivo } from "../src/lib/content/objectives"
import { creenciaDe } from "../src/lib/brand/types"

const FUENTE_DEMO = `Los costos por mil impresiones en Meta subieron de forma sostenida los últimos dos años en Argentina. Muchos anunciantes chicos reaccionan subiendo el presupuesto para mantener el mismo volumen de resultados.

Un patrón que aparece seguido al auditar cuentas de pymes: la plataforma reporta conversiones que el sistema de facturación del negocio no registra. Las causas más frecuentes son la ventana de atribución por defecto (que cuenta como conversión a alguien que vio el anuncio y compró días después por otro canal), el conteo de una misma compra por más de un anuncio, y eventos de conversión mal configurados que disparan en el carrito en vez de en la compra confirmada.

El efecto práctico es que el ROAS que reporta la plataforma queda por encima del retorno real, y la decisión de escalar presupuesto se toma sobre un número inflado.`

interface Flags {
  n: number
  fuente?: string
  persona?: string
  creencia?: string
  objetivo: Objetivo
  out: string
}

function parsearFlags(argv: string[]): Flags {
  const get = (nombre: string): string | undefined => {
    const i = argv.indexOf(`--${nombre}`)
    return i !== -1 ? argv[i + 1] : undefined
  }
  return {
    n: Number(get("n") ?? 1),
    fuente: get("fuente"),
    persona: get("persona"),
    creencia: get("creencia"),
    objetivo: (get("objetivo") as Objetivo) ?? "autoridad",
    out: get("out") ?? "informe-pruebas.md",
  }
}

interface Resultado {
  pieza: Carrusel
  veredicto: Veredicto
  rondas: number
  personaId: string
  creenciaId?: string
  segundos: string
}

function imprimir(r: Resultado, i: number, total: number) {
  console.log("\n" + "━".repeat(72))
  console.log(`PIEZA ${i + 1}/${total}  ·  ${r.personaId}${r.creenciaId ? ` · ${r.creenciaId}` : ""}`)
  console.log("━".repeat(72))
  console.log(`Aprendizaje:  ${r.pieza.ficha.aprendizaje}`)
  console.log(`Por qué pasa: ${r.pieza.ficha.por_que_avanzo}`)
  console.log(
    `\n${r.veredicto.estado.toUpperCase()} · ${r.rondas} reescritura(s) · ${r.segundos}s · ${r.veredicto.violaciones.length} violación(es)`,
  )
  for (const v of r.veredicto.violaciones) {
    console.log(`  [${v.severidad}] ${v.regla} — «${v.cita}»`)
  }
}

function informe(resultados: Resultado[]): string {
  const lineas: string[] = [
    `# Informe de pruebas`,
    ``,
    `Perfil: \`${AGENCIA.id}\` · ${resultados.length} pieza(s) · ${new Date().toISOString().slice(0, 16).replace("T", " ")}`,
    ``,
    `## Cómo leer esto`,
    ``,
    `Por cada pieza, preguntate dos cosas:`,
    ``,
    `1. **¿El aprendizaje es no obvio para esa persona?** Mirá su \`yaSabe\` en el manual. Si el hallazgo está ahí o es una reformulación, la vara está mal calibrada.`,
    `2. **¿El crítico rebotó por las razones correctas?** Si aprobó algo que vos rechazarías, eso es un falso positivo: es la pieza que se publicaría sola sin que debiera.`,
    ``,
    `Completá **Tu veredicto** en cada una. La proporción de veces que coincidís con el crítico es lo que dice si el sistema puede publicar sin supervisión.`,
    ``,
  ]

  for (const [i, r] of resultados.entries()) {
    const c = r.pieza
    lineas.push(
      `---`,
      ``,
      `## Pieza ${i + 1} — ${r.personaId}${r.creenciaId ? ` · ${r.creenciaId}` : ""}`,
      ``,
      `**Aprendizaje:** ${c.ficha.aprendizaje}`,
      ``,
      `**Por qué avanzó:** ${c.ficha.por_que_avanzo}`,
      ``,
      `**Crítico:** \`${r.veredicto.estado}\` · ${r.rondas} reescritura(s) · ${r.veredicto.violaciones.length} violación(es)`,
      ``,
    )

    if (r.veredicto.violaciones.length) {
      lineas.push(`| Regla | Cita | Por qué |`, `|---|---|---|`)
      for (const v of r.veredicto.violaciones) {
        const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ")
        lineas.push(`| \`${v.regla}\` | «${esc(v.cita)}» | ${esc(v.por_que)} |`)
      }
      lineas.push(``)
    }

    lineas.push(`**Copy del post**`, ``, `> ${c.copy_post.replace(/\n/g, "\n> ")}`, ``, `**Slides**`, ``)
    for (const s of c.slides) {
      lineas.push(`${s.numero}. **${s.titulo}**${s.cuerpo ? ` — ${s.cuerpo}` : ""}`)
      lineas.push(`   · visual: _${s.sugerencia_visual}_`)
    }

    lineas.push(
      ``,
      `**Tu veredicto:** <!-- publicaría / no publicaría --> `,
      ``,
      `**Por qué:** `,
      ``,
    )
  }

  return lineas.join("\n")
}

async function main() {
  const flags = parsearFlags(process.argv.slice(2))
  const fuente = flags.fuente ? readFileSync(flags.fuente, "utf8") : FUENTE_DEMO

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Falta ANTHROPIC_API_KEY.")
    process.exit(1)
  }

  console.log(`Perfil: ${AGENCIA.name} · objetivo: ${flags.objetivo} · piezas: ${flags.n}`)
  console.log(
    `Pruebas cargadas: ${AGENCIA.pruebas.length}${AGENCIA.pruebas.length === 0 ? " — no puede afirmar ningún resultado" : ""}`,
  )

  // Historial compartido: cada pieza ve los aprendizajes de las anteriores, así
  // la corrida también prueba si el sistema se repite a sí mismo.
  const historial = new HistorialMemoria()
  const resultados: Resultado[] = []

  for (let i = 0; i < flags.n; i++) {
    const previas = await historial.recientes(20)
    const auto = anguloMenosUsado(AGENCIA, previas)
    const personaId = flags.persona ?? auto.personaId
    const creenciaId = flags.creencia ?? auto.creenciaId
    const creencia = creenciaDe(AGENCIA, creenciaId)

    process.stdout.write(`\nGenerando ${i + 1}/${flags.n} (${personaId} · ${creenciaId})...`)
    const inicio = Date.now()

    const { pieza, veredicto, rondas } = await generarCarrusel(AGENCIA, {
      fuente: creencia
        ? `${fuente}\n\nOBJECIÓN A DISCUTIR: "${creencia.dice}"\nPor qué el lector la cree: ${creencia.porQueLaCree}\nCon qué se desarma: ${creencia.seDerribaCon}`
        : fuente,
      objetivo: flags.objetivo,
      personaId,
      creenciaId,
      historial,
    })

    const r: Resultado = {
      pieza,
      veredicto,
      rondas,
      personaId,
      creenciaId,
      segundos: ((Date.now() - inicio) / 1000).toFixed(1),
    }
    resultados.push(r)
    imprimir(r, i, flags.n)

    // Se suma al historial aunque no haya aprobado: para no repetirse, lo que
    // importa es si el ángulo ya se intentó, no si salió bien.
    const historica: PiezaHistorica = {
      id: `prueba-${i + 1}`,
      fecha: new Date().toISOString(),
      aprendizaje: pieza.ficha.aprendizaje,
      tema: creencia?.dice ?? "",
      personaId,
      creenciaId,
    }
    historial.agregar(historica)
  }

  writeFileSync(flags.out, informe(resultados), "utf8")

  const aprobadas = resultados.filter((r) => r.veredicto.estado === "aprobado").length
  console.log("\n" + "━".repeat(72))
  console.log(`${aprobadas}/${resultados.length} aprobadas por el crítico.`)
  if (aprobadas === resultados.length && resultados.length > 2) {
    console.log("Aprobó todo: revisá si la vara no quedó baja.")
  } else if (aprobadas === 0) {
    console.log("No aprobó ninguna: revisá si alguna regla está mal redactada o es imposible de cumplir.")
  }
  console.log(`\nInforme escrito en ${flags.out} — completá tu veredicto en cada pieza.`)
}

main().catch((err) => {
  console.error("\nFalló:", err instanceof Error ? err.message : err)
  process.exit(1)
})
