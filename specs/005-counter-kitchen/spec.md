# Feature Specification: Sprint 4 — Ventanilla y cocina

**Feature Branch**: `005-counter-kitchen`

**Created**: 2026-10-13

**Status**: Draft

**Input**: Sprint 4 de `docs/sprints.md` (el cajero registra pedidos de mostrador con cobro
en caja; cocina ve los pedidos y los prepara). Traza a las User Stories US5 y US4 y a
FR-026..FR-032 de la spec maestra `specs/001-sistema-pedidos-anticipados/spec.md`.

**Spec maestra**: `specs/001-sistema-pedidos-anticipados/spec.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar pedido de mostrador con cobro en caja (Priority: P1)

El cajero crea un pedido en el mostrador para un cliente presente, cobra en efectivo o
tarjeta y lo deja listo para cocina.

**Why this priority**: Atiende a los clientes que no pidieron con anticipación; completa la
operación diaria de la cafetería. Traza a US5 y FR-026..FR-029.

**Independent Test**: Con sesión de cajero, crear un pedido de mostrador, cobrarlo y
verificar que pasa a `Pagado` y es visible en cocina.

**Acceptance Scenarios**:

1. **Given** un cajero autenticada y un menú publicado, **When** registra un pedido de
   mostrador, **Then** se crea con tipo `mostrador` y estado `Pendiente`.
2. **Given** un pedido de mostrador `Pendiente`, **When** el cajero registra el cobro en
   efectivo o tarjeta, **Then** el pedido pasa a `Pagado` y se registra el pago.
3. **Given** un pedido de mostrador, **When** se cobra, **Then** no aplica la ventana mínima
   de 10 minutos del pedido anticipado.
4. **Given** un pedido de mostrador "Pagado", **When** cocina consulta, **Then** aparece en
   la lista de pendientes de preparación.
5. **Given** un usuario sin rol cajero/administrador, **When** intenta cobrar, **Then** el
   acceso es denegado.

---

### User Story 2 - Ver y preparar pedidos en cocina (Priority: P1)

El cocinero ve la lista de pedidos por preparar en orden y los marca `En preparación`, luego
`Listo`.

**Why this priority**: Es el eslabón que convierte el pedido en producto entregable. Traza a
US4 y FR-030..FR-032.

**Independent Test**: Con sesión de cocinero, avanzar un pedido `Pagado` → `En preparación` →
`Listo` y verificar el historial.

**Acceptance Scenarios**:

1. **Given** pedidos `Pagado`, **When** el cocinero abre `/cocina`, **Then** ve los pedidos
   ordenados por hora de recolección.
2. **Given** un pedido `Pagado`, **When** el cocinero lo inicia, **Then** cambia a
   `En preparación` y se registra en el historial.
3. **Given** un pedido `En preparación`, **When** el cocinero lo termina, **Then** cambia a
   `Listo` y se registra en el historial.
4. **Given** un pedido ya `Listo`, **When** el cocinero intenta volver a `En preparación`,
   **Then** el sistema lo impide.
5. **Given** una sesión sin rol cocinero/administrador, **When** intenta cambiar estados,
   **Then** el acceso es denegado.

---

### User Story 3 - Refrescar y priorizar la cocina (Priority: P2)

La lista de cocina se actualiza para reflejar nuevos pedidos y ordena por prioridad de
recolección.

**Why this priority**: Evita pedidos olvidados y respeta las horas de recolección. Traza a
FR-032 y al objetivo de tiempos de espera.

**Independent Test**: Crear un pedido nuevo y verificar que aparece; pedidos próximos a su
hora aparecen primero.

**Acceptance Scenarios**:

1. **Given** la pantalla de cocina abierta, **When** entra un pedido `Pagado`, **Then**
   aparece en la lista (actualización periódica).
2. **Given** varios pedidos, **When** se listan, **Then** el orden prioriza la hora de
   recolección más próxima.

---

### Edge Cases

- **Pedido no `Pagado`**: no aparece en cocina ni puede iniciarse.
- **Cobro duplicado** de un pedido de mostrador: rechazado por `UNIQUE(pedido_id)`.
- **Pedido anticipado `Pagado`** y **pedido de mostrador `Pagado`**: ambos alimentan cocina.
- **Menú del día agotado**: el cajero no puede agregar platillos no disponibles.
- **Avanzar estado fuera de secuencia**: rechazado con `409`.
- **Cancelar pedido** en caja antes de preparar: permitido solo en `Pendiente`.
- **Concurrencia**: dos cocineros no deben iniciar el mismo pedido dos veces (control por
  estado actual + condición en el UPDATE).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El cajero MUST poder registrar pedidos de mostrador para clientes presentes.
  (FR-026.)
- **FR-002**: El cajero MUST poder registrar el cobro en efectivo o tarjeta en caja.
  (FR-027.)
- **FR-003**: El sistema MUST marcar el pedido de mostrador como `Pagado` al registrar el
  cobro. (FR-028.)
- **FR-004**: El pedido de mostrador MUST integrarse al flujo de preparación sin la ventana
  mínima de 10 minutos. (FR-029.)
- **FR-005**: La cocina MUST ver los pedidos `Pagado`/`En preparación` listos para preparar.
  (FR-030.)
- **FR-006**: El cocinero MUST poder marcar un pedido como `En preparación` y luego `Listo`.
  (FR-031.)
- **FR-007**: El sistema MUST mostrar los pedidos de cocina ordenados por hora de
  recolección. (FR-032.)
- **FR-008**: El sistema MUST registrar cada cambio de estado en
  `pedido_estado_historial`. (FR-022.)
- **FR-009**: El sistema MUST impedir transiciones de estado fuera de secuencia.
- **FR-010**: El sistema MUST registrar a lo sumo un pago por pedido (`UNIQUE(pedido_id)`).
- **FR-011**: El sistema MUST calcular el total en backend también para pedidos de mostrador.
- **FR-012**: El sistema MUST restringir el cobro a cajero/administrador y la preparación a
  cocinero/administrador. (FR-003.)

### Key Entities *(include if feature involves data)*

- **Pedido** (extendida): `tipo` ahora admite `mostrador`; estados `Pagado`,
  `En preparación`, `Listo`.
- **Pago**: se reutiliza para el cobro en caja (`metodo` = `efectivo` | `tarjeta`).
- **Estado de pedido**: `Pendiente`, `Pagado`, `En preparación`, `Listo`, `Entregado`,
  `Cancelado`.
- **Historial de estado**: registra cada transición.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El cajero registra un pedido de mostrador y lo cobra en menos de 1 minuto.
- **SC-002**: Un pedido `Pagado` aparece en cocina en menos de 5 segundos.
- **SC-003**: Los pedidos de cocina se ordenan por hora de recolección (100 % de los casos).
- **SC-004**: 0 transiciones de estado fuera de secuencia.
- **SC-005**: El objetivo de reducir el tiempo de espera se mantiene (traza a SC-001/SC-002 de 001).
- **SC-006**: `npm test` y `npm run typecheck` en verde.

## Assumptions

- Los pedidos de mostrador los registra el cajero; en este sprint el cliente es presencial
  (no requiere su propia cuenta).
- El cobro en caja es inmediato y marca el pedido `Pagado` directamente (no hay pasarela
  externa).
- La actualización de la lista de cocina se hace por sondeo periódico en este sprint; el
  tiempo real por push llega en el Sprint 5.
- La entrega (`Entregado`) se completa en el Sprint 5 al confirmar la entrega física.
- La base de datos es MySQL 8.0+ (ver `migrations/`).
- El alcance se limita al MVP de `docs/reglas.md` (§27).
