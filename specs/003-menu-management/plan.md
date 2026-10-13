# Implementation Plan: Sprint 2 — Gestión y consulta del menú

**Branch**: `003-menu-management` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-menu-management/spec.md`

## Summary

Permitir que el administrador gestione el catálogo de platillos y arme el menú del día
(fecha, precio, disponibilidad, especial) sobre MySQL, y que los clientes consulten el
menú publicado con rapidez. Implementa CRUD de platillos y menú, RBAC de escritura y una
consulta optimizada para `/menu`. Traza a US6 y FR-008..FR-014 de la spec maestra.

## Technical Context

**Language/Version**: TypeScript 5.x — Node.js LTS + Express; React + TypeScript + Vite

**Primary Dependencies**: `mysql2`, `zod`, Express; React Router, Tailwind, shadcn/ui; Vitest

**Storage**: MySQL 8.0+ — tablas `platillo`, `menu_dia`

**Testing**: Vitest + supertest

**Target Platform**: Web responsiva

**Project Type**: Web app (backend + frontend)

**Performance Goals**: consulta de menú < 2 s en móvil (SC-003); escrituras < 300 ms

**Constraints**: solo administrador escribe; precio ≥ 0; un platillo por fecha; no
disponibles no seleccionables

**Scale/Scope**: menú diario de decenas de platillos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Simplicidad**: PASS — servicios y controladores directos sobre `mysql2`.
- **Seguridad/RBAC**: PASS — escrituras con `requireRole('administrador')`.
- **Validación**: PASS — `zod` para precio/fecha/ids.
- **Rendimiento (§25)**: PASS — índice por fecha y consulta única con JOIN.
- **Alcance**: PASS — solo platillos y menú; sin pedidos ni pagos.

Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/003-menu-management/
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
│   ├── platilloService.ts
│   └── menuService.ts
├── controllers/
│   ├── platilloController.ts
│   └── menuController.ts
└── routes/
    ├── platillo.routes.ts
    └── menu.routes.ts

backend/tests/
├── unit/menuService.test.ts
└── integration/{platillos,menu}.test.ts

frontend/src/
├── pages/admin/{PlatillosPage,MenuDiaPage}.tsx
├── pages/clientes/MenuPage.tsx
└── components/PlatilloCard.tsx
```

**Structure Decision**: extiende la estructura del Sprint 1 sin capas nuevas.

## Complexity Tracking

> Sin violaciones al Constitution Check.
