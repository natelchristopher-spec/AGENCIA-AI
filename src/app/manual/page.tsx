import Link from "next/link"
import { AGENCIA } from "@/lib/brand/profiles/agencia"

// El manual se renderiza desde el mismo objeto que alimenta los prompts. No hay
// una copia escrita a mano que pueda quedar vieja: si cambia un token, cambian
// las dos cosas juntas.

export const metadata = { title: "Manual de marca" }

export default function Manual() {
  const { diseno, voz, posicionamiento: pos } = AGENCIA
  const colores: [string, string][] = [
    ["ink", diseno.paleta.ink],
    ["paper", diseno.paleta.paper],
    ["accent", diseno.paleta.accent],
  ]

  return (
    <main className="wrap">
      <span className="tag">Manual de marca</span>
      <h1>{AGENCIA.name === "NOMBRE_PENDIENTE" ? "Sin nombre" : AGENCIA.name}</h1>
      <p className="lede muted">
        {AGENCIA.descriptor} · {AGENCIA.mercados.join(", ")} · registro {AGENCIA.registro}
      </p>

      <h2>Posicionamiento</h2>
      <h3>Tesis</h3>
      <p>{pos.tesis}</p>
      <h3>Qué reemplaza</h3>
      <p>{pos.nuevaOportunidad}</p>
      <h3>Mecanismo</h3>
      <p className="muted">{pos.mecanismo}</p>

      <h2>Personas</h2>
      <p className="muted">
        Cada pieza le habla a una sola. El campo <code>yaSabe</code> es contra lo que se verifica
        que un hallazgo no sea obvio.
      </p>
      {AGENCIA.personas.map((p) => (
        <div className="card" key={p.id}>
          <span className="tag">{p.id === AGENCIA.personaDefault ? "Por defecto" : "Variante"}</span>
          <h3>
            {p.nombre} — {p.rol}
          </h3>
          <p className="muted">{p.perfil}</p>
          <h3>Dolores</h3>
          <ul>
            {p.dolores.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <h3>Ya sabe — prohibido decírselo como hallazgo</h3>
          <ul>
            {p.yaSabe.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      ))}

      <h2>Tono</h2>
      {voz.tono.map((t) => (
        <div key={t.pilar}>
          <h3>{t.pilar}</h3>
          <p className="muted">{t.detalle}</p>
        </div>
      ))}

      <h2>Creencias que discute el contenido</h2>
      <div className="scroll-x">
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>El lector piensa</th>
              <th>Se desarma con</th>
            </tr>
          </thead>
          <tbody>
            {AGENCIA.creencias.map((c) => (
              <tr key={c.id}>
                <td>
                  <code>{c.tipo}</code>
                </td>
                <td>{c.dice}</td>
                <td className="muted">{c.seDerribaCon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>La vara</h2>
      <p>La pieza pasa solo si el lector no podría haberla escrito él mismo.</p>
      <ul>
        {AGENCIA.vara.aprendizajesValidos.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <div className="warn">
        <strong>Prohibido como aprendizaje</strong> — es el piso del rubro, no el techo. Puede ir
        como premisa, nunca como el hallazgo: {AGENCIA.vara.prohibidoComoAprendizaje.join(" · ")}
      </div>

      <h2>Reglas que bloquean publicación</h2>
      <div className="scroll-x">
        <table>
          <thead>
            <tr>
              <th>Regla</th>
              <th>Cómo se comprueba</th>
            </tr>
          </thead>
          <tbody>
            {voz.verificables.map((v) => (
              <tr key={v.id}>
                <td>{v.regla}</td>
                <td className="muted">{v.criterio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Color</h2>
      <div className="swatches">
        {colores.map(([nombre, hex]) => (
          <div className="swatch" key={nombre}>
            <div className="chip" style={{ background: hex }} />
            <div className="mono">{nombre}</div>
            <div className="mono muted">{hex}</div>
          </div>
        ))}
      </div>

      <h2>Tipografía y jerarquía</h2>
      <p className="mono muted">
        display: {diseno.fuentes.display} · cuerpo: {diseno.fuentes.body} · datos:{" "}
        {diseno.fuentes.mono}
      </p>
      <ul>
        {diseno.jerarquia.map((j) => (
          <li key={j}>{j}</li>
        ))}
      </ul>

      <h2>Confidencialidad</h2>
      <p className="muted" style={{ whiteSpace: "pre-wrap" }}>
        {AGENCIA.confidencialidad.replace(/^## .*\n/, "")}
      </p>

      <h2 />
      <p>
        <Link href="/">Volver</Link>
      </p>
    </main>
  )
}
