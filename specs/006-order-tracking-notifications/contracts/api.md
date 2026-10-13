# API Contracts: Sprint 5 — Seguimiento y notificaciones

**Feature**: `006-order-tracking-notifications` | **Date**: 2026-10-13

Convenciones: `/api`, JSON, errores `{ "error": { "code", "message" } }`, `Authorization:
Bearer <jwt>`.

## Seguimiento (cliente)

### GET /api/pedidos
Pedidos del usuario autenticado, más recientes primero.

**200**:
```json
[
  { "id": 55, "numero": "A-20261013-001", "estado": "En preparación",
    "total": 135.00, "fecha_recoleccion": "2026-10-13T13:30:00",
    "creado_en": "2026-10-13T12:40:00" }
]
```

### GET /api/pedidos/:id
Detalle con timeline de estados. **403** si no es del usuario; `404` si no existe.

**200**:
```json
{
  "id": 55, "numero": "A-20261013-001", "estado": "Listo", "total": 135.00,
  "fecha_recoleccion": "2026-10-13T13:30:00",
  "items": [ { "cantidad": 2, "nombre": "Torta de jamón", "precio_unitario": 45.00 } ],
  "historial": [
    { "estado": "Pendiente", "fecha": "2026-10-13T12:40:00" },
    { "estado": "Pagado", "fecha": "2026-10-13T12:41:00" },
    { "estado": "En preparación", "fecha": "2026-10-13T13:05:00" },
    { "estado": "Listo", "fecha": "2026-10-13T13:20:00" }
  ]
}
```

## Notificaciones (cliente)

### GET /api/notificaciones
Notificaciones del usuario autenticado.

**200**:
```json
[ { "id": 7, "pedido_id": 55, "tipo": "pedido_listo",
    "mensaje": "Tu pedido A-20261013-001 está listo", "estado_envio": "enviado",
    "creado_en": "2026-10-13T13:20:05" } ]
```

### POST /api/notificaciones/:id/leer
Marca una notificación como leída (opcional).

**200**: `{ "id": 7, "leida": true }`. **403** si no es del usuario.

## Entrega (cajero / administrador)

### POST /api/caja/pedidos/:id/entregar
`Listo` → `Entregado`.

**Auth**: `cajero` | `administrador`.

**200**: `{ "id": 55, "estado": "Entregado" }`. **409** si no está `Listo`.

## Generación de notificaciones (interno)

- No es un endpoint. Se dispara al pasar un pedido a `Listo` (`cocinaService.marcarListo`):
  inserta `notificacion` y programa el envío de correo.
- Un worker `enviarNotificacionesPendientes()` reintenta las `pendiente`/`fallido`.

## Reglas transversales

- Los endpoints de pedidos y notificaciones filtran por el usuario dueño.
- El envío de correo nunca bloquea la transición de estado.
- Los pedidos cancelados no generan notificación.
