import { AGENCIA } from "@/lib/brand/profiles/agencia"
import { FUENTES } from "@/lib/sourcing/fuentes"
import { FormularioTendencias } from "./form"

export const metadata = { title: "Tendencias" }
export const maxDuration = 300

export default function Tendencias() {
  const total = FUENTES.reduce((n, f) => n + f.fuentes.length, 0)

  return (
    <main className="wrap">
      <span className="tag">Sourcing</span>
      <h1>De dónde sale el material</h1>
      <p className="lede muted">
        Lee {total} fuentes del rubro y propone qué vale la pena escribir. No resume novedades:
        busca las pocas que cambian una decisión que el lector toma, y descarta el resto.
      </p>

      <h2>Cómo se filtra</h2>
      <p>
        Una novedad no es material por ser novedad. Cada tema propuesto tiene que declarar por qué
        no es obvio <em>para esa persona</em>, contra lo que ya sabe — y el que no puede
        justificarlo se descarta acá, antes de gastar una generación entera en él.
      </p>
      <p className="muted">
        Cada fuente está atada a un servicio, así el post que salga de una tendencia ya sabe a qué
        servicio anclar el CTA.
      </p>

      <h2>Fuentes</h2>
      <div className="scroll-x">
        <table>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Fuentes</th>
            </tr>
          </thead>
          <tbody>
            {FUENTES.map((g) => {
              const servicio = AGENCIA.servicios.find((s) => s.id === g.servicioId)
              return (
                <tr key={g.servicioId}>
                  <td>
                    <strong>{servicio?.nombre ?? g.servicioId}</strong>
                    <div className="mono muted">{g.servicioId}</div>
                  </td>
                  <td className="muted">{g.fuentes.map((f) => f.nombre).join(" · ")}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <h2>Barrer</h2>
      <FormularioTendencias
        personas={AGENCIA.personas.map((p) => ({ id: p.id, label: `${p.nombre} — ${p.rol}` }))}
        servicios={AGENCIA.servicios.map((s) => ({ id: s.id, label: s.nombre }))}
      />
    </main>
  )
}
