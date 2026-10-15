# Data Model: Sprint 7 — Rediseño UI/UX por rol

**Feature**: `007-ui-redesign` | **Date**: 2026-10-14

Este sprint **no cambia el esquema** de base de datos. Solo se amplían las
**proyecciones** (respuestas) de dos consultas de lectura. Fuente:
`migrations/001_crear_esquema.sql` … `004_notificacion_seguimiento.sql`
(MySQL 8.0+).

## Cambios de proyección (sin migración)

### Cocina — `PedidoCocina`

Vista: `/cocina` (diseño-cocina §3.2). Fuente: `pedidoRepository.listarParaCocina`
+ `listarItemsDePedidos`.

| Campo | Tipo | Origen | Nuevo |
|-------|------|--------|-------|
| `id` | number | `pedido.id` | no |
| `numero` | string | `pedido.numero` | no |
| `tipo` | `anticipado`\|`mostrador` | `pedido.tipo` | no |
| `estado` | string | `estado_pedido.nombre` | no |
| `cliente_nombre` | string\|null | `COALESCE(pedido.cliente_nombre, usuario.nombre)` | **sí** |
| `creado_en` | string (fecha-hora) | `pedido.creado_en` | **sí** |
| `fecha_recoleccion` | string (fecha-hora) | `pedido.fecha_recoleccion` | no |
| `items` | `{ cantidad, nombre }[]` | `pedido_detalle` | no |

- `cliente_nombre` es `NULL` en mostrador sin cuenta y en anticipado sin nombre
  capturado; la UI muestra "Sin nombre".
- `creado_en` alimenta el tiempo transcurrido; `fecha_recoleccion` define el
  "retrasado".

### Entregas de caja — `PedidoEntrega`

Vista: `/caja/entregas` (diseño-operativo §4.5). Fuente:
`pedidoRepository.listarListos` + `listarItemsDePedidos`.

| Campo | Tipo | Origen | Nuevo |
|-------|------|--------|-------|
| `id` | number | `pedido.id` | no |
| `numero` | string | `pedido.numero` | no |
| `tipo` | `anticipado`\|`mostrador` | `pedido.tipo` | no |
| `cliente_nombre` | string\|null | `pedido.cliente_nombre` | no |
| `total` | number | `pedido.total` | no |
| `creado_en` | string (fecha-hora) | `pedido.creado_en` | **sí** |
| `fecha_recoleccion` | string (fecha-hora) | `pedido.fecha_recoleccion` | no |
| `items` | `{ cantidad, nombre }[]` | `pedido_detalle` | **sí** |

## Consultas principales (extendidas)

### Pedidos para cocina (con cliente y fecha de creación)

```sql
SELECT p.id, p.numero, p.tipo, e.nombre AS estado,
       COALESCE(p.cliente_nombre, u.nombre) AS cliente_nombre,
       p.creado_en, p.fecha_recoleccion
FROM pedido p
JOIN estado_pedido e ON e.id = p.estado_id
LEFT JOIN usuario u ON u.id = p.usuario_id
WHERE e.nombre IN ('Pagado', 'En preparación', 'Listo')
ORDER BY p.creado_en ASC;
```

### Pedidos listos para entrega (con fecha de creación)

```sql
SELECT p.id, p.numero, p.tipo, p.cliente_nombre, p.total,
       p.creado_en, p.fecha_recoleccion
FROM pedido p
JOIN estado_pedido e ON e.id = p.estado_id
WHERE e.nombre = 'Listo'
ORDER BY p.fecha_recoleccion ASC, p.creado_en ASC;
```

Las partidas (`items`) se resuelven con `listarItemsDePedidos` reutilizado por
ambas vistas.

## Sin cambios

- No hay migraciones, tablas ni columnas nuevas.
- La máquina de estados y los endpoints de escritura no cambian.
- El carrito del cliente permanece en `localStorage` (sin tabla).
