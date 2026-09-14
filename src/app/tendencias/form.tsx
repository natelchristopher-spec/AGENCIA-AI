"use client"

import { useActionState } from "react"
import { barrer, type ResultadoBarrido } from "./actions"

interface Opcion {
  id: string
  label: string
}

export function FormularioTendencias({
  personas,
  servicios,
}: {
  personas: Opcion[]
  servicios: Opcion[]
}) {
  const [estado, accion, pendiente] = useActionState<ResultadoBarrido | null, FormData>(barrer, null)

  return (
    <>
      <form action={accion}>
        <div className="fila">
          <label className="campo">
            <span>Persona</span>
            <select name="persona" defaultValue={personas[0]?.id}>
              {personas.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="campo">
            <span>Servicio (vacío = todas las fuentes)</span>
            <select name="servicio" defaultValue="">
              <option value="">— todos —</option>
              {servicios.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button className="btn" disabled={pendiente}>
          {pendiente ? "Barriendo fuentes…" : "Barrer y proponer"}
        </button>
      </form>

      {estado && !estado.ok && (
        <div className="warn">
          <strong>No se pudo barrer.</strong> {estado.error}
          {estado.fallidas?.length ? (
            <p style={{ margin: "8px 0 0" }}>Fuentes que fallaron: {estado.fallidas.join(" · ")}</p>
          ) : null}
        </div>
      )}

      {estado?.ok && estado.propuesta && (
        <>
          <h2>Barrido</h2>
          <p className="mono muted">
            {estado.leidas} fuente(s) leída(s) · {estado.segundos}s
            {estado.fallidas?.length ? ` · no respondieron: ${estado.fallidas.join(", ")}` : ""}
          </p>

          <h2>Temas propuestos ({estado.propuesta.temas.length})</h2>
          {estado.propuesta.temas.length === 0 ? (
            <p className="muted">
              No pasó ninguno el filtro de no-obviedad. No es un error: de veinte novedades suelen
              servir dos o tres, y hay días que no sirve ninguna.
            </p>
          ) : (
            estado.propuesta.temas.map((t, i) => (
              <div className="card" key={i}>
                <span className="tag">
                  {t.servicioId} · {t.fuente}
                </span>
                <h3>{t.tematica}</h3>
                <p>{t.angulo}</p>
                <p className="muted">
                  <strong>Por qué no es obvio:</strong> {t.porQueNoEsObvio}
                </p>
              </div>
            ))
          )}

          {estado.propuesta.descartados.length > 0 && (
            <>
              <h2>Descartados ({estado.propuesta.descartados.length})</h2>
              <p className="muted">
                Lo que miró y dejó afuera. Si acá hay algo que vos sí escribirías, el filtro está
                demasiado duro; si en los propuestos hay algo obvio, está demasiado blando.
              </p>
              <div className="scroll-x">
                <table>
                  <thead>
                    <tr>
                      <th>Tema</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estado.propuesta.descartados.map((d, i) => (
                      <tr key={i}>
                        <td>{d.tematica}</td>
                        <td className="muted">{d.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}
