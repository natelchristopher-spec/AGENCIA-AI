import Link from "next/link"
import { AGENCIA } from "@/lib/brand/profiles/agencia"

export default function Home() {
  const pendiente = AGENCIA.name === "NOMBRE_PENDIENTE"

  return (
    <main className="wrap">
      <span className="tag">Sistema de contenido</span>
      <h1>{pendiente ? "Sin nombre todavía" : AGENCIA.name}</h1>
      <p className="lede muted">
        {AGENCIA.descriptor}. El manual de marca no es documentación: es la especificación que el
        crítico aplica antes de publicar.
      </p>

      <h2>Estado</h2>
      <div className="scroll-x">
        <table>
          <tbody>
            <tr>
              <th>Perfil activo</th>
              <td>
                <code>{AGENCIA.id}</code> · persona por defecto <code>{AGENCIA.personaDefault}</code>
              </td>
            </tr>
            <tr>
              <th>Registro de pruebas</th>
              <td>
                {AGENCIA.pruebas.length === 0
                  ? "Vacío — el sistema no puede afirmar ningún resultado."
                  : `${AGENCIA.pruebas.length} afirmación(es) habilitada(s).`}
              </td>
            </tr>
            <tr>
              <th>Reglas que bloquean</th>
              <td>
                {AGENCIA.voz.prohibiciones.length} prohibiciones ·{" "}
                {AGENCIA.voz.verificables.length} verificables
              </td>
            </tr>
            <tr>
              <th>Ángulos de contenido</th>
              <td>
                {AGENCIA.creencias.length} creencias · {AGENCIA.personas.length} personas
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {pendiente && (
        <div className="warn">
          <strong>Falta el nombre.</strong> Está como <code>NOMBRE_PENDIENTE</code> en{" "}
          <code>src/lib/brand/profiles/agencia.ts</code>. Se propaga solo a todo el sistema.
        </div>
      )}

      <h2>Manual</h2>
      <p>
        <Link href="/manual">Ver el manual de marca completo</Link> — se renderiza desde los mismos
        tokens que alimentan los prompts, así el manual y lo que genera la IA no se pueden
        desincronizar.
      </p>
    </main>
  )
}
