---

description: "Task list for Sprint 4 — Ventanilla y cocina"
---

# Tasks: Sprint 4 — Ventanilla y cocina

**Input**: Design documents from `specs/005-counter-kitchen/`

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

- [ ] T001 Confirmar que sprints 1–3 compilan y pasan pruebas
- [ ] T002 [P] Registrar routers `/api/caja` y `/api/cocina` en `backend/src/routes/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: completar antes de las historias.

- [ ] T003 Verificar catálogo `estado_pedido` completo y `pago.pedido_id` UNIQUE
- [ ] T004 Implementar mapa de transiciones permitidas en `backend/src/services/estadoService.ts`
- [ ] T005 [P] Implementar helper `transicionar(pedidoId, desde, hacia)` atómico (UPDATE ... AND estado_id + historial)
- [ ] T006 [P] Definir esquemas `zod` de mostrador y cobro en `backend/src/services/validators/`

**Checkpoint**: máquina de estados lista.

---

## Phase 3: User Story 1 - Pedido de mostrador con cobro en caja (Priority: P1) 🎯 MVP

**Goal**: cajera registra y cobra pedidos de mostrador.

**Independent Test**: crear pedido de mostrador, cobrarlo, verificar `Pagado`; doble cobro → 409.

### Tests

- [ ] T007 [P] [US1] Integration test `POST /api/caja/pedidos` y `/cobrar` en `backend/tests/integration/caja.test.ts`
- [ ] T008 [P] [US1] Integration test de doble cobro (`409`) y cobro sin rol (`403`)

### Implementation

- [ ] T009 [US1] Implementar `pedidoService.crearMostrador` (sin ventana mínima; total backend)
- [ ] T010 [US1] Implementar `pedidoService.cobrarEnCaja` (transacción: pago + estado `Pagado` + historial)
- [ ] T011 [US1] Implementar `cajaController` + `caja.routes.ts` con `requireRole('cajera','administrador')`
- [ ] T012 [P] [US1] Crear `CajaPage` (menú + armar pedido) en `frontend/src/pages/caja/CajaPage.tsx`
- [ ] T013 [US1] Crear `CobroPage` (efectivo/tarjeta + confirmar) en `frontend/src/pages/caja/CobroPage.tsx`

**Checkpoint**: mostrador y cobro funcionales.

---

## Phase 4: User Story 2 - Ver y preparar pedidos en cocina (Priority: P1)

**Goal**: cocinera mueve pedidos `Pagado → En preparación → Listo`.

**Independent Test**: iniciar y terminar un pedido; transición inválida → 409.

### Tests

- [ ] T014 [P] [US2] Unit test del mapa de transiciones en `backend/tests/unit/estadoTransiciones.test.ts`
- [ ] T015 [P] [US2] Integration test `GET /api/cocina/pedidos`, `/iniciar`, `/listo` en `backend/tests/integration/cocina.test.ts`

### Implementation

- [ ] T016 [US2] Implementar `cocinaService.listar` (Pagado + En preparación, orden por hora de recolección)
- [ ] T017 [US2] Implementar `cocinaService.iniciar` y `cocinaService.marcarListo` usando `transicionar`
- [ ] T018 [US2] Implementar `cocinaController` + `cocina.routes.ts` con `requireRole('cocinera','administrador')`
- [ ] T019 [US2] Crear `CocinaPage` (tablero + acciones iniciar/listo) en `frontend/src/pages/cocina/CocinaPage.tsx`

**Checkpoint**: caja y cocina funcionan de forma independiente.

---

## Phase 5: User Story 3 - Refrescar y priorizar la cocina (Priority: P2)

**Goal**: lista de cocina viva y ordenada por prioridad.

**Independent Test**: crear pedido y ver que aparece; orden por hora de recolección.

### Tests

- [ ] T020 [P] [US3] Integration test del orden por `fecha_recoleccion` en `backend/tests/integration/cocinaOrden.test.ts`

### Implementation

- [ ] T021 [US3] Añadir refetch periódico (5–10 s) en `CocinaPage`
- [ ] T022 [P] [US3] Resaltar pedidos próximos a su hora de recolección en `CocinaPage`
- [ ] T023 [US3] Optimizar consulta de cocina (índices por estado y fecha) en `cocinaService`

**Checkpoint**: las tres historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T024 [P] Documentar endpoints de caja y cocina en `backend/README.md`
- [ ] T025 Sanear entradas y validar cantidades y métodos de pago
- [ ] T026 Verificar que las transiciones concurrentes no duplican historial
- [ ] T027 Ejecutar `npm test` y `npm run typecheck` en backend y frontend

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 → US3 → Polish.
- US2 depende de US1 solo para tener pedidos `Pagado` de prueba; en producción también los
  provee el pago en línea del Sprint 3.

## Implementation Strategy

### MVP First

1. Setup + Foundational (máquina de estados).
2. US1 (mostrador + cobro) → operación de ventanilla.
3. US2 (cocina) → flujo de preparación.
4. US3 (refresco/orden) → operación fluida.

## Notes

- Las transiciones usan `UPDATE ... AND estado_id` para evitar carreras.
- El cobro en caja no usa `PaymentGateway`.
