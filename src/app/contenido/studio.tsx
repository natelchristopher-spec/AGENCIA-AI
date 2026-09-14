"use client"

import { useEffect, useState } from "react"

// Front manual de generación. El flujo es el mismo que ya usás:
// material → proponer → elegir varios → desarrollar en lote con progreso →
// revisar uno por uno.
//
// Los temas se desarrollan EN SERIE, no en paralelo: así el progreso es real
// y un tema que falle no se lleva puestos a los demás.

type Modo = "tendencia" | "pegar" | "url"

interface Opcion {
  id: string
  label: string
}

interface Tema {
  servicioId: string
  fuente: string
  tematica: string
  angulo: string
  porQueNoEsObvio: string
}

interface Slide {
  numero: number
  titulo: string
  cuerpo: string
  sugerencia_visual: string
}

interface Violacion {
  regla: string
  cita: string
  por_que: string
  severidad: string
}

interface Pieza {
  titulo_interno: string
  copy_post: string
  slides: Slide[]
  ficha: { buyer: string; aprendizaje: string; por_que_avanzo: string; creencia?: string }
}

interface Desarrollada {
  tema: Tema
  pieza?: Pieza
  veredicto?: { estado: string; violaciones: Violacion[]; motivo?: string }
  error?: string
  decision?: "aprobada" | "rechazada"
}

const CLAVE_LS = "agencia_app_password"

export function Studio({
  personas,
  servicios,
  necesitaClave,
}: {
  personas: Opcion[]
  servicios: Opcion[]
  necesitaClave: boolean
}) {
  const [clave, setClave] = useState("")
  const [modo, setModo] = useState<Modo>("tendencia")
  const [serviciosSel, setServiciosSel] = useState<string[]>(servicios.map((s) => s.id))
  const [persona, setPersona] = useState(personas[0]?.id ?? "")
  const [objetivo, setObjetivo] = useState("autoridad")
  const [url, setUrl] = useState("")
  const [fuente, setFuente] = useState("")

  const [cargando, setCargando] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fallidas, setFallidas] = useState<string[]>([])

  const [temas, setTemas] = useState<Tema[] | null>(null)
  const [descartados, setDescartados] = useState<{ tematica: string; motivo: string }[]>([])
  const [elegidos, setElegidos] = useState<Set<number>>(new Set())
  const [materialUsado, setMaterialUsado] = useState("")

  const [desarrolladas, setDesarrolladas] = useState<Desarrollada[]>([])
  const [progreso, setProgreso] = useState<{ hecho: number; total: number } | null>(null)

  useEffect(() => {
    try {
      const guardada = localStorage.getItem(CLAVE_LS)
      if (guardada) setClave(guardada)
    } catch {
      // localStorage puede fallar en ventana privada; no es crítico
    }
  }, [])

  async function llamar<T>(ruta: string, body: unknown): Promise<T> {
    const res = await fetch(ruta, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(clave ? { "x-app-password": clave } : {}) },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
    return data as T
  }

  function guardarClave(v: string) {
    setClave(v)
    try {
      localStorage.setItem(CLAVE_LS, v)
    } catch {
      // ídem
    }
  }

  async function importar() {
    setError(null)
    setCargando("Leyendo la URL…")
    try {
      const r = await llamar<{ texto: string; titulo: string }>("/api/contenido/importar", { url })
      setFuente(r.texto)
      setModo("pegar")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
    } finally {
      setCargando(null)
    }
  }

  async function proponer() {
    setError(null)
    setTemas(null)
    setDesarrolladas([])
    setElegidos(new Set())
    setCargando(modo === "tendencia" ? "Barriendo fuentes y proponiendo…" : "Proponiendo temas…")
    try {
      const r = await llamar<{
        temas: Tema[]
        descartados: { tematica: string; motivo: string }[]
        fallidas: string[]
        material: string
      }>("/api/contenido/proponer", {
        modo,
        servicios: serviciosSel,
        fuente,
        persona,
      })
      setTemas(r.temas)
      setDescartados(r.descartados ?? [])
      setFallidas(r.fallidas ?? [])
      setMaterialUsado(r.material ?? fuente)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
    } finally {
      setCargando(null)
    }
  }

  async function desarrollar() {
    if (!temas) return
    const seleccion = [...elegidos].sort((a, b) => a - b).map((i) => temas[i])
    if (seleccion.length === 0) return

    setError(null)
    setDesarrolladas([])
    setProgreso({ hecho: 0, total: seleccion.length })

    const acumulado: Desarrollada[] = []
    for (const [i, tema] of seleccion.entries()) {
      try {
        const r = await llamar<{ pieza: Pieza; veredicto: Desarrollada["veredicto"] }>(
          "/api/contenido/generar",
          {
            fuente: materialUsado,
            tematica: tema.tematica,
            angulo: tema.angulo,
            servicioId: tema.servicioId,
            persona,
            objetivo,
          },
        )
        acumulado.push({ tema, pieza: r.pieza, veredicto: r.veredicto })
      } catch (e) {
        acumulado.push({ tema, error: e instanceof Error ? e.message : "Error" })
      }
      setDesarrolladas([...acumulado])
      setProgreso({ hecho: i + 1, total: seleccion.length })
    }
    setProgreso(null)
  }

  function decidir(i: number, decision: "aprobada" | "rechazada") {
    setDesarrolladas((prev) => prev.map((d, j) => (j === i ? { ...d, decision } : d)))
  }

  const ocupado = Boolean(cargando) || Boolean(progreso)

  return (
    <>
      {necesitaClave && (
        <label className="campo">
          <span>Clave de acceso</span>
          <input
            type="password"
            value={clave}
            onChange={(e) => guardarClave(e.target.value)}
            placeholder="La de APP_PASSWORD"
          />
        </label>
      )}

      <h2>1 · Material</h2>
      <div className="fila">
        <label className="campo">
          <span>De dónde sale</span>
          <select value={modo} onChange={(e) => setModo(e.target.value as Modo)}>
            <option value="tendencia">Tendencias — el sistema barre las fuentes solo</option>
            <option value="pegar">Pegar texto</option>
            <option value="url">Importar de una URL</option>
          </select>
        </label>
        <label className="campo">
          <span>Persona</span>
          <select value={persona} onChange={(e) => setPersona(e.target.value)}>
            {personas.map((p) => (
              <option value={p.id} key={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Objetivo</span>
          <select value={objetivo} onChange={(e) => setObjetivo(e.target.value)}>
            <option value="autoridad">Autoridad / criterio</option>
            <option value="lead">Generar consulta</option>
            <option value="nutricion">Llevar a contenido propio</option>
            <option value="prueba">Mostrar el sistema funcionando</option>
          </select>
        </label>
      </div>

      {modo === "tendencia" && (
        <div className="campo">
          <span>Servicios a barrer</span>
          {servicios.map((s) => (
            <label key={s.id} style={{ display: "block", marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={serviciosSel.includes(s.id)}
                onChange={(e) =>
                  setServiciosSel((prev) =>
                    e.target.checked ? [...prev, s.id] : prev.filter((x) => x !== s.id),
                  )
                }
                style={{ width: "auto", marginRight: 8 }}
              />
              {s.label}
            </label>
          ))}
        </div>
      )}

      {modo === "url" && (
        <div className="fila" style={{ alignItems: "flex-end" }}>
          <label className="campo">
            <span>URL</span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </label>
          <button className="btn" onClick={importar} disabled={ocupado || !url}>
            Importar
          </button>
        </div>
      )}

      {modo === "pegar" && (
        <label className="campo">
          <span>Fuente — no inventa nada fuera de esto</span>
          <textarea rows={8} value={fuente} onChange={(e) => setFuente(e.target.value)} />
        </label>
      )}

      <button className="btn" onClick={proponer} disabled={ocupado}>
        {cargando ?? "Proponer temas"}
      </button>

      {error && (
        <div className="warn">
          <strong>Error.</strong> {error}
          {fallidas.length > 0 && <p style={{ margin: "8px 0 0" }}>Fuentes caídas: {fallidas.join(" · ")}</p>}
        </div>
      )}

      {temas && (
        <>
          <h2>
            2 · Temas propuestos ({temas.length})
            {fallidas.length > 0 && (
              <span className="mono muted"> · no respondieron: {fallidas.join(", ")}</span>
            )}
          </h2>

          {temas.length === 0 ? (
            <p className="muted">
              Ninguno pasó el filtro de no-obviedad. No es un error: hay días que no hay nada que
              valga la pena.
            </p>
          ) : (
            temas.map((t, i) => (
              <label className="card" key={i} style={{ display: "block", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={elegidos.has(i)}
                  onChange={(e) =>
                    setElegidos((prev) => {
                      const n = new Set(prev)
                      if (e.target.checked) n.add(i)
                      else n.delete(i)
                      return n
                    })
                  }
                  style={{ width: "auto", marginRight: 8 }}
                />
                <span className="tag">
                  {t.servicioId} · {t.fuente}
                </span>
                <h3 style={{ marginTop: 8 }}>{t.tematica}</h3>
                <p>{t.angulo}</p>
                <p className="muted">
                  <strong>Por qué no es obvio:</strong> {t.porQueNoEsObvio}
                </p>
              </label>
            ))
          )}

          {temas.length > 0 && (
            <button className="btn" onClick={desarrollar} disabled={ocupado || elegidos.size === 0}>
              {progreso
                ? `Desarrollando ${progreso.hecho}/${progreso.total}…`
                : `Desarrollar ${elegidos.size} tema(s)`}
            </button>
          )}

          {descartados.length > 0 && (
            <details>
              <summary className="mono">Ver {descartados.length} descartado(s)</summary>
              <div className="scroll-x">
                <table>
                  <tbody>
                    {descartados.map((d, i) => (
                      <tr key={i}>
                        <td>{d.tematica}</td>
                        <td className="muted">{d.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </>
      )}

      {desarrolladas.length > 0 && (
        <>
          <h2>3 · Piezas ({desarrolladas.length})</h2>
          {desarrolladas.map((d, i) => (
            <div className="card" key={i}>
              {d.error ? (
                <>
                  <span className="tag">Falló</span>
                  <h3>{d.tema.tematica}</h3>
                  <p className="muted">{d.error}</p>
                </>
              ) : (
                d.pieza &&
                d.veredicto && (
                  <>
                    <span className="tag">
                      {d.decision ? d.decision.toUpperCase() : d.veredicto.estado}
                    </span>
                    <h3>{d.pieza.ficha.aprendizaje || d.tema.tematica}</h3>
                    <p className="muted">
                      <strong>Por qué avanzó:</strong> {d.pieza.ficha.por_que_avanzo || "—"}
                    </p>

                    {d.veredicto.violaciones.length > 0 && (
                      <div className="warn">
                        <strong>El crítico marcó {d.veredicto.violaciones.length}:</strong>
                        <ul style={{ marginBottom: 0 }}>
                          {d.veredicto.violaciones.map((v, k) => (
                            <li key={k}>
                              <code>{v.regla}</code> — {v.por_que}
                              <br />
                              <span className="muted">«{v.cita}»</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <details>
                      <summary className="mono">Ver la pieza</summary>
                      <p style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{d.pieza.copy_post}</p>
                      <ol>
                        {d.pieza.slides.map((s) => (
                          <li key={s.numero}>
                            <strong>{s.titulo}</strong>
                            {s.cuerpo ? ` — ${s.cuerpo}` : ""}
                            <div className="mono muted">visual: {s.sugerencia_visual}</div>
                          </li>
                        ))}
                      </ol>
                    </details>

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button className="btn" onClick={() => decidir(i, "aprobada")}>
                        Aprobar
                      </button>
                      <button className="btn" onClick={() => decidir(i, "rechazada")}>
                        Rechazar
                      </button>
                    </div>
                  </>
                )
              )}
            </div>
          ))}
        </>
      )}
    </>
  )
}
