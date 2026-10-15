# DiseÃ±o UI/UX â€” Panel Operativo (Admin + Caja)

Documento de diseÃ±o (propuesta, sin implementaciÃ³n) para las pantallas del
personal operativo: `/admin` y `/caja`. Es una de las tres piezas de la
divisiÃ³n de diseÃ±os por rol:

- **`docs/diseÃ±o-operativo.md`** (este) â€” administraciÃ³n y caja
- `docs/diseÃ±o-cocina.md` â€” tablero de cocina (KDS)
- `docs/diseÃ±o-cliente.md` â€” app del cliente (menÃº, pedido, mis pedidos)

El sistema de diseÃ±o canÃ³nico es **`docs/DESIGN.md`** (tokens en
`frontend/src/index.css`). Este documento **no redefine paleta ni tipografÃ­a**:
toda referencia a "verde primario", "fondo crema", "badge de estado" o
"tipografÃ­a" apunta a ese archivo.

> **Nota de alcance:** implementar este diseÃ±o requiere una spec nueva
> (p. ej. `specs/007-ui-redesign`) con aprobaciÃ³n previa (constituciÃ³n Â§I).
> Los elementos marcados **[Fuera de alcance]** no deben implementarse sin
> aprobaciÃ³n explÃ­cita (Â§27).

---

## 1. Reglas aplicables a este documento

| Regla | Fuente | ImplicaciÃ³n de diseÃ±o |
|---|---|---|
| Ãrea tÃ¡ctil â‰¥ 44 px en caja | FR-020, Â§19 | Steppers, botones de cobro y entrega de 44â€“48 px |
| Menor cantidad de pasos posible | Â§19 | Captura + cobro en un solo botÃ³n (SC-S4-01) |
| Alto contraste y legibilidad | Â§19, DESIGN.md | Fila de caja â‰¥ 56 px, cifras en peso 700/800 |
| App Ãºnica con rutas por rol | Â§2 | Drawer/bottom bar viven dentro de los layouts existentes |
| Sin dependencias nuevas | Â§22 | Drawer y bottom bar se construyen con Tailwind + React Router |

---

## 2. NavegaciÃ³n propuesta (reemplaza los tabs horizontales)

Hoy los 4 layouts usan `RoleHeader` + nav horizontal de tabs. La propuesta
sustituye esa nav por **drawer lateral** y, en caja, **bottom bar** en mÃ³vil
(patrÃ³n previsto en `DESIGN.md`: "navegaciÃ³n inferior o barra superior segÃºn
el rol").

### 2.1 Drawer lateral (admin y caja)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â˜°  TÃ­tulo de secciÃ³n        Nombre Â· Rol    â”‚  â† header sticky
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                    â”‚ hamburguesa
                    â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ‘¤  Cajero Marta LÃ³pez     â”‚   perfil (avatar + rol)
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚  Inicio                    â”‚   â† activo en verde primario
â”‚  Capturar pedido           â”‚
â”‚  Pedidos listos      (3)   â”‚   badge con contador
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚  Cerrar sesiÃ³n             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- **MÃ³vil:** el drawer entra desde la izquierda sobre un fondo oscurecido.
- **Escritorio:** el mismo listado queda fijo como panel lateral izquierdo de
  16rem; el contenido usa el ancho restante (paneles laterales para caja,
  DESIGN.md).
- El contador del badge de "Pedidos listos" proviene de
  `GET /api/caja/pedidos` (dato ya disponible).

### 2.2 Bottom bar de caja (mÃ³vil)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   [ ðŸ›’ Caja ]   [ âœ“ Entregas â—3 ] â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Solo **2 pestaÃ±as**: `Caja` (inicio + captura) y `Entregas` (pedidos
  listos). El boceto original incluÃ­a `Historial`, que **[Fuera de alcance]**
  (no existe pantalla ni endpoint de historial de ventas).
- El punto/contador indica entregas pendientes.
- Altura de la barra â‰¥ 56 px; cada pestaÃ±a es un Ã¡rea tÃ¡ctil de â‰¥ 44 px.

---

## 3. Parte A â€” Panel de administraciÃ³n (`/admin`)

RediseÃ±o de las tres pantallas existentes (`UsuariosPage`, `PlatillosPage`,
`MenuDelDiaPage`) con mejor jerarquÃ­a y acciones rÃ¡pidas. No agrega
funcionalidad: es el mismo CRUD con una estructura mÃ¡s clara.

### 3.1 Pantalla: Inicio (nueva landing del admin)

Sustituye el tabs-bar como punto de entrada. Contenido:

- **Encabezado:** fecha del dÃ­a y saludo corto; hamburguesa del drawer.
- **Acciones rÃ¡pidas:** tres tarjetas enlazando a cada secciÃ³n, con conteo
  derivado de endpoints existentes:
  - *Usuarios* â€” "N activos" (`GET /api/usuarios`).
  - *Platillos* â€” "N en catÃ¡logo" (listado existente de platillos).
  - *MenÃº del dÃ­a* â€” "N publicados hoy" (`GET /api/menu`).
- **Resumen del menÃº de hoy:** platillos con badge `Especial` (acento
  espresso) y los no disponibles atenuados, para detectar de un vistazo
  huecos del dÃ­a.
- **[Fuera de alcance]** Bloque de mÃ©tricas de negocio (ventas del dÃ­a,
  pedidos por estado, platillos mÃ¡s vendidos): **no existen endpoints** de
  estadÃ­sticas en el backend; requiere aprobaciÃ³n y spec de backend nuevo.

### 3.2 Pantalla: Usuarios

- **Estructura:** lista como filas altas (â‰¥ 56 px) en lugar de tarjetas
  apretadas:
  `Nombre Â· correo` | badge de rol (pill, `secondary-container`) |
  estado (Activo / Inhabilitado) | acciones por fila (`Editar`,
  `Deshabilitar`).
- **CTA fijo:** botÃ³n primario "Nuevo usuario" anclado arriba a la derecha
  (mÃ³vil: botÃ³n flotante inferior de 48 px).
- **Formulario:** se abre en panel lateral (escritorio) o sheet inferior
  (mÃ³vil) con el mismo contenido actual: nombre, correo, contraseÃ±a, rol.
  Campos con etiqueta visible arriba, foco verde 2 px (DESIGN.md).
- **Estados:** vacÃ­o ("AÃºn no hay usuarios operativos" + CTA), error con
  `Reintentar`, confirmaciÃ³n de deshabilitar en diÃ¡logo con texto claro.

### 3.3 Pantalla: Platillos

- **Encabezado:** "CatÃ¡logo de platillos" + buscador por nombre + chips de
  categorÃ­a (las que existan en el catÃ¡logo) para filtrar.
- **Lista:** tarjetas de platillo con nombre, descripciÃ³n corta, badge de
  categorÃ­a, estado (`Activo`/`Inactivo`) y acciones `Editar` / activar-
  desactivar. Precio solo donde aplique (el precio se asigna en menÃº del dÃ­a).
- **CTA fijo:** "Nuevo platillo" (mismo patrÃ³n que Usuarios).
- **Estados:** vacÃ­o ("El catÃ¡logo estÃ¡ vacÃ­o" + CTA), vacÃ­o de filtro
  ("Sin resultados para â€˜Xâ€™"), error con `Reintentar`.

### 3.4 Pantalla: MenÃº del dÃ­a

- **Selector de fecha** visible en el encabezado (hoy/otra fecha), con
  indicador "MenÃº de hoy" cuando corresponde.
- **Grid de platillos del dÃ­a:** cada tarjeta muestra nombre, precio en
  peso 700, y:
  - toggle `Disponible` (Ã¡rea tÃ¡ctil â‰¥ 44 px),
  - badge `Especial` conmutable (acento espresso),
  - acciÃ³n `Quitar del menÃº` con confirmaciÃ³n.
- **Panel "Agregar al menÃº":** buscador sobre el catÃ¡logo + campo de precio
  (escritorio: panel lateral; mÃ³vil: parte inferior de la pantalla).
- **Estados:** fecha sin menÃº ("No hay menÃº publicado para esta fecha" +
  acciÃ³n para agregar), error con `Reintentar`.

---

## 4. Parte B â€” Caja (`/caja`)

RediseÃ±o del flujo actual de `CajaPage` (captura + cobro en efectivo y
entrega de pedidos listos) incorporando los patrones del boceto
`diseÃ±o conceptual.md`: panel de inicio con acciones rÃ¡pidas, catÃ¡logo con
bÃºsqueda/categorÃ­as/stepper, barra flotante de cobro y bottom bar.

### 4.1 Flujo

```
   [Drawer / Bottom bar]
           â”‚
           â–¼
   [ 1. Inicio ] â”€â”€â–º [ 2. Nuevo pedido ] â”€â”€â–º [ 3. Resumen de cobro ]
        â”‚                                          â”‚
        â”‚                                          â–¼
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º [ 4. Entregas ]        [ Resultado: âœ“ folio ]
                                                    â”‚
                                            [ âœ— error â†’ reintento ]
```

### 4.2 Pantalla 1: Inicio (panel de caja)

- **Encabezado:** "CafeterÃ­a ITSH Â· Caja", fecha, avatar del usuario en el
  drawer.
- **Acciones rÃ¡pidas:**
  - BotÃ³n primario destacado: **Capturar pedido** (acceso directo al
    catÃ¡logo).
  - MÃ³dulo **Entregas** con badge de contador (pedidos `Listo` pendientes).
- **Ãrea de bienvenida:** ilustraciÃ³n de taza con leyenda *"Â¡Buen dÃ­a! Tu
  cafÃ©, en buenas manos"* sobre formas orgÃ¡nicas sutiles (fondo
  `surface-container`, nunca verde como fondo grande).
- **[Fuera de alcance]** MÃ³dulo "Historial de ventas": no existe pantalla ni
  endpoint; fuera del MVP.

### 4.3 Pantalla 2: Nuevo pedido (catÃ¡logo y carrito)

- **Encabezado:** botÃ³n regresar, tÃ­tulo "Nuevo pedido".
- **Nombre del cliente (opcional):** campo con etiqueta visible, para
  identificar el pedido al entregar (ya existe en el flujo actual).
- **BÃºsqueda y categorÃ­as:**
  - barra `Buscar producto...` que filtra en vivo;
  - chips horizontales con icono por categorÃ­a (*Bebidas*, *Comida*,
    *Snacks*, *Postres* â€” las categorÃ­as derivadas del catÃ¡logo, no se
    inventan categorÃ­as fijas).
- **Listado de productos:** filas altas (â‰¥ 56 px) con nombre, precio c/u en
  peso 700 y **stepper** `âˆ’ 0 +`:
  - botones de 44 px, deshabilitado `âˆ’` en 0;
  - cantidad mÃ¡xima 99 (lÃ­mite actual);
  - solo platillos `disponible` del menÃº de hoy.
- **Barra flotante inferior (checkout bar):** resumen persistente sobre la
  bottom bar: "N platillos" + total en `font-heading` + botÃ³n **Ver cobro**.
  Visible solo con carrito no vacÃ­o. Compite en altura con la bottom bar: en
  mÃ³vil apila justo encima de ella.
- **Estados:** cargando ("Cargando menÃºâ€¦"), error + `Reintentar`, vacÃ­o
  ("No hay platillos disponibles en el menÃº de hoy").

### 4.4 Pantalla 3: Resumen de cobro

- **Encabezado:** "Cobro" con botÃ³n regresar al catÃ¡logo.
- **Desglose:** tarjeta con los Ã­tems seleccionados: cantidad Ã— nombre,
  precio calculado, icono `Ã—` para quitar (regresa la cantidad a 0).
  *Sin imÃ¡genes de platillo:* el catÃ¡logo no tiene campo de imagen
  **[Fuera de alcance]**; se usa el nombre en negrita e icono de categorÃ­a.
- **Total** grande (`stat-lg`, verde primario).
- **Nota informativa:** "El pedido se registra y cobra en un solo paso."
- **CTA Ãºnico: Registrar y cobrar.** Captura y cobro siguen siendo un solo
  paso (FR-015, SC-S4-01): la revisiÃ³n no separa ambas acciones.

**Resultado â€” Ã©xito:**

- Tarjeta con folio (`font-mono`, 20 px+), estado `Pagado` en badge verde,
  mensaje "Cobro confirmado: folio #X" y CTA **Nuevo pedido** que limpia el
  carrito y regresa al catÃ¡logo.

**Resultado â€” cobro fallido:**

- El pedido queda `Pendiente`; tarjeta de error con el folio y dos CTA:
  **Reintentar cobro** (primario) y **Cancelar pedido** (outline). Este
  comportamiento ya existe hoy y se conserva tal cual.

### 4.5 Pantalla 4: Entregas (pedidos listos)

- **Encabezado:** "Pedidos listos" + contador de pendientes (badge).
- **Lista por orden de llegada**, cada fila con:
  - folio grande (`font-mono` 20 px+), hora de registro, nombre del cliente
    (o "Sin nombre");
  - partidas `NÃ— Nombre` y badge **Listo** (pill azul `status-ready`);
  - CTA **Entregar** (primario, 44 px) y **Cancelar** (outline, 44 px).
- **Estado vacÃ­o:** ilustraciÃ³n + *"Â¡Todo estÃ¡ al dÃ­a! No hay pedidos
  listos por entregar."*
- **ConfirmaciÃ³n:** al entregar, mensaje efÃ­mero "Pedido entregado." y la
  fila desaparece; el contador del badge y de la bottom bar se actualiza.

### 4.6 MenÃº lateral de caja (drawer)

Perfil (avatar + "Cajero Â· Nombre"), opciones: **Inicio**, **Capturar
pedido**, **Pedidos listos** (con contador activo), **Cerrar sesiÃ³n**.
*Historial de ventas* y *ConfiguraciÃ³n* del boceto quedan **[Fuera de
alcance]**: no existen en el MVP.

---

## 5. Deviaciones respecto al boceto original

El boceto `diseÃ±o conceptual.md` se adaptÃ³ asÃ­ (ver index en ese archivo):

1. **Paleta:** se usa la de `DESIGN.md` (`#1E7A46`, fondo `#F6F1E9`), no
   `#1E4632` / `#F7F9F7`.
2. **Cobrar pedido (detalle con mÃ©todos de pago):** eliminado. La caja solo
   cobra en **efectivo** (alcance actual); efectivo/tarjeta/transferencia y
   **descuentos** son **[Fuera de alcance]**.
3. **Historial de ventas y ConfiguraciÃ³n:** **[Fuera de alcance]**, no se
   diseÃ±an pantallas ni bottom bar para ellos.
4. **ImÃ¡genes de producto:** el catÃ¡logo no tiene campo de imagen
   **[Fuera de alcance]**; se sustituyen por tipografÃ­a + icono de categorÃ­a.
5. **Bottom bar de 3 pestaÃ±as â†’ 2** (`Caja`, `Entregas`).
6. **Cobro rÃ¡pido:** el boceto separaba resumen y cobro en dos pantallas; aquÃ­
   `Ver cobro` â†’ resumen â†’ `Registrar y cobrar` mantiene el cobro en un solo
   paso efectivo.

---

## 6. Checklist de cumplimiento

- [ ] Todo control interactivo â‰¥ 44 px en caja (FR-020).
- [ ] Captura + cobro en un solo botÃ³n (SC-S4-01) â€” sin pasos extra.
- [ ] Cifras (total, folios, cantidades) en `font-heading` peso 700/800.
- [ ] Badges de estado pill con texto blanco (colores de `DESIGN.md`).
- [ ] Estados vacÃ­os/carga/error consistentes en cada pantalla, con
      `Reintentar` donde haya llamada a la API.
- [ ] Ninguna pantalla propuesta fuera de alcance estÃ¡ marcada como
      implementable sin aprobaciÃ³n (Â§27).
