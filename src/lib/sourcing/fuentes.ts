// Catálogo de fuentes de tendencia, agrupadas POR SERVICIO.
//
// La agrupación no es cosmética: cada tendencia queda atada al servicio de su
// fuente, así el post que sale de ella ya sabe a qué servicio anclar el CTA.
// Sourcing y oferta quedan acoplados por construcción, en vez de que alguien
// tenga que decidir después a qué servicio corresponde cada pieza.
//
// Sin dependencias de servidor: lo importan tanto el barredor como la UI.

export interface Fuente {
  nombre: string
  url: string
}

export interface ServicioConFuentes {
  /** Debe coincidir con un id de `servicios` en el perfil de marca. */
  servicioId: string
  fuentes: Fuente[]
}

export const FUENTES: ServicioConFuentes[] = [
  {
    servicioId: "campanas",
    fuentes: [
      {
        nombre: "Search Engine Land — Google Ads",
        url: "https://searchengineland.com/library/platforms/google/google-ads/feed",
      },
      {
        nombre: "Search Engine Journal — PPC",
        url: "https://www.searchenginejournal.com/category/pay-per-click/feed/",
      },
      {
        nombre: "Google Ads Developer Blog",
        url: "https://ads-developers.googleblog.com/feeds/posts/default",
      },
    ],
  },
  {
    servicioId: "analytics",
    fuentes: [
      { nombre: "MarTech", url: "https://martech.org/feed/" },
      {
        nombre: "Search Engine Land — Analytics",
        url: "https://searchengineland.com/library/platforms/google/google-analytics/feed",
      },
    ],
  },
  {
    servicioId: "creativos",
    fuentes: [
      {
        nombre: "Search Engine Journal — Social",
        url: "https://www.searchenginejournal.com/category/social-media/feed/",
      },
      { nombre: "Practical Ecommerce", url: "https://www.practicalecommerce.com/feed" },
    ],
  },
]

export function fuentesDeServicio(servicioId: string): Fuente[] {
  return FUENTES.find((f) => f.servicioId === servicioId)?.fuentes ?? []
}
