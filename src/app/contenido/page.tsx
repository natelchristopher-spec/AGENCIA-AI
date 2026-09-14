import { accesoConfigurado } from "@/lib/acceso"
import { AGENCIA } from "@/lib/brand/profiles/agencia"
import { Studio } from "./studio"

export const metadata = { title: "Generación de contenido" }
export const dynamic = "force-dynamic"

export default function Contenido() {
  const protegido = accesoConfigurado()

  return (
    <main className="wrap">
      <span className="tag">Manual</span>
      <h1>Generación de contenido</h1>
      <p className="lede muted">
        Todo a mano, con vos decidiendo en cada paso. Cuando los resultados sean buenos de forma
        consistente, esto mismo pasa a correr solo: la maquinaria es la misma, lo único que cambia
        es quién aprieta el botón.
      </p>

      {!protegido && (
        <div className="warn">
          <strong>Estas rutas están abiertas.</strong> Cada generación gasta crédito de tu cuenta de
          OpenAI y el sitio es público. Configurá <code>APP_PASSWORD</code> en las variables de
          entorno de Vercel para cerrarlas.
        </div>
      )}

      <Studio
        personas={AGENCIA.personas.map((p) => ({ id: p.id, label: `${p.nombre} — ${p.rol}` }))}
        servicios={AGENCIA.servicios.map((s) => ({ id: s.id, label: s.nombre }))}
        necesitaClave={protegido}
      />
    </main>
  )
}
