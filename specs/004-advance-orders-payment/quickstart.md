# Quickstart: Sprint 3 — Pedido anticipado y pago

**Feature**: `004-advance-orders-payment` | **Date**: 2026-10-13

## Prerrequisitos

- Sprints 1 y 2 completados.
- Migraciones aplicadas (incluye `pedido`, `pedido_detalle`, `pago`,
  `pedido_estado_historial`).
- Variables: `PAYMENT_PROVIDER=mock`, `PAYMENT_API_KEY=` (vacío en dev), `MIN_LEAD_MINUTES=10`.

## Levantar

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

## Flujo manual de verificación

1. Iniciar sesión como cliente y abrir `/menu`.
2. Agregar platillos con cantidad y confirmar; ver total calculado.
3. Elegir hora de recogida a ≥ 10 minutos → pedido creado en `Pendiente`.
4. Repetir con hora a 5 minutos → rechazo con mensaje.
5. Pagar con el pago simulado → pedido pasa a `Pagado`.
6. Simular pago rechazado → el pedido sigue `Pendiente`.
7. Cambiar un precio del menú en admin y verificar que el pedido ya creado conserva su precio.

## Verificación de base de datos

```sql
SELECT numero, estado_id, total FROM pedido ORDER BY id DESC LIMIT 5;
SELECT pedido_id, precio_unitario, subtotal FROM pedido_detalle ORDER BY id DESC LIMIT 5;
SELECT pedido_id, monto, referencia FROM pago ORDER BY id DESC LIMIT 5;
```

## Pruebas

```bash
cd backend && npm test && npm run typecheck
cd frontend && npm test && npm run typecheck
```

## Criterios de aceptación del sprint

- Pedido anticipado creado con ≥ 10 min de anticipación.
- Pedido creado con menos anticipación → rechazado.
- Pago confirmado → pedido `Pagado`; pago fallido → sigue `Pendiente`.
- Sin datos de tarjeta almacenados.
