"use client"

import { useActionState } from "react"
import { probarPieza, type ResultadoPrueba } from "./actions"

interface Opcion {
  id: string
  label: string
}

export function FormularioPrueba({
  personas,
  creencias,
  fuenteDemo,
}: {
  personas: Opcion[]
  creencias: Opcion[]
  fuenteDemo: string
}) {
  const [estado, accion, pendiente] = useActionState<ResultadoPrueba | null, FormData>(
    probarPieza,
    null,
  )

  return (
    <>
      <form action={accion}>
        <label className="campo">
          <span>Fuente — el material. No inventa nada fuera de esto.</span>
          <textarea name="fuente" rows={8} defaultValue={fuenteDemo} />
        </label>

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
            <span>Objetivo</span>
            <select name="objetivo" defaultValue="autoridad">
              <option value="autoridad">Autoridad / criterio</option>
              <option value="lead">Generar consulta</option>
              <option value="nutricion">Llevar a contenido propio</option>
              <option value="prueba">Mostrar el sistema funcionando</option>
            </select>
          </label>
        </div>

        <label className="campo">
          <span>Creencia que discute (opcional)</span>
          <select name="creencia" defaultValue="">
            <option value="">— ninguna —</option>
            {creencias.map((c) => (
              <option value={c.id} key={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <button className="btn" disabled={pendiente}>
          {pendiente ? "Generando… (puede tardar un minuto)" : "Generar y criticar"}
        </button>
      </form>

      {estado && !estado.ok && (
        <div className="warn">
          <strong>No se pudo generar.</strong> {estado.error}
        </div>
      )}

      {estado?.ok && estado.pieza && estado.veredicto && (
        <>
          <h2>Ficha</h2>
          <div className="card">
            <h3>{estado.pieza.ficha.aprendizaje || "(sin aprendizaje declarado)"}</h3>
            <p className="muted">
              <strong>Por qué avanzó:</strong> {estado.pieza.ficha.por_que_avanzo || "—"}
            </p>
            <p className="mono muted">
              persona: {estado.pieza.ficha.buyer}
              {estado.pieza.ficha.creencia ? ` · creencia: ${estado.pieza.ficha.creencia}` : ""} ·{" "}
              {estado.segundos}s
            </p>
          </div>

          <h2>Veredicto del crítico</h2>
          <div className={estado.veredicto.violaciones.length ? "warn" : "card"}>
            <strong>{estado.veredicto.estado.toUpperCase()}</strong>
            {estado.veredicto.motivo && <p>{estado.veredicto.motivo}</p>}
            {estado.veredicto.violaciones.length === 0 ? (
              <p style={{ margin: 0 }}>Sin violaciones en el primer intento.</p>
            ) : (
              <ul style={{ marginBottom: 0 }}>
                {estado.veredicto.violaciones.map((v, i) => (
                  <li key={i}>
                    <code>{v.regla}</code> [{v.severidad}] — {v.por_que}
                    <br />
                    <span className="muted">«{v.cita}»</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <h2>Copy del post</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{estado.pieza.copy_post}</p>

          <h2>Slides</h2>
          {estado.pieza.slides.map((s) => (
            <div className="card" key={s.numero}>
              <span className="tag">Slide {s.numero}</span>
              <h3 style={{ marginTop: 0 }}>{s.titulo}</h3>
              {s.cuerpo && <p>{s.cuerpo}</p>}
              <p className="mono muted" style={{ margin: 0 }}>
                visual: {s.sugerencia_visual}
              </p>
            </div>
          ))}
        </>
      )}
    </>
  )
}
