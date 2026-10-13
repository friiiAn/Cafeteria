# API Contracts: Sprint 4 — Ventanilla y cocina

**Feature**: `005-counter-kitchen` | **Date**: 2026-10-13

Convenciones: `/api`, JSON, errores `{ "error": { "code", "message" } }`, `Authorization:
Bearer <jwt>`.

## Caja (cajera / administrador)

### POST /api/caja/pedidos
Registra un pedido de mostrador.

**Auth**: `cajera` | `administrador`.

**Body**:
```json
{ "items": [ { "menu_dia_id": 10, "cantidad": 2 } ] }
```

**201**: `{ "id": 60, "numero": "M-20261013-003", "tipo": "mostrador", "estado": "Pendiente", "total": 90.00 }`

**Errores**: `400` inválido; `409` platillo no disponible.

### POST /api/caja/pedidos/:id/cobrar
Registra el cobro en efectivo o tarjeta y marca el pedido `Pagado`.

**Auth**: `cajera` | `administrador`.

**Body**: `{ "metodo": "efectivo" }`  (o `"tarjeta"`)

**200**:
```json
{ "pedido_id": 60, "estado": "Pagado", "pago": { "metodo": "efectivo", "monto": 90.00, "estado": "confirmado" } }
```

**Errores**: `409` pedido ya pagado o no está `Pendiente`; `404` inexistente.

### POST /api/caja/pedidos/:id/cancelar
Cancela un pedido `Pendiente` en caja.

**200**: `{ "id": 60, "estado": "Cancelado" }`. **409** si ya no es cancelable.

## Cocina (cocinera / administrador)

### GET /api/cocina/pedidos
Pedidos por preparar (`Pagado`, `En preparación`) ordenados por hora de recolección.

**Auth**: `cocinera` | `administrador`.

**200**:
```json
[
  { "id": 60, "numero": "M-20261013-003", "estado": "Pagado",
    "fecha_recoleccion": "2026-10-13T13:10:00",
    "items": [ { "cantidad": 2, "nombre": "Torta de jamón" } ] }
]
```

### POST /api/cocina/pedidos/:id/iniciar
`Pagado` → `En preparación`.

**200**: `{ "id": 60, "estado": "En preparación" }`. **409** si no está `Pagado`.

### POST /api/cocina/pedidos/:id/listo
`En preparación` → `Listo`.

**200**: `{ "id": 60, "estado": "Listo" }`. **409** si no está `En preparación`.

## Reglas transversales

- Cada transición inserta una fila en `pedido_estado_historial`.
- Las transiciones usan `UPDATE ... WHERE estado_id = @actual` (concurrencia).
- El cobro en caja no usa la pasarela externa.
