# Implementation Plan: Sprint 3 — Pedido anticipado y pago

**Branch**: `004-advance-orders-payment` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-advance-orders-payment/spec.md`

## Summary

Permitir al cliente armar y confirmar un pedido anticipado (con validación de disponibilidad
y ventana mínima de 10 minutos), calcular el total en el backend, congelar los precios en el
detalle y completar el pago en línea mediante una abstracción de proveedor, cambiando el
pedido a `Pagado`. Traza a US2 y FR-015..FR-025 de la spec maestra.

## Technical Context

**Language/Version**: TypeScript 5.x — Node.js LTS + Express; React + TypeScript + Vite

**Primary Dependencies**: `mysql2` (transacciones), `zod`, Express; React Router, Tailwind,
shadcn/ui; Vitest; proveedor de pago (mock en dev)

**Storage**: MySQL 8.0+ — `pedido`, `pedido_detalle`, `pago`, `estado_pedido`,
`pedido_estado_historial`

**Testing**: Vitest + supertest (incluye casos de transacción y pago)

**Target Platform**: Web responsiva

**Project Type**: Web app

**Performance Goals**: crear pedido < 1 s; confirmar pago < 3 s (según proveedor)

**Constraints**: total calculado en servidor; ventana ≥ 10 min; sin datos de tarjeta;
pago único por pedido; precio congelado

**Scale/Scope**: hasta ~50 pedidos en el receso

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Seguridad**: PASS — token de pago del proveedor; sin datos de tarjeta.
- **Integridad**: PASS — transacciones SQL; folio único; pago único.
- **Validación**: PASS — `zod` + regla de ventana en backend.
- **Simplicidad**: PASS — `PaymentGateway` como única abstracción.
- **Testing**: PASS — Vitest cubre ventana, total, pago y estados.
- **Alcance**: PASS — solo pedido anticipado con pago en línea.

Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/004-advance-orders-payment/
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
│   ├── pedidoService.ts
│   └── payment/{PaymentGateway.ts,MockPaymentGateway.ts,index.ts}
├── controllers/
│   └── pedidoController.ts
└── routes/
    └── pedido.routes.ts

backend/tests/
├── unit/{pedidoTotal,leadTime}.test.ts
└── integration/{pedidos,pago}.test.ts

frontend/src/
├── pages/clientes/{CarritoPage,PagoPage}.tsx
├── pages/clientes/MenuPage.tsx       # control de cantidad
└── lib/carrito.ts                    # estado del carrito
```

**Structure Decision**: extiende la estructura existente; añade el módulo `payment/`.

## Complexity Tracking

> Sin violaciones al Constitution Check.
