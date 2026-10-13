# Research: Sprint 4 — Ventanilla y cocina

**Feature**: `005-counter-kitchen` | **Date**: 2026-10-13

## Decisiones técnicas

### 1. Tipo de pedido `mostrador`

- **Decisión**: reutilizar la tabla `pedido` con `tipo = 'mostrador'`; `usuario_id` es la
  cajera que lo registra (o un cliente genérico si no hay cuenta).
- **Razón**: evita una tabla paralela; el flujo de cocina es idéntico.

### 2. Cobro en caja sin pasarela

- **Decisión**: `pedidoService.cobrarEnCaja` inserta `pago` con `metodo = efectivo|tarjeta`
  y cambia el pedido a `Pagado` en una transacción; no llama a `PaymentGateway`.
- **Razón**: el cobro es presencial, FR-002/FR-003; `PaymentGateway` queda para pagos en
  línea.

### 3. Sin ventana mínima para mostrador

- **Decisión**: la regla de 10 minutos solo se aplica a `tipo = anticipado`.
- **Razón**: FR-004; el cliente está presente.

### 4. Máquina de estados de preparación

- **Decisión**: `Pendiente → Pagado → En preparación → Listo → Entregado`; transiciones
  validadas contra un mapa en `estadoService`; `Cancelado` permitido desde `Pendiente`.
- **Razón**: FR-005/FR-006/FR-009; orden de cocina correcto.

### 5. Actualización de la lista de cocina por sondeo

- **Decisión**: `GET /api/cocina/pedidos` y refetch cada 5–10 s en el frontend (o
  `refetchInterval`).
- **Razón**: SC-002 sin introducir WebSockets todavía (llegan en Sprint 5).

### 6. Orden por hora de recolección

- **Decisión**: `ORDER BY fecha_recoleccion ASC, creado_en ASC` con índice
  `idx_pedido_recoleccion`.
- **Razón**: FR-007/SC-003.

### 7. Control de concurrencia en transiciones

- **Decisión**: `UPDATE pedido SET estado_id = ? WHERE id = ? AND estado_id = ?` y verificar
  `affectedRows = 1`.
- **Razón**: evita que dos cocineras avancen el mismo pedido (FR-009).

### 8. Frontend

- **Decisión**: `CajaPage` (listado de menú + armar pedido + cobrar) y `CocinaPage` (tablero
  de pedidos con acciones). Ambas con `ProtectedRoute` por rol.
- **Razón**: rutas `/caja` y `/cocina` definidas en `docs/reglas.md` §2.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Estado fuera de secuencia | Mapa de transiciones + `UPDATE ... AND estado_id` |
| Doble cobro | `UNIQUE(pedido_id)` + verificar estado |
| Pedidos olvidados | Orden por hora de recolección y resaltado de próximos |
| Carga de pedidos | Índices por estado y fecha_recoleccion |
