import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Manual de marca",
  description: "Sistema de contenido autónomo.",
}

import Link from "next/link"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <nav className="nav">
          <div className="nav-inner">
            <Link href="/">Inicio</Link>
            <Link href="/sistema">Sistema</Link>
            <Link href="/manual">Manual de marca</Link>
            <Link href="/tendencias">Tendencias</Link>
            <Link href="/probar">Probar</Link>
            <Link href="/cola">Cola</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
