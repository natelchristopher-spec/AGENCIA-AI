// La FORMA de un manual de marca. Universal: no cambia entre clientes.
//
// Todo lo que es específico de una marca vive en un BrandProfile (ver
// profiles/). Todo lo que es maquinaria —cómo se arma el prompt, cómo corrige
// el normalizador, qué verifica el crítico— trabaja contra esta interfaz y no
// sabe de qué marca se trata.
//
// Esa separación es lo que hace que el sistema sea replicable: para automatizar
// la cuenta de una tienda online se escribe un perfil nuevo, no se toca una
// línea de la maquinaria.

export type Registro = "voseo" | "neutro"
export type TipoCreencia = "vehiculo" | "interna" | "externa"
export type Densidad = "gancho" | "lectura"

// ── Pruebas ─────────────────────────────────────────────────────────────────
// El allowlist de lo que la marca puede afirmar. Vacío = no se afirma nada.
export interface Prueba {
  id: string
  afirmacion: string
  /** De dónde sale. Si no se puede señalar, no es una prueba. */
  respaldo: string
  publicable: boolean
}

export interface Servicio {
  id: string
  nombre: string
  /** El problema que resuelve, en el lenguaje del cliente. */
  resuelve: string
}

// ── Personas ────────────────────────────────────────────────────────────────
// Siempre quien DECIDE la compra, nunca quien ejecuta. Cada pieza le habla a
// una sola: mezclarlas es el "para todos = para nadie".
export interface Persona {
  id: string
  nombre: string
  rol: string
  porQueEsTarget: string
  perfil: string
  maneja: string
  dolores: string[]
  /** PROHIBIDO decírselo como hallazgo. Es contra esto que se mide la no-obviedad. */
  yaSabe: string[]
  loDesvela: string
  comoLoGanamos: string
}

// ── Creencias ───────────────────────────────────────────────────────────────
export interface Creencia {
  id: string
  tipo: TipoCreencia
  /** La objeción, dicha como la diría el cliente. */
  dice: string
  /** Por qué la cree. Casi siempre tiene base real: ignorarla no la desarma. */
  porQueLaCree: string
  /** Con qué se desarma: un mecanismo o un criterio, nunca una promesa. */
  seDerribaCon: string
}

// ── Voz ─────────────────────────────────────────────────────────────────────
export interface PilarTono {
  pilar: string
  detalle: string
}

/** Sustitución inequívoca a nivel palabra. Se aplica sola, en silencio. */
export interface Correccion {
  re: RegExp
  to: string
}

/** Detectable por regex, sin reemplazo seguro. Bloquea: hay que reescribir. */
export interface Prohibicion {
  re: RegExp
  motivo: string
}

/** Criterio explícito que evalúa el crítico. Bloquea. */
export interface Verificable {
  id: string
  regla: string
  /** Cómo se comprueba. Sin esto, la regla no es verificable y es GUIA. */
  criterio: string
}

export interface Voz {
  tono: PilarTono[]
  /** Instrucción de registro, ya redactada para el prompt. */
  registroDetalle: string
  correcciones: Correccion[]
  prohibiciones: Prohibicion[]
  verificables: Verificable[]
  /** Criterio de gusto. Va al prompt, nunca bloquea. */
  guia: string[]
  /** Voces personales para piezas con firma. Clave = id del firmante. */
  firmas: Record<string, string>
}

// ── Diseño ──────────────────────────────────────────────────────────────────
export interface Paleta {
  ink: string
  paper: string
  accent: string
  rule: string
}

export interface Tipografias {
  display: string
  body: string
  mono: string
}

export interface Diseno {
  paleta: Paleta
  fuentes: Tipografias
  /** Núcleo de estilo en inglés: lo consumen los modelos de imagen. */
  styleCore: string
  /** Arquitecturas de placa, para que el feed no parezca un catálogo. */
  layoutMotifs: string[]
  /** Reglas visuales que bloquean. Espejo de las prohibiciones de la voz. */
  designRules: string
  /** Jerarquía tipográfica, en criollo, para la página del manual. */
  jerarquia: string[]
}

// ── La vara ─────────────────────────────────────────────────────────────────
export interface Vara {
  aprendizajesValidos: string[]
  /** El piso del rubro. Puede ir como premisa; nunca como el hallazgo. */
  prohibidoComoAprendizaje: string[]
}

// ── Taxonomía ───────────────────────────────────────────────────────────────
// Los ejes sobre los que rota el contenido. Es lo que hace que el sistema no
// se quede sin qué decir: el material no viene de afuera, sale de combinar
// estos ejes. Seis pilares × seis temas × ocho tensiones × ocho frameworks ×
// dos personas × seis tipos son miles de casilleros distintos.
//
// Cada eje hace algo diferente y por eso son ortogonales:
//   pilar      → la LENTE con la que se mira (un error, un criterio, un caso)
//   tema       → el ÁREA de la que se habla
//   tension    → el CONFLICTO que anima la pieza
//   framework  → la ESTRUCTURA con la que se cuenta
//   tipo       → el REGISTRO de la pieza

export interface Pilar {
  id: string
  label: string
  /** Qué busca esta lente. Se inyecta en el prompt. */
  busca: string
}

export interface Tema {
  id: string
  label: string
  descripcion: string
  /** Qué NO entra en este tema. Evita que se desborde hacia áreas ajenas. */
  nunca?: string
}

export interface Taxonomia {
  pilares: Pilar[]
  temas: Tema[]
  /** El conflicto que anima la pieza. Nunca dos seguidas con la misma. */
  tensiones: string[]
  /** Estructuras narrativas disponibles. */
  frameworks: string[]
  tiposContenido: string[]
  /**
   * Día de la semana (0=domingo) → pilar preferido. Rotación determinística:
   * le da ritmo al feed sin costar una llamada al modelo.
   */
  pilarPorDia: Record<number, string>
}

/**
 * Metadatos que la pieza DECLARA sobre sí misma. Se validan contra las
 * restricciones después de generar: el modelo puede decir que eligió una
 * tensión y haber repetido la anterior, y eso se chequea.
 */
export interface MetaPieza {
  tension: string
  framework: string
  tipoContenido: string
  personaId: string
}

// ── El perfil completo ──────────────────────────────────────────────────────
export interface BrandProfile {
  id: string
  name: string
  /** Qué es la marca en una línea. Ej: "agencia de publicidad digital". */
  descriptor: string
  registro: Registro
  mercados: string[]

  posicionamiento: {
    tesis: string
    /** Lo que se muestra. La conclusión la saca el lector. */
    mecanismo: string
    /** Por qué la tesis es creíble y no una promesa más. */
    pruebaViva: string
    /**
     * Qué reemplaza, no qué mejora. Una marca que se presenta como "mejor que
     * X" compite en la grilla de X; una que ofrece otra cosa, no.
     */
    nuevaOportunidad: string
  }

  servicios: Servicio[]
  /** Allowlist de afirmaciones. Vacío = el sistema no puede afirmar resultados. */
  pruebas: Prueba[]

  personas: Persona[]
  personaDefault: string

  vara: Vara
  creencias: Creencia[]
  voz: Voz
  diseno: Diseno

  /** Qué se puede contar de un cliente y qué no. Bloquea. */
  confidencialidad: string
}

export function personaDe(profile: BrandProfile, id?: string): Persona {
  const buscado = id ?? profile.personaDefault
  const encontrada = profile.personas.find((p) => p.id === buscado)
  if (!encontrada) throw new Error(`Persona "${buscado}" no existe en el perfil "${profile.id}"`)
  return encontrada
}

export function creenciaDe(profile: BrandProfile, id: string): Creencia | undefined {
  return profile.creencias.find((c) => c.id === id)
}

export function pruebasPublicables(profile: BrandProfile): Prueba[] {
  return profile.pruebas.filter((p) => p.publicable)
}
