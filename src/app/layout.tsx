import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Manual de marca",
  description: "Sistema de contenido autónomo.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
