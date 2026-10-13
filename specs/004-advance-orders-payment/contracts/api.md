# API Contracts: Sprint 3 — Pedido anticipado y pago

**Feature**: `004-advance-orders-payment` | **Date**: 2026-10-13

Convenciones: `/api`, JSON, errores `{ "error": { "code", "message" } }`, `Authorization:
Bearer <jwt>`. Requiere sesión de cliente (`usuario`).

## Pedidos

### POST /api/pedidos
Crea un pedido anticipado en estado `Pendiente`.

**Body**:
```json
{
  "fecha_recoleccion": "2026-10-13T13:30:00",
  "items": [
    { "menu_dia_id": 10, "cantidad": 2 },
    { "menu_dia_id": 12, "cantidad": 1 }
  ]
}
```

**201**:
```json
{ "id": 55, "numero": "A-20261013-001", "estado": "Pendiente",
  "total": 135.00, "fecha_recoleccion": "2026-10-13T13:30:00",
  "items": [ { "menu_dia_id": 10, "cantidad": 2, "precio_unitario": 45.00, "subtotal": 90.00 } ] }
```

**Errores**: `400` datos inválidos; `409` platillo no disponible o anticipación < 10 min.

### GET /api/pedidos
Pedidos del usuario autenticado (`?estado=`, `?desde=`, `?hasta=`).

**200**: `[ { "id":55, "numero":"A-20261013-001", "estado":"Pendiente", "total":135.00, "fecha_recoleccion":"..." } ]`

### GET /api/pedidos/:id
Detalle de un pedido propio.

**200**: pedido completo con items e historial. **403** si no es del usuario; `404` si no existe.

### POST /api/pedidos/:id/pagar
Inicia y confirma el pago en línea. El backend recalcula el monto del pedido `Pendiente`.

**Body**: `{ "token_pago":"tok_xxx" }`

**200**:
```json
{ "pedido_id": 55, "estado": "Pagado", "pago": { "metodo":"online", "monto":135.00, "referencia":"pay_123", "estado":"confirmado" } }
```

**Errores**:
- `402` pago rechazado (el pedido permanece `Pendiente`).
- `409` pedido ya pagado o no está `Pendiente`.
- `404` pedido inexistente o ajeno.

### POST /api/pedidos/:id/cancelar
Cancela un pedido propio mientras siga `Pendiente`.

**200**: `{ "id":55, "estado":"Cancelado" }`. **409** si ya no es cancelable.

## Notas de seguridad

- Nunca se reciben ni almacenan datos de tarjeta; solo `token_pago` del proveedor.
- El `monto` se ignora si el cliente lo envía; se usa el `pedido.total`.
- `GET /api/pedidos/:id` valida propiedad del recurso.
