# Quickstart: Sprint 5 — Seguimiento y notificaciones

**Feature**: `006-order-tracking-notifications` | **Date**: 2026-10-13

## Prerrequisitos

- Sprints 1–4 completados.
- Migración `004_notificacion_seguimiento.sql` aplicada.
- Variables de correo en `backend/.env`: `MAIL_PROVIDER=console` (o `fail` para probar
  errores), `MAIL_FROM`, `NOTIFICACION_MAX_INTENTOS=5`, `NOTIFICACION_POLL_MS=15000`
  (`0` desactiva el worker).

## Levantar

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

## Flujo manual de verificación

1. Como **cliente**, crear y pagar un pedido anticipado (Sprint 3).
2. Abrir `/mis-pedidos` y ver el estado `Pagado`.
3. Como **cocinero**, iniciar y terminar el pedido → `En preparación` → `Listo`.
4. Refrescar `/mis-pedidos` del cliente → estado `Listo` y aviso en la campana.
5. Verificar en consola/log que se generó la notificación y se intentó el correo.
6. Provocar un fallo de correo (`MAIL_PROVIDER=fail`) → `estado_envio = fallida`,
   `intentos > 0`; al restaurar el proveedor, el worker la reintenta.
7. Como **cajero**, confirmar la entrega → `Entregado` y ver el historial.
8. Intentar entregar un pedido no `Listo` → `409`.
9. Intentar ver el pedido de otro usuario → `403` (en el detalle; `pagar`/`cancelar`
   ajenos siguen devolviendo `404`).

## Verificación de base de datos

```sql
SELECT id, pedido_id, estado_envio, intentos, leida FROM notificacion ORDER BY id DESC LIMIT 10;
SELECT h.fecha, e.nombre AS estado_nuevo FROM pedido_estado_historial h
JOIN estado_pedido e ON e.id = h.estado_nuevo_id
WHERE h.pedido_id = ? ORDER BY h.fecha ASC;
```

## Pruebas

```bash
cd backend && npm test && npm run typecheck
cd frontend && npm test && npm run typecheck
```

## Criterios de aceptación del sprint

- El cliente ve el estado actualizado de su pedido.
- Todo pedido que pasa a `Listo` genera una notificación; el correo se envía o se reintenta.
- El cajero confirma la entrega → `Entregado`.
- Sin acceso a pedidos/notificaciones ajenos.
