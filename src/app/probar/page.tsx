import { AGENCIA } from "@/lib/brand/profiles/agencia"
import { personaDe } from "@/lib/brand/types"
import { FormularioPrueba } from "./form"

export const metadata = { title: "Probar" }
export const maxDuration = 300

const FUENTE_DEMO = `Los costos por mil impresiones en Meta subieron de forma sostenida los últimos dos años en Argentina. Muchos anunciantes chicos reaccionan subiendo el presupuesto para mantener el mismo volumen de resultados.

Un patrón que aparece seguido al auditar cuentas de pymes: la plataforma reporta conversiones que el sistema de facturación del negocio no registra. Las causas más frecuentes son la ventana de atribución por defecto, el conteo de una misma compra por más de un anuncio, y eventos de conversión mal configurados que disparan en el carrito en vez de en la compra confirmada.

El efecto práctico es que el ROAS que reporta la plataforma queda por encima del retorno real, y la decisión de escalar presupuesto se toma sobre un número inflado.`

export default function Probar() {
  const persona = personaDe(AGENCIA)

  return (
    <main className="wrap">
      <span className="tag">Banco de pruebas</span>
      <h1>Probar una pieza</h1>
      <p className="lede muted">
        Genera una pieza y la pasa por el crítico, en una sola pasada y sin reescrituras. El
        veredicto sobre el primer intento es el que dice si la vara está bien puesta: un tercer
        intento ya viene guiado por el crítico y no informa sobre la calidad del generador.
      </p>

      <h2>Qué mirar</h2>
      <ul>
        <li>
          <strong>¿El aprendizaje es no obvio para esa persona?</strong> Contrastalo con lo que ya
          sabe. Para {persona.nombre}, su piso incluye: {persona.yaSabe.slice(0, 3).join(" · ")}. Si
          el hallazgo es una de esas cosas, la vara está mal calibrada.
        </li>
        <li>
          <strong>¿El crítico rebotó por las razones correctas?</strong> Si aprueba algo que vos no
          publicarías, eso es un falso positivo: es la pieza que saldría sola sin que debiera.
        </li>
      </ul>

      <h2>Generar</h2>
      <FormularioPrueba
        personas={AGENCIA.personas.map((p) => ({ id: p.id, label: `${p.nombre} — ${p.rol}` }))}
        creencias={AGENCIA.creencias.map((c) => ({ id: c.id, label: `${c.tipo} · ${c.dice}` }))}
        fuenteDemo={FUENTE_DEMO}
      />
    </main>
  )
}
