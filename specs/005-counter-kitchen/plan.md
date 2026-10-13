# Implementation Plan: Sprint 4 — Ventanilla y cocina

**Branch**: `005-counter-kitchen` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-counter-kitchen/spec.md`

## Summary

Habilitar la operación del día: la cajera registra pedidos de mostrador (sin ventana de 10
minutos), los cobra en efectivo o tarjeta y los deja `Pagado`; la cocinera ve los pedidos por
preparar, ordenados por hora de recolección, y los mueve por los estados
`En preparación` → `Listo`. Se introduce una máquina de estados con transiciones atómicas y
su historial. Traza a US4 y US5 de la spec maestra.

## Technical Context

**Language/Version**: TypeScript 5.x — Node.js LTS + Express; React + TypeScript + Vite

**Primary Dependencies**: `mysql2` (transacciones y `UPDATE ... AND estado_id`), `zod`,
Express; React Router, Tailwind, shadcn/ui; Vitest

**Storage**: MySQL 8.0+ — `pedido` (tipo `mostrador`), `pago`, `estado_pedido`,
`pedido_estado_historial`

**Testing**: Vitest + supertest

**Target Platform**: Web responsiva (tablet en caja/cocina)

**Project Type**: Web app

**Performance Goals**: pedido de mostrador cobrado < 1 min (SC-001); pedido visible en
cocina < 5 s (SC-002)

**Constraints**: sin ventana mínima para mostrador; un pago por pedido; transiciones en
secuencia; sin pasarela externa en caja

**Scale/Scope**: decenas de pedidos por receso

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **RBAC**: PASS — cobro para cajera/admin; preparación para cocinera/admin.
- **Integridad**: PASS — transacciones y `UPDATE ... AND estado_id`; historial por
  transición.
- **Simplicidad**: PASS — máquina de estados en un servicio; sin bus de eventos.
- **Rendimiento**: PASS — índices por estado y fecha_recoleccion; sondeo ligero.
- **Testing**: PASS — Vitest cubre transiciones válidas e inválidas y el cobro.
- **Alcance**: PASS — solo mostrador, cobro en caja y cocina.

Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/005-counter-kitchen/
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
│   ├── pedidoService.ts        # extendido: cobrarEnCaja
│   ├── cocinaService.ts        # listar y transicionar
│   └── estadoService.ts        # mapa de transiciones
├── controllers/
│   ├── cajaController.ts
│   └── cocinaController.ts
└── routes/
    ├── caja.routes.ts
    └── cocina.routes.ts

backend/tests/
├── unit/estadoTransiciones.test.ts
└── integration/{caja,cocina}.test.ts

frontend/src/
├── pages/caja/{CajaPage,CobroPage}.tsx
└── pages/cocina/CocinaPage.tsx
```

**Structure Decision**: extiende la estructura existente; añade módulos `caja` y `cocina`.

## Complexity Tracking

> Sin violaciones al Constitution Check.
