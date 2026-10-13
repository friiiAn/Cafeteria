# Feature Specification: Sprint 5 — Seguimiento y notificaciones

**Feature Branch**: `006-order-tracking-notifications`

**Created**: 2026-10-13

**Status**: Draft

**Input**: Sprint 5 de `docs/sprints.md` (el cliente sigue el estado de su pedido y recibe
una notificación cuando está listo). Traza a la User Story US3 y a FR-033..FR-038 de la
spec maestra `specs/001-sistema-pedidos-anticipados/spec.md`.

**Spec maestra**: `specs/001-sistema-pedidos-anticipados/spec.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seguir el estado de mi pedido (Priority: P1)

El cliente abre "Mis pedidos", ve su pedido con su folio y el estado actualizado
(`Pagado`, `En preparación`, `Listo`, `Entregado`).

**Why this priority**: Elimina la incertidumbre de la espera y es el cierre del ciclo de
valor. Traza a US3 y FR-033..FR-035.

**Independent Test**: Con un pedido en cocina, abrir `/mis-pedidos` y ver el estado; avanzar
el pedido en cocina y ver el cambio reflejado al refrescar.

**Acceptance Scenarios**:

1. **Given** un cliente con pedidos, **When** abre `/mis-pedidos`, **Then** ve cada pedido con
   su folio, hora de recolección y estado actual.
2. **Given** un pedido `Pagado`, **When** cocina lo inicia, **Then** el cliente ve
   `En preparación` al refrescar.
3. **Given** un pedido `En preparación`, **When** cocina lo termina, **Then** el cliente ve
   `Listo`.
4. **Given** un pedido que no le pertenece, **When** intenta consultarlo, **Then** el acceso
   es denegado.
5. **Given** la lista de pedidos, **When** se muestra, **Then** aparece ordenada por fecha de
   creación descendente.

---

### User Story 2 - Recibir notificación cuando el pedido está listo (Priority: P1)

El cliente recibe una notificación (en la app y por correo) cuando su pedido pasa a `Listo`.

**Why this priority**: Avisa al cliente para recoger sin hacer fila. Traza a FR-036..FR-038.

**Independent Test**: Avanzar un pedido a `Listo` y verificar que se registra una
notificación para el cliente y que el correo se intenta enviar.

**Acceptance Scenarios**:

1. **Given** un pedido `En preparación`, **When** pasa a `Listo`, **Then** el sistema crea una
   notificación para el cliente dueño del pedido.
2. **Given** una notificación creada, **When** el sistema procesa el envío, **Then** intenta
   enviar el correo y registra el resultado (`enviada`/`fallida`) con reintentos.
3. **Given** un fallo en el envío, **When** se reintenta, **Then** un fallo nunca pierde la
   notificación (queda pendiente o marcada como fallida).
4. **Given** un pedido `Listo`, **When** el cajero confirma la entrega, **Then** el pedido
   pasa a `Entregado`.
5. **Given** una notificación de un pedido ajeno, **When** el cliente consulta, **Then** no
   puede verla.

---

### User Story 3 - Confirmar la entrega y cerrar el ciclo (Priority: P2)

El cajero confirma la entrega del pedido `Listo`, cerrándolo como `Entregado`.

**Why this priority**: Completa la operación y las métricas. Traza al cierre del ciclo y
FR-034.

**Independent Test**: Con un pedido `Listo`, confirmar entrega → `Entregado` y registra
historial.

**Acceptance Scenarios**:

1. **Given** un pedido `Listo`, **When** el cajero confirma la entrega, **Then** el pedido
   pasa a `Entregado` y se registra en el historial.
2. **Given** un pedido que no está `Listo`, **When** se intenta entregar, **Then** el sistema
   lo rechaza con `409`.

---

### Edge Cases

- **Pedido cancelado**: no genera notificación de "listo".
- **Correo del cliente inválido**: no bloquea la notificación en la app; se registra el fallo.
- **Fallo del proveedor de correo**: reintentos con registro; nunca se pierde la notificación.
- **Pedido sin cuenta** (mostrador sin correo): solo notificación en app/sin correo.
- **Estado sin cambio**: no se envía notificación duplicada si vuelve a `Listo`.
- **Acceso a notificación ajena**: `403`.
- **Concurrencia**: confirmar entrega dos veces no duplica historial (control por estado).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El cliente MUST poder consultar el estado actual de sus pedidos. (FR-033.)
- **FR-002**: El sistema MUST mostrar el historial de estados del pedido (folios, horas y
  estados). (FR-034.)
- **FR-003**: El cliente MUST poder ver sus pedidos anteriores ordenados por fecha de creación
  descendente. (FR-035.)
- **FR-004**: El sistema MUST notificar al cliente cuando el pedido pase a `Listo`. (FR-036.)
- **FR-005**: El sistema MUST enviar la notificación por correo. (FR-037.)
- **FR-006**: El sistema MUST reintentar el envío de la notificación si falla. (FR-038.)
- **FR-007**: El sistema MUST registrar el resultado del envío (`enviada`/`fallida`) y el
  número de intentos. (FR-038.)
- **FR-008**: El sistema MUST permitir al cajero confirmar la entrega de un pedido `Listo`,
  marcándolo `Entregado`. (FR-034.)
- **FR-009**: El sistema MUST restringir la consulta de pedidos y notificaciones al dueño del
  recurso. (FR-004.)
- **FR-010**: El sistema MUST NOT enviar notificaciones de pedidos cancelados. (FR-022.)
- **FR-011**: El sistema MUST garantizar que un fallo de correo no bloquee el cambio de estado
  del pedido.

### Key Entities *(include if feature involves data)*

- **Notificación**: `id`, `usuario_id` (nullable), `pedido_id`, `mensaje`, `tipo`
  (`pedido_listo`), `canal` (`correo`), `estado_envio` (`pendiente`/`enviada`/`fallida`),
  `intentos`, `leida`, `fecha` (expuesta como `creado_en`), `detalle_error`. Tabla
  `notificacion`.
- **Pedido** (extendida): estados `Listo` y `Entregado`; expuesto en seguimiento.
- **Historial de estado**: fuente del timeline del cliente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El cliente ve el estado actualizado de su pedido en menos de 2 segundos.
- **SC-002**: El 100 % de los pedidos que pasan a `Listo` generan una notificación.
- **SC-003**: Un fallo de correo se reintenta y queda registrado (0 notificaciones perdidas).
- **SC-004**: El cliente consulta el estado y la hora estimada en menos de 30 segundos desde
  `/mis-pedidos`. (Traza a SC-004 de 001.)
- **SC-005**: La confirmación de entrega pasa el pedido a `Entregado` (100 % de los casos
  válidos).
- **SC-006**: `npm test` y `npm run typecheck` en verde.

## Assumptions

- El seguimiento se actualiza por sondeo (refetch) o SSE; el tiempo real por push es opcional
  en este sprint.
- El correo se envía mediante una abstracción `Mailer` (`ConsoleMailer`/`FailMailer` en
  desarrollo; el proveedor real —SMTP u otro— es un punto de extensión documentado).
- La notificación en app se modela como fila en `notificacion` con `estado_envio`.
- El mostrador sin cuenta no tiene correo; su notificación queda en app o se omite el correo.
- La base de datos es MySQL 8.0+ (ver `migrations/`).
- El alcance se limita al MVP de `docs/reglas.md` (§27).
