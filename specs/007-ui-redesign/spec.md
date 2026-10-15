# Feature Specification: Sprint 7 — Rediseño UI/UX por rol

**Feature Branch**: `007-ui-redesign`

**Created**: 2026-10-14

**Status**: Draft

**Input**: Implementar en el proyecto los diseños de la carpeta `design/`
(`descripcion_diseño.md`, `diseño-conceptual.md`, `diseño-operativo.md`,
`diseño-cocina.md`, `diseño-cliente.md`). Los documentos son una propuesta de
rediseño de la interfaz para los tres entornos (operativo-admin/caja, cocina y
cliente) y remiten al sistema de diseño canónico `docs/DESIGN.md`.

**Spec maestra**: `specs/001-sistema-pedidos-anticipados/spec.md`

## Contexto y encuadre de alcance

Los documentos de `design/` proponen: **(a)** sustituir los tabs horizontales
actuales por **drawer lateral** y **bottom bar** según el rol; **(b)** rediseñar
las pantallas de administración, caja y cocina; **(c)** reorganizar el flujo del
cliente en `/pedido/confirmar`, `/pedido/:id/pago` y `/pedido/:id/confirmacion`.
Este sprint implementa esa propuesta **sin agregar funcionalidad de negocio
nueva**: reutiliza los endpoints existentes y solo añade a las respuestas los
campos que las vistas necesitan (`creado_en` y nombre del cliente en cocina;
`creado_en` y partidas en la lista de entregas de caja).

**Fuera de alcance (exclusión aprobada, §X/§27)**: imágenes de platillo, pago con
tarjeta/transferencia, descuentos, historial de ventas, configuración,
notificaciones push/SMS y métricas de negocio del administrador (no existen
endpoints de estadísticas). Estos elementos están marcados **[Fuera de alcance]**
en los documentos de diseño y NO MUST implementarse en este sprint.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegar por la aplicación con drawer y bottom bar (Priority: P1)

Un usuario de cualquier rol entra al sistema y se orienta con una navegación
propia de su rol: un drawer lateral (siempre) y una bottom bar (caja y cliente),
en lugar de los tabs horizontales actuales.

**Why this priority**: Es la base transversal del rediseño; el resto de las
pantallas se montan sobre este shell. Entrega valor por sí sola (orientación y
acceso rápido) sin depender de ninguna pantalla rediseñada.

**Independent Test**: Iniciar sesión con cada rol y verificar que el drawer y la
bottom bar correctos aparecen, que el enlace activo se resalta y que se puede
cerrar sesión desde el drawer.

**Acceptance Scenarios**:

1. **Given** un usuario con sesión, **When** abre la app, **Then** ve un header
   con la marca, su nombre/rol y una hamburguesa que abre el drawer.
2. **Given** el drawer abierto en móvil, **When** el usuario toca fuera o pulsa
   `Esc`, **Then** el drawer se cierra.
3. **Given** un cajero en móvil, **When** usa la bottom bar, **Then** alterna
   entre `Caja` y `Entregas` y ve el contador de entregas pendientes.
4. **Given** un cliente, **When** tiene un pedido `Listo`, **Then** la bottom bar
   / drawer muestra un badge en `Mis pedidos`.
5. **Given** un cliente en `/carrito` o `/pago/:id` (rutas antiguas), **When**
   navega, **Then** es redirigido a la ruta nueva equivalente.

---

### User Story 2 - Operar la cocina con un tablero KDS (Priority: P1)

El cocinero ve todos los pedidos activos en una sola pantalla, cada uno con folio
grande, número, estado, origen, cliente, hora de registro y de recolección, y
tiempo transcurrido; avanza el estado con un solo toque.

**Why this priority**: Es la pantalla con mayor brecha actual y la de mayor
impacto en el tiempo de receso. Traza a FR-017/FR-020 de la spec maestra.

**Independent Test**: Con pedidos `Pagado` y `En preparación`, abrir `/cocina`,
ver el tablero y avanzar un pedido con un toque.

**Acceptance Scenarios**:

1. **Given** pedidos `Pagado` y `En preparación`, **When** abro `/cocina`,
   **Then** veo una tarjeta por pedido con folio grande, número `font-mono`,
   badge de estado, chip de origen, cliente, hora de registro y "recoge HH:MM".
2. **Given** un pedido cuya hora de recolección ya pasó, **When** se muestra la
   tarjeta, **Then** el tiempo transcurrido aparece en rojo con "¡Retrasado!".
3. **Given** un pedido `Pagado`, **When** toco "Iniciar preparación", **Then**
   pasa a `En preparación` tras confirmar el servidor.
4. **Given** un pedido `En preparación`, **When** toco "Marcar listo", **Then**
   pasa a `Listo`.
5. **Given** un pedido `Listo`, **When** se muestra, **Then** no hay CTA de
   cocina y se indica "Listo — en espera de caja".
6. **Given** fallos de sondeo consecutivos, **When** se detectan 2 fallos,
   **Then** el header muestra "Sin conexión — reintentando…" sin bloquear.
7. **Given** otro operador avanzó el pedido primero, **When** intento avanzarlo,
   **Then** veo el aviso del servidor y la lista se recarga.

---

### User Story 3 - Operar la caja con captura, cobro y entregas (Priority: P1)

El cajero entra a un panel de inicio, captura un pedido con catálogo/búsqueda/
categorías/stepper, lo cobra en efectivo en un solo paso, y entrega los pedidos
listos.

**Why this priority**: Es el flujo con mayor volumen durante el receso; reduce el
tiempo de espera (§IX). Traza a FR-015/FR-020 y SC-S4-01.

**Independent Test**: Capturar un pedido mostrador, cobrarlo y entregarlo; medir
que captura y cobro toman un solo paso de confirmación.

**Acceptance Scenarios**:

1. **Given** un cajero, **When** entra a `/caja`, **Then** ve un panel de inicio
   con "Capturar pedido" y un módulo "Entregas" con contador.
2. **Given** el catálogo, **When** busco o filtro por categoría, **Then** la
   lista se filtra en vivo.
3. **Given** un carrito con artículos, **When** reviso el resumen, **Then** veo
   el desglose y un CTA único "Registrar y cobrar" (efectivo).
4. **Given** el cobro exitoso, **When** se completa, **Then** veo el folio en
   `font-mono` y un CTA "Nuevo pedido" que limpia el carrito.
5. **Given** un cobro fallido, **When** ocurre, **Then** el pedido queda
   `Pendiente` con CTA "Reintentar cobro" y "Cancelar pedido".
6. **Given** pedidos `Listo`, **When** abro Entregas, **Then** veo folio, hora de
   registro, cliente y partidas `N× Nombre`, con CTA Entregar y Cancelar.
7. **Given** sin pedidos listos, **When** abro Entregas, **Then** veo "¡Todo está
   al día!".

---

### User Story 4 - Administrar con un panel claro (Priority: P2)

El administrador entra a una landing con acciones rápidas y conteos, y gestiona
usuarios, platillos y el menú del día con una jerarquía clara.

**Why this priority**: Mejora la operación diaria, pero no bloquea el servicio si
se retrasa. No agrega funcionalidad: es el mismo CRUD reordenado.

**Independent Test**: Entrar a `/admin`, ver los conteos correctos y crear/editar
un platillo y una entrada de menú.

**Acceptance Scenarios**:

1. **Given** un admin, **When** entra a `/admin`, **Then** ve tarjetas de acceso a
   Usuarios, Platillos y Menú del día con conteos derivados de la API.
2. **Given** el menú de hoy, **When** se muestra el resumen, **Then** los
   especiales llevan badge y los no disponibles aparecen atenuados.
3. **Given** la pantalla de Usuarios, **When** creo uno, **Then** el formulario se
   abre en panel/sheet y la lista es de filas altas.
4. **Given** la pantalla de Platillos, **When** busco o filtro por categoría,
   **Then** la lista se filtra y muestra un estado vacío de filtro.
5. **Given** la pantalla de Menú del día, **When** cambio un precio, un toggle
   `Disponible` o un badge `Especial`, **Then** el cambio se refleja al guardar.

---

### User Story 5 - Pedir y seguir mis pedidos como cliente (Priority: P2)

El cliente explora el menú con búsqueda y categorías, confirma su pedido con la
regla de 10 minutos, paga en un adaptador simulado, ve una confirmación con folio
y sigue el estado en "Mis pedidos".

**Why this priority**: Cierra el ciclo de valor del cliente. Traza a FR-010/
FR-011/FR-012/FR-021.

**Independent Test**: Como cliente, armar un carrito, confirmar, pagar y ver la
confirmación y el estado en Mis pedidos.

**Acceptance Scenarios**:

1. **Given** el menú, **When** busco o filtro por categoría, **Then** la lista se
   filtra en vivo y los no disponibles se atenúan sin poder seleccionarse.
2. **Given** un carrito no vacío, **When** navego, **Then** veo la barra flotante
   "N productos · total" con CTA "Ver pedido".
3. **Given** el paso de confirmación, **When** elijo una hora a menos de 10 min,
   **Then** veo un mensaje inline con la hora mínima posible.
4. **Given** el paso de pago, **When** pago, **Then** la pantalla NO solicita
   datos de tarjeta y muestra "Este proceso no captura datos de tarjeta".
5. **Given** un pago exitoso, **When** llego a la confirmación, **Then** veo el
   folio grande, el estado `Pagado`, fecha/hora, total y cliente.
6. **Given** un pedido `Listo`, **When** abro Mis pedidos, **Then** veo el aviso
   destacado "¡Listo para recoger!" con borde `status-ready`.
7. **Given** sin pedidos activos, **When** abro Mis pedidos, **Then** veo un CTA
   flotante "Nuevo pedido".

---

### Edge Cases

- **Rutas antiguas**: `/carrito` y `/pago/:id` redirigen a las rutas nuevas.
- **Menú sin publicar hoy**: cocina, caja y cliente muestran estado vacío claro.
- **Platillo no disponible**: no seleccionable en nuevos pedidos (FR de la spec
  maestra); se muestra atenuado con badge "No disponible".
- **Hora de recolección vencida**: cocina muestra "¡Retrasado!" en color error.
- **Conflicto de estado en cocina**: el servidor rechaza el avance; se avisa y se
  recarga.
- **Fallo de red en sondeo**: indicador "Sin conexión — reintentando…" sin
  bloquear la vista.
- **Pago rechazado**: el pedido queda `Pendiente` y se ofrecen reintento y
  cancelación.
- **Pedido ya pagado**: la pantalla de pago ofrece continuar a confirmación o Mis
  pedidos.
- **Acceso por rol**: cada ruta sigue protegida por JWT y rol (§IV).
- **Sin imágenes**: el catálogo no tiene campo de imagen; no se muestran (fuera de
  alcance).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST ofrecer navegación por **drawer lateral** en todos
  los roles y **bottom bar** en caja y cliente, reemplazando los tabs
  horizontales. (diseño-operativo §2, diseño-cliente §2, diseño-cocina §2.)
- **FR-002**: El drawer MUST mostrar perfil (nombre + rol), enlaces del rol con el
  activo resaltado, y `Cerrar sesión`; en escritorio MUST mostrarse como panel
  lateral fijo. (Todos los documentos de diseño.)
- **FR-003**: El sistema MUST conservar las rutas `/admin`, `/admin/usuarios`,
  `/admin/platillos`, `/admin/menu`, `/caja`, `/cocina`, `/menu` y `/mis-pedidos`,
  y MUST redirigir las rutas antiguas `/carrito` y `/pago/:id` a sus equivalentes
  nuevas. (§II; diseño-cliente §2.)
- **FR-004**: La pantalla de cocina MUST mostrar, por pedido, folio grande,
  número, badge de estado, chip de origen, cliente, hora de registro y hora de
  recolección, tiempo transcurrido y CTA único de avance. (FR-017; diseño-cocina
  §3.2.)
- **FR-005**: La cocina MUST marcar "¡Retrasado!" cuando la hora de recolección ya
  pasó, y MUST NO mostrar CTA cuando el pedido está `Listo`. (diseño-cocina §3.2.)
- **FR-006**: La cocina MUST sonde buscar cada 4 s mostrando "act. hace X s" y
  cambiar a "Sin conexión — reintentando…" tras 2 fallos consecutivos.
  (FR-017/SC-S4-03; diseño-cocina §3.3.)
- **FR-007**: La caja MUST ofrecer un panel de inicio con acción "Capturar pedido"
  y módulo "Entregas" con contador. (diseño-operativo §4.2.)
- **FR-008**: El catálogo de caja MUST incluir búsqueda en vivo y chips de
  categoría derivados del catálogo real. (diseño-operativo §4.3.)
- **FR-009**: La caja MUST registrar y cobrar en **un solo paso** en efectivo,
  mostrando el folio al concluir; MUST NOT ofrecer tarjeta/transferencia.
  (FR-015/SC-S4-01; diseño-operativo §4.4/§5.2.)
- **FR-010**: La pantalla de Entregas MUST mostrar pedidos `Listo` con folio, hora
  de registro, cliente, partidas y CTA Entregar y Cancelar; estado vacío "¡Todo
  está al día!". (diseño-operativo §4.5.)
- **FR-011**: El admin MUST tener una landing con acciones rápidas y conteos de
  usuarios, platillos y menú de hoy, y un resumen del menú del día con badges de
  especial y no disponibles atenuados. (diseño-operativo §3.1.)
- **FR-012**: Las pantallas de admin de Usuarios, Platillos y Menú del día MUST
  usar filas altas (≥ 56 px), buscador y chips donde aplique, panel/sheet para
  formularios y estados de carga/vacío/error con `Reintentar`.
  (diseño-operativo §3.2–§3.4.)
- **FR-013**: El menú del cliente MUST incluir área de bienvenida, búsqueda en
  vivo y chips de categoría; los platillos no disponibles MUST mostrarse
  atenuados y no seleccionables. (FR-010 de la maestra; diseño-cliente §3.2.)
- **FR-014**: El flujo del cliente MUST usar las rutas `/pedido/confirmar`,
  `/pedido/:id/pago` y `/pedido/:id/confirmacion`, con botón regresar en el
  encabezado. (diseño-cliente §2/§3.1.)
- **FR-015**: La confirmación del cliente MUST validar la regla de **10 minutos de
  anticipación**, mostrando inline la hora mínima cuando no se cumple.
  (FR-011/FR-021; diseño-cliente §3.3.)
- **FR-016**: La pantalla de pago MUST usar el adaptador simulado, MUST NOT
  solicitar ni mostrar token/datos de tarjeta, y MUST indicarlo explícitamente;
  MUST manejar el caso "ya está pagado". (FR-012; diseño-cliente §3.4.)
- **FR-017**: La confirmación MUST mostrar el folio en `font-mono`, el estado en
  badge y el desglose (fecha/hora, total, cliente) consultado del servidor.
  (diseño-cliente §3.5.)
- **FR-018**: "Mis pedidos" MUST mostrar estados con colores `status-*`, el aviso
  destacado "¡Listo para recoger!" y un CTA flotante "Nuevo pedido" cuando no hay
  pedidos activos. (diseño-cliente §3.6.)
- **FR-019**: Los controles de cocina y caja MUST tener área táctil ≥ 44 px y
  alto contraste; los CTA primarios de 48 px. (FR-020/§19.)
- **FR-020**: El backend MUST exponer `creado_en` y el nombre del cliente en la
  lista de cocina, y `creado_en` y las partidas en la lista de entregas de caja.
  (diseño-cocina §3.2, diseño-operativo §4.5.)
- **FR-021**: Todas las pantallas MUST contemplar estados de carga, vacío y error
  con `Reintentar` donde haya llamada a la API.
- **FR-022**: La interfaz MUST ser responsiva (móvil y escritorio) y MUST NOT
  introducir dependencias nuevas: drawer, bottom bar, chips y sheets se construyen
  con React Router + Tailwind. (§II/§VII; diseño-operativo §1.)

### Key Entities *(include if feature involves data)*

- **Pedido (cocina)**: expone `id` (folio corto), `numero`, `tipo`
  (`anticipado`/`mostrador`), `estado`, `cliente_nombre`, `creado_en`,
  `fecha_recoleccion` e `items`.
- **Pedido (entrega)**: expone `id`, `numero`, `tipo`, `cliente_nombre`, `total`,
  `creado_en`, `fecha_recoleccion` e `items`.
- **MenuEntrada**: `id`, `nombre`, `categoria`, `descripcion`, `precio`,
  `disponible`, `especial` (sin imagen).
- **Carrito (cliente)**: persistido en el dispositivo entre pantallas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las rutas de rol usan drawer (y bottom bar en caja y
  cliente); ninguna pantalla usa los tabs horizontales antiguos.
- **SC-002**: La caja captura y cobra un pedido mostrador en un solo paso de
  confirmación, sin selector de método de pago.
- **SC-003**: El cocinero identifica folio, cliente y tiempo de un pedido a ≥ 1 m
  (cifras ≥ 20 px, peso 700/800).
- **SC-004**: El 100 % de las pantallas con llamada a API presentan estados de
  carga, vacío y error con `Reintentar`.
- **SC-005**: Todos los controles de cocina y caja miden ≥ 44 px.
- **SC-006**: Las rutas antiguas `/carrito` y `/pago/:id` redirigen
  correctamente a las nuevas.
- **SC-007**: `npm test` y `npm run typecheck` en verde en backend y frontend.

## Assumptions

- Los endpoints actuales cubren todos los datos salvo los campos añadidos por
  FR-020 (`creado_en`, `cliente_nombre`, partidas), que se resuelven sin migración
  de base de datos (`creado_en` ya existe desde el Sprint 5).
- El sondeo (refetch por intervalo) sigue siendo el mecanismo de actualización; no
  se introduce push/SSE.
- El sistema de diseño canónico es `docs/DESIGN.md`; los tokens viven en
  `frontend/src/index.css`.
- El alcance es el MVP de `docs/reglas.md` y la constitución (§X); las
  funcionalidades fuera de alcance quedan excluidas sin aprobación previa.
- El carrito del cliente se conserva en `localStorage` entre pantallas.
- La base de datos es MySQL 8.0+ (ver `migrations/`).
