# Research: Sprint 3 — Pedido anticipado y pago

**Feature**: `004-advance-orders-payment` | **Date**: 2026-10-13

## Decisiones técnicas

### 1. Cálculo del total en el backend

- **Decisión**: el backend recalcula precio_unitario (desde `menu_dia`) y subtotal; el total
  enviado por el cliente se ignora.
- **Razón**: evita manipulación de precios (FR-002/FR-012) y garantiza SC-003.

### 2. Congelar precio unitario en el detalle

- **Decisión**: `pedido_detalle.precio_unitario` se copia desde `menu_dia.precio` al crear el
  pedido.
- **Razón**: conserva el precio histórico (FR-009) aunque cambie el menú.

### 3. Ventana mínima de 10 minutos

- **Decisión**: validar `fecha_recoleccion >= now + 10 min` en el servicio, en backend.
- **Razón**: FR-003; la validación del cliente es solo UX.

### 4. Transacción SQL para crear el pedido

- **Decisión**: insertar `pedido` + `pedido_detalle` + historial dentro de una transacción
  (`pool.getConnection` + `beginTransaction/commit/rollback`).
- **Razón**: atomicidad; un pedido no debe quedar a medias ni sin folio.

### 5. Abstracción del pago (`PaymentGateway`)

- **Decisión**: interfaz `PaymentGateway` con `charge()` y `refund()`; implementación
  `MockPaymentGateway` en desarrollo y `StripePaymentGateway` (o similar) en producción,
  seleccionada por `PAYMENT_PROVIDER`.
- **Razón**: FR-005/FR-006 permiten cambiar de proveedor sin tocar dominio; nunca se
  almacenan datos de tarjeta (SC-005).

### 6. Pago único por pedido

- **Decisión**: `pago.pedido_id` con `UNIQUE`; solo se paga un pedido `Pendiente`.
- **Razón**: FR-011; evita pagos duplicados por concurrencia.

### 7. Cambio de estado Pendiente → Pagado

- **Decisión**: al confirmar el pago, dentro de la misma transacción: insertar `pago`,
  actualizar `pedido.estado_id` a `Pagado` e insertar en `pedido_estado_historial`.
- **Razón**: FR-007/FR-008 y trazabilidad (FR-022).

### 8. Folio único

- **Decisión**: `pedido.numero` generado como `A-<YYYYMMDD>-<secuencia>` con `UNIQUE` y
  reintento ante colisión.
- **Razón**: FR-010; identificable por el personal y el cliente.

### 9. Frontend

- **Decisión**: `MenuPage` gana control de cantidad y botón "Agregar"; `CarritoPage`
  (resumen + hora de recogida) y `PagoPage` (resultado). Actualizar `MisPedidosHome`.
- **Razón**: completa US2 sin recargar la arquitectura.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Manipulación de precios | Total y precios se calculan en backend |
| Pedido a medias | Transacción SQL |
| Doble pago | `UNIQUE(pedido_id)` + solo pagar `Pendiente` |
| Fallo del proveedor | Pedido queda `Pendiente`; se informa y se puede reintentar |
| Carrera al tomar folio | Restricción UNIQUE + reintento |
