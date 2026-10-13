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

- [x] T001 Confirmar que sprints 1–3 compilan y pasan pruebas
- [x] T002 [P] Registrar routers `/api/caja` y `/api/cocina` en `backend/src/routes/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: completar antes de las historias.

- [x] T003 Verificar catálogo `estado_pedido` completo y `pago.pedido_id` UNIQUE
- [x] T004 Implementar mapa de transiciones permitidas en `backend/src/services/estadoService.ts`
- [x] T005 [P] Implementar helper `transicionar(pedidoId, desde, hacia)` atómico (UPDATE ... AND estado_id + historial)
- [x] T006 [P] Definir esquemas `zod` de mostrador y cobro en `backend/src/schemas/` (patrón existente del proyecto)

**Checkpoint**: máquina de estados lista.

---

## Phase 3: User Story 1 - Pedido de mostrador con cobro en caja (Priority: P1) 🎯 MVP

**Goal**: cajero registra y cobra pedidos de mostrador.

**Independent Test**: crear pedido de mostrador, cobrarlo, verificar `Pagado`; doble cobro → 409.

### Tests

- [x] T007 [P] [US1] Integration test `POST /api/caja/pedidos` y `/cobrar` en `backend/tests/integration/caja.test.ts`
- [x] T008 [P] [US1] Integration test de doble cobro (`409`) y cobro sin rol (`403`)

### Implementation

- [x] T009 [US1] Implementar `pedidoService.crearMostrador` (sin ventana mínima; total backend)
- [x] T010 [US1] Implementar `pedidoService.cobrarEnCaja` (transacción: pago + estado `Pagado` + historial)
- [x] T011 [US1] Implementar `cajaController` + `caja.routes.ts` con `requireRole('cajero','administrador')`
- [x] T012 [P] [US1] Crear `CajaPage` (menú + armar pedido) en `frontend/src/pages/caja/CajaPage.tsx`
- [x] T013 [US1] Crear `CobroPage` (efectivo/tarjeta + confirmar) en `frontend/src/pages/caja/CobroPage.tsx`

**Checkpoint**: mostrador y cobro funcionales.

---

## Phase 4: User Story 2 - Ver y preparar pedidos en cocina (Priority: P1)

**Goal**: cocinero mueve pedidos `Pagado → En preparación → Listo`.

**Independent Test**: iniciar y terminar un pedido; transición inválida → 409.

### Tests

- [x] T014 [P] [US2] Test del mapa de transiciones en `backend/tests/integration/estadoTransiciones.test.ts` (consulta la tabla `transicion_estado`)
- [x] T015 [P] [US2] Integration test `GET /api/cocina/pedidos`, `/iniciar`, `/listo` en `backend/tests/integration/cocina.test.ts`

### Implementation

- [x] T016 [US2] Implementar `cocinaService.listar` (Pagado + En preparación, orden por hora de recolección)
- [x] T017 [US2] Implementar `cocinaService.iniciar` y `cocinaService.marcarListo` usando `transicionar`
- [x] T018 [US2] Implementar `cocinaController` + `cocina.routes.ts` con `requireRole('cocinero','administrador')`
- [x] T019 [US2] Crear `CocinaPage` (tablero + acciones iniciar/listo) en `frontend/src/pages/cocina/CocinaPage.tsx`

**Checkpoint**: caja y cocina funcionan de forma independiente.

---

## Phase 5: User Story 3 - Refrescar y priorizar la cocina (Priority: P2)

**Goal**: lista de cocina viva y ordenada por prioridad.

**Independent Test**: crear pedido y ver que aparece; orden por hora de recolección.

### Tests

- [x] T020 [P] [US3] Integration test del orden por `fecha_recoleccion` en `backend/tests/integration/cocinaOrden.test.ts`

### Implementation

- [x] T021 [US3] Añadir refetch periódico (5–10 s) en `CocinaPage`
- [x] T022 [P] [US3] Resaltar pedidos próximos a su hora de recolección en `CocinaPage`
- [x] T023 [US3] Optimizar consulta de cocina (índices por estado y fecha) en `cocinaService`

**Checkpoint**: las tres historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T024 [P] Documentar endpoints de caja y cocina en `backend/README.md`
- [x] T025 Sanear entradas y validar cantidades y métodos de pago
- [x] T026 Verificar que las transiciones concurrentes no duplican historial
- [x] T027 Ejecutar `npm test` y `npm run typecheck` en backend y frontend

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
- Desviaciones respecto al plan original:
  - Los esquemas `zod` viven en `backend/src/schemas/` (no en `services/validators/`).
  - El test del mapa de transiciones es de integración (necesita la tabla `transicion_estado`).
  - La ampliación de `pago.metodo` a `tarjeta` se aplicó con la migración
    `migrations/003_pago_metodo_tarjeta.sql` (el `CHECK` original no lo permitía).
