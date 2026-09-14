import Link from "next/link"
import { AGENCIA } from "@/lib/brand/profiles/agencia"
import { crearRepo } from "@/lib/queue/repo"
import { tasaDeCoincidencia, type ItemCola } from "@/lib/queue/types"
import type { Carrusel } from "@/lib/content/carousel"
import type { Violacion } from "@/lib/content/critic"
import { decidir } from "./actions"

export const dynamic = "force-dynamic"
export const metadata = { title: "Cola de contenido" }

// La vista está armada para decidir de un vistazo con la ficha, sin leer la
// pieza entera: buyer, aprendizaje y por qué avanzó. Si con esos tres campos no
// alcanza para decidir, el problema está en la pieza, no en la vista.

function Pieza({ item }: { item: ItemCola }) {
  const c = item.contenido as Carrusel | undefined
  const violaciones = (item.violaciones as Violacion[] | undefined) ?? []
  const enRevision = item.estado === "revision"

  return (
    <div className="card">
      <span className="tag">
        {enRevision ? "Necesita revisión" : "Aprobada por el crítico"} · {item.canal}
      </span>

      {c?.ficha && (
        <>
          <h3>{c.ficha.aprendizaje || "(sin aprendizaje declarado)"}</h3>
          <p className="muted">
            <strong>Por qué avanzó:</strong> {c.ficha.por_que_avanzo || "—"}
          </p>
          <p className="mono muted">
            persona: {c.ficha.buyer}
            {c.ficha.creencia ? ` · creencia: ${c.ficha.creencia}` : ""}
            {item.rondas ? ` · ${item.rondas} reescritura(s)` : ""}
          </p>
        </>
      )}

      {violaciones.length > 0 && (
        <div className="warn">
          <strong>El crítico marcó {violaciones.length}:</strong>
          <ul>
            {violaciones.map((v, i) => (
              <li key={i}>
                <code>{v.regla}</code> — {v.por_que}
                <br />
                <span className="muted">«{v.cita}»</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {c && (
        <details>
          <summary className="mono">Ver la pieza</summary>
          <p style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{c.copy_post}</p>
          <ul>
            {c.slides.map((s) => (
              <li key={s.numero}>
                <strong>{s.titulo}</strong>
                {s.cuerpo ? ` — ${s.cuerpo}` : ""}
              </li>
            ))}
          </ul>
        </details>
      )}

      <form action={decidir} style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input type="hidden" name="id" value={item.id} />
        <input
          name="motivo"
          placeholder="Motivo (opcional, pero sirve para calibrar)"
          style={{ flex: "1 1 240px", padding: "8px 10px", border: "2px solid var(--rule)" }}
        />
        <button name="accion" value="aprobar" className="btn">
          Aprobar
        </button>
        <button name="accion" value="rechazar" className="btn">
          Rechazar
        </button>
      </form>
    </div>
  )
}

export default async function Cola() {
  const repo = crearRepo()
  const pendientes = await repo.listar(AGENCIA.id, ["generada", "revision"])
  const decididas = await repo.listar(AGENCIA.id, ["aprobada", "rechazada", "programada", "publicada"])
  const medicion = tasaDeCoincidencia(decididas)

  return (
    <main className="wrap">
      <span className="tag">Cola</span>
      <h1>Pendientes de decisión</h1>

      <h2>Calibración</h2>
      <p className="lede muted">
        La tasa mide solo las piezas que el crítico aprobó y vos evaluaste. Los falsos positivos son
        los caros: son los que se publicarían solos sin supervisión.
      </p>
      <div className="scroll-x">
        <table>
          <tbody>
            <tr>
              <th>Evaluadas</th>
              <td>{medicion.evaluadas}</td>
            </tr>
            <tr>
              <th>Coincidencias</th>
              <td>{medicion.coincidencias}</td>
            </tr>
            <tr>
              <th>Falsos positivos</th>
              <td>{medicion.falsosPositivos}</td>
            </tr>
            <tr>
              <th>Tasa</th>
              <td>
                {medicion.evaluadas === 0
                  ? "sin datos todavía"
                  : `${Math.round(medicion.tasa * 100)}% — hace falta 90% sostenido para pasar de fase`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Esperando ({pendientes.length})</h2>
      {pendientes.length === 0 ? (
        <p className="muted">
          No hay nada pendiente. Si esperabas piezas, revisá que{" "}
          <code>operacion_config.activo</code> esté en <code>true</code> y que el cron esté
          corriendo.
        </p>
      ) : (
        pendientes.map((i) => <Pieza item={i} key={i.id} />)
      )}

      <h2 />
      <p>
        <Link href="/">Volver</Link>
      </p>
    </main>
  )
}
