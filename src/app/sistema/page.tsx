import Link from "next/link"
import { AGENCIA } from "@/lib/brand/profiles/agencia"

export const metadata = { title: "El sistema" }

// Vista única de todo el sistema: qué hace cada etapa, qué está construido y
// qué falta. Se deriva del perfil donde puede, así no es una descripción que
// se despega de lo que el código realmente hace.

type Estado = "listo" | "parcial" | "pendiente"

const ETAPAS: { n: string; nombre: string; que: string; estado: Estado; detalle: string }[] = [
  {
    n: "01",
    nombre: "Sourcing",
    que: "De dónde sale el material",
    estado: "parcial",
    detalle:
      "Hoy la creencia que discute la pieza ES el insumo, y alcanza: con el registro de pruebas vacío el sistema solo puede escribir criterio y mecanismo, que no necesitan fuente externa. Falta traer material propio y novedades de las plataformas.",
  },
  {
    n: "02",
    nombre: "Selección del ángulo",
    que: "A quién le habla y qué creencia discute",
    estado: "listo",
    detalle:
      "Rota deliberadamente la combinación persona + creencia menos usada, con las piezas recientes pesando más. Variedad por diseño, más barata que detectar repetición después.",
  },
  {
    n: "03",
    nombre: "Generación",
    que: "Escribe la pieza y declara su ficha",
    estado: "listo",
    detalle:
      "La ficha (persona, aprendizaje, por qué no es obvio) es obligatoria. Si el sistema no puede justificar por qué el hallazgo no es obvio para esa persona, la pieza no avanza: la auto-justificación es la compuerta.",
  },
  {
    n: "04",
    nombre: "Crítico",
    que: "Aprueba o rebota antes de que lo vea nadie",
    estado: "listo",
    detalle:
      "Falla cerrado: si el crítico se cae, la pieza no se publica. Exige cita textual de cada violación y descarta las que no aparecen en el texto. Regenera nombrando lo que se coló, hasta dos veces, y se queda con el intento de menos violaciones.",
  },
  {
    n: "05",
    nombre: "Anti-redundancia",
    que: "Que no se repita a sí mismo",
    estado: "listo",
    detalle:
      "Compara el aprendizaje de la ficha, no el texto: sustancia en vez de forma. Previene inyectando lo ya publicado en el prompt, y detecta después en dos capas. Falla abierto, al revés que el crítico.",
  },
  {
    n: "06",
    nombre: "Cola y medición",
    que: "Dónde esperan las piezas y dónde se calibra",
    estado: "parcial",
    detalle:
      "Construida, pero necesita Supabase para persistir. Guarda el veredicto del crítico junto a tu decisión: esa tasa de coincidencia es el dato que decide si el sistema puede publicar solo.",
  },
  {
    n: "07",
    nombre: "Diseño de placas",
    que: "Texto a imagen con el sistema visual",
    estado: "pendiente",
    detalle:
      "El styleCore brutalista ya está escrito y se deriva de la paleta. Falta el render: generar las placas y recortarlas.",
  },
  {
    n: "08",
    nombre: "Publicación",
    que: "Que salga al feed",
    estado: "pendiente",
    detalle:
      "Instagram tiene camino por Graph API con cuenta business. LinkedIn en perfil personal no lo permite sin ser partner aprobado, así que ese canal queda semi-manual: el sistema genera y programa, vos pegás y publicás.",
  },
]

const FASES = [
  {
    n: 1,
    nombre: "Cola",
    actual: true,
    hace: "Genera y deja en cola. No publica nada.",
    pasa: "Cuando el crítico y vos coincidan en 9 de cada 10 piezas, dos semanas seguidas.",
  },
  {
    n: 2,
    nombre: "Veto",
    actual: false,
    hace: "Publica lo que el crítico aprueba, con ventana de veto de 12 horas.",
    pasa: "Un mes sin que uses el veto.",
  },
  {
    n: 3,
    nombre: "Autónomo",
    actual: false,
    hace: "Publica sin ventana. Reporte semanal.",
    pasa: "—",
  },
]

const MARCA: Record<Estado, string> = { listo: "✓", parcial: "~", pendiente: "·" }

export default function Sistema() {
  const faltaNombre = AGENCIA.name === "NOMBRE_PENDIENTE"

  return (
    <main className="wrap">
      <span className="tag">El sistema</span>
      <h1>Cómo funciona</h1>
      <p className="lede muted">
        Un sistema para que un modelo no determinístico produzca contenido publicable sin que lo
        revise una persona. Casi cada decisión del código es una defensa contra un modo de falla
        conocido.
      </p>

      <h2>Etapas</h2>
      {ETAPAS.map((e) => (
        <div className="card" key={e.n}>
          <span className="tag">
            {MARCA[e.estado]} {e.estado}
          </span>
          <h3>
            <span className="mono muted">{e.n}</span> · {e.nombre}
          </h3>
          <p className="muted" style={{ marginBottom: 8 }}>
            {e.que}
          </p>
          <p>{e.detalle}</p>
        </div>
      ))}

      <h2>Fases de autonomía</h2>
      <p className="muted">
        El paso de una fase a la otra no se decide por corazonada: cada una tiene un criterio
        medible.
      </p>
      <div className="scroll-x">
        <table>
          <thead>
            <tr>
              <th>Fase</th>
              <th>Qué hace el sistema</th>
              <th>Se pasa cuando</th>
            </tr>
          </thead>
          <tbody>
            {FASES.map((f) => (
              <tr key={f.n}>
                <td>
                  <strong>
                    {f.n}. {f.nombre}
                  </strong>
                  {f.actual && <div className="mono muted">actual</div>}
                </td>
                <td>{f.hace}</td>
                <td className="muted">{f.pasa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Qué falta para encenderlo</h2>
      <div className="warn">
        <ul style={{ margin: 0 }}>
          {faltaNombre && (
            <li>
              <strong>El nombre.</strong> Está en <code>NOMBRE_PENDIENTE</code>. Se propaga solo a
              todo el sistema desde un token.
            </li>
          )}
          {AGENCIA.pruebas.length === 0 && (
            <li>
              <strong>Al menos una prueba real.</strong> Con el registro vacío el sistema tiene
              prohibido afirmar cualquier resultado.
            </li>
          )}
          <li>
            <strong>Validar el <code>yaSabe</code></strong> de las dos personas. Es contra lo que se
            verifica que un hallazgo no sea obvio, así que de ahí depende toda la calidad.
          </li>
          <li>
            <strong>Variables de entorno:</strong> <code>ANTHROPIC_API_KEY</code>,{" "}
            <code>SUPABASE_URL</code>, <code>SUPABASE_SERVICE_ROLE_KEY</code>,{" "}
            <code>CRON_SECRET</code>.
          </li>
          <li>
            <strong>Correr la migración</strong> <code>supabase/migrations/0001_cola.sql</code> y
            activar la operación.
          </li>
        </ul>
      </div>

      <h2>Antes de automatizar</h2>
      <p>
        El banco de pruebas corre local y no necesita nada de lo anterior salvo la clave de API:
      </p>
      <p className="mono" style={{ border: "2px solid var(--rule)", padding: "12px 14px" }}>
        npx tsx scripts/probar.ts --n 6
      </p>
      <p className="muted">
        Genera seis piezas rotando ángulos y escribe un informe con una línea para tu veredicto en
        cada una. Comparado con el del crítico, eso es la tasa de coincidencia.
      </p>

      <h2 />
      <p>
        <Link href="/manual">Ver el manual de marca</Link> · <Link href="/cola">Ver la cola</Link>
      </p>
    </main>
  )
}
