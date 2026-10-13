# Data Model: Sprint 3 — Pedido anticipado y pago

**Feature**: `004-advance-orders-payment` | **Date**: 2026-10-13

Fuente: `migrations/001_crear_esquema.sql` (MySQL 8.0+).

## Tablas de este sprint

### `estado_pedido` (catálogo)

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(50) | NOT NULL, UNIQUE |

Seed: `Pendiente`, `Pagado`, `En preparación`, `Listo`, `Entregado`, `Cancelado`.

### `pedido`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `numero` | VARCHAR(30) | NOT NULL, UNIQUE |
| `tipo` | ENUM/VARCHAR | NOT NULL (`anticipado`) |
| `estado_id` | INT | NOT NULL, FK → `estado_pedido(id)` |
| `usuario_id` | INT | NOT NULL, FK → `usuario(id)` |
| `fecha_recoleccion` | DATETIME | NOT NULL |
| `total` | DECIMAL(10,2) | NOT NULL, CHECK ≥ 0 |
| `creado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `actualizado_en` | DATETIME | NOT NULL (trigger `trg_pedido_actualizado`) |

Índices: `idx_pedido_estado`, `idx_pedido_usuario`, `idx_pedido_recoleccion`.

### `pedido_detalle`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, FK → `pedido(id)` |
| `menu_dia_id` | INT | NOT NULL, FK → `menu_dia(id)` |
| `cantidad` | INT | NOT NULL, CHECK > 0 |
| `precio_unitario` | DECIMAL(10,2) | NOT NULL (congelado) |
| `subtotal` | DECIMAL(10,2) | NOT NULL (cantidad × precio_unitario) |

### `pago`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, UNIQUE, FK → `pedido(id)` |
| `metodo` | VARCHAR(30) | NOT NULL (`online`) |
| `monto` | DECIMAL(10,2) | NOT NULL |
| `referencia` | VARCHAR(100) | NULL (id del proveedor) |
| `estado` | VARCHAR(20) | NOT NULL (`confirmado`/`fallido`) |
| `fecha` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

### `pedido_estado_historial`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, FK → `pedido(id)` |
| `estado_id` | INT | NOT NULL, FK → `estado_pedido(id)` |
| `fecha` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

## Reglas de negocio

- El total = Σ(`cantidad × precio_unitario`); se calcula en backend.
- `precio_unitario` se copia de `menu_dia.precio` al crear; no se actualiza luego.
- Ventana mínima: `fecha_recoleccion ≥ now + 10 min`.
- Solo platillos con `menu_dia.disponible = 1` y `platillo.activo = 1`.
- Un pedido `Pendiente` puede pagarse; uno `Pagado` no puede volver a pagarse.
- Al pagar: `pedido.estado_id = Pagado` + registro en historial + fila en `pago`.

## Relaciones

```
usuario 1 ── N pedido N ── 1 estado_pedido
pedido  1 ── N pedido_detalle N ── 1 menu_dia
pedido  1 ── 1 pago
pedido  1 ── N pedido_estado_historial N ── 1 estado_pedido
```

## Creación transaccional

```sql
START TRANSACTION;
INSERT INTO pedido (numero, tipo, estado_id, usuario_id, fecha_recoleccion, total)
VALUES (?, 'anticipado', @pendiente, ?, ?, ?);
INSERT INTO pedido_detalle (pedido_id, menu_dia_id, cantidad, precio_unitario, subtotal)
VALUES (?, ?, ?, ?, ?), ...;
INSERT INTO pedido_estado_historial (pedido_id, estado_id) VALUES (?, @pendiente);
COMMIT;
```
