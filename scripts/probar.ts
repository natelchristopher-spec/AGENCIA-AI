// Prueba end-to-end del ciclo: generar → criticar → regenerar → veredicto.
//
// Sirve para calibrar. Las dos cosas que hay que mirar en la salida son si el
// aprendizaje declarado es de verdad no obvio para la persona, y si el crítico
// rebota por las razones correctas. Si aprueba todo a la primera, la vara está
// baja; si nunca aprueba, está alta o hay una regla mal escrita.
//
//   ANTHROPIC_API_KEY=... npx tsx scripts/probar.ts
//   ANTHROPIC_API_KEY=... npx tsx scripts/probar.ts fuente.txt

import { readFileSync } from "node:fs"
import { AGENCIA } from "../src/lib/brand/profiles/agencia"
import { generarCarrusel } from "../src/lib/content/carousel"
import type { Violacion } from "../src/lib/content/critic"

const FUENTE_DEMO = `Los costos por mil impresiones en Meta subieron de forma sostenida los últimos dos años en Argentina. Muchos anunciantes chicos reaccionan subiendo el presupuesto para mantener el mismo volumen de resultados.

Un patrón que aparece seguido al auditar cuentas de pymes: la plataforma reporta conversiones que el sistema de facturación del negocio no registra. Las causas más frecuentes son la ventana de atribución por defecto (que cuenta como conversión a alguien que vio el anuncio y compró días después por otro canal), el conteo de una misma compra por más de un anuncio, y eventos de conversión mal configurados que disparan en el carrito en vez de en la compra confirmada.

El efecto práctico es que el ROAS que reporta la plataforma queda por encima del retorno real, y la decisión de escalar presupuesto se toma sobre un número inflado.`

async function main() {
  const archivo = process.argv[2]
  const fuente = archivo ? readFileSync(archivo, "utf8") : FUENTE_DEMO

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Falta ANTHROPIC_API_KEY.")
    process.exit(1)
  }

  console.log(`Perfil: ${AGENCIA.name} · persona: ${AGENCIA.personaDefault}`)
  console.log(`Pruebas cargadas: ${AGENCIA.pruebas.length} (con 0, no puede afirmar ningún resultado)\n`)
  console.log("Generando...\n")

  const inicio = Date.now()
  const { pieza, veredicto, rondas } = await generarCarrusel(AGENCIA, {
    fuente,
    objetivo: "autoridad",
    creenciaId: "no_puedo_evaluar",
  })
  const segundos = ((Date.now() - inicio) / 1000).toFixed(1)

  console.log("─".repeat(70))
  console.log(`FICHA`)
  console.log(`  Persona:      ${pieza.ficha.buyer}`)
  console.log(`  Aprendizaje:  ${pieza.ficha.aprendizaje}`)
  console.log(`  Por qué pasa: ${pieza.ficha.por_que_avanzo}`)
  if (pieza.ficha.creencia) console.log(`  Creencia:     ${pieza.ficha.creencia}`)

  console.log(`\n${"─".repeat(70)}`)
  console.log(`COPY DEL POST\n`)
  console.log(pieza.copy_post)

  console.log(`\n${"─".repeat(70)}`)
  console.log(`SLIDES\n`)
  for (const s of pieza.slides) {
    console.log(`[${s.numero}] ${s.titulo}`)
    if (s.cuerpo) console.log(`    ${s.cuerpo}`)
    console.log(`    · visual: ${s.sugerencia_visual}`)
    console.log()
  }

  console.log("─".repeat(70))
  console.log(`VEREDICTO: ${veredicto.estado.toUpperCase()}  ·  ${rondas} reescritura(s)  ·  ${segundos}s`)
  if (veredicto.motivo) console.log(`Motivo: ${veredicto.motivo}`)

  if (veredicto.violaciones.length) {
    console.log(`\nViolaciones (${veredicto.violaciones.length}):`)
    for (const v of veredicto.violaciones as Violacion[]) {
      console.log(`  [${v.severidad}] ${v.regla}`)
      console.log(`     cita: "${v.cita}"`)
      console.log(`     ${v.por_que}`)
    }
  } else {
    console.log("Sin violaciones.")
  }
  console.log("─".repeat(70))
}

main().catch((err) => {
  console.error("\nFalló:", err instanceof Error ? err.message : err)
  process.exit(1)
})
