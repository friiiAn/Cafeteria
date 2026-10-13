# Data Model: Sprint 5 — Seguimiento y notificaciones

**Feature**: `006-order-tracking-notifications` | **Date**: 2026-10-13

Fuente: `migrations/001_crear_esquema.sql` (MySQL 8.0+).

## Tablas

### `notificacion`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `usuario_id` | INT | NOT NULL, FK → `usuario(id)` |
| `pedido_id` | INT | NOT NULL, FK → `pedido(id)` |
| `mensaje` | VARCHAR(255) | NOT NULL |
| `tipo` | VARCHAR(30) | NOT NULL (`pedido_listo`) |
| `estado_envio` | VARCHAR(20) | NOT NULL, DEFAULT `pendiente` |
| `intentos` | INT | NOT NULL, DEFAULT 0 |
| `creado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

Índice: `idx_notificacion_estado (estado_envio)` (índice completo — MySQL no tiene índices
parciales; se apoya en este para el worker de reintentos).

### `pedido` (uso extendido)

- Estados adicionales expuestos al cliente: `Listo`, `Entregado`.
- El timeline se arma desde `pedido_estado_historial`.

### `pedido_estado_historial`

- Base del seguimiento: `pedido_id`, `estado_id`, `fecha`.

### `usuario` (uso extendido)

- `correo` se usa como destino del correo de notificación.

## Reglas de negocio

- Al pasar un pedido a `Listo` se crea una `notificacion` para el dueño.
- El envío de correo es best-effort: `estado_envio` refleja `enviado`/`fallido`; `intentos`
  cuenta los intentos.
- Nunca se notifica un pedido `Cancelado`.
- Un pedido `Listo` puede pasar a `Entregado` (cajero).
- Las notificaciones solo son visibles para su `usuario_id`.

## Relaciones

```
usuario 1 ── N notificacion N ── 1 pedido
pedido  1 ── N pedido_estado_historial N ── 1 estado_pedido
```

## Consultas principales

### Timeline de estados de un pedido

```sql
SELECT h.fecha, e.nombre AS estado
FROM pedido_estado_historial h
JOIN estado_pedido e ON e.id = h.estado_id
WHERE h.pedido_id = ?
ORDER BY h.fecha ASC;
```

### Notificaciones pendientes de reintento

```sql
SELECT id, usuario_id, pedido_id, mensaje, intentos
FROM notificacion
WHERE estado_envio IN ('pendiente', 'fallido') AND intentos < 5
ORDER BY creado_en ASC
LIMIT 50;
```
