---

description: "Task list for Sprint 3 — Pedido anticipado y pago"
---

# Tasks: Sprint 3 — Pedido anticipado y pago

**Input**: Design documents from `specs/004-advance-orders-payment/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Tests**: Incluidos (Vitest).

**Organization**: por user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede correr en paralelo
- **[Story]**: US1, US2, US3

## Path Conventions

- Backend: `backend/src/`, `backend/tests/`
- Frontend: `frontend/src/`

---

## Phase 1: Setup

- [ ] T001 Confirmar que sprints 1 y 2 compilan y pasan pruebas
- [ ] T002 [P] Añadir variables `PAYMENT_PROVIDER`, `PAYMENT_API_KEY`, `MIN_LEAD_MINUTES` a `backend/.env.example` y `env.ts`
- [ ] T003 [P] Registrar `/api/pedidos` en el router en `backend/src/routes/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: completar antes de las historias.

- [ ] T004 Verificar tablas `pedido`, `pedido_detalle`, `pago`, `pedido_estado_historial` y catálogo `estado_pedido`
- [ ] T005 [P] Definir esquemas `zod` de creación de pedido y pago en `backend/src/services/validators/`
- [ ] T006 Implementar helper de transacción (`withTransaction`) en `backend/src/db/`
- [ ] T007 [P] Implementar cache/consulta de `estado_pedido` por nombre (Pendiente/Pagado) en `backend/src/services/estadoService.ts`

**Checkpoint**: infraestructura de pedidos lista.

---

## Phase 3: User Story 1 - Crear un pedido anticipado (Priority: P1) 🎯 MVP

**Goal**: crear pedido con validaciones, total, folio, estado `Pendiente` y detalle.

**Independent Test**: pedido con ≥ 10 min se crea; con < 10 min se rechaza; platillo no disponible se rechaza.

### Tests

- [ ] T008 [P] [US1] Unit test del cálculo de total y subtotales en `backend/tests/unit/pedidoTotal.test.ts`
- [ ] T009 [P] [US1] Unit test de la regla de 10 minutos en `backend/tests/unit/leadTime.test.ts`
- [ ] T010 [P] [US1] Integration test `POST /api/pedidos` (éxito, < 10 min, no disponible, cantidad inválida) en `backend/tests/integration/pedidos.test.ts`

### Implementation

- [ ] T011 [US1] Implementar generación de folio único `A-YYYYMMDD-NNN` en `pedidoService`
- [ ] T012 [US1] Implementar `pedidoService.crear` (transacción: pedido + detalle + historial; precio congelado; total backend)
- [ ] T013 [US1] Implementar validaciones de disponibilidad y ventana mínima en `backend/src/services/pedidoService.ts`
- [ ] T014 [US1] Implementar `pedidoController.crear` + ruta `POST /api/pedidos` con `requireAuth`
- [ ] T015 [P] [US1] Implementar estado del carrito en `frontend/src/lib/carrito.ts`
- [ ] T016 [US1] Añadir control de cantidad a `PlatilloCard` y `MenuPage` (bloquea no disponibles)
- [ ] T017 [US1] Crear `CarritoPage` (resumen, total, hora de recolección, confirmar) en `frontend/src/pages/clientes/CarritoPage.tsx`

**Checkpoint**: creación de pedidos funcional y testeable.

---

## Phase 4: User Story 2 - Pagar el pedido anticipado (Priority: P1)

**Goal**: pago en línea que pasa el pedido a `Pagado`.

**Independent Test**: pago confirmado → `Pagado`; pago rechazado → sigue `Pendiente`; no se guardan datos de tarjeta.

### Tests

- [ ] T018 [P] [US2] Unit test de `MockPaymentGateway` en `backend/tests/unit/paymentGateway.test.ts`
- [ ] T019 [P] [US2] Integration test `POST /api/pedidos/:id/pagar` (éxito, rechazo, doble pago) en `backend/tests/integration/pago.test.ts`

### Implementation

- [ ] T020 [US2] Definir interfaz `PaymentGateway` y `MockPaymentGateway` en `backend/src/services/payment/`
- [ ] T021 [US2] Seleccionar proveedor por `PAYMENT_PROVIDER` en `backend/src/services/payment/index.ts`
- [ ] T022 [US2] Implementar `pedidoService.pagar` (verifica `Pendiente`, cobra, inserta `pago`, cambia a `Pagado`, registra historial, transaccional)
- [ ] T023 [US2] Implementar `pedidoController.pagar` + ruta `POST /api/pedidos/:id/pagar`
- [ ] T024 [US2] Garantizar unicidad de pago (`UNIQUE(pedido_id)`) y manejo de `409`
- [ ] T025 [US2] Crear `PagoPage` (formulario tokenizado + resultado) en `frontend/src/pages/clientes/PagoPage.tsx`

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Conservar precios del pedido (Priority: P2)

**Goal**: el detalle conserva el precio unitario original.

**Independent Test**: crear pedido, cambiar precio de menú, verificar que el pedido conserva su precio.

### Tests

- [ ] T026 [P] [US3] Integration test: cambio de precio de menú no altera pedido existente en `backend/tests/integration/precioCongelado.test.ts`

### Implementation

- [ ] T027 [US3] Asegurar que `pagar`/consultas usan `pedido_detalle.precio_unitario` y nunca el menú actual
- [ ] T028 [US3] Añadir `GET /api/pedidos` y `GET /api/pedidos/:id` (propiedad del recurso) + `POST /api/pedidos/:id/cancelar`
- [ ] T029 [US3] Actualizar `MisPedidosHome` para listar pedidos propios con su estado

**Checkpoint**: las tres historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T030 [P] Documentar endpoints de pedidos y pago en `backend/README.md`
- [ ] T031 Sanear entradas y asegurar que el cliente no puede fijar `total`/`precio_unitario`
- [ ] T032 Manejar errores del proveedor de pago sin exponer detalles internos
- [ ] T033 Ejecutar `npm test` y `npm run typecheck` en backend y frontend

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 → US3 → Polish.
- US2 depende de US1 (necesita un pedido `Pendiente`).
- US3 refina US1/US2.

## Implementation Strategy

### MVP First

1. Setup + Foundational.
2. US1 (crear pedido) → demo de pedido anticipado.
3. US2 (pago) → flujo completo end-to-end.
4. US3 (precio congelado) → integridad.

## Notes

- El pago simulado debe poder forzar éxito/rechazo en pruebas.
- La ventana mínima se mide contra `fecha_recoleccion`.
- El pedido de mostrador y el cobro en caja llegan en el Sprint 4.
