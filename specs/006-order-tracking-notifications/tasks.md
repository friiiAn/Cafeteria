---

description: "Task list for Sprint 5 — Seguimiento y notificaciones"
---

# Tasks: Sprint 5 — Seguimiento y notificaciones

**Input**: Design documents from `specs/006-order-tracking-notifications/`

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

- [x] T001 Confirmar que sprints 1–4 compilan y pasan pruebas
- [x] T002 [P] Añadir variables `MAIL_PROVIDER`, `MAIL_FROM`, `NOTIFICACION_MAX_INTENTOS`,
      `NOTIFICACION_POLL_MS` a `backend/.env.example` y `env.ts`
- [x] T003 [P] Registrar routers `/api/notificaciones` en `backend/src/routes/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: completar antes de las historias.

- [x] T004 Verificar/reconciliar la tabla `notificacion` y su índice `idx_notificacion_estado`
      (migración `004_notificacion_seguimiento.sql`)
- [x] T005 Definir interfaz `Mailer` y `ConsoleMailer` (dev) en `backend/src/services/mail/`
- [x] T006 [P] Implementar selección de proveedor de correo por `MAIL_PROVIDER`
      (`ConsoleMailer` / `FailMailer`)
- [x] T007 [P] ~~Definir esquemas `zod` de notificaciones~~ — **desviación**: no se requieren
      (rutas sin body; solo lectura y marcado)

**Checkpoint**: infraestructura de correo y notificaciones lista.

---

## Phase 3: User Story 1 - Seguir el estado de mi pedido (Priority: P1) 🎯 MVP

**Goal**: `/mis-pedidos` muestra estado actual, folio y timeline.

**Independent Test**: ver pedidos propios con estado; acceso ajeno → 403.

### Tests

- [x] T008 [P] [US1] Integration test `GET /api/pedidos` y `GET /api/pedidos/:id` (timeline, 403)
      en `backend/tests/integration/seguimiento.test.ts`

### Implementation

- [x] T009 [US1] Implementar listado por usuario con orden `creado_en` DESC —
      **desviación**: en `pedidoRepository.listarPorUsuario` / `pedidoService`, sin
      `seguimientoService` separado
- [x] T010 [US1] Exponer `historial` (timeline) en `GET /api/pedidos/:id` y 403 para ajeno
- [x] T011 [US1] Crear `EstadoTimeline` y `PedidoCard` en `frontend/src/components/`
- [x] T012 [US1] Implementar `MisPedidosHome` (lista + detalle + badge de estado) en `frontend/src/pages/clientes/MisPedidosHome.tsx`
- [x] T013 [US1] Añadir refetch periódico (12 s) en `MisPedidosHome`

**Checkpoint**: seguimiento funcional y testeable.

---

## Phase 4: User Story 2 - Recibir notificación cuando el pedido está listo (Priority: P1)

**Goal**: al pasar a `Listo`, crear notificación y enviar correo con reintentos.

**Independent Test**: avanzar a `Listo` genera notificación; fallo de correo se registra y reintenta.

### Tests

- [x] T014 [P] [US2] Unit test del `Mailer` en `backend/tests/unit/mailer.test.ts`
- [x] T016 [P] [US2] ~~Unit test de reintentos~~ — **desviación**: la reintentabilidad se
      cubre en `backend/tests/integration/notificaciones.test.ts` (pending → enviada,
      fallo → fallida)
- [x] T017 [P] [US2] Integration test: `Listo` genera notificación y envío en `backend/tests/integration/notificaciones.test.ts`

### Implementation

- [x] T018 [US2] Implementar `notificacionService.crearParaPedidoListo` (persistir antes de enviar) en `backend/src/services/notificacionService.ts`
- [x] T019 [US2] Implementar `notificacionService.enviarPendientes` (actualiza `estado_envio`/`intentos`)
- [x] T020 [US2] Hook en `cocinaService.marcarListo`: crear notificación dentro de la transacción
- [x] T021 [US2] Implementar worker en `backend/src/workers/notificacionWorker.ts` (iniciado en `server.ts`)
- [x] T022 [US2] Implementar `notificacionController` + `notificacion.routes.ts` (`GET`, marcar leída, 403 ajeno)
- [x] T023 [US2] Crear `NotificacionBell` y `lib/notificaciones.ts` en frontend

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Confirmar la entrega y cerrar el ciclo (Priority: P2)

**Goal**: cajero confirma entrega `Listo → Entregado`.

**Independent Test**: entregar un pedido `Listo`; no `Listo` → 409.

### Tests

- [x] T024 [P] [US3] Integration test `POST /api/caja/pedidos/:id/entregar` (éxito, 409, 403) en `backend/tests/integration/entrega.test.ts`

### Implementation

- [x] T025 [US3] Implementar `pedidoService.entregar` con la máquina de estados (historial)
- [x] T026 [US3] Exponer `POST /api/caja/pedidos/:id/entregar` y `GET /api/caja/pedidos` con `requireRole('cajero','administrador')`
- [x] T027 [P] [US3] Añadir acción "Confirmar entrega" en `CajaPage` —
      **desviación**: solo `CajaPage` (la entrega no pertenece a cocina)

**Checkpoint**: las tres historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T028 [P] Documentar endpoints de seguimiento y notificaciones en `backend/README.md`
- [x] T029 Verificar que fallos de correo nunca bloquean el cambio de estado ni pierden notificaciones
- [x] T030 Verificar que pedidos cancelados no generan notificación
- [x] T031 Medir y ajustar el intervalo de refetch del seguimiento (12 s clientes / 10 s caja)
- [x] T032 Ejecutar `npm test` y `npm run typecheck` en backend y frontend

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 → US3 → Polish.
- US2 depende del hook en `cocinaService.marcarListo` (Sprint 4).
- US3 extiende la máquina de estados del Sprint 4.

## Implementation Strategy

### MVP First

1. Setup + Foundational.
2. US1 (seguimiento) → el cliente ve su pedido.
3. US2 (notificación) → aviso al estar listo.
4. US3 (entrega) → cierre del ciclo y métricas.

## Notes

- La notificación se persiste antes de intentar el correo (fiabilidad).
- El envío real de correo es best-effort; la app no depende de él.
- Considerar SSE como mejora opcional del sondeo.
- **Desviaciones registradas**: se reutilizó `pedidoService`/`pedidoRepository` en lugar
  de un `seguimientoService` aparte; se omitieron esquemas zod de notificaciones (no hay
  cuerpos de entrada); los reintentos se validan por integración en lugar de un unit test;
  solo `tipo='anticipado'` genera notificación; `POST /pedidos/:id/pagar` y `/cancelar`
  de un pedido ajeno siguen devolviendo `404` (solo el detalle `GET` distingue 403).
