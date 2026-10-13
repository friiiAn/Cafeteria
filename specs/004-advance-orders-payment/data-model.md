# Data Model: Sprint 3 — Pedido anticipado y pago

**Feature**: `004-advance-orders-payment` | **Date**: 2026-10-13

Fuente: `migrations/001_crear_esquema.sql` (MySQL 8.0+).

## Tablas de este sprint

### `estado_pedido` (catálogo)

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(30) | NOT NULL, UNIQUE |
| `orden` | INT | NOT NULL, UNIQUE |

Seed: `Pendiente`(1), `Pagado`(2), `En preparación`(3), `Listo`(4), `Entregado`(5),
`Cancelado`(0).

### `pedido`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `numero` | VARCHAR(20) | NOT NULL, UNIQUE |
| `tipo` | VARCHAR(20) | NOT NULL (`anticipado`/`mostrador`) |
| `estado_id` | INT | NOT NULL, FK → `estado_pedido(id)` |
| `usuario_id` | INT | NULL, FK → `usuario(id)` (obligatorio si `anticipado`) |
| `cliente_nombre` | VARCHAR(100) | NULL (pedidos de mostrador) |
| `fecha_recoleccion` | DATETIME | NULL (obligatorio si `anticipado`) |
| `total` | DECIMAL(10,2) | NOT NULL, CHECK ≥ 0 |
| `creado_por` | INT | NULL, FK → `usuario(id)` |
| `creado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `actualizado_en` | DATETIME | NOT NULL (trigger `trg_pedido_actualizado`) |

En este sprint solo se crean pedidos `anticipado` (`usuario_id` y `fecha_recoleccion`
presentes). Índices: `idx_pedido_estado`, `idx_pedido_usuario`, `idx_pedido_fecha_recoleccion`,
`idx_pedido_tipo`.

### `pedido_detalle`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, FK → `pedido(id)` ON DELETE CASCADE |
| `menu_dia_id` | INT | NOT NULL, FK → `menu_dia(id)` |
| `cantidad` | INT | NOT NULL, CHECK > 0 |
| `precio_unitario` | DECIMAL(10,2) | NOT NULL (congelado) |
| `subtotal` | DECIMAL(10,2) | NOT NULL (cantidad × precio_unitario) |

### `pago`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, UNIQUE, FK → `pedido(id)` |
| `metodo` | VARCHAR(20) | NOT NULL CHECK (`online`/`efectivo`) |
| `monto` | DECIMAL(10,2) | NOT NULL, CHECK > 0 |
| `referencia` | VARCHAR(100) | NULL (id del proveedor) |
| `registrado_por` | INT | NULL, FK → `usuario(id)` |
| `fecha` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

No existe columna `estado`: solo se registra la fila cuando el cobro se aprueba, por lo
que su presencia equivale a un pago confirmado. La API responde `pago.estado = "confirmado"`.

### `pedido_estado_historial`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, FK → `pedido(id)` ON DELETE CASCADE |
| `estado_anterior_id` | INT | NULL, FK → `estado_pedido(id)` |
| `estado_nuevo_id` | INT | NOT NULL, FK → `estado_pedido(id)` |
| `cambiado_por` | INT | NULL, FK → `usuario(id)` |
| `fecha` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

## Reglas de negocio

- El total = Σ(`cantidad × precio_unitario`); se calcula en backend.
- `precio_unitario` se copia de `menu_dia.precio` al crear; no se actualiza luego.
- Ventana mínima: `fecha_recoleccion ≥ now + MIN_LEAD_MINUTES` (10 min por defecto).
- Solo platillos con `menu_dia.disponible = 1` y `platillo.activo = 1`.
- Un pedido `Pendiente` puede pagarse; uno `Pagado` no puede volver a pagarse.
- Al pagar: `pedido.estado_id = Pagado` + registro en historial + fila en `pago`.

## Relaciones

```
usuario 1 ── N pedido N ── 1 estado_pedido
pedido  1 ── N pedido_detalle N ── 1 menu_dia
pedido  1 ── 1 pago
pedido  1 ── N pedido_estado_historial (anterior/nuevo → estado_pedido)
```

## Creación transaccional

```sql
START TRANSACTION;
INSERT INTO pedido (numero, tipo, estado_id, usuario_id, fecha_recoleccion, total)
VALUES (?, 'anticipado', @pendiente, ?, ?, ?);
INSERT INTO pedido_detalle (pedido_id, menu_dia_id, cantidad, precio_unitario, subtotal)
VALUES (?, ?, ?, ?, ?);  -- una fila por línea
INSERT INTO pedido_estado_historial (pedido_id, estado_anterior_id, estado_nuevo_id, cambiado_por)
VALUES (?, NULL, @pendiente, ?);
COMMIT;
```
