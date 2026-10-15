# DiseÃ±o UI/UX â€” App del Cliente (MenÃº, Pedido, Mis Pedidos)

Documento de diseÃ±o (propuesta, sin implementaciÃ³n) para las pantallas del
cliente (`/menu`, flujo de pedido y `/mis-pedidos`). Es una de las tres
piezas de la divisiÃ³n de diseÃ±os por rol:

- `docs/diseÃ±o-operativo.md` â€” administraciÃ³n y caja
- `docs/diseÃ±o-cocina.md` â€” tablero de cocina (KDS)
- **`docs/diseÃ±o-cliente.md`** (este) â€” app del cliente

Este documento **reescribe el boceto `diseÃ±o conceptual.md`** para el flujo
real del cliente: reutiliza sus patrones (catÃ¡logo con categorÃ­as y
stepper, barra flotante, drawer, bottom bar, ilustraciones orgÃ¡nicas) y
descarta las pantallas de caja, que viven ahora en `diseÃ±o-operativo.md`.
El sistema de diseÃ±o canÃ³nico es **`docs/DESIGN.md`** (paleta y tokens
definidos allÃ­; este documento no los redefine).

> **Nota de alcance:** implementar este diseÃ±o requiere una spec nueva
> (p. ej. `specs/007-ui-redesign`) con aprobaciÃ³n previa (constituciÃ³n Â§I).
> Los elementos marcados **[Fuera de alcance]** no deben implementarse sin
> aprobaciÃ³n explÃ­cita (Â§27).

---

## 1. Identidad visual y estilo

- **Paleta** (segÃºn `DESIGN.md`, no el boceto): verde institucional
  `#1E7A46` en acciones primarias y estados seleccionados; fondo crema
  `#F6F1E9` con tarjetas blancas; acento espresso `#6B3F23` para *Especiales
  del dÃ­a*; texto `#1C1917`/`#44403C`.
- **TipografÃ­a:** Plus Jakarta Sans en tÃ­tulos, precios y totales; Inter en
  cuerpo. Precios en peso 700.
- **Motivos orgÃ¡nicos:** hojas/ondas sutiles en el Ã¡rea de bienvenida y
  estados vacÃ­os, sobre `surface-container` â€” nunca verde como fondo grande
  (DESIGN.md).
- **Componentes recurrentes:** tarjetas redondeadas (12â€“16 px), iconografÃ­a
  lineal minimalista, badges pill (especial, estados de pedido), controles
  â‰¥ 44 px.

---

## 2. NavegaciÃ³n propuesta

Reemplaza los tabs actuales (`ClienteLayout`) por **drawer + bottom bar**:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â˜°  CafeterÃ­a ITSH             ðŸ‘¤ MarÃ­a G.   â”‚  header sticky
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                    â”‚ hamburguesa
                    â–¼                MÃ³vil â€” bottom bar:
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ‘¤  MarÃ­a G. Â· Alumno      â”‚    â”‚  [ â˜• MenÃº ] [ ðŸ“‹ Mis     ]â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚    â”‚           pedidos â—      â”‚
â”‚  MenÃº del dÃ­a   â† activo   â”‚    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â”‚  Mis pedidos          (â—)  â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚  Cerrar sesiÃ³n             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- **Bottom bar (mÃ³vil):** 2 pestaÃ±as â€” **MenÃº** y **Mis pedidos** â€” con
  badge cuando hay un pedido `Listo` para recoger (dato de
  `GET /api/pedidos`).
- **Escritorio:** el drawer se muestra como panel lateral fijo de 16rem.
- El flujo de pedido (`/pedido/confirmar`, `/pedido/:id/pago`,
  `/pedido/:id/confirmacion`) es una secuencia **con botÃ³n regresar** en el
  encabezado; no aparece en la bottom bar (no es una secciÃ³n, es un paso).

---

## 3. Pantallas

### 3.1 Flujo

```
   [MenÃº del dÃ­a] â”€â”€stepperâ”€â”€â–º [Barra flotante] â”€â”€â–º [Confirmar pedido]
                                                          â”‚
   [Mis pedidos] â—„â”€â”€ [ConfirmaciÃ³n] â—„â”€â”€ [Pago] â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 3.2 Pantalla 1: MenÃº del dÃ­a (`/menu`)

- **Encabezado:** nombre de la cafeterÃ­a + fecha; hamburguesa del drawer.
- **Ãrea de bienvenida:** ilustraciÃ³n de taza con la leyenda *"Â¡Buen dÃ­a!
  Tu cafÃ©, en buenas manos"* sobre formas orgÃ¡nicas (patrÃ³n del boceto,
  opcional en escritorio).
- **Filtros y bÃºsqueda:**
  - barra `Buscar producto...` con filtro en vivo;
  - chips de categorÃ­a horizontales con icono: *Bebidas*, *Comida*,
    *Snacks*, *Postres* â€” derivados de las categorÃ­as reales del catÃ¡logo
    (no se inventan categorÃ­as fijas).
- **Listado de platillos:** tarjetas con nombre, descripciÃ³n corta, precio
  unitario en peso 700 y stepper `âˆ’ 0 +` (botones 44 px, `âˆ’` deshabilitado
  en 0):
  - badge **Especial** en acento espresso (especial del dÃ­a);
  - no disponibles: tarjeta atenuada, stepper deshabilitado, badge
    *"No disponible"* (patrÃ³n actual);
  - *ImÃ¡genes de platillo:* **[Fuera de alcance]** â€” el catÃ¡logo no tiene
    campo de imagen; se usa icono de categorÃ­a + tipografÃ­a.
- **Barra flotante inferior:** "N productos Â· $total" + CTA **Ver pedido**
  (a `/pedido/confirmar`); visible solo con carrito no vacÃ­o y apilada
  sobre la bottom bar.
- **Estados:** *MenÃº no disponible hoy* (tarjeta explicativa), vacÃ­o de
  filtro ("Sin resultados para â€˜Xâ€™"), error con `Reintentar`.
- **Persistencia:** el carrito se conserva en el dispositivo (hoy en
  `localStorage`) al navegar entre pantallas.

### 3.3 Pantalla 2: Confirmar pedido (`/pedido/confirmar`)

- **Encabezado:** botÃ³n regresar + "Revisa tu pedido".
- **Desglose:** partidas con cantidad Ã— nombre, precio calculado e icono
  para quitar; total grande (`stat-lg`, verde primario).
- **Hora de recolecciÃ³n:** selector con la **regla de 10 minutos de
  anticipaciÃ³n** validada en cliente (FR-011/FR-021): si la hora elegida es
  a menos de 10 min, mensaje inline en color `error` con la hora mÃ­nima
  posible.
- **CTA: Continuar al pago** (primario, 48 px).
- **Estado vacÃ­o:** *"Tu carrito estÃ¡ vacÃ­o"* + CTA **Volver al menÃº**.
- **Nota:** "Recogida presencial en la cafeterÃ­a." (el cliente no paga
  aquÃ­).

### 3.4 Pantalla 3: Pago (`/pedido/:id/pago`)

- **Encabezado:** "Pagar pedido" + monto total en peso 800.
- **Concepto:** adaptador de pago **simulado** â€” la pantalla no solicita
  datos de tarjeta (FR-012; la UI debe decirlo explÃ­citamente, como hoy:
  *"Este proceso no captura datos de tarjeta"*).
- **CTA: Pagar** (primario, 48 px); durante la peticiÃ³n, botÃ³n deshabilitado
  con texto "Procesandoâ€¦".
- **Estados:**
  - *Rechazo:* pedido queda `Pendiente` â†’ mensaje de error + **Reintentar
    pago** (primario) y **Cancelar pedido** (outline);
  - *"Este pedido ya estÃ¡ pagado"* (recarga de una pÃ¡gina ya liquidada) con
    CTA a confirmaciÃ³n/mis pedidos;
  - error de red con `Reintentar`.
- **[Fuera de alcance]:** mÃ©todos de pago (tarjeta/transferencia), monedero
  o saldo: el MVP usa el adaptador simulado Ãºnico (SC-S3-04).

### 3.5 Pantalla 4: ConfirmaciÃ³n (`/pedido/:id/pago â†’ /confirmacion`)

- **Encabezado:** "ConfirmaciÃ³n de pedido".
- **Folio** grande (`font-mono` 24 px+), estado en badge pill (`Pagado`
  verde) y desglose: fecha/hora de recolecciÃ³n, total, cliente.
- **CTA:** **Ver mis pedidos** (primario) y **Volver al menÃº** (outline).
- La fuente de verdad es el servidor: el estado se consulta al montar la
  pantalla; si falla la consulta, mensaje de error con `Reintentar` (caso
  borde actual: confirmaciÃ³n no visible tras fallo de red).

### 3.6 Pantalla 5: Mis pedidos (`/mis-pedidos`)

- **Encabezado:** "Mis pedidos" + badge con el total de pedidos activos.
- **Lista** de mÃ¡s reciente a mÃ¡s antiguo; cada tarjeta:
  - folio + badge de estado pill (colores `status-*`: Pendiente, Pagado,
    En preparaciÃ³n, Listo, Entregado, Cancelado);
  - fecha y hora de recolecciÃ³n, total;
  - **aviso destacado "Â¡Listo para recoger!"** cuando el estado es `Listo`
    (tarjeta con borde `status-ready` y sombra sutil) â€” aviso in-app US2;
  - detalle expandible con partidas (cantidad Ã— nombre).
- **CTA flotante:** **Nuevo pedido** (regresa al menÃº) cuando no hay
  pedidos activos.
- **Estados:** vacÃ­o (*"AÃºn no has hecho pedidos"* + CTA a menÃº), error con
  `Reintentar`.

---

## 4. Fuera de alcance en la app del cliente

| Elemento | Motivo |
|---|---|
| Fotos de platillo | El catÃ¡logo no tiene campo de imagen (requiere backend nuevo) |
| Notificaciones push / SMS | El aviso de pedido listo es in-app hoy (US2); push requiere spec y permisos |
| Favoritos, valoraciones, reseÃ±as | Fuera del alcance MVP (Â§I, Â§27) |
| MÃ©todos de pago con tarjeta/transferencia | Adaptador simulado Ãºnico (SC-S3-04); sin datos de tarjeta (seguridad Â§6) |
| Descuentos y promociones | No existen en el modelo de datos |
| Historial de pagos/facturaciÃ³n | No existe pantalla ni endpoint |

---

## 5. Deviaciones respecto al boceto original

1. **Paleta:** se usa la de `DESIGN.md` (`#1E7A46`, `#F6F1E9`), no
   `#1E4632` / `#DCECE1` / `#F7F9F7`.
2. **Pantallas de caja** (Capturar pedido, Cobro, Pedidos listos, Cobrar
   pedido, detalle con mÃ©todos de pago): se movieron al documento operativo
   (`docs/diseÃ±o-operativo.md`), porque pertenecen al rol cajero.
3. **Historial de ventas / ConfiguraciÃ³n en el drawer:** fuera de alcance;
   el drawer del cliente solo tiene MenÃº, Mis pedidos y Cerrar sesiÃ³n.
4. **ImÃ¡genes de producto:** sustituidas por icono de categorÃ­a +
   tipografÃ­a (la BD no tiene campo de imagen).

---

## 6. Checklist de cumplimiento

- [ ] Controles â‰¥ 44 px; CTA primarios de 48 px (FR-020).
- [ ] Regla de 10 min validada y explicada en cliente (FR-011/FR-021).
- [ ] Sin captura de datos de tarjeta en ninguna pantalla (FR-012).
- [ ] Estados de pedido con badges pill y colores de `DESIGN.md`.
- [ ] Estados vacÃ­os/carga/error consistentes con `Reintentar`.
- [ ] Carrito persistente entre pantallas (FR-010).
- [ ] Nada marcado **[Fuera de alcance]** aparece como implementable sin
      aprobaciÃ³n (Â§27).
