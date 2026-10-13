---

description: "Task list for Sprint 2 — Gestión y consulta del menú"
---

# Tasks: Sprint 2 — Gestión y consulta del menú

**Input**: Design documents from `specs/003-menu-management/`

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

- [ ] T001 Revisar que `backend` y `frontend` compilan tras el Sprint 1 (`npm run typecheck`)
- [ ] T002 [P] Añadir rutas base `/api/platillos` y `/api/menu` al router en `backend/src/routes/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: completar antes de las historias.

- [ ] T003 Verificar tablas `platillo` y `menu_dia` y su índice/unique en MySQL
- [ ] T004 [P] Definir esquemas `zod` de platillo y menú en `backend/src/services/validators/`
- [ ] T005 Crear helpers de consulta (query/execute con pool) reutilizables en `backend/src/db/`

**Checkpoint**: base de menú lista.

---

## Phase 3: User Story 1 - Gestionar platillos y menú del día (Priority: P1) 🎯 MVP

**Goal**: CRUD de platillos y alta/edición/baja de entradas de menú por el administrador.

**Independent Test**: crear platillo, agregarlo al menú de hoy, editarlo, quitarlo; 403 para no-admin.

### Tests

- [ ] T006 [P] [US1] Unit test de `platilloService` en `backend/tests/unit/platilloService.test.ts`
- [ ] T007 [P] [US1] Integration test de `/api/platillos` en `backend/tests/integration/platillos.test.ts`
- [ ] T008 [P] [US1] Integration test de `POST/PUT/DELETE /api/menu` en `backend/tests/integration/menu.test.ts`

### Implementation

- [ ] T009 [US1] Implementar `platilloService` (listar/crear/editar) en `backend/src/services/platilloService.ts`
- [ ] T010 [US1] Implementar `platilloController` + `platillo.routes.ts` con `requireRole('administrador')`
- [ ] T011 [US1] Implementar `menuService` (alta con upsert, editar, eliminar, listar por fecha) en `backend/src/services/menuService.ts`
- [ ] T012 [US1] Implementar `menuController` + `menu.routes.ts` (escrituras protegidas) en `backend/src/`
- [ ] T013 [US1] Rechazar precio negativo/no numérico y duplicado por fecha (409)

**Checkpoint**: gestión de menú operativa y testeable.

---

## Phase 4: User Story 2 - Consultar el menú del día (Priority: P1)

**Goal**: vista del menú del cliente con disponibilidad y especiales.

**Independent Test**: `/menu` lista platillos con precio; no disponibles marcados y no seleccionables; sin menú → mensaje.

### Tests

- [ ] T014 [P] [US2] Integration test de `GET /api/menu/cliente` en `backend/tests/integration/menuCliente.test.ts`

### Implementation

- [ ] T015 [US2] Implementar consulta optimizada por fecha (JOIN, `p.activo=1`) en `menuService.listarCliente`
- [ ] T016 [US2] Crear `PlatilloCard` (nombre, descripción, precio, badge no disponible/especial) en `frontend/src/components/PlatilloCard.tsx`
- [ ] T017 [US2] Crear `MenuPage` en `frontend/src/pages/clientes/MenuPage.tsx` con estado vacío
- [ ] T018 [US2] Deshabilitar la selección de platillos no disponibles en `PlatilloCard`

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Reflejar cambios de inmediato (Priority: P2)

**Goal**: los cambios del admin se ven de inmediato en `/menu`.

**Independent Test**: cambiar precio/disponibilidad y recargar `/menu` refleja el cambio.

### Tests

- [ ] T019 [P] [US3] Integration test: cambio de precio/disponibilidad reflejado en `GET /api/menu/cliente` en `backend/tests/integration/menuReflejo.test.ts`

### Implementation

- [ ] T020 [US3] Asegurar que la consulta del cliente no cachea y lee en vivo en `menuService`
- [ ] T021 [P] [US3] Crear `MenuDiaPage` (admin) para editar precio/disponibilidad/especial en `frontend/src/pages/admin/MenuDiaPage.tsx`
- [ ] T022 [P] [US3] Crear `PlatillosPage` (admin) con alta/edición/estado en `frontend/src/pages/admin/PlatillosPage.tsx`

**Checkpoint**: las tres historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T023 [P] Documentar endpoints de menú en `backend/README.md`
- [ ] T024 Sanear y validar todos los parámetros (`fecha`, ids, precios)
- [ ] T025 Optimizar la consulta del cliente (índice por fecha) y medir tiempo de respuesta
- [ ] T026 Ejecutar `npm test` y `npm run typecheck` en backend y frontend

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → {US2, US3 en paralelo} → Polish.
- US2 y US3 usan los servicios de US1.

## Implementation Strategy

### MVP First

1. Setup + Foundational.
2. US1 (gestión) + US2 (consulta) → demo: admin publica y alumno consulta en móvil.
3. US3 (reflejo inmediato) → pulido.

## Notes

- El control de cantidad del platillo se habilita en el Sprint 3.
- Mantener la consulta del cliente como path caliente (una sola query).
