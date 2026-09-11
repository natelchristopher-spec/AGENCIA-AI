# Replicar el sistema a otra marca

Este sistema está partido en dos: **maquinaria** y **perfil**. Para automatizar
la cuenta de un cliente —una tienda online, por ejemplo— se escribe un perfil
nuevo y no se toca la maquinaria.

| | Archivos | Cambia por marca |
|---|---|---|
| **Maquinaria** | `src/lib/brand/types.ts`, `prompt.ts`, `normalize.ts` | No |
| **Perfil** | `src/lib/brand/profiles/<marca>.ts` | Sí, entero |
| **Objetivos** | `src/lib/content/objectives.ts` | Revisar (ver abajo) |

Un perfil es un objeto que cumple `BrandProfile`. La forma la impone TypeScript:
si falta un campo, no compila. Esa es la checklist real; lo de abajo explica
cómo completar cada campo bien.

---

## El orden importa

Completar en este orden. Cada paso depende del anterior, y saltearse el primero
es la causa raíz de que el contenido salga genérico.

### 1. Personas (`personas`, `personaDefault`)

**Es el paso que define la calidad de todo lo demás.** Una audiencia amplia
—"dueños y responsables de marketing"— es apuntarle a todos, o sea a nadie, y
produce contenido que dice lo que cualquiera del rubro ya sabe.

Reglas:

- La persona es **quien decide la compra**, nunca quien ejecuta. En una tienda
  online es el dueño o el responsable de ecommerce, no el community manager.
- Dos personas como máximo. Cada pieza le habla a **una sola**.
- El campo **`yaSabe` es el más importante del perfil.** Es contra lo que el
  crítico verifica que un hallazgo no sea obvio. Sin él, "aportá un ángulo no
  obvio" se cumple de palabra y no de hecho: el modelo no puede evitar decirle
  al lector algo que ya sabe si nunca se le dijo qué sabe.

Para llenar `yaSabe`, la pregunta es: *¿qué le diría a esta persona cualquier
proveedor del rubro en la primera reunión?* Todo eso es su piso.

### 2. Posicionamiento (`posicionamiento`)

Los cuatro campos hacen cosas distintas:

- `tesis` — qué es la marca y por qué existe.
- `nuevaOportunidad` — **qué reemplaza, no qué mejora.** Una marca que se
  presenta como "mejor que X" compite en la grilla de X. Si no podés escribir
  qué cosa distinta se está comprando, el posicionamiento todavía no está.
- `mecanismo` — cómo funciona. Es lo que se muestra; la conclusión la saca el
  lector. La marca nunca se auto-adjudica el adjetivo.
- `pruebaViva` — por qué es creíble hoy, sin resultados acumulados.

### 3. Registro de pruebas (`pruebas`)

El allowlist de lo que la marca puede afirmar. Funciona igual que el allowlist
de cifras en la generación de imágenes: en vez de enumerar todo lo que un
modelo podría inventar (imposible), se enumera lo único permitido.

**Arranca vacío y eso bloquea de verdad.** Con `pruebas: []` el prompt dice
literalmente *"NO afirmes ningún resultado, cifra, porcentaje ni logro"*. El
sistema puede explicar el método y el criterio, pero no puede decir
"conseguimos X". Es incómodo al principio, a propósito: es la única forma de
que "sin humo" no dependa de que alguien se acuerde.

Cada entrada necesita `respaldo`: de dónde sale. Si no se puede señalar, no es
una prueba.

### 4. Creencias (`creencias`)

Las objeciones que bloquean la compra, en tres tipos: `vehiculo` (que el método
no funciona), `interna` (que él no va a poder aprovecharlo), `externa` (que algo
de afuera lo va a impedir igual).

Le dan al sistema un **eje sobre el que generar**. Una pieza sin creencia
asignada tiende a salir genérica porque no está discutiendo nada.

El campo `porQueLaCree` no es relleno: casi toda objeción tiene una base real, y
reconocerla antes de discutirla es lo que evita que el lector se ponga a la
defensiva. Y `seDerribaCon` tiene que ser **un mecanismo o un criterio, nunca
una promesa ni un testimonio**.

### 5. Vara de calidad (`vara`)

- `aprendizajesValidos` — qué cuenta como que el lector se llevó algo.
- `prohibidoComoAprendizaje` — el piso del rubro. Puede ir como **premisa**;
  nunca como el hallazgo.

Para una tienda online, el piso sería cosas como "publicá seguido", "mostrá el
producto en uso", "respondé los comentarios", "usá reels". Son verdad y no le
enseñan nada a nadie.

### 6. Voz (`voz`)

- `tono` — tres o cuatro pilares. Cada uno con el detalle de qué implica al
  escribir, no un adjetivo suelto.
- `registroDetalle` — voseo o neutro, ya redactado para el prompt.
- `correcciones` — **solo sustituciones inequívocas a nivel palabra.** Si una
  corrección puede dar un falso positivo, no va acá: va a `verificables` y la
  juzga el crítico. Saber dónde termina el determinismo es la mitad del patrón.
- `prohibiciones` — detectables por regex, sin reemplazo seguro. Bloquean.
- `verificables` — **cada una necesita su `criterio`**: cómo se comprueba. Si no
  podés escribir cómo se verifica, la regla va a `guia`.
- `guia` — criterio de gusto. Va al prompt, nunca bloquea.
- `firmas` — voces personales para piezas en primera persona.

La prueba de fuego para meter una regla: *"sin humo"* es `guia`; *"toda
afirmación de resultado mapea a una prueba del registro"* es `verificable`.

### 7. Diseño (`diseno`)

`styleCore` se **deriva** de la paleta y las fuentes, no se escribe aparte. Así
el manual visual y lo que genera la IA no se pueden desincronizar: cambiás un
token y se propaga a los dos.

Va en inglés porque lo consumen los modelos de imagen, y tiene que ser
explícito sobre lo que **no** debe aparecer: los modelos tienden por defecto a
degradados, brillos y volumen, así que si el estilo es plano hay que prohibirlos
por escrito.

`layoutMotifs` da variedad por placa para que el feed no parezca un catálogo
donde solo cambia el texto. Se rota por índice de slide.

### 8. Confidencialidad (`confidencialidad`)

Qué se puede contar de un cliente y qué no. El criterio general: **se muestra la
variación, nunca la escala.** Un porcentaje describe el trabajo; un monto
describe el negocio del cliente, que no es nuestro para contarlo.

---

## Objetivos de publicación

`src/lib/content/objectives.ts` es maquinaria, pero el catálogo de objetivos sí
depende del negocio. Los actuales (`lead`, `autoridad`, `nutricion`, `prueba`)
son de una agencia de servicios.

Una tienda online necesita otros: venta directa de producto, lanzamiento,
oferta, contenido de marca. Al escribir un perfil de ecommerce hay que revisar
este archivo y ajustar `OBJETIVOS` y `objetivoDePieza`.

El objetivo es lo primero que estructura un prompt y **manda sobre todo lo
demás**: de él se derivan la densidad de texto, los drivers de copy y el CTA.

---

## Checklist de arranque

```
[ ] personas + yaSabe          ← el que define la calidad de todo
[ ] posicionamiento            ← incluido qué REEMPLAZA
[ ] pruebas (puede ir vacío)
[ ] creencias
[ ] vara (sobre todo el piso del rubro)
[ ] voz (correcciones / prohibiciones / verificables / guia)
[ ] diseño (paleta → styleCore derivado)
[ ] confidencialidad
[ ] revisar objectives.ts
```

Si `personas[].yaSabe` quedó vacío o genérico, el resto no importa: el sistema
va a producir contenido correcto y obvio.
