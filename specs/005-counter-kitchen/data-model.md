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
| `Pendiente` | `Pagado` | sistema (pago) / cajera (cobro) |
| `Pendiente` | `Cancelado` | cliente / cajera |
| `Pagado` | `En preparación` | cocinera |
| `En preparación` | `Listo` | cocinera |
| `Listo` | `Entregado` | cajera (Sprint 5) |

Cualquier otra transición se rechaza con `409`.

## Tablas usadas

### `pedido` (uso extendido)

- `tipo`: `anticipado` | `mostrador`.
- `estado_id`: cualquiera del catálogo.
- `usuario_id`: cliente (anticipado) o cajera (mostrador).

### `pago` (cobro en caja)

- `metodo`: `efectivo` | `tarjeta` (además de `online` del Sprint 3).
- `pedido_id`: `UNIQUE`.

### `pedido_estado_historial`

- Una fila por cada transición, con `fecha`.

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
-- si affectedRows = 0 → 409
INSERT INTO pedido_estado_historial (pedido_id, estado_id) VALUES (?, @nuevo);
```
