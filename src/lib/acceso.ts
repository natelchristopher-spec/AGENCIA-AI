// Protección mínima de las rutas que gastan crédito de API.
//
// El sitio está desplegado en público y cada llamada a /api/contenido cuesta
// plata. Sin esto, cualquiera que encuentre la URL puede vaciar la cuenta.
//
// Si APP_PASSWORD no está configurada, las rutas quedan ABIERTAS y se avisa en
// la UI. Es deliberado: obligar a configurarla antes de poder probar nada
// trabaría el desarrollo, pero dejarlo en silencio sería peor.

export function accesoConfigurado(): boolean {
  return Boolean(process.env.APP_PASSWORD)
}

/** Devuelve null si pasa; un Response 401 si no. */
export function verificarAcceso(req: Request): Response | null {
  const esperada = process.env.APP_PASSWORD
  if (!esperada) return null
  const recibida = req.headers.get("x-app-password")
  if (recibida === esperada) return null
  return Response.json({ error: "Clave incorrecta o faltante." }, { status: 401 })
}
