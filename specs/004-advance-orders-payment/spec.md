# Feature Specification: Sprint 3 — Pedido anticipado y pago

**Feature Branch**: `004-advance-orders-payment`

**Created**: 2026-10-13

**Status**: Draft

**Input**: Sprint 3 de `docs/sprints.md` (el alumno/docente completa el pedido anticipado
con pago; nacen los estados de pedido). Traza a la User Story US2 y a FR-015..FR-021,
FR-022..FR-025 de la spec maestra `specs/001-sistema-pedidos-anticipados/spec.md`.

**Spec maestra**: `specs/001-sistema-pedidos-anticipados/spec.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear un pedido anticipado (Priority: P1)

Un alumno o docente arma un pedido con platillos y cantidades del menú del día, ve el total
y confirma la hora de recogida; el pedido queda en estado "Pendiente".

**Why this priority**: Es la propuesta de valor central; ataca directamente la reducción
del tiempo de espera. Traza a US2 y FR-015..FR-018.

**Independent Test**: Con menú publicado, crear un pedido con al menos 10 minutos de
anticipación y verificar que se registra con su detalle y total.

**Acceptance Scenarios**:

1. **Given** un menú del día con platillos disponibles, **When** el cliente selecciona
   platillos y cantidades, **Then** el sistema calcula y muestra el total antes de confirmar.
2. **Given** un pedido con al menos 10 minutos de anticipación, **When** el cliente
   confirma, **Then** el pedido se crea en estado "Pendiente" con su detalle y folio.
3. **Given** un intento con menos de 10 minutos de anticipación, **When** el cliente
   confirma, **Then** el sistema rechaza el pedido y explica el motivo.
4. **Given** un platillo no disponible, **When** el cliente intenta agregarlo, **Then** el
   sistema no lo permite.
5. **Given** un menú vacío o sin platillos disponibles, **When** el cliente intenta pedir,
   **Then** el sistema lo impide con un mensaje informativo.

---

### User Story 2 - Pagar el pedido anticipado (Priority: P1)

El cliente paga en línea el pedido; al confirmarse el pago, el pedido pasa a "Pagado" y
queda listo para cocina.

**Why this priority**: El pago es parte del flujo de realización del pedido y habilita la
operación de cocina. Traza a FR-019..FR-021.

**Independent Test**: Confirmar el pago de un pedido y verificar que pasa a "Pagado";
si el pago falla, el pedido no queda "Pagado".

**Acceptance Scenarios**:

1. **Given** un pedido "Pendiente", **When** el pago se confirma, **Then** el pedido pasa a
   "Pagado" y se registra la transacción.
2. **Given** un pago rechazado o cancelado, **When** finaliza el intento, **Then** el pedido
   no queda "Pagado" y se informa al cliente.
3. **Given** un pedido anticipado, **When** el pago se confirma, **Then** el pedido "Pagado"
   es visible para cocina (Sprint 4 lo consume).
4. **Given** cualquier pago, **Then** el sistema nunca almacena datos sensibles de tarjeta.

---

### User Story 3 - Conservar precios del pedido (Priority: P2)

El detalle del pedido conserva el precio unitario con el que se creó, aunque el menú cambie
después.

**Why this priority**: Garantiza integridad y confianza en el cobro. Traza a la suposición
de precios congelados de la spec maestra.

**Independent Test**: Crear un pedido, cambiar el precio del menú y verificar que el pedido
mantiene su precio original.

**Acceptance Scenarios**:

1. **Given** un pedido creado con precio X, **When** el administrador cambia el precio a Y,
   **Then** el pedido y su total siguen mostrando X.

---

### Edge Cases

- **Ventana mínima**: menos de 10 minutos → rechazo con mensaje claro (FR-017).
- **Platillo no disponible**: se rechaza la creación del pedido completo (FR-018).
- **Cantidades inválidas**: cantidad ≤ 0 o no entera → rechazo.
- **Total inconsistente**: el total se calcula en backend, no se confía en el del cliente.
- **Pago duplicado**: un pedido ya "Pagado" no se puede volver a pagar.
- **Fallo del proveedor de pago**: el pedido permanece "Pendiente"; se informa al cliente.
- **Concurrencia**: dos intentos de pago simultáneos no deben generar dos pagos (uno por pedido).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: **Cuando** un cliente arme un pedido anticipado, el sistema deberá permitirle
  seleccionar uno o más platillos y la cantidad de cada uno. (FR-015.)
- **FR-002**: **Cuando** el cliente agregue, quite o modifique platillos o cantidades, el
  sistema deberá calcular y mostrar el total antes de que el cliente confirme. (FR-016.)
- **FR-003**: (FR-017.)
  - (a) **Cuando** un cliente confirme un pedido anticipado, el sistema deberá verificar que
    la hora de recogida sea al menos 10 minutos posterior a la hora actual.
  - (b) **Si** la hora de recogida es menos de 10 minutos posterior a la hora actual,
    **entonces** el sistema deberá rechazar el pedido y mostrar un mensaje que explique el
    margen mínimo.
- **FR-004**: **Si** un pedido incluye un platillo no disponible, **entonces** el sistema
  deberá rechazar la creación del pedido completo. (FR-018.)
- **FR-005**: **Cuando** el cliente confirme un pedido anticipado, el sistema deberá
  solicitar el pago mediante el servicio de pago en línea como parte del mismo flujo.
  (FR-019.)
- **FR-006**: El sistema no deberá almacenar datos sensibles de tarjeta; deberá registrar
  únicamente la información necesaria para identificar y validar la transacción. (FR-020.)
- **FR-007**: **Cuando** el proveedor de pago confirme el cobro de un pedido en estado
  `Pendiente`, el sistema deberá cambiar el estado del pedido a `Pagado` y registrar el
  cambio en el historial de estados. (FR-021.)
- **FR-008**: El sistema deberá mantener cada pedido en un estado válido en todo momento; en
  este sprint los estados válidos son `Pendiente` y `Pagado`. (FR-022.)
- **FR-009**: **Cuando** se cree un pedido, el sistema deberá guardar en su detalle el precio
  unitario vigente del menú; **cuando** el menú cambie después, el sistema no deberá alterar
  el precio unitario de los pedidos ya creados. (FR-013/precios congelados.)
- **FR-010**: **Cuando** se cree un pedido, el sistema deberá asignarle un folio único
  (`numero`).
- **FR-011**: **Mientras** un pedido tenga un pago registrado, el sistema deberá rechazar
  cualquier intento de registrar otro pago para ese pedido.
- **FR-012**: **Cuando** el sistema reciba los datos de un pedido, deberá validarlos antes de
  almacenarlos. (FR-036.)
- **FR-013**: El sistema no deberá exponer al cliente información del proveedor de pago más
  allá del resultado de la transacción.

### Key Entities *(include if feature involves data)*

- **Pedido**: `id`, `numero` (único), `tipo` (`anticipado`), `estado_id`, `usuario_id`,
  `fecha_recoleccion`, `total`, `creado_en`, `actualizado_en`. Tabla `pedido`.
- **Detalle de pedido**: `id`, `pedido_id`, `menu_dia_id`, `cantidad`, `precio_unitario`,
  `subtotal`. Tabla `pedido_detalle`.
- **Pago**: `id`, `pedido_id` (único), `metodo` (`online`), `monto`, `referencia`,
  `fecha`. Tabla `pago`.
- **Estado de pedido**: catálogo con `Pendiente` y `Pagado` (también `En preparación`,
  `Listo`, `Entregado`, `Cancelado` ya en el seed). Tabla `estado_pedido`.
- **Historial de estado**: `pedido_estado_historial` registra el cambio Pendiente→Pagado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los pedidos anticipados se puede completar con al menos 10 minutos
  de anticipación. (Traza a SC-001 de 001.)
- **SC-002**: Un pedido sin pago confirmado no pasa a "Pagado" (100 % de los casos).
- **SC-003**: El total calculado en backend coincide con la suma de los subtotales.
- **SC-004**: Un cliente consulta menú, arma pedido y paga en menos de 3 minutos. (SC-003.)
- **SC-005**: El 0 % de datos de tarjeta se almacena.
- **SC-006**: `npm test` y `npm run typecheck` en verde.

## Assumptions

- El pago se integra mediante una abstracción (`PaymentGateway`) que en desarrollo usa un
  proveedor simulado; en producción se conecta a un servicio externo con `PAYMENT_API_KEY`.
- La hora de recogida (`fecha_recoleccion`) la elige el cliente; la regla de 10 minutos se
  mide contra esa hora.
- Los pedidos de mostrador (sin ventana de 10 minutos y con cobro en caja) se implementan en
  el Sprint 4; aquí solo el pedido anticipado.
- Los pedidos anticipados se pagan en línea; el método de pago es `online`.
- La base de datos es MySQL 8.0+ (ver `migrations/`).
- El alcance se limita al MVP de `docs/reglas.md` (§27).