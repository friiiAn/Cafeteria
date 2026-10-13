# Data Model: Sprint 5 — Seguimiento y notificaciones

**Feature**: `006-order-tracking-notifications` | **Date**: 2026-10-13

Fuente: `migrations/001_crear_esquema.sql` + `migrations/004_notificacion_seguimiento.sql`
(MySQL 8.0+).

## Tablas

### `notificacion`

Estado tras la migración `004` (el `001` creaba un subconjunto de estas columnas).

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, FK `fk_notificacion_pedido` → `pedido(id)` ON DELETE CASCADE |
| `usuario_id` | INT | NULL, FK `fk_notificacion_usuario` → `usuario(id)` ON DELETE CASCADE |
| `tipo` | VARCHAR(30) | NOT NULL (`pedido_listo`) |
| `canal` | VARCHAR(20) | NOT NULL, DEFAULT `correo`; `chk_notificacion_canal` ∈ (`correo`,`push`,`sms`) |
| `mensaje` | VARCHAR(255) | NULL |
| `estado_envio` | VARCHAR(20) | NOT NULL, DEFAULT `pendiente`; `chk_notificacion_estado` ∈ (`pendiente`,`enviada`,`fallida`) |
| `intentos` | INT | NOT NULL, DEFAULT 0 |
| `leida` | TINYINT(1) | NOT NULL, DEFAULT 0 |
| `fecha` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `detalle_error` | VARCHAR(255) | NULL |

Índices y restricciones:

- `uq_notificacion_pedido_tipo (pedido_id, tipo)` — evita duplicar la notificación de
  «pedido listo» para un mismo pedido.
- `idx_notificacion_estado (estado_envio)` — apoyo del worker de reintentos.
- `idx_notificacion_usuario (usuario_id, leida)` — bandeja del cliente.

> Nota: la API expone `fecha` como `creado_en` y los valores `estado_envio` son
> `pendiente` / `enviada` / `fallida` (femenino, como el `001`).

### `pedido` (uso extendido)

- Estados adicionales expuestos al cliente: `Listo`, `Entregado`.
- `usuario_id` es `NULL` para pedidos de mostrador; solo los pedidos anticipados
  (`tipo='anticipado'`) generan notificación.
- El timeline se arma desde `pedido_estado_historial`.

### `pedido_estado_historial`

Columnas reales: `pedido_id`, `estado_anterior_id`, `estado_nuevo_id`, `cambiado_por`,
`fecha`. El timeline usa `estado_nuevo_id` y `fecha`.

### `usuario` (uso extendido)

- `correo` se usa como destino del correo de notificación.

## Reglas de negocio

- Al pasar un pedido **anticipado** a `Listo` se crea una `notificacion` para el dueño,
  dentro de la misma transacción.
- El envío de correo es best-effort: `estado_envio` refleja `enviada`/`fallida`;
  `intentos` cuenta los intentos y a partir de `NOTIFICACION_MAX_INTENTOS` se marca
  `fallida`.
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
SELECT h.fecha, e.nombre AS estado_nuevo
FROM pedido_estado_historial h
JOIN estado_pedido e ON e.id = h.estado_nuevo_id
WHERE h.pedido_id = ?
ORDER BY h.fecha ASC, h.id ASC;
```

### Notificaciones pendientes de reintento

```sql
SELECT n.id, n.usuario_id, n.pedido_id, n.mensaje, n.intentos, u.correo
FROM notificacion n
JOIN usuario u ON u.id = n.usuario_id
WHERE n.estado_envio = 'pendiente' AND n.intentos < 5
ORDER BY n.fecha ASC
LIMIT 50;
```
