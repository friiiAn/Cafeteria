# Implementation Plan: Sprint 5 — Seguimiento y notificaciones

**Branch**: `006-order-tracking-notifications` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-order-tracking-notifications/spec.md`

## Summary

Cerrar el ciclo de valor: el cliente consulta el estado y el historial de sus pedidos en
`/mis-pedidos`, recibe una notificación en la app y por correo cuando el pedido pasa a
`Listo` (con reintentos y registro del resultado), y el cajero confirma la entrega física
(`Listo → Entregado`). Traza a US3 y FR-033..FR-038 de la spec maestra.

## Technical Context

**Language/Version**: TypeScript 5.x — Node.js LTS + Express; React + TypeScript + Vite

**Primary Dependencies**: `mysql2`, `zod`, Express; abstracción `Mailer` (SMTP/simulado);
React Router, Tailwind, shadcn/ui; Vitest

**Storage**: MySQL 8.0+ — `notificacion`, `pedido`, `pedido_estado_historial`

**Testing**: Vitest + supertest (incluye fallo de correo y reintentos)

**Target Platform**: Web responsiva

**Project Type**: Web app

**Performance Goals**: estado visible < 2 s (SC-001); consulta de seguimiento < 30 s de
interacción (SC-004)

**Constraints**: sin bloqueo del flujo por fallos de correo; sin acceso a recursos ajenos;
sin notificación de pedidos cancelados

**Scale/Scope**: decenas de pedidos por receso

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Fiabilidad**: PASS — notificación persistida antes del envío; reintentos; sin pérdida.
- **Seguridad**: PASS — filtrado por `usuario_id`; entrega por rol cajero/admin.
- **Simplicidad**: PASS — sondeo y worker ligero; sin mensajería pesada.
- **Integridad**: PASS — transiciones por la máquina de estados del Sprint 4.
- **Testing**: PASS — Vitest cubre notificación, reintento y entrega.
- **Alcance**: PASS — solo seguimiento y notificaciones.

Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/006-order-tracking-notifications/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/api.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/src/
├── services/
│   ├── seguimientoService.ts
│   ├── notificacionService.ts
│   └── mail/{Mailer,ConsoleMailer,SmtpMailer,index}.ts
├── controllers/
│   ├── pedidoController.ts     # extendido: detalle con timeline
│   └── notificacionController.ts
├── routes/
│   ├── pedido.routes.ts        # extendido
│   └── notificacion.routes.ts
└── workers/notificacionWorker.ts

backend/tests/
├── unit/{notificacionRetry,mailer}.test.ts
└── integration/{seguimiento,notificaciones,entrega}.test.ts

frontend/src/
├── pages/clientes/MisPedidosHome.tsx
├── components/{PedidoCard,EstadoTimeline,NotificacionBell}.tsx
└── lib/notificaciones.ts
```

**Structure Decision**: extiende la estructura existente; añade módulo `mail/`, `workers/`
y componentes de seguimiento.

## Complexity Tracking

> Sin violaciones al Constitution Check.
