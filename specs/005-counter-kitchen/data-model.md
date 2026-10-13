# Data Model: Sprint 4 — Ventanilla y cocina

**Feature**: `005-counter-kitchen` | **Date**: 2026-10-13

Fuente: `migrations/001_crear_esquema.sql` (MySQL 8.0+). Este sprint no agrega tablas;
extiende el uso de las del Sprint 3.

## Máquina de estados

```
Pendiente ──(pago online)──▶ Pagado ──▶ En preparación ──▶ Listo ──▶ Entregado
    │
    └──(cancelar)──▶ Cancelado
```

- Pedido anticipado: `Pendiente` → `Pagado` al pagar en línea (Sprint 3).
- Pedido de mostrador: `Pendiente` → `Pagado` al cobrar en caja (este sprint).
- Cocina: `Pagado` → `En preparación` → `Listo` (este sprint).
- Entrega: `Listo` → `Entregado` (Sprint 5).

## Transiciones permitidas

| Desde | Hacia | Quién |
|-------|-------|-------|
| `Pendiente` | `Pagado` | sistema (pago) / cajero (cobro) |
| `Pendiente` | `Cancelado` | cliente / cajero |
| `Pagado` | `En preparación` | cocinero |
| `En preparación` | `Listo` | cocinero |
| `Listo` | `Entregado` | cajero (Sprint 5) |

Cualquier otra transición se rechaza con `409`.

## Tablas usadas

### `pedido` (uso extendido)

- `tipo`: `anticipado` | `mostrador`.
- `estado_id`: cualquiera del catálogo.
- `usuario_id`: cliente (anticipado) o cajero (mostrador).

### `pago` (cobro en caja)

- `metodo`: `efectivo` | `tarjeta` (además de `online` del Sprint 3).
- `pedido_id`: `UNIQUE`.

> Nota: el `CHECK chk_pago_metodo` original solo permitía `('online','efectivo')`. La
> migración `003_pago_metodo_tarjeta.sql` lo amplía a `('online','efectivo','tarjeta')`.

### `pedido_estado_historial`

- Una fila por cada transición, con `fecha`, `estado_anterior_id`, `estado_nuevo_id` y
  `cambiado_por` (quién la provocó).

## Consultas principales

### Pedidos para cocina

```sql
SELECT p.id, p.numero, p.fecha_recoleccion, e.nombre AS estado,
       GROUP_CONCAT(CONCAT(pd.cantidad, 'x ', pl.nombre) SEPARATOR ', ') AS items
FROM pedido p
JOIN estado_pedido e ON e.id = p.estado_id
JOIN pedido_detalle pd ON pd.pedido_id = p.id
JOIN menu_dia md ON md.id = pd.menu_dia_id
JOIN platillo pl ON pl.id = md.platillo_id
WHERE e.nombre IN ('Pagado', 'En preparación')
GROUP BY p.id
ORDER BY p.fecha_recoleccion ASC, p.creado_en ASC;
```

### Transición atómica de estado

```sql
UPDATE pedido SET estado_id = @nuevo
WHERE id = ? AND estado_id = @actual;
-- Transaction: throw HttpError.conflict si affectedRows = 0
INSERT INTO pedido_estado_historial (pedido_id, estado_anterior_id, estado_nuevo_id, cambiado_por)
VALUES (?, @actual, @nuevo, @quien);
```

> Índice real: `idx_pedido_fecha_recoleccion` (sobre `pedido.fecha_recoleccion`); las
> transiciones se validan contra la tabla `transicion_estado` (ya sembrada).
